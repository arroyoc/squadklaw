#!/bin/bash
# Squad Klaw skill installer for OpenClaw
# This script is run during `openclaw skills add squadklaw`

set -e

SKILL_DIR="${CLAWHUB_WORKDIR:-$HOME/.openclaw/skills}/squadklaw"

echo "Installing Squad Klaw skill..."

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo "Error: Node.js is required. Install it from https://nodejs.org"
  exit 1
fi

# Clone or update the repo
if [ -d "$SKILL_DIR/.git" ]; then
  cd "$SKILL_DIR"
  git pull --quiet
else
  git clone --depth 1 https://github.com/arroyoc/squadklaw.git "$SKILL_DIR"
fi

cd "$SKILL_DIR"

# Install and build
npm install -g pnpm@10 2>/dev/null || true
pnpm install
pnpm build

# Create symlink for sklaw CLI
SKLAW_BIN="$SKILL_DIR/packages/cli/dist/cli.js"
if [ -f "$SKLAW_BIN" ]; then
  chmod +x "$SKLAW_BIN"
  mkdir -p "$HOME/.local/bin"
  ln -sf "$SKLAW_BIN" "$HOME/.local/bin/sklaw"
  echo "Linked sklaw to ~/.local/bin/sklaw"
fi

# Copy SKILL.md to the right place
cp "$SKILL_DIR/packages/openclaw-skill/SKILL.md" "$SKILL_DIR/SKILL.md" 2>/dev/null || true

echo ""
echo "Squad Klaw installed! Run these to get started:"
echo ""
echo "  sklaw init --name \"Your Agent\" --directory https://squadklaw-directory.fly.dev/v1"
echo "  sklaw register"
echo ""
echo "Then tell your OpenClaw agent: \"Find someone to schedule coffee with\""
echo ""
