import React, { useState } from 'react';

interface SearchBarProps {
    onSearch: (query: string, status: string) => void;
    mode: 'name' | 'address' | 'nearby';
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, mode }) => {
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('ALL');
    const [lat, setLat] = useState('');
    const [lon, setLon] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'nearby') {
            if (!lat || !lon) {
                return;
            }
            onSearch(`${lat},${lon}`, status);
        } else {
            onSearch(query, status);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
                {mode === 'nearby' ? (
                    <>
                        <input
                            type="number"
                            step="any"
                            value={lat}
                            onChange={(e) => setLat(e.target.value)}
                            placeholder="Latitude"
                            style={{ flex: 1, padding: '0.5rem' }}
                        />
                        <input
                            type="number"
                            step="any"
                            value={lon}
                            onChange={(e) => setLon(e.target.value)}
                            placeholder="Longitude"
                            style={{ flex: 1, padding: '0.5rem' }}
                        />
                    </>
                ) : (
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={mode === 'name' ? "Search by applicant name..." : "Search by street address..."}
                        style={{ flex: 1, padding: '0.5rem' }}
                    />
                )}
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ padding: '0.5rem' }}
                >
                    <option value="ALL">All Status</option>
                    <option value="APPROVED">Approved</option>
                    <option value="EXPIRED">Expired</option>
                </select>
                <button type="submit" style={{ padding: '0.5rem 1rem' }}>
                    Search
                </button>
            </div>
        </form>
    );
}; 