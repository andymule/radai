import React from 'react';

interface ErrorBannerProps {
    message: string;
    onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry }) => {
    return (
        <div style={{
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            padding: '1rem',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <span style={{ color: '#c00' }}>{message}</span>
            {onRetry && (
                <button
                    onClick={onRetry}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#c00',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Retry
                </button>
            )}
        </div>
    );
}; 