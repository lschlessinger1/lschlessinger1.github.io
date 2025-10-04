module.exports = [
  {
    files: ["assets/js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        document: "readonly",
        window: "readonly",
        fetch: "readonly",
        history: "readonly",
        console: "readonly"
      }
    },
    rules: {
      "no-console": "off"
    }
  }
];
