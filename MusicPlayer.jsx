import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Music2 } from "lucide-react";

/**
 * A luxurious floating music player for the Maan portfolio.
 * - Plays /audio/sima.mp3 (looping)
 * - Animated gold/silver ring, pulsing waves
 * - Collapsible panel with volume & track info
 */
export default function MusicPlayer({ lang = "en" }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [volume, setVolume] = useState(0.55);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = muted ? 0 : volume;
  }, [volume, muted]);

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      if (playing) {
        a.pause();
        setPlaying(false);
      } else {
        await a.play();
        setPlaying(true);
      }
    } catch (e) {
      // autoplay blocked — user click will re-trigger
    }
  };

  const labelTitle = lang === "ar" ? "سيما" : "Sima";
  const labelArtist = lang === "ar" ? "أمير عيد" : "Amir Eid";
  const tapHint = lang === "ar" ? "اضغط للتشغيل" : "TAP TO PLAY";

  return (
    <div
      className={`music-player ${expanded ? "expanded" : ""} ${playing ? "is-playing" : ""}`}
      data-testid="music-player"
      dir="ltr"
    >
      <audio
        ref={audioRef}
        src={`${process.env.PUBLIC_URL || ""}/audio/sima.mp3`}
        loop
        preload="auto"
        onCanPlay={() => setReady(true)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Expanded info panel */}
      <div className="mp-panel">
        <div className="mp-panel-row">
          <div className="mp-title">
            <div className="mp-title-main">{labelTitle}</div>
            <div className="mp-title-sub">{labelArtist}</div>
          </div>
          <button
            className="mp-mute"
            onClick={() => setMuted((m) => !m)}
            data-testid="music-mute-btn"
            aria-label="mute"
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={muted ? 0 : volume}
          onChange={(e) => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
          className="mp-range"
          data-testid="music-volume"
        />

        {/* Animated equaliser */}
        <div className={`mp-eq ${playing ? "on" : ""}`} aria-hidden="true">
          {Array.from({ length: 16 }).map((_, i) => (
            <span key={i} style={{ animationDelay: `${(i * 0.09).toFixed(2)}s` }} />
          ))}
        </div>
      </div>

      {/* The main luxurious button */}
      <button
        className="mp-button"
        onClick={() => { setExpanded((e) => !e); if (!playing) toggle(); else toggle(); }}
        onMouseEnter={() => setExpanded(true)}
        data-testid="music-toggle-btn"
        aria-label="toggle music"
      >
        <span className="mp-ring" />
        <span className="mp-ring mp-ring-2" />
        <span className="mp-core">
          {playing ? <Pause size={18} strokeWidth={1.5} /> : <Play size={18} strokeWidth={1.5} />}
        </span>
        <span className="mp-note">
          <Music2 size={11} />
        </span>
      </button>

      {!playing && !ready && (
        <div className="mp-hint">{tapHint}</div>
      )}
    </div>
  );
}
