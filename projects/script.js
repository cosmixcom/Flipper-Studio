document.addEventListener('DOMContentLoaded', () => {
    const projectList = document.getElementById('projectList');
    const newProjectButton = document.getElementById('newProjectButton');
    const popup = document.getElementById('popup');
    const cancelButton = document.getElementById('cancelButton');
    const projectForm = document.getElementById('projectForm');

    function loadProjects() {
        // projectList.innerHTML = '';
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('project-')) {
                const project = JSON.parse(localStorage.getItem(key));
                const li = document.createElement('li');
                li.textContent = project.name;
                li.addEventListener('click', () => {
                    sessionStorage.setItem('activeProject', key);
                    if (project.type === 'Bad USB') {
                        window.location.href = '/usb/';
                    } else if (project.type === 'Native App') {
                        window.location.href = '/editor/';
                    }
                });
                projectList.appendChild(li);
            }
        }
    }

    newProjectButton.addEventListener('click', () => {
        popup.classList.remove('hidden');
    });

    cancelButton.addEventListener('click', () => {
        popup.classList.add('hidden');
        projectForm.reset();
    });

    projectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const projectName = document.getElementById('projectName').value;
        const projectDescription = document.getElementById('projectDescription').value;
        const projectAuthor = document.getElementById('projectAuthor').value;
        const projectVersion = document.getElementById('projectVersion').value;
        const projectType = document.getElementById('projectType').value;

        const project = {
            name: projectName,
            description: projectDescription,
            author: projectAuthor,
            version: projectVersion,
            type: projectType,
            code: 'REM Create Something Amazing With Flipper Studio',
            files: [],
        };

        const projectId = `project-${Date.now()}`;
        localStorage.setItem(projectId, JSON.stringify(project));

        loadProjects();
        popup.classList.add('hidden');
        projectForm.reset();
    });

    loadProjects();

    
    const projectTypeInput = document.getElementById('projectType');
    const projectVersionLabel = document.querySelector('label[for="projectVersion"]');
    const projectVersionInput = document.getElementById('projectVersion');

    projectTypeInput.addEventListener('change', () => {
        if (projectTypeInput.value === 'Native App') {
            projectVersionLabel.classList.add('hidden');
            projectVersionInput.classList.add('hidden');
        } else if (projectTypeInput.value === 'Bad USB') {
            projectVersionLabel.classList.remove('hidden');
            projectVersionInput.classList.remove('hidden');
        }
    });
});
