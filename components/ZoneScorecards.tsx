import React from 'react';
import { DollarSign, Users, Mic, TrendingUp, TrendingDown } from 'lucide-react';

interface ZoneScorecardsProps {
  totalRevenue: number;
  totalDelegates: number;
  speakerFillRate: number;
  previousPeriodRevenue?: number; // Optional mock for comparison
}

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

export const ZoneScorecards: React.FC<ZoneScorecardsProps> = ({ 
  totalRevenue, 
  totalDelegates, 
  speakerFillRate,
  previousPeriodRevenue = totalRevenue * 0.85 // Mock previous period for demo
}) => {

  const revChange = ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Total Projected Revenue */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <DollarSign size={64} className="text-emerald-600" />
        </div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Projected Revenue</h3>
        <div className="text-3xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
        <div className={`flex items-center mt-2 text-sm ${revChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {revChange >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
          <span className="font-medium">{Math.abs(revChange).toFixed(1)}%</span>
          <span className="text-gray-400 ml-1">vs prev period</span>
        </div>
      </div>

      {/* Total Delegates */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Users size={64} className="text-blue-600" />
        </div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Delegates</h3>
        <div className="text-3xl font-bold text-gray-900">{new Intl.NumberFormat().format(totalDelegates)}</div>
        <div className="flex items-center mt-2 text-sm text-blue-600">
           <span className="font-medium">Live Count</span>
        </div>
      </div>

      {/* Speaker Fill Rate */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Mic size={64} className="text-purple-600" />
        </div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Speaker Fill Rate</h3>
        <div className="text-3xl font-bold text-gray-900">{(speakerFillRate * 100).toFixed(1)}%</div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
          <div 
            className={`h-2.5 rounded-full ${speakerFillRate < 0.5 ? 'bg-red-500' : speakerFillRate < 0.8 ? 'bg-yellow-400' : 'bg-emerald-500'}`} 
            style={{ width: `${Math.min(speakerFillRate * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
