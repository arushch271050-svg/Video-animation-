import React from "react";
import { Bx, Cy, Sp, type V3 } from "../kit/three";

/** Thai public school, daytime. One world, two areas.
 *  Plan (metres): ground y=0.
 *    FRONT: courtyard x -6..6, z -2..8. Two-storey building along z=-2 (facade faces +z), cream walls, blue trim,
 *           covered walkway roof along the facade, flagpole at x=-4.5 z=3, two rain trees at x=5 z=1 and x=-5.5 z=6.
 *    BACK:  walkway behind the building at z -6..-3: back wall of the building at z=-3 (facing -z),
 *           a boundary wall at z=-7.5, concrete path, pillars every 2.5 m. Shot from -z looking toward +z or along x.
 *  Gate path: characters walk along x near z=3. */
export const FRONT_PATH_Z = 3.0;
export const BACK_PATH_Z = -5.0;

const CREAM = "#E9DFC6", TRIM = "#3E6FA8", ROOF = "#8E3B2E", CONC = "#B9B3A6", GRASS = "#6E8F4E", TRUNK = "#5A4130", LEAF = "#4E7A3A";

const Tree: React.FC<{ p: V3; s?: number }> = ({ p, s = 1 }) => (
  <group position={p} scale={s}>
    <Cy p={[0, 1.2, 0]} r={0.16} r2={0.22} h={2.4} c={TRUNK} />
    {[[0, 3.0, 0, 1.5], [1.0, 2.7, 0.3, 1.1], [-0.9, 2.8, -0.2, 1.15], [0.2, 3.4, -0.8, 1.0], [-0.3, 3.3, 0.8, 1.0]].map(([x, y, z, r], i) => (
      <Sp key={i} p={[x, y, z]} r={r} c={i % 2 ? "#5C8A44" : LEAF} sc={[1, 0.62, 1]} />
    ))}
  </group>
);

export const School: React.FC<{ sun?: number; children?: React.ReactNode }> = ({ sun = 1, children }) => (
  <>
  <color attach="background" args={["#BFD8EE"]} />
  <group>
    <hemisphereLight args={["#EAF3FF", "#8A7A5A", 0.9 * sun]} />
    <ambientLight intensity={0.35} />
    <directionalLight position={[6, 9, 7]} intensity={1.9 * sun} color="#FFF1D6" />
    {/* ground: courtyard concrete + grass strips */}
    <Bx p={[0, -0.05, 2]} s={[16, 0.1, 22]} c={CONC} />
    <Bx p={[-4.5, 0.0, 6]} s={[5, 0.02, 4]} c={GRASS} />
    <Bx p={[5, 0.0, 5.5]} s={[4, 0.02, 4]} c={GRASS} />
    {/* FRONT facade: two storeys, windows, blue trim band, walkway roof on posts */}
    <group position={[0, 0, -2]}>
      <Bx p={[0, 2.6, -0.5]} s={[16, 5.2, 1]} c={CREAM} />
      <Bx p={[0, 2.62, 0.01]} s={[16, 0.18, 0.04]} c={TRIM} />
      <Bx p={[0, 5.25, -0.4]} s={[16.4, 0.2, 1.4]} c={ROOF} />
      {Array.from({ length: 8 }, (_, i) => -7 + i * 2).flatMap((x) => [
        <Bx key={`w1${x}`} p={[x, 1.45, 0.02]} s={[1.1, 1.0, 0.04]} c="#7FA6C9" e="#9CC0E0" ei={0.15} />,
        <Bx key={`w2${x}`} p={[x, 3.85, 0.02]} s={[1.1, 1.0, 0.04]} c="#7FA6C9" e="#9CC0E0" ei={0.15} />,
        <Bx key={`f${x}`} p={[x, 1.45, 0.05]} s={[1.16, 0.06, 0.04]} c={TRIM} />,
      ])}
      {/* covered walkway */}
      <Bx p={[0, 2.55, 1.3]} s={[16, 0.12, 2.6]} c="#D9D2C2" />
      {Array.from({ length: 7 }, (_, i) => -7.5 + i * 2.5).map((x) => <Bx key={x} p={[x, 1.27, 2.5]} s={[0.22, 2.55, 0.22]} c={CREAM} />)}
      {/* school sign plate above the door (text added in edit) */}
      <Bx p={[0, 3.0, 0.08]} s={[3.2, 0.5, 0.06]} c="#2E4F80" />
      <Bx p={[0, 1.1, 0.03]} s={[1.6, 2.2, 0.04]} c="#5A3B2A" />
    </group>
    {/* flagpole */}
    <Cy p={[-4.5, 3, 3]} r={0.04} h={6} c="#D0D3D6" />
    <Bx p={[-4.0, 5.6, 3]} s={[0.9, 0.55, 0.02]} c="#C8323A" />
    <Bx p={[-4.0, 5.6, 3.001]} s={[0.9, 0.18, 0.02]} c="#F4F4F4" />
    <Bx p={[-4.0, 5.6, 3.002]} s={[0.9, 0.09, 0.02]} c="#2C3E8C" />
    <Tree p={[5, 0, 1]} />
    <Tree p={[-5.5, 0, 6.5]} s={0.9} />
    <Tree p={[6.5, 0, 7]} s={1.1} />
    {/* BACK walkway behind the building */}
    <group>
      <Bx p={[0, 2.6, -3.0]} s={[16, 5.2, 0.1]} c="#D8CCB0" />
      {Array.from({ length: 6 }, (_, i) => -6 + i * 2.4).map((x) => <Bx key={`bw${x}`} p={[x, 1.6, -3.06]} s={[0.9, 0.7, 0.03]} c="#6F8EA8" />)}
      <Bx p={[0, 2.6, -4.2]} s={[16, 0.1, 2.4]} c="#C9C1AE" />
      {Array.from({ length: 7 }, (_, i) => -7.5 + i * 2.5).map((x) => <Bx key={`bp${x}`} p={[x, 1.3, -5.3]} s={[0.2, 2.6, 0.2]} c="#D8CCB0" />)}
      <Bx p={[0, 0.9, -7.5]} s={[16, 1.8, 0.2]} c="#B9AE98" />
      <Bx p={[0, 1.83, -7.5]} s={[16, 0.06, 0.26]} c="#8E8676" />
      <Tree p={[-3, 0, -9]} s={0.9} />
      <Tree p={[3.5, 0, -9.5]} />
    </group>
    {children}
  </group>
  </>
);
