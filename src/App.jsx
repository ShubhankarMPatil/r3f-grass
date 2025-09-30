import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky, Stats, Html } from "@react-three/drei";

import Grass from "./components/Grass";
import { cameraConfig } from "./config/cameraConfig";
import WeatherController from "./components/weather/WeatherController";
import { weatherConfig } from "./config/weatherConfig";
import HorizontalSeasons from "./components/HorizontalSeasons";

export default function App() {
  const [weather, setWeather] = useState("sunny");
  const cfg = weatherConfig[weather];
  const handleSectionChange = useCallback((id) => {
    // ids: sunny, clouds, rain, snow
    setWeather(id);
  }, []);

  return (
    <>
      <Canvas
        dpr={1}
        camera={{ position: cameraConfig.position, fov: cameraConfig.fov }}
        style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh" }}
      >
        {/* Initialize fog near target, then smoothly interpolate */}
        <fog attach="fog" {...cfg.fog} />

        {/* Ensure camera frames the scene like before (look at y=25) */}
        <CameraLookAt />

        {/* Sky */}
        <Sky />

        {/* Smoothly interpolate lights and fog towards current weather */}
        <SmoothEnv target={cfg} />

        <Suspense fallback={null}>
          <Grass />
          <WeatherController weather={weather} />
        </Suspense>

        {/* Debug selector UI */}
        <Html fullscreen>
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              background: "rgba(0,0,0,0.5)",
              padding: "8px",
              borderRadius: "4px",
            }}
          >
            <label style={{ color: "white", marginRight: "6px" }}>Weather:</label>
            <select value={weather} onChange={(e) => setWeather(e.target.value)}>
              <option value="sunny">Sunny</option>
              <option value="rain">Rain</option>
              <option value="snow">Snow</option>
              <option value="clouds">Clouds</option>
            </select>
          </div>
        </Html>

        <Stats />
      </Canvas>

      {/* Horizontal season scroller overlay */}
      <HorizontalSeasons onSectionChange={handleSectionChange} />
    </>
  );
}

function CameraLookAt() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, 25, 0);
  }, [camera]);
  return null;
}

function SmoothEnv({ target }) {
  const ambientRef = useRef();
  const pointRef = useRef();
  const { scene } = useThree();
  useFrame((_, delta) => {
    const kFast = Math.min(1, delta * 3);
    const kFog = Math.min(1, delta * 2);
    if (ambientRef.current) {
      ambientRef.current.intensity += (target.ambient - ambientRef.current.intensity) * kFast;
    }
    if (pointRef.current) {
      pointRef.current.intensity += (target.pointLight - pointRef.current.intensity) * kFast;
    }
    if (scene.fog) {
      scene.fog.color.lerp(target.fog.color, kFog);
      scene.fog.near += (target.fog.near - scene.fog.near) * kFog;
      scene.fog.far += (target.fog.far - scene.fog.far) * kFog;
    }
  });
  return (
    <>
      <ambientLight ref={ambientRef} intensity={target.ambient} />
      <pointLight ref={pointRef} position={[10, 10, 10]} intensity={target.pointLight} />
    </>
  );
}