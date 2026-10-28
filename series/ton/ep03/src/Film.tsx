import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadMali } from "@remotion/google-fonts/Mali";
import { Cam, Glow, Shot, type V3 } from "./kit/three";
import { Click, CREAM, DUR, FPS, FadeOut, Grain, LINE, RED, SANS, Vig, fr, io, useSpr } from "./kit/ui";
import { Char, SLIM, headCenter, type Look, type Pose } from "./rig/char";
import { DAD, KID1, KID1_PH, KID2_PH, PAKIN, PAKIN_NB, PALA, PALB, STRANGER, TON, TON_HOME, TON_NB, TON_PENCIL } from "./rig/cast";
import { CROUCH, SIT, blendPose, reachPose, walkPose } from "./rig/poses";
import { FRONT_PATH_Z, School } from "./sets/school";
import { ACROSS, COIN_TABLE, SIGN, Stall, WOK } from "./sets/stall";
import { Classroom, TON_DESK, TON_SEAT } from "./sets/classroom";
import { Captions } from "./ui/captions";
import MOUTH from "./mouth.json";

const HAND = loadMali("normal", { weights: ["500", "600"], subsets: ["thai", "latin"] }).fontFamily;

/** EP3 — ขายดี แต่ทำไมไม่รวย? (~88 s). Story + dialogue: the user's MASTER PROMPT; lines 11–12 = the CK book reveal (user asked).
 *  Rules: series/ton/RULES.md (hook in 3 s, reaction shots, stingers, ending: hard cut to black, stranger never shown clearly). */

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
const WRITE = (f: number): Pose => ({ spine: [0.5, 0, 0], head: [0.5, 0, 0], shR: [-0.85 + Math.sin(f * 0.6) * 0.05, 0.1, -0.1], elR: -0.95, shL: [-0.6, 0, 0.25], elL: -1.0 });
const LAUGH = (f: number, s = 0): Pose => ({ spine: [-0.12 + Math.sin(f * 0.9 + s) * 0.05, 0, 0], head: [-0.2 + Math.sin(f * 0.9 + s) * 0.06, 0, 0], mouth: 0.45 + Math.sin(f * 1.3 + s) * 0.2, blink: 1, shL: [-0.3, 0, 0.3], elL: -1.2, shR: [-0.2, 0, -0.2], elR: -0.6 });
const HOLD_NB: Pose = { shR: [-1.15, 0.2, -0.15], elR: -1.1 };
const RAISE_NB: Pose = { shR: [-2.95, 0, -0.15], elR: -0.15 };
const KNEEL = (f: number, tremble = 1): Pose => ({ ...CROUCH, shR: [-0.75 + Math.sin(f * 2.1) * 0.03 * tremble, 0, -0.25], elR: -0.25, shL: [-0.7, 0, 0.3], elL: -0.6, head: [0.45, 0, 0] });

/* ═════════ classroom ═════════ */
const PAK_C: V3 = [1.6, 0, 1.0], PA_C: V3 = [0.05, 0, 1.25], PB_C: V3 = [2.15, 0, 1.6];
const SIT_Y = (SIT.y ?? 0) * SLIM.leg * TON.height;
const HTS = face(TON) + SIT_Y; // seated Ton head height
const HP = face(PAKIN), HA = face(PALA), HB = face(PALB);
const NB_DESK: V3 = [TON_DESK[0] + 0.02, TON_DESK[1] + 0.012, TON_DESK[2] + 0.03];
type ClassAct = { ton?: "write" | "look" | "talk"; pak?: "grab" | "hold" | "taunt" | "drop"; pala?: "laugh" | "talk"; mt?: number; mp?: number; ma?: number; nb?: "desk" | "grab" | "gone" | "drop"; k?: number };
const ClassScene: React.FC<ClassAct> = ({ ton = "look", pak = "hold", pala = "laugh", mt = 0, mp = 0, ma = 0, nb = "gone", k = 0 }) => {
  const f = useCurrentFrame();
  const tonPose: Pose = ton === "write" ? { ...SIT, ...WRITE(f), spine: [0.2, 0, 0], head: [0.45, 0, 0], blink: 0 }
    : { ...SIT, shL: [-0.55, 0, 0.25], elL: -0.9, shR: [-0.55, 0, -0.25], elR: -0.9, head: [-0.32, -0.35, 0], browUp: ton === "talk" ? -0.3 : 0.5, mouth: mt, blink: blink(f, 1) };
  const pakPose: Pose = pak === "grab" ? { ...reachPose(Math.sin(Math.min(1, k) * Math.PI) * 0.9), head: [0.35, 0, 0], blink: blink(f, 3) }
    : pak === "drop" ? { ...blendPose(HOLD_NB, { shR: [-0.6, 0.1, -0.3], elR: -0.2 }, k), head: [0.2, 0, 0], mouth: mp, browUp: -0.4, blink: blink(f, 3) }
    : { ...HOLD_NB, head: [0.1, 0, 0], mouth: mp, browUp: pak === "taunt" ? 0.6 : -0.2, blink: blink(f, 3) };
  const palaPose: Pose = pala === "laugh" ? LAUGH(f, 1) : { ...LAUGH(f, 1), mouth: ma, blink: blink(f, 5) };
  const nbPos: V3 = nb === "desk" ? NB_DESK : nb === "grab" ? lerp3(NB_DESK, [PAK_C[0] - 0.3, 1.0, PAK_C[2] - 0.05], k) : nb === "drop" ? lerp3([PAK_C[0] - 0.25, 1.0, PAK_C[2]], NB_DESK, k) : [0, -5, 0];
  return (
    <Classroom>
      <Char L={nb === "desk" || ton === "write" ? TON_PENCIL : TON} p={TON_SEAT} ry={Math.PI} pose={tonPose} seed={1} />
      <Char L={pak === "grab" ? PAKIN : PAKIN_NB} p={PAK_C} ry={yawTo(PAK_C, TON_SEAT)} pose={pak === "drop" && k > 0.5 ? { ...pakPose, holdOff: true } : pakPose} seed={3} />
      <Char L={PALA} p={PA_C} ry={yawTo(PA_C, TON_SEAT)} pose={palaPose} seed={5} />
      <Char L={PALB} p={PB_C} ry={yawTo(PB_C, TON_SEAT)} pose={LAUGH(f, 2.3)} seed={6} />
      {/* the notebook (on the desk / flying) */}
      <group position={nbPos} rotation={[-Math.PI / 2 + (nb === "grab" ? k * 1.2 : 0), 0, nb === "drop" ? (1 - k) * 2 : 0.15]}>
        <mesh><boxGeometry args={[0.16, 0.21, 0.012]} /><meshStandardMaterial color="#2F4E8C" /></mesh>
        <mesh position={[0, 0, 0.007]}><boxGeometry args={[0.15, 0.2, 0.003]} /><meshStandardMaterial color="#F1ECDD" /></mesh>
      </group>
    </Classroom>
  );
};
/** XCU: pencil on numbers, then a hand snatches the notebook */
const SDeskXCU = () => { const f = useCurrentFrame(); const k = io(f, 7, 15, 0, 1); return <Shot><ClassScene ton="write" pak="grab" nb={f < 7 ? "desk" : "grab"} k={f < 7 ? 0 : k} /><Cam p={[TON_DESK[0] - 0.1, 1.32, TON_DESK[2] - 0.42]} t={[NB_DESK[0], 0.74, NB_DESK[2] + 0.02]} fov={38} drift={0.4} /></Shot>; };
const SPakinSmirk = () => { const f = useCurrentFrame(); const d = yawTo(PAK_C, TON_SEAT); return <Shot><ClassScene pak="taunt" mp={useMouth("pakin")} /><Cam p={[PAK_C[0] + Math.sin(d) * 1.5, HP - 0.18, PAK_C[2] + Math.cos(d) * 1.5 - f * 0.002]} t={[PAK_C[0], HP - 0.04, PAK_C[2]]} fov={31} drift={0.5} /></Shot>; };
const SPalA = () => { const f = useCurrentFrame(); const d = yawTo(PA_C, TON_SEAT); return <Shot><ClassScene pala="talk" ma={useMouth("pala")} /><Cam p={[PA_C[0] + Math.sin(d) * 1.6 - 0.2, HA - 0.05, PA_C[2] + Math.cos(d) * 1.6 - f * 0.002]} t={[PA_C[0], HA - 0.06, PA_C[2]]} fov={32} drift={0.5} /></Shot>; };
const STonEyes = () => { const f = useCurrentFrame(); return <Shot><ClassScene ton="look" /><Cam p={[TON_SEAT[0] - 0.12, HTS + 0.02, TON_SEAT[2] - 1.3 + f * 0.006]} t={[TON_SEAT[0], HTS - 0.0, TON_SEAT[2]]} fov={26} drift={0.2} /></Shot>; };
const STonAsk = () => { const f = useCurrentFrame(); return <Shot><ClassScene ton="talk" mt={useMouth("ton")} /><Cam p={[TON_SEAT[0] - 0.45, HTS + 0.12, TON_SEAT[2] - 1.35 + f * 0.003]} t={[TON_SEAT[0], HTS - 0.02, TON_SEAT[2]]} fov={32} drift={0.4} /></Shot>; };
const SPakinDrop: React.FC<{ at: number }> = ({ at }) => { const f = useCurrentFrame(); const k = io(f, fr(at), fr(at) + 9, 0, 1); return <Shot><ClassScene pak={f < fr(at) ? "hold" : "drop"} mp={useMouth("pakin")} nb={f < fr(at) ? "gone" : "drop"} k={k} /><Cam p={[-0.75, 1.5, 0.55 + f * 0.002]} t={[1.15, 1.0, 1.1]} fov={40} drift={0.5} /></Shot>; };

/* ═════════ courtyard ═════════ */
const Z = FRONT_PATH_Z;
const TON2: V3 = [-0.6, 0, Z], PAK2: V3 = [0.35, 0, Z], PA2: V3 = [-1.3, 0, Z - 0.75], PB2: V3 = [-1.3, 0, Z + 0.75];
const K1: V3 = [1.7, 0, Z + 1.7], K2: V3 = [-2.4, 0, Z + 1.4], K3: V3 = [2.2, 0, Z - 0.9];
type YardAct = { ton?: "stand" | "kneel" | "up" | "rise"; pak?: "raise" | "point" | "fling" | "laugh"; pb?: "talk" | "laugh"; mp?: number; mb?: number; mt?: number; k?: number; pages?: number };
const PAGES: { to: V3; d: number; s: number }[] = Array.from({ length: 7 }, (_, i) => ({ to: [TON2[0] + 0.35 + Math.sin(i * 2.3) * 0.45, 0.006 + i * 0.001, Z + Math.cos(i * 1.7) * 0.45], d: i * 2, s: i }));
const Yard: React.FC<YardAct> = ({ ton = "stand", pak = "raise", pb = "laugh", mp = 0, mb = 0, mt = 0, k = 0, pages = -1 }) => {
  const f = useCurrentFrame();
  const tonPose: Pose = ton === "stand" ? { shR: [-0.3, 0, -0.15], elR: -0.4, head: [-0.25, 0, 0], browUp: 0.6, blink: blink(f, 1) }
    : ton === "kneel" ? { ...KNEEL(f), blink: blink(f, 1) }
    : ton === "up" ? { ...KNEEL(f, 0.5), spine: [0.2, 0, 0], head: [-0.75, 0, 0], browUp: -0.2, mouth: mt, blink: blink(f, 1) }
    : { ...blendPose(KNEEL(f, 0), { y: -0.12, hipL: [-0.6, 0, 0.1], hipR: [-0.6, 0, -0.1], knL: 0.8, knR: 0.8, spine: [0.2, 0, 0], head: [-0.4, 0, 0], shR: [-0.2, 0, -0.2], elR: -0.3 }, k), browUp: -0.4, blink: blink(f, 1) };
  const pakPose: Pose = pak === "raise" ? { ...RAISE_NB, head: [-0.1, 0, 0], mouth: mp, browUp: 0.5, blink: blink(f, 3) }
    : pak === "point" ? { ...HOLD_NB, head: [0.25, 0, 0], mouth: mp, browUp: -0.5, blink: blink(f, 3) }
    : pak === "fling" ? { ...blendPose(RAISE_NB, { shR: [-0.5, 0.2, -0.4], elR: -0.1 }, k), head: [0.1, 0, 0], browUp: 0.3, blink: blink(f, 3), holdOff: k > 0.4 }
    : { ...LAUGH(f, 0.5), holdOff: true };
  return (
    <School>
      <Char L={ton === "stand" ? TON : TON} p={TON2} ry={Math.PI / 2} pose={tonPose} seed={1} />
      <Char L={PAKIN_NB} p={PAK2} ry={-Math.PI / 2} pose={pakPose} seed={3} />
      <Char L={PALA} p={PA2} ry={yawTo(PA2, TON2) + 0.4} pose={LAUGH(f, 1)} seed={5} />
      <Char L={PALB} p={PB2} ry={yawTo(PB2, TON2) - 0.4} pose={pb === "talk" ? { ...LAUGH(f, 2.3), mouth: mb, blink: blink(f, 6) } : LAUGH(f, 2.3)} seed={6} />
      <Char L={KID1_PH} p={K1} ry={yawTo(K1, TON2)} pose={{ shR: [-1.45, 0.3, -0.2], elR: -0.9, head: [0.05, 0, 0], mouth: 0.3, blink: blink(f, 7) }} seed={7} />
      <Char L={KID2_PH} p={K2} ry={yawTo(K2, TON2)} pose={{ shR: [-1.45, 0.3, -0.2], elR: -0.9, head: [0.05, 0, 0], mouth: 0.4, blink: blink(f, 8) }} seed={8} />
      <Char L={KID1} p={K3} ry={yawTo(K3, TON2)} pose={LAUGH(f, 4)} seed={9} />
      {/* scattered pages: fall from Pakin's hand (pages = local frame they started), then lie on the ground */}
      {pages >= 0 ? PAGES.map((p, i) => {
        const q = Math.max(0, Math.min(1, (f - pages - p.d) / 40)); const from: V3 = [PAK2[0] - 0.2, 2.0, Z];
        const pos = lerp3(from, p.to, q); pos[1] = from[1] + (p.to[1] - from[1]) * (1 - (1 - q) * (1 - q));
        return <mesh key={i} position={pos} rotation={[-Math.PI / 2 + (1 - q) * Math.sin(f / 5 + i) * 0.9, (1 - q) * f * 0.08, i * 0.7]}><planeGeometry args={[0.15, 0.2]} /><meshStandardMaterial color="#F3EFE4" side={2} /></mesh>;
      }) : null}
    </School>
  );
};
const HTK = face(TON) + (CROUCH.y ?? 0) * SLIM.leg * TON.height;
const SRaise = () => { const f = useCurrentFrame(); return <Shot><Yard pak="raise" mp={useMouth("pakin")} /><Cam p={[-0.45, 0.55, Z + 1.35 - f * 0.002]} t={[PAK2[0], 1.7, Z]} fov={42} drift={0.5} /></Shot>; };
const SPhones = () => { const f = useCurrentFrame(); return <Shot><Yard pak="raise" /><Cam p={[K1[0] + Math.sin(yawTo(K1, TON2)) * 1.3 + 0.3, face(KID1) + 0.05, K1[2] + Math.cos(yawTo(K1, TON2)) * 1.3 + f * 0.003]} t={[K1[0], face(KID1) - 0.1, K1[2]]} fov={34} drift={0.6} /></Shot>; };
const SPalB = () => { const f = useCurrentFrame(); return <Shot><Yard pak="raise" pb="talk" mb={useMouth("palb")} /><Cam p={[PB2[0] + 1.5, HB - 0.05, PB2[2] + 0.9 - f * 0.002]} t={[PB2[0], HB - 0.05, PB2[2]]} fov={32} drift={0.5} /></Shot>; };
const SFling = () => { const f = useCurrentFrame(); const k = io(f, 4, 12, 0, 1); return <Shot><Yard pak="fling" k={k} pages={8} /><Cam p={[-0.1, 1.3, Z + 2.3 - f * 0.004]} t={[-0.1, 0.9, Z]} fov={44} drift={0.4} /></Shot>; };
const SLow = () => { return <Shot><Yard pak="point" ton="kneel" mp={useMouth("pakin")} pages={-200} /><Cam p={[PAK2[0] - 1.25, 0.3, Z + 0.95]} t={[PAK2[0], HP - 0.05, Z]} fov={40} drift={0.4} /></Shot>; };
const SHands = () => { const f = useCurrentFrame(); return <Shot tilt={false}><Yard pak="point" ton="kneel" pages={-200} /><Cam p={[TON2[0] + 0.6, 0.62, Z - 1.1 + f * 0.002]} t={[TON2[0] + 0.2, 0.25, Z]} fov={36} drift={0.25} /></Shot>; };
const STonUp = () => { const f = useCurrentFrame(); return <Shot><Yard pak="point" ton="up" mt={useMouth("ton")} pages={-200} /><Cam p={[TON2[0] + 0.95, HTK + 0.4, Z + 0.25 - f * 0.002]} t={[TON2[0], HTK + 0.02, Z]} fov={32} drift={0.3} /></Shot>; };
const SLaughWide = () => { const f = useCurrentFrame(); const k = f < 40 ? io(f, 8, 26, 0, 0.75) : io(f, 46, 62, 0.75, 0); return <Shot><Yard pak="laugh" ton="rise" k={k} pages={-200} /><Cam p={[-0.2, 1.6, Z + 4.2 - f * 0.006]} t={[-0.2, 0.9, Z]} fov={44} drift={0.5} /></Shot>; };

/* ═════════ stall ═════════ */
const DAD3: V3 = [WOK[0], 0, -0.62];
const TON_T: V3 = [COIN_TABLE[0], 0, COIN_TABLE[2] - 0.5];           // seated behind the folding table, facing +z
const HTT = face(TON_HOME) + SIT_Y, HD = face(DAD);
const TON_SIDE: V3 = [1.35, 0, -0.35];                                  // scene 6: standing beside the table, facing the road
type StallAct = { dusk?: boolean; ton?: "walk" | "put" | "watch" | "book" | "sit" | "talk" | "write" | "late" | "pack" | "stand" | "turn" | "sus"; dad?: "fry" | "wipe" | "ask" | "explain" | "away" | "none"; man?: "snap" | "gone" | "none"; mt?: number; md?: number; k?: number; f0?: number };
const StallScene: React.FC<StallAct> = ({ dusk, ton = "sit", dad = "fry", man = "none", mt = 0, md = 0, k = 0, f0 = 0 }) => {
  const f = useCurrentFrame();
  // walk-in: from the right edge of the stall to the table
  const W0: V3 = [3.1, 0, -0.1], W1: V3 = [1.85, 0, -0.55];
  const wk = io(f, 0, 50, 0, 1); const wpos = lerp3(W0, W1, wk); const dist = wk * Math.hypot(W1[0] - W0[0], W1[2] - W0[2]);
  let tonL: Look = TON_HOME, tonP: V3 = TON_T, tonRy = 0, tonPose: Pose;
  if (ton === "walk" || ton === "put") {
    tonL = TON_NB; tonP = ton === "walk" ? wpos : W1; tonRy = yawTo(W0, W1);
    tonPose = ton === "walk" ? { ...walkPose((dist / 1.2) * Math.PI * 2, 1 - Math.max(0, wk - 0.85) * 6), shR: [-0.35, 0, -0.12], elR: -0.7, head: [0.1, 0, 0], browUp: -0.3, blink: blink(f, 1) }
      : { ...reachPose(io(f, 0, 14, 0.5, 1.0)), spine: [0.3, 0, 0], head: [0.4, 0, 0], browUp: -0.3, blink: blink(f, 1), holdOff: f > 14 };
  } else if (ton === "watch") { tonP = W1; tonRy = yawTo(W1, DAD3); tonPose = { head: [0.05, 0, 0], browUp: io(f, 0, 40, -0.4, 0.5), blink: blink(f, 1) }; }
  else if (ton === "stand" || ton === "turn" || ton === "sus") {
    tonP = TON_SIDE; tonRy = ton === "turn" ? (f < 26 ? -2.4 * io(f, 0, 10, 0, 1) : -2.4 * io(f, 30, 40, 1, 0)) : 0;
    tonPose = { head: [0.0, 0, 0], browUp: ton === "sus" ? -0.5 : 0.6, mouth: mt, blink: blink(f, 1), shR: [-0.15, 0, -0.15], elR: -0.3 };
  } else {
    const base: Pose = { ...SIT, shL: [-0.7, 0, 0.2], elL: -1.0, shR: [-0.7, 0, -0.2], elR: -1.0 };
    tonPose = ton === "book" ? { ...base, head: [0.12, 0, 0], mouth: mt, browUp: -0.2, blink: blink(f, 1) }
      : ton === "write" ? { ...SIT, ...WRITE(f), blink: 0 }
      : ton === "late" ? { ...SIT, ...WRITE(f * 0.4), spine: [0.15, 0, 0], head: [0.25, 0, 0], browUp: -0.5, mouth: mt, blink: blink(f, 1) }
      : ton === "pack" ? { ...base, shR: [-0.9 + Math.sin(f / 5) * 0.1, 0.1, -0.1], elR: -0.6, head: [io(f, 20, 34, 0.35, -0.1), 0, 0], browUp: io(f, 20, 34, 0, 0.6), blink: blink(f, 1) }
      : ton === "talk" ? { ...base, head: [0.05, -0.5, 0], mouth: mt, browUp: 0.4, blink: blink(f, 1) }
      : { ...base, head: [0.05, -0.55, 0], mouth: mt, browUp: 0.2, blink: blink(f, 1) };
  }
  const trem = Math.sin(f / 7) * 0.12;
  const dadPose: Pose = dad === "fry" ? { shR: [-1.0 + Math.sin(f / 6) * 0.18, 0.15, -0.15], elR: -0.95, shL: [-0.35, 0, 0.2], elL: -0.6, spine: [0.12, 0, 0], head: [0.3, 0, 0], blink: blink(f, 2) }
    : dad === "wipe" ? { shL: [-2.45 + trem * 0.3, -0.35, 0.55], elL: -2.05, shR: [-0.6, 0, -0.15], elR: -0.6, head: [0.0, 0, 0.05], browUp: 0.7, blink: f % 60 < 30 ? 1 : 0 }
    : dad === "ask" ? { shR: [-0.6, 0, -0.15], elR: -0.8, head: [0.05, 0.6, 0], browUp: 0.3, mouth: md, blink: blink(f, 2) }
    : dad === "explain" ? { shR: [-0.6, 0, -0.15], elR: -0.8, shL: [-1.2, 0.5, 0.35], elL: -0.2, head: [0.05, 0.55, 0], browUp: 0.5, mouth: md, blink: blink(f, 2) }
    : { blink: blink(f, 2) };
  const manPose: Pose = { shR: man === "snap" ? [-1.55 * io(f, f0, f0 + 12, 0, 1), 0.2, -0.1] : [0, 0, -0.12], elR: man === "snap" ? -0.5 * io(f, f0, f0 + 12, 0, 1) : -0.15, head: [-0.12, 0, 0], blink: 1 };
  const flash = man === "snap" ? Math.max(0, 1 - Math.abs(f - (f0 + 20)) / 3) : 0;
  return (
    <Stall dusk={dusk}>
      {dad !== "none" && dad !== "away" ? <Char L={DAD} p={DAD3} ry={dad === "ask" || dad === "explain" ? 0.7 : 0} pose={dadPose} seed={2} /> : null}
      {dad === "away" ? <Char L={DAD} p={[2.6, 0, -1.85]} ry={0} pose={dadPose} seed={2} /> : null}
      <Char L={tonL} p={tonP} ry={tonRy} pose={tonPose} seed={1} />
      {/* stool under the seated Ton */}
      <mesh position={[TON_T[0], 0.21, TON_T[2] + 0.05]}><cylinderGeometry args={[0.15, 0.17, 0.42, 16]} /><meshStandardMaterial color="#2F6FB0" /></mesh>
      {/* table things: notebook, receipts, cash box, calculator */}
      <group position={[COIN_TABLE[0], 0.716, COIN_TABLE[2]]}>
        {ton !== "walk" && !(ton === "put" && f < 14) ? <mesh position={[-0.12, 0, 0.12]} rotation={[-Math.PI / 2, 0, 0.1]}><boxGeometry args={[0.16, 0.21, 0.012]} /><meshStandardMaterial color="#2F4E8C" /></mesh> : null}
        {!dusk ? [0, 1, 2, 3].map((i) => <mesh key={i} position={[0.08 + i * 0.07, 0.002 + i * 0.0005, 0.1 - (i % 2) * 0.08]} rotation={[-Math.PI / 2, 0, i * 0.4 - 0.5]}><planeGeometry args={[0.08, 0.14]} /><meshStandardMaterial color="#FBFAF4" /></mesh>) : null}
        <mesh position={[0.28, 0.04, -0.14]}><boxGeometry args={[0.2, 0.08, 0.14]} /><meshStandardMaterial color="#8C2F2A" /></mesh>
        {!dusk ? <mesh position={[-0.3, 0.01, -0.12]}><boxGeometry args={[0.09, 0.02, 0.14]} /><meshStandardMaterial color="#2A2C31" /></mesh> : null}
      </group>
      {/* a desk lamp for the late-night scenes */}
      {!dusk ? <><pointLight position={[COIN_TABLE[0] - 0.3, 1.15, COIN_TABLE[2] + 0.1]} intensity={1.1} distance={2.2} color="#FFD49A" /><Glow p={[COIN_TABLE[0] - 0.3, 1.05, COIN_TABLE[2] + 0.1]} s={0.5} c="#FFD49A" o={0.5} /></> : null}
      <pointLight position={[TON_T[0], 1.6, TON_T[2] + 1.2]} intensity={0.7} distance={2.6} color="#FFE2B8" />
      {/* the stranger across the road: backlit, face never lit */}
      {man !== "none" && man !== "gone" ? <>
        <Char L={STRANGER} p={ACROSS} ry={yawTo(ACROSS, [SIGN[0], 0, SIGN[2]])} pose={manPose} seed={11} />
        <pointLight position={[ACROSS[0] - 0.6, 2.6, ACROSS[2] + 1.6]} intensity={2.6} distance={4} color="#6E86C8" />
        {flash > 0 ? <><pointLight position={[ACROSS[0] + 0.1, 1.55, ACROSS[2] - 0.4]} intensity={6 * flash} distance={4} color="#FFFFFF" /><Glow p={[ACROSS[0] + 0.05, 1.5, ACROSS[2] - 0.35]} s={0.9 * flash + 0.01} c="#FFFFFF" o={flash} /></> : null}
      </> : null}
    </Stall>
  );
};
const SStallEnter = () => { const f = useCurrentFrame(); return <Shot><StallScene dusk ton="walk" dad="fry" /><Cam p={[2.4, 1.45, 3.1 - f * 0.004]} t={[2.3 - f * 0.006, 1.05, -0.4]} fov={42} drift={0.4} /></Shot>; };
const SDadSweat = () => { const f = useCurrentFrame(); return <Shot><StallScene dusk ton="watch" dad="wipe" /><pointLight position={[DAD3[0] + 0.4, 1.6, DAD3[2] + 0.9]} intensity={0.9} distance={2} color="#FFC890" /><Cam p={[DAD3[0] + 0.55, HD + 0.05, DAD3[2] + 1.75 - f * 0.003]} t={[DAD3[0], HD - 0.05, DAD3[2]]} fov={31} drift={0.4} /></Shot>; };
const STonWatch = () => { const f = useCurrentFrame(); const d = yawTo([1.85, 0, -0.55], DAD3); const P: V3 = [1.85, 0, -0.55]; const H = face(TON_HOME); return <Shot><StallScene dusk ton="watch" dad="fry" /><Cam p={[P[0] + Math.sin(d) * 1.6 + 0.3, H + 0.03, P[2] + Math.cos(d) * 1.6 + 0.5 - f * 0.003]} t={[P[0], H - 0.06, P[2]]} fov={30} drift={0.3} /></Shot>; };
const STonBook = () => { const f = useCurrentFrame(); return <Shot><StallScene dusk ton="book" dad="fry" mt={0} /><Cam p={[TON_T[0] - 0.15, HTT + 0.05, TON_T[2] + 1.35 - Math.min(f, 90) * 0.004]} t={[TON_T[0], HTT - 0.25, TON_T[2] + 0.1]} fov={38} drift={0.3} /></Shot>; };
const SDadAsk = () => { const f = useCurrentFrame(); return <Shot><StallScene dusk ton="sit" dad="ask" md={useMouth("dad")} /><Cam p={[DAD3[0] + 1.25, HD + 0.2, DAD3[2] + 1.4 - f * 0.002]} t={[DAD3[0], HD - 0.02, DAD3[2]]} fov={31} drift={0.4} /></Shot>; };
const STonReply = () => { const f = useCurrentFrame(); return <Shot><StallScene dusk ton="sit" dad="ask" mt={useMouth("ton")} /><Cam p={[TON_T[0] - 0.6, HTT + 0.06, TON_T[2] + 1.5 - f * 0.002]} t={[TON_T[0], HTT - 0.05, TON_T[2]]} fov={31} drift={0.4} /></Shot>; };
const STonAskNight = () => { const f = useCurrentFrame(); return <Shot><StallScene ton="talk" dad="ask" mt={useMouth("ton")} /><Cam p={[TON_T[0] - 0.55, HTT + 0.08, TON_T[2] + 1.45 - f * 0.002]} t={[TON_T[0], HTT - 0.05, TON_T[2]]} fov={31} drift={0.4} /></Shot>; };
const SDadExplain = () => { const f = useCurrentFrame(); return <Shot><StallScene ton="sit" dad="explain" md={useMouth("dad")} /><Cam p={[DAD3[0] + 1.3, HD + 0.25, DAD3[2] + 1.5 - f * 0.003]} t={[DAD3[0] - 0.1, HD - 0.08, DAD3[2]]} fov={36} drift={0.4} /></Shot>; };
const STonWrite = () => { const f = useCurrentFrame(); return <Shot><StallScene ton="talk" dad="fry" mt={useMouth("ton")} /><Cam p={[TON_T[0] + 0.5, HTT + 0.1, TON_T[2] + 1.4 - f * 0.002]} t={[TON_T[0], HTT - 0.08, TON_T[2]]} fov={33} drift={0.4} /></Shot>; };
const SLateWide = () => { const f = useCurrentFrame(); return <Shot><StallScene ton="late" dad="none" /><Cam p={[0.2, 1.7, 2.6 - f * 0.004]} t={[TON_T[0] - 0.1, 0.9, TON_T[2]]} fov={40} drift={0.3} /></Shot>; };
const STonEyesLate: React.FC<{ m?: boolean }> = ({ m }) => { const f = useCurrentFrame(); const mt = useMouth("ton"); return <Shot><StallScene ton="late" dad="none" mt={m ? mt : 0} /><pointLight position={[TON_T[0] - 0.1, HTT - 0.1, TON_T[2] + 0.5]} intensity={0.6} distance={1.2} color="#FFD49A" /><Cam p={[TON_T[0] + 0.08, HTT - 0.08, TON_T[2] + 1.45 - f * (m ? 0.002 : 0.005)]} t={[TON_T[0], HTT - 0.12, TON_T[2] + 0.1]} fov={m ? 32 : 28} drift={0.2} /></Shot>; };
const STonPack = () => { const f = useCurrentFrame(); return <Shot><StallScene ton="pack" dad="none" /><Cam p={[TON_T[0] - 0.4, HTT + 0.1, TON_T[2] + 1.5 - f * 0.002]} t={[TON_T[0], HTT - 0.12, TON_T[2]]} fov={33} drift={0.3} /></Shot>; };
const HS = face(TON_HOME);
/** over Ton's shoulder toward the road: the stranger raises his phone at the sign */
const SAcross: React.FC<{ gone?: boolean }> = ({ gone }) => { const f = useCurrentFrame(); return <Shot><StallScene ton="stand" dad="none" man={gone ? "gone" : "snap"} f0={6} /><Cam p={[TON_SIDE[0] - 0.5, HS + 0.1, TON_SIDE[2] - 0.85]} t={[ACROSS[0] * 0.7, 1.3, ACROSS[2] - 0.5 - f * 0.002]} fov={38} drift={0.3} /></Shot>; };
/** behind the stranger: his silhouette, phone up, the stall + sign in front of him; flash */
const SStrangerBack = () => { const f = useCurrentFrame(); return <Shot><StallScene ton="stand" dad="none" man="snap" f0={-10} /><Cam p={[ACROSS[0] - 1.1, 2.0, ACROSS[2] + 2.4 - f * 0.003]} t={[SIGN[0] - 0.3, 1.5, SIGN[2]]} fov={40} drift={0.3} /></Shot>; };
const STonSus = () => { const f = useCurrentFrame(); return <Shot><StallScene ton="sus" dad="none" man="none" mt={useMouth("ton")} /><Cam p={[TON_SIDE[0] - 0.2, HS + 0.02, TON_SIDE[2] + 1.3 - f * 0.003]} t={[TON_SIDE[0], HS - 0.05, TON_SIDE[2]]} fov={30} drift={0.3} /></Shot>; };
const STonTurn = () => { const f = useCurrentFrame(); return <Shot><StallScene ton="turn" dad="away" man="none" /><Cam p={[TON_SIDE[0] + 0.3, HS + 0.05, TON_SIDE[2] + 1.6 - f * 0.002]} t={[TON_SIDE[0], HS - 0.1, TON_SIDE[2]]} fov={34} drift={0.3} /></Shot>; };
const STonFinal: React.FC<{ fastAt: number }> = ({ fastAt }) => { const f = useCurrentFrame(); const fast = io(f, fr(fastAt), fr(fastAt) + 14, 0, 0.75); return <Shot><StallScene ton="sus" dad="none" man="none" /><Cam p={[TON_SIDE[0] - 0.05, HS + 0.02, TON_SIDE[2] + 1.45 - f * 0.0025 - fast]} t={[TON_SIDE[0], HS - 0.03, TON_SIDE[2]]} fov={28} drift={0.2} /></Shot>; };

/* ═════════ DOM inserts ═════════ */
/** whip-pan in: horizontal smear for the first frames of a cut */
const WhipIn: React.FC<{ children: React.ReactNode }> = ({ children }) => { const f = useCurrentFrame(); const k = Math.max(0, 1 - f / 5); return <AbsoluteFill style={{ filter: k > 0 ? `blur(${k * 14}px)` : undefined, transform: `translateX(${k * -220}px)` }}>{children}</AbsoluteFill>; };
/** the wrapped cover slides off: "เปลี่ยนอนาคต" was Ton's own wrap, the real book appears */
const BookSwap: React.FC = () => {
  const f = useCurrentFrame(); const slide = io(f, 16, 40, 0, 1); const s = useSpr(40, 14);
  return (
    <AbsoluteFill style={{ background: "#07080C", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", width: 680, height: 963, marginTop: -260, transform: `scale(${0.96 + 0.04 * s + f * 0.0004})` }}>
        <Img src={staticFile("book-cover.jpg")} style={{ position: "absolute", inset: 0, width: 680, height: 963, borderRadius: 10, boxShadow: `0 30px 90px rgba(255,90,70,${0.12 + 0.2 * s})` }} />
        <div style={{ position: "absolute", inset: -8, borderRadius: 14, background: "linear-gradient(160deg,#1B1D22,#0C0D10)", boxShadow: "inset 0 0 0 3px #2A2D34", display: "flex", alignItems: "center", justifyContent: "center", transform: `translateY(${-slide * 1100}px) rotate(${-slide * 6}deg)` }}>
          <div style={{ color: RED, fontFamily: SANS, fontWeight: 700, fontSize: 120, lineHeight: 1.1, textAlign: "center" }}>เปลี่ยน<br />อนาคต</div>
        </div>
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: Math.max(0, 1 - Math.abs(f - 40) / 4) * 0.5 }} />
      <Click at={40} v={0.3} />
    </AbsoluteFill>
  );
};
const RCPT: React.CSSProperties = { position: "absolute", width: 300, background: "#FBFAF4", padding: "26px 26px 30px", fontFamily: SANS, color: "#2A2622", boxShadow: "0 14px 34px rgba(0,0,0,0.45)", fontSize: 30, lineHeight: 1.5 };
const Receipt: React.FC<{ x: number; y: number; r: number; item: string; qty: string; total: string; mark?: number }> = ({ x, y, r, item, qty, total, mark = 0 }) => (
  <div style={{ ...RCPT, left: x, top: y, transform: `rotate(${r}deg)` }}>
    <div style={{ fontWeight: 700, fontSize: 32, textAlign: "center", borderBottom: "2px dashed #B9B2A2", paddingBottom: 8 }}>ใบเสร็จรับเงิน</div>
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}><span>{item}</span><span>{qty}</span></div>
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontWeight: 700, position: "relative" }}><span>รวม</span><span>{total} บาท</span>
      {mark > 0 ? <svg width="230" height="90" style={{ position: "absolute", right: -40, top: -26 }}><ellipse cx="115" cy="45" rx="104" ry="36" fill="none" stroke={RED} strokeWidth="6" strokeDasharray="460" strokeDashoffset={460 * (1 - mark)} /></svg> : null}
    </div>
  </div>
);
const LEDGER: React.CSSProperties = { position: "absolute", width: 560, height: 760, background: "#F4F0E6", borderRadius: 12, padding: "44px 46px", fontFamily: HAND, color: "#22306E", boxShadow: "0 24px 60px rgba(0,0,0,0.5)", backgroundImage: "repeating-linear-gradient(transparent 0 70px, #C9D3E6 70px 72px)" };
const Row: React.FC<{ k: string; v: string; o?: number; mark?: number; red?: boolean }> = ({ k, v, o = 1, mark = 0, red }) => (
  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 46, marginTop: 22, opacity: o, color: red ? RED : undefined }}><span>{k}</span><span style={{ position: "relative" }}>{v}
    {mark > 0 ? <svg width="200" height="86" style={{ position: "absolute", right: -40, top: -14 }}><ellipse cx="100" cy="43" rx="92" ry="34" fill="none" stroke={RED} strokeWidth="6" strokeDasharray="420" strokeDashoffset={420 * (1 - mark)} /></svg> : null}</span></div>
);
const WOOD: React.CSSProperties = { background: "repeating-linear-gradient(92deg,#5A3E2A 0 46px,#523826 46px 90px,#5E412C 90px 130px)" };
/** overhead: receipts, cash box, coins — the table at the start of the night */
const TableTop: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ ...WOOD, transform: `scale(${1.08 - f * 0.0012}) translateX(${f * 0.5}px)` }}>
      <div style={{ position: "absolute", left: 600, top: 260, width: 380, height: 260, background: "#8C2F2A", borderRadius: 18, boxShadow: "0 18px 40px rgba(0,0,0,0.5)" }}>
        <div style={{ position: "absolute", inset: 22, background: "#3A1E1A", borderRadius: 10 }}>{[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ position: "absolute", left: 20 + i * 62, top: 30, width: 54, height: 150, background: i % 2 ? "#7FA08A" : "#9CB59A", borderRadius: 6 }} />)}</div>
      </div>
      {Array.from({ length: 9 }, (_, i) => <div key={i} style={{ position: "absolute", left: 150 + (i * 97) % 380, top: 1500 + (i * 53) % 160, width: 70, height: 70, borderRadius: 35, background: i % 3 ? "#C9CDD2" : "#C9A455", boxShadow: "0 4px 10px rgba(0,0,0,0.4)" }} />)}
      <Receipt x={110} y={330} r={-6} item="ไก่สด" qty="10 กก." total="1,650" />
      <Receipt x={170} y={760} r={4} item="แป้งทอดกรอบ" qty="5 ถุง" total="160" />
      <Receipt x={640} y={700} r={-3} item="น้ำมันพืช" qty="1 ขวด" total="240" />
      <div style={{ position: "absolute", left: 640, top: 1150, width: 250, height: 330, background: "#2A2C31", borderRadius: 22, padding: 22, boxShadow: "0 18px 40px rgba(0,0,0,0.5)" }}>
        <div style={{ height: 70, background: "#B9C9A8", borderRadius: 8, fontFamily: SANS, fontSize: 46, textAlign: "right", padding: "6px 12px", color: "#22281C" }}>3,120</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 16 }}>{Array.from({ length: 12 }, (_, i) => <div key={i} style={{ height: 40, background: "#4A4D55", borderRadius: 8 }} />)}</div>
      </div>
      <Click at={4} v={0.15} kind="tick" />
    </AbsoluteFill>
  );
};
/** Ton's notebook: income vs every cost, written line by line */
const LedgerWrite: React.FC = () => {
  const f = useCurrentFrame();
  const rows: [string, string][] = [["ไก่", "1,480"], ["แป้ง", "160"], ["น้ำมัน", "240"], ["แก๊ส", "180"], ["ถุง / ซอส", "95"]];
  return (
    <AbsoluteFill style={{ ...WOOD, alignItems: "center", justifyContent: "center" }}>
      <div style={{ ...LEDGER, position: "relative", width: 820, height: 1180, transform: "rotate(-1.5deg)" }}>
        <div style={{ fontSize: 56, fontWeight: 600 }}>รายรับ</div>
        <Row k="ขายได้" v="3,120" />
        <div style={{ fontSize: 56, fontWeight: 600, marginTop: 40 }}>รายจ่าย</div>
        {rows.map(([k, v], i) => <React.Fragment key={i}><Row k={k} v={v} o={Math.min(1, Math.max(0, (f - 6 - i * 9) / 5))} /><Click at={6 + i * 9} v={0.15} kind="tick" /></React.Fragment>)}
      </div>
    </AbsoluteFill>
  );
};
/** slam card: the lesson of the episode */
const SlamCard: React.FC<{ text: string; sub?: string }> = ({ text, sub }) => {
  const f = useCurrentFrame(); const a = useSpr(0, 14); const shake = f < 7 ? Math.sin(f * 3.1) * 9 * (7 - f) / 7 : 0;
  return (
    <AbsoluteFill style={{ background: "#0A0B10", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: SANS, transform: `translateX(${shake}px)` }}>
      <div style={{ color: CREAM, fontSize: 104, fontWeight: 700, lineHeight: 1.25, opacity: a, transform: `scale(${1.35 - 0.35 * a})` }}>{text}</div>
      <div style={{ width: 160 * a, height: 9, background: RED, borderRadius: 5, margin: "30px auto 0" }} />
      {sub ? <div style={{ color: "#9AA0AE", fontSize: 42, marginTop: 34, opacity: useSpr(12, 14) }}>{sub}</div> : null}
      <Click at={0} v={0.4} />
    </AbsoluteFill>
  );
};
/** late night: ledger vs receipts — the finger (pencil tip) stops at the chicken line; the numbers don't match */
const Compare: React.FC<{ flip?: boolean }> = ({ flip }) => {
  const f = useCurrentFrame();
  const stop = 38; const tipY = flip ? 520 : io(f, 0, stop, 330, 520); const ring = io(f, stop + 4, stop + 20, 0, 1); const ring2 = io(f, stop + 22, stop + 38, 0, 1);
  const zoom = flip ? 1.08 : 1 + Math.max(0, f - stop) * 0.0015;
  return (
    <AbsoluteFill style={{ background: "#120D09" }}>
      <AbsoluteFill style={{ ...WOOD, filter: "brightness(0.55)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(60% 45% at 50% 45%, rgba(255,205,140,0.38), transparent 75%)" }} />
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 40%" }}>
        <div style={{ ...LEDGER, left: 60, top: 260, width: 520, height: 720 }}>
          <div style={{ fontSize: 50, fontWeight: 600 }}>วันที่ 1</div>
          <Row k="ไก่" v="1,480" mark={flip ? 1 : ring} red={!flip && ring > 0.5} />
          <Row k="แป้ง" v="160" />
          <Row k="น้ำมัน" v="240" />
          <Row k="แก๊ส" v="180" />
        </div>
        {flip ? [0, 1, 2].map((i) => <Receipt key={i} x={600 + i * 8 - io(f, i * 8, i * 8 + 10, 0, 1) * (i < 2 ? 520 : 0)} y={360 + i * 26} r={3 - i * 3} item={["น้ำมันพืช", "แป้งทอดกรอบ", "ไก่สด"][i]} qty={["1 ขวด", "5 ถุง", "10 กก."][i]} total={["240", "160", "1,650"][i]} mark={i === 2 ? io(f, 26, 40, 0, 1) : 0} />)
          : <Receipt x={600} y={330} r={3} item="ไก่สด" qty="10 กก." total="1,650" mark={ring2} />}
        {/* pencil tip as the pointer */}
        {!flip ? <div style={{ position: "absolute", left: 420, top: tipY, width: 26, height: 300, background: "linear-gradient(#E8B83A 0 88%, #F1D9B0 88% 96%, #2A2622 96%)", transform: "rotate(-28deg)", transformOrigin: "top", borderRadius: 6, boxShadow: "0 10px 20px rgba(0,0,0,0.5)" }} /> : null}
      </AbsoluteFill>
      {!flip ? <><Click at={stop} v={0.2} kind="tick" /><Click at={stop + 22} v={0.2} kind="tick" /></> : <Click at={2} v={0.12} kind="tick" />}
    </AbsoluteFill>
  );
};
/** phone-shutter flash on the cut (DOM, after SStrangerBack) */
const ShutterFlash: React.FC<{ at: number }> = ({ at }) => { const f = useCurrentFrame(); const k = Math.max(0, 1 - Math.abs(f - at) / 3); return k > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: k * 0.85 }} /> : null; };
/** letterbox bars for the mystery beat */
const Letterbox: React.FC = () => <AbsoluteFill style={{ pointerEvents: "none" }}><div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 220, background: "#000" }} /><div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 220, background: "#000" }} /></AbsoluteFill>;
/** the question, slammed on black */
const QuestionCard: React.FC = () => {
  const f = useCurrentFrame(); const a = useSpr(5, 12); const shake = f >= 5 && f < 12 ? Math.sin(f * 3.1) * 10 * (12 - f) / 7 : 0;
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: SANS, transform: `translateX(${shake}px)` }}>
      <div style={{ color: CREAM, fontSize: 96, fontWeight: 700, lineHeight: 1.3, opacity: a, transform: `scale(${1.3 - 0.3 * a})` }}>แล้วชายคนนั้น<br /><span style={{ color: RED }}>เป็นใคร?</span></div>
    </AbsoluteFill>
  );
};
const NextCard: React.FC = () => {
  const f = useCurrentFrame(); const a = useSpr(4, 18), b = useSpr(14, 14);
  const shake = f >= 14 && f < 21 ? Math.sin(f * 3.1) * 7 * (21 - f) / 7 : 0;
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: SANS, transform: `translateX(${shake}px)` }}>
      <div style={{ color: CREAM, fontSize: 92, fontWeight: 700, opacity: a, transform: `scale(${1.3 - 0.3 * a})` }}>EP 4</div>
      <div style={{ width: 130, height: 7, background: RED, borderRadius: 4, margin: "24px auto", opacity: a }} />
      <div style={{ color: RED, fontSize: 68, fontWeight: 700, maxWidth: 940, lineHeight: 1.3, opacity: b, transform: `scale(${1.25 - 0.25 * b})` }}>ความจริงที่ไม่มีใคร<br />อยากให้ต้นรู้</div>
      <div style={{ color: "#8A8F9A", fontSize: 34, marginTop: 40, opacity: useSpr(30, 14) }}>ติดตามตอนต่อไป</div>
    </AbsoluteFill>
  );
};

/* ═════════ the edit ═════════ */
type Cut = { a: number; b: number; el: React.ReactNode };
const END = E(23);
export const CUTS: Cut[] = [
  /* scene 1: classroom — the notebook is snatched */
  { a: 0, b: 0.9, el: <SDeskXCU /> },
  { a: 0.9, b: E(1) + 0.2, el: <WhipIn><SPakinSmirk /></WhipIn> },
  { a: E(1) + 0.2, b: E(2) + 0.9, el: <SPalA /> },
  { a: E(2) + 0.9, b: T(3) - 0.05, el: <STonEyes /> },
  { a: T(3) - 0.05, b: E(3) + 0.3, el: <STonAsk /> },
  { a: E(3) + 0.3, b: E(4) + 1.0, el: <SPakinDrop at={E(4) - (E(3) + 0.3) + 0.1} /> },
  /* scene 2: courtyard — in front of everyone */
  { a: E(4) + 1.0, b: E(5) + 0.25, el: <SRaise /> },
  { a: E(5) + 0.25, b: T(6) - 0.05, el: <SPhones /> },
  { a: T(6) - 0.05, b: E(6) + 0.5, el: <SPalB /> },
  { a: E(6) + 0.5, b: T(7) - 0.05, el: <SFling /> },
  { a: T(7) - 0.05, b: E(7) + 0.2, el: <SLow /> },
  { a: E(7) + 0.2, b: T(8) - 0.05, el: <SHands /> },
  { a: T(8) - 0.05, b: E(8) + 0.4, el: <STonUp /> },
  { a: E(8) + 0.4, b: T(9) - 0.1, el: <SLaughWide /> },
  /* scene 3: the stall at sunset — the choice + the book */
  { a: T(9) - 0.1, b: mid(10), el: <SStallEnter /> },
  { a: mid(10), b: E(10) + 0.3, el: <SDadSweat /> },
  { a: E(10) + 0.3, b: T(11) + 0.2, el: <STonWatch /> },
  { a: T(11) + 0.2, b: E(11) + 0.5, el: <BookSwap /> },
  { a: E(11) + 0.5, b: E(12) + 0.7, el: <STonBook /> },
  { a: E(12) + 0.7, b: E(13) + 0.15, el: <SDadAsk /> },
  { a: E(13) + 0.15, b: E(14) + 0.5, el: <STonReply /> },
  /* scene 4: night — income is not profit */
  { a: E(14) + 0.5, b: T(15) + 0.3, el: <TableTop /> },
  { a: T(15) + 0.3, b: E(15) + 0.25, el: <STonAskNight /> },
  { a: E(15) + 0.25, b: E(16) + 0.3, el: <SDadExplain /> },
  { a: E(16) + 0.3, b: mid(17), el: <LedgerWrite /> },
  { a: mid(17), b: E(17) + 0.2, el: <STonWrite /> },
  { a: E(17) + 0.2, b: E(17) + 2.0, el: <SlamCard text="รายรับ ≠ กำไร" sub="ต้องหักต้นทุนทุกบาทก่อน" /> },
  /* scene 5: late night — the numbers don't match */
  { a: E(17) + 2.0, b: E(17) + 3.4, el: <SLateWide /> },
  { a: E(17) + 3.4, b: E(18) + 0.3, el: <Compare /> },
  { a: E(18) + 0.3, b: T(19) + 0.1, el: <STonEyesLate /> },
  { a: T(19) + 0.1, b: mid(19), el: <Compare flip /> },
  { a: mid(19), b: E(19) + 0.5, el: <STonEyesLate m /> },
  /* scene 6: the stranger */
  { a: E(19) + 0.5, b: E(19) + 1.9, el: <STonPack /> },
  { a: E(19) + 1.9, b: E(19) + 3.3, el: <SAcross /> },
  { a: E(19) + 3.3, b: T(20) - 0.05, el: <><SStrangerBack /><Letterbox /><ShutterFlash at={10} /></> },
  { a: T(20) - 0.05, b: E(20) + 0.2, el: <STonSus /> },
  { a: E(20) + 0.2, b: E(21) + 0.4, el: <STonTurn /> },
  { a: E(21) + 0.4, b: E(21) + 1.7, el: <SAcross gone /> },
  { a: E(21) + 1.7, b: END + 0.45, el: <STonFinal fastAt={T(23) - (E(21) + 1.7) + 1.2} /> },
  /* ending: hard cut to black, the question, EP4 */
  { a: END + 0.45, b: END + 2.8, el: <QuestionCard /> },
  { a: END + 2.8, b: DUR / FPS, el: <NextCard /> },
];
export const HERO_S = E(19);

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
