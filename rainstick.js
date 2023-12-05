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
        const dependenciesResponse = await fetch("export/dependenciesRS.json");
        dependencies = await dependenciesResponse.json();

        // Prepend "export" to any file dependenciies
        dependencies = dependencies.map(d => d.file ? Object.assign({}, d, { file: "export/" + d.file }) : d);
    } catch (e) {}

    // Create the device
    try {
        device = await RNBO.createDevice({ context,patcher });
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

    // (Optional) Connect MIDI inputs
    makeMIDIKeyboard(device, dependencies.length);

    //makeDropArea(device, context);

    removeLoading(device);

    document.body.onclick = () => {
        context.resume();
    }

    // Skip if you're not using guardrails.js
    if (typeof guardrails === "function")
        guardrails();
}

function removeLoading(device) {

    const param = device.parametersById.get(`onload`);
    param.changeEvent.subscribe((e) => {

        if(e === 1) {
            loadingIcon = document.querySelectorAll('.loading-icon');

            loadingIcon.forEach(icon => {
                icon.style.display = 'none';
            });

            overlayElements = document.querySelectorAll('.connect-wash');

            overlayElements.forEach(overlay => {
                overlay.style.backgroundColor = '#230543df';
            });
        }
    });
}

function makeMIDIKeyboard(device, samples) {
    const sdiv = document.getElementById("sounds-rs");
    if (samples === 0) return;

    let noSamples = document.getElementById("no-samples-label-rs");
    noSamples.remove();
    const dropdown = document.getElementById("rs-dropdown");


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
            const option = document.createElement("option");
            let bufferText = buffer.id
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
        console.log(event.target.value)
    });

    const rstestdiv = document.getElementById("rs-test");
    const key = document.createElement("div");
    const label = document.createElement("p");
    label.textContent = "Test Sound:";
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
    rstestdiv.appendChild(key);
}

function makeSliders(device) {

    device.parameters.forEach(param => {
        let container = null;
        let type = null;
        if (param.name === "user_Organic_Modes"){
            container = document.getElementById('modes');
            type = 'paramlabeled';
        }

        if (param.name === "sensor_channel"){
            container = document.getElementById('connected-to-rs');
            type = 'sensor';
        }
        if (param.name === "user_Volume"){
            container = document.getElementById('vol-rs');
            type = 'vol';
        }
        if (param.name === "visualize") {
            container = document.getElementById('rainstick-tilt');
            type = 'visualizeRS';
        }
        if (param.name === "user_Grains"){

            container = document.getElementById("grain-number-rs");
            type = 'paramlabeled';
        }
        if (param.name === "user_Grain_Size"){

            container = document.getElementById('grain-size-rs');
            type = 'paramlabeled';
        }
        if (param.name === "user_Grain_Pitch"){

            container = document.getElementById('grain-pitch-rs');
            type = 'paramlabeled';
        }
        if (param.name === "user_Speed"){
            container = document.querySelector('.speed-slider');
            type = 'speed';
        }

        let slider = new Slider(container, param, device, type)
        slider.initializeSliders();
    });

    
    // let pdiv = document.getElementById("rnbo-parameter-sliders");
    // let sdiv = document.getElementById("rnbo-sensor-sliders");


    // let noParamLabel = document.getElementById("no-param-label");
    // if (noParamLabel && device.numParameters > 0) pdiv.removeChild(noParamLabel);

    // let sliders =[];

    // device.parameters.forEach(param => {

    //     if (param.name.includes("user")){
    //         const onChange = (value) => {
    //             param.value = value;
    //             console.log(`Updated ${param.name} to ${param.value}`);
    //         }
    
    //         let slider = new Slider(pdiv, param, onChange, null);
    
    
    //         slider.initializeSlider();
    //         sliders.push(slider);
    //     }
    //     if (param.name.includes("sensor_channel")){
    //         const onChange = (value) => {
    //             param.value = value;
    //             console.log(`Updated ${param.name} to ${param.value}`);
    //             let rstick = document.getElementById("rainstick");
    //             value = Math.round(value);
    //             rstick.className = `p${value}`;
    //         }
    
    //         let slider = new Slider(sdiv, param, onChange, null);
    
    
    //         slider.initializeSlider();
    //         sliders.push(slider);
    //     }
    // });
}


  
