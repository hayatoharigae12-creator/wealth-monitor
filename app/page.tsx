// app/page.tsx
"use client";
import { useState, useEffect, useMemo } from 'react';

export default function Home() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'day' | 'week' | 'month'>('month');
  const [viewMode, setViewMode] = useState<'amount' | 'count'>('amount');
  const [mounted, setMounted] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/get-bank-data');
      const data = await res.json();
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setMounted(true); fetchData(); }, []);

  const { filteredLogs, dayData, timeData } = useMemo(() => {
    const now = Date.now();
    const limits = { day: 86400000, week: 604800000, month: 2592000000 };
    const filtered = logs.filter(log => now - log.timestamp <= limits[range]);

    const dData = ["日", "月", "火", "水", "木", "金", "土"].map((label, idx) => {
      const items = filtered.filter(l => l.dayIndex === idx);
      return { label, total: items.reduce((s, c) => s + c.rawAmount, 0), count: items.length };
    });

    const tRanges = [
      { label: "0-6h", start: 0, end: 6 }, { label: "6-12h", start: 6, end: 12 },
      { label: "12-18h", start: 12, end: 18 }, { label: "18-24h", start: 18, end: 24 }
    ];
    const tData = tRanges.map(r => {
      const items = filtered.filter(l => l.time >= r.start && l.time < r.end);
      return { label: r.label, total: items.reduce((s, c) => s + c.rawAmount, 0), count: items.length };
    });

    return { filteredLogs: filtered, dayData: dData, timeData: tData };
  }, [logs, range]);

  if (!mounted) return null;

  const totalAmount = filteredLogs.reduce((a, b) => a + b.rawAmount, 0);
  const maxDayVal = Math.max(...dayData.map(d => viewMode === 'amount' ? d.total : d.count)) || 1;
  const maxTimeVal = Math.max(...timeData.map(t => viewMode === 'amount' ? t.total : t.count)) || 1;

  return (
    <div style={{ 
      backgroundColor: '#0a0a0a', color: '#e0e0e0', minHeight: '100vh', 
      padding: '30px', fontFamily: 'Inter, system-ui, sans-serif',
      backgroundImage: 'radial-gradient(circle at top right, #1a1a1a, #0a0a0a)'
    }}>
      {/* 🟢 Header Section */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Wealth<span style={{ color: '#00f2ff' }}>Monitor</span>
          </h1>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            {(['day', 'week', 'month'] as const).map(r => (
              <button key={r} onClick={() => setRange(r)} style={{ 
                background: range === r ? '#333' : '#1a1a1a', color: range === r ? '#00f2ff' : '#888',
                border: `1px solid ${range === r ? '#00f2ff' : '#333'}`, borderRadius: '6px',
                padding: '6px 14px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s'
              }}>
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <button onClick={fetchData} className="btn-refresh" style={{ 
          background: '#fff', color: '#000', border: 'none', borderRadius: '8px',
          padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem'
        }}>
          {loading ? "FETCHING..." : "REFRESH DATA"}
        </button>
      </header>

      {/* 🟢 Insights Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div className="card">
          <span style={{ color: '#888', fontSize: '0.8rem' }}>Total Spending</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#fff' }}>
            ¥{totalAmount.toLocaleString()}
          </div>
        </div>
        <div className="card">
          <span style={{ color: '#888', fontSize: '0.8rem' }}>Transactions</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#fff' }}>
            {filteredLogs.length} <span style={{ fontSize: '1rem', color: '#888' }}>times</span>
          </div>
        </div>
      </div>

      {/* 🟢 Charts Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ fontSize: '1rem', margin: 0 }}>Spending Patterns</h2>
        <div style={{ display: 'flex', background: '#1a1a1a', borderRadius: '8px', padding: '4px' }}>
          <button onClick={() => setViewMode('amount')} style={{ background: viewMode === 'amount' ? '#333' : 'none', color: viewMode === 'amount' ? '#fff' : '#888', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem' }}>AMOUNT</button>
          <button onClick={() => setViewMode('count')} style={{ background: viewMode === 'count' ? '#333' : 'none', color: viewMode === 'count' ? '#fff' : '#888', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem' }}>COUNT</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
        {[dayData, timeData].map((data, i) => (
          <div key={i} className="card" style={{ height: '240px', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '20px 30px' }}>
            {data.map((s: any) => {
              const val = viewMode === 'amount' ? s.total : s.count;
              const max = i === 0 ? maxDayVal : maxTimeVal;
              return (
                <div key={s.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.6rem', color: '#888', marginBottom: '8px' }}>
                    {val > 0 ? (viewMode === 'amount' ? `${(val/1000).toFixed(1)}k` : val) : ''}
                  </span>
                  <div style={{ 
                    backgroundColor: val > 0 ? '#00f2ff' : '#222', width: '100%', 
                    height: `${(val / max) * 140}px`, borderRadius: '4px 4px 0 0',
                    transition: 'height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}></div>
                  <span style={{ fontSize: '0.7rem', marginTop: '10px', color: '#666' }}>{s.label}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 🟢 History Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#1a1a1a' }}>
            <tr>
              <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '0.75rem', color: '#888' }}>TIMESTAMP</th>
              <th style={{ textAlign: 'left', fontSize: '0.75rem', color: '#888' }}>BANK SOURCE</th>
              <th style={{ textAlign: 'right', paddingRight: '20px', fontSize: '0.75rem', color: '#888' }}>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                <td style={{ padding: '15px 20px', fontSize: '0.85rem' }}>
                  {log.date} <span style={{ color: '#555', marginLeft: '5px' }}>{log.fullTime}</span>
                </td>
                <td style={{ fontSize: '0.85rem' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: log.color, marginRight: '8px' }}></span>
                  {log.bankName}
                </td>
                <td style={{ textAlign: 'right', paddingRight: '20px', fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                  ¥{log.rawAmount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .card {
          background: #111;
          border: 1px solid #222;
          border-radius: '16px';
          padding: 20px;
          transition: border 0.3s;
        }
        .card:hover { border-color: #333; }
        .btn-refresh:hover { background: #00f2ff !important; transform: translateY(-1px); }
        .btn-refresh:active { transform: translateY(0); }
      `}</style>
    </div>
  );
}