import React, { useState } from 'react';
import { Download, FileText, Table, TrendingUp, Database, FileSpreadsheet } from 'lucide-react';
import { Project, Sponsor, DelegateLog, MarketingData, AiInsight } from '../types';
import {
  exportProjectsCSV,
  exportSponsorsCSV,
  exportDelegatesCSV,
  exportMarketingCSV,
  exportCompleteCSV,
  exportExecutiveSummaryHTML
} from '../services/exportService';

interface ExportMenuProps {
  projects: Project[];
  sponsors: Sponsor[];
  delegates: DelegateLog[];
  marketingData: MarketingData[];
  aiInsight: AiInsight | null;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  projects,
  sponsors,
  delegates,
  marketingData,
  aiInsight
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (exportFn: () => void) => {
    exportFn();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-all hover:shadow-md"
      >
        <Download size={18} />
        <span className="font-semibold">Export</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Download size={18} className="text-indigo-600" />
                Export Dashboard Data
              </h3>
              <p className="text-xs text-gray-600 mt-1">Download reports in various formats</p>
            </div>

            <div className="p-2">
              {/* Executive Summary */}
              <button
                onClick={() => handleExport(() => exportExecutiveSummaryHTML(projects, sponsors, delegates, marketingData, aiInsight))}
                className="w-full flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-indigo-50 transition-colors text-left group"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                  <FileText size={16} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-sm">Executive Summary</div>
                  <div className="text-xs text-gray-600">HTML report with AI insights (Print to PDF)</div>
                </div>
              </button>

              {/* Complete Dashboard CSV */}
              <button
                onClick={() => handleExport(() => exportCompleteCSV(projects, sponsors, delegates, marketingData))}
                className="w-full flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-emerald-50 transition-colors text-left group"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <Database size={16} className="text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-sm">Complete Report (CSV)</div>
                  <div className="text-xs text-gray-600">All projects with aggregated metrics</div>
                </div>
              </button>

              <div className="h-px bg-gray-200 my-2"></div>

              {/* Individual Exports */}
              <div className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">Individual Datasets</div>

              <button
                onClick={() => handleExport(() => exportProjectsCSV(projects))}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <Table size={14} className="text-gray-500 group-hover:text-gray-700" />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Projects Data (CSV)</span>
              </button>

              <button
                onClick={() => handleExport(() => exportSponsorsCSV(sponsors))}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <Table size={14} className="text-gray-500 group-hover:text-gray-700" />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Sponsors Data (CSV)</span>
              </button>

              <button
                onClick={() => handleExport(() => exportDelegatesCSV(delegates))}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <Table size={14} className="text-gray-500 group-hover:text-gray-700" />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Delegates Data (CSV)</span>
              </button>

              <button
                onClick={() => handleExport(() => exportMarketingCSV(marketingData))}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <TrendingUp size={14} className="text-gray-500 group-hover:text-gray-700" />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Marketing Data (CSV)</span>
              </button>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <FileSpreadsheet size={12} />
                CSV files open in Excel, Sheets, or any spreadsheet app
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
