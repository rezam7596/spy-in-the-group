# Spy in the Group

A fun, pass-and-play party game where players try to find the spy among them. One player is secretly designated as the spy, while everyone else knows the secret location. The spy must blend in and figure out the location, while the others try to identify the spy without being too obvious.

## Game Overview

- **Players:** 3-10 people (one device shared among all)
- **Duration:** 5-10 minutes per round
- **Goal:**
  - Non-spies: Find the spy
  - Spy: Discover the secret location or avoid detection

## How to Play

1. **Setup:** Enter player names and select game duration
2. **Role Reveal:** Pass the device around - each player sees their role privately
   - Non-spies see the secret location and their role
   - The spy sees only that they are the spy
3. **Question Round:** Players take turns asking each other questions
   - Non-spies try to expose the spy with location-related questions
   - The spy tries to blend in and gather clues
4. **End Game:** When time runs out, either:
   - Vote on who you think is the spy
   - Let the spy guess the location

## Features

- 20 pre-defined locations with unique roles
- Beautiful, responsive UI with gradient designs
- Countdown timer with visual progress
- Pass-and-play mechanics for single device
- Vote or spy guess end game options

## Getting Started

Install dependencies:

```bash
pnpm install
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

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** CSS Modules
- **State Management:** React Context API

## Project Structure

```
app/
├── components/       # React components for each screen
├── contexts/         # Game state management
├── data/            # Locations and roles data
├── types/           # TypeScript type definitions
├── layout.tsx       # Root layout with GameProvider
└── page.tsx         # Main page with phase routing
```
