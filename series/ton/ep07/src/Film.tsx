import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Cam, Shot, type V3 } from "./kit/three";
import { AMB, Click, CREAM, DUR, FPS, FadeOut, Grain, LINE, RED, SANS, Vig, fr, io, useSpr } from "./kit/ui";
import { Char, SLIM, headCenter, type Look, type Pose } from "./rig/char";
import { DAD, PAKDAD, PAKIN, PAKIN_FREE, STRANGER_J, STRANGER_W, TON, TON_HOME } from "./rig/cast";
import { SIT, walkPose } from "./rig/poses";
import { COIN_TABLE, Stall } from "./sets/stall";
import { School } from "./sets/school";
import { BIKE, CarInterior, Motorbike, Warehouse } from "./sets/warehouse";
import { Captions } from "./ui/captions";
import MOUTH from "./mouth.json";

/** EP7 — คนที่อยู่เบื้องหลัง ไม่ใช่คนที่ต้นคิด (~90 s). Story + dialogue: the user's MASTER PROMPT (2026-11-06).
 *  Rules: series/ton/RULES.md (hook in 3 s, reaction shots, stingers, hard cut to black; the stranger's face is never shown; no CK book).
 *  User choices: the employer is "บริษัท ธนกิจไพศาล จำกัด" (Pakin's father); the second company's name stays blacked out. */

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
const sitY = (L: Look) => (SIT.y ?? 0) * SLIM.leg * L.height;

/* ═════════ 1–3. the old warehouse (continues EP6) ═════════ */
const STR_W: V3 = [0.5, 0, -1.75], TON_W: V3 = [0.25, 0, -0.45];
const TABLE_W: V3 = [1.25, 0, -1.05];
const HTW = face(TON_HOME), HS = face(STRANGER_J);
const TON_DOC: Look = { ...TON_HOME, holdR: "photo" };
const TON_FOLD: Look = { ...TON_HOME, holdR: "folder" };
const STR_FOLDER: Look = { ...STRANGER_W, holdR: "folder" };
type WAct = { ton?: "doc" | "shock" | "talk" | "lean" | "take" | "read"; str?: "shake" | "talk" | "point" | "give" | "free"; k?: number; mt?: number; ms?: number };
const WScene: React.FC<WAct> = ({ ton = "doc", str = "talk", k = 1, mt = 0, ms = 0 }) => {
  const f = useCurrentFrame();
  const lean = ton === "lean";
  const tp: V3 = lean ? [TON_W[0] + 0.35, 0, TON_W[2] - 0.15] : TON_W;
  const tRy = lean ? yawTo(tp, TABLE_W) : yawTo(TON_W, STR_W);
  const tonPose: Pose = ton === "doc" ? { shR: [-1.15, 0.2, -0.1], elR: -1.0, shL: [-0.6, 0, 0.2], elL: -1.1, head: [0.36, 0, 0], browUp: 0.9, mouth: mt, blink: 0 }
    : ton === "shock" ? { shR: [-0.9, 0.2, -0.1], elR: -1.0, head: [-0.05, 0, 0], browUp: 1, mouth: Math.max(mt, 0.15), blink: 0 }
    : ton === "lean" ? { spine: [0.35, 0, 0], head: [0.4, 0, 0], shL: [-0.5, 0, 0.15], elL: -0.6, shR: [-0.5, 0, -0.15], elR: -0.6, browUp: -0.4, mouth: mt, blink: blink(f, 1) }
    : ton === "take" ? { shR: [-1.3 * Math.min(1, k), 0.15, -0.05], elR: -0.5 - 0.6 * Math.max(0, k - 0.6), head: [0.15, 0, 0], browUp: 0.3, mouth: mt, blink: blink(f, 1) }
    : ton === "read" ? { shR: [-1.15, 0.2, -0.1], elR: -1.0, shL: [-0.6, 0, 0.2], elL: -1.1, head: [0.4, 0, 0], browUp: -0.6, mouth: mt, blink: blink(f, 1) }
    : { shL: [-0.15, 0, 0.12], shR: [-0.6, 0.2, -0.12], elR: -1.0, head: [0, 0, 0], browUp: -0.2, mouth: mt, blink: blink(f, 1) };
  const sRy = str === "point" ? yawTo(STR_W, TABLE_W) : yawTo(STR_W, TON_W);
  const strPose: Pose = str === "shake" ? { shL: [-0.25, 0, 0.12], elL: -0.4, shR: [-0.25, 0, -0.12], elR: -0.4, head: [0.05, Math.sin(f * 0.35) * 0.25 * Math.max(0, 1 - f / 40), 0], mouth: ms, blink: 1 }
    : str === "point" ? { shR: [-1.1, 0.1, -0.05], elR: -0.2, spine: [0.15, 0, 0], head: [0.3, 0, 0], mouth: ms, blink: 1 }
    : str === "give" ? { shR: [-1.35 * Math.min(1, k), 0.15, -0.05], elR: -0.35, head: [0.1, 0, 0], mouth: ms, blink: 1 }
    : { shL: [-0.25, 0, 0.12], elL: -0.4, shR: [-0.25, 0, -0.12], elR: -0.4, head: [0.06, 0, 0], mouth: ms, blink: 1 };
  const tonHas = ton === "take" ? (k >= 0.6 ? TON_FOLD : TON_DOC) : ton === "read" ? TON_FOLD : TON_DOC;
  const sL = str === "give" ? (k >= 0.6 ? STRANGER_W : STR_FOLDER) : STRANGER_W;
  return (
    <Warehouse>
      <Char L={tonHas} p={tp} ry={tRy} pose={tonPose} seed={1} />
      <Char L={sL} p={STR_W} ry={sRy} pose={strPose} seed={11} />
      {/* old metal table with the two documents + a printed map */}
      <group position={TABLE_W} rotation={[0, 0.4, 0]}>
        <mesh position={[0, 0.78, 0]}><boxGeometry args={[1.0, 0.04, 0.6]} /><meshStandardMaterial color="#7A7E84" metalness={0.5} roughness={0.5} /></mesh>
        {[[-0.46, -0.26], [0.46, -0.26], [-0.46, 0.26], [0.46, 0.26]].map(([x, z], i) => <mesh key={i} position={[x, 0.39, z]}><boxGeometry args={[0.04, 0.78, 0.04]} /><meshStandardMaterial color="#55585E" /></mesh>)}
        <mesh position={[-0.22, 0.802, 0.02]} rotation={[-Math.PI / 2, 0, 0.1]}><planeGeometry args={[0.21, 0.3]} /><meshStandardMaterial color="#F4F2EC" /></mesh>
        <mesh position={[0.2, 0.802, -0.02]} rotation={[-Math.PI / 2, 0, -0.08]}><planeGeometry args={[0.36, 0.26]} /><meshStandardMaterial color="#E6E2D2" /></mesh>
        <mesh position={[0.24, 0.803, 0.0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.025, 16]} /><meshStandardMaterial color="#C8323A" /></mesh>
        <pointLight position={[0, 1.4, 0.2]} intensity={0.7} distance={1.4} color="#FFD7A8" />
      </group>
      <Motorbike p={BIKE} ry={0.5} />
      <Char L={DAD} p={[BIKE[0] - 0.15, 0.22, BIKE[2] + 0.1]} ry={yawTo(BIKE, TON_W)} pose={{ ...SIT, shR: [-0.9, 0, -0.1], elR: -0.5, shL: [-0.9, 0, 0.1], elL: -0.5, blink: blink(f, 2) }} seed={2} />
      <pointLight position={[TON_W[0] + 0.3, HTW + 0.3, TON_W[2] - 0.8]} intensity={0.5} distance={1.6} color="#FFCF96" />
    </Warehouse>
  );
};
/** the stranger is never seen from the front: over his shoulder, from behind, or his hand */
const SOtsTon: React.FC<WAct & { push?: number }> = ({ push = 0.002, ...a }) => { const f = useCurrentFrame(); const d = yawTo(STR_W, TON_W); const cam: V3 = [STR_W[0] - Math.sin(d) * 0.55 + 0.32, HS + 0.06, STR_W[2] - Math.cos(d) * 0.55 + f * push]; return <Shot><WScene {...a} mt={useMouth("ton")} ms={useMouth("stranger")} /><Cam p={cam} t={[TON_W[0], HTW - 0.05, TON_W[2]]} fov={32} drift={0.3} /></Shot>; };
const STonCU: React.FC<WAct & { tight?: boolean; push?: number }> = ({ tight, push = 0.002, ...a }) => { const f = useCurrentFrame(); const d = yawTo(TON_W, STR_W) + 0.55; const r = (tight ? 0.95 : 1.2) - f * push; return <Shot><WScene {...a} mt={useMouth("ton")} ms={useMouth("stranger")} /><Cam p={orbit(TON_W, d, r, HTW + 0.03)} t={[TON_W[0], HTW - 0.06, TON_W[2]]} fov={tight ? 26 : 30} drift={0.3} /></Shot>; };
const SStrBack: React.FC<WAct> = (a) => { const f = useCurrentFrame(); const d = yawTo(STR_W, TON_W) + Math.PI - 0.62; return <Shot><WScene {...a} ms={useMouth("stranger")} mt={useMouth("ton")} /><Cam p={orbit(STR_W, d, 1.75, HS - 0.2)} t={[TON_W[0] + f * 0.0006, HTW - 0.05, TON_W[2]]} fov={36} drift={0.3} /></Shot>; };
/** high over the metal table: his hand points at the map, Ton leans in */
const STableW: React.FC<WAct> = (a) => { const f = useCurrentFrame(); return <Shot><WScene {...a} ms={useMouth("stranger")} mt={useMouth("ton")} /><Cam p={[TABLE_W[0] + 0.15, 2.15 - f * 0.002, TABLE_W[2] + 0.95]} t={[TABLE_W[0], 0.85, TABLE_W[2] - 0.05]} fov={44} drift={0.2} /></Shot>; };
/** the hand-over, seen past the stranger's shoulder */
const SHandover: React.FC<WAct> = (a) => { const f = useCurrentFrame(); const k = io(f, 4, 34, 0, 1); const d = yawTo(STR_W, TON_W); const cam: V3 = [STR_W[0] - Math.sin(d) * 0.7 - 0.35, HS - 0.25, STR_W[2] - Math.cos(d) * 0.7]; return <Shot><WScene {...a} ton="take" str="give" k={k} ms={useMouth("stranger")} mt={useMouth("ton")} /><Cam p={cam} t={[TON_W[0] + 0.1, HTW - 0.35, TON_W[2]]} fov={38} drift={0.2} /></Shot>; };
const SCircle: React.FC<WAct> = (a) => { const f = useCurrentFrame(); const d = yawTo(TON_W, STR_W) + 0.9 - f * 0.006; return <Shot><WScene {...a} mt={useMouth("ton")} ms={useMouth("stranger")} /><Cam p={orbit(TON_W, d, 1.05, HTW - 0.02)} t={[TON_W[0], HTW - 0.1, TON_W[2]]} fov={30} drift={0.2} /></Shot>; };

/* ═════════ 4. home at the stall: warm light, the table of papers ═════════ */
const TON_K: V3 = [COIN_TABLE[0] + 0.6, 0, COIN_TABLE[2]], DAD_K: V3 = [COIN_TABLE[0] - 0.6, 0, COIN_TABLE[2]];
const HTK = face(TON_HOME) + sitY(TON_HOME), HDK = face(DAD) + sitY(DAD);
type KAct = { ton?: "talk" | "point" | "firm"; dad?: "ask" | "listen" | "nod" | "wow"; mt?: number; md?: number };
const Kitchen: React.FC<KAct> = ({ ton = "talk", dad = "listen", mt = 0, md = 0 }) => {
  const f = useCurrentFrame();
  const tonPose: Pose = { ...SIT, shL: [-0.7, 0, 0.2], elL: -1.0, shR: ton === "point" ? [-1.25, 0.2, -0.1] : [-0.75, 0, -0.2], elR: ton === "point" ? -0.35 : -1.0, head: [ton === "point" ? 0.14 : 0.05, 0, 0], browUp: ton === "firm" ? -0.6 : 0, mouth: mt, blink: blink(f, 1) };
  const dadPose: Pose = { ...SIT, shL: [-0.7, 0, 0.2], elL: -1.0, shR: [-0.7, 0, -0.2], elR: -1.0, head: [dad === "nod" ? 0.12 + Math.max(0, Math.sin(f * 0.2)) * 0.12 : 0.05, 0, 0], browUp: dad === "wow" ? 1 : dad === "ask" ? 0.7 : 0.3, mouth: md, blink: blink(f, 2) };
  return (
    <Stall>
      <Char L={TON_HOME} p={TON_K} ry={-Math.PI / 2} pose={tonPose} seed={1} />
      <Char L={{ ...DAD, holdR: undefined }} p={DAD_K} ry={Math.PI / 2} pose={dadPose} seed={2} />
      {[TON_K, DAD_K].map((p, i) => <mesh key={i} position={[p[0], 0.21, p[2]]}><cylinderGeometry args={[0.15, 0.17, 0.42, 16]} /><meshStandardMaterial color={i ? "#C8323A" : "#2F6FB0"} /></mesh>)}
      {/* papers + the account notebook spread on the table */}
      <group position={[COIN_TABLE[0], 0.725, COIN_TABLE[2]]}>
        {[[-0.18, 0.05, 0.2], [0.02, -0.08, -0.15], [0.2, 0.06, 0.1]].map(([x, z, r], i) => <mesh key={i} position={[x, 0.001 * i, z]} rotation={[-Math.PI / 2, 0, r]}><planeGeometry args={[0.21, 0.29]} /><meshStandardMaterial color={i === 1 ? "#EDE7D6" : "#F6F4EE"} /></mesh>)}
        <mesh position={[0.1, 0.004, 0.12]} rotation={[-Math.PI / 2, 0, -0.3]}><planeGeometry args={[0.16, 0.21]} /><meshStandardMaterial color="#2F4E8C" /></mesh>
      </group>
      {/* warm bulb over the table */}
      <pointLight position={[COIN_TABLE[0], 1.75, COIN_TABLE[2] + 0.1]} intensity={2.4} distance={3} color="#FFB868" />
      <mesh position={[COIN_TABLE[0], 1.8, COIN_TABLE[2] + 0.1]}><sphereGeometry args={[0.05, 12, 8]} /><meshStandardMaterial color="#FFE2A8" emissive="#FFD08A" emissiveIntensity={2} /></mesh>
    </Stall>
  );
};
const STopTable: React.FC<KAct> = (a) => { const f = useCurrentFrame(); return <Shot><Kitchen {...a} mt={useMouth("ton")} md={useMouth("dad")} /><Cam p={[COIN_TABLE[0] + 0.1, 2.75 - f * 0.003, COIN_TABLE[2] + 1.35]} t={[COIN_TABLE[0], 0.85, COIN_TABLE[2]]} fov={64} drift={0.2} /></Shot>; };
const STonK: React.FC<KAct & { push?: number }> = ({ push = 0.002, ...a }) => { const f = useCurrentFrame(); const d = -Math.PI / 2 + 0.8; return <Shot><Kitchen {...a} mt={useMouth("ton")} /><Cam p={orbit(TON_K, d, 1.1 - f * push, HTK + 0.03)} t={[TON_K[0] - 0.05, HTK - 0.03, TON_K[2]]} fov={32} drift={0.2} /></Shot>; };
const SDadK: React.FC<KAct> = (a) => { const f = useCurrentFrame(); const d = Math.PI / 2 - 0.8; return <Shot><Kitchen {...a} md={useMouth("dad")} /><Cam p={orbit(DAD_K, d, 0.95 - f * 0.002, HDK + 0.03)} t={[DAD_K[0] + 0.05, HDK - 0.03, DAD_K[2]]} fov={32} drift={0.2} /></Shot>; };

/* ═════════ 5. the luxury car at night: Pakin + his father ═════════ */
const PD_C: V3 = [0.34, 0, -0.05], PK_C: V3 = [-0.34, 0, -0.05];
const HPDC = face(PAKDAD) + sitY(PAKDAD), HPKC = face(PAKIN) + sitY(PAKIN);
type CAct = { pin?: "look" | "turn" | "phone"; mpd?: number; mp?: number };
const CarScene: React.FC<CAct> = ({ pin = "look", mpd = 0, mp = 0 }) => {
  const f = useCurrentFrame();
  return (
    <CarInterior>
      <Char L={{ ...PAKDAD, holdR: "phone" }} p={PD_C} ry={-0.15} pose={{ ...SIT, handNeckR: true, shL: [-0.5, 0, 0.15], elL: -1.0, head: [0.12, -0.2, 0], browUp: -0.9, mouth: mpd, blink: blink(f, 9) }} seed={13} />
      <Char L={pin === "phone" ? PAKIN : PAKIN_FREE} p={PK_C} ry={pin === "turn" ? 0.75 : 0.1} pose={pin === "phone" ? { ...SIT, shR: [-1.1, 0.3, -0.25], elR: -1.55, shL: [-0.3, 0, 0.15], elL: -0.8, head: [0.35, 0, 0], browUp: io(f, 6, 20, -0.2, 1), mouth: mp, blink: 0 }
        : { ...SIT, shL: [-0.5, 0, 0.15], elL: -1.1, shR: [-0.5, 0, -0.15], elR: -1.1, head: [0.15, pin === "turn" ? 0.3 : 0, 0], browUp: 0.7, mouth: mp, blink: blink(f, 3) }} seed={3} />
    </CarInterior>
  );
};
const SGrip = () => { const f = useCurrentFrame(); return <Shot><CarScene mpd={useMouth("pakdad")} /><Cam p={[PD_C[0] + 0.3, HPDC + 0.1, PD_C[2] + 0.85]} t={[PD_C[0] - 0.02 + f * 0.0008, HPDC + 0.02, PD_C[2]]} fov={34} drift={0.15} /></Shot>; };
const SPdCar: React.FC<CAct> = (a) => { const f = useCurrentFrame(); return <Shot><CarScene {...a} mpd={useMouth("pakdad")} mp={useMouth("pakin")} /><Cam p={[PD_C[0] - 0.12, HPDC + 0.06, PD_C[2] + 1.0 - f * 0.002]} t={[PD_C[0], HPDC - 0.02, PD_C[2]]} fov={38} drift={0.15} /></Shot>; };
const SPkCar: React.FC<CAct> = (a) => { const f = useCurrentFrame(); return <Shot><CarScene {...a} mpd={useMouth("pakdad")} mp={useMouth("pakin")} /><Cam p={[PK_C[0] + (a.pin === "turn" ? 0.4 : 0.05), HPKC - 0.02, PK_C[2] + 1.0 - f * 0.002]} t={[PK_C[0], HPKC - 0.12, PK_C[2]]} fov={38} drift={0.15} /></Shot>; };

/* ═════════ 6. the school, next morning ═════════ */
const PAK_S: V3 = [1.1, 0, 1.1], TON_S: V3 = [0.75, 0, 2.4], TON_GATE: V3 = [-3.2, 0, 5.2];
const HTS = face(TON), HPS = face(PAKIN);
type SAct = { ton?: "walk" | "stand" | "talk" | "stare"; pin?: "wait" | "talk" | "away" | "low"; k?: number; mt?: number; mp?: number };
const SchoolScene: React.FC<SAct> = ({ ton = "stand", pin = "talk", k = 1, mt = 0, mp = 0 }) => {
  const f = useCurrentFrame();
  const tp: V3 = ton === "walk" ? lerp3(TON_GATE, TON_S, Math.min(1, k)) : TON_S;
  const tRy = ton === "walk" ? yawTo(TON_GATE, TON_S) : yawTo(TON_S, PAK_S);
  const tonPose: Pose = ton === "walk" ? { ...walkPose(Math.min(1, k) * 4.3 / 1.2 * Math.PI * 2, 1 - Math.max(0, Math.min(1, k) - 0.88) * 8), blink: blink(f, 1) }
    : { shL: [-0.12, 0, 0.12], shR: [-0.12, 0, -0.12], head: [0, 0, 0], browUp: ton === "stare" ? -0.9 : -0.4, mouth: mt, blink: ton === "stare" ? 0 : blink(f, 1) };
  const pRy = pin === "away" ? yawTo(PAK_S, TON_S) - 0.9 : yawTo(PAK_S, TON_S);
  const pinPose: Pose = pin === "wait" ? { shR: [-0.9, 0.2, -0.2], elR: -1.4, shL: [-0.2, 0, 0.12], head: [0.3, 0, 0], blink: blink(f, 3) }
    : pin === "low" ? { shL: [-0.2, 0, 0.15], shR: [-0.3, 0, -0.15], elR: -0.6, head: [0.28, -0.25, 0], browUp: 0.9, mouth: mp, blink: f % 60 < 30 ? 0 : 1 }
    : pin === "away" ? { shL: [-0.2, 0, 0.15], shR: [-0.3, 0, -0.15], elR: -0.6, head: [0.1, -0.2, 0], browUp: 0.6, mouth: mp, blink: blink(f, 3) }
    : { shL: [-0.25, 0, 0.3], elL: -1.6, shR: [-0.25, 0, -0.3], elR: -1.6, head: [-0.05, 0, 0], browUp: -0.6, mouth: mp, blink: blink(f, 3) };
  return (
    <School>
      <Char L={TON} p={tp} ry={tRy} pose={tonPose} seed={1} />
      <Char L={pin === "wait" ? PAKIN : PAKIN_FREE} p={PAK_S} ry={pRy} pose={pinPose} seed={3} />
    </School>
  );
};
const SSchoolWide = () => { const f = useCurrentFrame(); const k = io(f, 0, 80, 0, 0.75); return <Shot><SchoolScene ton="walk" pin="wait" k={k} /><Cam p={[-5.4, 1.9, 9.0 - f * 0.01]} t={[0.2, 1.2, 1.2]} fov={42} drift={0.3} /></Shot>; };
const SArrive = () => { const f = useCurrentFrame(); const k = io(f, 0, 30, 0.75, 1); return <Shot><SchoolScene ton="walk" pin="talk" k={k} mp={useMouth("pakin")} /><Cam p={[TON_S[0] - 0.55, HPS + 0.1, TON_S[2] + 1.0]} t={[PAK_S[0], HPS - 0.08, PAK_S[2]]} fov={34} drift={0.3} /></Shot>; };
const SPakS: React.FC<SAct & { push?: number }> = ({ push = 0.002, ...a }) => { const f = useCurrentFrame(); const d = yawTo(PAK_S, TON_S) - 0.45; return <Shot><SchoolScene {...a} mt={useMouth("ton")} mp={useMouth("pakin")} /><Cam p={orbit(PAK_S, d, 1.15 - f * push, HPS + 0.02)} t={[PAK_S[0], HPS - 0.06, PAK_S[2]]} fov={30} drift={0.3} /></Shot>; };
const STonS: React.FC<SAct & { push?: number }> = ({ push = 0.002, ...a }) => { const f = useCurrentFrame(); const d = yawTo(TON_S, PAK_S) + 0.45; return <Shot><SchoolScene {...a} mt={useMouth("ton")} mp={useMouth("pakin")} /><Cam p={orbit(TON_S, d, 1.15 - f * push, HTS + 0.03)} t={[TON_S[0], HTS - 0.06, TON_S[2]]} fov={30} drift={0.3} /></Shot>; };
/** over Ton's shoulder onto Pakin */
const SOtsPak: React.FC<SAct> = (a) => { const f = useCurrentFrame(); const d = yawTo(PAK_S, TON_S); const cam: V3 = [TON_S[0] + Math.sin(d) * 0.55 + 0.28, HTS + 0.12, TON_S[2] + Math.cos(d) * 0.55 - f * 0.002]; return <Shot><SchoolScene {...a} mt={useMouth("ton")} mp={useMouth("pakin")} /><Cam p={cam} t={[PAK_S[0], HPS - 0.08, PAK_S[2]]} fov={32} drift={0.3} /></Shot>; };

/* ═════════ DOM inserts ═════════ */
/** the employer line on the report: "ในนาม บริษัท ธนกิจไพศาล จำกัด" (the person's first name still under his thumb) */
const EmployerDoc: React.FC = () => {
  const f = useCurrentFrame(); const hl = io(f, 24, 40, 0, 1); const z = 1.15 + f * 0.004;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(80% 60% at 50% 45%, #2E2A22, #0A0908)", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${z})`, transformOrigin: "50% 62%" }}>
        <div style={{ position: "absolute", left: 120, top: 330, width: 840, height: 1200, background: "#FBFAF5", borderRadius: 6, padding: "50px 54px", fontFamily: SANS, color: "#22252C", boxShadow: "0 30px 80px rgba(0,0,0,0.55)", transform: "rotate(-1.2deg)" }}>
          <div style={{ fontSize: 40, fontWeight: 700 }}>รายงานการตรวจสอบ: ร้านไก่ทอด (พ่อต้น)</div>
          <div style={{ height: 3, background: "#22252C", margin: "16px 0 30px" }} />
          <div style={{ width: 732, padding: 14, background: "#EEECE6" }}><Img src={staticFile("photo_back.png")} style={{ width: "100%", display: "block", filter: "grayscale(0.35) contrast(1.1)" }} /></div>
          <div style={{ marginTop: 50, fontSize: 40, color: "#3A3E48", display: "flex", alignItems: "center" }}>
            ผู้ว่าจ้าง: คุณ
            <span style={{ position: "relative", display: "inline-block", margin: "0 40px 0 30px", color: "#3A3E48", fontWeight: 700, fontSize: 46 }}>
              ●●●●●
              <span style={{ position: "absolute", left: -18, top: -40, width: 190, height: 130, background: "linear-gradient(160deg,#8E6A4E,#6E4E36)", borderRadius: "70px 70px 60px 60px", boxShadow: "0 10px 26px rgba(0,0,0,0.45)", transform: "rotate(-8deg)" }} />
            </span>
            <span style={{ fontWeight: 700, color: "#1E2A44", fontSize: 46 }}>ธนกิจไพศาล</span>
          </div>
          <div style={{ marginTop: 34, fontSize: 44, color: "#1E2A44", fontWeight: 700 }}>
            ในนาม <span style={{ background: `rgba(217,72,59,${0.35 * hl})`, padding: "0 8px" }}>บริษัท ธนกิจไพศาล จำกัด</span>
          </div>
        </div>
      </div>
      <Click at={24} v={0.25} kind="tick" />
    </AbsoluteFill>
  );
};
/** the second document: a land-purchase proposal for a new development; the buyer's name is blacked out */
const ProjectDoc: React.FC<{ map?: boolean }> = ({ map }) => {
  const f = useCurrentFrame(); const s = useSpr(2, 14); const ring = io(f, 14, 30, 0, 1); const x = map ? io(f, 20, 34, 0, 1) : 0;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(80% 60% at 50% 45%, #33302A, #0B0A09)" }}>
      <div style={{ position: "absolute", left: 90, top: 300, width: 900, height: 1300, background: "#F6F4EE", borderRadius: 6, padding: "46px 50px", fontFamily: SANS, color: "#22252C", boxShadow: "0 30px 80px rgba(0,0,0,0.55)", transform: `translateY(${(1 - s) * 300}px) rotate(1deg) scale(${1 + f * 0.0012})` }}>
        <div style={{ fontSize: 40, fontWeight: 700 }}>ใบเสนอซื้อที่ดิน · โครงการพัฒนาพื้นที่ใหม่</div>
        <div style={{ height: 3, background: "#22252C", margin: "14px 0 24px" }} />
        <div style={{ fontSize: 34, color: "#3A3E48", display: "flex", alignItems: "center" }}>ผู้เสนอซื้อ: <span style={{ display: "inline-block", width: 420, height: 40, background: "#111", marginLeft: 18 }} /></div>
        <div style={{ fontSize: 34, color: "#3A3E48", marginTop: 14 }}>พื้นที่: ถนนหน้าร้านไก่ทอด ทั้งแนว</div>
        {/* the printed map: the street, the stall circled in red */}
        <div style={{ position: "relative", marginTop: 34, height: 760, background: "#E4E1D4", borderRadius: 6, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 330, height: 110, background: "#B9B4A4" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 383, height: 4, background: "repeating-linear-gradient(90deg,#F4F1E6 0 40px,transparent 40px 80px)" }} />
          {[60, 230, 400, 570].map((x2, i) => <div key={i} style={{ position: "absolute", left: x2, top: 120, width: 140, height: 190, background: "#CFCBBB", border: "2px solid #A8A392" }} />)}
          {[90, 300, 540].map((x2, i) => <div key={`b${i}`} style={{ position: "absolute", left: x2, top: 470, width: 170, height: 200, background: "#CFCBBB", border: "2px solid #A8A392" }} />)}
          <div style={{ position: "absolute", left: 420, top: 220, width: 90, height: 80, background: "#C8323A" }} />
          <div style={{ position: "absolute", left: 395, top: 190, width: 140, height: 140, border: `7px solid rgba(200,50,58,${ring})`, borderRadius: "50%", transform: `scale(${1.4 - 0.4 * ring})` }} />
          <div style={{ position: "absolute", left: 540, top: 150, fontSize: 32, fontWeight: 700, color: "#C8323A", opacity: ring }}>ร้านไก่ทอด</div>
          <div style={{ position: "absolute", left: 40, top: 40, right: 40, height: 60, border: "4px dashed #2E4F80", borderRadius: 8, fontSize: 30, color: "#2E4F80", fontWeight: 700, padding: "8px 18px" }}>เขตโครงการใหม่</div>
          {map ? <div style={{ position: "absolute", left: 410, top: 210, width: 110, height: 110, opacity: x }}>
            <div style={{ position: "absolute", left: 50, top: -10, width: 10, height: 130, background: "#C8323A", transform: "rotate(45deg)" }} />
            <div style={{ position: "absolute", left: 50, top: -10, width: 10, height: 130, background: "#C8323A", transform: "rotate(-45deg)" }} />
          </div> : null}
        </div>
      </div>
      <Click at={2} v={0.25} />
    </AbsoluteFill>
  );
};
/** Ton's notebook: what we need to know (no guessing) */
const NeedList: React.FC = () => {
  const f = useCurrentFrame(); const items = ["ลูกค้าชอบอะไร?", "กำไรจริงเหลือเท่าไหร่?", "ถ้าร้านใหญ่มา จะเสียลูกค้าเพราะอะไร?"];
  return (
    <AbsoluteFill style={{ background: "repeating-linear-gradient(92deg,#5A3E2A 0 46px,#523826 46px 90px,#5E412C 90px 130px)", alignItems: "center", justifyContent: "center" }}>
      <AbsoluteFill style={{ background: "radial-gradient(60% 45% at 50% 45%, rgba(255,190,110,0.25), transparent)" }} />
      <div style={{ width: 860, background: "#F4F0E6", borderRadius: 14, padding: "60px 60px 80px", fontFamily: SANS, color: "#22306E", boxShadow: "0 24px 60px rgba(0,0,0,0.5)", backgroundImage: "repeating-linear-gradient(transparent 0 96px, #C9D3E6 96px 98px)", transform: "rotate(-1.5deg)" }}>
        <div style={{ fontSize: 56, fontWeight: 700 }}>สิ่งที่ต้องรู้ (ไม่เดา)</div>
        {items.map((t, i) => { const k = Math.min(1, Math.max(0, (f - 6 - i * 12) / 6)); return (
          <div key={i} style={{ display: "flex", alignItems: "center", fontSize: 46, marginTop: 44, opacity: k, lineHeight: 1.3 }}>
            <div style={{ minWidth: 48, height: 48, border: "5px solid #22306E", borderRadius: 8, marginRight: 26 }} />{t}
            <Click at={6 + i * 12} v={0.14} kind="tick" />
          </div>); })}
      </div>
    </AbsoluteFill>
  );
};
/** Ton's one-line message on Pakin's phone (exact text from the brief) */
const TonMsg: React.FC = () => {
  const f = useCurrentFrame(); const s = useSpr(4, 13); const buzz = f < 14 ? Math.sin(f * 2.9) * 6 : 0;
  return (
    <AbsoluteFill style={{ background: "#07080C", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 760, height: 1380, borderRadius: 80, background: "#111317", border: "10px solid #26282E", boxShadow: "0 0 120px rgba(150,180,255,0.18)", transform: `translateX(${buzz}px) scale(${1.04 + f * 0.0015})`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#1B2033,#0E1018)" }} />
        <div style={{ position: "absolute", top: 120, left: 0, right: 0, textAlign: "center", color: "#D8DCE6", fontFamily: SANS, fontSize: 120, fontWeight: 300 }}>22:05</div>
        <div style={{ position: "absolute", top: 400, left: 36, right: 36, background: "rgba(40,44,56,0.95)", borderRadius: 34, padding: "26px 32px", fontFamily: SANS, opacity: s, transform: `translateY(${(1 - s) * -120}px)` }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#9AA0AE", fontSize: 30 }}><span>ข้อความ · ต้น</span><span>ตอนนี้</span></div>
          <div style={{ color: "#F4F5F8", fontSize: 46, fontWeight: 600, marginTop: 14, lineHeight: 1.4 }}>พรุ่งนี้ผมอยากคุยกับนาย เรื่องร้านของพ่อฉัน</div>
        </div>
      </div>
      <Click at={4} v={0.35} />
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
const PlaceTag: React.FC<{ text: string }> = ({ text }) => { const a = useSpr(4, 16); return <AbsoluteFill style={{ pointerEvents: "none" }}><div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center", fontFamily: SANS, opacity: a, color: CREAM, fontSize: 50, fontWeight: 600, textShadow: "0 3px 14px rgba(0,0,0,0.8)" }}>{text}</div></AbsoluteFill>; };
const BlackText: React.FC = () => {
  const a = useSpr(8, 16), b = useSpr(30, 16), c = useSpr(54, 14);
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: SANS, padding: "0 70px" }}>
      <div style={{ color: "#C9CFDA", fontSize: 58, fontWeight: 600, opacity: a }}>ถ้าคนที่เคยเป็น<span style={{ color: RED }}>ศัตรู</span>…</div>
      <div style={{ color: CREAM, fontSize: 62, fontWeight: 700, marginTop: 34, lineHeight: 1.35, opacity: b }}>กลับกลายเป็นคนเดียว</div>
      <div style={{ color: CREAM, fontSize: 62, fontWeight: 700, marginTop: 12, lineHeight: 1.35, opacity: c, transform: `scale(${1.15 - 0.15 * c})` }}>ที่ช่วย<span style={{ color: AMB }}>เปิดเผยความจริง</span>ได้?</div>
    </AbsoluteFill>
  );
};
const Letterbox: React.FC = () => <AbsoluteFill style={{ pointerEvents: "none" }}><div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 220, background: "#000" }} /><div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 220, background: "#000" }} /></AbsoluteFill>;
const NextCard: React.FC = () => {
  const f = useCurrentFrame(); const a = useSpr(4, 18), b = useSpr(14, 14);
  const shake = f >= 14 && f < 21 ? Math.sin(f * 3.1) * 7 * (21 - f) / 7 : 0;
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: SANS, transform: `translateX(${shake}px)` }}>
      <div style={{ color: CREAM, fontSize: 92, fontWeight: 700, opacity: a, transform: `scale(${1.3 - 0.3 * a})` }}>EP 8</div>
      <div style={{ width: 130, height: 7, background: RED, borderRadius: 4, margin: "24px auto", opacity: a }} />
      <div style={{ color: RED, fontSize: 70, fontWeight: 700, maxWidth: 940, lineHeight: 1.3, opacity: b, transform: `scale(${1.25 - 0.25 * b})` }}>ศัตรูที่ยื่นมือมาช่วย</div>
      <div style={{ color: "#8A8F9A", fontSize: 34, marginTop: 40, opacity: useSpr(30, 14) }}>ติดตามตอนต่อไป</div>
    </AbsoluteFill>
  );
};

/* ═════════ the edit ═════════ */
type Cut = { a: number; b: number; el: React.ReactNode };
const END = E(24);
export const BLACK_AT = END + 0.6;
export const CUTS: Cut[] = [
  /* 1. the name on the paper (straight in) */
  { a: 0, b: T(1) - 0.1, el: <EmployerDoc /> },
  { a: T(1) - 0.1, b: E(1) + 0.2, el: <STonCU ton="doc" push={0.004} /> },
  { a: E(1) + 0.2, b: E(2) + 0.2, el: <SStrBack ton="doc" str="shake" /> },
  { a: E(2) + 0.2, b: E(3) + 0.2, el: <STonCU ton="shock" tight /> },
  /* 2. the company nobody planned for */
  { a: E(3) + 0.2, b: mid(4), el: <STableW ton="shock" str="point" /> },
  { a: mid(4), b: E(4) + 1.2, el: <ProjectDoc /> },
  { a: E(4) + 1.2, b: E(5) + 0.2, el: <STonCU ton="talk" /> },
  { a: E(5) + 0.2, b: mid(6), el: <STableW ton="lean" str="point" /> },
  { a: mid(6), b: E(6) + 0.8, el: <ProjectDoc map /> },
  { a: E(6) + 0.8, b: E(7) + 0.3, el: <STonCU ton="shock" tight push={0.005} /> },
  /* 3. a warning */
  { a: E(7) + 0.3, b: E(8) + 0.2, el: <SHandover /> },
  { a: E(8) + 0.2, b: E(9) + 0.2, el: <SOtsTon ton="read" str="free" /> },
  { a: E(9) + 0.2, b: E(10) + 0.3, el: <SStrBack ton="read" str="free" /> },
  { a: E(10) + 0.3, b: E(10) + 1.6, el: <SCircle ton="read" str="free" /> },
  /* 4. home: data, not guesses */
  { a: E(10) + 1.6, b: E(11) + 0.2, el: <><STopTable dad="ask" /><PlaceTag text="คืนนั้น · ที่ร้าน" /></> },
  { a: E(11) + 0.2, b: E(12) + 0.2, el: <STonK ton="talk" dad="listen" /> },
  { a: E(12) + 0.2, b: E(13) + 0.2, el: <SDadK ton="talk" dad="ask" /> },
  { a: E(13) + 0.2, b: mid(14), el: <STonK ton="point" dad="listen" push={0.004} /> },
  { a: mid(14), b: E(14) + 0.3, el: <NeedList /> },
  { a: E(14) + 0.3, b: E(15) + 0.2, el: <SDadK ton="point" dad="wow" /> },
  { a: E(15) + 0.2, b: E(16) + 0.2, el: <STonK ton="firm" dad="nod" push={0.004} /> },
  { a: E(16) + 0.2, b: E(16) + 1.8, el: <SlamCard text={"ตัดสินใจจากข้อมูล\nไม่ใช่ความรู้สึก"} sub="ยอดขาย · กำไร · ต้นทุน · สิ่งที่ลูกค้าต้องการ" /> },
  /* 5. the car: the pressure is coming from above */
  { a: E(16) + 1.8, b: mid(17), el: <SGrip /> },
  { a: mid(17), b: E(17) + 0.2, el: <><SPdCar /><Letterbox /></> },
  { a: E(17) + 0.2, b: E(18) + 0.2, el: <SPkCar pin="turn" /> },
  { a: E(18) + 0.2, b: E(19) + 0.2, el: <><SPdCar pin="turn" /><Letterbox /></> },
  { a: E(19) + 0.2, b: E(19) + 1.7, el: <TonMsg /> },
  { a: E(19) + 1.7, b: E(19) + 2.5, el: <SPkCar pin="phone" /> },
  /* 6. the school, next morning */
  { a: E(19) + 2.5, b: T(20) - 0.3, el: <><SSchoolWide /><PlaceTag text="เช้าวันต่อมา" /></> },
  { a: T(20) - 0.3, b: E(20) + 0.2, el: <SArrive /> },
  { a: E(20) + 0.2, b: E(21) + 0.2, el: <STonS ton="talk" pin="talk" /> },
  { a: E(21) + 0.2, b: E(22) + 0.2, el: <SOtsPak ton="talk" pin="talk" /> },
  { a: E(22) + 0.2, b: E(23) + 0.4, el: <STonS ton="stare" pin="talk" push={0.004} /> },
  { a: E(23) + 0.4, b: E(24) + 0.2, el: <SPakS ton="stare" pin="low" push={0.005} /> },
  { a: E(24) + 0.2, b: BLACK_AT, el: <STonS ton="stare" pin="low" push={0.012} /> },
  { a: BLACK_AT, b: BLACK_AT + 3.7, el: <BlackText /> },
  { a: BLACK_AT + 3.7, b: DUR / FPS, el: <NextCard /> },
];
export const HERO_S = E(16);

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
