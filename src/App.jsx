import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky, Stats, Html } from "@react-three/drei";

import Grass from "./components/Grass";
import { cameraConfig } from "./config/cameraConfig";
import WeatherController from "./components/weather/WeatherController";
import { weatherConfig } from "./config/weatherConfig";

export default function App() {
  const [weather, setWeather] = useState("sunny");

  const cfg = weatherConfig[weather];

  return (
    <Canvas
      dpr={1}
      camera={{ position: cameraConfig.position, fov: cameraConfig.fov }}
    >
      {/* Fog based on weather */}
      <fog attach="fog" {...cfg.fog} />

      {/* Sky */}
      <Sky />
      <ambientLight intensity={cfg.ambient} />
      <pointLight position={[10, 10, 10]} />

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
      <OrbitControls target={[0, 25, 0]} />
    </Canvas>
  );
}
