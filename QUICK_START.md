# 🚀 Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL 15+ installed and running
- (Optional) Redis for caching

## Step 1: Database Setup

```bash
# Create PostgreSQL database
createdb typorace

# Or using psql:
psql -U postgres
CREATE DATABASE typorace;
\q
```

## Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=typorace
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EOF

# Start backend server
npm run start:dev
```

Backend will run on `http://localhost:3001`

## Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
EOF

# Start frontend server
npm run dev
```

Frontend will run on `http://localhost:3000`

## Step 4: Test the Application

1. Open `http://localhost:3000` in your browser
2. Register a new account
3. Login
4. Click "Race" to start matchmaking
5. Wait for other players (or open multiple browser windows)
6. Start typing when the race begins!

## Using Docker (Alternative)

If you prefer Docker:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `pg_isready`
- Verify database credentials in `.env`
- Check port 3001 is not in use

### Frontend won't connect
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check backend is running on port 3001
- Check browser console for errors

### WebSocket connection fails
- Verify CORS settings in backend
- Check `FRONTEND_URL` in backend `.env`
- Ensure Socket.io is properly configured

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check API endpoints in README
- Explore WebSocket events documentation
- Customize the game text in `backend/src/rooms/rooms.service.ts`

Happy Racing! 🏁
