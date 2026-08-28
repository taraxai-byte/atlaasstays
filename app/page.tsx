'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome to AtlaasStays. I am your global autonomous travel agent. Tell me where in the world you want to go, or ask me any custom travel routing questions!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [structuredData, setStructuredData] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/travel-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: userMessage,
          sessionContext: messages
        })
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
      
      if (data.mode === 'direct' || data.flights || data.hotels) {
        setStructuredData(data);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: 'AtlaasStays core engine is adjusting routing to shield against supplier instability. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#090d16', color: '#ffffff', minHeight: '100vh', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      <header style={{ borderBottom: '1px solid #1e293b', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#38bdf8', letterSpacing: '2px' }}>ATLAASSTAYS</h1>
        <div style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: '#0ea5e9', fontSize: '0.85rem', fontWeight: 'bold' }}>GLOBAL AI CORE v1.0</div>
      </header>

      <main style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '30px', height: 'calc(100vh - 80px)' }}>
        <section style={{ background: '#111827', borderRadius: '12px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '15px 20px', borderBottom: '1px solid #1e293b', backgroundColor: '#1f2937' }}>
            <h2 style={{ fontSize: '1.1rem', color: '#9ca3af' }}>Atlas Autonomous Agent Chat</h2>
          </div>
          
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', padding: '12px 16px', borderRadius: '12px', backgroundColor: msg.role === 'user' ? '#0ea5e9' : '#1f2937', color: '#ffffff', lineHeight: '1.5' }}>
                <p style={{ fontSize: '0.75rem', color: msg.role === 'user' ? '#e0f2fe' : '#38bdf8', fontWeight: 'bold', marginBottom: '4px' }}>
                  {msg.role === 'user' ? 'You' : 'Atlas Engine'}
                </p>
                <p>{msg.content}</p>
              </div>
            ))}
            {loading && <div style={{ color: '#38bdf8', fontSize: '0.9rem', padding: '10px' }}>Atlas is analyzing global provider data network...</div>}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} style={{ padding: '20px', borderTop: '1px solid #1e293b', display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type trip request (e.g., Worldwide routing, budgets, or custom plans)..."
              style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#0b0f19', color: '#ffffff', fontSize: '1rem' }}
            />
            <button type="submit" style={{ padding: '14px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#38bdf8', color: '#090d16', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
              Send
            </button>
          </form>
        </section>

        <section style={{ background: '#111827', borderRadius: '12px', border: '1px solid #1e293b', padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
          <h2 style={{ fontSize: '1.3rem', color: '#38bdf8', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>Live Travel Sync Dashboard</h2>
          
          {structuredData ? (
            <>
              <div style={{ backgroundColor: '#1f2937', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 'bold' }}>CURRENT TARGET TARGET RESOLUTION</h3>
                <p style={{ fontSize: '1.4rem', fontWeight: 'bold', marginTop: '5px' }}>{structuredData.destination || 'Global Managed Route'}</p>
              </div>
              <div style={{ background: '#1e293b', padding: '15px', borderRadius: '8px' }}>
                <h4 style={{ color: '#38bdf8', marginBottom: '8px', fontSize: '1rem' }}>🛫 Flight Matrix Sync</h4>
                <p style={{ fontSize: '0.95rem', color: '#d1d5db' }}>{structuredData.flights || 'No flight actions triggered.'}</p>
              </div>
              <div style={{ background: '#1e293b', padding: '15px', borderRadius: '8px' }}>
                <h4 style={{ color: '#a855f7', marginBottom: '8px', fontSize: '1rem' }}>🏨 Global Hotel Ledger</h4>
                <p style={{ fontSize: '0.95rem', color: '#d1d5db' }}>{structuredData.hotels || 'No active hotel rooms allocated.'}</p>
              </div>
              <div style={{ background: '#1e293b', padding: '15px', borderRadius: '8px' }}>
                <h4 style={{ color: '#f59e0b', marginBottom: '8px', fontSize: '1rem' }}>🚗 Compact Ground Mobility</h4>
                <p style={{ fontSize: '0.95rem', color: '#d1d5db' }}>{structuredData.carRentals || 'No car rental entities attached.'}</p>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#4b5563', textAlign: 'center', flexDirection: 'column', padding: '40px' }}>
              <span style={{ fontSize: '3rem', marginBottom: '15px' }}>🌐</span>
              <p style={{ fontSize: '1.1rem' }}>System standing by. Enter a travel route or converse with Atlas to sync real-time global transport data objects.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
