import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const notices = [
  { text: 'Water Supply Maintenance scheduled in Ward 7–12 on 10th July. Expect disruption 6AM–2PM.', date: 'July 8, 2026' },
  { text: 'Road Repair Notice: NH-48 flyover under construction. Use alternate route via Ring Road.', date: 'July 6, 2026' },
  { text: 'Emergency Helpline: 1800-XXX-XXXX available 24×7 for disaster-related complaints.', date: 'July 4, 2026' },
  { text: 'New e-Service: Residence Certificates can now be applied online — No office visit needed!', date: 'July 1, 2026' },
];

const services = [
  { icon: '💧', name: 'Water Supply', desc: 'Leakage, shortage, tanker requests' },
  { icon: '🛣️', name: 'Roads & Traffic', desc: 'Potholes, signals, encroachments' },
  { icon: '⚡', name: 'Electricity', desc: 'Outages, street lights, billing' },
  { icon: '🗑️', name: 'Sanitation', desc: 'Garbage, drains, public hygiene' },
  { icon: '🏥', name: 'Health', desc: 'Public health, mosquitoes, stray animals' },
  { icon: '📜', name: 'Birth Certificate', desc: 'Apply for official birth record' },
  { icon: '📋', name: 'Death Certificate', desc: 'Register and obtain death record' },
  { icon: '💼', name: 'Trade License', desc: 'Commercial shop/trade registration' },
];

const features = [
  { icon: '⚡', title: 'Real-Time Tracking', desc: 'Track your complaint status live with automatic updates and timeline history.' },
  { icon: '🔒', title: 'Secured & Private', desc: 'End-to-end encrypted with Keycloak SSO. Your data is 100% safe.' },
  { icon: '📱', title: 'Multi-Channel', desc: 'Access via web, mobile browser, or API. Responsive on all devices.' },
  { icon: '🏛️', title: 'Government Standard', desc: 'Built to comply with Government of India digital services standards.' },
  { icon: '📊', title: 'SLA Monitoring', desc: 'Strict Service Level Agreements with escalation when deadlines are missed.' },
  { icon: '🔔', title: 'Smart Notifications', desc: 'Instant alerts via in-app notifications on every status change.' },
];

function LandingPage() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'premium');

  useEffect(() => {
    if (theme === 'basic') {
      document.body.classList.add('theme-basic');
    } else {
      document.body.classList.remove('theme-basic');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'premium' ? 'basic' : 'premium';
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  };

  return (
    <div className="public-layout">
      {/* NAV */}
      <nav className="public-nav">
        <div className="nav-brand">
          <div className="brand-icon">🏛️</div>
          <div>
            <div className="brand-name">CivicPulse Nexus</div>
            <span className="brand-sub">Smart Governance Platform</span>
          </div>
        </div>

        <div className="nav-links">
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="nav-actions">
          <button 
            onClick={toggleTheme} 
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginRight: '8px'
            }}
          >
            {theme === 'premium' ? '🔵 Switch to Basic UI' : '🎨 Switch to Premium UI'}
          </button>
          <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="gov-badge">
              🇮🇳 Government of India — Digital Services
            </div>
            <h1>
              Smart <span>Governance</span><br />
              Platform
            </h1>
            <p>
              CivicPulse Nexus empowers citizens to file grievances, track status in real-time,
              and access government services — all from one unified digital portal.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-hero-primary btn-xl">
                🚀 Register as Citizen
              </Link>
              <Link to="/login" className="btn btn-hero-outline btn-xl">
                🔐 Login
              </Link>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <div className="num">12,847</div>
                <div className="lbl">Complaints Resolved</div>
              </div>
              <div className="hero-stat">
                <div className="num">4,200+</div>
                <div className="lbl">Citizens Registered</div>
              </div>
              <div className="hero-stat">
                <div className="num">98.5%</div>
                <div className="lbl">SLA Compliance</div>
              </div>
            </div>
          </div>

          {/* Right panel — notices */}
          <div className="hero-panel">
            <h3>📢 Latest Government Notices</h3>
            {notices.map((n, i) => (
              <div className="notice-item" key={i}>
                <div className="notice-dot" />
                <div>
                  <div className="notice-text">{n.text}</div>
                  <div className="notice-date">{n.date}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: '14px', textAlign: 'center' }}>
              <Link to="/login" className="btn btn-accent btn-sm">
                View All Notices
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR SERVICES */}
      <div id="services" style={{ background: 'white' }}>
        <div className="section">
          <div className="section-label">Our Services</div>
          <h2 className="section-title">Popular Government Services</h2>
          <p className="section-sub">
            Access all civic services and file grievances directly from your home.
            No office visits, no queues.
          </p>

          <div className="services-grid">
            {services.map((s, i) => (
              <div className="service-card" key={i} onClick={() => window.location.href = '/login'}>
                <span className="svc-icon">{s.icon}</span>
                <div className="svc-name">{s.name}</div>
                <div className="svc-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CITIZEN STATS */}
      <div className="stats-section">
        <div className="stats-section-inner">
          <div className="citizen-stat">
            <div className="cs-num">4,200+</div>
            <div className="cs-label">Registered Citizens</div>
          </div>
          <div className="citizen-stat">
            <div className="cs-num">15,340</div>
            <div className="cs-label">Total Complaints Filed</div>
          </div>
          <div className="citizen-stat">
            <div className="cs-num">12,847</div>
            <div className="cs-label">Complaints Resolved</div>
          </div>
          <div className="citizen-stat">
            <div className="cs-num">4</div>
            <div className="cs-label">Active Departments</div>
          </div>
        </div>
      </div>

      {/* ABOUT */}
      <div id="about" style={{ background: '#f8fafc' }}>
        <div className="section">
          <div className="section-label">About CivicPulse</div>
          <h2 className="section-title">A Modern Platform for Public Governance</h2>
          <p className="section-sub">
            CivicPulse Nexus is a Cloud-Native Smart Governance platform developed to bring
            transparency, speed, and accountability to civic complaint management and government
            citizen service delivery.
          </p>
          <div style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '600px' }}>
            {['Built on Microservices Architecture', 'Powered by Keycloak SSO', 'Event-Driven with Apache Kafka', 'Real-time SLA Monitoring & Alerts'].map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text)' }}>
                <span style={{ color: 'var(--accent)', fontSize: '16px' }}>✓</span> {p}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div id="features" style={{ background: 'white' }}>
        <div className="section">
          <div className="section-label">Why Choose CivicPulse</div>
          <h2 className="section-title">Enterprise-Grade Features</h2>
          <p className="section-sub">
            Designed for scale, built for citizens — CivicPulse Nexus brings the best of
            enterprise software to public governance.
          </p>

          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="fc-icon" style={{ color: 'white' }}>{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="public-footer" id="contact">
        <div className="footer-grid">
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '24px' }}>🏛️</div>
              <div>
                <div style={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>CivicPulse Nexus</div>
                <div style={{ fontSize: '11px', opacity: '0.6' }}>Smart Governance Platform</div>
              </div>
            </div>
            <p>
              A Cloud-Native Smart Governance and Citizen Services Management Platform
              built for Infosys Capstone Evaluation.
            </p>
          </div>
          <div className="footer-col">
            <h5>Platform</h5>
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#features">Features</a>
          </div>
          <div className="footer-col">
            <h5>Legal</h5>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">RTI</a>
          </div>
          <div className="footer-col">
            <h5>Support</h5>
            <a href="#">Help Center</a>
            <a href="#">Contact Us</a>
            <a href="#">Emergency: 112</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 CivicPulse Nexus. Government of India Digital Initiative.</span>
          <span>Built with ❤️ for citizens.</span>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
