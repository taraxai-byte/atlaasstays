'use client';

import React, { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleTravelRequest = async () => {
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

      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-6 py-12 w-full">
        <h1 className="text-3xl font-extrabold tracking-tight text-center mb-2">
          Tell Atlas where you are and where you want to go.
        </h1>
        <p className="text-sm text-slate-400 text-center mb-8 max-w-xl">
          AtlaasStays Global Technologies is a premium, AI-first autonomous travel platform syncing flights, hotels, and cars.
        </p>

        <div className="w-full flex space-x-2 mb-8">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="I need a flight from Mogadishu to Nairobi, a hotel, and a car"
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-500"
          />
          <button
            type="button"
            onClick={handleTravelRequest}
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm px-6 py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Searching Inventory...' : 'Plan Journey'}
          </button>
        </div>

        {response && (
          <div className="w-full space-y-6 bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="font-bold text-cyan-400">AI Concierge Response:</h3>
            <pre className="text-xs bg-slate-950 p-4 rounded-lg overflow-x-auto text-slate-300">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <footer className="w-full border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        &copy; 2026 AtlaasStays Global Technologies. All rights reserved.
      </footer>
    </main>
  );
}
