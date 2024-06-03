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
        // this.color = [];
        this.deviceBlock = null;
        this.deviceLabel = '';
        this.deviceSlider = null;
        this.container = null;
        this.connectedTo = []; // figure out dropdown for all paired sensors of sensorarray, figure out how to store which senssors are connectedTo which devices

        this.mode = 0;
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

            this.boundhandleMidiMessageReceived = 

            console.log(this.characteristic.startNotifications());
            this.characteristic.addEventListener('characteristicvaluechanged', (event) => {
                handleMidiMessageRecieved(event, this.id, this.axis, this.connectedTo);
            });
            console.log(`Notifications started`)
            printToConsole(`Connected to ${this.name}!`);

        } catch (error) {
            if (error.name === 'NotFoundError') {
                console.error('Device not found. Please make sure it is turned on and in range.');
                printToConsole('Device not found. Please make sure it is turned on and in range.');
            } else if (error.name === 'SecurityError') {
                console.error('Security error. Make sure your browser has necessary permissions.');
                printToConsole('Security error. Make sure your browser has necessary permissions.');
            } else if (error.name === 'NotAllowedError') {
                console.error('Permission denied. Please allow browser access to Bluetooth devices.');
                printToConsole('Permission denied. Please allow browser access to Bluetooth devices.');
            } else {
                console.error('An error occurred while connecting to the device:', error);
                printToConsole('An error occurred while connecting to the device. See console for details.');
            }
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
        if (this.name.includes("1")) {
            this.channel = 1;
            this.shortName = 'Sensor 1';
            // this.color = ['3px solid rgb(255, 0, 0)', '#ff000033'];
            this.container = 'connected-devices-1';
        } else if (this.name.includes("2")) {
            this.channel = 2;
            this.shortName = 'Sensor 2';
            // this.color = ['3px solid rgb(38, 34, 255)', '#2622ff33'];
            this.container = 'connected-devices-2';
        } else if (this.name.includes("3")) {
            this.channel = 3;
            this.shortName = 'Sensor 3';
            // this.color = ['3px solid rgb(43, 255, 0)', '#2bff0033'];
            this.container = 'connected-devices-3';
        } else {
            this.channel = 4;
            this.shortName = 'Unknown Device';
            // this.color = ['3px solid rgb(141, 141, 141)', '#85858533'];
            this.container = 'connected-devices-misc';
        }

    }
}