import fs from 'fs';

const files = ['package-lock.json', 'yarn.lock'];
files.forEach((file) => {
  try {
    fs.unlinkSync(file);
  } catch (error) {
    // Ignore error if file doesn't exist
  }
});

if (!/pnpm/.test(process.env.npm_config_user_agent || '')) {
  console.error('Use pnpm instead');
  process.exit(1);
}
