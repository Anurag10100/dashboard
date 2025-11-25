import React, { useState, useMemo } from 'react';
import { Project, Sponsor, DelegateLog, SponsorStage, MarketingData } from '../types';
import { MARKETING_DATA } from '../services/mockData'; // Import mock marketing data
import { generateProjectDeepDive } from '../services/geminiService';
import { 
  ArrowLeft, BrainCircuit, Calendar, CheckCircle, AlertTriangle, Mail, Loader2, 
  Megaphone, MousePointer, Share2, BarChart2, LayoutDashboard, Send
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

interface ProjectDeepDiveProps {
  project: Project;
  sponsors: Sponsor[];
  delegates: DelegateLog[];
  onBack: () => void;
}

interface DeepDiveReport {
  statusAssessment: string;
  actionPlan: string[];
  emailDraft: string;
}

type TabType = 'overview' | 'marketing';

export const ProjectDeepDive: React.FC<ProjectDeepDiveProps> = ({ project, sponsors, delegates, onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [report, setReport] = useState<DeepDiveReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Retrieve Marketing Data for this project
  const marketingData: MarketingData | undefined = useMemo(() => {
    return MARKETING_DATA.find(m => m.project_id === project.project_id);
  }, [project.project_id]);

  // Stats for Overview
  const totalRaised = sponsors.reduce((acc, s) => acc + s.value, 0);
  const totalDelegates = delegates.reduce((acc, d) => acc + d.count, 0);
  const percentRev = (totalRaised / project.revenue_target) * 100;
  
  // Aggregate data for Overview Charts
  const sponsorStages = sponsors.reduce((acc, s) => {
    acc[s.stage] = (acc[s.stage] || 0) + s.value;
    return acc;
  }, {} as Record<string, number>);
  
  const pipelineData = Object.keys(sponsorStages).map(stage => ({
    name: stage,
    value: sponsorStages[stage]
  }));

  // Mock data for Social Growth (Marketing View)
  const socialGrowthData = [
    { day: 'Mon', reach: marketingData ? marketingData.social_impressions * 0.1 : 500, engagement: 20 },
    { day: 'Tue', reach: marketingData ? marketingData.social_impressions * 0.3 : 1200, engagement: 45 },
    { day: 'Wed', reach: marketingData ? marketingData.social_impressions * 0.4 : 1500, engagement: 80 },
    { day: 'Thu', reach: marketingData ? marketingData.social_impressions * 0.6 : 2100, engagement: 110 },
    { day: 'Fri', reach: marketingData ? marketingData.social_impressions * 0.8 : 2800, engagement: 150 },
    { day: 'Sat', reach: marketingData ? marketingData.social_impressions * 0.9 : 3200, engagement: 190 },
    { day: 'Sun', reach: marketingData ? marketingData.social_impressions : 4000, engagement: 250 },
  ];

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      const result = await generateProjectDeepDive(project, sponsors, delegates, marketingData);
      setReport(result);
    } catch (e) {
      console.error(e);
      alert("Failed to generate report. Check API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors mb-4">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{project.project_name}</h1>
                    <div className="flex items-center gap-3 mt-1 text-gray-500 text-sm">
                         <span>ID: {project.project_id}</span>
                         <span>•</span>
                         <span className="flex items-center gap-1"><Calendar size={14} /> {project.date}</span>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-bold border ml-4 ${project.status === 'Critical' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                    {project.status}
                </span>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <LayoutDashboard size={16} /> Overview
                </button>
                <button 
                    onClick={() => setActiveTab('marketing')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'marketing' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Megaphone size={16} /> Marketing & Analytics
                </button>
            </div>
        </div>
      </div>

      {/* --- VIEW: OVERVIEW --- */}
      {activeTab === 'overview' && (
        <>
            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="p-4 bg-white shadow-sm rounded-xl border border-gray-100">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Revenue Actual</div>
                    <div className="text-2xl font-bold text-gray-900">${totalRaised.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">Target: ${project.revenue_target.toLocaleString()}</div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2">
                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{width: `${Math.min(percentRev, 100)}%`}}></div>
                    </div>
                </div>
                <div className="p-4 bg-white shadow-sm rounded-xl border border-gray-100">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Delegates</div>
                    <div className="text-2xl font-bold text-gray-900">{totalDelegates.toLocaleString()}</div>
                    <div className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle size={10} /> Active</div>
                </div>
                <div className="p-4 bg-white shadow-sm rounded-xl border border-gray-100">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Speakers Confirmed</div>
                    <div className="text-2xl font-bold text-gray-900">{project.speaker_actual} <span className="text-sm text-gray-400 font-normal">/ {project.speaker_target}</span></div>
                    <div className="text-xs text-gray-500 mt-1">Gap: {project.speaker_target - project.speaker_actual}</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 flex items-center justify-center">
                    <button 
                        onClick={handleGenerateReport}
                        disabled={isLoading}
                        className="flex flex-col items-center gap-2 text-indigo-600 hover:scale-105 transition-transform disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={32} /> : <BrainCircuit size={32} />}
                        <span className="font-bold text-sm">Generate AI Report</span>
                    </button>
                </div>
            </div>

            {/* Detailed Charts & Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Sponsor Breakdown */}
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Sponsor Pipeline Breakdown</h3>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <div className="h-64 mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={pipelineData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                                    <YAxis tickFormatter={(val) => `$${val/1000}k`} />
                                    <Tooltip formatter={(value) => `$${value}`} />
                                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="overflow-hidden border border-gray-200 rounded-lg">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                                    <tr>
                                        <th className="px-4 py-2">Sponsor</th>
                                        <th className="px-4 py-2">Stage</th>
                                        <th className="px-4 py-2 text-right">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sponsors.map((s, idx) => (
                                        <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="px-4 py-2 font-medium">{s.sponsor_name}</td>
                                            <td className="px-4 py-2"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{s.stage}</span></td>
                                            <td className="px-4 py-2 text-right">${s.value.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right: AI Report Area */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 relative min-h-[500px]">
                    {!report ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-white/50 backdrop-blur-sm rounded-xl">
                            <BrainCircuit size={48} className="mb-2 opacity-20" />
                            <p>Click "Generate AI Report" to analyze this project.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-bold uppercase text-gray-500 mb-2">
                                    <AlertTriangle size={16} /> AI Assessment
                                </h4>
                                <p className="text-gray-800 font-medium leading-relaxed">{report.statusAssessment}</p>
                            </div>
                            
                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-bold uppercase text-gray-500 mb-2">
                                    <CheckCircle size={16} /> Recommended Actions
                                </h4>
                                <ul className="space-y-2">
                                    {report.actionPlan.map((action, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-white p-2 rounded border border-gray-200 shadow-sm">
                                            <span className="text-indigo-500 font-bold">{i+1}.</span> {action}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-bold uppercase text-gray-500 mb-2">
                                    <Mail size={16} /> Draft Stakeholder Update
                                </h4>
                                <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-600 font-mono whitespace-pre-wrap shadow-inner h-64 overflow-y-auto">
                                    {report.emailDraft}
                                </div>
                                <button className="mt-2 text-xs text-indigo-600 font-bold hover:underline">Copy to Clipboard</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
      )}

      {/* --- VIEW: MARKETING & ANALYTICS --- */}
      {activeTab === 'marketing' && marketingData && (
        <div className="animate-in fade-in duration-300">
           {/* Marketing Cards */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Mail size={20} /></div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${marketingData.email_open_rate > 0.2 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {(marketingData.email_open_rate * 100).toFixed(0)}% Open Rate
                        </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{marketingData.emails_sent.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Emails Sent</div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-pink-50 text-pink-600 rounded-lg"><Share2 size={20} /></div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{marketingData.social_impressions.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Social Impressions</div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><MousePointer size={20} /></div>
                        <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                             {((marketingData.ad_clicks / marketingData.ad_spend) * 100).toFixed(1)}% CTR
                        </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{marketingData.ad_clicks.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Ad Clicks</div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><BarChart2 size={20} /></div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">${marketingData.ad_spend.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Total Ad Spend</div>
                </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Left Col: Engagement Chart */}
               <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Social Reach & Engagement (Last 7 Days)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={socialGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" />
                                <YAxis />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="reach" stroke="#ec4899" fillOpacity={1} fill="url(#colorReach)" name="Reach" />
                                <Line type="monotone" dataKey="engagement" stroke="#6366f1" strokeWidth={2} name="Engagement" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
               </div>

               {/* Right Col: Campaigns List */}
               <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Campaigns</h3>
                    <div className="space-y-4">
                        {marketingData.recent_campaigns.map((camp) => (
                            <div key={camp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${camp.type === 'Email' ? 'bg-blue-100 text-blue-600' : camp.type === 'Social' ? 'bg-pink-100 text-pink-600' : 'bg-orange-100 text-orange-600'}`}>
                                        {camp.type === 'Email' ? <Mail size={14} /> : camp.type === 'Social' ? <Share2 size={14} /> : <Megaphone size={14} />}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm text-gray-900">{camp.name}</div>
                                        <div className="text-xs text-gray-500">{camp.date} • {camp.status}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-sm text-indigo-600">{camp.metric}</div>
                                    <div className="text-xs text-gray-400">Impact</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2 bg-indigo-50 text-indigo-600 text-sm font-bold rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
                        <Send size={14} /> Create New Campaign
                    </button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};