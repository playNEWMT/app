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
var SIdevice;
var RSdevice;
var sensorArray = [];
var deviceArray = [];
let mouseModeArray = [];
var deviceID = 0;
var globalClock;


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

function closeWarning() {
  const warningPopup = document.getElementById('warning-popup');
  warningPopup.style.display = 'none';
}

window.addEventListener('load', function() {
  console.log("pathname test", window.location.pathname);
  if (isNotChrome() && window.location.pathname === '/app/instruments.html') {
    const warningPopup = document.createElement('div');
    warningPopup.style.color = 'red'; 
    warningPopup.style.fontFamily = 'var(--heading)';
    warningPopup.id = 'warning-popup';
    warningPopup.style.display = 'block';
    warningPopup.innerHTML = '<h4>Your current browser is not supported. Please use <a href="https://www.google.com/chrome/" target="_blank">Google Chrome</a> for the best experience.</h4>';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', closeWarning);
    warningPopup.appendChild(closeButton);

    document.body.appendChild(warningPopup);
  }
});

window.onclick = function(event) {
  const modal = document.getElementById("device-modal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

function addNewDevice() {
  document.getElementById("device-modal").style.display = "block";
}

function closeModal() {
  document.getElementById("device-modal").style.display = "none";
}

function goToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

//------HTML THINGS-----


// document.addEventListener('DOMContentLoaded', () => {
//   // Simulate sending a message to the console
//   setTimeout(() => {
//     printToConsole('This is a test message.');
//   }, 1000);
// });
/** Console function
 * Only present on RX-page. */
function printToConsole(content) {
  const consoleElement = document.getElementById('iConsole');
  const messageElement = document.getElementById('console-message');

  // Set the message content
  messageElement.textContent = content;
  messageElement.style.color = "var(--sensor-red-l)"
  messageElement.style.fontSize = "20px"

  // Show the console with a flash animation
  consoleElement.classList.add('visible', 'flash');

  // Remove the flash animation after it completes
  setTimeout(() => {
    consoleElement.classList.remove('flash');
  }, 1100); // Match this duration to the animation duration in CSS

  // Hide the console after a few seconds
  setTimeout(() => {
    consoleElement.classList.remove('visible');
  }, 2200); // Adjust this duration as needed
}

if (document.getElementById("toggleAnimation")) {
  document.getElementById("toggleAnimation").addEventListener("click", function() {
    // Select all elements on the page
    var allElements = document.querySelectorAll('*');
    let playState = 'running';
  
    // Iterate through all elements
    allElements.forEach(function(element) {
      // Check if the element has animation defined
      var computedStyle = window.getComputedStyle(element);
      var animationName = computedStyle.getPropertyValue('animation-name');
      if (animationName !== "none") {
        // Toggle animation play state
        var animationPlayState = (computedStyle.getPropertyValue('animation-play-state') === "paused") ? "running" : "paused";
        element.style.animationPlayState = animationPlayState;
        playState = animationPlayState;
      }
    });
  
    var playIcon = document.getElementById("playIcon");
    var pauseIcon = document.getElementById("pauseIcon");
    var buttonText = document.getElementById("playButtonText");
  
    if (playState === 'paused') {
      pauseIcon.style.display = "none";
      playIcon.style.display = "inline";
      buttonText.textContent = "Play";
    } else {
      playIcon.style.display = "none";
      pauseIcon.style.display = "inline";
      buttonText.textContent = "Pause";
    }
  
  });
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
    infoMenu.style.paddingLeft = "0px"
    infoMenu.style.paddingRight = "0px"
    // document.getElementById("main-container").style.marginLeft= "0";
    infoMenu.classList.remove('open');
  } else {

    let fontSizeInfo = 25;
    document.documentElement.style.setProperty('--responsive-font-size-info', `${fontSizeInfo}px`);

    infoButtonMargin = 315;
    infoButton.innerHTML = '?<br>&lt'
  
    infoMenu.style.width = "290px";
    infoMenu.style.paddingLeft = "10px"
    infoMenu.style.paddingRight = "10px"
  
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

    // openSS();
}

let counter = 0;
function nextCollaborator() {
  let image = document.querySelector('.about-us-image');
  let text = document.querySelector('.about-us-text');
  imageAway(image);

  const ASUtext = `
  <h3>ASU <em>- MLFTC & AME</em></h3>
  <p>
    Educators and researchers from ASU's Mary Lou Fulton Teacher's College and the school of Arts, Media and Engineering:</br>
    </br>
    <strong>
    - Sha Xin Wei: Principle Investigator (AME)</br>
    - Seth Thorn: Co-PI, Audio Developer (AME)</br>
    - Mirka Koro: Co-PI (MLFTC)</br>
    - Margarita Pivovarova: Co-PI (MLFTC)</br>
    - Corey Reutlinger: Postdoctoral Researcher (AME)</br>
    - Cole Mcleod: UI/UX & Audio Developer (AME)
    </strong>
  </p>
  `;
  const NERCtext = `
    <h3>NERC and Science Prep Academy</h3>
    <p>
      NERC is an independent nonprofit research center dedicated to improving access to quality education and workforce development for Neurodivergent humans. 
      Science Prep Academy, is NERC’s flagship STEM private school.
      </br>
      </br>
      <strong>
      - Ananí M. Vasquez, PhD (NERC)</br>
      - Denise Amiot, School Director (NERC)</br>
      - Cintya Arcos, Program Coordinator (NERC)</br>
      </strong>
    </p>
  `;

  const TEACHtext = `
    <h3>Teacher Fellows</h3>
    <p>
      Teacher Fellows were integral to the co-design process and to the facilitation of professional development for their colleagues.</br>
      </br>
      <strong>
      - Jessica Strouth, Science Prep Academy</br>
      - Kristin Kennedy, Sacaton Schools</br>
      - Exie Weathers, Science Prep Academy</br>
      - Jasmine Cano, Cholla Schools</br>
      - Jonathan Perrone, Arizona Educational Foundation
      </strong>
    </p>  
  `;

  counter += 1;
  let abouttext = '';
  if (counter == 3) {
    counter = 0;
  }

  if (counter == 0) {
    abouttext = ASUtext;
  }
  else if (counter == 1) {
    abouttext = NERCtext;
  }
  else if (counter == 2) {
    abouttext = TEACHtext;
  }
  text.innerHTML = abouttext;
}

async function imageAway(image) {
  const delay = ms => new Promise(res => setTimeout(res, ms));
  image.style.left = '100%';
  await delay(550);
  imageBack(image);
}

function imageBack(image) {
  let picture = image.children[0];
  if (counter == 0){
    picture.src = './media/ASUlogo.png';

  } else if (counter == 1){
    picture.src = './media/img-man-teaching-kids.jpg';

  } else if (counter == 2){
    picture.src = './media/teacher-fellows.jpg';

  }
  
  image.style.left = '0%';
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

function populateAxis() {

  deviceArray.forEach(device => {

    // console.log(thisDeviceSensor);
    let axisSelect = document.getElementById(`${device.axisID}`);
    // console.log(device.axisID, axisSelect);

    let h2Element = document.getElementById(`${device.axisID}-mode`);

    var axisSelectedValue = axisSelect.value;
    // console.log(thisDeviceSensor);

    if ((mouseModeArray.find(MMdevice => MMdevice.ID === device.ID) || null) !== null){
      h2Element.textContent = "MOUSE";
      axisSelect.innerHTML = "";
      let options = ['X-Axis', 'Y-Axis'];
      options.forEach((option, index) => {
        var optionElement = document.createElement("option");
        optionElement.text = option;
        optionElement.value = index + 1;
        axisSelect.add(optionElement);
      });

      axisSelect.value = axisSelectedValue;

      axisSelect.addEventListener("change", event => {
        // console.log(device, event.target.value);
        device.deviceAxis = event.target.value;
        // console.log(device.deviceAxis);
      });

      if (!axisSelect.value) {
        axisSelect.value = 2;
        var event = new Event('change', {
          bubbles: true,
          cancelable: true
        });
        axisSelect.dispatchEvent(event);
      }

      return;
    }
    // console.log(device);
    let thisDeviceSensor = device.connectedSensor;
    if (thisDeviceSensor === null && (mouseModeArray.find(MMdevice => MMdevice.ID === device.ID) || null) === null) {
      h2Element.textContent = "MODE";
      axisSelect.innerHTML = "";
      return;
    }

    if (thisDeviceSensor === null) {
      return;
    }

    if (thisDeviceSensor.mode == 0) {
      h2Element.textContent = "EASY";
      axisSelect.innerHTML = "";
      let options = ['Pitch', 'Roll', 'Shake'];
      options.forEach((option, index) => {
        var optionElement = document.createElement("option");
        optionElement.text = option;
        optionElement.value = index + 1;
        axisSelect.add(optionElement);
      });
    } else if (thisDeviceSensor.mode == 1 || thisDeviceSensor.mode == 2) {
      if (thisDeviceSensor.mode == 1){
        h2Element.textContent = "ACCEL";
      } else {
        h2Element.textContent = "GYRO";
      }
      let options = ['X-Axis', 'Y-Axis', 'Z-Axis'];
      axisSelect.innerHTML = "";
      options.forEach((option, index) => {
        var optionElement = document.createElement("option");
        optionElement.text = option;
        optionElement.value = index + 1;
        axisSelect.add(optionElement);
      });
    }

      axisSelect.value = axisSelectedValue;

      axisSelect.addEventListener("change", event => {
        // console.log(device, event.target.value);
        device.deviceAxis = event.target.value;
        // console.log(device.deviceAxis);
      });


      
      if (!axisSelect.value) {
          axisSelect.value = 2;
          var event = new Event('change', {
            bubbles: true,
            cancelable: true
          });
          axisSelect.dispatchEvent(event);
        }
  });
}



function populateSelect() {

  var selectElements = document.querySelectorAll(".sensor-select");

  selectElements.forEach(function(select) {
    // Store the current selected value
    var selectedValue = select.value;

    select.innerHTML = ""; // Clear existing options

    // Add options from the array
    sensorArray.forEach(function(sensor) {
      var optionElement = document.createElement("option");
      optionElement.text = sensor.name;
      optionElement.value = sensor.id;
      select.add(optionElement);
    });

    // Set the stored selected value as the selected option
    select.value = selectedValue;

    if (!select.hasEventListener) {
      select.addEventListener("change", function(event) {
        const selectedSensorId = event.target.value;
      
        // Iterate over devices to update their connections
        deviceArray.forEach(device => {
          if (select.id === device.selectID) {
            // Update device's connected sensor based on selected value
            device.connectedSensor = sensorArray.find(sensor => sensor.id === selectedSensorId) || null;
          }
        });
      
        // Update each sensor's connected devices
        sensorArray.forEach(sensor => {
          sensor.connectedTo = deviceArray.filter(device => device.connectedSensor === sensor);
          // console.log(sensor.connectedTo, sensor.name);
        });

        populateAxis();
      });
      // Mark that the event listener has been added
      select.hasEventListener = true;
    }

    if (!select.text) {
      // console.log("hi");
      var noSensorElement = document.createElement("option");
      noSensorElement.text = "No Sensor";
      noSensorElement.style.color = "var(--sensor-red)";
      noSensorElement.value = null;
      select.add(noSensorElement);
            // Get the event listener function associated with the 'change' event
      var event = new Event('change', {
        bubbles: true,
        cancelable: true
      });
      select.dispatchEvent(event);
    }

  });


}
//TODO remove event listener when you delete a block

function updateConnectedDevicesList() {
  
  populateSelect();
  return

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
      // const SIparam = SIdevice.parametersById.get(`visualize${sensor.channel}`);
      // SIparam.changeEvent.subscribe((e) => {
        
      //   deviceSlider.setAttribute('min', SIparam.min);
      //   deviceSlider.setAttribute('max', SIparam.max);
      //   deviceSlider.setAttribute("step", (SIparam.max - SIparam.min) / 1000.0); 
      //   deviceSlider.value = e;
      // });
      
      // SIdevice.parameters.forEach(SIparam => {
      //     if (SIparam.name.includes(`sensor${sensor.channel}`)){ 
      //         let xyz = ['X-axis', 'Y-axis', 'Z-axis'];
      //         let index = 1
      //         xyz.forEach(axis => {
      //             const option = document.createElement("option");
      //             option.textContent = axis;
      //             option.value = index; 
      //             dropdownContainer.appendChild(option);  
      //             index = index + 1;  
      //         });
      //         dropdownContainer.addEventListener("change", (event) => {
      //             SIparam.value = event.target.value;
      //             console.log(event.target.value);
      //         }); 
      //         dropdownContainer.value = SIparam.value;
      //     }
      // });
      // const param = RSdevice.parametersById.get(`visualize${sensor.channel}`);
      // param.changeEvent.subscribe((e) => {
        
      //   deviceSlider.setAttribute('min', param.min + 30);
      //   deviceSlider.setAttribute('max', param.max - 30);
      //   deviceSlider.setAttribute("step", (param.max - param.min) / 1000.0); 
      //   deviceSlider.value = e;
      // });
      
      // RSdevice.parameters.forEach(param => {
      //     if (param.name.includes(`sensor${sensor.channel}`)){ 
      //         let xyz = ['X-axis', 'Y-axis', 'Z-axis'];
      //         let index = 1
      //         xyz.forEach(axis => {
      //             const option = document.createElement("option");
      //             option.textContent = axis;
      //             option.value = index; 
      //             dropdownContainer.appendChild(option);  
      //             index = index + 1;  
      //         });
      //         dropdownContainer.addEventListener("change", (event) => {
      //             param.value = event.target.value;
      //             console.log(event.target.value);
      //         }); 
      //         dropdownContainer.value = param.value;
      //     }
      // });
      
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
  openSS();
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
function handleMidiMessageRecieved(event, sensorID, axis, connectedTo) {
const {buffer}  = event.target.value;
const eventData = new Uint8Array(buffer);
// console.log(sensorID, axis);
let midi = bleMIDIrx(eventData);
// console.log(midi);

let foundSensor = sensorArray.find(sensor => sensor.id === sensorID) || null;
if (midi[1] == 100 && midi[2] == 0) {
  foundSensor.mode = 0;
  populateAxis();
} else if (midi[1] == 100 && midi[2] == 1) {
  foundSensor.mode = 1;
  populateAxis();
} else if (midi[1] == 100 && midi[2] == 2) {
  foundSensor.mode = 2;
  populateAxis();
}


connectedTo.forEach(deviceInfo => {
  let thisDevice = deviceInfo.device;
  // console.log(deviceInfo.ID);
  // console.log(mouseModeArray.find(device => device.ID === deviceInfo.ID) || null);
  if((mouseModeArray.find(device => device.ID === deviceInfo.ID) || null) !== null){
    console.log("hello");
    
    return;
  }
  
  if (deviceInfo.deviceAxis == 1 && midi[1] == 1){
    playNote(thisDevice, midi, deviceInfo.invert);
    // console.log("axis 1", midi);

  } else if (deviceInfo.deviceAxis == 2 && midi[1] == 2) {
    playNote(thisDevice, midi, deviceInfo.invert);
    // console.log("axis 2", midi);

  } else if (deviceInfo.deviceAxis == 3 && midi[1] == 3) {
    playNote(thisDevice, midi, deviceInfo.invert);
    // console.log("axis 3", midi);

  }
  // console.log(sensorID, deviceInfo.name, deviceInfo.device);
  
});

// playNote(RSdevice, SIdevice, bleMIDIrx(eventData));
}

function playNote (device, midiMessage, invert = false) {
  let sendMidi = midiMessage;

  if (invert) {
    // Invert the midiValue (third element of the array)
    invertedValue = 127 - midiMessage[2];
    console.log("invertOn", midiMessage);
    sendMidi = [midiMessage[0], midiMessage[1], invertedValue];
  }
  // console.log("invertOff", midiMessage);
  
  let noteOnEvent = new RNBO.MIDIEvent(device.context.currentTime * 1000 , 0, sendMidi);
  device.scheduleEvent(noteOnEvent);
  // console.log(midiMessage);
  // let noteOnEvent = new RNBO.MIDIEvent(SIdevice.context.currentTime * 1000 , 0, midiMessage);
  // SIdevice.scheduleEvent(noteOnEvent);

  // noteOnEvent = new RNBO.MIDIEvent(RSdevice.context.currentTime * 1000 , 0, midiMessage);
  // RSdevice.scheduleEvent(noteOnEvent);
}

function scale(value, inMin, inMax, outMin, outMax) {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

window.addEventListener('mousemove', (event) => {
  if (mouseModeArray.length === 0) {
    return;
  }
  // Get the mouse position
  let mouseX = event.clientX;
  let mouseY = event.clientY;

  // Get the dimensions of the window
  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;

  // Scale the mouse position to a value between 0 and 127
  let scaledX = Math.round(scale(mouseX, 0, windowWidth, 0, 127));
  let scaledY = Math.round(scale(mouseY, 0, windowHeight, 0, 127));

  // Construct a MIDI message (for example, a note on message)
  let midiX = [176, 1, scaledX];
  let midiY = [176, 2, scaledY];
  // let midiClick = [176, 3, ]
  // console.log(mouseModeArray);

  // Get the device
  for (let device of mouseModeArray) {
    // console.log(device);
    // return;
    if (device.deviceAxis == 1){
      playNote(device.device, midiX, device.invert);
      // console.log("axis X");
  
    } else if (device.deviceAxis == 2) {
      playNote(device.device, midiY, device.invert);
      // console.log("axis Y");
  
    } 
    // else if (device.deviceAxis == 3) {
    //   playNote(device, midiClick);
    // }
    // playNote(device, midiMessage);
  }

  // Call the playNote function with the device and MIDI message
  
});


function mouseModeOn(ID) {
  // console.log(deviceArray, ID);
  let foundDevice = deviceArray.find(device => device.ID === ID) || null;
  let mouseModeButton = document.querySelector(`.mouse-mode-on-${ID}`);
  console.log(ID, foundDevice, mouseModeButton);

  if (foundDevice === null) return; // Early exit if device not found

  if (mouseModeArray.length === 0 || !mouseModeArray.find(device => device.ID === ID)) {
    console.log("add");
    mouseModeArray.push(foundDevice);
    mouseModeButton.classList.add("mouse-mode-on");
    
  } else {
    console.log("sub");
    mouseModeArray = mouseModeArray.filter(device => device.ID !== ID);
    mouseModeButton.classList.remove("mouse-mode-on");
  }
  console.log(mouseModeArray);
  populateAxis();
}

function invertOn(ID) {
  // console.log(deviceArray, ID);
  let foundDevice = deviceArray.find(device => device.ID === ID) || null;
  let invertButton = document.querySelector(`.invert-on-${ID}`);
  console.log(ID, foundDevice, invertButton);

  if (foundDevice === null) return; // Early exit if device not found

  if (foundDevice.invert === true) {
    console.log("uninverted");
    invertButton.classList.remove("invert-on");
    foundDevice.invert = false;
  } else {
    foundDevice.invert = true;
    console.log("inverted");
    invertButton.classList.add("invert-on");
  }

  console.log(foundDevice);

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


// ________________________________________________________________________________________________________________________
// ________________________________________________________________________________________________________________________
// ________________________________________________________________________________________________________________________
// ________________INSTRUMENTS_____________________________________________________________________________________________
// ________________________________________________________________________________________________________________________
// ________________________________________________________________________________________________________________________
// ________________________________________________________________________________________________________________________

let trigPressed = false;
let loopPressed = false;


// Create AudioContext
const WAContext = window.AudioContext || window.webkitAudioContext;
const context = new WAContext();
// Create gain node and connect it to audio output
const outputNode = context.createGain();
outputNode.connect(context.destination);

// console.log(context, outputNode)

/** Function to run upon window load. */
window.onload= async function(){
  let norurl;
  if (getUrlVars()["demo"] !== undefined) {
    norurl = "./no/rainstickno.html?demo=" + getUrlVars()["demo"] + "&id=" + getUrlVars()["id"];
    console.log(norurl);
    document.getElementById("link").href = norurl;
    bleDevice = getUrlVars()["demo"] + " " + getUrlVars()["id"];
  }else{
    console.log("BLE Device: " + bleDevice);
  }

  // console.log(window.location.pathname);
  if (window.location.pathname === '/app/instruments.html') {
    // if (window.location.pathname === '/instruments.html') {
    try {
      await setupClock(context, outputNode); // Wait for setupClock to complete
      await setupEffects(context, outputNode); // Then start setupEffects
    } catch (error) {
      console.error('Setup failed:', error);
    }
  } else {
    console.log("skipping instrument setup");
  }

} 

async function setupInstrument(context, outputNode, deviceInfo) {
  closeModal();
  const { name, patcherUrl, dependenciesUrl, selectID, axisID} = deviceInfo;
  console.log(deviceInfo);
  let patcher = null;
  let dependencies = null;
  let device = null;
  try {
    // Fetch patcher and dependencies
    const patcherPromise = fetch(patcherUrl).then(response => response.json());
    const dependenciesPromise = dependenciesUrl
      ? fetch(dependenciesUrl).then(response => response.json())
      : Promise.resolve(null); // or use an empty object if suitable
  
    [patcher, dependencies] = await Promise.all([patcherPromise, dependenciesPromise]);
    if (!window.RNBO) {
        await loadRNBOScript(patcher.desc.meta.rnboversion);
    }

    // Create device
    device = await RNBO.createDevice({ context, patcher });

    // Load dependencies
    if (dependencies) {
      dependencies = dependencies.map(d => d.file ? { ...d, file: "export/" + d.file } : d);
      await device.loadDataBufferDependencies(dependencies);
    }

    // Connect device to output
    // device.node.connect(outputNode);

  } catch (error) {
    handleSetupError(error);
  }
  // const { TimeNow, MessageEvent } = require("@rnbo/js");
  if (name == "Master Clock") {
    device.node.connect(outputNode);
    globalClock = { name: name, device: device, ID: deviceID, selectID: selectID, connectedSensor: null, axisID: axisID, deviceAxis: null };
    makeSlidersClock(device);
  } else if (name == "Effects") {
    device.node.connect(outputNode);
    clockInit(device);
    deviceArray.push({ name: name, device: device, ID: deviceID, selectID: selectID, connectedSensor: null, axisID: axisID, deviceAxis: null });
    makeSliders(device, deviceID, selectID);
  } else if (name == "Drums") {
    let globalFX = deviceArray.find(device => device.name === "Effects") || null;
    device.node.connect(globalFX.device.node);
    clockInit(device);
    deviceArray.push({ name: name, device: device, ID: deviceID, selectID: selectID, connectedSensor: null, axisID: axisID, deviceAxis: null, invert: false});
    makeSliders(device, deviceID, selectID);

  } else if (name == "Melody" || name == "Harmony") {
    let globalFX = deviceArray.find(device => device.name === "Effects") || null;
    device.node.connect(globalFX.device.node);
    clockInit(device);
    deviceArray.push({ name: name, device: device, ID: deviceID, selectID: selectID, connectedSensor: null, axisID: axisID, deviceAxis: null, invert: false });
    makeSliders(device, deviceID, selectID);
  } else {
    let globalFX = deviceArray.find(device => device.name === "Effects") || null;
    // console.log(globalFX,globalFX.device);
    device.node.connect(globalFX.device.node);
    deviceArray.push({ name: name, device: device, ID: deviceID, selectID: selectID, connectedSensor: null, axisID: axisID, deviceAxis: null, invert:false });
    console.log(axisID, selectID);
    makeSliders(device, deviceID, selectID);
    makeMIDIKeyboard(device, dependencies.length, deviceID, name);
  }
  console.log(deviceArray);

  const firstDrumDevice = findDrumsWithLowestId(deviceArray);
  if (firstDrumDevice) {
    rootInit(device);
  }

  if (name == "Effects") {
    
  }

  if (name == "Loop" || name == "Tap" || name == "Rainstick") {
    
    // removeLoadingSI(device);
  }
  // if (name == "Rainstick") {
  //   makeSliders(device, deviceID);
  //   makeMIDIKeyboard(device, dependencies.length, deviceID, name);
  //   // removeLoadingRS(device);
  // } 
  if (name == "Synth1" || name == "Synth2") {
    clockInit(device)
  }

  document.body.onclick = () => {
      context.resume();
  }

  deviceID += 1;
  populateSelect();
}

function handleSetupError(error) {
  const errorContext = { error };
  // Customize error handling as needed
  if (typeof guardrails === "function") {
      guardrails(errorContext);
  } else {
      throw error;
  }
}

function deleteDevice(ID) {
  console.log(ID);
  let globalFX = deviceArray.find(device => device.name === "Effects") || null;
  const deviceIndex = deviceArray.findIndex(device => device.ID === ID);
  if (deviceIndex !== -1) {
    // Get the device
    const deviceToRemove = deviceArray[deviceIndex];
    
    // Disconnect the device from the global output
    if (deviceToRemove.device.node) {
      deviceToRemove.device.node.disconnect(globalFX.device.node);
    }

    // Remove the device from the array
    deviceArray.splice(deviceIndex, 1);
    mouseModeArray = mouseModeArray.filter(device => device.ID !== ID);
    // mouseModeButton.classList.remove("mouse-mode-on");
  } else {
    console.error(`Device with ID ${ID} not found.`);
    return;
  }

  const element = document.getElementById(`device-${ID}`);
  if (element) {
    element.remove();
  } else {
    console.error(`HTML element for device with ID ${ID} not found.`);
  }
  console.log(`delete device-${ID}`);

}

function clockInit(device) {
  // console.log("effect device:", device);
  let masterClock = globalClock.device;
  masterClock.messageEvent.subscribe((ev) => {
    // console.log(`Received message ${ev.tag}: ${ev.payload}`);
    if (ev.tag === "out1" && device.parametersById.get("input_step")) {
      // console.log("from the first outlet", device.context.currentTime, "in1", ev.payload);
      // let event = new MessageEvent(device.context.currentTime * 1000, "in1", ev.payload);
      // device.scheduleEvent(event);
      let input = device.parametersById.get("input_step");
      // console.log(ev.payload);
      input.value = ev.payload;
    }

    if (ev.tag === 'out2' && device.parametersById.get("beats_to_samps")) {
      let param = device.parametersById.get("beats_to_samps");
      
      param.value = ev.payload;
    }

    if (ev.tag === 'out3' && device.parametersById.get("root")) {
      let param = device.parametersById.get("root");

      param.value = ev.payload;
    }

      // console.log(param.value);
  });
}

function rootInit(device) {
  // console.log(globalClock);
    device.messageEvent.subscribe((ev) => {
      // console.log(`Received message ${ev.tag}: ${ev.payload}`);
      if (ev.tag === "out3" && globalClock.device.parametersById.get("root")) {
        // console.log("from the first outlet", device.context.currentTime, "in1", ev.payload);
        // let event = new MessageEvent(device.context.currentTime * 1000, "in1", ev.payload);
        // device.scheduleEvent(event);
        let root = globalClock.device.parametersById.get("root");
        // console.log(ev.payload);
        root.value = ev.payload;
      }
    });
}

function findDrumsWithLowestId(devices) {
  // Filter devices to get only those named "Drums"
  const drumsDevices = devices.filter(device => device.name === "Drums");

  // Use reduce to find the device with the lowest ID
  const deviceWithLowestId = drumsDevices.reduce((lowest, current) => {
    return current.id < lowest.id ? current : lowest;
  }, drumsDevices[0]);
  console.log(deviceWithLowestId);
  return deviceWithLowestId;
}

// Function to setup Loop instrument
async function setupLoop(context, outputNode) {
  const deviceInfo = {
      name: 'Loop',
      patcherUrl: 'export/loop.export.json',
      dependenciesUrl: 'export/dependenciesSI.json',
      selectID: `ss-loop-${deviceID}`,
      axisID: `as-loop-${deviceID}`
  };
  // console.log(deviceInfo);
  await injectLoop(deviceID);
  await setupInstrument(context, outputNode, deviceInfo);
}

// Function to setup Tap instrument
async function setupTap(context, outputNode) {
  const deviceInfo = {
      name: 'Tap',
      patcherUrl: 'export/tap.export.json',
      dependenciesUrl: 'export/dependenciesSI.json',
      selectID: `ss-tap-${deviceID}`,
      axisID: `as-tap-${deviceID}`
  };
  // console.log(deviceInfo);
  await injectTap(deviceID);
  await setupInstrument(context, outputNode, deviceInfo);
}

// Function to setup Rainstick instrument
async function setupRainstick(context, outputNode) {
  const deviceInfo = {
      name: 'Rainstick',
      patcherUrl: 'export/rainstick.export.json',
      dependenciesUrl: 'export/dependenciesRS.json',
      selectID: `ss-rainstick-${deviceID}`,
      axisID: `as-rainstick-${deviceID}`
  };
  await injectRainstick(deviceID);
  await setupInstrument(context, outputNode, deviceInfo);
}

// Function to setup Drums instrument
async function setupDrums(context, outputNode) {
  const deviceInfo = {
      name: 'Drums',
      patcherUrl: 'export/drums.export.json',
      dependenciesUrl: 'export/dependenciesWJ.json',
      selectID: `ss-drums-${deviceID}`,
      axisID: `as-drums-${deviceID}`
  };
  // console.log(deviceInfo);
  await injectDrums(deviceID);
  await setupInstrument(context, outputNode, deviceInfo);
}

// Function to setup Melody instrument
async function setupMelody(context, outputNode) {
  const deviceInfo = {
      name: 'Melody',
      patcherUrl: 'export/melody.export.json',
      dependenciesUrl: null,
      selectID: `ss-melody-${deviceID}`,
      axisID: `as-melody-${deviceID}`
  };
  // console.log(deviceInfo);
  await injectMelody(deviceID);
  await setupInstrument(context, outputNode, deviceInfo);
}

// Function to setup Harmony instrument
async function setupHarmony(context, outputNode) {
  const deviceInfo = {
      name: 'Harmony',
      patcherUrl: 'export/harmony.export.json',
      dependenciesUrl: null,
      selectID: `ss-harmony-${deviceID}`,
      axisID: `as-harmony-${deviceID}`
  };
  // console.log(deviceInfo);
  await injectHarmony(deviceID);
  await setupInstrument(context, outputNode, deviceInfo);
}

// Function to setup Global CLock
async function setupClock(context, outputNode) {
  const deviceInfo = {
      name: 'Master Clock',
      patcherUrl: 'export/masterclock.export.json',
      dependenciesUrl: null,
      selectID: null,
      axisID: null
  };
  await setupInstrument(context, outputNode, deviceInfo);
}

// Function to setup Effects Module
async function setupEffects(context, outputNode) {
  const deviceInfo = {
    name:'Effects',
    patcherUrl: 'export/fx.export.json',
    dependenciesUrl: null,
    selectID: `ss-fx`,
    axisID: `as-fx`
  }
  await setupInstrument(context, outputNode, deviceInfo)
}

async function setupSI(context, outputNode) {
  // Disable the button
  document.getElementById("SIpreset").disabled = true;
  document.getElementById("WJpreset").disabled = true;
  document.getElementById("RSpreset").disabled = true;
  try {
    // Call the setup functions
    await setupTap(context, outputNode);
    await setupLoop(context, outputNode);
  } catch (error) {
    console.error('Setup failed:', error);
  } finally {
    // Re-enable the button after the setup is complete
    document.getElementById("SIpreset").disabled = false;
    document.getElementById("WJpreset").disabled = false;
    document.getElementById("RSpreset").disabled = false;
  }

}

async function setupWJ(context, outputNode) {
  // Disable the button
  document.getElementById("SIpreset").disabled = true;
  document.getElementById("WJpreset").disabled = true;
  document.getElementById("RSpreset").disabled = true;
  try {
    // Call the setup functions
    await setupDrums(context, outputNode);
    await setupMelody(context, outputNode);
    await setupHarmony(context, outputNode);
  } catch (error) {
    console.error('Setup failed:', error);
  } finally {
    // Re-enable the button after the setup is complete
    document.getElementById("SIpreset").disabled = false;
    document.getElementById("WJpreset").disabled = false;
    document.getElementById("RSpreset").disabled = false;
  }

}

async function setupRS(context, outputNode) {
  // Disable the button
  document.getElementById("SIpreset").disabled = true;
  document.getElementById("WJpreset").disabled = true;
  document.getElementById("RSpreset").disabled = true;
  try {
    // Call the setup functions
    await setupRainstick(context, outputNode);

  } catch (error) {
    console.error('Setup failed:', error);
  } finally {
    // Re-enable the button after the setup is complete
    document.getElementById("SIpreset").disabled = false;
    document.getElementById("WJpreset").disabled = false;
    document.getElementById("RSpreset").disabled = false;
  }

}

// async function setupSynth1(context, outputNode) {
//   const deviceInfo = {
//       name: 'Synth1',
//       patcherUrl: 'export/synth1.export.json',
//       dependenciesUrl: null,
//       selectID: null,
//       axisID: null
//   };
//   await setupInstrument(context, outputNode, deviceInfo);
// }
// async function setupSynth2(context, outputNode) {
//   const deviceInfo = {
//       name: 'Synth2',
//       patcherUrl: 'export/synth2.export.json',
//       dependenciesUrl: null,
//       selectID: null,
//       axisID: null
//   };
//   await setupInstrument(context, outputNode, deviceInfo);
// }

function makeSlidersClock(device) {
  let param = device.parametersById.get("tempo")
  let container = document.getElementById('tempo');
  let type = 'tempo';

  let slider = new Slider(container, param, device, type)
  slider.initializeSliders();
}

// function removeLoadingRS(device) {

//     const param = device.parametersById.get(`onload`);
//     param.changeEvent.subscribe((e) => {

//         if(e === 1) {
//             loadingIcon = document.querySelectorAll('.loading-icon');

//             loadingIcon.forEach(icon => {
//                 icon.style.display = 'none';
//             });

//             overlayElements = document.querySelectorAll('.connect-wash');

//             overlayElements.forEach(overlay => {
//                 overlay.style.backgroundColor = '#230543df';
//             });
//         }
//     });
// }

// function makeMIDIKeyboardRS(device, samples) {
//     const sdiv = document.querySelector(`.sounds-rs-${ID}`);
//     if (samples === 0) return;

//     let noSamples = document.getElementById("no-samples-label-rs");
//     noSamples.remove();
//     const dropdown = document.querySelector(`.rs-dropdown-${ID}`);


//     const descriptions = device.dataBufferDescriptions;
//     const buf = device.parametersById.get("whichbuffer");

//     // Each description will have a unique id, as well as a "file" or "url" key, depending on whether 
//     // the buffer references a local file or a remote URL
//     descriptions.forEach((buffer, index) => {
//             // if (!!desc.file) {
//             //     console.log(`Buffer with id ${desc.id} references file ${desc.file}`);
//             // } else {
//             //     console.log(`Buffer with id ${desc.id} references remote URL ${desc.url}`);
//             // }
//         if (buffer.id != "myBuffer"){
//             index = index - 1;
//             const option = document.createElement("option");
//             let bufferText = buffer.id
//             let optionText = bufferText.replace(new RegExp('b_', 'g'), '');
//             optionText = optionText.replace(new RegExp('_wav', 'g'), '');
//             optionText = optionText.replace(new RegExp('_', 'g'), ' ');


//             option.textContent = optionText;
//             option.value = index; 
//             dropdown.appendChild(option);
//         }

//     });

//     dropdown.addEventListener("change", (event) => {
//         buf.value = event.target.value;
//         console.log(event.target.value)
//     });

//     const rstestdiv = document.querySelector(`.rs-test-${ID}`);
//     const key = document.createElement("div");
//     const label = document.createElement("p");
//     label.textContent = "Test Sound:";
//     key.appendChild(label);
//     key.addEventListener("pointerdown", () => {
//         let midiChannel = 5;
//         // Format a MIDI message paylaod, this constructs a MIDI on event
//         let noteOnMessage = [
//             144 + midiChannel, // Code for a note on: 10010000 & midi channel (0-15)
//             60, // MIDI Note
//             100 // MIDI Velocity
//         ];
    
    
//         // Including rnbo.min.js (or the unminified rnbo.js) will add the RNBO object
//         // to the global namespace. This includes the TimeNow constant as well as
//         // the MIDIEvent constructor.
//         // let midiPort = 0;
    
//         // When scheduling an event to occur in the future, use the current audio context time
//         // multiplied by 1000 (converting seconds to milliseconds) for now.
//         let noteOnEvent = new RNBO.MIDIEvent(device.context.currentTime * 1000, 0, noteOnMessage);

//         device.scheduleEvent(noteOnEvent);
//         key.classList.add("clicked");
//     });
//     key.addEventListener("pointerup", () => key.classList.remove("clicked"));
//     rstestdiv.appendChild(key);
// }

// function removeLoadingSI(device) {
//     const param = device.parametersById.get(`onload`);
//     param.changeEvent.subscribe((e) => {

//         if(e === 1) {
//             loadingIcon = document.querySelectorAll('.loading-icon');

//             loadingIcon.forEach(icon => {
//                 icon.style.display = 'none';
//             });

//             overlayElements = document.querySelectorAll('.connect-wash');

//             overlayElements.forEach(overlay => {
//                 overlay.style.backgroundColor = '#230543df';
//             });
//         }
//     });
// }

function makeMIDIKeyboard(device, samples, ID, name) {
  // console.log("make");
  let dropdown;
  let buf;
  let testdiv;

  if (name == "Loop") {
    console.log("loop");
    const dropdown_cont = document.querySelector(`.loop-dropdown-${ID}`);
    dropdown = dropdown_cont;

    const buf_cont = device.parametersById.get("whichbuffer_cont");
    buf = buf_cont;

    const ltestdiv = document.querySelector(`.loop-test-${ID}`); 
    testdiv = ltestdiv;
    console.log(ltestdiv);

    
  }
  if (name == "Tap") {
    const dropdown_trig = document.querySelector(`.trig-dropdown-${ID}`);
    dropdown = dropdown_trig

    const buf_trig = device.parametersById.get("whichbuffer_trig");
    buf = buf_trig;

    const ttestdiv = document.querySelector(`.trig-test-${ID}`);
    testdiv = ttestdiv;
  }
  if (name == "Rainstick") {
    const dropdown_rs = document.querySelector(`.rs-dropdown-${ID}`);
    dropdown = dropdown_rs;

    const buf_rs = device.parametersById.get("whichbuffer");
    buf = buf_rs;

    const rstestdiv = document.querySelector(`.rs-test-${ID}`);
    testdiv = rstestdiv;
  }
  if (samples === 0) return;


  // let noSamples = document.getElementById("no-samples-label-rs");
  // noSamples.remove();
  // noSamples = document.getElementById(`no-samples-label-trig`);
  // noSamples.remove();
  // noSamples = document.getElementById(`no-samples-label-loop`);
  // noSamples.remove();


  const descriptions = device.dataBufferDescriptions;
  // console.log(descriptions);

  // Each description will have a unique id, as well as a "file" or "url" key, depending on whether 
  // the buffer references a local file or a remote URL
  descriptions.forEach((buffer, index) => {
      if (buffer.id != "myBuffer" && buffer.id != "trig_snd" && buffer.id != "loop_snd"){
        index = index; //TODO Might need to be index not index - 1
        if(name== "Rainstick") {
          index = index - 1;
        }
        const option = document.createElement("option");
        let bufferText = buffer.id
        // console.log(buffer.id);
        let optionText = bufferText.replace(new RegExp('b_', 'g'), '');
        optionText = optionText.replace(new RegExp('_wav', 'g'), '');
        optionText = optionText.replace(new RegExp('_', 'g'), ' ');
        option.textContent = optionText;
        option.value = index; 
        dropdown.appendChild(option);
      }
  });

  dropdown.addEventListener("change", (event) => {
      buf.value = event.target.value;
      // console.log(event.target.value)
  });

  const key = document.createElement("div");
  const label = document.createElement("p");
  label.textContent = "▶";
  label.style.color = "var(--text-d)"
  key.appendChild(label);
  key.addEventListener("pointerdown", () => {
      let midiChannel = 5;
      // Format a MIDI message paylaod, this constructs a MIDI on event
      let noteOnMessage = [
          144 + midiChannel, // Code for a note on: 10010000 & midi channel (0-15)
          60, // MIDI Note
          100 // MIDI Velocity
      ];
  
  
      // Including rnbo.min.js (or the unminified rnbo.js) will add the RNBO object
      // to the global namespace. This includes the TimeNow constant as well as
      // the MIDIEvent constructor.
      // let midiPort = 0;
  
      // When scheduling an event to occur in the future, use the current audio context time
      // multiplied by 1000 (converting seconds to milliseconds) for now.
      let noteOnEvent = new RNBO.MIDIEvent(device.context.currentTime * 1000, 0, noteOnMessage);

      device.scheduleEvent(noteOnEvent);
      key.classList.add("clicked");
  });
  key.addEventListener("pointerup", () => key.classList.remove("clicked"));
  testdiv.appendChild(key);

    // descriptions.forEach((buffer, index) => {
    //         // if (!!desc.file) {
    //         //     console.log(`Buffer with id ${desc.id} references file ${desc.file}`);
    //         // } else {
    //         //     console.log(`Buffer with id ${desc.id} references remote URL ${desc.url}`);
    //         // }
    //     if (buffer.id != "trig_snd" && buffer.id != "loop_snd")
    //     {
    //         index = index;
    //         const option_trig = document.createElement("option");
    //         const option_cont = document.createElement("option");
                
    //         let bufferText = buffer.id
    //         let optionText = bufferText.replace(new RegExp('b_', 'g'), '');
    //         optionText = optionText.replace(new RegExp('_wav', 'g'), '');
    //         optionText = optionText.replace(new RegExp('_', 'g'), ' ');




    //         option_trig.textContent = optionText;
    //         option_trig.value = index; 


    //         option_cont.textContent = optionText;
    //         option_cont.value = index;

    //         dropdown_trig.appendChild(option_trig);
    //         dropdown_cont.appendChild(option_cont);

            
    //     }

    // });

    // dropdown_trig.addEventListener("change", (event) => {
    //     buf_trig.value = event.target.value;
    //     console.log(event.target.value)
    // });

    // dropdown_cont.addEventListener("change", (event) => {
    //     buf_cont.value = event.target.value;
    // });

    // //fix this later need to figure out why it isn't being routed propperly in RNBO for now using channel 5 and 6 but should be able to send different note messages on channel 5 per say

    
    

    // const keytrig = document.createElement("div");
    // const labeltrig = document.createElement("p");
    // labeltrig.textContent = "Test Sound:";
    // keytrig.appendChild(labeltrig);
    // keytrig.addEventListener("pointerdown", () => {
    //     let midiChannel = 5;
    //     // Format a MIDI message paylaod, this constructs a MIDI on event
    //     let noteOnMessage = [
    //         144 + midiChannel, // Code for a note on: 10010000 & midi channel (0-15)
    //         60, // MIDI Note
    //         100 // MIDI Velocity
    //     ];
    
    
    //     // Including rnbo.min.js (or the unminified rnbo.js) will add the RNBO object
    //     // to the global namespace. This includes the TimeNow constant as well as
    //     // the MIDIEvent constructor.
    //     // let midiPort = 0;
    
    //     // When scheduling an event to occur in the future, use the current audio context time
    //     // multiplied by 1000 (converting seconds to milliseconds) for now.
    //     let noteOnEvent = new RNBO.MIDIEvent(device.context.currentTime * 1000, 0, noteOnMessage);

    //     device.scheduleEvent(noteOnEvent);
    //     keytrig.classList.add("clicked");
    // });
    // keytrig.addEventListener("pointerup", () => keytrig.classList.remove("clicked"));
    // ttestdiv.appendChild(keytrig);

    // const keyloop = document.createElement("div");
    // const labelloop = document.createElement("p");
    // labelloop.textContent = "Test Sound:";
    // keyloop.appendChild(labelloop);
    // keyloop.addEventListener("pointerdown", () => {
    //     let midiChannel = 6;
    //     // Format a MIDI message paylaod, this constructs a MIDI on event
    //     let noteOnMessage = [
    //         144 + midiChannel, // Code for a note on: 10010000 & midi channel (0-15)
    //         60, // MIDI Note
    //         100 // MIDI Velocity
    //     ];
    
    
    //     // Including rnbo.min.js (or the unminified rnbo.js) will add the RNBO object
    //     // to the global namespace. This includes the TimeNow constant as well as
    //     // the MIDIEvent constructor.
    //     // let midiPort = 0;
    
    //     // When scheduling an event to occur in the future, use the current audio context time
    //     // multiplied by 1000 (converting seconds to milliseconds) for now.
    //     let noteOnEvent = new RNBO.MIDIEvent(device.context.currentTime * 1000, 0, noteOnMessage);

    //     device.scheduleEvent(noteOnEvent);
    //     keyloop.classList.add("clicked");
    // });
    // keyloop.addEventListener("pointerup", () => keyloop.classList.remove("clicked"));
    // ltestdiv.appendChild(keyloop);
}

function makeSliders(device, ID, selectID) {
  device.parameters.forEach(param => {
    // console.log(param);
    let container = null;
    let type = null;

    if (param.name === "sensor_vis") {
      container = document.getElementById(selectID);
      type = 'sensor-select-vis';
      // console.log(container);
    }

    //Loop Params
    if (param.name === "info_loop_Visualization"){
      container = [document.querySelector(`.sensitivity-visualization-${ID}`), document.querySelector(`.loop-spin-${ID}`)];
      type = 'visualizeLoop';
    }
    if (param.name === "user_loop_Volume"){
      container = document.querySelector(`.vol-loop-${ID}`);
      type = 'vol';
      console.log(container, type);
    }
    if (param.name === "user_loop_Sensitivity"){
      container = document.querySelector(`.sensitivity-slider-${ID}`);
      type = 'sens';
    }

    //Tap Params
    if (param.name === "info_trigger_Visualization") {
      container = document.querySelector(`.threshold-visualization-${ID}`);
      type = 'visualize';
    }
    if (param.name === "info_trigger_threshold"){
      container = document.querySelector(`.threshold-slider-arrow-${ID}`);
      type = 'param';
    }
    if (param.name === "user_trig_Volume"){
      container = document.querySelector(`.vol-trig-${ID}`);
      type = 'vol';
    }
    if (param.name === "blap"){
      container = document.querySelector(`.tap-blap-${ID}`);
      type = 'visualizeTap';
    }

    //Rainstick Params
    if (param.name === "user_Organic_Modes"){
      container = document.querySelector(`.modes-${ID}`);
      type = 'paramlabeled';
    }
    if (param.name === "user_Volume"){
        container = document.querySelector(`.vol-rs-${ID}`);
        type = 'vol';
    }
    if (param.name === "visualize") {
        container = document.querySelector(`.rainstick-tilt-${ID}`);
        type = 'visualizeRS';
    }
    if (param.name === "user_Grains"){
        container = document.querySelector(`.grain-number-rs-${ID}`);
        type = 'paramlabeled';
    }
    if (param.name === "user_Grain_Size"){
        container = document.querySelector(`.grain-size-rs-${ID}`);
        type = 'paramlabeled';
    }
    if (param.name === "user_Grain_Pitch"){
        container = document.querySelector(`.grain-pitch-rs-${ID}`);
        type = 'paramlabeled';
    }
    if (param.name === "user_Speed"){
        container = document.querySelector(`.speed-slider-${ID}`);
        type = 'speed';
    }

    // Drums Params
    if (param.name === "user_p1_Threshold"){
        container = document.querySelector(`.drums-sensitivity-${ID}`);
        type = 'sens';
    }
    if (param.name === "visualize_drums"){
      console.log("hey");
        container = document.querySelector(`.visualize-drums-${ID}`);
        console.log(container);
        type = 'visualizeDrums';
    }
    if (param.name === "user_p1_Drums_Volume"){
        container = document.querySelector(`.vol-drums-${ID}`);
        type = 'vol';
    }
    if (param.name === "hat_toggle"){
        container = document.querySelector(`.speed-hat-${ID}`);
        type = 'speed';
    }

    // Melody Params
    if (param.name === "user_p3_Melody_Volume"){
      container = document.querySelector(`.vol-melody-${ID}`);
      type = 'vol';
    }
    if (param.name === "user_p3_gate_probability"){
        container = document.querySelector(`.probability-slider-${ID}`);
        type = 'prob';
    }
    if (param.name === "visualize_melody"){
        container = document.querySelector(`.visualize_melody-${ID}`);
        type = 'visualizeMelody';
    }

    // Harmony Params
    if (param.name === "user_p2_Harmony_Volume"){
      container = document.querySelector(`.vol-harmony-${ID}`);
      type = 'vol';
    }
    if (param.name === "visualize_harmony"){
      container = document.querySelector(`.visualize-harmony-${ID}`);
      type = 'visualizeHarmony';
    }

    // FX Params
    if (param.name === "visualize_effects"){
      container = document.getElementById('dj-hand');
      type = 'visualizeFX';
    }
    if (param.name === "user_p2_FX_Volume"){
        container = document.getElementById('vol-effects');
        type = 'vol';
    }
    if (param.name === "user_p2_FX_choice"){
        container = document.getElementById('effects-button-container');
        type = 'choices';
        // console.log(type);
    }
    if (param.name === "reverb") {
      container = document.querySelector(`.reverb`);
      type = 'verb'
    }

    // console.log(container);
    if (container) {
      // console.log(ID, container);
      let slider = new Slider(container, param, device, type)
      slider.initializeSliders();
    }
  });
}

async function injectLoop(ID) {
  const htmlContent = `
  <div class="instrument-block" id="device-${ID}">
  <div class="i-block-buttons">
    <button class="invert-button invert-on-${ID}" onClick="invertOn(${ID})">Invert</button>
    <button class="mouse-mode-button mouse-mode-on-${ID}" onClick="mouseModeOn(${ID})">Mouse Mode</button>
    <button class="device-delete-button" onClick="deleteDevice(${ID})"><img src="./media/addDeviceSide.svg" alt="Delete Instrument"></button>
  </div>
  <div class="i-block-sensors">
    <h2 style="color:var(--text)"><u>Loop</u></h2>
    <div class="plug-l"></div>
    <select id="ss-loop-${ID}" class="sensor-select"></select>
    <select id="as-loop-${ID}" class="axis-select"></select>
    <h2 id="as-loop-${ID}-mode" class="axis-mode"></h2>
  </div>

  <div id="sample-group">
    <div class="rnbo-clickable-keyboard loop-test-${ID}" id="loop-test"></div> 
    <select id="loop-dropdown" class="sample-select loop-dropdown-${ID}"></select>
  </div>

  <div class="i-block-vol-next-controls">
    <div class="volume-slider-container">
      <input type="range" class="volume-slider vol-loop-${ID}" style="width: 240px; bottom: -150px;">
      <span id="vol-slider-label" style="top: 150px; left: -30px;"><h2 style="color: var(--text-l);">volume</h2></span>
    </div>
    <div class="horizontal-slider-labeled-loop">
      <input type="range" class="sensitivity-slider sensitivity-slider-${ID}">
      <span id="loop-label"><h2 style="color: var(--primary);">Sensitivity</h2></span>
    </div>

    <div class="loop-visualize">
      <img id="loop-spin" class="loop-spin-${ID}" src="./media/loopvis.svg" alt="Loop Visualization">
      <input type="range" class="sensitivity-visualization sensitivity-visualization-${ID}">
    </div>
  </div>
</div>
`;
document.querySelector('.injected-instruments').insertAdjacentHTML('beforeend', htmlContent);
}

async function injectTap(ID) {
  const htmlContent = `
  <div class="instrument-block" id="device-${ID}">
  <div class="i-block-buttons">
    <button class="invert-button invert-on-${ID}" onClick="invertOn(${ID})">Invert</button>
    <button class="mouse-mode-button mouse-mode-on-${ID}" onClick="mouseModeOn(${ID})">Mouse Mode</button>
    <button class="device-delete-button" onClick="deleteDevice(${ID})"><img src="./media/addDeviceSide.svg" alt="Delete Instrument"></button>
  </div>
  <div class="i-block-sensors">
    <h2 style="color:var(--text)"><u>Tap</u></h2>
    <div class="plug-l" style="margin-left: 30px;"></div>
    <select id="ss-tap-${ID}" class="sensor-select"></select>
    <select id="as-tap-${ID}" class="axis-select"></select>
    <h2 id="as-tap-${ID}-mode" class="axis-mode">MODE</h2>
  </div>

  <div id="sample-group">
    <div class="rnbo-clickable-keyboard trig-test-${ID}" id="trig-test"></div> 
    <select id="loop-dropdown" class="sample-select trig-dropdown-${ID}"></select>
  </div>

  <div class="i-block-vol-next-controls">
    <div class="volume-slider-container">
      <input type="range" class="volume-slider vol-trig-${ID}" style="width: 240px; bottom: -150px;">
      <span id="vol-slider-label" style="top: 150px; left: -30px;"><h2 style="color: var(--text-l);">volume</h2></span>
    </div>

    <div class="tap-params">
      <div class="two-sliders-on-top">
        <input type="range" class="threshold-visualization threshold-visualization-${ID}">
        <input type="range" class="threshold-slider-arrow threshold-slider-arrow-${ID}">
      </div>
      <span id="loop-label"><h2 style="color: var(--primary);">Threshold</h2></span>
    </div>
    

    <div class="loop-visualize">
      <img id="tap-blap" class="tap-blap-${ID}" src="./media/tapvis.svg" alt="Tap Visualization">
    </div>
  </div>

</div>
`;

document.querySelector('.injected-instruments').insertAdjacentHTML('beforeend', htmlContent);
}

function injectRainstick(ID) {
  const htmlContent = `

  <div class="instrument-block" id="device-${ID}">
  <div class="i-block-buttons">
    <button class="invert-button invert-on-${ID}" onClick="invertOn(${ID})">Invert</button>
    <button class="mouse-mode-button mouse-mode-on-${ID}" onClick="mouseModeOn(${ID})">Mouse Mode</button>
    <button class="device-delete-button" onClick="deleteDevice(${ID})"><img src="./media/addDeviceSide.svg" alt="Delete Instrument"></button>
  </div>
    <div class="i-block-sensors">
      <h2 style="color:var(--text)"><u>Rainstick</u></h2>
      <div class="plug-l"></div>
      <select id="ss-rainstick-${ID}" class="sensor-select"></select>
      <select id="as-rainstick-${ID}" class="axis-select"></select>
      <h2 id="as-rainstick-${ID}-mode" class="axis-mode">MODE</h2>

    </div>

    <div id="sample-group">
      <div class="rnbo-clickable-keyboard rs-test-${ID}" id="rs-test"></div> 
      <select id="rs-dropdown" class="sample-select rs-dropdown-${ID}"></select>

    </div>

    <div class="i-block-vol-next-controls">
      <div class="volume-slider-container">
        <input type="range" class="volume-slider vol-rs-${ID}" style="width: 300px; bottom: -200px;">
        <span id="vol-slider-label" style="top: 230px; left: -30px;"><h2 style="color: var(--text-l);">volume</h2></span>
      </div>

      <div class="grain-main">
        <div class="three-sliders-on-top">

          <div class="speed-rs-container">
            <span id="speed-rs-label"><h2>Speed:</h2></span>
            <input type="range" id="speed-rs" class="speed-rs-slider speed-slider-${ID}">

          </div>

          <div class="grain-container">
            <div id="number-few" class="grain-slider-icons"></div>
            <!-- <span id="grain-title" style="margin-left: 50%;">number</span> -->
            <input type="range" id="grain-number-rs" class="grain-slider grain-number-rs-${ID}">
            <div class="grain-label" id="grain-number-label"><span>num</span></div>
            <div id="number-many" class="grain-slider-icons"></div>
          </div> 

          <div class="grain-container">
            <div id="size-small" class="grain-slider-icons"></div>
            <!-- <span id="grain-title" style="margin-left: -50%;">size</span> -->
            <input type="range" id="grain-size-rs" class="grain-slider grain-size-rs-${ID}">
            <div class="grain-label" id="grain-size-label"><span>size</span></div>
            <div id="size-large" class="grain-slider-icons"></div>
          </div>
          <div class="grain-container">
            <div id="pitch-low" class="grain-slider-icons"></div>
            <!-- <span id="grain-title" style="margin-left: 50%;">pitch</span> -->
            <input type="range" id="grain-pitch-rs" class="grain-slider grain-pitch-rs-${ID}">
            <div class="grain-label" id="grain-pitch-label"><span>pitch</span></div>
            <div id="pitch-high" class="grain-slider-icons"></div>
          </div>
          <div class="grain-container">
            <div id="random-normal" class="grain-slider-icons"></div>
            <!-- <span id="grain-title" style="margin-left: -45%;">randomness</span> -->
            <input type="range" id="modes" class="grain-slider modes-${ID}">
            <div class="grain-label" id="grain-modes-label"><span>???</span></div>
            <div id="random-random" class="grain-slider-icons"></div>
          </div>
        </div>
      </div>

      <div class="rainstick-visualize"><div id="rainstick-tilt" class="rainstick-tilt-${ID}"></div></div>

    </div>
  </div>
  
  `;

  document.querySelector('.injected-instruments').insertAdjacentHTML('beforeend', htmlContent);
}

async function injectMelody(ID) {
  htmlContent = `
  <div class="instrument-block" id="device-${ID}">
  <div class="i-block-buttons">
    <button class="invert-button invert-on-${ID}" onClick="invertOn(${ID})">Invert</button>
    <button class="mouse-mode-button mouse-mode-on-${ID}" onClick="mouseModeOn(${ID})">Mouse Mode</button>
    <button class="device-delete-button" onClick="deleteDevice(${ID})"><img src="./media/addDeviceSide.svg" alt="Delete Instrument"></button>
  </div>
  <div class="i-block-sensors">
    <h2 style="color:var(--text)"><u>Melody</u></h2>
    <div class="plug-l"></div>
    <select id="ss-melody-${ID}" class="sensor-select"></select>
    <select id="as-melody-${ID}" class="axis-select"></select>
    <h2 id="as-melody-${ID}-mode" class="axis-mode">MODE</h2>
  </div>
  <div class="i-block-vol-next-controls">
    <div class="volume-slider-container">
      <input type="range" class="volume-slider vol-melody-${ID}" style="bottom:-120px; width: 200px;">
      <span id="vol-slider-label" style="top: 110px; left: -10px;"><h2 style="color: var(--text-l);">volume</h2></span>
    </div>
    <div class="horizontal-slider-labeled">
      <input type="range" id="probability-slider" class="probability-slider probability-slider-${ID}" style="height: 50%; margin-top: -40px;">
      <span id="prob-label"><h2 style="color: var(--primary);">Probability</h2></span>
    </div>
    <div class="wearable-jazz-image visualize_melody-${ID}" id="visualize_melody"></div>
  </div>
</div>
  `
  document.querySelector('.injected-instruments').insertAdjacentHTML('beforeend', htmlContent);
}

async function injectDrums(ID) {
  console.log(ID);
  htmlContent = `
  <div class="instrument-block" id="device-${ID}">
    <div class="i-block-buttons">
      <button class="invert-button invert-on-${ID}" onClick="invertOn(${ID})">Invert</button>
      <button class="mouse-mode-button mouse-mode-on-${ID}" onClick="mouseModeOn(${ID})">Mouse Mode</button>
      <button class="device-delete-button" onClick="deleteDevice(${ID})"><img src="./media/addDeviceSide.svg" alt="Delete Instrument"></button>
    </div>
    <div class="i-block-sensors">
      <h2 style="color:var(--text)"><u>Drums</u></h2>
      <div class="plug-l"></div>
      <select id="ss-drums-${ID}" class="sensor-select"></select>
      <select id="as-drums-${ID}" class="axis-select"></select>
      <h2 id="as-drums-${ID}-mode" class="axis-mode">MODE</h2>
    </div>
    <div class="i-block-vol-next-controls">
      <div class="volume-slider-container">
        <input type="range" class="volume-slider vol-drums-${ID}" style="width: 190px; bottom: -130px;">
        <span id="vol-slider-label" style="top: 120px; left: -20px;"><h2 style="color: var(--text-l);">volume</h2></span>
      </div>
      <div class="drum-slider-container" style="margin-right: 20px; padding-right: 23px;">
        <div class="hat-wrapper">
          <span id="hat-label"><h2 style="color:var(--primary);">Click:</h2></span>
          <input type="range" id="speed-hat" class="hat-slider speed-hat-${ID}" style="width: 150px;">
        </div>
        <div class="sens-wrapper">
          <input type="range" id="drums-sensitivity" class="drum-sensitivity-slider drums-sensitivity-${ID}">
          <span id="sens-label"><h2 style="color:var(--primary);">Sensitivity</h2></span>
        </div>
      </div>
      <div class="wearable-jazz-image visualize-drums-${ID}" id="visualize-drums">
      
      </div>
    </div>
  </div>
  `
  document.querySelector('.injected-instruments').insertAdjacentHTML('beforeend', htmlContent);
}

async function injectHarmony(ID) {
  htmlContent = `
  <div class="instrument-block" id="device-${ID}">
  <div class="i-block-buttons">
    <button class="invert-button invert-on-${ID}" onClick="invertOn(${ID})">Invert</button>
    <button class="mouse-mode-button mouse-mode-on-${ID}" onClick="mouseModeOn(${ID})">Mouse Mode</button>
    <button class="device-delete-button" onClick="deleteDevice(${ID})"><img src="./media/addDeviceSide.svg" alt="Delete Instrument"></button>
  </div>
    <div class="i-block-sensors">
      <h2 style="color:var(--text)"><u>Harmony</u></h2>
      <div class="plug-l"></div>
      <select id="ss-harmony-${ID}" class="sensor-select"></select>
      <select id="as-harmony-${ID}" class="axis-select"></select>
      <h2 id="as-harmony-${ID}-mode" class="axis-mode">MODE</h2>
    </div>
    <div class="i-block-vol-next-controls">
      <div class="volume-slider-container">
        <input type="range" class="volume-slider vol-harmony-${ID}" style="width: 160px; bottom: -100px;">
        <span id="vol-slider-label" style="top: 70px; left: -30px;"><h2 style="color: var(--text-l);">volume</h2></span>
      </div>
      <div class="harmony-piano">
        <div class="visualize-harmony-${ID} harmony-img-container">
          <img src="./media/Harmonyvis.svg" alt="Harmony Piano">
        </div>
      </div>
    </div>
  </div>

  `
  document.querySelector('.injected-instruments').insertAdjacentHTML('beforeend', htmlContent);
}