import React from 'react';
import zhifubaoPng from '../../../image/zhifubao.png';

export const AlipayIcon = ({ size = 24, className = "" }) => (
    <img
        src={zhifubaoPng}
        alt="Alipay"
        width={size}
        height={size}
        className={className}
        style={{ width: size, height: size, objectFit: 'contain' }}
        draggable={false}
    />
);

export const UberIcon = ({ size = 24, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="none" />
        {/* Stylized U */}
        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-4-10v5c0 2.21 1.79 4 4 4s4-1.79 4-4v-5h-2.5v5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5v-5H8z" fill="currentColor" />
    </svg>
);

export const EthereumIcon = ({ size = 24, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" fill="currentColor" />
    </svg>
);
