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
    }
  });

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
