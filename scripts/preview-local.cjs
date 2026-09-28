const { spawnSync } = require('node:child_process');
const next = require.resolve('next/dist/bin/next');
const env = { ...process.env, NODE_ENV: 'production' };
const build = spawnSync(process.execPath, [next, 'build'], { stdio: 'inherit', env });
if (build.status !== 0) process.exit(build.status || 1);
const server = spawnSync(process.execPath, [next, 'start'], { stdio: 'inherit', env });
process.exit(server.status || 0);
