import { useState, useEffect, useRef } from "react";

const STATIONS = 4;
const TEAM_NAMES = ["Eagles", "Lions", "Bears", "Hawks"];
const TEAM_COLORS = ["#E84545", "#F5C842", "#22C55E", "#3B82F6"];
const TEAM_EMOJIS = ["🦅", "🦁", "🐻", "🦅"];
const TEAM_ICONS = ["🦅", "🦁", "🐻", "🦆"];

const STATION_LOCATIONS = [
  "Head to the promenade near Gate 19. Look for the orange cone marker on the left side of the concourse.",
  "Find the station near Gate 18. Look for the blue cone marker against the stadium wall.",
  "Head to the stretch between Gates 18 and 19 — middle section. Look for the green cone marker.",
  "Return to the open area near Gate 19 — final station. Look for the red cone marker.",
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
    instruction: "Pass the phone around — each family member reads the clue below silently. No talking until everyone has read it. Then discuss together and answer the question.",
    quizType: "mcq",
    quizQuestion: "The clue describes four things that will happen at the rapture. What event is being described?",
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
  bg: "#0A0E1A", card: "#111827", gold: "#F5C842", goldDim: "#C8A030",
  accent: "#E84545", text: "#F0EDE6", textDim: "#8B8578", border: "#1E2A3A", success: "#22C55E",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${C.bg};color:${C.text};font-family:'DM Sans',sans-serif;min-height:100vh;overflow-x:hidden}
  .app{max-width:480px;margin:0 auto;min-height:100vh}
  .screen{padding:28px 20px;min-height:100vh}
  .hero{font-family:'Bebas Neue',sans-serif;font-size:72px;line-height:0.9;letter-spacing:2px;color:${C.gold};text-shadow:0 0 40px rgba(245,200,66,0.3)}
  .mono{font-family:'DM Mono',monospace}
  .label{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${C.textDim}}
  .gold-label{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${C.gold}}
  .verse-card{background:linear-gradient(135deg,#1A2235,#0F1520);border:1px solid ${C.gold}44;border-radius:16px;padding:24px;margin:24px 0;position:relative;overflow:hidden}
  .verse-card::before{content:'✨';position:absolute;right:16px;top:16px;font-size:40px;opacity:0.1}
  .verse-text{font-size:15px;line-height:1.8;color:${C.text};font-style:italic}
  .verse-ref{font-family:'DM Mono',monospace;font-size:11px;color:${C.gold};letter-spacing:2px;margin-top:12px}
  .input{width:100%;background:#1A2235;border:1px solid ${C.border};border-radius:12px;padding:14px 16px;color:${C.text};font-family:'DM Sans',sans-serif;font-size:16px;outline:none;transition:border-color 0.2s;-webkit-appearance:none}
  .input:focus{border-color:${C.gold}}
  .btn{width:100%;padding:18px;border-radius:14px;border:none;font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:2px;cursor:pointer;transition:all 0.2s;-webkit-tap-highlight-color:transparent}
  .btn-gold{background:${C.gold};color:#0A0E1A}
  .btn-gold:active{transform:scale(0.97);background:${C.goldDim}}
  .btn-ghost{background:transparent;border:1px solid ${C.border};color:${C.textDim};font-size:15px;font-family:'DM Sans',sans-serif;margin-top:12px}
  .btn-green{background:${C.success};color:white}
  .btn-red{background:${C.accent};color:white;border:none}
  .btn-sm{padding:9px 16px;border-radius:10px;font-size:13px;font-family:'DM Sans',sans-serif;width:auto}
  .badge{display:inline-flex;align-items:center;gap:8px;background:${C.gold}22;border:1px solid ${C.gold}44;border-radius:100px;padding:6px 16px;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:3px;color:${C.gold};text-transform:uppercase;margin-bottom:20px}
  .card{background:#111827;border:1px solid ${C.border};border-radius:20px;padding:24px;margin-bottom:20px}
  .clue-card{background:linear-gradient(135deg,#1A0A0A,#0A0E1A);border:2px solid ${C.accent};border-radius:20px;padding:28px;margin:20px 0}
  .clue-text{font-family:'Bebas Neue',sans-serif;font-size:30px;line-height:1.2;color:${C.text};letter-spacing:1px;margin-top:12px}
  .mcq{background:#1A2235;border:1px solid ${C.border};border-radius:12px;padding:16px 20px;margin-bottom:10px;cursor:pointer;font-size:15px;transition:all 0.15s;text-align:left;width:100%;color:${C.text};font-family:'DM Sans',sans-serif;-webkit-tap-highlight-color:transparent}
  .mcq:active{transform:scale(0.98)}
  .mcq.sel{border-color:${C.gold};background:${C.gold}11}
  .prog{height:4px;background:${C.border};border-radius:100px;margin-bottom:28px;overflow:hidden}
  .prog-fill{height:100%;background:linear-gradient(90deg,${C.gold},${C.accent});border-radius:100px;transition:width 0.5s ease}
  .lb-row{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:12px;margin-bottom:8px;background:#111827;border:1px solid ${C.border}}
  .dot{width:10px;height:10px;border-radius:50%;background:${C.border}}
  .dot-on{background:${C.gold}} .dot-done{background:${C.success}}
  .err{background:${C.accent}22;border:1px solid ${C.accent}44;border-radius:10px;padding:12px 16px;font-size:14px;color:${C.accent};margin-top:12px;text-align:center}
  .clue-member{background:linear-gradient(135deg,#1A2235,#111827);border:1px solid ${C.gold}44;border-radius:14px;padding:20px;margin-bottom:12px}
  .divider{height:1px;background:${C.border};margin:24px 0}
  .big-emoji{font-size:72px;margin-bottom:16px;display:block;text-align:center}
  .member-row{display:flex;align-items:center;gap:10px;background:#1A2235;border:1px solid ${C.border};border-radius:12px;padding:12px 16px;margin-bottom:8px}
  .checkbox{width:20px;height:20px;border-radius:6px;border:2px solid ${C.border};background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.15s}
  .checkbox.checked{background:${C.gold};border-color:${C.gold}}
  .team-card{border-radius:20px;padding:24px;margin-bottom:16px;border:2px solid}
  .team-member-chip{display:inline-flex;align-items:center;background:#ffffff11;border-radius:100px;padding:4px 12px;font-size:13px;margin:4px}
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
  async getTeams() {
    const res = await fetch("/api/teams");
    return res.json();
  },
};

// Estimated total relay time for a team. Mirrors api/teams.js legTime():
// adult = 1 unit, kid age N = max(1, 13 - N). Used in the UI to show the
// fairness signal — all teams should have nearly equal totals.
function teamRaceTime(team) {
  return team.reduce((s, m) => {
    const age = parseInt(m.age);
    const isKid = m.age && age <= 12;
    return s + (isKid ? Math.max(1, 13 - age) : 1);
  }, 0);
}

// Team balancing algorithm
function assignTeam(existingTeams, newMembers) {
  // existingTeams: array of 4 arrays of members
  // newMembers: array of {name, age, relay} objects
  // Kids only for age balancing, adults balanced by count
  
  const kids = newMembers.filter(m => m.age && parseInt(m.age) < 18 && m.relay);
  const adults = newMembers.filter(m => (!m.age || parseInt(m.age) >= 18) && m.relay);

  // Score each team — lower is better (more room)
  const scores = existingTeams.map((team, i) => {
    const teamKids = team.filter(m => m.age && parseInt(m.age) < 18);
    const teamAdults = team.filter(m => !m.age || parseInt(m.age) >= 18);
    const avgKidAge = teamKids.length ? teamKids.reduce((s, m) => s + parseInt(m.age), 0) / teamKids.length : 0;
    return { index: i, kidCount: teamKids.length, adultCount: teamAdults.length, avgAge: avgKidAge };
  });

  // Find team with fewest kids first, then fewest adults as tiebreaker
  scores.sort((a, b) => a.kidCount - b.kidCount || a.adultCount - b.adultCount);
  return scores[0].index;
}

const STORAGE_KEY = "rtr.familyName";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [familyName, setFamilyName] = useState("");
  const [familyData, setFamilyData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [teams, setTeams] = useState([[], [], [], []]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) { setRestoring(false); return; }
    api.getFamily(stored)
      .then(({ family }) => {
        if (family?.members?.length > 0) {
          setFamilyName(stored);
          setFamilyData(family);
          setScreen("race");
        } else if (family) {
          setFamilyName(stored);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      })
      .catch(() => {})
      .finally(() => setRestoring(false));
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { leaderboard: lb } = await api.getLeaderboard();
      setLeaderboard(lb || []);
    } catch {}
  };

  const loadTeams = async () => {
    try {
      const { teams: t } = await api.getTeams();
      if (t) setTeams(t);
    } catch {}
  };

  useEffect(() => {
    if (screen === "leaderboard") { loadLeaderboard(); loadTeams(); }
  }, [screen]);

  const handleRegister = async (members) => {
    setLoading(true); setError("");
    try {
      const name = familyName.trim();
      const { family, error: err } = await api.getFamily(name);
      if (err) { setError("Something went wrong. Try again."); setLoading(false); return; }
      // Returning family — don't overwrite their members
      if (family?.members?.length > 0) {
        setFamilyData(family);
        localStorage.setItem(STORAGE_KEY, name);
        setScreen("race");
        setLoading(false);
        return;
      }
      // New family — attach members
      const { family: updated } = await api.updateFamily(name, { members });
      setFamilyData(updated);
      localStorage.setItem(STORAGE_KEY, name);
      setScreen("race");
    } catch { setError("Connection error. Check your connection."); }
    setLoading(false);
  };

  const handleUpdate = async (updates) => {
    const { family } = await api.updateFamily(familyData.name, updates);
    setFamilyData(family);
  };

  const handleExit = () => {
    localStorage.removeItem(STORAGE_KEY);
    setFamilyData(null);
    setFamilyName("");
    setScreen("home");
  };

  if (restoring) return null;

  const showAdminFab = screen !== "admin" && screen !== "register";
  const adminFab = showAdminFab ? <AdminFab onClick={() => setScreen("admin")} /> : null;

  if (screen === "home") return <><Home name={familyName} setName={setFamilyName} onNext={() => setScreen("register")} onBoard={() => setScreen("leaderboard")} onAdmin={() => setScreen("admin")} />{adminFab}</>;
  if (screen === "register") return <Register familyName={familyName} onSubmit={handleRegister} loading={loading} error={error} onBack={() => setScreen("home")} />;
  if (screen === "race") return <><Race family={familyData} onUpdate={handleUpdate} onBoard={() => { loadLeaderboard(); loadTeams(); setScreen("leaderboard"); }} onExit={handleExit} />{adminFab}</>;
  if (screen === "leaderboard") return <><Leaderboard data={leaderboard} teams={teams} onBack={() => setScreen(familyData ? "race" : "home")} onRefresh={() => { loadLeaderboard(); loadTeams(); }} />{adminFab}</>;
  if (screen === "admin") return <Admin onExit={() => setScreen("home")} />;
  return null;
}

function AdminFab({ onClick }) {
  return (
    <button onClick={onClick} style={{
      position: "fixed", bottom: 16, right: 16, zIndex: 1000,
      background: C.card, border: `1px solid ${C.border}`, color: C.textDim,
      borderRadius: 100, padding: "8px 14px", fontSize: 11, letterSpacing: 2,
      fontFamily: "'DM Mono', monospace", cursor: "pointer",
      boxShadow: "0 4px 12px rgba(0,0,0,0.4)", textTransform: "uppercase",
    }}>Admin</button>
  );
}

function Home({ name, setName, onNext, onBoard, onAdmin }) {
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
      <input className="input" placeholder="e.g. The Tan Family" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && name.trim() && onNext()} style={{ marginBottom: 16 }} />
      <div style={{ marginTop: 20 }}>
        <button className="btn btn-gold" onClick={onNext} disabled={!name.trim()}>NEXT →</button>
        <button className="btn btn-ghost" onClick={onBoard}>View Leaderboard & Teams</button>
      </div>
      <div style={{ textAlign: "center", marginTop: 28, color: C.textDim, fontSize: 13 }}>Already registered? Enter your family name to continue.</div>
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <button onClick={onAdmin} style={{ background: "none", border: "none", color: C.border, fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono', monospace", letterSpacing: 2 }}>ADMIN</button>
      </div>
    </div></div>
  );
}

function Register({ familyName, onSubmit, loading, error, onBack }) {
  const [members, setMembers] = useState([{ name: "", age: "", isAdult: false, relay: true }]);

  const addMember = () => setMembers(m => [...m, { name: "", age: "", isAdult: false, relay: true }]);
  const removeMember = (i) => setMembers(m => m.filter((_, idx) => idx !== i));
  const updateMember = (i, field, value) => setMembers(m => m.map((mem, idx) => idx === i ? { ...mem, [field]: value } : mem));

  const canSubmit = members.every(m => m.name.trim()) && members.length > 0;

  return (
    <div className="app"><div className="screen">
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif", marginBottom: 20 }}>← Back</button>
      <div className="label" style={{ marginBottom: 8 }}>Step 2 of 2</div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: C.gold, marginBottom: 8 }}>{familyName}</div>
      <div style={{ color: C.textDim, fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
        Add each family member below. Only add names if you would like to <strong style={{ color: C.text }}>participate in the final relay</strong>. Enter age for kids only — leave blank for adults.
      </div>

      {members.map((member, i) => (
        <div key={i} className="member-row fade" style={{ animationDelay: `${i * 0.05}s` }}>
          <div style={{ flex: 1 }}>
            <input
              className="input"
              placeholder={`Member ${i + 1} name`}
              value={member.name}
              onChange={e => updateMember(i, "name", e.target.value)}
              style={{ marginBottom: 8, padding: "10px 14px", fontSize: 15 }}
            />
            <input
              className="input"
              placeholder="Age (kids only, leave blank for adults)"
              value={member.age}
              onChange={e => updateMember(i, "age", e.target.value)}
              type="number"
              style={{ padding: "10px 14px", fontSize: 15 }}
            />
          </div>
          {members.length > 1 && (
            <button onClick={() => removeMember(i)} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 20, padding: "0 4px" }}>×</button>
          )}
        </div>
      ))}

      <button onClick={addMember} style={{ background: "none", border: `1px dashed ${C.border}`, borderRadius: 12, padding: "12px 20px", color: C.textDim, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif", width: "100%", marginTop: 8, marginBottom: 24 }}>
        + Add Family Member
      </button>

      {error && <div className="err">{error}</div>}

      <button className="btn btn-gold" onClick={() => onSubmit(members)} disabled={!canSubmit || loading}>
        {loading ? "REGISTERING..." : "START THE RACE 🏁"}
      </button>
    </div></div>
  );
}

function Race({ family, onUpdate, onBoard, onExit }) {
  const [phase, setPhase] = useState("clue");
  const [sel, setSel] = useState(null);
  const [showErr, setShowErr] = useState(false);
  const [timerOn, setTimerOn] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerDone, setTimerDone] = useState(false);
  const timerRef = useRef(null);

  const idx = family.currentIndex || 0;
  const stationNum = (family.stationOrder || [1,2,3,4])[idx];
  const station = STATION_TASKS[stationNum - 1];
  const done = (family.stationsComplete || 0) >= STATIONS;
  const pct = ((family.stationsComplete || 0) / STATIONS) * 100;

  useEffect(() => {
    setPhase("clue"); setSel(null); setShowErr(false);
    setTimerOn(false); setTimeLeft(30); setTimerDone(false);
  }, [idx]);

  useEffect(() => {
    if (timerOn && timeLeft > 0) { timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000); }
    else if (timerOn && timeLeft === 0) { setTimerDone(true); setTimerOn(false); }
    return () => clearTimeout(timerRef.current);
  }, [timerOn, timeLeft]);

  const checkAnswer = () => {
    if (sel === station.correctIndex) setPhase("correct");
    else { setShowErr(true); setSel(null); }
  };

  const next = async () => {
    const newComplete = (family.stationsComplete || 0) + 1;
    const updates = {
      stationsComplete: newComplete,
      currentIndex: idx + 1,
      completedStations: [...(family.completedStations || []), stationNum],
    };
    await onUpdate(updates);
    setPhase("clue");
  };

  if (done) return <CompletionScreen family={family} onBoard={onBoard} />;

  return (
    <div className="app"><div className="screen">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div className="label">{family.name}</div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: C.gold, letterSpacing: 2 }}>{family.stationsComplete || 0}/{STATIONS} STATIONS</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => { if (window.confirm("Exit race and return to home? You can rejoin by entering your family name.")) onExit(); }}>Exit</button>
          <button className="btn btn-ghost btn-sm" onClick={onBoard}>Teams</button>
        </div>
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
            {station.options.map((opt, i) => (
              <button key={i} className={`mcq ${sel === i ? "sel" : ""}`} onClick={() => { setSel(i); setShowErr(false); }}>{opt}</button>
            ))}
            {showErr && <div className="err">Not quite! Try again as a family. 🙏</div>}
          </div>
          <button className="btn btn-gold" onClick={checkAnswer} disabled={sel === null}>SUBMIT ANSWER</button>
        </div>
      )}

      {phase === "correct" && (
        <div className="pop" style={{ textAlign: "center", padding: "20px 0" }}>
          <span className="big-emoji">✅</span>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, color: C.gold }}>CORRECT!</div>
          {station.takeaway && (
            <div style={{ background: "#1A2235", border: `1px solid ${C.gold}44`, borderRadius: 14, padding: "16px 20px", margin: "20px 0", textAlign: "left" }}>
              <div className="gold-label" style={{ marginBottom: 8 }}>💛 Take this home</div>
              <div style={{ fontSize: 15, lineHeight: 1.7, fontStyle: "italic" }}>{station.takeaway}</div>
            </div>
          )}
          <p style={{ color: C.textDim, margin: "0 0 28px", fontSize: 15, lineHeight: 1.7 }}>
            {idx < STATIONS - 1 ? "Your next clue is ready. Keep running!" : "Final station done!"}
          </p>
          <button className="btn btn-gold" onClick={next}>{idx < STATIONS - 1 ? "GET NEXT CLUE →" : "SEE YOUR TEAM 🏁"}</button>
        </div>
      )}
    </div></div>
  );
}

function CompletionScreen({ family, onBoard }) {
  const teamIndex = family.teamIndex !== undefined ? family.teamIndex : null;
  const teamName = teamIndex !== null ? TEAM_NAMES[teamIndex] : null;
  const teamColor = teamIndex !== null ? TEAM_COLORS[teamIndex] : C.gold;
  const teamIcon = teamIndex !== null ? TEAM_ICONS[teamIndex] : "🏁";

  return (
    <div className="app"><div className="screen">
      <div className="pop" style={{ textAlign: "center", paddingTop: 32 }}>
        <span className="big-emoji">{teamIcon}</span>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: C.textDim, letterSpacing: 3, marginBottom: 8 }}>YOU'RE IN TEAM</div>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 64, color: teamColor, lineHeight: 1, marginBottom: 24, textShadow: `0 0 40px ${teamColor}66` }}>{teamName || "..."}</div>

        {teamIndex !== null && (
          <div style={{ background: `${teamColor}11`, border: `2px solid ${teamColor}44`, borderRadius: 20, padding: 24, marginBottom: 24, textAlign: "left" }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: 3, color: teamColor, textTransform: "uppercase", marginBottom: 12 }}>Your Relay Team</div>
            <div style={{ color: C.textDim, fontSize: 13, marginBottom: 8 }}>Check the leaderboard to see your full team as more families finish.</div>
          </div>
        )}

        <div className="verse-card" style={{ marginBottom: 24 }}>
          <div className="verse-text">"You've held the Word. Now run with it."</div>
        </div>

        <button className="btn btn-gold" onClick={onBoard}>VIEW TEAMS & LEADERBOARD</button>
      </div>
    </div></div>
  );
}

function Leaderboard({ data, teams, onBack, onRefresh }) {
  const [tab, setTab] = useState("teams");

  return (
    <div className="app"><div className="screen">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 40, color: C.gold }}>
          {tab === "teams" ? "TEAMS" : "RACE"}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={onRefresh}>Refresh</button>
          <button className="btn btn-ghost btn-sm" onClick={onBack}>Back</button>
        </div>
      </div>

      <div style={{ display: "flex", background: "#111827", borderRadius: 14, padding: 4, marginBottom: 24, border: `1px solid ${C.border}` }}>
        {["teams", "race"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "10px", borderRadius: 10, border: "none",
            background: tab === t ? C.gold : "transparent",
            color: tab === t ? "#0A0E1A" : C.textDim,
            fontFamily: "'DM Sans',sans-serif", fontSize: 14,
            fontWeight: tab === t ? 600 : 400, cursor: "pointer"
          }}>{t === "teams" ? "Teams" : "Leaderboard"}</button>
        ))}
      </div>

      {tab === "teams" && (
        <div>
          <div style={{ background: "#111827", border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 20px", marginBottom: 20 }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: C.gold, letterSpacing: 2, marginBottom: 10 }}>HOW TEAMS ARE FORMED</div>
            <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.7 }}>
              Every team should finish the relay in about the same total time.
              <ul style={{ paddingLeft: 18, margin: "8px 0" }}>
                <li>Adults &amp; older kids run a leg quickly</li>
                <li>Younger kids take longer per leg</li>
                <li>Families always stay together — never split</li>
              </ul>
              That's why <span style={{ color: C.text }}>smaller teams have more young kids</span> (fewer but slower runners) and <span style={{ color: C.text }}>bigger teams have more adults</span> (more but faster runners).
              <div style={{ marginTop: 10, color: C.gold, fontSize: 12 }}>👇 Check the <strong>RACE TIME</strong> on each team — they should be nearly equal. That's the fairness check.</div>
            </div>
          </div>
          {TEAM_NAMES.map((name, i) => {
            const team = teams[i] || [];
            const color = TEAM_COLORS[i];
            const icon = TEAM_ICONS[i];
            const raceTime = teamRaceTime(team);
            return (
              <div key={i} className="team-card fade" style={{ borderColor: `${color}44`, background: `${color}08`, animationDelay: `${i * 0.1}s` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 32 }}>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color, letterSpacing: 1 }}>{name}</div>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: C.textDim, letterSpacing: 2 }}>{team.length} RELAY MEMBERS</div>
                  </div>
                  {team.length > 0 && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: C.textDim, letterSpacing: 2 }}>RACE TIME</div>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color, letterSpacing: 1 }}>{raceTime}</div>
                    </div>
                  )}
                </div>
                {team.length === 0 ? (
                  <div style={{ color: C.textDim, fontSize: 13 }}>Waiting for families to finish...</div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {team.map((m, j) => (
                      <div key={j} className="team-member-chip" style={{ color }}>
                        {m.name}{m.age ? ` (${m.age})` : ""}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div style={{ marginTop: 16, padding: "16px 20px", background: "#111827", borderRadius: 14, border: `1px solid ${C.border}` }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: C.gold, letterSpacing: 2, marginBottom: 8 }}>SEMI FINALS</div>
            <div style={{ fontSize: 14, color: C.textDim, lineHeight: 1.8 }}>
              🦅 Eagles vs 🦁 Lions<br />
              🐻 Bears vs 🦆 Hawks<br />
              <span style={{ color: C.gold, marginTop: 4, display: "block" }}>Winners meet in the Final 🏆</span>
            </div>
          </div>
        </div>
      )}

      {tab === "race" && (
        <div>
          <div className="label" style={{ marginBottom: 16 }}>{data.length} families registered</div>
          {data.length === 0 && <div style={{ textAlign: "center", color: C.textDim, padding: 40 }}>No families yet. Be the first! 🏁</div>}
          {data.map((f, i) => (
            <div key={f.name} className="lb-row fade" style={{ animationDelay: `${i * 0.05}s` }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: i < 3 ? C.gold : C.textDim, width: 28 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{f.name}</div>
                {f.teamIndex !== undefined && <div style={{ fontSize: 12, color: TEAM_COLORS[f.teamIndex] }}>{TEAM_ICONS[f.teamIndex]} {TEAM_NAMES[f.teamIndex]}</div>}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {Array.from({ length: STATIONS }).map((_, j) => (
                  <div key={j} className={`dot ${j < f.stationsComplete ? (f.stationsComplete >= STATIONS ? "dot-done" : "dot-on") : ""}`} />
                ))}
              </div>
              {f.stationsComplete >= STATIONS && <span style={{ fontSize: 16 }}>🏁</span>}
            </div>
          ))}
        </div>
      )}
    </div></div>
  );
}

function Admin({ onExit }) {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [families, setFamilies] = useState([]);
  const [teams, setTeams] = useState([[], [], [], []]);
  const [loading, setLoading] = useState(false);
  const [forming, setForming] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [teamsFormed, setTeamsFormed] = useState(false);
  const [tab, setTab] = useState("families");

  const login = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin", { headers: { "x-admin-password": password } });
      if (res.status === 401) { setError("Wrong password."); setLoading(false); return; }
      const { families: f } = await res.json();
      const { teams: t } = await (await fetch("/api/teams")).json();
      setFamilies(f || []); setTeams(t || [[], [], [], []]);
      const hasTeams = (t || []).some(team => team.length > 0);
      setTeamsFormed(hasTeams);
      setAuthed(true);
    } catch { setError("Connection error."); }
    setLoading(false);
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin", { headers: { "x-admin-password": password } });
      const { families: f } = await res.json();
      const { teams: t } = await (await fetch("/api/teams")).json();
      setFamilies(f || []); setTeams(t || [[], [], [], []]);
      const hasTeams = (t || []).some(team => team.length > 0);
      setTeamsFormed(hasTeams);
    } catch {}
    setLoading(false);
  };

  const formTeams = async () => {
    setForming(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
      });
      if (res.status === 401) { setError("Unauthorised."); setForming(false); return; }
      const { teams: t } = await res.json();
      setTeams(t || [[], [], [], []]);
      setTeamsFormed(true);
      setTab("teams");
    } catch { setError("Failed to form teams."); }
    setForming(false);
  };

  const deleteFamily = async (key) => {
    setDeleting(key);
    try {
      await fetch("/api/admin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ key }),
      });
      setFamilies(f => f.filter(f => f.key !== key));
      const { teams: t } = await (await fetch("/api/teams")).json();
      setTeams(t || [[], [], [], []]);
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
      await fetch("/api/admin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ key: "teams" }),
      });
      setFamilies([]); setTeams([[], [], [], []]); setTeamsFormed(false); setConfirmReset(false);
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
      <input className="input" type="password" placeholder="Enter admin password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} style={{ marginBottom: 16 }} />
      {error && <div className="err">{error}</div>}
      <div style={{ marginTop: 20 }}>
        <button className="btn btn-gold" onClick={login} disabled={loading}>{loading ? "CHECKING..." : "LOGIN"}</button>
      </div>
    </div></div>
  );

  const completedCount = families.filter(f => (f.data.stationsComplete || 0) >= STATIONS).length;

  return (
    <div className="app"><div className="screen">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div className="hero" style={{ fontSize: 40 }}>ADMIN</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={refresh} disabled={loading}>Refresh</button>
          <button className="btn btn-ghost btn-sm" onClick={onExit}>Home</button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", background: "#111827", borderRadius: 14, padding: 4, marginBottom: 24, border: `1px solid ${C.border}` }}>
        {["families", "teams"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "10px", borderRadius: 10, border: "none",
            background: tab === t ? C.gold : "transparent",
            color: tab === t ? "#0A0E1A" : C.textDim,
            fontFamily: "'DM Sans',sans-serif", fontSize: 14,
            fontWeight: tab === t ? 600 : 400, cursor: "pointer", textTransform: "capitalize"
          }}>{t}</button>
        ))}
      </div>

      {tab === "families" && (
        <div>
          {/* Form Teams CTA */}
          <div style={{ background: teamsFormed ? `${C.success}11` : `${C.gold}11`, border: `1px solid ${teamsFormed ? C.success : C.gold}44`, borderRadius: 16, padding: "20px", marginBottom: 24 }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: teamsFormed ? C.success : C.gold, letterSpacing: 1, marginBottom: 4 }}>
              {teamsFormed ? "✅ Teams Formed" : "⚡ Form Teams"}
            </div>
            <div style={{ fontSize: 13, color: C.textDim, marginBottom: 16 }}>
              {teamsFormed
                ? "Teams have been formed. Tap Teams tab to see the lineup."
                : `${completedCount} of ${families.length} families have finished. Tap below when ready to form teams.`}
            </div>
            <button
              className="btn btn-gold"
              onClick={formTeams}
              disabled={forming || families.length === 0}
              style={{ padding: "14px", fontSize: 18 }}>
              {forming ? "FORMING TEAMS..." : teamsFormed ? "RE-FORM TEAMS" : "FORM TEAMS NOW"}
            </button>
          </div>

          <div className="label" style={{ marginBottom: 16 }}>{families.length} families · {completedCount} finished</div>

          {families.length === 0 && <div style={{ textAlign: "center", color: C.textDim, padding: 40 }}>No families registered yet.</div>}

          {families.map((f) => (
            <div key={f.key} className="lb-row">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{f.data.name}</div>
                <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
                  {f.data.stationsComplete || 0}/{STATIONS} stations
                  {f.data.teamIndex !== undefined ? ` · ${TEAM_ICONS[f.data.teamIndex]} ${TEAM_NAMES[f.data.teamIndex]}` : " · Not assigned yet"}
                </div>
              </div>
              <div style={{ display: "flex", gap: 4, marginRight: 12 }}>
                {Array.from({ length: STATIONS }).map((_, j) => (
                  <div key={j} className={`dot ${j < (f.data.stationsComplete || 0) ? ((f.data.stationsComplete || 0) >= STATIONS ? "dot-done" : "dot-on") : ""}`} />
                ))}
              </div>
              <button onClick={() => deleteFamily(f.key)} disabled={deleting === f.key}
                style={{ background: "#2A0A0A", border: `1px solid ${C.accent}`, borderRadius: 8, padding: "6px 12px", color: C.accent, fontSize: 13, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
                {deleting === f.key ? "..." : "Reset"}
              </button>
            </div>
          ))}

          {families.length > 0 && (
            <div style={{ marginTop: 32 }}>
              {!confirmReset ? (
                <button className="btn btn-ghost" onClick={() => setConfirmReset(true)} style={{ color: C.accent, borderColor: C.accent }}>Reset All Families</button>
              ) : (
                <div>
                  <div style={{ textAlign: "center", color: C.accent, marginBottom: 16, fontSize: 14 }}>This will delete ALL families and teams. Are you sure?</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setConfirmReset(false)}>Cancel</button>
                    <button className="btn btn-red btn-sm" style={{ flex: 1 }} onClick={resetAll} disabled={loading}>{loading ? "Deleting..." : "Yes, Reset All"}</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "teams" && (
        <div>
          {!teamsFormed ? (
            <div style={{ textAlign: "center", color: C.textDim, padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
              <div>Teams not formed yet. Go to Families tab and tap Form Teams.</div>
            </div>
          ) : (
            TEAM_NAMES.map((name, i) => {
              const team = teams[i] || [];
              const color = TEAM_COLORS[i];
              const icon = TEAM_ICONS[i];
              const kids = team.filter(m => m.age && parseInt(m.age) <= 12);
              const adults = team.filter(m => !m.age || parseInt(m.age) > 12);
              const raceTime = teamRaceTime(team);
              return (
                <div key={i} className="team-card fade" style={{ borderColor: `${color}44`, background: `${color}08`, animationDelay: `${i * 0.1}s` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 32 }}>{icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color, letterSpacing: 1 }}>{name}</div>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: C.textDim, letterSpacing: 2 }}>
                        {kids.length} kids · {adults.length} adults · {team.length} total
                      </div>
                    </div>
                    {team.length > 0 && (
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: C.textDim, letterSpacing: 2 }}>RACE TIME</div>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color, letterSpacing: 1 }}>{raceTime}</div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {team.map((m, j) => (
                      <div key={j} className="team-member-chip" style={{ color }}>
                        {m.name}{m.age ? ` (${m.age})` : ""}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}

          <div style={{ marginTop: 16, padding: "16px 20px", background: "#111827", borderRadius: 14, border: `1px solid ${C.border}` }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: C.gold, letterSpacing: 2, marginBottom: 8 }}>SEMI FINALS</div>
            <div style={{ fontSize: 14, color: C.textDim, lineHeight: 1.8 }}>
              🦅 Eagles vs 🦁 Lions<br />
              🐻 Bears vs 🦆 Hawks<br />
              <span style={{ color: C.gold, marginTop: 4, display: "block" }}>Winners meet in the Final 🏆</span>
            </div>
          </div>
        </div>
      )}
    </div></div>
  );
}
