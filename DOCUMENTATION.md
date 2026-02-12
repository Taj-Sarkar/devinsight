# DevInsight CLI - Complete Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Commands Reference](#commands-reference)
5. [API Documentation](#api-documentation)
6. [Development](#development)
7. [Testing](#testing)
8. [Contributing](#contributing)

---

## Overview

DevInsight CLI is a comprehensive command-line tool designed to analyze Git repositories and provide developer productivity insights. It helps developers understand their codebase, track activity, and maintain code quality.

### Key Features

- **Repository Analysis**: Scan project structure and dependencies
- **Git Activity Tracking**: Monitor commits and file changes
- **Smart Insights**: Identify patterns and refactor candidates
- **Health Checks**: Assess repository quality
- **Report Generation**: Create comprehensive documentation
- **Interactive Mode**: User-friendly menu interface

---

## Architecture

### Project Structure

```
devinsight/
├── bin/
│   └── devinsight.js          # CLI entry point
├── commands/                   # Command implementations
│   ├── analyze.js
│   ├── dashboard.js
│   ├── insights.js
│   ├── health.js
│   └── report.js
├── utils/                      # Utility modules
│   ├── gitUtils.js
│   ├── fileScanner.js
│   ├── dependencyParser.js
│   └── todoScanner.js
├── tests/                      # Test files
├── package.json
└── README.md
```

### Design Principles

- **Modularity**: Each module has a single responsibility
- **Separation of Concerns**: Commands use utility modules
- **Error Handling**: Graceful error handling throughout
- **Performance**: Efficient file scanning with exclusions
- **Extensibility**: Easy to add new commands

---

## Installation

### Prerequisites

- Node.js >= 14.0.0
- npm or yarn
- Git (recommended)

### Steps

1. Clone the repository
2. Run `npm install`
3. (Optional) Run `npm link` for global access

---

## Commands Reference

### analyze

**Purpose**: Analyze repository structure and dependencies

**Usage**: `devinsight analyze`

**Output**:

- Project overview (name, file count, directory count)
- Programming languages detected
- Largest directories
- Folder structure summary
- Dependency breakdown

**Example**:

```bash
devinsight analyze
```

---

### dashboard

**Purpose**: Display developer productivity metrics

**Usage**: `devinsight dashboard [--json]`

**Options**:

- `--json`: Export as JSON format

**Output**:

- Git activity (branch, commits)
- Last commit information
- File activity (additions/deletions)
- Task detection (TODO/FIXME/HACK)

**Example**:

```bash
devinsight dashboard
devinsight dashboard --json > output.json
```

---

### insights

**Purpose**: Analyze code patterns and provide recommendations

**Usage**: `devinsight insights`

**Output**:

- Most frequently modified files
- Largest files
- Refactor candidates
- Actionable suggestions

**Example**:

```bash
devinsight insights
```

---

### health

**Purpose**: Perform repository quality checks

**Usage**: `devinsight health`

**Checks**:

- Git repository initialization
- README file presence
- Test directory existence
- package.json validation
- Scripts section check
- Dependency count
- Large file detection
- .gitignore presence
- License file check

**Output**:

- Passed checks
- Warnings
- Suggestions
- Health score (percentage)

**Example**:

```bash
devinsight health
```

---

### report

**Purpose**: Generate comprehensive Markdown report

**Usage**: `devinsight report`

**Output File**: `devinsight-report.md`

**Contents**:

- Project overview
- Repository structure
- Git activity
- Dashboard summary
- Smart insights
- Task detection
- Health check results
- Recommendations

**Example**:

```bash
devinsight report
```

---

## API Documentation

### Utility Modules

#### gitUtils.js

Functions for Git operations:

- `isGitRepository()`: Check if current directory is a Git repo
- `getCurrentBranch()`: Get current branch name
- `getCommitsToday()`: Count commits today
- `getCommitsThisWeek()`: Count commits this week
- `getLastCommit()`: Get last commit information
- `getLastCommitFiles()`: Get files modified in last commit
- `getMostModifiedFiles(limit)`: Get most frequently modified files

#### fileScanner.js

Functions for file system operations:

- `scanDirectory(dirPath, options)`: Recursively scan directory
- `detectLanguages(files)`: Detect programming languages
- `getLargestDirectories(rootPath, limit)`: Get largest directories
- `getTopLevelDirectories(rootPath)`: Get top-level directories
- `getLargestFiles(files, limit, minSize)`: Get largest files
- `formatBytes(bytes)`: Format bytes to human-readable
- `countFileLines(filePath)`: Count lines in a file

#### dependencyParser.js

Functions for package.json parsing:

- `readPackageJson(rootPath)`: Read and parse package.json
- `hasPackageJson(rootPath)`: Check if package.json exists
- `getProjectName(rootPath)`: Get project name
- `getDependenciesSummary(rootPath)`: Get dependency summary
- `hasScripts(rootPath)`: Check if scripts exist
- `getScripts(rootPath)`: Get all scripts
- `analyzeDependencyHealth(rootPath)`: Analyze dependency health

#### todoScanner.js

Functions for task detection:

- `scanForTodos(files)`: Scan files for TODO/FIXME/HACK
- `getFilesWithMostTodos(todoResults, limit)`: Get files with most tasks
- `formatTodoSummary(todoResults)`: Format TODO summary

---

## Development

### Adding a New Command

1. Create a new file in `commands/` directory:

```javascript
// commands/mycommand.js
async function myCommand() {
  console.log("My command implementation");
}

module.exports = myCommand;
```

2. Register the command in `bin/devinsight.js`:

```javascript
const myCommand = require("../commands/mycommand");

program
  .command("mycommand")
  .description("My command description")
  .action(async () => {
    await myCommand();
  });
```

3. Add to interactive menu:

```javascript
choices: [
  // ... existing choices
  { name: "🎯 My Command", value: "mycommand" },
];
```

### Adding a New Utility

1. Create a new file in `utils/` directory
2. Export functions using `module.exports`
3. Import in command files as needed

---

## Testing

### Manual Testing

```bash
# Test analyze command
node bin/devinsight.js analyze

# Test dashboard command
node bin/devinsight.js dashboard

# Test with JSON output
node bin/devinsight.js dashboard --json

# Test interactive mode
node bin/devinsight.js
```

### Test Coverage Areas

- Command execution
- Git operations
- File scanning
- Dependency parsing
- TODO detection
- Error handling
- Edge cases (no Git, no package.json, etc.)

---

## Contributing

### Guidelines

1. Follow existing code style
2. Add comments for complex logic
3. Use async/await for asynchronous operations
4. Handle errors gracefully
5. Test your changes
6. Update documentation

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## Troubleshooting

### Common Issues

**Issue**: "Not a Git repository"

- **Solution**: Initialize Git with `git init` or run in a Git repository

**Issue**: "No package.json found"

- **Solution**: Run `npm init` or ignore if not a Node.js project

**Issue**: Permission errors

- **Solution**: Check file permissions or run with appropriate privileges

**Issue**: Slow scanning

- **Solution**: Ensure node_modules is excluded (default behavior)

---

## Performance Considerations

### Optimizations Implemented

- Excludes common directories (node_modules, .git, dist, build)
- Limits depth for recursive scanning
- Skips inaccessible files gracefully
- Uses efficient regex patterns
- Caches file stats

### Best Practices

- Run in project root directory
- Ensure .gitignore is properly configured
- Limit scan depth for very large projects
- Use JSON output for automation

---

## Security Considerations

- No external API calls
- No data collection
- Local file system access only
- Respects file permissions
- No sensitive data exposure

---

## Future Enhancements

Potential features for future versions:

- Code complexity metrics
- Dependency vulnerability scanning
- Git branch comparison
- Team productivity analytics
- Custom report templates
- Plugin system
- Configuration file support
- CI/CD integration

---

## License

MIT License - See LICENSE file for details

---

## Support

For issues, questions, or contributions:

- Open an issue on GitHub
- Check documentation
- Review examples

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Maintained by**: DevInsight Team
