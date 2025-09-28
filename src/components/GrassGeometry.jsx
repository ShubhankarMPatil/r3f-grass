// components/GrassGeometry.jsx
import * as THREE from "three";
import { getAttributeData } from "./GrassUtils";

/**
 * Create the base blade geometry (modern three.js)
 * Returns a BufferGeometry (PlaneGeometry produces a BufferGeometry in r125+)
 */
export function createBaseGeometry(bladeOptions) {
  const geo = new THREE.PlaneGeometry(
    bladeOptions.width,
    bladeOptions.height,
    1,
    bladeOptions.joints
  );
  // move origin to the root of the blade
  geo.translate(0, bladeOptions.height / 2, 0);
  return geo;
}

/**
 * Create the ground geometry. Uses BufferGeometry attributes instead of .vertices
 * getYPosition is a function (x,z) => y. If not provided, ground stays flat.
 */
export function createGround(width, getYPosition) {
  const groundGeometry = new THREE.PlaneGeometry(width, width, 32, 32);
  groundGeometry.rotateX(-Math.PI / 2);

  const positions = groundGeometry.attributes.position;
  if (positions) {
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const y = typeof getYPosition === "function" ? getYPosition(x, z) : 0;
      positions.setY(i, y);
    }
    positions.needsUpdate = true;
  }

  groundGeometry.computeVertexNormals();
  return groundGeometry;
}

/**
 * Build attribute arrays for instancing (thin wrapper)
 */
export function buildAttributeData(instances, width, getYPosition) {
  return getAttributeData(instances, width, getYPosition);
}
