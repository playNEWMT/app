window.onload=function(){
  let norurl;
  if (getUrlVars()["demo"] !== undefined) {
    norurl = "./no/wearablejazzno.html?demo=" + getUrlVars()["demo"] + "&id=" + getUrlVars()["id"];
    console.log(norurl);
    document.getElementById("link").href = norurl;
    bleDevice = getUrlVars()["demo"] + " " + getUrlVars()["id"];
  }else{
    console.log("BLE Device: " + bleDevice);
  }

  setup();
} 

async function setup() {
    const patchExportURL = "export/wjazz.export.json";

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
        const dependenciesResponse = await fetch("export/dependenciesWJ.json");
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

    // (Optional) Connect MIDI inputs
    // makeMIDIKeyboard(device, dependencies.length);

    //makeDropArea(device, context);

    document.body.onclick = () => {
        context.resume();
    }

    // Skip if you're not using guardrails.js
    if (typeof guardrails === "function")
        guardrails();
}

function makeSliders(device) {
    device.parameters.forEach(param => {
        let container = null;
        let type = null;

        if (param.name === "tempo") {
            container = document.getElementById('tansport-tempo');
            type = 'paramlabeled';
            console.log("hi")
        }

        if (param.name === "sensor_drums"){
            container = document.getElementById('connected-to-drums');
            type = 'sensor';
        }
        if (param.name === "user_p1_Threshold"){
            container = document.getElementById('drums-sensitivity');
            type = 'sens';
        }
        if (param.name === "visualize_drums"){
            container = document.getElementById('visualize_drums');
            type = 'visualizeDrums';
        }
        if (param.name === "user_p1_Drums_Volume"){
            container = document.getElementById('vol-drums');
            type = 'vol';
        }


        if (param.name === "sensor_melody"){
            container = document.getElementById('connected-to-melody');
            type = 'sensor';
        }
        if (param.name === "sensor_effects"){
            container = document.getElementById('connected-to-effects');
            type = 'sensor';
        }



        if (param.name === "user_p3_Melody_Volume"){
            container = document.getElementById('vol-melody');
            type = 'vol';
        }
        if (param.name === "user_p3_gate_probability"){
            container = document.getElementById('probability-slider');
            type = 'prob';
        }
        if (param.name === "visualize_melody"){
            container = document.getElementById('visualize_melody');
            type = 'visualizeMelody';
        }


        if (param.name === "visualize_effects"){
            container = document.getElementById('dj-hand');
            type = 'visualize';
        }
        if (param.name === "user_p2_Harmony_Volume"){
            container = document.getElementById('vol-effects');
            type = 'vol';
        }
        if (param.name === "user_p2_FX_choice"){
            container = document.querySelector('.effect-slider');
            type = 'param';
        }

        let slider = new Slider(container, param, device, type)
        slider.initializeSliders();
    });

    return;
    
    let p1div = document.getElementById("p1-sliders");
    let p2div = document.getElementById("p2-sliders");
    let p3div = document.getElementById("p3-sliders");
    let sdiv = document.getElementById("rnbo-sensor-sliders");


    let noParamLabel = document.getElementById("no-param-label");
    if (noParamLabel && device.numParameters > 0) noParamLabel.remove();


    //* fix *// 
    

    // This will allow us to ignore parameter update events while dragging the slider.
    let isDraggingSlider = false;
    let uiElements = {};
    let index = 1;
    let sliders =[];
    // let testparam = device.parametersById.get("user_grain_pitch");
    // let vol = device.parametersById.get("user_volume");



    device.parameters.forEach(param => {
        if ((param.name.includes("user") && param.name.includes("p1"))
        || (param.name.includes("kick") || param.name.includes("snare"))){
            const onChange = (value) => {
                param.value = value;
                console.log(`Updated ${param.name} to ${param.value}`);
            }
    
            let slider1 = new Slider(p1div, param, onChange);
    
    
            slider1.initializeSlider();
            sliders.push(slider1);
        }

        if (param.name.includes("user") && param.name.includes("p2")){
            const onChange = (value) => {
                param.value = value;
                console.log(`Updated ${param.name} to ${param.value}`);
            }
    
            let slider2 = new Slider(p2div, param, onChange);
    
    
            slider2.initializeSlider();
            sliders.push(slider2);
        }

        if (param.name.includes("user") && param.name.includes("p3")){
            const onChange = (value) => {
                param.value = value;
                console.log(`Updated ${param.name} to ${param.value}`);
            }
    
            let slider3 = new Slider(p3div, param, onChange);
    
    
            slider3.initializeSlider();
            sliders.push(slider3);
        }
    });
}