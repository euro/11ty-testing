export default eleventyConfig => {
  eleventyConfig.setServerOptions({
    port: 3000, // default is 8080
    showAllHosts: true,
    domDiff: false,
    showVersion: true,
    watch: ['dist/_css/**/*.css', 'dist/_js/*.js'],
    // https: {
    //   key: './key.pem',
    //   cert: './cert.pem',
    // },
  });
}
