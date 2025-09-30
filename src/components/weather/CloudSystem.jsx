import { Cloud } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function CloudSystem({
  density = 1.0,
  weatherType = "clouds", // "clouds", "rain", "snow"
  count = 12, // Much fewer, larger clouds
  range = [800, 150, 800], // Larger spread
}) {
  const cloudRefs = useRef([]);

  // Generate stable cloud positions that don't change
  const cloudData = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        position: [
          (Math.random() - 0.5) * range[0],
          60 + Math.random() * range[1],
          (Math.random() - 0.5) * range[2],
        ],
        baseOpacity: 0.4 + Math.random() * 0.3,
        speed: 0.05 + Math.random() * 0.1, // Slower movement
        width: 200 + Math.random() * 300, // Much larger clouds
        depth: 80 + Math.random() * 120,
        segments: 40,
        id: i,
      });
    }
    return arr;
  }, [count, range]);

  // Calculate cloud appearance based on weather type and density
  const getCloudAppearance = (cloud, weatherType, density) => {
    let color = "#ffffff";
    let opacity = cloud.baseOpacity * density;
    
    switch (weatherType) {
      case "rain":
        color = "#444466"; // Dark rain clouds
        opacity = Math.min(opacity * 1.5, 0.9); // Denser for rain
        break;
      case "snow":
        color = "#e6e6ff"; // Light bluish-white for snow
        opacity = Math.min(opacity * 1.2, 0.8);
        break;
      case "clouds":
      default:
        color = "#ffffff"; // White fluffy clouds
        break;
    }
    
    return { color, opacity };
  };

  // Gentle cloud movement
  useFrame((state) => {
    cloudRefs.current.forEach((cloudRef, index) => {
      if (cloudRef && cloudData[index]) {
        const cloud = cloudData[index];
        const time = state.clock.elapsedTime;
        
        // Gentle floating motion
        cloudRef.position.x = cloud.position[0] + Math.sin(time * cloud.speed + index) * 20;
        cloudRef.position.z = cloud.position[2] + Math.cos(time * cloud.speed * 0.7 + index) * 15;
        cloudRef.position.y = cloud.position[1] + Math.sin(time * cloud.speed * 0.5 + index) * 10;
      }
    });
  });

  return (
    <>
      {cloudData.map((cloud, i) => {
        const appearance = getCloudAppearance(cloud, weatherType, density);
        
        return (
          <Cloud
            key={cloud.id}
            ref={(ref) => (cloudRefs.current[i] = ref)}
            opacity={appearance.opacity}
            speed={cloud.speed}
            width={cloud.width}
            depth={cloud.depth}
            segments={cloud.segments}
            position={cloud.position}
            color={appearance.color}
          />
        );
      })}
    </>
  );
}