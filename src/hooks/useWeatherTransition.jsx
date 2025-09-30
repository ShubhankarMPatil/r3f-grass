import { useState, useEffect, useRef } from 'react';
import { weatherConfig, interpolateWeatherStates, transitionConfig } from '../config/weatherConfig';

export function useWeatherTransition() {
  const [currentWeatherState, setCurrentWeatherState] = useState(weatherConfig.sunny);
  const [targetWeather, setTargetWeather] = useState('sunny');
  const animationRef = useRef();
  const lastUpdateTime = useRef(Date.now());

  // Smooth interpolation function
  const smoothStep = (t) => t * t * (3 - 2 * t);

  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateTime.current) / 1000;
      lastUpdateTime.current = now;

      const targetState = weatherConfig[targetWeather];
      
      // Calculate interpolation factor based on transition speed
      const lerpFactor = Math.min(1, deltaTime * transitionConfig.speed);
      
      setCurrentWeatherState(prevState => {
        // Check if we're close enough to the target to stop animating
        const ambient = prevState.ambient + (targetState.ambient - prevState.ambient) * lerpFactor;
        const pointLight = prevState.pointLight + (targetState.pointLight - prevState.pointLight) * lerpFactor;
        
        const isCloseEnough = 
          Math.abs(ambient - targetState.ambient) < 0.01 &&
          Math.abs(pointLight - targetState.pointLight) < 0.01;

        if (isCloseEnough) {
          return targetState;
        }

        // Interpolate between current and target state
        return interpolateWeatherStates(prevState, targetState, lerpFactor);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetWeather]);

  return {
    currentWeatherState,
    setTargetWeather,
  };
}

// Hook for scroll-based weather transitions
export function useScrollWeatherTransition() {
  const { currentWeatherState, setTargetWeather } = useWeatherTransition();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      
      setScrollProgress(progress);

      // Determine target weather based on scroll progress
      let targetWeather;
      if (progress < 0.25) {
        targetWeather = 'sunny';
      } else if (progress < 0.5) {
        targetWeather = 'clouds';
      } else if (progress < 0.75) {
        targetWeather = 'rain';
      } else {
        targetWeather = 'snow';
      }

      setTargetWeather(targetWeather);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [setTargetWeather]);

  return {
    currentWeatherState,
    scrollProgress,
  };
}