# Food Tracker

A Next.js application for tracking food consumption and macro nutrients with AI-powered food analysis.

## Features

- Multi-user macro tracking
- AI-powered food analysis using OpenAI
- House-based inventory system
- Leaderboard
- Progressive Web App (PWA) support
- SQLite database

## Quick Start

### Development

**Standard development:**
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Development with ngrok (for webhooks/mobile testing):**

If you need to test with external services that require public URLs:
```bash
./start-server.sh
```

This script runs the dev server with ngrok tunneling. **Note:** This is only for local development and is NOT used in production.

### Production Deployment

Deploy to your DigitalOcean server with automated GitHub Actions:

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete instructions.

**Key points:**
- Production runs directly on your server's public IP (no ngrok needed)
- Automated deployment via GitHub Actions when you push to main
- Access at `http://YOUR_SERVER_IP:3000`

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

## Tech Stack

- Next.js 15
- React 19
- Prisma ORM
- SQLite
- OpenAI API
- TailwindCSS
- TypeScript 
