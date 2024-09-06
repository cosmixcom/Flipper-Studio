let port;
let reader;
let inputDone;
let outputDone;
let outputStream;
let previousCommands = []
let historyIndex = -1;

// document.getElementById('terminal').addEventListener('submit', async (e) => {
//     e.preventDefault();

//     const commandInput = document.getElementById('commandInput');
//     const command = commandInput.value + '\r\n';

//     // Append command to the output
//     const output = document.getElementById('output');
//     output.textContent += `\n$ ${commandInput.value}`;

//     try {
//         const writer = outputStream.getWriter();
//         await writer.write(command);
//         writer.releaseLock();
//     } catch (error) {
//         console.error('Error sending command:', error);
//     }

//     commandInput.value = ''; // Clear the input field after sending

//     // Scroll the output to the bottom to show the latest command
//     output.scrollTop = output.scrollHeight;

//     // Move input to the end
//     const terminalBody = document.querySelector('.terminal-body');
//     terminalBody.appendChild(document.getElementById('terminal'));
// });

async function readLoop() {
    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            reader.releaseLock();
            break;
        }

        const output = document.getElementById('output');
        output.innerHTML += `<span contenteditable="false">${value}</span>`;

        // Remove the bell character
        output.innerHTML = output.innerHTML.replace(/\u0007/g, '');

        // Move cursor to the end of contenteditable div
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(output);
        range.collapse(false);  // Collapse the range to the end of the content
        selection.removeAllRanges();
        selection.addRange(range);
        output.focus();

        // Scroll to the bottom using scrollIntoView
        setTimeout(function() {
            output.lastElementChild.scrollIntoView({ behavior: 'smooth' });
        }, 10)
    }
}

document.getElementById('connectButton').addEventListener('click', async () => {
    try {
        const savedPortInfo = JSON.parse(localStorage.getItem('serialPortInfo'));
        // Request access to the serial port
        if (savedPortInfo) {
            // Get all available serial ports
            const ports = await navigator.serial.getPorts();

            // Try to find the saved port based on vendorId and productId
            port = ports.find(p => {
                const info = p.getInfo();
                return info.vendorId === savedPortInfo.vendorId && info.productId === savedPortInfo.productId;
            });

            if (port) {
                // Try to open the saved port
                await port.open({ baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' });
                console.log('Reconnected to the saved port');

                const info = port.getInfo();
                localStorage.setItem('serialPortInfo', JSON.stringify(info));
            } else {
                console.log('Saved port not found, requesting a new port.');
            }
        }

        // If no valid port was found, prompt the user to select a new port
        if (!port) {
            port = await navigator.serial.requestPort();
            await port.open({ baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' });

            // Save the selected port's information to localStorage
            const info = port.getInfo();
            localStorage.setItem('serialPortInfo', JSON.stringify(info));
            console.log('New port selected and saved');
        }

        document.getElementById('connectionStatus').textContent = 'Connected';

        const textEncoder = new TextEncoderStream();
        outputDone = textEncoder.readable.pipeTo(port.writable);
        outputStream = textEncoder.writable;

        const textDecoder = new TextDecoderStream();
        inputDone = port.readable.pipeTo(textDecoder.writable);
        reader = textDecoder.readable.getReader();

        readLoop();
    } catch (error) {
        console.error('There was an error opening the serial port:', error);
        document.getElementById('connectionStatus').textContent = 'Connection Failed';
        document.getElementById('output').innerHTML += `<span contenteditable="false">${error}</span>`;
    }
});


window.addEventListener('unload', async () => {
    if (reader) {
        reader.cancel();
        await inputDone.catch(() => { });
        reader = null;
    }
    if (outputStream) {
        outputStream.getWriter().close();
        await outputDone;
    }
    if (port) {
        await port.close();
    }
});

const output = document.getElementById('output');

// Function to prevent removal of specific spans
function preventDeletion(event) {
    const target = event.target;
    // console.log(event)
    if (target && target.lastChild && target.lastChild.contentEditable === 'false') {
        // console.log('attempted removal' + event.inputType)
        // Prevent removal if the target is a protected span
        if (event.inputType === 'deleteContentBackward' || event.inputType === 'deleteContentForward') {
            event.preventDefault();
            // alert('This content cannot be removed.');
        }
    }
}

// Attach event listener
output.addEventListener('beforeinput', preventDeletion);

// Listen for Enter key
output.addEventListener('keydown', async (event) => {


    if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault(); // Prevent default action (new line)

        document.getElementById('output').innerHTML += '\n';

        placeCaretAtEnd(document.getElementById('output'))

        setTimeout(function() {
            output.lastElementChild.scrollIntoView({ behavior: 'smooth' });
        }, 10)
        return
    }


    if (event.ctrlKey && event.key === 'c') {
        // Prevent the default action (e.g., copying text)
        event.preventDefault();

        const writer = outputStream.getWriter();
        await writer.write('\x03');
        writer.releaseLock();

        placeCaretAtEnd(document.getElementById('output'))

        setTimeout(function() {
            output.lastElementChild.scrollIntoView({ behavior: 'smooth' });
        }, 10)
        // You can add any additional actions you want to take when Ctrl+C is pressed here
    }

    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default action (new line)
        const output = document.getElementById('output');

        const textNodes = Array.from(output.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
        const textContent = textNodes.map(node => node.nodeValue).join('');
        // console.log('Text not inside span:', textContent);

        previousCommands.push(textContent);

        const command = textContent + '\r\n';

        textNodes[0].remove()
        try {
            const writer = outputStream.getWriter();
            await writer.write(command);
            writer.releaseLock();
        } catch (error) {
            console.error('Error sending command:', error);
        }
    }
});

let savedCommand = '';
let currentIndex = -1;

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        // let currentIndex = previousCommands.length - 1;
        return
        const outputTextarea = document.getElementById('output');

        if (event.key === 'ArrowUp') {
            console.log(currentIndex)
            if (currentIndex >= -1) {
                if (savedCommand !== '') {
                    outputTextarea.innerHTML = String(outputTextarea.innerHTML).replaceAll(savedCommand, previousCommands[currentIndex]);

                    savedCommand = previousCommands[currentIndex];
                    currentIndex = Math.max(0, currentIndex - 1);
                } else {
                    outputTextarea.textContent += previousCommands[currentIndex];

                    savedCommand = previousCommands[currentIndex];
                    console.log(previousCommands[currentIndex])
                    currentIndex = Math.max(0, currentIndex - 1);
                }

                placeCaretAtEnd(outputTextarea)
            }
        } else if (event.key === 'ArrowDown') {
            if (currentIndex < previousCommands.length - 1) {
                currentIndex = Math.min(previousCommands.length - 1, currentIndex + 1);
                outputTextarea.value = previousCommands[currentIndex];
            } else {
                outputTextarea.value = '';
            }
        }

        // Append the command to the existing value
        outputTextarea.value += `\n$ {outputTextarea.value}`;
    }
});

// Reference to the contenteditable div
// const output = document.getElementById('output');
function placeCaretAtEnd(el) {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false); // Collapse the range to the end of the content
    sel.removeAllRanges();
    sel.addRange(range);
    el.focus();
}

// Listen for page load
window.addEventListener('load', async () => {
    try {
        const savedPortInfo = JSON.parse(localStorage.getItem('serialPortInfo'));
        // Request access to the serial port
        if (savedPortInfo) {
            // Get all available serial ports
            const ports = await navigator.serial.getPorts();

            // Try to find the saved port based on vendorId and productId
            port = ports.find(p => {
                const info = p.getInfo();
                return info.vendorId === savedPortInfo.vendorId && info.productId === savedPortInfo.productId;
            });

            if (port) {
                // Try to open the saved port
                await port.open({ baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' });
                console.log('Reconnected to the saved port');

                const info = port.getInfo();
                localStorage.setItem('serialPortInfo', JSON.stringify(info));
            } else {
                console.log('Saved port not found, requesting a new port.');
            }
        }

        // If no valid port was found, prompt the user to select a new port
        if (!port) {
            port = await navigator.serial.requestPort();
            await port.open({ baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' });

            // Save the selected port's information to localStorage
            const info = port.getInfo();
            localStorage.setItem('serialPortInfo', JSON.stringify(info));
            console.log('New port selected and saved');
        }

        document.getElementById('connectionStatus').textContent = 'Connected';

        const textEncoder = new TextEncoderStream();
        outputDone = textEncoder.readable.pipeTo(port.writable);
        outputStream = textEncoder.writable;

        const textDecoder = new TextDecoderStream();
        inputDone = port.readable.pipeTo(textDecoder.writable);
        reader = textDecoder.readable.getReader();

        readLoop();

        document.getElementById('connectButton').remove()
    } catch (error) {
        document.getElementById('output').innerHTML += `<span contenteditable="false">${error}</span>`;
    }
});