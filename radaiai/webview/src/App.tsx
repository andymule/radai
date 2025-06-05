import React, { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { ListView } from './components/ListView';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBanner } from './components/ErrorBanner';

interface Permit {
    applicant: string;
    address: string;
    status: string;
    latitude?: number;
    longitude?: number;
}

declare global {
    interface Window {
        acquireVsCodeApi: () => {
            postMessage: (message: any) => void;
        };
    }
}

const vscode = window.acquireVsCodeApi();

export const App: React.FC = () => {
    const [permits, setPermits] = useState<Permit[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = (query: string, status: string) => {
        setLoading(true);
        setError(null);
        
        // Determine which endpoint to use based on the query
        let endpoint = '/permits';
        const params: Record<string, string> = {};
        
        if (query) {
            // If query contains coordinates, use nearby endpoint
            const coords = query.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
            if (coords) {
                endpoint = '/permits/nearby';
                params.lat = coords[1];
                params.lon = coords[2];
                params.radius = '1.0';
            } else if (query.match(/[A-Za-z]/)) {
                // If query contains letters, try address search first
                endpoint = '/permits/address';
                params.address = query;
            } else {
                // Otherwise use applicant search
                params.applicant = query;
            }
        }
        
        if (status !== 'ALL') {
            params.status = status;
        }

        vscode.postMessage({
            endpoint,
            params
        });
    };

    // Listen for messages from the extension
    React.useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            switch (message.type) {
                case 'response':
                    setPermits(message.data);
                    setLoading(false);
                    break;
                case 'error':
                    setError(message.error);
                    setLoading(false);
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    return (
        <div style={{ padding: '1rem' }}>
            <h1 style={{ marginBottom: '1rem' }}>Food Permits Search</h1>
            <SearchBar onSearch={handleSearch} />
            {error && <ErrorBanner message={error} onRetry={() => handleSearch('', 'ALL')} />}
            {loading ? <LoadingSpinner /> : <ListView permits={permits} />}
        </div>
    );
}; 