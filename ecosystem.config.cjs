module.exports = {
  apps: [
    {
      name: 'practice-os',
      cwd: '/var/www/practice-os',
      script: 'npm',
      args: 'start',
      env_file: '.env',
      env: { NODE_ENV: 'production' },
      autorestart: true,
      max_memory_restart: '1G',
    },
  ],
};
