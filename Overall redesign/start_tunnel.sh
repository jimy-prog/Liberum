#!/bin/bash
# ═══════════════════════════════════════════════════════
#  Liberum — Start with Cloudflare Tunnel
#  Run this instead of "python3 main.py" when you want
#  phone/outside access.
# ═══════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "🚀 Starting Liberum..."
echo ""

# Check if cloudflared is installed locally or globally
if [ -f "$SCRIPT_DIR/bin/cloudflared" ]; then
    CLOUDFLARED="$SCRIPT_DIR/bin/cloudflared"
elif command -v cloudflared &> /dev/null; then
    CLOUDFLARED="cloudflared"
else
    echo "❌ cloudflared not found. Please install it first!"
    exit 1
fi

# Start the app in background
python3 main.py &
APP_PID=$!
echo "✅ App started (PID $APP_PID)"
sleep 2

# Start tunnel
echo ""
echo "🌐 Starting Cloudflare Tunnel..."
echo "   Your public URL will appear below — open it on your iPhone!"
echo ""
$CLOUDFLARED tunnel --url http://localhost:8000 &
TUNNEL_PID=$!

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  App is running!"
echo "  Local:  http://localhost:8000"
echo "  Phone:  See the trycloudflare.com URL above ↑"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Set SESSION_SECRET_KEY and DEFAULT_ADMIN_PASSWORD for production use"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Press Ctrl+C to stop everything"
echo ""

# Wait and clean up on exit
trap "kill $APP_PID $TUNNEL_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait $TUNNEL_PID
