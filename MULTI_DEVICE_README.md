# Multi-Device Mode - Technical Overview

## What is Multi-Device Mode?

Multi-device mode allows players to join a game using their own devices. The host creates a room and shares a QR code or link. Players join via their devices, and the game progresses through synchronized phases where each player interacts on their own screen.

## User Flows

### Host Flow
1. Select "Multi Device" mode → Enter name → Create room
2. Share QR code/link with players
3. See players join in real-time (minimum 3 total including host)
4. Click "Start Game" → Redirected to role reveal
5. See your role → Click "I Got It!" → Wait for all confirmations
6. Redirected to synchronized timer
7. Click "Start Voting" when ready
8. Vote for suspected spy
9. View results showing winner and vote breakdown

### Player Flow
1. Scan QR code or click join link → Enter name
2. Wait in lobby for host to start
3. Redirected to role reveal when game starts
4. See your role → Click "I Got It!" → Wait for all confirmations
5. Redirected to synchronized timer
6. Wait for host to start voting
7. Vote for suspected spy
8. View results showing winner and vote breakdown

## Game Phases

### 1. Waiting
- Host creates room with QR code and join link
- Players join and appear in lobby
- Host starts when ready (min 3 players)

### 2. Revealing
- Each player sees their individual role on their device
- Spy sees: "You are the SPY!" (no location)
- Regular players see: Location and role
- Players confirm when ready
- Proceeds when all players confirm

### 3. Timer
- Synchronized countdown on all devices
- Players discuss to identify the spy
- Host has "Start Voting" button
- Regular players see "Waiting for host..." message

### 4. Voting
- Each player votes on their device
- Cannot vote for yourself
- Shows confirmation after voting
- Proceeds when all players vote

### 5. Results
- Shows winner (spy or players)
- Displays spy identity and location
- Vote breakdown with visual charts
- "Play Again" option

## How to Test

```bash
# Start development server
npm run dev

# In browser:
1. Select "Multi Device" mode
2. Enter your name as host
3. Click "Create Room"
4. Open incognito/another device
5. Scan QR or click link to join
6. Add more players (min 3 total)
7. Play through all phases
```

## Key Features

- **No Device Passing**: Each player keeps their own device
- **Synchronized State**: All players move through phases together
- **Individual Privacy**: Roles revealed only to each player
- **Host Controls**: Host can start voting at any time
- **Automatic Progression**: Game moves to next phase when conditions met
- **Real-time Updates**: Polling every 2 seconds for state changes

## Minimum Requirements

- 3 players minimum (including host)
- Modern web browser with localStorage support
- Internet connection for all devices
- QR code scanner or ability to click links

## Notes

- Host counts as the first player
- Players cannot vote for themselves
- Spy wins if not correctly identified
- Regular players win if they catch the spy
- Sessions stored in localStorage
- Rooms expire after 2 hours of inactivity
