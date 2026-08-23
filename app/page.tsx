'use client';

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
      // Wuxuu u dirayaa codsiga AI Concierge si uu u falanqeeyo
      const res = await fetch('/api/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPrompt: prompt }),
      });
      const data = await res.json();
      setResponse(data.data);
    } catch (error) {
      console.error('Error processing travel request:', error);
      setResponse({ error: 'Failed to process journey request.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      {/* Header / Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-black tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            ATLAASSTAYS
          </span>
          <span className="text-xs uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Autonomous AI
          </span>
        </div>
        <div className="text-xs text-slate-400 hidden sm:block">
          ONE WORLD. ONE AI. ONE JOURNEY.
        </div>
      </header>

      {/* Hero Section & AI Concierge Input */}
      <section className="flex-1 max-w-4xl mx-auto w-full px-6 py-16 flex flex-col items-center text-center justify-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
          Tell Atlas where you are and <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            where you want to go.
          </span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mb-10">
          AtlaasStays Global Technologies is a premium, AI-first autonomous travel platform. Experience seamless, end-to-end journey orchestration through a single intelligent conversation.
        </p>

        {/* AI Natural Language Prompt Form */}
        <form onSubmit={handleTravelRequest} className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-2xl flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., I am in Addis Ababa and I want to go to New York for 7 days..."
            className="flex-1 bg-transparent px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none text-sm sm:text-base"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 text-sm sm:text-base shadow-lg shadow-cyan-500/20"
          >
            {loading ? 'Orchestrating...' : 'Plan Journey'}
          </button>
        </form>

        {/* Dynamic AI Response / Journey State Output */}
        {response && (
          <div className="w-full max-w-2xl mt-8 p-6 bg-slate-900/80 border border-cyan-500/30 rounded-2xl text-left shadow-xl animate-fade-in">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-3">
              Journey Orchestrator State
            </h3>
            <pre className="text-xs text-slate-300 overflow-x-auto bg-slate-950 p-4 rounded-xl border border-slate-800">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </section>

      {/* Core Features Overview */}
      <section className="border-t border-slate-800 bg-slate-900/20 py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <h3 className="text-lg font-bold text-cyan-400 mb-2">One-Shot Requests</h3>
            <p className="text-sm text-slate-400">
              Communicate in natural language. The AI extracts your intent, dates, preferences, and budget instantly.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <h3 className="text-lg font-bold text-cyan-400 mb-2">Complete Journey</h3>
            <p className="text-sm text-slate-400">
              Seamlessly assembles flights, airport transfers, hotels, experiences, and local itineraries into one coherent trip.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <h3 className="text-lg font-bold text-cyan-400 mb-2">Autonomous Operations</h3>
            <p className="text-sm text-slate-400">
              Routine travel execution handled entirely by AI agents without human intervention.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} AtlaasStays Global Technologies. All rights reserved.</p>
      </footer>
    </main>
  );
}
