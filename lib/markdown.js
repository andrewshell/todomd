// Helper function to convert a task to markdown
function taskToMarkdown(task) {
  const fileLink = task.file
    ? ` [${task.file}:${task.line}](${task.file}#L${task.line.replace(/-/g, '-L')})`
    : '';
  return `- ${task.body}${fileLink}`;
}

function serialize(tasks) {
  return tasks.map((task) => taskToMarkdown(task)).join('\n');
}

function unserialize(markdown) {
  const lines = markdown.split('\n');
  const tasks = [];

  lines.forEach((line) => {
    const match = line.match(/- (.+?)( \[(.+?):(.+?)\]\(.+?\))?$/);
    if (!match) return;

    const [, body, , file, lineRange] = match;
    const task = {
      body: body.trim(),
      file: file || null,
      line: lineRange ? lineRange.replace(/L/g, '') : null,
    };

    // We'll regenerate todos from files, only include manually entered todos
    if (file == null) {
      tasks.push(task);
    }
  });
  return tasks;
}

module.exports = { serialize, unserialize };
