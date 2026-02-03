/* Minimal, self-contained todo app with localStorage persistence */

const STORAGE_KEY = 'todo_tasks_v1';

const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');

const editModal = document.getElementById('editModal');
const editInput = document.getElementById('editInput');
const saveEdit = document.getElementById('saveEdit');
const cancelEdit = document.getElementById('cancelEdit');

const confirmModal = document.getElementById('confirmModal');
const confirmDelete = document.getElementById('confirmDelete');
const cancelDelete = document.getElementById('cancelDelete');
const confirmMessage = document.getElementById('confirmMessage');

let tasks = [];
let currentEditId = null;
let currentDeleteId = null;

/* Helpers */
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
function formatDate(d) {
  return new Date(d).toLocaleString();
}
function escapeHtml(str = '') {
  return String(str).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

/* Render */
function render() {
  taskList.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.done ? ' done' : '');
    li.dataset.id = task.id;

    li.innerHTML = `
      <div class="task-main">
        <p class="task-name">${escapeHtml(task.name)}</p>
        <p class="task-meta">Created: ${formatDate(task.createdAt)}${task.updatedAt ? ' • Edited: ' + formatDate(task.updatedAt) : ''}</p>
      </div>
      <div class="task-actions">
        <button class="done-btn">${task.done ? 'Mark as undone' : 'Mark as done'}</button>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn danger">Delete</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

/* Init from storage */
tasks = loadTasks();

/* Normalize dates if they are not ISO strings (skip if already string) */
tasks = tasks.map(t => ({
  id: t.id,
  name: t.name,
  createdAt: t.createdAt || new Date().toISOString(),
  updatedAt: t.updatedAt || null,
  done: !!t.done
}));

render();

/* Events: Add */
addBtn.addEventListener('click', () => {
  const val = taskInput.value.trim();
  if (!val) return;
  const now = new Date().toISOString();
  const task = { id: Date.now().toString(), name: val, createdAt: now, updatedAt: null, done: false };
  tasks.unshift(task);
  taskInput.value = '';
  addBtn.disabled = true;
  saveTasks();
  render();
});
taskInput.addEventListener('input', () => addBtn.disabled = taskInput.value.trim() === '');
taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !addBtn.disabled) addBtn.click();
});

/* Event delegation for task actions */
taskList.addEventListener('click', (e) => {
  const li = e.target.closest('li.task-item');
  if (!li) return;
  const id = li.dataset.id;
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  if (e.target.classList.contains('done-btn')) {
    task.done = !task.done;
    saveTasks();
    render();
  } else if (e.target.classList.contains('edit-btn')) {
    currentEditId = id;
    editInput.value = task.name;
    openModal(editModal);
    editInput.focus();
  } else if (e.target.classList.contains('delete-btn')) {
    currentDeleteId = id;
    confirmMessage.textContent = `Are you sure you want to delete "${task.name}"?`;
    openModal(confirmModal);
  }
});

/* Edit modal handlers */
saveEdit.addEventListener('click', () => {
  const newVal = editInput.value.trim();
  if (!newVal) return;
  const task = tasks.find(t => t.id === currentEditId);
  if (task) {
    task.name = newVal;
    task.updatedAt = new Date().toISOString();
    saveTasks();
  }
  closeModal(editModal);
  render();
});
cancelEdit.addEventListener('click', () => closeModal(editModal));

/* Delete confirm handlers */
confirmDelete.addEventListener('click', () => {
  tasks = tasks.filter(t => t.id !== currentDeleteId);
  currentDeleteId = null;
  saveTasks();
  closeModal(confirmModal);
  render();
});
cancelDelete.addEventListener('click', () => {
  currentDeleteId = null;
  closeModal(confirmModal);
});

/* Modal helpers */
function openModal(modal) { modal.classList.remove('hidden'); }
function closeModal(modal) { modal.classList.add('hidden'); }

/* Close modal on overlay click */
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', (e) => {
    if (e.target === m) closeModal(m);
  });
});
