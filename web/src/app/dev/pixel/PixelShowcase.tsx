'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import {
  AdvancementToast,
  Hotbar,
  ICON_NAMES,
  PixelButton,
  PixelDivider,
  PixelIcon,
  PixelPanel,
  Slot,
  SplashText,
  ToastProvider,
  Tooltip,
  useToast,
  XPBar,
} from '@/components/pixel';

const SWATCHES = [
  'night', 'night-panel', 'bedrock', 'stone-900', 'stone-700', 'stone-500', 'stone-300',
  'grass', 'grass-light', 'dirt', 'dirt-dark', 'gold', 'diamond', 'redstone', 'cobalt', 'parchment',
];

const bodyFont: CSSProperties = { fontFamily: 'var(--font-body)' };
const headingFont: CSSProperties = { fontFamily: 'var(--font-heading)' };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 'var(--space-12)' }}>
      <h2 style={{ ...headingFont, fontSize: 32, color: 'var(--gold)', marginBottom: 'var(--space-4)', textShadow: 'var(--shadow-text)' }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

const row: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 'var(--space-8)', alignItems: 'flex-start', padding: 'var(--space-2)' };
const cell: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', alignItems: 'flex-start' };
const cap: CSSProperties = { ...bodyFont, fontSize: 16, color: 'var(--stone-300)' };

function State({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div style={cell}>
      {children}
      <span style={cap}>{name}</span>
    </div>
  );
}

function ToastDemo() {
  const { push, muted, setMuted } = useToast();
  return (
    <div style={row}>
      <PixelButton onClick={() => push({ title: 'Achievement unlocked', message: 'Opened the CAD lab', icon: 'star' })}>
        Show a toast
      </PixelButton>
      <PixelButton onClick={() => setMuted(!muted)} aria-pressed={muted}>
        {muted ? 'Unmute toasts' : 'Mute toasts'}
      </PixelButton>
    </div>
  );
}

export function PixelShowcase() {
  const [xp, setXp] = useState(0.4);
  const [sel, setSel] = useState(0);
  const [hot, setHot] = useState('robot-target');
  const subsystems = ['Chassis', 'Drivetrain', 'Intake', 'Avionics'] as const;
  const subIcons = ['gear', 'wrench', 'pickaxe', 'code'] as const;

  return (
    <ToastProvider>
      <main style={{ background: 'var(--night)', color: 'var(--ink)', width: '100%', minHeight: '100vh', padding: 'var(--space-8)', ...bodyFont }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: 1.4, marginBottom: 'var(--space-8)', textShadow: 'var(--shadow-text)' }}>
            Pixel primitives
          </h1>

          <Section title="Color tokens">
            <div style={row}>
              {SWATCHES.map((s) => (
                <div key={s} style={{ ...cell, width: 96 }}>
                  <span style={{ width: 96, height: 48, background: `var(--${s})`, boxShadow: '0 0 0 4px var(--outline)', display: 'block' }} />
                  <span style={cap}>{s}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Type roles">
            <PixelPanel variant="night">
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 'var(--space-4)' }}>HSGS ROBOLADS</p>
              <p style={{ ...headingFont, fontSize: 32, marginBottom: 'var(--space-4)' }}>Section heading in Pixelify Sans</p>
              <p style={{ ...bodyFont, fontSize: 16, lineHeight: 1.6, maxWidth: '70ch' }}>
                Body text uses Inter at 16 px with a 1.6 line height and a line length under 70 characters, so long
                paragraphs stay comfortable to read. Pixel fonts are reserved for short labels.
              </p>
            </PixelPanel>
          </Section>

          <Section title="PixelPanel">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-8)' }}>
              <PixelPanel><strong style={headingFont}>stone</strong><p style={{ ...bodyFont, marginTop: 8 }}>Default replacement for the navy card.</p></PixelPanel>
              <PixelPanel variant="dirt"><strong style={headingFont}>dirt</strong><p style={{ ...bodyFont, marginTop: 8 }}>Overworld and loading screens.</p></PixelPanel>
              <PixelPanel variant="parchment"><strong style={headingFont}>parchment</strong><p style={{ ...bodyFont, marginTop: 8 }}>Long reading: flat, dark ink on a light surface.</p></PixelPanel>
              <PixelPanel variant="night" rivets><strong style={headingFont}>night + rivets</strong><p style={{ ...bodyFont, marginTop: 8 }}>3D viewer frame.</p></PixelPanel>
              <PixelPanel variant="bedrock"><strong style={headingFont}>bedrock</strong><p style={{ ...bodyFont, marginTop: 8 }}>Footer and stats panel.</p></PixelPanel>
            </div>
          </Section>

          <Section title="PixelButton">
            {(['stone', 'primary', 'danger'] as const).map((v) => (
              <div key={v} style={{ ...row, marginBottom: 'var(--space-6)' }}>
                <State name={`${v} / default`}><PixelButton variant={v}>Explore</PixelButton></State>
                <State name="hover"><PixelButton variant={v} forceState="hover">Explore</PixelButton></State>
                <State name="active"><PixelButton variant={v} forceState="active">Explore</PixelButton></State>
                <State name="focus-visible"><PixelButton variant={v} forceState="focus">Explore</PixelButton></State>
                <State name="disabled"><PixelButton variant={v} disabled>Explore</PixelButton></State>
              </div>
            ))}
            <div style={{ ...row, maxWidth: 560 }}>
              <PixelButton half>Resources</PixelButton>
              <PixelButton half>Blog</PixelButton>
            </div>
            <div style={{ ...row, marginTop: 'var(--space-4)' }}>
              <State name="as link"><PixelButton href="/" variant="primary">Respawn</PixelButton></State>
            </div>
          </Section>

          <Section title="Slot">
            <div style={{ ...row, gap: 'var(--space-12)' }}>
              <State name="default"><Slot label="Gear"><PixelIcon name="gear" size={32} /></Slot></State>
              <State name="stack count"><Slot count={40} label="40 students"><PixelIcon name="star" size={32} /></Slot></State>
              <State name="selected"><Slot selected count={100} interactive label="Selected"><PixelIcon name="chest" size={32} /></Slot></State>
              <State name="hover"><Slot interactive forceState="hover" label="Hover"><PixelIcon name="book" size={32} /></Slot></State>
              <State name="active"><Slot interactive forceState="active" label="Active"><PixelIcon name="sword" size={32} /></Slot></State>
              <State name="focus-visible"><Slot interactive forceState="focus" label="Focus"><PixelIcon name="compass" size={32} /></Slot></State>
              <State name="disabled"><Slot interactive disabled label="Disabled"><PixelIcon name="camera" size={32} /></Slot></State>
            </div>
            <p style={{ ...cap, margin: 'var(--space-6) 0 var(--space-3)' }}>As tabs (click to select):</p>
            <div style={{ ...row, gap: 'var(--space-8)' }}>
              {subsystems.map((s, i) => (
                <Slot key={s} interactive selected={sel === i} count={`0${i + 1}`} label={s} onClick={() => setSel(i)}>
                  <PixelIcon name={subIcons[i]} size={32} />
                </Slot>
              ))}
            </div>
          </Section>

          <Section title="Tooltip">
            <div style={{ ...row, paddingTop: 'var(--space-16)' }}>
              <State name="forced open">
                <Tooltip title="Student engineers" lines={['Active members across mechanical, electronics and software.']} forceOpen>
                  <Slot interactive label="Student engineers" count={40}><PixelIcon name="star" size={32} /></Slot>
                </Tooltip>
              </State>
              <State name="hover or focus to show; Esc closes">
                <Tooltip title="CAD" lines={['Onshape assemblies']} side="bottom">
                  <PixelButton>Hover me</PixelButton>
                </Tooltip>
              </State>
            </div>
          </Section>

          <Section title="Toast / AdvancementToast">
            <div style={{ ...row, alignItems: 'center' }}>
              <div style={{ width: 360 }}>
                <AdvancementToast title="Achievement unlocked" message="Opened the CAD lab" icon="star" />
              </div>
              <ToastDemo />
            </div>
          </Section>

          <Section title="XPBar">
            <div style={{ maxWidth: 480 }}>
              <XPBar value={xp} level={Math.max(1, Math.ceil(xp * 5))} />
              <label style={{ ...cap, display: 'block', marginTop: 'var(--space-4)' }}>
                Progress{' '}
                <input type="range" min={0} max={100} value={Math.round(xp * 100)} onChange={(e) => setXp(Number(e.target.value) / 100)} />
              </label>
            </div>
          </Section>

          <Section title="Hotbar">
            <Hotbar activeId={hot} enableKeys={false} />
            <div style={{ ...row, marginTop: 'var(--space-4)' }}>
              {['about-target', 'robot-target', 'activities-target'].map((id) => (
                <PixelButton key={id} onClick={() => setHot(id)}>Set {id.split('-')[0]}</PixelButton>
              ))}
            </div>
            <p style={{ ...cap, marginTop: 'var(--space-3)' }}>
              The live version follows the section in view and keys 1 to 5 jump to sections (wired in Phase 2).
            </p>
          </Section>

          <Section title="PixelDivider (Tech & Strata Seams)">
            <PixelDivider variant="rail" />
            <div style={{ height: 'var(--space-6)' }} />
            <PixelDivider variant="tech" />
            <div style={{ height: 'var(--space-6)' }} />
            <PixelDivider variant="strata" />
          </Section>

          <Section title="SplashText">
            <div style={{ padding: 'var(--space-8)' }}>
              <SplashText />
            </div>
          </Section>

          <Section title="PixelIcon (16x16 at 32 / 48 / 64)">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 'var(--space-6)' }}>
              {ICON_NAMES.map((n) => (
                <div key={n} style={cell}>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end' }}>
                    <PixelIcon name={n} size={32} />
                    <PixelIcon name={n} size={48} />
                    <PixelIcon name={n} size={64} />
                  </div>
                  <span style={cap}>{n}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </main>
    </ToastProvider>
  );
}
