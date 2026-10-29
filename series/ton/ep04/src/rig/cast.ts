import type { Look } from "./char";

/* ─────────────────────────────────────────────────────────────────────────────
   CAST — ซีรีส์ "ต้น". Default SLIM build for everyone (series look decided later with the user).
   Never-change details:
     TON   : messy black hair, tan skin, worn black shoes vs a clean white shirt
     PAKIN : spiky hair, fair skin, bright WHITE sneakers, phone always in hand
     DAD   : greying short hair, faded blue tee      MOM : black bob, rose blouse
   ───────────────────────────────────────────────────────────────────────────── */

/** ต้น อายุ 16: old but clean uniform, worn black shoes */
export const TON: Look = { skin: "#C99A72", hair: "messy", hairC: "#14110F", iris: "#2A211C", eyeW: 1, eyeH: 1, outfit: "uniform", top: "#ECEAE2", pants: "#1E2740", shoes: "#2B2A2C", sole: "#9E998F", trim: "#2F4A8A", brow: "#1E1A16", height: 0.86 };
export const TON_BAG: Look = { ...TON, holdR: "bag" };
export const TON_PHONE: Look = { ...TON, holdR: "phone" };

/** ภาคิน: fair, spiky hair, crisp uniform, white sneakers, phone in hand */
export const PAKIN: Look = { skin: "#EDC9AA", hair: "spiky", hairC: "#2A1E17", iris: "#2A211C", eyeW: 0.95, eyeH: 0.85, outfit: "uniform", top: "#FFFFFF", pants: "#1E2740", shoes: "#FAFAF7", sole: "#FFFFFF", trim: "#C9A455", brow: "#2A2420", holdR: "phone", height: 0.9 };

/** ภาคิน's two friends */
export const PALA: Look = { skin: "#D9AE88", hair: "short", hairC: "#1A1614", iris: "#2A211C", eyeW: 1, eyeH: 1, outfit: "uniform", top: "#FAFAF6", pants: "#1E2740", shoes: "#2F3A55", sole: "#E8E6E0", trim: "#2F4A8A", brow: "#1E1A16", height: 0.88 };
export const PALB: Look = { skin: "#E2B48E", hair: "bob", hairC: "#3A2A20", hairLen: 0.06, iris: "#2A211C", eyeW: 1, eyeH: 1, outfit: "uniform", top: "#FAFAF6", pants: "#1E2740", shoes: "#C24A3A", sole: "#F0EEE8", trim: "#2F4A8A", brow: "#2A2420", height: 0.87 };

/** พ่อ: wiry, sun-darkened, greying hair, faded blue tee, spatula */
export const DAD: Look = { skin: "#A87A55", hair: "short", hairC: "#6A6560", iris: "#2E2620", eyeW: 0.95, eyeH: 0.9, outfit: "tee", top: "#6F8DAE", pants: "#4A4540", shoes: "#3A2E25", sole: "#2A221C", brow: "#5A5550", holdR: "spatula", height: 0.9 };

/** แม่: black bob, rose blouse */
export const MOM: Look = { skin: "#C9976E", hair: "bob", hairC: "#1C1816", hairLen: 0.07, iris: "#2A211C", eyeW: 1, eyeH: 0.95, outfit: "blouse", top: "#C77B6E", pants: "#33402F", shoes: "#3A2E25", brow: "#2A2420", height: 0.85 };

/** extra townsfolk for the school front */
export const KID1: Look = { ...PALA, skin: "#CFA07A", hair: "short", hairC: "#111", shoes: "#222" };
export const KID2: Look = { ...PALB, skin: "#E8C2A0", hairC: "#111", shoes: "#EEE" };

/** characters shown by the Turn-<id> QA comps. */
export const CAST: Record<string, Look> = { ton: TON_BAG, pakin: PAKIN, pala: PALA, palb: PALB, dad: DAD, mom: MOM };

/** flash-forward (5 years later): adult Ton in a dark navy coat, neat hair; adult Pakin in a grey shirt */
export const TON_ADULT: Look = { ...TON, hair: "short", outfit: "coat", top: "#1B2238", pants: "#1B2238", shoes: "#141418", sole: "#141418", trim: undefined, height: 0.9 };
export const PAKIN_ADULT: Look = { ...PAKIN, outfit: "shirt", top: "#8C9099", pants: "#3A3D44", shoes: "#2A2A2E", sole: "#1E1E22", holdR: undefined, height: 0.9 };

/** ต้น at home / at the stall at night: simple dark casual clothes (EP2+) */
export const TON_HOME: Look = { ...TON, outfit: "tee", top: "#2B2D33", pants: "#3A3D44", shoes: "#2B2A2C", trim: "#2B2D33" };
export const TON_HOME_PHONE: Look = { ...TON_HOME, holdR: "phone" };

/** EP3 */
export const TON_PENCIL: Look = { ...TON, holdR: "pencil" };
export const PAKIN_NB: Look = { ...PAKIN, holdR: "book" };  // EP3 user fix: Pakin snatches the "เปลี่ยนอนาคต" book (EP2 look)
export const TON_NB: Look = { ...TON_HOME, holdR: "notebook" };
/** students filming with their phones */
export const KID1_PH: Look = { ...KID1, holdR: "phone" };
export const KID2_PH: Look = { ...KID2, holdR: "phone" };
/** ชายปริศนา: adult, plain dark clothes, never seen clearly (keep him far + in shadow) */
export const STRANGER: Look = { skin: "#8E6A4E", hair: "short", hairC: "#151312", iris: "#1E1A16", eyeW: 0.9, eyeH: 0.85, outfit: "shirt", top: "#1E2128", pants: "#24262C", shoes: "#141418", sole: "#141418", brow: "#151312", holdR: "phone", height: 0.97 };

/** EP4 */
/** ผู้ขายวัตถุดิบ: older, heavier, glasses, maroon tee, dark apron-coloured pants (distinct from DAD: no grey hair, glasses, maroon) */
export const SUPPLIER: Look = { skin: "#9A6E4E", hair: "short", hairC: "#2A2624", iris: "#2A211C", eyeW: 0.9, eyeH: 0.85, outfit: "tee", top: "#7A2E2E", pants: "#2F3A4A", shoes: "#1E1E22", sole: "#1E1E22", brow: "#3A3430", glasses: true, height: 0.93, build: { leg: 1.3, arm: 1.3, torso: 1.15, girth: 1.0, limb: 0.85, neck: 1.4 } };
/** ชายปริศนา EP4: dark jacket + plain trousers (still never seen clearly) */
export const STRANGER_J: Look = { ...STRANGER, outfit: "coat", top: "#1A1D24", pants: "#22252C", holdR: "envelope" };
export const STRANGER_W: Look = { ...STRANGER_J, holdR: undefined };
export const PAKIN_ENV: Look = { ...PAKIN, holdR: "envelope" };
export const PAKIN_FREE: Look = { ...PAKIN, holdR: undefined };
export const TON_HOME_PHONE2: Look = { ...TON_HOME, holdR: "phone" };
export const TON_RECEIPT: Look = { ...TON_HOME, holdR: "notebook" };
