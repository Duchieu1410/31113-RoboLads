# HSGS RoboLads (#31113) — Browser-Based Animation Study & Motion Architecture

**Date:** 2026-10-26  
**Methodology:** Live browser inspection via Chrome DevTools MCP (`1920×889` and `1440×900` desktop viewports, `390×844` mobile emulation), runtime DOM/WebGL inspection, shader & bundle extraction, synthetic input dispatch (`KeyboardEvent`, `WheelEvent`, `PointerEvent`, `window.scrollTo`), and frame-accurate screenshot capture stored in `assets/reference/`.

---

## 1. Reference A — Bruno Simon (`https://bruno-simon.com/`)

### Captured Evidence
- `assets/reference/bruno-01-initial.png` — Loader stage: isometric indigo dot-grid with a glowing neon spawn ring while the WebGL world and physics buffers stream in.
- `assets/reference/bruno-02-loaded.png` — Spawned world state: isometric low-poly/voxel-adjacent autumn courtyard with 3D extruded `BRUNO SIMON` letter blocks, wooden crates, lanterns, and the red off-road vehicle at rest.
- `assets/reference/bruno-03-after-drive.png` — Active keyboard drive (`ArrowUp` / `KeyW` held for 1500 ms): vehicle accelerates forward, collides with 3D typography (`M` and `O` blocks knocked out of alignment with particle burst), camera tracks vehicle with damped spring follow.
- `assets/reference/bruno-04-after-wheel.png` — Wheel & time-of-day/lighting shift: mouse wheel deltas adjust camera zoom altitude along the isometric axis while dynamic lighting shifts across the terrain.

### Detailed Inspection
1. **Observed Interaction & Driving Inputs**
   - Full-viewport `<canvas>` (`1920×889`, `scrollHeight === innerHeight === 889`, zero native page scroll).
   - **Keyboard (`WASD` / Arrow keys):** Applies continuous force to the vehicle rigid body in a physics simulation.
   - **Pointer / Click-and-drag:** Can steer or trigger interactive world hotspots (`.js-button.interact`, `.js-map-trigger`, `.js-menu-trigger`).
   - **Mouse Wheel (`WheelEvent`):** Adjusts isometric camera zoom distance (`deltaY`) rather than scrolling a document.
2. **Sequence of Visual States**
   - **Loading (`bruno-01-initial.png`):** Minimalist geometric floor grid with a single pulsing circle; zero layout shift when the world activates.
   - **Idle (`bruno-02-loaded.png`):** Warm directional sunlight, gentle foliage sway, diamond interaction markers (`◆`) hovering in 3D space above points of interest (signboard, keyboard/gamepad instruction zone).
   - **Active Manipulation (`bruno-03-after-drive.png`):** Immediate vehicle pitch/roll on acceleration, tire tracks on terrain, rigid-body impulse transfer into 3D letters and crates.
   - **Camera Follow & Zoom (`bruno-04-after-wheel.png`):** Camera target tracks the chassis position with a critically damped follow (`lerp` per frame) while preserving a consistent isometric viewing angle.
3. **Scroll Progress vs. Animation Progress**
   - There is no document scrollbar (`scrollY: 0`). Progress is **spatial** rather than linear: the user navigates between zones on a continuous ground plane.
4. **Apparent Timing & Easing**
   - Input-to-force latency is **0 ms** (applied on the next `requestAnimationFrame` physics tick).
   - Camera follow damping settles over ~`350–500 ms` with exponential decay (`current += (target - current) * k`), preventing camera jerk when the truck hits an obstacle.
   - World UI diamond markers (`◆`) project from 3D world coordinates to 2D screen space every frame with zero lag.
5. **What Makes It Satisfying**
   - **Spatial permanence:** Every object (letters, crates, lanterns, signposts) occupies a real ground plane with contact shadows, warm key lighting, and physical weight.
   - **Immediate causal feedback:** Pressing a key or dragging immediately moves something in the world; hovering/approaching a zone reveals contextual triggers in-place.
   - **Cohesive low-poly/blocky art direction:** Sharp geometric silhouettes paired with warm golden-hour rim lights against deep violet/indigo shadows.
6. **What Could Make It Frustrating or Slow**
   - **Navigation friction for information lookup:** If a visitor just wants to read team specs or download a CAD resource, forcing them to drive a car across a 3D map is slow and disorienting.
   - **Heavy initial download:** Multi-megabyte scene + physics engine requires a multi-second loading ring (`bruno-01-initial.png`) before any content is visible.
7. **What to Adapt for RoboLads**
   - **Spatial stage & ground plane:** Place the real `DecodeBot.glb` robot on a grounded, lit engineering floor grid/pedestal with warm gold (`#ffcc00`) key/rim lighting and deep navy (`#08081a`) shadow falloff—echoing the torchlight-on-stone contrast of our Minecraft hero image.
   - **3D-projected diamond/block spatial markers:** Project interactive subsystem callouts directly from 3D mechanism coordinates on the robot (`Drivebase`, `Cascade Elevator`, `Compliant Intake`, `Control & Odometry`) so clicking or scrubbing to a subsystem orbits the camera to inspect it in place.
   - **Direct pointer manipulation with damped release:** Lock rotation 1:1 to pointer drag while dragging, and apply exponential damping only on release or camera focus transitions.
8. **What NOT to Copy**
   - Do **not** build a driving game, physics sandbox, or lock the entire website into a non-scrollable canvas.

---

## 2. Reference B — Cinematic 3D Scroll Experiences (`Codrops / GSAP`)

**URL:** `https://tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/`

### Captured Evidence
- `assets/reference/codrops-cinematic-frames.png` — 12-frame contact sheet extracted directly from the two embedded 1080p MP4 captures (`2025-10-23-21-34-35.mp4` [7.66s] and `2025-10-24-06-21-19.mp4` [13.40s]).

### Detailed Inspection (Code + Video Frame Analysis)
1. **Observed Architecture & Inputs**
   - **Demo 1 (Cylindrical Motion):** A fixed WebGL canvas (`z-0`) behind a `500vh` scroll container. A single GSAP timeline with `scrollTrigger: { trigger: containerRef.current, start: "top top", end: "bottom bottom", scrub: 1 }` drives `cameraAnim { x, y, z }` through 5 keyframes while rotating the cylinder `y: "+=28.27"` (`ease: "none"`).
   - **Demo 2 (Scene Direction — 3D Skyscraper):** A fixed Three.js `<Canvas>` (`z-0`) behind a `900vh` scroll container. A master timeline with `scrub: true` interpolates two mutable refs (`cameraAnimRef` for camera position and `targetAnimRef` for `camera.lookAt`) across a `scenePerspectives` array mapped by `[start%, end%]` of total scroll progress.
2. **Sequence of Visual States (`codrops-cinematic-frames.png`)**
   - **Demo 1 (`v1 t=0.5s → 7.2s`):** Camera starts at `(0, 0, 8)` viewing the exterior of the textured cylinder (`t=0.5s`), arcs up to `(0, 5, 5)` looking down into the cylinder ring (`t=2.5s`), dives inside to `(0.5, 0, 0.8)` (`t=4.5s`), and pulls back out to `(-6, -1, 8)` (`t=7.2s`).
   - **Demo 2 (`v2 t=0.5s → 13.2s`):** Camera sweeps from a low wide establishing shot of the dark monolith (`t=0.5s`) into a tight facade pass (`t=2.5s–4.5s`), orbits over the roof antenna (`t=6.5s–8.5s`), and settles on the upper signage (`t=10.5s–13.2s`), while chapter titles fade in (`duration: 0.2`), hold (`0.6`), and fade out (`0.2`) over their respective scroll slices.
3. **Scroll Progress vs. Animation Progress**
   - Both camera position and `lookAt` target are **pure functions of normalized scroll progress `p ∈ [0, 1]`**.
   - Reversing scroll direction immediately reverses the camera path and chapter text opacity without state desynchronization.
4. **Apparent Timing & Easing**
   - Custom bezier curves (`cinematicSilk: "0.45,0.05,0.55,0.95"`, `cinematicFlow: "0.33,0,0.2,1"`, `cinematicSmooth: "0.25,0.1,0.25,1"`) shape the rate of camera travel between keyframes.
   - However, the tutorial also layers `ScrollSmoother.create({ smooth: 4, smoothTouch: 2 })` on top of `scrub: 1`.
5. **What Makes It Satisfying**
   - **Dual-vector camera choreography (`position` + `lookAt`):** Moving *both* the camera position and the `lookAt` point simultaneously creates true cinematic parallax—shifting from an establishing full-body view to a tight mechanical close-up while keeping the subject framed relative to incoming text cards.
   - **Windowed text beats:** Text overlays fade in (`0 → 20%`), hold (`20% → 80%`), and exit (`80% → 100%`) within their exact scroll slice, so two text blocks never collide.
6. **What Could Make It Frustrating or Slow**
   - **Double-smoothing lag (`ScrollSmoother smooth: 4` + `scrub: 1`):** Stacking a 4-second virtual scroll smoother on top of a 1-second scrub makes the page coast for several seconds after the user stops scrolling.
   - **Excessive `900vh` empty scroll height:** Requiring 9 full screen-heights of wheel spinning for 4 text blurbs feels padded and exhausting.
7. **What to Adapt for RoboLads**
   - **Dual-vector camera rig (`cameraPos` + `lookAtTarget`):** Drive the 3D camera around `DecodeBot.glb` using a deterministic keyframe table indexed by normalized section scroll progress `p ∈ [0, 1]`—moving from a wide isometric establishing shot (`Hero → Robot handoff`), to a low-angle chassis/drivetrain pass, to an elevated intake/lift inspection, and finally framing the robot alongside the transition into Core Activities.
   - **Synchronized HUD & chapter callouts:** Tie engineering specification cards to the same normalized progress `p` so camera angle, active subsystem highlight, and text card are always 100% in lockstep.
8. **What NOT to Copy**
   - **Never use `ScrollSmoother` (`smooth: 4`) or hijack native document scrolling.** Native browser scroll must stay 1:1 with the user's wheel/trackpad/touch.
   - **Keep the pinned/scrubbed robot showcase concise (`~220–260vh`)**, not `900vh`.

---

## 3. Reference C — Curve Gallery (`Codrops / gaspoorf`)

**Live Demo:** `https://tympanus.net/Tutorials/CurveGallery/`  
**Source:** `https://github.com/gaspoorf/curve-gallery` (and inspected live via `/Tutorials/CurveGallery/assets/index-VX_qj_PJ.js`)

### Captured Evidence
- `assets/reference/curve-01-initial.png` — Initial state on `Path 1`: 500 image planes distributed along a 3D `CatmullRomCurve3` disappearing into white distance fog (`THREE.Fog(0xffffff, 10, 40)`).
- `assets/reference/curve-02-fast-wheel-immediate.png` — Immediate frame after 6 rapid wheel events (`deltaY: 300`): camera advances along the spline while planes entering the focal window begin scaling up.
- `assets/reference/curve-03-fast-wheel-settled.png` — Settled frame 1 second later: foreground cluster scales smoothly to `14×` via cubic proximity falloff.
- `assets/reference/curve-04-path2.png` — After clicking `Path 2`: all 500 meshes and the camera morph smoothly in 3D space to the new spline geometry over `1.4s` (`power3.inOut`).

### Detailed Inspection (Live Browser + Extracted Bundle Logic)
1. **Observed Interaction & Driving Inputs**
   - Driven by `Observer.create({ target: window, type: "wheel,touch,pointer", onChange: e => { d += e.deltaY * f; u(d); } })` where `f = 0.8 / (window.innerHeight * 4)` and `u = gsap.quickTo(l, "t", { duration: 1, ease: "power3.out" })`.
   - Clicking `Path 1`–`Path 5` triggers a 3D spatial reconfiguration of every item onto a new `CatmullRomCurve3`.
2. **Sequence of Visual States & Mathematical Formulation**
   - **Camera path evaluation:** Each frame computes normalized wrapped progress `n = ((1 - l.t) % 1 + 1) % 1`, samples `a = curve.getPoint(n)`, and places the camera at `(a.x, a.y, a.z + 10)`.
   - **Continuous proximity focus & scale:** For each of the 500 planes, radial XY distance `o = hypot(cam.x - mesh.x, cam.y - mesh.y)`, Z distance `a = |cam.z - mesh.z|`, and curve parameter distance `s = min(|mesh.t - n|, 1 - |mesh.t - n|)` are evaluated. Inside the focal threshold (`s < i && a < 11 && o < 5.5`), scale is computed as:
     $$\text{scale}(o) = 1 + \left(1 - \frac{o}{5.5}\right)^3 \cdot (14 - 1)$$
     and applied via per-mesh `gsap.quickTo(scaleState, "value", { duration: 0.4, ease: "power3.out" })`.
3. **What Makes It Satisfying**
   - **Clean separation of concerns:**
     1. *Input accumulator* (`d`, updated by scroll/wheel).
     2. *Smoothed progress scalar* (`l.t`, damped with `power3.out`).
     3. *Parametric 3D spline* (`CatmullRomCurve3.getPoint(t)`).
     4. *Proximity-based visual emphasis* (scale/focus derived from distance to the active point `n`).
   - **Zero hard cuts on state change:** Switching from `Path 1` to `Path 2` (`curve-04-path2.png`) morphs every object in place (`1.4s power3.inOut`) rather than unmounting and remounting.
4. **What Could Make It Frustrating or Slow**
   - During a very fast wheel burst (`curve-02-fast-wheel-immediate.png`), because the scale `quickTo` has a `0.4s` lag on top of the `1.0s` position `quickTo`, the camera can briefly outrun the scale-up of nearby planes, leaving a sparse frame for ~200 ms before the planes bloom in (`curve-03-fast-wheel-settled.png`).
5. **What to Adapt for RoboLads**
   - **Parametric `CatmullRomCurve3` camera & focus architecture:** Define our robot inspection camera path using `THREE.CatmullRomCurve3` (both for camera position and look-at target) evaluated from normalized scroll progress `t ∈ [0, 1]`.
   - **Proximity-weighted focus (`(1 - dist / radius)^3`):** Compute each robot subsystem's proximity to the current scroll progress `t` (or active selected stage) as a continuous weight $w_i(t) \in [0, 1]$ instead of binary on/off toggles—driving smooth HUD callout intensity, beacon scale, and camera framing.
   - **In-place state morphing:** When the user clicks a subsystem tab or switches between Scroll-Director mode and Free-Orbit mode, smoothly interpolate the camera from its current world position (`duration ~550ms`, exponential ease-out) rather than hard-cutting.
6. **What NOT to Copy**
   - Do not trap the page in an infinite loop (`(1 - l.t) % 1`) with `scrollHeight: 100vh`; our page has real editorial sections above and below the 3D experience.

---

## 4. Reference D — Pixel Image Effect (`https://pixelimageeffect.pages.dev/`)

### Captured Evidence
- `assets/reference/pixel-01-initial.png` — Initial viewport: editorial layout with "NORTHERN EXPEDITIONS 1970–1978" and hero photograph rendered on a fixed WebGL plane over hidden DOM `<img>` tags.
- `assets/reference/pixel-02-mid-scroll.png` — Scrolled to `scrollY = 520`: catches the exact mid-reveal state of Image #2 where a horizontal band of `20px` square blocks (`#242424`) sweeps down across the image with pseudo-random per-cell offsets.
- `assets/reference/pixel-03-settled.png` — Scrolled to `scrollY = 950`: Image #2 and #3 settled into view after the pixel curtain completes.

### Detailed Inspection (Extracted GLSL Shader & ScrollTrigger Code)
1. **How the Pixel Effect is Produced (Exact GLSL Mechanics)**
   - Extracted from `_astro/Layout.astro_astro_type_script_index_0_lang.Cvh7BN83.js` (`Sy` fragment shader):
     - Divides the image container into a square grid: `gridSize = floor(uContainerRes.x / 20.0)` and `grid = floor(squareUvs * gridSize) / gridSize`.
     - Computes a sweeping vertical threshold from `uProgress ∈ [0, 1]`: `height = 0.2; progress = (1.0 + height) - uProgress * (1.0 + 2.0 * height)`.
     - Uses deterministic 2D hash noise per cell: `random(grid) = fract(sin(dot(grid.xy, vec2(12.9898, 78.233))) * 43758.5453123)`.
     - Reveals the underlying photograph strictly behind the sweeping frontier (`texture.rgba *= step(progress, grid.y)`) while drawing solid square blocks (`uColor`) along the active frontier band (`dist = step(1.0 - height, 1.0 - distance(grid.y, progress))`).
2. **Observed Scroll & Interruption Behavior (Critical Flaw Identified)**
   - Extracted trigger code:
     ```js
     this.scrollTrigger = gsap.to(this.material.uniforms.uProgress, {
       value: 1,
       scrollTrigger: {
         trigger: this.element,
         start: "top bottom",
         end: "bottom top",
         toggleActions: "play reset restart reset"
       },
       duration: 1.6,
       ease: "linear"
     });
     ```
   - **What goes wrong during fast or reverse scrolling:**
     1. **Fixed 1.6s timer lag:** Because `uProgress` runs on a fixed `1.6s` clock triggered at `top bottom`, scrolling rapidly to `scrollY = 520` (`pixel-02-mid-scroll.png`) leaves the user staring at an mostly blank white space with a thin row of dark squares while waiting 1.6 seconds for the image to finish materializing.
     2. **Repeated reset/replay on reverse scroll:** `toggleActions: "play reset restart reset"` resets `uProgress = 0` every time the image leaves the viewport and restarts the 1.6s animation from zero when scrolling back up! This directly violates the core motion rule: *never replay entrance animations on scroll-up*.
     3. **DOM-to-WebGL sync fragility:** Hiding every `<img>` on the page and duplicating it inside a full-page fixed WebGL canvas adds unnecessary GPU memory overhead and breaks native image accessibility/fallback if WebGL fails.
3. **What Makes It Satisfying (When Used Properly)**
   - The **geometric block-curtain frontier**—where discrete square cells with deterministic hash offsets snap into place along a moving edge—feels tactile, digital, and unmistakably voxel/Minecraft-native compared to a generic CSS `opacity` fade.
4. **What to Adapt for RoboLads**
   - **Voxel Block-Curtain Reveal (Deterministic & One-Shot or Scrubbed):** Use a lightweight, crisp voxel/block-grid reveal motif (in navy `#08081a`, blueprint `#14172e`, and gold `#ffcc00` frontier cells) for key visual transitions (such as the Hero-to-Mission seam and the media frame reveals), **without** hiding real DOM images behind a full-page WebGL proxy and **without** `play reset restart reset` replay bugs. Once revealed, images stay visible (`once: true` or directly scrubbed at the section seam).

---

## 5. Reference E — GSAP ScrollTrigger Documentation (`https://gsap.com/docs/v3/Plugins/ScrollTrigger/`)

### Key Technical Principles Extracted
1. **Scrubbed vs. Triggered Separation**
   - **Scrubbed (`scrub: true` or minimal smoothing `≤ 0.15s`):** Scroll position *is* the clock (`progress ∈ [0, 1]`). The animation must use `linear` interpolation between closely spaced keyframes or a continuous curve (`CatmullRomCurve3`) so velocity matches the user's hand and reverses instantaneously on direction change.
   - **Triggered (`once: true`):** Crosses a threshold (`10–20%` into viewport) and plays once. Using `once: true` (or unobserving in `IntersectionObserver`) guarantees the animation never resets or replays when the user scrolls back up.
2. **Fast-Scroll & Interruption Handling (`fastScrollEnd` / Retargeting)**
   - Fixed-duration entrance animations that exceed `350–500ms` feel broken when a user scrolls rapidly past them. Either bind continuous spatial transitions directly to scroll progress `p ∈ [0, 1]`, or keep one-shot reveals short (`250–380ms` with steep ease-out `cubic-bezier(0.22, 1, 0.36, 1)`).
3. **Do We Need to Add GSAP to `web/package.json`?**
   - **No.** Inspecting `web/package.json` shows we already have `three` (`^0.186.1`), `react` (`19.2.8`), and native `requestAnimationFrame` + `IntersectionObserver`.
   - Everything GSAP `ScrollTrigger` + `CatmullRomCurve3` does in References B & C can be implemented in **~80 lines of zero-dependency TypeScript** using `THREE.CatmullRomCurve3`, `THREE.Vector3.lerpVectors`, and a single passive `scroll` / `resize` progress calculator (`p = clamp((scrollY - start) / (end - start), 0, 1)`). This avoids adding bundle weight while giving us 100% deterministic control over scrubbing, damping, and `prefers-reduced-motion`.

---

## 6. Phase 2 — RoboLads' Own Motion Language ("Voxel-to-Mechanism")

RoboLads has a genuine, unmistakable identity: **a competitive FIRST Tech Challenge robotics team (#31113) born inside the iconic HSGS campus (depicted in our Minecraft school-gate artwork) that designs real CNC-machined, belt-driven, autonomous competition robots (`DecodeBot.glb`).**

Our motion language bridges those two halves—**Minecraft Voxel World → Real Competition Engineering**:

| Dimension | Specification |
| :--- | :--- |
| **Visual Foundation** | Deep bedrock navy (`#08081a`), panel slate (`#0e1023`), sunken telemetry (`#050610`), championship gold (`#ffcc00`), structural bevel borders (`2px–3px solid #1e223d`), hard pixel drop shadows (`4px 4px 0 #000`), zero pill buttons or SaaS glassmorphism. |
| **Opening Anchor** | The original Minecraft school-gate photograph (`/Photo/mcrrbl.png`) at full sharpness and high right-half luminance, with subtle scroll-scrubbed depth layers (foreground HUD frame vs. gate architecture) and an interactive voxel horizon seam. |
| **Spatial Continuity (The 3 Connected Moments)** | **Moment A (Hero → Mission Content):** Scroll-scrubbed voxel horizon curtain & telemetry elevation that transitions naturally from the Minecraft school gate into the HSGS team story (`IMG_9478.jpg`, `join-us-gen2.jpg`) without a flat hard cut.<br>**Moment B (Content → Actual Robot `DecodeBot.glb`):** A choreographed 3D showcase featuring the **real `DecodeBot.glb` CAD assembly** on a lit voxel-grid arena stage. As the user scrolls through the stage, a `CatmullRomCurve3` dual-vector camera rig (`cameraPos` + `lookAtTarget`) sweeps smoothly around the real robot across 4 engineering chapters while allowing direct pointer drag-to-orbit and xray/blueprint inspection at any moment.<br>**Moment C (Robot → Core Activities):** As the camera completes its final pass of `DecodeBot.glb`, the spatial telemetry rail hands off directly into a cohesive, block-indexed Core Activities showcase (`cad-robot.jpg`, `workshop.jpg`, `community.jpg`, `competition.jpg`) where switching cards morphs the active viewport smoothly in place. |
| **Timing & Easing Rules** | • **Scrubbed scroll progress:** Direct `1:1` progress mapping `p ∈ [0, 1]` with light frame-rate-independent exponential smoothing (`τ ≈ 90ms`, disabled under `prefers-reduced-motion`) so reversing direction is immediate.<br>• **Tactile controls (`:hover`, `:active`):** `0ms` press down (`translate(2px, 2px)`), `120ms cubic-bezier(0.22, 1, 0.36, 1)` release.<br>• **One-shot section entrances:** Trigger once at `15%` viewport entry, `320ms cubic-bezier(0.22, 1, 0.36, 1)`, never reset on scroll-up. |

---

## 7. Phase 3 — Diagnosis of the Existing Implementation

Based on direct inspection of `web/src/app/page.tsx`, `web/src/app/landing.css`, `web/src/app/globals.css`, `assets/models/DecodeBot.glb`, and live testing on `http://localhost:3000/` (`robolads-before-01-hero.png` through `robolads-before-03-activities.png`):

1. **Flat, Disconnected Section Stacking (Visual Hierarchy & Continuity Problem)**
   - In `page.tsx`, each section (`.landing-hero`, `.about-section`, `.details-section`, `.activities-section`) sits in an isolated centered `max-width: 1100px` box separated by vertical padding (`padding: 80px 20px`).
   - Nothing spatially connects the Minecraft school-gate hero to the team photo (`IMG_9478.jpg`), and nothing connects the team's mission to the Core Activities accordion. Scrolling feels like reading stacked static cards on a dark background rather than moving through a cohesive world.
2. **Real 3D Robot Model (`assets/models/DecodeBot.glb`) Was Unused and Unoptimized for Web**
   - `assets/models/DecodeBot.glb` is the team's actual competition robot exported from CAD, containing **1,380 nodes, 170 meshes, 45,161 primitives, and 6,417,682 triangles (57.24 MB)** compressed with `KHR_draco_mesh_compression`.
   - Previous attempts either built a fake procedural robot out of Three.js boxes/cylinders or showed a static 2D screenshot (`cad-robot.jpg`), and the section was subsequently removed altogether.
   - Loading a 57.24 MB / 45,161-primitive GLB directly in the browser would stall the network and cause 45,000+ draw calls per frame. By generating an untouched-source web derivative (`assets/models/DecodeBot.web.glb`) with joined primitives, welded vertices, and `EXT_meshopt_compression`, we reduce primitive draw calls by **99.9%** (from `45,161` down to `~50`) and file size by **92%** (`57.24 MB → ~4.4 MB`) while preserving the exact CAD silhouette, wheels, belts, channels, and color palette!
3. **Accordion Layout Thrashing in Core Activities (`landing.css` lines 860–921)**
   - `.activity-card` animates `transition: flex 0.32s var(--ease-enter)` while `.card-img-box` simultaneously animates `transition: height 0.3s var(--ease-enter)` (`0px → 195px`).
   - Animating both horizontal `flex` grow and vertical `height` simultaneously triggers continuous browser layout recalculations every frame and causes the text inside neighboring cards to reflow and jitter while the pointer moves across the row.
4. **Static Hero-to-About Seam**
   - While `.landing-hero` now has a clearer right-side gradient over `/Photo/mcrrbl.png`, scrolling down simply slides the static background image off the top of the screen with zero spatial depth, camera response, or connection to the `ABOUT ROBOLADS` team photo below.

---

## 8. Phase 4–7 — Prototype Implementation & Browser Verification (`/prototype`)

To test these principles without altering the existing homepage (`web/src/app/page.tsx` at `/`), we built a live prototype route at `/prototype` ([`web/src/app/prototype/page.tsx`](../../web/src/app/prototype/page.tsx), [`web/src/app/prototype/prototype.css`](../../web/src/app/prototype/prototype.css), and [`web/src/components/DecodeBotStage.tsx`](../../web/src/components/DecodeBotStage.tsx)) and verified it in Chrome DevTools MCP across desktop (`1440×900`) and mobile (`390×844`) viewports.

### Summary of Connected Moments Implemented
1. **Moment A — Hero to Team Story & Mission (`proto-01-hero.png` → `proto-02-story-mission.png`)**:
   - Preserves `/Photo/mcrrbl.png` with an unobstructed right-half view of the Minecraft HSGS school gate (`182 LƯƠNG THẾ VINH`), enhanced brightness/contrast (`brightness(1.18) contrast(1.08) saturate(1.14)`), and scroll-scrubbed depth separation between the background architecture (`translate3d` + `scale`) and foreground copy.
   - Connects the hero to the Team Story via a **16-column scroll-scrubbed Voxel Horizon Bridge** and a **one-shot 8-bar stepped voxel curtain reveal** (`once: true` via `IntersectionObserver` — verified never to reset or replay on scroll-up) over `/Photo/IMG_9478.jpg` and `/Photo/join-us-gen2.jpg`.
2. **Moment B — Content to Real 3D Robot Stage (`proto-03-robot-overview.png`, `proto-04-robot-intake-exploded.png`, `proto-04b-robot-xray.png`)**:
   - Streams the optimized real Onshape CAD derivative `/assets/models/DecodeBot.web.glb` (`4.70 MB`, 50 joined meshes, 825k vertices, `EXT_meshopt_compression`) while keeping `assets/models/DecodeBot.glb` (`57.24 MB`) untouched.
   - Aligns the Onshape coordinate frame into upright Three.js world space using an exact orthonormal basis matrix (`40°` XZ alignment + lateral Y-to-X mapping) so the mecanum wheels rest flat on the dark Lambert arena deck (`#050816`).
   - Uses two synchronized `THREE.CatmullRomCurve3` splines (`cameraCurve` and `targetCurve`) driven by scroll progress `p ∈ [0, 1]` across 4 engineering chapters (`SYS-01 // CHASSIS`, `SYS-02 // DRIVETRAIN`, `SYS-03 // INTAKE`, `SYS-04 // AVIONICS & TURRET`), paired with live 3D-projected subsystem pins (`01`–`04`) and three immediate user interactions:
     - **Direct `1:1` Pointer Drag-to-Orbit** with exponential inertia on release.
     - **Holographic X-Ray Wireframe Mode** (`proto-04b-robot-xray.png`) exposing internal belt stages and the REV Control Hub.
     - **Radial Sub-Assembly Exploded View** (`proto-04-robot-intake-exploded.png`) separating CAD subsystems cleanly by `24%` along their local assembly vectors.
3. **Moment C — 3D Robot to Zero-Reflow Core Activities Stage (`proto-05-activities.png`)**:
   - Hands off from Chapter 04 of the 3D robot stage along a continuous gold telemetry spine into a fixed-geometry split showcase (`/Photo/cad-robot.jpg`, `/Photo/workshop.jpg`, `/Photo/community.jpg`, `/Photo/competition.jpg`).
   - Replaces the original homepage's layout-thrashing flexbox accordion (`flex: 1 → 2.8` + `height: 180px → 230px`) with locked trigger bounding boxes (`479×126 px` before and after selection — **0 px layout shift**) and GPU-composited `transform`/`opacity` slide transitions.

### Before & After Reference Artifact Catalog (`assets/reference/`)
- **External Reference Studies**:
  - `bruno-01-initial.png` – `bruno-04-after-wheel.png` (Reference A: Bruno Simon 3D world & input feel)
  - `codrops-cinematic-frames.png` (Reference B: Codrops Cinematic 3D Scroll frame strip)
  - `curve-01-initial.png` – `curve-04-path2.png` (Reference C: Codrops 3D Curve Gallery spline & morphing)
  - `pixel-01-initial.png` – `pixel-03-settled.png` (Reference D: Pixel Image Effect shader & scroll reset diagnosis)
- **Existing Homepage Baseline ("Before")**:
  - `robolads-before-01-hero.png`
  - `robolads-before-02-about-details.png`
  - `robolads-before-03-activities.png`
- **Prototype Validation ("After" at `/prototype`)**:
  - `proto-01-hero.png` (Moment A: Unobstructed Minecraft school-gate hero + depth parallax)
  - `proto-02-story-mission.png` (Moment A: Stepped voxel-curtain reveal of team roster & mission)
  - `proto-03-robot-overview.png` (Moment B: Upright 671-part `DecodeBot.web.glb` in PBR mode, Chapter 01)
  - `proto-04-robot-intake-exploded.png` (Moment B: Chapter 03 Intake close-up with Exploded Subsystems active)
  - `proto-04b-robot-xray.png` (Moment B: Chapter 02 Drivetrain with X-Ray Wireframe active)
  - `proto-05-activities.png` (Moment C: Zero-reflow Core Activities stage)
  - `proto-06-mobile.png` (`390×844` mobile responsive verification with `0px` horizontal overflow)

---

## 9. Phase 8 — Homepage Redesign V2: Pixel Typography, Ambient Robot Companion, & Decoupled Motion Architecture

### Architectural Shift from V1 to V2
While V1 successfully verified the 3D CAD loading (`DecodeBot.web.glb`) and zero-reflow interactive components at `/prototype`, two significant UX and art-direction shortcomings remained when tested as a production homepage:
1. **The Sticky Scroll Trap (Scroll Hijacking Friction):**
   - In V1, the `proto-robot-scroll-track` locked the entire browser viewport for `250vh`. Visitors scrolling through the page were forced to halt normal reading and scrub through four sequential chapters before resuming normal document scroll.
   - *Reference Insight (Codrops Ambient Three.js Backgrounds):* A high-quality 3D asset should feel like an organic inhabitant of the page—an ambient companion alongside the narrative—rather than an impenetrable wall. The document must scroll naturally at all times.
   - *V2 Solution:* We decouple document scroll from 3D camera locking. The robot runs as an ambient 3D companion layer beside the team story, mission, and activities, subtly reorienting and rotating as the user explores the content. For deep inspection, an explicit, prominent **"EXPLORE FULL CAD // 3D LAB"** modal overlay opens on demand, giving power users complete orbit, X-ray wireframe, explode, and subsystem pin controls without hijacking the page for casual visitors.

2. **Typography Disharmony (Pixel Headings vs. Generic Sans Body):**
   - Mixing 8-bit `Press Start 2P` headings with standard `Inter`/`Geist` body copy created a visual disconnect: headings looked like retro gaming while body copy looked like a generic corporate SaaS dashboard.
   - *Reference Insight (Depart Inc. Cohesive Pixel Direction):* High-craft digital experiences achieve unity through a single, thoughtfully chosen display and text system.
   - *V2 Solution:* Adopt **Pixelify Sans** as the universal visible typeface across the entire page (headings, paragraphs, badges, telemetry tags, buttons, navigation, and mobile drawer). By setting body copy to `16px` (desktop) and `14px`–`15px` (mobile) with calibrated line-height (`1.65`) and letter-spacing (`0.015em`), text remains comfortably legible while delivering an authentic, cohesive Minecraft/block-world aesthetic.

3. **Continuous, Reversible Storytelling:**
   - Instead of one-shot entrance animations that freeze once played, all visual shifts (hero depth scrim, ambient robot yaw/pitch, telemetry indicator bars, and section transitions) respond continuously and reversibly to scroll position both upwards and downwards.
   - The Minecraft school-gate hero (`/Photo/mcrrbl.png`) remains crisp and immediate on first paint, framed with a directional gradient (navy backing for left-side copy, bright unobstructed gateway on the right).

### V2 Browser Verification Artifacts (`assets/reference/`)
- `v2-01-hero.png` — Hero with Pixelify Sans typography, directional gradient, and unobstructed Minecraft school gate.
- `v2-02-story-mission.png` — Team Story & verified facts grid (`2025`, `HSGS`, `#31113`, `40–50 Members`) in unified pixel type.
- `v2-03-ambient-robot.png` — Engineering Centerpiece: ambient 3D companion robot card with active subsystem tabs and direct orbit.
- `v2-04-cad-modal-open.png` — Full CAD Exploration modal dialog open (`01–04` chapters, PBR, X-Ray, Explode, 3D pins).
- `v2-04b-modal-xray.png` — Modal CAD with X-Ray Wireframe mode active, revealing internal belt stages and REV Control Hub.
- `v2-05-activities.png` — Core Activities with zero-reflow fixed geometry tabs (`cad-robot.jpg`, `workshop.jpg`, `community.jpg`, `competition.jpg`).
- `v2-06-resources-footer.png` — Technical categories and site directory in harmonious pixel styling.
- `v2-07-mobile-hero.png` — Mobile viewport (`390×844`) with 0px horizontal overflow and crisp legible text.
- `v2-08-mobile-robot.png` — Mobile view of ambient 3D robot companion and modal trigger.



