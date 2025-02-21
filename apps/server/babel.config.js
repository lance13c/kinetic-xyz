// babel.config.js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' }, // Ensure compatibility with current Node
      },
    ],
    '@babel/preset-typescript', // Enable TypeScript support
  ],
};
