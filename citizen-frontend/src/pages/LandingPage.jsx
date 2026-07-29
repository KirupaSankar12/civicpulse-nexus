import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Landmark, AlertTriangle, Info, ShieldAlert, BadgeCheck,
  Droplets, Route, Zap, Trash2, HeartPulse, FileText, FileSignature, Building2,
  PenSquare, Search, LogIn, Activity, ShieldCheck, Smartphone, CheckCircle, Bell,
  PhoneCall, BookOpen, HelpCircle, ArrowRight, CheckCircle2, Award, Sparkles, ChevronRight, Users, Clock
} from 'lucide-react';

const notices = [
  { text: 'Water Supply Maintenance scheduled in Ward 7–12 on 10th July. Expect disruption 6AM–2PM.', date: 'July 8, 2026', type: 'WATER ALERT', badgeColor: '#f59e0b', icon: AlertTriangle },
  { text: 'Road Repair Notice: NH-48 flyover under construction. Use alternate route via Ring Road.', date: 'July 6, 2026', type: 'ROAD REPAIR', badgeColor: '#3b82f6', icon: Info },
  { text: 'Emergency Helpline: 1800-11-2026 available 24×7 for disaster-related complaints.', date: 'July 4, 2026', type: 'EMERGENCY', badgeColor: '#ef4444', icon: ShieldAlert },
  { text: 'New e-Service: Residence Certificates can now be applied online — No office visit needed!', date: 'July 1, 2026', type: 'NEW E-SERVICE', badgeColor: '#10b981', icon: BadgeCheck },
];

const services = [
  { icon: Droplets, name: 'Water Supply', desc: 'Leakage, shortage, tanker requests', dept: 'Water Department', color: '#0284c7' },
  { icon: Route, name: 'Roads & Traffic', desc: 'Potholes, signals, encroachments', dept: 'Roads Department', color: '#d97706' },
  { icon: Zap, name: 'Electricity', desc: 'Outages, street lights, billing', dept: 'Electricity Department', color: '#7c3aed' },
  { icon: Trash2, name: 'Sanitation', desc: 'Garbage, drains, public hygiene', dept: 'Sanitation Department', color: '#059669' },
  { icon: HeartPulse, name: 'Public Health', desc: 'Epidemic control, mosquitoes, stray animals', dept: 'Health Department', color: '#dc2626' },
  { icon: FileText, name: 'Birth Certificate', desc: 'Apply for official birth record & digital copy', dept: 'Health Department', color: '#2563eb' },
  { icon: FileSignature, name: 'Death Certificate', desc: 'Register and obtain official death certificate', dept: 'Health Department', color: '#475569' },
  { icon: Building2, name: 'Trade License', desc: 'Commercial shop & business trade permit', dept: 'Municipal Corporation', color: '#4f46e5' },
];

const quickAccess = [
  { icon: PenSquare, title: 'File Complaint', to: '/login', desc: 'Report civic issues to municipal officers', bg: 'linear-gradient(135deg, #ef4444, #b91c1c)', tag: 'Instant SLA' },
  { icon: FileText, title: 'Apply Certificate', to: '/login', desc: 'Birth, income & residence certificates', bg: 'linear-gradient(135deg, #2563eb, #1d4ed8)', tag: '100% Digital' },
  { icon: Search, title: 'Track Status', to: '/login', desc: 'Check complaint & application progress', bg: 'linear-gradient(135deg, #059669, #047857)', tag: 'Real-Time' },
  { icon: LogIn, title: 'Citizen Login', to: '/login', desc: 'Access your verified identity account', bg: 'linear-gradient(135deg, #7c3aed, #6d28d9)', tag: 'Keycloak SSO' },
];

const features = [
  { icon: Activity, title: 'Real-Time SLA Tracking', desc: 'Track complaint progress live with automated officer escalations when deadlines near.' },
  { icon: ShieldCheck, title: 'Secured Keycloak SSO', desc: 'End-to-end encrypted with Keycloak Single Sign-On and multi-factor authorization.' },
  { icon: Smartphone, title: 'Multi-Device Responsive', desc: 'Seamless access across desktop, tablets, and smartphones with instant sync.' },
  { icon: Landmark, title: 'Government Standard', desc: 'Fully compliant with National Digital Service Standards and RTI provisions.' },
  { icon: CheckCircle2, title: 'Automated Eligibility', desc: 'Instant eligibility calculation for state welfare schemes and certificate issuance.' },
  { icon: Bell, title: 'Instant Notification Bus', desc: 'Real-time Kafka event bus triggering instant in-app alerts on status updates.' },
];

const helpItems = [
  { icon: PhoneCall, title: '24/7 Helpline Support', desc: 'Call toll-free 1800-11-2026 for 24×7 assistance with complaints and certificates.' },
  { icon: BookOpen, title: 'Step-by-Step User Guide', desc: 'Comprehensive guide for registering, filing grievances, and tracking SLA statuses.' },
  { icon: HelpCircle, title: 'Frequently Asked Questions', desc: 'Instant answers to common questions about document verification and SLAs.' },
];

function LandingPage() {
  const [isDark, setIsDark] = useState(false);

  // Dynamic Theme Palette
  const theme = {
    bg: isDark ? '#0f172a' : '#ffffff',
    altBg: isDark ? '#0b1329' : '#f8fafc',
    heroBg: isDark 
      ? 'linear-gradient(135deg, #0b1329 0%, #0f172a 40%, #1e293b 100%)' 
      : 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 50%, #ffffff 100%)',
    navBg: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.92)',
    navBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
    navLink: isDark ? '#cbd5e1' : '#334155',
    heading: isDark ? '#ffffff' : '#0f172a',
    text: isDark ? '#f8fafc' : '#0f172a',
    muted: isDark ? '#94a3b8' : '#64748b',
    cardBg: isDark ? 'rgba(15, 23, 42, 0.8)' : '#ffffff',
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
    cardShadow: isDark ? '0 12px 30px rgba(0,0,0,0.4)' : '0 10px 25px rgba(37,99,235,0.06)',
    statBg: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
    statBorder: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
    statShadow: isDark ? 'none' : '0 4px 14px rgba(0,0,0,0.04)',
    bulletinBg: isDark ? 'rgba(15, 23, 42, 0.95)' : '#ffffff',
    bulletinBorder: isDark ? 'rgba(255,255,255,0.12)' : '#cbd5e1',
    bulletinShadow: isDark ? '0 20px 50px rgba(0,0,0,0.5)' : '0 12px 35px rgba(37,99,235,0.1)',
    noticeBg: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
    noticeBorder: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
    noticeText: isDark ? '#cbd5e1' : '#334155',
    sectionBorder: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
    footerBg: isDark ? '#0b1329' : '#0f172a'
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text, fontFamily: 'Inter, system-ui, sans-serif', transition: 'background 0.3s, color 0.3s' }}>
      
      {/* ── Top Government Ticker Bar ── */}
      <div style={{
        background: '#0b1329', borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '8px 24px', fontSize: 12, fontWeight: 700, color: '#cbd5e1',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#fbbf24' }}>🇮🇳</span>
          <span>Government of India — Official Digital Governance Portal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: '#94a3b8' }}>
          <span>Toll-Free Helpline: <strong style={{ color: '#38bdf8' }}>1800-11-2026</strong></span>
          <span>|</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#4ade80' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            Systems Operational
          </span>
        </div>
      </div>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: theme.navBg, backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${theme.navBorder}`,
        padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.04)'
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(37,99,235,0.4)', border: '1.5px solid rgba(255,255,255,0.2)'
          }}>
            <Landmark size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: theme.heading, letterSpacing: '-0.02em', lineHeight: 1 }}>
              CivicPulse <span style={{ color: isDark ? '#38bdf8' : '#0284c7' }}>Nexus</span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: isDark ? '#38bdf8' : '#0284c7', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 3 }}>
              Smart Governance Platform
            </div>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 14, fontWeight: 700 }}>
          <a href="#services" style={{ color: theme.navLink, textDecoration: 'none' }}>Services</a>
          <a href="#quick-access" style={{ color: theme.navLink, textDecoration: 'none' }}>Quick Access</a>
          <a href="#about" style={{ color: theme.navLink, textDecoration: 'none' }}>About Platform</a>
          <a href="#help" style={{ color: theme.navLink, textDecoration: 'none' }}>Help & FAQs</a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDark(!isDark)}
            style={{
              height: 42, padding: '0 16px', borderRadius: 10,
              background: isDark ? 'rgba(255,255,255,0.08)' : '#eff6ff',
              color: isDark ? '#ffffff' : '#0284c7',
              border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #bae6fd',
              fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: isDark ? 'none' : '0 2px 6px rgba(2,132,199,0.1)'
            }}
          >
            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>

          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button style={{
              height: 42, padding: '0 20px', borderRadius: 10,
              background: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
              color: isDark ? '#ffffff' : '#0f172a',
              border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1.5px solid #cbd5e1',
              fontWeight: 700, fontSize: 14, cursor: 'pointer'
            }}>
              Sign In
            </button>
          </Link>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button style={{
              height: 42, padding: '0 22px', borderRadius: 10,
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#ffffff',
              border: 'none', fontWeight: 800, fontSize: 14,
              boxShadow: '0 4px 14px rgba(37,99,235,0.4)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              Register Account <ArrowRight size={15} />
            </button>
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section style={{
        background: theme.heroBg,
        padding: '60px 32px 80px', position: 'relative', overflow: 'hidden',
        borderBottom: `1px solid ${theme.sectionBorder}`
      }}>
        {/* Glow Background Spheres */}
        <div style={{ position: 'absolute', top: -100, left: '20%', width: 500, height: 500, background: '#38bdf8', opacity: isDark ? 0.08 : 0.15, borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, right: '10%', width: 400, height: 400, background: '#7c3aed', opacity: isDark ? 0.08 : 0.12, borderRadius: '50%', filter: 'blur(90px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 40, alignItems: 'center' }}>
          
          {/* Hero Left Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, zIndex: 2 }}>
            <div>
              <span style={{
                background: isDark ? 'rgba(251,191,36,0.12)' : '#fffbeb',
                color: isDark ? '#fbbf24' : '#b45309',
                border: isDark ? '1px solid rgba(251,191,36,0.3)' : '1px solid #fde68a',
                padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', display: 'inline-flex', alignItems: 'center', gap: 6
              }}>
                🇮🇳 Government of India — Digital Services
              </span>
            </div>

            <h1 style={{ margin: 0, fontSize: 44, fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.03em', color: theme.heading }}>
              Your Gateway to <br />
              <span style={{
                color: isDark ? '#38bdf8' : '#2563eb',
                display: 'inline-block',
                fontWeight: 900
              }}>
                Smart Governance
              </span>
            </h1>

            <p style={{ margin: 0, fontSize: 16, color: theme.muted, lineHeight: 1.6, maxWidth: 580 }}>
              CivicPulse Nexus empowers citizens to file grievances, track status in real-time, apply for certificates, and access government welfare schemes — all from one unified digital portal.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', paddingTop: 8 }}>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <button style={{
                  height: 50, padding: '0 28px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#ffffff',
                  border: 'none', fontWeight: 800, fontSize: 15,
                  boxShadow: '0 8px 24px rgba(37,99,235,0.35)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10
                }}>
                  Register as Citizen <ArrowRight size={18} />
                </button>
              </Link>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button style={{
                  height: 50, padding: '0 26px', borderRadius: 12,
                  background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                  color: theme.heading,
                  border: isDark ? '1.5px solid rgba(255,255,255,0.2)' : '1.5px solid #cbd5e1',
                  fontWeight: 800, fontSize: 15, boxShadow: isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.05)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <LogIn size={16} /> Sign In
                </button>
              </Link>
            </div>

            {/* Key Hero Stat Counter Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, paddingTop: 16 }}>
              <div style={{ background: theme.statBg, borderRadius: 14, padding: '16px', border: `1px solid ${theme.statBorder}`, boxShadow: theme.statShadow }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#0284c7' }}>12,847</div>
                <div style={{ fontSize: 12, color: theme.muted, fontWeight: 600, marginTop: 2 }}>Complaints Resolved</div>
              </div>
              <div style={{ background: theme.statBg, borderRadius: 14, padding: '16px', border: `1px solid ${theme.statBorder}`, boxShadow: theme.statShadow }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#16a34a' }}>4,200+</div>
                <div style={{ fontSize: 12, color: theme.muted, fontWeight: 600, marginTop: 2 }}>Citizens Registered</div>
              </div>
              <div style={{ background: theme.statBg, borderRadius: 14, padding: '16px', border: `1px solid ${theme.statBorder}`, boxShadow: theme.statShadow }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#d97706' }}>98.5%</div>
                <div style={{ fontSize: 12, color: theme.muted, fontWeight: 600, marginTop: 2 }}>SLA Compliance</div>
              </div>
            </div>

          </div>

          {/* Hero Right Bulletin: Live Announcements Panel */}
          <div style={{
            background: theme.bulletinBg, borderRadius: 20,
            border: `1.5px solid ${theme.bulletinBorder}`, padding: '28px',
            boxShadow: theme.bulletinShadow, backdropFilter: 'blur(16px)',
            display: 'flex', flexDirection: 'column', gap: 20, zIndex: 2
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: `1px solid ${theme.sectionBorder}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', display: 'inline-block', boxShadow: '0 0 10px #ef4444' }} />
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: theme.heading }}>📢 Latest Announcements</h3>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#0284c7', background: isDark ? 'rgba(56,189,248,0.1)' : '#e0f2fe', padding: '4px 10px', borderRadius: 12, border: '1px solid #bae6fd' }}>
                LIVE FEED
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {notices.map((n, i) => {
                const Icon = n.icon;
                return (
                  <div key={i} style={{
                    background: theme.noticeBg, borderRadius: 12, padding: '14px 16px',
                    border: `1px solid ${theme.noticeBorder}`, display: 'flex', gap: 12, alignItems: 'flex-start'
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                      color: n.badgeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      boxShadow: isDark ? 'none' : '0 2px 6px rgba(0,0,0,0.05)'
                    }}>
                      <Icon size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: n.badgeColor, letterSpacing: '0.06em' }}>{n.type}</span>
                        <span style={{ fontSize: 11, color: theme.muted, fontWeight: 600 }}>{n.date}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: theme.noticeText, lineHeight: 1.45, fontWeight: 500 }}>
                        {n.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ paddingTop: 6, textAlign: 'center' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button style={{
                  width: '100%', height: 42, borderRadius: 10,
                  background: isDark ? 'rgba(56,189,248,0.1)' : '#f0f9ff',
                  color: '#0284c7', border: '1px solid #bae6fd', fontWeight: 800, fontSize: 13,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}>
                  View All Official Notices <ChevronRight size={15} />
                </button>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── Quick Access Grid Section ── */}
      <section id="quick-access" style={{ padding: '70px 32px', background: theme.altBg, borderBottom: `1px solid ${theme.sectionBorder}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 36 }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#0284c7', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>QUICK ACCESS</span>
            <h2 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: theme.heading, letterSpacing: '-0.02em' }}>Get Started in Seconds</h2>
            <p style={{ margin: 0, fontSize: 15, color: theme.muted, maxWidth: 560 }}>
              Jump directly to the most used citizen digital services. Login required for authenticated requests.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {quickAccess.map((qa, i) => {
              const Icon = qa.icon;
              return (
                <Link key={i} to={qa.to} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: theme.cardBg, borderRadius: 16, padding: '24px',
                    border: `1px solid ${theme.cardBorder}`, display: 'flex', flexDirection: 'column', gap: 16,
                    height: '100%', boxSizing: 'border-box', boxShadow: theme.cardShadow
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: qa.bg, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
                        <Icon size={24} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#0284c7', background: isDark ? 'rgba(56,189,248,0.1)' : '#e0f2fe', padding: '4px 10px', borderRadius: 12, border: '1px solid #bae6fd' }}>
                        {qa.tag}
                      </span>
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: theme.heading }}>{qa.title}</h3>
                      <p style={{ margin: 0, fontSize: 13, color: theme.muted, lineHeight: 1.5 }}>{qa.desc}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Services Directory Grid ── */}
      <section id="services" style={{ padding: '70px 32px', background: theme.bg, borderBottom: `1px solid ${theme.sectionBorder}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 36 }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#16a34a', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>SERVICES DIRECTORY</span>
            <h2 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: theme.heading, letterSpacing: '-0.02em' }}>Popular Municipal Services</h2>
            <p style={{ margin: 0, fontSize: 15, color: theme.muted, maxWidth: 580 }}>
              Access civic services and file complaints directly from your home. No office visits, no queues.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {services.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} onClick={() => { window.location.href = '/login'; }} style={{
                  background: theme.cardBg, borderRadius: 16, padding: '24px',
                  border: `1px solid ${theme.cardBorder}`, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 14, boxShadow: theme.cardShadow
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.05)' : '#f0f9ff', color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 800, color: theme.heading }}>{s.name}</h4>
                    <p style={{ margin: 0, fontSize: 13, color: theme.muted, lineHeight: 1.5 }}>{s.desc}</p>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.06em', paddingTop: 4 }}>
                    {s.dept}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Enterprise Features Section ── */}
      <section id="about" style={{ padding: '70px 32px', background: theme.altBg, borderBottom: `1px solid ${theme.sectionBorder}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 36 }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#d97706', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>WHY CHOOSE CIVICPULSE</span>
            <h2 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: theme.heading, letterSpacing: '-0.02em' }}>Enterprise Governance Platform</h2>
            <p style={{ margin: 0, fontSize: 15, color: theme.muted, maxWidth: 600 }}>
              Cloud-Native architecture engineered for transparent, fast, and accountable public service delivery.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} style={{
                  background: theme.cardBg, borderRadius: 16, padding: '24px',
                  border: `1px solid ${theme.cardBorder}`, display: 'flex', gap: 16, alignItems: 'flex-start', boxShadow: theme.cardShadow
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: isDark ? 'rgba(56,189,248,0.1)' : '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #bae6fd' }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: theme.heading }}>{f.title}</h4>
                    <p style={{ margin: 0, fontSize: 13, color: theme.muted, lineHeight: 1.5 }}>{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Help & FAQs Section ── */}
      <section id="help" style={{ padding: '70px 32px', background: theme.bg }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 36 }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#0284c7', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>NEED HELP?</span>
            <h2 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: theme.heading, letterSpacing: '-0.02em' }}>We're Here to Assist You</h2>
            <p style={{ margin: 0, fontSize: 15, color: theme.muted, maxWidth: 560 }}>
              Get support for registration, complaint tracking, certificate applications, and SLAs.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {helpItems.map((h, i) => {
              const Icon = h.icon;
              return (
                <div key={i} style={{
                  background: theme.cardBg, borderRadius: 16, padding: '28px',
                  border: `1px solid ${theme.cardBorder}`, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: theme.cardShadow
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: isDark ? 'rgba(56,189,248,0.1)' : '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bae6fd' }}>
                    <Icon size={22} />
                  </div>
                  <h4 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: theme.heading }}>{h.title}</h4>
                  <p style={{ margin: 0, fontSize: 13, color: theme.muted, lineHeight: 1.5 }}>{h.desc}</p>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', paddingTop: 16 }}>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button style={{
                height: 50, padding: '0 32px', borderRadius: 12,
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#ffffff',
                border: 'none', fontWeight: 800, fontSize: 15,
                boxShadow: '0 8px 24px rgba(37,99,235,0.35)', cursor: 'pointer'
              }}>
                Create Your Verified Citizen Account
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: theme.footerBg, borderTop: '1px solid rgba(255,255,255,0.08)', padding: '48px 32px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40, paddingBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Landmark size={20} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#ffffff' }}>CivicPulse Nexus</span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
              A Cloud-Native Smart Governance and Citizen Services Management Platform built for transparent, accountable public service delivery.
            </p>
          </div>

          <div>
            <h5 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Platform</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#94a3b8' }}>
              <a href="#services" style={{ color: 'inherit', textDecoration: 'none' }}>Services Directory</a>
              <a href="#quick-access" style={{ color: 'inherit', textDecoration: 'none' }}>Quick Access Portal</a>
              <a href="#about" style={{ color: 'inherit', textDecoration: 'none' }}>About CivicPulse</a>
              <a href="#help" style={{ color: 'inherit', textDecoration: 'none' }}>Help & Support</a>
            </div>
          </div>

          <div>
            <h5 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Legal & RTI</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#94a3b8' }}>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Governance</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>RTI Disclosures</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>SLA Policies</a>
            </div>
          </div>

          <div>
            <h5 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Support & Helplines</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#94a3b8' }}>
              <span>Toll-Free: 1800-11-2026</span>
              <span>Disaster Helpline: 112</span>
              <span>Email: support@civicpulse.gov.in</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1280, margin: '24px auto 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, fontSize: 12, color: '#64748b' }}>
          <span>© 2026 CivicPulse Nexus. Government of India Digital Governance Initiative.</span>
          <span>Built for transparent & smart citizen service delivery.</span>
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;
