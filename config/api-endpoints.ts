export const API_ENDPOINTS = {
  auth: {
    login: "/api/v1/auth/login",
    register: "/api/v1/auth/register",
    logout: "/api/v1/auth/logout",
    refresh: "/api/v1/auth/refresh-token",
    me: "/api/v1/auth/me",
    changePassword: "/api/v1/auth/change-password",
  },
  users: {
    list: "/users",
    get: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
  },
  crypto: {
    prices: "/crypto/prices",
    charts: "/crypto/charts",
    news: "/crypto/news",
  },
  news: {
    getAll: "/news",
    getById: (id: string) => `/news/${id}`,
    getSummaries: "/news/summaries",
    getByPair: (pair: string) => `/news/pair/${pair}`,
    getAdvanced: "/news/advanced",
    analyzeSentiment: (id: string) => `/ai/sentiment/${id}`,
    getAnalyzedNews: "/ai/analyzed-news",
  },
  crawler: {
    start: "/crawler/start",
    stop: "/crawler/stop",
    status: "/crawler/status",
  },
} as const;
