# Session Context & Next Steps

## Project Overview
We are building a highly visual, scientifically-inspired simulation of the universe's history, running in the browser using **React, Vite, Three.js (React Three Fiber), and custom WebGL shaders**.

The experience is a linear journey:
1.  **Initiate Sequence:** A landing page with a solid black background and a start button.
2.  **Intro Sequence (60s):**
    *   **Mandelbrot Zoom:** A deep dive into fractal geometry representing the potential energy before time.
    *   **The Void & Multiverse:** As the fractal fades, we enter a void filled with "Bubble Universes" (procedural nebulae).
    *   **The Singularity:** In the center of the multiverse, a single white point pulsates—the seed of *our* universe.
3.  **Simulation Phases:**
    *   **Big Bang:** A violent explosion of white/purple/pink energy with camera shake.
    *   **Cosmic Inflation:** Exponential expansion with large "ghost" fields.
    *   **Quark-Gluon Plasma (QGP):** Matter condenses into a hot, opaque soup of colorful quarks (Red/Green/Blue) and white gluons.
    *   **Galaxy Formation:** (Implemented but basic) Spiral structure formation.
    *   **Solar System:** (Implemented but basic) Star and planetary disk.

## Current State
*   The application is stable using a **Single Canvas Architecture** to prevent WebGL context loss.
*   The **Timeline Cone** at the top visualizes the history with a "Pinch" shape (indicating a previous cycle ending).
*   The **Intro Sequence** uses a robust "Clip Space Quad" shader that guarantees full-screen rendering without aspect ratio bugs.
*   **Visuals:** High-quality Bloom, Noise (film grain), and custom shader particles for the "Gas Cloud" look.

## Prompt for Next Session

Use the following prompt to resume development seamlessly:

---

**Prompt:**

"We are continuing development on the 'Origin' Universe Simulation.

**Current Context:**
- We have successfully implemented the Intro Sequence (Mandelbrot -> Multiverse -> Singularity) and the first three phases of the simulation (Big Bang -> Inflation -> QGP).
- The codebase uses a Single Canvas architecture for stability.
- All visuals are generated procedurally using shaders (no external assets).

**Immediate Goals:**
1.  **Refine Galaxy Formation:** The current galaxy phase is a simple spiral. We need to upgrade it to look like a realistic, volumetric spiral galaxy with dust lanes, star-forming regions, and a glowing core, using the same custom shader techniques as the QGP phase.
2.  **Refine Solar System:** The solar system phase needs a visual overhaul to show the accretion disk more clearly, perhaps with a young, unstable sun.
3.  **Transitions:** Smooth out the transition from QGP to Galaxy. It currently feels a bit abrupt.
4.  **Performance:** Ensure the simulation maintains 60 FPS as we add more complexity to the later phases.

Please analyze `src/components/CosmicDust.jsx` and `src/components/IntroSequence.jsx` to understand the current shader logic before proceeding."
