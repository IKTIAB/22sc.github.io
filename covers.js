// Client-side cover fetching — runs from user's browser, so no server-side rate limits.
// Uses free no-key APIs: Google Books, OpenLibrary, Jikan (MyAnimeList), iTunes.

const cache = {};

async function tryFetch(url, timeout = 6000) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeout);
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

// ------- Books -------
export async function fetchBookCover(title, author = "") {
  const key = `book:${title}:${author}`;
  if (cache[key] !== undefined) return cache[key];

  // 1) Google Books
  const q = encodeURIComponent(`${title} ${author}`.trim());
  const gb = await tryFetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=5`);
  if (gb?.items) {
    for (const item of gb.items) {
      const links = item.volumeInfo?.imageLinks;
      if (links) {
        const cover =
          links.extraLarge || links.large || links.medium || links.thumbnail;
        if (cover) {
          const url = cover
            .replace("http://", "https://")
            .replace("&edge=curl", "")
            .replace("zoom=1", "zoom=3");
          cache[key] = url;
          return url;
        }
      }
    }
  }

  // 2) OpenLibrary fallback
  const ol = await tryFetch(
    `https://openlibrary.org/search.json?q=${q}&limit=3`
  );
  if (ol?.docs) {
    for (const doc of ol.docs) {
      if (doc.cover_i) {
        const url = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
        cache[key] = url;
        return url;
      }
    }
  }

  cache[key] = null;
  return null;
}

// ------- Anime / Manga / Manhwa -------
export async function fetchAnimeCover(query, kind = "anime") {
  const key = `${kind}:${query}`;
  if (cache[key] !== undefined) return cache[key];

  const endpoint = ["manhwa", "manhua", "manga"].includes(kind)
    ? "manga"
    : "anime";
  const data = await tryFetch(
    `https://api.jikan.moe/v4/${endpoint}?q=${encodeURIComponent(query)}&limit=5`
  );
  if (data?.data) {
    for (const item of data.data) {
      const imgs = item.images?.jpg || item.images?.webp;
      const cover =
        imgs?.large_image_url || imgs?.image_url;
      if (cover) {
        cache[key] = cover;
        return cover;
      }
    }
  }
  cache[key] = null;
  return null;
}

// ------- Movies -------
export async function fetchMovieCover(query) {
  const key = `movie:${query}`;
  if (cache[key] !== undefined) return cache[key];

  // iTunes Search API
  const it = await tryFetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(
      query
    )}&media=movie&limit=5`
  );
  if (it?.results) {
    for (const r of it.results) {
      if (r.artworkUrl100) {
        const url = r.artworkUrl100.replace("100x100bb", "600x600bb");
        cache[key] = url;
        return url;
      }
    }
  }

  // OMDb-free alternative: Open Movie Database via OpenLibrary isn't ideal,
  // try Wikipedia thumbnail via REST API
  const wiki = await tryFetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      query.replace(/:/g, "").replace(/\s+/g, "_")
    )}`
  );
  if (wiki?.thumbnail?.source) {
    cache[key] = wiki.thumbnail.source;
    return cache[key];
  }
  if (wiki?.originalimage?.source) {
    cache[key] = wiki.originalimage.source;
    return cache[key];
  }

  cache[key] = null;
  return null;
}

// ------- Batch loader -------
export async function loadAllCovers(data) {
  const [books, anime, movies] = await Promise.all([
    Promise.all(
      data.books.map(async (b) => ({
        ...b,
        cover:
          (await fetchBookCover(b.english, b.author)) ||
          (await fetchBookCover(b.title, b.author)),
      }))
    ),
    Promise.all(
      data.anime.map(async (a) => ({
        ...a,
        cover: await fetchAnimeCover(
          a.id === "demon-emperor" ? "Return of the Mount Hua Sect" : a.title,
          a.meta?.toLowerCase().includes("manhua") ||
            a.meta?.toLowerCase().includes("manhwa")
            ? "manhua"
            : "anime"
        ),
      }))
    ),
    Promise.all(
      data.movies.map(async (m) => ({
        ...m,
        cover: await fetchMovieCover(
          m.id === "hp"
            ? "Harry Potter Sorcerer's Stone"
            : m.id === "mi"
            ? "Mission Impossible Fallout"
            : m.id === "bb"
            ? "Bad Boys for Life"
            : m.title
        ),
      }))
    ),
  ]);
  return { books, anime, movies };
}
