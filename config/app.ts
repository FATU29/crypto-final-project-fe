export const config = {
  app: {
    name: "Crypto Trading Platform",
    description: "Real-time cryptocurrency trading and analysis",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
    timeout: 30000,
  },
  auth: {
    tokenKey: "auth_token",
    refreshTokenKey: "refresh_token",
    userKey: "user_data",
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  },
  routes: {
    public: ["/login", "/register", "/"],
    protected: ["/dashboard", "/charts", "/settings"],
    authRedirect: "/dashboard",
    loginRedirect: "/login",
  },
} as const;

export default config;
