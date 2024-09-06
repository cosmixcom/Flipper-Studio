const connectButton = document.getElementById('connect');
const appListDiv = document.getElementById('app-list');

let port;

connectButton.addEventListener('click', async () => {
    try {
        // Request a port and open a connection
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 230400 });

        // Create a stream reader to read data from the serial port
        const decoder = new TextDecoderStream();
        const inputDone = port.readable.pipeTo(decoder.writable);
        const inputStream = decoder.readable.getReader();

        // Command to list apps in the apps folder
        const command = "device_info";
        const encoder = new TextEncoder();
        const writer = port.writable.getWriter();
        await writer.write(encoder.encode(command));
        writer.releaseLock();

        let appList = '';

        // Read the data from the serial port
        while (true) {
            const { value, done } = await inputStream.read();
            if (done) break;
            appList += value;

            // Optionally display data as it's received
            displayData(value);
        }

        inputStream.releaseLock();
        await inputDone;

        // Display the complete app list once finished
        displayApps(appList);

        // await port.close();
    } catch (error) {
        console.error('Error:', error);
    }
});

function displayData(data) {
    const div = document.createElement('div');
    div.className = 'app-item';
    div.textContent = data;
    appListDiv.appendChild(div);
}

function displayApps(apps) {
    const appItems = apps.split('\n').filter(app => app.trim() !== '');
    appListDiv.innerHTML = '';
    appItems.forEach(app => {
        const div = document.createElement('div');
        div.className = 'app-item';
        div.textContent = app;
        appListDiv.appendChild(div);
    });
}

async function runSerialCommand(command) {
    try {
        // Request a serial port
        const port = await navigator.serial.requestPort();
        // Open the port with a specific baud rate
        await port.open({ baudRate: 9600 });

        // Set up the reader to read incoming data from the serial port
        const decoder = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(decoder.writable);
        const inputStream = decoder.readable.getReader();

        // Send the command to the device
        const encoder = new TextEncoder();
        const writer = port.writable.getWriter();
        await writer.write(encoder.encode(command + "\n"));
        writer.releaseLock();

        let output = '';

        // Read the data from the serial port and log it to the console
        while (true) {
            const { value, done } = await inputStream.read();
            if (done) break;
            output += value;
        }

        // Close the input stream and the port
        inputStream.releaseLock();
        await readableStreamClosed;
        await port.close();

        // Log the output to the console
        console.log('Command Output:', output);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Example usage: run a command and display the output
// runSerialCommand("ls /apps");
