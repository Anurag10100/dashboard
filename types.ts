// Source A: MASTER_PROJECTS
export interface Project {
  project_id: string;
  project_name: string;
  date: string; // YYYY-MM-DD
  status: 'On Track' | 'Critical' | 'Completed';
  revenue_target: number;
  revenue_actual: number; // Calculated/Mocked
  speaker_target: number;
  speaker_actual: number;
  // Budget & P&L
  budget_total?: number; // Total budget allocated
  expenses_actual?: number; // Actual expenses incurred
}

// Budget Breakdown by Category
export interface ExpenseCategory {
  project_id: string;
  category: 'Venue' | 'Catering' | 'Marketing' | 'Speaker Fees' | 'Technology' | 'Staff' | 'Other';
  amount: number;
  description?: string;
}

// Source B: DELEGATES_DATA
export interface DelegateLog {
  date_logged: string;
  project_id: string;
  category: 'Government' | 'Industry' | 'Student';
  count: number;
}

// Source C: SPONSORS_PIPELINE
export enum SponsorStage {
  LEAD = 'Lead',
  PROPOSAL = 'Proposal',
  CONTRACT_SENT = 'Contract Sent',
  SIGNED = 'Signed',
}

export interface Sponsor {
  sponsor_name: string;
  project_id: string;
  stage: SponsorStage;
  value: number;
}

// New: Marketing & Analytics Data
export interface Campaign {
  id: string;
  name: string;
  type: 'Email' | 'Social' | 'Ad';
  status: 'Sent' | 'Scheduled' | 'Draft' | 'Active';
  metric: string; // e.g. "25% Open Rate" or "5k Impressions"
  date: string;
}

export interface MarketingData {
  project_id: string;
  emails_sent: number;
  email_open_rate: number; // 0-1
  social_posts_count: number;
  social_impressions: number;
  ad_spend: number;
  ad_clicks: number;
  website_visits: number;
  recent_campaigns: Campaign[];
}

// Filter State
export interface DashboardFilters {
  projectName: string | 'All';
  dateStart: string;
  dateEnd: string;
  status: string | 'All';
}

// Gemini Insight
export interface AiInsight {
  summary: string;
  risk: string;
  recommendation: string;
}