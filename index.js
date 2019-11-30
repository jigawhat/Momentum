//
// Lorb index javascript
//
const ipc = require('electron').ipcRenderer;

ipc.on('message', (event, message) => {
  console.log(message); // logs out "Hello second window!"
});

console.log(process);

function sendNotif() {
  let myNotification = new Notification('Title', {
    body: 'Lorem Ipsum Dolor Sit Amet'
  })

  myNotification.onclick = () => {
    console.log('Notification clicked');
  }
}


// Global variables
var notifs = true;
var sounds = true;



// Messaging events between main and renderer
ipc.on('set', (event, arg) => {
  [name, value] = arg.split(':');
  switch (name) {
    case "notifs":
      toggle_notifs(value == "true");
    case "sounds":
      toggle_sounds(value == "true");
  }
});



function toggle_notifs(value=undefined, propagate=false) {
  if (value === undefined) {
    value = !notifs;
  }
  notifs = value;
  var img = "off";
  if (value) {
    img = "on";
  }
  $( "#notifs_toggle" ).css("background-image", 'url("img/bell_' + img + '_white.png")');
  if (propagate) {
    ipc.send("set", "notifs:" + value);
  }
}
function toggle_sounds(value=undefined, propagate=false) {
  if (value === undefined) {
    value = !sounds;
  }
  sounds = value;
  var img = "off";
  if (value) {
    img = "on";
  }
  $( "#sounds_toggle" ).css("background-image", 'url("img/vol_' + img + '_white.png")');
  if (propagate) {
    ipc.send("set", "sounds:" + value);
  }
}





$( function() {

  $( "#middlerow" ).html(" ");
  console.log("hi");
  ipc.send('asynchronous-message', 'ping');

  $( "#notifs_toggle" ).click(function() {
    toggle_notifs(undefined, true);
  });
  $( "#sounds_toggle" ).click(function() {
    toggle_sounds(undefined, true);
  });


});


