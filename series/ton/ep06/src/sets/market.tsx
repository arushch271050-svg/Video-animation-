import React from "react";
import { Bx, Cy, Glow, Pl, Sp, type V3 } from "../kit/three";

/** Morning wet market (EP4): the family's chicken supplier.
 *  Plan (metres): floor y=0. Supplier's counter centred x=0 z=0 (0.95 high, 1.8 wide, 0.7 deep), customers' side = +z.
 *  Blue tarp awning above (y≈2.4). Neighbour stalls left (vegetables) and right (eggs) at x=±2.4.
 *  SUP stands behind the counter facing +z; CUSTOMER (Ton) stands in front. Sunlight comes from the open front-left. */
export const SUP: V3 = [0.1, 0, -0.62];
export const CUSTOMER: V3 = [0.35, 0, 0.8];
export const COUNTER_TOP = 0.95;

const Stall: React.FC<{ p: V3; c: string; goods: string[] }> = ({ p, c, goods }) => (
  <group position={p}>
    <Bx p={[0, 0.45, 0]} s={[1.6, 0.9, 0.7]} c="#8C7A62" />
    <Bx p={[0, 0.92, 0]} s={[1.66, 0.04, 0.74]} c="#B8A88E" />
    {goods.map((g, i) => <Sp key={i} p={[-0.6 + (i % 6) * 0.24, 1.0, -0.15 + Math.floor(i / 6) * 0.2]} r={0.08} c={g} sc={[1, 0.8, 1]} />)}
    <Bx p={[0, 2.35, 0.1]} s={[1.9, 0.04, 1.4]} c={c} rx={-0.15} />
  </group>
);

export const Market: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <>
    <color attach="background" args={["#D7E6EE"]} />
    <group>
      <hemisphereLight args={["#F6F8FF", "#8A7A62", 0.8]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[-5, 6, 6]} intensity={1.7} color="#FFF0D4" />
      {/* floor: wet concrete */}
      <Bx p={[0, -0.05, 0.5]} s={[10, 0.1, 9]} c="#8E8A82" r={0.4} />
      {/* back wall of the market hall + roof beams */}
      <Bx p={[0, 2.0, -2.2]} s={[10, 4, 0.2]} c="#B9B1A0" />
      {[-3.5, -1.2, 1.2, 3.5].map((x) => <Cy key={x} p={[x, 1.6, -1.7]} r={0.07} h={3.2} c="#6A6E76" />)}
      <Bx p={[0, 3.25, -0.8]} s={[10, 0.08, 3.2]} c="#7A7E86" />
      {/* the supplier's counter: steel tray, raw chicken, hanging scale, ice box */}
      <group>
        <Bx p={[0, 0.47, 0]} s={[1.8, 0.94, 0.7]} c="#C9CDD2" r={0.35} />
        <Bx p={[0, COUNTER_TOP, 0]} s={[1.86, 0.03, 0.76]} c="#DDE1E5" r={0.3} />
        <Bx p={[-0.25, COUNTER_TOP + 0.03, 0.02]} s={[0.9, 0.04, 0.5]} c="#B9BFC6" r={0.3} />
        {Array.from({ length: 10 }, (_, i) => <Sp key={i} p={[-0.6 + (i % 5) * 0.17, COUNTER_TOP + 0.09, -0.12 + Math.floor(i / 5) * 0.22]} r={0.07} c="#E8B9A0" sc={[1.3, 0.7, 1]} />)}
        <Bx p={[0.62, COUNTER_TOP + 0.15, 0.0]} s={[0.4, 0.3, 0.45]} c="#2F6FB0" />
        <Bx p={[0.62, COUNTER_TOP + 0.31, 0.0]} s={[0.42, 0.03, 0.47]} c="#F4F4F4" />
        <Cy p={[0.25, 2.05, 0.1]} r={0.008} h={0.5} c="#3A3D44" />
        <Cy p={[0.25, 1.72, 0.1]} r={0.11} h={0.06} c="#E8E2D2" rx={Math.PI / 2} />
        <Cy p={[0.25, 1.55, 0.1]} r={0.15} r2={0.12} h={0.04} c="#B9BFC6" />
        {/* blue tarp awning */}
        <Bx p={[0, 2.4, 0.2]} s={[2.2, 0.04, 1.6]} c="#2F6FB0" rx={-0.12} />
        {[-1.0, 1.0].map((x) => <Cy key={x} p={[x, 1.2, 0.9]} r={0.03} h={2.4} c="#6A6E76" />)}
        {/* a paper sign plate (no text: text goes in the edit) */}
        <Pl p={[-0.6, 2.05, 0.97]} s={[0.5, 0.22]} c="#F4ECD8" rx={-0.12} />
      </group>
      <Stall p={[-2.4, 0, 0.1]} c="#C8323A" goods={["#5C9A44", "#5C9A44", "#E8A23A", "#C8323A", "#5C9A44", "#7A4AA0", "#E8A23A", "#5C9A44", "#C8323A", "#5C9A44", "#E8A23A", "#5C9A44"]} />
      <Stall p={[2.4, 0, 0.1]} c="#2F8A6A" goods={["#F2E4C8", "#F2E4C8", "#E9D2AE", "#F2E4C8", "#E9D2AE", "#F2E4C8", "#F2E4C8", "#E9D2AE", "#F2E4C8", "#F2E4C8", "#E9D2AE", "#F2E4C8"]} />
      {/* hanging bulbs */}
      {[-2.4, 0, 2.4].map((x) => <React.Fragment key={x}><Sp p={[x, 2.15, 0.3]} r={0.05} c="#FFE6B8" e="#FFE6B8" ei={1.6} /><Glow p={[x, 2.15, 0.33]} s={0.5} c="#FFD9A0" o={0.35} /></React.Fragment>)}
      <pointLight position={[0, 2.1, 0.6]} intensity={0.7} distance={3} color="#FFE2B8" />
      {children}
    </group>
  </>
);
