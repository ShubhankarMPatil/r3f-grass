import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky, Stats } from "@react-three/drei";

import Grass from "./components/Grass";
import { cameraConfig } from "./config/cameraConfig";

export default function App() {
  return (
    <Canvas dpr={1} camera={{ position: cameraConfig.position, fov: cameraConfig.fov }}>
      <Sky />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Suspense fallback={null}>
        <Grass />
      </Suspense>
      <Stats />
      <OrbitControls />
    </Canvas>
  );
}
