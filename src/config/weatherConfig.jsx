import * as THREE from "three";

export const weatherConfig = {
  sunny: {
    ambient: 1.0,
    fog: { color: new THREE.Color("#cce0ff"), near: 50, far: 500 },
  },
  rain: {
    ambient: 0.3,
    fog: { color: new THREE.Color("#555566"), near: 20, far: 200 },
  },
  snow: {
    ambient: 0.8,
    fog: { color: new THREE.Color("#eeeeff"), near: 30, far: 300 },
  },
  clouds: {
    ambient: 0.6,
    fog: { color: new THREE.Color("#aaaaaa"), near: 40, far: 400 },
  },
};
