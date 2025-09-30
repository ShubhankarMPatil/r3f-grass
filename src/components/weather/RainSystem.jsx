import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export default function RainSystem({ intensity = 1.0, count = 10000 }) {
  const rainRef = useRef();

  // Initial random positions
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 200; // x
      arr[i * 3 + 1] = Math.random() * 100;         // y
      arr[i * 3 + 2] = (Math.random() - 0.5) * 200; // z
    }
    return arr;
  }, [count]);

  // Each droplet gets a unique speed
  const speeds = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      arr[i] = 50 + Math.random() * 100; // faster fall than snow
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (rainRef.current) {
      const pos = rainRef.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] -= speeds[i] * delta * intensity;
        if (pos[i * 3 + 1] < 0) {
          pos[i * 3 + 1] = 100 + Math.random() * 50;
          pos[i * 3 + 0] = (Math.random() - 0.5) * 200; // reset x
          pos[i * 3 + 2] = (Math.random() - 0.5) * 200; // reset z
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={rainRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#88ccee"
        transparent
        opacity={0.8 * intensity}
      />
    </points>
  );
}
