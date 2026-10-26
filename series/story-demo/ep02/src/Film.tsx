import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Cam, Shot, type V3 } from "./kit/three";
import { BlurIn, DUR, FPS, FadeOut, Flash, Grain, LINE, Vig, fr, io } from "./kit/ui";
import * as THREE from "three";
import { Char, headCenter, type Pose } from "./rig/char";
import { YOU, infected, ADULT } from "./rig/cast";
import { HUSH, reachPose } from "./rig/poses";
import { Cat } from "./rig/pets";
import { Apartment, BED, DOOR, WARDROBE } from "./sets/apartment";
import { Captions } from "./ui/captions";
import { Clock, Knocks, NextCard, RuleSign, RuleTag } from "./ui/cards";

/** DEMO EPISODE 2 — "If your wardrobe knocks back, don't open it from the front" (~33 s).
 *  Same room, same cast as EP1. New set piece: the wardrobe's right leaf opens (hinge side = blind spot).
 *  Plant: the grey jacket on the hook left of the front door (wide shot, line 3). Twist: empty hook, door ajar. */

/* ─── staging: fixed for the whole episode ─── */
const YOU_AT: V3 = [-0.15, 0, 1.7];                                   // standing on the HINGE side of the right leaf
const FACE_DOOR = Math.atan2(DOOR[0] - YOU_AT[0], DOOR[2] - YOU_AT[2]); // facing the front door / the room
const FACE_W = Math.atan2(-0.9 - YOU_AT[0], 2.4 - YOU_AT[2]);          // facing the wardrobe's right leaf
const CAT_AT: V3 = [BED[0] - 0.15, 0.55, BED[2] - 0.6];
const CAT_W = Math.atan2(WARDROBE[0] - CAT_AT[0], WARDROBE[2] - CAT_AT[2]);
const blink = (f: number, s = 0) => ((f + s * 23) % 83 < 4 ? 1 : 0);
/* the right leaf's hinge + free edge (world), for the broom */
const HINGE: V3 = [WARDROBE[0] + 0.59, 0, WARDROBE[2] - 0.255];
const freeEdge = (w: number, y: number): V3 => { const th = -w * 1.9; return [HINGE[0] - 0.56 * Math.cos(th), y, HINGE[2] + 0.56 * Math.sin(th) + 0.03]; };
const HAND: V3 = [YOU_AT[0] + Math.sin(FACE_W) * 0.42, 1.0, YOU_AT[2] + Math.cos(FACE_W) * 0.42];

/** a broom held by its handle: tip hooks the leaf edge, the line runs back through the hands, brush beyond */
const Broom: React.FC<{ tip: V3; hand: V3 }> = ({ tip, hand }) => {
  const d = new THREE.Vector3(hand[0] - tip[0], hand[1] - tip[1], hand[2] - tip[2]).normalize();
  const len = 1.25, mid = new THREE.Vector3(tip[0], tip[1], tip[2]).addScaledVector(d, len / 2);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
  const brush = new THREE.Vector3(tip[0], tip[1], tip[2]).addScaledVector(d, len + 0.1);
  return (
    <group>
      <mesh position={mid} quaternion={q}><cylinderGeometry args={[0.014, 0.014, len, 12]} /><meshStandardMaterial color="#A07850" roughness={0.8} /></mesh>
      <mesh position={brush} quaternion={q}><boxGeometry args={[0.22, 0.2, 0.06]} /><meshStandardMaterial color="#C9A24E" roughness={0.95} /></mesh>
    </group>
  );
};

type Act = "scared" | "hinge" | "hook" | "relief" | "turn";
const Room: React.FC<{ act?: Act; w?: number; shake?: number; puff?: number; jacket?: number; door?: number; broom?: number; children?: React.ReactNode }> = ({ act = "scared", w = 0, shake = 0, puff = 1, jacket = 1, door = 0, broom = 0, children }) => {
  const f = useCurrentFrame();
  const ry = act === "hinge" || act === "hook" ? FACE_W : FACE_DOOR;
  const pose: Pose =
    act === "scared" ? { ...HUSH } :
    act === "hinge" ? { head: [0.05, 0, 0], browUp: 0.8, blink: blink(f) } :
    act === "hook" ? { ...reachPose(1), shL: [-1.3, 0, 0.12], elL: -0.35, browUp: 0.9, blink: 0 } :
    act === "relief" ? { head: [0.18, 0, 0], browUp: 0.2, mouth: 0.05, blink: blink(f) } :
    { head: [-0.05, 0, 0], browUp: 1, mouth: 0.3, blink: 0 };
  return (
    <Apartment shake={shake} wOpen={w} jacket={jacket} doorOpen={door}>
      <pointLight position={[YOU_AT[0] + 0.6, 1.7, YOU_AT[2] - 1.0]} intensity={1.1} distance={3.5} color="#FFD8B0" />
      <pointLight position={[WARDROBE[0] + 0.3, 1.5, WARDROBE[2] - 1.0]} intensity={0.7 * w} distance={2.2} color="#FFE2C0" />
      <Char L={YOU} p={YOU_AT} ry={ry} pose={pose} seed={1} />
      <Cat p={CAT_AT} ry={CAT_W} pose={{ crouch: 0.6 - puff * 0.5, puff: puff * 0.9, head: [0, puff * 0.2], tail: f / (puff ? 4 : 14), look: [0, 0] }} />
      {broom ? <Broom tip={freeEdge(w, 1.0)} hand={HAND} /> : null}
      {children}
    </Apartment>
  );
};

/* ─── cameras (every shot pushes in slowly) ─── */
const FACE_Y = headCenter(YOU);
const dir = (k: number): V3 => [YOU_AT[0] + Math.sin(FACE_DOOR) * k, FACE_Y + 0.05, YOU_AT[2] + Math.cos(FACE_DOOR) * k];
const SWardrobe: React.FC<{ shakeFrom?: number; w?: number }> = ({ shakeFrom = 9999, w = 0 }) => { const f = useCurrentFrame(); return <Shot><Room shake={f >= shakeFrom && f < shakeFrom + 30 ? 1 : 0} w={w} /><Cam p={[WARDROBE[0] + 0.35, 1.35, WARDROBE[2] - 3.2 + f * 0.004]} t={[WARDROBE[0], 1.0, WARDROBE[2]]} fov={46} drift={0.5} /></Shot>; };
const SFace: React.FC<{ act?: Act }> = ({ act = "scared" }) => { const f = useCurrentFrame(); return <Shot><Room act={act} puff={act === "relief" ? 0 : 1} /><Cam p={dir(2.0 - f * 0.003)} t={[YOU_AT[0], FACE_Y - 0.08, YOU_AT[2]]} fov={32} drift={0.4} /></Shot>; };
const SWideJacket = () => { const f = useCurrentFrame(); return <Shot><Room /><Cam p={[-2.3 + f * 0.003, 1.85, 2.5]} t={[0.6, 1.0, -2.8]} fov={50} drift={0.4} /></Shot>; };
const SCat = () => { const f = useCurrentFrame(); return <Shot><Room puff={io(f, 4, 20, 0.3, 1)} /><Cam p={[CAT_AT[0] + Math.sin(CAT_W) * 1.4, 0.98, CAT_AT[2] + Math.cos(CAT_W) * 1.4 - f * 0.002]} t={[CAT_AT[0], 0.8, CAT_AT[2]]} fov={38} drift={0.3} /></Shot>; };
const STop = () => { const f = useCurrentFrame(); return <Shot><Room act="hinge" puff={0} w={io(f, 10, 50, 0, 0.45)} /><Cam p={[0.6, 2.55, 0.5 + f * 0.002]} t={[-0.7, 0.5, 2.2]} fov={50} drift={0.3} /></Shot>; };
const SBroom = () => { const f = useCurrentFrame(); return <Shot><Room act="hook" puff={0} broom={1} w={io(f, 14, 70, 0.02, 0.6)} /><Cam p={[-0.35 - f * 0.002, 1.35, -0.2]} t={[-0.7, 1.0, 2.2]} fov={44} drift={0.4} /></Shot>; };
const SInside = () => { const f = useCurrentFrame(); return <Shot><Room act="hook" puff={0} w={1} /><Cam p={[-0.9, 1.4, 1.0 + f * 0.005]} t={[-0.9, 1.35, 2.9]} fov={42} drift={0.4} /></Shot>; };
const SOver = () => { const f = useCurrentFrame(); return <Shot><Room act="turn" puff={0} w={1} jacket={0} door={0.3} /><Cam p={[0.3, 1.55, 2.4 - f * 0.003]} t={[0.55, 1.25, -3]} fov={44} drift={0.4} /></Shot>; };
const SHook = () => { const f = useCurrentFrame(); return <Shot><Room act="turn" puff={0} w={1} jacket={0} door={0.3} /><Cam p={[-0.15, 1.6, -0.95 - f * 0.004]} t={[0.6, 1.4, -3]} fov={48} drift={0.4} /></Shot>; };

/* ─── the edit: cut on line starts/ends, by LINE NUMBER, so a new voice take re-times the picture automatically ─── */
type Cut = { a: number; b: number; el: React.ReactNode };
const T = (n: number) => LINE[n - 1].t;      // start of script line n (seconds)
const E = (n: number) => LINE[n - 1].end;    // end of script line n
const END = E(LINE.length) + 0.4;
const mid = (n: number) => (T(n) + E(n)) / 2;
export const CUTS: Cut[] = [
  { a: 0, b: mid(1), el: <><SWardrobe /><RuleSign /></> },
  { a: mid(1), b: E(1) + 0.2, el: <><SFace /><RuleTag /></> },
  { a: E(1) + 0.2, b: T(3) - 0.1, el: <><SWardrobe shakeFrom={3} /><Knocks at={[3]} x={430} y={560} /></> },
  { a: T(3) - 0.1, b: T(4) - 0.1, el: <><SWideJacket /><Clock t="02:14" label="ห้อง 604" /></> },
  { a: T(4) - 0.1, b: T(5) - 0.1, el: <SCat /> },
  { a: T(5) - 0.1, b: T(6) - 0.1, el: <STop /> },
  { a: T(6) - 0.1, b: T(7) - 0.1, el: <SBroom /> },
  { a: T(7) - 0.1, b: T(8) - 0.1, el: <SInside /> },
  { a: T(8) - 0.1, b: T(9) - 0.1, el: <SFace act="relief" /> },
  { a: T(9) - 0.1, b: mid(9), el: <SOver /> },
  { a: mid(9), b: END, el: <SHook /> },
  { a: END, b: DUR / FPS, el: <><BlurIn><SHook /></BlurIn><NextCard /></> },
];

export const HERO_S = mid(9); // the empty hook
export const Film: React.FC<{ noCaps?: boolean }> = ({ noCaps }) => (
  <AbsoluteFill style={{ background: "#07090F" }}>
    {CUTS.map((c, i) => (
      <Sequence key={i} from={fr(c.a)} durationInFrames={fr(c.b) - fr(c.a)}>
        <AbsoluteFill>{c.el}</AbsoluteFill>
      </Sequence>
    ))}
    <Flash at={fr(HERO_S)} c="rgba(255,236,214,0.85)" />
    <Vig />
    <FadeOut from={DUR - 24} />
    <Grain amount={0.05} />
    {noCaps ? null : <Captions hideFrom={END} />}
  </AbsoluteFill>
);

/** an extra character you can drop into any shot, e.g. the neighbour behind the door (episode 2) */
export const NEIGHBOUR = infected(ADULT);
