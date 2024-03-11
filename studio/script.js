//SYNTAX KEYWORDS
const keywords = ['DEFAULT_DELAY', 'DEFAULTDELAY', 'DELAY', 'STRING', 'WINDOWS', 'GUI', 'APP', 'MENU', 'SHIFT', 'ALT', 'CTRL', 'CONTROL', 'DOWNARROW', 'DOWN', 'LEFTARROW', 'LEFT', 'RIGHTARROW', 'RIGHT', 'UPARROW', 'UP', 'REPEAT', 'ALTCHAR', 'ALTSTRING', 'ALTCODE', 'ENTER'];

const commands = ['BREAK', 'PAUSE', 'CAPSLOCK', 'DELETE', 'END', 'ESC', 'ESCAPE', 'HOME', 'INSERT', 'NUMLOCK', 'PAGEDOWN', 'PAGEUP', 'PRINTSCREEN', 'SCROLLLOCK', 'SPACE', 'TAB', 'FN']

if (window.localStorage.getItem(`project-${new URLSearchParams(location.search).get('project')}`)) {
  editor.setValue(JSON.parse(window.localStorage.getItem(`project-${new URLSearchParams(location.search).get('project')}`)))
}

//SYNTAX HIGHLIGHTING
setInterval(() => {
  window.localStorage.setItem(`project-${new URLSearchParams(location.search).get('project')}`, JSON.stringify(editor.getValue()))
    // line.querySelector('.ace_text').innerHTML = line.querySelector('.ace_text').textContent.replace('-->', '');

    // line.querySelector('.ace_text').innerHTML = line.querySelector('.ace_text').innerHTML.replace('<!--', 'REM');

  const codeLines = document.querySelectorAll('.ace_line');

  codeLines.forEach((line) => {
    try {
      const code = line.querySelector('.ace_text').textContent

      if (code.startsWith('REM')) {
        line.style.color = 'darkgray';
      } else {
        line.style.color = 'white';
      }

      keywords.forEach((keyword) => {
        const keywordIndex = code.indexOf(keyword);
        if (keywordIndex !== -1) {
          const highlightedText = `<span class="keyword">${keyword}</span>`;
          const newText = code.substring(0, keywordIndex) + highlightedText + code.substring(keywordIndex + keyword.length);
          // line.querySelector('.ace_text').innerHTML = newText;
          line.querySelector('.ace_text').innerHTML = line.querySelector('.ace_text').innerHTML.replace(keyword, highlightedText);
        }
      });

      commands.forEach((keyword) => {
        const keywordIndex = code.indexOf(keyword);
        if (keywordIndex !== -1) {
          const highlightedText = `<span class="command">${keyword}</span>`;
          const newText = code.substring(0, keywordIndex) + highlightedText + code.substring(keywordIndex + keyword.length);
          // line.querySelector('.ace_text').innerHTML = newText;
          line.querySelector('.ace_text').innerHTML = line.querySelector('.ace_text').innerHTML.replace(keyword, highlightedText);
        }
      });

      const integerRegex = /\b\d+\b/g;
      let match;
      while ((match = integerRegex.exec(code)) !== null) {
        const startIndex = match.index;
        const endIndex = integerRegex.lastIndex;
        const integer = match[0];
        const highlightedText = `<span class="integer">${integer}</span>`;
        const newText = code.substring(0, startIndex) + highlightedText + code.substring(endIndex);
        // line.querySelector('.ace_text').innerHTML = newText;
        line.querySelector('.ace_text').innerHTML = line.querySelector('.ace_text').innerHTML.replace(integer, highlightedText);
      }
    } catch {
      //Do Nothing to Avoid Spamming Console
    }
  })
}, 50)

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
        connectors: [{"id": "web-search"}]
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
      editor.insert(aiResponse)
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

// Listen for Control + I
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

    // const prompt = window.prompt('What would you like to ask AI?')

    // if (prompt) {
    //   const body = JSON.stringify({
    //     message: prompt,
    //     preamble: aiBot,
    //     model: 'command-light',
    //     temperature: 0.9,
    //   });

    //   const response = await fetch('https://api.cohere.ai/v1/chat', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${window.localStorage.getItem('key')}`,
    //     },
    //     body,
    //   });

    //   // Check for errors
    //   if (!response.ok) {
    //     console.log(response)
    //   }

    //   const finished = await response.json()
    //   console.log(finished)
    //   const aiResponse = finished.text


    // fetch('https://api.cohere.ai/v1/generate', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${window.localStorage.getItem('key')}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     "model": "command",
    //     "prompt": prompt,
    //     "context": aiBot,
    //     "temperature": 0.3,
    //     "chat_history": [],
    //     "prompt_truncation": "AUTO",
    //     "stream": true,
    //     "citation_quality": "accurate",
    //     "connectors": [{"id":"web-search","options":{"site":"https://cosmixcom.github.io/cdn/ducky.html"}}],
    //     "documents": []
    //   })
    // })
    // .then(response => {
    //   if (!response.ok) {
    //     throw new Error('Network response was not ok');
    //   }
    //   return response.json();
    // })
    // .then(data => {
    //   console.log(data);
    // })
    // .catch(error => {
    //   console.error('There was a problem with your fetch operation:', error);
    // });
    // }
  }
});