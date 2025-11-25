import { Project, Sponsor, DelegateLog, MarketingData, AiInsight } from '../types';

/**
 * Converts array of objects to CSV string
 */
const arrayToCSV = (data: any[], headers: string[]): string => {
  const csvRows = [];

  // Add header row
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Escape quotes and handle undefined/null
      const escaped = ('' + (value ?? '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

/**
 * Triggers browser download of a file
 */
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export Projects to CSV
 */
export const exportProjectsCSV = (projects: Project[]) => {
  const headers = ['project_id', 'project_name', 'date', 'status', 'revenue_target', 'revenue_actual', 'speaker_target', 'speaker_actual'];
  const csv = arrayToCSV(projects, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `projects_${timestamp}.csv`, 'text/csv');
};

/**
 * Export Sponsors to CSV
 */
export const exportSponsorsCSV = (sponsors: Sponsor[]) => {
  const headers = ['sponsor_name', 'project_id', 'stage', 'value'];
  const csv = arrayToCSV(sponsors, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `sponsors_${timestamp}.csv`, 'text/csv');
};

/**
 * Export Delegates to CSV
 */
export const exportDelegatesCSV = (delegates: DelegateLog[]) => {
  const headers = ['date_logged', 'project_id', 'category', 'count'];
  const csv = arrayToCSV(delegates, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `delegates_${timestamp}.csv`, 'text/csv');
};

/**
 * Export Marketing Data to CSV
 */
export const exportMarketingCSV = (marketingData: MarketingData[]) => {
  const flatData = marketingData.map(m => ({
    project_id: m.project_id,
    emails_sent: m.emails_sent,
    email_open_rate: (m.email_open_rate * 100).toFixed(2) + '%',
    social_posts_count: m.social_posts_count,
    social_impressions: m.social_impressions,
    ad_spend: m.ad_spend,
    ad_clicks: m.ad_clicks,
    website_visits: m.website_visits,
  }));

  const headers = ['project_id', 'emails_sent', 'email_open_rate', 'social_posts_count', 'social_impressions', 'ad_spend', 'ad_clicks', 'website_visits'];
  const csv = arrayToCSV(flatData, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `marketing_${timestamp}.csv`, 'text/csv');
};

/**
 * Export Complete Dashboard Report (All Data)
 */
export const exportCompleteCSV = (
  projects: Project[],
  sponsors: Sponsor[],
  delegates: DelegateLog[],
  marketingData: MarketingData[]
) => {
  // Aggregate by project
  const report = projects.map(project => {
    // Count delegates
    const projectDelegates = delegates.filter(d => d.project_id === project.project_id);
    const totalDelegates = projectDelegates.reduce((sum, d) => sum + d.count, 0);
    const govDelegates = projectDelegates.filter(d => d.category === 'Government').reduce((sum, d) => sum + d.count, 0);
    const indDelegates = projectDelegates.filter(d => d.category === 'Industry').reduce((sum, d) => sum + d.count, 0);
    const stuDelegates = projectDelegates.filter(d => d.category === 'Student').reduce((sum, d) => sum + d.count, 0);

    // Calculate sponsor pipeline
    const projectSponsors = sponsors.filter(s => s.project_id === project.project_id);
    const totalSponsors = projectSponsors.length;
    const signedSponsors = projectSponsors.filter(s => s.stage === 'Signed').length;
    const totalSponsorValue = projectSponsors.reduce((sum, s) => sum + s.value, 0);

    // Get marketing data
    const marketing = marketingData.find(m => m.project_id === project.project_id);

    return {
      project_id: project.project_id,
      project_name: project.project_name,
      date: project.date,
      status: project.status,
      revenue_target: project.revenue_target,
      revenue_actual: project.revenue_actual,
      revenue_gap: project.revenue_target - project.revenue_actual,
      speaker_target: project.speaker_target,
      speaker_actual: project.speaker_actual,
      speaker_fill_rate: ((project.speaker_actual / project.speaker_target) * 100).toFixed(1) + '%',
      total_delegates: totalDelegates,
      gov_delegates: govDelegates,
      industry_delegates: indDelegates,
      student_delegates: stuDelegates,
      total_sponsors: totalSponsors,
      signed_sponsors: signedSponsors,
      total_sponsor_value: totalSponsorValue,
      emails_sent: marketing?.emails_sent || 0,
      email_open_rate: marketing ? (marketing.email_open_rate * 100).toFixed(2) + '%' : 'N/A',
      ad_spend: marketing?.ad_spend || 0,
      website_visits: marketing?.website_visits || 0,
    };
  });

  const headers = [
    'project_id', 'project_name', 'date', 'status',
    'revenue_target', 'revenue_actual', 'revenue_gap',
    'speaker_target', 'speaker_actual', 'speaker_fill_rate',
    'total_delegates', 'gov_delegates', 'industry_delegates', 'student_delegates',
    'total_sponsors', 'signed_sponsors', 'total_sponsor_value',
    'emails_sent', 'email_open_rate', 'ad_spend', 'website_visits'
  ];

  const csv = arrayToCSV(report, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `dashboard_complete_report_${timestamp}.csv`, 'text/csv');
};

/**
 * Export Executive Summary Report (HTML format, can be printed to PDF)
 */
export const exportExecutiveSummaryHTML = (
  projects: Project[],
  sponsors: Sponsor[],
  delegates: DelegateLog[],
  _marketingData: MarketingData[],
  aiInsight: AiInsight | null
) => {
  const timestamp = new Date().toLocaleString();

  // Calculate totals
  const totalRevenue = projects.reduce((sum, p) => sum + p.revenue_actual, 0);
  const totalRevenueTarget = projects.reduce((sum, p) => sum + p.revenue_target, 0);
  const totalDelegates = delegates.reduce((sum, d) => sum + d.count, 0);
  const totalSponsors = sponsors.length;
  const signedSponsors = sponsors.filter(s => s.stage === 'Signed').length;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Executive Summary - Event Horizon Analytics</title>
  <style>
    @media print {
      body { margin: 0; padding: 20px; }
      .no-print { display: none; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #1f2937;
    }
    .header {
      border-bottom: 3px solid #6366f1;
      padding-bottom: 20px;
      margin-bottom: 40px;
    }
    h1 { color: #6366f1; margin: 0 0 10px 0; }
    .timestamp { color: #6b7280; font-size: 14px; }
    .kpis {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .kpi-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
    }
    .kpi-label { font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 600; }
    .kpi-value { font-size: 28px; font-weight: bold; margin: 10px 0; color: #111827; }
    .kpi-subtext { font-size: 14px; color: #6b7280; }
    .ai-section {
      background: linear-gradient(to right, #eef2ff, #f3e8ff);
      border: 1px solid #c7d2fe;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 40px;
    }
    .ai-section h2 { margin-top: 0; color: #4f46e5; }
    .ai-block { margin-bottom: 20px; }
    .ai-block h3 { font-size: 14px; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; }
    .ai-block p { margin: 0; color: #374151; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 40px;
    }
    th, td {
      text-align: left;
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
      font-size: 12px;
      text-transform: uppercase;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .status-on-track { background: #d1fae5; color: #065f46; }
    .status-critical { background: #fee2e2; color: #991b1b; }
    .status-completed { background: #dbeafe; color: #1e40af; }
    .btn {
      background: #6366f1;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      margin-right: 10px;
    }
    .btn:hover { background: #4f46e5; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Executive Summary Report</h1>
    <p class="timestamp">Generated on ${timestamp}</p>
    <div class="no-print">
      <button class="btn" onclick="window.print()">🖨️ Print to PDF</button>
      <button class="btn" onclick="window.close()">✕ Close</button>
    </div>
  </div>

  <div class="kpis">
    <div class="kpi-card">
      <div class="kpi-label">Total Revenue</div>
      <div class="kpi-value">$${(totalRevenue / 1000).toFixed(0)}k</div>
      <div class="kpi-subtext">Target: $${(totalRevenueTarget / 1000).toFixed(0)}k</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Total Delegates</div>
      <div class="kpi-value">${totalDelegates.toLocaleString()}</div>
      <div class="kpi-subtext">Across all projects</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Sponsors</div>
      <div class="kpi-value">${totalSponsors}</div>
      <div class="kpi-subtext">${signedSponsors} signed</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Active Projects</div>
      <div class="kpi-value">${projects.length}</div>
      <div class="kpi-subtext">${projects.filter(p => p.status === 'Critical').length} critical</div>
    </div>
  </div>

  ${aiInsight ? `
  <div class="ai-section">
    <h2>🤖 AI Strategic Analysis</h2>
    <div class="ai-block">
      <h3>Executive Summary</h3>
      <p>${aiInsight.summary}</p>
    </div>
    <div class="ai-block">
      <h3>Key Risk</h3>
      <p>${aiInsight.risk}</p>
    </div>
    <div class="ai-block">
      <h3>Strategic Recommendation</h3>
      <p>${aiInsight.recommendation}</p>
    </div>
  </div>
  ` : ''}

  <h2>Project Overview</h2>
  <table>
    <thead>
      <tr>
        <th>Project Name</th>
        <th>Date</th>
        <th>Status</th>
        <th>Revenue</th>
        <th>Delegates</th>
        <th>Speakers</th>
      </tr>
    </thead>
    <tbody>
      ${projects.map(p => {
        const projectDelegates = delegates.filter(d => d.project_id === p.project_id).reduce((sum, d) => sum + d.count, 0);
        const statusClass = p.status === 'On Track' ? 'status-on-track' : p.status === 'Critical' ? 'status-critical' : 'status-completed';
        return `
        <tr>
          <td><strong>${p.project_name}</strong></td>
          <td>${p.date}</td>
          <td><span class="status-badge ${statusClass}">${p.status}</span></td>
          <td>$${(p.revenue_actual / 1000).toFixed(0)}k / $${(p.revenue_target / 1000).toFixed(0)}k</td>
          <td>${projectDelegates}</td>
          <td>${p.speaker_actual} / ${p.speaker_target}</td>
        </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 40px;">
    Event Horizon Analytics • Powered by Gemini AI
  </p>
</body>
</html>
  `;

  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
};
