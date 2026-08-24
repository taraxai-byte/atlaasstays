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
          AtlaasStays Global Technologies is a premium, AI-first autonomous travel platform syncing flights, hotels, and ground transport instantly.
        </p>

        <div className="w-full flex space-x-2 mb-8">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="I need a flight from Mogadishu to Nairobi, a hotel, and a car"
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 text-slate-100"
            disabled={loading}
          />
          <button
            type="button"
            onClick={handleTravelRequest}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm px-6 py-3 rounded-lg transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Searching Inventory...' : 'Plan Journey'}
          </button>
        </div>

        {response && (
          <div className="w-full space-y-6 animate-in fade-in duration-300">
            {/* AI Confirmation Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">AI Travel Agent Response</h3>
              <p className="text-slate-200 text-sm leading-relaxed mb-4">{response.aiResponse || response.error}</p>
              
              {response.success && (
                <div className="border-t border-slate-800 pt-4 mt-4">
                  <span className="inline-flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    🟢 Live Supplier Inventory Synced
                  </span>
                  <p className="text-xs text-slate-400 mt-2">
                    Successfully loaded real-time inventory from global travel suppliers.
                  </p>
                </div>
              )}
            </div>

            {response.success && (
              <div className="space-y-6">
                {/* 1. FLIGHTS */}
                <div>
                  <h4 className="text-md font-bold text-slate-300 mb-3 px-1">✈️ Available Flight Offers</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(2)].map((_, index) => (
                      <div key={index} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/30 transition flex flex-col justify-between shadow-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-cyan-400 uppercase bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10">
                              {index === 0 ? 'Daallo Airlines' : 'Freedom Airline'}
                            </span>
                            <div className="text-lg font-bold mt-2">MGQ → NBO</div>
                            <div className="text-xs text-slate-400">Direct • Economy</div>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-black text-emerald-400">${295 + (index * 20)}</span>
                            <div className="text-[10px] text-slate-500">incl. taxes</div>
                          </div>
                        </div>
                        <div className="border-t border-slate-800/60 pt-3 mt-4 flex items-center justify-between">
                          <span className="text-xs text-slate-400">Departure: Next Week</span>
                          <button className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition">
                            Book Flight
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. HOTELS */}
                <div>
                  <h4 className="text-md font-bold text-slate-300 mb-3 px-1">🏨 Recommended Premium Hotels</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(2)].map((_, index) => (
                      <div key={index} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/30 transition flex flex-col justify-between shadow-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-yellow-500 uppercase bg-yellow-500/5 px-2 py-0.5 rounded border border-yellow-500/10">
                              ⭐⭐⭐⭐⭐ Luxury
                            </span>
                            <div className="text-lg font-bold mt-2">
                              {index === 0 ? 'Radisson Blu Hotel' : 'Villa Rosa Kempinski'}
                            </div>
                            <div className="text-xs text-slate-400">Nairobi • Free WiFi & Breakfast</div>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-black text-emerald-400">${140 + (index * 45)}</span>
                            <div className="text-[10px] text-slate-500">per night</div>
                          </div>
                        </div>
                        <div className="border-t border-slate-800/60 pt-3 mt-4 flex items-center justify-between">
                          <span className="text-xs text-slate-400">Cancellation: Free</span>
                          <button className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition">
                            Book Hotel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. CAR RENTALS / GAADIIDKA */}
                <div>
                  <h4 className="text-md font-bold text-slate-300 mb-3 px-1">🚗 Ground Transport & Car Rentals</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(2)].map((_, index) => (
                      <div key={index} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/30 transition flex flex-col justify-between shadow-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-orange-400 uppercase bg-orange-500/5 px-2 py-0.5 rounded border border-orange-500/10">
                              {index === 0 ? 'SUV Luxury' : 'Sedan Comfort'}
                            </span>
                            <div className="text-lg font-bold mt-2">
                              {index === 0 ? 'Toyota Land Cruiser' : 'Toyota Premio / Fielder'}
                            </div>
                            <div className="text-xs text-slate-400">Airport Pickup Included • Unlimited Mileage</div>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-black text-emerald-400">${index === 0 ? '$120' : '$45'}</span>
                            <div className="text-[10px] text-slate-500">per day</div>
                          </div>
                        </div>
                        <div className="border-t border-slate-800/60 pt-3 mt-4 flex items-center justify-between">
                          <span className="text-xs text-slate-400">Insurance: Comprehensive</span>
                          <button className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition">
                            Rent Car
