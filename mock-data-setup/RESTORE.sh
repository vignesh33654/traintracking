#!/bin/bash

echo "🔄 Restoring Original API Routes"
echo "================================="
echo ""

# Check if we're in the right directory
if [ ! -d "app/api/train" ]; then
    echo "❌ Error: Please run this script from the root of your project"
    exit 1
fi

echo "📦 Restoring backed up routes..."

if [ -f "app/api/train/route.ts.backup" ]; then
    mv app/api/train/route.ts.backup app/api/train/route.ts
    echo "✅ Restored app/api/train/route.ts"
else
    echo "⚠️  No backup found for train route"
fi

if [ -f "app/api/search/trains/route.ts.backup" ]; then
    mv app/api/search/trains/route.ts.backup app/api/search/trains/route.ts
    echo "✅ Restored app/api/search/trains/route.ts"
else
    echo "⚠️  No backup found for search route"
fi

echo ""
echo "🧹 Cleaning up mock data files..."
rm -f app/api/train/mock-train-data.json
rm -f app/api/search/trains/mock-search-data.json
echo "✅ Mock data files removed"

echo ""
echo "✨ Restoration complete!"
echo ""
echo "Your app will now use the real API again."
echo "Remember to set your RAIL_RADAR_API_KEY in .env.local"
echo ""
