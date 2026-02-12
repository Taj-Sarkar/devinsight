/**
 * TODO Scanner Module
 * Scans project files for TODO, FIXME, and HACK comments
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Scan files for TODO comments
 */
async function scanForTodos(files) {
  const patterns = {
    TODO: /\/\/\s*TODO:?\s*(.+)|\/\*\s*TODO:?\s*(.+?)\s*\*\/|#\s*TODO:?\s*(.+)/gi,
    FIXME: /\/\/\s*FIXME:?\s*(.+)|\/\*\s*FIXME:?\s*(.+?)\s*\*\/|#\s*FIXME:?\s*(.+)/gi,
    HACK: /\/\/\s*HACK:?\s*(.+)|\/\*\s*HACK:?\s*(.+?)\s*\*\/|#\s*HACK:?\s*(.+)/gi
  };

  const results = {
    todos: [],
    fixmes: [],
    hacks: [],
    totalCount: 0,
    fileCount: 0,
    fileDetails: []
  };

  // File extensions to scan
  const scanExtensions = [
    '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs',
    '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.html', '.css', '.scss'
  ];

  for (const file of files) {
    const ext = path.extname(file.name).toLowerCase();
    
    // Skip files that are not code files
    if (!scanExtensions.includes(ext)) {
      continue;
    }

    try {
      const content = await fs.readFile(file.path, 'utf-8');
      const fileResults = {
        path: file.path,
        name: file.name,
        todos: [],
        fixmes: [],
        hacks: []
      };

      let hasComments = false;

      // Scan for TODOs
      const todoMatches = content.matchAll(patterns.TODO);
      for (const match of todoMatches) {
        const comment = (match[1] || match[2] || match[3] || '').trim();
        fileResults.todos.push(comment);
        results.todos.push({ file: file.name, comment });
        hasComments = true;
      }

      // Scan for FIXMEs
      const fixmeMatches = content.matchAll(patterns.FIXME);
      for (const match of fixmeMatches) {
        const comment = (match[1] || match[2] || match[3] || '').trim();
        fileResults.fixmes.push(comment);
        results.fixmes.push({ file: file.name, comment });
        hasComments = true;
      }

      // Scan for HACKs
      const hackMatches = content.matchAll(patterns.HACK);
      for (const match of hackMatches) {
        const comment = (match[1] || match[2] || match[3] || '').trim();
        fileResults.hacks.push(comment);
        results.hacks.push({ file: file.name, comment });
        hasComments = true;
      }

      if (hasComments) {
        results.fileDetails.push(fileResults);
        results.fileCount++;
      }
    } catch (error) {
      // Skip files that can't be read
      continue;
    }
  }

  results.totalCount = results.todos.length + results.fixmes.length + results.hacks.length;

  return results;
}

/**
 * Get files with most TODOs
 */
function getFilesWithMostTodos(todoResults, limit = 5) {
  const fileCounts = {};

  // Count todos per file
  todoResults.fileDetails.forEach(file => {
    const count = file.todos.length + file.fixmes.length + file.hacks.length;
    fileCounts[file.name] = {
      name: file.name,
      path: file.path,
      count,
      todos: file.todos.length,
      fixmes: file.fixmes.length,
      hacks: file.hacks.length
    };
  });

  return Object.values(fileCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Format TODO results for display
 */
function formatTodoSummary(todoResults) {
  return {
    total: todoResults.totalCount,
    todos: todoResults.todos.length,
    fixmes: todoResults.fixmes.length,
    hacks: todoResults.hacks.length,
    filesWithComments: todoResults.fileCount
  };
}

module.exports = {
  scanForTodos,
  getFilesWithMostTodos,
  formatTodoSummary
};
