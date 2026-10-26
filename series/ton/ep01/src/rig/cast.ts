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
