# Role

You are the design lead and senior front-end engineer for **HSGS RoboLads (FIRST Tech Challenge Team #31113, Hanoi)**. You are redesigning our team website so it feels like a **game**: pixelated, Minecraft-inspired, playful, and interactive, while remaining fast, accessible, and professional enough that sponsors, judges, and rookie teams trust it.

The current site has the pixel *ingredients* (pixel fonts, hard offset shadows, amber on navy) but reads as a dark corporate dashboard. Your job is to turn it into a **committed pixel-game design system**, not to sprinkle more pixel effects on top.

# 1. Success definition

A first-time visitor should, within 5 seconds, think "this is a game" and want to click something. A judge or sponsor should still find the team, the robot, and the resources in two clicks and read every paragraph comfortably.

Rules that follow from this:

1. **Commit fully or not at all.** Fonts, buttons, panels, icons, transitions, loading states, errors, the footer and the 404 page must all belong to the same world. A pixel hero over generic cards is a failure.
2. **Spend boldness in one place, keep reading surfaces calm.** The hero and the HUD get the most spectacle. Reading surfaces (blog posts, resource docs, long paragraphs) stay legible, with pixel styling in the frame, not the text.
3. **Game feel comes from pacing and feedback, not decoration.** Each section should feel like a different "level" or "screen". Every click, hover and scroll milestone should give a small, consistent response.
4. **Minecraft-inspired, not Minecraft-branded.** Do not use Mojang or Minecraft textures, sounds, logos, fonts, or the name "Minecraft" anywhere in the UI or copy. Recreate the *feel* (blocky bevelled UI, inventory slots, hotbar, XP bar, tooltips, advancements, title-screen menu) with original assets.

# 2. Current state (read before touching anything)

Stack as observed from the saved page: Next.js (App Router, Turbopack dev), Tailwind utility classes plus custom classes (`landing-navbar`, `proto-hero`, `landing-cta-primary`, `landing-cta-secondary`, `proto-activity-trigger`, `ambient-robot-section`, `btn-to-top`), Three.js r186 for a GLB robot viewer (`DecodeBot.web.glb`), fonts loaded via `next/font`: Geist, Geist Mono, Press Start 2P, Pixelify Sans, Inter. The document is `<html lang="vi">`.

Routes: `/` (landing), `/resources` (category filter: CAD, Mechanical, Programming, Failure Log), `/blog`, `/admin` (team portal).

Landing sections today: sticky navbar (About Us, 3D Robot, What We Do, Resources, Blog) → hero ("HSGS ROBOLADS" with typing cursor, two CTAs) → "Our story" with 2 photos and 3 stats (40+, 100%, 500+) → 3D robot viewer with 4 subsystem tabs (Chassis, Drivetrain, Intake, Avionics & Turret) → Core Activities (4 tabs with image + detail panel) → Resources card and Blog card → footer with team profile (Mascot: Cerberus) → back-to-top button.

Observed problems to fix:
- Every section is the same recipe: navy card, 2px slate border, 4px/6px black offset shadow, amber label, white text. There is no pacing and no texture.
- No pixel-art assets: no sprites, tiles, pixel icons, or textured backgrounds. Icons are smooth SVGs, photos have gradient overlays.
- All body copy is set in the pixel font at small sizes (`text-xs`/`text-sm`), which is tiring to read.
- Interaction is hover and tab switching only. Nothing responds to scroll or keyboard.
- The 3D viewer is the best asset but is framed like any other card.

**Hard "do not break" list:** all existing routes and links; the Three.js GLB viewer behavior (drag to orbit, arrow keys, loading state); the data layer. Page content for `/resources` and `/blog` comes from our backend/CMS (Sanity), so **do not change data fetching, schemas, or API calls**. Only change presentation. Keep `/admin` functional (restyle only if time allows).

(b) the Cerberus mascot reference image is already in the /assets/Photo; (c) whether Vietnamese copy is planned: no Vietnamese, just english.

# 3. Process (follow in order, do not skip the plan)

Use the **`frontend-design` skill** if it is installed in your environment. Its core instructions apply here: write a compact design plan first (palette of 4 to 6 named hex values, type roles, layout concept with ASCII wireframes, principles), then **review the plan against this brief and revise any part that looks like a generic default**, then build, then critique your own screenshots. Two of its warnings matter for us:
- Avoid templated chrome: identical rounded cards, a tracked ALL-CAPS eyebrow above every heading, `A · B · C` meta strings, a "→" on every button. Our pixel direction explicitly asks for blocky shapes and pixel typography, so those are allowed where the *brief* demands them (title-screen buttons, HUD labels), but do not put an eyebrow label above every heading.
- Motion should be orchestrated: one memorable moment (the hero) plus motion that answers user actions. Do not add fade-and-slide-up to every section.

Tools to use if available (do not claim results you did not run):
- A headless browser (Playwright) to screenshot at 375, 768, 1280 and 1920 px widths after every phase, and look at them.
- Lighthouse for performance and accessibility; axe for accessibility checks.
- `next build` to confirm production output is clean.

# 4. Design direction

**Concept:** *"The RoboLads world."* The site is a game world and each section is a place in it. The visitor starts at a **title screen** (hero), explores a **workshop/overworld** (story), opens the **smithing table** (3D robot), walks the **quest board** (activities), and reaches **bedrock** (footer).

**Pacing map (replaces the identical-card stack):**

| Section | Game metaphor | Visual character |
|---|---|---|
| Hero | Title screen | Full-bleed pixel world, parallax, menu buttons, splash text |
| Our story | Overworld / village | Grass top edge, dirt and stone below, photos as item-frame style frames |
| 3D robot | Smithing / crafting table | Dark "cave" backdrop, viewer in a framed panel, subsystem tabs as inventory slots |
| Core activities | Quest board / advancement tree | Four quest cards, one selected, detail in a book or sign panel |
| Resources + Blog | Chest + library | Four chest-slot category tiles; blog posts as written-book entries |
| Footer | Bedrock layer | Darkest stone, bedrock texture, team profile as a player-stats panel |

# 5. Design tokens

Keep the existing navy and amber so the brand is recognizable, then add a block palette. Define everything as CSS variables in one file (`styles/pixel-tokens.css`) and map them into Tailwind's theme. No hard-coded hex in components.

```css
:root {
  /* World */
  --night: #060816;        /* existing page background */
  --night-panel: #0b0f24;  /* existing panel */
  --bedrock: #1a1a24;
  --stone-900: #2b2b33;
  --stone-700: #3c3c46;
  --stone-500: #6b6b76;
  --stone-300: #a8a8b3;
  --grass: #5fa332;
  --grass-light: #8fd14f;
  --dirt: #8a5a2e;
  --dirt-dark: #5b3a1e;

  /* Brand + items */
  --gold: #fbbf24;         /* existing amber; main accent */
  --diamond: #3be0d0;      /* focus rings, links, secondary highlight */
  --redstone: #d33a2c;     /* errors, "you died" */
  --cobalt: #2b4fb8;       /* matches the robot's blue hood; use sparingly */
  --parchment: #e8d9a8;    /* book / sign surfaces for long reading */

  /* Bevels */
  --bevel-light: rgba(255,255,255,.28);
  --bevel-dark: rgba(0,0,0,.55);
  --outline: #000;

  /* Pixel grid: ALL spacing is a multiple of this */
  --px: 4px;
  --shadow-text: 2px 2px 0 rgba(0,0,0,.65);
}
```

**Typography (type carries the personality, so make roles strict):**

| Role | Font | Rules |
|---|---|---|
| Logo, hero title, buttons, HUD numbers | Press Start 2P | Use at 8px multiples (8, 16, 24, 32). Short strings only. Never for paragraphs. |
| Section headings and card titles | Pixelify Sans | Sentence case or Title Case. Reserve ALL CAPS for buttons and HUD labels. |
| Body text (anything longer than one line) | Inter (already loaded) or Pixelify Sans at 16px+ | Line length under 80 characters, line-height 1.6. This replaces the current small pixel-font paragraphs. |

> **Vietnamese warning:** the page declares `lang="vi"`. Press Start 2P is Latin-only and will drop or fall back on Vietnamese diacritics (ă, â, ê, ô, ơ, ư, đ, tone marks). Before committing, test a Vietnamese sentence in every pixel font. If a font lacks the glyphs, keep Vietnamese text in Inter and use pixel fonts only for English UI labels, or choose a pixel font that supports Vietnamese. Do not ship broken diacritics.

Text on dark surfaces gets `text-shadow: var(--shadow-text)`, which is the cheap trick that makes UI text feel game-native.

# 6. Component primitives (build these first, in `components/pixel/`)

Build a hidden `/dev/pixel` page that shows every primitive in every state. Build and review this page before touching real sections.

1. **`PixelPanel`**: the replacement for every navy card. Variants: `stone` (default), `dirt`, `parchment` (long reading), `night` (cave backdrop). Bevelled with inset shadows, 4px black outline, optional tiled texture. Core CSS:
   ```css
   .px-panel {
     background: var(--stone-700) var(--tex-stone) repeat; /* 16x16 tile, scaled 4x */
     image-rendering: pixelated;
     box-shadow:
       inset calc(var(--px)) calc(var(--px)) 0 var(--bevel-light),
       inset calc(var(--px) * -1) calc(var(--px) * -1) 0 var(--bevel-dark),
       0 0 0 var(--px) var(--outline);
   }
   ```
   Optional stepped corners with `clip-path: polygon(...)` in 4px steps. No `border-radius` anywhere in the system.

2. **`PixelButton`** (button or link): stone body, bevel, 4px outline. Hover: lighter body and gold text. Pressed: swap bevels and `translateY(4px)`. Focus-visible: 4px diamond outline (never remove focus). Variants: `primary` (gold), `stone`, `danger`. Optional half-width pairing for title-screen layouts. Click plays a short synthesized blip only if sound is enabled (default off).

3. **`Slot`**: 64×64 inventory slot (dark inset with bevel) holding an icon, optional stack count in the bottom-right in Press Start 2P, optional selected state (white 4px frame). Used for stats, subsystem tabs, resource categories and the hotbar.

4. **`Tooltip`**: Minecraft-style item tooltip (near-black fill, 2px purple-ish border, first line gold) used for 3D model hotspots, icon buttons, and the stat slots.

5. **`Toast` / `AdvancementToast`**: slides in from the top right: pixel icon, small title ("Achievement unlocked"), one plain-language line ("Opened the CAD lab"). Auto-dismiss at 4s, pause on hover, `role="status"`.

6. **`XPBar`**: thin segmented bar with a green fill and a level number. Driven by scroll progress.

7. **`Hotbar`**: 5 slots mapped to Story, Robot, Activities, Resources, Blog. Keys 1 to 5 jump to sections. Active slot follows the section in view (IntersectionObserver). This **replaces the navbar on desktop scroll** but a conventional top nav remains for accessibility and SEO.

8. **`PixelDivider`**: strata strip between sections (grass → dirt → stone → deepslate) built from a repeating tile, not a flat amber line.

9. **`SplashText`**: rotated gold text beside the hero title, pulsing slightly, cycling through short facts. **Only use facts already on the current site** (for example "Built in Onshape", "40+ student engineers", "Cerberus approved"). Do not invent claims.

10. **`PixelIcon`**: sprite-sheet driven 16×16 icons (sword, pickaxe, redstone, book, chest, compass, gear, camera, code brackets, wrench) rendered at 32 or 48px with `image-rendering: pixelated`. Replace every smooth SVG icon.

# 7. Page-by-page build

### 7.1 Hero: the title screen (the memorable moment)

```
+--------------------------------------------------------------+
|  [logo] HSGS ROBOLADS              [1][2][3][4][5]  (sound)  |
|                                                              |
|        ~ pixel sky, stars, moon, blocky clouds ~             |
|                                                              |
|        H S G S                          * splash text *      |
|        R O B O L A D S _                (rotated, gold)      |
|        FIRST Tech Challenge #31113 // Hanoi                  |
|                                                              |
|             [ Explore 3D robot            ]                  |
|             [ About RoboLads              ]                  |
|             [ Resources ][ Blog           ]                  |
|                                                              |
|   Cerberus + mini robot on grass  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   |
+--------------------------------------------------------------+
```

- **Render the world on a low-resolution 2D canvas** (internal size about 320×180, scaled to fill with `image-rendering: pixelated`). This gives a true pixel look and is cheap. Do **not** use a second WebGL context here, because the 3D viewer already needs one.
- Layers: dithered sky gradient (ordered 4×4 Bayer dithering between 3 to 4 palette colors), stars, a moon or sun that arcs on a slow loop (about 90 seconds), blocky clouds, 3 hill layers with mouse and touch parallax, a foreground grass strip, the Cerberus sprite with a 2 to 4 frame idle animation, and an occasional small robot driving across.
- Keep the title as real HTML text over the canvas (SEO, selection, screen readers) with Press Start 2P and the blinking cursor you already have.
- Menu buttons stacked like a title screen. Button labels say exactly what happens ("Explore 3D robot", not "Start").
- Pause the animation loop when the hero is offscreen or the tab is hidden. Under `prefers-reduced-motion`, render one static frame.

### 7.2 Our story: the overworld
- Top edge is a pixel grass line (`PixelDivider`), content on a dirt/stone panel.
- The two photos get thick pixel frames (item-frame look) with a caption plate. Keep the real photos. Do not pixelate team photos.
- The three stats become three `Slot`s with item icons and big stack counts (40, 100, 500); tooltips explain each. Keep the existing copy.
- Body text uses the readable body font, not the pixel font.

### 7.3 3D robot: smithing table
- Frame the existing viewer in a `PixelPanel` (`night` variant) with corner rivets. Keep all current behavior.
- Replace the generic loading card with a **dirt-background loading screen** ("Loading DecodeBot…") with a segmented progress bar tied to the real GLB load progress.
- Subsystem tabs become four `Slot`s (SYS 01 to 04) with pixel icons. Selecting one updates the detail panel, which is styled as an item tooltip plus a spec list.
- Optional upgrade after Phase 4: clickable 3D hotspots on the robot with `Tooltip`s; selecting a subsystem tilts the camera to it.

### 7.4 Core activities: quest board
- The four activities become quest cards in an advancement-tree arrangement (a small connector line between cards). The selected one is highlighted.
- The detail panel is a `parchment` book/sign: image in a pixel frame, readable body copy, focus-area bullets with pixel bullet icons.
- Keep keyboard behavior: arrow keys move between tabs, Enter/Space selects.

### 7.5 Resources and Blog: chest and library
- Four category tiles (CAD, Mechanical, Programming, Failure Log) become chest-slot tiles with pixel icons and hover tooltips. Preserve the `?category=` links.
- Blog preview: posts as written-book entries (cover, title, date). Do not change how posts are fetched.
- **Failure Log** gets a special treatment: styled like an advancements screen ("Lessons learned"), because turning failures into progress is core to the team's identity.

### 7.6 Footer: bedrock
- Bedrock/deepslate texture, the team profile as a "player stats" panel (Team, Founded, Roster, Mascot: Cerberus), links as menu buttons. Keep all existing links.

### 7.7 Global states
- **404:** a "You died!" style screen in redstone red with a "Respawn" button to `/`. Plain explanation of what happened underneath.
- **Loading / route transitions:** brief pixel loading bar, not a spinner.
- **Empty states:** an empty chest with one clear action.
- **Forms (if any):** stone inputs with bevels, visible labels, plain error text ("Enter an email address like name@example.com").

# 8. The game layer (interaction systems)

All of these must be **optional enhancements over a fully usable normal site**. Everything has a mouse, touch and keyboard path.

1. **XP bar:** fills with scroll progress, and "level" increments per section reached.
2. **Advancements:** a small client-side system (`AdvancementProvider` + `useAdvancement(id)`), stored in `localStorage` wrapped in try/catch (render correctly if storage is empty or blocked). Examples: "Opened the CAD lab", "Read a failure log", "Reached bedrock". Max one toast at a time, never block content, include a "Mute toasts" toggle. Add an Advancements screen listing earned and locked ones.
3. **Command palette (press `T` or `/`):** a chat-style input with real commands: `/resources`, `/blog`, `/robot`, `/about`, `/sound on|off`, and free-text search of resources if the API supports it. Press `Esc` to close. It must not trap focus and must not fire while the user types in another field.
4. **Inventory (press `E`):** an overlay with quick links and the team roster if available. Focus-trapped dialog with `Esc` to close and proper ARIA.
5. **Sound (default OFF, with a visible toggle):** synthesized with the Web Audio API (short blips for click, toast, hover). No copyrighted audio. Remember the choice.
6. **Custom pixel cursor:** desktop with a fine pointer only (`@media (pointer: fine)`). Never on touch. Always fall back to the system cursor.
7. **Easter eggs (cheap, delightful):** Konami code makes Cerberus run across the hero; clicking the logo five times changes the time of day.
8. **Reduced motion:** every motion system respects `prefers-reduced-motion`. Parallax, day/night, toasts and sprite animations drop to static or instant.

# 9. Asset plan (we have no pixel artist, so plan realistically)

1. **Textures (stone, dirt, grass, deepslate, bedrock):** generate procedurally with a small build-time or runtime script. Draw a 16×16 noise-based tile on a canvas from the palette, export to a data URL or PNG, and tile it with `image-rendering: pixelated`. This lets you ship real textures without hand-drawn art.
2. **Icons (16×16):** draw as small pixel arrays in code (strings or arrays mapped to palette colors) and bake into one sprite sheet. Keep a `pixel-icons.ts` file the team can edit.
3. **Characters (Cerberus, mini robot):** build a clear, simple placeholder sprite (about 32×32) in code, and mark it `TODO(art)` for a team member to redraw in Aseprite, Piskel or Lospec's editor. Document the sprite sheet format so a teammate can swap in real art without touching code.
4. **Third-party assets:** only use assets with a clear permissive licence (for example CC0 packs from Kenney or OpenGameArt). Record the licence and source in `ASSETS.md`. **Never use assets ripped from games.**
5. **Photos and the robot render:** keep real, unpixelated.

# 10. Quality floor (non-negotiable)

**Performance**
- LCP under 2.5 s on a mid-range phone on 4G. Hero canvas code under about 30 KB gzipped. Total new image assets under about 300 KB.
- One `requestAnimationFrame` loop per canvas. Cap `devicePixelRatio` (the pixel canvas needs 1). Pause offscreen and in hidden tabs. Lazy-load the 3D viewer and the heavy interactions below the fold.
- Serve sprites as sprite sheets or SVG with `shape-rendering: crispEdges`, not as dozens of raw PNGs.

**Accessibility**
- Body text contrast at least 4.5:1, and check pixel-font UI text too. Visible focus rings on everything. Real `<button>` and `<a>` elements. Meaningful alt text for informative sprites, empty alt for decorative ones. Dialogs have focus management and `Esc`. Never rely on color alone.
- Pixel fonts are hard to read: minimum 16px for Press Start 2P headings in practice, and never use it for paragraphs.

**Responsive**
- Test at 375, 768, 1280 and 1920. On screens under 640px show only the XP bar and a compact bottom nav, no hotbar, no custom cursor, simplified parallax. Make sure the HUD never covers content or collides with the back-to-top button.

**Code quality**
- Components typed in TypeScript. Tokens in CSS variables only. No inline magic numbers outside `--px` multiples. Avoid CSS specificity fights (this codebase mixes Tailwind utilities and custom classes; document the layering and keep one source of truth per component).
- Remove or migrate old classes you replace. Do not leave two competing card systems.

# 11. Phases and acceptance criteria

Do one phase per run. After each phase, report what changed and show screenshots.

- **Phase 0, Audit and plan (no code):** screenshots of the current site; the design plan from Section 3 (palette, type roles, ASCII wireframes for each section); a list of files you will touch; risks. *Accept when:* I approve the plan.
- **Phase 1, Tokens and primitives:** `pixel-tokens.css`, textures, icon sprite sheet, all Section 6 components, and the `/dev/pixel` showcase. *Accept when:* every component has default, hover, active, focus, disabled states and passes contrast.
- **Phase 2, Hero, nav and HUD:** title-screen hero, hotbar nav with section tracking, XP bar, toasts, reduced-motion handling. *Accept when:* it runs at 60 fps on a mid-range laptop, mobile layout is clean, and the normal navbar still works without JS enhancements.
- **Phase 3, Landing sections:** Sections 7.2, 7.4, 7.5, 7.6 reskinned, dividers added, body text moved to the readable font. *Accept when:* no old navy-card pattern remains on the landing page.
- **Phase 4, Robot, subpages, states:** Section 7.3, `/resources`, `/blog`, 404, loading, empty states. *Accept when:* the GLB viewer behaves exactly as before and the data pages still load from the CMS.
- **Phase 5, Game layer and polish:** command palette, inventory, advancements, sound, easter eggs, then performance and accessibility passes. *Accept when:* Lighthouse performance and accessibility are both 90+ on mobile for the landing page, and keyboard-only use covers every feature.

# 12. References (study these, then adapt, don't copy)

Pixel-art web design:
- Sage Agency, "Retro Web Design Is Winning in 2026": https://sage.agency/blog/websites-that-use-cool-pixel-art-design/. Key lesson: pixel art works as a full system (type, icons, buttons, transitions) and fails when half-committed, ignores accessibility, or is served as raw scaled PNGs.
- Stardew Valley: https://www.stardewvalley.net. Pixel art as brand DNA across the whole site.
- Eastward: https://www.eastwardgame.com. Pixel art as the interface itself.
- Children of Morta: https://www.childrenofmorta.com. A conventional opening, then a large pixel artwork that sets mood.
- Inmost: https://www.inmostgame.com. Shows pixel art can carry slow, atmospheric tone, useful for the dark cave sections.

Interactive and gamified sites:
- Bruno Simon's portfolio: https://bruno-simon.com (Awwwards Site of the Year 2019). Navigation as play. Open-source newer version: https://github.com/brunosimon/folio-2025. His case study is linked from his Medium profile.
- A Minecraft-themed website built in plain HTML/CSS/JS with HUD, hotbar, inventory (`E`) and chat commands: https://github.com/mxpus521/world. Check its licence before reusing any code, and use it as an interaction reference only.

Typography and art tools:
- Press Start 2P and Pixelify Sans on Google Fonts (check glyph coverage, see Section 5).
- Pixel art tools: Aseprite, Piskel, Lospec Pixel Editor. Lospec's palette list for tuning the palette.
- CC0 asset packs: Kenney (kenney.nl), OpenGameArt (opengameart.org). Verify each pack's licence.

Technique notes to search when stuck: CSS `image-rendering: pixelated`; canvas low-resolution upscaling; ordered (Bayer) dithering; box-shadow bevels; `prefers-reduced-motion`; WAI-ARIA dialog pattern.

# 13. How to report back

For every phase: (1) a short summary of what you built and why each design choice fits this brief, (2) the list of files changed, (3) screenshots at the four widths, (4) performance and accessibility numbers if you ran them, (5) anything you were unsure about or deferred. Do not claim a check passed if you did not run it. If a requirement conflicts with another (for example sound vs accessibility), say so and propose a choice instead of silently picking one.
