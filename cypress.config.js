const { defineConfig } = require("cypress")

module.exports = defineConfig({
  watchForFileChanges: false,
  e2e: {
    baseUrl: 'https://app.amenitiz-demo.io',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  env: {
    mailSlurpKey: "b467ec29a803d8383153a8f272a76c2d1035abe4c4a12f062b701393bfe0b4b2"
  }
})
