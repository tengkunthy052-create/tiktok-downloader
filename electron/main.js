const { app, BrowserWindow } = require('electron');
const path = require('path');

// Import the server start function
const startServer = require('../server').startServer;
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: { nodeIntegration: false }
  });
  const serverPort = process.env.PORT || 3000;
  mainWindow.loadURL(`http://localhost:${serverPort}`);
  mainWindow.on('closed', () => (mainWindow = null));
}

app.whenReady().then(() => {
  startServer();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
