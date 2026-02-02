// 1. Configure your backend URL automatically
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isIP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(window.location.hostname);
// If local, use localhost. If IP (Alibaba), use IP. If domain (Cloudflare), use the known backend IP.
export const API_BASE_URL = isLocal ? "http://localhost:8080" :
    (isIP ? `http://${window.location.hostname}:8080` : "http://118.31.238.137:8080");
export const API_ZERO_URL = isLocal ? "http://localhost:8081" :
    (isIP ? `http://${window.location.hostname}:8081` : "http://118.31.238.137:8081");

// 2. Centralized Endpoint Definitions
export const ENDPOINTS = {
    AUTH: {
        GITHUB_CALLBACK: `${API_BASE_URL}/api/v1/auth/github/callback`,
        TWITTER_CALLBACK: `${API_BASE_URL}/api/v1/auth/twitter/callback`,
    },
    ASSETS: {
        UPLOAD_ALIPAY: `${API_BASE_URL}/api/assets/upload/alipay`,
    },
    PROOF: {
        RECEIPT_DATA: `${API_BASE_URL}/api/v1/receipt-data`,
    }
};
