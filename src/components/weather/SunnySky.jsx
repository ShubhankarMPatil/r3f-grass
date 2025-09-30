// src/components/weather/SunnySky.jsx
import { Sky } from "@react-three/drei";

export default function SunnySky() {
  return (
    <>
      <Sky
        distance={450000}
        sunPosition={[100, 20, 100]}
        inclination={0.49}
        azimuth={0.25}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
        rayleigh={1}
        turbidity={8}
      />
    </>
  );
}
