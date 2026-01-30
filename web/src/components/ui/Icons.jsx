import React from 'react';

export const AlipayIcon = ({ size = 24, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 1024 1024"
        fill="currentColor"
        className={className}
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M860.8 412.8H556.8V179.2c0-83.2-67.2-150.4-150.4-150.4H192c-17.6 0-32 14.4-32 32v672c0 17.6 14.4 32 32 32h169.6c28.8 0 54.4 12.8 70.4 35.2l86.4 121.6c12.8 17.6 32 28.8 54.4 28.8h288c17.6 0 32-14.4 32-32V444.8c0-17.6-14.4-32-32-32z m-416-288c17.6 0 32 14.4 32 32v256H224V92.8h220.8z m384 576H576l-64-89.6c-41.6-57.6-105.6-89.6-176-92.8V476.8h524.8v224z" fill="currentColor" />
        <path d="M226.5 401.5h568.6v75H226.5z" />
        <path d="M511.9 220.6h70.3v277h-70.3z" />
        <path d="M285.4 579.8c34.8 74.3 90.5 133.5 158.4 172.9l-42.3 62.4c-78.1-45.9-142.6-114-182.2-198.7l66.1-36.6z" />
        <path d="M685 640.4c-32.9 83.3-95 149.2-171 184.6l-37.8-63.7c60.3-26.4 109.8-78.1 137.4-143.6l71.4 22.7z" />
    </svg>
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
