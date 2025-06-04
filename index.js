#!/usr/bin/env node

import DiscordRPC from 'discord-rpc';
import activeWindow from 'active-win';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// For tray icon and auto-start
const AutoLaunch = require('auto-launch');
const path = require('path');
const { app, Tray, Menu } = require('electron');

// Discord application client ID
const clientId = " YOUR_CLIENT_ID_HERE "; // Replace with your actual Discord application client ID
const rpc = new DiscordRPC.Client({ transport: 'ipc' });

// Custom name for the Rich Presence
const CUSTOM_NAME = "Activity"; // Change this to whatever name you want!

// Custom workspace name (change this to what you want!)
const WORKSPACE_NAME = "✨"; // Change this to your preferred name

// Time when the script started
const startTimestamp = new Date();
let lastTitle = '';
let tray = null;

// Auto launcher
const autoLauncher = new AutoLaunch({
    name: 'Discord Window RPC',
    path: process.execPath,
});

function formatTitle(title, appName) {
    // Special formatting for VS Code windows
    if (appName === 'Visual Studio Code') {
        // Remove the workspace name and " - Visual Studio Code" from the title
        title = title.replace(' - Visual Studio Code', '');
        title = title.replace('Lucky_RPC', WORKSPACE_NAME);
        
        // If it's a file, clean up the format
        if (title.includes(' - ')) {
            const parts = title.split(' - ');
            return `${parts[0]} (${WORKSPACE_NAME})`;
        }
    }
    return title;
}

async function getCurrentWindow() {
    try {
        const window = await activeWindow();
        if (!window) {
            console.log('No active window found');
            return null;
        }

        // If the window hasn't changed, don't update
        const currentTitle = window.title;
        if (currentTitle === lastTitle) {
            return null;
        }

        lastTitle = currentTitle;
        const formattedTitle = formatTitle(window.title, window.owner.name);
        
        console.log('Current window:', {
            title: formattedTitle,
            app: window.owner.name
        });

        return {
            title: formattedTitle,
            app: window.owner.name
        };
    } catch (error) {
        console.error('Error getting window info:', error);
        return null;
    }
}

async function updateActivity() {
    console.log('\nChecking for window updates...');
    const windowInfo = await getCurrentWindow();
    
    if (!windowInfo) {
        return;
    }

    try {
        await rpc.setActivity({
            name: CUSTOM_NAME,
            type: 1, // 0 = Playing, 1 = Streaming, 2 = Listening to, 3 = Watching
            details: windowInfo.title,
            state: `Using ${windowInfo.app}`,
            startTimestamp,
            largeImageKey: 'default',
            largeImageText: windowInfo.app,
            instance: false,
        });
        console.log('Updated Discord status:', windowInfo.title);
    } catch (error) {
        console.error('Error setting Discord activity:', error);
    }
}

function createTray() {
    tray = new Tray(path.join(process.resourcesPath, 'icon.ico'));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Auto Start',
            type: 'checkbox',
            checked: false,
            click: async (menuItem) => {
                if (menuItem.checked) {
                    await autoLauncher.enable();
                } else {
                    await autoLauncher.disable();
                }
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                app.quit();
            }
        }
    ]);

    tray.setToolTip('Discord Window RPC');
    tray.setContextMenu(contextMenu);

    // Check if auto-launch is enabled
    autoLauncher.isEnabled().then((isEnabled) => {
        contextMenu.items[0].checked = isEnabled;
    });
}

// Initialize Discord RPC
async function initialize() {
    try {
        await app.whenReady();
        createTray();

        rpc.on('ready', () => {
            console.log('Discord RPC connected!');
            console.log(`Activity will show as "${CUSTOM_NAME}"`);
            
            // Update every 2 seconds
            updateActivity();
            setInterval(() => {
                updateActivity();
            }, 2000);
        });

        // Connect to Discord
        console.log('Connecting to Discord...');
        await rpc.login({ clientId });

    } catch (error) {
        console.error('Initialization error:', error);
        app.quit();
    }
}

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    initialize();
}

// Handle cleanup
app.on('before-quit', () => {
    console.log('Cleaning up...');
    if (rpc) {
        rpc.destroy();
    }
}); 