const fs = require('fs').promises;

async function getFileSnippet(filePath, lineRange, contextLines = 4) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split('\n');
    
    let [start, end] = String(lineRange).split('-').map(Number);
    if (!end) end = start;
    
    const snippetStart = Math.max(0, start - contextLines - 1);
    const snippetEnd = Math.min(lines.length, end + contextLines);
    
    return lines.slice(snippetStart, snippetEnd)
      .map((line, i) => ({
        number: snippetStart + i + 1,
        content: line,
        highlight: i + snippetStart + 1 >= start && i + snippetStart + 1 <= end
      }));
  } catch (error) {
    return null;
  }
}

module.exports = { getFileSnippet };
