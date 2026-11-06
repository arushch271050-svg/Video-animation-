import React from "react";
import { useCurrentFrame } from "remotion";
import { Bx, Cy, Glow, Pl, useTex, type V3 } from "../kit/three";

/** Pakin's bedroom at night: big, cold and expensive. Contrast with Ton's tiny room.
 *  Plan (metres): room x -3..3, z -3..3, floor y=0, ceiling y=3. Floor-to-ceiling window on the back wall (z=-3)
 *  with city lights, purple LED strip under the ceiling, big grey bed with the edge at BED_EDGE, a desk monitor glowing.
 *  PAKIN sits on the bed edge facing +z at SEAT_P, phone in hand. */
export const SEAT_P: V3 = [0, 0, -0.6];

export const PakinRoom: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const city = useTex(256, 256, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "#090B1A"); gr.addColorStop(1, "#1C1A3A");
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 70; i++) { g.fillStyle = ["#F7D38A", "#9FD0FF", "#FF9AD5", "#FFFFFF"][i % 4]; g.fillRect((i * 61) % 250, 120 + ((i * 37) % 130), 3, 4); }
    for (let i = 0; i < 9; i++) { g.fillStyle = "#0B0D1C"; g.fillRect(i * 30, 150 - ((i * 47) % 70), 22, 120); }
  }, "pakincity");
  const pulse = 0.85 + Math.sin(f / 18) * 0.15;
  return (
    <>
      <color attach="background" args={["#040409"]} />
      <group>
        <ambientLight intensity={0.15} color="#6A5AC8" />
        {/* purple LED strip = mood key */}
        <pointLight position={[0, 2.8, -2.2]} intensity={1.6 * pulse} distance={6} color="#9B5CFF" />
        {/* phone light on the face */}
        <pointLight position={[SEAT_P[0] + 0.15, 1.05, SEAT_P[2] + 0.55]} intensity={0.9} distance={1.6} color="#BFD6FF" />
        {/* cold rim from the window */}
        <directionalLight position={[0, 2, -6]} intensity={0.6} color="#7FA0FF" />
        {/* shell */}
        <Bx p={[0, -0.05, 0]} s={[6, 0.1, 6]} c="#2A2830" />
        <Bx p={[0, 3.05, 0]} s={[6, 0.1, 6]} c="#141318" />
        <Bx p={[-3.05, 1.5, 0]} s={[0.1, 3, 6]} c="#26242C" />
        <Bx p={[3.05, 1.5, 0]} s={[0.1, 3, 6]} c="#26242C" />
        {/* window wall */}
        <Pl p={[0, 1.5, -3.0]} s={[5.6, 2.8]} c="#fff" map={city} e="#fff" ei={0.55} />
        {[-1.9, 0, 1.9].map((x) => <Bx key={x} p={[x, 1.5, -2.98]} s={[0.06, 2.9, 0.06]} c="#0C0C10" />)}
        {/* LED strip */}
        <Bx p={[0, 2.92, -2.9]} s={[5.8, 0.03, 0.03]} c="#B57CFF" e="#B57CFF" ei={2.2 * pulse} />
        <Glow p={[0, 2.9, -2.8]} s={2.2} c="#9B5CFF" o={0.35 * pulse} />
        {/* big bed */}
        <group position={[0, 0, -1.6]}>
          <Bx p={[0, 0.22, 0]} s={[2.2, 0.44, 2.0]} c="#3A3A44" />
          <Bx p={[0, 0.5, 0.05]} s={[2.15, 0.14, 1.9]} c="#C9CAD2" r={1} />
          <Bx p={[0, 0.9, -1.0]} s={[2.3, 1.2, 0.12]} c="#24232A" />
          {[-0.55, 0.55].map((x) => <Bx key={x} p={[x, 0.66, -0.75]} s={[0.7, 0.18, 0.35]} c="#E8E8EE" r={1} />)}
        </group>
        {/* desk + glowing monitor + gaming chair */}
        <group position={[2.1, 0, 0.6]}>
          <Bx p={[0, 0.74, 0]} s={[0.7, 0.04, 1.4]} c="#18181D" />
          <Bx p={[-0.25, 1.1, 0]} s={[0.04, 0.42, 0.8]} c="#7FD0FF" e="#7FD0FF" ei={0.8} />
          <Glow p={[-0.3, 1.1, 0]} s={1.1} c="#7FD0FF" o={0.35} />
          <Cy p={[-0.9, 0.5, 0]} r={0.25} h={0.08} c="#C8323A" />
          <Bx p={[-1.12, 0.95, 0]} s={[0.08, 0.8, 0.5]} c="#C8323A" />
        </group>
        {children}
      </group>
    </>
  );
};

/** stylised flash-forward stage: black void, one hard top spotlight, coloured rim lights, glossy floor */
export const Stage: React.FC<{ children?: React.ReactNode; warm?: boolean }> = ({ children, warm }) => (
  <>
    <color attach="background" args={["#000000"]} />
    <group>
      <ambientLight intensity={0.06} />
      <spotLight position={[0, 5, 0.6]} angle={0.5} penumbra={0.6} intensity={30} distance={10} color={warm ? "#FFE2B8" : "#EAF0FF"} />
      <pointLight position={[-2.2, 1.6, -1.5]} intensity={2.2} distance={5} color="#3FB8FF" />
      <pointLight position={[2.2, 1.6, -1.5]} intensity={2.2} distance={5} color="#FF7A3F" />
      <Bx p={[0, -0.05, 0]} s={[12, 0.1, 12]} c="#0E0F14" r={0.25} />
      {children}
    </group>
  </>
);
