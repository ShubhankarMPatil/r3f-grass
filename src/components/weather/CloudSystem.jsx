import { Cloud } from "@react-three/drei";
import { useMemo } from "react";

export default function CloudSystem({
  density = 1.0,
  count = 100, // keep this low for performance
  range = [500, 100, 500], // spread of clouds
}) {
  const clouds = useMemo(() => {
    const arr = [];
    const actualCount = Math.floor(count * density);
    for (let i = 0; i < actualCount; i++) {
      arr.push({
        position: [
          (Math.random() - 0.5) * range[0],
          50 + Math.random() * range[1], // higher up
          (Math.random() - 0.5) * range[2],
        ],
        opacity: (0.6 + Math.random() * 0.3) * density,
        speed: 0.1 + Math.random() * 0.2,
        width: 100 + Math.random() * 150, // much larger
        depth: 40 + Math.random() * 60,
        segments: 30,
      });
    }
    return arr;
  }, [count, range, density]);

  return (
    <>
      {clouds.map((c, i) => (
        <Cloud
          key={i}
          opacity={c.opacity}
          speed={c.speed}
          width={c.width}
          depth={c.depth}
          segments={c.segments}
          position={c.position}
        />
      ))}
    </>
  );
}
