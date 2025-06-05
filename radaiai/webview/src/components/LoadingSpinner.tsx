import React from 'react';

export const LoadingSpinner: React.FC = () => {
    return (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{
                display: 'inline-block',
                width: '2rem',
                height: '2rem',
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }} />
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
}; 