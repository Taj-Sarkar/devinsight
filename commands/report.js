/**
 * Report Command
 * Generates a comprehensive Markdown report
 */

const chalk = require("chalk");
const fs = require("fs").promises;
const path = require("path");

const {
  isGitRepository,
  getCurrentBranch,
  getCommitsToday,
  getCommitsThisWeek,
  getLastCommit,
} = require("../utils/gitUtils");
const {
  scanDirectory,
  detectLanguages,
  getLargestDirectories,
  getTopLevelDirectories,
  getLargestFiles,
} = require("../utils/fileScanner");
const {
  getProjectName,
  getDependenciesSummary,
  hasPackageJson,
} = require("../utils/dependencyParser");
const {
  scanForTodos,
  formatTodoSummary,
  getFilesWithMostTodos,
} = require("../utils/todoScanner");
const { getMostModifiedFiles } = require("../utils/gitUtils");

async function reportCommand() {
  console.log(chalk.cyan.bold("\n Generating Report...\n"));

  const rootPath = process.cwd();
  const reportPath = path.join(rootPath, "devinsight-report.md");

  // Check if we're in a Git repository
  const isGit = await isGitRepository();

  // Collect all data
  const projectName = await getProjectName(rootPath);
  const scanResults = await scanDirectory(rootPath);
  const languages = detectLanguages(scanResults.files);
  const largestDirs = await getLargestDirectories(rootPath, 5);
  const topLevelDirs = await getTopLevelDirectories(rootPath);
  const hasPackage = await hasPackageJson(rootPath);
  const depSummary = hasPackage ? await getDependenciesSummary(rootPath) : null;
  const todoResults = await scanForTodos(scanResults.files);
  const todoSummary = formatTodoSummary(todoResults);
  const largestFiles = getLargestFiles(scanResults.files, 10, 50 * 1024);
  const filesWithMostTodos = getFilesWithMostTodos(todoResults, 5);

  let currentBranch, commitsToday, commitsThisWeek, lastCommit, mostModified;

  if (isGit) {
    [currentBranch, commitsToday, commitsThisWeek, lastCommit, mostModified] =
      await Promise.all([
        getCurrentBranch(),
        getCommitsToday(),
        getCommitsThisWeek(),
        getLastCommit(),
        getMostModifiedFiles(10),
      ]);
  }

  // Generate Markdown content
  let markdown = "";

  // Header
  markdown += `# DevInsight Report\n\n`;
  markdown += `**Project:** ${projectName}\n\n`;
  markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;
  markdown += `---\n\n`;

  // Table of Contents
  markdown += `## Table of Contents\n\n`;
  markdown += `1. [Project Overview](#project-overview)\n`;
  markdown += `2. [Repository Structure](#repository-structure)\n`;
  if (isGit) {
    markdown += `3. [Git Activity](#git-activity)\n`;
    markdown += `4. [Developer Dashboard](#developer-dashboard)\n`;
    markdown += `5. [Smart Insights](#smart-insights)\n`;
  }
  markdown += `${isGit ? "6" : "3"}. [Task Detection](#task-detection)\n`;
  markdown += `${isGit ? "7" : "4"}. [Health Check](#health-check)\n`;
  markdown += `\n---\n\n`;

  // Project Overview
  markdown += `## Project Overview\n\n`;
  markdown += `### Statistics\n\n`;
  markdown += `| Metric | Value |\n`;
  markdown += `|--------|-------|\n`;
  markdown += `| Total Files | ${scanResults.files.length} |\n`;
  markdown += `| Total Directories | ${scanResults.directories.length} |\n`;
  markdown += `| Total Size | ${formatBytes(scanResults.totalSize)} |\n`;

  if (depSummary) {
    markdown += `| Total Dependencies | ${depSummary.totalCount} |\n`;
  }

  markdown += `\n`;

  // Languages
  if (languages.length > 0) {
    markdown += `### Programming Languages\n\n`;
    markdown += `| Language | Files |\n`;
    markdown += `|----------|-------|\n`;
    languages.forEach(({ language, count }) => {
      markdown += `| ${language} | ${count} |\n`;
    });
    markdown += `\n`;
  }

  // Largest Directories
  if (largestDirs.length > 0) {
    markdown += `### Largest Directories\n\n`;
    markdown += `| Directory | Files | Size |\n`;
    markdown += `|-----------|-------|------|\n`;
    largestDirs.forEach((dir) => {
      markdown += `| ${dir.name} | ${dir.fileCount} | ${formatBytes(dir.size)} |\n`;
    });
    markdown += `\n`;
  }

  // Repository Structure
  markdown += `## Repository Structure\n\n`;

  if (topLevelDirs.length > 0) {
    markdown += `### Top-Level Directories\n\n`;
    markdown += `| Directory | Description |\n`;
    markdown += `|-----------|-------------|\n`;
    topLevelDirs.forEach((dir) => {
      markdown += `| \`${dir.name}\` | ${dir.description} |\n`;
    });
    markdown += `\n`;
  }

  // Dependencies
  if (depSummary && depSummary.totalCount > 0) {
    markdown += `### Dependencies\n\n`;
    markdown += `**Total:** ${depSummary.totalCount}\n\n`;

    if (depSummary.dependencies.length > 0) {
      markdown += `#### Main Dependencies (${depSummary.dependencyCount})\n\n`;
      markdown += `| Package | Version |\n`;
      markdown += `|---------|----------|\n`;
      depSummary.dependencies.slice(0, 15).forEach((dep) => {
        markdown += `| ${dep.name} | ${dep.version} |\n`;
      });
      if (depSummary.dependencies.length > 15) {
        markdown += `\n*... and ${depSummary.dependencies.length - 15} more*\n`;
      }
      markdown += `\n`;
    }

    if (depSummary.devDependencies.length > 0) {
      markdown += `#### Dev Dependencies (${depSummary.devDependencyCount})\n\n`;
      markdown += `| Package | Version |\n`;
      markdown += `|---------|----------|\n`;
      depSummary.devDependencies.slice(0, 15).forEach((dep) => {
        markdown += `| ${dep.name} | ${dep.version} |\n`;
      });
      if (depSummary.devDependencies.length > 15) {
        markdown += `\n*... and ${depSummary.devDependencies.length - 15} more*\n`;
      }
      markdown += `\n`;
    }
  }

  // Git Activity
  if (isGit) {
    markdown += `## Git Activity\n\n`;
    markdown += `| Metric | Value |\n`;
    markdown += `|--------|-------|\n`;
    markdown += `| Current Branch | ${currentBranch} |\n`;
    markdown += `| Commits Today | ${commitsToday} |\n`;
    markdown += `| Commits This Week | ${commitsThisWeek} |\n`;

    if (lastCommit) {
      markdown += `| Last Commit | ${lastCommit.message} |\n`;
      markdown += `| Last Commit Author | ${lastCommit.author_name} |\n`;
      markdown += `| Last Commit Date | ${new Date(lastCommit.date).toLocaleString()} |\n`;
    }

    markdown += `\n`;
  }

  // Developer Dashboard
  if (isGit) {
    markdown += `## Developer Dashboard\n\n`;
    markdown += `### Activity Summary\n\n`;
    markdown += `- **Current Branch:** ${currentBranch}\n`;
    markdown += `- **Commits Today:** ${commitsToday}\n`;
    markdown += `- **Commits This Week:** ${commitsThisWeek}\n`;
    markdown += `\n`;
  }

  // Smart Insights
  if (isGit && mostModified.length > 0) {
    markdown += `## Smart Insights\n\n`;

    markdown += `### Most Frequently Modified Files\n\n`;
    markdown += `| File | Edit Count | Status |\n`;
    markdown += `|------|------------|--------|\n`;
    mostModified.forEach((item) => {
      let status = "✓ Normal";
      if (item.count > 50) status = " Very Active";
      else if (item.count > 20) status = " Active";

      markdown += `| ${item.file} | ${item.count} | ${status} |\n`;
    });
    markdown += `\n`;
  }

  // Largest Files
  if (largestFiles.length > 0) {
    markdown += `### Largest Files\n\n`;
    markdown += `| File | Size | Status |\n`;
    markdown += `|------|------|--------|\n`;
    largestFiles.forEach((file) => {
      let status = "✓ OK";
      if (file.size > 500 * 1024) status = " Very Large";
      else if (file.size > 200 * 1024) status = " Large";

      markdown += `| ${file.name} | ${file.sizeFormatted} | ${status} |\n`;
    });
    markdown += `\n`;
  }

  // Task Detection
  markdown += `## Task Detection\n\n`;
  markdown += `### Summary\n\n`;
  markdown += `| Type | Count |\n`;
  markdown += `|------|-------|\n`;
  markdown += `| TODO | ${todoSummary.todos} |\n`;
  markdown += `| FIXME | ${todoSummary.fixmes} |\n`;
  markdown += `| HACK | ${todoSummary.hacks} |\n`;
  markdown += `| **Total** | **${todoSummary.total}** |\n`;
  markdown += `\n`;
  markdown += `**Files with Tasks:** ${todoSummary.filesWithComments}\n\n`;

  // Files with most TODOs
  if (filesWithMostTodos.length > 0) {
    markdown += `### Files with Most Tasks\n\n`;
    markdown += `| File | TODO | FIXME | HACK | Total |\n`;
    markdown += `|------|------|-------|------|-------|\n`;
    filesWithMostTodos.forEach((file) => {
      markdown += `| ${file.name} | ${file.todos} | ${file.fixmes} | ${file.hacks} | ${file.count} |\n`;
    });
    markdown += `\n`;
  }

  // Recent TODOs
  if (todoResults.todos.length > 0) {
    markdown += `### Recent TODOs\n\n`;
    todoResults.todos.slice(0, 10).forEach((todo) => {
      markdown += `- **[${todo.file}]** ${todo.comment}\n`;
    });
    markdown += `\n`;
  }

  // Health Check
  markdown += `## Health Check\n\n`;

  const healthChecks = [];

  // Check README
  const hasReadme = await checkFileExists(rootPath, [
    "README.md",
    "README.txt",
  ]);
  healthChecks.push({ name: "README file", passed: hasReadme });

  // Check tests
  const hasTests = await checkDirectoryExists(rootPath, [
    "test",
    "tests",
    "__tests__",
  ]);
  healthChecks.push({ name: "Test directory", passed: hasTests });

  // Check package.json
  healthChecks.push({ name: "package.json", passed: hasPackage });

  // Check .gitignore
  const hasGitignore = await checkFileExists(rootPath, [".gitignore"]);
  healthChecks.push({ name: ".gitignore", passed: hasGitignore });

  // Check license
  const hasLicense = await checkFileExists(rootPath, ["LICENSE", "LICENSE.md"]);
  healthChecks.push({ name: "License file", passed: hasLicense });

  markdown += `| Check | Status |\n`;
  markdown += `|-------|--------|\n`;
  healthChecks.forEach((check) => {
    markdown += `| ${check.name} | ${check.passed ? "✓ Pass" : "✗ Fail"} |\n`;
  });
  markdown += `\n`;

  // Recommendations
  markdown += `### Recommendations\n\n`;
  const recommendations = [];

  if (!hasReadme)
    recommendations.push("Add a README.md file to document your project");
  if (!hasTests) recommendations.push("Add tests to improve code quality");
  if (!hasGitignore && isGit)
    recommendations.push("Add .gitignore to exclude unnecessary files");
  if (!hasLicense)
    recommendations.push("Add a LICENSE file to specify usage rights");
  if (depSummary && depSummary.totalCount > 50)
    recommendations.push("Review and audit dependencies");
  if (todoSummary.total > 20)
    recommendations.push("Address TODO comments or convert them to issues");
  if (largestFiles.length > 0 && largestFiles[0].size > 500 * 1024) {
    recommendations.push(
      `Consider splitting large files like ${largestFiles[0].name}`,
    );
  }

  if (recommendations.length > 0) {
    recommendations.forEach((rec, index) => {
      markdown += `${index + 1}. ${rec}\n`;
    });
  } else {
    markdown += `✓ Your repository is in good shape!\n`;
  }

  markdown += `\n---\n\n`;
  markdown += `*Report generated by DevInsight CLI*\n`;

  // Write report to file
  await fs.writeFile(reportPath, markdown, "utf-8");

  console.log(chalk.green(`✓ Report generated successfully!`));
  console.log(chalk.white(`\nReport saved to: ${chalk.cyan(reportPath)}\n`));
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Check if any of the specified files exist
 */
async function checkFileExists(rootPath, fileNames) {
  for (const fileName of fileNames) {
    try {
      const filePath = path.join(rootPath, fileName);
      await fs.access(filePath);
      return true;
    } catch (error) {
      continue;
    }
  }
  return false;
}

/**
 * Check if any of the specified directories exist
 */
async function checkDirectoryExists(rootPath, dirNames) {
  for (const dirName of dirNames) {
    try {
      const dirPath = path.join(rootPath, dirName);
      const stats = await fs.stat(dirPath);
      if (stats.isDirectory()) {
        return true;
      }
    } catch (error) {
      continue;
    }
  }
  return false;
}

module.exports = reportCommand;
