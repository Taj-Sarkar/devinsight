/**
 * Git Utilities Module
 * Provides functions for interacting with Git repositories
 */

const simpleGit = require('simple-git');
const path = require('path');

/**
 * Initialize Git instance for current directory
 */
function getGit() {
  return simpleGit(process.cwd());
}

/**
 * Check if current directory is a Git repository
 */
async function isGitRepository() {
  try {
    const git = getGit();
    await git.status();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get current branch name
 */
async function getCurrentBranch() {
  const git = getGit();
  const status = await git.status();
  return status.current;
}

/**
 * Get commit count for a time period
 */
async function getCommitCount(since) {
  const git = getGit();
  const log = await git.log({ '--since': since });
  return log.total;
}

/**
 * Get commits for today
 */
async function getCommitsToday() {
  return await getCommitCount('midnight');
}

/**
 * Get commits for this week
 */
async function getCommitsThisWeek() {
  return await getCommitCount('1 week ago');
}

/**
 * Get last commit information
 */
async function getLastCommit() {
  const git = getGit();
  const log = await git.log({ maxCount: 1 });
  return log.latest;
}

/**
 * Get files modified in last commit
 */
async function getLastCommitFiles() {
  const git = getGit();
  const log = await git.log({ maxCount: 1, '--name-only': null });
  
  if (log.latest) {
    const diff = await git.show(['--stat', log.latest.hash]);
    return parseGitDiffStat(diff);
  }
  
  return { files: [], additions: 0, deletions: 0 };
}

/**
 * Parse git diff stat output
 */
function parseGitDiffStat(diffOutput) {
  const lines = diffOutput.split('\n');
  const files = [];
  let additions = 0;
  let deletions = 0;

  for (const line of lines) {
    // Match lines like: " file.js | 10 +++++-----"
    const match = line.match(/^\s*(.+?)\s*\|\s*(\d+)\s*([+-]+)?$/);
    if (match) {
      const fileName = match[1].trim();
      const changes = match[2];
      const symbols = match[3] || '';
      
      files.push(fileName);
      additions += (symbols.match(/\+/g) || []).length;
      deletions += (symbols.match(/-/g) || []).length;
    }
  }

  // Also check for summary line like: "2 files changed, 10 insertions(+), 5 deletions(-)"
  const summaryMatch = diffOutput.match(/(\d+)\s+insertion[s]?\(\+\)(?:,\s*(\d+)\s+deletion[s]?\(-\))?/);
  if (summaryMatch) {
    additions = parseInt(summaryMatch[1]) || 0;
    deletions = parseInt(summaryMatch[2]) || 0;
  }

  return { files, additions, deletions };
}

/**
 * Get most frequently modified files
 */
async function getMostModifiedFiles(limit = 10) {
  const git = getGit();
  
  try {
    // Get all commits and their file changes
    const log = await git.raw(['log', '--name-only', '--pretty=format:']);
    const files = log.split('\n').filter(f => f.trim() !== '');
    
    // Count occurrences
    const fileCount = {};
    files.forEach(file => {
      fileCount[file] = (fileCount[file] || 0) + 1;
    });

    // Sort by frequency
    const sorted = Object.entries(fileCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([file, count]) => ({ file, count }));

    return sorted;
  } catch (error) {
    return [];
  }
}

/**
 * Get repository root path
 */
async function getRepoRoot() {
  const git = getGit();
  const root = await git.revparse(['--show-toplevel']);
  return root.trim();
}

module.exports = {
  getGit,
  isGitRepository,
  getCurrentBranch,
  getCommitsToday,
  getCommitsThisWeek,
  getLastCommit,
  getLastCommitFiles,
  getMostModifiedFiles,
  getRepoRoot
};
