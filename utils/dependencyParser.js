/**
 * Dependency Parser Module
 * Parses and analyzes package.json dependencies
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Read and parse package.json
 */
async function readPackageJson(rootPath = process.cwd()) {
  try {
    const packagePath = path.join(rootPath, 'package.json');
    const content = await fs.readFile(packagePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('package.json not found in the current directory');
    }
    throw new Error('Failed to parse package.json: ' + error.message);
  }
}

/**
 * Check if package.json exists
 */
async function hasPackageJson(rootPath = process.cwd()) {
  try {
    const packagePath = path.join(rootPath, 'package.json');
    await fs.access(packagePath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get project name from package.json or directory
 */
async function getProjectName(rootPath = process.cwd()) {
  try {
    const packageJson = await readPackageJson(rootPath);
    return packageJson.name || path.basename(rootPath);
  } catch (error) {
    return path.basename(rootPath);
  }
}

/**
 * Get dependencies summary
 */
async function getDependenciesSummary(rootPath = process.cwd()) {
  try {
    const packageJson = await readPackageJson(rootPath);
    
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};
    const peerDependencies = packageJson.peerDependencies || {};
    
    const totalCount = 
      Object.keys(dependencies).length +
      Object.keys(devDependencies).length +
      Object.keys(peerDependencies).length;

    return {
      dependencies: Object.entries(dependencies).map(([name, version]) => ({ name, version })),
      devDependencies: Object.entries(devDependencies).map(([name, version]) => ({ name, version })),
      peerDependencies: Object.entries(peerDependencies).map(([name, version]) => ({ name, version })),
      totalCount,
      dependencyCount: Object.keys(dependencies).length,
      devDependencyCount: Object.keys(devDependencies).length,
      peerDependencyCount: Object.keys(peerDependencies).length
    };
  } catch (error) {
    return {
      dependencies: [],
      devDependencies: [],
      peerDependencies: [],
      totalCount: 0,
      dependencyCount: 0,
      devDependencyCount: 0,
      peerDependencyCount: 0
    };
  }
}

/**
 * Check if package.json has scripts section
 */
async function hasScripts(rootPath = process.cwd()) {
  try {
    const packageJson = await readPackageJson(rootPath);
    return packageJson.scripts && Object.keys(packageJson.scripts).length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Get scripts from package.json
 */
async function getScripts(rootPath = process.cwd()) {
  try {
    const packageJson = await readPackageJson(rootPath);
    return packageJson.scripts || {};
  } catch (error) {
    return {};
  }
}

/**
 * Analyze dependency health
 */
async function analyzeDependencyHealth(rootPath = process.cwd()) {
  const issues = [];
  
  try {
    const summary = await getDependenciesSummary(rootPath);
    
    // Check for too many dependencies
    if (summary.totalCount > 50) {
      issues.push({
        type: 'warning',
        message: `Large number of dependencies detected (${summary.totalCount}). Consider reviewing if all are necessary.`
      });
    }
    
    // Check for very few dependencies in a non-trivial project
    if (summary.totalCount === 0) {
      issues.push({
        type: 'info',
        message: 'No dependencies found. This might be a minimal project or dependencies are not tracked.'
      });
    }

    return issues;
  } catch (error) {
    return [];
  }
}

module.exports = {
  readPackageJson,
  hasPackageJson,
  getProjectName,
  getDependenciesSummary,
  hasScripts,
  getScripts,
  analyzeDependencyHealth
};
