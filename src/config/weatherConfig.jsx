import * as THREE from "three";

// Transition configuration
export const transitionConfig = {
  speed: 2.0, // How fast transitions happen (higher = faster)
  smoothness: 0.95, // Smoothing factor (0-1, higher = smoother but slower)
};

export const weatherConfig = {
  sunny: {
    ambient: 1.2,
    pointLight: 1.8,
    fog: { color: new THREE.Color("#cce0ff"), near: 50, far: 500 },
    skyConfig: {
      sunPosition: [100, 20, 100],
      inclination: 0.49,
      azimuth: 0.25,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.8,
      rayleigh: 1,
      turbidity: 8,
    },
    cloudDensity: 0,
    rainIntensity: 0,
    snowIntensity: 0,
  },
  rain: {
    ambient: 0.15,
    pointLight: 0.5,
    fog: { color: new THREE.Color("#555566"), near: 20, far: 200 },
    skyConfig: {
      sunPosition: [50, 10, 50],
      inclination: 0.6,
      azimuth: 0.3,
      mieCoefficient: 0.02,
      mieDirectionalG: 0.7,
      rayleigh: 2,
      turbidity: 15,
    },
    cloudDensity: 0.8,
    rainIntensity: 1.0,
    snowIntensity: 0,
  },
  snow: {
    ambient: 0.6,
    pointLight: 1.2,
    fog: { color: new THREE.Color("#eeeeff"), near: 30, far: 300 },
    skyConfig: {
      sunPosition: [30, 5, 30],
      inclination: 0.7,
      azimuth: 0.4,
      mieCoefficient: 0.015,
      mieDirectionalG: 0.6,
      rayleigh: 1.5,
      turbidity: 20,
    },
    cloudDensity: 0.9,
    rainIntensity: 0,
    snowIntensity: 1.0,
  },
  clouds: {
    ambient: 0.35,
    pointLight: 0.8,
    fog: { color: new THREE.Color("#aaaaaa"), near: 40, far: 400 },
    skyConfig: {
      sunPosition: [70, 15, 70],
      inclination: 0.55,
      azimuth: 0.35,
      mieCoefficient: 0.01,
      mieDirectionalG: 0.75,
      rayleigh: 1.2,
      turbidity: 12,
    },
    cloudDensity: 0.6,
    rainIntensity: 0,
    snowIntensity: 0,
  },
};

// Helper function to interpolate between weather states
export function interpolateWeatherStates(state1, state2, factor) {
  const lerp = (a, b, t) => a + (b - a) * t;
  const lerpColor = (color1, color2, t) => {
    const result = new THREE.Color();
    result.lerpColors(color1, color2, t);
    return result;
  };
  const lerpArray = (arr1, arr2, t) => arr1.map((val, i) => lerp(val, arr2[i], t));

  return {
    ambient: lerp(state1.ambient, state2.ambient, factor),
    pointLight: lerp(state1.pointLight, state2.pointLight, factor),
    fog: {
      color: lerpColor(state1.fog.color, state2.fog.color, factor),
      near: lerp(state1.fog.near, state2.fog.near, factor),
      far: lerp(state1.fog.far, state2.fog.far, factor),
    },
    skyConfig: {
      sunPosition: lerpArray(state1.skyConfig.sunPosition, state2.skyConfig.sunPosition, factor),
      inclination: lerp(state1.skyConfig.inclination, state2.skyConfig.inclination, factor),
      azimuth: lerp(state1.skyConfig.azimuth, state2.skyConfig.azimuth, factor),
      mieCoefficient: lerp(state1.skyConfig.mieCoefficient, state2.skyConfig.mieCoefficient, factor),
      mieDirectionalG: lerp(state1.skyConfig.mieDirectionalG, state2.skyConfig.mieDirectionalG, factor),
      rayleigh: lerp(state1.skyConfig.rayleigh, state2.skyConfig.rayleigh, factor),
      turbidity: lerp(state1.skyConfig.turbidity, state2.skyConfig.turbidity, factor),
    },
    cloudDensity: lerp(state1.cloudDensity, state2.cloudDensity, factor),
    rainIntensity: lerp(state1.rainIntensity, state2.rainIntensity, factor),
    snowIntensity: lerp(state1.snowIntensity, state2.snowIntensity, factor),
  };
}
