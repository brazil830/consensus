import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  TriangleAlert,
  ShieldX,
  LockKeyhole,
  Activity,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { GhostTypography } from '../components/GhostTypography';
import { AgentOrbit } from '../components/AgentOrbit';
import { governanceApi, DEMO_CASES, DEMO_AGENTS } from '../api/governanceApi';
import { CaseItem, DecisionState } from '../types/governance';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseItem[]>(DEMO_CASES);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterState, setFilterState] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'risk' | 'confidence' | 'amount'>('newest');

  // Active Case Carousel State
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await governanceApi.getCases();
      setCases(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const carouselScenarios = [
    {
      label: 'SCENARIO 1: VALID MEMORY',
      caseId: 'CASE-10482',
      title: 'High Value Corporate Transfer',
      amount: 842500,
      status: 'AUTHORIZED',
      consensus: 0.91,
      ghostText: 'CONSENSUS',
      description: 'Temporal decay graph verified. High consensus with valid memory precedent #1842.'
    },
    {
      label: 'SCENARIO 2: STALE MEMORY',
      caseId: 'CASE-10483',
      title: 'International Wire - Out-of-Regime',
      amount: 9960000,
      status: 'ESCALATED',
      consensus: 0.54,
      ghostText: 'REVIEW',
      description: 'Precedent regulatory regime mismatch (EU-PSD3 vs RBI-2026). Escalated for human review.'
    },
    {
      label: 'SCENARIO 3: POISONED MEMORY',
      caseId: 'CASE-10484',
      title: 'Rapid Multi-Account Transfer Siphon',
      amount: 1500000,
      status: 'BLOCKED',
      consensus: 0.96,
      ghostText: 'CONTROL',
      description: 'Tampered precedent payload detected & quarantined by Memory Trust Gate. Deterministic block enforced.'
    },
    {
      label: 'SCENARIO 4: DECISION REVISION',
      caseId: 'CASE-10485',
      title: 'Merchant Settlement Reversal',
      amount: 450000,
      status: 'REVISED',
      consensus: 0.89,
      ghostText: 'RECONSIDER',
      description: 'Counterfactual SCM analyzer invalidated supplier assumption. Original capsule frozen, replacement issued.'
    }
  ];

  const currentScenario = carouselScenarios[activeIndex];

  const handleNextCarousel = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev + 1) % carouselScenarios.length);
    setTimeout(() => setIsAnimating(false), 650);
  };

  const handlePrevCarousel = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev - 1 + carouselScenarios.length) % carouselScenarios.length);
    setTimeout(() => setIsAnimating(false), 650);
  };

  // Filter & Sort Logic
  const filteredCases = cases.filter(c => {
    const matchesFilter =
      filterState === 'ALL' ||
      (filterState === 'IN_PROGRESS' && c.status === 'IN_PROGRESS') ||
      (filterState === 'ESCALATED' && c.status === 'ESCALATED') ||
      (filterState === 'AUTHORIZED' && c.status === 'AUTHORIZED') ||
      (filterState === 'BLOCKED' && c.status === 'BLOCKED') ||
      (filterState === 'REVISED' && c.status === 'REVISED');

    const matchesSearch =
      c.case_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.status.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const sortedCases = [...filteredCases].sort((a, b) => {
    if (sortBy === 'risk') return (b.anomaly_score || 0) - (a.anomaly_score || 0);
    if (sortBy === 'confidence') return (b.consensus_confidence || 0) - (a.consensus_confidence || 0);
    if (sortBy === 'amount') return b.amount - a.amount;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="relative min-h-screen pb-16">
      
      {/* Giant Ghost Typography dynamic with active scenario */}
      <GhostTypography text={currentScenario.ghostText} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
          <div>
            <h1 className="font-anton text-3xl sm:text-4xl tracking-wide uppercase text-white flex items-center space-x-3">
              <span>GOVERNANCE COMMAND CENTER</span>
            </h1>
            <p className="text-sm text-slate-400 font-sans mt-0.5">
              Live overview of autonomous decisions, memory trust scoring & human escalation queue.
            </p>
          </div>

          <div className="flex items-center space-x-3 font-mono text-xs">
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
              Regulatory Regime: <strong className="text-emerald-400">RBI-FRAUD-2026</strong>
            </span>
          </div>
        </div>

        {/* Top Telemetry KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="mission-card rounded-xl p-4 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Active Cases</span>
            <div className="text-3xl font-anton text-white mt-1">24</div>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-time Telemetry</span>
            </span>
          </div>

          <div className="mission-card rounded-xl p-4 border border-amber-500/30 bg-amber-950/10">
            <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider block">Escalated</span>
            <div className="text-3xl font-anton text-amber-300 mt-1">07</div>
            <span className="text-[11px] font-mono text-amber-400 flex items-center space-x-1 mt-1">
              <TriangleAlert className="w-3 h-3" />
              <span>Pending Human Review</span>
            </span>
          </div>

          <div className="mission-card rounded-xl p-4 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Resolved</span>
            <div className="text-3xl font-anton text-emerald-400 mt-1">183</div>
            <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1 mt-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Capsules Sealed</span>
            </span>
          </div>

          <div className="mission-card rounded-xl p-4 border border-emerald-500/30 bg-emerald-950/10">
            <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider block">Memory Integrity</span>
            <div className="text-3xl font-anton text-emerald-300 mt-1">100%</div>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1 mt-1">
              <LockKeyhole className="w-3 h-3" />
              <span>SHA-256 Ledger Intact</span>
            </span>
          </div>

        </div>

        {/* ACTIVE CASE HERO VISUAL CAROUSEL */}
        <div className="mission-card rounded-2xl p-6 border-2 border-slate-700/80 relative overflow-hidden transition-all duration-650">
          
          <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span className="font-anton text-lg uppercase text-white tracking-wider">
                ACTIVE CASE DEMO SCENARIOS CAROUSEL
              </span>
            </div>

            {/* Carousel Nav Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevCarousel}
                disabled={isAnimating}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-50 transition-colors"
                title="Previous Scenario"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-mono text-slate-400">
                {activeIndex + 1} / {carouselScenarios.length}
              </span>
              <button
                onClick={handleNextCarousel}
                disabled={isAnimating}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-50 transition-colors"
                title="Next Scenario"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Carousel Slide Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Case Meta */}
            <div className="lg:col-span-5 space-y-4">
              <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-block">
                {currentScenario.label}
              </span>

              <h2 className="font-anton text-3xl sm:text-4xl text-white uppercase tracking-tight">
                {currentScenario.title}
              </h2>

              <div className="text-3xl font-anton text-emerald-400">
                ₹{currentScenario.amount.toLocaleString('en-IN')}
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {currentScenario.description}
              </p>

              <div className="pt-2">
                <button
                  onClick={() => navigate(`/cases/${currentScenario.caseId}`)}
                  className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider transition-all flex items-center space-x-2 shadow-lg shadow-emerald-500/20 group"
                >
                  <span>INSPECT DECISION DETAIL ({currentScenario.caseId})</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Agent Orbit Live Preview */}
            <div className="lg:col-span-7 flex justify-center">
              <AgentOrbit
                agents={DEMO_AGENTS}
                activeCaseId={currentScenario.caseId}
                activeCaseAmount={currentScenario.amount}
                activeCaseStatus={currentScenario.status}
                consensusConfidence={currentScenario.consensus}
                onSelectAgent={() => navigate(`/cases/${currentScenario.caseId}`)}
              />
            </div>

          </div>

        </div>

        {/* Case Queue Filters & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
          
          {/* Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono">
            {['ALL', 'IN_PROGRESS', 'ESCALATED', 'AUTHORIZED', 'BLOCKED', 'REVISED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterState(st)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  filterState === st
                    ? 'bg-slate-800 text-white shadow border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Search & Sorting Controls */}
          <div className="flex items-center space-x-3">
            
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search case ID, type, status..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 font-sans"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono focus:outline-none"
            >
              <option value="newest">Sort: Newest</option>
              <option value="risk">Sort: Highest Risk</option>
              <option value="confidence">Sort: Confidence</option>
              <option value="amount">Sort: Amount</option>
            </select>

          </div>

        </div>

        {/* Main Case Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {sortedCases.map((c) => (
            <div
              key={c.case_id}
              onClick={() => navigate(`/cases/${c.case_id}`)}
              className="mission-card rounded-xl p-5 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all duration-300 space-y-4 group"
            >
              
              {/* Header Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-emerald-400 text-sm">{c.case_id}</span>
                  <span className="text-xs text-slate-400 font-mono">({c.domain})</span>
                </div>

                <span className={`px-2.5 py-0.5 text-xs font-bold font-mono rounded-full border ${
                  c.status === 'AUTHORIZED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                  c.status === 'ESCALATED' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                  c.status === 'BLOCKED' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                  c.status === 'REVISED' ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' :
                  'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {c.status}
                </span>
              </div>

              {/* Title & Amount */}
              <div>
                <h3 className="font-anton text-xl text-white uppercase tracking-wide group-hover:text-emerald-400 transition-colors">
                  {c.title}
                </h3>
                <div className="text-2xl font-anton text-slate-200 mt-1">
                  ₹{c.amount.toLocaleString('en-IN')}
                </div>
              </div>

              {/* 4 Telemetry Metrics */}
              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                <div>
                  <span className="block text-slate-500 uppercase">MEMORY</span>
                  <span className="text-slate-200 font-semibold">{c.primary_memory_mode || 'WEIGHTED'}</span>
                </div>

                <div>
                  <span className="block text-slate-500 uppercase">CONSENSUS</span>
                  <span className="text-emerald-400 font-bold">{Math.round((c.consensus_confidence || 0.91) * 100)}%</span>
                </div>

                <div>
                  <span className="block text-slate-500 uppercase">POLICY</span>
                  <span className="text-slate-200 font-semibold">{c.policy_verdict || 'PASS'}</span>
                </div>

                <div>
                  <span className="block text-slate-500 uppercase">RISK SCORE</span>
                  <span className={c.anomaly_score > 0.6 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {Math.round(c.anomaly_score * 100)}%
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
