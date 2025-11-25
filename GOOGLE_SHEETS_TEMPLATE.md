# Google Sheets Integration Setup Guide

## 📊 Step 1: Create Your Google Sheets Dashboard

### **Template Structure**

Create a new Google Sheet with **5 tabs** (sheets):

---

### **Tab 1: Projects**

| project_id | project_name | date | status | revenue_target | revenue_actual | speaker_target | speaker_actual | budget_total | expenses_actual |
|------------|--------------|------|--------|----------------|----------------|----------------|----------------|--------------|-----------------|
| P-001 | World Edu Summit | 2024-12-12 | On Track | 100000 | 75000 | 50 | 45 | 85000 | 62000 |
| P-002 | Future Tech Expo | 2024-11-20 | Critical | 250000 | 120000 | 100 | 40 | 200000 | 145000 |

**Column Requirements:**
- `project_id`: Unique ID (e.g., P-001, P-002)
- `project_name`: Event name
- `date`: YYYY-MM-DD format
- `status`: Must be "On Track", "Critical", or "Completed"
- All numbers should be integers (no dollar signs or commas)

---

### **Tab 2: Sponsors**

| sponsor_name | project_id | stage | value |
|--------------|------------|-------|-------|
| TechCorp | P-001 | Signed | 50000 |
| EduSystems | P-001 | Proposal | 20000 |

**Column Requirements:**
- `sponsor_name`: Company name
- `project_id`: Must match a project_id from Projects tab
- `stage`: Must be "Lead", "Proposal", "Contract Sent", or "Signed"
- `value`: Sponsorship amount (integer)

---

### **Tab 3: Delegates**

| date_logged | project_id | category | count |
|-------------|------------|----------|-------|
| 2024-11-20 | P-001 | Government | 15 |
| 2024-11-21 | P-001 | Industry | 25 |

**Column Requirements:**
- `date_logged`: YYYY-MM-DD format
- `project_id`: Must match a project_id from Projects tab
- `category`: Must be "Government", "Industry", or "Student"
- `count`: Number of delegates

---

### **Tab 4: Marketing**

| project_id | emails_sent | email_open_rate | social_posts_count | social_impressions | ad_spend | ad_clicks | website_visits |
|------------|-------------|-----------------|--------------------|--------------------|----------|-----------|----------------|
| P-001 | 5000 | 0.28 | 25 | 12000 | 2500 | 350 | 8000 |

**Column Requirements:**
- `project_id`: Must match a project_id from Projects tab
- `email_open_rate`: Decimal between 0 and 1 (e.g., 0.28 = 28%)
- All other numbers are integers

---

### **Tab 5: Expenses**

| project_id | category | amount | description |
|------------|----------|--------|-------------|
| P-001 | Venue | 25000 | Convention Center rental |
| P-001 | Catering | 15000 | Food & beverages |

**Column Requirements:**
- `project_id`: Must match a project_id from Projects tab
- `category`: Must be "Venue", "Catering", "Marketing", "Speaker Fees", "Technology", "Staff", or "Other"
- `amount`: Integer
- `description`: Optional text

---

## 🔗 Step 2: Share Your Google Sheet

### **Make Sheet Public (Read-Only)**

1. Open your Google Sheet
2. Click **Share** (top right)
3. Click **Change to anyone with the link**
4. Set permission to **Viewer** (not Editor!)
5. Click **Copy link**

Your link will look like:
```
https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit#gid=0
```

### **Extract Spreadsheet ID**

From the link above, copy the ID between `/d/` and `/edit`:
```
1a2b3c4d5e6f7g8h9i0j
```

---

## ⚙️ Step 3: Configure Dashboard

### **Update Vercel Environment Variables**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add a new variable:
   - **Name:** `VITE_GOOGLE_SHEETS_ID`
   - **Value:** Your spreadsheet ID (from step 2)
   - **Environments:** Production, Preview, Development
3. Click **Save**

### **Local Development**

Create a `.env.local` file in your project root:

```bash
VITE_GOOGLE_SHEETS_ID=1a2b3c4d5e6f7g8h9i0j
API_KEY=your-gemini-api-key
```

---

## 🚀 Step 4: Deploy

After adding the environment variable to Vercel:

1. Trigger a new deployment (or it will auto-deploy on next commit)
2. Dashboard will now load data from your Google Sheet!
3. Updates to the sheet appear within 5 minutes (or on page refresh)

---

## 📝 Step 5: Update Your Data

### **To Add a New Project:**

1. Open your Google Sheet
2. Go to **Projects** tab
3. Add a new row with all required fields
4. Refresh your dashboard (or wait up to 5 min for auto-refresh)

### **To Update Delegate Counts:**

1. Go to **Delegates** tab
2. Add a new row with today's date and new count
3. Dashboard will automatically aggregate the totals

### **To Move a Sponsor Through Pipeline:**

1. Go to **Sponsors** tab
2. Find the sponsor row
3. Change the `stage` column (e.g., "Lead" → "Proposal" → "Signed")
4. Revenue calculations update automatically

---

## 🎯 Best Practices

### **Data Entry Tips:**

✅ **DO:**
- Always use the exact status values ("On Track", "Critical", "Completed")
- Use YYYY-MM-DD format for dates
- Keep project_id consistent across all tabs
- Use integers for all numbers (no decimals except email_open_rate)

❌ **DON'T:**
- Don't add dollar signs ($) or commas (,) to numbers
- Don't use custom status values
- Don't delete the header row
- Don't rename the sheet tabs

### **Team Collaboration:**

- Share sheet with team members (Viewer or Editor access)
- Use **Google Sheets comments** to discuss changes
- Set up **version history** to track changes (File → Version History)
- Create a **template row** at the bottom for easy copying

---

## 🔄 Auto-Refresh (Optional Enhancement)

Currently, dashboard fetches data on page load. To enable auto-refresh:

### **Option 1: Manual Refresh**
Click the browser refresh button to get latest data

### **Option 2: Auto-Refresh Every 5 Minutes**
The dashboard will automatically re-fetch data every 5 minutes if you enable live mode

### **Option 3: Real-Time Sync**
For instant updates, consider upgrading to Supabase (see DATABASE_SETUP.md)

---

## 🛠️ Troubleshooting

### **Dashboard shows "Loading..." forever**

- Check that your Google Sheet is public (anyone with link can view)
- Verify the spreadsheet ID is correct in Vercel environment variables
- Make sure all tab names match exactly: "Projects", "Sponsors", "Delegates", "Marketing", "Expenses"

### **Data looks wrong or incomplete**

- Check column headers match exactly (case-sensitive)
- Verify no extra spaces in header names
- Make sure dates are in YYYY-MM-DD format
- Check that project_ids match across tabs

### **Some projects missing**

- Verify project_id is unique in Projects tab
- Check for typos in project_id references in other tabs
- Make sure status column has valid values

---

## 📞 Need Help?

If you run into issues:
1. Check the browser console (F12) for error messages
2. Verify your sheet structure matches the template exactly
3. Test with the sample data first before adding your own

---

## 🎉 You're All Set!

Your team can now update the Google Sheet and see changes reflected in the dashboard. No coding required!

**Next Steps:**
1. Populate your sheet with real data
2. Train team members on how to update
3. Set up regular review cycles to keep data current
