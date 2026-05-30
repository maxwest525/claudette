#!/bin/bash
set -euo pipefail

# Only run in remote Claude Code on the web environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Install lovable-operating-system dependencies
if [ -f "lovable-operating-system/package.json" ]; then
  echo "Installing lovable-operating-system dependencies..."
  npm install --prefix lovable-operating-system
fi

# Install command-center dependencies (if package-lock.json exists)
if [ -f "command-center/package.json" ]; then
  echo "Installing command-center dependencies..."
  npm install --prefix command-center
fi

echo "Dependencies installed successfully."
