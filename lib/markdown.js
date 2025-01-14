// Helper function to build the tree structure from the flat list
function buildTaskTree(tasks) {
  const taskMap = new Map();
  tasks.forEach(task => taskMap.set(task.id, { ...task, children: [] }));

  const rootTasks = [];

  tasks.forEach(task => {
    if (task.parentId === null) {
      rootTasks.push(taskMap.get(task.id));
    } else {
      const parentTask = taskMap.get(task.parentId);
      if (parentTask) {
        parentTask.children.push(taskMap.get(task.id));
      }
    }
  });

  return rootTasks;
}

// Helper function to convert a task to markdown
function taskToMarkdown(task, indentLevel = 0) {
  const indent = '  '.repeat(indentLevel);
  const checkbox = task.completed ? '[x]' : '[ ]';
  const fileLink = task.file
    ? ` [${task.file}:${task.line}](src/${task.file}:L${task.line.replace(/-/g, '-L')})`
    : '';
  const line = `${indent}- ${checkbox} #${task.id} ${task.body}${fileLink}`;

  const childMarkdown = task.children
    .map(child => taskToMarkdown(child, indentLevel + 1))
    .join('\n');

  return [line, childMarkdown].filter(Boolean).join('\n');
}

function serialize(tasks) {
  const taskTree = buildTaskTree(tasks);
  return taskTree.map(task => taskToMarkdown(task)).join('\n');
}

function unserialize(markdown) {
  const lines = markdown.split('\n');
  const tasks = [];
  const stack = [];

  lines.forEach(line => {
     const match = line.match(/^(\s*)- \[(x| )\] #(\d+) (.+?)( \[(.+?):(.+?)\]\(src\/.+?\))?$/);
    if (!match) return;

    const [_, indent, completed, id, body, , file, lineRange] = match;
    const task = {
      id: parseInt(id, 10),
      parentId: null,
      body: body.trim(),
      file: file || null,
      line: lineRange ? lineRange.replace(/L/g, '') : null,
      completed: completed === 'x',
    };

    const level = indent.length / 2;

    while (stack.length > level) {
      stack.pop();
    }

    if (stack.length > 0) {
      task.parentId = stack[stack.length - 1].id;
    }

    tasks.push(task);
    stack.push(task);
  });
  return tasks;
}

module.exports = { serialize, unserialize };
