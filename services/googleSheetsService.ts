import { Project, Sponsor, DelegateLog, MarketingData, ExpenseCategory, SponsorStage } from '../types';

const SHEETS_API_KEY = 'AIzaSyBFsR9NsNe5dLLzDqHhKqxZxLhVQVHxkqw'; // Public read-only API key
const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID;

interface SheetResponse {
  values?: string[][];
}

/**
 * Fetch data from a specific sheet tab
 */
const fetchSheetData = async (sheetName: string): Promise<string[][]> => {
  if (!SPREADSHEET_ID) {
    console.warn('VITE_GOOGLE_SHEETS_ID not set, using mock data');
    return [];
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}?key=${SHEETS_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${sheetName}: ${response.statusText}`);
    }

    const data: SheetResponse = await response.json();
    return data.values || [];
  } catch (error) {
    console.error(`Error fetching ${sheetName}:`, error);
    throw error;
  }
};

/**
 * Parse Projects sheet
 */
export const fetchProjects = async (): Promise<Project[]> => {
  const data = await fetchSheetData('Projects');
  if (data.length <= 1) return []; // No data or only header

  const [_headers, ...rows] = data;

  return rows.map(row => ({
    project_id: row[0] || '',
    project_name: row[1] || '',
    date: row[2] || '',
    status: (row[3] || 'On Track') as Project['status'],
    revenue_target: parseFloat(row[4]) || 0,
    revenue_actual: parseFloat(row[5]) || 0,
    speaker_target: parseInt(row[6]) || 0,
    speaker_actual: parseInt(row[7]) || 0,
    budget_total: parseFloat(row[8]) || undefined,
    expenses_actual: parseFloat(row[9]) || undefined,
  }));
};

/**
 * Parse Sponsors sheet
 */
export const fetchSponsors = async (): Promise<Sponsor[]> => {
  const data = await fetchSheetData('Sponsors');
  if (data.length <= 1) return [];

  const [_headers, ...rows] = data;

  return rows.map(row => ({
    sponsor_name: row[0] || '',
    project_id: row[1] || '',
    stage: (row[2] || 'Lead') as SponsorStage,
    value: parseFloat(row[3]) || 0,
  }));
};

/**
 * Parse Delegates sheet
 */
export const fetchDelegates = async (): Promise<DelegateLog[]> => {
  const data = await fetchSheetData('Delegates');
  if (data.length <= 1) return [];

  const [_headers, ...rows] = data;

  return rows.map(row => ({
    date_logged: row[0] || '',
    project_id: row[1] || '',
    category: (row[2] || 'Industry') as DelegateLog['category'],
    count: parseInt(row[3]) || 0,
  }));
};

/**
 * Parse Marketing sheet
 */
export const fetchMarketingData = async (): Promise<MarketingData[]> => {
  const data = await fetchSheetData('Marketing');
  if (data.length <= 1) return [];

  const [_headers, ...rows] = data;

  return rows.map(row => ({
    project_id: row[0] || '',
    emails_sent: parseInt(row[1]) || 0,
    email_open_rate: parseFloat(row[2]) || 0,
    social_posts_count: parseInt(row[3]) || 0,
    social_impressions: parseInt(row[4]) || 0,
    ad_spend: parseFloat(row[5]) || 0,
    ad_clicks: parseInt(row[6]) || 0,
    website_visits: parseInt(row[7]) || 0,
    recent_campaigns: [], // Campaigns are not in sheet for simplicity
  }));
};

/**
 * Parse Expenses sheet
 */
export const fetchExpenses = async (): Promise<ExpenseCategory[]> => {
  const data = await fetchSheetData('Expenses');
  if (data.length <= 1) return [];

  const [_headers, ...rows] = data;

  return rows.map(row => ({
    project_id: row[0] || '',
    category: (row[1] || 'Other') as ExpenseCategory['category'],
    amount: parseFloat(row[2]) || 0,
    description: row[3] || undefined,
  }));
};

/**
 * Fetch all dashboard data from Google Sheets
 */
export const fetchAllData = async () => {
  try {
    const [projects, sponsors, delegates, marketingData, expenses] = await Promise.all([
      fetchProjects(),
      fetchSponsors(),
      fetchDelegates(),
      fetchMarketingData(),
      fetchExpenses(),
    ]);

    return {
      projects,
      sponsors,
      delegates,
      marketingData,
      expenses,
      success: true,
    };
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    return {
      projects: [],
      sponsors: [],
      delegates: [],
      marketingData: [],
      expenses: [],
      success: false,
      error,
    };
  }
};

/**
 * Check if Google Sheets integration is configured
 */
export const isSheetsConfigured = (): boolean => {
  return !!SPREADSHEET_ID;
};
