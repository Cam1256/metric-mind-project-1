// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from 'react-oidc-context';

// Configuración de Cognito OIDC
const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_CfO0HbqSO", // URL de tu User Pool
  client_id: "ve397u9sm47ps24a9mbo55qi7", // ID de tu App Client
  redirect_uri: "https://www.metricmind.cloud/auth/callback", // URL de retorno
  response_type: "code",
  scope: "openid email phone",

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
