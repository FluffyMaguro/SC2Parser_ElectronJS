const { app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}


let win;
async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js") // use a preload script
  }
  });

  // and load the index.html of the app.
  win.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  win.webContents.openDevTools();
};



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});



ipcMain.on("toMain", (event, args) => {
  console.log(`event: ${event}`);
  console.log(`args: ${args}`);


  if ((args.length > 1) && (args[0] == 'replayfile')) {
    console.log('parsing...');
    parse_replay(args[1]);
    win.webContents.send("fromMain", 'parsed succesfully!')
  }

});











// Parsing replays
const {PythonShell} = require('python-shell');
const python_script = path.join(__dirname, 'parse.py');
const python_path = path.join(__dirname, 'venv\\Scripts\\python.exe');

function parse_replay(file) {
  // Call python script to parse a replay
  let options = {
    mode: 'text',
    // encoding: 'unicode',
    pythonPath: python_path,
    args: [file] //arguments for the function
  };

  PythonShell.run(python_script, options, function (err, results) {
    if (err) throw err;
    // results is an array consisting of messages collected during execution
    // console.log('results: %j', results);
    save_results(file, results);
  })
}

function save_results(file, results) {
  // saves results into a json file
    try {
      let data = JSON.stringify(results);     
      output_path = file.replace('.SC2Replay','.json');
      fs.writeFileSync(output_path, data, 'utf8');
      console.log('file saved!')

    } catch (err) {
      console.log(`Error writing file: ${err}`);
  }
}