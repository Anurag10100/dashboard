# Database Integration Guide for Event Horizon Analytics

## Option 1: Supabase (Recommended) ⭐

### Why Supabase?
- ✅ Free tier (up to 500MB database)
- ✅ Built-in authentication & row-level security
- ✅ Real-time subscriptions (auto-update dashboard)
- ✅ Auto-generated REST API
- ✅ Easy team permissions management
- ✅ Built-in admin panel for data entry

### Setup Steps (15 minutes)

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create free account
   - Click "New Project"
   - Note your API URL and anon key

2. **Create Database Tables**

```sql
-- Projects table
CREATE TABLE projects (
  project_id TEXT PRIMARY KEY,
  project_name TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('On Track', 'Critical', 'Completed')),
  revenue_target DECIMAL(10, 2),
  revenue_actual DECIMAL(10, 2),
  speaker_target INTEGER,
  speaker_actual INTEGER,
  budget_total DECIMAL(10, 2),
  expenses_actual DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sponsors table
CREATE TABLE sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_name TEXT NOT NULL,
  project_id TEXT REFERENCES projects(project_id) ON DELETE CASCADE,
  stage TEXT CHECK (stage IN ('Lead', 'Proposal', 'Contract Sent', 'Signed')),
  value DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Delegates table
CREATE TABLE delegates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_logged DATE NOT NULL,
  project_id TEXT REFERENCES projects(project_id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('Government', 'Industry', 'Student')),
  count INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Marketing data table
CREATE TABLE marketing_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT REFERENCES projects(project_id) ON DELETE CASCADE,
  emails_sent INTEGER,
  email_open_rate DECIMAL(5, 4),
  social_posts_count INTEGER,
  social_impressions INTEGER,
  ad_spend DECIMAL(10, 2),
  ad_clicks INTEGER,
  website_visits INTEGER,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Expense categories table
CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT REFERENCES projects(project_id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('Venue', 'Catering', 'Marketing', 'Speaker Fees', 'Technology', 'Staff', 'Other')),
  amount DECIMAL(10, 2),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_sponsors_project ON sponsors(project_id);
CREATE INDEX idx_delegates_project ON delegates(project_id);
CREATE INDEX idx_marketing_project ON marketing_data(project_id);
CREATE INDEX idx_expenses_project ON expense_categories(project_id);
```

3. **Insert Sample Data** (optional)

```sql
-- Copy your existing mock data
INSERT INTO projects VALUES
  ('P-001', 'World Edu Summit', '2024-12-12', 'On Track', 100000, 75000, 50, 45, 85000, 62000, NOW(), NOW()),
  ('P-002', 'Future Tech Expo', '2024-11-20', 'Critical', 250000, 120000, 100, 40, 200000, 145000, NOW(), NOW());
-- ... add rest of projects
```

4. **Install Supabase Client**

```bash
npm install @supabase/supabase-js
```

5. **Update Your Dashboard Code**

Create `services/supabaseClient.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

Create `.env.local`:

```
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
API_KEY=your-gemini-api-key
```

Update `App.tsx` to fetch real data:

```typescript
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects from Supabase
  useEffect(() => {
    fetchProjects();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('projects_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' },
        payload => {
          console.log('Change detected:', payload);
          fetchProjects(); // Re-fetch data
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('date', { ascending: true });

    if (data) setProjects(data);
    if (error) console.error('Error fetching projects:', error);
    setLoading(false);
  };

  // Update project status
  const handleUpdateStatus = async (projectId: string, newStatus: Project['status']) => {
    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('project_id', projectId);

    if (!error) {
      setProjects(prev => prev.map(p =>
        p.project_id === projectId ? { ...p, status: newStatus } : p
      ));
    }
  };

  // Similar updates for sponsors, delegates, etc.
};
```

---

## Option 2: Firebase Firestore

### Why Firebase?
- ✅ Real-time sync out of the box
- ✅ Google authentication built-in
- ✅ Generous free tier
- ✅ Easy to scale

### Setup (Similar process)

```bash
npm install firebase
```

```typescript
// services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: "event-horizon-analytics",
  // ... other config
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

---

## Option 3: PostgreSQL + Custom Backend

### When to use:
- Need full control
- Complex business logic
- Existing infrastructure

### Stack:
- Database: PostgreSQL (Heroku, Railway, AWS RDS)
- API: Node.js + Express OR Next.js API routes
- ORM: Prisma or Drizzle

---

## 📊 Team Data Entry Options

### **Option A: Supabase Admin UI** (Easiest, No Code)

1. Give team members Supabase dashboard access
2. They can edit tables directly like a spreadsheet
3. Changes appear instantly on dashboard

**Pros:** Zero development time
**Cons:** Technical interface, not user-friendly for non-tech users

---

### **Option B: Build Admin Panel** (Recommended)

Create a separate admin view in your dashboard:

```typescript
// Add to App.tsx
const [isAdminMode, setIsAdminMode] = useState(false);

// Admin Panel Component
<AdminPanel
  projects={projects}
  onUpdateProject={handleUpdateProject}
  onAddDelegate={handleAddDelegate}
/>
```

Features:
- Forms for adding/editing projects
- Bulk CSV upload
- User-friendly interface
- Role-based access control

---

### **Option C: Google Sheets Integration** (Non-Technical Teams)

Use Google Sheets as input, sync to database:

```bash
npm install googleapis
```

Setup:
1. Team edits Google Sheet
2. Backend script runs every 5 minutes (cron job)
3. Syncs Sheet → Database → Dashboard updates

**Pros:** Team loves spreadsheets
**Cons:** Not real-time, requires backend service

---

### **Option D: Form-Based Entry**

Create simple forms using:
- Typeform → Webhook → Database
- Google Forms → Apps Script → API
- Airtable → Automations → Database

---

## 🔐 Authentication & Permissions

### Supabase Auth (Built-in)

```typescript
// services/auth.ts
import { supabase } from './supabaseClient';

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

// In App.tsx
const [user, setUser] = useState(null);

useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}, []);
```

### Row-Level Security (RLS) in Supabase

```sql
-- Only allow team members to update data
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team can read all projects"
  ON projects FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update projects"
  ON projects FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');
```

---

## 🚀 Deployment with Database

### Vercel + Supabase (Easiest)

1. **Add environment variables in Vercel:**
   - Settings → Environment Variables
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`
   - Add `API_KEY` (Gemini)

2. **Deploy:**
   ```bash
   git push origin main
   # Vercel auto-deploys
   ```

3. **Done!** Dashboard now uses real database

---

## 📱 Mobile App for Team Updates (Future)

If team needs mobile access:
- Use React Native with same Supabase backend
- Or build Progressive Web App (PWA)
- Or use Supabase auth + mobile-optimized web UI

---

## 💡 Quick Start Recommendation

**For elets, I recommend:**

1. **Week 1:** Supabase setup (15 mins)
2. **Week 1:** Connect dashboard to Supabase (2 hours)
3. **Week 2:** Build simple admin panel for data entry (4 hours)
4. **Week 2:** Add authentication (2 hours)
5. **Week 3:** Train team on admin panel

**Total time investment:** ~1 week of dev work
**Cost:** $0 (free tier supports 50,000 monthly active users)

---

## 🎯 Next Steps

1. Choose database option (I recommend Supabase)
2. I can help you:
   - Set up the Supabase schema
   - Convert dashboard to use real data
   - Build an admin panel for your team
   - Add authentication

Let me know which option you prefer and I'll build it out! 🚀
