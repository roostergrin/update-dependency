const config = require('../config');

class DependencyManager {
  hasDependency(packageJson) {
    const depValue = packageJson.dependencies && packageJson.dependencies[config.dependency.name];
    const devDepValue = packageJson.devDependencies && packageJson.devDependencies[config.dependency.name];
    const currentValue = depValue || devDepValue;

    if (!currentValue) {
      return false;
    }

    // If oldVersion is specified, only match if the current value equals oldVersion
    if (config.dependency.oldVersion) {
      return currentValue === config.dependency.oldVersion;
    }

    return true;
  }

  addDependency(packageJson) {
    packageJson.dependencies = packageJson.dependencies || {};
    packageJson.dependencies[config.dependency.name] = config.dependency.version;
    return JSON.stringify(packageJson, null, 2) + '\n';
  }

  updateDependency(packageJson) {
    if (packageJson.dependencies && packageJson.dependencies[config.dependency.name]) {
      packageJson.dependencies[config.dependency.name] = config.dependency.version;
      return JSON.stringify(packageJson, null, 2) + '\n';
    }
    if (packageJson.devDependencies && packageJson.devDependencies[config.dependency.name]) {
      packageJson.devDependencies[config.dependency.name] = config.dependency.version;
      return JSON.stringify(packageJson, null, 2) + '\n';
    }
    return null; // Dependency not found
  }
}

module.exports = new DependencyManager(); 