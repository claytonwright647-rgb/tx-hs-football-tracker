'use client';

import { useState, useEffect, useRef } from 'react';
import { POWERHOUSE_TEAMS, CLASSIFICATIONS } from '@/lib/constants';

interface SearchResult {
  type: 'team' | 'classification';
  name: string;
  subtitle?: string;
  classification?: string;
  href: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search logic
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const matches: SearchResult[] = [];

    // Search teams
    POWERHOUSE_TEAMS.forEach(team => {
      if (team.name.toLowerCase().includes(q) || team.city.toLowerCase().includes(q)) {
        matches.push({
          type: 'team',
          name: team.name,
          subtitle: `${team.city} • ${team.classification} • ${team.titles} titles`,
          classification: team.classification,
          href: `/team/${team.name.toLowerCase().replace(/\s+/g, '-')}`,
        });
      }
    });

    // Search classifications
    CLASSIFICATIONS.forEach(c => {
      if (c.name.toLowerCase().includes(q) || c.fullName.toLowerCase().includes(q)) {
        matches.push({
          type: 'classification',
          name: c.fullName,
          subtitle: c.footballType === '6-man' ? 'Six-Man Football' : '11-Man Football',
          href: `/standings?class=${c.id}`,
        });
      }
    });

    setResults(matches.slice(0, 8));
  }, [query]);


  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search teams, schools..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          className="w-full md:w-64 px-4 py-2 pl-10 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {results.map((result, idx) => (
            <a
              key={idx}
              href={result.href}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
            >
              <span className="text-xl">
                {result.type === 'team' ? '🏈' : '📊'}
              </span>
              <div>
                <p className="text-white font-medium">{result.name}</p>
                {result.subtitle && (
                  <p className="text-gray-500 text-sm">{result.subtitle}</p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg p-4 text-center text-gray-400">
          No results found for "{query}"
        </div>
      )}
    </div>
  );
}
