#!/usr/bin/env node

const { spawn } = require('child_process');

// Start Next.js development server
const nextDev = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true
});

nextDev.on('close', (code) => {
  console.log(`Next.js dev server exited with code ${code}`);
});

process.on('SIGINT', () => {
  nextDev.kill('SIGINT');
  process.exit(0);
});
