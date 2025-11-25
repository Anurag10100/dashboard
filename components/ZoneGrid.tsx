import React from 'react';
import { Project, DelegateLog, Sponsor } from '../types';
import { Plus, UserPlus, ArrowUpRight } from 'lucide-react';

interface ZoneGridProps {
  projects: Project[];
  delegates: DelegateLog[];
  sponsors: Sponsor[];
  onUpdateStatus: (projectId: string, newStatus: Project['status']) => void;
  onUpdateSpeakers: (projectId: string, change: number) => void;
  onAddDelegate: (projectId: string) => void;
  onAddSponsor: (projectId: string) => void;
  onSelectProject: (projectId: string) => void;
}

interface EnrichedProject extends Project {
  delegates_total: number;
  calculated_revenue_actual: number; // Calculated from sponsors array
  revenue_gap: number;
}

export const ZoneGrid: React.FC<ZoneGridProps> = ({ 
  projects, 
  delegates, 
  sponsors,
  onUpdateStatus,
  onUpdateSpeakers,
  onAddDelegate,
  onAddSponsor,
  onSelectProject
}) => {
  
  // 1. Enrich data with aggregated delegate counts AND sponsor revenue
  const enrichedProjects: EnrichedProject[] = projects.map(p => {
    const totalDelegates = delegates
      .filter(d => d.project_id === p.project_id)
      .reduce((sum, d) => sum + d.count, 0);
    
    // Calculate ACTUAL revenue from the Sponsors pipeline (Signed/Contract) for this view, 
    // or just sum all value to be simple for the demo "Revenue Actual"
    const totalRevenue = sponsors
      .filter(s => s.project_id === p.project_id)
      .reduce((sum, s) => sum + s.value, 0);

    // If totalRevenue is 0 (no mock sponsors for this project), fall back to the project's default
    const effectiveRevenue = totalRevenue > 0 ? totalRevenue : p.revenue_actual;
    
    return {
      ...p,
      delegates_total: totalDelegates,
      calculated_revenue_actual: effectiveRevenue,
      revenue_gap: p.revenue_target - effectiveRevenue
    };
  });

  // 2. Find max for Heatmap calculation
  const maxDelegates = Math.max(...enrichedProjects.map(p => p.delegates_total), 1);

  // Helper for Heatmap background opacity (Blue)
  const getHeatmapStyle = (value: number) => {
    const opacity = (value / maxDelegates) * 0.8 + 0.1; // min 0.1 opacity
    return { backgroundColor: `rgba(59, 130, 246, ${opacity})`, color: opacity > 0.5 ? 'white' : 'black' };
  };

  // Helper for Status colors
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
      case 'On Track': return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      case 'Completed': return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Master Project Control Grid</h3>
        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">Interactive Mode Active</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-4">Project Name</th>
              <th scope="col" className="px-6 py-4 text-center">Status</th>
              <th scope="col" className="px-6 py-4 text-center">Speakers (Act / Tgt)</th>
              <th scope="col" className="px-6 py-4 text-center">Delegates</th>
              <th scope="col" className="px-6 py-4 text-right">Revenue (Act / Tgt)</th>
              <th scope="col" className="px-6 py-4 text-right">Gap</th>
              <th scope="col" className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrichedProjects.length > 0 ? (
              enrichedProjects.map((project) => (
                <tr key={project.project_id} className="bg-white border-b hover:bg-gray-50 transition-colors group">
                  
                  {/* Name */}
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {project.project_name}
                    <div className="text-xs text-gray-400 font-normal">{project.project_id}</div>
                  </td>
                  
                  {/* Status Dropdown */}
                  <td className="px-6 py-4 text-center">
                    <select
                      value={project.status}
                      onChange={(e) => onUpdateStatus(project.project_id, e.target.value as Project['status'])}
                      className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer focus:ring-2 focus:ring-indigo-500 outline-none appearance-none text-center ${getStatusColor(project.status)}`}
                      style={{textAlignLast: 'center'}}
                    >
                      <option value="On Track">On Track</option>
                      <option value="Critical">Critical</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>

                  {/* Speakers Control */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                       <button 
                         onClick={() => onUpdateSpeakers(project.project_id, -1)}
                         className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
                       >-</button>
                       <div className="flex flex-col items-center w-16">
                          <span className="font-bold text-gray-900">{project.speaker_actual}</span>
                          <span className="text-xs text-gray-400 border-t border-gray-200 w-full text-center mt-0.5 pt-0.5">{project.speaker_target}</span>
                       </div>
                       <button 
                         onClick={() => onUpdateSpeakers(project.project_id, 1)}
                         className="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold"
                       >+</button>
                    </div>
                  </td>
                  
                  {/* Delegates Heatmap + Add Button */}
                  <td className="px-6 py-4 text-center transition-all duration-300 relative group/cell" style={getHeatmapStyle(project.delegates_total)}>
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      <span className="font-bold">{project.delegates_total}</span>
                      <button 
                        onClick={() => onAddDelegate(project.project_id)}
                        title="Add 5 Delegates"
                        className="opacity-0 group-hover/cell:opacity-100 bg-white/20 hover:bg-white/40 text-current p-1 rounded transition-opacity"
                      >
                        <UserPlus size={14} />
                      </button>
                    </div>
                  </td>

                  {/* Revenue + Add Deal Button */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">${project.calculated_revenue_actual.toLocaleString()}</span>
                        <button 
                          onClick={() => onAddSponsor(project.project_id)}
                          title="Add $10k Lead"
                          className="text-green-600 bg-green-50 hover:bg-green-100 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Plus size={12} strokeWidth={3} />
                        </button>
                      </div>
                      <span className="text-xs text-gray-400">Target: ${project.revenue_target.toLocaleString()}</span>
                    </div>
                  </td>

                  {/* Revenue Gap */}
                  <td className={`px-6 py-4 text-right font-bold ${project.revenue_gap > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {project.revenue_gap > 0 ? `-$${project.revenue_gap.toLocaleString()}` : '+$' + Math.abs(project.revenue_gap).toLocaleString()}
                  </td>

                  {/* Deep Dive Action */}
                  <td className="px-6 py-4 text-center">
                    <button 
                        onClick={() => onSelectProject(project.project_id)}
                        className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 flex items-center gap-1 mx-auto transition-colors"
                    >
                        Analyze <ArrowUpRight size={12} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">
                  No projects match your current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};