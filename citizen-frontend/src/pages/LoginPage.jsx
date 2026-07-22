import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import keycloak from '../keycloak.js';
import { ShieldAlert, User, Briefcase, CheckCircle2 } from 'lucide-react';

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

      <div className="auth-right py-5">
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

          <div className="d-flex gap-3 mb-4">
            <button
              type="button"
              className={`flex-fill text-start p-3 rounded-4 border ${loginRole === 'citizen' ? 'border-primary bg-primary bg-opacity-10 shadow-sm' : 'border-light bg-light text-muted'}`}
              style={{ transition: 'all 0.2s' }}
              onClick={() => setLoginRole('citizen')}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className={`p-2 rounded-circle ${loginRole === 'citizen' ? 'bg-primary text-white' : 'bg-secondary bg-opacity-25'}`}>
                  <User size={20} />
                </div>
                {loginRole === 'citizen' && <span className="badge bg-primary rounded-pill"><CheckCircle2 size={12} className="me-1" /> Active</span>}
              </div>
              <div className={`fw-bold ${loginRole === 'citizen' ? 'text-primary' : ''}`}>Citizen Portal</div>
              <div className="small opacity-75 mt-1" style={{ fontSize: '12px' }}>File complaints & apply</div>
            </button>
            <button
              type="button"
              className={`flex-fill text-start p-3 rounded-4 border ${loginRole === 'officer' ? 'border-primary bg-primary bg-opacity-10 shadow-sm' : 'border-light bg-light text-muted'}`}
              style={{ transition: 'all 0.2s' }}
              onClick={() => setLoginRole('officer')}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className={`p-2 rounded-circle ${loginRole === 'officer' ? 'bg-primary text-white' : 'bg-secondary bg-opacity-25'}`}>
                  <Briefcase size={20} />
                </div>
                {loginRole === 'officer' && <span className="badge bg-primary rounded-pill"><CheckCircle2 size={12} className="me-1" /> Active</span>}
              </div>
              <div className={`fw-bold ${loginRole === 'officer' ? 'text-primary' : ''}`}>Officer Portal</div>
              <div className="small opacity-75 mt-1" style={{ fontSize: '12px' }}>Verify & approve apps</div>
            </button>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center shadow-sm rounded-3 py-3 mb-4" role="alert">
              <ShieldAlert className="me-3 flex-shrink-0" size={24} />
              <div>
                <strong className="d-block mb-1">Access Denied</strong>
                {error}
              </div>
            </div>
          )}

          <div className="auth-card">
            <form onSubmit={handleCustomLogin} noValidate>
              <div className="form-group mb-3">
                <label htmlFor="login-email" className="fw-semibold">Username or Email Address *</label>
                <input
                  id="login-email"
                  type="text"
                  className={`form-control p-3 ${fieldErrors.email ? 'is-invalid' : ''}`}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors({ ...fieldErrors, email: null }); }}
                  placeholder={loginRole === 'citizen' ? 'e.g. citizen1@gmail.com' : 'e.g. sibi or admin_user'}
                  autoComplete="username"
                  aria-invalid={!!fieldErrors.email}
                />
                {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
              </div>

              <div className="form-group mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label htmlFor="login-password" className="fw-semibold mb-0">Password *</label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Please contact your administrator to reset credentials or use the Keycloak Admin Console.');
                    }}
                    className="text-decoration-none small fw-bold"
                  >
                    Forgot Password?
                  </a>
                </div>
                <input
                  id="login-password"
                  type="password"
                  className={`form-control p-3 ${fieldErrors.password ? 'is-invalid' : ''}`}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors({ ...fieldErrors, password: null }); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={!!fieldErrors.password}
                />
                {fieldErrors.password && <div className="invalid-feedback">{fieldErrors.password}</div>}
              </div>

              <div className="form-check mb-4 mt-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="form-check-label text-muted" htmlFor="rememberMe">
                  Remember my username
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Authenticating...
                  </>
                ) : (
                  <>🔐 Sign In as {loginRole === 'citizen' ? 'Citizen' : 'Officer'}</>
                )}
              </button>
            </form>

            <div className="text-center text-muted small fw-semibold my-4 position-relative">
              <span className="bg-white px-2 position-relative" style={{ zIndex: 1 }}>or sign in with</span>
              <hr className="position-absolute top-50 start-0 w-100 my-0" style={{ transform: 'translateY(-50%)', opacity: 0.15 }} />
            </div>

            <button
              type="button"
              className="btn btn-light w-100 py-2 border fw-semibold rounded-3 mb-4 text-muted"
              onClick={handleKeycloakSSORedirect}
            >
              🌐 Single Sign-On (SSO)
            </button>

            <details className="mt-4 border rounded-3 p-3 bg-light text-start">
              <summary className="fw-bold text-primary" style={{ cursor: 'pointer', fontSize: '14px' }}>
                📋 View Test Credentials
              </summary>
              <div className="mt-3 pt-3 border-top" style={{ fontSize: '13px' }}>
                <p className="mb-3 text-muted">All test accounts use password <strong>Password123</strong>.</p>
                
                <h6 className="fw-bold text-dark mb-2">👤 Citizens</h6>
                <ul className="list-unstyled font-monospace text-muted mb-3 ps-2 border-start border-2 border-primary">
                  <li>citizen1@gmail.com</li>
                  <li>citizen2@gmail.com</li>
                  <li>citizen3@gmail.com</li>
                </ul>

                <h6 className="fw-bold text-dark mb-2">🧑‍💼 Officers</h6>
                <ul className="list-unstyled font-monospace text-muted mb-3 ps-2 border-start border-2 border-primary">
                  <li>john (Health Dept)</li>
                  <li>mark (Revenue Dept)</li>
                  <li>ryan (Municipal Corp)</li>
                  <li>chris (Water Dept)</li>
                  <li>ethan (Roads Dept)</li>
                  <li>jack (Electricity Dept)</li>
                  <li>david (Sanitation Dept)</li>
                  <li>will (Urban Planning Dept)</li>
                </ul>

                <h6 className="fw-bold text-dark mb-2">⚙️ Admin</h6>
                <ul className="list-unstyled font-monospace text-muted mb-0 ps-2 border-start border-2 border-primary">
                  <li>admin_user</li>
                </ul>
              </div>
            </details>
          </div>

          <div className="text-center mt-4">
            <span className="text-muted">Don't have an account? </span>
            <Link to="/register" className="fw-bold text-decoration-none">Register as Citizen</Link>
          </div>

          <div className="text-center mt-3">
            <Link to="/" className="text-muted text-decoration-none small">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
