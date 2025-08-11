#!/bin/bash

# Simple development server restart script
# Quick solution for port conflicts and cache cleanup

PORT=3000

echo "🔄 Restarting development server on port $PORT..."

# 1. Stop process using port 3000
echo "📡 Checking port $PORT..."
PID=$(lsof -ti:$PORT)
if [ ! -z "$PID" ]; then
    echo "🛑 Stopping process $PID on port $PORT"
    kill -9 $PID
    sleep 2
    # Check if process was actually stopped
    PID=$(lsof -ti:$PORT)
    if [ ! -z "$PID" ]; then
        echo "⚠️  Process still running, trying again..."
        kill -9 $PID
        sleep 1
    fi
    echo "✅ Port $PORT cleared"
else
    echo "✅ Port $PORT is not in use"
fi

# 2. Clean Next.js cache
echo "🧹 Cleaning cache..."
if [ -d ".next" ]; then
	rm -rf ".next" \
       ".next/cache" \
       ".turbo" \
       "node_modules/.cache" \
       ".vercel/output" \
       ".vercel/cache" || true
    echo "✅ .next cache cleared"
else
    echo "✅ No cache to clean"
fi

# 3. Start development server on port 3000
echo "🚀 Starting development server on port $PORT..."
echo "================================================"
PORT=$PORT npm run dev
