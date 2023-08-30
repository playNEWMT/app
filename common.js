/** Global variables */
var   dataList                    = document.querySelector('#midi-data ul')
const MIDI_SERVICE_UID            = '03B80E5A-EDE8-4B33-A751-6CE34EC4C700'.toLowerCase();
const MIDI_IO_CHARACTERISTIC_UID  = '7772E5DB-3868-4112-A1A9-F2669D106BF3'.toLowerCase();
const BATTERY_SERVICE_UID = '0000180F-0000-1000-8000-00805f9b34fb'.toLowerCase();
const BATTERY_LEVEL_CHARACTERISTIC_UID = '00002A19-0000-1000-8000-00805f9b34fb'.toLowerCase();

/** Global Variables */
var connectDevice = null;
var synth;
var bleDevice;
var device;
var sensorArray = [];

/** Get variable from URL
 * Use: ?bleDevice=BLE_MIDI_Service
 */
function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
  });
  return vars;
}

if (!navigator.bluetooth) {
  // printToConsole('Browser does not support web Bluetooth!');
  console.log('Web Bluetooth API is not available in browser.');
}

function isNotChrome() {
  const userAgent = navigator.userAgent.toLowerCase();
  return !/chrome/.test(userAgent) && !/chromium/.test(userAgent);
}

window.addEventListener('load', function() {
  if (isNotChrome()) {
    const warningPopup = document.createElement('div');
    warningPopup.style.color = 'red'; 
    warningPopup.style.fontFamily = 'var(--heading)';
    warningPopup.id = 'warning-popup';
    warningPopup.style.display = 'block';
    warningPopup.innerHTML = '<h4>Your current browser is not supported. Please use <a href="https://www.google.com/chrome/" target="_blank">Google Chrome</a> for the best experience.</h4>';

    document.body.appendChild(warningPopup);

  }
});

//------HTML THINGS-----

/** Console function
 * Only present on RX-page. */
function printToConsole(content) {
  var newItem = document.createElement('li');
  newItem.appendChild(document.createTextNode(content));
  dataList.prepend(newItem);
}



// Event handler for toggling the navigation menu
function toggleNav() {
  const navButton = document.querySelector('.openbtn');
  // Get the navigation menu element
  const navMenu = document.getElementById('mySidebar');

  // Check the current state of the navigation menu
  if (navMenu.classList.contains('open')) {
    let fontSizeSidebar = 0;
    document.documentElement.style.setProperty('--responsive-font-size-sidebar', `${fontSizeSidebar}px`);

    navButtonMargin = 10;
    navButton.innerHTML = '☰<br>&gt'
    
    navMenu.style.width = "0";
    // document.getElementById("main-container").style.marginLeft= "0";
    navMenu.classList.remove('open');
  } else {

    let fontSizeSidebar = 25;
    document.documentElement.style.setProperty('--responsive-font-size-sidebar', `${fontSizeSidebar}px`);

    navButtonMargin = 260;
    navButton.innerHTML = '☰<br>&lt'
  
    navMenu.style.width = "250px";
  
    // document.getElementById("main-container").style.marginLeft = "250px";
    navMenu.classList.add('open');
  }
  document.documentElement.style.setProperty('--responsive-to-nav', `${navButtonMargin}px`);
}

function toggleInfo() {
  const infoButton = document.querySelector('.openbtninfo');
  // Get the navigation menu element
  const infoMenu = document.getElementById('infoSidebar');

  // Check the current state of the navigation menu
  if (infoMenu.classList.contains('open')) {
    let fontSizeInfo = 0;
    document.documentElement.style.setProperty('--responsive-font-size-info', `${fontSizeInfo}px`);

    infoButtonMargin = 10;
    infoButton.innerHTML = '?<br>&gt'
  
    infoMenu.style.width = "0";
    // document.getElementById("main-container").style.marginLeft= "0";
    infoMenu.classList.remove('open');
  } else {

    let fontSizeInfo = 25;
    document.documentElement.style.setProperty('--responsive-font-size-info', `${fontSizeInfo}px`);

    infoButtonMargin = 260;
    infoButton.innerHTML = '?<br>&lt'
  
    infoMenu.style.width = "250px";
  
    // document.getElementById("main-container").style.marginLeft = "250px";
    infoMenu.classList.add('open');
  }
  document.documentElement.style.setProperty('--responsive-to-info', `${infoButtonMargin}px`);
}

function toggleSS() {
    const SSButton = document.querySelector('.openbtnSS');
    // Get the navigation menu element
    const SSMenu = document.getElementById('sensorSidebar');
  
    // Check the current state of the navigation menu
    if (SSMenu.classList.contains('open')) {
    //   let fontSizeSidebar = 0;
    //   document.documentElement.style.setProperty('--responsive-font-size-sidebar', `${fontSizeSidebar}px`);
  
      SSButtonMargin = 10;
      SSButton.innerHTML = '&gt'
      
      SSMenu.style.width = "0";
    //   document.body.style.marginLeft= "0";
    //   document.body.style.marginRight= "0";
    //   bodyContent.style.marginRight= "0";
      SSMenu.classList.remove('open');
    } else {
  
    //   let fontSizeSidebar = 25;
    //   document.documentElement.style.setProperty('--responsive-font-size-sidebar', `${fontSizeSidebar}px`);
  
      SSButtonMargin = 260;
      SSButton.innerHTML = '&lt'
    
      SSMenu.style.width = "250px";
    
    //   document.body.style.marginLeft = "250px";
    //   document.body.style.marginRight = "-250px";
      SSMenu.classList.add('open');
    }
    document.documentElement.style.setProperty('--responsive-to-sensor', `${SSButtonMargin}px`);
}

function openSS() {
    const SSButton = document.querySelector('.openbtnSS');
    // Get the navigation menu element
    const SSMenu = document.getElementById('sensorSidebar');
    if (!SSMenu.classList.contains('open')){    
        SSButtonMargin = 260;
        SSButton.innerHTML = '&lt'
    
        SSMenu.style.width = "250px";
    
        // document.body.style.marginLeft = "250px";
        // document.body.style.marginRight = "-250px";
        SSMenu.classList.add('open');
    }
    document.documentElement.style.setProperty('--responsive-to-sensor', `${SSButtonMargin}px`);
}

function removeOverlay() {
    overlayElements = document.querySelectorAll('.connect-wash');

    overlayElements.forEach(overlay => {
        overlay.style.display = 'none';
    });
}

function setDefaults() {
  // const navButton = document.querySelector('.openbtn');
  // document.documentElement.style.setProperty('--responsive-to-nav', `${10}px`);

  const fontSize = 5; // Default font size in em
  const fontSizeSidebar = 0; // Default font size for the sidebar in px
  document.documentElement.style.setProperty('--responsive-font-size', `${fontSize}em`);
  document.documentElement.style.setProperty('--responsive-font-size-sidebar', `${fontSizeSidebar}px`);
}

window.addEventListener('DOMContentLoaded', setDefaults);
setDefaults();

const mainContainer = document.querySelector('.main-container');

function handleResize(entries) {
  let fontSize;


  for (let entry of entries) {
    // Check if the target element is the main container
    if (entry.target === mainContainer) {
      let containerWidth = document.getElementById('main-container').style.marginRight;
      if (containerWidth === "250px"){
        fontSize = 3;

      } else if (window.innerWidth < 850){
        fontSize = 3;

      } else {
        fontSize = 5;

      }
      document.documentElement.style.setProperty('--responsive-font-size', `${fontSize}em`);
    }
  }
}

const resizeObserver = new ResizeObserver(handleResize);
resizeObserver.observe(mainContainer);





// ----- INSTRUMENT FUNCTIONALITY -----
function loadRNBOScript(version) {
  return new Promise((resolve, reject) => {
      if (/^\d+\.\d+\.\d+-dev$/.test(version)) {
          throw new Error("Patcher exported with a Debug Version!\nPlease specify the correct RNBO version to use in the code.");
      }
      const el = document.createElement("script");
      el.src = "https://c74-public.nyc3.digitaloceanspaces.com/rnbo/" + encodeURIComponent(version) + "/rnbo.min.js";
      el.onload = resolve;
      el.onerror = function(err) {
          console.log(err);
          reject(new Error("Failed to load rnbo.js v" + version));
      };
      document.body.append(el);
  });
}

function playNote (device, midiMessage) {
    let noteOnEvent = new RNBO.MIDIEvent(device.context.currentTime * 1000 , 0, midiMessage);
    device.scheduleEvent(noteOnEvent);
}

function updateConnectedDevicesList() {
    sensorArray.forEach((sensor) => {
        let connectedDevicesList;

        connectedDevicesList = document.getElementById(`${sensor.container}`);
        connectedDevicesList.innerHTML = '';

        const deviceBlock = document.createElement('div');
        deviceBlock.classList.add('device-block');
        // deviceBlock.style.border = sensor.color[0];
        // deviceBlock.style.backgroundColor = sensor.color[1];    
        const deviceLabel = document.createElement('span');
        deviceLabel.textContent = sensor.shortName ? sensor.shortName : 'Unknown device';
        deviceLabel.classList.add('device-label')
        deviceBlock.appendChild(deviceLabel);   
        // const dropdownArrow = document.createElement('div');
        // dropdownArrow.classList.add('dropdown-arrow');
        // deviceBlock.appendChild(dropdownArrow);
        const dropdownContainer = document.createElement('select');
        deviceBlock.appendChild(dropdownContainer);
        dropdownContainer.classList.add('dropdown-container');
        // dropdownContainer.style.backgroundColor = sensor.color[1];  
        // const deviceOnButton = document.createElement('button');
        // deviceBlock.appendChild(deviceOnButton);
        // deviceOnButton.classList.add('device-on-button')
        
        const deviceSlider = document.createElement('input');
        deviceSlider.setAttribute('type', 'range');
        deviceSlider.setAttribute('class', 'device-slider');
        deviceBlock.appendChild(deviceSlider);  
        // const dropdownContainer = document.createElement('div');
        // dropdownContainer.classList.add('dropdown-container');
        // deviceBlock.appendChild(dropdownContainer); 
        // DO A DROP DOWN MENU LIKE THE SOUNDS!!!

        const param = device.parametersById.get(`visualize${sensor.channel}`);
        param.changeEvent.subscribe((e) => {
          
          deviceSlider.setAttribute('min', param.min + 30);
          deviceSlider.setAttribute('max', param.max - 30);
          deviceSlider.setAttribute("step", (param.max - param.min) / 1000.0); 
          deviceSlider.value = e;

        });
        
        device.parameters.forEach(param => {
            if (param.name.includes(`sensor${sensor.channel}`)){ 
                let xyz = ['X-axis', 'Y-axis', 'Z-axis'];
                let index = 1
                xyz.forEach(axis => {
                    const option = document.createElement("option");

                    option.textContent = axis;
                    option.value = index; 
                    dropdownContainer.appendChild(option);  
                    index = index + 1;  
                });

                dropdownContainer.addEventListener("change", (event) => {
                    param.value = event.target.value;
                    console.log(event.target.value);
                }); 
                dropdownContainer.value = param.value;
            }
        });
        


        // device.parameterChangeEvent.subscribe(param => {
        //   if (param.name.includes(`visualize${sensor.channel}`)) {
        //       console.log(param.name, sensor.channel);

        //       deviceSlider.setAttribute('min', param.min + 30);
        //       deviceSlider.setAttribute('max', param.max - 30);
        //       deviceSlider.setAttribute("step", (param.max - param.min) / 1000.0); 
        //       deviceSlider.value = param.value;

        //   }
        // });

        connectedDevicesList.appendChild(deviceBlock); 
    });
}

async function connectToDevice(device) {
    let existingSensor = sensorArray.find(s => s.id === device.id);
    if (!existingSensor) {
        const sensor = new Sensor(device);
        sensorArray.push(sensor);
        await sensor.connect();
        sensorArray.sort((a,b) => a.channel - b.channel);
        updateConnectedDevicesList();
    } 

    removeOverlay();
    openSS();

    return;
  }

function checkIfAllSensorsAreDisconnected() {
    if (sensorArray.length === 0) {

      overlayElements = document.querySelectorAll('.connect-wash');

      overlayElements.forEach(overlay => {
          overlay.style.display = 'block';
      });
        
    }
}

async function disconnectFromDevice(device) {
  let indexToRemove = -1
  sensorArray.forEach((sensor, index) => {
      if (sensor.name === device.name){
          sensor.disconnect();
          indexToRemove = index;
          let connectedDevicesList = document.getElementById(`${sensor.container}`);
          connectedDevicesList.innerHTML = '';
      }
  });
  if (indexToRemove != -1){
      sensorArray.splice(indexToRemove, 1);
      indexToRemove = -1;
  }

  updateConnectedDevicesList();
  checkIfAllSensorsAreDisconnected();
}

/** Connecting to given device. */
async function scanToConnect() {

  const options = {
          filters: [{
            services: [MIDI_SERVICE_UID]
            //name: bleDevice
          }],
          optionalServices: [BATTERY_SERVICE_UID]
        };
  const bleDevice = await navigator.bluetooth.requestDevice(options);
  await connectToDevice(bleDevice);
}

async function scanToDisconnect() {
  const options = {
      filters: [{
        services: [MIDI_SERVICE_UID],
        //name: bleDevice
      }]
    };
  const bleDevice = await navigator.bluetooth.requestDevice(options);
  await disconnectFromDevice(bleDevice);
}

/** Incoming BLE MIDI */
function handleMidiMessageRecieved(event) {
const {buffer}  = event.target.value;
const eventData = new Uint8Array(buffer);

bleMIDIrx(eventData);

playNote(device, bleMIDIrx(eventData));
}


function onDisconnected(event) {
if (!connectDevice || !connectDevice.gatt.connected) return;
connectDevice.gatt.disconnect();
let BTdevice = event.target;
printToConsole('Connection lost...');
console.log('Device ' + BTdevice.name + ' is disconnected.');
bleDisconnect();
}

function bleConnected() {
document.getElementById('hide').style.display = 'none';
document.getElementById('ibutton').innerHTML = 'Connect';
document.getElementById('midi-data').style.height = '45vh';
document.getElementById("ibutton").onclick = scanToConnect;
document.getElementById("info").style.fontSize = '1.5em';
document.getElementById('midi-data').style.background = '#ECEFF1'
}

function bleDisconnect() {
document.getElementById('hide').style.display = 'none';
document.getElementById('hide').style.display = 'block';
document.getElementById('ibutton').innerHTML = 'Disconnect';
document.getElementById('midi-data').style.height = '10vh';
document.getElementById("ibutton").onclick = scanToDisconnect;
document.getElementById("info").style.fontSize = '2em';
}