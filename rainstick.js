

















/** Global Variables */
var connectDevice = null;
var synth;
var bleDevice;
var device;
var sensorArray = [];

/** Function to run upon window load. */
window.onload=function(){
  let norurl;
  if (getUrlVars()["demo"] !== undefined) {
    norurl = "./no/rainstickno.html?demo=" + getUrlVars()["demo"] + "&id=" + getUrlVars()["id"];
    console.log(norurl);
    document.getElementById("link").href = norurl;
    bleDevice = getUrlVars()["demo"] + " " + getUrlVars()["id"];
  }else{
    console.log("BLE Device: " + bleDevice);
  }

  setup();
}






















async function setup() {
    const patchExportURL = "export/rainstick.export.json";

    // Create AudioContext
    const WAContext = window.AudioContext || window.webkitAudioContext;
    const context = new WAContext();

    // Create gain node and connect it to audio output
    const outputNode = context.createGain();
    outputNode.connect(context.destination);
    
    // Fetch the exported patcher
    let response, patcher;
    try {
        response = await fetch(patchExportURL);
        patcher = await response.json();
    
        if (!window.RNBO) {
            // Load RNBO script dynamically
            // Note that you can skip this by knowing the RNBO version of your patch
            // beforehand and just include it using a <script> tag
            await loadRNBOScript(patcher.desc.meta.rnboversion);
        }

    } catch (err) {
        const errorContext = {
            error: err
        };
        if (response && (response.status >= 300 || response.status < 200)) {
            errorContext.header = `Couldn't load patcher export bundle`,
            errorContext.description = `Check app.js to see what file it's trying to load. Currently it's` +
            ` trying to load "${patchExportURL}". If that doesn't` + 
            ` match the name of the file you exported from RNBO, modify` + 
            ` patchExportURL in app.js.`;
        }
        if (typeof guardrails === "function") {
            guardrails(errorContext);
        } else {
            throw err;
        }
        return;
    }
    
    // (Optional) Fetch the dependencies
    let dependencies = [];
    try {
        const dependenciesResponse = await fetch("export/dependencies.json");
        dependencies = await dependenciesResponse.json();

        // Prepend "export" to any file dependenciies
        dependencies = dependencies.map(d => d.file ? Object.assign({}, d, { file: "export/" + d.file }) : d);
    } catch (e) {}

    // Create the device
    try {
        device = await RNBO.createDevice({ context, patcher });
    } catch (err) {
        if (typeof guardrails === "function") {
            guardrails({ error: err });
        } else {
            throw err;
        }
        return;
    }

    // (Optional) Load the samples
    if (dependencies.length)
        await device.loadDataBufferDependencies(dependencies);

    // Connect the device to the web audio graph
    device.node.connect(outputNode);

    // (Optional) Extract the name and rnbo version of the patcher from the description
    //document.getElementById("patcher-title").innerText = (patcher.desc.meta.filename || "Unnamed Patcher") + " (v" + patcher.desc.meta.rnboversion + ")";

    // (Optional) Automatically create sliders for the device parameters
    makeSliders(device);

    // (Optional) Create a form to send messages to RNBO inputs
    //makeInportForm(device);

    // (Optional) Attach listeners to outports so you can log messages from the RNBO patcher
    //attachOutports(device);

    // (Optional) Load presets, if any
    // loadPresets(device, patcher);

      // Usage example:
  const container = document.querySelector('.slider-container');
  const output = document.querySelector('.slider-output');
  
  new Slider(container, (progress) => {
    output.textContent = `Progress: ${Math.round(progress * 100)}%`;
  });

    // (Optional) Connect MIDI inputs
    makeMIDIKeyboard(device, dependencies.length);

    //makeDropArea(device, context);

    document.body.onclick = () => {
        context.resume();
    }

    // Skip if you're not using guardrails.js
    if (typeof guardrails === "function")
        guardrails();
}

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

    //console.log(midiMessage);
    let noteOnEvent = new RNBO.MIDIEvent(device.context.currentTime * 1000 , 0, midiMessage);
    //console.log(noteOnEvent)
    device.scheduleEvent(noteOnEvent);
    

    // let midiEvent;

    // if (midiMessage[0] === 176){
    //     midiEvent = new RNBO.MIDIEvent(device.context.currentTime * 1000, 0, midiMessage);
    //     device.scheduleEvent(midiEvent);
    // }
    // if (midiMessage[0] === 177){
    //     midiEvent = new RNBO.MIDIEvent(device.context.currentTime * 1000, 1, midiMessage);
    //     device.scheduleEvent(midiEvent);
    // }
    // if (midiMessage[0] === 178){
    //     midiEvent = new RNBO.MIDIEvent(device.context.currentTime * 1000, 2, midiMessage);
    //     device.scheduleEvent(midiEvent);
    // }
    // if (midiMessage[0] === 179){
    //     midiEvent = new RNBO.MIDIEvent(device.context.currentTime * 1000, 3, midiMessage);
    //     device.scheduleEvent(midiEvent);
    // }



    // let motion, pitch, roll, gyroX, gyroY, gyroZ;

    // // if

    // const buf = device.parametersById.get("bufswitch");
    // const groove = device.parametersById.get("grooveRate");
    // const viz = device.parametersById.get("visualize");
    // if (midiMessage[0] === 178 && midiMessage[1] === 1){
    //     viz.value = midiMessage[2];
    // }

    // if (midiMessage[0] === 176 && midiMessage[1] === 1){
    //     groove.value = midiMessage[2];
    // }

    // if (device.numMIDIInputPorts === 0) return;
    // // Including rnbo.min.js (or the unminified rnbo.js) will add the RNBO object
    // // to the global namespace. This includes the TimeNow constant as well as
    // // the MIDIEvent constructor.
    // midiChannel = 1;
    // if (midiMessage[1] === 1){
    //     midiMessage = midiMessage[2];
    // }
    // let noteOnMessage = [
    //     144 + midiChannel, // Code for a note on: 10010000 & midi channel (0-15)
    //     midiMessage, // MIDI Note
    //     100 // MIDI Velocity
    // ];

    // let noteOffMessage = [
    //     128 + midiChannel, // Code for a note off: 10000000 & midi channel (0-15)
    //     midiMessage, // MIDI Note
    //     0 // MIDI Velocity
    // ];

    // let midiPort = 0;
    // let noteDurationMs = 2;
    //         // When scheduling an event to occur in the future, use the current audio context time
    // // multiplied by 1000 (converting seconds to milliseconds) for now.
    // let noteOnEvent = new RNBO.MIDIEvent(device.context.currentTime * 1000, midiPort, noteOnMessage);
    // let noteOffEvent = new RNBO.MIDIEvent(device.context.currentTime * 1000 + noteDurationMs, midiPort, noteOffMessage);
    // device.scheduleEvent(noteOnEvent);
    // device.scheduleEvent(noteOffEvent);
}

// function loadPresets(device, patcher) {
//     let presets = patcher.presets || [];
//     if (presets.length < 1) {
//         document.getElementById("rnbo-presets").removeChild(document.getElementById("preset-select"));
//         return;
//     }

//     document.getElementById("rnbo-presets").removeChild(document.getElementById("no-presets-label"));
//     let presetSelect = document.getElementById("preset-select");
//     presets.forEach((preset, index) => {
//         const option = document.createElement("option");
//         option.innerText = preset.name;
//         option.value = index;
//         presetSelect.appendChild(option);
//     });
//     presetSelect.onchange = () => device.setPreset(presets[presetSelect.value].preset);
// }

function makeMIDIKeyboard(device, samples) {
    let sdiv = document.getElementById("rnbo-clickable-keyboard");
    if (samples === 0) return;

    sdiv.removeChild(document.getElementById("no-samples-label"));

    const descriptions = device.dataBufferDescriptions;
    const buf = device.parametersById.get("whichbuffer");

    // Each description will have a unique id, as well as a "file" or "url" key, depending on whether 
    // the buffer references a local file or a remote URL
    descriptions.forEach((buffer, index) => {
            // if (!!desc.file) {
            //     console.log(`Buffer with id ${desc.id} references file ${desc.file}`);
            // } else {
            //     console.log(`Buffer with id ${desc.id} references remote URL ${desc.url}`);
            // }
        if (buffer.id != "myBuffer"){
                index = index - 1;
                const key = document.createElement("div");
                const label = document.createElement("p");
                label.textContent = buffer.id;
                label.style.fontWeight = "bold";
                label.style.fontFamily = "Roboto";
                label.style.fontSize = "20px";
                key.appendChild(label);
                key.addEventListener("pointerdown", () => {
                    buf.value = index;

                    key.classList.add("clicked");
            });

            key.addEventListener("pointerup", () => key.classList.remove("clicked"));

            sdiv.appendChild(key);
        }

    });




//     const midiNotes = [49, 52, 56, 63];
//     midiNotes.forEach(note => {
//         const key = document.createElement("div");
//         const label = document.createElement("p");
//         label.textContent = note;
//         key.appendChild(label);
//         key.addEventListener("pointerdown", () => {
//             let midiChannel = 0;

//             // Format a MIDI message paylaod, this constructs a MIDI on event
//             let noteOnMessage = [
//                 144 + midiChannel, // Code for a note on: 10010000 & midi channel (0-15)
//                 note, // MIDI Note
//                 100 // MIDI Velocity
//             ];
        
//             let noteOffMessage = [
//                 128 + midiChannel, // Code for a note off: 10000000 & midi channel (0-15)
//                 note, // MIDI Note
//                 0 // MIDI Velocity
//             ];
        
//             // Including rnbo.min.js (or the unminified rnbo.js) will add the RNBO object
//             // to the global namespace. This includes the TimeNow constant as well as
//             // the MIDIEvent constructor.
//             let midiPort = 0;
//             let noteDurationMs = 250;
        
//             // When scheduling an event to occur in the future, use the current audio context time
//             // multiplied by 1000 (converting seconds to milliseconds) for now.
//             let noteOnEvent = new RNBO.MIDIEvent(device.context.currentTime * 1000, midiPort, noteOnMessage);
//             let noteOffEvent = new RNBO.MIDIEvent(device.context.currentTime * 1000 + noteDurationMs, midiPort, noteOffMessage);
        
//             device.scheduleEvent(noteOnEvent);
//             device.scheduleEvent(noteOffEvent);

//             key.classList.add("clicked");
//         });

//         key.addEventListener("pointerup", () => key.classList.remove("clicked"));

//         mdiv.appendChild(key);
//     });
}


class Slider {
    constructor(container, onChange) {
      this.container = container;
      this.onChange = onChange;
      this.bar = this.container.querySelector('.slider-bar');
      this.thumb = this.container.querySelector('.slider-thumb');
      this.progressText = this.container.querySelector('.slider-progress');
      this.isDragging = false;
  
      this.thumb.addEventListener('mousedown', this.startDragging.bind(this));
      this.container.addEventListener('mousemove', this.drag.bind(this));
      this.container.addEventListener('mouseup', this.stopDragging.bind(this));
      this.container.addEventListener('mouseleave', this.stopDragging.bind(this));
    }
  
    startDragging(event) {
      this.isDragging = true;
      this.drag(event);
    }
  
    drag(event) {
      if (this.isDragging) {
        const containerRect = this.container.getBoundingClientRect();
        const positionX = event.clientX - containerRect.left;
        const progress = Math.max(0, Math.min(1, positionX / containerRect.width));
        this.updateSlider(progress);
        this.onChange(progress);
      }
    }
  
    stopDragging() {
      this.isDragging = false;
    }
  
    updateSlider(progress) {
      this.thumb.style.left = `${progress * 100}%`;
      this.bar.style.width = `${progress * 100}%`;
      this.progressText.textContent = `${Math.round(progress * 100)}%`;
    }
}


function makeSliders(device) {
    let pdiv = document.getElementById("rnbo-parameter-sliders");
    let sdiv = document.getElementById("rnbo-sensor-sliders");
    let noSensorLabel = document.getElementById("no-sensor-label");
    let noParamLabel = document.getElementById("no-param-label");
    if (noParamLabel && device.numParameters > 0) pdiv.removeChild(noParamLabel);

    //* fix *// 
    if (noParamLabel && device.numParameters > 0) sdiv.removeChild(noSensorLabel);

    // This will allow us to ignore parameter update events while dragging the slider.
    let isDraggingSlider = false;
    let uiElements = {};

    device.parameters.forEach(param => {
        // Subpatchers also have params. If we want to expose top-level
        // params only, the best way to determine if a parameter is top level
        // or not is to exclude parameters with a '/' in them.
        // You can uncomment the following line if you don't want to include subpatcher params
        // if (param.id.includes("/")) return;

        if (param.id.includes("buffer")) return;
        
        if (param.id.includes("sensor")) {
            // Create a label, an input slider and a value display
            let label = document.createElement("label");
            let slider = document.createElement("input");
            let text = document.createElement("label");
            let sliderContainer = document.createElement("div");
            sliderContainer.appendChild(label);
            sliderContainer.appendChild(slider);
            sliderContainer.appendChild(text);
            

            // Add a name for the label
            label.setAttribute("name", param.name);
            label.setAttribute("for", param.name);
            label.setAttribute("class", "sensor-label");
            label.textContent = `${param.name}: `;
            text = param.name;

            // Make each slider reflect its parameter
            slider.setAttribute("type", "range");
            slider.setAttribute("class", "param-slider");
            slider.setAttribute("id", param.id);
            slider.setAttribute("name", param.name);
            slider.setAttribute("min", param.min);
            slider.setAttribute("max", param.max);
            if (param.steps > 1) {
                slider.setAttribute("step", (param.max - param.min) / (param.steps - 1));
            } else {
                slider.setAttribute("step", (param.max - param.min) / 1000.0);
            }
            slider.setAttribute("value", param.value);

            // Make each slider control its parameter
            slider.addEventListener("pointerdown", () => {
                isDraggingSlider = true;
            });
            slider.addEventListener("pointerup", () => {
                isDraggingSlider = false;
                slider.value = param.value;
            });
            if (param.name.includes("channel")){
                slider.addEventListener("input", () => {
                    let value = Number.parseFloat(slider.value);
                    param.value = value;

                    if (value === 1){
                        label.textContent = "channel A";
                    } else if(value === 2){
                        label.textContent = "channel B";
                    } else if (value === 3){
                        label.textContent = "channel C";
                    } else if (value === 4){
                        label.textContent = "channel D";
                    }

                });
            } else if (param.name.includes("angle")){
                slider.addEventListener("input", () => {
                    let value = Number.parseFloat(slider.value);
                    param.value = value;

                    if (value === 0){
                        label.textContent = "X-axis";
                    } else if(value === 1){
                        label.textContent = "Y-axis";
                    } else if (value === 2){
                        label.textContent = "Z-axis";
                    } else if (value === 3){
                        label.textContent = "X-gyro";
                    } else if (value === 4){
                        label.textContent = "Y-gyro";
                    } else if (value === 5){
                        label.textContent = "Z-gyro";
                    }
                    
                });
            }



            // Store the slider and text by name so we can access them later
            uiElements[param.id] = { slider, text};

            // Add the slider element
            sdiv.appendChild(sliderContainer);
        }

        if (param.id.includes("visualize") || param.id.includes("user")) {
            
            // Create a label, an input slider and a value display
            let label = document.createElement("label");
            let slider = document.createElement("input");
            let text = document.createElement("input");
            let sliderContainer = document.createElement("div");
            sliderContainer.appendChild(label);
            sliderContainer.appendChild(slider);
            sliderContainer.appendChild(text);

            // Add a name for the label
            label.setAttribute("name", param.name);
            label.setAttribute("for", param.name);
            label.setAttribute("class", "param-label");
            label.textContent = `${param.name}: `;

            // Make each slider reflect its parameter
            slider.setAttribute("type", "range");
            slider.setAttribute("class", "param-slider");
            slider.setAttribute("id", param.id);
            slider.setAttribute("name", param.name);
            slider.setAttribute("min", param.min);
            slider.setAttribute("max", param.max);
            if (param.steps > 1) {
                slider.setAttribute("step", (param.max - param.min) / (param.steps - 1));
            } else {
                slider.setAttribute("step", (param.max - param.min) / 1000.0);
            }
            slider.setAttribute("value", param.value);

            // Make a settable text input display for the value
            text.setAttribute("value", param.value.toFixed(1));
            text.setAttribute("type", "text");

            // Make each slider control its parameter
            slider.addEventListener("pointerdown", () => {
                isDraggingSlider = true;
            });
            slider.addEventListener("pointerup", () => {
                isDraggingSlider = false;
                slider.value = param.value;
                text.value = param.value.toFixed(1);
            });
            slider.addEventListener("input", () => {
                let value = Number.parseFloat(slider.value);
                param.value = value;
            });

            // Make the text box input control the parameter value as well
            text.addEventListener("keydown", (ev) => {
                if (ev.key === "Enter") {
                    let newValue = Number.parseFloat(text.value);
                    if (isNaN(newValue)) {
                        text.value = param.value;
                    } else {
                        newValue = Math.min(newValue, param.max);
                        newValue = Math.max(newValue, param.min);
                        text.value = newValue;
                        param.value = newValue;
                    }
                }
            });
            // Store the slider and text by name so we can access them later
            uiElements[param.id] = { slider, text };

            // Add the slider element
            pdiv.appendChild(sliderContainer);
        }
    });
    // Listen to parameter changes from the device
    device.parameterChangeEvent.subscribe(param => {
        if (!isDraggingSlider && !param.name.includes("buffer")){
            uiElements[param.id].slider.value = param.value;
            //console.log(param.value);
            uiElements[param.id].text.value = param.value.toFixed(1);
        }
    });
}

// function makeDropArea(device, context) {
//     let dropArea = document.getElementById('drop-area');

//     ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
//         dropArea.addEventListener(eventName, preventDefaults, false)
//     })

//     ;['dragenter', 'dragover'].forEach(eventName => {
//         dropArea.addEventListener(eventName, highlight, false)
//     })
      
//     ;['dragleave', 'drop'].forEach(eventName => {
//         dropArea.addEventListener(eventName, unhighlight, false)
//     })

//     dropArea.addEventListener('drop', (e) => handleDrop(e, device, context), false);
// }

// function preventDefaults (e) {
//     e.preventDefault();
//     e.stopPropagation();
// }

// async function handleDrop(e, device, context) {
//     let dt = e.dataTransfer;
//     console.log(dt);
//     let file = dt.files[0];
//     console.log(file);
//     let filePath = file.path;

//     console.log(filePath);
    
//     const fileResponse = await fetch(file);
// 	const arrayBuf = await fileResponse.arrayBuffer();

// 	// Decode the received Data as an AudioBuffer
// 	const audioBuf = await context.decodeAudioData(arrayBuf);

// 	// Set the DataBuffer on the device
//     await device.releaseDataBuffer(myBuffer);
// 	await device.setDataBuffer(myBuffer, audioBuf);
// }

// function highlight (e) {
//     let dropArea = document.getElementById('drop-area');
//     dropArea.classList.add('highlight');
// }
  
// function unhighlight (e) {
//     let dropArea = document.getElementById('drop-area');
//     dropArea.classList.remove('highlight');
// }









class Sensor {
    constructor(ble) {
        this.bleDevice = ble;
        this.name = ble.name;
        this.id = ble.id;
        this.battery = null;
        this.gattServer = null;
        this.primaryService = null;
        this.characteristic = null;
        this.channel = 0;
        this.shortName = '';
        this.className = '';
    }

    async connect() {
        try {
            this.gattServer = await this.bleDevice.gatt.connect();
            this.bleDevice.addEventListener('gattserverdisconnected', onDisconnected);
            this.figureOutChannel();
            console.log(`Connected to ${this.name}, now attempting to find the primary service...`);
            printToConsole(`Connecting to ${this.name}...`);
            
            this.primaryService = await this.gattServer.getPrimaryService(MIDI_SERVICE_UID);
            console.log(`Connected to ${this.name}'s primary service, now attempting to find characteristic...`);

            this.characteristic = await this.primaryService.getCharacteristic(MIDI_IO_CHARACTERISTIC_UID);
            console.log(`Found characteristic, now attempting to start notifications...`);
            console.log(this.characteristic);

            await this.characteristic.startNotifications();

            console.log(this.characteristic.startNotifications());
            this.characteristic.addEventListener('characteristicvaluechanged', handleMidiMessageRecieved);
            console.log(`Notifications started`)
            printToConsole(`Connected to ${this.name}!`);

        } catch (error) {
            console.log(`ERRORCODE: ` + error);
            printToConsole(`There has been an error in connecting to ${this.name}!` + "\n" + `Please turn off ${this.name}, disconnect it, turn it back on, and reconnect it`);
        }


        // Do any further initialization or operations here
    }

    async disconnect() {
        try{
            if (this.gattServer && this.gattServer.connected) {
                this.characteristic.removeEventListener('characteristicvaluechanged', handleMidiMessageRecieved);
                this.bleDevice.removeEventListener('gattserverdisconnected', onDisconnected);
                await this.gattServer.disconnect();

                this.gattServer = null;
                this.primaryService = null;
                this.characteristic = null;
                console.log(`Disconnected from ${this.name}`);
                printToConsole(`Disconnected from ${this.name}.`);
            }
        } catch (error){
            console.log(`Error when disconnecting to ${this.name}:`, error)
        }
    }

    figureOutChannel() {
        if (this.name === 'NTEL_M5_Ch1') {
            this.channel = 1;
            this.shortName = 'A : Channel 1'
            this.className = 'device-block-ch1'
        } else if (this.name === 'NTEL_M5_Ch2') {
            this.channel = 2;
            this.shortName = 'B : Channel 2'
            this.className = 'device-block-ch2'
        } else if (this.name === 'NTEL_M5_Ch3') {
            this.channel = 3;
            this.shortName = 'C : Channel 3'
            this.className = 'device-block-ch3'
        } else if (this.name === 'NTEL_M5_Ch4') {
            this.channel = 4;
            this.shortName = 'D : Channel 4'
            this.className = 'device-block-ch4'
        }
    }

}

function updateConnectedDevicesList() {
    const connectedDevicesList = document.getElementById('connected-devices-list');
    connectedDevicesList.innerHTML = '';
    sensorArray.forEach((sensor) => {
        const deviceBlock = document.createElement('div');
        deviceBlock.className = sensor.className;
        deviceBlock.textContent = sensor.shortName ? sensor.shortName : 'Unknown device';
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
    return;
}

async function disconnectFromDevice(device) {
    let indexToRemove = -1
    sensorArray.forEach((sensor, index) => {
        if (sensor.name === device.name){
            sensor.disconnect();
            indexToRemove = index;
        }
    });
    if (indexToRemove != -1){
        sensorArray.splice(indexToRemove, 1);
        indexToRemove = -1;
    }

    updateConnectedDevicesList();
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

//   printToConsole('Searching for bluetooth devices...');
//   console.log('Requesting Bluetooth Device with MIDI UUID...');
//   console.log('Searching for ' + getUrlVars()["demo"] + getUrlVars()["id"] + "...");
//   navigator.bluetooth.requestDevice({
//     filters: [{
//       services: [MIDI_SERVICE_UID],
//       name: bleDevice
//     }]
//   })
//   .then(BTdevice => {
//     // Set up event listener for when device gets disconnected.
//     console.log(BTdevice);
    
//     bluetoothDevice = BTdevice;
//     console.log('Connecting to GATT server of ' + BTdevice.name);
//     printToConsole('Connecting to bluetooth device '+ BTdevice.name + '...');
//     BTdevice.addEventListener('gattserverdisconnected', onDisconnected);
//     bleConnected();
//     // Attempts to connect to remote GATT Server.
//     return BTdevice.gatt.connect();
//   })
//   .then(server => {
//     console.log('Getting Service...');
//     return server.getPrimaryService(MIDI_SERVICE_UID);
    
//   })
//   .then(service => {
//     console.log('Getting Characteristic...');
//     return service.getCharacteristic(MIDI_IO_CHARACTERISTIC_UID);
//   })
//   .then(characteristic => {
//     console.log('Found Characteristic...');
//     return characteristic.startNotifications();
//   })
//   .then(characteristic => {
//     // Set up event listener for when characteristic value changes.
//     characteristic.addEventListener('characteristicvaluechanged',
//                     handleMidiMessageRecieved);
//     console.log('Notifications have been started.')
//     printToConsole('Ready to test!');
//   })
//   .catch(error => { console.log('ERRORCODE: ' + error); });
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

  // if (!bluetoothDevice) {
  //   return;
  // }
  // navigator.bluetooth.requestDevice({
  //   filters: [{
  //     services: [MIDI_SERVICE_UID],
  //     name: bleDevice
  //   }]
  // })
  // .then(bD => {
  //   if (bD.gatt.connected) {
  //     bD.gatt.disconnect();
  //     //bleDisconnect();
  //     console.log('Disconnecting from Bluetooth Device...');
  //     printToConsole('Disconnecting from Bluetooth Device...');
  //   } else {
  //     console.log('> Bluetooth Device is already disconnected');
  //     printToConsole('Bluetooth Device is already disconnected.');
  //   }
  // }).catch(error => console.log(error));
  // console.log('Disconnecting from Bluetooth Device...');
  // if (bluetoothDevice.gatt.connected) {
  //   bluetoothDevice.gatt.disconnect();
  //   //bleDisconnect();
  //   printToConsole('Disconnecting from Bluetooth Device...');
  // } else {
  //   console.log('> Bluetooth Device is already disconnected');
  //   printToConsole('Bluetooth Device is already disconnected.');
  // }
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


  
