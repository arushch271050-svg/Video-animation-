import React from "react";
import { Bx, Cy, Sp, type V3 } from "../kit/three";

/** EP5: black luxury sedan, built from boxes. Origin = ground under the car centre; it faces +x at ry=0 (length along x).
 *  Length 4.6 m, width 1.8 m. Doors are not separate: characters "step out" beside the rear door at REAR_DOOR. */
const PAINT = "#1C2028", GLASS = "#1E2A38", CHROME = "#C9CED6";
export const REAR_DOOR_OFF: V3 = [-0.6, 0, 1.25];   // in car-local coords, kerb side (+z)
export const Sedan: React.FC<{ p: V3; ry?: number; spin?: number }> = ({ p, ry = 0, spin = 0 }) => (
  <group position={p} rotation={[0, ry, 0]}>
    {/* body + bonnet + boot */}
    <mesh position={[0, 0.58, 0]}><boxGeometry args={[4.6, 0.62, 1.8]} /><meshStandardMaterial color={PAINT} metalness={0.6} roughness={0.25} /></mesh>
    <mesh position={[-0.25, 1.12, 0]}><boxGeometry args={[2.5, 0.5, 1.62]} /><meshStandardMaterial color={PAINT} metalness={0.6} roughness={0.25} /></mesh>
    {/* windows */}
    <Bx p={[-0.25, 1.13, 0.815]} s={[2.3, 0.38, 0.01]} c={GLASS} e="#3A4A60" ei={0.15} r={0.1} />
    <Bx p={[-0.25, 1.13, -0.815]} s={[2.3, 0.38, 0.01]} c={GLASS} e="#3A4A60" ei={0.15} r={0.1} />
    <Bx p={[1.01, 1.12, 0]} s={[0.01, 0.4, 1.5]} c={GLASS} e="#3A4A60" ei={0.15} r={0.1} />
    <Bx p={[-1.51, 1.12, 0]} s={[0.01, 0.4, 1.5]} c={GLASS} e="#3A4A60" ei={0.15} r={0.1} />
    {/* door lines + chrome strip */}
    <Bx p={[-0.25, 0.86, 0.903]} s={[2.6, 0.025, 0.01]} c={CHROME} r={0.2} />
    <Bx p={[-0.25, 0.86, -0.903]} s={[2.6, 0.025, 0.01]} c={CHROME} r={0.2} />
    {[-0.25].map((x) => <Bx key={x} p={[x, 0.6, 0.904]} s={[0.012, 0.55, 0.01]} c="#05060A" />)}
    {/* grille + lights */}
    <Bx p={[2.305, 0.62, 0]} s={[0.02, 0.24, 0.8]} c={CHROME} r={0.2} />
    {[-0.62, 0.62].map((z) => <Bx key={z} p={[2.3, 0.72, z]} s={[0.03, 0.1, 0.3]} c="#F4F8FF" e="#F4F8FF" ei={0.8} />)}
    {[-0.65, 0.65].map((z) => <Bx key={`t${z}`} p={[-2.305, 0.75, z]} s={[0.02, 0.1, 0.32]} c="#B8202A" e="#B8202A" ei={0.6} />)}
    {/* wheels */}
    {[[1.45, 0.86], [1.45, -0.86], [-1.45, 0.86], [-1.45, -0.86]].map(([x, z], i) => (
      <group key={i} position={[x, 0.34, z]} rotation={[Math.PI / 2, 0, 0]}>
        <group rotation={[0, spin, 0]}>
          <Cy r={0.34} h={0.24} c="#111214" />
          <Cy p={[0, z > 0 ? 0.121 : -0.121, 0]} r={0.2} h={0.01} c={CHROME} />
          <Bx p={[0, z > 0 ? 0.125 : -0.125, 0]} s={[0.3, 0.005, 0.04]} c="#7A7E86" />
        </group>
      </group>
    ))}
    {/* emblem */}
    <Sp p={[2.32, 0.75, 0]} r={0.03} c={CHROME} />
  </group>
);
