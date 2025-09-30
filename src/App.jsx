import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky, Stats, Html } from "@react-three/drei";

import Grass from "./components/Grass";
import { cameraConfig } from "./config/cameraConfig";
import WeatherController from "./components/weather/WeatherController";
import { useScrollWeatherTransition } from "./hooks/useWeatherTransition";

export default function App() {
  const { currentWeatherState, scrollProgress } = useScrollWeatherTransition();
  const [manualWeather, setManualWeather] = useState(null);

  return (
    <>
      <Canvas
        dpr={1}
        camera={{ position: cameraConfig.position, fov: cameraConfig.fov }}
        style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh" }}
      >
        {/* Fog will be managed by SmoothEnv */}
        <fog attach="fog" {...currentWeatherState.fog} />

        {/* Ensure camera frames the scene like before (look at y=25) */}
        <CameraLookAt />

        {/* Sky with interpolated parameters */}
        <Sky
          distance={450000}
          sunPosition={currentWeatherState.skyConfig.sunPosition}
          inclination={currentWeatherState.skyConfig.inclination}
          azimuth={currentWeatherState.skyConfig.azimuth}
          mieCoefficient={currentWeatherState.skyConfig.mieCoefficient}
          mieDirectionalG={currentWeatherState.skyConfig.mieDirectionalG}
          rayleigh={currentWeatherState.skyConfig.rayleigh}
          turbidity={currentWeatherState.skyConfig.turbidity}
        />

        {/* Lights with current weather state */}
        <ambientLight intensity={currentWeatherState.ambient} />
        <pointLight position={[10, 10, 10]} intensity={currentWeatherState.pointLight} />

        <Suspense fallback={null}>
          <Grass />
          <WeatherController weatherState={currentWeatherState} />
        </Suspense>

        {/* Debug UI with scroll progress */}
        <Html fullscreen>
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              background: "rgba(0,0,0,0.5)",
              padding: "8px",
              borderRadius: "4px",
              color: "white",
              fontSize: "12px",
              fontFamily: "monospace",
            }}
          >
            <div>Scroll Progress: {(scrollProgress * 100).toFixed(1)}%</div>
            <div>Ambient: {currentWeatherState.ambient.toFixed(2)}</div>
            <div>Point Light: {currentWeatherState.pointLight.toFixed(2)}</div>
            <div>Cloud Density: {currentWeatherState.cloudDensity.toFixed(2)}</div>
            <div>Rain: {currentWeatherState.rainIntensity.toFixed(2)}</div>
            <div>Snow: {currentWeatherState.snowIntensity.toFixed(2)}</div>
          </div>
        </Html>

        <Stats />
      </Canvas>

      {/* Invisible scroll area to drive weather changes */}
      <div style={{ height: "400vh" }} />
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
