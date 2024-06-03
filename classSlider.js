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

        this.currentRotation = 0;
        this.isRotating = false;
        this.rotationDirection = 1; // 1 for clockwise, -1 for counterclockwise
        this.rotationSpeed = 0; // Speed of rotation

        // Bind the update function
        this.updateRotation = this.updateRotation.bind(this);


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
        if (this.type === 'tempo') {
            this.attachParamTempo();
        }

        if(this.type === 'visualize') {
            this.attachVisualizeSliders();
        }
        if(this.type === 'visualizeLoop') {
            this.attachVisualizeLoop();
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
        if(this.type === 'visualizeFX') {
            this.attachVisualizeFX();
        }
        if(this.type === 'visualizeTap') {
            this.attachVisualizeTap();
        }

        if (this.type === 'vol') {
            this.attachVolSliders();
            console.log("loop vol");
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
        if (this.type === 'verb') {
            this.attachVerb();
        }
        if(this.type === 'choices') {
            this.attatchFXchoices();
        }
        if(this.type === 'sensor-select-vis') {
            this.attachSensorVis();
        }
        if(this.type ==='visualizeHarmony') {
            this.attachHarmonyVis();
        }
    }

    attachVisualizeTap() {
        console.log("hi- blap");
        const container = this.container;
    
        let paramName = this.name;
        const param = this.device.parametersById.get(paramName);
        param.changeEvent.subscribe((value) => {
            // console.log(value);
            // Smooth rotation animation using CSS transition
            // container.style.transition = "transform 0.3s ease-in-out";
            // container.style.transform = `rotate(${value * 10}deg)`;
    
            // Delay class removal to allow animation to complete
            setTimeout(() => {
                container.classList.remove('scale-animate');
            }, 200); // Adjust timeout to match transition duration
            // Add the class to trigger the animation
            container.classList.add('scale-animate');
        });

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

    updateRotation() {
        if (!this.isRotating) return;

        const loopRotate = this.container[1];

        // Update current rotation based on the direction and speed
        this.currentRotation += this.rotationDirection * this.rotationSpeed;
        loopRotate.style.transform = `rotate(${this.currentRotation}deg)`;

        // Continue rotation
        requestAnimationFrame(this.updateRotation);
    }

    startRotation() {
        if (!this.isRotating) {
            this.isRotating = true;
            this.updateRotation();
        }
    }

    stopRotation() {
        this.isRotating = false;
    }

    setRotationParams(value) {
        if (value > 63) {
            this.rotationDirection = 1; // Clockwise
        } else if (value < 63) {
            this.rotationDirection = -1; // Counterclockwise
        }

        this.rotationSpeed = Math.abs(value - 63) / 6; // Adjust speed based on distance from 63 (tune the divisor as needed)
    }

    attachVisualizeLoop() {
        const throttledUpdate = this.throttle((e) => {
            this.setRotationParams(e);
            this.startRotation();
        }, 50);

        this.param.changeEvent.subscribe(throttledUpdate);

        let slider = this.container[0];

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
                newPosition = 35 - (newValue * 0.7),
                percentage = (value - slider.min) / (slider.max - slider.min),
                progress = percentage * 100;
            let labelText = slider.value.slice(0,3);
            // labelText = labelText.toFixed(1);
            if (this.name === 'user_Grains') {
                label.innerHTML = `<span>num</span>`;
            }
            if (this.id === "user_Grain_Size") {
                label.innerHTML = `<span>size</span>`;
            }
            if (this.id === "user_Grain_Pitch") {
                label.innerHTML = `<span>pitch</span>`;
            }
            if (this.id === "user_Organic_Modes") {
                label.innerHTML = `<span>???</span>`;
            }
            if (this.id === "tempo") {
                label.innerHTML = `<span>${labelText}</span>`; 
            }
            
            label.style.left = `calc(${newValue}% + (${newPosition}px))`;
            event.target.style.background = `linear-gradient(to right, var(--primary) ${progress}%, var(--secondary) ${progress}%)`;

            this.param.value = value;
        });
    
        

        const inputEvent = new Event('input');
        slider.dispatchEvent(inputEvent);
    }

    attachParamTempo() {
        let slider = this.container;
        let label = document.getElementById('tempo-label');
        // const video = document.getElementById('tempo-video');
  
        // video.src = './media/metronome.mp4'; 

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
                percentage = (value - slider.min) / (slider.max - slider.min),
                progress = percentage * 100;
            let labelText = parseInt(slider.value, 10);
            label.innerHTML = labelText.toString();
            event.target.style.background = `linear-gradient(to right, var(--primary) ${progress}%, var(--text-l) ${progress}%)`;

            // const playbackRate = Math.min(Math.max(value / 50, 0.5), 4.0);
            // console.log(playbackRate);
            // video.playbackRate = playbackRate;
        
            // Position the video element over the slider thumb
            // const rect = slider.getBoundingClientRect();
            // video.style.display = 'block';
            // video.style.position = 'absolute';
            // video.style.left = `${rect.left + (slider.value / slider.max) * rect.width - 650}px`; 
            // video.style.top = `${rect.top - 330}px`;

            this.param.value = value;
        });
        // video.play();
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
            event.target.style.setProperty('--speed-blue', `${scaleProgress + 40}`);
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

    attachVisualizeFX() {
        let slider = this.container;
        let sensorvis = document.getElementById('ss-fx');

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
                const progress = this.mapRange(param.value, 0, 127, 0, 100);
                sensorvis.style.background = `linear-gradient(to right, var(--sensor-red) ${progress}%, var(--sensor-red-l) ${progress}%)`;
            }
        });

        slider.addEventListener("input", () => {
            let value = Number.parseFloat(slider.value);
            this.param.value = value;
            console.log(this.param.value, value);
        });
    }

    attachVisualizeDrums(){
        let container = this.container
        // console.log(this.id);
        container.setAttribute("id", this.id);
        if(this.param.value === 0.5) {
            console.log("hello");

            container.style.backgroundImage = 'url(./media/drum-neutral.svg)';
        }
        this.device.parameterChangeEvent.subscribe(param => {
            if (param.id === container.id){
                
                // console.log(container.id, param.value);

                if(param.value === 0) {
                    // console.log("kick");
                    container.style.backgroundImage = 'url(./media/drum-bass.svg)';
                }
                if(param.value === 1) {
                    // console.log("snare");
                    container.style.backgroundImage = 'url(./media/drum-snare.svg)';
                }
            }
        });

        // this.param.changeEvent.subscribe((e) => {
        //     if(param.value === 0) {
        //         console.log("kick");
        //         container.style.backgroundImage = 'url(./media/drum-bass.svg)';
        //     }
        //     if(param.value === 1) {
        //         console.log("snare");
        //         container.style.backgroundImage = 'url(./media/drum-snare.svg)';
        //     }
        // });
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
        
        slider.addEventListener("input", () => {
            let value = Number.parseFloat(slider.value);
            this.param.value = value;
            updateSliderBackground(slider);
        });
        
        const updateSliderBackground = (slider) => {
            const value = Number.parseFloat(slider.value);
            const min = Number.parseFloat(slider.min);
            const max = Number.parseFloat(slider.max);
            const percentage = (value - min) / (max - min);
            const midpoint = 0.5;
        
            let gradient;
        
            if (percentage <= midpoint) {
                gradient = `linear-gradient(to right, #f9ad2963 ${percentage * 100}%, transparent ${percentage * 100}%)`;
            } else {
                gradient = `linear-gradient(to left, #f9ad2963 ${(1 - percentage) * 100}%, transparent ${(1 - percentage) * 100}%)`;
            }
        
            slider.style.background = gradient;
        };
        
        updateSliderBackground(slider);
        
        const inputEvent = new Event('input');
        slider.dispatchEvent(inputEvent);
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
            const scaleProgress = this.mapRange(progress, 0, 100, 2.0, 4.5);
            event.target.style.setProperty('--ear-scale', `${scaleProgress}`);
            event.target.style.background = `linear-gradient(to right, var(--primary) ${progress}%, var(--text-l) ${progress}%)`;
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

    attachVerb() {
        let slider = this.container;
        let wash = document.querySelector(".effects-controls");
        // console.log(wash)
;
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
            const secondaryProgress = this.mapRange(progress, 0, 100, 0, 120);
            const primaryProgresswash = this.mapRange(progress, 0, 100, 100, -10);
            const secondaryProgresswash = this.mapRange(progress, 0, 100, 100, 110);
            // console.log(progress);
            // document.documentElement.style.setProperty('--sensitivity-thumb-height', `${thumbProgress}px`);
            slider.style.background = `linear-gradient(to right, var(--primary) ${primaryProgress}%, var(--text) ${secondaryProgress}%, var(--text) 100%)`;
            this.param.value = value;
            wash.style.background = `linear-gradient(to bottom, var(--text) ${primaryProgresswash}%, var(--text-d) ${secondaryProgresswash}%, var(--text-d) 80%)`;

          });

          const inputEvent = new Event('input');
          slider.dispatchEvent(inputEvent);

    }

    attatchFXchoices() {
        const param = this.param; 
        
        const buttons = document.querySelectorAll(".effects-toggle-button");

        buttons.forEach(button => {
          button.addEventListener("click", function() {
            // console.log(param);

            if (param) {
              // Remove 'active' class from all buttons
              buttons.forEach(btn => btn.classList.remove("active"));
      
              // Add 'active' class to the clicked button
              this.classList.add("active");
      
              // Convert the data-value attribute to a number and set the parameter value
              const value = Number(this.getAttribute("data-value"));
              param.value = value; // Set the value of param.value
              console.log(param.value, value);
            } else {
              console.error("param is undefined or null");
            }
            
          });
          if (button.getAttribute("data-value") == 1) {
            button.classList.add("active");
          }
        });
    }

    attachSensorVis() {
        let sensorvis = this.container;
        
        let paramName = this.name;
        const param = this.device.parametersById.get(paramName);
        param.changeEvent.subscribe((value) => {
            console.log(value);
            const progress = this.mapRange(value, 0, 127, 0, 100);
            sensorvis.style.background = `linear-gradient(to right, var(--sensor-red) ${progress}%, var(--sensor-red-l) ${progress}%)`;
	        // Handle events here
        });
        
        
        this.device.parameterChangeEvent.subscribe(param => {


        });
    }

    attachHarmonyVis() {
        let sensorvis = this.container;
        
        let paramName = this.name;
        const param = this.device.parametersById.get(paramName);
        param.changeEvent.subscribe((value) => {
            console.log(param.value);
            //console.log(param.value);
            const progress = this.mapRange(param.value, 0, 127, 0, 100);
            sensorvis.style.background = `linear-gradient(to right, var(--accent-ll) ${progress}%, var(--background) ${progress}%)`;
        });
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