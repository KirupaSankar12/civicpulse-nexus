import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import keycloak from './keycloak.js';
import './index.css';

let initPromise = null;

function Root() {
  const [kcReady, setKcReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('kc_token');
    const refreshToken = localStorage.getItem('kc_refreshToken');
    const idToken = localStorage.getItem('kc_idToken');

    const initOptions = {
      onLoad: 'check-sso',
      checkLoginIframe: false,
    };

    if (token) {
      initOptions.token = token;
      initOptions.refreshToken = refreshToken;
      initOptions.idToken = idToken;
    }

    if (!initPromise) {
      initPromise = keycloak.init(initOptions);
    }

    initPromise
      .then((auth) => {
        if (auth) {
          localStorage.setItem('kc_token', keycloak.token);
          localStorage.setItem('kc_refreshToken', keycloak.refreshToken);
          if (keycloak.idToken) {
            localStorage.setItem('kc_idToken', keycloak.idToken);
          }
        } else {
          localStorage.removeItem('kc_token');
          localStorage.removeItem('kc_refreshToken');
          localStorage.removeItem('kc_idToken');
        }
        setAuthenticated(auth);
        setKcReady(true);
      })
      .catch((err) => {
        console.error('Keycloak init failed', err);
        // Clear corrupt tokens
        localStorage.removeItem('kc_token');
        localStorage.removeItem('kc_refreshToken');
        localStorage.removeItem('kc_idToken');
        setKcReady(true);
      });
  }, []);

  if (!kcReady) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Loading CivicPulse Nexus...</p>
      </div>
    );
  }

  return <App authenticated={authenticated} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

export { keycloak };
