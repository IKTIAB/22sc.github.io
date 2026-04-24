import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { X, Plus, Trash2, Save, RotateCcw, LogOut, Eye, EyeOff, ImagePlus } from "lucide-react";
import { UI } from "../i18n";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TABS = ["identity", "verse", "about", "hobbies", "journey", "books", "anime", "movies", "contacts", "guestbook"];

function Field({ label, value, onChange, textarea = false, type = "text", testId }) {
  return (
    <label className="block mb-4">
      <span className="text-[10px] tracking-[0.25em] text-[color:var(--ink-mute)] block mb-2">{label}</span>
      {textarea ? (
        <textarea
          data-testid={testId}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full bg-black/30 border border-[color:var(--border)] rounded-lg px-3 py-2 text-sm text-[color:var(--ink)] focus:outline-none focus:border-white/30 resize-none"
        />
      ) : (
        <input
          data-testid={testId}
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-black/30 border border-[color:var(--border)] rounded-lg px-3 py-2 text-sm text-[color:var(--ink)] focus:outline-none focus:border-white/30"
        />
      )}
    </label>
  );
}

function ImageField({ label, value, onChange, fetchInfo, testId }) {
  const [loading, setLoading] = useState(false);
  const handleFetch = async () => {
    if (!fetchInfo) return;
    setLoading(true);
    try {
      const r = await axios.post(`${API}/covers/fetch`, fetchInfo);
      if (r.data.cover) {
        onChange(r.data.cover);
        toast.success("Cover fetched");
      } else {
        toast.error("No cover found");
      }
    } catch {
      toast.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <span className="text-[10px] tracking-[0.25em] text-[color:var(--ink-mute)] block mb-2">{label}</span>
      <div className="flex gap-3 items-start">
        <div className="flex-1">
          <input
            data-testid={testId}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            className="w-full bg-black/30 border border-[color:var(--border)] rounded-lg px-3 py-2 text-sm text-[color:var(--ink)] focus:outline-none focus:border-white/30"
          />
          {fetchInfo && (
            <button
              onClick={handleFetch}
              disabled={loading}
              className="mt-2 text-[10px] tracking-[0.2em] text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] border border-[color:var(--border)] px-3 py-1 rounded-full flex items-center gap-2"
              data-testid={`${testId}-fetch`}
            >
              <ImagePlus size={10} /> {loading ? "..." : "AUTO-FETCH"}
            </button>
          )}
        </div>
        {value && (
          <div className="w-20 h-28 rounded-md overflow-hidden border border-[color:var(--border)] bg-black/50 flex-shrink-0">
            <img src={value} alt="" className="w-full h-full object-cover" onError={(e) => (e.target.style.display = "none")} />
          </div>
        )}
      </div>
    </div>
  );
}

function ArrayEditor({ items, setItems, renderItem, addNew, testIdPrefix }) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="glass p-5 relative" data-testid={`${testIdPrefix}-${i}`}>
          <button
            onClick={() => setItems(items.filter((_, j) => j !== i))}
            className="absolute top-3 right-3 text-[color:var(--ink-mute)] hover:text-red-400"
            data-testid={`${testIdPrefix}-remove-${i}`}
          >
            <Trash2 size={14} />
          </button>
          {renderItem(item, (updated) => setItems(items.map((it, j) => (j === i ? updated : it))), i)}
        </div>
      ))}
      <button
        onClick={() => setItems([...items, addNew()])}
        className="btn btn-ghost w-full justify-center"
        data-testid={`${testIdPrefix}-add`}
      >
        <Plus size={14} /> Add
      </button>
    </div>
  );
}

export default function AdminPanel({ lang, token, content, onSaved, onClose, onLogout }) {
  const t = UI[lang].admin;
  const [tab, setTab] = useState("identity");
  const [draft, setDraft] = useState(content);
  const [saving, setSaving] = useState(false);
  const [guests, setGuests] = useState([]);

  useEffect(() => { setDraft(content); }, [content]);

  useEffect(() => {
    if (tab === "guestbook") {
      axios.get(`${API}/admin/guestbook`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => setGuests(r.data || []))
        .catch(() => toast.error("Failed to load guestbook"));
    }
  }, [tab, token]);

  const setField = (path, value) => {
    setDraft((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let obj = copy;
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
      obj[parts[parts.length - 1]] = value;
      return copy;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const r = await axios.put(`${API}/content`, { data: draft }, { headers: { Authorization: `Bearer ${token}` } });
      onSaved(r.data);
      toast.success(t.saved);
    } catch (e) {
      toast.error("Save failed: " + (e.response?.data?.detail || e.message));
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!window.confirm(t.confirmReset)) return;
    try {
      const r = await axios.post(`${API}/content/reset`, {}, { headers: { Authorization: `Bearer ${token}` } });
      onSaved(r.data);
      setDraft(r.data);
      toast.success("Reset done");
    } catch {
      toast.error("Reset failed");
    }
  };

  const deleteGuest = async (id) => {
    await axios.delete(`${API}/admin/guestbook/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setGuests(guests.filter((g) => g.id !== id));
    toast.success("Deleted");
  };

  const toggleGuestHidden = async (g) => {
    await axios.patch(`${API}/admin/guestbook/${g.id}`, { hidden: !g.hidden }, { headers: { Authorization: `Bearer ${token}` } });
    setGuests(guests.map((x) => (x.id === g.id ? { ...x, hidden: !x.hidden } : x)));
  };

  if (!draft) return null;

  return (
    <div className="fixed inset-0 z-[90] flex" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }} data-testid="admin-panel">
      <div className="m-auto w-[95vw] max-w-6xl h-[92vh] glass flex flex-col overflow-hidden" style={{ borderRadius: "16px" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--border-soft)]">
          <div>
            <div className="text-[10px] tracking-[0.3em] text-[color:var(--ink-mute)]">MAAN · {lang === "ar" ? "لوحة الأدمن" : "ADMIN PANEL"}</div>
            <h2 className="serif text-2xl mt-1" style={{ fontWeight: 300 }}>{lang === "ar" ? "إدارة المحتوى" : "Content Manager"}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={reset} className="btn btn-ghost text-xs" data-testid="admin-reset-btn"><RotateCcw size={12} /> {t.reset}</button>
            <button onClick={save} disabled={saving} className="btn btn-primary text-xs" data-testid="admin-save-btn"><Save size={12} /> {saving ? "..." : t.save}</button>
            <button onClick={onLogout} className="btn btn-ghost text-xs" data-testid="admin-logout-btn"><LogOut size={12} /> {t.logout}</button>
            <button onClick={onClose} className="text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] ml-2" data-testid="admin-close-btn"><X size={18} /></button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Tabs */}
          <div className="w-52 border-r border-[color:var(--border-soft)] p-3 overflow-y-auto flex-shrink-0">
            {TABS.map((id) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`w-full text-start px-3 py-2 rounded-md mb-1 text-xs tracking-wide transition ${tab === id ? "bg-white/10 text-[color:var(--ink)]" : "text-[color:var(--ink-soft)] hover:bg-white/5"}`}
                data-testid={`admin-tab-${id}`}
              >
                {t.tabs[id]}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {tab === "identity" && (
              <div>
                <h3 className="serif text-xl mb-4">{t.tabs.identity}</h3>
                <Field label="Name" value={draft.identity?.name} onChange={(v) => setField("identity.name", v)} testId="f-identity-name" />
                <Field label="Arabic Name" value={draft.identity?.arabic} onChange={(v) => setField("identity.arabic", v)} testId="f-identity-arabic" />
                <Field label="Tagline" value={draft.identity?.tagline} onChange={(v) => setField("identity.tagline", v)} testId="f-identity-tagline" />
                <Field label="Description (EN)" value={draft.identity?.description} onChange={(v) => setField("identity.description", v)} textarea testId="f-identity-desc" />
                <Field label="Description (AR)" value={draft.identity?.description_ar} onChange={(v) => setField("identity.description_ar", v)} textarea testId="f-identity-desc-ar" />
                <ImageField label="Avatar / Hero image URL" value={draft.identity?.avatar} onChange={(v) => setField("identity.avatar", v)} testId="f-identity-avatar" />
                <div className="mt-6">
                  <div className="text-[10px] tracking-[0.25em] text-[color:var(--ink-mute)] mb-3">STATS</div>
                  <ArrayEditor
                    items={draft.identity?.stats || []}
                    setItems={(v) => setField("identity.stats", v)}
                    testIdPrefix="stat"
                    addNew={() => ({ value: "", label: "", label_ar: "" })}
                    renderItem={(it, upd) => (
                      <>
                        <Field label="Value" value={it.value} onChange={(v) => upd({ ...it, value: v })} />
                        <Field label="Label (EN)" value={it.label} onChange={(v) => upd({ ...it, label: v })} />
                        <Field label="Label (AR)" value={it.label_ar} onChange={(v) => upd({ ...it, label_ar: v })} />
                      </>
                    )}
                  />
                </div>
              </div>
            )}

            {tab === "verse" && (
              <div>
                <h3 className="serif text-xl mb-4">{t.tabs.verse}</h3>
                <Field label="Arabic verse" value={draft.verse?.ar} onChange={(v) => setField("verse.ar", v)} textarea testId="f-verse-ar" />
                <Field label="English line" value={draft.verse?.en} onChange={(v) => setField("verse.en", v)} textarea testId="f-verse-en" />
                <Field label="Author" value={draft.verse?.author} onChange={(v) => setField("verse.author", v)} testId="f-verse-author" />
              </div>
            )}

            {tab === "about" && (
              <div>
                <h3 className="serif text-xl mb-4">{t.tabs.about}</h3>
                <Field label="Title (EN)" value={draft.about?.title} onChange={(v) => setField("about.title", v)} testId="f-about-title" />
                <Field label="Title (AR)" value={draft.about?.title_ar} onChange={(v) => setField("about.title_ar", v)} testId="f-about-title-ar" />
                <Field label="Body (EN)" value={draft.about?.body} onChange={(v) => setField("about.body", v)} textarea />
                <Field label="Body (AR)" value={draft.about?.body_ar} onChange={(v) => setField("about.body_ar", v)} textarea />
                <div className="mt-6">
                  <div className="text-[10px] tracking-[0.25em] text-[color:var(--ink-mute)] mb-3">CARDS</div>
                  <ArrayEditor
                    items={draft.about?.cards || []}
                    setItems={(v) => setField("about.cards", v)}
                    testIdPrefix="about-card"
                    addNew={() => ({ label: "", label_ar: "", value: "", value_ar: "", sub: "", sub_ar: "" })}
                    renderItem={(it, upd) => (
                      <>
                        <Field label="Label (EN)" value={it.label} onChange={(v) => upd({ ...it, label: v })} />
                        <Field label="Label (AR)" value={it.label_ar} onChange={(v) => upd({ ...it, label_ar: v })} />
                        <Field label="Value (EN)" value={it.value} onChange={(v) => upd({ ...it, value: v })} />
                        <Field label="Value (AR)" value={it.value_ar} onChange={(v) => upd({ ...it, value_ar: v })} />
                        <Field label="Sub (EN)" value={it.sub} onChange={(v) => upd({ ...it, sub: v })} />
                        <Field label="Sub (AR)" value={it.sub_ar} onChange={(v) => upd({ ...it, sub_ar: v })} />
                      </>
                    )}
                  />
                </div>
              </div>
            )}

            {tab === "hobbies" && (
              <div>
                <h3 className="serif text-xl mb-4">{t.tabs.hobbies}</h3>
                <ArrayEditor
                  items={draft.hobbies || []}
                  setItems={(v) => setField("hobbies", v)}
                  testIdPrefix="hobby"
                  addNew={() => ({ n: "0", title: "", title_ar: "", subtitle: "", subtitle_ar: "", desc: "", desc_ar: "", years: "", percent: 50 })}
                  renderItem={(it, upd) => (
                    <>
                      <Field label="Number" value={it.n} onChange={(v) => upd({ ...it, n: v })} />
                      <Field label="Title (EN)" value={it.title} onChange={(v) => upd({ ...it, title: v })} />
                      <Field label="Title (AR)" value={it.title_ar} onChange={(v) => upd({ ...it, title_ar: v })} />
                      <Field label="Subtitle (EN)" value={it.subtitle} onChange={(v) => upd({ ...it, subtitle: v })} />
                      <Field label="Subtitle (AR)" value={it.subtitle_ar} onChange={(v) => upd({ ...it, subtitle_ar: v })} />
                      <Field label="Description (EN)" value={it.desc} onChange={(v) => upd({ ...it, desc: v })} textarea />
                      <Field label="Description (AR)" value={it.desc_ar} onChange={(v) => upd({ ...it, desc_ar: v })} textarea />
                      <Field label="Years" value={it.years} onChange={(v) => upd({ ...it, years: v })} />
                      <Field label="Percent (0-100)" value={it.percent} onChange={(v) => upd({ ...it, percent: Number(v) || 0 })} type="number" />
                    </>
                  )}
                />
              </div>
            )}

            {tab === "journey" && (
              <div>
                <h3 className="serif text-xl mb-4">{t.tabs.journey}</h3>
                <ArrayEditor
                  items={draft.journey || []}
                  setItems={(v) => setField("journey", v)}
                  testIdPrefix="journey"
                  addNew={() => ({ year: "", title: "", title_ar: "", desc: "", desc_ar: "" })}
                  renderItem={(it, upd) => (
                    <>
                      <Field label="Year" value={it.year} onChange={(v) => upd({ ...it, year: v })} />
                      <Field label="Title (EN)" value={it.title} onChange={(v) => upd({ ...it, title: v })} />
                      <Field label="Title (AR)" value={it.title_ar} onChange={(v) => upd({ ...it, title_ar: v })} />
                      <Field label="Description (EN)" value={it.desc} onChange={(v) => upd({ ...it, desc: v })} textarea />
                      <Field label="Description (AR)" value={it.desc_ar} onChange={(v) => upd({ ...it, desc_ar: v })} textarea />
                    </>
                  )}
                />
              </div>
            )}

            {tab === "books" && (
              <div>
                <h3 className="serif text-xl mb-4">{t.tabs.books}</h3>
                <ArrayEditor
                  items={draft.books || []}
                  setItems={(v) => setField("books", v)}
                  testIdPrefix="book"
                  addNew={() => ({ id: `b${Date.now()}`, tag: "", tag_ar: "", title: "", english: "", author: "", author_ar: "", quote: "", quote_ar: "", letter: "•", gradA: "#3b1f5e", gradB: "#6b2d4a", cover: "" })}
                  renderItem={(it, upd) => (
                    <>
                      <Field label="ID" value={it.id} onChange={(v) => upd({ ...it, id: v })} />
                      <Field label="Title (Arabic)" value={it.title} onChange={(v) => upd({ ...it, title: v })} />
                      <Field label="English title" value={it.english} onChange={(v) => upd({ ...it, english: v })} />
                      <Field label="Author (EN)" value={it.author} onChange={(v) => upd({ ...it, author: v })} />
                      <Field label="Author (AR)" value={it.author_ar} onChange={(v) => upd({ ...it, author_ar: v })} />
                      <Field label="Tag (EN)" value={it.tag} onChange={(v) => upd({ ...it, tag: v })} />
                      <Field label="Tag (AR)" value={it.tag_ar} onChange={(v) => upd({ ...it, tag_ar: v })} />
                      <Field label="Quote (EN)" value={it.quote} onChange={(v) => upd({ ...it, quote: v })} textarea />
                      <Field label="Quote (AR)" value={it.quote_ar} onChange={(v) => upd({ ...it, quote_ar: v })} textarea />
                      <ImageField label="Cover URL" value={it.cover} onChange={(v) => upd({ ...it, cover: v })} fetchInfo={{ type: "book", query: it.english || it.title, author: it.author }} />
                    </>
                  )}
                />
              </div>
            )}

            {tab === "anime" && (
              <div>
                <h3 className="serif text-xl mb-4">{t.tabs.anime}</h3>
                <ArrayEditor
                  items={draft.anime || []}
                  setItems={(v) => setField("anime", v)}
                  testIdPrefix="anime"
                  addNew={() => ({ id: `a${Date.now()}`, title: "", title_ar: "", arabic: "", meta: "", meta_ar: "", quote: "", quote_ar: "", featured: false, cover: "" })}
                  renderItem={(it, upd) => (
                    <>
                      <Field label="ID" value={it.id} onChange={(v) => upd({ ...it, id: v })} />
                      <Field label="Title (EN)" value={it.title} onChange={(v) => upd({ ...it, title: v })} />
                      <Field label="Title (AR)" value={it.title_ar} onChange={(v) => upd({ ...it, title_ar: v })} />
                      <Field label="Meta (EN)" value={it.meta} onChange={(v) => upd({ ...it, meta: v })} />
                      <Field label="Meta (AR)" value={it.meta_ar} onChange={(v) => upd({ ...it, meta_ar: v })} />
                      <Field label="Quote (EN)" value={it.quote} onChange={(v) => upd({ ...it, quote: v })} textarea />
                      <Field label="Quote (AR)" value={it.quote_ar} onChange={(v) => upd({ ...it, quote_ar: v })} textarea />
                      <label className="flex items-center gap-2 mb-4 text-xs">
                        <input type="checkbox" checked={!!it.featured} onChange={(e) => upd({ ...it, featured: e.target.checked })} />
                        Featured
                      </label>
                      <ImageField label="Cover URL" value={it.cover} onChange={(v) => upd({ ...it, cover: v })} fetchInfo={{ type: "anime", query: it.title }} />
                    </>
                  )}
                />
              </div>
            )}

            {tab === "movies" && (
              <div>
                <h3 className="serif text-xl mb-4">{t.tabs.movies}</h3>
                <ArrayEditor
                  items={draft.movies || []}
                  setItems={(v) => setField("movies", v)}
                  testIdPrefix="movie"
                  addNew={() => ({ id: `m${Date.now()}`, tag: "", tag_ar: "", title: "", arabic: "", extra: "", quote: "", quote_ar: "", cover: "" })}
                  renderItem={(it, upd) => (
                    <>
                      <Field label="ID" value={it.id} onChange={(v) => upd({ ...it, id: v })} />
                      <Field label="Title (EN)" value={it.title} onChange={(v) => upd({ ...it, title: v })} />
                      <Field label="Title (AR)" value={it.arabic} onChange={(v) => upd({ ...it, arabic: v })} />
                      <Field label="Tag (EN)" value={it.tag} onChange={(v) => upd({ ...it, tag: v })} />
                      <Field label="Tag (AR)" value={it.tag_ar} onChange={(v) => upd({ ...it, tag_ar: v })} />
                      <Field label="Extra badge (e.g. +4)" value={it.extra} onChange={(v) => upd({ ...it, extra: v })} />
                      <Field label="Quote (EN)" value={it.quote} onChange={(v) => upd({ ...it, quote: v })} textarea />
                      <Field label="Quote (AR)" value={it.quote_ar} onChange={(v) => upd({ ...it, quote_ar: v })} textarea />
                      <ImageField label="Cover URL" value={it.cover} onChange={(v) => upd({ ...it, cover: v })} fetchInfo={{ type: "movie", query: it.title }} />
                    </>
                  )}
                />
              </div>
            )}

            {tab === "contacts" && (
              <div>
                <h3 className="serif text-xl mb-4">{t.tabs.contacts}</h3>
                <ArrayEditor
                  items={draft.contacts || []}
                  setItems={(v) => setField("contacts", v)}
                  testIdPrefix="contact"
                  addNew={() => ({ label: "", value: "", copy: false })}
                  renderItem={(it, upd) => (
                    <>
                      <Field label="Label (e.g. EMAIL)" value={it.label} onChange={(v) => upd({ ...it, label: v })} />
                      <Field label="Value" value={it.value} onChange={(v) => upd({ ...it, value: v })} />
                      <label className="flex items-center gap-2 mb-4 text-xs">
                        <input type="checkbox" checked={!!it.copy} onChange={(e) => upd({ ...it, copy: e.target.checked })} />
                        Show "click to copy" hint
                      </label>
                    </>
                  )}
                />
              </div>
            )}

            {tab === "guestbook" && (
              <div>
                <h3 className="serif text-xl mb-4">{t.tabs.guestbook}</h3>
                <p className="text-xs text-[color:var(--ink-soft)] mb-4">Total: {guests.length}</p>
                <div className="space-y-2">
                  {guests.map((g) => (
                    <div key={g.id} className={`glass p-4 flex items-center gap-3 ${g.hidden ? "opacity-50" : ""}`} data-testid={`guest-row-${g.id}`}>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-sm serif">{g.name[0]?.toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm flex items-center gap-2">{g.name} {g.hidden && <span className="text-[9px] px-2 py-0.5 rounded bg-red-900/40 border border-red-700/40">HIDDEN</span>}</div>
                        {g.message && <div className="text-xs text-[color:var(--ink-soft)] italic truncate">"{g.message}"</div>}
                        <div className="text-[10px] text-[color:var(--ink-mute)]">{new Date(g.created_at).toLocaleString()}</div>
                      </div>
                      <button onClick={() => toggleGuestHidden(g)} className="btn btn-ghost text-xs" data-testid={`guest-toggle-${g.id}`}>
                        {g.hidden ? <><Eye size={12} /> {t.unhide}</> : <><EyeOff size={12} /> {t.hide}</>}
                      </button>
                      <button onClick={() => deleteGuest(g.id)} className="btn btn-ghost text-xs hover:!text-red-400" data-testid={`guest-delete-${g.id}`}>
                        <Trash2 size={12} /> {t.delete}
                      </button>
                    </div>
                  ))}
                  {guests.length === 0 && <div className="text-sm text-[color:var(--ink-mute)] text-center py-8">No visitors yet.</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
