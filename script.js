// function runFunctionForProjectKeys() {
//   for (var i = 0; i < localStorage.length; i++) {
//       var key = localStorage.key(i);
//       if (key.startsWith("project-")) {
//           // Run your function here for keys starting with "project-"
//           // For example:
//         console.log(String(key).split('project-')[1])
//         const project = String(key).split('project-')[1]
//           // yourFunction(localStorage.getItem(key));
//           console.log("Key:", key);
//           const div = document.createElement('div')
//           div.innerHTML = `<button>Open ${key.replaceAll('-', ' ')}</button>`

//           document.body.append(div)

//           div.addEventListener('click', () => {
//             window.location = `/studio/?project=${project}`
//           })
//           // Execute your function here
//       }
//   }
// }

// // Call the function to run it
// runFunctionForProjectKeys();

window.location = '/projects/'

document.body.innerHTML = `Redirecting you to /projects/...`