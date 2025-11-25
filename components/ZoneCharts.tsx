import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import { Sponsor, DelegateLog, SponsorStage } from '../types';

interface ZoneChartsProps {
  sponsors: Sponsor[];
  delegates: DelegateLog[];
  speakerTarget: number;
  speakerActual: number;
}

// Helper for Funnel colors
const STAGE_COLORS = {
  [SponsorStage.LEAD]: '#94a3b8',
  [SponsorStage.PROPOSAL]: '#60a5fa',
  [SponsorStage.CONTRACT_SENT]: '#818cf8',
  [SponsorStage.SIGNED]: '#34d399',
};

// Helper for Gauge Color
const getGaugeColor = (percent: number) => {
  if (percent < 0.5) return '#ef4444'; // Red
  if (percent < 0.8) return '#eab308'; // Yellow
  return '#10b981'; // Green
};

export const ZoneCharts: React.FC<ZoneChartsProps> = ({ sponsors, delegates, speakerTarget, speakerActual }) => {
  
  // --- Prepare Funnel Data ---
  // Group by stage and count records (Volume)
  const funnelDataRaw = sponsors.reduce((acc, curr) => {
    acc[curr.stage] = (acc[curr.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const funnelOrder = [SponsorStage.LEAD, SponsorStage.PROPOSAL, SponsorStage.CONTRACT_SENT, SponsorStage.SIGNED];
  
  const funnelData = funnelOrder.map(stage => ({
    stage,
    count: funnelDataRaw[stage] || 0,
    fill: STAGE_COLORS[stage]
  }));

  // --- Prepare Delegate Trend Data ---
  // Group by Date and Category
  const trendMap = new Map<string, { date: string; Government: number; Industry: number; Student: number }>();
  
  delegates.forEach(d => {
    const dateStr = d.date_logged.split('T')[0];
    if (!trendMap.has(dateStr)) {
      trendMap.set(dateStr, { date: dateStr, Government: 0, Industry: 0, Student: 0 });
    }
    const entry = trendMap.get(dateStr)!;
    entry[d.category] = (entry[d.category] || 0) + d.count;
  });

  const trendData = Array.from(trendMap.values())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // --- Prepare Gauge Data ---
  const gaugeVal = Math.min(speakerActual, speakerTarget);
  const gaugeRemainder = speakerTarget - gaugeVal;
  const gaugeData = [
    { name: 'Actual', value: gaugeVal },
    { name: 'Remaining', value: gaugeRemainder }
  ];
  const fillPct = speakerTarget > 0 ? speakerActual / speakerTarget : 0;
  const gaugeColor = getGaugeColor(fillPct);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      
      {/* Chart A: Sponsor Funnel */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col">
        <h4 className="text-gray-700 font-bold mb-4 border-b pb-2">Sponsor Funnel (Volume)</h4>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={funnelData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="stage" type="category" width={100} tick={{fontSize: 12}} />
              <RechartsTooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="count" barSize={30} radius={[0, 4, 4, 0]}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart B: Delegate Trends */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col">
        <h4 className="text-gray-700 font-bold mb-4 border-b pb-2">Delegate Trends (Velocity)</h4>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{fontSize: 10}} tickFormatter={(val) => val.substring(5)} />
              <YAxis tick={{fontSize: 10}} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Line type="monotone" dataKey="Government" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{r: 6}} />
              <Line type="monotone" dataKey="Industry" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{r: 6}} />
              <Line type="monotone" dataKey="Student" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart C: Speaker Gauge */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col">
        <h4 className="text-gray-700 font-bold mb-4 border-b pb-2">Speaker Gauge (Content)</h4>
        <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={gaugeData}
                cx="50%"
                cy="70%"
                startAngle={180}
                endAngle={0}
                innerRadius={80}
                outerRadius={120}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                <Cell fill={gaugeColor} />
                <Cell fill="#e2e8f0" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute bottom-[20%] text-center">
            <div className="text-4xl font-bold text-gray-800">{speakerActual}</div>
            <div className="text-sm text-gray-500">of {speakerTarget} Speakers</div>
          </div>
        </div>
      </div>

    </div>
  );
};
