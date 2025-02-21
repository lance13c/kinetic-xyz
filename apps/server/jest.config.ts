// jest.config.js
module.exports = {
  testMatch: ['**/test/**/*.test.[jt]s?(x)'], 
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest', 
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
