import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { loadFont as loadMali } from "@remotion/google-fonts/Mali";
import { Cam, Glow, Shot, type V3 } from "./kit/three";
import { Click, CREAM, DUR, FPS, FadeOut, Grain, LINE, RED, SANS, Vig, fr, io, useSpr } from "./kit/ui";
import { Char, SLIM, headCenter, type Look, type Pose } from "./rig/char";
import { DAD, KID1, KID2, PAKIN, PAKIN_ENV, PAKIN_FREE, PALA, PALB, STRANGER_J, STRANGER_W, SUPPLIER, TON, TON_HOME, TON_HOME_PHONE2, TON_PENCIL, TON_RECEIPT } from "./rig/cast";
import { SIT, walkPose, runPose } from "./rig/poses";
import { BACK_LAMP, School } from "./sets/school";
import { ACROSS, ALLEY, COIN_TABLE, Stall, WOK } from "./sets/stall";
import { Classroom, TON_DESK, TON_SEAT } from "./sets/classroom";
import { COUNTER_TOP, CUSTOMER, Market, SUP } from "./sets/market";
import { Captions } from "./ui/captions";
import MOUTH from "./mouth.json";

const HAND = loadMali("normal", { weights: ["500", "600"], subsets: ["thai", "latin"] }).fontFamily;

/** EP4 — ความจริงที่ไม่มีใครอยากให้ต้นรู้ (~88 s). Story + dialogue: the user's MASTER PROMPT (+ lines 10, 14 approved by the user).
 *  Rules: series/ton/RULES.md (hook in 3 s, reaction shots, stingers, ending: hard cut to black; the stranger's face is never shown;
 *  the envelope's contents and Pakin's motive are not revealed; the CK book does not appear). */

/* ─── timing helpers ─── */
const T = (n: number) => LINE[n - 1].t;
const E = (n: number) => LINE[n - 1].end;
const mid = (n: number) => (T(n) + E(n)) / 2;
const blink = (f: number, s = 0) => ((f + s * 23) % 83 < 4 ? 1 : 0);
const face = (L: Look) => headCenter(L);
const yawTo = (a: V3, b: V3) => Math.atan2(b[0] - a[0], b[2] - a[2]);
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

/* ─── lip-sync ─── */
const GF = React.createContext(0);
const MO = MOUTH as { fps: number; env: number[]; who: string[] };
const useMouth = (who: string) => {
  const g = React.useContext(GF);
  return MO.who[g] === who ? Math.min(0.75, (MO.env[g] ?? 0) * 0.8) : 0;
};

/* ─── poses ─── */
const WRITE = (f: number): Pose => ({ spine: [0.2, 0, 0], head: [0.45, 0, 0], shR: [-0.85 + Math.sin(f * 0.6) * 0.05, 0.1, -0.1], elR: -0.95, shL: [-0.6, 0, 0.25], elL: -1.0 });
const LAUGH = (f: number, s = 0): Pose => ({ spine: [-0.12 + Math.sin(f * 0.9 + s) * 0.05, 0, 0], head: [-0.2 + Math.sin(f * 0.9 + s) * 0.06, 0, 0], mouth: 0.45 + Math.sin(f * 1.3 + s) * 0.2, blink: 1, shL: [-0.3, 0, 0.3], elL: -1.2, shR: [-0.2, 0, -0.2], elR: -0.6 });
const SIT_Y = (SIT.y ?? 0) * SLIM.leg * TON.height;

/* ═════════ 1. the stall at closing time: the stranger is back ═════════ */
const TON_CLOSE: V3 = [0.9, 0, 0.75];           // in front of the cart, wiping the counter
const ROAD_EDGE: V3 = [-0.6, 0, 3.6];           // where Ton runs to
type NightAct = { ton?: "wipe" | "notice" | "run" | "look" | "mutter"; man?: "watch" | "walk" | "none"; mt?: number; k?: number };
const NightStreet: React.FC<NightAct> = ({ ton = "wipe", man = "none", mt = 0, k = 0 }) => {
  const f = useCurrentFrame();
  let tp: V3 = TON_CLOSE, ry = 0, pose: Pose;
  if (ton === "wipe") pose = { shR: [-1.0 + Math.sin(f / 5) * 0.15, 0.3, -0.1], elR: -0.5, spine: [0.3, 0, 0], head: [0.35, 0, 0], blink: blink(f, 1) };
  else if (ton === "notice") { ry = io(f, 0, 8, 0, 1) * yawTo(TON_CLOSE, ACROSS); pose = { head: [-0.05, 0, 0], browUp: 0.8, blink: 0 }; }
  else if (ton === "run") { tp = lerp3(TON_CLOSE, ROAD_EDGE, k); ry = yawTo(TON_CLOSE, ROAD_EDGE); pose = runPose(k * 3.0, 0, 1 - Math.max(0, k - 0.85) * 6); }
  else { tp = ROAD_EDGE; ry = yawTo(ROAD_EDGE, ALLEY) + (ton === "look" ? Math.sin(f / 9) * 0.6 : 0); pose = { head: [-0.05, ton === "look" ? Math.sin(f / 9) * 0.4 : 0, 0], browUp: 0.6, mouth: mt, blink: blink(f, 1) }; }
  const manP: V3 = man === "walk" ? lerp3(ACROSS, ALLEY, k) : ACROSS;
  const manRy = man === "walk" ? yawTo(ACROSS, ALLEY) : yawTo(ACROSS, [0, 0, 0]);
  return (
    <Stall>
      <pointLight position={[0.2, 3.2, 3.6]} intensity={1.8} distance={7} color="#8FA6E0" />
      <Char L={TON_HOME} p={tp} ry={ry} pose={pose} seed={1} />
      {man !== "none" ? <>
        <Char L={STRANGER_W} p={manP} ry={manRy} pose={man === "walk" ? { ...walkPose(k * 2.4 / 1.2 * Math.PI * 2), blink: 1 } : { head: [-0.1, 0, 0], blink: 1 }} seed={11} />
        <pointLight position={[manP[0] + 0.5, 2.6, manP[2] + 1.4]} intensity={2.4} distance={4} color="#6E86C8" />
      </> : null}
    </Stall>
  );
};
const HTH = face(TON_HOME);
/** hook: the tube light flickers, close */
const STube = () => { const f = useCurrentFrame(); return <Shot><NightStreet ton="wipe" /><Cam p={[1.2, 1.7, 2.2 - f * 0.003]} t={[0.1, 1.85, -0.25]} fov={30} drift={0.3} /></Shot>; };
const SWipeNotice = () => { const f = useCurrentFrame(); return <Shot><NightStreet ton={f < 14 ? "wipe" : "notice"} man="watch" /><pointLight position={[TON_CLOSE[0] + 0.3, HTH + 0.2, TON_CLOSE[2] + 1.0]} intensity={0.8} distance={2} color="#FFE2B8" /><Cam p={[TON_CLOSE[0] + 0.2, HTH + 0.05, TON_CLOSE[2] + 1.35 - f * 0.003]} t={[TON_CLOSE[0], HTH - 0.08, TON_CLOSE[2]]} fov={30} drift={0.3} /></Shot>; };
/** over Ton's shoulder: the man across the road turns and walks into the alley */
const SManGoes: React.FC<{ walkFrom?: number }> = ({ walkFrom = 12 }) => { const f = useCurrentFrame(); const k = io(f, walkFrom, walkFrom + 34, 0, 1); return <Shot><NightStreet ton="notice" man={f < walkFrom ? "watch" : "walk"} k={k} /><Cam p={[TON_CLOSE[0] + 1.1, HTH + 0.35, TON_CLOSE[2] - 0.5]} t={[ACROSS[0], 1.2, ACROSS[2] + 0.8]} fov={32} drift={0.3} /></Shot>; };
const SRun = () => { const f = useCurrentFrame(); const k = io(f, 0, 26, 0, 1); return <Shot><NightStreet ton="run" k={k} /><Cam p={[0.15 + 0.4 * k, 1.5, -0.6 + 2.6 * k]} t={[-0.6, 1.0, 3.8]} fov={46} drift={0.6} /></Shot>; };
const SEmptyAlley = () => { return <Shot><NightStreet ton="look" /><Cam p={[ROAD_EDGE[0] + 0.55, HTH + 0.3, ROAD_EDGE[2] - 0.9]} t={[ALLEY[0], 1.2, ALLEY[2]]} fov={38} drift={0.4} /><pointLight position={[ALLEY[0] + 1.2, 3.0, ALLEY[2] - 1.2]} intensity={2.2} distance={5} color="#7E96D8" /></Shot>; };
const STonRoad = () => { const f = useCurrentFrame(); const d = yawTo(ROAD_EDGE, ALLEY); return <Shot><NightStreet ton="mutter" mt={useMouth("ton")} /><Cam p={[ROAD_EDGE[0] + Math.sin(d) * 1.4 - 0.25, HTH + 0.03, ROAD_EDGE[2] + Math.cos(d) * 1.4 - f * 0.003]} t={[ROAD_EDGE[0], HTH - 0.05, ROAD_EDGE[2]]} fov={30} drift={0.3} /><pointLight position={[ROAD_EDGE[0] + Math.sin(d) * 0.8, HTH + 0.2, ROAD_EDGE[2] + Math.cos(d) * 0.8]} intensity={0.9} distance={1.6} color="#C8D4FF" /></Shot>; };
const STonBackWide = () => { const f = useCurrentFrame(); return <Shot><NightStreet ton="look" /><Cam p={[-0.4, 1.9, 6.2 - f * 0.006]} t={[0.0, 1.0, 1.5]} fov={42} drift={0.3} /></Shot>; };

/* ═════════ 2. classroom: mocked again in front of everyone ═════════ */
const PAK_STAND: V3 = [1.45, 0, 0.55], PAK_SIT: V3 = [1.42, 0, 1.15], PB_C: V3 = [1.75, 0, 1.85], PA_C: V3 = [0.15, 0, 1.85];
const K1: V3 = [-0.8, 0, 0.12], K2: V3 = [-2.4, 0, 1.32];
const HTS = face(TON) + SIT_Y, HB = face(PALB);
const NB_DESK: V3 = [TON_DESK[0] + 0.02, TON_DESK[1] + 0.008, TON_DESK[2] + 0.03];
type ClassAct = { ton?: "write" | "grip" | "talk"; pak?: "lean" | "sit" | "smirk" | "glare"; pb?: "talk" | "laugh"; mt?: number; mp?: number; mb?: number; k?: number };
const ClassScene: React.FC<ClassAct> = ({ ton = "write", pak = "lean", pb = "laugh", mt = 0, mp = 0, mb = 0, k = 0 }) => {
  const f = useCurrentFrame();
  const tonPose: Pose = ton === "write" ? { ...SIT, ...WRITE(f), blink: 0 }
    : ton === "grip" ? { ...SIT, ...WRITE(0), shR: [-0.85, 0.1, -0.1], elR: -1.05, head: [0.35, 0, 0], browUp: -0.6, blink: blink(f, 1) }
    : { ...SIT, shL: [-0.55, 0, 0.25], elL: -0.9, shR: [-0.85, 0.1, -0.1], elR: -1.05, head: [-0.1, -0.5, 0], browUp: -0.2, mouth: mt, blink: blink(f, 1) };
  const seated = pak === "sit" || pak === "smirk" || pak === "glare";
  const pakP: V3 = seated ? lerp3(PAK_STAND, PAK_SIT, pak === "sit" ? Math.min(1, k * 2) : 1) : PAK_STAND;
  const pakPose: Pose = pak === "lean" ? { spine: [0.35, 0, 0], head: [0.25, 0, 0], shL: [-0.5, 0, 0.2], elL: -0.6, mouth: mp, browUp: 0.5, blink: blink(f, 3), holdOff: true }
    : { ...SIT, y: (SIT.y ?? 0) * Math.min(1, pak === "sit" ? Math.max(0, k * 2 - 0.6) / 0.4 : 1), spine: [0.15, 0, 0], shL: [-0.6, 0, 0.3], elL: -0.9, head: [0.05, 0, 0], mouth: mp, browUp: pak === "glare" ? -0.9 : 0.5, blink: blink(f, 3), holdOff: true };
  return (
    <Classroom>
      <Char L={TON_PENCIL} p={TON_SEAT} ry={Math.PI} pose={tonPose} seed={1} />
      <Char L={PAKIN_FREE} p={pakP} ry={seated ? yawTo(PAK_SIT, TON_SEAT) : yawTo(PAK_STAND, NB_DESK)} pose={pakPose} seed={3} />
      {/* the chair Pakin pulls over */}
      <group position={[pakP[0], 0, pakP[2]]} rotation={[0, yawTo(PAK_SIT, TON_SEAT), 0]}>
        <mesh position={[0, 0.45, 0]}><boxGeometry args={[0.38, 0.03, 0.36]} /><meshStandardMaterial color="#A57D52" /></mesh>
        <mesh position={[0, 0.72, -0.18]}><boxGeometry args={[0.38, 0.32, 0.025]} /><meshStandardMaterial color="#A57D52" /></mesh>
        {[[-0.16, -0.15], [0.16, -0.15], [-0.16, 0.15], [0.16, 0.15]].map(([x, z], i) => <mesh key={i} position={[x, 0.22, z]}><cylinderGeometry args={[0.012, 0.012, 0.45, 8]} /><meshStandardMaterial color="#5A5E66" /></mesh>)}
      </group>
      <Char L={PALB} p={PB_C} ry={yawTo(PB_C, TON_SEAT)} pose={pb === "talk" ? { ...LAUGH(f, 2.3), mouth: mb, blink: blink(f, 6) } : LAUGH(f, 2.3)} seed={6} />
      <Char L={PALA} p={PA_C} ry={yawTo(PA_C, TON_SEAT)} pose={LAUGH(f, 1)} seed={5} />
      {/* classmates turned round in their seats */}
      <Char L={KID1} p={K1} ry={yawTo(K1, TON_SEAT)} pose={{ ...SIT, ...LAUGH(f, 4), y: SIT.y }} seed={7} />
      <Char L={KID2} p={K2} ry={yawTo(K2, TON_SEAT)} pose={{ ...SIT, head: [0.05, 0.3, 0], shL: [-1.6, 0, 0.6], elL: -2.0, mouth: 0.25, blink: blink(f, 8), y: SIT.y }} seed={8} />
      {/* Ton's blue ledger notebook, open */}
      <group position={NB_DESK} rotation={[-Math.PI / 2, 0, 0.12]}>
        <mesh><boxGeometry args={[0.32, 0.21, 0.01]} /><meshStandardMaterial color="#2F4E8C" /></mesh>
        <mesh position={[0, 0, 0.006]}><boxGeometry args={[0.31, 0.2, 0.003]} /><meshStandardMaterial color="#F1ECDD" /></mesh>
      </group>
    </Classroom>
  );
};
const SOts = () => { const f = useCurrentFrame(); return <Shot><ClassScene ton="write" pak="lean" mp={useMouth("pakin")} /><Cam p={[TON_SEAT[0] - 0.8, HTS + 0.75, TON_SEAT[2] + 0.05 - f * 0.002]} t={[NB_DESK[0] + 0.25, 0.95, NB_DESK[2] - 0.1]} fov={42} drift={0.4} /></Shot>; };
const SPalB = () => { const f = useCurrentFrame(); const d = yawTo(PB_C, TON_SEAT); return <Shot><ClassScene ton="grip" pak="lean" pb="talk" mb={useMouth("palb")} /><Cam p={[PB_C[0] + Math.sin(d) * 1.5 + 0.2, HB - 0.03, PB_C[2] + Math.cos(d) * 1.5 + f * 0.002]} t={[PB_C[0], HB - 0.06, PB_C[2]]} fov={32} drift={0.5} /></Shot>; };
const SPakSit: React.FC<{ sitBy?: number }> = ({ sitBy = 18 }) => { const f = useCurrentFrame(); const k = io(f, 0, sitBy, 0, 1); const H = face(PAKIN) + SIT_Y * Math.min(1, k); return <Shot><ClassScene ton="grip" pak={k < 1 ? "sit" : "smirk"} k={k} mp={useMouth("pakin")} /><Cam p={[PAK_SIT[0] - 0.95, H + 0.12, PAK_SIT[2] - 0.95 + f * 0.003]} t={[PAK_SIT[0], H - 0.1, PAK_SIT[2]]} fov={38} drift={0.5} /></Shot>; };
const SKids = () => { const f = useCurrentFrame(); return <Shot><ClassScene ton="grip" pak="smirk" /><Cam p={[0.1, 1.6, -2.3 + f * 0.004]} t={[0.9, 0.9, 1.3]} fov={42} drift={0.6} /></Shot>; };
const SGrip = () => { const f = useCurrentFrame(); return <Shot><ClassScene ton="grip" pak="smirk" /><Cam p={[TON_SEAT[0] + 0.1, HTS + 0.05, TON_SEAT[2] - 1.0 + f * 0.004]} t={[TON_SEAT[0], HTS - 0.05, TON_SEAT[2]]} fov={26} drift={0.2} /></Shot>; };
const STonAnswer = () => { const f = useCurrentFrame(); const d = yawTo(TON_SEAT, PAK_SIT); return <Shot><ClassScene ton="talk" pak="smirk" mt={useMouth("ton")} /><Cam p={[TON_SEAT[0] + Math.sin(d) * 1.2 - 0.35, HTS + 0.05, TON_SEAT[2] + Math.cos(d) * 1.2 - 0.6 + f * 0.002]} t={[TON_SEAT[0], HTS - 0.02, TON_SEAT[2]]} fov={32} drift={0.3} /></Shot>; };
const SPakGlare = () => { const f = useCurrentFrame(); const H = face(PAKIN) + SIT_Y; return <Shot><ClassScene ton="talk" pak="glare" /><Cam p={[0.61, HTS + 0.12, 1.58]} t={[PAK_SIT[0], H - 0.04 - f * 0.0004, PAK_SIT[2]]} fov={36 - f * 0.08} drift={0.15} /></Shot>; };

/* ═════════ 3 + 5. the stall: checking everything / the message ═════════ */
const DAD3: V3 = [WOK[0], 0, -0.62];
const TON_T: V3 = [COIN_TABLE[0], 0, COIN_TABLE[2] - 0.5];
const DAD_T: V3 = [COIN_TABLE[0] - 0.75, 0, COIN_TABLE[2] - 0.2];
const HTT = face(TON_HOME) + SIT_Y, HD = face(DAD);
type TableAct = { dusk?: boolean; ton?: "sort" | "write" | "talk" | "phone" | "flip" | "door"; dad?: "fry" | "come" | "talk" | "worry"; mt?: number; md?: number; buzz?: boolean; k?: number };
const TableScene: React.FC<TableAct> = ({ dusk, ton = "sort", dad = "fry", mt = 0, md = 0, buzz, k = 0 }) => {
  const f = useCurrentFrame();
  const base: Pose = { ...SIT, shL: [-0.7, 0, 0.2], elL: -1.0, shR: [-0.7, 0, -0.2], elR: -1.0 };
  const tonPose: Pose = ton === "sort" ? { ...base, shR: [-0.8 + Math.sin(f / 6) * 0.12, 0.2 + Math.sin(f / 9) * 0.2, -0.1], spine: [0.2, 0, 0], head: [0.45, 0, 0], mouth: mt, blink: blink(f, 1) }
    : ton === "write" ? { ...SIT, ...WRITE(f), mouth: mt }
    : ton === "phone" ? { ...base, shR: [-1.05, 0.3, -0.25], elR: -1.5, head: [0.35, 0, 0], browUp: io(f, 0, 20, 0, 1), blink: 0 }
    : ton === "flip" ? { ...base, shR: [-0.75, 0.1, -0.1], elR: -0.6, head: [0.15, 0, 0], browUp: 0.7, mouth: mt, blink: blink(f, 1) }
    : ton === "door" ? { ...base, head: [0.0, 0.5, 0], browUp: 0.9, blink: 0 }
    : { ...base, head: [0.05, 0.55, 0], mouth: mt, browUp: 0.3, blink: blink(f, 1) };
  const dadP: V3 = dad === "fry" ? DAD3 : dad === "come" ? lerp3(DAD3, DAD_T, k) : DAD_T;
  const dadRy = dad === "fry" ? 0 : dad === "come" ? yawTo(DAD3, DAD_T) : yawTo(DAD_T, TON_T);
  const dadPose: Pose = dad === "fry" ? { shR: [-1.0 + Math.sin(f / 6) * 0.18, 0.15, -0.15], elR: -0.95, spine: [0.12, 0, 0], head: [0.3, 0, 0], blink: blink(f, 2) }
    : dad === "come" ? { ...walkPose(k * 1.4 / 1.2 * Math.PI * 2, 1 - Math.max(0, k - 0.85) * 6), blink: blink(f, 2) }
    : { shR: [-0.3, 0, -0.15], elR: -0.5, shL: [-0.3, 0, 0.15], elL: -0.5, head: [0.25, 0, 0], browUp: dad === "worry" ? 0.9 : 0.3, mouth: md, blink: blink(f, 2) };
  const phoneLit = buzz ? 1 : 0.15; const shake = buzz ? Math.sin(f * 2.7) * 0.004 : 0;
  return (
    <Stall dusk={dusk}>
      <Char L={DAD} p={dadP} ry={dadRy} pose={dadPose} seed={2} />
      <Char L={ton === "phone" ? TON_HOME_PHONE2 : TON_HOME} p={TON_T} ry={0} pose={tonPose} seed={1} />
      <mesh position={[TON_T[0], 0.21, TON_T[2] + 0.05]}><cylinderGeometry args={[0.15, 0.17, 0.42, 16]} /><meshStandardMaterial color="#2F6FB0" /></mesh>
      <group position={[COIN_TABLE[0], 0.716, COIN_TABLE[2]]}>
        <mesh position={[-0.12, 0, 0.12]} rotation={[-Math.PI / 2, 0, 0.1]}><boxGeometry args={[0.16, 0.21, 0.012]} /><meshStandardMaterial color="#2F4E8C" /></mesh>
        {Array.from({ length: 6 }, (_, i) => <mesh key={i} position={[0.0 + i * 0.06, 0.002 + i * 0.0005, 0.12 - (i % 2) * 0.07]} rotation={[-Math.PI / 2, 0, i * 0.15 - 0.3]}><planeGeometry args={[0.08, 0.14]} /><meshStandardMaterial color="#FBFAF4" /></mesh>)}
        <mesh position={[-0.32, 0.01, -0.12]}><boxGeometry args={[0.09, 0.02, 0.14]} /><meshStandardMaterial color="#2A2C31" /></mesh>
        {/* Ton's phone on the table (face up / face down) */}
        {ton !== "phone" ? <group position={[0.28 + shake, 0.006, -0.1]} rotation={[-Math.PI / 2, 0, -0.3]}>
          <mesh><boxGeometry args={[0.075, 0.15, 0.01]} /><meshStandardMaterial color="#1A1B1F" /></mesh>
          {ton !== "flip" || f < 10 ? <mesh position={[0, 0, 0.0056]}><boxGeometry args={[0.066, 0.135, 0.002]} /><meshStandardMaterial color="#BFD6F2" emissive="#BFD6F2" emissiveIntensity={phoneLit} /></mesh> : null}
        </group> : null}
      </group>
      {buzz ? <pointLight position={[COIN_TABLE[0] + 0.28, 0.85, COIN_TABLE[2] - 0.1]} intensity={0.6} distance={0.8} color="#BFD6F2" /> : null}
      {!dusk ? <><pointLight position={[COIN_TABLE[0] - 0.3, 1.15, COIN_TABLE[2] + 0.1]} intensity={1.1} distance={2.2} color="#FFD49A" /><Glow p={[COIN_TABLE[0] - 0.3, 1.05, COIN_TABLE[2] + 0.1]} s={0.5} c="#FFD49A" o={0.5} /></> : null}
      <pointLight position={[TON_T[0], 1.6, TON_T[2] + 1.2]} intensity={0.7} distance={2.6} color="#FFE2B8" />
    </Stall>
  );
};
const STonSort = () => { const f = useCurrentFrame(); return <Shot><TableScene dusk ton="sort" mt={useMouth("ton")} /><Cam p={[TON_T[0] - 0.55, HTT + 0.1, TON_T[2] + 1.45 - f * 0.002]} t={[TON_T[0], HTT - 0.1, TON_T[2] + 0.1]} fov={33} drift={0.4} /></Shot>; };
const SDadCome = () => { const f = useCurrentFrame(); const k = io(f, 0, 30, 0, 1); return <Shot><TableScene dusk ton="write" dad={k < 1 ? "come" : "talk"} k={k} md={useMouth("dad")} /><Cam p={[2.4, 1.55, 1.4 - f * 0.004]} t={[0.6, 1.1, -1.0]} fov={40} drift={0.4} /></Shot>; };
const STonExplain: React.FC<{ night?: boolean }> = ({ night }) => { const f = useCurrentFrame(); return <Shot><TableScene dusk={!night} ton="talk" dad="talk" mt={useMouth("ton")} /><Cam p={[TON_T[0] + 0.55, HTT + 0.06, TON_T[2] + 1.35 - f * 0.002]} t={[TON_T[0], HTT - 0.05, TON_T[2]]} fov={31} drift={0.4} /></Shot>; };
const SDadNight: React.FC<{ worry?: boolean }> = ({ worry }) => { const f = useCurrentFrame(); const d = yawTo(DAD_T, TON_T); return <Shot><TableScene ton="talk" dad={worry ? "worry" : "talk"} md={useMouth("dad")} /><Cam p={[DAD_T[0] + Math.sin(d) * 1.4 + 0.3, HD + 0.06, DAD_T[2] + Math.cos(d) * 1.4 + 0.6 - f * 0.002]} t={[DAD_T[0], HD - 0.05, DAD_T[2]]} fov={31} drift={0.4} /></Shot>; };
/** the phone buzzes on the table (flat insert: exact framing, no 3D clutter) */
const SPhoneBuzz: React.FC = () => {
  const f = useCurrentFrame(); const b = Math.sin(f * 2.6) * (f % 12 < 8 ? 7 : 0);
  return (
    <AbsoluteFill style={{ ...WOOD, filter: "brightness(0.75)" }}>
      <AbsoluteFill style={{ background: "radial-gradient(50% 40% at 50% 48%, rgba(190,214,242,0.35), transparent 70%)" }} />
      <div style={{ position: "absolute", left: 300, top: 560, width: 470, height: 860, borderRadius: 54, background: "#141519", border: "8px solid #2A2C32", transform: `rotate(${-8 + b * 0.2}deg) translateX(${b}px)`, boxShadow: "0 30px 60px rgba(0,0,0,0.6), 0 0 80px rgba(190,214,242,0.35)" }}>
        <div style={{ position: "absolute", inset: 18, borderRadius: 40, background: "linear-gradient(180deg,#22283A,#141824)" }} />
        <div style={{ position: "absolute", left: 40, right: 40, top: 300, height: 120, borderRadius: 24, background: "rgba(60,66,82,0.95)" }} />
      </div>
      <div style={{ position: "absolute", left: 60, top: 300, width: 300, height: 400, background: "#2F4E8C", transform: "rotate(10deg)", borderRadius: 8, boxShadow: "0 14px 30px rgba(0,0,0,0.5)" }} />
      <Click at={0} v={0.0} />
    </AbsoluteFill>
  );
};
const STonRead = () => { const f = useCurrentFrame(); return <Shot><TableScene ton="phone" dad="talk" /><pointLight position={[TON_T[0] + 0.05, HTT - 0.15, TON_T[2] + 0.4]} intensity={0.7} distance={1} color="#BFD6F2" /><Cam p={[TON_T[0] - 0.1, HTT + 0.02, TON_T[2] + 1.05 - f * 0.004]} t={[TON_T[0], HTT - 0.05, TON_T[2]]} fov={28} drift={0.2} /></Shot>; };
const SDoorway = () => { const f = useCurrentFrame(); return <Shot><TableScene ton="door" dad="worry" /><Cam p={[TON_T[0] + 0.45, HTT + 0.03, TON_T[2] + 1.1 - f * 0.004]} t={[TON_T[0], HTT - 0.03, TON_T[2]]} fov={28} drift={0.3} /></Shot>; };
const STonFlip = () => { const f = useCurrentFrame(); return <Shot><TableScene ton="flip" dad="worry" mt={useMouth("ton")} /><Cam p={[TON_T[0] - 0.35, HTT + 0.04, TON_T[2] + 1.3 - f * 0.004]} t={[TON_T[0], HTT - 0.07, TON_T[2]]} fov={30} drift={0.3} /></Shot>; };

/* ═════════ 4. the market ═════════ */
type MarketAct = { ton?: "show" | "think" | "freeze" | "talk"; sup?: "check" | "point" | "ask" | "stare"; mt?: number; ms?: number };
const MarketScene: React.FC<MarketAct> = ({ ton = "show", sup = "check", mt = 0, ms = 0 }) => {
  const f = useCurrentFrame();
  const tonPose: Pose = ton === "show" ? { shR: [-1.1, 0.2, -0.1], elR: -0.6, head: [0.15, 0, 0], browUp: 0.3, mouth: mt, blink: blink(f, 1) }
    : ton === "think" ? { shR: [-0.9, 0.2, -0.1], elR: -1.2, head: [0.4, 0, 0], browUp: 0.2, mouth: mt, blink: blink(f, 1) }
    : ton === "freeze" ? { shR: [-0.6, 0.1, -0.1], elR: -1.0, head: [-0.05, 0, 0], browUp: 1, blink: 0 }
    : { shR: [-0.6, 0.1, -0.1], elR: -1.0, head: [-0.05, 0, 0], browUp: 0.4, mouth: mt, blink: blink(f, 1) };
  const supPose: Pose = sup === "check" ? { shR: [-1.0, 0.2, -0.15], elR: -1.2, shL: [-1.0, -0.2, 0.15], elL: -1.2, head: [0.35, 0, 0], blink: blink(f, 4) }
    : sup === "point" ? { shL: [-1.2, -0.1, 0.1], elL: -0.3, shR: [-0.9, 0.2, -0.15], elR: -1.2, head: [0.2, 0, 0], mouth: ms, browUp: 0.3, blink: blink(f, 4) }
    : sup === "ask" ? { shR: [-0.4, 0, -0.15], elR: -0.6, head: [0.05, 0, 0.08], mouth: ms, browUp: -0.2, blink: blink(f, 4) }
    : { head: [0.1, 0, 0.12], browUp: -0.5, blink: 0 };
  return (
    <Market>
      <Char L={SUPPLIER} p={SUP} ry={0} pose={supPose} seed={12} />
      <Char L={ton === "show" || ton === "think" ? TON_RECEIPT : TON_HOME} p={CUSTOMER} ry={Math.PI + 0.15} pose={tonPose} seed={1} />
      {sup === "check" || sup === "point" ? <mesh position={[SUP[0], COUNTER_TOP + 0.02, 0.05]} rotation={[-Math.PI / 2, 0, 0.2]}><planeGeometry args={[0.12, 0.2]} /><meshStandardMaterial color="#FBFAF4" /></mesh> : null}
    </Market>
  );
};
const HSU = face(SUPPLIER), HTM = face(TON_HOME);
const SMarketWide = () => { const f = useCurrentFrame(); return <Shot><MarketScene ton="show" sup="check" /><Cam p={[1.9, 1.55, 3.4 - f * 0.006]} t={[0.15, 1.15, 0.0]} fov={42} drift={0.4} /></Shot>; };
const SSupPoint: React.FC<{ ask?: boolean }> = ({ ask }) => { const f = useCurrentFrame(); return <Shot><MarketScene ton={ask ? "freeze" : "think"} sup={ask ? "ask" : "point"} ms={useMouth("supplier")} /><Cam p={[SUP[0] - 0.45, HSU + 0.02, SUP[2] + 1.75 - f * (ask ? 0.006 : 0.002)]} t={[SUP[0], HSU - 0.06, SUP[2]]} fov={ask ? 28 : 32} drift={0.4} /></Shot>; };
const STonMarket: React.FC<{ act: "think" | "freeze" | "talk"; fast?: boolean }> = ({ act, fast }) => { const f = useCurrentFrame(); return <Shot><MarketScene ton={act} sup={act === "think" ? "point" : "stare"} mt={useMouth("ton")} /><Cam p={[CUSTOMER[0] + 0.45, HTM + 0.04, CUSTOMER[2] - 1.45 + f * (fast ? 0.007 : 0.003)]} t={[CUSTOMER[0], HTM - 0.06, CUSTOMER[2]]} fov={30} drift={0.3} /></Shot>; };
const SSupStare = () => { const f = useCurrentFrame(); return <Shot><MarketScene ton="talk" sup="stare" /><Cam p={[SUP[0] - 0.6, HSU + 0.02, SUP[2] + 1.3 - f * 0.005]} t={[SUP[0], HSU - 0.04, SUP[2]]} fov={27} drift={0.15} /></Shot>; };

/* ═════════ 6. behind the school at night ═════════ */
const HIDE: V3 = [2.18, 0, -5.05];          // behind the pillar
const WALK0: V3 = [-1.6, 0, -4.55];
const PAK_N: V3 = [5.25, 0, -6.15], MAN_N: V3 = [5.9, 0, -6.45];
type BackAct = { ton?: "walk" | "stop" | "peek" | "hide"; give?: number; pak?: "talk" | "look"; mp?: number; k?: number };
const BackScene: React.FC<BackAct> = ({ ton = "walk", give = 0, pak = "talk", mp = 0, k = 0 }) => {
  const f = useCurrentFrame();
  const tp: V3 = ton === "walk" ? lerp3(WALK0, [HIDE[0] - 0.3, 0, -4.6], k) : ton === "hide" ? lerp3([HIDE[0] + 0.05, 0, HIDE[2] - 0.12], HIDE, Math.min(1, k)) : HIDE;
  const tonPose: Pose = ton === "walk" ? { ...walkPose(k * 3.5 / 1.2 * Math.PI * 2, 0.8), head: [0.1, 0, 0], blink: blink(f, 1) }
    : ton === "stop" ? { head: [0, 0.5, 0], browUp: 0.7, blink: 0 }
    : ton === "peek" ? { spine: [0.1, 0, -0.1], head: [0, 0, -0.05], shL: [-0.4, 0, 0.5], elL: -0.9, browUp: 1, blink: 0 }
    : { spine: [-0.05, 0, 0], head: [-0.15, -0.3, 0], shL: [-0.2, 0, 0.2], shR: [-0.2, 0, -0.2], browUp: 1, mouth: 0.15, blink: 0 };
  const tonRy = ton === "walk" ? Math.PI / 2 : ton === "hide" ? -1.3 : ton === "peek" ? 1.91 : Math.PI / 2 - 0.35;
  // envelope: stranger's hand -> Pakin's hand (give 0..1)
  const pakPose: Pose = pak === "look" ? { shR: [-0.7, 0, -0.1], elR: -0.9, head: [0, -0.9, 0], browUp: -0.3, blink: blink(f, 3) }
    : { shR: [-0.9 * Math.min(1, give * 1.5), 0, -0.1], elR: -0.6, head: [0.05, 0, 0], mouth: mp, browUp: -0.2, blink: blink(f, 3) };
  const manPose: Pose = { shR: [-1.1 * (give > 0 && give < 1 ? 1 : give >= 1 ? 0.2 : 0.4), 0, -0.1], elR: -0.4, head: [-0.05, 0, 0], blink: 1 };
  return (
    <School night>
      <Char L={TON} p={tp} ry={tonRy} pose={tonPose} seed={1} />
      <Char L={give >= 0.6 ? PAKIN_ENV : PAKIN_FREE} p={PAK_N} ry={pak === "look" ? yawTo(PAK_N, MAN_N) - 2.2 : yawTo(PAK_N, MAN_N)} pose={pakPose} seed={3} />
      <Char L={give >= 0.6 ? STRANGER_W : STRANGER_J} p={MAN_N} ry={yawTo(MAN_N, PAK_N)} pose={manPose} seed={11} />
      <pointLight position={[MAN_N[0] + 0.8, 1.8, MAN_N[2] - 0.9]} intensity={1.6} distance={3} color="#6E86C8" />
    </School>
  );
};
const HTN = face(TON), HPN = face(PAKIN);
const SBackWalk = () => { const f = useCurrentFrame(); const k = io(f, 0, 60, 0, 1); return <Shot><BackScene ton="walk" k={k} /><pointLight position={[WALK0[0] + 3.2 * k, 2.2, -4.0]} intensity={0.8} distance={2.5} color="#8FA6E0" /><Cam p={[WALK0[0] + 3.0 * k - 1.0, 1.45, -3.4]} t={[WALK0[0] + 3.4 * k, 1.05, -4.6]} fov={42} drift={0.5} /></Shot>; };
const STonStops = () => { const f = useCurrentFrame(); return <Shot><BackScene ton="stop" /><pointLight position={[HIDE[0] + 0.6, HTN + 0.2, HIDE[2] + 0.5]} intensity={0.6} distance={1.5} color="#8FA6E0" /><Cam p={[HIDE[0] + 0.85, HTN + 0.05, HIDE[2] + 0.5 - f * 0.002]} t={[HIDE[0], HTN - 0.05, HIDE[2]]} fov={30} drift={0.3} /></Shot>; };
/** distant two-shot from behind Ton's pillar */
const STwoShot: React.FC<{ give?: [number, number] }> = ({ give }) => { const f = useCurrentFrame(); const g = give ? io(f, give[0], give[1], 0, 1) : 0; return <Shot><BackScene ton="peek" give={g} mp={useMouth("pakin")} /><Cam p={[HIDE[0] + 0.1, HTN + 0.08, HIDE[2] + 0.35]} t={[(PAK_N[0] + MAN_N[0]) / 2, 1.25, (PAK_N[2] + MAN_N[2]) / 2]} fov={30} drift={0.3} /></Shot>; };
const SEnvelope = () => { const f = useCurrentFrame(); const g = io(f, 2, 22, 0, 1); return <Shot><BackScene ton="peek" give={g} /><Cam p={[(PAK_N[0] + MAN_N[0]) / 2 + 0.3, 1.5, PAK_N[2] + 2.0 - f * 0.003]} t={[(PAK_N[0] + MAN_N[0]) / 2, 1.0, (PAK_N[2] + MAN_N[2]) / 2]} fov={30} drift={0.3} /></Shot>; };
/** the stranger speaks: we only see his back, Pakin's face past his shoulder */
const SManBack = () => { const f = useCurrentFrame(); return <Shot><BackScene ton="peek" give={0.3} /><Cam p={[MAN_N[0] + 0.45, 1.6, MAN_N[2] - 0.55 + f * 0.001]} t={[PAK_N[0], HPN - 0.05, PAK_N[2]]} fov={34} drift={0.3} /></Shot>; };
const STonEyes = () => { const f = useCurrentFrame(); return <Shot><BackScene ton="peek" give={1} /><pointLight position={[HIDE[0] + 0.6, HTN, HIDE[2] - 0.4]} intensity={0.6} distance={1.3} color="#FFB45A" /><Cam p={[HIDE[0] + 1.0 - f * 0.003, HTN + 0.02, HIDE[2] + 0.03]} t={[HIDE[0], HTN - 0.02, HIDE[2]]} fov={30} drift={0.2} /></Shot>; };
const SPakLooks = () => { const f = useCurrentFrame(); return <Shot><BackScene ton="peek" give={1} pak="look" /><Cam p={[2.68, 1.5, -4.95]} t={[PAK_N[0], HPN - 0.1, PAK_N[2] + f * 0.001]} fov={24} drift={0.3} /></Shot>; };
const STonHide: React.FC<{ fastAt?: number }> = ({ fastAt = 999 }) => { const f = useCurrentFrame(); const k = io(f, 0, 8, 0, 1); const fast = io(f, fr(fastAt), fr(fastAt) + 14, 0, 0.6); return <Shot><BackScene ton="hide" give={1} pak="look" k={k} /><pointLight position={[HIDE[0] - 0.6, HTN + 0.1, HIDE[2] + 0.6]} intensity={1.1} distance={1.6} color="#8FA6E0" /><Cam p={[HIDE[0] - 0.9 + f * 0.0015 + fast * 0.5, HTN + 0.02, HIDE[2] + 0.4]} t={[HIDE[0], HTN - 0.03, HIDE[2]]} fov={30} drift={0.2} /></Shot>; };
const SBackLamp = () => { const f = useCurrentFrame(); return <Shot><BackScene ton="hide" give={1} pak="look" k={1} /><Cam p={[0.5, 1.9, -3.6 - f * 0.002]} t={[BACK_LAMP[0], 1.3, -5.6]} fov={44} drift={0.3} /></Shot>; };

/* ═════════ DOM inserts ═════════ */
const WOOD: React.CSSProperties = { background: "repeating-linear-gradient(92deg,#5A3E2A 0 46px,#523826 46px 90px,#5E412C 90px 130px)" };
const RCPT: React.CSSProperties = { position: "absolute", width: 290, background: "#FBFAF4", padding: "22px 24px 26px", fontFamily: SANS, color: "#2A2622", boxShadow: "0 14px 34px rgba(0,0,0,0.45)", fontSize: 28, lineHeight: 1.5 };
const Receipt: React.FC<{ x: number; y: number; r: number; date: string; item: string; total: string; mark?: number; o?: number }> = ({ x, y, r, date, item, total, mark = 0, o = 1 }) => (
  <div style={{ ...RCPT, left: x, top: y, transform: `rotate(${r}deg)`, opacity: o }}>
    <div style={{ fontWeight: 700, fontSize: 30, textAlign: "center", borderBottom: "2px dashed #B9B2A2", paddingBottom: 6 }}>ใบเสร็จรับเงิน</div>
    <div style={{ color: "#7A7468", marginTop: 6, fontSize: 26 }}>วันที่ {date}</div>
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}><span>{item}</span><span>10 กก.</span></div>
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontWeight: 700, position: "relative" }}><span>รวม</span><span>{total}</span>
      {mark > 0 ? <svg width="210" height="84" style={{ position: "absolute", right: -36, top: -24 }}><ellipse cx="105" cy="42" rx="96" ry="33" fill="none" stroke={RED} strokeWidth="6" strokeDasharray="420" strokeDashoffset={420 * (1 - mark)} /></svg> : null}
    </div>
  </div>
);
/** overhead: receipts slide into order by date; two similar ones get circled; a sticky note: ask the supplier */
const SortReceipts: React.FC = () => {
  const f = useCurrentFrame();
  const R = [{ d: "3", t: "1,480" }, { d: "5", t: "1,520" }, { d: "8", t: "1,650" }, { d: "10", t: "1,480" }, { d: "12", t: "1,610" }, { d: "14", t: "1,650" }];
  const ring = io(f, 46, 62, 0, 1), note = useSpr(66, 13);
  return (
    <AbsoluteFill style={{ ...WOOD, transform: `scale(${1.04 - f * 0.0006})` }}>
      {R.map((r, i) => { const k = io(f, i * 5, i * 5 + 14, 0, 1); const x = (i % 2) * 470 + 70, y = Math.floor(i / 2) * 470 + 150; return (
        <React.Fragment key={i}>
          <Receipt x={x + (1 - k) * (i % 2 ? 260 : -260)} y={y + (1 - k) * 180} r={(1 - k) * (i % 2 ? 18 : -15) + (i % 2 ? 2 : -2)} date={`${r.d} ต.ค.`} item="ไก่สด" total={r.t} mark={i === 1 || i === 2 ? ring : 0} />
          <Click at={i * 5 + 10} v={0.12} kind="tick" />
        </React.Fragment>); })}
      <div style={{ position: "absolute", left: 600, top: 1490, width: 380, padding: "26px 30px", background: "#F6E27A", fontFamily: HAND, color: "#2A2622", fontSize: 44, lineHeight: 1.35, transform: `rotate(-4deg) scale(${0.7 + 0.3 * note})`, opacity: note, boxShadow: "0 12px 26px rgba(0,0,0,0.4)" }}>พรุ่งนี้<br />ถามร้านไก่<br />5 ต.ค. / 8 ต.ค.</div>
      <Click at={66} v={0.3} />
    </AbsoluteFill>
  );
};
/** the supplier's finger on the dates: one entry was written on the wrong day */
const DatesCheck: React.FC = () => {
  const f = useCurrentFrame(); const strike = io(f, 20, 34, 0, 1); const fix = useSpr(34, 13);
  return (
    <AbsoluteFill style={{ background: "#CFC8B8", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", width: 820, height: 1100, background: "#F4F0E6", borderRadius: 14, padding: "50px 56px", fontFamily: HAND, color: "#22306E", boxShadow: "0 24px 60px rgba(0,0,0,0.35)", backgroundImage: "repeating-linear-gradient(transparent 0 84px, #C9D3E6 84px 86px)" }}>
        <div style={{ fontSize: 54, fontWeight: 600 }}>ค่าไก่</div>
        {[["3 ต.ค.", "1,480"], ["5 ต.ค.", "1,520"], ["8 ต.ค.", "1,650"]].map(([d, v], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 52, marginTop: 30 }}>
            <span style={{ position: "relative" }}>{d}
              {i === 2 ? <><div style={{ position: "absolute", left: -6, right: -6, top: "52%", height: 5, background: RED, transform: `scaleX(${strike})`, transformOrigin: "left" }} /><span style={{ position: "absolute", left: 190, top: -10, color: RED, opacity: fix, transform: `scale(${0.7 + 0.3 * fix})` }}>9 ต.ค.</span></> : null}
            </span><span>{v}</span>
          </div>))}
      </div>
      {/* the supplier's finger */}
      <div style={{ position: "absolute", left: 360 - io(f, 0, 14, 0, 120), top: 1010 + io(f, 0, 14, 300, 0), width: 90, height: 380, background: "#9A6E4E", borderRadius: 45, transform: "rotate(-25deg)", boxShadow: "0 18px 30px rgba(0,0,0,0.3)" }} />
      <Click at={34} v={0.2} kind="tick" />
    </AbsoluteFill>
  );
};
/** lesson card */
const SlamCard: React.FC<{ text: string; sub?: string }> = ({ text, sub }) => {
  const f = useCurrentFrame(); const a = useSpr(0, 14); const shake = f < 7 ? Math.sin(f * 3.1) * 9 * (7 - f) / 7 : 0;
  return (
    <AbsoluteFill style={{ background: "#0A0B10", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: SANS, transform: `translateX(${shake}px)` }}>
      <div style={{ color: CREAM, fontSize: 92, fontWeight: 700, lineHeight: 1.25, opacity: a, transform: `scale(${1.35 - 0.35 * a})`, maxWidth: 960, whiteSpace: "pre-line" }}>{text}</div>
      <div style={{ width: 160 * a, height: 9, background: RED, borderRadius: 5, margin: "30px auto 0" }} />
      {sub ? <div style={{ color: "#9AA0AE", fontSize: 42, marginTop: 34, opacity: useSpr(12, 14) }}>{sub}</div> : null}
      <Click at={0} v={0.4} />
    </AbsoluteFill>
  );
};
/** the anonymous message (added in the edit, exact text from the brief) */
const PhoneMsg: React.FC = () => {
  const f = useCurrentFrame(); const s = useSpr(3, 13); const buzz = f < 14 ? Math.sin(f * 2.9) * 6 : 0;
  return (
    <AbsoluteFill style={{ background: "#07080C", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 760, height: 1380, borderRadius: 80, background: "#111317", border: "10px solid #26282E", boxShadow: "0 0 120px rgba(150,180,255,0.18)", transform: `translateX(${buzz}px) scale(${1 + f * 0.0012})`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#1B2033,#0E1018)" }} />
        <div style={{ position: "absolute", top: 120, left: 0, right: 0, textAlign: "center", color: "#D8DCE6", fontFamily: SANS, fontSize: 120, fontWeight: 300 }}>22:47</div>
        <div style={{ position: "absolute", top: 420, left: 40, right: 40, background: "rgba(40,44,56,0.95)", borderRadius: 34, padding: "26px 32px", fontFamily: SANS, opacity: s, transform: `translateY(${(1 - s) * -120}px)` }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#9AA0AE", fontSize: 30 }}><span>ข้อความ · ไม่ทราบหมายเลข</span><span>ตอนนี้</span></div>
          <div style={{ color: "#F4F5F8", fontSize: 50, fontWeight: 600, marginTop: 14, lineHeight: 1.35 }}>เลิกตรวจสอบเรื่องร้านของแกซะ</div>
        </div>
      </div>
      <Click at={3} v={0.35} />
    </AbsoluteFill>
  );
};
const Letterbox: React.FC = () => <AbsoluteFill style={{ pointerEvents: "none" }}><div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 220, background: "#000" }} /><div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 220, background: "#000" }} /></AbsoluteFill>;
const QuestionCard: React.FC = () => {
  const f = useCurrentFrame(); const a = useSpr(5, 12); const shake = f >= 5 && f < 12 ? Math.sin(f * 3.1) * 10 * (12 - f) / 7 : 0;
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: SANS, transform: `translateX(${shake}px)` }}>
      <div style={{ color: CREAM, fontSize: 96, fontWeight: 700, lineHeight: 1.3, opacity: a, transform: `scale(${1.3 - 0.3 * a})` }}>ในซองนั้น<br /><span style={{ color: RED }}>มีอะไร?</span></div>
    </AbsoluteFill>
  );
};
const NextCard: React.FC = () => {
  const f = useCurrentFrame(); const a = useSpr(4, 18), b = useSpr(14, 14);
  const shake = f >= 14 && f < 21 ? Math.sin(f * 3.1) * 7 * (21 - f) / 7 : 0;
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: SANS, transform: `translateX(${shake}px)` }}>
      <div style={{ color: CREAM, fontSize: 92, fontWeight: 700, opacity: a, transform: `scale(${1.3 - 0.3 * a})` }}>EP 5</div>
      <div style={{ width: 130, height: 7, background: RED, borderRadius: 4, margin: "24px auto", opacity: a }} />
      <div style={{ color: RED, fontSize: 66, fontWeight: 700, maxWidth: 940, lineHeight: 1.3, opacity: b, transform: `scale(${1.25 - 0.25 * b})` }}>ข้อเสนอที่อาจเปลี่ยน<br />ชีวิตต้นไปตลอดกาล</div>
      <div style={{ color: "#8A8F9A", fontSize: 34, marginTop: 40, opacity: useSpr(30, 14) }}>ติดตามตอนต่อไป</div>
    </AbsoluteFill>
  );
};

/* ═════════ the edit ═════════ */
type Cut = { a: number; b: number; el: React.ReactNode };
const END = E(20);
export const CUTS: Cut[] = [
  /* 1. the stranger is back (hook) */
  { a: 0, b: 0.9, el: <STube /> },
  { a: 0.9, b: 2.0, el: <SWipeNotice /> },
  { a: 2.0, b: 4.0, el: <><SManGoes walkFrom={14} /><Letterbox /></> },
  { a: 4.0, b: 4.9, el: <SRun /> },
  { a: 4.9, b: T(1) + 0.1, el: <SEmptyAlley /> },
  { a: T(1) + 0.1, b: E(1) + 0.3, el: <STonRoad /> },
  { a: E(1) + 0.3, b: E(2) + 0.4, el: <STonBackWide /> },
  /* 2. classroom */
  { a: E(2) + 0.4, b: E(3) + 0.2, el: <SOts /> },
  { a: E(3) + 0.2, b: E(4) + 0.25, el: <SPalB /> },
  { a: E(4) + 0.25, b: E(5) + 0.2, el: <SPakSit /> },
  { a: E(5) + 0.2, b: E(5) + 1.5, el: <SKids /> },
  { a: E(5) + 1.5, b: T(6) - 0.05, el: <SGrip /> },
  { a: T(6) - 0.05, b: E(6) + 0.3, el: <STonAnswer /> },
  { a: E(6) + 0.3, b: E(6) + 1.6, el: <SPakGlare /> },
  /* 3. checking everything */
  { a: E(6) + 1.6, b: mid(7), el: <SortReceipts /> },
  { a: mid(7), b: E(7) + 0.3, el: <STonSort /> },
  { a: E(7) + 0.3, b: E(8) + 0.2, el: <SDadCome /> },
  { a: E(8) + 0.2, b: E(9) + 0.4, el: <STonExplain /> },
  /* 4. the market: the first answer */
  { a: E(9) + 0.4, b: T(10) + 0.2, el: <SMarketWide /> },
  { a: T(10) + 0.2, b: E(10) + 0.1, el: <SSupPoint /> },
  { a: E(10) + 0.1, b: T(11) - 0.1, el: <DatesCheck /> },
  { a: T(11) - 0.1, b: E(11) + 0.2, el: <STonMarket act="think" /> },
  { a: E(11) + 0.2, b: E(11) + 1.8, el: <SlamCard text={"อย่าเพิ่งกล่าวหา\nตรวจหลักฐานก่อน"} sub="แยกข้อเท็จจริง ออกจากการเดา" /> },
  { a: E(11) + 1.8, b: E(12) + 0.15, el: <SSupPoint ask /> },
  { a: E(12) + 0.15, b: E(13) + 0.2, el: <STonMarket act="talk" /> },
  { a: E(13) + 0.2, b: E(13) + 1.3, el: <SSupStare /> },
  /* 5. someone knows */
  { a: E(13) + 1.3, b: E(14) + 0.2, el: <SDadNight /> },
  { a: E(14) + 0.2, b: E(15) + 0.3, el: <STonExplain night /> },
  { a: E(15) + 0.3, b: E(15) + 1.0, el: <SPhoneBuzz /> },
  { a: E(15) + 1.0, b: E(15) + 2.8, el: <PhoneMsg /> },
  { a: E(15) + 2.8, b: E(15) + 3.7, el: <STonRead /> },
  { a: E(15) + 3.7, b: T(16) - 0.05, el: <SDoorway /> },
  { a: T(16) - 0.05, b: E(16) + 0.2, el: <SDadNight worry /> },
  { a: E(16) + 0.2, b: E(17) + 0.5, el: <STonFlip /> },
  /* 6. Pakin and the stranger */
  { a: E(17) + 0.5, b: E(17) + 2.5, el: <SBackWalk /> },
  { a: E(17) + 2.5, b: T(18) - 0.6, el: <STonStops /> },
  { a: T(18) - 0.6, b: E(18) + 0.2, el: <STwoShot /> },
  { a: E(18) + 0.2, b: E(19) + 0.1, el: <SManBack /> },
  { a: E(19) + 0.1, b: E(19) + 1.1, el: <SEnvelope /> },
  { a: E(19) + 1.1, b: E(19) + 1.9, el: <STonEyes /> },
  { a: E(19) + 1.9, b: T(20) + 0.2, el: <SPakLooks /> },
  { a: T(20) + 0.2, b: mid(20), el: <STonHide /> },
  { a: mid(20), b: mid(20) + 1.2, el: <SBackLamp /> },
  { a: mid(20) + 1.2, b: END + 0.45, el: <STonHide fastAt={END - (mid(20) + 1.2) - 0.9} /> },
  /* ending: hard cut to black */
  { a: END + 0.45, b: END + 2.8, el: <QuestionCard /> },
  { a: END + 2.8, b: DUR / FPS, el: <NextCard /> },
];
export const HERO_S = E(15);

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
