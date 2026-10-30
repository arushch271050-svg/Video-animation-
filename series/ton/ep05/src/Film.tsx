import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { loadFont as loadMali } from "@remotion/google-fonts/Mali";
import { Cam, Shot, type V3 } from "./kit/three";
import { Click, CREAM, DUR, FPS, FadeOut, Grain, LINE, RED, SANS, Vig, fr, io, useSpr } from "./kit/ui";
import { Char, SLIM, headCenter, type Look, type Pose } from "./rig/char";
import { DAD, PAKDAD, PAKDAD_DOC, PAKIN, PAKIN_ENV, PAKIN_FREE, STRANGER_J, STRANGER_W, TON, TON_HOME, TON_HOME_NB, TON_HOME_PHONE2 } from "./rig/cast";
import { SIT, walkPose } from "./rig/poses";
import { BACK_LAMP, School } from "./sets/school";
import { COIN_TABLE, Stall } from "./sets/stall";
import { Sedan } from "./sets/car";
import { Captions } from "./ui/captions";
import MOUTH from "./mouth.json";

const HAND = loadMali("normal", { weights: ["500", "600"], subsets: ["thai", "latin"] }).fontFamily;

/** EP5 — ข้อเสนอที่อาจเปลี่ยนชีวิตต้นไปตลอดกาล (~90 s). Story + dialogue: the user's MASTER PROMPT (line 6 of the brief split into rows 6–7).
 *  Rules: series/ton/RULES.md (hook in 3 s, reaction shots, stingers, hard cut to black; the stranger's face is never shown; no CK book). */

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
const LAUGH = (f: number, s = 0): Pose => ({ spine: [-0.12 + Math.sin(f * 0.9 + s) * 0.05, 0, 0], head: [-0.2 + Math.sin(f * 0.9 + s) * 0.06, 0, 0], mouth: 0.45 + Math.sin(f * 1.3 + s) * 0.2, blink: 1, shL: [-0.3, 0, 0.3], elL: -1.2, shR: [-0.2, 0, -0.2], elR: -0.6 });
const SIT_Y = (SIT.y ?? 0) * SLIM.leg * TON.height;

/* ═════════ 1. behind the school (continues EP4) ═════════ */
const HIDE: V3 = [2.18, 0, -5.05];
const PAK_N: V3 = [5.25, 0, -6.15], MAN_N: V3 = [5.9, 0, -6.45];
type BackAct = { ton?: "peek" | "hide"; give?: number; pak?: "open" | "look"; mp?: number; k?: number };
const BackScene: React.FC<BackAct> = ({ ton = "peek", give = 1, pak = "open", mp = 0, k = 0 }) => {
  const f = useCurrentFrame();
  const tp: V3 = ton === "hide" ? lerp3([HIDE[0] + 0.05, 0, HIDE[2] - 0.12], HIDE, Math.min(1, k)) : HIDE;
  const tonPose: Pose = ton === "peek" ? { spine: [0.1, 0, -0.1], head: [0, 0, -0.05], shL: [-0.4, 0, 0.5], elL: -0.9, browUp: 1, blink: 0 }
    : { spine: [-0.05, 0, 0], head: [-0.15, -0.3, 0], shL: [-0.2, 0, 0.2], shR: [-0.2, 0, -0.2], browUp: 1, mouth: 0.15, blink: 0 };
  const pakPose: Pose = pak === "look" ? { shR: [-0.7, 0, -0.1], elR: -0.9, head: [0, -0.9, 0], browUp: -0.3, blink: blink(f, 3) }
    : give < 1 ? { shR: [-0.9 * Math.min(1, give * 1.5), 0, -0.1], elR: -0.6, head: [0.05, 0, 0], blink: blink(f, 3) }
    : { shR: [-1.15, 0.2, -0.15], elR: -1.1, shL: [-0.9, -0.2, 0.15], elL: -1.2, head: [0.35, 0, 0], mouth: mp, browUp: 0.6, blink: blink(f, 3) };
  const manPose: Pose = { shR: [-1.1 * (give > 0 && give < 1 ? 1 : give >= 1 ? 0.2 : 0.4), 0, -0.1], elR: -0.4, head: [-0.05, 0, 0], blink: 1 };
  return (
    <School night>
      <Char L={TON} p={tp} ry={ton === "hide" ? -1.3 : 1.91} pose={tonPose} seed={1} />
      <Char L={give >= 0.6 ? PAKIN_ENV : PAKIN_FREE} p={PAK_N} ry={pak === "look" ? yawTo(PAK_N, MAN_N) - 2.2 : yawTo(PAK_N, MAN_N) - (give >= 1 ? 0.9 : 0)} pose={pakPose} seed={3} />
      <Char L={give >= 0.6 ? STRANGER_W : STRANGER_J} p={MAN_N} ry={yawTo(MAN_N, PAK_N)} pose={manPose} seed={11} />
      <pointLight position={[MAN_N[0] + 0.8, 1.8, MAN_N[2] - 0.9]} intensity={1.6} distance={3} color="#6E86C8" />
      {give >= 1 ? <pointLight position={[PAK_N[0] - 0.3, 1.4, PAK_N[2] + 0.7]} intensity={0.9} distance={1.6} color="#FFB45A" /> : null}
    </School>
  );
};
const HTN = face(TON), HPN = face(PAKIN);
const SHandover = () => { const f = useCurrentFrame(); const g = io(f, 1, 18, 0, 1); return <Shot><BackScene give={g} /><Cam p={[(PAK_N[0] + MAN_N[0]) / 2 + 0.3, 1.5, PAK_N[2] + 2.0 - f * 0.004]} t={[(PAK_N[0] + MAN_N[0]) / 2, 1.0, (PAK_N[2] + MAN_N[2]) / 2]} fov={30} drift={0.3} /></Shot>; };
/** Pakin opens the envelope and smiles; we look at him past the stranger's shoulder */
const SPakOpen = () => { const f = useCurrentFrame(); const d = yawTo(PAK_N, MAN_N) - 0.9; return <Shot><BackScene give={1} mp={useMouth("pakin")} /><Cam p={[PAK_N[0] + Math.sin(d) * 1.25, HPN + 0.02, PAK_N[2] + Math.cos(d) * 1.25 - f * 0.002]} t={[PAK_N[0], HPN - 0.1, PAK_N[2]]} fov={32} drift={0.3} /></Shot>; };
const STrackTon = () => { const f = useCurrentFrame(); return <Shot><BackScene give={1} /><Cam p={[HIDE[0] + 2.2 - f * 0.02, 1.5, HIDE[2] + 0.9]} t={[HIDE[0], HTN - 0.05, HIDE[2]]} fov={34} drift={0.3} /></Shot>; };
const STonHide: React.FC<{ fastAt?: number }> = ({ fastAt = 999 }) => { const f = useCurrentFrame(); const k = io(f, 0, 8, 0, 1); const fast = io(f, fr(fastAt), fr(fastAt) + 14, 0, 0.6); return <Shot><BackScene ton="hide" pak="look" k={k} /><pointLight position={[HIDE[0] - 0.6, HTN + 0.1, HIDE[2] + 0.6]} intensity={1.1} distance={1.6} color="#8FA6E0" /><Cam p={[HIDE[0] - 0.9 + f * 0.0015 + fast * 0.5, HTN + 0.02, HIDE[2] + 0.4]} t={[HIDE[0], HTN - 0.03, HIDE[2]]} fov={30} drift={0.2} /></Shot>; };
const SBackLamp = () => { const f = useCurrentFrame(); return <Shot><BackScene ton="hide" pak="look" k={1} /><Cam p={[0.5, 1.9, -3.6 - f * 0.002]} t={[BACK_LAMP[0], 1.3, -5.6]} fov={44} drift={0.3} /></Shot>; };

/* ═════════ 2–6. the stall in the morning ═════════ */
const CAR_PARK: V3 = [2.4, 0, 3.95];
const TBL: V3 = [0.55, 0, 1.75];
const PD_SEAT: V3 = [1.2, 0, 1.75], PD_DOOR: V3 = [2.0, 0, 2.85];
const DAD_F: V3 = [-0.1, 0, 1.75], TON_F: V3 = [0.05, 0, 2.4];
const PAK_F: V3 = [1.65, 0, 2.5], PAK_NEAR: V3 = [0.8, 0, 2.6];
const STR_F: V3 = [3.0, 0, 2.75];
const HPD = face(PAKDAD), HPDS = face(PAKDAD) + SIT_Y, HD = face(DAD), HT = face(TON_HOME), HP = face(PAKIN);
type DayAct = {
  car?: "arrive" | "park" | "leave" | "gone"; k?: number;
  pd?: "out" | "look" | "sit" | "place" | "lean" | "smile" | "pack" | "door"; pin?: "out" | "smirk" | "near" | "laugh" | "door" | "irked";
  dad?: "walk" | "stand" | "shock" | "down" | "ask"; ton?: "stare" | "doc" | "look" | "talk" | "book" | "watch";
  md?: number; mpd?: number; mp?: number; mt?: number; night?: boolean;
};
const DayScene: React.FC<DayAct> = ({ car = "park", k = 0, pd = "sit", pin = "smirk", dad = "stand", ton = "stare", md = 0, mpd = 0, mp = 0, mt = 0 }) => {
  const f = useCurrentFrame();
  const carP: V3 = car === "arrive" ? lerp3([10, 0, CAR_PARK[2]], CAR_PARK, k) : car === "leave" ? lerp3(CAR_PARK, [-11, 0, CAR_PARK[2]], k * k) : CAR_PARK;
  const spin = car === "arrive" ? k * 22 : car === "leave" ? -k * k * 40 : 0;
  // Pakin's father
  const pdSeated = pd === "sit" || pd === "place" || pd === "lean" || pd === "smile" || pd === "pack";
  const pdP: V3 = pd === "out" ? PD_DOOR : pd === "look" ? lerp3(PD_DOOR, [1.5, 0, 2.3], Math.min(1, k)) : pd === "door" ? PD_DOOR : PD_SEAT;
  const pdRy = pdSeated ? -Math.PI / 2 : pd === "door" ? yawTo(PD_DOOR, TON_F) : pd === "out" ? -2.3 : yawTo(PD_DOOR, [0, 0, 0]) + Math.sin(f / 14) * 0.35;
  const pdPose: Pose = pd === "out" ? { shL: [-1.35, 0.3, 0.35], elL: -1.9, shR: [-0.5, -0.2, -0.2], elR: -1.6, head: [0.25, 0.2, 0], blink: blink(f, 9) }
    : pd === "look" ? { ...walkPose(Math.min(1, k) * 1.0 / 1.2 * Math.PI * 2, 1 - Math.max(0, Math.min(1, k) - 0.85) * 6), head: [-0.05, Math.sin(f / 14) * 0.4, 0], mouth: mpd, browUp: -0.2, blink: blink(f, 9) }
    : pd === "door" ? { shL: [-0.3, 0, 0.2], elL: -0.6, shR: [-0.3, 0, -0.2], elR: -0.5, head: [0.0, 0, 0], mouth: mpd, browUp: -0.5, blink: blink(f, 9) }
    : { ...SIT, shL: [-0.85, 0, 0.2], elL: -0.9, shR: [pd === "place" ? -1.3 : pd === "pack" ? -1.0 : -0.85, 0, -0.2], elR: pd === "place" ? -0.3 : -0.9, spine: [pd === "lean" ? -0.15 : pd === "place" ? 0.3 : 0.05, 0, 0], head: [pd === "smile" ? -0.05 : 0.08, 0, 0], mouth: mpd, browUp: pd === "smile" ? 0.6 : -0.3, blink: blink(f, 9), holdOff: pd !== "pack" };
  // Pakin
  const pinP: V3 = pin === "out" ? lerp3([PD_DOOR[0] + 0.5, 0, 3.0], PAK_F, Math.min(1, k)) : pin === "near" ? lerp3(PAK_F, PAK_NEAR, Math.min(1, k * 1.5)) : pin === "door" ? [PD_DOOR[0] + 0.7, 0, 2.95] : PAK_F;
  const pinRy = pin === "near" || pin === "laugh" ? yawTo(PAK_NEAR, TON_F) : yawTo(pinP, TON_F);
  const pinPose: Pose = pin === "laugh" ? LAUGH(f, 0.5) : pin === "irked" ? { shL: [-0.3, 0, 0.3], elL: -1.6, shR: [-0.3, 0, -0.3], elR: -1.6, head: [0.05, 0.3, 0], browUp: -1, blink: blink(f, 3) }
    : pin === "near" ? { ...walkPose(Math.min(1, k * 1.5) * 0.9 / 1.2 * Math.PI * 2, 1 - Math.max(0, Math.min(1, k * 1.5) - 0.85) * 6), shL: [-1.0 * Math.min(1, k * 2), 0.2, 0.2], elL: -0.2, head: [0.1, 0, 0], mouth: mp, browUp: 0.6, blink: blink(f, 3) }
    : { shL: [-0.3, 0, 0.2], elL: -0.9, head: [0.05, 0, 0], mouth: mp, browUp: 0.6, blink: blink(f, 3) };
  const pinAt: V3 = pin === "laugh" || pin === "irked" ? (pd === "door" ? [PD_DOOR[0] + 0.7, 0, 2.95] : PAK_NEAR) : pinP;
  // Ton's father
  const dadP: V3 = dad === "walk" ? lerp3([-0.6, 0, -0.62], DAD_F, Math.min(1, k)) : DAD_F;
  const dadRy = dad === "walk" ? yawTo([-0.6, 0, -0.62], DAD_F) : dad === "ask" ? yawTo(DAD_F, TON_F) : yawTo(DAD_F, PD_SEAT) + (dad === "stand" && pd !== "sit" && !pdSeated ? 0.6 : 0);
  const dadPose: Pose = dad === "walk" ? { ...walkPose(Math.min(1, k) * 2.5 / 1.2 * Math.PI * 2, 1 - Math.max(0, Math.min(1, k) - 0.85) * 6), browUp: 0.6, blink: blink(f, 2) }
    : dad === "shock" ? { shR: [-0.5, 0, -0.15], elR: -1.0, shL: [-0.5, 0, 0.15], elL: -1.0, head: [0.1, 0, 0], browUp: 1, mouth: 0.25, blink: 0 }
    : dad === "down" ? { spine: [0.15, 0, 0], head: [0.55, 0, 0], shL: [-0.2, 0, 0.1], shR: [-0.2, 0, -0.1], browUp: 0.8, blink: f % 50 < 25 ? 1 : 0 }
    : { shR: [-0.3, 0, -0.15], elR: -0.5, shL: [-0.3, 0, 0.15], elL: -0.5, head: [0.05, 0, 0], browUp: dad === "ask" ? 0.9 : 0.4, mouth: md, blink: blink(f, 2) };
  // Ton
  const tonL: Look = ton === "doc" ? { ...TON_HOME, holdR: "envelope" } : ton === "book" || ton === "watch" ? TON_HOME_NB : TON_HOME;
  const tonRy = ton === "watch" ? yawTo(TON_F, [-4, 0, CAR_PARK[2]]) : ton === "look" ? yawTo(TON_F, DAD_F) : ton === "talk" || ton === "stare" ? yawTo(TON_F, pin === "near" || pin === "laugh" || pin === "irked" ? PAK_NEAR : PD_SEAT) : yawTo(TON_F, PD_SEAT);
  const tonPose: Pose = ton === "doc" ? { shR: [-1.2, 0.2, -0.1], elR: -1.0, head: [0.35, 0, 0], mouth: mt, browUp: 0.3, blink: blink(f, 1) }
    : ton === "book" ? { shR: [-1.1, 0.2, -0.1], elR: -0.9, shL: [-0.5, 0, 0.2], elL: -1.0, head: [0.1, 0, 0], mouth: mt, browUp: -0.1, blink: blink(f, 1) }
    : ton === "watch" ? { shR: [-0.4, 0, -0.1], elR: -0.8, head: [0, 0, 0], browUp: -0.3, mouth: mt, blink: blink(f, 1) }
    : ton === "look" ? { head: [0.15, 0, 0], browUp: 0.8, mouth: mt, blink: blink(f, 1) }
    : { head: [0.0, 0, 0], browUp: ton === "talk" ? -0.4 : -0.7, mouth: mt, blink: blink(f, 1) };
  const showPD = !(car === "arrive" || car === "leave" || car === "gone");
  return (
    <Stall day>
      {car !== "gone" ? <Sedan p={carP} ry={Math.PI} spin={spin} /> : null}
      {/* folding table + stool for the visitor */}
      <group position={TBL}>
        <mesh position={[0, 0.72, 0]}><boxGeometry args={[0.85, 0.03, 0.6]} /><meshStandardMaterial color="#ECEBE6" /></mesh>
        {[[-0.38, -0.25], [0.38, -0.25], [-0.38, 0.25], [0.38, 0.25]].map(([x, z], i) => <mesh key={i} position={[x, 0.36, z]}><cylinderGeometry args={[0.015, 0.015, 0.72, 8]} /><meshStandardMaterial color="#8A8E96" /></mesh>)}
        {pd === "place" || pd === "lean" || pd === "smile" ? <mesh position={[0.05, 0.74, 0.02]} rotation={[-Math.PI / 2, 0, 0.2]}><planeGeometry args={[0.21, 0.3]} /><meshStandardMaterial color="#FBFAF4" /></mesh> : null}
        {ton === "book" || ton === "doc" ? <mesh position={[-0.12, 0.74, 0.05]} rotation={[-Math.PI / 2, 0, -0.1]}><planeGeometry args={[0.21, 0.3]} /><meshStandardMaterial color="#FBFAF4" /></mesh> : null}
      </group>
      <mesh position={[PD_SEAT[0], 0.21, PD_SEAT[2]]}><cylinderGeometry args={[0.15, 0.17, 0.42, 16]} /><meshStandardMaterial color="#C8323A" /></mesh>
      {showPD || pd === "door" || pd === "out" ? <Char L={pd === "pack" ? PAKDAD_DOC : PAKDAD} p={pdP} ry={pdRy} pose={pdPose} seed={13} /> : null}
      {showPD || pin === "door" || pin === "laugh" ? <Char L={PAKIN_FREE} p={pinAt} ry={pin === "door" || (pin === "laugh" && pd === "door") ? yawTo(pinAt, TON_F) : pinRy} pose={pinPose} seed={3} /> : null}
      {showPD ? <Char L={STRANGER_W} p={STR_F} ry={0.2} pose={{ shL: [-0.2, 0, 0.1], shR: [-0.2, 0, -0.1], head: [0.05, 0, 0], blink: 1 }} seed={11} /> : null}
      <Char L={DAD} p={dadP} ry={dadRy} pose={dadPose} seed={2} />
      <Char L={tonL} p={TON_F} ry={tonRy} pose={tonPose} seed={1} />
    </Stall>
  );
};
const SCarArrive = () => { const f = useCurrentFrame(); const k = io(f, 0, 40, 0, 1); return <Shot><DayScene car="arrive" k={k} pd="out" pin="out" dad="stand" /><Cam p={[-2.4, 1.7, 7.2 - f * 0.006]} t={[1.0, 0.9, 2.2]} fov={44} drift={0.4} /></Shot>; };
const SWatch = () => { const f = useCurrentFrame(); return <Shot tilt={false}><DayScene pd="out" pin="out" k={0} /><Cam p={[PD_DOOR[0] - 0.95, 1.3, PD_DOOR[2] - 0.85 + f * 0.002]} t={[PD_DOOR[0], 1.45, PD_DOOR[2]]} fov={36} drift={0.2} /></Shot>; };
const SDadWalk = () => { const f = useCurrentFrame(); const k = io(f, 0, 30, 0, 1); return <Shot><DayScene pd="look" pin="out" k={k} dad="walk" ton="stare" /><Cam p={[-1.5, 1.5, 3.6 - f * 0.004]} t={[0.4, 1.05, 1.0]} fov={42} drift={0.4} /></Shot>; };
const SPdLook = () => { const f = useCurrentFrame(); const P: V3 = [1.5, 0, 2.3]; const d = yawTo(P, [0, 0, 0]); return <Shot><DayScene pd="look" k={1} pin="smirk" mpd={useMouth("pakdad")} /><Cam p={[P[0] + Math.sin(d) * 1.4 + 0.3, HPD, P[2] + Math.cos(d) * 1.4 - f * 0.002]} t={[P[0], HPD - 0.06, P[2]]} fov={31} drift={0.4} /></Shot>; };
const SDadTalk: React.FC<{ act?: "stand" | "shock" | "down" | "ask"; pd?: DayAct["pd"]; pin?: DayAct["pin"]; ton?: DayAct["ton"] }> = ({ act = "stand", pd = "sit", pin = "smirk", ton = "stare" }) => { const f = useCurrentFrame(); const d = yawTo(DAD_F, PD_SEAT) + 0.35; return <Shot><DayScene dad={act} pd={pd} pin={pin} ton={ton} k={1} md={useMouth("dad")} /><Cam p={[DAD_F[0] + Math.sin(d) * 1.45, HD + 0.02, DAD_F[2] + Math.cos(d) * 1.45 - f * 0.002]} t={[DAD_F[0], HD - (act === "down" ? 0.12 : 0.05), DAD_F[2]]} fov={31} drift={0.4} /></Shot>; };
const SPakSmirk: React.FC<{ pin?: DayAct["pin"]; pd?: DayAct["pd"]; ton?: DayAct["ton"]; fast?: boolean }> = ({ pin = "smirk", pd = "sit", ton = "stare", fast }) => { const f = useCurrentFrame(); const at = pin === "near" || pin === "laugh" || pin === "irked" ? PAK_NEAR : PAK_F; const d = yawTo(at, TON_F) + 0.8; return <Shot><DayScene pin={pin} pd={pd} ton={ton} k={pin === "near" ? io(f, 0, 30, 0, 1) : 1} mp={useMouth("pakin")} /><Cam p={[at[0] + Math.sin(d) * 1.35, HP + 0.02, at[2] + Math.cos(d) * 1.35 - f * (fast ? 0.006 : 0.002)]} t={[at[0], HP - 0.06, at[2]]} fov={31} drift={0.4} /></Shot>; };
const STon: React.FC<{ act?: DayAct["ton"]; pin?: DayAct["pin"]; pd?: DayAct["pd"]; dad?: DayAct["dad"]; push?: number; tight?: boolean }> = ({ act = "stare", pin = "smirk", pd = "sit", dad = "stand", push = 0.002, tight }) => {
  const f = useCurrentFrame(); const tgt: V3 = act === "look" ? DAD_F : pin === "near" || pin === "laugh" || pin === "irked" ? PAK_NEAR : PD_SEAT; const d = yawTo(TON_F, tgt) + 0.75;
  const r = tight ? 1.05 : 1.3;
  return <Shot><DayScene ton={act} pin={pin} pd={pd} dad={dad} k={1} mt={useMouth("ton")} /><Cam p={[TON_F[0] + Math.sin(d) * r, HT + 0.03, TON_F[2] + Math.cos(d) * r - f * push]} t={[TON_F[0], HT - 0.05, TON_F[2]]} fov={tight ? 27 : 31} drift={0.3} /></Shot>;
};
const SPdSit: React.FC<{ act?: DayAct["pd"]; pin?: DayAct["pin"]; ton?: DayAct["ton"]; push?: number }> = ({ act = "sit", pin = "smirk", ton = "stare", push = 0.002 }) => { const f = useCurrentFrame(); const d = -Math.PI / 2 - 0.6; return <Shot><DayScene pd={act} pin={pin} ton={ton} dad="stand" mpd={useMouth("pakdad")} /><Cam p={[PD_SEAT[0] + Math.sin(d) * 0.95, HPDS + 0.08, PD_SEAT[2] + Math.cos(d) * 0.95 + f * push]} t={[PD_SEAT[0], HPDS - 0.05, PD_SEAT[2]]} fov={31} drift={0.3} /></Shot>; };
const STableWide: React.FC<{ pd?: DayAct["pd"]; pin?: DayAct["pin"]; ton?: DayAct["ton"]; dad?: DayAct["dad"] }> = ({ pd = "sit", pin = "smirk", ton = "stare", dad = "stand" }) => { const f = useCurrentFrame(); return <Shot><DayScene pd={pd} pin={pin} ton={ton} dad={dad} k={1} /><Cam p={[0.6, 1.75, 4.6 - f * 0.006]} t={[0.65, 1.0, 1.9]} fov={44} drift={0.4} /></Shot>; };
const SDoorTalk = () => { const f = useCurrentFrame(); const d = yawTo(PD_DOOR, TON_F) + 0.35; return <Shot><DayScene pd="door" pin="door" ton="book" dad="stand" mpd={useMouth("pakdad")} /><Cam p={[PD_DOOR[0] + Math.sin(d) * 1.45, HPD + 0.02, PD_DOOR[2] + Math.cos(d) * 1.45 - f * 0.002]} t={[PD_DOOR[0], HPD - 0.06, PD_DOOR[2]]} fov={31} drift={0.3} /></Shot>; };
const SPakDoor = () => { const f = useCurrentFrame(); const P: V3 = [PD_DOOR[0] + 0.7, 0, 2.95]; const d = yawTo(P, TON_F) - 0.6; return <Shot><DayScene pd="door" pin="laugh" ton="book" mp={useMouth("pakin")} /><Cam p={[P[0] + Math.sin(d) * 1.35, HP + 0.02, P[2] + Math.cos(d) * 1.35 - f * 0.003]} t={[P[0], HP - 0.06, P[2]]} fov={31} drift={0.4} /></Shot>; };
const SCarLeave = () => { const f = useCurrentFrame(); const k = io(f, 4, 60, 0, 1); return <Shot><DayScene car="leave" k={k} pd="out" pin="out" dad="stand" ton="watch" /><Cam p={[2.0, 2.4, 0.6 + f * 0.003]} t={[-1.5, 0.9, 3.6]} fov={44} drift={0.4} /></Shot>; };
const SDadAsk = () => { const f = useCurrentFrame(); const d = yawTo(DAD_F, TON_F) - 0.6; return <Shot><DayScene car="gone" dad="ask" ton="watch" md={useMouth("dad")} /><Cam p={[DAD_F[0] + Math.sin(d) * 1.4, HD + 0.02, DAD_F[2] + Math.cos(d) * 1.4 - f * 0.002]} t={[DAD_F[0], HD - 0.05, DAD_F[2]]} fov={31} drift={0.4} /></Shot>; };
const STonDecide = () => { const f = useCurrentFrame(); const d = yawTo(TON_F, DAD_F) + 0.7; return <Shot><DayScene car="gone" dad="ask" ton="look" mt={useMouth("ton")} /><Cam p={[TON_F[0] + Math.sin(d) * 1.35, HT + 0.03, TON_F[2] + Math.cos(d) * 1.35 - f * 0.003]} t={[TON_F[0], HT - 0.05, TON_F[2]]} fov={30} drift={0.3} /></Shot>; };
/* night: the anonymous message */
const TON_T: V3 = [COIN_TABLE[0], 0, COIN_TABLE[2] - 0.5];
const NightPhone: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stall>
      <Char L={TON_HOME_PHONE2} p={TON_T} ry={0} pose={{ ...SIT, shL: [-0.7, 0, 0.2], elL: -1.0, shR: [-1.05, 0.3, -0.25], elR: -1.5, head: [0.35, 0, 0], browUp: io(f, 0, 20, 0, 1), blink: 0 }} seed={1} />
      <mesh position={[TON_T[0], 0.21, TON_T[2] + 0.05]}><cylinderGeometry args={[0.15, 0.17, 0.42, 16]} /><meshStandardMaterial color="#2F6FB0" /></mesh>
      <pointLight position={[TON_T[0] + 0.05, face(TON_HOME) + SIT_Y - 0.15, TON_T[2] + 0.4]} intensity={0.8} distance={1} color="#BFD6F2" />
    </Stall>
  );
};
const HTT = face(TON_HOME) + SIT_Y;
const SNightEyes: React.FC<{ fastAt?: number }> = ({ fastAt = 999 }) => { const f = useCurrentFrame(); const fast = io(f, fr(fastAt), fr(fastAt) + 14, 0, 0.45); return <Shot><NightPhone /><Cam p={[TON_T[0] - 0.08, HTT + 0.02, TON_T[2] + 1.1 - f * 0.002 - fast]} t={[TON_T[0], HTT - 0.04, TON_T[2]]} fov={28} drift={0.2} /></Shot>; };

/* ═════════ DOM inserts ═════════ */
/** the brown envelope, close: hands over */
const EnvelopeXCU: React.FC = () => {
  const f = useCurrentFrame(); const x = io(f, 0, 22, 260, -40);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(70% 50% at 50% 50%, #1E2433, #05070C)" }}>
      <div style={{ position: "absolute", left: 300 + x, top: 760, width: 520, height: 300, background: "#A9824F", borderRadius: 10, transform: "rotate(-6deg)", boxShadow: "0 30px 70px rgba(0,0,0,0.6)" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 120, background: "#97733F", clipPath: "polygon(0 0,100% 0,50% 100%)" }} />
      </div>
      <div style={{ position: "absolute", left: 690 + x, top: 830, width: 230, height: 120, background: "#2A2C34", borderRadius: 60, transform: "rotate(-10deg)" }} />
      <AbsoluteFill style={{ background: "rgba(255,170,80,0.06)" }} />
    </AbsoluteFill>
  );
};
/** the offer (all text added in the edit) */
const OfferDoc: React.FC = () => {
  const f = useCurrentFrame(); const s = useSpr(2, 14); const num = useSpr(22, 12);
  return (
    <AbsoluteFill style={{ background: "#ECEBE6", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 820, height: 1120, background: "#FFFFFF", borderRadius: 8, padding: "70px 70px", fontFamily: SANS, color: "#22252C", boxShadow: "0 30px 80px rgba(0,0,0,0.25)", transform: `translateY(${(1 - s) * 200}px) rotate(${-1.5 + s * 1.5}deg) scale(${1 + f * 0.0008})` }}>
        <div style={{ fontSize: 50, fontWeight: 700, textAlign: "center" }}>ข้อเสนอซื้อกิจการ</div>
        <div style={{ height: 3, background: "#22252C", margin: "26px 0 40px" }} />
        <div style={{ fontSize: 36, lineHeight: 1.7, color: "#4A4E58" }}>ผู้เสนอซื้อ: บริษัทของครอบครัวภาคิน<br />กิจการ: ร้านไก่ทอด (รวมแผงและทำเล)</div>
        <div style={{ marginTop: 60, fontSize: 38, color: "#4A4E58" }}>ราคาเสนอซื้อ</div>
        <div style={{ fontSize: 120, fontWeight: 700, color: "#1E2A44", opacity: num, transform: `scale(${1.3 - 0.3 * num})`, transformOrigin: "left" }}>฿350,000</div>
        <div style={{ marginTop: 60, fontSize: 36, color: RED, fontWeight: 600 }}>ตอบรับภายในวันนี้</div>
        <div style={{ marginTop: 90, borderTop: "2px solid #9AA0AA", width: 380, paddingTop: 12, fontSize: 30, color: "#7A7E88" }}>ลงชื่อผู้ขาย</div>
      </div>
      <Click at={22} v={0.3} />
    </AbsoluteFill>
  );
};
/** Ton's notebook: what a shop is worth — a checklist that is still empty */
const ValueList: React.FC = () => {
  const f = useCurrentFrame(); const items = ["ต้นทุน", "กำไร", "ลูกค้าประจำ", "โอกาสของร้าน"];
  return (
    <AbsoluteFill style={{ background: "repeating-linear-gradient(92deg,#5A3E2A 0 46px,#523826 46px 90px,#5E412C 90px 130px)", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 820, height: 1150, background: "#F4F0E6", borderRadius: 14, padding: "60px 64px", fontFamily: HAND, color: "#22306E", boxShadow: "0 24px 60px rgba(0,0,0,0.5)", backgroundImage: "repeating-linear-gradient(transparent 0 96px, #C9D3E6 96px 98px)", transform: "rotate(-1.5deg)" }}>
        <div style={{ fontSize: 58, fontWeight: 600 }}>ร้านเรามีค่าเท่าไร?</div>
        {items.map((t, i) => { const k = Math.min(1, Math.max(0, (f - 6 - i * 10) / 6)); return (
          <div key={i} style={{ display: "flex", alignItems: "center", fontSize: 56, marginTop: 44, opacity: k }}>
            <div style={{ width: 52, height: 52, border: "5px solid #22306E", borderRadius: 8, marginRight: 30 }} />{t}<span style={{ marginLeft: "auto", color: RED, fontSize: 64 }}>?</span>
            <Click at={6 + i * 10} v={0.14} kind="tick" />
          </div>); })}
      </div>
    </AbsoluteFill>
  );
};
const SlamCard: React.FC<{ text: string; sub?: string }> = ({ text, sub }) => {
  const f = useCurrentFrame(); const a = useSpr(0, 14); const shake = f < 7 ? Math.sin(f * 3.1) * 9 * (7 - f) / 7 : 0;
  return (
    <AbsoluteFill style={{ background: "#0A0B10", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: SANS, transform: `translateX(${shake}px)` }}>
      <div style={{ color: CREAM, fontSize: 88, fontWeight: 700, lineHeight: 1.25, opacity: a, transform: `scale(${1.35 - 0.35 * a})`, maxWidth: 960, whiteSpace: "pre-line" }}>{text}</div>
      <div style={{ width: 160 * a, height: 9, background: RED, borderRadius: 5, margin: "30px auto 0" }} />
      {sub ? <div style={{ color: "#9AA0AE", fontSize: 42, marginTop: 34, opacity: useSpr(12, 14) }}>{sub}</div> : null}
      <Click at={0} v={0.4} />
    </AbsoluteFill>
  );
};
/** the anonymous message, exact text from the brief */
const PhoneMsg: React.FC = () => {
  const f = useCurrentFrame(); const s = useSpr(3, 13); const buzz = f < 14 ? Math.sin(f * 2.9) * 6 : 0;
  return (
    <AbsoluteFill style={{ background: "#07080C", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 760, height: 1380, borderRadius: 80, background: "#111317", border: "10px solid #26282E", boxShadow: "0 0 120px rgba(150,180,255,0.18)", transform: `translateX(${buzz}px) scale(${1 + f * 0.0012})`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#1B2033,#0E1018)" }} />
        <div style={{ position: "absolute", top: 120, left: 0, right: 0, textAlign: "center", color: "#D8DCE6", fontFamily: SANS, fontSize: 120, fontWeight: 300 }}>21:13</div>
        <div style={{ position: "absolute", top: 400, left: 36, right: 36, background: "rgba(40,44,56,0.95)", borderRadius: 34, padding: "26px 32px", fontFamily: SANS, opacity: s, transform: `translateY(${(1 - s) * -120}px)` }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#9AA0AE", fontSize: 30 }}><span>ข้อความ · ไม่ทราบหมายเลข</span><span>ตอนนี้</span></div>
          <div style={{ color: "#F4F5F8", fontSize: 44, fontWeight: 600, marginTop: 14, lineHeight: 1.4 }}>ถ้าอยากรู้ว่าร้านของพ่อกำลังเจออะไรอยู่ พรุ่งนี้มาที่โกดังเก่า เวลา 19.00 น. มาคนเดียว</div>
        </div>
      </div>
      <Click at={3} v={0.35} />
    </AbsoluteFill>
  );
};
const Letterbox: React.FC = () => <AbsoluteFill style={{ pointerEvents: "none" }}><div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 220, background: "#000" }} /><div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 220, background: "#000" }} /></AbsoluteFill>;
const NextCard: React.FC = () => {
  const f = useCurrentFrame(); const a = useSpr(4, 18), b = useSpr(14, 14);
  const shake = f >= 14 && f < 21 ? Math.sin(f * 3.1) * 7 * (21 - f) / 7 : 0;
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: SANS, transform: `translateX(${shake}px)` }}>
      <div style={{ color: CREAM, fontSize: 92, fontWeight: 700, opacity: a, transform: `scale(${1.3 - 0.3 * a})` }}>EP 6</div>
      <div style={{ width: 130, height: 7, background: RED, borderRadius: 4, margin: "24px auto", opacity: a }} />
      <div style={{ color: RED, fontSize: 66, fontWeight: 700, maxWidth: 940, lineHeight: 1.3, opacity: b, transform: `scale(${1.25 - 0.25 * b})` }}>ความลับที่ซ่อนอยู่<br />หลังร้านไก่ทอด</div>
      <div style={{ color: "#8A8F9A", fontSize: 34, marginTop: 40, opacity: useSpr(30, 14) }}>ติดตามตอนต่อไป</div>
    </AbsoluteFill>
  );
};

/* ═════════ the edit ═════════ */
type Cut = { a: number; b: number; el: React.ReactNode };
const END = E(24);
export const CUTS: Cut[] = [
  /* 1. the envelope (continues EP4) */
  { a: 0, b: 1.0, el: <EnvelopeXCU /> },
  { a: 1.0, b: T(1) - 0.1, el: <SHandover /> },
  { a: T(1) - 0.1, b: E(1) + 0.2, el: <SPakOpen /> },
  { a: E(1) + 0.2, b: E(1) + 1.0, el: <STrackTon /> },
  { a: E(1) + 1.0, b: mid(2), el: <STonHide /> },
  { a: mid(2), b: E(2) + 0.4, el: <><SBackLamp /><Letterbox /></> },
  /* 2. the rich man comes to the stall */
  { a: E(2) + 0.4, b: E(2) + 1.9, el: <SCarArrive /> },
  { a: E(2) + 1.9, b: E(2) + 2.6, el: <SWatch /> },
  { a: E(2) + 2.6, b: T(3) - 0.05, el: <SDadWalk /> },
  { a: T(3) - 0.05, b: E(3) + 0.2, el: <SPdLook /> },
  { a: E(3) + 0.2, b: E(4) + 0.2, el: <SDadTalk pd="look" /> },
  { a: E(4) + 0.2, b: E(5) + 0.2, el: <SPakSmirk pd="look" /> },
  { a: E(5) + 0.2, b: T(6) - 0.05, el: <STon act="stare" pd="sit" tight /> },
  /* 3. the offer */
  { a: T(6) - 0.05, b: E(6) + 0.1, el: <SPdSit act="place" /> },
  { a: E(6) + 0.1, b: mid(7), el: <STableWide pd="place" /> },
  { a: mid(7), b: E(7) + 0.2, el: <SDadTalk act="shock" pd="place" /> },
  { a: E(7) + 0.2, b: mid(8), el: <OfferDoc /> },
  { a: mid(8), b: E(8) + 0.4, el: <SDadTalk act="shock" pd="lean" /> },
  { a: E(8) + 0.4, b: E(9) + 0.5, el: <STon act="doc" pd="lean" /> },
  { a: E(9) + 0.5, b: E(10) + 0.2, el: <SPdSit act="smile" ton="doc" /> },
  /* 4. the insult */
  { a: E(10) + 0.2, b: E(11) + 0.2, el: <SPakSmirk pin="near" pd="smile" /> },
  { a: E(11) + 0.2, b: E(12) + 0.15, el: <SPakSmirk pin="laugh" pd="smile" fast /> },
  { a: E(12) + 0.15, b: E(12) + 1.0, el: <SDadTalk act="down" pin="laugh" /> },
  { a: E(12) + 1.0, b: T(13) - 0.05, el: <STon act="look" pin="irked" dad="down" /> },
  { a: T(13) - 0.05, b: E(13) + 0.2, el: <STon act="talk" pin="irked" push={0.005} /> },
  { a: E(13) + 0.2, b: E(13) + 1.3, el: <STableWide pin="irked" ton="talk" /> },
  { a: E(13) + 1.3, b: E(14) + 0.3, el: <STon act="talk" pin="irked" tight /> },
  /* 5. first lesson in negotiating */
  { a: E(14) + 0.3, b: E(15) + 0.2, el: <STon act="book" pin="irked" /> },
  { a: E(15) + 0.2, b: E(16) + 0.2, el: <ValueList /> },
  { a: E(16) + 0.2, b: mid(17), el: <SPdSit act="sit" pin="irked" ton="book" push={-0.004} /> },
  { a: mid(17), b: E(17) + 0.3, el: <STon act="book" pin="irked" tight /> },
  { a: E(17) + 0.3, b: E(17) + 1.0, el: <SPakSmirk pin="irked" pd="sit" ton="book" /> },
  { a: E(17) + 1.0, b: E(18) + 0.3, el: <SPdSit act="pack" pin="irked" ton="book" push={-0.006} /> },
  { a: E(18) + 0.3, b: E(18) + 1.9, el: <SlamCard text={"อย่าขายธุรกิจ\nก่อนรู้มูลค่า\nที่แท้จริงของมัน"} sub="รีบตัดสินใจเพราะถูกกดดัน = เสียเปรียบ" /> },
  /* 6. a warning, then the message */
  { a: E(18) + 1.9, b: E(20) + 0.2, el: <SDoorTalk /> },
  { a: E(20) + 0.2, b: E(21) + 0.3, el: <SPakDoor /> },
  { a: E(21) + 0.3, b: T(22) - 0.05, el: <SCarLeave /> },
  { a: T(22) - 0.05, b: E(22) + 0.2, el: <SDadAsk /> },
  { a: E(22) + 0.2, b: E(23) + 0.4, el: <STonDecide /> },
  { a: E(23) + 0.4, b: E(23) + 2.3, el: <PhoneMsg /> },
  { a: E(23) + 2.3, b: END + 0.45, el: <SNightEyes fastAt={END - (E(23) + 2.3) - 0.9} /> },
  { a: END + 0.45, b: DUR / FPS, el: <NextCard /> },
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
