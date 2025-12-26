import React from 'react';

export const CtaBand = () => (
  <div style={{
    background: 'linear-gradient(90deg, rgba(37,99,235,0.08), rgba(16,185,129,0.08))',
    borderTop: '1px solid rgba(0,0,0,0.06)',
    borderBottom: '1px solid rgba(0,0,0,0.06)'
  }}>
    <div className="max-w-4xl mx-auto px-6 py-10 text-center">
      <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--primary,#2563eb)' }}>
        Ready to streamline your asset tracking?
      </h2>
      <p className="text-[var(--text-muted,#555)] mb-4">Start free or talk to us about enterprise.</p>
      <div className="flex gap-3 justify-center">
        <a href="/signup" className="px-5 py-2 rounded-lg font-semibold bg-[var(--primary,#2563eb)] text-white shadow hover:bg-blue-700 transition">Start Free</a>
        <a href="/contact" className="px-5 py-2 rounded-lg font-semibold bg-white border border-[var(--primary,#2563eb)] text-[var(--primary,#2563eb)] shadow hover:bg-blue-50 transition">Contact Sales</a>
      </div>
    </div>
  </div>
);

export default CtaBand;
