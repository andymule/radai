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

type SearchMode = 'name' | 'address' | 'nearby';

export const App: React.FC = () => {
    const [permits, setPermits] = useState<Permit[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<SearchMode>('name');

    const handleSearch = (query: string, status: string) => {
        setLoading(true);
        setError(null);
        
        // Determine which endpoint to use based on the mode and query
        let endpoint = '/permits';
        const params: Record<string, string> = {};
        
        switch (mode) {
            case 'nearby':
                if (!query) return;
                endpoint = '/permits/nearby';
                const [lat, lon] = query.split(',');
                params.lat = lat;
                params.lon = lon;
                params.radius = '1.0';
                break;
            case 'address':
                endpoint = '/permits/address';
                params.address = query;
                break;
            default: // name
                if (query) {
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
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button
                    onClick={() => setMode('name')}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: mode === 'name' ? '#007acc' : '#eee',
                        color: mode === 'name' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Search by Name
                </button>
                <button
                    onClick={() => setMode('address')}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: mode === 'address' ? '#007acc' : '#eee',
                        color: mode === 'address' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Search by Address
                </button>
                <button
                    onClick={() => setMode('nearby')}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: mode === 'nearby' ? '#007acc' : '#eee',
                        color: mode === 'nearby' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Find Nearby
                </button>
            </div>
            <SearchBar onSearch={handleSearch} mode={mode} />
            {error && <ErrorBanner message={error} onRetry={() => handleSearch('', 'ALL')} />}
            {loading ? <LoadingSpinner /> : <ListView permits={permits} />}
        </div>
    );
}; 