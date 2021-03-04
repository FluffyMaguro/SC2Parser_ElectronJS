// Bind file button
const fileInput = document.getElementById('freplay');

fileInput.onchange = () => {
  let selectedFile = fileInput.files[0];
  // console.log(selectedFile);
  window.api.send("toMain", ['replayfile', selectedFile.path])
}

function showhideOverlay() {
  window.api.send("toMain", ['overlay', 'showhideoverlay'])
}


// Print received data 
window.api.receive("fromMain", (data) => {
  console.log(`Received: ${data} from main process`);
});