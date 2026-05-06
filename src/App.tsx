/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrowRight } from 'lucide-react';
import heroImg from './assets/hero.jpg';
import './index.css';

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export default function App() {
  return (
    <div className="min-h-screen bg-black overflow-hidden relative flex flex-col text-white font-sans w-full">

      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <img
          src={heroImg}
          alt=""
          className="absolute w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Navigation */}
      <nav
        className="relative z-20 px-5 sm:px-8 py-4 sm:py-5 w-full flex items-center justify-between lowercase"
        style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
      >
        {/* Wordmark — extreme left */}
        <a
          href="/"
          className="flex-shrink-0 text-white text-lg sm:text-xl font-semibold tracking-tight select-none normal-case"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif", letterSpacing: '-0.02em' }}
        >
          thrift<span className="font-extrabold">Ex</span>
        </a>

        {/* Nav links — desktop only, centred between logo and auth */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 absolute left-1/2 -translate-x-1/2">
          {['Features', 'Pricing', 'About'].map((label) => (
            <a
              key={label}
              href="#"
              className="group relative text-white/80 hover:text-white transition-colors text-sm font-medium py-0.5"
            >
              {label}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Auth buttons — extreme right */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <button className="text-white text-sm font-medium transition-colors hover:text-white/80">
            Sign Up
          </button>
          <button className="liquid-glass rounded-full px-4 sm:px-6 py-1.5 text-sm font-medium text-white transition-all hover:bg-white/5">
            Login
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-20 sm:pb-28 text-center w-full">

        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-6 sm:mb-8 tracking-tight leading-tight"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Built for the curious
        </h1>

        <div className="w-full max-w-sm sm:max-w-md md:max-w-xl flex flex-col items-center gap-4">

          {/* Email input pill */}
          <div className="liquid-glass w-full rounded-full pl-4 sm:pl-6 pr-1.5 py-1.5 flex items-center gap-2 sm:gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-transparent flex-1 min-w-0 outline-none text-white placeholder:text-white/40 text-sm sm:text-base"
            />
            <button className="bg-white hover:bg-white/90 transition-colors rounded-full p-2 sm:p-2.5 text-black flex-shrink-0 flex items-center justify-center">
              <ArrowRight size={18} />
            </button>
          </div>

          <p
            className="text-white/80 text-xs sm:text-sm leading-relaxed px-2 sm:px-4 text-center"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Stay updated with the latest news and insights. Subscribe to our newsletter today and never miss out on exciting updates.
          </p>

          <button className="liquid-glass rounded-full px-7 sm:px-8 py-2.5 sm:py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors mt-1">
            Manifesto
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex justify-center gap-3 sm:gap-4 pb-8 sm:pb-12 w-full">
        <button aria-label="Instagram" className="liquid-glass rounded-full p-3.5 sm:p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all">
          <InstagramIcon />
        </button>
        <button aria-label="X (Twitter)" className="liquid-glass rounded-full p-3.5 sm:p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all">
          <XIcon />
        </button>
        <button aria-label="Website" className="liquid-glass rounded-full p-3.5 sm:p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20A14.5 14.5 0 0 0 12 2"/><path d="M2 12h20"/>
          </svg>
        </button>
      </footer>
    </div>
  );
}
