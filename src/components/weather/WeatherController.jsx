// WeatherController.jsx
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import RainSystem from "./RainSystem";
import SnowSystem from "./SnowSystem";
import CloudSystem from "./CloudSystem";
import SunnySky from "./SunnySky"; 
import * as THREE from "three";


export default function WeatherController({ weather }) {
  const { scene } = useThree();

  useEffect(() => {
    switch (weather) {
      case "rain":
        scene.fog = new THREE.FogExp2(0x334455, 0.02); // bluish fog
        break;
      case "snow":
        scene.fog = new THREE.FogExp2(0xffffff, 0.008); // bright white
        break;
      case "clouds":
        scene.fog = new THREE.FogExp2(0x888888, 0.015); // gray fog
        break;
      default: // sunny
        scene.fog = null;
    }
  }, [weather, scene]);

  return (
    <>
      {weather === "rain" && <RainSystem />}
      {weather === "snow" && <SnowSystem />}
      {weather === "clouds" && <CloudSystem />}
      {weather === "sunny" && <SunnySky />}
    </>
  );
}