# Discord RPC

Display your currently playing Apple Music song as your Discord activity status.

## Prerequisites

- Node.js installed on your computer
- Discord desktop application
- A Discord application (for the Client ID)

## Setup

1. Create a new Discord application:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Click "New Application" and give it a name
   - Save the Client ID from the "General Information" page
   - In the "Rich Presence" section, upload assets:
     - Upload an Apple Music logo as "apple_music"
     - Upload a playing icon as "playing"

2. Install dependencies:

   ```bash
   npm install
   ```

3. Edit `index.js`:
   - Replace `YOUR_CLIENT_ID` with your Discord application's Client ID

## Usage

1. Start the application:

   ```bash
   npm start
   ```

2. Play a song in Apple Music
3. Your Discord status will automatically update with the current song information

## Features

- Displays current song name
- Shows artist name
- Shows album name
- Updates every 15 seconds
- Automatically clears when music is paused/stopped

## Troubleshooting

If you encounter any issues:
1. Make sure Discord is running
2. Verify that Apple Music is running and playing music
3. Check that you've correctly set up your Discord application and Client ID
4. Ensure all dependencies are installed correctly 
