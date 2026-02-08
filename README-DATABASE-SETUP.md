# Database Setup Guide

## 🎯 Recommended Method: Use the Setup UI

The easiest way to setup your database is through the web interface:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Visit the setup page:**
   ```
   http://localhost:3000/setup
   ```

3. **Click "Check Database Status"** → **"Create Missing Tables"**

---

## 🔧 Why Terminal Connection Fails

Your local environment cannot connect directly to Supabase PostgreSQL because:

- **Supabase uses IPv6 only** for direct database connections
- **Your router/ISP doesn't support IPv6**
- **Browser works** because it uses Supabase REST API (which has IPv4)

**DNS Check Results:**
```bash
# Your local DNS (192.168.1.1) - Cannot resolve
❌ db.viqhvdnvwekujkmypimx.supabase.co → No answer

# Cloudflare DNS (1.1.1.1) - Can resolve
✅ db.viqhvdnvwekujkmypimx.supabase.co → 2a05:d018:135e:169c:d5b3:81cc:4fef:d03 (IPv6)

# Connection Test
❌ Direct PostgreSQL connection → EHOSTUNREACH (IPv6 not supported)
✅ REST API (browser) → Works perfectly
```

---

## 🛠️ Alternative Setup Methods

### Method 1: Supabase Dashboard (Manual - Always Works)

1. **Open SQL Editor:**
   ```
   https://supabase.com/dashboard/project/viqhvdnvwekujkmypimx/sql/new
   ```

2. **Copy SQL schema:**
   ```bash
   cat supabase/schema.sql | pbcopy
   ```

3. **Paste and Run** in SQL Editor

### Method 2: Enable IPv6 (Advanced)

If you want terminal connections to work:

1. **Check IPv6 support:**
   ```bash
   ping6 google.com
   ```

2. **Enable IPv6 on your router/ISP**
   - Contact your ISP
   - Configure router to allow IPv6

3. **Use Cloudflare WARP** (VPN with IPv6 support):
   ```bash
   brew install --cask cloudflare-warp
   ```

### Method 3: Use Supabase Transaction Pooler

Try the pooler connection (might have IPv4):

```bash
# Update DATABASE_URL in .env.local
DATABASE_URL=postgresql://postgres.viqhvdnvwekujkmypimx:mk6th3zJXjHObS2U@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## 📋 What Tables Are Created

The setup creates these tables:

1. **projects** - AI-generated project plans
2. **project_groups** - Project phases/groups
3. **project_tasks** - Individual tasks
4. **project_versions** - Backup/undo functionality
5. **ai_conversations** - Persistent chat history

---

## ✅ Verify Setup

Check if tables exist:

```bash
# Via browser
http://localhost:3000/api/setup-db

# Or visit setup UI
http://localhost:3000/setup
```

---

## 🎉 Conclusion

**The web-based setup UI is the recommended approach** because:
- ✅ Works regardless of DNS/IPv6 issues
- ✅ Visual feedback for each step
- ✅ Automatic verification
- ✅ No system configuration needed

**For production/Vercel deployments**, all these issues disappear because cloud infrastructure properly supports IPv6!
