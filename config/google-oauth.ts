export const googleOAuthConfig = {
  web: {
    client_id:
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      "",
    project_id: "csc13106-credit-app",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_secret:
      process.env.GOOGLE_CLIENT_SECRET || "",
    redirect_uris: [
      "http://localhost:3000",
      "http://localhost:3000/google/callback",
      "http://fat.org/google/callback",
    ],
    javascript_origins: ["http://localhost:3000", "http://fat.org"],
  },
} as const;

export const getGoogleAuthUrl = () => {
  const redirectUri =
    typeof window !== "undefined"
      ? `${window.location.origin}/google/callback`
      : googleOAuthConfig.web.redirect_uris[0];

  const params = new URLSearchParams({
    client_id: googleOAuthConfig.web.client_id,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  return `${googleOAuthConfig.web.auth_uri}?${params.toString()}`;
};
