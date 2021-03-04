const { app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}


let win;
let overlay;

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    title: 'SC2 Parser',
    webPreferences: {
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js") // use a preload script
  }
  });

  // and load the index.html of the app.
  win.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  // win.webContents.openDevTools();

  win.on('closed', () => {
    app.quit();
  })


  // template_periodic_update()


  // Overlay
  overlay = new BrowserWindow({
    x: 1300,
    y: 0,
    width: 600,
    height: 600,
    alwaysOnTop: true,
    transparent: true,
    // skipTaskbar: true, // Don't show in task bar
    // fullscreen: true,
    frame:false,
    title: 'Overlay',
    webPreferences: {
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js") // use a preload script
  }
  });

  // and load the index.html of the app.
  // overlay.loadFile(path.join(__dirname, 'index.html'));
  overlay.loadFile(path.join(__dirname, 'layouts/Layout.html'));

  // Open the DevTools.
  // overlay.webContents.openDevTools();


  let file_path = "C:\\Users\\Maguro\\Desktop\\[2v1] Chain of Ascension.SC2Replay";
  parse_replay(file_path);

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






// This receives message from the front-end
ipcMain.on("toMain", (event, args) => {
  console.log(`event: ${event}`);
  console.log(`args: ${args}`);

  // Replay file loaded
  if ((args.length > 1) && (args[0] == 'replayfile')) {
    parse_replay(args[1]);
    win.webContents.send("fromMain", 'parsed succesfully!')
  }
});








// Parsing replays
const {PythonShell} = require('python-shell');
const replay_script = path.join(__dirname, 'parser/ReplayAnalysis.py');
const python_path = path.join(__dirname, 'venv\\Scripts\\python.exe');

function parse_replay(file) {
  // Call python script to parse a replay
  let options = {
    mode: 'text',
    pythonPath: python_path,
    args: [file] //arguments for the function
  };

  PythonShell.run(replay_script, options, function (err, results) {
    if (err) throw err;
    // results is an array consisting of messages collected during execution
    console.log(results[0]);
    save_as_json(file, results[0]);
    overlay.webContents.send("fromMain", ['replaydata', results[0]]);
  })
}

function save_as_json(file, data) {
  // Save data into a json file
    try {
      let jdata = JSON.stringify(data);     
      output_path = file.replace('.SC2Replay','.json');
      fs.writeFileSync(output_path, jdata, 'utf8');
      console.log('file saved!')

    } catch (err) {
      console.log(`Error writing file: ${err}`);
  }
}

function template_periodic_update() {
  // Shows how to receive data from a running python script
  let options = {
    mode: 'text',
    pythonPath: python_path,
    args: [] //arguments for the function
  };

  var pyshell = new PythonShell(path.join(__dirname, 'template_periodic_update.py'), options);

  pyshell.on('message', function (message) {
    console.log(`Message from python: ${message}`);
  });
   
  pyshell.end(function (err) {
    if (err) throw err;
    console.log('>>>> Python loop finished');
  });
}