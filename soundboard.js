

















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




















// const desiredSampleRate = 44100; // desired sample rate in Hz
// const audioContext = new (window.AudioContext || window.webkitAudioContext)({
//   sampleRate: desiredSampleRate
// });

async function setup() {
    const patchExportURL = "export/soundboard.export.json";

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
        const dependenciesResponse = await fetch("export/dependenciesSB.json");
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
    // makeSliders(device);

    // (Optional) Create a form to send messages to RNBO inputs
    //makeInportForm(device);

    // (Optional) Attach listeners to outports so you can log messages from the RNBO patcher
    //attachOutports(device);

    // (Optional) Load presets, if any
    // loadPresets(device, patcher);

      // Usage example:

    // (Optional) Connect MIDI inputs
    makeMIDIKeyboard(device, dependencies.length);

    removeLoading(device);

    //makeDropArea(device, context);

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
                overlay.style.display = 'none';
            });
        }
    });
}

function makeMIDIKeyboard(device, samples) {
    if (samples === 0) return;
    let noSamples = document.getElementById("no-samples-label");
    noSamples.remove();
    const numberOfSounds = [1, 2, 3, 4, 5];
    const descriptions = device.dataBufferDescriptions;

    numberOfSounds.forEach((number) =>{
        const sbutton = document.getElementById(`sound${number}`);
        const sdropdown = document.getElementById(`sound${number}-dropdown`);
        const buf = device.parametersById.get(`whichbuffer${number}`);
        let index = 0;

        descriptions.forEach((buffer) => {
            // if (!!desc.file) {
            //     console.log(`Buffer with id ${desc.id} references file ${desc.file}`);
            // } else {
            //     console.log(`Buffer with id ${desc.id} references remote URL ${desc.url}`);
            // }
            if (buffer.id != "snd1" && buffer.id != "snd2" && buffer.id != "snd3"
            && buffer.id != "snd4" && buffer.id != "snd5"){
                
                const option = document.createElement("option");

                let bufferText = buffer.id
                let optionText = bufferText.replace(new RegExp('b_', 'g'), '');
                optionText = optionText.replace(new RegExp('_wav', 'g'), '');
                optionText = optionText.replace(new RegExp('_', 'g'), ' ');


                option.textContent = optionText;
                option.value = index; 
                sdropdown.appendChild(option);
                index = index + 1;
            }

        });

        sdropdown.addEventListener("change", (event) => {
            buf.value = event.target.value;
            
        });


        const key = document.createElement("div");
        const label = document.createElement("p");
        label.textContent = "Play";
        label.style.fontSize = '40px';
        label.style.fontWeight = 'bold';
        key.appendChild(label);
        key.addEventListener("pointerdown", () => {
            let midiChannel = number - 1;
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
        sbutton.appendChild(key);

    });
}