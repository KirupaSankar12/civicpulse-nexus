import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import keycloak from '../keycloak.js';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginRole, setLoginRole] = useState('citizen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

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
      setError('Please correct the highlighted fields.');
      return;
    }

    setLoading(true);
    setError('');
    setFieldErrors({});

    if (rememberMe) {
      localStorage.setItem('cp_remember_email', email);
    } else {
      localStorage.removeItem('cp_remember_email');
    }

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
    } finally {
      setLoading(false);
    }
  };

  const handleKeycloakSSORedirect = () => {
    keycloak.login({ redirectUri: window.location.origin + '/dashboard' });
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <span className="big-icon">🏛️</span>
          <h2>CivicPulse Nexus</h2>
          <p>
            The Cloud-Native Smart Governance & Citizen Services Management Platform.
            Access your services, file complaints, and monitor SLA response in real time.
          </p>

          <div className="auth-trust-badges">
            <div className="trust-badge">🔒 256-bit SSL</div>
            <div className="trust-badge">🛡️ Keycloak Secure</div>
            <div className="trust-badge">🇮🇳 Govt. Certified</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <div className="logo-row">
              <div className="logo-icon">🏛️</div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--primary)' }}>CivicPulse Nexus</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Smart Governance Platform</div>
              </div>
            </div>
            <h2>Sign In</h2>
            <p>Welcome back! Choose your portal and enter your credentials.</p>
          </div>

          <div className="auth-role-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={loginRole === 'citizen'}
              className={`auth-role-tab${loginRole === 'citizen' ? ' active' : ''}`}
              onClick={() => setLoginRole('citizen')}
            >
              <span className="role-icon">👤</span>
              <div className="role-name">Citizen Portal</div>
              <div className="role-desc">File complaints & apply for services</div>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={loginRole === 'officer'}
              className={`auth-role-tab${loginRole === 'officer' ? ' active' : ''}`}
              onClick={() => setLoginRole('officer')}
            >
              <span className="role-icon">🧑‍💼</span>
              <div className="role-name">Officer Portal</div>
              <div className="role-desc">Verify & approve applications</div>
            </button>
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              <span>⚠️</span>
              <div>{error}</div>
            </div>
          )}

          <div className="auth-card">
            <form onSubmit={handleCustomLogin} noValidate>
              <div className="form-group">
                <label htmlFor="login-email">Username or Email Address *</label>
                <input
                  id="login-email"
                  type="text"
                  className={`form-control${fieldErrors.email ? ' is-invalid' : ''}`}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors({ ...fieldErrors, email: null }); }}
                  placeholder={loginRole === 'citizen' ? 'e.g. citizen1@gmail.com' : 'e.g. sibi or admin_user'}
                  autoComplete="username"
                  aria-invalid={!!fieldErrors.email}
                />
                {fieldErrors.email && <div className="form-error">{fieldErrors.email}</div>}
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label htmlFor="login-password" style={{ marginBottom: 0 }}>Password *</label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Please contact your administrator to reset credentials or use the Keycloak Admin Console.');
                    }}
                    style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '600' }}
                  >
                    Forgot Password?
                  </a>
                </div>
                <input
                  id="login-password"
                  type="password"
                  className={`form-control${fieldErrors.password ? ' is-invalid' : ''}`}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors({ ...fieldErrors, password: null }); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={!!fieldErrors.password}
                />
                {fieldErrors.password && <div className="form-error">{fieldErrors.password}</div>}
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '16px', fontSize: '13.5px' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                Remember my username
              </label>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading}
              >
                {loading ? <><span className="spinner-sm" /> Verifying...</> : `🔐 Sign In as ${loginRole === 'citizen' ? 'Citizen' : 'Officer'}`}
              </button>
            </form>

            <div className="auth-divider" style={{ margin: '24px 0' }}>
              or sign in with
            </div>

            <button
              type="button"
              className="btn btn-outline btn-full"
              onClick={handleKeycloakSSORedirect}
            >
              🌐 Single Sign-On (SSO Redirect)
            </button>

            <details style={{ marginTop: '24px' }}>
              <summary style={{ cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: 'var(--primary)', padding: '8px 0' }}>
                📋 View Test Credentials
              </summary>
              <div style={{ marginTop: '12px', padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', maxHeight: '280px', overflowY: 'auto' }}>
                <p style={{ marginBottom: '12px', color: '#475569' }}>All test accounts use password <strong>Password123</strong>.</p>
                
                <div style={{ fontWeight: '600', color: '#334155', marginBottom: '6px' }}>👤 Citizens</div>
                <ul style={{ fontFamily: 'monospace', fontSize: '11px', marginBottom: '12px', paddingLeft: '20px', margin: '0 0 12px 0' }}>
                  <li>citizen1@gmail.com</li>
                  <li>citizen2@gmail.com</li>
                  <li>citizen3@gmail.com</li>
                </ul>

                <div style={{ fontWeight: '600', color: '#334155', marginBottom: '6px' }}>🧑‍💼 Officers</div>
                <ul style={{ fontFamily: 'monospace', fontSize: '11px', marginBottom: '12px', paddingLeft: '20px', margin: '0 0 12px 0' }}>
                  <li>john (Health)</li>
                  <li>mark (Revenue)</li>
                  <li>ryan (Municipal Corporation)</li>
                  <li>chris (Water)</li>
                  <li>ethan (Roads)</li>
                  <li>jack (Electricity)</li>
                  <li>david (Sanitation)</li>
                </ul>

                <div style={{ fontWeight: '600', color: '#334155', marginBottom: '6px' }}>⚙️ Admin</div>
                <ul style={{ fontFamily: 'monospace', fontSize: '11px', paddingLeft: '20px', margin: '0' }}>
                  <li>admin_user</li>
                </ul>
              </div>
            </details>
          </div>

          <div className="auth-footer" style={{ marginTop: '20px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: '700', color: 'var(--accent)' }}>Register as Citizen</Link>
          </div>

          <div className="auth-footer">
            <Link to="/">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
