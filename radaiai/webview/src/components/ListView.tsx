import React from 'react';

interface Permit {
    applicant: string;
    address: string;
    status: string;
    latitude?: number;
    longitude?: number;
}

interface ListViewProps {
    permits: Permit[];
}

export const ListView: React.FC<ListViewProps> = ({ permits }) => {
    if (permits.length === 0) {
        return <p>No permits found</p>;
    }

    return (
        <div style={{ overflowY: 'auto', maxHeight: '500px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Applicant</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Address</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {permits.map((permit, index) => (
                        <tr key={index} style={{ borderTop: '1px solid #eee' }}>
                            <td style={{ padding: '0.5rem' }}>{permit.applicant}</td>
                            <td style={{ padding: '0.5rem' }}>{permit.address}</td>
                            <td style={{ padding: '0.5rem' }}>{permit.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}; 