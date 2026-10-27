import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { loadFont as loadMali } from "@remotion/google-fonts/Mali";
import { Cam, Shot, type V3 } from "./kit/three";
import { Click, CREAM, DUR, FPS, FadeOut, Grain, LINE, RED, SANS, Vig, fr, io, useSpr } from "./kit/ui";
import { Char, SLIM, headCenter, type Look, type Pose } from "./rig/char";
import { DAD, MOM, PAKIN, PALA, PALB, TON, TON_BAG, TON_HOME, TON_HOME_PHONE } from "./rig/cast";
import { blendPose, reachPose } from "./rig/poses";
import { FRONT_PATH_Z, School } from "./sets/school";
import { BIN, COIN_TABLE, Stall, WOK } from "./sets/stall";
import { Bedroom, SEAT } from "./sets/bedroom";
import { Captions } from "./ui/captions";
import MOUTH from "./mouth.json";

const HAND = loadMali("normal", { weights: ["500", "600"], subsets: ["thai", "latin"] }).fontFamily;

/** EP2 — หนังสือเล่มแรกที่เปลี่ยนความคิด (~82 s). Story: user's brief; dialogue approved by the user.
 *  Rules: series/ton/RULES.md (hook in 3 s, reaction shots, stingers, ending cut to black, book NOT revealed until EP3).
 *  Lip-sync: src/mouth.json (written by tools/assemble.py) opens the speaking character's mouth with the voice. */

/* ─── timing helpers ─── */
const T = (n: number) => LINE[n - 1].t;
const E = (n: number) => LINE[n - 1].end;
const mid = (n: number) => (T(n) + E(n)) / 2;
const blink = (f: number, s = 0) => ((f + s * 23) % 83 < 4 ? 1 : 0);
const face = (L: Look) => headCenter(L);
const yawTo = (a: V3, b: V3) => Math.atan2(b[0] - a[0], b[2] - a[2]);

/* ─── lip-sync: global frame → mouth opening for a speaker ─── */
const GF = React.createContext(0);
const M = MOUTH as { fps: number; env: number[]; who: string[] };
const useMouth = (who: string) => {
  const g = React.useContext(GF);
  return M.who[g] === who ? Math.min(0.75, (M.env[g] ?? 0) * 0.8) : 0;
};

/* ─── poses ─── */
const FLOOR_SIT: Pose = { y: -0.62, hipL: [-1.45, 0, 0.75], hipR: [-1.45, 0, -0.75], knL: 2.3, knR: 2.3, spine: [0.2, 0, 0] };
const PHONE_UP: Pose = { shR: [-1.05, 0.35, -0.25], elR: -1.55, shL: [-0.4, 0, 0.3], elL: -1.2, head: [0.32, 0, 0] };
const BOOK_HOLD: Pose = { shR: [-0.95, 0.25, -0.2], elR: -1.25, shL: [-0.95, -0.25, 0.2], elL: -1.25, head: [0.42, 0, 0], spine: [0.3, 0, 0] };
const WRITE = (f: number): Pose => ({ spine: [0.55, 0, 0], head: [0.45, 0, 0], shR: [-0.75 + Math.sin(f * 0.6) * 0.04, 0.1, -0.15], elR: -0.9, shL: [-0.5, 0, 0.3], elL: -1.0 });
const fry = (f: number): Pose => ({ shR: [-1.0 + Math.sin(f / 6) * 0.18, 0.15, -0.15], elR: -0.95, shL: [-0.35, 0, 0.2], elL: -0.6, spine: [0.12, 0, 0], head: [0.3, 0, 0] });
const count = (f: number): Pose => ({ y: -0.3, hipL: [-1.5, 0, 0.08], hipR: [-1.5, 0, -0.08], knL: 1.5, knR: 1.5, shL: [-0.85, 0, 0.1], elL: -0.9, shR: [-0.85 + Math.max(0, Math.sin(f / 5)) * 0.12, 0, -0.1], elR: -0.9, spine: [0.15, 0, 0], head: [0.35, 0, 0] });
const pointPose = (k: number): Pose => ({ shL: [-1.25 * k, 0.2 * k, 0.15], elL: -0.15, head: [-0.08, 0, 0], browUp: 0.1 });

/* ═════════ flashback: school front (EP1 staging) ═════════ */
const TON1: V3 = [-0.75, 0, FRONT_PATH_Z], PAK1: V3 = [0.45, 0, FRONT_PATH_Z];
const PA1: V3 = [0.95, 0, FRONT_PATH_Z - 0.75], PB1: V3 = [1.05, 0, FRONT_PATH_Z + 0.7];
const Front: React.FC<{ m?: number }> = ({ m = 0 }) => {
  const f = useCurrentFrame();
  return (
    <School>
      <Char L={TON_BAG} p={TON1} ry={Math.PI / 2} pose={{ shR: [0.05, 0, -0.08], elR: -0.25, head: [0.12, 0, 0], browUp: 0.7, blink: blink(f, 1) }} seed={1} />
      <Char L={PAKIN} p={PAK1} ry={-Math.PI / 2} pose={{ ...pointPose(1), mouth: m, blink: blink(f, 3) }} seed={3} />
      <Char L={PALA} p={PA1} ry={yawTo(PA1, TON1)} pose={{ head: [-0.15, 0, 0], mouth: 0.5, blink: 1 }} seed={5} />
      <Char L={PALB} p={PB1} ry={yawTo(PB1, TON1)} pose={{ head: [-0.15, 0, 0], mouth: 0.5, blink: 1 }} seed={6} />
    </School>
  );
};
const HP = face(PAKIN);
const SFlashback = () => { const f = useCurrentFrame(); const m = useMouth("pakin"); return <Shot><Front m={m} /><Cam p={[PAK1[0] - 1.9 + f * 0.004, HP - 0.35, PAK1[2] + 0.35]} t={[PAK1[0], HP - 0.02, PAK1[2]]} fov={32} drift={0.8} /></Shot>; };
/** memory look: desaturated, soft, white flash in */
const Memory: React.FC<{ children: React.ReactNode }> = ({ children }) => { const f = useCurrentFrame(); return <AbsoluteFill style={{ filter: "grayscale(0.75) sepia(0.25) contrast(1.1) blur(0.6px)" }}>{children}<AbsoluteFill style={{ background: "#fff", opacity: Math.max(0, 1 - f / 5) }} /></AbsoluteFill>; };

/* ═════════ bedroom ═════════ */
const FLOOR_FACE = face(TON) + (FLOOR_SIT.y ?? 0) * SLIM.leg * TON.height;
type RoomAct = "phone" | "dark" | "unwrap" | "read" | "decide" | "write";
const Room: React.FC<{ act: RoomAct; phone?: number; m?: number }> = ({ act, phone = 1, m = 0 }) => {
  const f = useCurrentFrame();
  let pose: Pose;
  if (act === "phone") pose = { ...FLOOR_SIT, ...PHONE_UP, blink: blink(f, 1), browUp: 0.5 };
  else if (act === "dark") pose = { ...FLOOR_SIT, head: [0.15, 0, 0], browUp: 0.8, blink: f % 97 < 4 ? 1 : 0, shL: [-0.3, 0, 0.3], shR: [-0.3, 0, -0.3], elL: -1.6, elR: -1.6 };
  else if (act === "unwrap") pose = { ...FLOOR_SIT, ...BOOK_HOLD, shR: [-0.95 + Math.sin(f / 4) * 0.08, 0.35, -0.2], blink: blink(f, 1), browUp: 0.4 };
  else if (act === "read") pose = { ...FLOOR_SIT, ...BOOK_HOLD, blink: blink(f, 1), browUp: 0.3 };
  else if (act === "decide") pose = { ...FLOOR_SIT, ...blendPose(BOOK_HOLD, { shR: [-0.5, 0.1, -0.15], elR: -0.9, shL: [-0.4, 0, 0.3], elL: -1.0, head: [0.05, 0, 0] }, io(f, 0, 18, 0, 1)), mouth: m, browUp: -0.1, blink: blink(f, 1) };
  else pose = { ...FLOOR_SIT, ...WRITE(f), blink: 0 };
  const showBook = act === "unwrap" || act === "read" || (act === "decide" && f < 10);
  return (
    <Bedroom phone={phone}>
      <Char L={act === "phone" ? TON_HOME_PHONE : TON_HOME} p={SEAT} ry={0} pose={pose} seed={1} />
      {showBook ? <group position={[SEAT[0], 0.42, SEAT[2] + 0.32]} rotation={[-0.9, 0, 0]}>
        <mesh><boxGeometry args={[0.15, 0.21, act === "read" ? 0.02 : 0.025]} /><meshStandardMaterial color={act === "read" ? "#F3EFE4" : "#121317"} /></mesh>
        {act !== "read" ? <mesh position={[0, 0.03, 0.014]}><boxGeometry args={[0.1, 0.04, 0.002]} /><meshStandardMaterial color="#C8323A" /></mesh> : null}
        {act === "unwrap" ? <mesh position={[0.05 + io(f, 4, 40, 0, 0.12), 0, 0.016]}><boxGeometry args={[0.16, 0.22, 0.003]} /><meshStandardMaterial color="#B89A6A" /></mesh> : null}
      </group> : null}
    </Bedroom>
  );
};
const SRoomPhone = () => { const f = useCurrentFrame(); return <Shot><Room act="phone" /><Cam p={[SEAT[0] + 0.2, FLOOR_FACE + 0.12, SEAT[2] + 1.45 - Math.min(f, 90) * 0.002]} t={[SEAT[0], FLOOR_FACE - 0.02, SEAT[2]]} fov={40} drift={0.3} /></Shot>; };
const SRoomDark = () => { const f = useCurrentFrame(); return <Shot><Room act="dark" phone={0.25} /><Cam p={[SEAT[0] - 0.15, FLOOR_FACE + 0.05, SEAT[2] + 1.4 - f * 0.004]} t={[SEAT[0], FLOOR_FACE - 0.02, SEAT[2]]} fov={36} drift={0.25} /></Shot>; };
const SRoomUnwrap = () => { const f = useCurrentFrame(); return <Shot><Room act="unwrap" phone={0.6} /><Cam p={[1.15, 1.35, 1.25 - f * 0.002]} t={[SEAT[0], 0.45, SEAT[2]]} fov={46} drift={0.3} /></Shot>; };
const SEyes = () => { const f = useCurrentFrame(); return <Shot><Room act="read" phone={0.7} /><pointLight position={[SEAT[0] + 0.1, FLOOR_FACE - 0.05, SEAT[2] + 0.6]} intensity={0.8} distance={1.4} color="#DDE6FF" /><Cam p={[SEAT[0] + 0.12, FLOOR_FACE + 0.06, SEAT[2] + 1.25 - f * 0.002]} t={[SEAT[0], FLOOR_FACE - 0.02, SEAT[2]]} fov={28} drift={0.2} /></Shot>; };
const SDecide = () => { const f = useCurrentFrame(); const m = useMouth("ton"); return <Shot><Room act="decide" phone={0.6} m={m} /><Cam p={[SEAT[0] + 0.25, FLOOR_FACE + 0.1, SEAT[2] + 1.45 - Math.min(f, 80) * 0.004]} t={[SEAT[0], FLOOR_FACE - 0.03, SEAT[2]]} fov={38} drift={0.3} /></Shot>; };

/* ═════════ stall ═════════ */
const DAD3: V3 = [WOK[0], 0, -0.62];
const MOM3: V3 = [COIN_TABLE[0], 0, COIN_TABLE[2] - 0.5];
const TON3: V3 = [1.05, 0, 0.75];
const TON_GIVE: V3 = [0.42, 0, 0.85];   // ending: after closing, in front of the cart, face to face
const DAD_END: V3 = [-0.38, 0, 0.85];
type StallAct = { ton?: "stack" | "answer" | "give"; dad?: "fry" | "off" | "hands" | "talk" | "freeze"; mom?: "count" | "talk"; drop?: boolean; mt?: number; md?: number; mm?: number };
const StallScene: React.FC<StallAct> = ({ ton = "stack", dad = "fry", mom = "count", drop, mt = 0, md = 0, mm = 0 }) => {
  const f = useCurrentFrame();
  const tonP = ton === "give" ? TON_GIVE : TON3;
  const tonPose: Pose = ton === "stack" ? { ...reachPose(0.6), spine: [0.5 + Math.sin(f / 9) * 0.1, 0, 0], head: [0.4, 0, 0], blink: blink(f, 1) }
    : ton === "answer" ? { head: [0.05, 0, 0], browUp: 0.6, mouth: mt, blink: blink(f, 1) }
    : { ...reachPose(io(f, 0, 14, 0.2, 0.85)), shL: [-0.9, 0, 0.1], elL: -0.6, head: [0.05, 0, 0], browUp: 0.6, mouth: mt, blink: blink(f, 1) };
  const trem = (k: number) => Math.sin(f * 2.3) * 0.035 * k + Math.sin(f * 3.7) * 0.02 * k;
  const dadPose: Pose = dad === "fry" ? { ...fry(f), blink: blink(f, 2) }
    : dad === "hands" ? { shR: [-1.05 + trem(1), 0.1, -0.15], elR: -1.2 + trem(1), shL: [-0.9 + trem(0.8), -0.1, 0.15], elL: -1.2, spine: [0.2, 0, 0], head: [0.45, 0, 0], blink: blink(f, 2) }
    : dad === "talk" ? { shR: [-0.3, 0, -0.15], elR: -0.5, head: [0.05, 0.2, 0], browUp: 0.2, mouth: md, blink: blink(f, 2) }
    : dad === "freeze" ? { shR: [-0.8, 0, -0.1], elR: -1.2, shL: [-0.8, 0, 0.1], elL: -1.2, head: [0.2, -0.15, 0], browUp: io(f, 0, 10, 0.2, 1), blink: 0 }
    : { shR: [-0.3, 0, -0.15], elR: -0.5, head: [0.1, 0.25, 0], browUp: 0.3, blink: blink(f, 2) };
  const momPose: Pose = mom === "talk" ? { ...count(f), head: [0.05, -0.55, 0], mouth: mm, blink: blink(f, 4) } : { ...count(f), blink: blink(f, 4) };
  const fall = drop ? io(f, 4, 22, 0, 1) : 0;
  return (
    <Stall>
      <Char L={DAD} p={ton === "give" ? DAD_END : DAD3} ry={ton === "give" ? yawTo(DAD_END, TON_GIVE) - 0.45 : 0} pose={dadPose} seed={2} />
      <Char L={MOM} p={MOM3} ry={0} pose={momPose} seed={4} />
      <Char L={TON_HOME} p={tonP} ry={ton === "answer" ? yawTo(TON3, MOM3) : ton === "give" ? yawTo(TON_GIVE, DAD_END) + 0.45 : yawTo(TON3, DAD3)} pose={tonPose} seed={1} />
      <mesh position={[MOM3[0], 0.22, MOM3[2]]}><cylinderGeometry args={[0.15, 0.17, 0.44, 16]} /><meshStandardMaterial color="#2F6FB0" /></mesh>
      <pointLight position={[MOM3[0] - 0.4, 1.3, MOM3[2] + 0.9]} intensity={0.9} distance={2.4} color="#FFE4C8" />
      <pointLight position={[TON3[0] - 0.3, 1.6, TON3[2] + 0.9]} intensity={0.8} distance={2.6} color="#FFE2B8" />
      <pointLight position={[0.0, 1.8, 2.0]} intensity={ton === "give" ? 1.3 : 0} distance={3.5} color="#FFD9A8" />
      {ton === "give" ? <mesh position={[TON_GIVE[0] - 0.36, 1.08, TON_GIVE[2] + 0.12]} rotation={[-0.4, -1.2, 0]}><boxGeometry args={[0.15, 0.2, 0.012]} /><meshStandardMaterial color="#E9E2CF" /></mesh> : null}
      {drop ? [0, 1, 2].map((i) => <mesh key={i} position={[BIN[0] + (i - 1) * 0.05, 1.05 - fall * (0.55 + i * 0.05), BIN[2]]}><sphereGeometry args={[0.05, 12, 10]} /><meshStandardMaterial color="#B8732E" /></mesh>) : null}
    </Stall>
  );
};
const HM = face(MOM) - 0.3 * SLIM.leg * MOM.height, HT = face(TON), HD = face(DAD);
const SMom = () => { const f = useCurrentFrame(); return <Shot><StallScene mom="talk" ton="answer" mm={useMouth("mom")} /><Cam p={[MOM3[0] - 0.75, HM + 0.15, MOM3[2] + 1.75 - f * 0.003]} t={[MOM3[0], HM - 0.05, MOM3[2]]} fov={31} drift={0.4} /></Shot>; };
const STonAnswer = () => { const f = useCurrentFrame(); const d = yawTo(TON3, MOM3); return <Shot><StallScene ton="answer" mt={useMouth("ton")} /><Cam p={[TON3[0] + Math.sin(d) * 1.95, HT + 0.02, TON3[2] + Math.cos(d) * 1.95 - f * 0.002]} t={[TON3[0], HT - 0.06, TON3[2]]} fov={31} drift={0.4} /></Shot>; };
const SStallWide = () => { const f = useCurrentFrame(); return <Shot><StallScene ton="stack" /><Cam p={[1.6, 1.55, 4.3 - f * 0.006]} t={[0.3, 1.0, -0.5]} fov={44} drift={0.4} /></Shot>; };
const SDad = () => { const f = useCurrentFrame(); return <Shot><StallScene dad="talk" ton="stack" md={useMouth("dad")} /><Cam p={[DAD3[0] + 0.45, HD + 0.05, DAD3[2] + 1.9 - f * 0.003]} t={[DAD3[0], HD - 0.06, DAD3[2]]} fov={31} drift={0.4} /></Shot>; };
const SDadHands = () => { const f = useCurrentFrame(); return <Shot tilt={false}><StallScene dad="hands" ton="stack" /><pointLight position={[DAD3[0] + 0.5, 1.4, DAD3[2] + 0.4]} intensity={0.8} distance={1.6} color="#FFD3A0" /><Cam p={[DAD3[0] + 0.85, 1.32 - f * 0.0008, DAD3[2] + 0.2]} t={[DAD3[0] + 0.05, 1.0, DAD3[2] + 0.28]} fov={30} drift={0.25} /></Shot>; };
const SBin = () => { const f = useCurrentFrame(); return <Shot><StallScene drop ton="stack" /><pointLight position={[BIN[0] + 0.4, 1.4, BIN[2] + 0.6]} intensity={1.2} distance={2.2} color="#FFD3A0" /><Cam p={[BIN[0] + 0.6, 1.3, BIN[2] + 1.2 - f * 0.003]} t={[BIN[0], 0.75, BIN[2]]} fov={38} drift={0.3} /></Shot>; };
const SGiveWide = () => { const f = useCurrentFrame(); return <Shot><StallScene ton="give" dad="off" /><Cam p={[0.02, 1.45, 3.5 - f * 0.006]} t={[0.02, 1.15, 0.85]} fov={40} drift={0.4} /></Shot>; };
const STonGive = () => { const f = useCurrentFrame(); const k = 1.9 - Math.min(f, 70) * 0.008; return <Shot><StallScene ton="give" dad="off" mt={useMouth("ton")} /><Cam p={[TON_GIVE[0] - 0.3, HT + 0.1, TON_GIVE[2] + k]} t={[TON_GIVE[0], HT - 0.05, TON_GIVE[2]]} fov={31} drift={0.25} /></Shot>; };
const SDadFreeze = () => { const f = useCurrentFrame(); const k = 1.85 - f * 0.012; return <Shot><StallScene ton="give" dad="freeze" /><Cam p={[DAD_END[0] + 0.3, HD + 0.08, DAD_END[2] + k]} t={[DAD_END[0], HD - 0.04, DAD_END[2]]} fov={30} drift={0.15} /></Shot>; };

/* ═════════ DOM inserts ═════════ */
/** lock-screen banner (EP1 cliffhanger) over Ton's face */
const ThreatBanner: React.FC = () => {
  const s = useSpr(0, 13);
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div style={{ marginTop: 300, width: 900, background: "rgba(30,32,40,0.94)", borderRadius: 36, padding: "28px 36px", fontFamily: SANS, transform: `translateY(${(1 - s) * -160}px)`, opacity: s }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: "#9AA0AE", fontSize: 30 }}><span>ข้อความ · ภาคิน</span><span>เมื่อคืน</span></div>
        <div style={{ color: "#F4F5F8", fontSize: 44, fontWeight: 600, marginTop: 14, lineHeight: 1.35 }}>พรุ่งนี้เอาไก่มาให้กูด้วยนะ<br />ถ้าไม่เอามา มึงเจอดีแน่</div>
        <div style={{ color: "#6F7686", fontSize: 28, marginTop: 14 }}>อ่านแล้ว · ไม่ได้ตอบ</div>
      </div>
    </AbsoluteFill>
  );
};
/** the parcel opens: plain dark book "เปลี่ยนอนาคต" (no author, no real cover — revealed in EP3) */
const BookReveal: React.FC = () => {
  const f = useCurrentFrame(); const slide = io(f, 2, 22, 0, 1); const s = useSpr(14, 15);
  return (
    <AbsoluteFill style={{ background: "#07080C", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", width: 560, height: 800 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 14, background: "linear-gradient(160deg,#1B1D22,#0C0D10)", boxShadow: "inset 0 0 0 3px #2A2D34, 0 30px 80px rgba(120,150,255,0.18)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${0.94 + 0.06 * s})` }}>
          <div style={{ position: "absolute", left: 30, top: 0, bottom: 0, width: 8, background: "#2E3138" }} />
          <div style={{ color: RED, fontFamily: SANS, fontWeight: 700, fontSize: 120, lineHeight: 1.1, textAlign: "center" }}>เปลี่ยน<br />อนาคต</div>
          <div style={{ width: 130, height: 8, background: "#D8D2C4", marginTop: 34, borderRadius: 4 }} />
        </div>
        {/* brown paper wrap sliding off */}
        <div style={{ position: "absolute", inset: -10, borderRadius: 16, background: "repeating-linear-gradient(115deg,#B89A6A 0 26px,#AD8F60 26px 52px)", transform: `translateX(${slide * 720}px) rotate(${slide * 8}deg)` }} />
      </div>
      <Click at={14} v={0.25} />
    </AbsoluteFill>
  );
};
/** open book seen from above, one page turning */
const PageTurn: React.FC = () => {
  const f = useCurrentFrame(); const k = io(f, 6, 30, 0, 1);
  const line = (i: number) => <div key={i} style={{ height: 14, background: "#B9B2A2", borderRadius: 7, margin: "22px 0", width: `${70 + ((i * 37) % 25)}%`, opacity: 0.55 }} />;
  return (
    <AbsoluteFill style={{ background: "#0A0C12", alignItems: "center", justifyContent: "center", perspective: 2200 }}>
      <div style={{ display: "flex", transform: "rotateX(28deg)", boxShadow: "0 40px 120px rgba(160,190,255,0.12)" }}>
        <div style={{ width: 430, height: 620, background: "#EFE9DB", padding: 46, borderRadius: "10px 0 0 10px" }}>{Array.from({ length: 12 }, (_, i) => line(i))}</div>
        <div style={{ width: 430, height: 620, background: "#F3EEE1", padding: 46, borderRadius: "0 10px 10px 0", position: "relative" }}>
          {Array.from({ length: 12 }, (_, i) => line(i + 5))}
          <div style={{ position: "absolute", inset: 0, background: "#F6F1E5", transformOrigin: "left center", transform: `rotateY(${-178 * k}deg)`, borderRadius: "0 10px 10px 0", boxShadow: `${-30 * Math.sin(k * Math.PI)}px 0 40px rgba(0,0,0,0.25)` }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
/** notebook pages, day by day (montage) */
const PAGE: React.CSSProperties = { width: 900, height: 1250, background: "#F4F0E6", borderRadius: 18, padding: "70px 70px", fontFamily: HAND, color: "#22306E", boxShadow: "0 30px 90px rgba(0,0,0,0.5)", backgroundImage: "repeating-linear-gradient(transparent 0 88px, #C9D3E6 88px 90px)" };
const DAYS = [
  { d: "วันที่ 1", rows: [["ขายได้", "3,120"], ["ไก่", "1,480"], ["แป้ง", "160"], ["น้ำมัน", "240"]] },
  { d: "วันที่ 2", rows: [["ขายได้", "2,960"], ["ไก่", "1,520"], ["แก๊ส", "180"], ["ถุง/ซอส", "95"]] },
  { d: "วันที่ 3", rows: [["ขายได้", "3,340"], ["ไก่", "1,610"], ["น้ำมัน", "240"], ["เหลือทิ้ง", "12 ชิ้น"]] },
];
const NotebookDays: React.FC = () => {
  const f = useCurrentFrame(); const per = 14; const i = Math.min(DAYS.length - 1, Math.floor(f / per)); const d = DAYS[i];
  return (
    <AbsoluteFill style={{ background: "#0B0D14", alignItems: "center", justifyContent: "center" }}>
      <Click at={i * per} v={0.2} kind="tick" />
      <div style={{ ...PAGE, transform: `rotate(${-2 + i}deg)` }}>
        <div style={{ fontSize: 64, fontWeight: 600 }}>{d.d}</div>
        {d.rows.map(([k, v], j) => <div key={j} style={{ display: "flex", justifyContent: "space-between", fontSize: 54, marginTop: 34 }}><span>{k}</span><span>{v}</span></div>)}
      </div>
    </AbsoluteFill>
  );
};
/** cost chips popping as Ton lists them (roughly on the words of line 12) */
const CostChips: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame(); const items = ["ค่าไก่", "ค่าแป้ง", "ค่าน้ำมัน", "ค่าแก๊ส", "ไก่ที่เหลือทิ้ง"];
  return (
    <AbsoluteFill>
      {items.map((t, i) => { const a = Math.round((dur * FPS * (0.05 + i * 0.17))); const k = Math.max(0, Math.min(1, (f - a) / 5)); return (
        <React.Fragment key={i}>
          <Click at={a} v={0.18} kind="tick" />
          <div style={{ position: "absolute", left: 90 + (i % 2) * 420, top: 260 + i * 120, opacity: k, transform: `scale(${0.7 + 0.3 * k})`, fontFamily: SANS, fontWeight: 700, fontSize: 52, color: i === 4 ? "#FFF6EE" : "#2A2622", background: i === 4 ? RED : "#ECE5D3", padding: "8px 28px 12px", borderRadius: 14, boxShadow: "0 8px 22px rgba(0,0,0,0.45)" }}>{t}</div>
        </React.Fragment>); })}
    </AbsoluteFill>
  );
};
/** day 14: the totals; pen stops; a red circle + question mark appears (no answer until EP3) */
const Day14: React.FC = () => {
  const f = useCurrentFrame(); const ring = io(f, 46, 64, 0, 1); const q = useSpr(60, 12);
  const rows: [string, string][] = [["ยอดขายรวม 14 วัน", "44,180"], ["จ่ายค่าวัตถุดิบ", "23,960"], ["น้ำมัน แก๊ส ถุง", "6,510"], ["ไก่เหลือทิ้ง", "151 ชิ้น"], ["เงินที่เหลือจริง", "?"]];
  return (
    <AbsoluteFill style={{ background: "#0B0D14", alignItems: "center", justifyContent: "center" }}>
      <div style={{ ...PAGE, transform: `scale(${1 + Math.min(f, 90) * 0.0012})` }}>
        <div style={{ fontSize: 64, fontWeight: 600 }}>วันที่ 14</div>
        {rows.map(([k, v], j) => (
          <div key={j} style={{ display: "flex", justifyContent: "space-between", fontSize: 50, marginTop: 34, opacity: Math.min(1, Math.max(0, (f - j * 7) / 6)) }}>
            <span>{k}</span>
            <span style={{ position: "relative", color: j === 4 ? RED : undefined, fontSize: j === 4 ? 70 * (0.6 + 0.4 * q) : undefined }}>
              {v}
              {j === 4 ? <svg width="190" height="130" style={{ position: "absolute", left: -70, top: -36 }}><ellipse cx="95" cy="65" rx="84" ry="52" fill="none" stroke={RED} strokeWidth="7" strokeDasharray="420" strokeDashoffset={420 * (1 - ring)} /></svg> : null}
            </span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
/** end card: hard cut, title slams */
const NextCard: React.FC = () => {
  const f = useCurrentFrame(); const a = useSpr(4, 18), b = useSpr(14, 14);
  const shake = f >= 14 && f < 21 ? Math.sin(f * 3.1) * 7 * (21 - f) / 7 : 0;
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: SANS, transform: `translateX(${shake}px)` }}>
      <div style={{ color: CREAM, fontSize: 92, fontWeight: 700, opacity: a, transform: `scale(${1.3 - 0.3 * a})` }}>EP 3</div>
      <div style={{ width: 130, height: 7, background: RED, borderRadius: 4, margin: "24px auto", opacity: a }} />
      <div style={{ color: RED, fontSize: 70, fontWeight: 700, maxWidth: 940, lineHeight: 1.3, opacity: b, transform: `scale(${1.25 - 0.25 * b})` }}>ขายดี<br />แต่ทำไมไม่รวย?</div>
      <div style={{ color: "#8A8F9A", fontSize: 34, marginTop: 40, opacity: useSpr(30, 14) }}>ติดตามตอนต่อไป</div>
    </AbsoluteFill>
  );
};

/* ═════════ the edit ═════════ */
type Cut = { a: number; b: number; el: React.ReactNode };
const END14 = E(14);
export const CUTS: Cut[] = [
  /* hook: last night's threat, unanswered */
  { a: 0, b: E(1) + 0.3, el: <><SRoomPhone /><ThreatBanner /></> },
  /* flashback */
  { a: E(1) + 0.3, b: E(2) + 0.4, el: <Memory><SFlashback /></Memory> },
  { a: E(2) + 0.4, b: T(4) - 0.15, el: <SRoomDark /> },
  /* the stall at night */
  { a: T(4) - 0.15, b: E(4) + 0.1, el: <SMom /> },
  { a: E(4) + 0.1, b: E(5) + 0.35, el: <STonAnswer /> },
  { a: E(5) + 0.35, b: T(6) - 0.1, el: <SStallWide /> },
  { a: T(6) - 0.1, b: E(6) + 0.25, el: <SDad /> },
  { a: E(6) + 0.25, b: T(8) - 0.2, el: <SDadHands /> },
  /* the book */
  { a: T(8) - 0.2, b: mid(8) + 0.4, el: <SRoomUnwrap /> },
  { a: mid(8) + 0.4, b: T(9), el: <BookReveal /> },
  { a: T(9), b: mid(9), el: <SEyes /> },
  { a: mid(9), b: E(9) + 0.3, el: <PageTurn /> },
  { a: E(9) + 0.3, b: E(10) + 0.5, el: <SDecide /> },
  /* tracking every baht */
  { a: E(10) + 0.5, b: E(11) + 0.15, el: <NotebookDays /> },
  { a: E(11) + 0.15, b: E(12) + 0.45, el: <><SBin /><CostChips dur={E(12) - E(11)} /></> },
  { a: E(12) + 0.45, b: E(13) + 1.9, el: <Day14 /> },
  /* ending */
  { a: E(13) + 1.9, b: T(14) + 0.5, el: <SGiveWide /> },
  { a: T(14) + 0.5, b: END14 + 0.2, el: <STonGive /> },
  { a: END14 + 0.2, b: END14 + 1.5, el: <SDadFreeze /> },
  { a: END14 + 1.5, b: DUR / FPS, el: <NextCard /> },
];
export const HERO_S = E(13);

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
        {noCaps ? null : <Captions hideFrom={END14 + 0.3} />}
      </AbsoluteFill>
    </GF.Provider>
  );
};
