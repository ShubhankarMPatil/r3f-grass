import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky, Stats } from "@react-three/drei";

import Grass from "./Grass.jsx"

export default function App() {
  return (
    <Canvas dpr={1} camera={{ position: [15, 15, 30] }}>
      <Sky />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Suspense fallback={null}>
        <Grass />
      </Suspense>
      <Stats />
      <OrbitControls />
    </Canvas>
  )
}
