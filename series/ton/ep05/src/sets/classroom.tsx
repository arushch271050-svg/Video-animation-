import React from "react";
import { Bx, Cy, Glow, Pl, useTex, type V3 } from "../kit/three";

/** Thai classroom at lunch break (EP3).
 *  Plan (metres): room x -4..4, z -4..4, floor y=0, ceiling y=3. Green board on the front wall (z=-4), students face -z.
 *  Windows along the left wall (x=-4) with daylight + trees outside; door + notice board on the right wall (x=4).
 *  Desks in rows: desk top y=0.72, chair seat y=0.45, a chair sits 0.4 m behind (+z) its desk.
 *  TON sits at TON_SEAT facing -z (ry=PI); his desk top centre = TON_DESK. */
export const TON_DESK: V3 = [0.8, 0.74, 0.9];
export const TON_SEAT: V3 = [0.8, 0, 1.32];
const COLS = [-2.4, -0.8, 0.8, 2.4], ROWS = [-1.5, -0.3, 0.9, 2.1];

const Desk: React.FC<{ p: V3 }> = ({ p }) => (
  <group position={p}>
    <Bx p={[0, 0.72, 0]} s={[0.62, 0.035, 0.46]} c="#B98E5E" />
    {[[-0.27, -0.19], [0.27, -0.19], [-0.27, 0.19], [0.27, 0.19]].map(([x, z], i) => <Cy key={i} p={[x, 0.36, z]} r={0.014} h={0.72} c="#5A5E66" />)}
    <Bx p={[0, 0.6, -0.02]} s={[0.56, 0.02, 0.36]} c="#7A7E86" />
    {/* chair */}
    <Bx p={[0, 0.45, 0.42]} s={[0.38, 0.03, 0.36]} c="#A57D52" />
    <Bx p={[0, 0.72, 0.6]} s={[0.38, 0.32, 0.025]} c="#A57D52" />
    {[[-0.16, 0.27], [0.16, 0.27], [-0.16, 0.57], [0.16, 0.57]].map(([x, z], i) => <Cy key={i} p={[x, 0.22, z]} r={0.012} h={0.45} c="#5A5E66" />)}
  </group>
);

export const Classroom: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const sky = useTex(256, 256, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "#9CC8EC"); gr.addColorStop(1, "#DDEBF2");
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? "#5C8A44" : "#4E7A3A"; g.beginPath(); g.arc(20 + i * 40, 200 - (i % 3) * 14, 46, 0, Math.PI * 2); g.fill(); }
  }, "class-sky");
  return (
    <>
      <color attach="background" args={["#CFE2F0"]} />
      <group>
        <hemisphereLight args={["#F4F8FF", "#8A7A62", 0.75]} />
        <ambientLight intensity={0.3} />
        {/* daylight through the left windows */}
        <directionalLight position={[-7, 4, 1.5]} intensity={1.6} color="#FFF0D8" />
        <pointLight position={[0, 2.8, 1]} intensity={0.9} distance={7} color="#F4F8FF" />
        {/* shell */}
        <Bx p={[0, -0.05, 0]} s={[8, 0.1, 8]} c="#A9A397" />
        <Bx p={[0, 3.05, 0]} s={[8, 0.1, 8]} c="#EDEBE4" />
        <Bx p={[0, 1.5, -4.05]} s={[8, 3, 0.1]} c="#E6DCC4" />
        <Bx p={[0, 1.5, 4.05]} s={[8, 3, 0.1]} c="#E6DCC4" />
        <Bx p={[4.05, 1.5, 0]} s={[0.1, 3, 8]} c="#E3D8BE" />
        {/* left wall with a window band */}
        <Bx p={[-4.05, 0.45, 0]} s={[0.1, 0.9, 8]} c="#E3D8BE" />
        <Bx p={[-4.05, 2.7, 0]} s={[0.1, 0.6, 8]} c="#E3D8BE" />
        <Pl p={[-4.0, 1.65, 0]} s={[8, 1.5]} c="#fff" map={sky} e="#fff" ei={0.6} ry={Math.PI / 2} />
        {[-3, -1.5, 0, 1.5, 3].map((z) => <Bx key={z} p={[-3.98, 1.65, z]} s={[0.06, 1.5, 0.06]} c="#3E6FA8" />)}
        <Bx p={[-0.2, 0.06, 0]} s={[0.02, 0.12, 8]} c="#3E6FA8" />
        {/* green board + teacher desk */}
        <Bx p={[0, 1.65, -3.98]} s={[4.2, 1.3, 0.04]} c="#2E5B45" />
        <Bx p={[0, 0.98, -3.95]} s={[4.3, 0.04, 0.1]} c="#8E8676" />
        <Bx p={[-2.6, 0.4, -3.2]} s={[1.2, 0.8, 0.6]} c="#8C6A46" />
        {/* clock + fans */}
        <Cy p={[2.6, 2.45, -3.98]} r={0.18} h={0.03} c="#F4F2EC" rx={Math.PI / 2} />
        {[-1.6, 1.6].map((x) => <group key={x} position={[x, 2.9, 0.2]}><Cy r={0.06} h={0.12} c="#D8D6D0" />{[0, 1, 2].map((i) => <Bx key={i} p={[Math.cos(i * 2.09) * 0.32, -0.07, Math.sin(i * 2.09) * 0.32]} s={[0.55, 0.01, 0.1]} c="#D8D6D0" ry={-i * 2.09} />)}</group>)}
        {/* notice board + door on the right wall */}
        <Bx p={[3.98, 1.55, -1.2]} s={[0.04, 1.0, 1.6]} c="#A8794A" />
        {[[-1.6, 1.75], [-0.95, 1.45], [-0.6, 1.8]].map(([z, y], i) => <Bx key={i} p={[3.95, y, z]} s={[0.01, 0.3, 0.24]} c={["#F2EAD2", "#E9C9C3", "#CFE0EE"][i]} />)}
        <Bx p={[3.98, 1.05, 2.4]} s={[0.04, 2.1, 0.95]} c="#6A4A32" />
        {COLS.flatMap((x) => ROWS.map((z) => <Desk key={`${x}${z}`} p={[x, 0, z]} />))}
        <Glow p={[-3.9, 1.7, 0.8]} s={2.4} c="#FFF6E0" o={0.25} />
        {children}
      </group>
    </>
  );
};
