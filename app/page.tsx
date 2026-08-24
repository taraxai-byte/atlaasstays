'use 'use client';


import React, { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleTravelRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPrompt: prompt }),
      });
      
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error('Error processing travel request:', error);
      setResponse({ error: 'Failed to process journey request.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-black tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            ATLAASSTAYS
          </span>
          <span className="text-xs uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Autonomous AI
          </span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto px-6 py-12 w-full">
        <h1 className="text-3xl font-extrabold tracking-tight text-center mb-2">
          Tell Atlas where you are and where you want to go.
        </h1>
        <p className="text-sm text-slate-400 text-center mb-8 max-w-xl">
          AtlaasStays Global Technologies is a premium, AI-first autonomous travel platform. Experience seamless, end-to-end journey orchestration through a single intelligent conversation.
        </p>

        <form onSubmit={handleTravelRequest} className="w-full flex space-x-2 mb-8">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="I need a flight from Addis Ababa to Dubai"
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 text-slate-100"
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm px-6 py-3 rounded-lg transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Planning...' : 'Plan Journey'}
          </button>
        </form>

        {response && (
          <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl animate-in fade-in duration-300">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">AI Travel Agent Response</h3>
            <p className="text-slate-200 text-sm leading-relaxed mb-4">{response.aiResponse || response.error}</p>
            {response.success && response.syncDetails && (
              <div className="border-t border-slate-800 pt-4 mt-4">
                <span className="inline-flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Live Supplier Inventory Synced
                </span>
                <p className="text-xs text-slate-400 mt-2">
                  Found <span className="text-slate-200 font-bold">{response.syncDetails.offersCount || 0}</span> real-time flight offers from suppliers and populated your database successfully.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-4 text-center text-xs text-slate-500">
        © 2026 AtlaasStays Global Technologies. All rights reserved.
      </footer>
    </main>
  );
}
