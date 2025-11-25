import React, { useMemo } from 'react';
import { Project, Sponsor, DelegateLog, MarketingData } from '../types';
import { AlertTriangle, AlertCircle, TrendingDown, Users, DollarSign, Calendar } from 'lucide-react';

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  projectId?: string;
  projectName?: string;
  icon: React.ReactNode;
  metric?: string;
}

interface AlertsPanelProps {
  projects: Project[];
  sponsors: Sponsor[];
  delegates: DelegateLog[];
  marketingData: MarketingData[];
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  projects,
  sponsors,
  delegates,
  marketingData,
}) => {
  const alerts = useMemo(() => {
    const alertList: Alert[] = [];

    projects.forEach(project => {
      const projectSponsors = sponsors.filter(s => s.project_id === project.project_id);
      const projectDelegates = delegates.filter(d => d.project_id === project.project_id);
      const projectMarketing = marketingData.find(m => m.project_id === project.project_id);

      const totalRevenue = projectSponsors.reduce((sum, s) => sum + s.value, 0);
      const totalDelegates = projectDelegates.reduce((sum, d) => sum + d.count, 0);
      const revenueGap = project.revenue_target - totalRevenue;
      const speakerFillRate = project.speaker_target > 0 ? (project.speaker_actual / project.speaker_target) : 1;

      // Days until event
      const daysUntilEvent = Math.ceil((new Date(project.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      const isUpcoming = daysUntilEvent > 0 && daysUntilEvent <= 30;

      // CRITICAL: Revenue significantly behind target (>30% gap) and event is soon
      if (revenueGap > project.revenue_target * 0.3 && isUpcoming) {
        alertList.push({
          id: `rev-critical-${project.project_id}`,
          severity: 'critical',
          title: `${project.project_name}: Revenue At Risk`,
          description: `$${(revenueGap / 1000).toFixed(0)}k shortfall with ${daysUntilEvent} days remaining. Only ${((totalRevenue / project.revenue_target) * 100).toFixed(0)}% of target secured.`,
          projectId: project.project_id,
          projectName: project.project_name,
          icon: <DollarSign size={20} />,
          metric: `$${(revenueGap / 1000).toFixed(0)}k gap`,
        });
      }

      // WARNING: Speaker fill rate below 50%
      if (speakerFillRate < 0.5 && isUpcoming) {
        alertList.push({
          id: `speaker-warning-${project.project_id}`,
          severity: 'warning',
          title: `${project.project_name}: Speaker Shortage`,
          description: `Only ${project.speaker_actual} of ${project.speaker_target} speakers confirmed (${(speakerFillRate * 100).toFixed(0)}%). Need ${project.speaker_target - project.speaker_actual} more speakers.`,
          projectId: project.project_id,
          projectName: project.project_name,
          icon: <Users size={20} />,
          metric: `${(speakerFillRate * 100).toFixed(0)}% filled`,
        });
      }

      // CRITICAL: Low delegate count with event approaching
      if (totalDelegates < 50 && daysUntilEvent <= 14 && daysUntilEvent > 0) {
        alertList.push({
          id: `delegates-critical-${project.project_id}`,
          severity: 'critical',
          title: `${project.project_name}: Low Registration`,
          description: `Only ${totalDelegates} delegates registered with ${daysUntilEvent} days until event. Consider boosting marketing efforts.`,
          projectId: project.project_id,
          projectName: project.project_name,
          icon: <Users size={20} />,
          metric: `${totalDelegates} registered`,
        });
      }

      // WARNING: Poor email performance
      if (projectMarketing && projectMarketing.email_open_rate < 0.15 && projectMarketing.emails_sent > 1000) {
        alertList.push({
          id: `email-warning-${project.project_id}`,
          severity: 'warning',
          title: `${project.project_name}: Low Email Engagement`,
          description: `Email open rate is only ${(projectMarketing.email_open_rate * 100).toFixed(1)}%. Consider revising subject lines or segmentation.`,
          projectId: project.project_id,
          projectName: project.project_name,
          icon: <TrendingDown size={20} />,
          metric: `${(projectMarketing.email_open_rate * 100).toFixed(1)}% opens`,
        });
      }

      // CRITICAL: Budget overrun
      if (project.expenses_actual && project.budget_total && project.expenses_actual > project.budget_total) {
        const overrun = project.expenses_actual - project.budget_total;
        alertList.push({
          id: `budget-critical-${project.project_id}`,
          severity: 'critical',
          title: `${project.project_name}: Budget Exceeded`,
          description: `Expenses ($${(project.expenses_actual / 1000).toFixed(0)}k) exceed budget by $${(overrun / 1000).toFixed(0)}k.`,
          projectId: project.project_id,
          projectName: project.project_name,
          icon: <AlertTriangle size={20} />,
          metric: `+$${(overrun / 1000).toFixed(0)}k over`,
        });
      }

      // INFO: Event happening soon
      if (daysUntilEvent <= 7 && daysUntilEvent > 0) {
        alertList.push({
          id: `upcoming-${project.project_id}`,
          severity: 'info',
          title: `${project.project_name}: Event This Week`,
          description: `Event starts in ${daysUntilEvent} day${daysUntilEvent > 1 ? 's' : ''}. Ensure all logistics are finalized.`,
          projectId: project.project_id,
          projectName: project.project_name,
          icon: <Calendar size={20} />,
          metric: `${daysUntilEvent}d away`,
        });
      }
    });

    // Sort by severity: critical > warning > info
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return alertList.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }, [projects, sponsors, delegates, marketingData]);

  if (alerts.length === 0) {
    return (
      <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <AlertCircle size={20} className="text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-green-900">All Systems Operational</h3>
            <p className="text-sm text-green-700">No critical alerts at this time. All projects are tracking well.</p>
          </div>
        </div>
      </div>
    );
  }

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <AlertTriangle size={20} className="text-orange-500" />
          Active Alerts
        </h2>
        <div className="flex items-center gap-3 text-sm">
          {criticalCount > 0 && (
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
              {criticalCount} Critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-semibold">
              {warningCount} Warning
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {alerts.map((alert) => {
          const severityStyles = {
            critical: 'bg-red-50 border-red-200',
            warning: 'bg-amber-50 border-amber-200',
            info: 'bg-blue-50 border-blue-200',
          };

          const iconStyles = {
            critical: 'bg-red-100 text-red-600',
            warning: 'bg-amber-100 text-amber-600',
            info: 'bg-blue-100 text-blue-600',
          };

          const textStyles = {
            critical: 'text-red-900',
            warning: 'text-amber-900',
            info: 'text-blue-900',
          };

          const subtextStyles = {
            critical: 'text-red-700',
            warning: 'text-amber-700',
            info: 'text-blue-700',
          };

          return (
            <div
              key={alert.id}
              className={`p-4 border rounded-xl ${severityStyles[alert.severity]} transition-all hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${iconStyles[alert.severity]}`}>
                  {alert.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`font-bold text-sm ${textStyles[alert.severity]}`}>
                      {alert.title}
                    </h4>
                    {alert.metric && (
                      <span className={`text-xs font-semibold whitespace-nowrap ${subtextStyles[alert.severity]}`}>
                        {alert.metric}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${subtextStyles[alert.severity]}`}>
                    {alert.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
