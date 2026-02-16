#!/bin/bash

#######################################
# OppForge Multi-Repo Push Script
#######################################
# Pushes code to:
# 1. Main monorepo: github.com/ayomisco/oppforge
# 2. Individual repos for each component
#######################################

set -e  # Exit on error

MAIN_REPO="git@github.com:Ayomisco/oppforge.git"
WEBSITE_REPO="git@github.com:oppforge/oppforge-website.git"
PLATFORM_REPO="git@github.com:oppforge/oppforge-platform.git"
CONTRACTS_REPO="git@github.com:oppforge/smart-contracts.git"
BACKEND_REPO="git@github.com:oppforge/oppforge-backend.git"
AI_ENGINE_REPO="git@github.com:oppforge/ai-engine.git"

echo "🚀 OppForge Multi-Repo Deployment"
echo "=================================="
echo ""

# Get commit message from user
if [ -z "$1" ]; then
    echo "Usage: ./deploy.sh \"Your commit message\""
    echo ""
    read -p "Enter commit message: " COMMIT_MSG
else
    COMMIT_MSG="$1"
fi

if [ -z "$COMMIT_MSG" ]; then
    echo "❌ Error: Commit message required"
    exit 1
fi

echo "📝 Commit message: $COMMIT_MSG"
echo ""

# Navigate to repo root
cd "$(dirname "$0")"

#######################################
# STEP 1: Commit to Main Monorepo
#######################################
echo "📦 Step 1: Committing to main monorepo..."

# Add all changes
git add .

# Commit
git commit -m "$COMMIT_MSG" || echo "Nothing to commit"

# Push to main repo
echo "⬆️  Pushing to main repo: ayomisco/oppforge..."
git push origin main

echo "✅ Main monorepo updated!"
echo ""

#######################################
# STEP 2: Push Subdirectories to Individual Repos
#######################################

push_subtree() {
    local DIR=$1
    local REPO=$2
    local NAME=$3
    
    echo "📂 Step 2.$((STEP++)): Pushing $NAME..."
    
    # Check if directory exists
    if [ ! -d "$DIR" ]; then
        echo "⚠️  Warning: $DIR not found, skipping..."
        return
    fi
    
    # Use git subtree to push subdirectory to its own repo
    echo "   Extracting $DIR to $REPO..."
    
    # Add remote if it doesn't exist
    git remote | grep -q "$NAME-remote" || git remote add "$NAME-remote" "$REPO"
    
    # Push subtree
    git subtree push --prefix="$DIR" "$NAME-remote" main || {
        echo "⚠️  Subtree push failed. Trying force push..."
        # Alternative: Use subtree split and force push
        SPLIT_BRANCH=$(git subtree split --prefix="$DIR" -b temp-split-$NAME)
        git push "$NAME-remote" temp-split-$NAME:main --force
        git branch -D temp-split-$NAME
    }
    
    echo "✅ $NAME updated!"
    echo ""
}

STEP=1

# Push each subdirectory
push_subtree "website" "$WEBSITE_REPO" "website"
push_subtree "platform" "$PLATFORM_REPO" "platform"
push_subtree "contracts" "$CONTRACTS_REPO" "contracts"
push_subtree "backend" "$BACKEND_REPO" "backend"
push_subtree "ai-engine" "$AI_ENGINE_REPO" "ai-engine"

#######################################
# DONE
#######################################
echo "=================================="
echo "🎉 Deployment Complete!"
echo ""
echo "Repositories updated:"
echo "  ✅ Main: github.com/Ayomisco/oppforge"
echo "  ✅ Website: github.com/oppforge/oppforge-website"
echo "  ✅ Platform: github.com/oppforge/oppforge-platform"
echo "  ✅ Contracts: github.com/oppforge/smart-contracts"
echo "  ✅ Backend: github.com/oppforge/oppforge-backend"
echo "  ✅ AI Engine: github.com/oppforge/ai-engine"
echo ""
echo "🔗 View at: https://github.com/Ayomisco/oppforge"
