/**
 * Insights Command
 * Analyzes patterns and provides smart insights about the repository
 */

const chalk = require('chalk');
const Table = require('cli-table3');

const { isGitRepository, getMostModifiedFiles } = require('../utils/gitUtils');
const { scanDirectory, getLargestFiles, countFileLines } = require('../utils/fileScanner');
const { scanForTodos, getFilesWithMostTodos } = require('../utils/todoScanner');

async function insightsCommand() {
  console.log(chalk.cyan.bold('\n💡 Smart Insights\n'));

  // Check if we're in a Git repository
  const isGit = await isGitRepository();
  if (!isGit) {
    throw new Error('Not a Git repository. Please run this command in a Git repository.');
  }

  const rootPath = process.cwd();

  // ===== MOST FREQUENTLY MODIFIED FILES =====
  console.log(chalk.blue.bold('═══ Most Frequently Modified Files ═══\n'));
  console.log(chalk.gray('Analyzing Git history...'));

  const mostModified = await getMostModifiedFiles(10);

  if (mostModified.length > 0) {
    const modifiedTable = new Table({
      head: [chalk.cyan('File'), chalk.cyan('Edit Count'), chalk.cyan('Insight')],
      style: { head: [], border: [] },
      colWidths: [40, 15, 45]
    });

    for (const item of mostModified) {
      let insight = '';
      
      if (item.count > 50) {
        insight = chalk.red('⚠️  Frequently edited - consider refactoring');
      } else if (item.count > 20) {
        insight = chalk.yellow('⚡ Active development area');
      } else {
        insight = chalk.green('✓ Normal activity');
      }

      modifiedTable.push([
        item.file.substring(0, 38),
        item.count,
        insight
      ]);
    }

    console.log(modifiedTable.toString());
  } else {
    console.log(chalk.gray('No modification history found'));
  }

  // ===== LARGEST FILES =====
  console.log(chalk.blue.bold('\n═══ Largest Files ═══\n'));
  console.log(chalk.gray('Scanning files...'));

  const scanResults = await scanDirectory(rootPath);
  const largestFiles = getLargestFiles(scanResults.files, 10, 50 * 1024); // 50KB minimum

  if (largestFiles.length > 0) {
    const sizeTable = new Table({
      head: [chalk.cyan('File'), chalk.cyan('Size'), chalk.cyan('Insight')],
      style: { head: [], border: [] },
      colWidths: [40, 15, 45]
    });

    for (const file of largestFiles) {
      let insight = '';
      
      if (file.size > 500 * 1024) { // 500KB
        insight = chalk.red('⚠️  Very large - consider splitting');
      } else if (file.size > 200 * 1024) { // 200KB
        insight = chalk.yellow('⚡ Large file - review if needed');
      } else {
        insight = chalk.green('✓ Acceptable size');
      }

      sizeTable.push([
        file.name.substring(0, 38),
        file.sizeFormatted,
        insight
      ]);
    }

    console.log(sizeTable.toString());
  } else {
    console.log(chalk.gray('No large files detected'));
  }

  // ===== REFACTOR CANDIDATES =====
  console.log(chalk.blue.bold('\n═══ Refactor Candidates ═══\n'));
  console.log(chalk.gray('Analyzing code complexity...'));

  // Scan for TODOs
  const todoResults = await scanForTodos(scanResults.files);
  const filesWithMostTodos = getFilesWithMostTodos(todoResults, 5);

  // Combine insights: large files + high TODO count + frequently modified
  const refactorCandidates = [];

  // Check for files with many TODOs
  for (const file of filesWithMostTodos) {
    if (file.count >= 5) {
      refactorCandidates.push({
        file: file.name,
        reason: `High TODO count (${file.count})`,
        severity: 'high'
      });
    }
  }

  // Check for large files that are frequently modified
  const largeFileNames = largestFiles.map(f => f.name);
  const modifiedFileNames = mostModified.map(f => f.file.split('/').pop());

  for (const fileName of largeFileNames) {
    if (modifiedFileNames.includes(fileName)) {
      const alreadyAdded = refactorCandidates.some(c => c.file === fileName);
      if (!alreadyAdded) {
        refactorCandidates.push({
          file: fileName,
          reason: 'Large and frequently edited',
          severity: 'high'
        });
      }
    }
  }

  // Check for very large files
  for (const file of largestFiles) {
    if (file.size > 300 * 1024) { // 300KB
      const alreadyAdded = refactorCandidates.some(c => c.file === file.name);
      if (!alreadyAdded) {
        refactorCandidates.push({
          file: file.name,
          reason: `Very large file (${file.sizeFormatted})`,
          severity: 'medium'
        });
      }
    }
  }

  if (refactorCandidates.length > 0) {
    const refactorTable = new Table({
      head: [chalk.cyan('File'), chalk.cyan('Reason'), chalk.cyan('Priority')],
      style: { head: [], border: [] },
      colWidths: [35, 40, 15]
    });

    refactorCandidates.forEach(candidate => {
      const priority = candidate.severity === 'high' 
        ? chalk.red('High') 
        : chalk.yellow('Medium');

      refactorTable.push([
        candidate.file.substring(0, 33),
        candidate.reason,
        priority
      ]);
    });

    console.log(refactorTable.toString());
  } else {
    console.log(chalk.green('✓ No immediate refactor candidates detected'));
  }

  // ===== SUGGESTIONS =====
  console.log(chalk.blue.bold('\n═══ Suggestions ═══\n'));

  const suggestions = [];

  // Generate suggestions based on findings
  if (mostModified.length > 0 && mostModified[0].count > 50) {
    suggestions.push(`Consider refactoring "${mostModified[0].file}" - it has been modified ${mostModified[0].count} times`);
  }

  if (largestFiles.length > 0 && largestFiles[0].size > 500 * 1024) {
    suggestions.push(`"${largestFiles[0].name}" is very large (${largestFiles[0].sizeFormatted}) - consider splitting into smaller modules`);
  }

  if (todoResults.totalCount > 20) {
    suggestions.push(`You have ${todoResults.totalCount} TODO comments - consider addressing them or creating issues`);
  }

  if (filesWithMostTodos.length > 0 && filesWithMostTodos[0].count >= 5) {
    suggestions.push(`"${filesWithMostTodos[0].name}" has ${filesWithMostTodos[0].count} TODO comments - this file may need attention`);
  }

  if (refactorCandidates.length >= 3) {
    suggestions.push(`Multiple files identified as refactor candidates - consider a code review session`);
  }

  if (suggestions.length > 0) {
    suggestions.forEach((suggestion, index) => {
      console.log(chalk.yellow(`${index + 1}. ${suggestion}`));
    });
  } else {
    console.log(chalk.green('✓ Your codebase looks healthy! Keep up the good work.'));
  }

  console.log(chalk.green('\n✓ Insights analysis complete!\n'));
}

module.exports = insightsCommand;
