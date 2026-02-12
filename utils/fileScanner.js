/**
 * File Scanner Module
 * Provides functions for scanning and analyzing project files
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Scan directory recursively and collect file information
 * Excludes node_modules, .git, and other common ignore patterns
 */
async function scanDirectory(dirPath, options = {}) {
  const {
    excludeDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'],
    maxDepth = Infinity,
    currentDepth = 0
  } = options;

  const results = {
    files: [],
    directories: [],
    totalSize: 0
  };

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Skip excluded directories
        if (excludeDirs.includes(entry.name)) {
          continue;
        }

        results.directories.push(fullPath);

        // Recursively scan subdirectories if within depth limit
        if (currentDepth < maxDepth) {
          const subResults = await scanDirectory(fullPath, {
            ...options,
            currentDepth: currentDepth + 1
          });
          
          results.files.push(...subResults.files);
          results.directories.push(...subResults.directories);
          results.totalSize += subResults.totalSize;
        }
      } else if (entry.isFile()) {
        try {
          const stats = await fs.stat(fullPath);
          results.files.push({
            path: fullPath,
            name: entry.name,
            size: stats.size,
            extension: path.extname(entry.name)
          });
          results.totalSize += stats.size;
        } catch (error) {
          // Skip files that can't be accessed
          continue;
        }
      }
    }
  } catch (error) {
    // Handle permission errors gracefully
    if (error.code !== 'EACCES' && error.code !== 'EPERM') {
      throw error;
    }
  }

  return results;
}

/**
 * Get programming languages used in the project
 */
function detectLanguages(files) {
  const languageMap = {
    '.js': 'JavaScript',
    '.jsx': 'JavaScript (React)',
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript (React)',
    '.py': 'Python',
    '.java': 'Java',
    '.cpp': 'C++',
    '.c': 'C',
    '.cs': 'C#',
    '.go': 'Go',
    '.rs': 'Rust',
    '.php': 'PHP',
    '.rb': 'Ruby',
    '.swift': 'Swift',
    '.kt': 'Kotlin',
    '.html': 'HTML',
    '.css': 'CSS',
    '.scss': 'SCSS',
    '.json': 'JSON',
    '.md': 'Markdown',
    '.yml': 'YAML',
    '.yaml': 'YAML'
  };

  const languageCounts = {};

  files.forEach(file => {
    const ext = file.extension.toLowerCase();
    const language = languageMap[ext];
    
    if (language) {
      languageCounts[language] = (languageCounts[language] || 0) + 1;
    }
  });

  return Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([language, count]) => ({ language, count }));
}

/**
 * Get largest directories by file count
 */
async function getLargestDirectories(rootPath, limit = 5) {
  const excludeDirs = ['node_modules', '.git', 'dist', 'build'];
  
  try {
    const entries = await fs.readdir(rootPath, { withFileTypes: true });
    const directorySizes = [];

    for (const entry of entries) {
      if (entry.isDirectory() && !excludeDirs.includes(entry.name)) {
        const dirPath = path.join(rootPath, entry.name);
        const results = await scanDirectory(dirPath, { maxDepth: Infinity });
        
        directorySizes.push({
          name: entry.name,
          fileCount: results.files.length,
          size: results.totalSize
        });
      }
    }

    return directorySizes
      .sort((a, b) => b.fileCount - a.fileCount)
      .slice(0, limit);
  } catch (error) {
    return [];
  }
}

/**
 * Get top-level directories with descriptions
 */
async function getTopLevelDirectories(rootPath) {
  const directoryDescriptions = {
    'src': 'Source code',
    'components': 'UI components',
    'routes': 'API routes',
    'utils': 'Helper functions',
    'test': 'Test files',
    'tests': 'Test files',
    '__tests__': 'Test files',
    'public': 'Public assets',
    'assets': 'Static assets',
    'styles': 'Stylesheets',
    'lib': 'Library code',
    'config': 'Configuration files',
    'scripts': 'Build/utility scripts',
    'docs': 'Documentation',
    'bin': 'Executable files',
    'api': 'API endpoints',
    'pages': 'Page components',
    'models': 'Data models',
    'controllers': 'Controllers',
    'views': 'View templates',
    'middleware': 'Middleware functions'
  };

  try {
    const entries = await fs.readdir(rootPath, { withFileTypes: true });
    const directories = [];

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        directories.push({
          name: entry.name,
          description: directoryDescriptions[entry.name] || 'Project directory'
        });
      }
    }

    return directories;
  } catch (error) {
    return [];
  }
}

/**
 * Get largest files in the project
 */
function getLargestFiles(files, limit = 10, minSize = 100 * 1024) { // 100KB minimum
  return files
    .filter(file => file.size >= minSize)
    .sort((a, b) => b.size - a.size)
    .slice(0, limit)
    .map(file => ({
      path: file.path,
      name: file.name,
      size: file.size,
      sizeFormatted: formatBytes(file.size)
    }));
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Count lines in a file
 */
async function countFileLines(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content.split('\n').length;
  } catch (error) {
    return 0;
  }
}

module.exports = {
  scanDirectory,
  detectLanguages,
  getLargestDirectories,
  getTopLevelDirectories,
  getLargestFiles,
  formatBytes,
  countFileLines
};
