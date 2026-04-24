// Static portfolio data matching the original Maan site
// Covers are served locally from /covers/*

const C = (name) => `${process.env.PUBLIC_URL || ""}/covers/${name}`;

export const portfolioData = {
  identity: {
    name: "MAAN",
    arabic: "معن",
    tagline: "Silver Night",
    avatar: C("avatar.gif"),
    description:
      "Living between the stadium, the court and the open desert. A quiet portfolio — a silver-night pocket of the web, home to memories, hobbies, books, anime, movies and a small guestbook of visitors.",
    stats: [
      { value: "10+", label: "Years Playing" },
      { value: "3 AM", label: "Favorite Hour" },
      { value: "Midnight", label: "Mood" },
    ],
  },

  verse: {
    ar: "وأنا أمشي إلى نفسي وحيداً، لا أضلُّ الدربَ نحوي",
    en: '"I walk to myself alone — I never lose the path to me."',
    author: "محمود درويش",
  },

  // Poem displayed near the avatar (Al-Mutanabbi)
  poem: {
    author: "المتنبي",
    lines: [
      "سيعلمُ الجمعُ ممن ضمّ مجلسَنا",
      "بأنّني خيرُ من تسعى به قدمُ",
      "أنا الذي نظرَ الأعمى إلى أدبي",
      "وأسمعتْ كلماتي من به صممُ",
      "الخيلُ والليلُ والبيداءُ تعرفني",
      "والسيفُ والرمحُ والقرطاسُ والقلمُ",
    ],
  },

  about: {
    title: "A night owl with a daylight heart.",
    body:
      "My name is Maan (معن). I find beauty in motion — the roar of a crowd, the squeak of sneakers on hardwood, the thunder of hooves against open ground. Quiet by nature, loud in passion, at home somewhere between midnight and the first whistle.",
    cards: [
      { label: "Identity", value: "Maan · معن" },
      { label: "Mood", value: "Midnight Silver", sub: "Calm, focused, a little mysterious." },
    ],
  },

  hobbies: [
    { n: "01", title: "Football", subtitle: "THE BEAUTIFUL GAME",
      desc: "Ninety minutes where the world stops existing. The grass, the lights, the ball — nothing else matters.",
      years: "10Y", percent: 95 },
    { n: "02", title: "Basketball", subtitle: "ABOVE THE RIM",
      desc: "Rhythm, rebound, rise. Basketball is jazz played with a ball — improvised and electric.",
      years: "6Y", percent: 70 },
    { n: "03", title: "Horse Riding", subtitle: "BOND WITH THE WIND",
      desc: "Silence that only exists between a rider and their horse. No engines, no noise — just trust and gallop.",
      years: "8Y", percent: 80 },
  ],

  journey: [
    { year: "2016", title: "FIRST SADDLE", desc: "First gallop on open desert ground." },
    { year: "2019", title: "COURT REGULAR", desc: "Weekly basketball runs with the crew." },
    { year: "2021", title: "NIGHT MATCHES", desc: "Started the late-night football ritual under stadium lights." },
    { year: "2024", title: "THIS SPACE", desc: "Launched this portfolio — a quiet corner of the internet." },
  ],

  books: [
    {
      id: "call", tag: "THE CALL SERIES", title: "النداء", english: "The Call",
      author: "Osama Al-Muslim",
      quote: "Hauntingly beautiful. Pulled me in from page one.",
      letter: "ن", gradA: "#3b1f5e", gradB: "#6b2d4a",
      cover: C("call.jpg"),
    },
    {
      id: "khawf", tag: "KHAWF SERIES", title: "خوف", english: "Khawf (Fear)",
      author: "Osama Al-Muslim",
      quote: "The series that redefined Arabic horror.",
      letter: "خ", gradA: "#4a1520", gradB: "#2a0a15",
      cover: C("khawf.jpg"),
    },
    {
      id: "spiderweb", tag: "THE SPIDERWEB SERIES", title: "شبكة العنكبوت", english: "The Spiderweb",
      author: "Osama Al-Muslim",
      quote: "Tangled plots, sharp pages — impossible to put down.",
      letter: "ش", gradA: "#1f3a5e", gradB: "#3a2a4a",
      cover: C("spiderweb.jpg"),
    },
    {
      id: "inferno", tag: "NOVEL", title: "جحيم العابرين", english: "Travelers' Inferno",
      author: "Osama Al-Muslim",
      quote: "Dark, vivid, unforgettable.",
      letter: "ج", gradA: "#5e1a1a", gradB: "#2e0a0a",
      cover: C("inferno.jpg"),
    },
    {
      id: "happened-me", tag: "TRUE STORIES", title: "هذا ما حدث معي", english: "This Is What Happened To Me",
      author: "Mohammed Al-Salem",
      quote: "Real stories that feel scarier than fiction.",
      letter: "هـ", gradA: "#1a2e5e", gradB: "#0a1a3a",
      cover: C("happened-me.webp"),
    },
    {
      id: "happened-her", tag: "TRUE STORIES", title: "هذا ما حدث معها", english: "This Is What Happened To Her",
      author: "Mohammed Al-Salem",
      quote: "A companion to the first — same chill, new voice.",
      letter: "هـ", gradA: "#2e1a5e", gradB: "#0a0a3a",
      cover: C("happened-her.jpg"),
    },
    {
      id: "bustan", tag: "NOVEL", title: "بساتين عربستان", english: "Gardens of Arabistan",
      author: "Osama Al-Muslim",
      quote: "An Arabian garden that keeps blooming past the last page.",
      letter: "ب", gradA: "#1a3a2e", gradB: "#0a2a1a",
      cover: C("bustan.jpg"),
    },
    {
      id: "zikola", tag: "NOVEL", title: "أرض زيكولا", english: "Land of Zikola",
      author: "Amr Abdulhamid",
      quote: "A world where money is everything — and so is nothing.",
      letter: "أ", gradA: "#3a1f2e", gradB: "#0a0a1a",
      cover: C("zikola.jpg"),
    },
  ],

  anime: [
    {
      id: "demon-emperor",
      title: "Demon Emperor",
      arabic: "الإمبراطور الشيطان",
      meta: "MANHUA · ONGOING",
      quote: "The one I rank above all. Pure ambition turned into ink.",
      featured: true,
      cover: C("demon-emperor.jpg"),
    },
    { id: "vinland", title: "Vinland Saga", meta: "ANIME · 2019 — ONGOING", cover: C("vinland.jpg") },
    { id: "deathnote", title: "Death Note", meta: "ANIME · 2006", cover: C("deathnote.jpg") },
    { id: "naruto", title: "Naruto", meta: "ANIME · 2002", cover: C("naruto.jpg") },
    { id: "moriarty", title: "Moriarty the Patriot", meta: "ANIME · 2020", cover: C("moriarty.jpg") },
    { id: "blackclover", title: "Black Clover", meta: "ANIME · 2017", cover: C("blackclover.jpg") },
  ],

  movies: [
    {
      id: "hp", tag: "THE WIZARDING SAGA", title: "Harry Potter", arabic: "هاري بوتر",
      extra: "+4", quote: "The whole series, cover to cover. A childhood constant.",
      cover: C("hp.jpg"),
    },
    {
      id: "mi", tag: "WITH TOM CRUISE", title: "Mission: Impossible", arabic: "المهمة المستحيلة",
      extra: "+3", quote: "Adrenaline at 30,000 feet. Cruise never breaks.",
      cover: C("mi.jpg"),
    },
    {
      id: "bb", tag: "WITH WILL SMITH", title: "Bad Boys", arabic: "الأولاد الأشقياء",
      quote: "Buddy cops, wild chases, and Miami nights.",
      cover: C("bb.jpg"),
    },
  ],

  contacts: [
    { label: "EMAIL", value: "f702222@outlook.com", copy: true },
    { label: "SNAPCHAT", value: "mald265724" },
    { label: "YOUTUBE", value: "@o2.f7" },
    { label: "DISCORD", value: "561344344699830272" },
    { label: "INSTAGRAM", value: "@o2ssc" },
    { label: "TIKTOK", value: "@______111______111111" },
  ],
};
