# Spy in the Group

A fun multiplayer party game where players try to find the spy among them. One player is secretly designated as the spy, while everyone else knows the secret word. The spy must blend in and figure out the word, while the others try to identify the spy without being too obvious.

**Play now:** https://spy-in-the-group.vercel.app/

## Game Overview

- **Players:** 3-10 people
- **Modes:** Single-device (pass-and-play) or Multi-device (each player on their own device)
- **Duration:** 3-10 minutes per round
- **Goal:**
  - Non-spies: Find the spy
  - Spy: Discover the secret word or avoid detection

## How to Play

### Single-Device Mode
1. **Setup:** Enter player names, select game duration, categories, difficulty, and language
2. **Role Reveal:** Pass the device around - each player sees their role privately
   - Non-spies see the secret word and their role (if roles are enabled)
   - The spy sees only that they are the spy
3. **Discussion Round:** Players take turns asking each other questions
   - Non-spies try to expose the spy with word-related questions
   - The spy tries to blend in and gather clues
4. **Voting:** When time runs out, everyone votes on who they think is the spy
5. **Results:** See who won and reveal the secret word

### Multi-Device Mode
1. **Host Creates Room:** One player creates a room and shares the room code
2. **Players Join:** Other players enter the room code to join
3. **Host Starts Game:** Configure settings (duration, categories, difficulty, language) and start
4. **Role Reveal:** Each player sees their role on their own device
5. **Discussion Round:** Players discuss and ask questions (in person or video call)
6. **Voting:** Everyone votes simultaneously on their devices
7. **Results:** See voting results and reveal the winner

## Features

- **Two Game Modes:** Single-device pass-and-play or multi-device online rooms
- **15+ Categories:** Locations, food, drinks, animals, sports, professions, countries, movies, music, brands, party, celebrities, objects, hobbies, internet
- **Difficulty Levels:** Easy, medium, and hard word selections
- **8 Languages:** English, Persian, Swedish, Chinese, Hindi, Spanish, French, Arabic
- **Optional Roles:** Assign specific roles to players for more immersive gameplay

## Getting Started

Install dependencies:

```bash
npm i -g vercel
pnpm install
```

Pull env variable for MongoDB connection (Or use the connection string for your own MongoDB)
```bash
vercel env pull
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

Build for production:

```bash
pnpm build
pnpm start
```

### Running Tests

First, install Playwright browsers:

```bash
pnpm exec playwright install chromium
```

Run all e2e tests:

```bash
pnpm test:e2e
```

Run tests with UI mode (interactive):

```bash
pnpm test:e2e:ui
```

## Technical Overview

### Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Database:** MongoDB Atlas for multi-device room persistence
- **Styling:** CSS Modules with responsive design
- **State Management:** React Context API for client-side state
- **Deployment:** Vercel with serverless functions
- **API:** Next.js API routes for room management
- **Testing:** Playwright for E2E tests

### Key Technical Features

- **Serverless Architecture:** API routes deployed as serverless functions on Vercel
- **Type Safety:** Full TypeScript coverage with strict type checking
- **Session Management:** Client-side local storage for multi-device player identification
- **Real-time State Sync:** Polling-based updates for multi-device room synchronization
- **Atomic Database Operations:** Uses MongoDB atomic operators (`$push`, `$pull`, `arrayFilters`) to prevent race conditions when multiple players perform actions simultaneously

### Project Structure

```
app/
├── api/
│   └── rooms/           # API routes for room management
│       ├── create/      # Create new room
│       ├── [roomId]/    # Room-specific endpoints
│       │   ├── join/           # Join room
│       │   ├── start/          # Start game
│       │   ├── confirm-role/   # Confirm role (atomic)
│       │   ├── cast-vote/      # Cast vote (atomic)
│       │   └── restart/        # Restart game
├── components/          # React components for each screen
├── contexts/            # Game state management with Context API
├── data/                # Word categories in 8 languages
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
│   ├── mongodb.ts       # MongoDB connection and indexes
│   └── roomStore.ts     # Atomic database operations
└── page.tsx             # Main page with mode selection
```