import { Project, DelegateLog, Sponsor, SponsorStage, MarketingData, Campaign, ExpenseCategory } from '../types';

// Helper to generate dates relative to today
const addDays = (date: Date, days: number): string => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
};

const TODAY = new Date();

// Source A: MASTER_PROJECTS
export const MASTER_PROJECTS: Project[] = [
  { project_id: 'P-001', project_name: 'World Edu Summit', date: '2024-12-12', status: 'On Track', revenue_target: 100000, revenue_actual: 75000, speaker_target: 50, speaker_actual: 45, budget_total: 85000, expenses_actual: 62000 },
  { project_id: 'P-002', project_name: 'Future Tech Expo', date: '2024-11-20', status: 'Critical', revenue_target: 250000, revenue_actual: 120000, speaker_target: 100, speaker_actual: 40, budget_total: 200000, expenses_actual: 145000 },
  { project_id: 'P-003', project_name: 'Green Energy Forum', date: '2025-01-15', status: 'On Track', revenue_target: 80000, revenue_actual: 30000, speaker_target: 30, speaker_actual: 10, budget_total: 65000, expenses_actual: 28000 },
  { project_id: 'P-004', project_name: 'AI Innovators Con', date: '2024-10-30', status: 'Completed', revenue_target: 150000, revenue_actual: 160000, speaker_target: 60, speaker_actual: 60, budget_total: 120000, expenses_actual: 118000 },
  { project_id: 'P-005', project_name: 'Global Health Symposium', date: '2024-12-05', status: 'Critical', revenue_target: 120000, revenue_actual: 50000, speaker_target: 45, speaker_actual: 20, budget_total: 95000, expenses_actual: 72000 },
];

// Source B: DELEGATES_DATA (Time series generation)
const generateDelegateLogs = (): DelegateLog[] => {
  const logs: DelegateLog[] = [];
  const categories: ('Government' | 'Industry' | 'Student')[] = ['Government', 'Industry', 'Student'];
  
  MASTER_PROJECTS.forEach(project => {
    // Generate 10 logs per project spread over the last 30 days
    for (let i = 0; i < 15; i++) {
      logs.push({
        project_id: project.project_id,
        date_logged: addDays(TODAY, -Math.floor(Math.random() * 60)),
        category: categories[Math.floor(Math.random() * categories.length)],
        count: Math.floor(Math.random() * 20) + 5,
      });
    }
  });
  return logs.sort((a, b) => new Date(a.date_logged).getTime() - new Date(b.date_logged).getTime());
};

export const DELEGATES_DATA: DelegateLog[] = generateDelegateLogs();

// Source C: SPONSORS_PIPELINE
export const SPONSORS_PIPELINE: Sponsor[] = [
  // P-001
  { sponsor_name: 'TechCorp', project_id: 'P-001', stage: SponsorStage.SIGNED, value: 50000 },
  { sponsor_name: 'EduSystems', project_id: 'P-001', stage: SponsorStage.PROPOSAL, value: 20000 },
  { sponsor_name: 'BookHouse', project_id: 'P-001', stage: SponsorStage.LEAD, value: 10000 },
  // P-002 (Critical - low signed)
  { sponsor_name: 'MegaChip', project_id: 'P-002', stage: SponsorStage.LEAD, value: 100000 },
  { sponsor_name: 'SoftServe', project_id: 'P-002', stage: SponsorStage.PROPOSAL, value: 80000 },
  { sponsor_name: 'CloudNet', project_id: 'P-002', stage: SponsorStage.SIGNED, value: 20000 },
  // P-003
  { sponsor_name: 'GreenLeaf', project_id: 'P-003', stage: SponsorStage.CONTRACT_SENT, value: 30000 },
  { sponsor_name: 'SolarX', project_id: 'P-003', stage: SponsorStage.LEAD, value: 40000 },
  // P-004
  { sponsor_name: 'BrainWave', project_id: 'P-004', stage: SponsorStage.SIGNED, value: 80000 },
  { sponsor_name: 'NeuralNet', project_id: 'P-004', stage: SponsorStage.SIGNED, value: 70000 },
  // P-005
  { sponsor_name: 'PharmaPlus', project_id: 'P-005', stage: SponsorStage.LEAD, value: 60000 },
  { sponsor_name: 'MediCare', project_id: 'P-005', stage: SponsorStage.PROPOSAL, value: 40000 },
];

// NEW Source D: MARKETING_DATA
const generateMarketingData = (): MarketingData[] => {
  return MASTER_PROJECTS.map(project => {
    const isCritical = project.status === 'Critical';
    
    // Simulate campaigns
    const campaigns: Campaign[] = [
      { id: '1', name: 'Early Bird Blast', type: 'Email', status: 'Sent', metric: '24% Open', date: addDays(TODAY, -20) },
      { id: '2', name: 'Speaker Announcement', type: 'Social', status: 'Active', metric: '1.2k Likes', date: addDays(TODAY, -5) },
      { id: '3', name: 'LinkedIn Ads Gen 1', type: 'Ad', status: isCritical ? 'Active' : 'Draft', metric: '$500 Spend', date: addDays(TODAY, -2) },
      { id: '4', name: 'Final Call', type: 'Email', status: 'Scheduled', metric: 'N/A', date: addDays(TODAY, 5) },
    ];

    return {
      project_id: project.project_id,
      emails_sent: Math.floor(Math.random() * 5000) + 1000,
      email_open_rate: isCritical ? 0.15 : 0.28, // Critical projects simulate poor engagement
      social_posts_count: Math.floor(Math.random() * 50) + 10,
      social_impressions: Math.floor(Math.random() * 50000) + 5000,
      ad_spend: Math.floor(Math.random() * 5000),
      ad_clicks: Math.floor(Math.random() * 500),
      website_visits: Math.floor(Math.random() * 10000) + 2000,
      recent_campaigns: campaigns
    };
  });
};

export const MARKETING_DATA: MarketingData[] = generateMarketingData();

// Source E: EXPENSE_CATEGORIES
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  // P-001: World Edu Summit
  { project_id: 'P-001', category: 'Venue', amount: 25000 },
  { project_id: 'P-001', category: 'Catering', amount: 15000 },
  { project_id: 'P-001', category: 'Marketing', amount: 8000 },
  { project_id: 'P-001', category: 'Speaker Fees', amount: 10000 },
  { project_id: 'P-001', category: 'Technology', amount: 4000 },

  // P-002: Future Tech Expo
  { project_id: 'P-002', category: 'Venue', amount: 60000 },
  { project_id: 'P-002', category: 'Catering', amount: 35000 },
  { project_id: 'P-002', category: 'Marketing', amount: 20000 },
  { project_id: 'P-002', category: 'Speaker Fees', amount: 20000 },
  { project_id: 'P-002', category: 'Technology', amount: 10000 },

  // P-003: Green Energy Forum
  { project_id: 'P-003', category: 'Venue', amount: 12000 },
  { project_id: 'P-003', category: 'Catering', amount: 8000 },
  { project_id: 'P-003', category: 'Marketing', amount: 4000 },
  { project_id: 'P-003', category: 'Speaker Fees', amount: 3000 },
  { project_id: 'P-003', category: 'Technology', amount: 1000 },

  // P-004: AI Innovators Con
  { project_id: 'P-004', category: 'Venue', amount: 45000 },
  { project_id: 'P-004', category: 'Catering', amount: 30000 },
  { project_id: 'P-004', category: 'Marketing', amount: 18000 },
  { project_id: 'P-004', category: 'Speaker Fees', amount: 15000 },
  { project_id: 'P-004', category: 'Technology', amount: 10000 },

  // P-005: Global Health Symposium
  { project_id: 'P-005', category: 'Venue', amount: 28000 },
  { project_id: 'P-005', category: 'Catering', amount: 18000 },
  { project_id: 'P-005', category: 'Marketing', amount: 12000 },
  { project_id: 'P-005', category: 'Speaker Fees', amount: 10000 },
  { project_id: 'P-005', category: 'Technology', amount: 4000 },
];