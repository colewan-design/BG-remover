module.exports = {
  apps: [
    {
      name: 'bgremover-nuxt',
      cwd: '/var/www/bgremover/frontend',
      script: '.output/server/index.mjs',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        NITRO_PORT: 3000,
        NITRO_HOST: '127.0.0.1',
        NUXT_PUBLIC_BACKEND_API_BASE: 'https://api.example.com/api',
      },
    },
  ],
}
