const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    autoHideMenuBar: true, // 🔥 quita menú
    resizable: false,      // opcional
    title: "Memorama",
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);