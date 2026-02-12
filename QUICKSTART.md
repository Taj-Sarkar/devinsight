# DevInsight CLI - Quick Start Guide

## Installation

1. **Clone or download the project**

   ```bash
   cd devinsight
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Link CLI globally (optional)**
   ```bash
   npm link
   ```

## Basic Usage

### Run in Interactive Mode

```bash
node bin/devinsight.js
```

Or if linked globally:

```bash
devinsight
```

### Run Specific Commands

#### Analyze Repository

```bash
node bin/devinsight.js analyze
```

#### View Dashboard

```bash
node bin/devinsight.js dashboard
```

#### Get Insights

```bash
node bin/devinsight.js insights
```

#### Health Check

```bash
node bin/devinsight.js health
```

#### Generate Report

```bash
node bin/devinsight.js report
```

## Advanced Usage

### Export Dashboard as JSON

```bash
node bin/devinsight.js dashboard --json
```

### Use in Any Git Repository

```bash
cd /path/to/your/project
node /path/to/devinsight/bin/devinsight.js analyze
```

## Features Overview

### 📊 Analyze Command

- Scans project structure
- Detects programming languages
- Lists largest directories
- Shows dependency information

### 📈 Dashboard Command

- Git activity tracking
- Commit statistics
- File change analysis
- TODO/FIXME/HACK detection

### 💡 Insights Command

- Most frequently modified files
- Largest files detection
- Refactor candidate identification
- Actionable suggestions

### 🏥 Health Command

- Repository quality checks
- Health score calculation
- Recommendations for improvement

### 📝 Report Command

- Generates comprehensive Markdown report
- Includes all analysis data
- Ready for documentation

## Tips

1. **Run in Git repositories** for full functionality
2. **Use interactive mode** for easier navigation
3. **Generate reports** for documentation
4. **Export JSON** for automation
5. **Check health regularly** to maintain code quality

## Troubleshooting

### "Not a Git repository" error

- Initialize Git: `git init`
- Or run in a Git repository

### "No package.json found" warning

- Initialize npm: `npm init`
- Or ignore if not a Node.js project

### Permission errors

- Check file/directory permissions
- Run with appropriate privileges

## Examples

### Example 1: Quick Health Check

```bash
cd my-project
devinsight health
```

### Example 2: Generate Documentation Report

```bash
devinsight report
# Opens devinsight-report.md
```

### Example 3: Automated Analysis

```bash
devinsight dashboard --json > dashboard.json
```

## Next Steps

1. Explore all commands
2. Generate a report for your project
3. Address health check warnings
4. Review insights and refactor candidates
5. Track your progress over time

---

**Happy Coding! 🚀**
