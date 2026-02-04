// 1. Backend URL 配置（优先环境变量；否则按当前访问的主机名推断，不再使用废弃 IP）
const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const envApiZeroUrl = import.meta.env.VITE_API_ZERO_URL;

const isLocalEnvUrl = (value) =>
    typeof value === 'string' && (value.includes('localhost') || value.includes('127.0.0.1'));

const defaultApiBaseUrl = isLocalHost
    ? "http://localhost:8080"
    : `http://${window.location.hostname}:8080`;
const defaultApiZeroUrl = isLocalHost
    ? "http://localhost:8081"
    : `http://${window.location.hostname}:8081`;

// 便捷逻辑：如果构建时 env 写死了 localhost，但运行时不是本机访问，则自动回退到推断地址
export const API_BASE_URL = envApiBaseUrl && (isLocalHost || !isLocalEnvUrl(envApiBaseUrl))
    ? envApiBaseUrl
    : defaultApiBaseUrl;
export const API_ZERO_URL = envApiZeroUrl && (isLocalHost || !isLocalEnvUrl(envApiZeroUrl))
    ? envApiZeroUrl
    : defaultApiZeroUrl;

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
