import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from 'react-oidc-context';

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_CfO0HbqSO",
  client_id: "ve397u9sm47ps24a9mbo55qi7",
  redirect_uri: "https://www.metricmind.cloud/auth/callback",
  post_logout_redirect_uri: "https://www.metricmind.cloud/",
  response_type: "code",
  scope: "openid email",
  automaticSilentRenew: true,
  loadUserInfo: true,

  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
