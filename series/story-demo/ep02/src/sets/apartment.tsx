import React from "react";
import { useCurrentFrame } from "remotion";
import { Bx, Cy, Glow, Pl, Sp, textTex, useTex, type V3 } from "../kit/three";

/** Demo set: a small, warmly lit apartment room at night + a strip of carpeted corridor outside the door.
 *  Look: matte colours, warm practical lights with a Glow halo, a cool night window for contrast.
 *  Build the world ONCE with fixed coordinates, then shoot it from many cameras (continuity is free).
 *  Plan (metres): room x -3..3, z -3..3, floor y=0, ceiling y=2.8.
 *    door on the back wall z=-3 at x=1.2 (corridor behind it, z -3..-5, its own light)
 *    bed along the left wall (x≈-1.9, z -0.4..1.6), wardrobe against the front wall z=3 at x=-1.2
 *    desk + lamp at x=2.2, z=1.4; window on the left wall x=-3 (night sky); wall sconce right of the door. */
export const DOOR: V3 = [1.2, 0, -3];
export const BED: V3 = [-1.9, 0, 0.6];
export const WARDROBE: V3 = [-1.2, 0, 2.72];
export const DESK: V3 = [2.2, 0, 1.4];
/** EP2: coat hook on the back wall, left of the door */
export const JACKET: V3 = [0.25, 0, -2.97];

const WALL = "#CDBB9C", FLOOR = "#7A5A40", WOOD = "#8A6446", SHEET = "#E6DCC8", DOORW = "#7A4A32", BRASS = "#C9A455", CARPET = "#8E2B2B";

export type ApartmentProps = {
  /** desk lamp 0..1 */ lamp?: number;
  /** corridor light leaking under the door 0..1 */ hall?: number;
  /** a pair of feet shadows in the light under the door 0..1 */ feet?: number;
  /** door leaf open 0..1 (swings into the corridor) */ doorOpen?: number;
  /** wardrobe doors rattle 0..1 */ shake?: number;
  /** wardrobe RIGHT leaf open 0..1 (hinged on its outer edge, swings into the room) */ wOpen?: number;
  /** grey jacket on the hook left of the front door 0..1 (0 = empty hook) */ jacket?: number;
  children?: React.ReactNode;
};

export const Apartment: React.FC<ApartmentProps> = ({ lamp = 1, hall = 1, feet = 0, doorOpen = 0, shake = 0, wOpen = 0, jacket = 1, children }) => {
  const f = useCurrentFrame();
  const sx = shake ? Math.sin(f * 2.1) * 0.01 * shake : 0;
  const plate = textTex("604", 256, 128, "#E9E6DC", "#22252E", 90, "plate604");
  const sky = useTex(256, 256, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, "#0B1430"); gr.addColorStop(1, "#24345C");
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 26; i++) { g.fillStyle = i % 3 ? "#F2D68E" : "#9FB3D6"; g.fillRect((i * 53) % 240 + 6, 150 + ((i * 37) % 90), 8, 10); }
  }, "nightsky");
  return (
    <group>
      <color attach="background" args={["#120D0A"]} />
      {/* warm room ambience; a cool moon key through the window keeps the night readable */}
      <ambientLight intensity={0.5} color="#F2D9B8" />
      <hemisphereLight args={["#F0DCC0", "#3A2A1E", 0.45]} />
      <directionalLight position={[-6, 3, 1]} intensity={0.35} color="#A9BCE6" />
      {/* wall sconce right of the door (lights the door wall) */}
      <pointLight position={[DOOR[0] + 1.0, 1.85, -2.5]} intensity={1.6} distance={4.5} color="#FFCF94" />
      {/* warm desk lamp (key light for faces) */}
      <pointLight position={[DESK[0] - 0.3, 1.3, DESK[2] - 0.2]} intensity={2.6 * lamp} distance={5.5} color="#FFD3A0" />
      {/* room shell */}
      <Bx p={[0, -0.05, 0]} s={[6, 0.1, 6]} c={FLOOR} />
      <Bx p={[0, 2.85, 0]} s={[6, 0.1, 6]} c="#3A2E24" />
      <Bx p={[-3.05, 1.4, 0]} s={[0.1, 2.8, 6]} c={WALL} />
      <Bx p={[3.05, 1.4, 0]} s={[0.1, 2.8, 6]} c={WALL} />
      <Bx p={[0, 1.4, 3.05]} s={[6, 2.8, 0.1]} c={WALL} />
      {/* back wall with a door opening at x=1.2 */}
      <Bx p={[-1.0, 1.4, -3.05]} s={[3.8, 2.8, 0.1]} c={WALL} />
      <Bx p={[2.4, 1.4, -3.05]} s={[1.2, 2.8, 0.1]} c={WALL} />
      <Bx p={[DOOR[0], 2.48, -3.05]} s={[1.0, 0.64, 0.1]} c={WALL} />
      {/* window + night city */}
      <Pl p={[-2.99, 1.55, -0.6]} s={[1.4, 1.0]} ry={Math.PI / 2} c="#ffffff" map={sky} e="#ffffff" ei={0.6} />
      {[[-2.97, 2.07, -0.6, 1.5, 0.05], [-2.97, 1.03, -0.6, 1.5, 0.05]].map(([x, y, z, w, t], i) => <Bx key={i} p={[x, y, z]} s={[0.05, t, w]} c="#3A3F48" />)}
      {/* door: frame + leaf hinged at the left edge, number plate */}
      <group position={[DOOR[0], 0, -3.0]}>
        <Bx p={[0, 2.12, 0]} s={[1.08, 0.08, 0.16]} c="#5A3624" />
        {[-1, 1].map((sd) => <Bx key={sd} p={[sd * 0.5, 1.05, 0]} s={[0.07, 2.14, 0.16]} c="#5A3624" />)}
        <group position={[-0.46, 0, 0]} rotation={[0, -doorOpen * 1.3, 0]}>
          <Bx p={[0.46, 1.06, 0]} s={[0.92, 2.0, 0.05]} c={DOORW} r={0.7} />
          {/* raised panels */}
          {[1.5, 0.6].map((y) => <Bx key={y} p={[0.46, y, 0.03]} s={[0.66, 0.7, 0.012]} c="#6A3E2A" r={0.8} />)}
          <Bx p={[0.82, 1.0, 0.05]} s={[0.04, 0.16, 0.05]} c={BRASS} r={0.35} />
          <Sp p={[0.46, 1.62, 0.04]} r={0.014} c={BRASS} />
        </group>
        <Pl p={[0, 2.38, 0.09]} s={[0.4, 0.2]} c="#fff" map={plate} />
      </group>
      {/* sconce: brass plate + glowing shade + halo */}
      <group position={[DOOR[0] + 1.0, 1.85, -2.97]}>
        <Bx s={[0.12, 0.2, 0.03]} c={BRASS} r={0.4} />
        <Cy p={[0, 0.02, 0.1]} r={0.07} r2={0.1} h={0.14} c="#F4E2C0" e="#FFD39A" ei={0.9} />
        <Glow p={[0, 0.02, 0.14]} s={0.9} o={0.5} />
      </group>
      {/* skirting board */}
      <Bx p={[0, 0.05, 2.99]} s={[6, 0.1, 0.03]} c="#5A3E2C" />
      <Bx p={[-2.99, 0.05, 0]} s={[0.03, 0.1, 6]} c="#5A3E2C" />
      {/* light under the door: glowing strip on the floor inside, broken by two feet shadows */}
      {hall > 0 ? <group position={[DOOR[0], 0.004, -2.86]}>
        <Bx s={[0.9, 0.004, 0.26]} c="#FFE2B0" e="#FFE2B0" ei={1.0 * hall} />
        {feet > 0 ? [-0.12, 0.12].map((x) => <Bx key={x} p={[x, 0.002, -0.02]} s={[0.13, 0.004, 0.24 * feet]} c="#0B0B0E" />) : null}
      </group> : null}
      {/* corridor outside (only seen with the door open) */}
      <group>
        <Bx p={[DOOR[0], -0.05, -4.1]} s={[3, 0.1, 2]} c={CARPET} />
        <pointLight position={[DOOR[0], 2.3, -4.2]} intensity={2.2 * hall} distance={4} color="#FFE2B0" />
        <Bx p={[DOOR[0], 1.4, -5.1]} s={[3, 2.8, 0.1]} c="#D6C3A0" />
      </group>
      {/* bed: frame, mattress, pillow, blanket */}
      <group position={BED}>
        <Bx p={[0, 0.2, 0]} s={[1.0, 0.4, 2.1]} c={WOOD} />
        <Bx p={[0, 0.47, 0]} s={[0.96, 0.16, 2.04]} c={SHEET} r={1} />
        <Bx p={[0, 0.6, -0.82]} s={[0.66, 0.12, 0.32]} c="#E9EDF0" r={1} />
        <Bx p={[0.02, 0.57, 0.45]} s={[1.0, 0.08, 1.2]} c="#8E5A4A" r={1} />
      </group>
      {/* wardrobe: hollow body (so the open right leaf shows an empty inside), left leaf fixed, right leaf hinged
          on its outer edge (local x=+0.59) and swinging into the room. Inside: a rail + three empty hangers. */}
      <group position={WARDROBE}>
        <Bx p={[0, 1.05, 0.24]} s={[1.2, 2.1, 0.02]} c="#4A3626" />
        {[-1, 1].map((sd) => <Bx key={`s${sd}`} p={[sd * 0.59, 1.05, 0]} s={[0.02, 2.1, 0.5]} c={WOOD} />)}
        <Bx p={[0, 2.09, 0]} s={[1.2, 0.02, 0.5]} c={WOOD} />
        <Bx p={[0, 0.01, 0]} s={[1.2, 0.02, 0.5]} c="#4A3626" />
        <Bx p={[0, 1.05, 0]} s={[0.02, 2.1, 0.5]} c="#4A3626" />
        <Cy p={[0.3, 1.78, 0.02]} r={0.012} h={0.56} c="#B9B2A4" rz={Math.PI / 2} />
        {[0.14, 0.3, 0.46].map((x, i) => (
          <group key={`hg${i}`} position={[x, 1.78, 0.02]} rotation={[Math.sin(f / 17 + i) * 0.06 * wOpen, 0, 0]}>
            <Cy p={[0, -0.03, 0]} r={0.006} h={0.06} c="#8C8A86" />
            <Bx p={[0, -0.075, 0]} s={[0.012, 0.012, 0.3]} c="#C9B48E" />
          </group>
        ))}
        <Bx p={[-0.3 - sx, 1.05, -0.255]} s={[0.58, 2.0, 0.02]} c="#B08A64" />
        <Cy p={[-0.04, 1.1, -0.28]} r={0.012} h={0.18} c="#D9D2C2" />
        <group position={[0.59, 0, -0.255]} rotation={[0, -wOpen * 1.9, 0]}>
          <Bx p={[-0.29 + sx, 1.05, 0]} s={[0.58, 2.0, 0.02]} c="#B08A64" />
          <Cy p={[-0.55, 1.1, -0.025]} r={0.012} h={0.18} c="#D9D2C2" />
        </group>
        <Bx p={[0, 0.01, -0.27]} s={[1.0, 0.012, 0.02]} c="#050505" />
      </group>
      {/* coat hook left of the front door + the grey jacket (EP2 plant: it is gone at the end) */}
      <group position={[JACKET[0], 0, JACKET[2]]}>
        <Cy p={[0, 1.74, 0.03]} r={0.012} h={0.08} c={BRASS} rx={Math.PI / 2} />
        <Bx p={[0, 1.74, 0.0]} s={[0.07, 0.05, 0.02]} c={BRASS} r={0.4} />
        {jacket > 0 ? <group position={[0, 0, 0.07]}>
          <Bx p={[0, 1.42, 0]} s={[0.44, 0.6, 0.09]} c="#8E9198" r={1} />
          <Bx p={[0, 1.7, 0.01]} s={[0.2, 0.08, 0.1]} c="#7A7D84" r={1} />
          {[-1, 1].map((sd) => <Bx key={`j${sd}`} p={[sd * 0.25, 1.4, 0.005]} s={[0.1, 0.56, 0.08]} c="#868990" r={1} rz={sd * 0.08} />)}
          <Bx p={[0, 1.42, 0.047]} s={[0.012, 0.58, 0.004]} c="#5E6168" />
        </group> : null}
      </group>
      {/* desk + lamp + phone */}
      <group position={DESK}>
        <Bx p={[0, 0.74, 0]} s={[1.0, 0.04, 0.6]} c={WOOD} />
        {[[-0.45, -0.25], [0.45, -0.25], [-0.45, 0.25], [0.45, 0.25]].map(([x, z], i) => <Cy key={i} p={[x, 0.37, z]} r={0.02} h={0.74} c="#3A3D44" />)}
        <Cy p={[-0.3, 0.77, -0.15]} r={0.07} h={0.03} c="#2A2D33" />
        <Cy p={[-0.3, 0.98, -0.15]} r={0.008} h={0.42} c="#2A2D33" />
        <Cy p={[-0.3, 1.2, -0.15]} r={0.06} r2={0.11} h={0.12} c="#F0DDB8" e="#FFD39A" ei={0.9 * lamp} />
        <Glow p={[-0.3, 1.16, -0.15]} s={1.1} o={0.55 * lamp} />
      </group>
      {children}
    </group>
  );
};
