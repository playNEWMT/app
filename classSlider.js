class Slider {
    constructor(container, param, device, type) {
        this.param = param;
        this.name = this.param.name;
        this.max = this.param.max;
        this.min = this.param.min;
        this.steps = this.param.steps;
        // this.value = this.param.value;
        this.id = this.param.id;

        this.container = container;


        this.type = type;
        this.device = device;

    }

    initializeSliders() {
        if (this.type === 'param') {
            this.attachParamSliders();
        }
        if(this.type === 'paramlabeled') {
            this.attachParamLabeled();
        }

        if(this.type === 'visualize') {
            this.attachVisualizeSliders();
        }
        if(this.type === 'visualizeRS') {
            this.attachVisualizeRS();
        }
        if(this.type === 'visualizeDrums') {
            this.attachVisualizeDrums();
        }
        if(this.type === 'visualizeMelody') {
            this.attachVisualizeMelody();
        }

        if (this.type === 'vol') {
            this.attachVolSliders();
        }
        if(this.type === 'sensor') {
            this.attachSensorUI();
        }

        if(this.type === 'sens') {
            this.attachSensSliders();
        }
        if(this.type === 'speed') {
            this.attachSpeed();
        }
        if(this.type === 'prob') {
            this.attachProb();
        }

    }

    mapRange(value, inputMin, inputMax, outputMin, outputMax) {
        // Ensure the input value is within the original range
        value = Math.min(Math.max(value, inputMin), inputMax);
      
        // Calculate the percentage of the input value within the original range
        const percentage = (value - inputMin) / (inputMax - inputMin);
        const linearOutput = outputMin + percentage * (outputMax - outputMin);

        return linearOutput;
    }

    throttle(func, delay) {
        let lastCall = 0;
        return (...args) => {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                func.apply(this, args);
            }
        };
    }
    
    updateTransformStyle(targetRotation) {
        const rainstickTilt = this.container; 
        
        const currentRotation = parseFloat(rainstickTilt.style.transform.replace(/[^0-9.-]/g, '')) || 0; // Extract current rotation
        
        const startTime = Date.now();
        const duration = 500; // Duration of the transition in milliseconds
        
        const animate = () => {
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;
            
            if (elapsedTime >= duration) {
                rainstickTilt.style.transform = `rotate(${targetRotation}deg)`;
                return;
            }
            
            const progress = elapsedTime / duration;
            const easedProgress = Math.sin(progress * (Math.PI / 2));
            
            const interpolatedRotation = currentRotation + (targetRotation - currentRotation) * easedProgress;
            rainstickTilt.style.transform = `rotate(${interpolatedRotation}deg)`;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    attachProb() {
        let slider = this.container;

        slider.setAttribute("name", this.name);
        slider.setAttribute("min", this.min);
        slider.setAttribute("max", this.max);
        if (this.steps > 1) {
            slider.setAttribute("step", (this.max - this.min) / (this.steps - 1));
        } else {
            slider.setAttribute("step", (this.max - this.min) / 1000.0);
        }
        slider.setAttribute("value", this.param.value);


        slider.addEventListener('input', (event) => {
            const value = event.target.value;
            const percentage = (value - slider.min) / (slider.max - slider.min);
            const progress = percentage * 100;
            // console.log(progress)
            event.target.style.setProperty('--prob-progress', `${progress}%`);
            this.param.value = value;
        });

        const inputEvent = new Event('input');
        slider.dispatchEvent(inputEvent);
    }

    attachParamLabeled() {
        let slider = this.container;
        let label = null;

        if (this.name === 'user_Grains') {
            label = document.getElementById('grain-number-label');
        }
        if (this.id === "user_Grain_Size") {
            label = document.getElementById("grain-size-label");
        }
        if (this.id === "user_Grain_Pitch") {
            label = document.getElementById("grain-pitch-label");
        }
        if (this.id === "user_Organic_Modes") {
            label = document.getElementById("grain-modes-label");
        }
        if (this.id === "tempo") {
            label = document.getElementById('tempo-label');
            console.log("hi"); 
        }


        slider.setAttribute("name", this.name);
        slider.setAttribute("min", this.min);
        slider.setAttribute("max", this.max);
        if (this.steps > 1) {
            slider.setAttribute("step", (this.max - this.min) / (this.steps - 1));
        } else {
            slider.setAttribute("step", (this.max - this.min) / 1000.0);
        }
        slider.setAttribute("value", this.param.value);
        label.innerText = this.param.value;
    
        slider.addEventListener('input', (event) => {
            const
                value = event.target.value,
                newValue = Number( (slider.value - slider.min) * 100 / (slider.max - slider.min) ),
                newPosition = 10 - (newValue * 0.2),
                percentage = (value - slider.min) / (slider.max - slider.min),
                progress = percentage * 100;
            let labelText = slider.value.slice(0,3);
            // labelText = labelText.toFixed(1);
            label.innerHTML = `<span>${labelText}</span>`;
            label.style.left = `calc(${newValue}% + (${newPosition}px))`;
            event.target.style.background = `linear-gradient(to right, var(--primary) ${progress}%, var(--secondary) ${progress}%)`;

            this.param.value = value;
        });
    
        

        const inputEvent = new Event('input');
        slider.dispatchEvent(inputEvent);
    }
    
    attachVisualizeRS() {
        const throttledUpdate = this.throttle(this.updateTransformStyle.bind(this), 50);
        this.param.changeEvent.subscribe((e) => {
            throttledUpdate(this.mapRange(e, 49, 81, 0, 120) - 60);
        });
    }

    attachSpeed() {
        let slider = this.container;

        slider.setAttribute("name", this.name);
        slider.setAttribute("min", this.min);
        slider.setAttribute("max", this.max);
        if (this.steps > 1) {
            slider.setAttribute("step", (this.max - this.min) / (this.steps - 1));
        } else {
            slider.setAttribute("step", (this.max - this.min) / 1000.0);
        }
        slider.setAttribute("value", this.param.value);


        slider.addEventListener('input', (event) => {
            const value = event.target.value;
            const percentage = (value - slider.min) / (slider.max - slider.min);
            const progress = percentage * 100;
            const scaleProgress = this.mapRange(progress, 0, 100, 41, 255);
            event.target.style.background = `linear-gradient(to right, rgb(249, 173, var(--speed-blue, 41)) ${progress}%, var(--secondary) ${progress}%)`;
            event.target.style.setProperty('--speed-blue', `${scaleProgress}`);
            this.param.value = value;
        });

        const inputEvent = new Event('input');
        slider.dispatchEvent(inputEvent);
    }
 
    attachSensorUI() {
        const radioContainer = document.createElement('div'); // Create a div to hold radio buttons
        let xyz = ['Sensor 1', 'Sensor 2', 'Sensor 3'];
        let index = 1;
        
        xyz.forEach(number => {
            const radioButton = document.createElement("input");
            radioButton.type = "radio"; // Set the input type to radio
            radioButton.name = "sensorRadioGroup" + this.id; // Set a common name for the radio group
            radioButton.id = "radio" + index; // Unique ID for each radio button
            radioButton.value = index;
            radioButton.textContent = number;
        
            const label = document.createElement("label");
            label.textContent = number;
            label.setAttribute("for", "radio" + index);
        
            radioContainer.appendChild(radioButton);
            radioContainer.appendChild(label);
            index++;
        });

        const selectedRadioButton = radioContainer.querySelector(`input[value="${this.param.value}"]`);
        if (selectedRadioButton) {
            selectedRadioButton.checked = true;
        }
        
        radioContainer.addEventListener("change", (event) => {
            this.param.value = event.target.value;
        });
        this.container.appendChild(radioContainer);
    }

    attachVisualizeSliders() {
        let slider = this.container;

        slider.setAttribute("name", this.name);
        slider.setAttribute("min", this.min);
        slider.setAttribute("max", this.max);
        if (this.steps > 1) {
            slider.setAttribute("step", (this.max - this.min) / (this.steps - 1));
        } else {
            slider.setAttribute("step", (this.max - this.min) / 100);
        }
        slider.setAttribute("value", this.param.value);
        slider.setAttribute("id", this.id);

        this.device.parameterChangeEvent.subscribe(param => {
            if (param.id === slider.id){
                slider.value = param.value;
                //console.log(param.value);
            }
        });
    }

    attachVisualizeDrums(){
        let container = this.container
        console.log(this.id);
        container.setAttribute("id", this.id);
        this.device.parameterChangeEvent.subscribe(param => {
            if (param.id === container.id){
                
                console.log(container.id, param.value);

                if(param.value === 0) {
                    console.log("kick");
                    container.style.backgroundImage = 'url(./media/drum-bass.svg)';
                }
                if(param.value === 1) {
                    console.log("snare");
                    container.style.backgroundImage = 'url(./media/drum-snare.svg)';
                }
            }
        });
    }

    attachVisualizeMelody(){
        let container = this.container
        container.setAttribute("id", this.id);
        console.log(container.id, this.param.value);
        if(this.param.value === 0) {

            container.style.backgroundImage = 'url(./media/trumpet-neutral.svg)';
        }
        this.device.parameterChangeEvent.subscribe(param => {
            if (param.id === container.id){
                
                



                if(param.value === 1) {

                    container.style.backgroundImage = 'url(./media/trumpet-1.svg)';
                }
                if(param.value === 2) {

                    container.style.backgroundImage = 'url(./media/trumpet-2.svg)';
                }
                if(param.value === 3) {

                    container.style.backgroundImage = 'url(./media/trumpet-3.svg)';
                }
                if(param.value === 4) {

                    container.style.backgroundImage = 'url(./media/trumpet-4.svg)';
                }
                if(param.value === 5) {

                    container.style.backgroundImage = 'url(./media/trumpet-5.svg)';
                }
                if(param.value === 6) {

                    container.style.backgroundImage = 'url(./media/trumpet-6.svg)';
                }
            }
        });
    }

    attachParamSliders() {
    
        // This will allow us to ignore parameter update events while dragging the slider.
        // let isDraggingSlider = false;
        // let uiElements = {};

        let slider = this.container;
    
        // Make each slider reflect its parameter
        // slider.setAttribute("type", "range");
        // slider.setAttribute("class", "param-slider");
        // slider.setAttribute("id", this.id);
        slider.setAttribute("name", this.name);
        slider.setAttribute("min", this.min);
        slider.setAttribute("max", this.max);
        if (this.steps > 1) {
            slider.setAttribute("step", (this.max - this.min) / (this.steps - 1));
        } else {
            slider.setAttribute("step", (this.max - this.min) / 1000.0);
        }
        slider.setAttribute("value", this.param.value);
    
        // Make a settable text input display for the value
        // text.setAttribute("value", param.value.toFixed(1));
        // text.setAttribute("type", "text");
    
        // Make each slider control its parameter
        // slider.addEventListener("pointerdown", () => {
        //     isDraggingSlider = true;
        // });
        // slider.addEventListener("pointerup", () => {
        //     isDraggingSlider = false;
        //     slider.value = this.param.value;
        //     text.value = this.param.value.toFixed(1);
        // });
        slider.addEventListener("input", () => {
            let value = Number.parseFloat(slider.value);
            this.param.value = value;
            console.log(this.param.value, value);
        });

            // Make the text box input control the parameter value as well
            // text.addEventListener("keydown", (ev) => {
            //     if (ev.key === "Enter") {
            //         let newValue = Number.parseFloat(text.value);
            //         if (isNaN(newValue)) {
            //             text.value = param.value;
            //         } else {
            //             newValue = Math.min(newValue, param.max);
            //             newValue = Math.max(newValue, param.min);
            //             text.value = newValue;
            //             param.value = newValue;
            //         }
            //     }
            // });
    
            // Store the slider and text by name so we can access them later
            // uiElements[param.id] = { slider, text };
    
            // Add the slider element
            // pdiv.appendChild(sliderContainer);
    
        // Listen to parameter changes from the device
        // device.parameterChangeEvent.subscribe(param => {
        //     if (!isDraggingSlider)
        //         uiElements[param.id].slider.value = param.value;
        //     uiElements[param.id].text.value = param.value.toFixed(1);
        // });
    }

    attachVolSliders() {
        let slider = this.container;

        slider.setAttribute("name", this.name);
        slider.setAttribute("min", this.min);
        slider.setAttribute("max", this.max);
        if (this.steps > 1) {
            slider.setAttribute("step", (this.max - this.min) / (this.steps - 1));
        } else {
            slider.setAttribute("step", (this.max - this.min) / 1000.0);
        }
        slider.setAttribute("value", this.param.value);


        slider.addEventListener('input', (event) => {
            const value = event.target.value;
            const percentage = (value - slider.min) / (slider.max - slider.min);
            const progress = percentage * 100;
            const scaleProgress = this.mapRange(progress, 0, 100, 2.5, 6);
            event.target.style.setProperty('--ear-scale', `${scaleProgress}`);
            event.target.style.background = `linear-gradient(to right, var(--primary) ${progress}%, var(--secondary) ${progress}%)`;
            this.param.value = value;
        });

        const inputEvent = new Event('input');
        slider.dispatchEvent(inputEvent);

    }

    attachSensSliders() {
        let slider = this.container;

        slider.setAttribute("name", this.name);
        slider.setAttribute("min", this.min);
        slider.setAttribute("max", this.max);
        if (this.steps > 1) {
            slider.setAttribute("step", (this.max - this.min) / (this.steps - 1));
        } else {
            slider.setAttribute("step", (this.max - this.min) / 1000.0);
        }
        slider.setAttribute("value", this.param.value);


        slider.addEventListener('input', (event) => {
            const value = event.target.value;
            const percentage = (value - slider.min) / (slider.max - slider.min);
            const progress = percentage * 100;
            const primaryProgress = this.mapRange(progress, 0, 100, 0, 20);
            const secondaryProgress = this.mapRange(progress, 0, 100, 0, 125);
            const thumbProgress = this.mapRange(progress, 0, 100, 30, 150);
            // console.log(progress);
            document.documentElement.style.setProperty('--sensitivity-thumb-height', `${thumbProgress}px`);
            slider.style.background = `linear-gradient(to right, var(--primary) ${primaryProgress}%, var(--secondary) ${secondaryProgress}%, var(--secondary) 100%)`;
            this.param.value = value;

          });

          const inputEvent = new Event('input');
          slider.dispatchEvent(inputEvent);

    }

}





// this.param = param
// this.min = this.param.min;
// this.max = this.param.max;
// this.step = (this.max - this.min) / (this.param.steps - 1);
// this.value = this.param.value.toFixed(2);

// this.parent = containerParent;
// this.container = null;
// this.bar = null;
// this.thumb = null;
// this.sliderText = null;
// this.label = null; 

// this.onChange = onChange;
// this.isDragging = false;
// }

// initializeSlider() {

// // console.log(this.param.steps, this.step, this.min, this.max);

// this.bar = document.createElement("div");
// this.bar.classList.add('slider-bar');

// this.thumb = document.createElement("div");
// this.thumb.classList.add('slider-thumb');

// this.sliderText = document.createElement("div");
// this.sliderText.classList.add('slider-progress');

// this.label = document.createElement("label");
// this.label.classList.add('slider-label');
// let paramLabel = this.param.name;
// paramLabel = paramLabel.replace(new RegExp('user_', 'g'), '');
// paramLabel = paramLabel.replace(new RegExp('_', 'g'), ' ');
// this.label.textContent = `${paramLabel}`;

// this.container = document.createElement("div");
// this.container.classList.add('slider-container');
// this.container.appendChild(this.sliderText);
// this.container.appendChild(this.label);
// this.container.appendChild(this.bar);
// this.container.appendChild(this.thumb);

// this.parent.appendChild(this.container);

// //doesn't work
// let progress
// if (this.param.steps > 1) {
//     progress = ((this.value - this.min) / this.step) / ((this.max - this.min) / this.step);
// } else {
//     progress = (this.value / (this.max - this.min)) - this.min;
// }
// this.updateSlider(progress);

// this.thumb.addEventListener('mousedown', this.startDragging.bind(this));
// document.addEventListener('mousemove', this.drag.bind(this));
// document.addEventListener('mouseup', this.stopDragging.bind(this));
// this.container.addEventListener('mouseup', this.printValue.bind(this));
// }

// startDragging(event) {
// this.isDragging = true;
// this.drag(event);
// }

// drag(event) {
// if (!this.isDragging) {return};

// const containerRect = this.container.getBoundingClientRect();
// const positionX = event.clientX - containerRect.left;
// const totalWidth = containerRect.width;
// const rawProgress = Math.max(0, Math.min(1, positionX / totalWidth))

// let progress;
// let currentValue;


// if (this.param.steps > 1) {
//     // const numSteps = Math.floor((this.max - this.min) / this.step) + 1;
//     const stepSize = 1 / this.param.steps;
//     const closestStep = Math.round(rawProgress / stepSize);
//     progress = closestStep * stepSize;
//     currentValue = this.min + Math.round((progress * (this.max - this.min)) / this.step) * this.step;
// } else {
//     progress = rawProgress;
//     currentValue = this.min + progress * (this.max - this.min);
// }

// currentValue = currentValue.toFixed(2);

// if (this.value !== currentValue) {
//     this.value = currentValue;
//     this.updateSlider(progress);
//     this.onChange(this.value);

// }

// }

// stopDragging() {
// this.isDragging = false;
// }

// printValue() {
// console.log("Slider value:", this.value);
// }

// updateSlider(progress) {
// this.thumb.style.left = `${progress * 100}%`;
// this.bar.style.width = `${progress * 100}%`;
// this.sliderText.textContent = this.value;
// }