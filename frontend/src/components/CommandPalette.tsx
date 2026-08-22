import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Files,
  TriangleAlert,
  FileText,
  Activity,
  Settings,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { DEMO_CASES } from '../api/governanceApi';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  category: string;
  icon: any;
  badge?: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Command items list
  const navCommands: CommandItem[] = [
    { id: 'nav-dashboard', label: 'Go to Case Dashboard', category: 'Navigation', icon: LayoutDashboard, action: () => navigate('/dashboard') },
    { id: 'nav-escalations', label: 'Open Human Escalation Queue', category: 'Navigation', icon: TriangleAlert, action: () => navigate('/escalations') },
    { id: 'nav-ops', label: 'Open Ops & Telemetry Console', category: 'Navigation', icon: Activity, action: () => navigate('/ops') },
    { id: 'nav-settings', label: 'Open Governance Settings', category: 'Navigation', icon: Settings, action: () => navigate('/settings') },
  ];

  const caseCommands: CommandItem[] = DEMO_CASES.map(c => ({
    id: `case-${c.case_id}`,
    label: `${c.case_id} — ${c.title} (₹${c.amount.toLocaleString('en-IN')})`,
    category: 'Cases',
    icon: Files,
    badge: c.status,
    action: () => navigate(`/cases/${c.case_id}`)
  }));

  const reportCommands: CommandItem[] = DEMO_CASES.map(c => ({
    id: `report-${c.case_id}`,
    label: `Generate Explainability Report for ${c.case_id}`,
    category: 'Reports',
    icon: FileText,
    action: () => navigate(`/reports/${c.case_id}`)
  }));

  const allItems: CommandItem[] = [...navCommands, ...caseCommands, ...reportCommands];

  const filteredItems = allItems.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md transition-all duration-300 animate-fadeIn">
      
      {/* Backdrop overlay click to dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#111827] border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden z-10">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-slate-900/60">
          <Search className="w-5 h-5 text-emerald-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search ConsensusAI cases, escalation queue, reports..."
            className="w-full bg-transparent text-white text-base placeholder-slate-500 focus:outline-none font-sans"
          />
          <kbd className="px-2 py-0.5 text-xs font-mono bg-slate-800 text-slate-400 rounded border border-slate-700 ml-2">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-sans">
              <Search className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No matching governance cases or routes found.</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
                    isSelected ? 'bg-slate-800 text-white border border-slate-700/60' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className={`p-1.5 rounded-md ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-3">
                    {item.badge && (
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        item.badge === 'AUTHORIZED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        item.badge === 'ESCALATED' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        item.badge === 'BLOCKED' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                        'bg-sky-500/20 text-sky-300 border-sky-500/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-4 h-4 text-emerald-400" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hints */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-t border-slate-800 text-[11px] font-mono text-slate-400">
          <div className="flex items-center space-x-3">
            <span><kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">↑↓</kbd> navigate</span>
            <span><kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">↵</kbd> select</span>
            <span><kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">esc</kbd> close</span>
          </div>
          <div className="flex items-center space-x-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ConsensusAI Command Bar</span>
          </div>
        </div>

      </div>
    </div>
  );
};
