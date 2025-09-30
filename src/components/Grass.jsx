import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useLoader } from "@react-three/fiber";

import { grassConfig } from "../config/grassConfig";

// Geometry & utils
import { createBaseGeometry } from "./GrassGeometry";
import { createGround } from "./GrassGeometry";
import { getAttributeData } from "./GrassUtils";

// Shaders
import { getVertexSource, fragmentSource } from "../shaders/shaders";

// Textures
import bladeDiffuse from "../resources/blade_diffuse.jpg";
import bladeAlpha from "../resources/blade_alpha.jpg";


export default function Grass() {
  const { blade, field, ground } = grassConfig;
  const materialRef = useRef();
  const groundRef = useRef();
  const gustRef = useRef({ strength: 0, direction: 1, decay: 0 });

  const [texture, alphaMap] = useLoader(THREE.TextureLoader, [
    bladeDiffuse,
    bladeAlpha,
  ]);

  const attributeData = useMemo(
    () => getAttributeData(field.instances, field.width, () => 0),
    [field.instances, field.width]
  );

  const baseGeometry = useMemo(() => createBaseGeometry(blade), [blade]);

  const groundGeo = useMemo(
    () => createGround(ground.width, () => 0),
    [ground.width]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime / 4;
      // decay gust using a shaped envelope for wave-like feel
      if (gustRef.current.tActive) {
        const t = state.clock.elapsedTime - gustRef.current.tStart;
        const T = gustRef.current.durationSec;
        const phase = Math.min(1, Math.max(0, t / T));
        // smoothstep in/out multiplied by a low-frequency sine for wave shape
        const smooth = phase * phase * (3.0 - 2.0 * phase);
        const wave = 0.5 + 0.5 * Math.sin(phase * Math.PI * 2.0);
        const env = smooth * wave;
        materialRef.current.uniforms.gustStrength.value = gustRef.current.peak * env;
        materialRef.current.uniforms.gustDirection.value = gustRef.current.direction;
        if (phase >= 1) {
          gustRef.current.tActive = false;
          materialRef.current.uniforms.gustStrength.value = 0;
        }
      }
    }
  });

  // Listen for gust events from UI transitions
  React.useEffect(() => {
    function onGust(e) {
      const detail = e.detail || {};
      const peak = Math.max(0, Math.min(1, detail.strength ?? 0.8));
      const direction = detail.direction >= 0 ? 1 : -1;
      const durationSec = Math.max(0.5, detail.durationSec ?? 2.0);
      gustRef.current.peak = peak;
      gustRef.current.direction = direction;
      gustRef.current.durationSec = durationSec;
      gustRef.current.tStart = performance.now() / 1000;
      gustRef.current.tActive = true;
    }
    window.addEventListener("gust", onGust);
    return () => window.removeEventListener("gust", onGust);
  }, []);

  return (
    <group>
      {/* Grass field */}
      <instancedMesh args={[baseGeometry, null, field.instances]}>
        <instancedBufferAttribute
          attach="geometry-attributes-offset"
          args={[new Float32Array(attributeData.offsets), 3]}
        />
        <instancedBufferAttribute
          attach="geometry-attributes-orientation"
          args={[new Float32Array(attributeData.orientations), 4]}
        />
        <instancedBufferAttribute
          attach="geometry-attributes-stretch"
          args={[new Float32Array(attributeData.stretches), 1]}
        />
        <instancedBufferAttribute
          attach="geometry-attributes-halfRootAngleSin"
          args={[new Float32Array(attributeData.halfRootAngleSin), 1]}
        />
        <instancedBufferAttribute
          attach="geometry-attributes-halfRootAngleCos"
          args={[new Float32Array(attributeData.halfRootAngleCos), 1]}
        />

        <rawShaderMaterial
          ref={materialRef}
          args={[{
            uniforms: {
              map: { value: texture },
              alphaMap: { value: alphaMap },
              time: { type: "float", value: 0 },
              gustStrength: { type: "float", value: 0 },
              gustDirection: { type: "float", value: 1 },
            },
            vertexShader: getVertexSource(blade.height),
            fragmentShader: fragmentSource,
            side: THREE.DoubleSide,
          }]}
        />
      </instancedMesh>

      {/* Configurable ground */}
      <mesh
        geometry={groundGeo}
        ref={groundRef}
      >
        <meshStandardMaterial color={ground.color} />
      </mesh>

    </group>
  );
}
