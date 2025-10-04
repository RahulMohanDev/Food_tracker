#!/bin/bash

# Port configuration
PORT=3002

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}  Food Tracker Server Startup${NC}"
echo -e "${BLUE}==================================${NC}"
echo ""

# Kill any existing processes on the port
echo -e "${YELLOW}Checking for existing processes on port ${PORT}...${NC}"
lsof -ti:${PORT} | xargs kill -9 2>/dev/null || true
sleep 1

# Start the Next.js dev server in the background
echo -e "${GREEN}Starting Next.js dev server on port ${PORT}...${NC}"
PORT=${PORT} npm run dev &
DEV_SERVER_PID=$!

# Wait for the dev server to be ready
echo -e "${YELLOW}Waiting for dev server to start...${NC}"
sleep 5

# Check if dev server is running
if ! lsof -ti:${PORT} > /dev/null; then
    echo -e "${YELLOW}Dev server not ready yet, waiting a bit more...${NC}"
    sleep 5
fi

# Start ngrok
echo -e "${GREEN}Starting ngrok tunnel to port ${PORT}...${NC}"
npx ngrok http ${PORT} &
NGROK_PID=$!

echo ""
echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}  Servers Started Successfully!${NC}"
echo -e "${GREEN}==================================${NC}"
echo ""
echo -e "${BLUE}Local:${NC}        http://localhost:${PORT}"
echo -e "${BLUE}Network:${NC}      http://$(ipconfig getifaddr en0 2>/dev/null || hostname -I | awk '{print $1}'):${PORT}"
echo -e "${BLUE}Ngrok:${NC}        Check ngrok dashboard at http://127.0.0.1:4040"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    kill $DEV_SERVER_PID 2>/dev/null
    kill $NGROK_PID 2>/dev/null
    lsof -ti:${PORT} | xargs kill -9 2>/dev/null || true
    pkill -f "ngrok" 2>/dev/null || true
    echo -e "${GREEN}All servers stopped.${NC}"
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT TERM

# Wait indefinitely
wait
