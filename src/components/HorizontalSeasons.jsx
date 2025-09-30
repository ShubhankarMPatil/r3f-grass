import React, { useCallback, useEffect, useRef, useState } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import "./horizontal-seasons.css";

const SECTIONS = ["sunny", "rain", "snow", "clouds"];
const TRIGGER_RATIO = 0.18;
const ACCUMULATOR_RESET_MS = 160;
const LINES_COUNT = 10;

export default function HorizontalSeasons({ onSectionChange = () => {} }) {
  const spacerRef = useRef(null);
  const lenisRef = useRef(null);
  const isTransitionRef = useRef(false);
  const wheelAccRef = useRef(0);
  const wheelTimeoutRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const lines = Array.from({ length: LINES_COUNT }, (_, i) => i);

  // Initialize Lenis and setup scroll mapping
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.8,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smooth: true,
      smoothTouch: true,
    });
    lenisRef.current = lenis;

    // Map vertical scroll to horizontal transform
    function raf(time) {
      lenis.raf(time);
      const tx = -window.scrollY * (window.innerWidth / window.innerHeight);
      document.documentElement.style.setProperty('--scroll-x', `${tx}px`);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Setup spacer height for scroll range
    const updateSpacer = () => {
      if (spacerRef.current) {
        spacerRef.current.style.height = `${SECTIONS.length * 100}vh`;
      }
    };
    updateSpacer();
    window.addEventListener("resize", updateSpacer);

    // Sync with hash on mount
    const hash = window.location.hash.replace('#', '');
    const startIdx = SECTIONS.indexOf(hash);
    if (startIdx >= 0) {
      window.scrollTo(0, startIdx * window.innerHeight);
      setIndex(startIdx);
      onSectionChange(SECTIONS[startIdx]);
    } else {
      window.location.hash = SECTIONS[0];
      onSectionChange(SECTIONS[0]);
    }

    return () => {
      window.removeEventListener("resize", updateSpacer);
      lenis.destroy();
    };
  }, [onSectionChange]);

  // Navigate to section with animation
  const goTo = useCallback((targetIdx) => {
    if (!lenisRef.current) return;
    const clamped = Math.max(0, Math.min(SECTIONS.length - 1, targetIdx));
    if (isTransitionRef.current || clamped === index) return;

    isTransitionRef.current = true;
    setIsTransitioning(true);
    setIndex(clamped);
    onSectionChange(SECTIONS[clamped]);

    const direction = clamped > index ? 1 : -1;
    
    // Dispatch gust event for grass shader
    window.dispatchEvent(new CustomEvent("gust", { 
      detail: { strength: 0.8, direction, durationSec: 2.0 } 
    }));

    // Animate overlay and wind lines
    const tl = gsap.timeline();
    
    tl.fromTo(".transition-overlay", 
      { opacity: 0 }, 
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    ).to(".transition-overlay", 
      { opacity: 0, duration: 0.35, ease: "power2.in" }, 
      1.95
    ).to(".weather-layer", 
      { opacity: 0.25, duration: 0.35, ease: "power1.out" }, 
      0
    ).to(".weather-layer", 
      { opacity: 1.0, duration: 0.35, ease: "power1.out" }, 
      1.8
    );

    // Animate wind lines
    document.querySelectorAll('.wind-line').forEach((node) => {
      gsap.fromTo(node,
        { x: direction > 0 ? "200%" : "-200%", opacity: 1 },
        {
          x: direction > 0 ? "-200%" : "200%",
          opacity: 0,
          repeat: -1,
          ease: "linear",
          duration: 0.5 + Math.random(),
          delay: -Math.random() * 2
        }
      );
    });

    // Scroll to target
    lenisRef.current.scrollTo(clamped * window.innerHeight, { 
      duration: 1.0, 
      easing: (t) => 1 - Math.pow(1 - t, 3) 
    });

    // Reset after animation
    setTimeout(() => {
      isTransitionRef.current = false;
      setIsTransitioning(false);
      wheelAccRef.current = 0;
      gsap.killTweensOf('.wind-line');
    }, 2200);
  }, [index, onSectionChange]);

  // Handle wheel, trackpad, and touch events
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const onWheel = (e) => {
      if (isTransitionRef.current) return;
      
      // Handle horizontal trackpad gestures
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 10) {
        if (e.deltaX > 0) goTo(index + 1);
        else goTo(index - 1);
        return;
      }

      // Handle vertical scroll with accumulation
      wheelAccRef.current += e.deltaY;
      clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => {
        wheelAccRef.current = 0;
      }, ACCUMULATOR_RESET_MS);

      const threshold = window.innerHeight * TRIGGER_RATIO;
      if (wheelAccRef.current > threshold) {
        goTo(index + 1);
        wheelAccRef.current = 0;
      } else if (wheelAccRef.current < -threshold) {
        goTo(index - 1);
        wheelAccRef.current = 0;
      }
    };

    const onTouchStart = (e) => {
      const t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
    };

    const onTouchEnd = (e) => {
      const t = e.changedTouches[0];
      const dx = touchStartX - t.clientX;
      const dy = touchStartY - t.clientY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      const swipeThreshold = Math.min(window.innerWidth, window.innerHeight) * 0.12;
      
      if (absX > absY && absX > swipeThreshold) {
        if (dx > 0) goTo(index + 1);
        else goTo(index - 1);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [index, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") goTo(index + 1);
      if (e.key === "ArrowLeft") goTo(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, goTo]);

  // Keep URL hash in sync
  useEffect(() => {
    const current = SECTIONS[index];
    if (current && window.location.hash !== `#${current}`) {
      window.location.hash = `#${current}`;
    }
  }, [index]);

  return (
    <>
      <div ref={spacerRef} style={{ position: "absolute", top: 0, left: 0, width: "1px" }} />

      {isTransitioning && (
        <div className="transition-overlay" aria-hidden="true">
          <div className="glass" />
          <div className="wind-layer">
            {lines.map((i) => (
              <span
                key={i}
                className="wind-line"
                style={{ top: `${(i + 1) * (100 / (LINES_COUNT + 1))}%` }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="nav-dots">
        {SECTIONS.map((section, i) => (
          <button
            key={section}
            className={`dot ${i === index ? "active" : ""}`}
            aria-label={`Go to ${section}`}
            aria-current={i === index ? "page" : undefined}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </>
  );
}
