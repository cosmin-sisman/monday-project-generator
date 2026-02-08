#!/bin/bash

# Copy Supabase schema to clipboard
cat supabase/schema.sql | pbcopy

echo "✅ SQL schema copied to clipboard!"
echo ""
echo "📋 Next steps:"
echo "1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/viqhvdnvwekujkmypimx"
echo "2. Open SQL Editor"
echo "3. Paste the SQL (Cmd+V)"
echo "4. Click 'Run'"
echo ""
echo "✨ This will create all tables needed for the app!"
