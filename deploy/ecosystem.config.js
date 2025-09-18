module.exports = {
  apps: [
    // Main App
    {
      name: "jainsearchapi",
      script: "bun",
      args: "app.js",
      interpreter: "none",
      autorestart: true,
      watch: true,
      max_memory_restart: "1G",
    }
  ]
};
