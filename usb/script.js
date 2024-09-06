const keywords = ['DEFAULT_DELAY', 'DEFAULTDELAY', 'DELAY', 'STRING', 'WINDOWS', 'GUI', 'APP', 'MENU', 'SHIFT', 'ALT', 'CTRL', 'CONTROL', 'DOWNARROW', 'DOWN', 'LEFTARROW', 'LEFT', 'RIGHTARROW', 'RIGHT', 'UPARROW', 'UP', 'REPEAT', 'ALTCHAR', 'ALTSTRING', 'ALTCODE', 'ENTER'];

const commands = ['BREAK', 'PAUSE', 'CAPSLOCK', 'DELETE', 'END', 'ESC', 'ESCAPE', 'HOME', 'INSERT', 'NUMLOCK', 'PAGEDOWN', 'PAGEUP', 'PRINTSCREEN', 'SCROLLLOCK', 'SPACE', 'TAB', 'FN']

const editor = document.getElementById('editor');
const suggestionsContainer = document.getElementById('suggestions');

// editor.addEventListener('input', () => {
//     highlightSyntax();
//     // autocomplete();
// });

editor.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
        event.preventDefault();
        applySuggestion();
    }
});

function highlightSyntax(text) {
    // Escape HTML to avoid injection issues
    text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Highlight keywords
    text = text.replace(
        new RegExp(`\\b(${keywords.join('|')})\\b`, 'g'),
        '<span class="keyword">$1</span>'
    );

    // Highlight commands
    text = text.replace(
        new RegExp(`\\b(${commands.join('|')})\\b`, 'g'),
        '<span class="command">$1</span>'
    );

    // Highlight numbers
    text = text.replace(/\b\d+\b/g, '<span class="number">$&</span>');

    // Highlight REM comments (darker gray)
    text = text.replace(/REM.*/g, '<span class="comment">$&</span>');

    return text;
}

function updateHighlighting() {
    let text = editor.value;
    highlighting.innerHTML = highlightSyntax(text);

    
    const project = JSON.parse(window.localStorage.getItem(window.sessionStorage.getItem('activeProject')))
    project.code = text
    window.localStorage.setItem(window.sessionStorage.getItem('activeProject'), JSON.stringify(project))
    // console.log('Autosaved')
}

editor.addEventListener('input', updateHighlighting);

editor.addEventListener('scroll', syncScroll);

function syncScroll() {
    highlighting.scrollTop = editor.scrollTop;
    highlighting.scrollLeft = editor.scrollLeft;
}


// Function to handle comment/uncomment action
function toggleComment() {
    let selection = window.getSelection();
    let selectedText = selection.toString();
    let lines = editor.value.split('\n');
    let startLine = editor.value.substr(0, editor.value.indexOf(selection.anchorNode.value)).split('\n').length - 1;
    let endLine = startLine + selectedText.split('\n').length - 1;

    if (selectedText.trim() === '') {
        startLine = endLine = editor.value.substr(0, editor.selectionStart).split('\n').length - 1;
    }

    for (let i = startLine; i <= endLine; i++) {
        if (lines[i].startsWith('REM ')) {
            lines[i] = lines[i].replace(/^REM\s+/, '');
        } else {
            lines[i] = 'REM ' + lines[i];
        }
    }

    editor.value = lines.join('\n');
    updateHighlighting();

    // setCaretPosition(editor, caretPosition); // Restore cursor position
}

// Event listener for Ctrl + /
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === '/') {
        event.preventDefault();
        toggleComment();
    }
});

function placeCaretAtEnd(el) {
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

function autocomplete() {
    const cursorPos = getCaretPosition();
    const textBeforeCursor = editor.innerText.substring(0, cursorPos);
    const lastWordMatch = textBeforeCursor.match(/\b(\w*)$/);
    if (lastWordMatch) {
        const lastWord = lastWordMatch[1].toUpperCase();
        const suggestions = keywords.filter(keyword => keyword.startsWith(lastWord));

        if (suggestions.length > 0) {
            showSuggestions(suggestions, lastWord.length);
        } else {
            suggestionsContainer.style.display = 'none';
        }
    } else {
        suggestionsContainer.style.display = 'none';
    }
}

function showSuggestions(suggestions, lastWordLength) {
    const range = window.getSelection().getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorRect = editor.getBoundingClientRect();

    suggestionsContainer.innerHTML = suggestions.map(suggestion =>
        `<span class="suggestion-item" data-suggestion="${suggestion}">${suggestion}</span>`
    ).join(' ');

    suggestionsContainer.style.display = 'block';
    suggestionsContainer.style.left = `${rect.left - editorRect.left}px`;
    suggestionsContainer.style.top = `${rect.bottom - editorRect.top + window.scrollY}px`;

    suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            insertSuggestion(item.dataset.suggestion, lastWordLength);
        });
    });
}

// Function to get the current caret position in the contenteditable element
// Function to get the current caret position in the contenteditable element
function getCaretPosition(element) {
    let caretOffset = 0;
    let selection = window.getSelection();

    if (selection.rangeCount > 0) {
        let range = selection.getRangeAt(0);
        let preCaretRange = range.cloneRange();

        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        console.log(range.endContainer.nodeType)

        caretOffset = preCaretRange.toString().length;
    }

    console.log(selection.anchorOffset)
    return selection.anchorOffset;
}

editor.addEventListener('click', () => {
    var selection = window.getSelection();
      var caretLocation = selection.getRangeAt(0).endOffset;
        if(caretLocation === 0)
      {
        var range = document.createRange();
        range.selectNodeContents(this);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else if(caretLocation === this.innerText.length)  {
        var range = document.createRange();
        range.selectNodeContents(this);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);  
      }
})

// Function to set the caret position in the contenteditable element
function setCaretPosition(element, offset) {
    let selection = window.getSelection();
    let range = document.createRange();
    let node = element.firstChild;
    let currentOffset = 0;

    while (node) {
        let nodeLength = node.textContent.length;

        if (currentOffset + nodeLength >= offset) {
            if (node.nodeType === Node.TEXT_NODE) {
                range.setStart(node, offset - currentOffset);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
                return;
            }
        } else {
            currentOffset += nodeLength;
        }

        node = node.nextSibling;
    }
}

// Event listener for text input to highlight syntax
editor.addEventListener('input', function(event) {
    // Debouncing to prevent excessive calls
    // clearTimeout(editor.highlightTimeout);
    // editor.highlightTimeout = setTimeout(() => {
    //     highlightSyntax();
    // }, 50);
    // highlightSyntax();
});

// Handle Enter key
// editor.addEventListener('keydown', function(event) {
//     if (event.key === 'Enter') {
//         // event.preventDefault(); // Prevent the default behavior

//         const caretPosition = getCaretPosition(editor);
//         // document.execCommand('insertHTML', false, '<br>'); // Insert a new line

//         // Preserve caret position
//         setCaretPosition(editor, caretPosition + 1);
//         console.log(caretPosition)
//         highlightSyntax();
//     }

//     // Handle Backspace key
//     if (event.key === 'Backspace') {
//         const caretPosition = getCaretPosition(editor);

//         if (caretPosition === 0) return; // If caret is at the start, do nothing

//         highlightSyntax();
//         setCaretPosition(editor, caretPosition - 1); // Adjust the caret after backspace
//     }
// });

document.getElementById('download').addEventListener('click', () => {
    const text = `REM Made In Flipper Studio https://github.com/cosmixcom/Flipper-Studio
REM Project Name: ${JSON.parse(window.localStorage.getItem(window.sessionStorage.getItem('activeProject'))).name}
REM Project Description: ${JSON.parse(window.localStorage.getItem(window.sessionStorage.getItem('activeProject'))).description}
REM Project Author: ${JSON.parse(window.localStorage.getItem(window.sessionStorage.getItem('activeProject'))).author}
    
` + editor.value
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flipperstudio-${JSON.parse(window.localStorage.getItem(window.sessionStorage.getItem('activeProject'))).name}-${Math.random().toString(36).substring(7)}.txt`;;
    a.click();
    URL.revokeObjectURL(url);

})

const aiBot = `You are a bot to help with the coding language rubber ducky, here are the docs below. JUST PROVIDE PLAIN CODE WHEN ANSWERING NO MARKDOWN OR MESSAGES! They have been translated from markdown to plain text:

Ducky Script
Ducky Script is the language of the USB Rubber Ducky. Writing scripts for can be done from any common ascii text editor such as Notepad, vi, emacs, nano, gedit, kedit, TextEdit, etc.

Syntax
Ducky Script syntax is simple. Each command resides on a new line and may have options follow. Commands are written in ALL CAPS, because ducks are loud and like to quack with pride. Most commands invoke keystrokes, key-combos or strings of text, while some offer delays or pauses. Below is a list of commands and their function, followed by some example usage.

Note: In the tables below //n// represents a number and //Char// represents characters A-Z, a-z.

REM
Similar to the REM command in Basic and other languages, lines beginning with REM will not be processed. REM is a comment.

Command
Rem
REM The next three lines execute a command prompt in Windows
GUI r
STRING cmd
ENTER
DEFAULT_DELAY or DEFAULTDELAY
DEFAULT_DELAY or DEFAULTDELAY is used to define how long (milliseconds) to wait between each subsequent command. DEFAULT_DELAY must be issued at the beginning of the ducky script and is optional. Not specifying the DEFAULT_DELAY will result in faster execution of ducky scripts. This command is mostly useful when debugging.

Command	Parameters
DEFAULT_DELAY	0..->
DEFAULTDELAY	0..->
DEFAULT_DELAY 100
REM delays 100ms between each subsequent command sequence
DELAY
DELAY creates a momentary pause in the ducky script. It is quite handy for creating a moment of pause between sequential commands that may take the target computer some time to process. DELAY time is specified in milliseconds from 1 to 10000. Multiple DELAY commands can be used to create longer delays.

Command	Parameters
DELAY	0..->
DELAY 500
REM will wait 500ms before continuing to the next command.
STRING
STRING processes the text following taking special care to auto-shift. STRING can accept a single or multiple characters.

Command	Parameters
STRING	a...z A...Z 0..9 !...) \`~ += _- "' :; <, >. ?/ \ and pipe
GUI r
DELAY 500
STRING notepad.exe
ENTER
DELAY 1000
STRING Hello World!
WINDOWS or GUI
Emulates the Windows-Key, sometimes referred to as the Super-key.

Command	Optional Parameters
GUI	Single Char
WINDOWS	Single Char
GUI r
REM will hold the Windows-key and press r, on windows systems resulting in the Run menu.
MENU or APP
Emulates the App key, sometimes referred to as the menu key or context menu key. On Windows systems this is similar to the SHIFT F10 key combo, producing the menu similar to a right-click.

Command
APP
MENU
GUI d
MENU
STRING v
STRING d
//Switch to desktop, pull up context menu and choose actions v, then d toggles displaying Windows desktop icons//

SHIFT
Unlike CAPSLOCK, cruise control for cool, the SHIFT command can be used when navigating fields to select text, among other functions.

Command	Optional Parameter
SHIFT	DELETE, HOME, INSERT, PAGEUP, PAGEDOWN, WINDOWS, GUI, UPARROW, DOWNARROW, LEFTARROW, RIGHTARROW, TAB
SHIFT INSERT
REM this is paste for most operating systems
ALT
Found to the left of the space key on most keyboards, the ALT key is instrumental in many automation operations. ALT is envious of CONTROL

Command	Optional Parameter
ALT	END, ESC, ESCAPE, F1...F12, Single Char, SPACE, TAB
GUI r
DELAY 50
STRING notepad.exe
ENTER
DELAY 100
STRING Hello World
ALT f
STRING s
REM alt-f pulls up the File menu and s saves. This two keystroke combo is why ALT is jealous of CONTROL's leetness and CTRL+S
CONTROL or CTRL
The king of key-combos, CONTROL is all mighty.

Command	Optional Parameters
CONTROL	BREAK, PAUSE, F1...F12, ESCAPE, ESC, Single Char
CTRL	BREAK, PAUSE, F1...F12, ESCAPE, ESC, Single Char
CONTROL ESCAPE
REM this is equivalent to the GUI key in Windows
Arrow Keys
Command
DOWNARROW or DOWN
LEFTARROW or LEFT
RIGHTARROW or RIGHT
UPARROW or UP
Extended Commands
Command	Notes
BREAK or PAUSE	For the infamous combo CTRL BREAK
CAPSLOCK	Cruise control for cool. Toggles
DELETE	
END	When will it ever
ESC or ESCAPE	You can never
HOME	There's no place like
INSERT	
NUMLOCK	Toggles number lock
PAGEUP	
PAGEDOWN	
PRINTSCREEN	Typically takes screenshots
SCROLLLOCK	Hasn't been nearly as useful since the GUI was invented
SPACE	the final frontier
TAB	not just a cola
FN	another modifier key
REPEAT
Repeats the last command n times

Command	n
REPEAT	number of times to repeat
DOWN
REPEAT 100 
REM The previous command is repeated 100 times (thus performed 101 times total)`

if (!window.localStorage.getItem('key')) {
    document.getElementById('ai').placeholder = 'Please enter a Cohere API key'
}

document.getElementById('aiForm').addEventListener('submit', async (event) => {
    event.preventDefault()
    if (window.localStorage.getItem('key')) {
        const prompt = document.getElementById('ai').value

        if (prompt) {
            const body = JSON.stringify({
                message: prompt,
                preamble: aiBot,
                model: 'command',
                temperature: 0.9,
                connectors: [{ "id": "web-search" }]
            });

            document.getElementById('ai').value = ''
            document.getElementById('ai').placeholder = 'Loading...'

            const response = await fetch('https://api.cohere.ai/v1/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${window.localStorage.getItem('key')}`,
                },
                body,
            });

            // Check for errors
            if (!response.ok) {
                console.log(response)
            } else {
                document.getElementById('ai').placeholder = ''
            }

            const finished = await response.json()
            console.log(finished)
            let aiResponse = finished.text

            if (aiResponse.includes('```')) {
                aiResponse = aiResponse.split('```')[1]
            }

            try {
                aiResponse.replaceAll('#', 'REM')
                aiResponse.replaceAll('//', 'REM')
                aiResponse.replaceAll('!', 'REM')
            } catch { }

            document.getElementById('aiForm').style.display = 'none';
            editor.value += aiResponse

            updateHighlighting()

            // document.getElementById('ai').value = aiResponse
            // document.getElementById('aiForm').disabled = true;
        }
    } else {
        window.localStorage.setItem('key', document.getElementById('ai').value)
        document.getElementById('ai').value = ''
        document.getElementById('aiForm').style.display = 'none';
        document.getElementById('ai').placeholder = ''
    }
})

window.addEventListener('keydown', async function(event) {

    if (event.key === 'Escape') {
        // Your code to execute on Escape
        document.getElementById('aiForm').style.display = 'none';
        document.getElementById('ai').value = ''
        // document.getElementById('aiForm').disabled = false;
    }
    if (event.ctrlKey && event.key === 'i') {
        // Your code to execute on Ctrl+I
        document.getElementById('ai').select()
        document.getElementById('ai').focus()
        document.getElementById('ai').click()
        setTimeout(function() {
            document.getElementById('ai').select()
            document.getElementById('ai').focus()
            document.getElementById('ai').click()
        }, 500)
        document.getElementById('aiForm').style.display = 'block';


    }
});

//LOAD PROJECT
if (window.sessionStorage.getItem('activeProject')) {
    const project = JSON.parse(window.localStorage.getItem(window.sessionStorage.getItem('activeProject')))
    document.getElementById('editor').value = project.code

    updateHighlighting()
} else {
    window.location = '/projects/'
}

document.getElementById(`loadProjectForm`).addEventListener('submit', async (event) => {
    event.preventDefault()

    const fileInput = document.getElementById('fileInput');
    const githubUrl = document.getElementById('githubUrl').value.trim();
    const projectContent = document.getElementById('editor');

    // Handle file input if a file is selected
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function(e) {
            projectContent.value = e.target.result;

            updateHighlighting()
            document.getElementById('loadProjectPopup').style.display = 'none';
        };

        reader.readAsText(file);
    }
    // Handle GitHub URL if provided
    else if (githubUrl) {
        fetch(githubUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                projectContent.value = data;

                updateHighlighting()
                document.getElementById('loadProjectPopup').style.display = 'none';
            })
            .catch(error => {
                console.error('Error fetching the URL:', error);
                alert('Failed to load content from the URL. Please check the URL and try again.');
            });
    } else {
        alert('Please provide a file or a GitHub URL.');
    }
})

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

document.getElementById('upload').addEventListener('click', async () => {
    try {
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

        const id = Math.random().toString(36).substring(7);

        var text = `REM Made In Flipper Studio https://github.com/cosmixcom/Flipper-Studio
REM Project Name: ${JSON.parse(window.localStorage.getItem(window.sessionStorage.getItem('activeProject'))).name}
REM Project Description: ${JSON.parse(window.localStorage.getItem(window.sessionStorage.getItem('activeProject'))).description}
REM Project Author: ${JSON.parse(window.localStorage.getItem(window.sessionStorage.getItem('activeProject'))).author}
REM Version: ${id}

` + document.getElementById('editor').value

        
text = text.replace(/\r?\n|\r/g, '\n');

        var name = `${JSON.parse(window.localStorage.getItem(window.sessionStorage.getItem('activeProject'))).name}`

        
        
    name = name.replace(/ /g, '-');

        // Write the command to store text in the file
        await writer.write(`storage mkdir /ext/badusb/flipperStudio\r\n`);
        await writer.write(`storage remove /ext/badusb/flipperStudio/${name}.txt\r\n`);
        await writer.write(`storage write /ext/badusb/flipperStudio/${name}.txt\r\n`);
        await writer.write(`${text}\r\n`);
        await writer.write('\x03');
        // Optionally close the writer when done
        writer.releaseLock();

        // // Optionally close the port when finished
        // await port.close();

        // Update connection status on the page
        // document.getElementById('connectionStatus').textContent = 'Write Complete';
        console.log(`File Saved With Version ${id}`)

        alert(`Project saved to /ext/badusb/flipperStudio/${name}.txt`)

        readLoop();
    } catch (error) {
        console.error('There was an error opening or writing to the serial port:', error);
        document.getElementById('upload').textContent = 'Connection Failed';
        // document.getElementById('output').innerHTML += `<span contenteditable="false">${error}</span>`;
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

async function readLoop() {
    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            reader.releaseLock();
            break;
        }

        // const output = document.getElementById('output');
        // output.innerHTML += `<span contenteditable="false">${value}</span>`;
        console.log(value)

        // Remove the bell character
        // output.innerHTML = output.innerHTML.replace(/\u0007/g, '');

        // Move cursor to the end of contenteditable div

        // Scroll to the bottom using scrollIntoView
    }
}