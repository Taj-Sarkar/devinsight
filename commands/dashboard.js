/**
 * Dashboard Command
 * Displays developer productivity dashboard with Git activity
 */

const chalk = require("chalk");
const Table = require("cli-table3");

const {
  isGitRepository,
  getCurrentBranch,
  getCommitsToday,
  getCommitsThisWeek,
  getLastCommit,
  getLastCommitFiles,
} = require("../utils/gitUtils");
const { scanDirectory } = require("../utils/fileScanner");
const { scanForTodos, formatTodoSummary } = require("../utils/todoScanner");

async function dashboardCommand(options = {}) {
  // Check if we're in a Git repository
  const isGit = await isGitRepository();
  if (!isGit) {
    throw new Error(
      "Not a Git repository. Please run this command in a Git repository.",
    );
  }

  const rootPath = process.cwd();

  // Collect all data
  const [
    currentBranch,
    commitsToday,
    commitsThisWeek,
    lastCommit,
    lastCommitFiles,
    scanResults,
  ] = await Promise.all([
    getCurrentBranch(),
    getCommitsToday(),
    getCommitsThisWeek(),
    getLastCommit(),
    getLastCommitFiles(),
    scanDirectory(rootPath),
  ]);

  // Scan for TODOs
  const todoResults = await scanForTodos(scanResults.files);
  const todoSummary = formatTodoSummary(todoResults);

  // If JSON output is requested
  if (options.json) {
    const jsonOutput = {
      git: {
        currentBranch,
        commitsToday,
        commitsThisWeek,
        lastCommit: lastCommit
          ? {
              hash: lastCommit.hash,
              message: lastCommit.message,
              author: lastCommit.author_name,
              date: lastCommit.date,
            }
          : null,
        lastCommitFiles: lastCommitFiles,
      },
      tasks: {
        total: todoSummary.total,
        todos: todoSummary.todos,
        fixmes: todoSummary.fixmes,
        hacks: todoSummary.hacks,
        filesWithComments: todoSummary.filesWithComments,
      },
    };

    console.log(JSON.stringify(jsonOutput, null, 2));
    return;
  }

  // Display formatted dashboard
  console.log(chalk.cyan.bold("\n Developer Productivity Dashboard\n"));

  // ===== GIT ACTIVITY =====
  console.log(chalk.blue.bold("═══ Git Activity ═══\n"));

  const gitTable = new Table({
    head: [chalk.cyan("Metric"), chalk.cyan("Value")],
    style: { head: [], border: [] },
    colWidths: [30, 50],
  });

  gitTable.push(
    ["Current Branch", chalk.green(currentBranch)],
    ["Commits Today", chalk.yellow(commitsToday.toString())],
    ["Commits This Week", chalk.yellow(commitsThisWeek.toString())],
  );

  if (lastCommit) {
    const commitDate = new Date(lastCommit.date);
    const timeAgo = getTimeAgo(commitDate);

    gitTable.push(
      ["Last Commit", timeAgo],
      [
        "Last Commit Message",
        lastCommit.message.substring(0, 45) +
          (lastCommit.message.length > 45 ? "..." : ""),
      ],
      ["Last Commit Author", lastCommit.author_name],
    );
  }

  console.log(gitTable.toString());

  // ===== FILE ACTIVITY =====
  console.log(chalk.blue.bold("\n═══ File Activity (Last Commit) ═══\n"));

  if (lastCommitFiles.files.length > 0) {
    console.log(
      chalk.white(
        `Files Modified: ${chalk.green(lastCommitFiles.files.length)}`,
      ),
    );
    console.log(
      chalk.white(
        `Lines Added: ${chalk.green("+" + lastCommitFiles.additions)}`,
      ),
    );
    console.log(
      chalk.white(
        `Lines Removed: ${chalk.red("-" + lastCommitFiles.deletions)}`,
      ),
    );

    console.log(chalk.white("\nModified Files:"));
    lastCommitFiles.files.slice(0, 10).forEach((file) => {
      console.log(chalk.gray(`  • ${file}`));
    });

    if (lastCommitFiles.files.length > 10) {
      console.log(
        chalk.gray(`  ... and ${lastCommitFiles.files.length - 10} more`),
      );
    }
  } else {
    console.log(chalk.gray("No file changes detected in last commit"));
  }

  // ===== TASK DETECTION =====
  console.log(chalk.blue.bold("\n═══ Task Detection ═══\n"));

  const taskTable = new Table({
    head: [chalk.cyan("Type"), chalk.cyan("Count")],
    style: { head: [], border: [] },
  });

  taskTable.push(
    ["TODO", chalk.yellow(todoSummary.todos.toString())],
    ["FIXME", chalk.red(todoSummary.fixmes.toString())],
    ["HACK", chalk.magenta(todoSummary.hacks.toString())],
    ["Total", chalk.bold(todoSummary.total.toString())],
  );

  console.log(taskTable.toString());

  console.log(
    chalk.white(
      `\nFiles Containing Tasks: ${chalk.green(todoSummary.filesWithComments)}`,
    ),
  );

  if (todoResults.todos.length > 0) {
    console.log(chalk.white("\nRecent TODOs:"));
    todoResults.todos.slice(0, 5).forEach((todo) => {
      console.log(chalk.gray(`  • [${todo.file}] ${todo.comment}`));
    });

    if (todoResults.todos.length > 5) {
      console.log(chalk.gray(`  ... and ${todoResults.todos.length - 5} more`));
    }
  }

  console.log(chalk.green("\n✓ Dashboard generated!\n"));
}

/**
 * Get human-readable time ago string
 */
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString();
}

module.exports = dashboardCommand;
