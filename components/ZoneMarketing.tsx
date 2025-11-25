import React, { useMemo } from 'react';
import { MarketingData, Project } from '../types';
import { Mail, TrendingUp, MousePointerClick, DollarSign, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ZoneMarketingProps {
  marketingData: MarketingData[];
  projects: Project[];
}

export const ZoneMarketing: React.FC<ZoneMarketingProps> = ({ marketingData, projects }) => {
  // Aggregate metrics across all filtered projects
  const aggregatedMetrics = useMemo(() => {
    const totals = marketingData.reduce((acc, data) => ({
      emailsSent: acc.emailsSent + data.emails_sent,
      avgOpenRate: acc.avgOpenRate + data.email_open_rate,
      socialImpressions: acc.socialImpressions + data.social_impressions,
      adSpend: acc.adSpend + data.ad_spend,
      adClicks: acc.adClicks + data.ad_clicks,
      websiteVisits: acc.websiteVisits + data.website_visits,
    }), {
      emailsSent: 0,
      avgOpenRate: 0,
      socialImpressions: 0,
      adSpend: 0,
      adClicks: 0,
      websiteVisits: 0,
    });

    return {
      ...totals,
      avgOpenRate: marketingData.length > 0 ? totals.avgOpenRate / marketingData.length : 0,
      ctr: totals.adSpend > 0 ? (totals.adClicks / totals.adSpend) * 100 : 0,
    };
  }, [marketingData]);

  // Chart data: Email open rates by project
  const emailPerformanceData = useMemo(() => {
    return marketingData.map(data => {
      const project = projects.find(p => p.project_id === data.project_id);
      return {
        name: project?.project_name.split(' ').slice(0, 2).join(' ') || data.project_id,
        openRate: Math.round(data.email_open_rate * 100),
        projectId: data.project_id,
        status: project?.status || 'Unknown',
      };
    }).sort((a, b) => b.openRate - a.openRate);
  }, [marketingData, projects]);

  // Low performing projects (email open rate < 20%)
  const lowPerformingProjects = useMemo(() => {
    return marketingData.filter(data => data.email_open_rate < 0.20).length;
  }, [marketingData]);

  const getBarColor = (status: string) => {
    switch (status) {
      case 'Critical': return '#ef4444';
      case 'On Track': return '#10b981';
      case 'Completed': return '#6366f1';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Marketing Performance</h2>
        {lowPerformingProjects > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm">
            <AlertCircle size={16} />
            <span className="font-semibold">{lowPerformingProjects} project{lowPerformingProjects > 1 ? 's' : ''} below 20% open rate</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: KPI Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Email Performance */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Mail size={20} />
              <span className="text-xs font-semibold uppercase">Email Campaign</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {aggregatedMetrics.emailsSent.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              <span className={`font-semibold ${aggregatedMetrics.avgOpenRate >= 0.20 ? 'text-green-600' : 'text-red-600'}`}>
                {(aggregatedMetrics.avgOpenRate * 100).toFixed(1)}%
              </span> avg open rate
            </div>
          </div>

          {/* Social Reach */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <TrendingUp size={20} />
              <span className="text-xs font-semibold uppercase">Social Reach</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {(aggregatedMetrics.socialImpressions / 1000).toFixed(1)}k
            </div>
            <div className="text-sm text-gray-600 mt-1">total impressions</div>
          </div>

          {/* Ad Performance */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <MousePointerClick size={20} />
              <span className="text-xs font-semibold uppercase">Ad Clicks</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {aggregatedMetrics.adClicks.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              <span className="font-semibold">{aggregatedMetrics.ctr.toFixed(2)}</span> clicks per $1
            </div>
          </div>

          {/* Ad Spend */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <DollarSign size={20} />
              <span className="text-xs font-semibold uppercase">Ad Spend</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${(aggregatedMetrics.adSpend / 1000).toFixed(1)}k
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {aggregatedMetrics.websiteVisits.toLocaleString()} website visits
            </div>
          </div>
        </div>

        {/* Right: Email Performance Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Email Open Rates by Project</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={emailPerformanceData} layout="vertical">
              <XAxis type="number" domain={[0, 100]} unit="%" />
              <YAxis type="category" dataKey="name" width={120} style={{ fontSize: '12px' }} />
              <Tooltip
                formatter={(value: number) => `${value}%`}
                labelStyle={{ color: '#374151' }}
              />
              <Bar dataKey="openRate" radius={[0, 4, 4, 0]}>
                {emailPerformanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span className="text-gray-600">On Track</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-500"></div>
              <span className="text-gray-600">Critical</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-indigo-500"></div>
              <span className="text-gray-600">Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
