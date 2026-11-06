import React from "react";
import { Cam, Shot } from "./kit/three";
import { Char } from "./rig/char";
import { DAD } from "./rig/cast";
import { Stall } from "./sets/stall";

/** EP6: stills used as "surveillance photos" inside the stranger's folder (rendered once into public/). */
export const PhotoShot: React.FC<{ which: "front" | "counter" | "back" }> = ({ which }) => (
  <Shot tilt={false}>
    <Stall day={which !== "back"}>
      <Char L={DAD} p={[-0.45, 0, -0.65]} ry={0} pose={{ shR: [-0.9, 0, -0.1], elR: -1.0, head: [0.3, 0, 0], blink: 0 }} seed={2} />
    </Stall>
    {which === "front" ? <Cam p={[-0.6, 1.6, 6.2]} t={[0, 1.2, 0]} fov={34} drift={0} />
      : which === "counter" ? <Cam p={[3.4, 1.75, 4.6]} t={[0.1, 1.0, -0.2]} fov={30} drift={0} />
      : <Cam p={[3.1, 2.9, -2.05]} t={[-0.3, 0.8, 0.5]} fov={62} drift={0} />}
  </Shot>
);
