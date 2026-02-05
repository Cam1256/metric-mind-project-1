import React from "react";

const LinkedInConsentMock = ({ onApprove }) => {
  return (
    <div style={{ border: "1px solid #ddd", padding: 20, borderRadius: 8 }}>
      <h3>Authorize MetricMind</h3>
      <p>
        MetricMind is requesting permission to access your LinkedIn account.
      </p>

      <ul>
        <li>✔ Read company page information</li>
        <li>✔ Publish posts on your behalf</li>
        <li>✔ Read reactions and comments</li>
        <li>✔ Access page analytics</li>
      </ul>

      <button
        onClick={onApprove}
        style={{ padding: "10px 16px", background: "#0a66c2", color: "#fff" }}
      >
        Approve
      </button>
    </div>
  );
};

export default LinkedInConsentMock;
