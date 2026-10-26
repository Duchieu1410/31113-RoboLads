# 🖼️ RoboLads Homepage Image Directory

This folder holds all images displayed across the **HSGS RoboLads (FTC #31113)** homepage.

You can drop your image files directly into either:
- **`D:\Robotics\31113-robolads\homepage-images\`** *(convenient shortcut in project root)*
- **`D:\Robotics\31113-robolads\web\public\Photo\`** *(Next.js public assets folder)*

Both paths point to the exact same directory!

---

## 📸 Image Filename & Placement Guide

Whenever you paste a photo with one of the filenames below, the website will **automatically load and display your real photo** (supports `.jpg`, `.png`, `.webp`, or `.jpeg`):

| Section on Homepage | Filename | Supported Formats | Recommended Size / Aspect Ratio |
| :--- | :--- | :--- | :--- |
| **Top Navbar Logo** | `logo.png` | `.png`, `.svg`, `.webp` | ~200 x 60 px (Transparent background) |
| **Hero Background** | `mcrrbl.png` | `.png`, `.jpg`, `.webp` | 1920 x 1080 px (Landscape banner) |
| **About Robolads Team** | `IMG_9478.jpg` | `.jpg`, `.png`, `.webp` | 1200 x 675 px (16:9 Team photo) |
| **Join Us Gen 2 Card** | `join-us-gen2.jpg` | `.jpg`, `.png`, `.webp` | 600 x 400 px or vertical card |
| **Activity 1: CAD & Fabrication** | `cad-robot.png` | `.png`, `.jpg`, `.webp` | 500 x 300 px (Robot CAD or chassis) |
| **Activity 2: Workshop & Training** | `workshop.jpg` | `.jpg`, `.png`, `.webp` | 500 x 300 px (Hands-on training photo) |
| **Activity 3: Community Outreach** | `community.jpg` | `.jpg`, `.png`, `.webp` | 500 x 300 px (Ignite Tour or outreach) |
| **Activity 4: Competitions** | `competition.jpg` | `.jpg`, `.png`, `.webp` | 500 x 300 px (FTC tournament or arena) |

---

## ⚡ How it Works
1. **Drop your photos**: Copy your image file and rename it to match the table above (e.g. `IMG_9478.jpg`).
2. **Instant Preview**: Refresh [`http://localhost:3000`](http://localhost:3000) to see your real photo live.
3. **Smart Fallback**: If you haven't uploaded an image yet, the site automatically displays the bundled high-tech `.svg` vector illustration so the page never looks broken or empty.
