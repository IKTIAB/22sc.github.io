import { useEffect, useState } from "react";
import axios from "axios";
import { portfolioData as FALLBACK } from "./data";
import { loadAllCovers } from "./covers";
import { toast, Toaster } from "sonner";
import { UI, pickLocale } from "./i18n";
import AdminLogin from "./admin/AdminLogin";
import AdminPanel from "./admin/AdminPanel";
import MusicPlayer from "./components/MusicPlayer";
import {
  Mail, Send, Share2, Download, Copy, ArrowRight, Moon, Star,
  Trophy, Target, Wind, Clock, ChevronDown, Languages, Lock,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ---------------- Splash ----------------
function Splash({ onDone, lang }) {
  const [fade, setFade] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => { setFade(true); setTimeout(onDone, 800); }, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={`splash ${fade ? "fade" : ""}`} onClick={() => { setFade(true); setTimeout(onDone, 500); }} data-testid="splash-screen">
      <div className="absolute top-[15%] right-[10%] w-40 h-40 rounded-full"
        style={{ background: "radial-gradient(circle at 40% 40%, #fafbff, #c8ccd6 55%, #6a6e78)", boxShadow: "0 0 100px 30px rgba(200,210,230,0.3)" }} />
      <div className="text-center relative z-10">
        <div className="splash-title">MAAN</div>
        <div className="mt-4 text-xs tracking-[0.4em] text-[color:var(--ink-mute)]">SILVER NIGHT</div>
        <div className="mt-12 text-[10px] tracking-[0.3em] text-[color:var(--ink-mute)] opacity-70">{lang === "ar" ? "انقر للتخطّي" : "TAP TO SKIP"}</div>
      </div>
    </div>
  );
}

// ---------------- Guest Entry ----------------
function GuestEntry({ onEnter, lang }) {
  const t = UI[lang].guest;
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEnter = async () => {
    if (!name.trim()) { toast.error(t.errorName); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/guestbook`, { name: name.trim(), message: message.trim() });
      localStorage.setItem("maan_visitor", name.trim());
      toast.success(t.welcome(name.trim()));
      onEnter(name.trim());
    } catch {
      localStorage.setItem("maan_visitor", name.trim());
      onEnter(name.trim());
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-6" data-testid="guest-entry">
      <div className="max-w-md w-full glass p-10 relative overflow-hidden">
        <div className="text-[11px] tracking-[0.3em] text-[color:var(--ink-soft)] mb-4 flex items-center gap-2">
          <Star size={12} className="fill-current" /> {t.label}
        </div>
        <h2 className="serif-display text-4xl mb-3" style={{ fontWeight: 300 }}>{t.title}</h2>
        <p className="text-sm text-[color:var(--ink-soft)] mb-8 leading-relaxed">{t.subtitle}</p>

        <label className="text-[10px] tracking-[0.25em] text-[color:var(--ink-mute)] block mb-2">{t.nameLabel}</label>
        <input data-testid="guest-name-input" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.namePh}
          className="w-full mb-5 bg-transparent border border-[color:var(--border)] rounded-lg px-4 py-3 text-[color:var(--ink)] focus:outline-none focus:border-white/30 transition" />

        <label className="text-[10px] tracking-[0.25em] text-[color:var(--ink-mute)] block mb-2">{t.noteLabel}</label>
        <textarea data-testid="guest-message-input" value={message} onChange={(e) => setMessage(e.target.value.slice(0, 140))} placeholder={t.notePh} rows={3}
          className="w-full bg-transparent border border-[color:var(--border)] rounded-lg px-4 py-3 text-[color:var(--ink)] focus:outline-none focus:border-white/30 resize-none transition" />
        <div className="text-right text-[10px] text-[color:var(--ink-mute)] mt-1">{message.length}/140</div>

        <button data-testid="guest-enter-btn" onClick={handleEnter} disabled={loading} className="btn btn-primary w-full mt-6 justify-center">
          {loading ? t.entering : t.enter} <ArrowRight size={16} />
        </button>

        <div className="mt-7 pt-5 border-t border-[color:var(--border-soft)] text-center text-xs text-[color:var(--ink-mute)]">
          <span className="tracking-[0.2em]">m a a n</span> · <span className="arabic">معن</span>
        </div>
      </div>
    </div>
  );
}

// ---------------- Nav ----------------
function Nav({ visitor, lang, setLang, onOpenAdmin }) {
  const tn = UI[lang].nav;
  const [time, setTime] = useState(new Date());
  const sections = ["home", "about", "hobbies", "journey", "books", "anime", "movies", "guestbook", "contact"];
  const [active, setActive] = useState("home");

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      for (const s of sections) {
        const el = document.getElementById(s);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) { setActive(s); break; }
        }
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); };

  return (
    <nav className="top-nav" data-testid="top-nav">
      <div className="flex items-center gap-2 text-sm">
        <span className="w-2 h-2 rounded-full bg-[color:var(--green)] animate-pulse" />
        <span className="serif" style={{ fontSize: "18px" }}>Maan</span>
        <span className="text-[color:var(--ink-mute)]">/</span>
        <span className="arabic" style={{ fontSize: "16px" }}>معن</span>
      </div>
      <div className="nav-links flex items-center">
        {sections.map((s) => (
          <a key={s} className={active === s ? "active" : ""} onClick={() => scrollTo(s)} data-testid={`nav-${s}`}>
            {tn[s]}
          </a>
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs text-[color:var(--ink-soft)]">
        <button
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[color:var(--border)] hover:border-white/30 transition text-[10px] tracking-[0.2em]"
          data-testid="lang-toggle"
          title={lang === "en" ? "عربي" : "English"}
        >
          <Languages size={12} /> {lang === "en" ? "عربي" : "EN"}
        </button>
        <button
          onClick={onOpenAdmin}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[color:var(--border)] hover:border-white/30 transition text-[10px] tracking-[0.2em]"
          data-testid="admin-tool-btn"
        >
          <Lock size={11} /> {tn.adminTool}
        </button>
        <Moon size={14} />
        <span className="flex items-center gap-1"><Clock size={12} /> {time.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
        <span className="flex items-center gap-2 pl-3 border-l border-[color:var(--border)]">
          <span className="w-2 h-2 rounded-full bg-[color:var(--green)]" />
          {tn.hi(visitor)}
        </span>
      </div>
    </nav>
  );
}

// ---------------- Hero ----------------
function Hero({ visitor, content, lang }) {
  const t = UI[lang];
  const identity = content.identity || {};
  const desc = pickLocale(identity, "description", lang);

  return (
    <section id="home" className="min-h-screen flex flex-col justify-center" data-testid="hero-section">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="section-label">
            {t.hero.welcome}, {(visitor || "visitor").toUpperCase()}
            <span className={`${lang === "ar" ? "mr-2" : "ml-2"} px-3 py-1 text-[10px] rounded-full border border-[color:var(--border)] bg-black/30 tracking-[0.2em]`}>
              {t.hero.visitorBadge}
            </span>
          </div>
          <h1 className="heading-hero">{identity.name || "MAAN"}</h1>
          <div className="arabic mt-6 text-6xl serif" style={{ color: "#d4d7de" }}>{identity.arabic || "معن"}</div>

          <div className="mt-8 flex items-center gap-3 text-[10px] tracking-[0.3em] text-[color:var(--ink-mute)]">
            {t.hero.realName} <span className="w-10 h-px bg-[color:var(--ink-mute)]" />
            <span className="text-[color:var(--ink)]">{identity.name} · <span className="arabic">{identity.arabic}</span></span>
          </div>

          <p className="mt-8 text-[color:var(--ink-soft)] max-w-lg leading-relaxed">{desc}</p>

          <div className="mt-10 flex gap-3 flex-wrap">
            <button className="btn btn-primary" data-testid="get-in-touch-btn" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>
              <Send size={14} /> {t.hero.getInTouch}
            </button>
            <button className="btn btn-ghost" data-testid="vcard-btn" onClick={() => toast(t.hero.vcardSoon)}>
              <Download size={14} /> {t.hero.vcard}
            </button>
            <button className="btn btn-ghost" data-testid="share-btn" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success(t.hero.linkCopied); }}>
              <Share2 size={14} /> {t.hero.share}
            </button>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 max-w-md">
            {(identity.stats || []).map((s, i) => (
              <div key={i} data-testid={`stat-${i}`}>
                <div className="serif text-3xl" style={{ fontWeight: 300 }}>{s.value}</div>
                <div className="mt-2 text-[10px] tracking-[0.25em] text-[color:var(--ink-mute)]">{(lang === "ar" ? (s.label_ar || s.label) : s.label || "").toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:flex justify-center relative">
          <div className="avatar-stack">
            <div className="relative w-[420px] h-[420px] rounded-full overflow-hidden"
              style={{ boxShadow: "0 0 80px 10px rgba(150,160,180,0.2), inset 0 0 60px rgba(0,0,0,0.5)" }}>
              <img src={identity.avatar || "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=900&q=80"} alt="avatar" className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] text-[color:var(--ink-mute)]">
                {identity.name} · <span className="arabic">{identity.arabic}</span>
              </div>
            </div>

            {content?.poem && (
              <div className="poem-card" data-testid="poem-card">
                <div className="poem-label">
                  <span>{lang === "ar" ? "بيت من الشعر" : "A VERSE"}</span>
                </div>
                {content.poem.lines?.map((line, i) => (
                  <div key={i}>
                    <div className={`poem-line ${i % 2 === 1 ? "alt" : ""}`}>{line}</div>
                    {i < content.poem.lines.length - 1 && i % 2 === 1 && <div className="poem-sep" />}
                  </div>
                ))}
                <div className="poem-author">— {content.poem.author}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-20 text-center text-[color:var(--ink-mute)] animate-bounce"><ChevronDown size={20} /></div>
    </section>
  );
}

// ---------------- Verse ----------------
function Verse({ content, lang }) {
  const t = UI[lang].sections;
  const v = content.verse || {};
  return (
    <section className="text-center py-24" data-testid="verse-section">
      <div className="flex items-center justify-center gap-4 mb-6 text-[10px] tracking-[0.3em] text-[color:var(--ink-mute)]">
        <span className="w-16 h-px bg-[color:var(--ink-mute)]" />{t.verse}<span className="w-16 h-px bg-[color:var(--ink-mute)]" />
      </div>
      <p className="arabic serif text-3xl md:text-4xl max-w-3xl mx-auto leading-relaxed" style={{ color: "#d4d7de" }}>{v.ar}</p>
      <p className="mt-6 serif italic text-lg text-[color:var(--ink-soft)]">{v.en}</p>
      <p className="mt-4 arabic text-sm text-[color:var(--ink-mute)]">— {v.author}</p>
    </section>
  );
}

// ---------------- About ----------------
function About({ content, lang }) {
  const t = UI[lang].sections;
  const a = content.about || {};
  return (
    <section id="about" data-testid="about-section">
      <div className="section-label">{t.about}</div>
      <div className="grid md:grid-cols-2 gap-16">
        <div><h2 className="heading-xl">{pickLocale(a, "title", lang)}</h2></div>
        <div className="flex flex-col justify-center gap-8">
          <p className="text-[color:var(--ink-soft)] leading-relaxed">{pickLocale(a, "body", lang)}</p>
          <div className="grid grid-cols-2 gap-4">
            {(a.cards || []).map((c, i) => (
              <div key={i} className="glass p-6" data-testid={`about-card-${i}`}>
                <div className="text-[10px] tracking-[0.3em] text-[color:var(--ink-mute)] mb-3">{(pickLocale(c, "label", lang) || "").toUpperCase()}</div>
                <div className="serif text-xl">{pickLocale(c, "value", lang)}</div>
                {(pickLocale(c, "sub", lang)) && <div className="mt-2 text-xs text-[color:var(--ink-soft)]">{pickLocale(c, "sub", lang)}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------- Hobbies ----------------
function Hobbies({ content, lang }) {
  const t = UI[lang].sections;
  const icons = [Trophy, Target, Wind];
  return (
    <section id="hobbies" data-testid="hobbies-section">
      <div className="section-label">{t.hobbies}</div>
      <h2 className="heading-xl mb-4">{t.hobbiesH}</h2>
      <p className="text-[color:var(--ink-soft)] max-w-xl mb-16">{t.hobbiesP}</p>

      <div className="grid md:grid-cols-3 gap-6">
        {(content.hobbies || []).map((h, i) => {
          const Icon = icons[i % icons.length];
          return (
            <div key={i} className="glass p-8" data-testid={`hobby-${i}`}>
              <div className="flex items-start justify-between mb-10">
                <div className="w-10 h-10 rounded-full flex items-center justify-center border border-[color:var(--border)]"><Icon size={16} /></div>
                <div className="serif text-3xl text-[color:var(--ink-mute)]">{h.n}</div>
              </div>
              <h3 className="serif text-3xl mb-1">{pickLocale(h, "title", lang)}</h3>
              <div className="text-[10px] tracking-[0.3em] text-[color:var(--ink-mute)] mb-6">{pickLocale(h, "subtitle", lang)}</div>
              <p className="text-sm text-[color:var(--ink-soft)] mb-8 leading-relaxed">{pickLocale(h, "desc", lang)}</p>
              <div className="flex items-center justify-between text-[10px] tracking-[0.3em] text-[color:var(--ink-mute)] mb-3">
                <span>{t.passion}</span><span>{h.years}</span>
              </div>
              <div className="progress-bar" style={{ "--w": `${h.percent}%` }} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------------- Journey ----------------
function Journey({ content, lang }) {
  const t = UI[lang].sections;
  return (
    <section id="journey" data-testid="journey-section">
      <div className="section-label">{t.journey}</div>
      <h2 className="heading-xl text-center mb-24">{t.journeyH}</h2>

      <div className="relative max-w-4xl mx-auto">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[color:var(--border)] to-transparent" />
        {(content.journey || []).map((j, i) => (
          <div key={i} className={`relative grid md:grid-cols-2 gap-8 mb-16 ${i % 2 === 0 ? "" : "md:[&>*:first-child]:order-2"}`}>
            <div className={i % 2 === 0 ? "md:text-right md:pr-12" : "md:pl-12"}>
              <div className="glass p-6 inline-block max-w-sm text-left" data-testid={`journey-${i}`}>
                <div className="serif text-4xl" style={{ fontWeight: 300 }}>{j.year}</div>
                <div className="text-[10px] tracking-[0.3em] text-[color:var(--ink-mute)] mt-2 mb-3">{pickLocale(j, "title", lang)}</div>
                <p className="text-sm text-[color:var(--ink-soft)]">{pickLocale(j, "desc", lang)}</p>
              </div>
            </div>
            <div className="hidden md:flex justify-center items-center"><div className="timeline-node" /></div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------- Books ----------------
function Books({ content, coversMap, lang }) {
  const t = UI[lang].sections;
  return (
    <section id="books" data-testid="books-section">
      <div className="section-label">{t.books}</div>
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <h2 className="heading-xl">{t.booksH}</h2>
        <p className="text-[color:var(--ink-soft)] leading-relaxed self-end">{t.booksP}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
        {(content.books || []).map((b) => {
          const cover = b.cover || coversMap?.[b.id];
          return (
            <div key={b.id} data-testid={`book-${b.id}`}>
              <div className="book-card">
                <span className="tag">{pickLocale(b, "tag", lang)}</span>
                {cover ? (
                  <img src={cover} alt={b.english} loading="lazy" onError={(e) => { e.target.style.display = "none"; }} />
                ) : (
                  <div className="ar-fallback" style={{ "--grad-a": b.gradA, "--grad-b": b.gradB }}>{b.letter}</div>
                )}
                <div className="overlay">
                  <div className="arabic text-xl mb-1" style={{ color: "#fff" }}>{b.title}</div>
                  <div className="text-[10px] tracking-[0.2em] text-[color:var(--ink-soft)] uppercase">{b.english}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-[10px] tracking-[0.2em] text-[color:var(--ink-mute)]">
                <span>✦</span> {(pickLocale(b, "author", lang) || "").toUpperCase()}
              </div>
              <p className="mt-2 text-sm italic text-[color:var(--ink-soft)]">"{pickLocale(b, "quote", lang)}"</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------------- Anime ----------------
function Anime({ content, coversMap, lang }) {
  const t = UI[lang].sections;
  const animeList = content.anime || [];
  const featured = animeList.find((a) => a.featured) || animeList[0];
  const rest = animeList.filter((a) => a !== featured);
  if (!featured) return null;
  const featuredCover = featured.cover || coversMap?.[featured.id];

  return (
    <section id="anime" data-testid="anime-section">
      <div className="section-label">{t.anime}</div>
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <h2 className="heading-xl">{t.animeH}</h2>
        <p className="text-[color:var(--ink-soft)] leading-relaxed self-end">{t.animeP}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-1 glass p-6 flex flex-col" data-testid="anime-featured">
          <div className="text-[10px] tracking-[0.3em] text-[color:var(--green)] mb-4">{t.favorite}</div>
          <div className="aspect-[3/4] rounded-lg overflow-hidden mb-5 bg-black/40">
            {featuredCover ? <img src={featuredCover} alt={featured.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-red-900 to-black">✦</div>}
          </div>
          <h3 className="serif text-2xl">{pickLocale(featured, "title", lang)}</h3>
          <div className="arabic text-lg mt-1 text-[color:var(--ink-soft)]">{featured.arabic || featured.title_ar}</div>
          <div className="mt-3 text-[10px] tracking-[0.3em] text-[color:var(--ink-mute)]">{pickLocale(featured, "meta", lang)}</div>
          <p className="mt-4 text-sm italic text-[color:var(--ink-soft)]">"{pickLocale(featured, "quote", lang)}"</p>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
          {rest.map((a) => {
            const cover = a.cover || coversMap?.[a.id];
            return (
              <div key={a.id} className="glass overflow-hidden" data-testid={`anime-${a.id}`}>
                <div className="aspect-[3/4] bg-black/40 overflow-hidden">
                  {cover ? <img src={cover} alt={a.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                    : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900 to-black text-4xl">✦</div>}
                </div>
                <div className="p-4">
                  <div className="serif text-base truncate">{pickLocale(a, "title", lang)}</div>
                  <div className="mt-1 text-[9px] tracking-[0.25em] text-[color:var(--ink-mute)]">{pickLocale(a, "meta", lang)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------------- Movies ----------------
function Movies({ content, coversMap, lang }) {
  const t = UI[lang].sections;
  return (
    <section id="movies" data-testid="movies-section">
      <div className="section-label">{t.movies}</div>
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <h2 className="heading-xl">{t.moviesH}</h2>
        <p className="text-[color:var(--ink-soft)] leading-relaxed self-end">{t.moviesP}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {(content.movies || []).map((m) => {
          const cover = m.cover || coversMap?.[m.id];
          return (
            <div key={m.id} className="glass overflow-hidden" data-testid={`movie-${m.id}`}>
              <div className="relative aspect-[3/4] bg-black/40 overflow-hidden">
                {cover ? <img src={cover} alt={m.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-amber-900 to-black">✦</div>}
                {m.extra && <span className="absolute top-3 right-3 px-2 py-1 rounded text-[10px] bg-black/70 border border-[color:var(--border)]">{m.extra}</span>}
                <span className="absolute top-3 left-3 text-[9px] tracking-[0.25em] bg-black/70 px-2 py-1 rounded border border-[color:var(--border)]">{pickLocale(m, "tag", lang)}</span>
              </div>
              <div className="p-6">
                <h3 className="serif text-2xl">{m.title}</h3>
                <div className="arabic text-lg mt-1 text-[color:var(--ink-soft)]">{m.arabic}</div>
                <p className="mt-4 text-sm italic text-[color:var(--ink-soft)]">"{pickLocale(m, "quote", lang)}"</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------------- Guestbook ----------------
function Guestbook({ lang }) {
  const t = UI[lang].sections;
  const [entries, setEntries] = useState([]);
  useEffect(() => { axios.get(`${API}/guestbook`).then((r) => setEntries(r.data || [])).catch(() => {}); }, []);
  const starPositions = entries.slice(0, 20).map((_, i) => ({ left: `${10 + ((i * 37) % 80)}%`, top: `${15 + ((i * 53) % 70)}%`, delay: `${(i * 0.3) % 3}s` }));

  return (
    <section id="guestbook" data-testid="guestbook-section">
      <div className="section-label">{t.guestbook}</div>
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <h2 className="heading-xl">{t.guestbookH}</h2>
        <div className="self-end">
          <p className="text-[color:var(--ink-soft)] leading-relaxed">{t.guestbookP}</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[color:var(--border)] text-xs">
            <Star size={12} className="fill-current" /> {entries.length} {t.visitors}
          </div>
        </div>
      </div>

      <div className="constellation">
        {starPositions.map((p, i) => (
          <div key={i} className="star-dot" style={{ left: p.left, top: p.top, animationDelay: p.delay }} title={entries[i]?.name} data-testid={`star-${i}`} />
        ))}
      </div>

      <div className="mt-12">
        <div className="text-[10px] tracking-[0.3em] text-[color:var(--ink-mute)] mb-6">{t.whispers}</div>
        <div className="grid md:grid-cols-3 gap-4">
          {entries.slice(0, 6).map((e) => (
            <div key={e.id} className="glass p-5 flex items-start gap-4" data-testid={`entry-${e.id}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-sm serif">{e.name[0]?.toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between"><div className="text-sm">{e.name}</div><div className="text-[10px] text-[color:var(--ink-mute)]">{(e.created_at ? (e.created_at ? new Date(e.created_at).toLocaleDateString() : "") : "")}</div></div>
                {e.message && <p className="mt-1 text-xs italic text-[color:var(--ink-soft)] truncate">"{e.message}"</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------- Contact ----------------
function Contact({ content, lang }) {
  const t = UI[lang].sections;
  const copy = (v) => { navigator.clipboard.writeText(v); toast.success(t.copied); };
  return (
    <section id="contact" data-testid="contact-section">
      <div className="section-label">{t.contact}</div>
      <h2 className="heading-xl mb-6">{t.contactH}</h2>
      <p className="text-[color:var(--ink-soft)] max-w-xl mb-16">{t.contactP}</p>

      <div className="grid md:grid-cols-3 gap-5">
        {(content.contacts || []).map((c, i) => (
          <div key={i} className="glass p-6 cursor-pointer" onClick={() => copy(c.value)} data-testid={`contact-${(c.label || "").toLowerCase()}`}>
            <div className="text-[10px] tracking-[0.3em] text-[color:var(--ink-mute)] mb-3 flex items-center gap-2">
              {c.label === "EMAIL" && <Mail size={12} />} {c.label}
            </div>
            <div className="serif text-lg break-all">{c.value}</div>
            {c.copy && <div className="mt-3 text-[10px] text-[color:var(--ink-mute)] flex items-center gap-1"><Copy size={10} /> {t.clickToCopy}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------- Footer ----------------
function Footer({ lang }) {
  const t = UI[lang].sections;
  return (
    <footer className="relative z-10 py-16 border-t border-[color:var(--border-soft)] text-center" data-testid="footer">
      <div className="serif text-3xl mb-2">Maan <span className="text-[color:var(--ink-mute)] mx-2">/</span> <span className="arabic">معن</span></div>
      <p className="text-sm text-[color:var(--ink-soft)]">{t.footerTagline}</p>
      <div className="mt-8 text-[10px] tracking-[0.3em] text-[color:var(--ink-mute)]">MAAN · <span className="arabic">معن</span> · {t.footerMeta}</div>
    </footer>
  );
}

// ---------------- App ----------------
function App() {
  const [splash, setSplash] = useState(true);
  const [visitor, setVisitor] = useState(localStorage.getItem("maan_visitor") || "");
  const [lang, setLang] = useState(localStorage.getItem("maan_lang") || "en");
  const [content, setContent] = useState(null);
  const [coversMap, setCoversMap] = useState({}); // id -> url (auto-fetched fallbacks)

  // Admin state
  const [showLogin, setShowLogin] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [adminToken, setAdminToken] = useState(localStorage.getItem("maan_admin_token") || "");

  // Apply lang to html + persist
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("maan_lang", lang);
  }, [lang]);

  // Load content (merged with FALLBACK so new fields like `poem` and new books always show).
  // Media lists (books/anime/movies) always come from FALLBACK because they carry local covers.
  useEffect(() => {
    const merge = (data) => {
      const d = data && Object.keys(data).length ? data : {};
      return {
        ...FALLBACK,
        ...d,
        identity: { ...FALLBACK.identity, ...(d.identity || {}), avatar: FALLBACK.identity.avatar },
        poem: d.poem || FALLBACK.poem,
        books: FALLBACK.books,
        anime: FALLBACK.anime,
        movies: FALLBACK.movies,
      };
    };
    axios.get(`${API}/content`)
      .then((r) => setContent(merge(r.data)))
      .catch(() => setContent(FALLBACK));
  }, []);

  // Online cover fallback — only fetch if any item is missing a local cover
  useEffect(() => {
    if (!content) return;
    const needs = (arr) => (arr || []).some((x) => !x.cover);
    if (!needs(content.books) && !needs(content.anime) && !needs(content.movies)) return;
    loadAllCovers({ books: content.books || [], anime: content.anime || [], movies: content.movies || [] }).then((c) => {
      const map = {};
      [...c.books, ...c.anime, ...c.movies].forEach((x) => { if (x.cover) map[x.id] = x.cover; });
      setCoversMap(map);
    }).catch(() => {});
  }, [content]);

  // Verify stored admin token on load
  useEffect(() => {
    if (!adminToken) return;
    axios.post(`${API}/admin/verify`, {}, { headers: { Authorization: `Bearer ${adminToken}` } })
      .catch(() => { setAdminToken(""); localStorage.removeItem("maan_admin_token"); });
  }, []); // eslint-disable-line

  // Fade-in observer
  useEffect(() => {
    if (!content || splash || !visitor) return;
    const obs = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")), { threshold: 0.15 });
    document.querySelectorAll("section").forEach((s) => { s.classList.add("fade-in"); obs.observe(s); });
    return () => obs.disconnect();
  }, [splash, visitor, content]);

  const openAdmin = () => {
    if (adminToken) setShowPanel(true);
    else setShowLogin(true);
  };

  const onLoginSuccess = (token) => {
    setAdminToken(token);
    setShowLogin(false);
    setShowPanel(true);
  };

  const logout = () => {
    if (adminToken) {
      axios.post(`${API}/admin/logout`, {}, { headers: { Authorization: `Bearer ${adminToken}` } }).catch(() => {});
    }
    localStorage.removeItem("maan_admin_token");
    setAdminToken("");
    setShowPanel(false);
    toast("Logged out");
  };

  return (
    <div className="relative">
      <Toaster theme="dark" position="top-center" />

      <div className="stars-bg">
        <div className="stars-layer" />
        <div className="stars-layer layer2" />
        <div className="shooting-star" style={{ top: "20%", left: "10%" }} />
        <div className="shooting-star" style={{ top: "60%", left: "30%", animationDelay: "3s" }} />
        <div className="shooting-star" style={{ top: "40%", left: "50%", animationDelay: "5s" }} />
      </div>
      <div className="moon" />

      {splash && <Splash onDone={() => setSplash(false)} lang={lang} />}
      {!splash && !visitor && <GuestEntry onEnter={setVisitor} lang={lang} />}

      {!splash && visitor && content && (
        <>
          <Nav visitor={visitor} lang={lang} setLang={setLang} onOpenAdmin={openAdmin} />
          <Hero visitor={visitor} content={content} lang={lang} />
          <Verse content={content} lang={lang} />
          <About content={content} lang={lang} />
          <Hobbies content={content} lang={lang} />
          <Journey content={content} lang={lang} />
          <Books content={content} coversMap={coversMap} lang={lang} />
          <Anime content={content} coversMap={coversMap} lang={lang} />
          <Movies content={content} coversMap={coversMap} lang={lang} />
          <Guestbook lang={lang} />
          <Contact content={content} lang={lang} />
          <Footer lang={lang} />
          <MusicPlayer lang={lang} />
        </>
      )}

      {showLogin && <AdminLogin lang={lang} onSuccess={onLoginSuccess} onClose={() => setShowLogin(false)} />}
      {showPanel && content && (
        <AdminPanel
          lang={lang}
          token={adminToken}
          content={content}
          onSaved={(c) => setContent(c)}
          onClose={() => setShowPanel(false)}
          onLogout={logout}
        />
      )}
    </div>
  );
}

export default App;


