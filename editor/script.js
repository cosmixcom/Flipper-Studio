// script.js
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.30.1/min/vs' } });
require(['vs/editor/editor.main'], function() {
    let editor = monaco.editor.create(document.getElementById('editor'), {
        value: '',
        language: 'c',
        theme: 'vs-dark' // Set dark theme
    });

    let currentProjectKey = sessionStorage.getItem('activeProject');
    let currentFileName = 'main.c';  // Default to main.c

    // Load project from localStorage
    loadProject();

    // Event listener to update the editor content when a file is selected
    document.getElementById('fileList').addEventListener('click', function(e) {
        if (e.target.tagName === 'LI') {
            let fileName = e.target.innerHTML.split(' <spa')[0];
            currentFileName = fileName;
            let project = JSON.parse(localStorage.getItem(currentProjectKey));
            let file = project.files.find(f => f.name === fileName);
            editor.setValue(file ? file.code : '');
        }
    });

    // Save the editor content to localStorage whenever the content changes
    editor.getModel().onDidChangeContent(function() {
        if (currentProjectKey && currentFileName) {
            let project = JSON.parse(localStorage.getItem(currentProjectKey));
            let file = project.files.find(f => f.name === currentFileName);
            if (file) {
                file.code = editor.getValue();
            } else {
                // If file doesn't exist, create a new one
                project.files.push({ name: currentFileName, code: editor.getValue() });
            }
            localStorage.setItem(currentProjectKey, JSON.stringify(project));
        }
    });

    // Load project from localStorage and initialize the editor and file list
    function loadProject() {
        if (currentProjectKey) {
            let project = JSON.parse(localStorage.getItem(currentProjectKey));
            if (project && project.files) {
                if (project.files.length === 0) {
                    // No files, create default files
                    project.files.push({ name: 'main.c', code: '//Design something great', type: 'file', }, { name: 'application.fam', code: `App(
    appid="${String(currentProjectKey)}",
    name="${project.name}",
    apptype=FlipperAppType.EXTERNAL,
    entry_point="main",
    requires=["gui"],
    stack_size=4 * 1024,
    order=100,
    fap_icon="icon.png",
    fap_category="Tools",
    fap_icon_assets="assets",
    fap_author="flipperstudio.",
    fap_weburl="https://cosmixcom.github.io/flipper-studio/",
    fap_description="Flipper Studio is a free and open-source application development platform for creating apps and writing scripts for the Flipper Zero."
    fap_version="1.0",
)`, type: 'file', });

                    project.files.push();
                    
                    localStorage.setItem(currentProjectKey, JSON.stringify(project));
                }
                project.files.forEach(file => {
                    addFileToList(file.name, false);
                });
                // Load the default file
                editor.setValue(project.files.find(f => f.name === currentFileName)?.code || '');
            } else {
                console.error('Invalid project format or no project found.');
            }
        } else {
            console.error('No active project in sessionStorage.');
        }
    }

    // Add file to the list in the sidebar
    function addFileToList(fileName, created) {
        let fileList = document.getElementById('fileList');
        let li = document.createElement('li');
        li.innerHTML = `${fileName} <span class="material-symbols-outlined" onclick="removeFile('${fileName}')">delete</span>`;
        fileList.appendChild(li);

        if (created) {
            li.click();
        }
    }

    // Handle file creation
    document.getElementById('createFile').addEventListener('click', function() {
        const filename = document.getElementById('fileName').value.trim();

        if (filename) {
            let project = JSON.parse(localStorage.getItem(currentProjectKey));
            if (project.files.find(f => f.name === filename)) {
                alert('File already exists.');
                return;
            }
            addFileToList(filename, true);
            project.files.push({ name: filename, code: '' });
            localStorage.setItem(currentProjectKey, JSON.stringify(project));
            document.getElementById('fileName').value = '';
        }
    });

    // Handle file removal
    window.removeFile = function(fileName) {
        let project = JSON.parse(localStorage.getItem(currentProjectKey));
        project.files = project.files.filter(f => f.name !== fileName);
        localStorage.setItem(currentProjectKey, JSON.stringify(project));

        console.log(fileName)

        // Remove from the list and reset editor
        let fileList = document.getElementById('fileList');
        Array.from(fileList.children).forEach(li => {
            if (li.textContent.includes(fileName)) {
                fileList.removeChild(li);
            }
        });

        // if (currentFileName === fileName) {
        //     // Load a default or another file if the current file is removed
        //     let newFile = project.files[0];
        //     currentFileName = newFile ? newFile.name : 'main.c';
        //     editor.setValue(newFile ? newFile.code : '');
        // }
    }
});

let port;
let reader;
let inputDone;
let outputDone;
let outputStream;
let connected = false;

window.addEventListener('load', async () => {
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

            connected = true;
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
})

const buildFap = app => new Promise((resolve, reject) => {
    fetch(`https://corsproxy.io/?https://flipc.org/api/v2/${app.path}?branch=${app.branch}&nowerr=1`, {
        "headers": {
            "accept": "application/json"
        },
        "method": "GET",
    }).then(res => res.json()).then(res => resolve(res.app.id + ".fap")).catch(reject);
});

const getFap = app => new Promise((resolve, reject) => {
    fetch(`https://corsproxy.io/?https://flipc.org/api/v2/${app.path}/elf?branch=${app.branch}&nowerr=1`, {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
        },
        "method": "GET"
    }).then(res => res.arrayBuffer()).then(resolve).catch(reject);
});

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

const install = async app => {
    // Setup text encoder for writing to the port
    const textEncoder = new TextEncoderStream();
    outputDone = textEncoder.readable.pipeTo(port.writable);
    outputStream = textEncoder.writable;

    // Setup text decoder for reading from the port
    const textDecoder = new TextDecoderStream();
    inputDone = port.readable.pipeTo(textDecoder.writable);
    reader = textDecoder.readable.getReader();

    // Create a writer to send commands to the serial device
    const writer = outputStream.getWriter();

    const writeText = data => {
        writer.write(textEncoder.encode(data));
    }
    
    if(port == null) return alert("The Flipper Zero is not connected!");
    state = 1;
    const name = await buildFap(app);
    state = 2;
    const fap = new Uint8Array(await getFap(app));
    state = 3;
    await writer.write(`storage mkdir /ext/apps/${app.category}\r\n"`);
    await sleep(500);
    await writer.write(`storage remove /ext/apps/${app.category}/${name}\r\n"`);
    await sleep(500);
    writeText(`storage write_chunk /ext/apps/${app.category}/${name} ${fap.byteLength}\r`);
    await sleep(500);
    await writer.write(fap);
    state = 0;
    return fap.byteLength;
}

document.getElementById('install').addEventListener('click', async (e) => {
    if (connected == false) {
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
    }

    
})