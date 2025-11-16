# Multi-Device Mode Guide

## Overview
Multi-device mode allows players to join a game using their own devices via QR code or link. Each player sees their role privately on their device, and the game progresses through synchronized phases across all devices.

## Key Features

- **Host as Player**: The host enters their name and participates as the first player
- **Individual Role Reveals**: Each player privately sees their role/location on their own device
- **Synchronized Timer**: All players see the same countdown timer
- **Individual Voting**: Players vote on their own devices
- **Shared Results**: Everyone sees the game outcome together
- **No Device Passing**: Each player keeps their own device throughout the game

## Game Flow

### Setup Phase
1. **Host** selects "Multi Device" mode and enters their name
2. **Host** creates a room and receives a QR code and join link
3. **Players** scan QR code or click link, enter their names to join
4. **Host** sees all players (including themselves) in the lobby
5. When 3+ players have joined, **Host** starts the game

### Role Reveal Phase
1. All players (including host) are redirected to role reveal screen
2. Each player privately sees:
   - **If Spy**: "You are the SPY!" message (no location shown)
   - **If Regular Player**: The location and their specific role (if roles enabled)
3. Each player clicks "I Got It!" to confirm
4. Game waits for all players to confirm before proceeding

### Timer Phase
1. All players see synchronized countdown timer
2. Players discuss and try to identify the spy
3. **Host** can click "Start Voting" at any time (or wait for timer to end)
4. **Regular Players** see "Waiting for host to start voting..." message

### Voting Phase
1. All players are redirected to voting screen
2. Each player votes for who they think is the spy
3. Players cannot vote for themselves
4. After voting, players see "Vote Submitted!" while waiting for others
5. When all players have voted, everyone moves to results

### Results Phase
All players see:
- **Winner**: Whether the spy or players won
  - Players win if they correctly identify the spy
  - Spy wins if they aren't caught
- **Spy Identity**: Who was the spy
- **Location**: What the secret location was
- **Vote Breakdown**: Visual chart showing who received votes
- **Play Again**: Button to start a new game

## How to Play

### For the Host
1. Select "Multi Device" in game setup
2. Enter your name
3. Click "Create Room"
4. Share the QR code or link with other players
5. Wait for players to join (minimum 3 total including you)
6. Click "Start Game" when ready
7. View your role on your device and confirm
8. Wait for timer or click "Start Voting" when ready
9. Vote for who you think is the spy
10. View results with all players

### For Joining Players
1. Scan QR code or click the join link
2. Enter your name
3. Wait in lobby for host to start
4. View your role on your device and confirm
5. Wait for timer (you'll see "Waiting for host..." during timer)
6. Vote for who you think is the spy when voting starts
7. View results with all players

## Testing the Feature

1. Start the dev server: `npm run dev`
2. Open the app and select "Multi Device" mode
3. Enter your name as host
4. Click "Create Room"
5. Open another browser window/device and scan QR or visit the join link
6. Add 2+ more players (minimum 3 total including host)
7. Start the game and follow the flow through all phases

## Player Roles

### The Spy
- Does not know the location
- Tries to figure out the location without being discovered
- Wins if not identified by other players

### Regular Players
- Know the location (and their specific role if roles are enabled)
- Try to identify the spy through discussion
- Win if they correctly vote for the spy

## Tips

- **For Spies**: Ask questions that seem natural but help you learn the location
- **For Players**: Ask questions that would be easy if you know the location but hard if you don't
- **For Everyone**: Pay attention to vague or inconsistent answers
- **Timer Control**: Host can end the timer early if the discussion has reached a conclusion
