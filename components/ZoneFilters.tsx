import React from 'react';
import { DashboardFilters, Project } from '../types';
import { Filter, Calendar, AlertCircle } from 'lucide-react';

interface ZoneFiltersProps {
  filters: DashboardFilters;
  setFilters: React.Dispatch<React.SetStateAction<DashboardFilters>>;
  projects: Project[];
}

export const ZoneFilters: React.FC<ZoneFiltersProps> = ({ filters, setFilters, projects }) => {
  const projectNames = ['All', ...Array.from(new Set(projects.map(p => p.project_name)))];
  const statuses = ['All', 'On Track', 'Critical', 'Completed'];

  const handleChange = (key: keyof DashboardFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center justify-between mb-6 sticky top-0 z-50">
      <div className="flex items-center gap-2 text-slate-700 font-bold text-lg">
        <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
          <Filter size={20} />
        </div>
        <span>Global Filters</span>
      </div>

      <div className="flex flex-wrap gap-4 items-center flex-1 justify-end">
        {/* Project Selector */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Project</label>
          <select
            value={filters.projectName}
            onChange={(e) => handleChange('projectName', e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-48 p-2.5"
          >
            {projectNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* Date Range (Simplified for Demo) */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1">
            <Calendar size={12} /> Range Start
          </label>
          <input
            type="date"
            value={filters.dateStart}
            onChange={(e) => handleChange('dateStart', e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-40 p-2.5"
          />
        </div>

        {/* Status Selector */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1">
            <AlertCircle size={12} /> Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-40 p-2.5 ${filters.status === 'Critical' ? 'text-red-600 font-bold bg-red-50 border-red-200' : ''}`}
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
