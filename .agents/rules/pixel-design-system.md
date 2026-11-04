Pixel Design System — Non-Negotiables
1. Design direction: Build a distinctive pixel-game visual system with crisp geometry, deliberate composition, and clear hierarchy.
2. Original assets only: Use project-owned or properly licensed original assets. Do not use Minecraft/Mojang logos, characters, textures, branding, or imply affiliation.
3. Design tokens: Define all colors as CSS custom properties; do not scatter raw color values through component styles.
4. Spacing tokens: Define spacing with CSS variables in multiples of 4px. Use these tokens consistently for gaps, padding, margins, and layout spacing.
5. Square geometry: Do not use border-radius; corners remain square.
6. Typography: Use pixel fonts for display text and short labels only. Never set body text, long descriptions, or dense instructions in a pixel font.
7. Readability: Maintain strong contrast, sensible line lengths, legible body sizes, and a clear visual hierarchy.
8. Restraint: Pixel decoration must support content and interaction, not compete with them. Avoid gratuitous HUDs, badges, particles, and effects.
9. Motion: Keep transitions purposeful, responsive, reversible when scroll-linked, and respectful of prefers-reduced-motion.
10. Responsive behavior: Preserve usability on touch devices and small screens; never rely on hover as the only way to access content.
11. Accessibility: Preserve semantic HTML, keyboard access, visible focus states, and meaningful alternative text.
12. Scope protection: Do not change data fetching, application routes, the GLB viewer, or the Sanity/API layer.
13. Preserve behavior: Keep existing core functionality intact unless a change is explicitly requested and approved.
14. Verify honestly: Never claim that a check, test, or browser validation passed unless you actually ran it and observed the result.
15. Report limitations: Clearly state any checks not run, failures found, and behavior that could not be verified.
The full specification, including implementation guidance and examples, lives in docs/pixel-redesign.md.