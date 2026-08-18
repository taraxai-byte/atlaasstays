'use client';

import React, { useState } from 'react';

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-sky-700 to-indigo-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-md">
              <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 6h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <a href="#" className="text-lg font-semibold tracking-tight">AtlaasStays</a>
              <div className="text-xs text-white/80">Global Technologies</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="hover:underline">Features</a>
            <a href="#solutions" className="hover:underline">Solutions</a>
            <a href="#pricing" className="hover:underline">Pricing</a>
            <a href="#contact" className="hover:underline">Contact</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a href="#" className="px-4 py-2 bg-white/20 rounded-md hover:bg-white/30">Sign in</a>
            <a href="#" className="px-4 py-2 bg-white text-slate-900 rounded-md font-medium">Get Started</a>
          </div>

          <div className="md:hidden">
            <button onClick={() => setOpen(!open)} aria-label="Toggle menu" className="p-2 rounded-md bg-white/10">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-gradient-to-r from-sky-700 to-indigo-700/90">
          <div className="px-4 pb-4 space-y-2">
            <a href="#features" className="block py-2">Features</a>
            <a href="#solutions" className="block py-2">Solutions</a>
            <a href="#pricing" className="block py-2">Pricing</a>
            <a href="#contact" className="block py-2">Contact</a>
            <div className="pt-2 flex gap-2">
              <a href="#" className="flex-1 text-center py-2 bg-white/20 rounded-md">Sign in</a>
              <a href="#" className="flex-1 text-center py-2 bg-white text-slate-900 rounded-md">Get Started</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="text-lg font-semibold">AtlaasStays</div>
            <div className="text-sm text-white/80">Global Technologies — Building modern hospitality platforms</div>
          </div>
          <div className="flex gap-8">
            <div>
              <div className="font-medium">Product</div>
              <ul className="mt-2 space-y-1 text-sm text-white/80">
                <li>Search</li>
                <li>Bookings</li>
                <li>Analytics</li>
              </ul>
            </div>
            <div>
              <div className="font-medium">Company</div>
              <ul className="mt-2 space-y-1 text-sm text-white/80">
                <li>About</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 text-sm text-white/60">© " + new Date().getFullYear() + " AtlaasStays Global Technologies. All rights reserved.</div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-black text-white">
      <Header />

      <main className="flex-1">
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white">AtlaasStays</h1>
            <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
              Global Technologies for modern hospitality — powering property search, bookings, and business insights with scalable engineering and intuitive UX.
            </p>

            <div className="mt-8 flex items-center justify-center gap-4">
              <a href="#" className="px-6 py-3 bg-white text-slate-900 rounded-md font-semibold">Get started</a>
              <a href="#features" className="px-6 py-3 border border-white/20 rounded-md text-white/90">Learn more</a>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white/5 p-6 rounded-lg">
                <h3 className="font-semibold text-white">Scalable Search</h3>
                <p className="mt-2 text-sm text-white/80">Fast, accurate property search with multi-criteria filters and global coverage.</p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg">
                <h3 className="font-semibold text-white">Seamless Bookings</h3>
                <p className="mt-2 text-sm text-white/80">Optimized booking flows to maximize conversions and guest satisfaction.</p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg">
                <h3 className="font-semibold text-white">Business Insights</h3>
                <p className="mt-2 text-sm text-white/80">Analytics dashboards to monitor occupancy, revenue, and user behavior.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white">Features</h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-800 rounded-lg">
                <h4 className="font-semibold text-white">Global Inventory</h4>
                <p className="mt-2 text-sm text-white/80">Integrate with global suppliers and local partners.</p>
              </div>
              <div className="p-6 bg-slate-800 rounded-lg">
                <h4 className="font-semibold text-white">Customization</h4>
                <p className="mt-2 text-sm text-white/80">Tailor the experience to your brand and market.</p>
              </div>
              <div className="p-6 bg-slate-800 rounded-lg">
                <h4 className="font-semibold text-white">Security</h4>
                <p className="mt-2 text-sm text-white/80">Enterprise-grade security and compliance for your data.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white">Get in touch</h2>
            <p className="mt-2 text-white/80">Interested in partnering or integrating? Reach out and we'll get back to you.</p>

            <form className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input className="p-3 rounded-md bg-white/5 text-white placeholder:text-white/60" placeholder="Your name" />
              <input className="p-3 rounded-md bg-white/5 text-white placeholder:text-white/60" placeholder="Email address" />
              <textarea className="sm:col-span-2 p-3 rounded-md bg-white/5 text-white placeholder:text-white/60" placeholder="Message" rows={4} />
              <div className="sm:col-span-2">
                <button className="px-6 py-3 bg-indigo-600 rounded-md font-semibold">Send message</button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
