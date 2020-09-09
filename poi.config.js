module.exports = {
  entry: 'src/test',
  plugins: [
    {
      resolve: '@poi/plugin-eslint',
      options: {
        loaderOptions: {
          fix: true
        }
      }
    }
  ]
}