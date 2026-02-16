#!/bin/bash

#######################################
# OppForge Initial Repository Setup
#######################################
# Sets up individual git repos for each subdirectory
# Run this ONCE to initialize all repos
#######################################

set -e

echo "🔧 OppForge Repository Setup"
echo "============================="
echo ""
echo "This script will initialize individual git repositories for:"
echo "  - website/"
echo "  - platform/"
echo "  - contracts/"
echo "  - backend/"
echo "  - ai-engine/"
echo ""
read -p "Continue? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

cd "$(dirname "$0")"

#######################################
# Initialize Individual Repos
#######################################

setup_repo() {
    local DIR=$1
    local REPO=$2
    local NAME=$3
    
    echo ""
    echo "📂 Setting up: $NAME"
    echo "----------------------------"
    
    if [ ! -d "$DIR" ]; then
        echo "⚠️  Warning: $DIR not found, skipping..."
        return
    fi
    
    cd "$DIR"
    
    # Initialize git if not already
    if [ ! -d ".git" ]; then
        echo "   Initializing git..."
        git init
        git add .
        git commit -m "Initial commit from monorepo"
    fi
    
    # Set main branch
    git branch -M main
    
    # Add remote
    echo "   Adding remote: $REPO"
    git remote | grep -q "origin" && git remote remove origin
    git remote add origin "$REPO"
    
    # Initial push
    echo "   Pushing to $REPO..."
    git push -u origin main --force
    
    echo "✅ $NAME repository initialized!"
    
    cd ..
}

# Setup each subdirectory
setup_repo "website" "git@github.com:oppforge/oppforge-website.git" "Website"
setup_repo "platform" "git@github.com:oppforge/oppforge-platform.git" "Platform"
setup_repo "contracts" "git@github.com:oppforge/smart-contracts.git" "Smart Contracts"
setup_repo "backend" "git@github.com:oppforge/oppforge-backend.git" "Backend"
setup_repo "ai-engine" "git@github.com:oppforge/ai-engine.git" "AI Engine"

echo ""
echo "=================================="
echo "🎉 All repositories initialized!"
echo ""
echo "⚠️  IMPORTANT:"
echo "   These subdirectories now have their own .git directories."
echo "   To deploy changes, use: ./deploy.sh \"commit message\""
echo ""
echo "   The deploy script will:"
echo "   1. Commit to main monorepo"
echo "   2. Push subdirectories to their individual repos"
echo ""
