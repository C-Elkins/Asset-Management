import React from 'react';

const logos = ['Contoso', 'Fabrikam', 'Northwind', 'AdventureWorks', 'Tailspin'];

export const LogosRow = () => (
  <div className="w-full" style={{ background: 'transparent' }}>
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="text-center text-xs mb-4" style={{ color: 'var(--text-muted,#6b7280)' }}>
        Trusted by teams of all sizes
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 items-center justify-items-center">
        {logos.map((name) => (
          <div key={name} className="opacity-70 hover:opacity-100 transition" aria-label={name} title={name}>
            <div style={{
              width: 120,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(180deg, #f3f4f6, #e5e7eb)',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: 12,
              border: '1px solid #e5e7eb'
            }}>
              {name}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default LogosRow;
