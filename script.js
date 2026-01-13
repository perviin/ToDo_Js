class Task {
  static STATUS_COLORS = {
    "à faire": "blue",
    "en cours": "orange",
    "terminée": "green",
    "bloquée": "red"
  };

  constructor({ title, description = "", status = "à faire" }) {
    if (!title.trim()) throw new Error("Il faut un titre");
    if (!Object.keys(Task.STATUS_COLORS).includes(status)) throw new Error("Erreur");

    this.id = crypto.randomUUID(); // ✅ ID unique
    this.title = title;
    this.description = description;
    this.status = status;
    this.createdAt = new Date().toISOString();
    this.color = Task.STATUS_COLORS[status];
  }
}

class TaskManager {
  constructor() {
    this.tasks = [];
    this.load();
  }

  add(task) {
    this.tasks.push(task);
    this.save();
  }

  remove(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.save();
  }

  update(id, data) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.title = data.title;
      task.description = data.description;
      task.status = data.status;
      task.color = Task.STATUS_COLORS[data.status];
      this.save();
    }
  }

  filter(status) {
    return status === "toutes" ? this.tasks : this.tasks.filter(t => t.status === status);
  }

  search(text) {
    const q = text.toLowerCase();
    return this.tasks.filter(t =>
      t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  }

  save() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
  }

  load() {
    const raw = localStorage.getItem("tasks");
    if (raw) {
      this.tasks = JSON.parse(raw).map(data => new Task(data));
    }
  }
}

const manager = new TaskManager();
const form = document.getElementById("task-form");
const list = document.getElementById("task-list");
const search = document.getElementById("search");
const filters = document.getElementById("filters");

let editingTaskId = null;
let currentFilter = "toutes";

function render(tasks) {
  list.innerHTML = tasks.length === 0
    ? "<p class='empty-message'>Aucune tâche pour le moment !!</p>"
    : "";

  tasks.forEach(task => {
    const card = document.createElement("div");
    card.className = `card p-3 ${task.color}`;

    card.innerHTML = `
      <h5 class="card-title">${task.title}</h5>
      <p class="card-text">${task.description}</p>
      <p class="text-muted">${task.status} • ${new Date(task.createdAt).toLocaleString()}</p>
      <div class="d-flex justify-content-end gap-2">
        <button class="btn btn-sm btn-outline-primary" data-edit="${task.id}">Modifier</button>
        <button class="btn btn-sm btn-danger" data-id="${task.id}">Supprimer ?</button>
      </div>
    `;

    list.appendChild(card);
  });
}

form.addEventListener("submit", e => {
  e.preventDefault();
  try {
    const data = {
      title: form.title.value,
      description: form.description.value,
      status: form.status.value
    };

    if (editingTaskId) {
      manager.update(editingTaskId, data);
      editingTaskId = null;
      form.querySelector("button[type='submit']").textContent = "Ajouter";
    } else {
      const task = new Task(data);
      manager.add(task);
    }

    form.reset();
    render(manager.filter(currentFilter));
  } catch (err) {
    alert("Erreur : " + err.message);
  }
});

list.addEventListener("click", e => {
  const deleteId = e.target.dataset.id;
  const editId = e.target.dataset.edit;

  if (deleteId) {
    manager.remove(deleteId);
    render(manager.filter(currentFilter));
  }

  if (editId) {
    const task = manager.tasks.find(t => t.id === editId);
    if (task) {
      form.title.value = task.title;
      form.description.value = task.description;
      form.status.value = task.status;
      editingTaskId = task.id;
      form.querySelector("button[type='submit']").textContent = "Mettre à jour";
    }
  }
});

filters.addEventListener("click", e => {
  const status = e.target.dataset.status;
  if (status) {
    currentFilter = status;

    document.querySelectorAll("#filters button").forEach(btn => {
      btn.classList.remove("active");
    });
    e.target.classList.add("active");

    render(manager.filter(currentFilter));
  }
});

search.addEventListener("input", () => {
  render(manager.search(search.value));
});

render(manager.tasks);

// animation dog
document.addEventListener("DOMContentLoaded", () => {
  const dog = document.getElementById("dog");
  const dogMusic = document.getElementById("dog-music");
  const dogLeave = document.getElementById("dog-leave");
  const dogMessage = document.getElementById("dog-message");

  dogMusic.loop = true;

  let isDancing = false;
  let clickCount = 0;
  let dogGone = false;

  dog.addEventListener("click", () => {
    if (dogGone) return;

    clickCount++;

    if (clickCount >= 5) {
      dogGone = true;
      dog.src = "media/dog-standing.webp";
      dog.classList.remove("dancing");
      dog.classList.add("runaway");
      dogMusic.pause();
      dogMusic.currentTime = 0;
      dogLeave.currentTime = 0;
      dogLeave.play().catch(() => {});

      setTimeout(() => {
        dogMessage.style.display = "block";
      }, 800);
      return;
    }

    isDancing = !isDancing;

    if (isDancing) {
      dog.src = "media/dog_dance.gif";
      dog.classList.add("dancing");
      dogMusic.currentTime = 0;
      dogMusic.play().catch(() => {});
    } else {
      dog.src = "media/dog-sleeping-napping.gif";
      dog.classList.remove("dancing");
      dogMusic.pause();
      dogMusic.currentTime = 0;
    }
  });

  document.addEventListener("click", () => {
    if (dogGone) {
      dogMessage.style.display = "none";
    }
  });
});