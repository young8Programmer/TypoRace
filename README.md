# 🏁 TypoRace - Real-time Typing Speed Battle

Professional full-stack typing speed racing game where players compete in real-time typing battles. Built with NestJS, Next.js, WebSockets, and PostgreSQL.

## ✨ Features

### 🎮 Core Gameplay
- **Real-time Multiplayer Racing**: Compete with 2-3 players simultaneously
- **Live Progress Tracking**: See your and opponents' progress in real-time
- **WPM & Accuracy Calculation**: Automatic calculation of words per minute and typing accuracy
- **Matchmaking System**: Automatic room matching with countdown timer
- **Race Visualization**: Visual progress bars showing all players' positions

### 📊 Statistics & Leaderboards
- **Global Leaderboards**: Daily, Weekly, Monthly, and All-time rankings
- **User Profiles**: Track your best WPM, average WPM, total games, and wins
- **Game History**: View your past race results
- **Real-time Rankings**: See your position during races

### 💰 Monetization
- **Balance System**: Virtual currency for in-game purchases
- **Skins & Avatars**: Customize your racing experience
- **Premium Tournaments**: Join paid tournaments with prize pools
- **Tournament System**: Compete in organized competitions

### 🔐 Authentication & Security
- **JWT Authentication**: Secure user authentication
- **User Profiles**: Personal accounts with statistics
- **Anti-cheat Validation**: Server-side typing validation

## 🏗️ Architecture

### Backend (NestJS)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Real-time**: Socket.io for WebSocket connections
- **Cache**: Redis (optional, for room management)
- **Authentication**: JWT with Passport.js

### Frontend (Next.js)
- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Real-time**: Socket.io Client
- **UI Components**: Framer Motion for animations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- Redis (optional)
- Docker & Docker Compose (optional)

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd TypoRace

# Start all services
docker-compose up -d

# Backend will be available at http://localhost:3001
# Frontend will be available at http://localhost:3000
```

### Option 2: Manual Setup

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Update .env with your database credentials:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=postgres
# DB_DATABASE=typorace
# JWT_SECRET=your-secret-key
# FRONTEND_URL=http://localhost:3000

# Run migrations (if needed)
npm run migration:run

# Start development server
npm run start:dev
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
echo "NEXT_PUBLIC_WS_URL=http://localhost:3001" >> .env.local

# Start development server
npm run dev
```

## 📁 Project Structure

```
TypoRace/
├── backend/
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── rooms/          # Room & matchmaking logic
│   │   ├── games/          # Game logic & results
│   │   ├── leaderboard/   # Leaderboard system
│   │   ├── monetization/  # Balance, skins, tournaments
│   │   └── database/      # Database configuration
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── app/               # Next.js app directory
│   │   ├── dashboard/     # Main dashboard
│   │   ├── race/          # Race page
│   │   ├── leaderboard/   # Leaderboard page
│   │   └── profile/       # User profile
│   ├── components/        # React components
│   ├── store/             # Zustand stores
│   └── lib/               # Utilities
│
└── docker-compose.yml
```

## 🎯 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get current user profile

### Users
- `GET /users/me` - Get current user
- `PUT /users/me` - Update user profile

### Games
- `GET /games/my-results` - Get user's game results
- `GET /games/recent` - Get recent games

### Leaderboard
- `GET /leaderboard?type=all_time&limit=100` - Get leaderboard
- `GET /leaderboard/user/:userId/rank` - Get user rank

### Monetization
- `GET /monetization/balance` - Get user balance
- `GET /monetization/skins` - Get all skins
- `POST /monetization/purchase-skin/:skinId` - Purchase skin
- `GET /monetization/tournaments` - Get active tournaments
- `POST /monetization/tournaments/:tournamentId/join` - Join tournament

## 🔌 WebSocket Events

### Client → Server
- `join_matchmaking` - Join matchmaking queue
- `typing_progress` - Send typing progress
- `leave_room` - Leave current room

### Server → Client
- `room_update` - Room state update
- `countdown` - Countdown number (3, 2, 1)
- `race_started` - Race has started
- `progress_update` - Player progress update
- `player_finished` - Player finished race
- `race_finished` - All players finished

## 🎨 Features in Detail

### Real-time Matchmaking
1. User clicks "Start Race"
2. Backend finds or creates a room
3. When room is full (2-3 players), countdown starts
4. After countdown, race begins with shared text

### Typing Validation
- Server validates each character typed
- Prevents cheating by checking against original text
- Real-time WPM and accuracy calculation

### Race Visualization
- Progress bars for each player
- Real-time position updates
- WPM and accuracy display
- Finish animations

## 🛠️ Development

### Backend Commands
```bash
npm run start:dev    # Development mode with hot reload
npm run build        # Build for production
npm run start:prod   # Start production server
npm run test         # Run tests
npm run lint         # Lint code
```

### Frontend Commands
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Lint code
```

## 📝 Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=typorace
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

## 🐳 Docker

The project includes Docker Compose configuration for easy setup:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild containers
docker-compose up -d --build
```

## 🚧 Future Enhancements

- [ ] Spectator mode
- [ ] Custom text selection
- [ ] Team races
- [ ] Achievement system
- [ ] Social features (friends, chat)
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Replay system

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🎯 Tech Stack Summary

**Backend:**
- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- Socket.io
- Redis (optional)
- JWT Authentication

**Frontend:**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Zustand
- Socket.io Client
- Framer Motion

---

Built with ❤️ for typing enthusiasts worldwide!
