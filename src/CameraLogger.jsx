// src/CameraLogger.jsx
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { OrbitControls } from "@react-three/drei";

export default function CameraLogger({ logInterval = 1000 }) {
  const { camera, gl } = useThree();
  const controls = useRef();
  const lastLog = useRef(0);

  useFrame(({ clock }) => {
    const now = clock.getElapsedTime() * 1000;
    if (now - lastLog.current > logInterval && controls.current) {
      console.log("Camera Position:", camera.position.toArray());
      console.log("Camera Target:", controls.current.target.toArray());
      lastLog.current = now;
    }
  });

  return <OrbitControls ref={controls} />;
}
