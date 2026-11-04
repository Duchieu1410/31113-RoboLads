'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdvancements } from './AdvancementContext';
import { PixelPanel } from './PixelPanel';
import { PixelButton } from './PixelButton';
import { playPixelSound, isSoundEnabled, setSoundEnabled } from '@/lib/pixel-sound';
import { ROUTES } from '@/routes';

interface LogLine {
  id: number;
  text: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'input';
  link?: string;
}

interface SearchItem {
  title: string;
  category: string;
  desc: string;
  href: string;
  keywords: string[];
}

const SEARCH_INDEX: SearchItem[] = [
  {
    title: 'Chassis Architecture (Mecanum DT)',
    category: 'Robot Subsystem',
    desc: 'Pocketed 6061-T6 aluminum plates, 4x GoBILDA Yellow Jacket 19.2:1 planetary motors.',
    href: '/#robot-target',
    keywords: ['chassis', 'mecanum', 'drivetrain', 'drive', 'aluminum', 'plates', 'gobilda', 'motor'],
  },
  {
    title: 'Multi-Stage Linear Slide (Specimen Lift)',
    category: 'Robot Subsystem',
    desc: 'Misumi SAR3 telescopic rails with continuous UHMWPE rigging and constant-force spring return.',
    href: '/#robot-target',
    keywords: ['slide', 'linear', 'lift', 'specimen', 'misumi', 'rigging', 'spring', 'telescopic', 'extension'],
  },
  {
    title: 'Compliant Roller Intake (Active Intake)',
    category: 'Robot Subsystem',
    desc: 'Custom silicone compliant wheels with REV Color Sensor v3 for sample indexing and automated intake.',
    href: '/#robot-target',
    keywords: ['intake', 'roller', 'compliant', 'silicone', 'color sensor', 'sample', 'rev'],
  },
  {
    title: 'Pinpoint Odometry & IMU (Autonomous Nav)',
    category: 'Robot Subsystem',
    desc: 'Dual optical dead-wheel encoders with sub-millimeter precision and BNO055 inertial sensor heading.',
    href: '/#robot-target',
    keywords: ['odometry', 'imu', 'nav', 'autonomous', 'auto', 'dead-wheel', 'encoders', 'pinpoint', 'bno055', 'heading', 'path'],
  },
  {
    title: 'CAD Repository (Onshape Assemblies)',
    category: 'Documentation',
    desc: 'Full parametric 3D Onshape models, structural plates, spacers, and mechanism subassemblies.',
    href: '/resources?category=CAD',
    keywords: ['cad', 'onshape', '3d', 'model', 'assembly', 'step', 'drawings'],
  },
  {
    title: 'Mechanical Specifications & Belt Stages',
    category: 'Documentation',
    desc: 'Gear ratios, HTD 3M timing belts, ball bearings, shaft collars, and hardware specs.',
    href: '/resources?category=Mechanical',
    keywords: ['mechanical', 'gear', 'belt', 'htd', 'bearings', 'hardware', 'ratio', 'pulley'],
  },
  {
    title: 'Programming Repository & Autonomous Routines',
    category: 'Documentation',
    desc: 'Road Runner path planning routines, teleop driving controls, PID tuning, and FTC SDK firmware.',
    href: '/resources?category=Programming',
    keywords: ['programming', 'code', 'road runner', 'autonomous', 'teleop', 'pid', 'firmware', 'java', 'sdk'],
  },
  {
    title: 'Failure Log // Post-Mortem Engineering Advancements',
    category: 'Documentation',
    desc: 'Detailed competition failure logs, root cause analysis, and iterative engineering fixes.',
    href: '/resources?category=Failure%20Log',
    keywords: ['failure', 'failure log', 'bug', 'breakage', 'post-mortem', 'engineering advancement'],
  },
  {
    title: 'Team Story & Engineering Origins',
    category: 'About',
    desc: 'From high school builders in Hanoi to national competitive FTC arena.',
    href: '/#about-target',
    keywords: ['about', 'story', 'hsgs', 'origins', 'history', 'team', 'members'],
  },
  {
    title: 'Outreach & Competition Quests',
    category: 'Activities',
    desc: 'STEM workshops, community mentoring, and tournament championship matches.',
    href: '/#activities-target',
    keywords: ['activities', 'outreach', 'quests', 'tournaments', 'workshops', 'mentoring', 'competitions'],
  },
  {
    title: 'Team Written Book & Competition Logs',
    category: 'Blog',
    desc: 'Written build logs, match reflections, and technical deep-dives.',
    href: '/blog',
    keywords: ['blog', 'written book', 'logs', 'articles', 'posts', 'updates'],
  },
];

function isTyping(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
}

export function CommandPalette() {
  const router = useRouter();
  const {
    isCommandPaletteOpen,
    openCommandPalette,
    closeCommandPalette,
    openInventoryModal,
    openAdvancementsModal,
    unlock,
  } = useAdvancements();

  const [inputVal, setInputVal] = useState('');
  const [logs, setLogs] = useState<LogLine[]>([
    {
      id: 1,
      text: 'HSGS RoboLads Terminal v2.5 [FTC #31113]. Type /help for available commands.',
      type: 'info',
    },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Global keydown listener for `/` and `T`
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === '/' || e.key === 't' || e.key === 'T') {
        e.preventDefault();
        openCommandPalette();
        if (e.key === '/') {
          setInputVal('/');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openCommandPalette]);

  // Focus input when opened and scroll to bottom of logs
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        if (inputRef.current && inputVal === '/') {
          inputRef.current.setSelectionRange(1, 1);
        }
      }, 40);
    }
  }, [isCommandPaletteOpen, inputVal]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Handle Esc
  useEffect(() => {
    if (!isCommandPaletteOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeCommandPalette();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isCommandPaletteOpen, closeCommandPalette]);

  const addLog = (text: string, type: LogLine['type'] = 'info', link?: string) => {
    setLogs((prev) => [...prev, { id: Date.now() + Math.random(), text, type, link }]);
  };

  const handleCommand = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;

    addLog(`> ${cmd}`, 'input');
    unlock('console');

    const clean = cmd.replace(/^\/+/, '').toLowerCase();
    const parts = clean.split(/\s+/);
    const action = parts[0];
    const arg = parts[1];

    switch (action) {
      case 'help': {
        playPixelSound('command');
        addLog('Available commands:', 'info');
        addLog('  /time day|sunset|night - Evolve world lighting & sky ambiance', 'info');
        addLog('  /search <query> - Search CAD, odometry, subsystems & resources', 'info');
        addLog('  /cerberus    - Unleash the Cerberus mascot speed run easter egg', 'info');
        addLog('  /robot       - Teleport to 3D DecodeBot CAD Stage', 'info');
        addLog('  /about       - Jump to Team Origins & Story', 'info');
        addLog('  /activities  - View Core Outreach & Engineering Quests', 'info');
        addLog('  /resources   - Open Engineering Documentation Repository', 'info');
        addLog('  /blog        - Open Team Blog & Build Logs', 'info');
        addLog('  /spawn       - Teleport to world spawn (top of page)', 'info');
        addLog('  /bedrock     - Teleport to bedrock layer (footer)', 'info');
        addLog('  /sound on|off|toggle - Control 8-bit Web Audio SFX', 'info');
        addLog('  /inventory   - Open Player Inventory (Hotbar key: E)', 'info');
        addLog('  /clear       - Clear terminal history', 'info');
        break;
      }

      case 'time': {
        const target = arg ? arg.toLowerCase() : 'cycle';
        const validTimes = ['day', 'sunset', 'night'];
        let chosenTime: 'day' | 'sunset' | 'night';

        if (target === 'cycle' || !arg) {
          const current = (typeof window !== 'undefined' && (window as any).__pixel_time) || 'night';
          const seq: Array<'day' | 'sunset' | 'night'> = ['day', 'sunset', 'night'];
          const nextIdx = (seq.indexOf(current) + 1) % seq.length;
          chosenTime = seq[nextIdx];
        } else if (validTimes.includes(target)) {
          chosenTime = target as 'day' | 'sunset' | 'night';
        } else {
          addLog(`Invalid time "${arg}". Valid options: /time day, /time sunset, /time night, or /time cycle`, 'warn');
          break;
        }

        if (typeof window !== 'undefined') {
          (window as any).__pixel_time = chosenTime;
          window.dispatchEvent(new CustomEvent('pixel-time-change', { detail: { time: chosenTime } }));
        }

        playPixelSound('fanfare');
        unlock('time_traveler');

        const descriptions = {
          day: 'DAY [Solar Noon / 12:00] — High-angle sun, vibrant sky',
          sunset: 'SUNSET [Golden Hour / 18:00] — Warm amber key with crimson rim',
          night: 'NIGHT [Midnight / 00:00] — High-contrast cyan moonlight & gold rim',
        };

        addLog(`World time set to ${descriptions[chosenTime]}`, 'success');
        break;
      }

      case 'cerberus':
      case 'mascot': {
        playPixelSound('fanfare');
        unlock('konami');
        addLog('Unleashing Cerberus speed run protocol across the world...', 'success');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('pixel-cerberus-trigger'));
        }
        break;
      }

      case 'search':
      case 'find': {
        const query = parts.slice(1).join(' ').trim();
        if (!query) {
          addLog('Usage: /search <query> (e.g. /search cad, /search odometry, /search slide, /search failure)', 'warn');
          break;
        }

        playPixelSound('command');
        addLog(`Searching documentation & engineering repository for "${query}"...`, 'info');

        const q = query.toLowerCase();
        const matches = SEARCH_INDEX.filter((item) => {
          return (
            item.title.toLowerCase().includes(q) ||
            item.desc.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.keywords.some((k) => k.toLowerCase().includes(q) || q.includes(k.toLowerCase()))
          );
        });

        // Search live API asynchronously
        fetch(`/api/resources?tag=${encodeURIComponent(query)}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            const apiItems: any[] = data?.data || [];
            const apiMatches = apiItems.filter((item) =>
              item.title?.toLowerCase().includes(q) ||
              item.category?.toLowerCase().includes(q) ||
              item.tags?.some((t: string) => t.toLowerCase().includes(q))
            );

            const total = matches.length + apiMatches.length;
            if (total === 0) {
              addLog(`No resources found matching "${query}". Try searching: cad, odometry, slide, failure, or programming`, 'warn');
              return;
            }

            addLog(`Found ${total} resource(s) matching "${query}":`, 'success');
            matches.forEach((m) => {
              addLog(`[${m.category}] ${m.title} — Click to open`, 'info', m.href);
            });
            apiMatches.forEach((m) => {
              addLog(`[Sanity // ${m.category || 'Asset'}] ${m.title} — Click to open`, 'info', `/resources?category=${encodeURIComponent(m.category || '')}`);
            });
          })
          .catch(() => {
            if (matches.length === 0) {
              addLog(`No resources found matching "${query}". Try searching: cad, odometry, slide, failure, or programming`, 'warn');
            } else {
              addLog(`Found ${matches.length} resource(s) matching "${query}":`, 'success');
              matches.forEach((m) => {
                addLog(`[${m.category}] ${m.title} — Click to open`, 'info', m.href);
              });
            }
          });
        break;
      }

      case 'robot':
      case 'cad': {
        playPixelSound('command');
        addLog('Teleporting to 3D DecodeBot CAD Stage...', 'success');
        closeCommandPalette();
        const el = document.getElementById('robot-target');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          router.push('/#robot-target');
        }
        break;
      }

      case 'about':
      case 'story': {
        playPixelSound('command');
        addLog('Teleporting to Team Origins...', 'success');
        closeCommandPalette();
        const el = document.getElementById('about-target');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          router.push('/#about-target');
        }
        break;
      }

      case 'activities':
      case 'quests': {
        playPixelSound('command');
        addLog('Teleporting to Quest Board...', 'success');
        closeCommandPalette();
        const el = document.getElementById('activities-target');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          router.push('/#activities-target');
        }
        break;
      }

      case 'resources':
      case 'res': {
        playPixelSound('command');
        addLog('Navigating to Engineering Resources Repository...', 'success');
        closeCommandPalette();
        router.push(ROUTES.RESOURCES);
        break;
      }

      case 'blog': {
        playPixelSound('command');
        addLog('Navigating to Written Book Library / Blog...', 'success');
        closeCommandPalette();
        router.push(ROUTES.BLOG);
        break;
      }

      case 'spawn':
      case 'top': {
        playPixelSound('command');
        addLog('Teleported to spawn.', 'success');
        closeCommandPalette();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      }

      case 'bedrock': {
        playPixelSound('command');
        addLog('Descending to bedrock layer...', 'success');
        closeCommandPalette();
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        break;
      }

      case 'sound':
      case 'sfx': {
        if (arg === 'on') {
          setSoundEnabled(true);
          playPixelSound('fanfare');
          addLog('Sound effects ENABLED [Web Audio active].', 'success');
        } else if (arg === 'off') {
          setSoundEnabled(false);
          addLog('Sound effects MUTED.', 'warn');
        } else if (arg === 'toggle' || !arg) {
          const current = isSoundEnabled();
          setSoundEnabled(!current);
          if (!current) playPixelSound('fanfare');
          addLog(`Sound effects toggled to: ${!current ? 'ENABLED' : 'MUTED'}.`, 'info');
        } else {
          addLog(`Unknown parameter "${arg}". Use: /sound on, /sound off, or /sound toggle`, 'warn');
        }
        break;
      }

      case 'inv':
      case 'inventory': {
        playPixelSound('open');
        closeCommandPalette();
        openInventoryModal();
        break;
      }

      case 'clear':
      case 'cls': {
        setLogs([
          {
            id: Date.now(),
            text: 'Terminal cleared. Type /help for available commands.',
            type: 'info',
          },
        ]);
        break;
      }

      default: {
        playPixelSound('error');
        addLog(`Unknown command "/${clean}". Type /help for valid operations.`, 'error');
        break;
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    handleCommand(inputVal);
    setInputVal('');
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeCommandPalette();
        }
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command Console"
        className="w-full max-w-xl max-h-[70vh] flex flex-col"
      >
        <PixelPanel variant="night" className="flex flex-col max-h-[65vh] p-3 sm:p-4 bg-stone-950/95 border-amber-600/70">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-stone-800 text-xs font-pixel">
            <span className="text-amber-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-emerald-400 animate-pulse" />
              TERMINAL // COMMAND PALETTE
            </span>
            <div className="flex items-center gap-2 text-stone-400 font-pixelify text-xs">
              <span className="hidden sm:inline">Press ESC to exit</span>
              <button
                type="button"
                onClick={closeCommandPalette}
                className="text-stone-300 hover:text-white px-1.5 py-0.5 border border-stone-700 bg-stone-900 cursor-pointer"
                aria-label="Close terminal"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Logs */}
          <div
            ref={logContainerRef}
            className="flex-1 overflow-y-auto font-mono text-xs p-2 my-2 bg-black/80 border border-stone-900 space-y-1 min-h-[140px] max-h-[300px]"
            tabIndex={0}
            aria-label="Terminal output log"
          >
            {logs.map((log) => {
              let color = 'text-stone-300';
              if (log.type === 'success') color = 'text-emerald-400';
              if (log.type === 'warn') color = 'text-amber-400';
              if (log.type === 'error') color = 'text-red-400';
              if (log.type === 'input') color = 'text-yellow-300 font-semibold';

              if (log.link) {
                return (
                  <div key={log.id} className="leading-relaxed">
                    <button
                      type="button"
                      onClick={() => {
                        playPixelSound('click');
                        closeCommandPalette();
                        if (log.link!.startsWith('/#')) {
                          const id = log.link!.replace('/#', '');
                          const el = document.getElementById(id);
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth' });
                          } else {
                            router.push(log.link!);
                          }
                        } else {
                          router.push(log.link!);
                        }
                      }}
                      className="text-left font-mono text-xs text-amber-300 hover:text-white underline cursor-pointer hover:bg-stone-800/80 px-1 py-0.5 rounded-xs transition-colors"
                    >
                      {log.text}
                    </button>
                  </div>
                );
              }

              return (
                <div key={log.id} className={`${color} leading-relaxed break-all`}>
                  {log.text}
                </div>
              );
            })}
          </div>

          {/* Prompt Form */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-2 border-t border-stone-800">
            <span className="font-pixel text-amber-400 text-xs" aria-hidden="true">
              &gt;
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Type /help, /robot, /sound on, /inventory..."
              className="flex-1 bg-stone-900 text-amber-200 border border-stone-700 font-mono text-xs px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
              aria-label="Terminal command input"
              autoComplete="off"
              spellCheck={false}
            />
            <PixelButton type="submit" variant="primary" className="text-xs py-1.5 px-3">
              Run
            </PixelButton>
          </form>
        </PixelPanel>
      </div>
    </div>
  );
}
