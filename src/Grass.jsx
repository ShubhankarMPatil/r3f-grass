import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useLoader } from "@react-three/fiber";
import { getVertexSource, fragmentSource } from "./shaders";

// Textures
import bladeDiffuse from "./resources/blade_diffuse.jpg";
import bladeAlpha from "./resources/blade_alpha.jpg";

const defaultBladeOptions = {
  width: 0.12,
  height: 1,
  joints: 5,
};

export default function Grass({
  bladeOptions = defaultBladeOptions,
  width = 100,
  // default lowered for debugging — raise this once you confirm blades render
  instances = 500000,
}) {
  const materialRef = useRef();
  const groundRef = useRef();
  const [texture, alphaMap] = useLoader(THREE.TextureLoader, [
    bladeDiffuse,
    bladeAlpha,
  ]);

  const attributeData = useMemo(
    () => getAttributeData(instances, width),
    [instances, width]
  );

  // base geometry for one blade (BufferGeometry)
  const baseGeometry = useMemo(() => {
    // PlaneGeometry returns a BufferGeometry in modern three.js
    const geo = new THREE.PlaneGeometry(
      bladeOptions.width,
      bladeOptions.height,
      1,
      bladeOptions.joints
    );
    // move origin to root
    geo.translate(0, bladeOptions.height / 2, 0);
    return geo;
  }, [bladeOptions]);

  // flat ground
  const groundGeo = useMemo(() => {
    const groundGeometry = new THREE.PlaneGeometry(width, width, 32, 32);
    groundGeometry.rotateX(-Math.PI / 2);
    groundGeometry.computeVertexNormals();
    return groundGeometry;
  }, [width]);

  // animate time uniform
  useFrame((state) => {
    if (materialRef.current?.uniforms?.time) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime / 4;
    }
  });

  return (
    <group>
      {/* Instanced mesh: easier and automatically sets instanceCount */}
      <instancedMesh
        // args: [geometry, material, instanceCount] — material undefined here because we provide it as a child
        args={[baseGeometry, undefined, instances]}
      >
        {/* raw shader material built from your shader sources */}
        <rawShaderMaterial
          ref={materialRef}
          attach="material"
          args={[
            {
              uniforms: {
                map: { value: texture },
                alphaMap: { value: alphaMap },
                time: { type: "float", value: 0 },
              },
              vertexShader: getVertexSource(bladeOptions.height),
              fragmentShader: fragmentSource,
              side: THREE.DoubleSide,
              transparent: true, // important because shader discards fragments via alpha
            },
          ]}
        />

        {/* Per-instance attributes — these are attached to the instancedMesh.geometry */}
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

      </instancedMesh>

      {/* ground */}
      <mesh position={[0, 0, 0]} geometry={groundGeo} ref={groundRef}>
        <meshStandardMaterial attach="material" color="#000f00" />
      </mesh>
    </group>
  );
}

/* -------------------
   helper functions
   (unchanged logic from your original)
   ------------------- */

function getAttributeData(instances, width) {
  const offsets = [];
  const orientations = [];
  const stretches = [];
  const halfRootAngleSin = [];
  const halfRootAngleCos = [];

  let quaternion_0 = new THREE.Vector4();
  let quaternion_1 = new THREE.Vector4();

  const min = -0.25;
  const max = 0.25;

  for (let i = 0; i < instances; i++) {
    const offsetX = Math.random() * width - width / 2;
    const offsetZ = Math.random() * width - width / 2;
    const offsetY = getYPosition(offsetX, offsetZ);
    offsets.push(offsetX, offsetY, offsetZ);

    let angle = Math.PI - Math.random() * (2 * Math.PI);
    halfRootAngleSin.push(Math.sin(0.5 * angle));
    halfRootAngleCos.push(Math.cos(0.5 * angle));

    let RotationAxis = new THREE.Vector3(0, 1, 0);
    let x = RotationAxis.x * Math.sin(angle / 2.0);
    let y = RotationAxis.y * Math.sin(angle / 2.0);
    let z = RotationAxis.z * Math.sin(angle / 2.0);
    let w = Math.cos(angle / 2.0);
    quaternion_0.set(x, y, z, w).normalize();

    angle = Math.random() * (max - min) + min;
    RotationAxis = new THREE.Vector3(1, 0, 0);
    x = RotationAxis.x * Math.sin(angle / 2.0);
    y = RotationAxis.y * Math.sin(angle / 2.0);
    z = RotationAxis.z * Math.sin(angle / 2.0);
    w = Math.cos(angle / 2.0);
    quaternion_1.set(x, y, z, w).normalize();

    quaternion_0 = multiplyQuaternions(quaternion_0, quaternion_1);

    angle = Math.random() * (max - min) + min;
    RotationAxis = new THREE.Vector3(0, 0, 1);
    x = RotationAxis.x * Math.sin(angle / 2.0);
    y = RotationAxis.y * Math.sin(angle / 2.0);
    z = RotationAxis.z * Math.sin(angle / 2.0);
    w = Math.cos(angle / 2.0);
    quaternion_1.set(x, y, z, w).normalize();

    quaternion_0 = multiplyQuaternions(quaternion_0, quaternion_1);

    orientations.push(
      quaternion_0.x,
      quaternion_0.y,
      quaternion_0.z,
      quaternion_0.w
    );

    if (i < instances / 3) {
      stretches.push(Math.random() * 1.8);
    } else {
      stretches.push(Math.random());
    }
  }

  return {
    offsets,
    orientations,
    stretches,
    halfRootAngleCos,
    halfRootAngleSin,
  };
}

function multiplyQuaternions(q1, q2) {
  const x = q1.x * q2.w + q1.y * q2.z - q1.z * q2.y + q1.w * q2.x;
  const y = -q1.x * q2.z + q1.y * q2.w + q1.z * q2.x + q1.w * q2.y;
  const z = q1.x * q2.y - q1.y * q2.x + q1.z * q2.w + q1.w * q2.z;
  const w = -q1.x * q2.x - q1.y * q2.y - q1.z * q2.z + q1.w * q2.w;
  return new THREE.Vector4(x, y, z, w);
}

function getYPosition(x, z) {
  // flat
  return 0;
}
