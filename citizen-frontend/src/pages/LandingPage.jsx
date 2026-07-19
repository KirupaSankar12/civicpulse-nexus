import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const notices = [
  { text: 'Water Supply Maintenance scheduled in Ward 7–12 on 10th July. Expect disruption 6AM–2PM.', date: 'July 8, 2026', type: 'alert' },
  { text: 'Road Repair Notice: NH-48 flyover under construction. Use alternate route via Ring Road.', date: 'July 6, 2026', type: 'info' },
  { text: 'Emergency Helpline: 1800-XXX-XXXX available 24×7 for disaster-related complaints.', date: 'July 4, 2026', type: 'emergency' },
  { text: 'New e-Service: Residence Certificates can now be applied online — No office visit needed!', date: 'July 1, 2026', type: 'new' },
];

const services = [
  { icon: '💧', name: 'Water Supply', desc: 'Leakage, shortage, tanker requests', dept: 'Water Dept' },
  { icon: '🛣️', name: 'Roads & Traffic', desc: 'Potholes, signals, encroachments', dept: 'Public Works' },
  { icon: '⚡', name: 'Electricity', desc: 'Outages, street lights, billing', dept: 'Electricity Board' },
  { icon: '🗑️', name: 'Sanitation', desc: 'Garbage, drains, public hygiene', dept: 'Sanitation Dept' },
  { icon: '🏥', name: 'Health', desc: 'Public health, mosquitoes, stray animals', dept: 'Health Dept' },
  { icon: '📜', name: 'Birth Certificate', desc: 'Apply for official birth record', dept: 'Health Dept' },
  { icon: '📋', name: 'Death Certificate', desc: 'Register and obtain death record', dept: 'Health Dept' },
  { icon: '💼', name: 'Trade License', desc: 'Commercial shop/trade registration', dept: 'Municipal Corp' },
];

const quickAccess = [
  { icon: '📝', title: 'File Complaint', to: '/login', desc: 'Report civic issues' },
  { icon: '📜', title: 'Apply Certificate', to: '/login', desc: 'Birth, income & more' },
  { icon: '🔍', title: 'Track Status', to: '/login', desc: 'Check application progress' },
  { icon: '👤', title: 'Citizen Login', to: '/login', desc: 'Access your account' },
];

const features = [
  { icon: '⚡', title: 'Real-Time Tracking', desc: 'Track your complaint status live with automatic updates and timeline history.' },
  { icon: '🔒', title: 'Secured & Private', desc: 'End-to-end encrypted with Keycloak SSO. Your data is 100% safe.' },
  { icon: '📱', title: 'Multi-Channel', desc: 'Access via web, mobile browser, or API. Responsive on all devices.' },
  { icon: '🏛️', title: 'Government Standard', desc: 'Built to comply with Government of India digital services standards.' },
  { icon: '📊', title: 'SLA Monitoring', desc: 'Strict Service Level Agreements with escalation when deadlines are missed.' },
  { icon: '🔔', title: 'Smart Notifications', desc: 'Instant alerts via in-app notifications on every status change.' },
];

const helpItems = [
  { icon: '📞', title: 'Helpline Support', desc: 'Call 1800-XXX-XXXX (Mon–Sat, 9AM–6PM) for assistance with services and applications.' },
  { icon: '📖', title: 'User Guide', desc: 'Step-by-step guides for filing complaints, applying for certificates, and tracking status.' },
  { icon: '❓', title: 'FAQs', desc: 'Find answers to common questions about registration, documents, and processing times.' },
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
      <nav className="public-nav">
        <Link to="/" className="nav-brand">
          <div className="brand-icon">🏛️</div>
          <div>
            <div className="brand-name">CivicPulse Nexus</div>
            <span className="brand-sub">Smart Governance Platform</span>
          </div>
        </Link>

        <div className="nav-links">
          <a href="#services">Services</a>
          <a href="#quick-access">Quick Access</a>
          <a href="#about">About</a>
          <a href="#help">Help</a>
        </div>

        <div className="nav-actions">
          <button
            type="button"
            onClick={toggleTheme}
            className="btn btn-ghost btn-sm"
            style={{ border: '1px solid var(--border)' }}
          >
            {theme === 'premium' ? '🔵 Basic UI' : '🎨 Premium UI'}
          </button>
          <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="gov-badge">
              🇮🇳 Government of India — Digital Services
            </div>
            <h1>
              Your Gateway to <span>Smart Governance</span>
            </h1>
            <p>
              CivicPulse Nexus empowers citizens to file grievances, track status in real-time,
              apply for certificates, and access government services — all from one unified digital portal.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-hero-primary btn-xl">
                Register as Citizen
              </Link>
              <Link to="/login" className="btn btn-hero-outline btn-xl">
                Sign In
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

          <div className="hero-panel">
            <h3>📢 Latest Announcements</h3>
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

      <div id="quick-access" style={{ background: 'white' }}>
        <div className="section">
          <div className="section-label">Quick Access</div>
          <h2 className="section-title">Get Started in Seconds</h2>
          <p className="section-sub">
            Jump directly to the most used citizen services. Login required for authenticated services.
          </p>
          <div className="quick-access-grid">
            {quickAccess.map((item, i) => (
              <Link to={item.to} className="quick-access-card" key={i}>
                <span className="qa-icon-lg">{item.icon}</span>
                <div className="qa-title">{item.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{item.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div id="services" style={{ background: '#f8fafc' }}>
        <div className="section">
          <div className="section-label">Our Services</div>
          <h2 className="section-title">Popular Government Services</h2>
          <p className="section-sub">
            Access all civic services and file grievances directly from your home.
            No office visits, no queues.
          </p>

          <div className="services-grid">
            {services.map((s, i) => (
              <div className="service-card" key={i} onClick={() => { window.location.href = '/login'; }} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && (window.location.href = '/login')}>
                <span className="svc-icon">{s.icon}</span>
                <div className="svc-name">{s.name}</div>
                <div className="svc-desc">{s.desc}</div>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: '600', marginTop: '8px' }}>{s.dept}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

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

      <div id="about" style={{ background: 'white' }}>
        <div className="section">
          <div className="section-label">About CivicPulse</div>
          <h2 className="section-title">A Modern Platform for Public Governance</h2>
          <p className="section-sub">
            CivicPulse Nexus is a Cloud-Native Smart Governance platform developed to bring
            transparency, speed, and accountability to civic complaint management and government
            citizen service delivery.
          </p>
          <div style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {['Built on Microservices Architecture', 'Powered by Keycloak SSO', 'Event-Driven with Apache Kafka', 'Real-time SLA Monitoring & Alerts'].map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text)', padding: '12px 16px', background: 'var(--surface2)', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--accent)', fontSize: '16px' }}>✓</span> {p}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="features" style={{ background: '#f8fafc' }}>
        <div className="section">
          <div className="section-label">Why Choose CivicPulse</div>
          <h2 className="section-title">Enterprise-Grade Features</h2>
          <p className="section-sub">
            Designed for scale, built for citizens — CivicPulse Nexus brings the best of
            enterprise software to public governance.
          </p>

          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card animate-fade-in" key={i} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="fc-icon" style={{ color: 'white' }}>{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="help" className="help-section">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="section-label">Need Help?</div>
          <h2 className="section-title">We're Here to Assist You</h2>
          <p className="section-sub">
            Get support for registration, complaints, certificate applications, and more.
          </p>
          <div className="help-grid">
            {helpItems.map((h, i) => (
              <div className="help-card" key={i}>
                <span className="help-icon">{h.icon}</span>
                <h4>{h.title}</h4>
                <p>{h.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link to="/register" className="btn btn-primary btn-lg">Create Your Citizen Account</Link>
          </div>
        </div>
      </div>

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
              built for transparent, accountable public service delivery.
            </p>
          </div>
          <div className="footer-col">
            <h5>Platform</h5>
            <a href="#services">Services</a>
            <a href="#quick-access">Quick Access</a>
            <a href="#about">About</a>
            <a href="#help">Help</a>
          </div>
          <div className="footer-col">
            <h5>Legal</h5>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">RTI</a>
          </div>
          <div className="footer-col">
            <h5>Support</h5>
            <a href="#help">Help Center</a>
            <a href="#">Contact Us</a>
            <a href="#">Emergency: 112</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 CivicPulse Nexus. Government of India Digital Initiative.</span>
          <span>Built with care for citizens.</span>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
