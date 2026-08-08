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
      
      let finalUsername = email.trim();
      if (finalUsername === 'citizen4') {
        finalUsername = 'citizen4@gmail.com';
      }
      
      params.append('username', finalUsername);
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
      minHeight: '100vh', display: 'flex', background: '#f4f7f9',
      fontFamily: 'Inter, system-ui, sans-serif', color: '#0f172a'
    }}>
      
      {/* ── Left Hero Panel (Premium Abstract Dark/Gradient Mesh) ── */}
      <div style={{
        flex: '1 1 45%',
        background: '#090e17',
        backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(37,99,235,0.15) 0%, transparent 50%), radial-gradient(circle at 85% 30%, rgba(124,58,237,0.15) 0%, transparent 50%)',
        position: 'relative', overflow: 'hidden',
        padding: '60px 48px', color: '#ffffff', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '10px 0 30px rgba(0,0,0,0.1)'
      }}>
        {/* Glow Spheres */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%', background: '#3b82f6', opacity: 0.1, borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '60%', height: '60%', background: '#8b5cf6', opacity: 0.1, borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none' }} />

        {/* Top Brand Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 16, zIndex: 2 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(37,99,235,0.4)', border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Landmark size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
              CivicPulse <span style={{ color: '#38bdf8' }}>Nexus</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 6 }}>
              Smart Governance Platform
            </div>
          </div>
        </Link>

        {/* Hero Middle Content */}
        <div style={{ zIndex: 2, margin: '60px 0', display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 500 }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255,255,255,0.1)',
            padding: '8px 18px', borderRadius: 30, fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start', color: '#e2e8f0', backdropFilter: 'blur(10px)'
          }}>
            🇮🇳 Government of India — Digital Portal
          </div>

          <h1 style={{ margin: 0, fontSize: 42, fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.03em', color: '#ffffff' }}>
            Unified Access to <br />
            <span style={{ color: '#60a5fa', fontWeight: 900, display: 'inline-block' }}>
              Public Governance Services
            </span>
          </h1>

          <p style={{ margin: 0, fontSize: 16, color: '#94a3b8', lineHeight: 1.6, fontWeight: 500 }}>
            File grievances, track real-time SLA officer deadlines, apply for birth & residence certificates, and access government welfare schemes from one secure platform.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', paddingTop: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: '#e2e8f0', backdropFilter: 'blur(10px)' }}>
              <ShieldCheck size={16} color="#34d399" /> 256-bit SSL Encrypted
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: '#e2e8f0', backdropFilter: 'blur(10px)' }}>
              <KeyRound size={16} color="#38bdf8" /> Keycloak SSO Secured
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ zIndex: 2, fontSize: 13, color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 500 }}>
          <span>© 2026 CivicPulse Nexus</span>
          <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#94a3b8'}>
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </div>

      {/* ── Right Form Container (True Split-Screen) ── */}
      <div style={{
        flex: '1 1 55%', padding: '60px 10%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--surface, #ffffff)', position: 'relative'
      }}>
        <div style={{
          width: '100%', maxWidth: 800,
          display: 'flex', flexDirection: 'column', gap: 32, zIndex: 1, position: 'relative'
        }}>
          
          <div style={{ textAlign: 'left', marginBottom: 16 }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 38, fontWeight: 900, color: 'var(--text, #0f172a)', letterSpacing: '-0.02em' }}>
              Sign In to Your Account
            </h2>
            <p style={{ margin: 0, fontSize: 17, color: 'var(--text-secondary, #64748b)', lineHeight: 1.5, fontWeight: 500 }}>
              Choose your portal role below and enter your credentials.
            </p>
          </div>

          {/* Portal Selector Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <button
              type="button"
              onClick={() => setLoginRole('citizen')}
              style={{
                padding: '16px', borderRadius: 16, textAlign: 'left', cursor: 'pointer',
                background: loginRole === 'citizen' ? 'rgba(59,130,246,0.12)' : 'var(--bg, #ffffff)',
                border: loginRole === 'citizen' ? '2px solid #3b82f6' : '1.5px solid var(--border, #cbd5e1)',
                boxShadow: loginRole === 'citizen' ? '0 4px 20px rgba(59,130,246,0.15)' : '0 2px 4px rgba(0,0,0,0.02)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                outline: 'none'
              }}
              onMouseOver={e => { if(loginRole !== 'citizen') e.currentTarget.style.borderColor = '#93c5fd' }}
              onMouseOut={e => { if(loginRole !== 'citizen') e.currentTarget.style.borderColor = 'var(--border, #cbd5e1)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: loginRole === 'citizen' ? '#3b82f6' : 'var(--border, #f1f5f9)', color: loginRole === 'citizen' ? '#fff' : 'var(--text-secondary, #64748b)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                  <User size={20} />
                </div>
                {loginRole === 'citizen' && <span style={{ fontSize: 11, fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '3px 10px', borderRadius: 12, border: '1px solid #86efac' }}>Active</span>}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: loginRole === 'citizen' ? '#3b82f6' : 'var(--text, #334155)' }}>Citizen Portal</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary, #64748b)', marginTop: 4, fontWeight: 500 }}>File complaints & apply</div>
            </button>

            <button
              type="button"
              onClick={() => setLoginRole('officer')}
              style={{
                padding: '16px', borderRadius: 16, textAlign: 'left', cursor: 'pointer',
                background: loginRole === 'officer' ? 'rgba(139,92,246,0.12)' : 'var(--bg, #ffffff)',
                border: loginRole === 'officer' ? '2px solid #8b5cf6' : '1.5px solid var(--border, #cbd5e1)',
                boxShadow: loginRole === 'officer' ? '0 4px 20px rgba(139,92,246,0.15)' : '0 2px 4px rgba(0,0,0,0.02)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                outline: 'none'
              }}
              onMouseOver={e => { if(loginRole !== 'officer') e.currentTarget.style.borderColor = '#c4b5fd' }}
              onMouseOut={e => { if(loginRole !== 'officer') e.currentTarget.style.borderColor = 'var(--border, #cbd5e1)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: loginRole === 'officer' ? '#8b5cf6' : 'var(--border, #f1f5f9)', color: loginRole === 'officer' ? '#fff' : 'var(--text-secondary, #64748b)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                  <Briefcase size={20} />
                </div>
                {loginRole === 'officer' && <span style={{ fontSize: 11, fontWeight: 800, color: '#6d28d9', background: '#ede9fe', padding: '3px 10px', borderRadius: 12, border: '1px solid #c4b5fd' }}>Active</span>}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: loginRole === 'officer' ? '#8b5cf6' : 'var(--text, #334155)' }}>Officer Portal</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary, #64748b)', marginTop: 4, fontWeight: 500 }}>Verify & approve apps</div>
            </button>
          </div>

          {/* Alert Message */}
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14, padding: '16px 20px',
              color: '#dc2626', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12,
              animation: 'shake 0.4s ease-in-out'
            }}>
              <ShieldAlert size={20} className="flex-shrink-0" />
              <div style={{ lineHeight: 1.4 }}>{error}</div>
            </div>
          )}

          {/* Main Login Form */}
          <form onSubmit={handleCustomLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            <div>
              <label htmlFor="login-email" style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text, #475569)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Username or Email Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User size={22} style={{ position: 'absolute', left: 18, top: 16, color: '#94a3b8' }} />
                <input
                  id="login-email"
                  type="text"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors({ ...fieldErrors, email: null }); }}
                  placeholder="e.g. citizen1@gmail.com or officer1"
                  style={{
                    width: '100%', height: 56, paddingLeft: 52, paddingRight: 20, borderRadius: 14,
                    border: fieldErrors.email ? '2px solid #ef4444' : '2px solid var(--border, #e2e8f0)',
                    fontSize: 16, color: 'var(--text, #0f172a)', boxSizing: 'border-box', outline: 'none',
                    transition: 'all 0.2s', background: 'var(--bg, #f8fafc)'
                  }}
                  onFocus={e => { if(!fieldErrors.email) e.target.style.borderColor = loginRole === 'citizen' ? '#3b82f6' : '#8b5cf6'; }}
                  onBlur={e => { if(!fieldErrors.email) e.target.style.borderColor = 'var(--border, #e2e8f0)'; }}
                />
              </div>
              {fieldErrors.email && <div style={{ fontSize: 13, color: '#ef4444', marginTop: 6, fontWeight: 600 }}>{fieldErrors.email}</div>}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label htmlFor="login-password" style={{ fontSize: 12, fontWeight: 800, color: 'var(--text, #475569)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => { e.preventDefault(); alert('Please contact system administrator or use Keycloak SSO reset option.'); }}
                  style={{ fontSize: 13, fontWeight: 700, color: loginRole === 'citizen' ? '#3b82f6' : '#8b5cf6', textDecoration: 'none' }}
                >
                  Forgot Password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={22} style={{ position: 'absolute', left: 18, top: 16, color: '#94a3b8' }} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors({ ...fieldErrors, password: null }); }}
                  placeholder="••••••••"
                  style={{
                    width: '100%', height: 56, paddingLeft: 52, paddingRight: 52, borderRadius: 14,
                    border: fieldErrors.password ? '2px solid #ef4444' : '2px solid var(--border, #e2e8f0)',
                    fontSize: 16, color: 'var(--text, #0f172a)', boxSizing: 'border-box', outline: 'none',
                    transition: 'all 0.2s', background: 'var(--bg, #f8fafc)'
                  }}
                  onFocus={e => { if(!fieldErrors.password) e.target.style.borderColor = loginRole === 'citizen' ? '#3b82f6' : '#8b5cf6'; }}
                  onBlur={e => { if(!fieldErrors.password) e.target.style.borderColor = 'var(--border, #e2e8f0)'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 16, top: 18, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
              {fieldErrors.password && <div style={{ fontSize: 13, color: '#ef4444', marginTop: 6, fontWeight: 600 }}>{fieldErrors.password}</div>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: loginRole === 'citizen' ? '#2563eb' : '#7c3aed', borderRadius: 4 }}
              />
              <label htmlFor="rememberMe" style={{ fontSize: 14, color: 'var(--text, #475569)', cursor: 'pointer', fontWeight: 600, userSelect: 'none' }}>
                Remember my username
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                height: 56, borderRadius: 14, border: 'none',
                background: loginRole === 'citizen' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: '#ffffff', fontWeight: 800, fontSize: 17, cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loginRole === 'citizen' ? '0 8px 24px rgba(37,99,235,0.3)' : '0 8px 24px rgba(124,58,237,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                marginTop: 8, transition: 'transform 0.1s, box-shadow 0.2s',
                opacity: loading ? 0.8 : 1
              }}
              onMouseOver={e => { if(!loading) e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseOut={e => { if(!loading) e.currentTarget.style.transform = 'none' }}
              onMouseDown={e => { if(!loading) e.currentTarget.style.transform = 'scale(0.98)' }}
              onMouseUp={e => { if(!loading) e.currentTarget.style.transform = 'translateY(-2px)' }}
            >
              {loading ? (
                <>Authenticating...</>
              ) : (
                <>🔐 Sign In as {loginRole === 'citizen' ? 'Citizen' : 'Department Officer'} <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '12px 0' }}>
            <div style={{ flex: 1, height: 2, background: 'var(--border, #e2e8f0)', borderRadius: 2 }} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary, #94a3b8)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>or</span>
            <div style={{ flex: 1, height: 2, background: 'var(--border, #e2e8f0)', borderRadius: 2 }} />
          </div>

          <button
            type="button"
            onClick={handleKeycloakSSORedirect}
            style={{
              height: 56, borderRadius: 14, background: 'var(--surface, #ffffff)', color: 'var(--text, #334155)',
              border: '2px solid var(--border, #cbd5e1)', fontWeight: 800, fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'all 0.2s'
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = '#94a3b8' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border, #cbd5e1)' }}
          >
            <Globe size={22} className="text-sky-600" /> Use Keycloak Single Sign-On (SSO)
          </button>

          {/* Quick-Fill Test Credentials Panel */}
          <div style={{ background: 'var(--bg, #f8fafc)', border: '2px solid var(--border, #e2e8f0)', borderRadius: 16, overflow: 'hidden', marginTop: 12 }}>
            <button
              type="button"
              onClick={() => setShowTestCreds(!showTestCreds)}
              style={{
                width: '100%', padding: '16px 20px', background: 'none', border: 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer', color: '#334155', fontWeight: 800, fontSize: 14,
                transition: 'background 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseOut={e => e.currentTarget.style.background = 'none'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Sparkles size={18} color="#0ea5e9" />
                <span>Quick-Fill Test Credentials</span>
              </div>
              {showTestCreds ? <ChevronUp size={18} color="#94a3b8" /> : <ChevronDown size={18} color="#94a3b8" />}
            </button>

            {showTestCreds && (
              <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 16, borderTop: '2px solid #e2e8f0', paddingTop: 16 }}>
                <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Click any account below to auto-fill the login form (Password: <strong style={{ color: '#0f172a' }}>Password123</strong>):</p>
                
                <div style={{ background: '#ffffff', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: '#1e40af', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <User size={14} /> Citizens
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['citizen1@gmail.com', 'citizen2@gmail.com', 'citizen3@gmail.com', 'citizen4@gmail.com'].map(u => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => autofillCredentials(u, 'citizen')}
                        style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: 8, fontSize: 13, fontFamily: 'monospace', cursor: 'pointer', fontWeight: 700, color: '#334155', transition: 'all 0.15s' }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#1e40af' }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#334155' }}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: '#6d28d9', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Briefcase size={14} /> Department Officers
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[
                      { user: 'john', dept: 'Health' },
                      { user: 'mark', dept: 'Revenue' },
                      { user: 'ryan', dept: 'Municipal' },
                      { user: 'chris', dept: 'Water' },
                      { user: 'ethan', dept: 'Roads' },
                      { user: 'jack', dept: 'Electricity' },
                      { user: 'david', dept: 'Social Welfare' },
                      { user: 'will', dept: 'Urban' },
                      { user: 'emily', dept: 'Education' },
                    ].map(o => (
                      <button
                        key={o.user}
                        type="button"
                        onClick={() => autofillCredentials(o.user, 'officer')}
                        style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: 8, fontSize: 13, fontFamily: 'monospace', cursor: 'pointer', fontWeight: 700, color: '#334155', transition: 'all 0.15s' }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.color = '#5b21b6' }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#334155' }}
                      >
                        {o.user} <span style={{ color: '#94a3b8', fontSize: 11 }}>({o.dept})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'left', fontSize: 15, marginTop: 8 }}>
            <span style={{ color: '#64748b', fontWeight: 500 }}>Don't have an account? </span>
            <Link to="/register" style={{ color: '#2563eb', fontWeight: 800, textDecoration: 'none', borderBottom: '2px solid transparent', transition: 'border-color 0.2s' }} onMouseOver={e => e.target.style.borderColor = '#2563eb'} onMouseOut={e => e.target.style.borderColor = 'transparent'}>
              Register as Citizen
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}

export default LoginPage;
