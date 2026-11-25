module.exports = {
  apps: [
    {
      name: "prism-bazar-admin",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      exec_mode: "fork",
      args: "start",
      instances: 1,
      watch: false,
      autorestart: true,
      max_memory_restart: "450M",
      env: {
        NODE_ENV: "production",
        PORT: 5001,
      },
    },
  ],
};
