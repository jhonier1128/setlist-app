module.exports = function(api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['nativewind/babel', { engine: 'metro' }],
      ['module:react-native-reanimated', { globs: ['**/*.{ts,tsx}'] }],
      ['@babel/plugin-decorators', { version: '2023-05' }],
    ],
  }
}