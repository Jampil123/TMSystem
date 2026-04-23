// layouts/portal/Header.jsx
// Theme Palette: #0F2A1D | #375534 | #6B9071 | #AEC3B0 | #E3EED4
import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { url } = usePage();

  const navigationLinks = [
    { name: 'Home', path: '/badian-portal' },
    { name: 'About', path: '/badian-portal?panel=about' },
    { name: 'Activities', path: '/badian-portal/activities' },
    { name: 'Attractions', path: '/badian-portal/attractions' },
  ];

  const isActive = (path) => url === path || (path.includes('?') && url.startsWith(path.split('?')[0]) && url.includes(path.split('?')[1]));

  return (
    <header
      style={{ backgroundColor: '#0F2A1D' }}
      className="sticky top-0 z-50 shadow-lg"
    >
      {/* Top accent bar */}
      <div style={{ backgroundColor: '#6B9071', height: '3px' }} />

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">

          {/* Left — Branding */}
          <Link href="/badian-portal" className="flex items-center gap-3 group">
            <div
              style={{ backgroundColor: '#375534', border: '2px solid #6B9071' }}
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#AEC3B0" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </div>
            <div>
              <p
                style={{ color: '#E3EED4' }}
                className="text-xl font-bold leading-tight tracking-wide group-hover:opacity-90 transition-opacity"
              >
                Suroy-Badian
              </p>
              <p style={{ color: '#AEC3B0' }} className="text-xs font-medium tracking-wider uppercase">
                Tourism Portal
              </p>
            </div>
          </Link>

          {/* Center — Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                style={isActive(link.path)
                  ? { backgroundColor: '#375534', color: '#E3EED4', borderColor: '#6B9071' }
                  : { color: '#AEC3B0', borderColor: 'transparent' }
                }
                className="px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 hover:opacity-90"
                onMouseEnter={(e) => {
                  if (!isActive(link.path)) {
                    e.currentTarget.style.backgroundColor = '#375534';
                    e.currentTarget.style.color = '#E3EED4';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(link.path)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#AEC3B0';
                  }
                }}
              >
                {link.name}
                {isActive(link.path) && (
                  <span
                    style={{ backgroundColor: '#6B9071' }}
                    className="ml-2 inline-block w-1.5 h-1.5 rounded-full align-middle"
                  />
                )}
              </Link>
            ))}
          </nav>

          

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ color: '#AEC3B0' }}
            className="md:hidden p-2 rounded-lg hover:opacity-80 transition-opacity"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <nav
            style={{ borderTopColor: '#375534' }}
            className="md:hidden mt-3 pt-3 border-t"
          >
            <ul className="flex flex-col gap-1">
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={isActive(link.path)
                      ? { backgroundColor: '#375534', color: '#E3EED4' }
                      : { color: '#AEC3B0' }
                    }
                    className="block px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/badian-portal/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ backgroundColor: '#6B9071', color: '#0F2A1D' }}
                  className="block px-4 py-3 rounded-lg text-sm font-semibold mt-2 text-center transition-opacity hover:opacity-90"
                >
                  Plan Your Visit
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;