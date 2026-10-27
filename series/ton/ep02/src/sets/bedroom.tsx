import React from "react";
import { useCurrentFrame } from "remotion";
import { Bx, Cy, Glow, Pl, useTex, type V3 } from "../kit/three";

/** Ton's tiny bedroom at midnight.
 *  Plan (metres): room x -1.6..1.6, z -1.6..1.6, floor y=0, ceiling y=2.5.
 *    thin mattress on the floor along the back wall (z≈-1.1), small window on the left wall (x=-1.6, night),
 *    old standing fan at x=1.1 z=-0.9 (head turns slowly, blades spin), school bag + uniform on a hook (right wall).
 *  TON sits cross-legged on the floor at SEAT, phone in hand (screen light = key light), notebook on the floor. */
export const SEAT: V3 = [-0.1, 0, 0.1];
export const NOTEBOOK: V3 = [0.3, 0.012, 0.5];

export const Bedroom: React.FC<{ phone?: number; children?: React.ReactNode }> = ({ phone = 1, children }) => {
  const f = useCurrentFrame();
  const sky = useTex(128, 128, (g) => {
    g.fillStyle = "#0A1124"; g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 14; i++) { g.fillStyle = i % 2 ? "#F2D68E" : "#7F92B8"; g.fillRect((i * 37) % 118 + 4, 70 + ((i * 23) % 50), 5, 6); }
  }, "bedsky");
  const sweep = Math.sin(f / 50) * 0.7;
  return (
    <>
    <color attach="background" args={["#05070C"]} />
    <group>
      <ambientLight intensity={0.22} color="#7A8AB8" />
      <directionalLight position={[-4, 2, 0.5]} intensity={0.25} color="#8FA6E0" />
      {/* phone screen light on Ton's face */}
      <pointLight position={[SEAT[0] + 0.1, 0.62, SEAT[2] + 0.75]} intensity={0.55 * phone} distance={1.6} color="#BFD6FF" />
      {/* a weak warm bulb from the hallway gap */}
      <pointLight position={[1.4, 1.9, 1.4]} intensity={0.35} distance={3} color="#FFC890" />
      {/* shell */}
      <Bx p={[0, -0.05, 0]} s={[3.2, 0.1, 3.2]} c="#6E6458" />
      <Bx p={[0, 2.55, 0]} s={[3.2, 0.1, 3.2]} c="#2C2925" />
      <Bx p={[0, 1.25, -1.65]} s={[3.2, 2.5, 0.1]} c="#A79A82" />
      <Bx p={[-1.65, 1.25, 0]} s={[0.1, 2.5, 3.2]} c="#9E917A" />
      <Bx p={[1.65, 1.25, 0]} s={[0.1, 2.5, 3.2]} c="#9E917A" />
      <Bx p={[0, 1.25, 1.65]} s={[3.2, 2.5, 0.1]} c="#9E917A" />
      {/* window */}
      <Pl p={[-1.59, 1.45, -0.3]} s={[0.8, 0.6]} ry={Math.PI / 2} c="#fff" map={sky} e="#fff" ei={0.5} />
      {[1.15, 1.75].map((y) => <Bx key={y} p={[-1.58, y, -0.3]} s={[0.04, 0.04, 0.86]} c="#3A3530" />)}
      {/* mattress + pillow + folded blanket */}
      <Bx p={[-0.2, 0.06, -1.05]} s={[1.9, 0.12, 0.85]} c="#C9C2B4" r={1} />
      <Bx p={[-0.95, 0.16, -1.05]} s={[0.35, 0.08, 0.55]} c="#E8E4DA" r={1} />
      <Bx p={[0.4, 0.16, -1.1]} s={[0.5, 0.1, 0.6]} c="#5A6E8E" r={1} />
      {/* old standing fan */}
      <group position={[1.1, 0, -0.9]}>
        <Cy p={[0, 0.02, 0]} r={0.2} h={0.04} c="#D9D4C8" />
        <Cy p={[0, 0.5, 0]} r={0.025} h={1.0} c="#D9D4C8" />
        <group position={[0, 1.05, 0]} rotation={[0, -0.6 + sweep, 0]}>
          <Cy p={[0, 0, -0.06]} r={0.07} h={0.14} c="#D9D4C8" rx={Math.PI / 2} />
          <group position={[0, 0, 0.06]} rotation={[0, 0, f * 0.9]}>
            {[0, 1, 2].map((i) => <Bx key={i} p={[Math.cos(i * 2.09) * 0.1, Math.sin(i * 2.09) * 0.1, 0]} s={[0.17, 0.08, 0.01]} c="#8FB3C9" o={0.8} rz={i * 2.09} />)}
          </group>
          <mesh position={[0, 0, 0.07]}><torusGeometry args={[0.2, 0.006, 6, 32]} /><meshStandardMaterial color="#CFC9BC" /></mesh>
        </group>
      </group>
      {/* school bag + uniform on hook */}
      <Bx p={[1.58, 1.6, 0.6]} s={[0.04, 0.04, 0.12]} c="#3A3530" />
      <Bx p={[1.5, 1.25, 0.6]} s={[0.14, 0.6, 0.45]} c="#ECEAE2" r={1} />
      <Bx p={[1.4, 0.2, 0.9]} s={[0.25, 0.4, 0.35]} c="#2E3A5C" r={1} />
      {/* notebook + pen on the floor */}
      <group position={NOTEBOOK}>
        <Bx s={[0.44, 0.012, 0.31]} c="#F3EFE4" />
        <Bx p={[-0.215, 0.003, 0]} s={[0.002, 0.008, 0.3]} c="#B0A898" />
        <Cy p={[0.26, 0.01, 0.05]} r={0.006} h={0.14} c="#2848A8" rz={Math.PI / 2} />
      </group>
      <Glow p={[SEAT[0] + 0.05, 0.62, SEAT[2] + 0.28]} s={0.5} c="#BFD6FF" o={0.35 * phone} />
      {children}
    </group>
    </>
  );
};
