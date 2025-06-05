import React, { useState } from 'react';

interface SearchBarProps {
    onSearch: (query: string, status: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('ALL');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query, status);
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by applicant or street..."
                    style={{ flex: 1, padding: '0.5rem' }}
                />
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