// 1. Backend URL 配置（必须显式设置，避免误连到废弃地址）
const requiredEnv = (key) => {
    const value = import.meta.env[key];
    if (!value) {
        throw new Error(`前端配置缺失：请设置 ${key}（例如在 web/.env.local 中）`);
    }
    return value;
};

export const API_BASE_URL = requiredEnv('VITE_API_BASE_URL');
export const API_ZERO_URL = requiredEnv('VITE_API_ZERO_URL');

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
