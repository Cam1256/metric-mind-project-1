const LinkedInConnectButton = () => {
  const handleConnect = () => {
    window.location.href =
      "https://api.metricmind.cloud/auth/linkedin/login";
  };

  return (
    <button
      onClick={handleConnect}
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
    >
      🔗 Connect LinkedIn
    </button>
  );
};

export default LinkedInConnectButton;