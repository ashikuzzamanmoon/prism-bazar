module.exports = {
  apps: [
    {
      name: "prism-bazar-server",
      cwd: "./apps/server",
      script: "dist/main.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "450M",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
    {
      name: "prism-bazar-web",
      cwd: "./apps/web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "prism-bazar-admin",
      cwd: "./apps/admin",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 5001",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "450M",
      env: {
        NODE_ENV: "production",
        PORT: 5001,
      },
    },
  ],
};
