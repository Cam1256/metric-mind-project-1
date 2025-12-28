const APP_ID = "737217222339759";
const REDIRECT_URI = "https://www.metricmind.cloud/auth/facebook/callback";


export default function FacebookConnectButton() {
  const loginUrl =
    `https://www.facebook.com/v18.0/dialog/oauth?client_id=${APP_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=public_profile,email,pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_insights`;

  return (
    <a
      href={loginUrl}
      style={{
        padding: "12px 18px",
        backgroundColor: "#1877f2",
        color: "#fff",
        borderRadius: "6px",
        textDecoration: "none",
        display: "inline-block",
      }}
    >
      Connect Facebook
    </a>
  );
}
