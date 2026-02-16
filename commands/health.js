/**
 * Health Command
 * Performs quality checks on the repository
 */

const chalk = require("chalk");
const fs = require("fs").promises;
const path = require("path");

const { isGitRepository } = require("../utils/gitUtils");
const { scanDirectory } = require("../utils/fileScanner");
const {
  hasPackageJson,
  getDependenciesSummary,
  hasScripts,
} = require("../utils/dependencyParser");

async function healthCommand() {
  console.log(chalk.cyan.bold("\n Repository Health Check\n"));

  const rootPath = process.cwd();
  const warnings = [];
  const suggestions = [];
  const passed = [];

  // ===== CHECK: Git Repository =====
  const isGit = await isGitRepository();
  if (!isGit) {
    warnings.push({
      type: "error",
      message: "Not a Git repository",
      suggestion: "Initialize Git with: git init",
    });
  } else {
    passed.push("Git repository initialized");
  }

  // ===== CHECK: README File =====
  const hasReadme = await checkFileExists(rootPath, [
    "README.md",
    "README.txt",
    "readme.md",
  ]);
  if (!hasReadme) {
    warnings.push({
      type: "warning",
      message: "Missing README file",
      suggestion: "Add a README.md to document your project",
    });
  } else {
    passed.push("README file exists");
  }

  // ===== CHECK: Test Directory =====
  const hasTests = await checkDirectoryExists(rootPath, [
    "test",
    "tests",
    "__tests__",
    "spec",
  ]);
  if (!hasTests) {
    warnings.push({
      type: "warning",
      message: "No test directory detected",
      suggestion: "Consider adding tests to improve code quality",
    });
  } else {
    passed.push("Test directory exists");
  }

  // ===== CHECK: Package.json =====
  const hasPackage = await hasPackageJson(rootPath);
  if (!hasPackage) {
    warnings.push({
      type: "warning",
      message: "No package.json found",
      suggestion: "Initialize with: npm init",
    });
  } else {
    passed.push("package.json exists");

    // Check for scripts
    const scriptsExist = await hasScripts(rootPath);
    if (!scriptsExist) {
      warnings.push({
        type: "info",
        message: "package.json missing scripts section",
        suggestion: "Add npm scripts for common tasks (test, build, start)",
      });
    } else {
      passed.push("package.json has scripts defined");
    }

    // Check dependency count
    const depSummary = await getDependenciesSummary(rootPath);
    if (depSummary.totalCount > 100) {
      warnings.push({
        type: "warning",
        message: `Large number of dependencies (${depSummary.totalCount})`,
        suggestion: "Review dependencies and remove unused packages",
      });
    } else if (depSummary.totalCount > 50) {
      suggestions.push(
        `You have ${depSummary.totalCount} dependencies - consider periodic audits`,
      );
    } else {
      passed.push("Dependency count is reasonable");
    }
  }

  // ===== CHECK: Large Files =====
  console.log(chalk.gray("Scanning for large files..."));
  const scanResults = await scanDirectory(rootPath);
  const largeFiles = scanResults.files.filter((f) => f.size > 1024 * 1024); // 1MB

  if (largeFiles.length > 0) {
    warnings.push({
      type: "warning",
      message: `${largeFiles.length} large file(s) detected (>1MB)`,
      suggestion: "Consider using Git LFS for large files or optimizing them",
    });
  } else {
    passed.push("No excessively large files detected");
  }

  // ===== CHECK: .gitignore =====
  const hasGitignore = await checkFileExists(rootPath, [".gitignore"]);
  if (!hasGitignore && isGit) {
    warnings.push({
      type: "warning",
      message: "Missing .gitignore file",
      suggestion: "Add .gitignore to exclude unnecessary files from Git",
    });
  } else if (hasGitignore) {
    passed.push(".gitignore file exists");
  }

  // ===== CHECK: License File =====
  const hasLicense = await checkFileExists(rootPath, [
    "LICENSE",
    "LICENSE.md",
    "LICENSE.txt",
    "license.md",
  ]);
  if (!hasLicense) {
    suggestions.push("Consider adding a LICENSE file to specify usage rights");
  } else {
    passed.push("License file exists");
  }

  // ===== CHECK: Documentation =====
  const hasDocsDir = await checkDirectoryExists(rootPath, [
    "docs",
    "documentation",
    "doc",
  ]);
  if (hasDocsDir) {
    passed.push("Documentation directory exists");
  }

  // ===== CHECK: CI/CD Configuration =====
  const hasCICD = await checkFileExists(rootPath, [
    ".github/workflows",
    ".gitlab-ci.yml",
    ".travis.yml",
    "azure-pipelines.yml",
    "Jenkinsfile",
  ]);

  if (hasCICD) {
    passed.push("CI/CD configuration detected");
  } else {
    suggestions.push(
      "Consider setting up CI/CD for automated testing and deployment",
    );
  }

  // ===== DISPLAY RESULTS =====

  // Show passed checks
  if (passed.length > 0) {
    console.log(chalk.green.bold("✓ Passed Checks:\n"));
    passed.forEach((check) => {
      console.log(chalk.green(`  ✓ ${check}`));
    });
    console.log("");
  }

  // Show warnings
  if (warnings.length > 0) {
    console.log(chalk.yellow.bold("  Warnings:\n"));
    warnings.forEach((warning, index) => {
      const icon =
        warning.type === "error"
          ? "❌"
          : warning.type === "warning"
            ? "⚠️"
            : "ℹ️";
      console.log(chalk.yellow(`${icon} ${warning.message}`));
      console.log(chalk.gray(`   → ${warning.suggestion}\n`));
    });
  }

  // Show suggestions
  if (suggestions.length > 0) {
    console.log(chalk.cyan.bold(" Suggestions:\n"));
    suggestions.forEach((suggestion) => {
      console.log(chalk.cyan(`  • ${suggestion}`));
    });
    console.log("");
  }

  // ===== HEALTH SCORE =====
  const totalChecks = passed.length + warnings.length;
  const healthScore =
    totalChecks > 0 ? Math.round((passed.length / totalChecks) * 100) : 0;

  console.log(chalk.bold("\n═══ Health Score ═══\n"));

  let scoreColor = chalk.green;
  let scoreEmoji = "🎉";

  if (healthScore < 50) {
    scoreColor = chalk.red;
    scoreEmoji = "⚠️";
  } else if (healthScore < 75) {
    scoreColor = chalk.yellow;
    scoreEmoji = "👍";
  }

  console.log(
    scoreColor.bold(`${scoreEmoji} ${healthScore}%`) +
      chalk.white(` (${passed.length}/${totalChecks} checks passed)`),
  );

  if (healthScore === 100) {
    console.log(
      chalk.green("\n Excellent! Your repository is in great shape!\n"),
    );
  } else if (healthScore >= 75) {
    console.log(
      chalk.yellow("\n Good! Address the warnings to improve further.\n"),
    );
  } else {
    console.log(
      chalk.red("\n  Needs attention. Please review the warnings above.\n"),
    );
  }
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

module.exports = healthCommand;
