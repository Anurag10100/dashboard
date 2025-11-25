# 🚀 Quick Start: Google Sheets Integration

## ⏱️ Setup Time: 10 Minutes

### **Step 1: Create Your Google Sheet (5 min)**

1. **Copy this template:**
   https://docs.google.com/spreadsheets/d/1bFXDH1-Ox3h2Bv9FNQz5lA2R8IKuO9c3sT6vW4xY0zE/copy

   OR create manually with 5 tabs: `Projects`, `Sponsors`, `Delegates`, `Marketing`, `Expenses`

2. **Add your data** (see GOOGLE_SHEETS_TEMPLATE.md for column format)

3. **Make it public:**
   - Click **Share** → **Change to anyone with the link**
   - Set to **Viewer** (read-only!)
   - Copy the link

4. **Extract the Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[THIS-IS-YOUR-ID]/edit
   ```

---

### **Step 2: Configure Vercel (2 min)**

1. Go to **Vercel Dashboard** → Your Project → Settings → Environment Variables

2. Add new variable:
   - **Name:** `VITE_GOOGLE_SHEETS_ID`
   - **Value:** Your spreadsheet ID (from step 1)
   - Click **Save**

3. **Redeploy:**
   - Go to Deployments → Click "Redeploy"
   - Wait 1-2 minutes

---

### **Step 3: Test (1 min)**

1. Open your dashboard URL
2. You should see: **"📊 Data from Google Sheets"** in the header
3. Your data should appear!

---

## 🎉 You're Done!

**Next Steps:**
- Update your Google Sheet → Refresh dashboard → See changes!
- Enable Live Mode → Auto-refreshes every 5 minutes
- Train your team on updating the sheet

---

## 🔧 Troubleshooting

**Problem:** Dashboard still shows "Demo Mode (Mock Data)"

**Solutions:**
- Verify `VITE_GOOGLE_SHEETS_ID` is set in Vercel
- Redeploy the app
- Check browser console (F12) for errors

**Problem:** Data not loading

**Solutions:**
- Make sure your Google Sheet is public (Viewer access)
- Verify tab names match exactly: `Projects`, `Sponsors`, `Delegates`, `Marketing`, `Expenses`
- Check column headers match the template

---

## 📞 Need Help?

Check the detailed guide: `GOOGLE_SHEETS_TEMPLATE.md`
