const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

const filePath = path.join(__dirname, 'task.json');

// Helper functions to read and write tasks
const getTasks = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data).tasks);
      }
    });
  });
};

const saveTasks = (tasks) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ tasks }, null, 2);
    fs.writeFile(filePath, data, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GET /tasks: Retrieve all tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await getTasks();
    res.json(tasks);
  } catch (err) {
    console.error(`Error reading tasks: ${err}`);
    res.status(500).send('Error reading tasks');
  }
});

// GET /tasks/:id: Retrieve a single task by its ID
app.get('/tasks/:id', async (req, res) => {
  try {
    const tasks = await getTasks();
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId) || taskId <= 0) {
      return res.status(400).send('Invalid task ID');
    }
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return res.status(404).send('Task not found');
    res.json(task);
  } catch (err) {
    console.error(`Error reading tasks: ${err}`);
    res.status(500).send('Error reading tasks');
  }
});

// POST /tasks: Create a new task
app.post('/tasks', async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    if (!title || !description || typeof completed !== 'boolean') {
      return res.status(400).send('Invalid task data');
    }
    const tasks = await getTasks();
    const newTask = {
      id: tasks.length ? tasks[tasks.length - 1].id + 1 : 1,
      title,
      description,
      completed,
    };
    tasks.push(newTask);
    await saveTasks(tasks);
    res.status(201).json(newTask);
  } catch (err) {
    console.error(`Error creating task: ${err}`);
    res.status(500).send('Error creating task');
  }
});

// PUT /tasks/:id: Update an existing task by its ID
app.put('/tasks/:id', async (req, res) => {
  try {
    const tasks = await getTasks();
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId) || taskId <= 0) {
      return res.status(400).send('Invalid task ID');
    }
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return res.status(404).send('Task not found');
    const { title, description, completed } = req.body;
    if (!title || !description || typeof completed !== 'boolean') {
      return res.status(400).send('Invalid task data');
    }
    task.title = title;
    task.description = description;
    task.completed = completed;
    await saveTasks(tasks);
    res.json(task);
  } catch (err) {
    console.error(`Error updating task: ${err}`);
    res.status(500).send('Error updating task');
  }
});

// DELETE /tasks/:id: Delete a task by its ID
app.delete('/tasks/:id', async (req, res) => {
  try {
    const tasks = await getTasks();
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId) || taskId <= 0) {
      return res.status(400).send('Invalid task ID');
    }
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return res.status(404).send('Task not found');
    tasks.splice(taskIndex, 1);
    await saveTasks(tasks);
    res.status(200).send('Task deleted successfully.');
  } catch (err) {
    console.error(`Error deleting task: ${err}`);
    res.status(500).send('Error deleting task');
  }
});

app.listen(port, (err) => {
  if (err) {
    console.error(`Error starting server: ${err}`);
  } else {
    console.log(`Server is listening on ${port}`);
  }
});

module.exports = app;
