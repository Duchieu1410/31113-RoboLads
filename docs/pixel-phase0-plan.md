# Pixel redesign – Phase 0: audit and plan (no code changed)

Screenshots of the current site (dev server, full page, JPEG): `docs/pixel-audit/home-375.jpeg`, `home-768.jpeg`, `home-1280.jpeg`, `home-1920.jpeg`.
Caveat: full-page capture does not trigger scroll/lazy reveals, so the 3D viewer and Core Activities show as empty areas. Those are capture artifacts, not confirmed bugs.
`assets/reference/pixel-0*.png` is an unrelated third-party reference page (not our site).

## 1. Audit findings

| Area | Finding |
|---|---|
| Stack | Next 16 App Router, React 19, Tailwind 4, three 0.186, next-sanity. Landing is one 50 KB client component `web/src/app/page.tsx` + 32 KB `landing.css`. |
| Duplicate/dead code | `web/src/app/prototype/` (43 KB page + CSS) and `web/main-page/` (static HTML) are older prototypes. Competing style systems = risk of "two card systems". |
| Color | ~56 raw hex in `page.tsx`, ~184 in `landing.css`. Existing tokens in `globals.css` (`--color-accent #ffcc00`, `--background #08081a`) differ from the spec (`#fbbf24`, `#060816`). |
| Shape | 9 `border-radius` in `landing.css`, 17 `rounded` classes in TSX. Spec forbids all radius. |
| Type | `globals.css` sets Pixelify Sans as the body font and `--font-inter` maps to Pixelify first, so Inter is effectively unused. All paragraphs are small pixel text. |
| Icons | `lucide-react` smooth SVGs throughout. |
| Hero | Background is `/Photo/mcrrbl.png` (2.5 MB), a **Minecraft-style render of the school gate**. Conflicts with "no Minecraft textures" if it is a Minecraft screenshot, and it blows the 300 KB asset budget and LCP. Needs a decision (see Questions). |
| Language | `<html lang="vi">`, but copy is English only. Should become `lang="en"`. |
| Interaction | Hover + tab clicks only. 27 `useEffect/aria/keydown` hits in `page.tsx`, so some keyboard handling exists and must be preserved. |
| Mascot | Spec says the Cerberus reference is in `assets/Photo`. I did **not** find a file named for it (`logo.png`, `mcrrbl.png`, `ye/`, `IMG_*`). Please point me to it. |
| Repo state | `git status` shows `.env` modified and many `Photo/IMG_*` deleted in the working tree. I will not touch these. |
| Tooling | Dev server is running on :3000. Playwright is **not installed** (npx refused). Screenshots were taken via Chrome DevTools MCP. Lighthouse/axe/`next build` were **not run** in Phase 0. |

## 2. Design plan

**Subject:** HSGS RoboLads, FTC #31113, Hanoi. Audience: judges, sponsors, rookie teams. Job: show the team, the robot, and resources in two clicks.

### Palette (core 6, all from the spec tokens)
| Name | Hex | Use |
|---|---|---|
| Night | `#060816` | page and cave backdrop |
| Stone | `#3c3c46` (`--stone-700`) | default panels, with `--stone-900` and `--bedrock` for depth |
| Grass | `#5fa332` | story-section top edge, XP fill |
| Dirt | `#8a5a2e` | story panels, loading screen |
| Gold | `#fbbf24` | brand accent, primary buttons, first tooltip line |
| Diamond | `#3be0d0` | focus rings and links only |

Support: `--parchment #e8d9a8` (reading surfaces), `--redstone #d33a2c` (404/errors), `--cobalt #2b4fb8` (sparingly). Defined only in `styles/pixel-tokens.css`, mapped to Tailwind via `@theme`. The old `--color-*` tokens in `globals.css` get aliased, then removed.

### Type roles
| Role | Font | Rule |
|---|---|---|
| Logo, hero title, buttons, HUD numbers | Press Start 2P | 16/24/32 px only, short strings |
| Section headings, card titles | Pixelify Sans | sentence/Title Case |
| Body, anything over one line | Inter, 16 px+, line-height 1.6, max 70ch | replaces pixel paragraphs |

Press Start 2P is Latin-only. Copy is English-only, so no diacritic problem. I will change `lang` to `en` and drop the Vietnamese subset from Inter if you confirm.

### Layout concept: one world, six screens
Left-aligned content on a 4 px grid, one column of reading text per panel, no centered card grids. Boldness is spent on the hero (pixel canvas) and the HUD. Everything else is quiet.

```
HERO (title screen)                    STORY (overworld)
+--------------------------------+     ~~~~ grass line (divider) ~~~~
| logo        [1][2][3][4][5]    |     +-dirt panel-------------------+
|  sky/stars/moon (320x180 cnv)  |     | Heading (Pixelify)            |
|  HSGS            *splash*      |     | Body (Inter, 70ch)  [frame]   |
|  ROBOLADS_                     |     |                     [frame]   |
|  FTC #31113 // Hanoi           |     | [40][100][500] slots+tooltips |
|  [Explore 3D robot]            |     +-------------------------------+
|  [About RoboLads]              |
|  [Resources][Blog]             |     ROBOT (smithing table)
|  grass strip + Cerberus sprite |     +-night panel w/ rivets--------+
+--------------------------------+     | GLB viewer (unchanged)        |
                                       |  loading = dirt screen + bar  |
QUESTS (activities)                    +-[SYS01][SYS02][SYS03][SYS04]--+
 [Quest1]--[Quest2]--[Quest3]--[Quest4]   tooltip + spec list panel
 +-parchment book: photo frame | body | bullets-+

CHEST + LIBRARY                        BEDROCK (footer)
 [CAD][Mech][Prog][Failure Log] slots   +-bedrock texture---------------+
 blog = written-book entries            | player-stats panel | menu links|
 Failure Log = "Lessons learned"        +-------------------------------+
```

### Principles
1. One system: `PixelPanel`/`Slot`/`PixelButton` replace every card. No radius, 4 px steps.
2. Pixel styling in the frame, never in paragraphs.
3. Feedback over decoration: press, focus, toast, XP respond to the visitor; only the hero moves on its own.
4. Original assets only, generated in code (procedural textures, array-drawn 16x16 icons, placeholder sprites marked `TODO(art)`).
5. Every game feature is optional; the plain navbar, links and keyboard paths always work.

### Review against the brief (what I revised)
- First draft used a centered title with a three-slot hotbar-only nav. Revised: a normal top nav stays (spec §6.7), the hotbar is desktop-scroll-only.
- First draft gave every section a label above the heading. Cut. Eyebrows survive only in HUD/button contexts.
- First draft used fade-up on sections. Replaced by: hero sequence + action-driven feedback only.
- Quest cards were an even 4-up grid. Revised to a connected advancement path with one selected state, so the structure encodes the "selected" information.
- Hero image: proposed replacing the 2.5 MB Minecraft-style render with the generated canvas world (the spec's design).

## 3. Files I expect to touch (by phase)

| Phase | New | Changed | Removed/migrated |
|---|---|---|---|
| 1 | `web/src/styles/pixel-tokens.css`, `web/src/components/pixel/*` (PixelPanel, PixelButton, Slot, Tooltip, Toast, XPBar, Hotbar, PixelDivider, SplashText, PixelIcon), `pixel-icons.ts`, `textures.ts`, `app/dev/pixel/page.tsx`, `ASSETS.md` | `globals.css`, `layout.tsx` (lang, fonts) | — |
| 2 | `components/pixel/HeroWorld.tsx` (canvas), sprite data | `page.tsx` hero + nav, `BlockyHeader.tsx` | old hero CSS |
| 3 | — | `page.tsx` sections, `BlockyFooter.tsx`, `landing.css` | old navy-card classes |
| 4 | `app/not-found.tsx`, `loading.tsx` | `DecodeBotStage.tsx` (frame/loading UI only), `resources/page.tsx`, `blog/page.tsx`, `[id]`/`[slug]` | — |
| 5 | Advancement/Command/Inventory/Sound providers | `layout.tsx`, `page.tsx` | — |

Never touched: `src/lib/*`, `src/sanity/*`, `src/app/api/*`, `Robot3DCanvas.tsx`, GLB loading/orbit logic, `.env`, git-deleted Photo files.
`DecodeBotStage.tsx` (32 KB) also contains UI; Phase 4 will touch only its wrapper/loading markup.

## 4. Risks

1. **Hero asset licensing/size:** Minecraft-style render (2.5 MB) vs. brief. Needs your decision.
2. **Monolith `page.tsx` (50 KB)** mixing logic and markup. Reskinning risks breaking tab keyboard behavior. Mitigation: extract sections before restyling, keep handlers intact, test arrow keys.
3. **Style-system collision:** Tailwind utilities + 32 KB `landing.css` + `prototype.css`. Mitigation: documented layers (`tokens` → `pixel components` → utilities), delete replaced classes per phase.
4. **Single WebGL context:** hero is 2D canvas only, per spec.
5. **LCP/perf:** dither + parallax on mobile, new asset budget 300 KB. Mitigation: 320x180 canvas, rAF pause offscreen, reduced-motion static frame.
6. **Contrast:** gold on stone and pixel-font text at small sizes. Will be measured in Phase 1.
7. **Tooling gap:** no Playwright, so the 4-width screenshots rely on Chrome DevTools MCP. Lighthouse/axe need to be run at Phase 1 and later.
8. **Dirty git tree:** `.env` modified and deleted photos; commits should be selective.
9. **Cerberus art:** reference not located; sprite will be a placeholder until supplied.

## 5. Questions for approval

1. Hero image `mcrrbl.png`: is it a Minecraft screenshot? Retire it for the canvas world, or keep it as a team-photo-style element (compressed)?
2. Where is the Cerberus reference image?
3. OK to set `lang="en"` and remove Inter's Vietnamese subset?
4. OK to delete `app/prototype` and `main-page/` once replaced, or keep them untouched?
5. Install Playwright (+ axe) as dev dependencies for verification?
