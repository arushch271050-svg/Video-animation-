import React from "react";
import { useCurrentFrame } from "remotion";
import { Bx, Cy, Glow, Pl, Sp, type V3 } from "../kit/three";

/** Fried-chicken cart on a night street (the family stall).
 *  Plan (metres): road/footpath y=0. Shophouse wall behind at z=-2.2 (roller shutter + a lit doorway).
 *  CART centred at x=0 z=0, counter top y=0.95, front faces +z (customers' side).
 *    wok + gas burner on the cart's left (x=-0.45), glass display case on the right (x=+0.35).
 *    Fluorescent tube on a pole above the cart (y=2.1). Street lamp at x=3.2.
 *  Behind the cart (z≈-0.8) is where DAD fries and MOM counts coins at a folding table (x=1.3, z=-0.9).
 *  Plastic stools in front (z≈1.2). */
export const CART: V3 = [0, 0, 0];
export const WOK: V3 = [-0.45, 1.02, 0];
export const COIN_TABLE: V3 = [1.35, 0, -0.95];
/** EP2: leftover bin next to the cart */
export const BIN: V3 = [-1.3, 0, 0.55];

const STEEL = "#B9BDC2", RED = "#B8352C";

/** EP3: where the stranger stands, across the road (faces the stall, -z) */
export const ACROSS: V3 = [-1.6, 0, 5.2];
/** EP3: shop sign board above the cart (no text: a drumstick icon) */
export const SIGN: V3 = [0, 2.45, 0.2];
/** EP4: the alley mouth across the road */
export const ALLEY: V3 = [-1.6, 0, 7.4];

export const Stall: React.FC<{ children?: React.ReactNode; dusk?: boolean }> = ({ children, dusk }) => {
  const f = useCurrentFrame();
  const flick = 1 + Math.sin(f * 1.7) * 0.03 + (f % 97 < 2 ? -0.25 : 0);
  return (
    <>
    <color attach="background" args={[dusk ? "#D98A5E" : "#0B0E16"]} />
    <group>
      {dusk ? <directionalLight position={[6, 2.2, 4]} intensity={1.5} color="#FFB070" /> : null}
      {dusk ? <hemisphereLight args={["#FFC79A", "#3A2A20", 0.55]} /> : null}
      {/* EP3: sign board over the cart: red board, cream drumstick icon, two lamps */}
      <group position={SIGN}>
        <Bx s={[1.5, 0.42, 0.05]} c="#B8352C" />
        <Bx p={[0, 0, 0.03]} s={[1.42, 0.34, 0.01]} c="#C9443A" />
        <Sp p={[-0.05, 0, 0.045]} r={0.1} c="#F2D68E" sc={[1.3, 0.9, 0.3]} />
        <Bx p={[0.13, -0.04, 0.045]} s={[0.16, 0.04, 0.02]} c="#F4F0E6" rz={-0.35} />
        <Sp p={[0.22, -0.07, 0.05]} r={0.028} c="#F4F0E6" sc={[1, 1, 0.4]} />
        {[-0.62, 0.62].map((x) => <Sp key={x} p={[x, 0.27, 0.06]} r={0.035} c="#FFE6B8" e="#FFE6B8" ei={1.5} />)}
        <Cy p={[-0.78, -0.835, -0.02]} r={0.02} h={1.27} c="#9A9EA4" />
        <Cy p={[0.78, -0.835, -0.02]} r={0.02} h={1.27} c="#9A9EA4" />
      </group>
      <ambientLight intensity={0.22} color="#8FA0C8" />
      <hemisphereLight args={["#3A4A70", "#1A120C", 0.3]} />
      {/* fluorescent tube: cool white key over the cart */}
      <pointLight position={[0, 2.05, 0.1]} intensity={2.4 * flick} distance={6} color="#E8F4FF" />
      {/* warm burner + lamp spill */}
      <pointLight position={[WOK[0], 1.25, WOK[2] + 0.2]} intensity={0.9} distance={2.5} color="#FF9A4A" />
      <pointLight position={[3.2, 3.4, 1.2]} intensity={1.6} distance={9} color="#FFB867" />
      {/* street + footpath */}
      <Bx p={[0, -0.05, 2.5]} s={[14, 0.1, 6]} c="#2B2D33" />
      <Bx p={[0, -0.02, -0.6]} s={[14, 0.1, 3.4]} c="#5E5A52" />
      {/* shophouse wall, roller shutter, lit doorway */}
      <Bx p={[0, 2.2, -2.3]} s={[14, 4.4, 0.2]} c="#6A6258" />
      <Bx p={[-2.4, 1.2, -2.18]} s={[2.6, 2.4, 0.04]} c="#8C8F94" />
      {Array.from({ length: 12 }, (_, i) => <Bx key={i} p={[-2.4, 0.1 + i * 0.2, -2.15]} s={[2.6, 0.02, 0.02]} c="#6A6D72" />)}
      <Bx p={[2.6, 1.1, -2.18]} s={[1.0, 2.2, 0.04]} c="#FFD9A0" e="#FFD9A0" ei={0.7} />
      <pointLight position={[2.6, 1.5, -1.6]} intensity={0.7} distance={3} color="#FFD3A0" />
      {/* cart: steel cabinet on wheels, glass case, wok station */}
      <group position={CART}>
        <Bx p={[0, 0.55, 0]} s={[1.6, 0.8, 0.7]} c={STEEL} r={0.35} />
        <Bx p={[0, 0.56, 0.352]} s={[1.6, 0.5, 0.01]} c={RED} />
        <Bx p={[0, 0.96, 0]} s={[1.66, 0.04, 0.74]} c="#D5D8DC" r={0.3} />
        {[-0.65, 0.65].map((x) => <Cy key={x} p={[x, 0.12, 0.3]} r={0.12} h={0.06} c="#1A1A1C" rx={Math.PI / 2} />)}
        {/* glass display case with fried chicken */}
        <group position={[0.35, 0.98, 0]}>
          <Bx p={[0, 0.22, 0]} s={[0.8, 0.44, 0.55]} c="#CFE6F2" o={0.25} />
          <Bx p={[0, 0.44, 0]} s={[0.82, 0.02, 0.57]} c={STEEL} />
          {Array.from({ length: 9 }, (_, i) => <Sp key={i} p={[-0.28 + (i % 3) * 0.28, 0.06 + Math.floor(i / 3) * 0.06, -0.12 + (i % 2) * 0.16]} r={0.06} c="#B8732E" sc={[1.3, 0.75, 0.9]} />)}
        </group>
        {/* gas burner + wok + oil */}
        <group position={[WOK[0], 0.98, WOK[2]]}>
          <Cy p={[0, 0.03, 0]} r={0.16} h={0.06} c="#2A2A2E" />
          <Cy p={[0, 0.12, 0]} r={0.3} r2={0.14} h={0.16} c="#3A3A3E" />
          <Cy p={[0, 0.19, 0]} r={0.27} h={0.01} c="#C08A2A" e="#7A4A10" ei={0.4} />
          {[0, 1, 2, 3].map((i) => <Sp key={i} p={[Math.sin(i * 1.7) * 0.12, 0.2, Math.cos(i * 1.7) * 0.1]} r={0.045} c="#C47A2E" sc={[1.3, 0.7, 1]} />)}
          <Glow p={[0, 0.05, 0.15]} s={0.4} c="#FF8A3A" o={0.5} />
        </group>
        {/* tube light pole + tube */}
        <Cy p={[0.75, 1.5, -0.3]} r={0.015} h={1.1} c="#9A9EA4" />
        <Bx p={[0.2, 2.05, -0.3]} s={[1.2, 0.03, 0.03]} c="#9A9EA4" />
        <Cy p={[0.0, 2.02, -0.25]} r={0.022} h={0.9} c="#F4FBFF" e="#F4FBFF" ei={2.2 * flick} rz={Math.PI / 2} />
        <Glow p={[0.0, 2.02, -0.2]} s={1.2} c="#DDEEFF" o={0.45 * flick} />
      </group>
      {/* coin table behind the cart */}
      <group position={COIN_TABLE}>
        <Bx p={[0, 0.7, 0]} s={[0.8, 0.03, 0.55]} c="#D2CFC8" />
        {[[-0.35, -0.24], [0.35, -0.24], [-0.35, 0.24], [0.35, 0.24]].map(([x, z], i) => <Cy key={i} p={[x, 0.35, z]} r={0.015} h={0.7} c="#7A7E84" />)}
        <Cy p={[0.1, 0.78, 0.02]} r={0.07} h={0.13} c="#A8AEB4" />
        {Array.from({ length: 8 }, (_, i) => <Cy key={i} p={[-0.15 + (i % 4) * 0.04, 0.72 + Math.floor(i / 4) * 0.008, 0.08 - (i % 3) * 0.04]} r={0.014} h={0.004} c={i % 3 ? "#C9CDD2" : "#C9A455"} />)}
      </group>
      {/* EP2 extras: gas tank under the wok side, flour sack, leftover bin */}
      <group position={[-1.15, 0, -0.35]}>
        <Cy p={[0, 0.32, 0]} r={0.16} h={0.62} c="#B8352C" />
        <Cy p={[0, 0.68, 0]} r={0.05} h={0.1} c="#9A9EA4" />
      </group>
      <group position={[1.75, 0.73, -0.95]}>
        <Bx p={[0, 0.1, 0]} s={[0.3, 0.2, 0.2]} c="#EDE7D8" r={1} />
      </group>
      <group position={BIN}>
        <Cy p={[0, 0.28, 0]} r={0.22} r2={0.19} h={0.56} c="#2F6E4A" />
        <Cy p={[0, 0.565, 0]} r={0.225} h={0.02} c="#24573A" />
      </group>
      {/* plastic stools */}
      {[[-0.8, 1.3, "#C8323A"], [0.4, 1.4, "#2F6FB0"], [1.6, 1.25, "#C8323A"], [1.0, -1.1, "#2F6FB0"]].map(([x, z, c], i) => (
        <group key={i} position={[x as number, 0, z as number]}>
          <Cy p={[0, 0.44, 0]} r={0.16} h={0.03} c={c as string} />
          <Cy p={[0, 0.22, 0]} r={0.13} r2={0.17} h={0.42} c={c as string} />
        </group>
      ))}
      {/* EP4: shophouses across the road with a dark alley at ALLEY (the stranger walks into it) */}
      <group>
        <Bx p={[-5.0, 1.8, 7.4]} s={[5.6, 3.6, 0.3]} c="#6A6D74" />
        <Bx p={[2.5, 1.8, 7.4]} s={[7.2, 3.6, 0.3]} c="#6E6A64" />
        <Bx p={[-1.6, 1.8, 8.6]} s={[1.0, 3.6, 0.2]} c="#0A0B0E" />
        {[-6, -4.4, 0.4, 2.2, 4.0].map((x, i) => <Bx key={x} p={[x, 1.1, 7.24]} s={[1.2, 2.0, 0.04]} c={i % 2 ? "#55585E" : "#4A4C52"} />)}
        <Pl p={[3.0, 2.9, 7.23]} s={[1.2, 0.4]} c="#4AB5C9" e="#4AB5C9" ei={0.5} ry={Math.PI} />
        {/* street lamp by the alley: lights the far side of the road */}
        <Cy p={[0.2, 1.7, 6.9]} r={0.05} h={3.4} c="#4A4E56" />
        <Sp p={[0.0, 3.35, 6.75]} r={0.09} c="#FFE0B0" e="#FFE0B0" ei={2} />
        <Glow p={[0.0, 3.32, 6.7]} s={1.4} c="#FFC27A" o={0.45} />
        <pointLight position={[0.0, 3.2, 6.4]} intensity={2.6} distance={7} color="#FFC27A" />
      </group>
      {/* street lamp */}
      <Cy p={[3.2, 1.8, 1.2]} r={0.05} h={3.6} c="#4A4E56" />
      <Bx p={[3.0, 3.55, 1.2]} s={[0.5, 0.08, 0.2]} c="#4A4E56" />
      <Sp p={[2.85, 3.48, 1.2]} r={0.09} c="#FFE0B0" e="#FFE0B0" ei={2} />
      <Glow p={[2.85, 3.45, 1.25]} s={1.6} c="#FFC27A" o={0.5} />
      {/* far shop signs as soft colour blobs */}
      <Pl p={[-4.5, 2.8, -2.18]} s={[1.6, 0.5]} c="#E25A4A" e="#E25A4A" ei={0.9} />
      <Pl p={[5.0, 2.6, -2.18]} s={[1.4, 0.45]} c="#4AB5C9" e="#4AB5C9" ei={0.9} />
      {children}
    </group>
    </>
  );
};
