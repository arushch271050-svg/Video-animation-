import React from "react";
import { useCurrentFrame } from "remotion";
import { Bx, Cy, Glow, Pl, Sp, rnd, type V3 } from "../kit/three";

/** EP6: the old warehouse at early evening (rural edge of town).
 *  Plan (metres): ground y=0. Warehouse front wall at z=-3.2 (faces +z), 11 m wide, 4.6 m tall, corrugated.
 *  Big sliding door centred at x=0 (3 m wide), half open: a black gap. Industrial lamp above the door at LAMP.
 *  The meeting spot is under the lamp (STR_W / TON_W). Ton walks in from the +z side (road at z≈7).
 *  Ton's father waits on his motorbike at BIKE, far but in sight. */
export const LAMP: V3 = [0.4, 3.55, -2.85];
export const BIKE: V3 = [-4.6, 0, 7.4];

const Corrugated: React.FC<{ p: V3; w: number; h: number; c: string; ry?: number }> = ({ p, w, h, c, ry = 0 }) => (
  <group position={p} rotation={[0, ry, 0]}>
    <Bx p={[0, h / 2, 0]} s={[w, h, 0.12]} c={c} />
    {Array.from({ length: Math.floor(w / 0.25) }, (_, i) => <Bx key={i} p={[-w / 2 + 0.12 + i * 0.25, h / 2, 0.07]} s={[0.05, h, 0.03]} c={i % 2 ? "#5C5F63" : "#666A6E"} />)}
  </group>
);

/** small motorbike, faces +x at ry=0 (1.8 m long) */
export const Motorbike: React.FC<{ p: V3; ry?: number }> = ({ p, ry = 0 }) => (
  <group position={p} rotation={[0, ry, 0]}>
    {[0.62, -0.62].map((x) => (
      <group key={x} position={[x, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh><torusGeometry args={[0.24, 0.06, 10, 24]} /><meshStandardMaterial color="#141416" roughness={0.9} /></mesh>
        <Cy r={0.08} h={0.06} c="#9A9EA4" />
      </group>
    ))}
    <Bx p={[0.0, 0.55, 0]} s={[0.9, 0.22, 0.22]} c="#9B2B2B" r={0.4} />
    <Bx p={[-0.3, 0.72, 0]} s={[0.62, 0.08, 0.26]} c="#1A1A1C" />
    <Bx p={[0.5, 0.75, 0]} s={[0.12, 0.45, 0.16]} c="#9B2B2B" rz={-0.35} />
    <Cy p={[0.62, 0.98, 0]} r={0.018} h={0.62} c="#2A2C30" rx={Math.PI / 2} />
    <Sp p={[0.7, 0.9, 0]} r={0.06} c="#F4F0E0" e="#F4F0E0" ei={0.4} />
    <Bx p={[0.35, 0.32, 0]} s={[0.5, 0.06, 0.08]} c="#3A3C40" />
  </group>
);

export const Warehouse: React.FC<{ children?: React.ReactNode; dark?: number }> = ({ children, dark = 0 }) => {
  const f = useCurrentFrame();
  const buzz = 1 + Math.sin(f * 2.3) * 0.04 + (f % 131 < 2 ? -0.35 : 0);
  return (
    <>
      <color attach="background" args={["#2B3B5E"]} />
      <fog attach="fog" args={["#2B3B5E", 9, 30]} />
      <group>
        {/* blue evening fill + a little last light from the west */}
        <hemisphereLight args={["#6F86B8", "#1A1814", 0.75 - dark * 0.3]} />
        <ambientLight intensity={0.25} color="#8FA4D0" />
        <directionalLight position={[-8, 3, 6]} intensity={0.55 - dark * 0.3} color="#E7A27A" />
        {/* the industrial lamp: warm sodium cone over the door */}
        <group position={LAMP}>
          <Cy p={[0, 0.12, 0]} r={0.03} r2={0.32} h={0.22} c="#3A3D42" />
          <Sp p={[0, 0.0, 0]} r={0.09} c="#FFE2A8" e="#FFE2A8" ei={2.4 * buzz} />
          <Bx p={[0, 0.28, -0.25]} s={[0.04, 0.04, 0.55]} c="#3A3D42" />
          <Glow p={[0, -0.05, 0.05]} s={1.6} c="#FFC274" o={0.55 * buzz} />
        </group>
        <pointLight position={[LAMP[0], LAMP[1] - 0.4, LAMP[2] + 1.2]} intensity={3.2 * buzz} distance={7.5} decay={1.4} color="#FFC27A" />
        <pointLight position={[LAMP[0], LAMP[1] - 0.3, LAMP[2] + 0.6]} intensity={0.8 * buzz} distance={5} color="#FFC27A" />
        {/* ground: cracked concrete apron, then dirt + weeds */}
        <Bx p={[0, -0.05, 0.5]} s={[16, 0.1, 8]} c="#55575A" />
        <Bx p={[0, -0.06, 9]} s={[30, 0.1, 10]} c="#4A4234" />
        {Array.from({ length: 10 }, (_, i) => <Bx key={i} p={[-6 + rnd(i) * 12, 0.005, -2 + rnd(i + 9) * 7]} s={[0.02, 0.003, 0.6 + rnd(i + 3)]} c="#3E4043" ry={rnd(i + 5) * 3} />)}
        {Array.from({ length: 22 }, (_, i) => <Cy key={`w${i}`} p={[-9 + rnd(i + 40) * 18, 0.12, 4.6 + rnd(i + 70) * 5]} r={0.05} r2={0.0} h={0.25 + rnd(i) * 0.2} c="#3C4A2E" />)}
        {/* the warehouse */}
        <Corrugated p={[0, 0, -3.2]} w={11} h={4.6} c="#6A6D70" />
        <Bx p={[0, 4.75, -3.6]} s={[11.4, 0.3, 1.2]} c="#4E5155" rx={-0.12} />
        <Corrugated p={[-5.5, 0, -6.2]} w={6} h={4.6} c="#5E6164" ry={Math.PI / 2} />
        {/* door opening (dark) + the half-open sliding leaf */}
        <Bx p={[0, 1.6, -3.12]} s={[3.0, 3.2, 0.04]} c="#07080A" />
        <Corrugated p={[1.55, 0, -3.02]} w={1.6} h={3.25} c="#7A7468" />
        <Bx p={[0, 3.3, -3.0]} s={[3.6, 0.08, 0.08]} c="#3A3D42" />
        {/* rust streaks + a faded painted number */}
        {[-4.2, -2.6, 3.4, 4.8].map((x, i) => <Pl key={x} p={[x, 2.8, -3.06]} s={[0.25, 1.6 + i * 0.2]} c="#7A5236" o={0.55} />)}
        <Pl p={[-3.4, 3.6, -3.05]} s={[1.0, 0.7]} c="#C9C2B0" o={0.35} />
        {/* barrels, pallets, a crate */}
        {[[-2.2, -2.6, "#2F5A7A"], [-2.75, -2.45, "#7A3A2E"], [-2.45, -1.95, "#2F5A7A"]].map(([x, z, c], i) => (
          <group key={i} position={[x as number, 0, z as number]}>
            <Cy p={[0, 0.45, 0]} r={0.29} h={0.9} c={c as string} />
            <Cy p={[0, 0.3, 0]} r={0.295} h={0.03} c="#1E1E20" />
            <Cy p={[0, 0.65, 0]} r={0.295} h={0.03} c="#1E1E20" />
          </group>
        ))}
        {[0, 1, 2].map((i) => <Bx key={i} p={[3.0, 0.07 + i * 0.14, -2.4]} s={[1.2, 0.1, 1.0]} c={i % 2 ? "#8A6E4A" : "#7A603E"} ry={i * 0.05} />)}
        <Bx p={[3.8, 0.4, -1.6]} s={[0.8, 0.8, 0.8]} c="#6E5A3E" ry={0.3} />
        {/* chain-link fence on the left + posts */}
        {[-7, -5.4, -3.8].map((x) => <Cy key={x} p={[x, 1.0, 2.5]} r={0.04} h={2.0} c="#5A5E64" />)}
        <Pl p={[-5.4, 1.0, 2.5]} s={[3.2, 1.9]} c="#8A9098" o={0.18} />
        {/* far tree line + power poles against the sky */}
        {Array.from({ length: 12 }, (_, i) => <Sp key={`t${i}`} p={[-14 + i * 2.6, 2.2 + rnd(i + 20) * 1.2, 15 + rnd(i + 30) * 3]} r={1.6 + rnd(i) * 0.8} c="#1C2434" />)}
        {[-10, -3, 4, 11].map((x) => <Cy key={x} p={[x, 3.2, 12]} r={0.07} h={6.4} c="#1A1E28" />)}
        <Bx p={[0.5, 6.2, 12]} s={[22, 0.02, 0.02]} c="#1A1E28" />
        {children}
      </group>
    </>
  );
};

/** EP6: inside Pakin's family car at night (back seat). Pakin sits at the origin facing +z; the window is on his left (+x).
 *  Street lights slide past outside. */
export const CarInterior: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  return (
    <>
      <color attach="background" args={["#05060A"]} />
      <group>
        <ambientLight intensity={0.12} color="#6A7AA8" />
        {/* phone glow on the face */}
        <pointLight position={[0, 0.95, 0.45]} intensity={1.1} distance={1.4} color="#BFD6F2" />
        {/* passing street lamps: warm sweeps through the window */}
        {[0, 1, 2].map((i) => {
          const z = 3 - ((f * 0.09 + i * 2.2) % 6.6);
          return <React.Fragment key={i}><pointLight position={[0.9, 1.4, z]} intensity={1.4} distance={2.2} color="#FFB867" /><Glow p={[1.6, 1.5, z]} s={0.9} c="#FFC27A" o={0.6} /></React.Fragment>;
        })}
        {/* seat back + headrest (cream leather), cabin roof, door panel + window */}
        <Bx p={[0, 0.85, -0.38]} s={[1.4, 0.75, 0.2]} c="#D8CBB2" r={0.6} />
        <Bx p={[0, 0.34, 0.0]} s={[1.4, 0.16, 0.6]} c="#D2C4A9" r={0.6} />
        <Bx p={[0.75, 1.0, 0.1]} s={[0.06, 0.9, 1.6]} c="#1C1E24" />
        <Bx p={[0.78, 1.32, 0.15]} s={[0.02, 0.42, 1.2]} c="#0E1520" e="#1A2A44" ei={0.3} o={0.6} />
        <Bx p={[0, 1.62, 0.1]} s={[1.6, 0.04, 1.8]} c="#16181C" />
        {/* front seats in front of him */}
        {[-0.38, 0.38].map((x) => <Bx key={x} p={[x, 0.95, 0.95]} s={[0.5, 0.85, 0.18]} c="#CDBFA4" r={0.6} />)}
        {children}
      </group>
    </>
  );
};
