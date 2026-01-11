const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const editModal = document.getElementById('editModal');
const editInput = document.getElementById('editInput');
const editSaveBtn = document.getElementById('editSaveBtn');
const editCancelBtn = document.getElementById('editCancelBtn');
const deleteModal = document.getElementById('deleteModal');
const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
const deleteCancelBtn = document.getElementById('deleteCancelBtn');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentEditId = null;
let currentDeleteId = null;

const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
};

const renderTasks = () => {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.done ? 'done' : ''}`;
        li.innerHTML = `
            <div class="task-name">${escapeHtml(task.name)}</div>
            <div class="task-meta">
                <span class="meta-item">Added: ${formatDate(task.createdAt)}</span>
                ${task.updatedAt ? `<span class="meta-item">Edited: ${formatDate(task.updatedAt)}</span>` : ''}
            </div>
            <div class="task-buttons">
                <button class="task-buttons-item btn-done ${task.done ? 'undone' : ''}" onclick="toggleDone('${task.id}')">
                    ${task.done ? 'Mark as undone' : 'Mark as done'}
                </button>
                <button class="task-buttons-item btn-edit" onclick="openEditModal('${task.id}')">Edit</button>
                <button class="task-buttons-item btn-delete" onclick="openDeleteModal('${task.id}')">Delete</button>
            </div>
        `;
        taskList.appendChild(li);
    });
};

const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

const addTask = () => {
    const taskName = taskInput.value.trim();
    if (!taskName) return;

    const newTask = {
        id: Date.now().toString(),
        name: taskName,
        done: false,
        createdAt: new Date().toISOString(),
        updatedAt: null
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskInput.value = '';
    taskInput.focus();
};

const toggleDone = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.done = !task.done;
        saveTasks();
        renderTasks();
    }
};

const openEditModal = (id) => {
    currentEditId = id;
    const task = tasks.find(t => t.id === id);
    if (task) {
        editInput.value = task.name;
        editModal.classList.remove('hidden');
        editInput.focus();
        editInput.select();
    }
};

const closeEditModal = () => {
    editModal.classList.add('hidden');
    currentEditId = null;
    editInput.value = '';
};

const saveEdit = () => {
    const newName = editInput.value.trim();
    if (!newName || !currentEditId) return;

    const task = tasks.find(t => t.id === currentEditId);
    if (task) {
        task.name = newName;
        task.updatedAt = new Date().toISOString();
        saveTasks();
        renderTasks();
        closeEditModal();
    }
};

const openDeleteModal = (id) => {
    currentDeleteId = id;
    deleteModal.classList.remove('hidden');
};

const closeDeleteModal = () => {
    deleteModal.classList.add('hidden');
    currentDeleteId = null;
};

const confirmDelete = () => {
    if (!currentDeleteId) return;

    tasks = tasks.filter(t => t.id !== currentDeleteId);
    saveTasks();
    renderTasks();
    closeDeleteModal();
};

addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

editSaveBtn.addEventListener('click', saveEdit);
editInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveEdit();
});
editCancelBtn.addEventListener('click', closeEditModal);

deleteConfirmBtn.addEventListener('click', confirmDelete);
deleteCancelBtn.addEventListener('click', closeDeleteModal);

// Close modals when clicking outside
editModal.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModal();
});
deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDeleteModal();
});

renderTasks();
