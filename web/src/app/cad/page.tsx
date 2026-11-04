'use client';

import React from 'react';
import Link from 'next/link';
import { ROUTES } from '@/routes';
import { DecodeBotStage } from '@/components/DecodeBotStage';
import { GlobalHeader } from '@/components/GlobalHeader';
import { BlockyFooter } from '@/components/BlockyFooter';
import { useWorldTheme } from '@/lib/useWorldTheme';
import { ExternalLink, ArrowLeft, Box, Shield, Compass } from 'lucide-react';

export default function CadLabPage() {
  const { theme } = useWorldTheme();

  return (
    <div className="proto-root landing-root min-h-screen flex flex-col font-sans select-none overflow-x-hidden" data-theme={theme}>
      {/* Global Unified Header (Tier 1 Navbar + Tier 2 Game HUD) */}
      <GlobalHeader />

      {/* Main CAD Lab Body: Split Screen (Stage on Left, Technical Spec Sheet on Right) */}
      <main id="main-content" className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-118px)]">
        {/* 3D WebGL Workstation Viewport */}
        <section className="flex-1 min-h-[460px] lg:min-h-0 relative bg-[#060816]">
          <DecodeBotStage
            ambientMode={false}
            showModeToggle={true}
            initialRenderMode="cad"
          />
        </section>

        {/* CAD Assembly Overview Sidebar */}
        <aside className="w-full lg:w-[420px] xl:w-[460px] bg-[#0b0f24] border-t-2 lg:border-t-0 lg:border-l-2 border-stone-700 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-block px-2.5 py-1 bg-stone-900 border border-amber-400/80 font-pixel text-[10px] text-amber-400 shadow-[2px_2px_0_#000]">
                PARAMETRIC 3D CAD
              </span>
              <span className="font-pixel text-[9px] text-slate-400">
                FTC TEAM 31113 HSGS
              </span>
            </div>

            <h2 className="font-heading text-xl sm:text-2xl text-white font-bold leading-tight mb-2">
              DECODEBOT 2026
            </h2>
            <p className="text-sm font-semibold text-amber-300 font-body mb-5">
              Full Robot Parametric Assembly
            </p>

            <div className="bg-stone-900 border-2 border-amber-400/80 p-3.5 mb-5 shadow-[4px_4px_0_#000000] flex items-center justify-between gap-2">
              <span className="font-display text-[10px] text-slate-300 uppercase tracking-wider">
                ORIGINAL SOURCE
              </span>
              <span className="font-display text-sm font-bold text-amber-400">
                ONSHAPE CAD CLOUD
              </span>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed mb-6 font-body">
              Official 3D parametric CAD model designed by HSGS RoboLads student engineers for the FIRST Tech Challenge. Inspect the mechanical structure in real-time 3D, toggle between realistic PBR materials and Minecraft pixel shading, or use X-Ray wireframe and Exploded view modes to explore the internal assembly.
            </p>

            <div className="space-y-3 border-t-2 border-stone-800 pt-5">
              <div className="font-pixel text-[10px] text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Box className="w-3.5 h-3.5" />
                <span>INTERACTIVE INSPECTION TOOLS</span>
              </div>

              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 font-body">
                <span className="text-amber-400 font-bold mt-0.5 leading-none">▪</span>
                <div>
                  <strong className="text-white">PBR Real / Pixel Toon:</strong> Switch between photorealistic metallic materials and retro pixel-art shading.
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 font-body">
                <span className="text-sky-400 font-bold mt-0.5 leading-none">▪</span>
                <div>
                  <strong className="text-white">X-Ray Wireframe:</strong> Transparent blueprint mode to examine internal structure, brackets, and clearances.
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 font-body">
                <span className="text-amber-400 font-bold mt-0.5 leading-none">▪</span>
                <div>
                  <strong className="text-white">Exploded Assembly:</strong> Radially separate mechanical components outward from the assembly origin.
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-stone-900/80 border-2 border-stone-800 space-y-2">
              <div className="font-pixel text-[10px] text-sky-400 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                <span>ONSHAPE REPOSITORY</span>
              </div>
              <p className="text-xs text-slate-300 font-body leading-relaxed">
                The full parametric assembly model is maintained on Onshape with open team documentation, custom hardware libraries, and version-controlled part studios.
              </p>
              <div className="pt-2">
                <a
                  href="https://cad.onshape.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#2b4fb8] hover:bg-[#3b60cc] !text-white text-xs font-pixel border border-white shadow-[2px_2px_0_#000] transition-colors"
                >
                  <span>VIEW MODEL IN ONSHAPE</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t-2 border-stone-800 flex items-center justify-between gap-3 text-xs font-display text-slate-400">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>DRAG TO ROTATE • SCROLL TO ZOOM</span>
            </span>
            <Link
              href={ROUTES.HOME}
              className="text-amber-400 hover:underline font-pixel text-[10px]"
            >
              BACK TO HOME
            </Link>
          </div>
        </aside>
      </main>

      <BlockyFooter />
    </div>
  );
}
