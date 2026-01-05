const config = require('../config');

class DependencyManager {
  hasDependency(packageJson) {
    const depValue = packageJson.dependencies && packageJson.dependencies[config.dependency.name];
    const devDepValue = packageJson.devDependencies && packageJson.devDependencies[config.dependency.name];
    return !!(depValue || devDepValue);
  }

  addDependency(packageJson) {
    packageJson.dependencies = packageJson.dependencies || {};
    packageJson.dependencies[config.dependency.name] = config.dependency.version;
    return JSON.stringify(packageJson, null, 2) + '\n';
  }

  updateDependency(rawContent) {
    // Match "npm:@gsap/shockingly@<version>" and replace with just "<version>"
    const regex = /"npm:@gsap\/shockingly@([^"]+)"/g;

    const updatedContent = rawContent.replace(regex, '"$1"');

    if (updatedContent === rawContent) {
      return null; // No changes made
    }

    return updatedContent;
  }
}

module.exports = new DependencyManager(); 