import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Cam, Shot, type V3 } from "./kit/three";
import { AMB, Click, CREAM, DUR, FPS, FadeOut, Grain, LINE, RED, SANS, Vig, fr, io, useSpr } from "./kit/ui";
import { Char, SLIM, headCenter, type Look, type Pose } from "./rig/char";
import { DAD, PAKIN, STRANGER_J, STRANGER_W, TON_HOME, TON_HOME_PHONE2 } from "./rig/cast";
import { SIT, walkPose } from "./rig/poses";
import { COIN_TABLE, Stall } from "./sets/stall";
import { BIKE, CarInterior, Motorbike, Warehouse } from "./sets/warehouse";
import { Captions } from "./ui/captions";
import MOUTH from "./mouth.json";

/** EP6 — ความลับที่ซ่อนอยู่หลังร้านไก่ทอด (~90 s). Story + dialogue: the user's MASTER PROMPT (2026-11-06).
 *  Rules: series/ton/RULES.md (hook in 3 s, reaction shots, stingers, hard cut to black; the stranger's face is never shown; no CK book).
 *  User choices: the employer's document shows only the SURNAME "ธนกิจไพศาล" (first name hidden under the stranger's thumb);
 *  Ton's father waits on his motorbike. */

/* ─── timing helpers ─── */
const T = (n: number) => LINE[n - 1].t;
const E = (n: number) => LINE[n - 1].end;
const mid = (n: number) => (T(n) + E(n)) / 2;
const blink = (f: number, s = 0) => ((f + s * 23) % 83 < 4 ? 1 : 0);
const face = (L: Look) => headCenter(L);
const yawTo = (a: V3, b: V3) => Math.atan2(b[0] - a[0], b[2] - a[2]);
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const orbit = (c: V3, d: number, r: number, y: number): V3 => [c[0] + Math.sin(d) * r, y, c[2] + Math.cos(d) * r];

/* ─── lip-sync ─── */
const GF = React.createContext(0);
const MO = MOUTH as { fps: number; env: number[]; who: string[] };
const useMouth = (who: string) => {
  const g = React.useContext(GF);
  return MO.who[g] === who ? Math.min(0.75, (MO.env[g] ?? 0) * 0.8) : 0;
};
const SIT_Y = (SIT.y ?? 0) * SLIM.leg * TON_HOME.height;

/* ═════════ 1–2. the stall at night ═════════ */
const TON_T: V3 = [COIN_TABLE[0], 0, COIN_TABLE[2] - 0.5];
const TON_N2: V3 = [0.4, 0, -0.95], DAD_N: V3 = [-0.5, 0, -0.85];
const HTT = face(TON_HOME) + SIT_Y, HT = face(TON_HOME), HD = face(DAD);
type NightAct = { ton?: "read" | "walk" | "show" | "talk" | "nod"; dad?: "pack" | "read" | "look" | "talk"; k?: number; mt?: number; md?: number };
const NightStall: React.FC<NightAct> = ({ ton = "read", dad = "pack", k = 0, mt = 0, md = 0 }) => {
  const f = useCurrentFrame();
  const seated = ton === "read";
  const tp: V3 = seated ? TON_T : ton === "walk" ? lerp3(TON_T, TON_N2, Math.min(1, k)) : TON_N2;
  const tRy = seated ? 0 : ton === "walk" ? yawTo(TON_T, TON_N2) : yawTo(TON_N2, DAD_N);
  const tonPose: Pose = seated ? { ...SIT, shL: [-0.7, 0, 0.2], elL: -1.0, shR: [-1.05, 0.3, -0.25], elR: -1.5, head: [0.3 - io(f, 10, 40, 0, 0.25), 0, 0], browUp: io(f, 0, 25, 0.6, -0.6), mouth: mt, blink: blink(f, 1) }
    : ton === "walk" ? { ...walkPose(Math.min(1, k) * 1.2 / 1.2 * Math.PI * 2, 1 - Math.max(0, Math.min(1, k) - 0.85) * 6), shR: [-0.9, 0.2, -0.2], elR: -1.3, blink: blink(f, 1) }
    : ton === "show" ? { shR: [-1.35, 0.35, -0.1], elR: -0.35, head: [0.1, 0, 0], browUp: 0.3, mouth: mt, blink: blink(f, 1) }
    : ton === "nod" ? { shR: [-0.5, 0, -0.1], elR: -1.0, head: [0.12 + Math.max(0, Math.sin(f * 0.25)) * 0.12, 0, 0], browUp: -0.3, mouth: mt, blink: blink(f, 1) }
    : { shR: [-0.6, 0, -0.1], elR: -1.1, head: [0.02, 0, 0], browUp: 0.2, mouth: mt, blink: blink(f, 1) };
  const dRy = dad === "pack" ? yawTo(DAD_N, [-0.45, 0, 0]) : yawTo(DAD_N, TON_N2);
  const dadPose: Pose = dad === "pack" ? { spine: [0.25, 0, 0], shR: [-0.7 - Math.sin(f * 0.15) * 0.15, 0, -0.1], elR: -0.8, shL: [-0.6, 0, 0.1], elL: -0.9, head: [0.3, 0, 0], blink: blink(f, 2) }
    : dad === "read" ? { shR: [-0.3, 0, -0.1], elR: -0.5, head: [0.35, 0.15, 0], browUp: 1, blink: 0 }
    : { shR: [-0.3, 0, -0.15], elR: -0.5, shL: [-0.3, 0, 0.15], elL: -0.5, head: [0.05, 0, 0], browUp: dad === "look" ? 0.9 : 0.5, mouth: md, blink: blink(f, 2) };
  return (
    <Stall>
      <Char L={TON_HOME_PHONE2} p={tp} ry={tRy} pose={tonPose} seed={1} />
      {/* his stool + the hand-written account book on the coin table */}
      <mesh position={[TON_T[0], 0.21, TON_T[2] + 0.05]}><cylinderGeometry args={[0.15, 0.17, 0.42, 16]} /><meshStandardMaterial color="#2F6FB0" /></mesh>
      <group position={[COIN_TABLE[0] - 0.12, 0.73, COIN_TABLE[2] - 0.05]} rotation={[0, 0.15, 0]}>
        <mesh position={[-0.11, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.21, 0.29]} /><meshStandardMaterial color="#F1ECDD" /></mesh>
        <mesh position={[0.11, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.21, 0.29]} /><meshStandardMaterial color="#EDE7D6" /></mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => <mesh key={i} position={[-0.11, 0.001, -0.1 + i * 0.04]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.16, 0.006]} /><meshStandardMaterial color="#2F4E8C" /></mesh>)}
      </group>
      <Char L={DAD} p={DAD_N} ry={dRy} pose={dadPose} seed={2} />
      {seated ? <pointLight position={[TON_T[0] + 0.05, HTT - 0.15, TON_T[2] + 0.4]} intensity={0.8} distance={1} color="#BFD6F2" /> : null}
      <pointLight position={[0, 1.6, -1.6]} intensity={0.7} distance={2.4} color="#FFD3A0" />
    </Stall>
  );
};
const STonRead = () => { const f = useCurrentFrame(); return <Shot><NightStall mt={useMouth("ton")} /><Cam p={[TON_T[0] - 0.1, HTT + 0.02, TON_T[2] + 1.15 - f * 0.004]} t={[TON_T[0], HTT - 0.05, TON_T[2]]} fov={28} drift={0.2} /></Shot>; };
const SWalkToDad = () => { const f = useCurrentFrame(); const k = io(f, 0, 34, 0, 1); return <Shot><NightStall ton="walk" k={k} /><Cam p={[2.7, 2.0, 1.4]} t={[0.2, 1.0, -0.9]} fov={40} drift={0.3} /></Shot>; };
/** over Ton's shoulder onto Dad (Dad reads the phone / talks) */
const SNightTwo: React.FC<NightAct> = (a) => { const f = useCurrentFrame(); const d = yawTo(TON_N2, DAD_N); const cam: V3 = [TON_N2[0] - Math.sin(d) * 0.6 - 0.05, HT + 0.08, TON_N2[2] - Math.cos(d) * 0.6 - 0.32 + f * 0.001]; return <Shot><NightStall {...a} mt={useMouth("ton")} md={useMouth("dad")} /><Cam p={cam} t={[DAD_N[0], HD - 0.12, DAD_N[2]]} fov={34} drift={0.3} /></Shot>; };
const SNightTon: React.FC<NightAct> = (a) => { const f = useCurrentFrame(); const d = yawTo(TON_N2, DAD_N) - 0.6; return <Shot><NightStall {...a} mt={useMouth("ton")} /><Cam p={orbit(TON_N2, d, 1.15 - f * 0.002, HT + 0.03)} t={[TON_N2[0], HT - 0.05, TON_N2[2]]} fov={30} drift={0.3} /></Shot>; };
const SNightDad: React.FC<NightAct> = (a) => { const f = useCurrentFrame(); const d = yawTo(DAD_N, TON_N2) + 0.6; return <Shot><NightStall {...a} md={useMouth("dad")} /><Cam p={orbit(DAD_N, d, 1.15 - f * 0.002, HD + 0.02)} t={[DAD_N[0], HD - 0.06, DAD_N[2]]} fov={30} drift={0.3} /></Shot>; };

/* ═════════ 3–6. the old warehouse, 19:00 ═════════ */
const STR_W: V3 = [0.5, 0, -1.75], TON_W: V3 = [0.25, 0, -0.45], TON_IN: V3 = [-0.9, 0, 5.2];
const HTW = face(TON_HOME), HS = face(STRANGER_J);
const TON_PHOTO: Look = { ...TON_HOME, holdR: "photo" };
const STR_FOLDER: Look = { ...STRANGER_W, holdR: "folder" };
type WAct = { ton?: "walk" | "stand" | "talk" | "photo" | "up" | "shock"; str?: "wait" | "step" | "talk" | "folder" | "show"; k?: number; mt?: number; ms?: number };
const WScene: React.FC<WAct> = ({ ton = "stand", str = "talk", k = 1, mt = 0, ms = 0 }) => {
  const f = useCurrentFrame();
  const tp: V3 = ton === "walk" ? lerp3(TON_IN, TON_W, Math.min(1, k)) : TON_W;
  const tRy = ton === "walk" ? yawTo(TON_IN, TON_W) : yawTo(TON_W, STR_W);
  const tonPose: Pose = ton === "walk" ? { ...walkPose(Math.min(1, k) * 5.8 / 1.2 * Math.PI * 2, 1 - Math.max(0, Math.min(1, k) - 0.9) * 10), head: [0.02, Math.sin(f / 18) * 0.2, 0], browUp: -0.4, blink: blink(f, 1) }
    : ton === "photo" ? { shR: [-1.15, 0.2, -0.1], elR: -1.0, shL: [-0.6, 0, 0.2], elL: -1.1, head: [0.38, 0, 0], browUp: -0.4, mouth: mt, blink: blink(f, 1) }
    : ton === "up" ? { shR: [-0.9, 0.2, -0.1], elR: -1.0, head: [-0.02, 0, 0], browUp: -0.7, mouth: mt, blink: blink(f, 1) }
    : ton === "shock" ? { shR: [-0.9, 0.2, -0.1], elR: -1.0, head: [-0.06, 0, 0], browUp: 1, mouth: Math.max(mt, 0.2), blink: 0 }
    : { shL: [-0.15, 0, 0.12], shR: [-0.15, 0, -0.12], head: [0, 0, 0], browUp: ton === "talk" ? -0.2 : -0.6, mouth: mt, blink: blink(f, 1) };
  const sp: V3 = str === "wait" ? [STR_W[0] + 0.25, 0, STR_W[2] - 0.9] : str === "step" ? lerp3([STR_W[0] + 0.25, 0, STR_W[2] - 0.9], STR_W, Math.min(1, k)) : STR_W;
  const sRy = str === "wait" ? Math.PI + 0.3 : yawTo(sp, TON_W);
  const strPose: Pose = str === "step" ? { ...walkPose(Math.min(1, k) * 0.95 / 1.2 * Math.PI * 2, 1 - Math.max(0, Math.min(1, k) - 0.85) * 6), blink: 1 }
    : str === "folder" ? { shR: [-0.9, 0.1, -0.1], elR: -1.2, shL: [-0.8, -0.2, 0.15], elL: -1.2, head: [0.3, 0, 0], mouth: ms, blink: 1 }
    : str === "show" ? { shR: [-1.3, 0.15, -0.05], elR: -0.4, shL: [-0.3, 0, 0.1], elL: -0.6, head: [0.1, 0, 0], mouth: ms, blink: 1 }
    : { shL: [-0.25, 0, 0.12], elL: -0.4, shR: [-0.25, 0, -0.12], elR: -0.4, head: [0.06, 0, 0], mouth: ms, blink: 1 };
  const tonL = ton === "photo" || ton === "up" || ton === "shock" ? TON_PHOTO : TON_HOME;
  const sL = str === "folder" || str === "show" ? STR_FOLDER : STRANGER_W;
  return (
    <Warehouse>
      <Char L={tonL} p={tp} ry={tRy} pose={tonPose} seed={1} />
      <Char L={sL} p={sp} ry={sRy} pose={strPose} seed={11} />
      {/* Ton's father on his motorbike, far but in sight, watching */}
      <Motorbike p={BIKE} ry={0.5} />
      <Char L={DAD} p={[BIKE[0] - 0.15, 0.22, BIKE[2] + 0.1]} ry={yawTo(BIKE, TON_W)} pose={{ ...SIT, shR: [-0.9, 0, -0.1], elR: -0.5, shL: [-0.9, 0, 0.1], elL: -0.5, head: [0.0, 0, 0], blink: blink(f, 2) }} seed={2} />
      {/* soft key on Ton's face from the lamp side */}
      <pointLight position={[TON_W[0] + 0.3, HTW + 0.3, TON_W[2] - 0.8]} intensity={0.5} distance={1.6} color="#FFCF96" />
    </Warehouse>
  );
};
/** the stranger is never seen from the front: shots on him are from behind, from the chest down, or backlit far away */
const SEstablish = () => { const f = useCurrentFrame(); return <Shot><WScene ton="walk" str="wait" k={io(f, 0, 150, 0, 0.35)} /><Cam p={[-5.8, 2.6, 11.5 - f * 0.01]} t={[0.0, 1.6, -2.4]} fov={46} drift={0.3} /></Shot>; };
const STrackIn = () => { const f = useCurrentFrame(); const k = io(f, 0, 70, 0.35, 0.92); const tp = lerp3(TON_IN, TON_W, k); return <Shot><WScene ton="walk" str="wait" k={k} /><Cam p={[tp[0] - 0.9, 1.45, tp[2] + 2.2]} t={[tp[0] + 0.3, 1.1, tp[2] - 2.0]} fov={44} drift={0.3} /></Shot>; };
const SStep = () => { const f = useCurrentFrame(); const k = io(f, 2, 32, 0, 1); return <Shot><WScene ton="stand" str="step" k={k} ms={useMouth("stranger")} /><Cam p={[STR_W[0] + 0.45, HS + 0.02, STR_W[2] - 1.15 + f * 0.004]} t={[TON_W[0], HTW - 0.2, TON_W[2]]} fov={40} drift={0.3} /></Shot>; };
/** over the stranger's shoulder onto Ton (Ton talks or reacts) */
const SOtsTon: React.FC<WAct & { push?: number }> = ({ push = 0.002, ...a }) => { const f = useCurrentFrame(); const d = yawTo(STR_W, TON_W); const cam: V3 = [STR_W[0] - Math.sin(d) * 0.55 + 0.32, HS + 0.06, STR_W[2] - Math.cos(d) * 0.55 + f * push]; return <Shot><WScene {...a} mt={useMouth("ton")} ms={useMouth("stranger")} /><Cam p={cam} t={[TON_W[0], HTW - 0.05, TON_W[2]]} fov={32} drift={0.3} /></Shot>; };
/** Ton close-up from the stranger's side (no stranger in frame) */
const STonCU: React.FC<WAct & { tight?: boolean; push?: number }> = ({ tight, push = 0.002, ...a }) => { const f = useCurrentFrame(); const d = yawTo(TON_W, STR_W) + 0.55; const r = (tight ? 0.95 : 1.2) - f * push; return <Shot><WScene {...a} mt={useMouth("ton")} ms={useMouth("stranger")} /><Cam p={orbit(TON_W, d, r, HTW + 0.03)} t={[TON_W[0], HTW - 0.06, TON_W[2]]} fov={tight ? 26 : 30} drift={0.3} /></Shot>; };
/** low, backlit: the lamp behind his head, face lost in shadow + glare */
const SStrBack: React.FC<WAct> = (a) => { const f = useCurrentFrame(); const d = yawTo(STR_W, TON_W) + Math.PI - 0.62; return <Shot><WScene {...a} ms={useMouth("stranger")} /><Cam p={orbit(STR_W, d, 1.75, HS - 0.2)} t={[TON_W[0] + f * 0.0006, HTW - 0.05, TON_W[2]]} fov={36} drift={0.3} /></Shot>; };
/** Ton looks at the photo of his family's stall; the camera circles him */
const SCircle: React.FC<WAct> = (a) => { const f = useCurrentFrame(); const d = yawTo(TON_W, STR_W) + 0.9 - f * 0.006; return <Shot><WScene {...a} mt={useMouth("ton")} ms={useMouth("stranger")} /><Cam p={orbit(TON_W, d, 1.05, HTW - 0.02)} t={[TON_W[0], HTW - 0.1, TON_W[2]]} fov={30} drift={0.2} /></Shot>; };
const SDadBike = () => { const f = useCurrentFrame(); return <Shot><WScene ton="stand" str="talk" /><pointLight position={[BIKE[0] + 0.6, 1.5, BIKE[2] - 0.6]} intensity={1.3} distance={2.2} color="#FFC890" /><Cam p={[BIKE[0] + Math.sin(yawTo(BIKE, TON_W) + 0.4) * 2.0, 1.35, BIKE[2] + Math.cos(yawTo(BIKE, TON_W) + 0.4) * 2.0 + f * 0.004]} t={[BIKE[0] - 0.15, 1.1, BIKE[2] + 0.1]} fov={30} drift={0.3} /></Shot>; };

/* ═════════ 6. Pakin in the car ═════════ */
const HPC = face(PAKIN) + (SIT.y ?? 0) * SLIM.leg * PAKIN.height;
const SPakCar = () => {
  const f = useCurrentFrame(); const mp = useMouth("pakin");
  return (
    <Shot>
      <CarInterior>
        <Char L={PAKIN} p={[0, 0, -0.05]} ry={0} pose={{ ...SIT, shR: [-1.1, 0.3, -0.25], elR: -1.55, shL: [-0.3, 0, 0.15], elL: -0.8, head: [0.32 - io(f, 20, 34, 0, 0.3), 0, 0], browUp: io(f, 20, 34, -0.3, 0.9), mouth: mp, blink: f > 20 ? 0 : blink(f, 3) }} seed={3} />
      </CarInterior>
      <Cam p={[0.12, HPC + 0.05, 0.8 - f * 0.002]} t={[0, HPC - 0.1, -0.05]} fov={36} drift={0.2} />
    </Shot>
  );
};

/* ═════════ DOM inserts ═════════ */
/** the anonymous message (same text as EP5's ending), the phone buzzing on the table */
const PhoneMsg: React.FC = () => {
  const f = useCurrentFrame(); const s = useSpr(4, 13); const buzz = f < 16 ? Math.sin(f * 2.9) * 7 : 0;
  return (
    <AbsoluteFill style={{ background: "#07080C", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 760, height: 1380, borderRadius: 80, background: "#111317", border: "10px solid #26282E", boxShadow: "0 0 120px rgba(150,180,255,0.18)", transform: `translateX(${buzz}px) scale(${1.04 + f * 0.0015})`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#1B2033,#0E1018)" }} />
        <div style={{ position: "absolute", top: 120, left: 0, right: 0, textAlign: "center", color: "#D8DCE6", fontFamily: SANS, fontSize: 120, fontWeight: 300 }}>21:13</div>
        <div style={{ position: "absolute", top: 400, left: 36, right: 36, background: "rgba(40,44,56,0.95)", borderRadius: 34, padding: "26px 32px", fontFamily: SANS, opacity: s, transform: `translateY(${(1 - s) * -120}px)` }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#9AA0AE", fontSize: 30 }}><span>ข้อความ · ไม่ทราบหมายเลข</span><span>ตอนนี้</span></div>
          <div style={{ color: "#F4F5F8", fontSize: 44, fontWeight: 600, marginTop: 14, lineHeight: 1.4 }}>ถ้าอยากรู้ว่าร้านของพ่อกำลังเจออะไรอยู่ พรุ่งนี้มาที่<span style={{ color: AMB }}>โกดังเก่า</span> เวลา 19.00 น. <span style={{ color: RED }}>มาคนเดียว</span></div>
        </div>
      </div>
      <Click at={4} v={0.35} />
    </AbsoluteFill>
  );
};
/** small time-and-place tag over the establishing shot */
const PlaceTag: React.FC = () => { const a = useSpr(6, 16); return <AbsoluteFill style={{ pointerEvents: "none" }}><div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center", fontFamily: SANS, opacity: a }}><div style={{ color: CREAM, fontSize: 52, fontWeight: 600, textShadow: "0 3px 14px rgba(0,0,0,0.8)" }}>วันถัดมา · 19.00 น.</div><div style={{ color: "#C9CFDA", fontSize: 36, marginTop: 10, textShadow: "0 3px 14px rgba(0,0,0,0.8)" }}>โกดังเก่า</div></div></AbsoluteFill>; };
const Photo: React.FC<{ src: string; w: number; rot: number; x: number; y: number; d?: number; stamp?: string }> = ({ src, w, rot, x, y, d = 0, stamp }) => {
  const s = useSpr(d, 14);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, padding: 16, paddingBottom: 46, background: "#F4F2EC", boxShadow: "0 18px 40px rgba(0,0,0,0.5)", transform: `rotate(${rot}deg) translateY(${(1 - s) * 260}px)`, opacity: s }}>
      <Img src={staticFile(src)} style={{ width: "100%", display: "block", filter: "saturate(0.75) contrast(1.05)" }} />
      {stamp ? <div style={{ position: "absolute", right: 20, bottom: 10, fontFamily: "monospace", fontSize: 24, color: "#C2452E" }}>{stamp}</div> : null}
    </div>
  );
};
/** scene 4: the folder opens: photos of the stall + the competitor's plan */
const FolderOpen: React.FC = () => {
  const f = useCurrentFrame(); const doc = useSpr(16, 14); const hl = io(f, 34, 46, 0, 1);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(80% 60% at 50% 45%, #3A3326, #0E0C0A)", transform: `scale(${1 + f * 0.0009})` }}>
      <div style={{ position: "absolute", left: 60, top: 260, width: 960, height: 1360, background: "#1F2C4A", borderRadius: 18, boxShadow: "0 40px 90px rgba(0,0,0,0.6)" }} />
      <Photo src="photo_front.png" w={520} rot={-5} x={90} y={330} stamp="08.10" />
      <Photo src="photo_counter.png" w={430} rot={4} x={540} y={420} d={6} stamp="08.12" />
      <div style={{ position: "absolute", left: 150, top: 980, width: 780, background: "#FBFAF5", borderRadius: 6, padding: "40px 46px", fontFamily: SANS, color: "#22252C", boxShadow: "0 20px 50px rgba(0,0,0,0.45)", transform: `translateY(${(1 - doc) * 400}px) rotate(1deg)` }}>
        <div style={{ fontSize: 40, fontWeight: 700 }}>แผนเปิดร้านไก่ทอดสาขาใหม่</div>
        <div style={{ height: 3, background: "#22252C", margin: "16px 0 24px" }} />
        <div style={{ fontSize: 33, lineHeight: 1.65, color: "#3A3E48" }}>
          ทำเล: ถนนเดียวกับ <span style={{ background: `rgba(233,184,74,${0.55 * hl})` }}>ร้านไก่ทอดเดิม</span><br />
          ขนาด: <span style={{ background: `rgba(217,72,59,${0.45 * hl})`, fontWeight: 700 }}>คู่แข่งรายใหญ่</span> · 3 เท่าของร้านเดิม<br />
          สำรวจ: <span style={{ background: `rgba(217,72,59,${0.45 * hl})`, fontWeight: 700 }}>ลูกค้าประจำ</span> ร้านเดิม / วัน = ?
        </div>
      </div>
      <Click at={6} v={0.2} kind="tick" />
      <Click at={16} v={0.25} />
    </AbsoluteFill>
  );
};
/** the last sheet: a photo of the stall from behind + "ผู้ว่าจ้าง: คุณ ▇▇▇ ธนกิจไพศาล" — the first name stays under his thumb.
 *  zoom=true: the push-in on the name */
const NameDoc: React.FC<{ zoom?: boolean }> = ({ zoom }) => {
  const f = useCurrentFrame(); const s = useSpr(2, 14);
  const z = zoom ? 1.6 + io(f, 0, 40, 0, 0.9) : 1 + f * 0.001;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(80% 60% at 50% 45%, #2E2A22, #0A0908)", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${z})`, transformOrigin: zoom ? "62% 76%" : "50% 50%" }}>
        <div style={{ position: "absolute", left: 120, top: 280, width: 840, height: 1250, background: "#FBFAF5", borderRadius: 6, padding: "50px 54px", fontFamily: SANS, color: "#22252C", boxShadow: "0 30px 80px rgba(0,0,0,0.55)", transform: `translateY(${(1 - s) * 300}px) rotate(-1.2deg)` }}>
          <div style={{ fontSize: 40, fontWeight: 700 }}>รายงานการตรวจสอบ: ร้านไก่ทอด (พ่อต้น)</div>
          <div style={{ height: 3, background: "#22252C", margin: "16px 0 30px" }} />
          <div style={{ position: "relative", width: 732, padding: 14, background: "#EEECE6" }}>
            <Img src={staticFile("photo_back.png")} style={{ width: "100%", display: "block", filter: "grayscale(0.35) contrast(1.1)" }} />
            <div style={{ position: "absolute", right: 24, bottom: 20, fontFamily: "monospace", fontSize: 26, color: "#E05A3A" }}>มุมหลังร้าน · 22.40</div>
          </div>
          <div style={{ marginTop: 56, fontSize: 40, color: "#3A3E48", display: "flex", alignItems: "center" }}>
            ผู้ว่าจ้าง: คุณ
            <span style={{ position: "relative", display: "inline-block", margin: "0 40px 0 30px", color: "#3A3E48", fontWeight: 700, fontSize: 46 }}>
              ●●●●●
              <span style={{ position: "absolute", left: -18, top: -40, width: 190, height: 130, background: "linear-gradient(160deg,#8E6A4E,#6E4E36)", borderRadius: "70px 70px 60px 60px", boxShadow: "0 10px 26px rgba(0,0,0,0.45)", transform: "rotate(-8deg)" }}>
                <span style={{ position: "absolute", left: 46, top: 14, width: 96, height: 68, background: "#A88468", borderRadius: "40px 40px 30px 30px", opacity: 0.7 }} />
              </span>
            </span>
            <span style={{ fontWeight: 700, color: "#1E2A44", fontSize: 46 }}>ธนกิจไพศาล</span>
          </div>
        </div>
      </div>
      {zoom ? <AbsoluteFill style={{ background: `rgba(120,0,0,${0.12 * Math.min(1, f / 20)})` }} /> : null}
      <Click at={2} v={0.25} />
    </AbsoluteFill>
  );
};
const SlamCard: React.FC<{ text: string; sub?: string }> = ({ text, sub }) => {
  const f = useCurrentFrame(); const a = useSpr(0, 14); const shake = f < 7 ? Math.sin(f * 3.1) * 9 * (7 - f) / 7 : 0;
  return (
    <AbsoluteFill style={{ background: "#0A0B10", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: SANS, transform: `translateX(${shake}px)` }}>
      <div style={{ color: CREAM, fontSize: 84, fontWeight: 700, lineHeight: 1.25, opacity: a, transform: `scale(${1.35 - 0.35 * a})`, maxWidth: 960, whiteSpace: "pre-line" }}>{text}</div>
      <div style={{ width: 160 * a, height: 9, background: RED, borderRadius: 5, margin: "30px auto 0" }} />
      {sub ? <div style={{ color: "#9AA0AE", fontSize: 40, marginTop: 34, opacity: useSpr(12, 14), maxWidth: 900 }}>{sub}</div> : null}
      <Click at={0} v={0.4} />
    </AbsoluteFill>
  );
};
/** hard cut to black, then the closing question, line by line */
const BlackText: React.FC = () => {
  const a = useSpr(8, 16), b = useSpr(30, 16), c = useSpr(56, 14);
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: SANS, padding: "0 70px" }}>
      <div style={{ color: "#C9CFDA", fontSize: 58, fontWeight: 600, opacity: a }}>แต่สิ่งที่ต้นยังไม่รู้…</div>
      <div style={{ color: CREAM, fontSize: 64, fontWeight: 700, marginTop: 34, lineHeight: 1.35, opacity: b }}>คือ<span style={{ color: RED }}>คนที่อยู่เบื้องหลัง</span>แผนนี้</div>
      <div style={{ color: CREAM, fontSize: 64, fontWeight: 700, marginTop: 12, lineHeight: 1.35, opacity: c, transform: `scale(${1.15 - 0.15 * c})` }}>อาจไม่ได้มีแค่คนเดียว</div>
    </AbsoluteFill>
  );
};
const Letterbox: React.FC = () => <AbsoluteFill style={{ pointerEvents: "none" }}><div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 220, background: "#000" }} /><div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 220, background: "#000" }} /></AbsoluteFill>;
const NextCard: React.FC = () => {
  const f = useCurrentFrame(); const a = useSpr(4, 18), b = useSpr(14, 14);
  const shake = f >= 14 && f < 21 ? Math.sin(f * 3.1) * 7 * (21 - f) / 7 : 0;
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: SANS, transform: `translateX(${shake}px)` }}>
      <div style={{ color: CREAM, fontSize: 92, fontWeight: 700, opacity: a, transform: `scale(${1.3 - 0.3 * a})` }}>EP 7</div>
      <div style={{ width: 130, height: 7, background: RED, borderRadius: 4, margin: "24px auto", opacity: a }} />
      <div style={{ color: RED, fontSize: 64, fontWeight: 700, maxWidth: 940, lineHeight: 1.3, opacity: b, transform: `scale(${1.25 - 0.25 * b})` }}>คนที่อยู่เบื้องหลัง<br />ไม่ใช่คนที่ต้นคิด</div>
      <div style={{ color: "#8A8F9A", fontSize: 34, marginTop: 40, opacity: useSpr(30, 14) }}>ติดตามตอนต่อไป</div>
    </AbsoluteFill>
  );
};

/* ═════════ the edit ═════════ */
type Cut = { a: number; b: number; el: React.ReactNode };
const END = E(21);
export const BLACK_AT = END + 0.5;
export const CUTS: Cut[] = [
  /* 1. the message (hook: straight in, no intro) */
  { a: 0, b: T(1) - 0.2, el: <PhoneMsg /> },
  { a: T(1) - 0.2, b: E(1) + 0.4, el: <STonRead /> },
  /* 2. he tells his father */
  { a: E(1) + 0.4, b: T(2) + 0.6, el: <SWalkToDad /> },
  { a: T(2) + 0.6, b: E(2) + 0.1, el: <SNightTwo ton="show" dad="read" /> },
  { a: E(2) + 0.1, b: E(3) + 0.2, el: <SNightDad ton="show" dad="talk" /> },
  { a: E(3) + 0.2, b: E(4) + 0.2, el: <SNightTon ton="talk" dad="look" /> },
  { a: E(4) + 0.2, b: mid(5), el: <SNightDad ton="nod" dad="talk" /> },
  { a: mid(5), b: E(5) + 0.4, el: <SNightTwo ton="nod" dad="talk" /> },
  /* 3. the old warehouse, 19:00 */
  { a: E(5) + 0.4, b: E(5) + 1.9, el: <><SEstablish /><PlaceTag /></> },
  { a: E(5) + 1.9, b: T(6) - 0.6, el: <STrackIn /> },
  { a: T(6) - 0.6, b: E(6) + 0.1, el: <SStep /> },
  { a: E(6) + 0.1, b: E(7) + 0.2, el: <SOtsTon ton="talk" str="talk" /> },
  { a: E(7) + 0.2, b: E(8) + 0.2, el: <SStrBack ton="stand" str="talk" /> },
  { a: E(8) + 0.2, b: E(9) + 0.2, el: <STonCU ton="talk" str="talk" tight /> },
  { a: E(9) + 0.2, b: T(10) + 0.4, el: <SDadBike /> },
  /* 4. the folder */
  { a: T(10) + 0.4, b: mid(10), el: <SOtsTon str="folder" ton="stand" /> },
  { a: mid(10), b: E(10) + 1.2, el: <FolderOpen /> },
  { a: E(10) + 1.2, b: E(11) + 0.2, el: <STonCU ton="talk" str="folder" push={0.004} /> },
  { a: E(11) + 0.2, b: E(12) + 0.2, el: <SOtsTon ton="stand" str="folder" /> },
  { a: E(12) + 0.2, b: E(13) + 0.3, el: <STonCU ton="talk" str="folder" tight /> },
  /* 5. how does a small shop fight back */
  { a: E(13) + 0.3, b: mid(14), el: <SCircle ton="photo" str="show" /> },
  { a: mid(14), b: E(14) + 0.2, el: <STonCU ton="up" str="show" push={0.004} /> },
  { a: E(14) + 0.2, b: E(15) + 0.2, el: <SStrBack ton="up" str="talk" /> },
  { a: E(15) + 0.2, b: E(16) + 0.2, el: <STonCU ton="up" str="talk" tight /> },
  { a: E(16) + 0.2, b: mid(17), el: <SStrBack ton="up" str="talk" /> },
  { a: mid(17), b: E(17) + 0.2, el: <SOtsTon ton="up" str="talk" push={0.004} /> },
  { a: E(17) + 0.2, b: E(18) + 0.2, el: <SCircle ton="photo" str="talk" /> },
  { a: E(18) + 0.2, b: E(18) + 1.8, el: <SlamCard text={"เงินมากกว่า\nไม่ได้แปลว่า\nเข้าใจลูกค้ามากกว่า"} sub="ร้านเล็กสู้ได้ด้วย รสชาติ · ความไว้ใจ · ความสัมพันธ์กับลูกค้า" /> },
  /* 6. the name on the last sheet */
  { a: E(18) + 1.8, b: T(19) - 0.1, el: <NameDoc /> },
  { a: T(19) - 0.1, b: E(19) + 0.2, el: <STonCU ton="shock" str="show" push={0.005} /> },
  { a: E(19) + 0.2, b: E(20) + 0.2, el: <><SStrBack ton="shock" str="show" /><Letterbox /></> },
  { a: E(20) + 0.2, b: T(21) - 0.2, el: <NameDoc zoom /> },
  { a: T(21) - 0.2, b: BLACK_AT, el: <SPakCar /> },
  { a: BLACK_AT, b: BLACK_AT + 3.6, el: <BlackText /> },
  { a: BLACK_AT + 3.6, b: DUR / FPS, el: <NextCard /> },
];
export const HERO_S = E(17);

const Cuts: React.FC = () => (
  <>
    {CUTS.map((c, i) => (
      <Sequence key={i} from={fr(c.a)} durationInFrames={Math.max(1, fr(c.b) - fr(c.a))}>
        <AbsoluteFill>{c.el}</AbsoluteFill>
      </Sequence>
    ))}
  </>
);
export const Film: React.FC<{ noCaps?: boolean }> = ({ noCaps }) => {
  const g = useCurrentFrame();
  return (
    <GF.Provider value={g}>
      <AbsoluteFill style={{ background: "#07090F" }}>
        <Cuts />
        <Vig />
        <FadeOut from={DUR - 6} len={6} />
        <Grain amount={0.04} />
        {noCaps ? null : <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 58%, rgba(0,0,0,0.32) 64%, rgba(0,0,0,0.32) 76%, transparent 82%)" }} />}
        {noCaps ? null : <Captions hideFrom={END + 0.3} />}
      </AbsoluteFill>
    </GF.Provider>
  );
};
