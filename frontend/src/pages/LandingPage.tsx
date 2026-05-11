// src/pages/LandingPage.tsx
// Professional landing page for CuraMind AI Health Platform
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

// Utility: clamp scroll progress 
function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const handler = () => {
      const el = document.documentElement
      setProgress(el.scrollTop / (el.scrollHeight - el.clientHeight))
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
  return progress
}

// Animated counter 
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      let start = 0
      const duration = 1800
      const step = (timestamp: number) => {
        if (!start) start = timestamp
        const p = Math.min((timestamp - start) / duration, 1)
        setVal(Math.floor(p * to))
        if (p < 1) requestAnimationFrame(step)
        else setVal(to)
      }
      requestAnimationFrame(step)
    }, { threshold: 0.4 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

// Main Component 
export default function LandingPage() {
  const navigate  = useNavigate()
  const { user, isLoading }  = useAuth()
  const progress  = useScrollProgress()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    // Wait until auth state is resolved before redirecting.
    // Without this guard, a logged-in user briefly sees the landing page
    // flash to /login because isAuthenticated is still false on first render.
    if (isLoading) return
    if (user) {
      navigate(user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard', { replace: true })
    }
  }, [user, isLoading, navigate])

  // Intersection observer for section highlight
  useEffect(() => {
    const sections = ['hero', 'features', 'how', 'stats', 'testimonials', 'cta']
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id) })
      },
      { threshold: 0.4 }
    )
    sections.forEach(id => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  const NAV_LINKS = [
    { id: 'features',     label: 'Features'    },
    { id: 'how',          label: 'How it Works' },
    { id: 'stats',        label: 'Impact'       },
    { id: 'testimonials', label: 'Testimonials' },
  ]

  const FEATURES = [
    {
      icon: '🧠',
      title: 'AI Analysis',
      desc: 'ML model analyze your health data in parallel for maximum accuracy.',
      accent: '#4da3ff',
      tag: 'Random Forest Classifier',
    },
    {
      icon: '🔍',
      title: 'Explainable AI (SHAP)',
      desc: 'Every prediction comes with SHAP-based explanations showing exactly which health factors are driving your risk score — no black boxes, full transparency.',
      accent: '#00d4a8',
      tag: 'Transparency First',
    },
    {
      icon: '🩺',
      title: 'Doctor Review Workflow',
      desc: 'AI predictions are never treated as a final decision. Every case is queued for physician review. Your doctor overrides, validates, and adds clinical judgment before you receive a diagnosis.',
      accent: '#a78bfa',
      tag: 'Clinician-in-the-Loop',
    },
    {
      icon: '🔔',
      title: 'Real-Time Notifications',
      desc: 'Get instant alerts when your doctor completes a review, when your follow-up is due, or when high-risk patterns are detected in your latest submission.',
      accent: '#ffbe3d',
      tag: 'Always Informed',
    },
    {
      icon: '📈',
      title: 'Health Progress Tracking',
      desc: 'Monitor changes in important health metrics over time through follow-up submissions, helping patients and doctors visualize trends and evaluate improvements.',
      accent: '#ff5f7e',
      tag: 'Track Improvements',
    },
    {
      icon: '🔁',
      title: 'Continuous Learning System',
      desc: 'Doctor feedback and review corrections are securely stored to support future model retraining, helping improve prediction quality and adaptability over time.',
      accent: '#00d4a8',
      tag: 'Adaptive AI',
      },
  ]

  const HOW_STEPS = [
    {
      num: '01',
      title: 'Register & Log In',
      desc: 'Create a patient account in seconds. Your data is encrypted and stored securely in database.',
      icon: '🔐',
      color: '#4da3ff',
    },
    {
      num: '02',
      title: 'Submit Health Parameters',
      desc: 'Enter vitals, lab results, and lifestyle data through our guided 7-step wizard with real-time validation and clinical hints.',
      icon: '📋',
      color: '#00d4a8',
    },
    {
      num: '03',
      title: 'AI Analysis Runs',
      desc: 'ML models analyze your data simultaneously. SHAP values are computed. Results are generated in seconds with ensemble confidence scores.',
      icon: '🧠',
      color: '#a78bfa',
    },
    {
      num: '04',
      title: 'Doctor Reviews Your Case',
      desc: 'Your assigned physician sees AI predictions alongside your raw data, can override risk levels, and writes a clinical diagnosis.',
      icon: '🩺',
      color: '#ffbe3d',
    },
    {
      num: '05',
      title: 'Receive Your Feedback',
      desc: 'You get notified the moment your doctor completes the review. Read your diagnosis, treatment plan, and follow-up schedule.',
      icon: '💬',
      color: '#ff5f7e',
    },
    {
      num: '06',
      title: 'Progress Tracking & Follow-Up',
      desc: 'Submit follow-up health data over time to track improvements, monitor trends, and keep your doctor informed between visits.',
      icon: '📈',
      color: '#00d4a8',
    },
  ]

  const DISEASES = [
    // { name: 'Hypertension',  icon: '❤️',  color: '#ff5f7e' },
    { name: 'Heart Disease', icon: '🫀', color: '#ff5f7e' },
  ]

  const TESTIMONIALS = [
  {
    quote:
      'CuraMind identified my elevated heart disease risk early through my blood pressure and cholesterol patterns. The explanations helped me understand which lifestyle changes mattered most.',
    name: 'Priyanka T.',
    role: 'Patient · Kathmandu',
    avatar: 'A',
    color: '#4da3ff',
  },
  {
    quote:
      'The AI-assisted review workflow helps me evaluate heart disease risk cases faster while still applying clinical judgment before confirming any diagnosis.',
    name: 'Dr. Surendra G.',
    role: 'Cardiologist · Himalaya Hospital',
    avatar: 'R',
    color: '#00d4a8',
  },
  {
    quote:
      'Tracking my cardiovascular health metrics over time made it easier to monitor improvements in blood pressure, weight, and overall heart health after follow-up visits.',
    name: 'Subodh G.',
    role: 'Patient · Pokhara',
    avatar: 'P',
    color: '#a78bfa',
  },
]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --bg:       #040810;
          --bg2:      #080f1a;
          --bg3:      #0c1628;
          --surface:  #111f35;
          --border:   rgba(77,163,255,0.12);
          --border2:  rgba(77,163,255,0.25);
          --text:     #e8f4ff;
          --text2:    #7ba8cc;
          --text3:    #3d6a8a;
          --accent:   #4da3ff;
          --teal:     #00d4a8;
          --violet:   #a78bfa;
          --rose:     #ff5f7e;
          --amber:    #ffbe3d;
          --ff-head:  'Syne', sans-serif;
          --ff-body:  'DM Sans', sans-serif;
          --ff-mono:  'JetBrains Mono', monospace;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; }

        .lp-root {
          background: var(--bg);
          color: var(--text);
          font-family: var(--ff-body);
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ── SCROLL PROGRESS ── */
        .lp-progress {
          position: fixed; top: 0; left: 0; right: 0;
          height: 2px; z-index: 200;
          background: linear-gradient(90deg, var(--accent), var(--teal));
          transform-origin: left;
          transition: transform 0.1s linear;
        }

        /* ── NAVBAR ── */
        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 0 5%;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          background: rgba(4,8,16,0.85);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center;
          height: 68px;
          transition: background 0.3s;
        }
        .lp-nav-logo {
          display: flex; align-items: center; gap: 10px;
          font-family: var(--ff-head); font-weight: 800;
          font-size: 20px; letter-spacing: -0.02em;
          cursor: pointer; text-decoration: none; color: var(--text);
        }
        .lp-nav-logo-icon {
          width: 36px; height: 36px; border-radius: 9px;
          background: linear-gradient(135deg, var(--accent), var(--teal));
          display: flex; align-items: center; justify-content: center;
          font-size: 17px;
        }
        .lp-nav-links {
          display: flex; align-items: center; gap: 6px;
          margin-left: auto;
        }
        .lp-nav-link {
          background: none; border: none; cursor: pointer;
          font-family: var(--ff-body); font-size: 14px; font-weight: 500;
          color: var(--text2); padding: 6px 14px; border-radius: 8px;
          transition: all 0.15s; text-decoration: none;
        }
        .lp-nav-link:hover, .lp-nav-link.active { color: var(--text); background: rgba(77,163,255,0.08); }
        .lp-nav-cta {
          display: flex; align-items: center; gap: 8px; margin-left: 16px;
        }
        .lp-btn-ghost {
          background: none; border: 1px solid var(--border2); color: var(--text2);
          padding: 8px 20px; border-radius: 9px; cursor: pointer;
          font-family: var(--ff-body); font-size: 13px; font-weight: 600;
          transition: all 0.15s; text-decoration: none;
          display: inline-flex; align-items: center;
        }
        .lp-btn-ghost:hover { border-color: var(--accent); color: var(--accent); background: rgba(77,163,255,0.06); }
        .lp-btn-primary {
          background: var(--accent); color: #fff;
          padding: 8px 22px; border-radius: 9px; border: none; cursor: pointer;
          font-family: var(--ff-body); font-size: 13px; font-weight: 600;
          transition: all 0.2s; text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px;
          box-shadow: 0 4px 20px rgba(77,163,255,0.3);
        }
        .lp-btn-primary:hover { filter: brightness(1.12); transform: translateY(-1px); box-shadow: 0 6px 28px rgba(77,163,255,0.4); }

        /* ── HAMBURGER ── */
        .lp-hamburger {
          display: none; background: none; border: 1px solid var(--border2);
          border-radius: 8px; padding: 7px 10px; cursor: pointer; color: var(--text2);
          font-size: 18px; margin-left: auto;
        }
        .lp-mobile-menu {
          display: none; flex-direction: column; gap: 4px;
          position: fixed; top: 68px; left: 0; right: 0; z-index: 99;
          background: var(--bg2); border-bottom: 1px solid var(--border);
          padding: 16px 5%;
        }
        .lp-mobile-menu.open { display: flex; }
        .lp-mobile-link {
          background: none; border: none; cursor: pointer; text-align: left;
          font-family: var(--ff-body); font-size: 15px; font-weight: 500;
          color: var(--text2); padding: 12px 16px; border-radius: 10px;
          transition: all 0.15s;
        }
        .lp-mobile-link:hover { background: var(--surface); color: var(--text); }
        .lp-mobile-divider { height: 1px; background: var(--border); margin: 8px 0; }

        @media (max-width: 820px) {
          .lp-nav-links, .lp-nav-cta { display: none !important; }
          .lp-hamburger { display: flex; align-items: center; }
        }

        /* ── HERO ── */
        #hero {
          min-height: 100vh;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 120px 5% 80px;
          position: relative; overflow: hidden; text-align: center;
        }
        .lp-hero-bg {
          position: absolute; inset: 0; pointer-events: none;
        }
        .lp-hero-orb {
          position: absolute; border-radius: 50%;
          filter: blur(80px); animation: lp-float 8s ease-in-out infinite;
        }
        .lp-grid-overlay {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(77,163,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(77,163,255,0.03) 1px, transparent 1px);
          background-size: 56px 56px;
        }
        .lp-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(77,163,255,0.08); border: 1px solid rgba(77,163,255,0.25);
          border-radius: 99px; padding: 6px 16px 6px 10px;
          font-size: 12px; font-weight: 600; color: var(--accent);
          font-family: var(--ff-mono); letter-spacing: 0.04em;
          margin-bottom: 28px;
          animation: lp-fadeup 0.7s ease both;
        }
        .lp-badge-dot {
          width: 7px; height: 7px; border-radius: 50%; background: var(--teal);
          animation: lp-pulse 2s infinite;
        }
        .lp-hero-title {
          font-family: var(--ff-head); font-weight: 800;
          font-size: clamp(40px, 6vw, 80px);
          line-height: 1.05; letter-spacing: -0.03em;
          margin-bottom: 12px;
          animation: lp-fadeup 0.7s 0.1s ease both;
        }
        .lp-hero-title-accent {
          background: linear-gradient(135deg, var(--accent), var(--teal));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .lp-hero-typewriter {
          font-family: var(--ff-head); font-weight: 800;
          font-size: clamp(38px, 5.5vw, 72px);
          line-height: 1.05; letter-spacing: -0.03em;
          color: var(--teal); min-height: 1.1em; display: block;
          margin-bottom: 28px;
          animation: lp-fadeup 0.7s 0.2s ease both;
        }
        .lp-cursor {
          display: inline-block; width: 3px; background: var(--teal);
          animation: lp-blink 1s step-end infinite; margin-left: 2px;
        }
        .lp-hero-desc {
          font-size: clamp(15px, 1.8vw, 18px); color: var(--text2); line-height: 1.7;
          max-width: 600px; margin: 0 auto 44px;
          animation: lp-fadeup 0.7s 0.3s ease both;
        }
        .lp-hero-cta {
          display: flex; align-items: center; gap: 14px; justify-content: center;
          flex-wrap: wrap;
          animation: lp-fadeup 0.7s 0.4s ease both;
        }
        .lp-btn-hero-primary {
          display: inline-flex; align-items: center; gap: 10px;
          background: linear-gradient(135deg, var(--accent), #3b8fff);
          color: white; padding: 15px 34px; border-radius: 12px; border: none;
          cursor: pointer; font-family: var(--ff-head); font-size: 16px; font-weight: 700;
          letter-spacing: -0.01em;
          box-shadow: 0 8px 32px rgba(77,163,255,0.35);
          transition: all 0.2s;
        }
        .lp-btn-hero-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(77,163,255,0.45); }
        .lp-btn-hero-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.04); color: var(--text);
          border: 1px solid var(--border2);
          padding: 15px 32px; border-radius: 12px; cursor: pointer;
          font-family: var(--ff-head); font-size: 16px; font-weight: 600;
          transition: all 0.2s;
        }
        .lp-btn-hero-secondary:hover { background: rgba(255,255,255,0.08); border-color: rgba(77,163,255,0.4); }
        .lp-hero-note {
          margin-top: 20px; font-size: 12px; color: var(--text3);
          font-family: var(--ff-mono);
          animation: lp-fadeup 0.7s 0.5s ease both;
        }
        /* Floating disease pill cards */
        .lp-disease-pills {
          display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;
          margin-top: 60px; max-width: 680px;
          animation: lp-fadeup 0.7s 0.6s ease both;
        }
        .lp-disease-pill {
          display: flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.03); border: 1px solid var(--border);
          border-radius: 99px; padding: 7px 16px;
          font-size: 12px; font-weight: 600; color: var(--text2);
          transition: all 0.2s;
        }
        .lp-disease-pill:hover { border-color: var(--border2); background: rgba(255,255,255,0.06); color: var(--text); }

        /* ── SECTION WRAPPER ── */
        .lp-section {
          padding: 100px 5%;
          position: relative;
        }
        .lp-section-label {
          display: inline-flex; align-items: center; gap: 7px;
          font-family: var(--ff-mono); font-size: 10px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.12em; color: var(--accent);
          margin-bottom: 14px;
        }
        .lp-section-label::before {
          content: ''; width: 24px; height: 1px; background: var(--accent);
        }
        .lp-section-title {
          font-family: var(--ff-head); font-size: clamp(28px, 4vw, 46px);
          font-weight: 800; letter-spacing: -0.025em; line-height: 1.1;
          margin-bottom: 14px;
        }
        .lp-section-sub {
          font-size: 16px; color: var(--text2); line-height: 1.7;
          max-width: 520px;
        }

        /* ── FEATURES ── */
        #features { background: var(--bg); }
        .lp-feature-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px; margin-top: 60px;
        }
        .lp-feature-card {
          background: var(--bg2); border: 1px solid var(--border);
          border-radius: 18px; padding: 28px;
          transition: all 0.25s; position: relative; overflow: hidden;
        }
        .lp-feature-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          opacity: 0; transition: opacity 0.25s;
        }
        .lp-feature-card:hover { border-color: var(--border2); transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
        .lp-feature-card:hover::before { opacity: 1; }
        .lp-feature-icon {
          width: 48px; height: 48px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; margin-bottom: 18px;
        }
        .lp-feature-tag {
          display: inline-block; font-family: var(--ff-mono); font-size: 9px;
          font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;
          padding: 3px 10px; border-radius: 99px; margin-bottom: 12px;
          background: rgba(77,163,255,0.08); color: var(--accent);
          border: 1px solid rgba(77,163,255,0.18);
        }
        .lp-feature-title {
          font-family: var(--ff-head); font-size: 18px; font-weight: 700;
          letter-spacing: -0.01em; margin-bottom: 10px;
        }
        .lp-feature-desc {
          font-size: 14px; color: var(--text2); line-height: 1.7;
        }

        /* ── HOW IT WORKS ── */
        #how { background: var(--bg2); }
        .lp-how-grid {
          display: flex; flex-direction: column; gap: 0; margin-top: 60px;
          position: relative;
        }
        .lp-how-grid::before {
          content: ''; position: absolute; left: 40px; top: 40px; bottom: 40px;
          width: 1px; background: linear-gradient(to bottom, var(--accent), var(--teal), transparent);
        }
        .lp-how-step {
          display: flex; gap: 28px; align-items: flex-start;
          padding: 24px 0; position: relative;
        }
        .lp-how-num-wrap {
          display: flex; flex-direction: column; align-items: center;
          gap: 0; flex-shrink: 0; width: 80px;
        }
        .lp-how-num {
          width: 56px; height: 56px; border-radius: 14px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          border: 1px solid var(--border2); background: var(--bg3);
          font-family: var(--ff-mono); font-size: 9px; font-weight: 600;
          color: var(--text3); letter-spacing: 0.05em; position: relative; z-index: 1;
        }
        .lp-how-icon { font-size: 22px; margin-bottom: 2px; }
        .lp-how-content { flex: 1; padding-top: 12px; }
        .lp-how-title { font-family: var(--ff-head); font-size: 20px; font-weight: 700; margin-bottom: 8px; }
        .lp-how-desc  { font-size: 14px; color: var(--text2); line-height: 1.7; }

        /* ── STATS ── */
        #stats {
          background: linear-gradient(135deg, var(--bg) 0%, rgba(4,8,16,0.98) 100%);
          position: relative; overflow: hidden;
        }
        .lp-stats-bg {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse 70% 60% at 50% 100%, rgba(77,163,255,0.06) 0%, transparent 70%);
        }
        .lp-stats-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2px; margin-top: 60px;
          border: 1px solid var(--border); border-radius: 20px; overflow: hidden;
        }
        .lp-stat-cell {
          background: var(--bg2); padding: 40px 32px;
          text-align: center; position: relative;
          border-right: 1px solid var(--border);
        }
        .lp-stat-cell:last-child { border-right: none; }
        .lp-stat-num {
          font-family: var(--ff-head); font-size: clamp(36px, 5vw, 56px);
          font-weight: 800; letter-spacing: -0.03em; line-height: 1;
          margin-bottom: 8px;
        }
        .lp-stat-label {
          font-size: 13px; color: var(--text2); font-weight: 500;
        }
        .lp-stat-sub {
          font-size: 11px; color: var(--text3); font-family: var(--ff-mono);
          margin-top: 4px;
        }

        /* ── TESTIMONIALS ── */
        #testimonials { background: var(--bg3); }
        .lp-test-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px; margin-top: 60px;
        }
        .lp-test-card {
          background: var(--bg2); border: 1px solid var(--border);
          border-radius: 18px; padding: 28px;
          position: relative;
        }
        .lp-test-card::before {
          content: '"'; position: absolute; top: 20px; right: 24px;
          font-family: var(--ff-head); font-size: 80px; font-weight: 800;
          color: rgba(77,163,255,0.06); line-height: 1; pointer-events: none;
        }
        .lp-test-quote {
          font-size: 15px; color: var(--text); line-height: 1.75;
          margin-bottom: 24px; font-style: italic;
        }
        .lp-test-author { display: flex; align-items: center; gap: 12px; }
        .lp-test-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 700; color: white; flex-shrink: 0;
        }
        .lp-test-name  { font-weight: 700; font-size: 14px; }
        .lp-test-role  { font-size: 12px; color: var(--text2); font-family: var(--ff-mono); margin-top: 1px; }
        .lp-stars { color: var(--amber); font-size: 12px; margin-bottom: 16px; }

        /* ── CTA ── */
        #cta {
          background: var(--bg);
          text-align: center; padding: 120px 5%;
          position: relative; overflow: hidden;
        }
        .lp-cta-bg {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse 80% 70% at 50% 50%, rgba(77,163,255,0.07) 0%, transparent 70%);
        }
        .lp-cta-box {
          position: relative; z-index: 1; max-width: 700px; margin: 0 auto;
          background: var(--bg2); border: 1px solid var(--border2);
          border-radius: 28px; padding: 64px 48px;
          box-shadow: 0 0 80px rgba(77,163,255,0.08);
        }
        .lp-cta-title {
          font-family: var(--ff-head); font-size: clamp(28px, 4.5vw, 48px);
          font-weight: 800; letter-spacing: -0.025em; line-height: 1.1;
          margin-bottom: 16px;
        }
        .lp-cta-desc {
          font-size: 16px; color: var(--text2); line-height: 1.7; margin-bottom: 40px;
        }
        .lp-cta-btns {
          display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;
        }
        .lp-btn-cta-primary {
          display: inline-flex; align-items: center; gap: 10px;
          background: linear-gradient(135deg, var(--accent), var(--teal));
          color: #04080f; padding: 16px 36px; border-radius: 12px; border: none;
          cursor: pointer; font-family: var(--ff-head); font-size: 16px; font-weight: 700;
          box-shadow: 0 8px 32px rgba(77,163,255,0.3); transition: all 0.2s;
        }
        .lp-btn-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(77,163,255,0.4); }
        .lp-btn-cta-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: var(--text);
          border: 1px solid var(--border2);
          padding: 16px 34px; border-radius: 12px; cursor: pointer;
          font-family: var(--ff-head); font-size: 16px; font-weight: 600;
          transition: all 0.2s;
        }
        .lp-btn-cta-secondary:hover { border-color: rgba(77,163,255,0.5); background: rgba(77,163,255,0.05); }
        .lp-cta-note { margin-top: 20px; font-size: 12px; color: var(--text3); font-family: var(--ff-mono); }

        /* ── TECH STRIP ── */
        .lp-tech-strip {
          padding: 32px 5%; background: var(--bg2);
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: 40px; flex-wrap: wrap;
          justify-content: center; overflow: hidden;
        }
        .lp-tech-label { font-size: 11px; font-family: var(--ff-mono); color: var(--text3); text-transform: uppercase; letter-spacing: 0.12em; }
        .lp-tech-item {
          display: flex; align-items: center; gap: 7px;
          font-size: 13px; font-weight: 600; color: var(--text2);
          white-space: nowrap;
        }
        .lp-tech-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--teal); }

        /* ── FOOTER ── */
        .lp-footer {
          background: var(--bg); border-top: 1px solid var(--border);
          padding: 60px 5% 40px;
        }
        .lp-footer-inner {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px;
          max-width: 1200px; margin: 0 auto;
        }
        .lp-footer-brand p { font-size: 13px; color: var(--text2); line-height: 1.7; margin-top: 12px; max-width: 280px; }
        .lp-footer-col-title { font-family: var(--ff-head); font-size: 13px; font-weight: 700; margin-bottom: 14px; }
        .lp-footer-link {
          display: block; font-size: 13px; color: var(--text2); text-decoration: none;
          margin-bottom: 8px; cursor: pointer; background: none; border: none;
          text-align: left; transition: color 0.15s; padding: 0;
        }
        .lp-footer-link:hover { color: var(--text); }
        .lp-footer-bottom {
          border-top: 1px solid var(--border); margin-top: 48px; padding-top: 24px;
          display: flex; justify-content: space-between; align-items: center;
          font-size: 12px; color: var(--text3); font-family: var(--ff-mono);
          flex-wrap: wrap; gap: 12px;
          max-width: 1200px; margin-left: auto; margin-right: auto;
        }

        @media (max-width: 768px) {
          .lp-footer-inner { grid-template-columns: 1fr 1fr; gap: 32px; }
          .lp-how-grid::before { display: none; }
          .lp-stats-grid { grid-template-columns: 1fr 1fr; }
          .lp-stat-cell:nth-child(2) { border-right: none; }
          .lp-stat-cell:nth-child(even) { border-right: none; }
          .lp-cta-box { padding: 40px 24px; }
        }
        @media (max-width: 480px) {
          .lp-footer-inner { grid-template-columns: 1fr; }
          .lp-stats-grid { grid-template-columns: 1fr; }
          .lp-stat-cell { border-right: none; border-bottom: 1px solid var(--border); }
          .lp-stat-cell:last-child { border-bottom: none; }
        }

        /* ── ANIMATIONS ── */
        @keyframes lp-fadeup   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes lp-float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes lp-pulse    { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes lp-blink    { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>

      <div className="lp-root">
        {/* Scroll progress bar */}
        <div className="lp-progress" style={{ transform: `scaleX(${progress})` }} />

        {/* ── NAVBAR ── */}
        <nav className="lp-nav">
          <button className="lp-nav-logo" onClick={() => scrollTo('hero')}>
            <div className="lp-nav-logo-icon">🧬</div>
            CuraMind
          </button>

          <div className="lp-nav-links">
            {NAV_LINKS.map((l) => (
              <button
                key={l.id}
                className={`lp-nav-link ${activeSection === l.id ? 'active' : ''}`}
                onClick={() => scrollTo(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="lp-nav-cta">
            <button className="lp-btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
            <button className="lp-btn-primary" onClick={() => navigate('/register')}>Get Started →</button>
          </div>

          {/* Hamburger for mobile */}
          <button className="lp-hamburger" onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </nav>

        {/* Mobile menu */}
        <div className={`lp-mobile-menu ${menuOpen ? 'open' : ''}`}>
          {NAV_LINKS.map((l) => (
            <button key={l.id} className="lp-mobile-link" onClick={() => scrollTo(l.id)}>{l.label}</button>
          ))}
          <div className="lp-mobile-divider" />
          <button className="lp-mobile-link" onClick={() => navigate('/login')}>Sign In</button>
          <button
            className="lp-mobile-link"
            style={{ background: 'rgba(77,163,255,0.1)', color: 'var(--accent)', fontWeight: 700 }}
            onClick={() => navigate('/register')}
          >
            Get Started →
          </button>
        </div>

        {/* ── HERO ── */}
        <section id="hero">
          <div className="lp-hero-bg">
            <div className="lp-hero-orb" style={{ width: 600, height: 600, top: '-200px', left: '-200px', background: 'radial-gradient(circle, rgba(77,163,255,0.08) 0%, transparent 70%)', animationDelay: '0s' }} />
            <div className="lp-hero-orb" style={{ width: 500, height: 500, bottom: '-100px', right: '-150px', background: 'radial-gradient(circle, rgba(0,212,168,0.07) 0%, transparent 70%)', animationDelay: '-4s' }} />
            <div className="lp-grid-overlay" />
          </div>

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="lp-hero-badge">
              <div className="lp-badge-dot" />
              AI-Powered · Clinician-Reviewed · Nepal Health Tech
            </div>

            <h1 className="lp-hero-title">
              Predict. Understand.
              <br />
              <span className="lp-hero-title-accent">Prevent.</span>
            </h1>

            {/* <span className="lp-hero-typewriter">
              <Typewriter words={['Heart Disease']} />
            </span> */}

            <p className="lp-hero-desc">
              CuraMind combines ML model with physician review workflows
              to give you accurate, explainable, and actionable health risk predictions —
              not just a number, but a roadmap to better health.
            </p>

            <div className="lp-hero-cta">
              <button className="lp-btn-hero-primary" onClick={() => navigate('/login')}>
                <span>🧬</span> Start Free Assessment
              </button>
              {/* <button className="lp-btn-hero-secondary" onClick={() => navigate('/login')}>
                Sign In to Dashboard →
              </button> */}
            </div>

            {/* <p className="lp-hero-note">
              🔒 Your health data is encrypted · No ads · No data selling
            </p> */}

            <div className="lp-disease-pills">
              {DISEASES.map((d) => (
                <div key={d.name} className="lp-disease-pill">
                  <span>{d.icon}</span>
                  <span style={{ color: d.color }}>{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="lp-section">
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
              <div className="lp-section-label">What We Offer</div>
              <h2 className="lp-section-title">
                Every feature built for
                <br />
                <span style={{ color: 'var(--accent)' }}>clinical precision</span>
              </h2>
              <p className="lp-section-sub" style={{ margin: '0 auto' }}>
                Not just another health app. CuraMind is a complete clinical AI platform
                that bridges the gap between AI predictions and real medical outcomes.
              </p>
            </div>

            <div className="lp-feature-grid">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="lp-feature-card"
                  style={{ '--feature-accent': f.accent } as React.CSSProperties}
                >
                  <div
                    className="lp-feature-card"
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${f.accent}, transparent)`, borderRadius: 0, border: 'none', padding: 0, margin: 0 }}
                  />
                  <div className="lp-feature-icon" style={{ background: `${f.accent}15` }}>
                    {f.icon}
                  </div>
                  <div className="lp-feature-tag" style={{ background: `${f.accent}10`, color: f.accent, borderColor: `${f.accent}30` }}>
                    {f.tag}
                  </div>
                  <h3 className="lp-feature-title">{f.title}</h3>
                  <p className="lp-feature-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how" className="lp-section">
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 0 }}>
              <div className="lp-section-label">The Process</div>
              <h2 className="lp-section-title">
                How CuraMind works
              </h2>
              <p className="lp-section-sub" style={{ margin: '0 auto 0' }}>
                From your first login to receiving your doctor's diagnosis — a transparent,
                6-step journey designed around your safety.
              </p>
            </div>

            <div className="lp-how-grid">
              {HOW_STEPS.map((step, i) => (
                <div key={step.num} className="lp-how-step">
                  <div className="lp-how-num-wrap">
                    <div className="lp-how-num" style={{ borderColor: step.color + '50', background: step.color + '0f' }}>
                      <div className="lp-how-icon">{step.icon}</div>
                      <span style={{ color: step.color }}>{step.num}</span>
                    </div>
                  </div>
                  <div className="lp-how-content">
                    <h3 className="lp-how-title" style={{ color: i === 2 ? 'var(--text)' : undefined }}>{step.title}</h3>
                    <p className="lp-how-desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section id="stats" className="lp-section">
          <div className="lp-stats-bg" />
          <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center' }}>
              <div className="lp-section-label">Impact by Numbers</div>
              <h2 className="lp-section-title">
                Trusted by patients and
                <br />
                <span style={{ color: 'var(--teal)' }}>clinicians across Nepal</span>
              </h2>
            </div>

            <div className="lp-stats-grid">
              {[
                { num: 36, suffix: '+', label: 'Patients Analyzed', sub: 'Across all clinics', color: 'var(--accent)' },
                { num: 91,  suffix: '%', label: 'Avg. AI Confidence', sub: 'Ensemble score',   color: 'var(--teal)'  },
                { num: 38,  suffix: '+', label: 'High-Risk Cases',    sub: 'Identified early', color: 'var(--amber)'  },
              ].map((s) => (
                <div key={s.label} className="lp-stat-cell">
                  <div className="lp-stat-num" style={{ color: s.color }}>
                    <Counter to={s.num} suffix={s.suffix} />
                  </div>
                  <p className="lp-stat-label">{s.label}</p>
                  <p className="lp-stat-sub">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section id="testimonials" className="lp-section">
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="lp-section-label">Real Stories</div>
              <h2 className="lp-section-title">
                What patients and doctors
                <br />
                <span style={{ color: 'var(--accent)' }}>are saying</span>
              </h2>
            </div>

            <div className="lp-test-grid">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="lp-test-card">
                  <div className="lp-stars">★★★★★</div>
                  <p className="lp-test-quote">"{t.quote}"</p>
                  <div className="lp-test-author">
                    <div className="lp-test-avatar" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="lp-test-name">{t.name}</p>
                      <p className="lp-test-role">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section id="cta">
          <div className="lp-cta-bg" />
          <div className="lp-cta-box">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🧬</div>
            <h2 className="lp-cta-title">
              Your health deserves
              <br />
              <span style={{ background: 'linear-gradient(135deg, var(--accent), var(--teal))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                AI-powered clarity
              </span>
            </h2>
            <p className="lp-cta-desc">
              Join hundreds of patients and doctors using CuraMind to know their health risks with clinical precision, and take proactive steps towards a healthier future.
            </p>
            <div className="lp-cta-btns">
              <button className="lp-btn-cta-primary" onClick={() => navigate('/register')}>
                <span>🧑</span> Register as Patient
              </button>
              {/* <button className="lp-btn-cta-secondary" onClick={() => navigate('/register')}>
                <span>🩺</span> Join as Doctor
              </button> */}
            </div>
            <p className="lp-cta-note">Already have an account?
              <button
                onClick={() => navigate('/login')}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--ff-mono)', fontSize: 12, marginLeft: 6 }}
              >
                Sign In →
              </button>
            </p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="lp-footer">
          <div className="lp-footer-inner">
            <div className="lp-footer-brand">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,var(--accent),var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🧬</div>
                <span style={{ fontFamily: 'var(--ff-head)', fontWeight: 800, fontSize: 18 }}>CuraMind</span>
              </div>
              <p>AI-powered disease risk assessment and clinical decision support for patients and physicians across Nepal.</p>
            </div>

            <div>
              <p className="lp-footer-col-title">Platform</p>
              {['Patient Portal', 'AI Predictions', 'SHAP Explanations', 'Progress Tracking'].map((l) => (
                <button key={l} className="lp-footer-link" onClick={() => navigate('/login')}>{l}</button>
              ))}
            </div>

            <div>
              <p className="lp-footer-col-title">Diseases</p>
              {DISEASES.map((d) => (
                <button key={d.name} className="lp-footer-link" onClick={() => scrollTo('features')}>
                  {d.icon} {d.name}
                </button>
              ))}
            </div>

            <div>
              <p className="lp-footer-col-title">Account</p>
              {[
                { label: 'Sign In',          path: '/login'    },
                { label: 'Register Patient', path: '/register' },
                // { label: 'Register Doctor',  path: '/register' },
              ].map((l) => (
                <button key={l.label} className="lp-footer-link" onClick={() => navigate(l.path)}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="lp-footer-bottom ">
            <span>© {new Date().getFullYear()} CuraMind · Nepal Health AI Platform</span>
            <div style={{ display: 'flex', gap: 16 }}>
              <span>CuraMind Team</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
