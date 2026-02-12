# DevInsight CLI

**A powerful command-line tool that analyzes Git repositories and provides developer productivity insights.**

DevInsight CLI helps developers understand their project structure, track Git activity, identify code patterns, and maintain repository health through comprehensive analysis and actionable insights.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)

---

## 🚀 Features

- **📊 Repository Analysis** - Scan project structure, detect languages, and analyze dependencies
- **📈 Developer Dashboard** - Track Git activity, commits, and file changes
- **💡 Smart Insights** - Identify frequently modified files, large files, and refactor candidates
- **🏥 Health Check** - Perform quality checks and get repository health scores
- **📝 Report Generation** - Create comprehensive Markdown reports
- **🎯 Interactive Mode** - User-friendly menu-driven interface
- **📦 Dependency Analysis** - Parse and analyze package.json dependencies
- **✅ Task Detection** - Find TODO, FIXME, and HACK comments across your codebase

---

## 📦 Installation

### Prerequisites

- Node.js >= 14.0.0
- npm or yarn
- Git (for full functionality)

### Install Dependencies

```bash
npm install
```

### Link CLI Globally (Optional)

To use `devinsight` command globally:

```bash
npm link
```

Or run directly:

```bash
node bin/devinsight.js
```

---

## 📖 Usage

### Command Structure

```bash
devinsight <command> [options]
```

### Available Commands

| Command     | Description                                   |
| ----------- | --------------------------------------------- |
| `analyze`   | Analyze repository structure and dependencies |
| `dashboard` | Display developer productivity dashboard      |
| `insights`  | Analyze patterns and provide smart insights   |
| `health`    | Perform repository health checks              |
| `report`    | Generate comprehensive Markdown report        |

### Interactive Mode

Run without any command to enter interactive mode:

```bash
devinsight
```

This will display a menu where you can select actions interactively.

---

## 🎯 Command Examples

### 1. Analyze Repository

Analyzes the current repository structure, detects programming languages, and shows dependency information.

```bash
devinsight analyze
```

**Output includes:**

- Project name and statistics
- Programming languages detected
- Largest directories
- Folder structure summary
- Dependency breakdown

**Example Output:**

```
📊 Repository Analysis

═══ Project Overview ═══

Project Name: my-awesome-project
Total Files: 247
Total Directories: 42

Programming Languages Detected:
┌────────────────────┬───────┐
│ Language           │ Files │
├────────────────────┼───────┤
│ JavaScript         │ 156   │
│ TypeScript         │ 45    │
│ CSS                │ 23    │
│ JSON               │ 12    │
└────────────────────┴───────┘

Largest Directories by File Count:
┌───────────┬───────┬──────────┐
│ Directory │ Files │ Size     │
├───────────┼───────┼──────────┤
│ src       │ 123   │ 2.45 MB  │
│ components│ 67    │ 1.23 MB  │
│ utils     │ 34    │ 456 KB   │
└───────────┴───────┴──────────┘
```

---

### 2. Developer Dashboard

Displays Git activity, recent commits, file changes, and task detection.

```bash
devinsight dashboard
```

**Output includes:**

- Current branch
- Commits today and this week
- Last commit information
- Files modified in last commit
- Lines added/removed
- TODO/FIXME/HACK detection

**Example Output:**

```
📈 Developer Productivity Dashboard

═══ Git Activity ═══

┌────────────────────────┬──────────────────────────┐
│ Metric                 │ Value                    │
├────────────────────────┼──────────────────────────┤
│ Current Branch         │ main                     │
│ Commits Today          │ 3                        │
│ Commits This Week      │ 15                       │
│ Last Commit            │ 2 hours ago              │
│ Last Commit Message    │ Add new feature          │
│ Last Commit Author     │ John Doe                 │
└────────────────────────┴──────────────────────────┘

═══ File Activity (Last Commit) ═══

Files Modified: 5
Lines Added: +42
Lines Removed: -18

Modified Files:
  • src/components/Header.js
  • src/utils/helpers.js
  • README.md
```

#### JSON Output

Export dashboard data as JSON:

```bash
devinsight dashboard --json
```

---

### 3. Smart Insights

Analyzes code patterns and provides actionable recommendations.

```bash
devinsight insights
```

**Output includes:**

- Most frequently modified files
- Largest files
- Refactor candidates
- Actionable suggestions

**Example Output:**

```
💡 Smart Insights

═══ Most Frequently Modified Files ═══

┌──────────────────────┬────────────┬─────────────────────────────┐
│ File                 │ Edit Count │ Insight                     │
├──────────────────────┼────────────┼─────────────────────────────┤
│ src/app.js           │ 67         │ ⚠️  Frequently edited       │
│ src/config.js        │ 34         │ ⚡ Active development area  │
│ src/utils/format.js  │ 12         │ ✓ Normal activity           │
└──────────────────────┴────────────┴─────────────────────────────┘

═══ Suggestions ═══

1. Consider refactoring "src/app.js" - it has been modified 67 times
2. You have 23 TODO comments - consider addressing them
3. "components/Dashboard.js" has 8 TODO comments - needs attention
```

---

### 4. Health Check

Performs quality checks and provides a health score.

```bash
devinsight health
```

**Checks performed:**

- Git repository initialization
- README file presence
- Test directory existence
- package.json validation
- Scripts section check
- Dependency count analysis
- Large file detection
- .gitignore presence
- License file check

**Example Output:**

```
🏥 Repository Health Check

✓ Passed Checks:

  ✓ Git repository initialized
  ✓ README file exists
  ✓ package.json exists
  ✓ package.json has scripts defined
  ✓ Dependency count is reasonable

⚠️  Warnings:

⚠️ No test directory detected
   → Consider adding tests to improve code quality

⚠️ Missing .gitignore file
   → Add .gitignore to exclude unnecessary files from Git

═══ Health Score ═══

👍 75% (5/7 checks passed)

👍 Good! Address the warnings to improve further.
```

---

### 5. Generate Report

Creates a comprehensive Markdown report file.

```bash
devinsight report
```

**Report includes:**

- Complete project overview
- Repository structure
- Git activity (if available)
- Developer dashboard summary
- Smart insights
- Task detection
- Health check results
- Recommendations

**Output:**

```
📝 Generating Report...

✓ Report generated successfully!

Report saved to: E:\Github CLI challenge\devinsight-report.md
```

The generated report (`devinsight-report.md`) can be viewed in any Markdown viewer or committed to your repository for documentation.

---

## 🏗️ Project Structure

```
devinsight/
├── bin/
│   └── devinsight.js          # CLI entry point
├── commands/
│   ├── analyze.js             # Repository analysis command
│   ├── dashboard.js           # Developer dashboard command
│   ├── insights.js            # Smart insights command
│   ├── health.js              # Health check command
│   └── report.js              # Report generation command
├── utils/
│   ├── gitUtils.js            # Git operations utilities
│   ├── fileScanner.js         # File system scanning utilities
│   ├── dependencyParser.js    # package.json parser
│   └── todoScanner.js         # TODO/FIXME/HACK scanner
├── package.json
└── README.md
```

---

## 🛠️ Technologies Used

- **[Commander.js](https://github.com/tj/commander.js)** - CLI framework for command parsing
- **[simple-git](https://github.com/steveukx/git-js)** - Git integration
- **[chalk](https://github.com/chalk/chalk)** - Terminal string styling
- **[cli-table3](https://github.com/cli-table/cli-table3)** - Beautiful table formatting
- **[inquirer](https://github.com/SBoudrias/Inquirer.js)** - Interactive command-line prompts
- **Node.js fs/path** - File system operations

---

## 🤖 GitHub Copilot CLI Usage

This project was developed with assistance from **GitHub Copilot CLI** to accelerate development and improve code quality.

### How Copilot Helped

#### 1. **Code Generation**

Copilot CLI was used to generate boilerplate code for utility functions and command modules:

```bash
# Example prompt used:
"Generate a function to recursively scan directories and collect file information"
```

This helped create the foundation for `fileScanner.js` with proper error handling and exclusion patterns.

#### 2. **Git Integration**

Complex Git operations were simplified using Copilot suggestions:

```bash
# Example prompt:
"Create a function to get the most frequently modified files using git log"
```

This resulted in the `getMostModifiedFiles()` function in `gitUtils.js`.

#### 3. **Error Handling**

Copilot suggested robust error handling patterns:

```javascript
// Copilot suggested try-catch patterns for file operations
try {
  const content = await fs.readFile(filePath, "utf-8");
  // Process content
} catch (error) {
  if (error.code === "ENOENT") {
    // Handle file not found
  }
  // Handle other errors
}
```

#### 4. **Documentation**

Copilot helped generate comprehensive JSDoc comments and README sections, ensuring clear documentation throughout the project.

#### 5. **Testing Scenarios**

Copilot suggested edge cases and validation logic:

- Handling non-Git repositories
- Permission errors during file scanning
- Missing package.json scenarios
- Empty directories

### Development Speed Impact

Using Copilot CLI reduced development time by approximately **40-50%** by:

- Generating repetitive code patterns
- Suggesting best practices
- Providing quick solutions to common problems
- Auto-completing complex logic

### Example Prompts Used

1. **"Create a CLI command structure using Commander.js with multiple subcommands"**
   - Generated the main CLI entry point structure

2. **"Parse package.json and extract dependencies with version numbers"**
   - Created the dependency parser utility

3. **"Scan files for TODO, FIXME, and HACK comments using regex"**
   - Built the TODO scanner with pattern matching

4. **"Generate a Markdown report with tables and formatted sections"**
   - Helped structure the report generation logic

5. **"Create an interactive menu using Inquirer.js"**
   - Implemented the interactive mode feature

---

## 🎨 Code Quality

### Best Practices Implemented

- ✅ **Modular Architecture** - Each command and utility has a single responsibility
- ✅ **Async/Await** - Modern asynchronous patterns throughout
- ✅ **Error Handling** - Graceful error handling with meaningful messages
- ✅ **Clear Naming** - Descriptive variable and function names
- ✅ **Comments** - Important logic is well-documented
- ✅ **No Hardcoded Paths** - Dynamic path resolution
- ✅ **Performance** - Efficient file scanning with exclusion patterns

---

## 🚦 Error Handling

DevInsight CLI handles common errors gracefully:

| Error                | Message                  | Solution                       |
| -------------------- | ------------------------ | ------------------------------ |
| Not a Git repository | "Not a Git repository"   | Initialize Git with `git init` |
| Missing package.json | "No package.json found"  | Run `npm init`                 |
| Permission denied    | Skips inaccessible files | Check file permissions         |
| Empty directory      | "No files found"         | Add files to the directory     |

---

## 📸 Screenshots

### Interactive Mode

```
🔍 DevInsight CLI - Interactive Mode

? What would you like to do? (Use arrow keys)
❯ 📊 Analyze Repository
  📈 Developer Dashboard
  💡 Smart Insights
  🏥 Health Check
  📝 Generate Report
  ❌ Exit
```

### Health Check Output

```
🏥 Repository Health Check

✓ Passed Checks:
  ✓ Git repository initialized
  ✓ README file exists
  ✓ package.json exists

═══ Health Score ═══
🎉 100% (7/7 checks passed)
🌟 Excellent! Your repository is in great shape!
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Built with ❤️ using Node.js
- Enhanced with GitHub Copilot CLI
- Inspired by developer productivity tools

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [documentation](#usage)
2. Review [error handling](#error-handling)
3. Open an issue on GitHub

---

**Made with ❤️ for developers, by developers**
