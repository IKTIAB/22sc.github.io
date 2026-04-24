import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Lock, X } from "lucide-react";
import { UI } from "../i18n";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminLogin({ lang, onSuccess, onClose }) {
  const t = UI[lang].admin;
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!password) return;
    setLoading(true);
    try {
      const r = await axios.post(`${API}/admin/login`, { password });
      const token = r.data.token;
      localStorage.setItem("maan_admin_token", token);
      toast.success(t.signedIn);
      onSuccess(token);
    } catch (e) {
      toast.error(t.wrongPass);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}
      data-testid="admin-login-modal"
    >
      <div className="glass max-w-md w-full p-10 relative">
        <button
          className="absolute top-4 right-4 text-[color:var(--ink-mute)] hover:text-[color:var(--ink)]"
          onClick={onClose}
          data-testid="admin-login-close"
        >
          <X size={18} />
        </button>
        <div className="flex items-center gap-2 text-[11px] tracking-[0.3em] text-[color:var(--ink-soft)] mb-4">
          <Lock size={12} /> ADMIN
        </div>
        <h2 className="serif-display text-4xl mb-3" style={{ fontWeight: 300 }}>{t.loginTitle}</h2>
        <p className="text-sm text-[color:var(--ink-soft)] mb-8 leading-relaxed">{t.loginSub}</p>

        <label className="text-[10px] tracking-[0.25em] text-[color:var(--ink-mute)] block mb-2">{t.passwordLabel}</label>
        <input
          data-testid="admin-password-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={t.passwordPh}
          autoFocus
          className="w-full mb-6 bg-transparent border border-[color:var(--border)] rounded-lg px-4 py-3 text-[color:var(--ink)] focus:outline-none focus:border-white/30 transition tracking-widest"
        />
        <button
          data-testid="admin-signin-btn"
          onClick={submit}
          disabled={loading}
          className="btn btn-primary w-full justify-center"
        >
          {loading ? "..." : t.signIn}
        </button>
      </div>
    </div>
  );
}
