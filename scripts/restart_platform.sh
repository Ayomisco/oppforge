#!/bin/bash
# Re-install dependencies and fix any potential issues in platform
echo "📦 Installing Platform Dependencies..."
cd platform
npm install

echo "🧹 Clearing Next.js Cache..."
rm -rf .next

echo "🚀 Starting Dev Server..."
npm run dev
