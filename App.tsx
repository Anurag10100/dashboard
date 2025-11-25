import React, { useState, useMemo, useEffect } from 'react';
import { Project, DelegateLog, Sponsor, DashboardFilters, AiInsight, SponsorStage, MarketingData, ExpenseCategory } from './types';
import { MASTER_PROJECTS, DELEGATES_DATA, SPONSORS_PIPELINE, MARKETING_DATA, EXPENSE_CATEGORIES } from './services/mockData';
import { generateDashboardInsight } from './services/geminiService';
import { ZoneFilters } from './components/ZoneFilters';
import { ZoneScorecards } from './components/ZoneScorecards';
import { ZoneCharts } from './components/ZoneCharts';
import { ZoneGrid } from './components/ZoneGrid';
import { ZoneMarketing } from './components/ZoneMarketing';
import { ZoneBudget } from './components/ZoneBudget';
import { AlertsPanel } from './components/AlertsPanel';
import { ProjectDeepDive } from './components/ProjectDeepDive';
import { ExportMenu } from './components/ExportMenu';
import { BrainCircuit, Loader2, Wifi } from 'lucide-react';

const App: React.FC = () => {
  // --- 1. State Management ---
  const [projects, setProjects] = useState<Project[]>(MASTER_PROJECTS);
  const [sponsors, setSponsors] = useState<Sponsor[]>(SPONSORS_PIPELINE);
  const [delegates, setDelegates] = useState<DelegateLog[]>(DELEGATES_DATA);
  const [marketingData] = useState<MarketingData[]>(MARKETING_DATA);
  const [expenses] = useState<ExpenseCategory[]>(EXPENSE_CATEGORIES);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const [filters, setFilters] = useState<DashboardFilters>({
    projectName: 'All',
    dateStart: '2024-01-01',
    dateEnd: '2025-12-31',
    status: 'All',
  });

  const [insight, setInsight] = useState<AiInsight | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // --- 2. Live Data Simulation Effect ---
  useEffect(() => {
    if (!isLiveMode) return;

    const interval = setInterval(() => {
      // Simulate a new delegate registering
      const randomProject = projects[Math.floor(Math.random() * projects.length)];
      const categories: ('Government' | 'Industry' | 'Student')[] = ['Government', 'Industry', 'Student'];
      
      const newLog: DelegateLog = {
        project_id: randomProject.project_id,
        date_logged: new Date().toISOString().split('T')[0], // Today
        category: categories[Math.floor(Math.random() * categories.length)],
        count: Math.floor(Math.random() * 5) + 1, // 1 to 5 people
      };

      setDelegates(prev => [...prev, newLog]);
    }, 3000); // Add new data every 3 seconds

    return () => clearInterval(interval);
  }, [isLiveMode, projects]);

  // --- 3. Filtering Logic ---
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchName = filters.projectName === 'All' || p.project_name === filters.projectName;
      const matchStatus = filters.status === 'All' || p.status === filters.status;
      const matchDate = p.date >= filters.dateStart && p.date <= filters.dateEnd;
      return matchName && matchStatus && matchDate;
    });
  }, [filters, projects]);

  const activeProjectIds = useMemo(() => new Set(filteredProjects.map(p => p.project_id)), [filteredProjects]);

  const filteredDelegates = useMemo(() => {
    return delegates.filter(d => activeProjectIds.has(d.project_id));
  }, [activeProjectIds, delegates]);

  const filteredSponsors = useMemo(() => {
    return sponsors.filter(s => activeProjectIds.has(s.project_id));
  }, [activeProjectIds, sponsors]);

  const filteredMarketingData = useMemo(() => {
    return marketingData.filter(m => activeProjectIds.has(m.project_id));
  }, [activeProjectIds, marketingData]);

  // --- 4. Calculated Fields for Scorecards ---
  
  // Weighted Pipeline Logic (Source C)
  const calculateWeightedValue = (s: Sponsor) => {
    switch (s.stage) {
      case SponsorStage.SIGNED: return s.value * 1.0;
      case SponsorStage.CONTRACT_SENT: return s.value * 0.8;
      case SponsorStage.PROPOSAL: return s.value * 0.4;
      default: return 0;
    }
  };

  const totalProjectedRevenue = useMemo(() => {
    return filteredSponsors.reduce((sum, s) => sum + calculateWeightedValue(s), 0);
  }, [filteredSponsors]);

  const totalDelegatesCount = useMemo(() => {
    return filteredDelegates.reduce((sum, d) => sum + d.count, 0);
  }, [filteredDelegates]);

  const { speakerTargetTotal, speakerActualTotal } = useMemo(() => {
    return filteredProjects.reduce((acc, p) => ({
      speakerTargetTotal: acc.speakerTargetTotal + p.speaker_target,
      speakerActualTotal: acc.speakerActualTotal + p.speaker_actual
    }), { speakerTargetTotal: 0, speakerActualTotal: 0 });
  }, [filteredProjects]);

  const speakerFillRate = speakerTargetTotal > 0 ? speakerActualTotal / speakerTargetTotal : 0;

  // --- 5. Data Update Handlers ---
  
  // Update Project Status
  const handleUpdateStatus = (projectId: string, newStatus: Project['status']) => {
    setProjects(prevProjects => 
      prevProjects.map(p => 
        p.project_id === projectId ? { ...p, status: newStatus } : p
      )
    );
  };

  // Update Speaker Counts (Increment/Decrement)
  const handleUpdateSpeakers = (projectId: string, change: number) => {
    setProjects(prevProjects => 
      prevProjects.map(p => 
        p.project_id === projectId ? { ...p, speaker_actual: Math.max(0, p.speaker_actual + change) } : p
      )
    );
  };

  // Add Delegate (Quick Add +5)
  const handleAddDelegate = (projectId: string) => {
    const newLog: DelegateLog = {
      project_id: projectId,
      date_logged: new Date().toISOString().split('T')[0],
      category: 'Industry', // Default for manual add
      count: 5
    };
    setDelegates(prev => [...prev, newLog]);
  };

  // Add Sponsor (Quick Add Lead $10k)
  const handleAddSponsor = (projectId: string) => {
    const newSponsor: Sponsor = {
      project_id: projectId,
      sponsor_name: 'New Partner',
      stage: SponsorStage.LEAD,
      value: 10000
    };
    setSponsors(prev => [...prev, newSponsor]);
  };

  // --- 6. AI Logic ---
  const handleGenerateInsight = async () => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const result = await generateDashboardInsight(filteredProjects, filteredSponsors, filteredDelegates);
      setInsight(result);
    } catch (err: any) {
      setAiError("Could not generate insight. Check API Key or try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- 7. Deep Dive Selection Logic ---
  const selectedProjectData = useMemo(() => {
    if (!selectedProjectId) return null;
    const project = projects.find(p => p.project_id === selectedProjectId);
    if (!project) return null;
    return {
      project,
      projectSponsors: sponsors.filter(s => s.project_id === selectedProjectId),
      projectDelegates: delegates.filter(d => d.project_id === selectedProjectId)
    };
  }, [selectedProjectId, projects, sponsors, delegates]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Header / Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
            E
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Event Horizon Analytics</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Live Mode Toggle (Only show on Dashboard) */}
          {!selectedProjectId && (
            <button
                onClick={() => setIsLiveMode(!isLiveMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${isLiveMode ? 'bg-red-100 text-red-600 ring-1 ring-red-200' : 'bg-gray-100 text-gray-500'}`}
            >
                <Wifi size={14} className={isLiveMode ? 'animate-pulse' : ''} />
                {isLiveMode ? 'LIVE DATA STREAM' : 'OFFLINE'}
            </button>
          )}

          {/* Export Menu (Only show on Dashboard) */}
          {!selectedProjectId && (
            <ExportMenu
              projects={filteredProjects}
              sponsors={filteredSponsors}
              delegates={filteredDelegates}
              marketingData={filteredMarketingData}
              aiInsight={insight}
            />
          )}

          {!selectedProjectId && (
             <button
                onClick={handleGenerateInsight}
                disabled={isAiLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isAiLoading ? <Loader2 className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
                <span>{isAiLoading ? 'Analyzing...' : 'Ask AI Analyst'}</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-[1920px] mx-auto px-6 py-6">
        
        {/* VIEW 1: PROJECT DEEP DIVE */}
        {selectedProjectId && selectedProjectData ? (
             <ProjectDeepDive 
                project={selectedProjectData.project}
                sponsors={selectedProjectData.projectSponsors}
                delegates={selectedProjectData.projectDelegates}
                onBack={() => setSelectedProjectId(null)}
             />
        ) : (
        /* VIEW 2: MAIN DASHBOARD */
        <>
            {/* AI Insight Overlay/Banner */}
            {insight && (
            <div className="mb-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 animate-fade-in relative">
                <button onClick={() => setInsight(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">×</button>
                <h3 className="text-indigo-900 font-bold flex items-center gap-2 mb-3">
                <BrainCircuit size={20} /> AI Executive Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <h4 className="text-xs uppercase font-bold text-gray-500 mb-1">Status Summary</h4>
                    <p className="text-gray-800 text-sm leading-relaxed">{insight.summary}</p>
                </div>
                <div>
                    <h4 className="text-xs uppercase font-bold text-red-500 mb-1">Key Risk</h4>
                    <p className="text-gray-800 text-sm leading-relaxed">{insight.risk}</p>
                </div>
                <div>
                    <h4 className="text-xs uppercase font-bold text-emerald-600 mb-1">Strategic Rec</h4>
                    <p className="text-gray-800 text-sm leading-relaxed">{insight.recommendation}</p>
                </div>
                </div>
            </div>
            )}
            
            {aiError && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                {aiError}
            </div>
            )}

            {/* Zone 1: Global Filters */}
            <ZoneFilters filters={filters} setFilters={setFilters} projects={projects} />

            {/* Zone 1.5: Active Alerts */}
            <AlertsPanel
            projects={filteredProjects}
            sponsors={filteredSponsors}
            delegates={filteredDelegates}
            marketingData={filteredMarketingData}
            />

            {/* Zone 2: Scorecards */}
            <ZoneScorecards 
            totalRevenue={totalProjectedRevenue} 
            totalDelegates={totalDelegatesCount}
            speakerFillRate={speakerFillRate}
            />

            {/* Zone 3: The Big 3 Visuals */}
            <ZoneCharts
            sponsors={filteredSponsors}
            delegates={filteredDelegates}
            speakerActual={speakerActualTotal}
            speakerTarget={speakerTargetTotal}
            />

            {/* Zone 3.5: Marketing Performance */}
            <ZoneMarketing
            marketingData={filteredMarketingData}
            projects={filteredProjects}
            />

            {/* Zone 3.6: Budget & P/L */}
            <ZoneBudget
            projects={filteredProjects}
            expenses={expenses}
            />

            {/* Zone 4: Master Grid */}
            <ZoneGrid 
            projects={filteredProjects} 
            delegates={filteredDelegates} 
            sponsors={filteredSponsors}
            onUpdateStatus={handleUpdateStatus}
            onUpdateSpeakers={handleUpdateSpeakers}
            onAddDelegate={handleAddDelegate}
            onAddSponsor={handleAddSponsor}
            onSelectProject={setSelectedProjectId}
            />
        </>
        )}

      </main>
    </div>
  );
};

export default App;