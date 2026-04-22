import { useState, useEffect, useRef } from "react";

const STATIONS = 4;

const STATION_LOCATIONS = [
  "Head to the blue lane near the water cooler on the North side of the promenade.",
  "Find the red lane section near the skate park entrance on the East side.",
  "Look for the green lane on the South-Western stretch — away from the crowd.",
  "Return to the open area near the relay zone. You've made it to the final station.",
];

const STATION_TASKS = [
  {
    name: "Memory Verse Sprint",
    emoji: "🏃",
    instruction: "One family member sprints 20m to the verse board, reads Titus 2:13, runs back, and recites it to the family from memory. Together, answer the question below.",
    quizType: "mcq",
    quizQuestion: "The Bible calls the rapture 'the blessed hope.' What makes it blessed rather than something to fear?",
    options: [
      "Because we've done enough good things to deserve it",
      "Because it depends on Jesus and what He accomplished — not us",
      "Because we've been faithful enough",
      "Because we've been going to church regularly",
    ],
    correctIndex: 1,
    takeaway: "Jesus is coming back for us — not because we were good enough, but because He loves us.",
  },
  {
    name: "Family Clue Card",
    emoji: "🧩",
    instruction: "Pass the clue card around — each family member reads it silently. No talking until everyone has read it. Then discuss together and answer the question.",
    quizType: "mcq",
    quizQuestion: "The clue card describes four things that will happen at the rapture. What event are they describing?",
    options: [
      "A dream about heaven",
      "The second coming judgment",
      "The rapture — Jesus returning for those He loves",
      "The end of the world",
    ],
    correctIndex: 2,
    clueCard: "He could return at any moment. In the twinkling of an eye, everything will change. Our bodies will be made new — no more sickness or pain. We will be with Him forever.",
    takeaway: "One day Jesus is coming back — and everything sad will come untrue.",
  },
  {
    name: "Human Knot",
    emoji: "🤝",
    instruction: "Stand in a circle. Everyone reach across and grab two different people's hands. Do NOT grab the hand of the person directly beside you. Untangle yourselves without letting go. Once you're in a clean circle — tap Task Done.",
    quizType: "mcq",
    quizQuestion: "Knowing Jesus could return at any moment — which best describes how we should live today?",
    options: [
      "Stressed and worried about whether we're ready",
      "Passive — just waiting for it to happen",
      "Intentional — loving people well and making every day count",
      "Focused on securing our own future first",
    ],
    correctIndex: 2,
    takeaway: "Because Jesus is coming back, every day matters. The people around us matter.",
  },
  {
    name: "Stillness Challenge",
    emoji: "✨",
    instruction: "Everyone stand still. One person reads this verse aloud slowly: \"Looking for the blessed hope and glorious appearing of our great God and Savior Jesus Christ.\" — Titus 2:13. Hold the stillness for 30 seconds. Tap Begin to start the timer.",
    quizType: "mcq",
    quizQuestion: "The rapture means we're not just waiting for an event — we're waiting for a Person. What difference does that make?",
    options: [
      "It means we should be more religious",
      "It means our hope is in Jesus Himself — not in circumstances or timing",
      "It means we need to work harder before He returns",
      "It means we should worry less about people around us",
    ],
    correctIndex: 1,
    hasTimer: true,
    timerSeconds: 30,
    takeaway: "We're not just waiting for something to happen. We're waiting for Jesus — and He's coming for us.",
  },
];

const C = {
  bg: "#0A0E1A",
  card: "#111827",
  gold: "#F5C842",
  goldDim: "#C8A030",
  accent: "#E84545",
  text: "#F0EDE6",
  textDim: "#8B8578",
  border: "#1E2A3A",
  success: "#22C55E",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${C.bg};color:${C.text};font-family:'DM Sans',sans-serif;min-height:100vh;overflow-x:hidden}
  .app{max-width:480px;margin:0 auto;min-height:100vh;position:relative}
  .screen{position:relative;z-index:1;padding:28px 20px;min-height:100vh}
  .hero{font-family:'Bebas Neue',sans-serif;font-size:72px;line-height:0.9;letter-spacing:2px;color:${C.gold};text-shadow:0 0 40px rgba(245,200,66,0.3)}
  .mono{font-family:'DM Mono',monospace}
  .label{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${C.textDim}}
  .gold-label{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${C.gold}}
  .verse-card{background:linear-gradient(135deg,#1A2235,#0F1520);border:1px solid ${C.gold}44;border-radius:16px;padding:24px;margin:24px 0;position:relative;overflow:hidden}
  .verse-card::before{content:'⚓';position:absolute;right:16px;top:16px;font-size:40px;opacity:0.1}
  .verse-text{font-size:15px;line-height:1.8;color:${C.text};font-style:italic}
  .verse-ref{font-family:'DM Mono',monospace;font-size:11px;color:${C.gold};letter-spacing:2px;margin-top:12px}
  .input{width:100%;background:#1A2235;border:1px solid ${C.border};border-radius:12px;padding:16px;color:${C.text};font-family:'DM Sans',sans-serif;font-size:18px;outline:none;transition:border-color 0.2s;-webkit-appearance:none}
  .input:focus{border-color:${C.gold}}
  .btn{width:100%;padding:18px;border-radius:14px;border:none;font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:2px;cursor:pointer;transition:all 0.2s;-webkit-tap-highlight-color:transparent}
  .btn-gold{background:${C.gold};color:#0A0E1A}
  .btn-gold:active{transform:scale(0.97);background:${C.goldDim}}
  .btn-ghost{background:transparent;border:1px solid ${C.border};color:${C.textDim};font-size:15px;font-family:'DM Sans',sans-serif;margin-top:12px}
  .btn-green{background:${C.success};color:white}
  .btn-sm{padding:9px 16px;border-radius:10px;font-size:13px;font-family:'DM Sans',sans-serif;width:auto}
  .badge{display:inline-flex;align-items:center;gap:8px;background:${C.gold}22;border:1px solid ${C.gold}44;border-radius:100px;padding:6px 16px;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:3px;color:${C.gold};text-transform:uppercase;margin-bottom:20px}
  .card{background:#111827;border:1px solid ${C.border};border-radius:20px;padding:24px;margin-bottom:20px}
  .clue-card{background:linear-gradient(135deg,#1A0A0A,#0A0E1A);border:2px solid ${C.accent};border-radius:20px;padding:28px;margin:20px 0}
  .clue-text{font-family:'Bebas Neue',sans-serif;font-size:30px;line-height:1.2;color:${C.text};letter-spacing:1px;margin-top:12px}
  .mcq{background:#1A2235;border:1px solid ${C.border};border-radius:12px;padding:16px 20px;margin-bottom:10px;cursor:pointer;font-size:15px;transition:all 0.15s;text-align:left;width:100%;color:${C.text};font-family:'DM Sans',sans-serif;-webkit-tap-highlight-color:transparent}
  .mcq:active{transform:scale(0.98)}
  .mcq.sel{border-color:${C.gold};background:${C.gold}11}
  .mcq.ok{border-color:${C.success};background:${C.success}11;color:${C.success}}
  .mcq.no{border-color:${C.accent};background:${C.accent}11;color:${C.accent}}
  .prog{height:4px;background:${C.border};border-radius:100px;margin-bottom:28px;overflow:hidden}
  .prog-fill{height:100%;background:linear-gradient(90deg,${C.gold},${C.accent});border-radius:100px;transition:width 0.5s ease}
  .lb-row{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:12px;margin-bottom:8px;background:#111827;border:1px solid ${C.border}}
  .lb-rank{font-family:'Bebas Neue',sans-serif;font-size:20px;color:${C.textDim};width:28px;text-align:center}
  .rank-1{color:${C.gold}} .rank-2{color:#C0C0C0} .rank-3{color:#CD7F32}
  .dot{width:10px;height:10px;border-radius:50%;background:${C.border}}
  .dot-on{background:${C.gold}} .dot-done{background:${C.success}}
  .err{background:${C.accent}22;border:1px solid ${C.accent}44;border-radius:10px;padding:12px 16px;font-size:14px;color:${C.accent};margin-top:12px;text-align:center}
  .clue-member{background:linear-gradient(135deg,#1A2235,#111827);border:1px solid ${C.gold}44;border-radius:14px;padding:20px;margin-bottom:12px}
  .unlock{background:linear-gradient(135deg,#0A1A0A,#0A0E1A);border:2px solid ${C.success};border-radius:20px;padding:32px 24px;text-align:center;margin:20px 0}
  .divider{height:1px;background:${C.border};margin:24px 0}
  .big-emoji{font-size:80px;margin-bottom:24px;display:block}
  @keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes popIn{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
  .fade{animation:fadeIn 0.4s ease forwards}
  .pop{animation:popIn 0.3s ease forwards}
  .pulse{animation:pulse 2s infinite}
`;

// API helpers
const api = {
  async getFamily(name) {
    const res = await fetch(`/api/family?name=${encodeURIComponent(name)}`);
    return res.json();
  },
  async updateFamily(name, updates) {
    const res = await fetch("/api/family", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, updates }),
    });
    return res.json();
  },
  async getLeaderboard() {
    const res = await fetch("/api/leaderboard");
    return res.json();
  },
};

export default function App() {
  const [screen, setScreen] = useState("home");
  const [familyName, setFamilyName] = useState("");
  const [familyData, setFamilyData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { leaderboard: lb } = await api.getLeaderboard();
      setLeaderboard(lb || []);
    } catch {}
  };

  useEffect(() => {
    if (screen === "leaderboard") loadLeaderboard();
  }, [screen]);

  const handleRegister = async () => {
    if (!familyName.trim()) { setError("Please enter your family name!"); return; }
    setLoading(true); setError("");
    try {
      const { family, error: err } = await api.getFamily(familyName.trim());
      if (err) { setError("Something went wrong. Try again."); setLoading(false); return; }
      setFamilyData(family);
      setScreen("race");
    } catch { setError("Cannot connect. Check your connection."); }
    setLoading(false);
  };

  const handleUpdate = async (updates) => {
    const { family } = await api.updateFamily(familyData.name, updates);
    setFamilyData(family);
  };

  if (screen === "home") return <Home name={familyName} setName={setFamilyName} onGo={handleRegister} loading={loading} error={error} onBoard={() => setScreen("leaderboard")} onAdmin={() => setScreen("admin")} />;
  if (screen === "leaderboard") return <Leaderboard data={leaderboard} onBack={() => setScreen(familyData ? "race" : "home")} onRefresh={loadLeaderboard} />;
  if (screen === "race") return <Race family={familyData} onUpdate={handleUpdate} onBoard={() => { loadLeaderboard(); setScreen("leaderboard"); }} />;
  if (screen === "admin") return <Admin />;
  return null;
}

function Home({ name, setName, onGo, loading, error, onBoard, onAdmin }) {
  return (
    <div className="app"><div className="screen">
      <div style={{ paddingTop: 40, marginBottom: 28 }}>
        <div className="label" style={{ marginBottom: 8 }}>NCC Care Group · May 1, 2026</div>
        <div className="hero">RUN<br />THE<br />RACE</div>
      </div>
      <div className="verse-card">
        <div className="verse-text">"Let us run with endurance the race that is set before us, looking to Jesus, the founder and perfecter of our faith."</div>
        <div className="verse-ref">— HEBREWS 12:1–2</div>
      </div>
      <div className="divider" />
      <div className="label" style={{ marginBottom: 12 }}>Enter Your Family Name</div>
      <input className="input" placeholder="e.g. The Tan Family" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && onGo()} style={{ marginBottom: 16 }} />
      {error && <div className="err">{error}</div>}
      <div style={{ marginTop: 20 }}>
        <button className="btn btn-gold" onClick={onGo} disabled={loading}>{loading ? "LOADING..." : "START THE RACE"}</button>
        <button className="btn btn-ghost" onClick={onBoard}>View Leaderboard</button>
      </div>
      <div style={{ textAlign: "center", marginTop: 28, color: C.textDim, fontSize: 13 }}>Already registered? Enter your family name to continue.</div>
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <button onClick={onAdmin} style={{ background: "none", border: "none", color: C.border, fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono', monospace", letterSpacing: 2 }}>ADMIN</button>
      </div>
    </div></div>
  );
}

function Race({ family, onUpdate, onBoard }) {
  const [phase, setPhase] = useState("clue");
  const [sel, setSel] = useState(null);
  const [txt, setTxt] = useState("");
  const [showErr, setShowErr] = useState(false);
  const [timerOn, setTimerOn] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerDone, setTimerDone] = useState(false);
  const timerRef = useRef(null);

  const idx = family.currentIndex;
  const stationNum = family.stationOrder[idx];
  const station = STATION_TASKS[stationNum - 1];
  const done = family.stationsComplete >= STATIONS;
  const pct = (family.stationsComplete / STATIONS) * 100;

  useEffect(() => {
    setPhase("clue"); setSel(null); setTxt(""); setShowErr(false);
    setTimerOn(false); setTimeLeft(30); setTimerDone(false);
  }, [idx]);

  useEffect(() => {
    if (timerOn && timeLeft > 0) { timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000); }
    else if (timerOn && timeLeft === 0) { setTimerDone(true); setTimerOn(false); }
    return () => clearTimeout(timerRef.current);
  }, [timerOn, timeLeft]);

  const checkAnswer = () => {
    let ok = false;
    if (station.quizType === "mcq") ok = sel === station.correctIndex;
    else ok = station.answerKeywords.some(kw => txt.toLowerCase().includes(kw));
    if (ok) setPhase("correct");
    else { setShowErr(true); setSel(null); }
  };

  const next = async () => {
    const updates = {
      stationsComplete: family.stationsComplete + 1,
      currentIndex: idx + 1,
      completedStations: [...family.completedStations, stationNum],
    };
    await onUpdate(updates);
    setPhase("clue");
  };

  if (done) return (
    <div className="app"><div className="screen">
      <div className="pop" style={{ textAlign: "center", paddingTop: 40 }}>
        <span className="big-emoji">🏁</span>
        <div className="hero" style={{ fontSize: 56, marginBottom: 16 }}>YOU<br />MADE IT</div>
        <p style={{ color: C.textDim, fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>Your family has completed all stations. Head to the relay zone now!</p>
        <div className="unlock">
          <div className="gold-label">Relay Entry Code</div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 44, color: C.success, letterSpacing: 8, margin: "16px 0" }}>RUN25</div>
          <div style={{ fontSize: 13, color: C.textDim }}>Show this to the Relay IC to enter the final race</div>
        </div>
        <div className="verse-card"><div className="verse-text">"You've held the Word. Now run with it."</div></div>
        <button className="btn btn-ghost" onClick={onBoard} style={{ marginTop: 20 }}>View Leaderboard</button>
      </div>
    </div></div>
  );

  return (
    <div className="app"><div className="screen">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div className="label">{family.name}</div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: C.gold, letterSpacing: 2 }}>{family.stationsComplete}/{STATIONS} STATIONS</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onBoard}>Board</button>
      </div>
      <div className="prog"><div className="prog-fill" style={{ width: `${pct}%` }} /></div>

      {phase === "clue" && (
        <div className="fade">
          <div className="badge">📍 Station {stationNum}</div>
          <div className="clue-card">
            <div className="gold-label">📦 Your Next Clue</div>
            <div className="clue-text">{STATION_LOCATIONS[stationNum - 1]}</div>
          </div>
          <p style={{ color: C.textDim, fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>Make your way to this location as a family. When you arrive, tap below to reveal your task.</p>
          <button className="btn btn-gold" onClick={() => setPhase("task")}>WE'RE HERE — REVEAL TASK</button>
        </div>
      )}

      {phase === "task" && (
        <div className="fade">
          <div className="badge">⚡ Task — Station {stationNum}</div>
          <div className="card">
            <span style={{ fontSize: 40, marginBottom: 12, display: "block" }}>{station.emoji}</span>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: C.gold, letterSpacing: 1, marginBottom: 12 }}>{station.name}</div>
            <div style={{ fontSize: 15, lineHeight: 1.7 }}>{station.instruction}</div>
          </div>

          {station.clueCard && (
            <div style={{ marginBottom: 20 }}>
              <div className="label" style={{ marginBottom: 12 }}>📇 Clue Card — Pass Around</div>
              <div className="clue-member">
                <div className="gold-label" style={{ marginBottom: 8 }}>Read silently. No talking until everyone has read it.</div>
                <div style={{ fontSize: 16, lineHeight: 1.8, fontStyle: "italic" }}>{station.clueCard}</div>
              </div>
              <div style={{ fontSize: 13, color: C.textDim, marginTop: 8, textAlign: "center" }}>Pass the phone around — each person reads in silence.</div>
            </div>
          )}

          {station.hasTimer ? (
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              {!timerOn && !timerDone && <button className="btn btn-gold" onClick={() => setTimerOn(true)}>BEGIN — START TIMER</button>}
              {timerOn && (
                <div>
                  <svg width="120" height="120" viewBox="0 0 120 120" style={{ margin: "20px auto", display: "block" }}>
                    <circle cx="60" cy="60" r="54" fill="none" stroke={C.border} strokeWidth="8" />
                    <circle cx="60" cy="60" r="54" fill="none" stroke={C.gold} strokeWidth="8"
                      strokeDasharray="339.3" strokeDashoffset={339.3 * (1 - timeLeft / 30)}
                      strokeLinecap="round" transform="rotate(-90 60 60)"
                      style={{ transition: "stroke-dashoffset 1s linear" }} />
                    <text x="60" y="68" textAnchor="middle" fill={C.gold} fontFamily="'Bebas Neue',sans-serif" fontSize="32">{timeLeft}</text>
                  </svg>
                  <div className="label pulse">Stay still... hold the Word...</div>
                </div>
              )}
              {timerDone && <button className="btn btn-green" onClick={() => setPhase("quiz")}>TIMER DONE — ANSWER QUIZ</button>}
            </div>
          ) : (
            <button className="btn btn-green" onClick={() => setPhase("quiz")}>TASK DONE — ANSWER QUIZ</button>
          )}
        </div>
      )}

      {phase === "quiz" && (
        <div className="fade">
          <div className="badge">❓ Quiz — Station {stationNum}</div>
          <div className="card">
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, lineHeight: 1.5 }}>{station.quizQuestion}</div>
            {station.quizType === "mcq"
              ? station.options.map((opt, i) => (
                <button key={i} className={`mcq ${sel === i ? "sel" : ""}`} onClick={() => { setSel(i); setShowErr(false); }}>{opt}</button>
              ))
              : <input className="input" placeholder="Type your answer..." value={txt} onChange={e => { setTxt(e.target.value); setShowErr(false); }} style={{ marginBottom: 16 }} />
            }
            {showErr && <div className="err">Not quite! {station.hint || "Try again as a family."} 🙏</div>}
          </div>
          <button className="btn btn-gold" onClick={checkAnswer} disabled={station.quizType === "mcq" ? sel === null : !txt.trim()}>SUBMIT ANSWER</button>
        </div>
      )}

      {phase === "correct" && (
        <div className="pop" style={{ textAlign: "center", padding: "20px 0" }}>
          <span className="big-emoji">✅</span>
          <div className="hero" style={{ fontSize: 48 }}>CORRECT!</div>
          {station.takeaway && (
            <div style={{ background: "#1A2235", border: "1px solid #F5C84244", borderRadius: 14, padding: "16px 20px", margin: "16px 0 20px", textAlign: "left" }}>
              <div className="gold-label" style={{ marginBottom: 8 }}>💛 Take this home</div>
              <div style={{ fontSize: 15, lineHeight: 1.7, fontStyle: "italic" }}>{station.takeaway}</div>
            </div>
          )}
          <p style={{ color: C.textDim, margin: "0 0 28px", fontSize: 15, lineHeight: 1.7 }}>
            {idx < STATIONS - 1 ? "Your next clue is ready. Keep running!" : "Final station done! Head to the relay zone!"}
          </p>
          <button className="btn btn-gold" onClick={next}>{idx < STATIONS - 1 ? "GET NEXT CLUE →" : "UNLOCK THE RELAY 🏁"}</button>
        </div>
      )}
    </div></div>
  );
}

function Leaderboard({ data, onBack, onRefresh }) {
  return (
    <div className="app"><div className="screen">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div className="hero" style={{ fontSize: 52 }}>BOARD</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={onRefresh}>Refresh</button>
          <button className="btn btn-ghost btn-sm" onClick={onBack}>Back</button>
        </div>
      </div>
      <div className="label" style={{ marginBottom: 16 }}>{data.length} families registered</div>

      {data.length === 0 && <div style={{ textAlign: "center", color: C.textDim, padding: 40, fontSize: 15 }}>No families yet. Be the first! 🏁</div>}

      {data.map((f, i) => (
        <div key={f.name} className="lb-row fade" style={{ animationDelay: `${i * 0.05}s` }}>
          <div className={`lb-rank ${i === 0 ? "rank-1" : i === 1 ? "rank-2" : i === 2 ? "rank-3" : ""}`}>{i + 1}</div>
          <div style={{ flex: 1, fontSize: 16, fontWeight: 500 }}>{f.name}</div>
          <div style={{ display: "flex", gap: 4 }}>
            {Array.from({ length: STATIONS }).map((_, j) => (
              <div key={j} className={`dot ${j < f.stationsComplete ? (f.stationsComplete >= STATIONS ? "dot-done" : "dot-on") : ""}`} />
            ))}
          </div>
          {f.stationsComplete >= STATIONS && <span style={{ fontSize: 18 }}>🏁</span>}
        </div>
      ))}

      <div className="verse-card" style={{ marginTop: 32 }}>
        <div className="verse-text">"Let us run with endurance the race that is set before us."</div>
        <div className="verse-ref">— HEBREWS 12:1</div>
      </div>
    </div></div>
  );
}

function Admin() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const login = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin", { headers: { "x-admin-password": password } });
      if (res.status === 401) { setError("Wrong password."); setLoading(false); return; }
      const { families: f } = await res.json();
      setFamilies(f || []);
      setAuthed(true);
    } catch { setError("Connection error."); }
    setLoading(false);
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin", { headers: { "x-admin-password": password } });
      const { families: f } = await res.json();
      setFamilies(f || []);
    } catch {}
    setLoading(false);
  };

  const deleteFamily = async (key, name) => {
    setDeleting(key);
    try {
      await fetch("/api/admin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ key }),
      });
      setFamilies(f => f.filter(f => f.key !== key));
    } catch {}
    setDeleting(null);
  };

  const resetAll = async () => {
    setLoading(true);
    try {
      await Promise.all(families.map(f =>
        fetch("/api/admin", {
          method: "DELETE",
          headers: { "Content-Type": "application/json", "x-admin-password": password },
          body: JSON.stringify({ key: f.key }),
        })
      ));
      setFamilies([]);
      setConfirmReset(false);
    } catch {}
    setLoading(false);
  };

  if (!authed) return (
    <div className="app"><div className="screen">
      <div style={{ paddingTop: 60, marginBottom: 32 }}>
        <div className="label" style={{ marginBottom: 8 }}>Admin Access</div>
        <div className="hero" style={{ fontSize: 52 }}>ADMIN</div>
      </div>
      <div className="label" style={{ marginBottom: 12 }}>Password</div>
      <input
        className="input" type="password" placeholder="Enter admin password"
        value={password} onChange={e => setPassword(e.target.value)}
        onKeyDown={e => e.key === "Enter" && login()}
        style={{ marginBottom: 16 }}
      />
      {error && <div className="err">{error}</div>}
      <div style={{ marginTop: 20 }}>
        <button className="btn btn-gold" onClick={login} disabled={loading}>
          {loading ? "CHECKING..." : "LOGIN"}
        </button>
      </div>
    </div></div>
  );

  return (
    <div className="app"><div className="screen">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <div className="label">Admin Panel</div>
          <div className="hero" style={{ fontSize: 40 }}>FAMILIES</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={refresh} disabled={loading}>Refresh</button>
        </div>
      </div>

      <div className="label" style={{ marginBottom: 16 }}>{families.length} families registered</div>

      {families.length === 0 && (
        <div style={{ textAlign: "center", color: C.textDim, padding: 40, fontSize: 15 }}>No families registered yet.</div>
      )}

      {families.map((f) => (
        <div key={f.key} className="lb-row" style={{ marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{f.data.name}</div>
            <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
              {f.data.stationsComplete}/{STATIONS} stations
              {f.data.stationsComplete >= STATIONS ? " 🏁" : ""}
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, marginRight: 12 }}>
            {Array.from({ length: STATIONS }).map((_, j) => (
              <div key={j} className={`dot ${j < f.data.stationsComplete ? (f.data.stationsComplete >= STATIONS ? "dot-done" : "dot-on") : ""}`} />
            ))}
          </div>
          <button
            onClick={() => deleteFamily(f.key, f.data.name)}
            disabled={deleting === f.key}
            style={{
              background: deleting === f.key ? C.border : "#2A0A0A",
              border: `1px solid ${C.accent}`,
              borderRadius: 8, padding: "6px 12px",
              color: C.accent, fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer", whiteSpace: "nowrap"
            }}>
            {deleting === f.key ? "..." : "Reset"}
          </button>
        </div>
      ))}

      {families.length > 0 && (
        <div style={{ marginTop: 32 }}>
          {!confirmReset ? (
            <button className="btn btn-ghost" onClick={() => setConfirmReset(true)} style={{ color: C.accent, borderColor: C.accent }}>
              Reset All Families
            </button>
          ) : (
            <div>
              <div style={{ textAlign: "center", color: C.accent, marginBottom: 16, fontSize: 14 }}>
                This will delete ALL families. Are you sure?
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setConfirmReset(false)}>Cancel</button>
                <button
                  className="btn btn-sm"
                  style={{ flex: 1, background: C.accent, color: "white", border: "none", borderRadius: 14, cursor: "pointer" }}
                  onClick={resetAll} disabled={loading}>
                  {loading ? "Deleting..." : "Yes, Reset All"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div></div>
  );
}
