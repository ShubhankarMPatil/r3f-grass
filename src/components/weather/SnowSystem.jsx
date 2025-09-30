// src/components/weather/SnowSystem.jsx
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function SnowSystem({ count = 1500 }) {
  const snowRef = useRef();

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 200;
      arr[i * 3 + 1] = Math.random() * 100;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (snowRef.current) {
      const pos = snowRef.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] -= 10 * delta; // slow fall
        pos[i * 3] += Math.sin((pos[i * 3 + 1] + i) * 0.01) * delta; // drift
        if (pos[i * 3 + 1] < 0) pos[i * 3 + 1] = 100;
      }
      snowRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={snowRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.4} color="#ffffff" transparent opacity={0.9} />
    </points>
  );
}