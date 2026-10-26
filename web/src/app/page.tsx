'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ROUTES, MAIN_NAV_ITEMS, ROUTE_CATALOG } from '@/routes';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import {
  Wrench,
  Zap,
  Users,
  Trophy,
  ArrowRight,
  Compass,
  FileCode,
  ShieldAlert,
  Cpu,
  Layers,
  ChevronUp,
} from 'lucide-react';

export default function HomePage() {
  // --- Typewriter State for Hero Section ---
  const [line1Text, setLine1Text] = useState('');
  const [line2Text, setLine2Text] = useState('');
  const [heroTypingDone, setHeroTypingDone] = useState(false);

  // --- Typewriter State for About Section ---
  const [aboutText, setAboutText] = useState('');

  // --- Accordion State for Activities Section ---
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(0);

  // --- Routes Map Modal State ---
  const [showRoutesModal, setShowRoutesModal] = useState(false);

  // --- Scroll to Top button visibility ---
  const [showTopBtn, setShowTopBtn] = useState(false);

  // Hero Typewriter Effect
  useEffect(() => {
    const text1 = 'HSGS';
    const text2 = 'ROBOLADS';
    let idx1 = 0;
    let idx2 = 0;

    const timer1 = setInterval(() => {
      if (idx1 < text1.length) {
        setLine1Text(text1.substring(0, idx1 + 1));
        idx1++;
      } else {
        clearInterval(timer1);
        setTimeout(() => {
          const timer2 = setInterval(() => {
            if (idx2 < text2.length) {
              setLine2Text(text2.substring(0, idx2 + 1));
              idx2++;
            } else {
              clearInterval(timer2);
              setHeroTypingDone(true);
            }
          }, 140);
        }, 200);
      }
    }, 150);

    return () => clearInterval(timer1);
  }, []);

  // About Section Typewriter Effect (Triggers when hero typing is done)
  useEffect(() => {
    if (!heroTypingDone) return;
    const fullText = 'ABOUT\nROBOLADS';
    let charIdx = 0;

    const aboutTimer = setInterval(() => {
      if (charIdx < fullText.length) {
        setAboutText(fullText.substring(0, charIdx + 1));
        charIdx++;
      } else {
        clearInterval(aboutTimer);
      }
    }, 110);

    return () => clearInterval(aboutTimer);
  }, [heroTypingDone]);

  // Scroll listener for Top Button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTarget = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-root">
      {/* =====================================================================
          1. NAVIGATION BAR
          ===================================================================== */}
      <header className="landing-navbar">
        <Link href={ROUTES.HOME} className="landing-navbar-logo">
          <div className="w-10 h-10 rounded-lg bg-amber-400 text-black flex items-center justify-center font-bold text-xs tracking-tighter">
            31113
          </div>
          <span className="landing-navbar-logo-text">ROBOLADS</span>
        </Link>

        <nav className="landing-navbar-menu">
          {MAIN_NAV_ITEMS.map((item) => {
            if (item.isAnchor) {
              const targetId = item.href.replace('/#', '');
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => scrollToTarget(targetId)}
                  className="landing-nav-btn"
                >
                  {item.label}
                </button>
              );
            }
            return (
              <Link key={item.label} href={item.href} className="landing-nav-btn">
                {item.label}
                {item.badge && <span className="landing-nav-badge">{item.badge}</span>}
              </Link>
            );
          })}

          {/* Quick Route Catalog Trigger */}
          <button
            type="button"
            onClick={() => setShowRoutesModal(true)}
            className="landing-nav-btn text-amber-400 hover:text-amber-300"
            title="Browse all routes"
          >
            <Compass className="w-4 h-4 mr-1 inline" />
            ROUTES
          </button>
        </nav>
      </header>

      {/* =====================================================================
          2. HERO SECTION
          ===================================================================== */}
      <section className="landing-hero" id="hero">
        <div className="landing-hero-overlay" />
        <div className="landing-hero-content">
          <div className="tag-yellow mb-4">FIRST TECH CHALLENGE #31113</div>
          <h1 className="landing-hero-title">
            <span className="landing-line landing-line1">
              {line1Text}
              {!heroTypingDone && line2Text.length === 0 && (
                <span className="landing-cursor" />
              )}
            </span>
            <span className="landing-line landing-line2">
              {line2Text}
              {!heroTypingDone && line2Text.length > 0 && (
                <span className="landing-cursor" />
              )}
            </span>
          </h1>

          <p className="paragraph-text max-w-2xl mt-4 text-base">
            High School for Gifted Students (HSGS) Robotics Team. Pushing the boundaries of
            robot engineering, autonomous programming, and STEM outreach.
          </p>

          <div className="landing-hero-cta">
            <Link href={ROUTES.RESOURCES} className="landing-cta-primary">
              EXPLORE RESOURCES
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <button
              type="button"
              onClick={() => scrollToTarget('about-target')}
              className="landing-cta-secondary cursor-pointer"
            >
              ABOUT ROBOLADS
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. ABOUT ROBOLADS SECTION
          ===================================================================== */}
      <section className="about-section" id="about-target">
        <div className="about-card">
          <div className="typing-overlay">
            <span className="pixel-title">
              {aboutText}
              {aboutText.length < 'ABOUT\nROBOLADS'.length && (
                <span className="landing-cursor" />
              )}
            </span>
          </div>

          <ImageWithFallback
            src="/Photo/IMG_9478.jpg"
            alt="About Robolads Team"
            className="w-full h-full object-cover"
            fallbackTitle="HSGS ROBOLADS TEAM PHOTO"
            fallbackSubtitle="Drop photo to /public/Photo/IMG_9478.jpg to display"
            fallbackIcon={<Users className="w-12 h-12" />}
          />
        </div>
      </section>

      {/* =====================================================================
          4. WELCOME & PURPOSE GRID SECTION
          ===================================================================== */}
      <section className="details-section" id="details-target">
        {/* Left Column: Welcome & Specs */}
        <div className="custom-card">
          <div>
            <div className="tag-yellow">WELCOME TO</div>
            <h2 className="heading-pixel">HSGS ROBOLADS</h2>
            <p className="paragraph-text">
              FTC 31113 Robolads là đội tuyển FIRST Tech Challenge được thành lập năm 2025,
              trực thuộc HSGS RoboLads và đại diện cho Trường THPT Chuyên Khoa học Tự nhiên.
              Đội tập trung vào thiết kế, chế tạo và lập trình robot thi đấu, đồng thời phát
              triển tư duy kỹ thuật, chiến lược và tinh thần làm việc nhóm. Bên cạnh thi đấu,
              FTC 31113 tích cực đóng góp cho cộng đồng robotics và STEM qua các hoạt động hợp
              tác, chia sẻ và lan tỏa kiến thức.
            </p>
          </div>

          <div className="stats-box">
            <div className="stats-row">
              <span className="stats-label">THÀNH LẬP:</span>
              <span className="stats-val">2025</span>
            </div>
            <div className="stats-row">
              <span className="stats-label">TRƯỜNG:</span>
              <span className="stats-val">HSGS (Chuyên KHTN)</span>
            </div>
            <div className="stats-row">
              <span className="stats-label">MÃ ĐỘI FTC:</span>
              <span className="stats-val">31113</span>
            </div>
            <div className="stats-row">
              <span className="stats-label">THÀNH VIÊN:</span>
              <span className="stats-val">40–50 thành viên</span>
            </div>
            <div className="stats-row">
              <span className="stats-label">LĨNH VỰC:</span>
              <span className="stats-val">Robotics, STEM, Cộng đồng</span>
            </div>
          </div>
        </div>

        {/* Right Column: Mission & Image */}
        <div className="right-column">
          <div className="custom-card">
            <div>
              <div className="tag-yellow">OUR PURPOSE</div>
              <h2 className="heading-bold">SỨ MỆNH CỦA CHÚNG TÔI</h2>
              <ul className="mission-list">
                <li>Phát triển kỹ năng robotics và lập trình cho học sinh</li>
                <li>Lan tỏa tinh thần STEM đến cộng đồng</li>
                <li>Tham gia các cuộc thi robotics trong và ngoài nước</li>
                <li>Quảng bá một môi trường học tập sáng tạo, logic và gắn kết</li>
              </ul>
            </div>
          </div>

          <div className="join-card">
            <ImageWithFallback
              src="/Photo/join-us-gen2.jpg"
              alt="Join Us Gen 2"
              className="w-full h-full object-cover"
              fallbackTitle="JOIN US - GENERATION 2"
              fallbackSubtitle="Drop photo to /public/Photo/join-us-gen2.jpg"
              fallbackIcon={<Zap className="w-10 h-10" />}
            />
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. ACTIVITIES SECTION (ACCORDION)
          ===================================================================== */}
      <section className="activities-section" id="activities-target">
        <div className="activities-header">
          <div className="tag-yellow">WHAT WE DO</div>
          <h2 className="activities-title">HOẠT ĐỘNG CHÍNH</h2>
        </div>

        <div
          className="cards-accordion"
          onMouseLeave={() => setActiveCardIndex(null)}
        >
          {/* Card 1: CAD & Manufacturing */}
          <div
            className={`activity-card card-yellow ${activeCardIndex === 0 ? 'active' : ''}`}
            onMouseEnter={() => setActiveCardIndex(0)}
            onClick={() => setActiveCardIndex(0)}
          >
            <div className="card-icon">
              <Wrench className="w-8 h-8" />
            </div>
            <div className="card-img-box">
              <ImageWithFallback
                src="/Photo/cad-robot.png"
                alt="Thiết kế & Chế tạo robot"
                fallbackTitle="CAD & FABRICATION"
                fallbackIcon={<Cpu className="w-8 h-8" />}
              />
            </div>
            <div className="card-content">
              <h3 className="card-title">THIẾT KẾ & CHẾ TẠO ROBOT</h3>
              <p className="card-desc">Xây dựng robot cho các kì thi trong và ngoài nước.</p>
            </div>
          </div>

          {/* Card 2: Workshop & Training */}
          <div
            className={`activity-card card-white ${activeCardIndex === 1 ? 'active' : ''}`}
            onMouseEnter={() => setActiveCardIndex(1)}
            onClick={() => setActiveCardIndex(1)}
          >
            <div className="card-icon">
              <Zap className="w-8 h-8" />
            </div>
            <div className="card-img-box">
              <ImageWithFallback
                src="/Photo/workshop.jpg"
                alt="Workshop & Training"
                fallbackTitle="WORKSHOP & TRAINING"
                fallbackIcon={<Layers className="w-8 h-8" />}
              />
            </div>
            <div className="card-content">
              <h3 className="card-title">WORKSHOP & TRAINING</h3>
              <p className="card-desc">Xây dựng cộng đồng robotics nơi học sinh có thể học hỏi và sáng tạo.</p>
            </div>
          </div>

          {/* Card 3: Community */}
          <div
            className={`activity-card card-navy ${activeCardIndex === 2 ? 'active' : ''}`}
            onMouseEnter={() => setActiveCardIndex(2)}
            onClick={() => setActiveCardIndex(2)}
          >
            <div className="card-icon">
              <Users className="w-8 h-8" />
            </div>
            <div className="card-img-box">
              <ImageWithFallback
                src="/Photo/community.jpg"
                alt="Hoạt động cộng đồng"
                fallbackTitle="COMMUNITY OUTREACH"
                fallbackIcon={<Users className="w-8 h-8" />}
              />
            </div>
            <div className="card-content">
              <h3 className="card-title">HOẠT ĐỘNG CỘNG ĐỒNG</h3>
              <p className="card-desc">Tổ chức các sự kiện Ignite Tour đến các trường trong nước.</p>
            </div>
          </div>

          {/* Card 4: Competition */}
          <div
            className={`activity-card card-dark ${activeCardIndex === 3 ? 'active' : ''}`}
            onMouseEnter={() => setActiveCardIndex(3)}
            onClick={() => setActiveCardIndex(3)}
          >
            <div className="card-icon">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="card-img-box">
              <ImageWithFallback
                src="/Photo/competition.jpg"
                alt="Thi đấu"
                fallbackTitle="COMPETITIONS"
                fallbackIcon={<Trophy className="w-8 h-8" />}
              />
            </div>
            <div className="card-content">
              <h3 className="card-title">THI ĐẤU</h3>
              <p className="card-desc">Tham gia giải đấu robotics như FTC, FARC, VORC, ORC,...</p>
            </div>
          </div>
        </div>

        <div className="blast-slogan">—ROBOLADS READY TO BLAST—</div>
      </section>

      {/* =====================================================================
          6. SITE FOOTER & ROUTE DIRECTORY
          ===================================================================== */}
      <footer className="landing-footer">
        <div className="landing-footer-container">
          <div className="footer-routes-grid">
            {ROUTE_CATALOG.map((cat) => (
              <div key={cat.category}>
                <h4 className="footer-category-title">{cat.category}</h4>
                <ul className="footer-link-list">
                  {cat.routes.map((r) => (
                    <li key={r.path}>
                      <Link href={r.path} className="footer-link">
                        <ArrowRight className="w-3 h-3 text-amber-400 opacity-60" />
                        <span>{r.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="footer-bottom">
            <div>
              &copy; {new Date().getFullYear()} HSGS ROBOLADS (FTC #31113). All rights reserved.
            </div>
            <div className="flex gap-4">
              <Link href={ROUTES.RESOURCES} className="hover:text-amber-400 transition-colors">
                Resources
              </Link>
              <Link href={ROUTES.BLOG} className="hover:text-amber-400 transition-colors">
                Blog
              </Link>
              <Link href={ROUTES.ADMIN} className="hover:text-amber-400 transition-colors">
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          7. BACK TO TOP BUTTON
          ===================================================================== */}
      {showTopBtn && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="btn-to-top"
          title="Back to Top"
        >
          ▲ TOP
        </button>
      )}

      {/* =====================================================================
          8. ROUTE CATALOG MODAL
          ===================================================================== */}
      {showRoutesModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowRoutesModal(false)}
        >
          <div
            className="bg-[#0e1023] border border-amber-400/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <h3 className="text-lg font-bold text-amber-400 font-mono flex items-center gap-2">
                  <Compass className="w-5 h-5" />
                  Site Routes Directory
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  Quick navigation for all pages, sections, and API endpoints
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRoutesModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 font-sans">
              {ROUTE_CATALOG.map((cat) => (
                <div key={cat.category}>
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 font-mono">
                    {cat.category}
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {cat.routes.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setShowRoutesModal(false)}
                        className="p-3 rounded-lg bg-[#080915] border border-white/5 hover:border-amber-400/50 hover:bg-[#121530] transition-all group"
                      >
                        <div className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors flex items-center justify-between">
                          <span>{item.name}</span>
                          <span className="text-xs font-mono text-slate-500">{item.path}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                          {item.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-right">
              <button
                type="button"
                onClick={() => setShowRoutesModal(false)}
                className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-black font-semibold text-xs font-mono transition-colors"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
