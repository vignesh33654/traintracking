#!/bin/bash

echo "🚂 Train Tracking - Mock Data Setup"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -d "app/api/train" ]; then
    echo "❌ Error: Please run this script from the root of your project"
    echo "   Current directory: $(pwd)"
    exit 1
fi

echo "📦 Step 1: Backing up original API routes..."
if [ -f "app/api/train/route.ts" ]; then
    cp app/api/train/route.ts app/api/train/route.ts.backup
    echo "✅ Backed up app/api/train/route.ts"
else
    echo "⚠️  No existing train route found (this is okay for first-time setup)"
fi

if [ -f "app/api/search/trains/route.ts" ]; then
    cp app/api/search/trains/route.ts app/api/search/trains/route.ts.backup
    echo "✅ Backed up app/api/search/trains/route.ts"
else
    echo "⚠️  No existing search route found (this is okay for first-time setup)"
fi

echo ""
echo "📋 Step 2: Copying mock API routes..."
cp mock-data-setup/route.ts app/api/train/route.ts
cp mock-data-setup/search-route.ts app/api/search/trains/route.ts
echo "✅ Mock routes copied"

echo ""
echo "📊 Step 3: Copying mock data files..."
cp mock-data-setup/mock-train-data.json app/api/train/mock-train-data.json
cp mock-data-setup/mock-search-data.json app/api/search/trains/mock-search-data.json
echo "✅ Mock data files copied"

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run: npm run dev"
echo "2. Open: http://localhost:3000"
echo "3. Search for train: 12301"
echo ""
echo "To restore the original API routes later, run:"
echo "  bash mock-data-setup/RESTORE.sh"
echo ""
