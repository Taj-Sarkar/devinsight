/**
 * Analyze Command
 * Analyzes repository structure, dependencies, and provides overview
 */

const chalk = require("chalk");
const Table = require("cli-table3");
const path = require("path");

const {
  scanDirectory,
  detectLanguages,
  getLargestDirectories,
  getTopLevelDirectories,
} = require("../utils/fileScanner");
const {
  getProjectName,
  getDependenciesSummary,
  hasPackageJson,
} = require("../utils/dependencyParser");
const { isGitRepository } = require("../utils/gitUtils");

async function analyzeCommand() {
  console.log(chalk.cyan.bold("\n Repository Analysis\n"));

  // Check if we're in a Git repository
  const isGit = await isGitRepository();
  if (!isGit) {
    console.log(
      chalk.yellow(
        "  Warning: Not a Git repository. Some features may be limited.\n",
      ),
    );
  }

  const rootPath = process.cwd();

  // ===== PROJECT OVERVIEW =====
  console.log(chalk.blue.bold("═══ Project Overview ═══\n"));

  const projectName = await getProjectName(rootPath);
  console.log(chalk.white(`Project Name: ${chalk.green.bold(projectName)}`));

  // Scan directory
  console.log(chalk.gray("Scanning directory..."));
  const scanResults = await scanDirectory(rootPath);

  console.log(
    chalk.white(`Total Files: ${chalk.green(scanResults.files.length)}`),
  );
  console.log(
    chalk.white(
      `Total Directories: ${chalk.green(scanResults.directories.length)}`,
    ),
  );

  // Detect languages
  const languages = detectLanguages(scanResults.files);
  if (languages.length > 0) {
    console.log(chalk.white("\nProgramming Languages Detected:"));

    const langTable = new Table({
      head: [chalk.cyan("Language"), chalk.cyan("Files")],
      style: { head: [], border: [] },
    });

    languages.forEach(({ language, count }) => {
      langTable.push([language, count]);
    });

    console.log(langTable.toString());
  }

  // Largest directories
  console.log(chalk.white("\nLargest Directories by File Count:"));
  const largestDirs = await getLargestDirectories(rootPath, 5);

  if (largestDirs.length > 0) {
    const dirTable = new Table({
      head: [chalk.cyan("Directory"), chalk.cyan("Files"), chalk.cyan("Size")],
      style: { head: [], border: [] },
    });

    largestDirs.forEach((dir) => {
      dirTable.push([dir.name, dir.fileCount, formatBytes(dir.size)]);
    });

    console.log(dirTable.toString());
  } else {
    console.log(chalk.gray("  No subdirectories found"));
  }

  // ===== FOLDER STRUCTURE SUMMARY =====
  console.log(chalk.blue.bold("\n═══ Folder Structure Summary ═══\n"));

  const topLevelDirs = await getTopLevelDirectories(rootPath);

  if (topLevelDirs.length > 0) {
    const structureTable = new Table({
      head: [chalk.cyan("Directory"), chalk.cyan("Description")],
      style: { head: [], border: [] },
      colWidths: [20, 50],
    });

    topLevelDirs.forEach((dir) => {
      structureTable.push([dir.name, dir.description]);
    });

    console.log(structureTable.toString());
  } else {
    console.log(chalk.gray("No top-level directories found"));
  }

  // ===== DEPENDENCY SUMMARY =====
  console.log(chalk.blue.bold("\n═══ Dependency Summary ═══\n"));

  const hasPackage = await hasPackageJson(rootPath);

  if (hasPackage) {
    const depSummary = await getDependenciesSummary(rootPath);

    console.log(
      chalk.white(
        `Total Dependencies: ${chalk.green.bold(depSummary.totalCount)}`,
      ),
    );
    console.log(
      chalk.white(
        `  • Dependencies: ${chalk.green(depSummary.dependencyCount)}`,
      ),
    );
    console.log(
      chalk.white(
        `  • Dev Dependencies: ${chalk.green(depSummary.devDependencyCount)}`,
      ),
    );

    if (depSummary.peerDependencyCount > 0) {
      console.log(
        chalk.white(
          `  • Peer Dependencies: ${chalk.green(depSummary.peerDependencyCount)}`,
        ),
      );
    }

    // Show main dependencies
    if (depSummary.dependencies.length > 0) {
      console.log(chalk.white("\nMain Dependencies:"));

      const depTable = new Table({
        head: [chalk.cyan("Package"), chalk.cyan("Version")],
        style: { head: [], border: [] },
      });

      depSummary.dependencies.slice(0, 10).forEach((dep) => {
        depTable.push([dep.name, dep.version]);
      });

      console.log(depTable.toString());

      if (depSummary.dependencies.length > 10) {
        console.log(
          chalk.gray(`  ... and ${depSummary.dependencies.length - 10} more`),
        );
      }
    }

    // Show dev dependencies
    if (depSummary.devDependencies.length > 0) {
      console.log(chalk.white("\nDev Dependencies:"));

      const devDepTable = new Table({
        head: [chalk.cyan("Package"), chalk.cyan("Version")],
        style: { head: [], border: [] },
      });

      depSummary.devDependencies.slice(0, 10).forEach((dep) => {
        devDepTable.push([dep.name, dep.version]);
      });

      console.log(devDepTable.toString());

      if (depSummary.devDependencies.length > 10) {
        console.log(
          chalk.gray(
            `  ... and ${depSummary.devDependencies.length - 10} more`,
          ),
        );
      }
    }
  } else {
    console.log(chalk.yellow("  No package.json found"));
  }

  console.log(chalk.green("\n✓ Analysis complete!\n"));
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

module.exports = analyzeCommand;
