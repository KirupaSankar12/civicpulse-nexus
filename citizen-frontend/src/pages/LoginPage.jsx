import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import keycloak from '../keycloak.js';
import { 
  Landmark, ShieldAlert, User, Briefcase, CheckCircle2, Lock, Eye, EyeOff, 
  ArrowLeft, ArrowRight, ShieldCheck, KeyRound, Globe, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react';

const decodeJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginRole, setLoginRole] = useState('citizen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showTestCreds, setShowTestCreds] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cp_remember_email');
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Username or email is required.';
    if (!password) errs.password = 'Password is required.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('client_id', 'civicpulse-frontend');
      params.append('username', email);
      params.append('password', password);

      const response = await axios.post(
        'http://localhost:8180/realms/civicpulse/protocol/openid-connect/token',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const { access_token, refresh_token, id_token } = response.data;

      // Validate Portal vs Role before accepting tokens
      const payload = decodeJwt(access_token);
      const roles = payload?.realm_access?.roles || [];
      const isCitizenRole = roles.includes('CITIZEN') || roles.includes('citizen');
      const isOfficerRole = roles.includes('OFFICER') || roles.includes('officer');
      const isAdminRole = roles.includes('ADMIN') || roles.includes('admin');

      if (loginRole === 'citizen') {
        if (isOfficerRole || isAdminRole) {
          setError('Access Denied. This account belongs to the Officer Portal. Please login using the Officer Portal.');
          setLoading(false);
          return;
        }
      } else if (loginRole === 'officer') {
        if (isCitizenRole && !isOfficerRole && !isAdminRole) {
          setError('Access Denied. Citizen accounts can only login through the Citizen Portal. Please switch to the Citizen Portal.');
          setLoading(false);
          return;
        }
      }

      // If valid, save credentials
      if (rememberMe) {
        localStorage.setItem('cp_remember_email', email);
      } else {
        localStorage.removeItem('cp_remember_email');
      }

      localStorage.setItem('kc_token', access_token);
      localStorage.setItem('kc_refreshToken', refresh_token);
      if (id_token) {
        localStorage.setItem('kc_idToken', id_token);
      }

      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Direct grant login failed:', err);
      if (err.response) {
        const errorDesc = err.response.data?.error_description || 'Invalid credentials or login flow not supported.';
        setError(errorDesc);
      } else {
        setError('Cannot connect to identity server. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleKeycloakSSORedirect = () => {
    keycloak.login({ redirectUri: window.location.origin + '/dashboard' });
  };

  const autofillCredentials = (userHandle, role = 'citizen') => {
    setEmail(userHandle);
    setPassword('Password123');
    setLoginRole(role);
    setFieldErrors({});
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: '#f8fafc',
      fontFamily: 'Inter, system-ui, sans-serif', color: '#0f172a'
    }}>
      
      {/* ── Left Hero Panel (Light Blue & White Premium Design) ── */}
      <div style={{
        flex: '1 1 45%',
        background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 50%, #ffffff 100%)',
        borderRight: '1px solid #bae6fd',
        padding: '60px 48px', color: '#0f172a', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', position: 'relative', overflow: 'hidden'
      }}>
        {/* Glow Spheres */}
        <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, background: '#38bdf8', opacity: 0.15, borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, right: -100, width: 350, height: 350, background: '#60a5fa', opacity: 0.12, borderRadius: '50%', filter: 'blur(90px)', pointerEvents: 'none' }} />

        {/* Top Brand Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 14, zIndex: 2 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12,
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(37,99,235,0.3)', border: '1.5px solid rgba(255,255,255,0.4)'
          }}>
            <Landmark size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>
              CivicPulse <span style={{ color: '#0284c7' }}>Nexus</span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#0284c7', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 4 }}>
              Smart Governance Platform
            </div>
          </div>
        </Link>

        {/* Hero Middle Content */}
        <div style={{ zIndex: 2, margin: '60px 0', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 480 }}>
          <span style={{
            background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a',
            padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start', boxShadow: '0 2px 6px rgba(180,83,9,0.05)'
          }}>
            🇮🇳 Government of India — Digital Portal
          </span>

          <h1 style={{ margin: 0, fontSize: 38, fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.03em', color: '#0f172a' }}>
            Unified Access to <br />
            <span style={{ color: '#1d4ed8', fontWeight: 900, display: 'inline-block' }}>
              Public Governance Services
            </span>
          </h1>

          <p style={{ margin: 0, fontSize: 15, color: '#334155', lineHeight: 1.6, fontWeight: 500 }}>
            File grievances, track real-time SLA officer deadlines, apply for birth & residence certificates, and access government welfare schemes from one secure platform.
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 8 }}>
            <div style={{ background: '#ffffff', border: '1px solid #bae6fd', padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, color: '#0369a1', boxShadow: '0 2px 6px rgba(2,132,199,0.06)' }}>
              <ShieldCheck size={14} className="text-emerald-600" /> 256-bit SSL Encrypted
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #bae6fd', padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, color: '#0369a1', boxShadow: '0 2px 6px rgba(2,132,199,0.06)' }}>
              <KeyRound size={14} className="text-sky-600" /> Keycloak SSO Secured
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ zIndex: 2, fontSize: 12, color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>© 2026 CivicPulse Nexus</span>
          <Link to="/" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* ── Right Form Container (Clean Elevated White Form Card) ── */}
      <div style={{
        flex: '1 1 55%', padding: '48px 36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div style={{
          width: '100%', maxWidth: 480, background: '#ffffff', borderRadius: 20, padding: 36,
          border: '1.5px solid #e2e8f0', boxShadow: '0 20px 40px rgba(15,23,42,0.08)',
          display: 'flex', flexDirection: 'column', gap: 24
        }}>
          
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Sign In to Your Account
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>
              Choose your portal role below and enter your credentials.
            </p>
          </div>

          {/* Portal Selector Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button
              type="button"
              onClick={() => setLoginRole('citizen')}
              style={{
                padding: '14px 16px', borderRadius: 14, textAlign: 'left', cursor: 'pointer',
                background: loginRole === 'citizen' ? '#eff6ff' : '#ffffff',
                border: loginRole === 'citizen' ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                boxShadow: loginRole === 'citizen' ? '0 4px 12px rgba(37,99,235,0.15)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: loginRole === 'citizen' ? '#2563eb' : '#f1f5f9', color: loginRole === 'citizen' ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={18} />
                </div>
                {loginRole === 'citizen' && <span style={{ fontSize: 10, fontWeight: 800, color: '#15803d', background: '#f0fdf4', padding: '2px 8px', borderRadius: 10, border: '1px solid #bbf7d0' }}>Active</span>}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: loginRole === 'citizen' ? '#1e40af' : '#334155' }}>Citizen Portal</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>File complaints & apply</div>
            </button>

            <button
              type="button"
              onClick={() => setLoginRole('officer')}
              style={{
                padding: '14px 16px', borderRadius: 14, textAlign: 'left', cursor: 'pointer',
                background: loginRole === 'officer' ? '#f5f3ff' : '#ffffff',
                border: loginRole === 'officer' ? '2px solid #7c3aed' : '1.5px solid #e2e8f0',
                boxShadow: loginRole === 'officer' ? '0 4px 12px rgba(124,58,237,0.15)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: loginRole === 'officer' ? '#7c3aed' : '#f1f5f9', color: loginRole === 'officer' ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={18} />
                </div>
                {loginRole === 'officer' && <span style={{ fontSize: 10, fontWeight: 800, color: '#6d28d9', background: '#f5f3ff', padding: '2px 8px', borderRadius: 10, border: '1px solid #ddd6fe' }}>Active</span>}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: loginRole === 'officer' ? '#5b21b6' : '#334155' }}>Officer Portal</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Verify & approve apps</div>
            </button>
          </div>

          {/* Alert Message */}
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 16px',
              color: '#dc2626', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: 10
            }}>
              <ShieldAlert size={18} className="flex-shrink-0" style={{ marginTop: 2 }} />
              <div>{error}</div>
            </div>
          )}

          {/* Main Login Form */}
          <form onSubmit={handleCustomLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="login-email" style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                Username or Email Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: 14, top: 13, color: '#94a3b8' }} />
                <input
                  id="login-email"
                  type="text"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors({ ...fieldErrors, email: null }); }}
                  placeholder={loginRole === 'citizen' ? 'citizen1@gmail.com' : 'john or mark'}
                  style={{
                    width: '100%', height: 46, paddingLeft: 42, paddingRight: 14, borderRadius: 10,
                    border: fieldErrors.email ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                    fontSize: 14, color: '#0f172a', boxSizing: 'border-box', outline: 'none'
                  }}
                />
              </div>
              {fieldErrors.email && <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>{fieldErrors.email}</div>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="login-password" style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                  Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => { e.preventDefault(); alert('Contact municipal admin to reset credentials or use Keycloak Admin Console.'); }}
                  style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none', fontWeight: 700 }}
                >
                  Forgot Password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, top: 13, color: '#94a3b8' }} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors({ ...fieldErrors, password: null }); }}
                  placeholder="••••••••"
                  style={{
                    width: '100%', height: 46, paddingLeft: 42, paddingRight: 42, borderRadius: 10,
                    border: fieldErrors.password ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                    fontSize: 14, color: '#0f172a', boxSizing: 'border-box', outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>{fieldErrors.password}</div>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#2563eb' }}
              />
              <label htmlFor="rememberMe" style={{ fontSize: 13, color: '#64748b', cursor: 'pointer', fontWeight: 600 }}>
                Remember my username
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                height: 48, borderRadius: 12, border: 'none',
                background: loginRole === 'citizen' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: '#ffffff', fontWeight: 800, fontSize: 15, cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              {loading ? (
                <>Authenticating...</>
              ) : (
                <>🔐 Sign In as {loginRole === 'citizen' ? 'Citizen' : 'Department Officer'} <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          <button
            type="button"
            onClick={handleKeycloakSSORedirect}
            style={{
              height: 44, borderRadius: 10, background: '#ffffff', color: '#334155',
              border: '1.5px solid #cbd5e1', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}
          >
            <Globe size={18} className="text-sky-600" /> Single Sign-On (Keycloak SSO)
          </button>

          {/* Quick-Fill Test Credentials Panel */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setShowTestCreds(!showTestCreds)}
              style={{
                width: '100%', padding: '12px 16px', background: 'none', border: 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer', color: '#2563eb', fontWeight: 800, fontSize: 13
              }}
            >
              <span>📋 Quick-Fill Test Credentials</span>
              {showTestCreds ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showTestCreds && (
              <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Click any account below to auto-fill (Password: <strong>Password123</strong>):</p>
                
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', marginBottom: 6 }}>👤 Citizens</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['citizen1@gmail.com', 'citizen2@gmail.com', 'citizen3@gmail.com'].map(u => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => autofillCredentials(u, 'citizen')}
                        style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontFamily: 'monospace', cursor: 'pointer', fontWeight: 600, color: '#0f172a' }}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', marginBottom: 6 }}>🧑‍💼 Officers</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[
                      { user: 'john', dept: 'Health' },
                      { user: 'mark', dept: 'Revenue' },
                      { user: 'ryan', dept: 'Municipal' },
                      { user: 'chris', dept: 'Water' },
                      { user: 'ethan', dept: 'Roads' },
                      { user: 'jack', dept: 'Electricity' },
                      { user: 'david', dept: 'Sanitation' },
                      { user: 'will', dept: 'Urban' },
                    ].map(o => (
                      <button
                        key={o.user}
                        type="button"
                        onClick={() => autofillCredentials(o.user, 'officer')}
                        style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontFamily: 'monospace', cursor: 'pointer', fontWeight: 600, color: '#0f172a' }}
                      >
                        {o.user} ({o.dept})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', fontSize: 14 }}>
            <span style={{ color: '#64748b' }}>Don't have an account? </span>
            <Link to="/register" style={{ color: '#2563eb', fontWeight: 800, textDecoration: 'none' }}>
              Register as Citizen
            </Link>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
              ← Back to Home
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}

export default LoginPage;
