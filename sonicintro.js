let trigPressed = false;
let loopPressed = false;

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
    const patchExportURL = "export/sonicintro.export.json";

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
        const dependenciesResponse = await fetch("export/dependenciesSI.json");
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


function makeMIDIKeyboard(device, samples) {
    const stdiv = document.getElementById("sounds-trig");
    const sldiv = document.getElementById("sounds-loop");
    if (samples === 0) return;

    let noSamples = document.getElementById("no-samples-label-trig");
    noSamples.remove();
    noSamples = document.getElementById("no-samples-label-loop");
    noSamples.remove();

    const dropdown_trig = document.getElementById("trig-dropdown");
    const dropdown_cont = document.getElementById("loop-dropdown");



    const descriptions = device.dataBufferDescriptions;
    const buf_trig = device.parametersById.get("whichbuffer_trig");

    const buf_cont = device.parametersById.get("whichbuffer_cont");

    // let index = 1;


    // Each description will have a unique id, as well as a "file" or "url" key, depending on whether 
    // the buffer references a local file or a remote URL
    descriptions.forEach((buffer, index) => {
            // if (!!desc.file) {
            //     console.log(`Buffer with id ${desc.id} references file ${desc.file}`);
            // } else {
            //     console.log(`Buffer with id ${desc.id} references remote URL ${desc.url}`);
            // }
        if (buffer.id != "trig_snd" && buffer.id != "loop_snd")
        {
            index = index;
            const option_trig = document.createElement("option");
            const option_cont = document.createElement("option");
                
            let bufferText = buffer.id
            let optionText = bufferText.replace(new RegExp('b_', 'g'), '');
            optionText = optionText.replace(new RegExp('_wav', 'g'), '');
            optionText = optionText.replace(new RegExp('_', 'g'), ' ');




            option_trig.textContent = optionText;
            option_trig.value = index; 


            option_cont.textContent = optionText;
            option_cont.value = index;

            dropdown_trig.appendChild(option_trig);
            dropdown_cont.appendChild(option_cont);

            
        }

    });

    dropdown_trig.addEventListener("change", (event) => {
        buf_trig.value = event.target.value;
        console.log(event.target.value)
    });

    dropdown_cont.addEventListener("change", (event) => {
        buf_cont.value = event.target.value;
    });

    //fix this later need to figure out why it isn't being routed propperly in RNBO for now using channel 5 and 6 but should be able to send different note messages on channel 5 per say

    const ttestdiv = document.getElementById("trig-test");
    const ltestdiv = document.getElementById("loop-test"); 

    const keytrig = document.createElement("div");
    const labeltrig = document.createElement("p");
    labeltrig.textContent = "Test Sound:";
    keytrig.appendChild(labeltrig);
    keytrig.addEventListener("pointerdown", () => {
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
        keytrig.classList.add("clicked");
    });
    keytrig.addEventListener("pointerup", () => keytrig.classList.remove("clicked"));
    ttestdiv.appendChild(keytrig);

    const keyloop = document.createElement("div");
    const labelloop = document.createElement("p");
    labelloop.textContent = "Test Sound:";
    keyloop.appendChild(labelloop);
    keyloop.addEventListener("pointerdown", () => {
        let midiChannel = 6;
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
        keyloop.classList.add("clicked");
    });
    keyloop.addEventListener("pointerup", () => keyloop.classList.remove("clicked"));
    ltestdiv.appendChild(keyloop);
}

function makeSliders(device) {

    
    // let tdiv = document.getElementById("trigger-sliders");
    // let ldiv = document.getElementById("loop-sliders");
    // let sdiv = document.getElementById("rnbo-sensor-sliders");


    // let noParamLabel = document.getElementById("no-param-label-trig");
    // if (noParamLabel && device.numParameters > 0) noParamLabel.remove();

    // noParamLabel = document.getElementById("no-param-label-loop");
    // if (noParamLabel && device.numParameters > 0) noParamLabel.remove();

    // //* fix *// 
    

    // // This will allow us to ignore parameter update events while dragging the slider.
    // let isDraggingSlider = false;
    // let uiElements = {};
    // let index = 1;
    // let sliders =[];
    // // let testparam = device.parametersById.get("user_grain_pitch");
    // // let vol = device.parametersById.get("user_volume");



    device.parameters.forEach(param => {
        let container = null;
        let type = null;
        if (param.name === "sensor_Loop"){
            container = document.getElementById('connected-to-loop');
            type = 'sensor';
        }
        if (param.name === "info_trigger_Visualization") {
            container = document.querySelector('.threshold-visualization');
            type = 'visualize';
        }
        if (param.name === "user_trig_Volume"){
            container = document.getElementById('vol-trig');
            type = 'vol';
        }
        if (param.name === "info_trigger_threshold"){
            container = document.querySelector('.threshold-slider-arrow');
            type = 'param';
        }
        if (param.name === "info_loop_Visualization"){
            container = document.querySelector('.sensitivity-visualization');;
            type = 'visualize';
        }
        if (param.name === "user_loop_Volume"){
            container = document.getElementById('vol-sens');
            type = 'vol';
        }
        if (param.name === "user_loop_Sensitivity"){
            container = document.querySelector('.sensitivity-slider');
            type = 'sens';
        }
        if (param.name === "sensor_Trigger"){
            container = document.getElementById('connected-to-trig');
            type = 'sensor';
        }

        let slider = new Slider(container, param, device, type)
        slider.initializeSliders();
    });
    //     infodivtrig = document.getElementById("sensor-info-trig");
    //     infodivloop = document.getElementById("sensor-info-loop");

    //     if (param.name.includes("info")){
    //         infoContainer = document.createElement("div");

    //         let label = document.createElement("label");
    //         let slider = document.createElement("input");
    //         infoContainer.appendChild(label);
    //         infoContainer.appendChild(slider);

    //         // Add a name for the label
    //         let paramName = param.name;
    //         paramName = paramName.replace(new RegExp('info_', 'g'), '');
    //         paramName = paramName.replace(new RegExp('_', 'g'), ' ');
    //         label.setAttribute("name", param.name);
    //         label.setAttribute("for", param.name);
    //         label.setAttribute("class", "param-label");
    //         label.textContent = `${paramName}: `;

    //         // Make each slider reflect its parameter
    //         slider.setAttribute("type", "range");
    //         slider.setAttribute("class", "device-slider");
    //         slider.style.pointerEvents = "all";
    //         slider.style.height = "3rem";
    //         slider.style.setProperty('--thumb-size', "80%")
    //         slider.style.setProperty('--thumb-w', "1%")
    //         slider.setAttribute("id", param.id);
    //         slider.setAttribute("name", param.name);
    //         slider.setAttribute("min", param.min );
    //         slider.setAttribute("max", param.max );

    //         slider.setAttribute("step", (param.max - param.min) / 100.0);


    //         if (param.name.includes("threshold")) {
    //             slider.setAttribute("value", param.value);
    //             // Make each slider control its parameter
    //             slider.addEventListener("pointerdown", () => {
    //                 isDraggingSlider = true;
    //             });
    //             slider.addEventListener("pointerup", () => {
    //                 isDraggingSlider = false;
    //                 slider.value = param.value;
    //                 console.log(param.value);
    //             });
    //             slider.addEventListener("input", () => {
    //                 let value = Number.parseFloat(slider.value);
    //                 param.value = value;
    //             });
    //         }
            

    //         if (param.name.includes("trig")){
    //             infodivtrig.appendChild(infoContainer);
    //         }

    //         if (param.name.includes("loop")){
    //             infodivloop.appendChild(infoContainer);
    //         }


    //         // Add the slider element


    //         if (param.name.includes("Visualization")){
    //             slider.style.pointerEvents = "none";
    //             device.parameterChangeEvent.subscribe(param => {
    //                 if (param.id === slider.id){
    //                     slider.value = param.value;
    //                     //console.log(param.value);
    //                 }
    //             });
    //         }
    //     }

    //     if (param.name.includes("user") && param.name.includes("trig")){
    //         const onChange = (value) => {
    //             param.value = value;
    //             console.log(`Updated ${param.name} to ${param.value}`);
    //         }
    
    //         let slider = new Slider(tdiv, param, onChange);
    
    
    //         slider.initializeSlider();
    //         sliders.push(slider);
    //     }

    //     if (param.name.includes("user") && param.name.includes("loop")){
    //         const onChange = (value) => {
    //             param.value = value;
    //             console.log(`Updated ${param.name} to ${param.value}`);
    //         }
    
    //         let slider = new Slider(ldiv, param, onChange);
    
    
    //         slider.initializeSlider();
    //         sliders.push(slider);
    //     }
    //     if (param.name.includes("sensor_")){
    //         const onChange = (value) => {
    //             param.value = value;
    //             console.log(`Updated ${param.name} to ${param.value}`);
    //             if (param.name.includes("trig")){
    //                 let tsound = document.getElementById("trigger-sound");
    //                 value = Math.round(value);
    //                 tsound.className = `p${value}`;
    //             }
    //             if (param.name.includes("loop")){
    //                 let lsound = document.getElementById("loop-sound");
    //                 value = Math.round(value);
    //                 lsound.className = `p${value}`;
    //             }
    //         }
    
    //         let slider = new Slider(sdiv, param, onChange);
    //         // slider.style.alignSelf = "center";
    
    
    //         slider.initializeSlider();
    //         sliders.push(slider);
    //     }
    // });
}

