import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadMali } from "@remotion/google-fonts/Mali";
import { Cam, Shot, type V3 } from "./kit/three";
import { Click, CREAM, DUR, FPS, FadeOut, Grain, LINE, RED, SANS, Vig, fr, io, useSpr } from "./kit/ui";
import { Char, SLIM, headCenter, type Pose } from "./rig/char";
import { DAD, KID1, KID2, MOM, PAKIN, PALA, PALB, TON_BAG, TON_PHONE, TON } from "./rig/cast";
import { WALK_STRIDE, walkPose, blendPose, reachPose } from "./rig/poses";
import { BACK_PATH_Z, FRONT_PATH_Z, School } from "./sets/school";
import { COIN_TABLE, Stall, WOK } from "./sets/stall";
import { Bedroom, NOTEBOOK, SEAT } from "./sets/bedroom";
import { Captions } from "./ui/captions";
import { Knocks } from "./ui/cards";

const HAND = loadMali("normal", { weights: ["500", "600"], subsets: ["thai", "latin"] }).fontFamily;

/** EP1 — วันที่ต้นถูกหัวเราะเยาะ. Script by the user (script.md). 5 scenes:
 *  1 school front (day)  2 back walkway  3 family stall (night)  4 bedroom (midnight)  5 phone search → black card → threat text.
 *  All positions are fixed per scene below (continuity); shots only move the camera. */

/* ─── timing helpers (script line numbers → seconds) ─── */
const T = (n: number) => LINE[n - 1].t;
const E = (n: number) => LINE[n - 1].end;
const mid = (n: number) => (T(n) + E(n)) / 2;
const LAST = E(LINE.length);
const BLACK_A = LAST + 0.8, MSG_A = BLACK_A + 3.4, NEXT_A = MSG_A + 2.6;

const blink = (f: number, s = 0) => ((f + s * 23) % 83 < 4 ? 1 : 0);
const face = (L: typeof TON) => headCenter(L);
const H = (yaw: number) => yaw; // readability: ry values are yaw angles

/* ─── poses ─── */
/** laughing: lean back, head back, shoulders shake */
const laughPose = (f: number, s: number, k = 1): Pose => ({
  spine: [-0.1 * k + Math.sin(f * 1.1 + s) * 0.04 * k, 0, 0], head: [-0.22 * k + Math.sin(f * 1.1 + s) * 0.06 * k, 0.12 * (s % 2 ? 1 : -1) * k, 0],
  shL: [-0.45 * k, 0, 0.18], elL: -1.25 * k, shR: [-0.45 * k, 0, -0.18], elR: -1.25 * k,
  mouth: 0.65 * k, browUp: 0.4, blink: k > 0.5 ? 1 : 0,
});
/** Pakin: phone hand low, the other hand points at the bag */
const pointPose = (k: number): Pose => ({ shL: [-1.25 * k, 0.2 * k, 0.15], elL: -0.15, head: [-0.08, 0, 0], browUp: 0.1, mouth: 0.15 });
/** gripping the bag: arm tense, shoulders slightly up */
const GRIP: Pose = { shR: [0.05, 0, -0.08], elR: -0.25, spine: [0.06, 0, 0], head: [0.12, 0, 0], browUp: 0.7 };
/** cross-legged on the floor (hips ≈ 0.14 m) */
const FLOOR_SIT: Pose = { y: -0.62, hipL: [-1.45, 0, 0.75], hipR: [-1.45, 0, -0.75], knL: 2.3, knR: 2.3, spine: [0.2, 0, 0] };
/** holding the phone up in front of the face */
const PHONE_UP: Pose = { shR: [-1.05, 0.35, -0.25], elR: -1.55, shL: [-0.4, 0, 0.3], elL: -1.2, head: [0.32, 0, 0] };
/** writing on a notebook on the floor */
const WRITE = (f: number): Pose => ({ spine: [0.55, 0, 0], head: [0.45, 0, 0], shR: [-0.75 + Math.sin(f * 0.6) * 0.04, 0.1, -0.15], elR: -0.9, shL: [-0.5, 0, 0.3], elL: -1.0 });
/** frying: spatula stirs */
const fry = (f: number): Pose => ({ shR: [-1.0 + Math.sin(f / 6) * 0.18, 0.15, -0.15], elR: -0.95, shL: [-0.35, 0, 0.2], elL: -0.6, spine: [0.12, 0, 0], head: [0.3, 0, 0] });
/** counting coins at the table, seated */
const count = (f: number): Pose => ({ y: -0.3, hipL: [-1.5, 0, 0.08], hipR: [-1.5, 0, -0.08], knL: 1.5, knR: 1.5, shL: [-0.85, 0, 0.1], elL: -0.9, shR: [-0.85 + Math.max(0, Math.sin(f / 5)) * 0.12, 0, -0.1], elR: -0.9, spine: [0.15, 0, 0], head: [0.35, 0, 0] });

/* ═════════ SCENE 1 — school front ═════════ */
const TON1: V3 = [-0.75, 0, FRONT_PATH_Z];
const PAK1: V3 = [0.45, 0, FRONT_PATH_Z];
const PA1: V3 = [0.95, 0, FRONT_PATH_Z - 0.75];
const PB1: V3 = [1.05, 0, FRONT_PATH_Z + 0.7];
const yawTo = (a: V3, b: V3) => Math.atan2(b[0] - a[0], b[2] - a[2]);

/** the confrontation. walkIn = Ton still walking (0..1 → arrives), laugh = friends laughing 0..1, point = Pakin points */
const Front: React.FC<{ laugh?: number; point?: number; tonAct?: "walk" | "firm" | "grip"; walkF?: number }> = ({ laugh = 0, point = 0, tonAct = "firm", walkF = 99 }) => {
  const f = useCurrentFrame();
  // Ton decelerates into place over the first ~0.9 s of the opening shot
  const k = io(walkF, 0, 26, 0, 1), dist = 0.9 * k, x = TON1[0] - 0.9 + dist;
  const tonPose: Pose = tonAct === "walk" && k < 1 ? { ...blendPose(walkPose((dist / WALK_STRIDE) * Math.PI * 2, 1), GRIP, k), blink: 0 }
    : tonAct === "grip" ? { ...GRIP, blink: blink(f, 1) } : { ...GRIP, head: [0.02, 0, 0], browUp: 0.3, blink: blink(f, 1) };
  return (
    <School>
      <Char L={TON_BAG} p={[x, 0, TON1[2]]} ry={H(Math.PI / 2)} pose={tonPose} seed={1} />
      <Char L={PAKIN} p={PAK1} ry={H(-Math.PI / 2)} pose={{ ...blendPose(laughPose(f, 3, laugh * 0.4), pointPose(1), point), blink: blink(f, 3) }} seed={3} />
      <Char L={PALA} p={PA1} ry={yawTo(PA1, TON1)} pose={laugh > 0 ? laughPose(f, 5, laugh) : { head: [0.05, 0, 0], blink: blink(f, 5), mouth: 0.1 }} seed={5} />
      <Char L={PALB} p={PB1} ry={yawTo(PB1, TON1)} pose={laugh > 0 ? laughPose(f, 6, laugh) : { head: [0.05, 0, 0], blink: blink(f, 6) }} seed={6} />
      {/* background students walking by */}
      <Char L={KID1} p={[-3.5 + f * 0.012, 0, 6.2]} ry={Math.PI / 2} pose={walkPose(((f * 0.012) / WALK_STRIDE) * Math.PI * 2, 0.8)} seed={7} />
      <Char L={KID2} p={[4.5 - f * 0.011, 0, 0.4]} ry={-Math.PI / 2} pose={walkPose(((f * 0.011) / WALK_STRIDE) * Math.PI * 2 + 1, 0.8)} seed={8} />
    </School>
  );
};
const HT = face(TON), HP = face(PAKIN);
const SFrontWide: React.FC<{ laugh?: number; walk?: boolean }> = ({ laugh = 0, walk }) => { const f = useCurrentFrame(); return <Shot><Front laugh={laugh} tonAct={walk ? "walk" : "firm"} walkF={walk ? f : 99} /><Cam p={[0.1, 1.5, FRONT_PATH_Z + 6.8 - f * 0.006]} t={[0.15, 1.0, FRONT_PATH_Z]} fov={46} drift={0.4} /></Shot>; };
const SOverTon: React.FC<{ point?: boolean }> = ({ point }) => { const f = useCurrentFrame(); return <Shot><Front point={point ? io(f, 4, 16, 0, 1) : 0} /><Cam p={[TON1[0] - 1.45 + f * 0.003, HT + 0.12, TON1[2] + 0.55]} t={[PAK1[0], HP - 0.05, PAK1[2]]} fov={34} drift={0.4} /></Shot>; };
const STonFace: React.FC<{ act?: "firm" | "grip" }> = ({ act = "firm" }) => { const f = useCurrentFrame(); return <Shot><Front tonAct={act} /><Cam p={[TON1[0] + 1.95 - f * 0.003, HT + 0.02, TON1[2] - 0.45]} t={[TON1[0], HT - 0.06, TON1[2]]} fov={31} drift={0.4} /></Shot>; };
const SPakinLow: React.FC<{ laugh?: number; point?: boolean }> = ({ laugh = 0, point }) => { const f = useCurrentFrame(); return <Shot><Front laugh={laugh} point={point ? io(f, 2, 14, 0, 1) : 0} /><Cam p={[PAK1[0] - 1.9 + f * 0.003, HP - 0.35, PAK1[2] + 0.35]} t={[PAK1[0], HP - 0.02, PAK1[2]]} fov={32} drift={0.4} /></Shot>; };
const SLaugh = () => { const f = useCurrentFrame(); return <Shot><Front laugh={1} /><Cam p={[-0.5, 1.45, FRONT_PATH_Z + 3.6 - f * 0.004]} t={[0.75, 1.2, FRONT_PATH_Z]} fov={42} drift={0.6} /></Shot>; };

/* ═════════ SCENE 2 — back walkway ═════════ */
const BackWalk: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useCurrentFrame();
  const dist = (t0 * FPS + f) * 0.85 / FPS;
  const x = -5.5 + dist;
  return (
    <School sun={0.85}>
      <Char L={TON_BAG} p={[x, 0, BACK_PATH_Z]} ry={Math.PI / 2} pose={{ ...walkPose((dist / WALK_STRIDE) * Math.PI * 2, 0.75), ...GRIP, head: [0.28, 0, 0], browUp: 0.2, blink: blink(f, 1) }} seed={1} />
    </School>
  );
};
const tonBackX = (sec: number) => -5.5 + sec * 0.85;
const SBackTrack: React.FC<{ t0: number }> = ({ t0 }) => { const f = useCurrentFrame(); const x = tonBackX(t0 + f / FPS); return <Shot><BackWalk t0={t0} /><Cam p={[x + 2.3, 1.15, BACK_PATH_Z + 0.55]} t={[x, HT - 0.15, BACK_PATH_Z]} fov={36} drift={0.6} /></Shot>; };
const SBackWide: React.FC<{ t0: number }> = ({ t0 }) => { const f = useCurrentFrame(); return <Shot><BackWalk t0={t0} /><Cam p={[-7.2, 1.7, BACK_PATH_Z + 0.9 - f * 0.002]} t={[tonBackX(t0) + 3, 1.0, BACK_PATH_Z - 0.2]} fov={40} drift={0.3} /></Shot>; };

/* ═════════ SCENE 3 — the stall at night ═════════ */
const DAD3: V3 = [WOK[0], 0, -0.62];
const MOM3: V3 = [COIN_TABLE[0], 0, COIN_TABLE[2] - 0.5];
const TON3: V3 = [1.05, 0, 0.75];
const StallScene: React.FC<{ tonAct?: "help" | "look" | "answer"; momTalk?: boolean }> = ({ tonAct = "help", momTalk }) => {
  const f = useCurrentFrame();
  const tonPose: Pose = tonAct === "help" ? { ...reachPose(0.8), spine: [0.35, 0, 0], shR: [-0.9 + Math.sin(f / 7) * 0.15, 0.2, -0.1], head: [0.35, 0, 0], blink: blink(f, 1) }
    : tonAct === "look" ? { head: [0.25, -0.1, 0], browUp: 0.6, blink: blink(f, 1) }
    : { head: [0.05, 0, 0], browUp: 0.5, mouth: 0.08, blink: blink(f, 1) };
  return (
    <Stall>
      <Char L={DAD} p={DAD3} ry={0} pose={{ ...fry(f), blink: blink(f, 2) }} seed={2} />
      <Char L={MOM} p={MOM3} ry={0} pose={momTalk ? { ...count(f), head: [0.05, -0.55, 0], mouth: 0.25 + Math.max(0, Math.sin(f * 0.8)) * 0.2, blink: blink(f, 4) } : { ...count(f), blink: blink(f, 4) }} seed={4} />
      <Char L={TON} p={TON3} ry={tonAct === "answer" ? yawTo(TON3, MOM3) : yawTo(TON3, DAD3)} pose={tonPose} seed={1} />
      <pointLight position={[MOM3[0] - 0.4, 1.3, MOM3[2] + 0.9]} intensity={0.9} distance={2.4} color="#FFE4C8" />
      <pointLight position={[TON3[0] - 0.3, 1.6, TON3[2] + 0.9]} intensity={0.8} distance={2.6} color="#E8F0FF" />
      {/* small stool for mom */}
      <mesh position={[MOM3[0], 0.22, MOM3[2]]}><cylinderGeometry args={[0.15, 0.17, 0.44, 16]} /><meshStandardMaterial color="#2F6FB0" /></mesh>
    </Stall>
  );
};
const HM = face(MOM) - 0.3 * SLIM.leg * MOM.height;
const SStallWide = () => { const f = useCurrentFrame(); return <Shot><StallScene /><Cam p={[1.6, 1.55, 4.3 - f * 0.006]} t={[0.3, 1.0, -0.5]} fov={44} drift={0.4} /></Shot>; };
const SDadHands = () => { const f = useCurrentFrame(); return <Shot tilt={false}><StallScene tonAct="look" /><Cam p={[WOK[0] + 0.55, 1.42 - f * 0.001, WOK[2] + 0.75]} t={[WOK[0] + 0.05, 1.08, WOK[2] - 0.25]} fov={30} drift={0.3} /></Shot>; };
const STonLooks = () => { const f = useCurrentFrame(); const d = yawTo(TON3, DAD3); return <Shot><StallScene tonAct="look" /><Cam p={[TON3[0] + Math.sin(d) * 1.9 + 0.3, HT + 0.05, TON3[2] + Math.cos(d) * 1.9 + 0.5 - f * 0.002]} t={[TON3[0], HT - 0.08, TON3[2]]} fov={31} drift={0.4} /></Shot>; };
const SMom = () => { const f = useCurrentFrame(); return <Shot><StallScene momTalk tonAct="answer" /><Cam p={[MOM3[0] - 0.75, HM + 0.15, MOM3[2] + 1.75 - f * 0.003]} t={[MOM3[0], HM - 0.05, MOM3[2]]} fov={31} drift={0.4} /></Shot>; };
const STonAnswer = () => { const f = useCurrentFrame(); const dir = yawTo(TON3, MOM3); return <Shot><StallScene tonAct="answer" /><Cam p={[TON3[0] + Math.sin(dir) * 1.95, HT + 0.02, TON3[2] + Math.cos(dir) * 1.95 - f * 0.002]} t={[TON3[0], HT - 0.06, TON3[2]]} fov={31} drift={0.4} /></Shot>; };

/* ═════════ SCENE 4 — bedroom ═════════ */
const FLOOR_FACE = face(TON) + (FLOOR_SIT.y ?? 0) * SLIM.leg * TON.height;
const Room: React.FC<{ act?: "phone" | "write" }> = ({ act = "phone" }) => {
  const f = useCurrentFrame();
  const pose: Pose = act === "phone" ? { ...FLOOR_SIT, ...PHONE_UP, blink: blink(f, 1), browUp: 0.5 } : { ...FLOOR_SIT, ...WRITE(f), blink: 0 };
  return <Bedroom><Char L={act === "phone" ? TON_PHONE : TON} p={SEAT} ry={0} pose={pose} seed={1} /></Bedroom>;
};
const SRoomWide = () => { const f = useCurrentFrame(); return <Shot><Room /><Cam p={[1.2, 1.5, 1.3 - f * 0.0015]} t={[SEAT[0], 0.45, SEAT[2] - 0.1]} fov={50} drift={0.3} /></Shot>; };
const SRoomFace: React.FC<{ act?: "phone" | "write" }> = ({ act = "phone" }) => { const f = useCurrentFrame(); return <Shot><Room act={act} /><Cam p={[SEAT[0] + 0.2, FLOOR_FACE + 0.08, SEAT[2] + 1.35 - f * 0.002]} t={[SEAT[0], FLOOR_FACE - 0.05, SEAT[2]]} fov={40} drift={0.3} /></Shot>; };
const SNotebook = () => { const f = useCurrentFrame(); return <Shot tilt={false}><Bedroom phone={0.6} /><pointLight position={[NOTEBOOK[0], 0.5, NOTEBOOK[2] + 0.2]} intensity={0.8} distance={1.2} color="#DDE6FF" /><Cam p={[NOTEBOOK[0], 0.95 - f * 0.001, NOTEBOOK[2] + 0.1]} t={[NOTEBOOK[0], 0, NOTEBOOK[2]]} fov={44} drift={0.1} /></Shot>; };

/* ═════════ DOM overlays ═════════ */
/** 3 handwritten questions appearing on the notebook page, one per ~1.1 s */
const NOTE_Q = ["1. ทำอย่างไรให้เงินเหลือ?", "2. ทำอย่างไรให้รายได้เติบโต?", "3. ทำอย่างไรให้ตัดสินใจได้ดีขึ้น?"];
const NotebookText: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: "rotate(-3deg)", width: 820, padding: "40px 46px", fontFamily: HAND, color: "#22306E", fontSize: 54, lineHeight: 1.7, textShadow: "0 0 1px rgba(30,40,110,0.4)" }}>
        {NOTE_Q.map((q, i) => {
          const a = 8 + i * 34, len = q.length, shown = Math.max(0, Math.min(len, Math.floor((f - a) * 1.4)));
          return <div key={i} style={{ minHeight: 92 }}>{q.slice(0, shown)}</div>;
        })}
      </div>
      {NOTE_Q.map((_, i) => <Click key={i} at={8 + i * 34} v={0.15} kind="tick" />)}
    </AbsoluteFill>
  );
};

/** phone search results; the CK book card is found and held on */
const PhoneSearch: React.FC = () => {
  const f = useCurrentFrame();
  const scroll = io(f, 10, 48, 0, -560);
  const pick = io(f, 56, 70, 0, 1);
  const results = [
    { t: "วิธีเก็บเงินสำหรับวัยรุ่น", s: "บทความ · 5 นาที" },
    { t: "หนังสือการเงินสำหรับมือใหม่ 10 เล่ม", s: "รายการแนะนำ" },
    { t: "เริ่มธุรกิจด้วยทุนน้อย", s: "วิดีโอ · 12:04" },
  ];
  return (
    <AbsoluteFill style={{ background: "#05070C", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 760, height: 1500, borderRadius: 70, background: "#111318", border: "10px solid #24272E", overflow: "hidden", position: "relative", boxShadow: "0 0 120px rgba(150,190,255,0.18)" }}>
        <div style={{ margin: "70px 40px 30px", background: "#23262E", borderRadius: 40, padding: "22px 30px", fontFamily: SANS, fontSize: 38, color: "#D6D9E0" }}>หนังสือพัฒนาตัวเอง การเงิน</div>
        <div style={{ transform: `translateY(${scroll}px)`, padding: "0 40px" }}>
          {results.map((r, i) => (
            <div key={i} style={{ background: "#1A1D24", borderRadius: 24, padding: "28px 30px", marginBottom: 26, fontFamily: SANS }}>
              <div style={{ color: "#F0F2F6", fontSize: 40, fontWeight: 600 }}>{r.t}</div>
              <div style={{ color: "#8A90A0", fontSize: 30, marginTop: 8 }}>{r.s}</div>
            </div>
          ))}
          <div style={{ background: "#1A1D24", borderRadius: 24, padding: 30, display: "flex", gap: 30, fontFamily: SANS, outline: `${6 * pick}px solid ${RED}`, transform: `scale(${1 + 0.04 * pick})` }}>
            <Img src={staticFile("book-cover.jpg")} style={{ width: 230, borderRadius: 8 }} />
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ color: "#F0F2F6", fontSize: 40, fontWeight: 700, lineHeight: 1.3 }}>อยากเป็นคนธรรมดา<br />ไม่ต้องอ่าน</div>
              <div style={{ color: "#AEB4C2", fontSize: 32, marginTop: 14 }}>CK Cheong</div>
              <div style={{ color: AMB_T, fontSize: 30, marginTop: 10 }}>★ 4.8 · 349 บาท</div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
const AMB_T = "#E9B84A";

/** black card with the question */
const BlackCard: React.FC = () => {
  const a = useSpr(8, 16), b = useSpr(26, 16);
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: SANS }}>
      <div style={{ color: "#BFC3CC", fontSize: 50, opacity: a, translate: `0 ${(1 - a) * 20}px` }}>อีก 5 ปีข้างหน้า</div>
      <div style={{ color: CREAM, fontSize: 66, fontWeight: 700, lineHeight: 1.35, marginTop: 26, maxWidth: 900, opacity: b, translate: `0 ${(1 - b) * 20}px` }}>คนที่หัวเราะเขาในวันนี้<br />จะจำเขาได้หรือไม่?</div>
    </AbsoluteFill>
  );
};

/** lock-screen notification from Pakin */
const Threat: React.FC = () => {
  const s = useSpr(6, 13);
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center" }}>
      <Click at={6} v={0.5} kind="tick" />
      <div style={{ marginTop: 620, width: 900, background: "rgba(38,40,48,0.96)", borderRadius: 36, padding: "30px 36px", fontFamily: SANS, transform: `translateY(${(1 - s) * -120}px)`, opacity: s }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: "#9AA0AE", fontSize: 30 }}><span>ข้อความ · ภาคิน</span><span>ตอนนี้</span></div>
        <div style={{ color: "#F4F5F8", fontSize: 44, fontWeight: 600, marginTop: 14, lineHeight: 1.35 }}>พรุ่งนี้เอาไก่มาให้กูด้วยนะ<br />ถ้าไม่เอามา มึงเจอดีแน่</div>
      </div>
    </AbsoluteFill>
  );
};

/** end card: next episode */
const Next: React.FC = () => {
  const a = useSpr(6, 14), b = useSpr(18, 13);
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: SANS }}>
      <Click at={6} v={0.35} />
      <div style={{ color: "#8A8F9A", fontSize: 38, opacity: a }}>จบ EP 1 — ติดตาม</div>
      <div style={{ color: CREAM, fontSize: 84, fontWeight: 700, marginTop: 14, opacity: a }}>EP 2</div>
      <div style={{ width: 120, height: 6, background: RED, borderRadius: 3, margin: "22px auto", opacity: a }} />
      <div style={{ color: RED, fontSize: 60, fontWeight: 700, maxWidth: 900, lineHeight: 1.3, opacity: b }}>หนังสือเล่มแรก<br />ที่เปลี่ยนความคิด</div>
    </AbsoluteFill>
  );
};

/** laughter bubbles */
const Laughs: React.FC = () => <Knocks at={[2, 9, 16]} word="ฮ่าๆ" x={560} y={520} />;

/* ═════════ the edit ═════════ */
type Cut = { a: number; b: number; el: React.ReactNode };
const ESC1 = E(4) + 0.9;           // end of scene 1 (laugh tail)
const S3A = E(6) + 0.7;            // scene 3 starts
const S4A = E(8) + 0.9;            // scene 4 starts
export const CUTS: Cut[] = [
  /* scene 1 */
  { a: 0, b: mid(1), el: <SFrontWide walk /> },
  { a: mid(1), b: E(1) + 0.15, el: <SOverTon /> },
  { a: E(1) + 0.15, b: T(2) - 0.05, el: <><SLaugh /><Laughs /></> },
  { a: T(2) - 0.05, b: E(2) + 0.25, el: <STonFace /> },
  { a: E(2) + 0.25, b: mid(3), el: <SPakinLow point /> },
  { a: mid(3), b: T(4) + 0.6, el: <SOverTon point /> },
  { a: T(4) + 0.6, b: E(4) + 0.1, el: <SPakinLow laugh={0.6} /> },
  { a: E(4) + 0.1, b: ESC1, el: <><SFrontWide laugh={1} /><Laughs /></> },
  /* scene 2 */
  { a: ESC1, b: mid(5) + 0.6, el: <SBackWide t0={0} /> },
  { a: mid(5) + 0.6, b: mid(6) + 0.8, el: <SBackTrack t0={mid(5) + 0.6 - ESC1} /> },
  { a: mid(6) + 0.8, b: S3A, el: <SBackWide t0={mid(6) + 0.8 - ESC1} /> },
  /* scene 3 */
  { a: S3A, b: S3A + 1.6, el: <SStallWide /> },
  { a: S3A + 1.6, b: T(7) - 0.1, el: <SDadHands /> },
  { a: T(7) - 0.1, b: E(7) + 0.1, el: <SMom /> },
  { a: E(7) + 0.1, b: T(8) - 0.05, el: <STonLooks /> },
  { a: T(8) - 0.05, b: S4A, el: <STonAnswer /> },
  /* scene 4 */
  { a: S4A, b: T(9) + 0.4, el: <SRoomWide /> },
  { a: T(9) + 0.4, b: E(10) + 0.3, el: <SRoomFace /> },
  { a: E(10) + 0.3, b: T(11) - 0.1, el: <><SNotebook /><NotebookText /></> },
  /* scene 5 */
  { a: T(11) - 0.1, b: mid(12), el: <PhoneSearch /> },
  { a: mid(12), b: BLACK_A, el: <SRoomFace /> },
  { a: BLACK_A, b: MSG_A, el: <BlackCard /> },
  { a: MSG_A, b: NEXT_A, el: <Threat /> },
  { a: NEXT_A, b: DUR / FPS, el: <Next /> },
];

export const HERO_S = MSG_A;
export const Film: React.FC<{ noCaps?: boolean }> = ({ noCaps }) => (
  <AbsoluteFill style={{ background: "#07090F" }}>
    {CUTS.map((c, i) => (
      <Sequence key={i} from={fr(c.a)} durationInFrames={Math.max(1, fr(c.b) - fr(c.a))}>
        <AbsoluteFill>{c.el}</AbsoluteFill>
      </Sequence>
    ))}
    <Vig />
    <FadeOut from={DUR - 20} />
    <Grain amount={0.04} />
    {noCaps ? null : <Captions hideFrom={BLACK_A} />}
  </AbsoluteFill>
);
