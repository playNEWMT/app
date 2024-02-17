
/*
Kit outline>>>

Title: 
Main topic: 
Objectives/Goals
Computational Thinking Skills 
Workplace/SEL skills 
Elements of Telematics 
Materials
Activation/Engage & Explore/speculative play
Foundations
Apply
Wrap up
(These are the first half of the kit outline. What is expected.)


TODO:
- need to check if connections are true before connecting > should do with all anyway
- make it so you can't connect a block to a connected block
- remvoe change colors button
- make them look more like buttons (slight outline?)
- better system for colors instead of assigning them RGB values > vector?

- fix click and drag bug make it so that blocks can't be on eachother > click drag bug is if two blocks are on eachother and you click them they both drag and glitch flicker
- different combination effect > yellow same, purple gets taller and green make diamond like what it is but less

- make sensor assignments for features > frontcap
    > load them in based off of sensor bluetooth connections
    > have one for each sensor and and AVERAGE for telematic stuff
- make "output" endcap with volume modulation

- click on brings up menu like in TD in a new DIV
- maybe instead of DIV menu have hover menu 
    > when you hover over a block it brings up sliders and shit that you can change while hovering over it
    > would need to change dragging to be not true when rollover is true
    > would maybe need a button to turn hover on and off
    > ORRR HAVE IT create a menu in another part of the canvas screen that has the options for the last hovered over block
        > this would be very similar to TD but what is the benefit of this over the new DIV?
        > could color whats being modulated red
    > this hover menu might only work if the things where simpler
- or maybe have a "modulator" block type that plugs into a feature and then you can do a max msp cable drag into a generator or effect?
    > small notches like in max at the bottom of each labeled 1,2,3,etc and then in the mod matrix in the menu DIV you can choose where that number goes.
    > generators get 3-4 and effects gets 2, end cap output block gets one for volume
    > red

- creat new subclasses for each subblock type that derive from their parent blocktype
- have each of them have a unique icon and DIV menu
- add icons
- have different create P for each button types > have a button for each sub block type (x-axis, y-axis, z-axis, shake, roll, etc)
    > skin them w same colors as parent block types (yellow)
    > each button is icon and label of the thing it is
 black aesthetic > https://images.twinkl.co.uk/tw1n/image/private/t_630/image_repo/05/64/T-I-028-Scratch-Junior-Blocks1.jpg
    > with icons and text like the one i made
- color sliders or icon changes to show certain things > like digitone menu
    > for example a color slider that shows where in the x-axis sensor's range you are
    > ^^ but also an indication of where the treshold is and when you've passed it

*/


let objectArray = [];
let uID = 0;
let bounds = 50;


let wordArray = ["Sound", "Vibration", "Wave Length", "Amplitude", "Frequency", "Medium", "Pitch", "Echo", "Tilt", "Modulation", "Grains", "X-Axis", "Y-axis", "Z-axis"];
let defArray = [
    "A wave created by vibrating objects and moved through a medium from one location to another",
    "A physical movement or oscillation about a reference point",
    "The spatial period of a plane wave",
    "Distance between the origin and crest",
    "The number of cycles or vibrations per second",
    "The material through which a wave travels",
    "High or low sounds determined by its frequency",
    "A sound or series of sounds caused by the reflection of sound waves from a surface back to the listener",
    "Move or cause to move into a sloping position",
    "The process of encoding information in a transmitted signal",
    "Related to the texture of a sound, and includes such modulations as vibrato and tremolo. Splitting of a sound into multiple segments.",
    "Horizontal- left to right line",
    "Vertical- up and down line",
    "3 dimensional coordinate plane- towards and away "
];
let soundImg; let vibrationImg; let waveLengthImg; let amplitudeImg; let frequencyImg; let mediumImg; let pitchImg; let echoImg; let tiltImg; let modulationImg; let grainsImg; let xaxisImg; let yaxisImg; let zaxisImg; 
let imgArray = [soundImg, vibrationImg, waveLengthImg, amplitudeImg, frequencyImg, mediumImg, pitchImg, echoImg, tiltImg, modulationImg, grainsImg, xaxisImg, yaxisImg, zaxisImg];

function preload() {
    for ([index, img] in imgArray){
        img = loadImage(`./media/m_${index}.png`);
    };
}

function setup(){
    var myCanvas = createCanvas(windowWidth, windowHeight);
    let b = document.getElementById("idnameofdiv");
    let w = b.clientWidth;
    let h = b.clientHeight;
    
    createP('');
    colorButton = createButton(`${w}`);
    colorButton.mousePressed(changeAllColors)
    colorButton.parent("idnameofdiv")
    myCanvas.parent("idnameofdiv");

    newWordMatchTriplet();
}

function newWordMatchTriplet(){

}

function newWord(w,h) {
    let s = new Modulator(w/2, h-50, 50);
    objectArray.push(s);
}

function newDef(w,h) {
    let s = new VolumeCap(w/2, h-50, 50);
    objectArray.push(s);
    uID += 1;
}

function newImg(w,h) {
    let s = new VolumeCap(w/2, h-50, 50);
    objectArray.push(s);
}

function trashBlock() {
    for (const[index, block] of objectArray.entries()) {
        if ((block.x + block.w < 0) || (block.x > width) ||
        (block.y + block.h < 0) || (block.y > height)){
            if(mouseIsPressed === false){
                objectArray.splice(index, 1);
            }
        }    
    }
}

function mousePressed() {
    if (mouseButton === LEFT) {    
        for (block of objectArray){
            block.pressed();
        }
    }
}

function swapElements (array, index1, index2) {
    let temp = array[index1];
    array[index1] = array[index2];
    array[index2] = temp;
};

function mouseReleased() {
    for (block of objectArray){
        block.released();
        block.released();
    }
}

function changeAllColors() {
    for (block of objectArray){
        block.changeColor();
    }
}

function draw(){
    resizeCanvas(windowWidth, 450);
    background(50,50,50); 
    for (let i = 0; i < objectArray.length; i++){
        // this loop is weird highlight/wiggle not consistent
        objectArray[i].mouseOver(mouseX, mouseY);
        objectArray[i].update();
        if ((objectArray[i].lastclicked === true)) {
            swapElements(objectArray, i, (objectArray.length - 1));
        }

        for (let j = 0; j < objectArray.length; j++){
            let other = objectArray[j];
            if (objectArray[i] != objectArray[j]){

                objectArray[i].searchForMatch(other.x, other.y, other.w, other.h, other.blockType, other.uID, other.dragging, other.match);
                objectArray[i].matchSuccess(other.x, other.y, other.w, other.h, other.uID, other.dragging, other.blockType);
                objectArray[i].matchFailed(other.uID, other.dragging);
            }
            objectArray[i].shading()
            objectArray[i].show(other.blockType, other.uID);
        }
        trashBlock()
    }
}

class Block{
    constructor(x, y, uID){
        this.x = x;
        this.y = y;
        this.w = 50;
        this.h = 50;
        this.s = 1.00

        this.uID = uID;
        this.blockType = "default";
        this.connected = false;

        this.offsetX = 0;
        this.offsetY = 0;

        this.rollover = false;
        this.highlight = false;
        this.lastclicked = false;
        this.clicked = false;
        this.dragging = false;
        this.wiggling = false;

        this.red = 255;
        this.green = 255;
        this.blue = 255;
    }

    mouseOver(otherX, otherY){
        if ((otherX > this.x) && (otherX < this.x + this.w) &&
        (otherY > this.y) && (otherY < this.y + this.h)) {
            this.rollover = true;
            //console.log("over");
        }
        else {
            this.rollover = false;
        }
    }

    pressed() {
        // Did I click on the rectangle?
        if (mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h) {
            this.clicked = true;
            this.lastclicked = true;
            // If so, keep track of relative location of click to corner of rectangle
            this.offsetX = this.x - mouseX;
            this.offsetY = this.y - mouseY;

        } else {
            this.lastclicked = false;
        }
    }

    update() {
        // Adjust location if being dragged 
        if (this.clicked && mouseIsPressed) {
            if (abs(mouseX + this.offsetX - this.x) > 5 || abs(mouseY + this.offsetY - this.y) > 5){
                if (mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h){
                    this.dragging = true; 
                }
            }
        }

        if (this.dragging) {
            this.clicked = false;
            this.x = mouseX + this.offsetX;
            this.y = mouseY + this.offsetY;
        }
    }
 
    released() {
        // Quit dragging
        this.dragging = false;
        this.highlight = false;

    }

    changeColor(){
        this.red = random(255);
        this.green = random(255);
        this.blue = random(255);
    }

    matchSuccess(oX, oY, oW, oH, ouID, oDrag, oT, oMatched) {
        let onBlock = this.x < (oX + oW) && (this.x + this.w) > oX 
        && this.y < (oY + oH) && (this.y + this.h) > oY;


        if (onBlock && this.dragging === false && oDrag === false) {

                if (ouID === this.uID) {
                    this.x = oX + oW;
                    this.y = oY;
                
                    this.matched = true;
                }
                if (oMatched === true && ouID === this.uID){
                    this.matched = true;
                }
        }
    }

    matchFailed(ouID, oDrag) {
        if (this.dragging === true){
            this.connectL = -1;
            this.connectR = -1;
        }
        if (oDrag === true ){
            //console.log("yup")
            if (ouID === this.connectR){
                this.connectR = -1;
            }
            if (ouID === this.connectL){
                this.connectL = -1;
            }
        }
        //console.log(this.uID, this.blockType, this.connected, "connected to " + this.connectL + " on the left and " + this.connectR + " on the right")

        if (this.connectR === -1 && this.connectL === -1){
            this.connected = false;
        }
    }

    shading(){
        if (this.dragging) {
            fill(this.red - 10, this.green - 25, this.blue - 25);
        } else if (this.rollover && !this.highlight) {
            fill(this.red + 50, this.green + 50, this.blue + 50);
        } else{
            fill(this.red, this.green, this.blue);
        }

        if (this.highlight){
            strokeWeight(6);
            stroke(255, 215, 165);
        } else if (this.lastclicked){
            strokeWeight(6);
            stroke(195, 225, 255);
        } else {
            strokeWeight(3);
            stroke(240,240,240);
        }
    }
}

class Effect extends Block {
    constructor(x, y, uID){
        super(x, y, uID);
        this.blockType = "effect";
        this.w = 125;
        this.h = 100;

        this.red = 10;
        this.blue = 175;
        this.green = 200;
    }


    searchForConnection(oX, oY, oW, oH, oT, ouID, oDrag, oConnectL, oConnectR) {
        let onBlock = this.x < (oX + oW) && (this.x + this.w) > oX 
        && this.y < (oY + oH) && (this.y + this.h) > oY;

        if ((oT === "generator" || oT === "volume") && onBlock
        && oDrag) {
            this.highlight = true;
        } else if ((oT === "generator" || oT === "volume") && !onBlock
        && oDrag){
            this.highlight = false;
        }

        if (oT === "generator") {
            if (this.dragging && onBlock){
                this.preConnectL = ouID;
            }
        }

        if (onBlock && ouID === this.preConnectL && this.dragging){
            this.wiggling = true;
        } else if (onBlock && ouID === this.preConnectL && this.dragging === false){
            this.wiggling = false;
        } else if (!onBlock && ouID === this.preConnectL){
            this.wiggling = false;
            this.preConnectL = -1;
        }

        if (oT === "volume"){
            if (this.dragging && onBlock){
                this.preConnectR = ouID;
            }
        }

        if (onBlock && ouID === this.preConnectR && this.dragging){
            this.wiggling = true;
        } else if (onBlock && ouID === this.preConnectR && this.dragging === false){
            this.wiggling = false;
        } else if (!onBlock && ouID === this.preConnectR){
            this.wiggling = false;
            this.preConnectR = -1;
        }
     }

    show(oT, ouID) {

        push();
        translate(this.x + this.w/2, this.y + this.h/2);

        if (this.dragging){
            scale(this.s*1.2);
        }

        if (this.wiggling){
            rotate(sin(millis()/150) * PI/11);

        }
        
        if (this.connectL === -1){
            beginShape();
            vertex(-this.w/2, -this.h/2);
            vertex(-this.w/2 + this.w, -this.h/2);
            vertex(-this.w/2 + this.w + 25, -this.h/2 + (this.h/2));
            vertex(-this.w/2 + this.w, -this.h/2 + (this.h));
            vertex(-this.w/2, -this.h/2 + this.h);
            vertex(-this.w/2 + 25, -this.h/2 + (this.h/2));
            vertex(-this.w/2, -this.h/2);
            endShape();
            //rect(-this.w/2, -this.h/2, this.w, this.h);
        } else if (ouID === this.connectL && (oT === "generator" || oT === "effect")){
            beginShape();
            vertex(-this.w/2, -this.h/2);
            vertex(-this.w/2 + this.w, -this.h/2);
            vertex(-this.w/2 + this.w + 25, -this.h/2 + (this.h/2));
            vertex(-this.w/2 + this.w, -this.h/2 + (this.h));
            vertex(-this.w/2, -this.h/2 + this.h);
            vertex(-this.w/2 + 25, -this.h/2 + (this.h/2));
            vertex(-this.w/2, -this.h/2);
            endShape();
            // rect(-this.w/2, -this.h/2, this.w, this.h);
            // rect(-this.w/2 - 125, -this.h/2 + 100, this.w + 125, this.h - 100);
        }


        pop();
    }
}



class VolumeCap extends Block {
    constructor(x, y, uID){
        super(x, y, uID);
        this.blockType = "volume";
        this.w = 75;
        this.h = 100;

        this.red = 200;
        this.blue = 200;
        this.green = 200;
    }


    searchForConnection(oX, oY, oW, oH, oT, ouID, oDrag, ) {
        let onBlock = this.x < (oX + oW) && (this.x + this.w) > oX 
        && this.y < (oY + oH) && (this.y + this.h) > oY;

        if (this.connected === false){
            if ((oT === "generator" || oT === "effect") && onBlock
            && oDrag) {
                this.highlight = true;
            } else if ((oT === "generator" || oT === "effect") && !onBlock
            && oDrag){
                this.highlight = false;
            }
        }

        if (onBlock && ouID === this.preConnectL && this.dragging === false){
            this.wiggling = false;
        } else if (!onBlock && ouID === this.preConnectL){
            this.wiggling = false;
            this.preConnectL = -1;
        }

        if (oConnectR === -1){
            if ((oT === "generator" || oT === "effect")) {
                if (this.dragging && onBlock){
                    this.preConnectL = ouID;
                }
            }

            if (onBlock && ouID === this.preConnectL && this.dragging){
                this.wiggling = true;
            }
        }
    }

    show(oT, ouID) {

        push();
        translate(this.x + this.w/2, this.y + this.h/2);

        if (this.dragging){
            scale(this.s*1.2);
        }

        if (this.wiggling){
            rotate(sin(millis()/150) * PI/11);

        }
        
        if (this.connectL === -1){
            beginShape();
            vertex(-this.w/2, -this.h/2);
            vertex(-this.w/2 + this.w, -this.h/2);
            vertex(-this.w/2 + this.w, -this.h/2 + (this.h));
            vertex(-this.w/2, -this.h/2 + this.h);
            vertex(-this.w/2 + 25, -this.h/2 + (this.h/2));
            vertex(-this.w/2, -this.h/2);
            endShape();
        } else if (ouID === this.connectL && (oT === "generator" || oT === "effect")){
            beginShape();
            vertex(-this.w/2, -this.h/2);
            vertex(-this.w/2 + this.w, -this.h/2);
            vertex(-this.w/2 + this.w, -this.h/2 + (this.h));
            vertex(-this.w/2, -this.h/2 + this.h);
            vertex(-this.w/2 + 25, -this.h/2 + (this.h/2));
            vertex(-this.w/2, -this.h/2);
            endShape();
        }
        pop();
    }
}