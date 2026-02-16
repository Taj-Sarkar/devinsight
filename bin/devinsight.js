#!/usr/bin/env node

/**
 * DevInsight CLI - Entry Point
 * Main entry point for the DevInsight command-line tool
 */

const { program } = require("commander");
const chalk = require("chalk");
const inquirer = require("inquirer");

// Import command modules
const analyzeCommand = require("../commands/analyze");
const dashboardCommand = require("../commands/dashboard");
const insightsCommand = require("../commands/insights");
const healthCommand = require("../commands/health");
const reportCommand = require("../commands/report");

// CLI Configuration
program
  .name("devinsight")
  .description("Repository Analyzer and Developer Productivity Dashboard")
  .version("1.0.0");

// Analyze command
program
  .command("analyze")
  .description("Analyze the current repository structure and dependencies")
  .action(async () => {
    try {
      await analyzeCommand();
    } catch (error) {
      console.error(chalk.red("Error:"), error.message);
      process.exit(1);
    }
  });

// Dashboard command
program
  .command("dashboard")
  .description("Display developer productivity dashboard")
  .option("--json", "Output as JSON")
  .action(async (options) => {
    try {
      await dashboardCommand(options);
    } catch (error) {
      console.error(chalk.red("Error:"), error.message);
      process.exit(1);
    }
  });

// Insights command
program
  .command("insights")
  .description("Analyze patterns and provide smart insights")
  .action(async () => {
    try {
      await insightsCommand();
    } catch (error) {
      console.error(chalk.red("Error:"), error.message);
      process.exit(1);
    }
  });

// Health command
program
  .command("health")
  .description("Perform repository health checks")
  .action(async () => {
    try {
      await healthCommand();
    } catch (error) {
      console.error(chalk.red("Error:"), error.message);
      process.exit(1);
    }
  });

// Report command
program
  .command("report")
  .description("Generate a comprehensive Markdown report")
  .action(async () => {
    try {
      await reportCommand();
    } catch (error) {
      console.error(chalk.red("Error:"), error.message);
      process.exit(1);
    }
  });

// Interactive mode - when no command is provided
if (process.argv.length === 2) {
  showInteractiveMenu();
} else {
  program.parse(process.argv);
}

/**
 * Display interactive menu for user selection
 */
async function showInteractiveMenu() {
  console.log(chalk.cyan.bold("\n DevInsight CLI - Interactive Mode\n"));

  const { choice } = await inquirer.prompt([
    {
      type: "list",
      name: "choice",
      message: "What would you like to do?",
      choices: [
        { name: " Analyze Repository", value: "analyze" },
        { name: " Developer Dashboard", value: "dashboard" },
        { name: " Smart Insights", value: "insights" },
        { name: " Health Check", value: "health" },
        { name: " Generate Report", value: "report" },
        { name: " Exit", value: "exit" },
      ],
    },
  ]);

  if (choice === "exit") {
    console.log(chalk.yellow("\nGoodbye! \n"));
    process.exit(0);
  }

  try {
    switch (choice) {
      case "analyze":
        await analyzeCommand();
        break;
      case "dashboard":
        await dashboardCommand({});
        break;
      case "insights":
        await insightsCommand();
        break;
      case "health":
        await healthCommand();
        break;
      case "report":
        await reportCommand();
        break;
    }

    // Ask if user wants to continue
    const { continue: shouldContinue } = await inquirer.prompt([
      {
        type: "confirm",
        name: "continue",
        message: "Would you like to perform another action?",
        default: true,
      },
    ]);

    if (shouldContinue) {
      await showInteractiveMenu();
    } else {
      console.log(chalk.yellow("\nGoodbye! \n"));
      process.exit(0);
    }
  } catch (error) {
    console.error(chalk.red("Error:"), error.message);
    process.exit(1);
  }
}
