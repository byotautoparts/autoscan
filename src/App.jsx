import { useState, useRef, useCallback } from "react";

const SUPABASE_URL = "https://vcdathdwdziivvuyqaex.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjZGF0aGR3ZHppaXZ2dXlxYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNjA4NDYsImV4cCI6MjA4ODgzNjg0Nn0.iCQz535Yj1VQvSJdY3JKnN0i7DMA_bKuF6U_xjBNnD0";

const trySaveToSupabase = async (data, imageFile, imageObjectUrl) => {
  try {
    let image_url = null;
    if (imageFile) {
      const ext = (imageFile.name || "part").split(".").pop() || "jpg";
      const path = `scans/${Date.now()}.${ext}`;
      const upRes = await fetch(`${SUPABASE_URL}/storage/v1/object/part-images/${path}`, {
        method: "POST",
        headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": imageFile.type },
        body: imageFile
      });
      if (upRes.ok) image_url = `${SUPABASE_URL}/storage/v1/object/public/part-images/${path}`;
    }
    const res = await fetch(`${SUPABASE_URL}/rest/v1/scans`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}`, "Prefer": "return=representation" },
      body: JSON.stringify({
        part_name: data.part_name, part_category: data.part_category,
        part_number: data.part_number_visible, compatible_vehicles: data.compatible_vehicles,
        condition: data.condition, condition_notes: data.condition_notes,
        estimated_value: data.estimated_value, confidence: data.confidence,
        notes: data.notes, image_url
      })
    });
    const json = await res.json();
    return Array.isArray(json) && json[0]?.id ? { id: json[0].id, image_url } : { id: null, image_url: imageObjectUrl };
  } catch { return { id: null, image_url: imageObjectUrl }; }
};

const tryUpdateFeedback = async (id, feedback) => {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/scans?id=eq.${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify({ staff_feedback: feedback })
    });
  } catch { }
};

const SYSTEM_PROMPT = `You are an expert auto mechanic and parts specialist with 30 years of experience working with salvage yards and used auto parts. When shown an image of an auto or mechanical part, identify it and respond ONLY with valid JSON (no markdown, no code blocks).

Return this exact structure:
{
  "part_name": "Full descriptive name of the part",
  "part_category": "Category (e.g., Engine, Brakes, Suspension, Electrical, Filters, Belts & Hoses)",
  "part_number_visible": "Any visible part numbers or OEM numbers, or null",
  "compatible_vehicles": "General compatibility info",
  "condition": "Good / Fair / Worn / Damaged / Unknown",
  "condition_notes": "Brief description of visible wear or damage",
  "estimated_value": "Rough price range in USD if known, or null",
  "confidence": "High / Medium / Low",
  "notes": "Any additional important info for a parts counter staff member"
}`;

// Softer lime green matching BYOT screenshot — not neon, more natural
const C = {
  pageBg:    "#272727",
  panelBg:   "#303030",
  cardBg:    "#383838",
  cardDark:  "#2c2c2c",
  border:    "#454545",
  borderHi:  "#5a5a5a",
  green:     "#5BBF2A",   // softer lime, matches BYOT app
  greenLight:"#6ed93a",
  greenDark: "#4aaa1e",
  greenMuted:"#3d7a1c",
  greenGlow: "#5BBF2A28",
  white:     "#f0f0f0",
  textMid:   "#b8b8b8",
  textDim:   "#888",
  textFaint: "#555",
};

const COND = {
  Good:    { bg: "#0e2208", text: "#5BBF2A", border: "#2a5c12" },
  Fair:    { bg: "#2b2000", text: "#e8a020", border: "#5c4000" },
  Worn:    { bg: "#2b1800", text: "#e07828", border: "#5c3000" },
  Damaged: { bg: "#280a0a", text: "#d94040", border: "#581212" },
  Unknown: { bg: "#303030", text: "#888",    border: "#454545" },
};
const CONF_COLOR = { High: "#5BBF2A", Medium: "#e8a020", Low: "#d94040" };

const BYOTLogo = ({ size = 50 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    <rect width="80" height="80" rx="14" fill="#1c1c1c"/>
    <rect x="2" y="2" width="76" height="76" rx="13" fill="none" stroke="#5BBF2A" strokeWidth="2"/>
    <text x="40" y="26" textAnchor="middle" fill="#5BBF2A" fontSize="12" fontWeight="900" fontFamily="'Nunito', sans-serif" letterSpacing="1">B.Y.O.T.</text>
    <text x="40" y="40" textAnchor="middle" fill="#f0f0f0" fontSize="8.5" fontWeight="700" fontFamily="'Nunito', sans-serif">AUTO PARTS</text>
    <line x1="14" y1="46" x2="66" y2="46" stroke="#5BBF2A" strokeWidth="1" opacity="0.4"/>
    <text x="40" y="57" textAnchor="middle" fill="#5BBF2A" fontSize="6" fontWeight="600" fontFamily="'Nunito', sans-serif">AI PARTS SCANNER</text>
  </svg>
);

const NavCard = ({ icon, label, sub, active, onClick }) => (
  <button onClick={onClick} style={{
    background: active ? `linear-gradient(145deg, #4aaa1e, #3d8f18)` : C.cardBg,
    border: `2px solid ${active ? C.green : C.border}`,
    borderRadius: 18, padding: "13px 8px",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: 5, cursor: "pointer", flex: 1, transition: "all 0.18s",
    boxShadow: active ? `0 4px 18px ${C.greenGlow}` : "0 2px 8px #00000030",
  }}>
    <span style={{ fontSize: 20 }}>{icon}</span>
    <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 800, color: active ? "#fff" : C.green, letterSpacing: 0.5, textAlign: "center", lineHeight: 1.2 }}>{label}</span>
    {sub && <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 8, color: active ? "#d0f0c0" : C.textDim, letterSpacing: 0.5 }}>{sub}</span>}
  </button>
);

const Label = ({ children }) => (
  <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 9, fontWeight: 700, color: C.textDim, letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>{children}</div>
);

const CardHeader = ({ icon, title }) => (
  <div style={{ background: "#1e1e1e", padding: "11px 18px", borderBottom: `2px solid ${C.green}`, display: "flex", alignItems: "center", gap: 9 }}>
    <span style={{ fontSize: 15 }}>{icon}</span>
    <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 800, color: C.green, letterSpacing: 1 }}>{title}</span>
  </div>
);

export default function AutoScan() {
  const [tab, setTab] = useState("scan");
  const [apiKey, setApiKey] = useState(() => { try { return localStorage.getItem("byot_api_key") || ""; } catch { return ""; } });
  const [keySubmitted, setKeySubmitted] = useState(() => { try { return !!localStorage.getItem("byot_api_key"); } catch { return false; } });
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMime, setImageMime] = useState("image/jpeg");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [history, setHistory] = useState(() => { try { return JSON.parse(localStorage.getItem("byot_history") || "[]"); } catch { return []; } });
  const [feedback, setFeedback] = useState(null);
  const [currentScanId, setCurrentScanId] = useState(null);
  const [dbStatus, setDbStatus] = useState("idle");
  const fileRef = useRef();

  const saveApiKey = (key) => {
    setApiKey(key);
    try { if (key) localStorage.setItem("byot_api_key", key); else localStorage.removeItem("byot_api_key"); } catch {}
  };

  const updateHistory = (updater) => {
    setHistory(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try { localStorage.setItem("byot_history", JSON.stringify(next.slice(0, 100))); } catch {}
      return next;
    });
  };

  const processFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setResult(null); setError(null); setCurrentScanId(null); setFeedback(null); setDbStatus("idle");
    setImageMime(file.type || "image/jpeg");
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setImage(dataUrl);
      setImageBase64(dataUrl.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    processFile(e.dataTransfer.files[0]);
  }, []);

  const scan = async () => {
    if (!imageBase64 || !apiKey) return;
    setLoading(true); setError(null); setResult(null); setCurrentScanId(null); setFeedback(null); setDbStatus("idle");
    try {
      const res = await fetch("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: imageMime, data: imageBase64 } },
            { type: "text", text: "Identify this auto part." }
          ]}]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      let raw = data.content[0].text.trim();
      if (raw.startsWith("```")) raw = raw.split("\n").slice(1).join("\n");
      if (raw.endsWith("```")) raw = raw.split("\n").slice(0, -1).join("\n");
      const parsed = JSON.parse(raw.trim());
      setResult(parsed);

      const localId = `local-${Date.now()}`;
      updateHistory(prev => [{
        id: localId, created_at: new Date().toISOString(), image_url: image,
        part_name: parsed.part_name, part_category: parsed.part_category,
        part_number: parsed.part_number_visible, compatible_vehicles: parsed.compatible_vehicles,
        condition: parsed.condition, condition_notes: parsed.condition_notes,
        estimated_value: parsed.estimated_value, confidence: parsed.confidence,
        notes: parsed.notes, staff_feedback: null
      }, ...prev]);

      setDbStatus("saving");
      trySaveToSupabase(parsed, imageFile, image).then(({ id, image_url }) => {
        if (id) {
          setCurrentScanId(id); setDbStatus("saved");
          updateHistory(prev => prev.map(h => h.id === localId ? { ...h, id, image_url } : h));
        } else setDbStatus("failed");
      });
    } catch (e) {
      setError(e.message || "Scan failed. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (val) => {
    setFeedback(val);
    updateHistory(prev => prev.map((h, i) => i === 0 ? { ...h, staff_feedback: val } : h));
    if (currentScanId) tryUpdateFeedback(currentScanId, val);
  };

  const cs = result ? (COND[result.condition] || COND.Unknown) : null;
  const dbBadge = {
    saving: { text: "● Saving...",           color: "#e8a020" },
    saved:  { text: "✓ Saved to database",   color: C.green   },
    failed: { text: "⚠ Saved locally only",  color: "#e07828" },
  }[dbStatus];

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg, color: C.white }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Outfit', sans-serif; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: ${C.pageBg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 5px; }
        .scan-btn:hover:not(:disabled) { background: linear-gradient(145deg, #4aaa1e, #3a8a14) !important; transform: translateY(-2px); box-shadow: 0 8px 24px ${C.greenGlow} !important; }
        .scan-btn:active:not(:disabled) { transform: translateY(0) !important; }
        .dropz { transition: all 0.2s; }
        .dropz:hover { border-color: ${C.green} !important; background: #263320 !important; }
        .hrow:hover { background: #404040 !important; }
        .clr-btn:hover { border-color: #d94040 !important; color: #d94040 !important; }
        .tag-pill { transition: all 0.12s; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scanline { 0%{top:5%} 100%{top:95%} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .fu { animation: fadeUp 0.35s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #222 100%)", borderBottom: `3px solid ${C.green}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", height: 72, gap: 14 }}>
          <BYOTLogo size={54} />
          <div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 18, fontWeight: 900, color: C.white, letterSpacing: 0.5, lineHeight: 1 }}>BYOT Auto Parts</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, color: C.green, letterSpacing: 2, marginTop: 3, fontWeight: 600 }}>AI Parts Scanner</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 8, color: C.textFaint, letterSpacing: 1, marginTop: 1 }}>Texas · Louisiana · Mississippi</div>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            {keySubmitted ? (
              <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#1e2e18", borderRadius: 22, padding: "7px 16px", border: `1px solid ${C.greenMuted}` }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, boxShadow: `0 0 7px ${C.green}`, animation: "pulse 2.5s infinite" }} />
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.green, fontWeight: 600 }}>Connected</span>
                <span style={{ color: C.textFaint, fontSize: 11 }}>·</span>
                <button onClick={() => { setKeySubmitted(false); saveApiKey(""); }} style={{ background: "none", border: "none", color: C.textFaint, fontSize: 9, cursor: "pointer", textDecoration: "underline", fontFamily: "'Outfit', sans-serif" }}>change</button>
              </div>
            ) : (
              <button onClick={() => setShowKeyInput(!showKeyInput)} style={{
                background: `linear-gradient(145deg, ${C.green}, ${C.greenDark})`,
                color: "#fff", border: "none", borderRadius: 22, padding: "9px 20px",
                fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 800,
                cursor: "pointer", letterSpacing: 0.5,
                boxShadow: `0 4px 14px ${C.greenGlow}`
              }}>🔑 Connect API</button>
            )}
          </div>
        </div>

        {/* API key panel */}
        {showKeyInput && !keySubmitted && (
          <div className="fu" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 16px" }}>
            <div style={{ background: "#1e2e18", borderRadius: 14, padding: "14px 18px", border: `1px solid ${C.greenMuted}`, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 800, color: C.green, marginBottom: 2 }}>Anthropic API Key</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, color: C.textFaint }}>console.anthropic.com → API Keys</div>
              </div>
              <input type="password" placeholder="sk-ant-..." value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                onKeyDown={e => e.key === "Enter" && apiKey.length > 10 && (saveApiKey(apiKey), setKeySubmitted(true), setShowKeyInput(false))}
                style={{ flex: 2, minWidth: 220, background: C.pageBg, border: `1px solid ${C.border}`, color: C.white, fontFamily: "'Outfit', monospace", fontSize: 12, padding: "9px 13px", borderRadius: 10, outline: "none" }} />
              <button onClick={() => { if (apiKey.length > 10) { saveApiKey(apiKey); setKeySubmitted(true); setShowKeyInput(false); } }}
                style={{ background: `linear-gradient(145deg, ${C.green}, ${C.greenDark})`, color: "#fff", border: "none", borderRadius: 10, padding: "9px 22px", fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
                Connect →
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "22px 20px" }}>

        {/* ── NAV CARDS ── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
          <NavCard icon="🔍" label="Scan Part"    sub="Identify parts"   active={tab === "scan"}    onClick={() => setTab("scan")} />
          <NavCard icon="📋" label="History"      sub="Past scans"       active={tab === "history"} onClick={() => setTab("history")} />
          <NavCard icon="📊" label="Part Stats"   sub="Session summary"  active={tab === "stats"}   onClick={() => setTab("stats")} />
        </div>

        {/* ── SCAN TAB ── */}
        {tab === "scan" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>

            {/* Upload card */}
            <div style={{ background: C.cardBg, borderRadius: 20, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 4px 20px #00000030" }}>
              <CardHeader icon="📷" title="Upload Part Image" />

              <div className="dropz" onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                style={{ border: `2px dashed ${dragging ? C.green : C.border}`, background: dragging ? "#263320" : C.cardDark, height: 280, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", margin: 14, borderRadius: 14 }}>
                {image ? (
                  <>
                    <img
                      src={image}
                      alt="part"
                      style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", borderRadius: 10 }}
                    />
                    {loading && (
                      <div style={{ position: "absolute", inset: 0, background: "#00000070", borderRadius: 12, zIndex: 2 }}>
                        <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${C.green}, transparent)`, animation: "scanline 1.8s ease-in-out infinite", boxShadow: `0 0 10px ${C.green}`, zIndex: 3 }} />
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: 28, zIndex: 1 }}>
                    <div style={{ fontSize: 44, marginBottom: 12, filter: "grayscale(0.3)" }}>🔧</div>
                    <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: 800, color: C.textDim, marginBottom: 6 }}>Drop part image here</div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, color: C.textFaint }}>or tap to browse · JPG PNG WEBP</div>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={e => processFile(e.target.files[0])} style={{ display: "none" }} />

              <div style={{ padding: "0 14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                {image ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="scan-btn" onClick={scan} disabled={loading || !keySubmitted}
                      style={{ flex: 1, background: loading ? C.cardDark : `linear-gradient(145deg, ${C.green}, ${C.greenDark})`, color: loading ? C.textDim : "#fff", border: "none", borderRadius: 12, padding: "13px 0", fontFamily: "'Nunito', sans-serif", fontSize: 15, fontWeight: 800, cursor: loading || !keySubmitted ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, transition: "all 0.18s", boxShadow: !loading && keySubmitted ? `0 4px 16px ${C.greenGlow}` : "none" }}>
                      {loading
                        ? <><svg width="15" height="15" viewBox="0 0 16 16" style={{ animation: "spin 1s linear infinite" }}><circle cx="8" cy="8" r="6" stroke={C.green} strokeWidth="1.5" strokeDasharray="20 18" fill="none"/></svg> Analyzing...</>
                        : <>🔍 Identify Part</>}
                    </button>
                    <button className="clr-btn" onClick={() => { setImage(null); setImageBase64(null); setImageFile(null); setResult(null); setError(null); setDbStatus("idle"); }}
                      style={{ background: C.cardDark, border: `1px solid ${C.border}`, color: C.textDim, borderRadius: 12, padding: "13px 15px", fontSize: 14, cursor: "pointer", transition: "all 0.15s" }}>✕</button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()}
                    style={{ width: "100%", background: C.cardDark, border: `2px solid ${C.green}`, color: C.green, borderRadius: 12, padding: "12px 0", fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
                    📁 Browse Files
                  </button>
                )}

                {!keySubmitted && (
                  <div style={{ textAlign: "center", fontFamily: "'Outfit', sans-serif", fontSize: 10, color: C.green, fontWeight: 500 }}>Tap "Connect API" in the header to enable scanning</div>
                )}
                {dbBadge && (
                  <div style={{ textAlign: "center", fontFamily: "'Outfit', sans-serif", fontSize: 10, color: dbBadge.color, fontWeight: 600 }}>{dbBadge.text}</div>
                )}
              </div>
            </div>

            {/* Results card */}
            <div style={{ background: C.cardBg, borderRadius: 20, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 4px 20px #00000030" }}>
              <CardHeader icon="📋" title="Part Details" />

              {!result && !loading && !error && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 12, padding: 24 }}>
                  <div style={{ fontSize: 52, opacity: 0.12 }}>🔩</div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: C.textFaint, textAlign: "center", lineHeight: 1.6 }}>Upload a part image<br/>and press Identify</div>
                </div>
              )}

              {loading && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 16 }}>
                  <svg width="52" height="52" viewBox="0 0 52 52" style={{ animation: "spin 1.3s linear infinite" }}>
                    <circle cx="26" cy="26" r="22" stroke={C.green} strokeWidth="2.5" strokeDasharray="55 85" fill="none"/>
                  </svg>
                  <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: 700, color: C.green, animation: "pulse 1.8s infinite" }}>Analyzing part...</div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, color: C.textFaint }}>Consulting AI expert</div>
                </div>
              )}

              {error && (
                <div className="fu" style={{ padding: 18 }}>
                  <div style={{ background: "#280a0a", border: "1px solid #581212", borderRadius: 12, padding: 16 }}>
                    <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 800, color: "#d94040", marginBottom: 8 }}>⚠ Scan Error</div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.textDim, lineHeight: 1.7 }}>{error}</div>
                  </div>
                </div>
              )}

              {result && (
                <div className="fu">
                  {/* Part name banner */}
                  <div style={{ background: `linear-gradient(135deg, #1c3010 0%, #0e2208 100%)`, padding: "15px 20px", borderBottom: `2px solid ${C.greenMuted}` }}>
                    <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 18, fontWeight: 900, color: C.green, lineHeight: 1.25 }}>{result.part_name}</div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, color: "#7ab860", marginTop: 4, letterSpacing: 1.5, fontWeight: 500 }}>{result.part_category?.toUpperCase()}</div>
                  </div>

                  {/* Condition + Confidence */}
                  <div style={{ display: "flex", gap: 10, padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ flex: 1, background: cs.bg, border: `1px solid ${cs.border}`, borderRadius: 12, padding: "9px 12px", textAlign: "center" }}>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 8, color: C.textDim, letterSpacing: 2, marginBottom: 4, fontWeight: 600 }}>CONDITION</div>
                      <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, color: cs.text, fontWeight: 900 }}>{result.condition}</div>
                    </div>
                    <div style={{ flex: 1, background: C.cardDark, border: `1px solid ${C.border}`, borderRadius: 12, padding: "9px 12px", textAlign: "center" }}>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 8, color: C.textDim, letterSpacing: 2, marginBottom: 4, fontWeight: 600 }}>CONFIDENCE</div>
                      <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, color: CONF_COLOR[result.confidence] || C.textDim, fontWeight: 900 }}>{result.confidence || "—"}</div>
                    </div>
                  </div>

                  {/* Detail rows */}
                  <div style={{ padding: "4px 16px 0" }}>
                    {[
                      ["🔢", "Part Number",     result.part_number_visible || "Not visible"],
                      ["🚗", "Compatible With", result.compatible_vehicles],
                      ["💵", "Est. Value",      result.estimated_value || "Unknown"],
                      ["📝", "Condition Notes", result.condition_notes],
                    ].filter(([,,v]) => v).map(([icon, label, value]) => (
                      <div key={label} style={{ padding: "9px 0", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 13, marginTop: 1 }}>{icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, color: C.textDim, fontWeight: 600, letterSpacing: 1, marginBottom: 2 }}>{label.toUpperCase()}</div>
                          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: C.textMid, lineHeight: 1.6 }}>{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {result.notes && (
                    <div style={{ margin: "12px 16px", background: "#1e2e18", borderRadius: 12, padding: "12px 14px", border: `1px solid ${C.greenMuted}` }}>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, color: C.green, fontWeight: 700, letterSpacing: 1.5, marginBottom: 5 }}>💡 STAFF NOTES</div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.textDim, lineHeight: 1.7 }}>{result.notes}</div>
                    </div>
                  )}

                  {/* Feedback */}
                  <div style={{ padding: "12px 16px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.textDim, fontWeight: 500 }}>Was this correct?</span>
                    {feedback
                      ? <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: feedback === "correct" ? C.green : "#d94040", fontWeight: 700 }}>
                          {feedback === "correct" ? "✓ Marked Correct" : "✗ Marked Wrong"}
                        </span>
                      : <>
                          <button onClick={() => submitFeedback("correct")}
                            style={{ background: "#0e2208", border: `1px solid ${C.greenMuted}`, color: C.green, borderRadius: 8, padding: "5px 14px", fontSize: 11, fontFamily: "'Nunito', sans-serif", fontWeight: 700, cursor: "pointer" }}>✓ Yes</button>
                          <button onClick={() => submitFeedback("wrong")}
                            style={{ background: "#280a0a", border: "1px solid #581212", color: "#d94040", borderRadius: 8, padding: "5px 14px", fontSize: 11, fontFamily: "'Nunito', sans-serif", fontWeight: 700, cursor: "pointer" }}>✗ No</button>
                        </>
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === "history" && (
          <div className="fu">
            <div style={{ background: C.cardBg, borderRadius: 20, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 4px 20px #00000030" }}>
              <div style={{ background: "#1e1e1e", padding: "11px 18px", borderBottom: `2px solid ${C.green}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ fontSize: 15 }}>📋</span>
                  <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 800, color: C.green }}>Scan History</span>
                </div>
                <div style={{ background: `linear-gradient(145deg, ${C.green}, ${C.greenDark})`, color: "#fff", borderRadius: 20, padding: "3px 13px", fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 800 }}>
                  {history.length} scan{history.length !== 1 ? "s" : ""}
                </div>
              </div>

              {history.length === 0 ? (
                <div style={{ padding: 48, textAlign: "center" }}>
                  <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.15 }}>📭</div>
                  <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: 700, color: C.textFaint, marginBottom: 6 }}>No scans yet</div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.textFaint }}>Go to Scan Part to identify your first part</div>
                </div>
              ) : (
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 9 }}>
                  {history.map((row) => {
                    const c = COND[row.condition] || COND.Unknown;
                    return (
                      <div key={row.id} className="hrow" style={{ background: C.cardDark, borderRadius: 14, border: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: row.image_url ? "76px 1fr auto" : "1fr auto", overflow: "hidden", transition: "background 0.12s" }}>
                        {row.image_url && <img src={row.image_url} alt="" style={{ width: 76, height: 76, objectFit: "cover", display: "block" }} />}
                        <div style={{ padding: "10px 14px" }}>
                          <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: 800, color: C.white, marginBottom: 5 }}>{row.part_name}</div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {[row.part_category, row.part_number ? `#${row.part_number}` : null, row.estimated_value].filter(Boolean).map((v, i) => (
                              <span key={i} className="tag-pill" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, color: C.textDim, background: C.cardBg, borderRadius: 6, padding: "2px 8px", fontWeight: 500, border: `1px solid ${C.border}` }}>{v}</span>
                            ))}
                          </div>
                          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, color: C.textFaint, marginTop: 5 }}>{new Date(row.created_at).toLocaleString()}</div>
                        </div>
                        <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center", gap: 6 }}>
                          <div style={{ padding: "3px 10px", background: c.bg, border: `1px solid ${c.border}`, color: c.text, borderRadius: 8, fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 800 }}>{row.condition}</div>
                          {row.staff_feedback && (
                            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, color: row.staff_feedback === "correct" ? C.green : "#d94040", fontWeight: 600 }}>
                              {row.staff_feedback === "correct" ? "✓ Correct" : "✗ Wrong"}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STATS TAB ── */}
        {tab === "stats" && (
          <div className="fu">
            <div style={{ background: C.cardBg, borderRadius: 20, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 4px 20px #00000030" }}>
              <CardHeader icon="📊" title="Part Stats" />
              <div style={{ padding: 18, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  { label: "Total Scans",    value: history.length,                                                                  icon: "🔍", color: C.green },
                  { label: "Good Condition", value: history.filter(h => h.condition === "Good").length,                              icon: "✅", color: "#5BBF2A" },
                  { label: "Fair Condition", value: history.filter(h => h.condition === "Fair").length,                              icon: "⚠️", color: "#e8a020" },
                  { label: "Worn Parts",     value: history.filter(h => h.condition === "Worn").length,                              icon: "🔧", color: "#e07828" },
                  { label: "Damaged",        value: history.filter(h => h.condition === "Damaged").length,                          icon: "❌", color: "#d94040" },
                  { label: "AI Accuracy",    value: history.filter(h=>h.staff_feedback).length > 0 ? `${Math.round(history.filter(h=>h.staff_feedback==="correct").length/history.filter(h=>h.staff_feedback).length*100)}%` : "—", icon: "🎯", color: C.green },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} style={{ background: C.cardDark, borderRadius: 14, padding: "16px 12px", textAlign: "center", border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 26, marginBottom: 7 }}>{icon}</div>
                    <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 24, fontWeight: 900, color }}>{value}</div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, color: C.textDim, marginTop: 4, fontWeight: 500, letterSpacing: 0.5 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 22, textAlign: "center" }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, color: C.textFaint, letterSpacing: 1.5 }}>BYOT Auto Parts · AI Parts Scanner · Texas · Louisiana · Mississippi</div>
        </div>
      </div>
    </div>
  );
}
