'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES, MAIN_NAV_ITEMS } from '@/routes';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { DecodeBotStage } from '@/components/DecodeBotStage';
import {
  Wrench,
  Zap,
  Users,
  Trophy,
  ArrowRight,
  Cpu,
  Layers,
  Crosshair,
  ChevronRight,
  Box,
  FolderGit2,
  BookOpen,
  Sun,
  Moon,
  Sunset,
} from 'lucide-react';
import {
  PixelButton,
  PixelPanel,
  Slot,
  PixelIcon,
  PixelSprite,
  SplashText,
  PixelDivider,
  useAdvancements,
  SoundToggle,
} from '@/components/pixel';
import { GlobalHeader } from '@/components/GlobalHeader';
import { GlobalFooter } from '@/components/GlobalFooter';
import { playPixelSound } from '@/lib/pixel-sound';

interface DispatchPost {
  _id: string;
  title: string;
  slug: { current: string };
  category?: string;
  excerpt?: string;
  _createdAt?: string;
}

interface CoreActivityItem {
  id: number;
  code: string;
  tag: string;
  title: string;
  subtitle: string;
  desc: string;
  highlights: string[];
  image: string;
  annotation: string;
  ctaHref: string;
  ctaLabel: string;
  icon: React.ReactNode;
}

const CORE_ACTIVITIES: CoreActivityItem[] = [
  {
    id: 0,
    code: '01',
    tag: 'CAD & MANUFACTURING',
    title: 'ROBOT DESIGN & FABRICATION',
    subtitle: 'Engineering high-performance mechanisms and structural assemblies for competition.',
    desc: 'Our mechanical squad designs full-assembly parametric CAD models in Onshape, fabricating custom pocketed side plates, precision assemblies, and competition mechanisms in the HSGS workshop.',
    highlights: [
      'Parametric Onshape CAD modeling for the complete DecodeBot assembly',
      'Custom pocketed side plates, dead-axle shafts, and polycarbonate shields',
      'Iterative mechanism testing and validation on competition field tiles',
    ],
    image: '/Photo/cad-robot.jpg',
    annotation: 'ONSHAPE CAD & FABRICATION',
    ctaHref: ROUTES.CAD,
    ctaLabel: 'LAUNCH FULL CAD LAB ⛶',
    icon: <Wrench className="w-5 h-5" />,
  },
  {
    id: 1,
    code: '02',
    tag: 'TECHNICAL TRAINING',
    title: 'WORKSHOPS & TRAINING',
    subtitle: 'Nurturing engineering talent with hands-on CAD, programming, and electronics sessions.',
    desc: 'Senior mechanical, software, and electrical leads mentor incoming HSGS members through structured hands-on sessions covering CAD fundamentals, autonomous control, and robot wiring.',
    highlights: [
      'Hands-on training in Onshape CAD, mechanical assembly, and power distribution',
      'Autonomous pathing, sensor integration, and Java/Kotlin control software labs',
      'Open technical documentation shared across our engineering repository',
    ],
    image: '/Photo/workshop.jpg',
    annotation: 'GENERATION 1 & 2 TRAINING',
    ctaHref: ROUTES.RESOURCES,
    ctaLabel: 'BROWSE TECHNICAL GUIDES',
    icon: <Zap className="w-5 h-5" />,
  },
  {
    id: 2,
    code: '03',
    tag: 'STEM OUTREACH',
    title: 'COMMUNITY OUTREACH',
    subtitle: 'Delivering our Ignite Tour STEM workshops to schools and science fairs nationwide.',
    desc: 'Beyond the competition arena, HSGS RoboLads organizes interactive STEM workshops, live robot demonstrations, and open engineering resources to inspire students across Vietnam.',
    highlights: [
      'Ignite Tour STEM workshops and live robotics demonstrations at schools',
      'Interactive student driving stations and introductory engineering sessions',
      'Sharing open-source FTC guides and build logs with the robotics community',
    ],
    image: '/Photo/community.jpg',
    annotation: 'IGNITE TOUR OUTREACH',
    ctaHref: ROUTES.BLOG,
    ctaLabel: 'READ OUTREACH UPDATES',
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: 3,
    code: '04',
    tag: 'COMPETITION ARENA',
    title: 'TOURNAMENTS & MATCHES',
    subtitle: 'Showcasing engineering excellence in FTC, FARC, VORC, and international stages.',
    desc: 'Representing the High School for Gifted Students (HSGS) as FTC #31113, our drive team, pit crew, and strategists compete in domestic and international robotics tournaments.',
    highlights: [
      'Official FIRST Tech Challenge #31113 contender representing HUS High School',
      'Competing across FTC Vietnam, FARC, VORC, and international stages',
      'Collaborative alliance play rooted in gracious professionalism',
    ],
    image: '/Photo/competition.jpg',
    annotation: 'FTC #31113 COMPETITION SQUAD',
    ctaHref: ROUTES.BLOG,
    ctaLabel: 'VIEW TOURNAMENT LOGS',
    icon: <Trophy className="w-5 h-5" />,
  },
];

const RESOURCE_CATEGORIES = [
  { name: 'CAD', desc: 'Onshape assemblies, mechanisms & structural plates', href: '/resources?category=CAD' },
  { name: 'Mechanical', desc: 'Custom hardware, structural bearings & mechanism specs', href: '/resources?category=Mechanical' },
  { name: 'Programming', desc: 'Autonomous routines, teleop control & sensor code', href: '/resources?category=Programming' },
  { name: 'Failure Log', desc: 'Engineering post-mortems & iterative design fixes', href: '/resources?category=Failure%20Log' },
];

const VOXEL_BRIDGE_HEIGHTS = [14, 22, 10, 28, 18, 32, 12, 26, 30, 16, 24, 10, 28, 20, 14, 24];

export default function HomePage() {
  const [line1Text] = useState('HSGS');
  const [line2Text] = useState('ROBOLADS');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const { unlock, openAdvancementsModal, openInventoryModal } = useAdvancements();
  const bedrockRef = useRef<HTMLElement | null>(null);
  const [logoClicks, setLogoClicks] = useState(0);
  const [currentTime, setCurrentTime] = useState<'night' | 'day' | 'sunset'>('night');
  const [latestPosts, setLatestPosts] = useState<DispatchPost[]>([]);
  const [postsLoaded, setPostsLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/posts?limit=2')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setLatestPosts(res.data);
        } else {
          setLatestPosts([]);
        }
        setPostsLoaded(true);
      })
      .catch(() => {
        setLatestPosts([]);
        setPostsLoaded(true);
      });
  }, []);

  // Initial visit root advancement
  useEffect(() => {
    const t = setTimeout(() => {
      unlock('root');
    }, 1000);
    return () => clearTimeout(t);
  }, [unlock]);

  const switchVibe = useCallback((time: 'day' | 'sunset' | 'night') => {
    setCurrentTime(time);
    playPixelSound('click');
    if (typeof window !== 'undefined') {
      (window as any).__pixel_time = time;
      try {
        localStorage.setItem('pixel_vibe', time);
      } catch {}
      document.documentElement.setAttribute('data-theme', time);
      window.dispatchEvent(new CustomEvent('pixel-time-change', { detail: { time } }));
    }
  }, []);

  const cycleVibe = useCallback(() => {
    const timeSeq: Array<'night' | 'day' | 'sunset'> = ['night', 'day', 'sunset'];
    const nextTime = timeSeq[(timeSeq.indexOf(currentTime) + 1) % timeSeq.length];
    switchVibe(nextTime);
  }, [currentTime, switchVibe]);

  // Load saved vibe on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pixel_vibe') as 'day' | 'sunset' | 'night' | null;
        if (saved && (saved === 'day' || saved === 'sunset' || saved === 'night')) {
          setCurrentTime(saved);
          (window as any).__pixel_time = saved;
          document.documentElement.setAttribute('data-theme', saved);
          window.dispatchEvent(new CustomEvent('pixel-time-change', { detail: { time: saved } }));
        } else {
          document.documentElement.setAttribute('data-theme', 'night');
        }
      } catch {
        document.documentElement.setAttribute('data-theme', 'night');
      }
    }
  }, []);

  // Sync world time from pixel-time-change events
  useEffect(() => {
    const onTimeChange = (e: Event) => {
      const custom = e as CustomEvent<{ time: 'day' | 'sunset' | 'night' }>;
      if (custom.detail?.time) {
        setCurrentTime(custom.detail.time);
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', custom.detail.time);
        }
      }
    };
    window.addEventListener('pixel-time-change', onTimeChange);
    return () => window.removeEventListener('pixel-time-change', onTimeChange);
  }, []);

  const handleLogoClick = () => {
    playPixelSound('bark');
    const next = logoClicks + 1;
    setLogoClicks(next);
    if (next >= 5) {
      setLogoClicks(0);
      playPixelSound('fanfare');
      unlock('konami');
      cycleVibe();
      unlock('time_traveler');
    }
  };

  // One-shot section reveals (once: true — never reset or replay on scroll-up)
  const storySectionRef = useRef<HTMLElement | null>(null);
  const [storyRevealed, setStoryRevealed] = useState(false);

  const activitiesSectionRef = useRef<HTMLElement | null>(null);
  const [activitiesRevealed, setActivitiesRevealed] = useState(false);
  const [activeActivity, setActiveActivity] = useState<number>(0);

  // Scroll-scrubbed refs for Hero depth, Voxel Horizon Bridge, and Ambient 3D Robot Stage
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const engineeringRef = useRef<HTMLDivElement | null>(null);
  const heroBgRef = useRef<HTMLDivElement | null>(null);
  const heroCopyRef = useRef<HTMLDivElement | null>(null);
  const voxelColRefs = useRef<(HTMLDivElement | null)[]>([]);

  const router = useRouter();

  // Single-trigger IntersectionObservers for Story, Activities, Robot CAD, and Bedrock Footer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === storySectionRef.current && entry.isIntersecting) {
            setStoryRevealed(true);
            unlock('story');
            observer.unobserve(entry.target);
          }
          if (entry.target === activitiesSectionRef.current && entry.isIntersecting) {
            setActivitiesRevealed(true);
            unlock('quests');
            observer.unobserve(entry.target);
          }
          if (entry.target === engineeringRef.current && entry.isIntersecting) {
            unlock('cad_lab');
            observer.unobserve(entry.target);
          }
          if (entry.target === bedrockRef.current && entry.isIntersecting) {
            unlock('bedrock');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    if (storySectionRef.current) observer.observe(storySectionRef.current);
    if (activitiesSectionRef.current) observer.observe(activitiesSectionRef.current);
    if (engineeringRef.current) observer.observe(engineeringRef.current);
    if (bedrockRef.current) observer.observe(bedrockRef.current);
    return () => observer.disconnect();
  }, [unlock]);

  // Scroll-scrubbed choreography for Hero depth, Voxel Bridge, Ambient Companion Robot, and Top Button
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let rafPending = false;

    const updateScrollChoreography = () => {
      rafPending = false;
      const vh = window.innerHeight || 1;
      const scrollY = window.scrollY;

      // 1. Section A: Hero Depth Separation & Voxel Horizon Bridge (continuous & reversible)
      if (heroSectionRef.current && !mq.matches) {
        const heroHeight = Math.max(1, heroSectionRef.current.offsetHeight);
        const heroRatio = Math.max(0, Math.min(1, scrollY / heroHeight));

        if (heroBgRef.current) {
          const translateY = (heroRatio * 40).toFixed(1);
          const scale = (1.02 + heroRatio * 0.04).toFixed(4);
          heroBgRef.current.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
        }
        if (heroCopyRef.current) {
          const copyY = (heroRatio * -22).toFixed(1);
          heroCopyRef.current.style.transform = `translate3d(0, ${copyY}px, 0)`;
        }

        for (let i = 0; i < voxelColRefs.current.length; i++) {
          const colEl = voxelColRefs.current[i];
          if (!colEl) continue;
          const baseH = VOXEL_BRIDGE_HEIGHTS[i % VOXEL_BRIDGE_HEIGHTS.length];
          const shift = Math.round((1 - heroRatio) * (baseH * 0.65));
          colEl.style.transform = `translate3d(0, ${shift}px, 0)`;
        }
      }

      setShowTopBtn(scrollY > 450);
    };

    const onScroll = () => {
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(updateScrollChoreography);
      }
    };

    updateScrollChoreography();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const scrollToTarget = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleActivityKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      setActiveActivity((prev) => (prev + 1) % CORE_ACTIVITIES.length);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setActiveActivity((prev) => (prev - 1 + CORE_ACTIVITIES.length) % CORE_ACTIVITIES.length);
    }
  }, []);

  const currentActivity = CORE_ACTIVITIES[activeActivity] || CORE_ACTIVITIES[0];

  return (
    <div className="proto-root landing-root">
      {/* =====================================================================
          1. GLOBAL UNIFIED HEADER (TIER 1 NAVBAR + TIER 2 GAME HUD)
          ===================================================================== */}
      <GlobalHeader />

      {/* =====================================================================
          MAIN LANDMARK CONTAINER (WCAG / Axe compliant)
          ===================================================================== */}
      <main id="main-content">
        {/* =====================================================================
            SECTION A: MINECRAFT SCHOOL-GATE HERO (TITLE SCREEN)
            Vibrant Minecraft gate, Press Start 2P title, SplashText, PixelButton menu
            ===================================================================== */}
        <section className={`proto-hero proto-hero--${currentTime}`} id="hero" ref={heroSectionRef} data-time={currentTime}>
          <div className="proto-hero-bg-container" ref={heroBgRef}>
            <div className={`proto-hero-bg-layer proto-hero-bg-day ${currentTime === 'day' ? 'is-active' : ''}`} />
            <div className={`proto-hero-bg-layer proto-hero-bg-sunset ${currentTime === 'sunset' ? 'is-active' : ''}`} />
            <div className={`proto-hero-bg-layer proto-hero-bg-night ${currentTime === 'night' ? 'is-active' : ''}`} />
          </div>
          <div className="proto-hero-scrim" />

          <div className="relative z-10 w-full px-6 sm:px-12 lg:px-20 py-16 sm:py-24 flex flex-col justify-center items-start min-h-[75vh] sm:min-h-[85vh]">
            <div className="proto-hero-content w-full max-w-lg lg:max-w-xl text-left" ref={heroCopyRef}>
              <div className="mb-3">
                <span className="font-display text-[10px] sm:text-xs text-amber-400 tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                  FIRST TECH CHALLENGE #31113 • HANOI, VIETNAM
                </span>
              </div>

              <div className="relative inline-block mb-3">
                <h1 className="landing-hero-title">
                  <span className="landing-line landing-line1">{line1Text}</span>
                  <span className="landing-line landing-line2">
                    {line2Text}
                    <span className="landing-cursor" />
                  </span>
                </h1>
                <div className="hidden sm:block absolute -top-3 -right-20 md:-right-28 pointer-events-none z-20">
                  <SplashText />
                </div>
              </div>

              <p className="max-w-lg mt-3 text-sm sm:text-base text-slate-100 font-body leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                High School for Gifted Students Robotics Team (FTC #31113) — building competitive robots with precision CAD, autonomous navigation, and community STEM outreach.
              </p>

              {/* Title-Screen Menu Buttons Stack (Docked all the way to the left) */}
              <div className="mt-6 flex flex-col gap-3 w-full max-w-sm">
                <PixelButton
                  variant="primary"
                  onClick={() => {
                    setActiveActivity(0);
                    scrollToTarget('robot-target');
                  }}
                  className="w-full text-center"
                >
                  <Box className="w-4 h-4" />
                  EXPLORE 3D ROBOT
                </PixelButton>

                <PixelButton
                  variant="stone"
                  onClick={() => scrollToTarget('about-target')}
                  className="w-full text-center"
                >
                  ABOUT ROBOLADS
                </PixelButton>

                <div className="flex gap-3 w-full">
                  <PixelButton
                    half
                    href={ROUTES.RESOURCES}
                    variant="stone"
                    className="text-center text-xs"
                  >
                    RESOURCES
                  </PixelButton>
                  <PixelButton
                    half
                    href={ROUTES.BLOG}
                    variant="stone"
                    className="text-center text-xs"
                  >
                    BLOG
                  </PixelButton>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* =====================================================================
          SECTION B: TEAM STORY & VERIFIED OUTCOMES (THE WORKSHOP)
          Sleek tech rail, stone panels, item frame photos, slot-based stats
          ===================================================================== */}
      <section
        id="about-target"
        ref={storySectionRef}
        className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20"
      >
        <div className="flex items-center gap-3 mb-8">
          <PixelIcon name="compass" size={32} />
          <h2 className="font-heading text-xl sm:text-2xl text-white tracking-wide">
            OUR STORY
          </h2>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-amber-400/50 to-transparent" />
        </div>

        {/* Narrative & Real Photography in Workshop Stone Panel */}
        <PixelPanel variant="stone" className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Narrative Column */}
            <div className="lg:col-span-6 flex flex-col gap-5">
              <h3 className="font-heading text-2xl sm:text-3xl text-white leading-snug">
                ENGINEERED BY STUDENTS. TESTED IN COMPETITION.
              </h3>
              <p className="font-body text-base sm:text-lg text-slate-100 leading-relaxed">
                Founded in 2025 at the High School for Gifted Students (HSGS, Hanoi University of Science), FTC Team #31113 RoboLads began with a dedicated group of high school builders committed to engineering competitive robots from first principles.
              </p>
              <p className="font-body text-base sm:text-lg text-slate-200 leading-relaxed">
                What started as late-night Onshape CAD sessions in our campus lab has expanded into a comprehensive robotics program: pocketing custom aluminum plates, testing dead-wheel odometry, running autonomous path planning, and hosting hands-on workshops for next-generation recruits.
              </p>
            </div>

            {/* Balanced Photography Duo with Item Frames */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="px-frame">
                <div className="relative h-[260px] sm:h-[300px] overflow-hidden">
                  <ImageWithFallback
                    src="/Photo/IMG_9478.jpg"
                    alt="HSGS RoboLads Team Squad"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    fallbackTitle="HSGS ROBOLADS TEAM SQUAD"
                    fallbackIcon={<Users className="w-12 h-12" />}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-2 left-2 right-2 text-xs font-display !text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    TEAM SQUAD • HSGS CAMPUS
                  </div>
                </div>
              </div>

              <div className="px-frame">
                <div className="relative h-[260px] sm:h-[300px] overflow-hidden">
                  <ImageWithFallback
                    src="/Photo/join-us-gen2.jpg"
                    alt="Recruitment & Workshop Session"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    fallbackTitle="GENERATION 2 RECRUITS"
                    fallbackIcon={<Zap className="w-12 h-12" />}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-2 left-2 right-2 text-xs font-display !text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    GENERATION 2 • WORKSHOP
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PixelPanel>

        {/* Verified Team Outcomes: Simple Clean Slot Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <PixelPanel variant="stone" className="group flex items-start gap-4 p-5 hover:border-amber-400/60 transition-colors">
            <Slot count="40+" label="Student Engineers" className="group-hover:scale-105 transition-transform duration-200">
              <PixelIcon name="star" size={32} />
            </Slot>
            <div className="flex-1 min-w-0">
              <div className="text-base font-heading text-amber-400 group-hover:text-amber-300 transition-colors">
                STUDENT ENGINEERS
              </div>
              <p className="text-sm font-body text-slate-200 mt-1 leading-relaxed">
                Active student members across mechanical CAD, electronics, autonomous software, and media operations.
              </p>
            </div>
          </PixelPanel>

          <PixelPanel variant="stone" className="group flex items-start gap-4 p-5 hover:border-amber-400/60 transition-colors">
            <Slot count="100%" label="Custom CAD in Onshape" className="group-hover:scale-105 transition-transform duration-200">
              <PixelIcon name="gear" size={32} />
            </Slot>
            <div className="flex-1 min-w-0">
              <div className="text-base font-heading text-amber-400 group-hover:text-amber-300 transition-colors">
                CUSTOM CAD IN ONSHAPE
              </div>
              <p className="text-sm font-body text-slate-200 mt-1 leading-relaxed">
                Every bracket, chassis rail, and custom component designed from ground up with open parametric documentation.
              </p>
            </div>
          </PixelPanel>

          <PixelPanel variant="stone" className="group flex items-start gap-4 p-5 hover:border-amber-400/60 transition-colors">
            <Slot count="500+" label="Students Engaged" className="group-hover:scale-105 transition-transform duration-200">
              <PixelIcon name="book" size={32} />
            </Slot>
            <div className="flex-1 min-w-0">
              <div className="text-base font-heading text-amber-400 group-hover:text-amber-300 transition-colors">
                STUDENTS ENGAGED
              </div>
              <p className="text-sm font-body text-slate-200 mt-1 leading-relaxed">
                Inspiring junior students through hands-on STEM bootcamps, introductory robotics sessions, and public demos.
              </p>
            </div>
          </PixelPanel>
        </div>
      </section>

      {/* =====================================================================
          SECTION C: WHAT WE DO // CORE ACTIVITIES & 3D ROBOT SHOWCASE
          Quest cards with advancement connectors + Interactive 3D Model & Parchment panel
          ===================================================================== */}
      <section
        id="activities-target"
        ref={activitiesSectionRef}
        className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20"
      >
        {/* Anchor for backward compatibility with 3D robot deep links */}
        <div id="robot-target" className="relative -top-24 pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <PixelIcon name="star" size={16} />
              <span className="text-xs sm:text-sm font-display text-amber-400">WHAT WE DO</span>
            </div>
            <h2 className="activities-title text-2xl sm:text-3xl font-heading text-white">
              CORE ACTIVITIES
            </h2>
          </div>
          <p className="text-sm sm:text-base text-slate-300 max-w-md font-body leading-relaxed">
            Hands-on CAD fabrication, technical mentorship for junior recruits, nationwide STEM outreach, and competitive tournament play.
          </p>
        </div>

        <div
          onKeyDown={handleActivityKeyDown}
          className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch proto-reveal-item ${
            activitiesRevealed ? 'is-revealed' : ''
          }`}
        >
          {/* Left 5 Columns: 4 Quest Cards arranged as an Advancement Tree */}
          <div
            className="lg:col-span-5 relative flex flex-col gap-4 justify-between"
            role="tablist"
            aria-label="Core Activities"
          >
            {/* Vertical connector line representing advancement progression */}
            <div 
              className="hidden sm:block absolute left-8 top-8 bottom-8 w-[4px] bg-stone-700 -z-0"
              aria-hidden="true"
            />

            {CORE_ACTIVITIES.map((act, index) => {
              const isSelected = activeActivity === index;
              const iconMap: Record<number, 'wrench' | 'book' | 'compass' | 'sword'> = {
                0: 'wrench',
                1: 'book',
                2: 'compass',
                3: 'sword',
              };
              const iconName = iconMap[index] ?? 'star';

              return (
                <button
                  key={act.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveActivity(index)}
                  onFocus={() => setActiveActivity(index)}
                  onClick={() => setActiveActivity(index)}
                  className={`relative z-10 text-left p-4 sm:p-5 flex items-start gap-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'px-panel px-panel--stone shadow-[4px_4px_0_#000000] border-2 border-amber-400 translate-x-1'
                      : 'px-panel px-panel--night hover:border-stone-500 opacity-90 hover:opacity-100'
                  }`}
                >
                  {/* Slot Icon */}
                  <Slot selected={isSelected} label={act.tag}>
                    <PixelIcon name={iconName} size={32} />
                  </Slot>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-display text-[9px] text-amber-400 tracking-wider">
                        0{index + 1} • {act.tag}
                      </span>
                    </div>
                    <h3 className="font-heading text-sm sm:text-base text-white mb-1">
                      {act.title}
                    </h3>
                    <p className="font-body text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                      {act.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right 7 Columns: Parchment Detail Viewport (Readable Book Surface) */}
          <div
            role="tabpanel"
            className="lg:col-span-7 flex flex-col"
          >
            <PixelPanel variant="parchment" className="h-full flex flex-col justify-between p-6 sm:p-8">
              {/* Top: Image in thick pixel frame */}
              <div>
                <div className="px-frame mb-5 overflow-hidden">
                  <div
                    ref={engineeringRef}
                    className="relative h-[320px] sm:h-[380px] md:h-[440px] w-full bg-[#08081a] overflow-hidden"
                  >
                    {activeActivity === 0 ? (
                      <div className="w-full h-full relative">
                        <DecodeBotStage
                          ambientMode={true}
                          minimal={true}
                          showHotspots={false}
                          showModeToggle={false}
                          initialRenderMode="pixel"
                        />

                        {/* Small, clean button to see the full CAD */}
                        <Link
                          href={ROUTES.CAD}
                          className="absolute top-2.5 right-2.5 z-20 px-2.5 py-1 bg-stone-900/90 hover:bg-stone-800 border-2 border-stone-700 hover:border-amber-400 font-display text-[9px] text-amber-400 hover:text-amber-300 shadow-[2px_2px_0_#000] flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="See Full CAD Lab"
                          aria-label="See Full CAD Lab"
                        >
                          <Cpu className="w-3.5 h-3.5 text-amber-400" />
                          <span>FULL CAD ↗</span>
                        </Link>
                      </div>
                    ) : (
                      CORE_ACTIVITIES.map((act, index) => (
                        <div
                          key={act.id}
                          className={`proto-activity-slide ${activeActivity === index ? 'is-active' : ''}`}
                        >
                          <ImageWithFallback
                            src={act.image}
                            alt={act.title}
                            className="w-full h-full object-cover"
                            fallbackTitle={act.title}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Parchment Heading and Readable Typography */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-display text-[10px] text-slate-700 uppercase tracking-wider font-bold">
                    {currentActivity.tag}
                  </span>
                </div>
                <h3 className="font-heading text-xl sm:text-2xl text-slate-900 leading-snug mb-3">
                  {currentActivity.title}
                </h3>
                <p className="font-body text-sm sm:text-base text-slate-800 leading-relaxed mb-6">
                  {currentActivity.desc}
                </p>

                {/* Focus Areas Bullets */}
                <div className="mb-6">
                  <div className="font-display text-[10px] text-slate-700 uppercase tracking-wider mb-3 font-bold">
                    CORE FOCUS AREAS
                  </div>
                  <ul className="space-y-2">
                    {currentActivity.highlights.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 font-body text-xs sm:text-sm text-slate-900"
                      >
                        <span className="text-amber-600 font-bold text-base leading-none mt-0.5">▪</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Strip */}
              <div className="pt-5 border-t-2 border-stone-300 flex flex-wrap items-center justify-between gap-4">
                <PixelButton
                  href={currentActivity.ctaHref}
                  variant="primary"
                >
                  <span>{currentActivity.ctaLabel}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </PixelButton>
              </div>
            </PixelPanel>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION E: PUBLIC DESTINATIONS (ENGINEERING REPOSITORY & TEAM BLOG)
          Chest-Slot Category Tiles (Left) & Written Book Dispatches (Right)
          ===================================================================== */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left 7 Columns: Engineering Resources Repository & Category Chest Slots */}
          <div id="resources-target" className="lg:col-span-7 flex flex-col">
            <PixelPanel variant="stone" className="h-full flex flex-col justify-between p-6 sm:p-8">
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <PixelIcon name="chest" size={32} />
                    <span className="font-display text-[10px] sm:text-xs text-amber-400 font-bold">RESOURCE CATEGORIES</span>
                  </div>
                </div>
                <h2 className="font-heading text-xl sm:text-2xl text-white mb-3">
                  ENGINEERING RESOURCES &amp; LOGS
                </h2>
                <p className="font-body text-sm text-slate-200 leading-relaxed mb-6">
                  Browse our open-source technical documentation, Onshape CAD modules, autonomous
                  programming guides, and competition failure logs published by FTC #31113.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {RESOURCE_CATEGORIES.map((cat) => {
                    const isFailureLog = cat.name === 'Failure Log';
                    const iconMap: Record<string, 'wrench' | 'gear' | 'code' | 'redstone'> = {
                      CAD: 'wrench',
                      Mechanical: 'gear',
                      Programming: 'code',
                      'Failure Log': 'redstone',
                    };
                    const iconName = iconMap[cat.name] ?? 'gear';

                    return (
                      <Link
                        key={cat.name}
                        href={cat.href}
                        className={`p-3.5 flex items-start gap-3.5 transition-all group block ${
                          isFailureLog
                            ? 'px-panel px-panel--night border-2 border-amber-400/80 hover:border-amber-400 shadow-[2px_2px_0_#000]'
                            : 'px-panel px-panel--night hover:border-stone-400 shadow-[2px_2px_0_#000]'
                        }`}
                      >
                        <Slot count={isFailureLog ? '★' : undefined} label={cat.name} className="group-hover:scale-105 transition-transform duration-200">
                          <PixelIcon name={iconName} size={32} />
                        </Slot>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`font-display text-[10px] font-bold ${
                              isFailureLog ? 'text-amber-400' : 'text-amber-400 group-hover:text-amber-300 transition-colors'
                            }`}>
                              {cat.name.toUpperCase()}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
                          </div>
                          <p className="font-body text-xs text-slate-300 mt-1 leading-snug">{cat.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t-2 border-stone-600 flex flex-wrap items-center gap-3">
                <PixelButton href={ROUTES.RESOURCES} variant="primary">
                  <span>OPEN FULL RESOURCES CATALOG</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </PixelButton>
                <PixelButton href={ROUTES.PORTFOLIOS} variant="stone">
                  <span>FTC PORTFOLIO HUB</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </PixelButton>
              </div>
            </PixelPanel>
          </div>

          {/* Right 5 Columns: Team Blog & Dispatches */}
          <div id="blog-target" className="lg:col-span-5 flex flex-col">
            <PixelPanel variant="parchment" className="h-full flex flex-col justify-between p-6 sm:p-8">
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <PixelIcon name="book" size={32} />
                    <span className="font-display text-[10px] sm:text-xs text-slate-900 font-bold">TEAM DISPATCHES</span>
                  </div>
                </div>
                <h2 className="font-heading text-xl sm:text-2xl text-slate-900 mb-3">
                  BUILD LOGS &amp; UPDATES
                </h2>
                <p className="font-body text-sm text-slate-700 leading-relaxed mb-6">
                  Follow our engineering milestones, tournament post-mortems, and Ignite Tour outreach
                  stories directly from the HSGS robotics workshop.
                </p>

                {/* Dispatch Entries */}
                <div className="space-y-3 mb-6">
                  {latestPosts.length > 0 ? (
                    latestPosts.map((post) => (
                      <Link
                        key={post._id}
                        href={ROUTES.BLOG_POST(post.slug?.current || '')}
                        className="block p-3.5 bg-amber-50/90 border-2 border-stone-300 hover:border-amber-500 transition-colors group"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-display text-[8px] sm:text-[9px] text-slate-700 font-bold">
                            {post.category ? post.category.toUpperCase() : 'WORKSHOP LOG'}
                            {post._createdAt &&
                              ` • ${new Date(post._createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                          </span>
                          <span className="font-display text-[8px] text-slate-700 font-bold group-hover:text-amber-700 group-hover:translate-x-1 transition-all">
                            READ →
                          </span>
                        </div>
                        <h3 className="font-heading text-sm text-slate-900 group-hover:text-amber-800 transition-colors line-clamp-1">
                          {post.title}
                        </h3>
                        <p className="font-body text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                          {post.excerpt || 'Read the full dispatch from RoboLads Team #31113.'}
                        </p>
                      </Link>
                    ))
                  ) : postsLoaded ? (
                    <div className="p-4 bg-amber-50/70 border-2 border-stone-300 text-center">
                      <p className="font-body text-xs text-slate-700">
                        No published dispatches yet. Check back soon for competition logs and workshop updates!
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50/50 border-2 border-stone-300 text-center animate-pulse">
                      <span className="font-display text-[9px] text-slate-700">
                        FETCHING LATEST DISPATCHES...
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t-2 border-stone-300">
                <PixelButton href={ROUTES.BLOG} variant="stone">
                  <span>READ TEAM BLOG</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </PixelButton>
              </div>
            </PixelPanel>
          </div>
        </div>
      </section>
      </main>

      {/* =====================================================================
          6. PRODUCTION SITE FOOTER (THE BEDROCK LAYER)
          Clean public navigation & Bedrock Player Stats
          ===================================================================== */}
      <GlobalFooter ref={bedrockRef} />

      {/* =====================================================================
          7. BACK TO TOP BUTTON
          ===================================================================== */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`btn-to-top ${showTopBtn ? 'visible' : ''}`}
        title="Back to Top"
        aria-label="Back to Top"
      >
        ▲ TOP
      </button>
    </div>
  );
}
