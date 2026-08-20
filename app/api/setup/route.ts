import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const rootDir = process.cwd();
  const publicDir = path.join(rootDir, 'public');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  const filesToMove = [
    'logo.png',
    'favicon.ico',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'apple-touch-icon.png',
    'android-chrome-192x192.png',
    'android-chrome-512x512.png',
    'site.webmanifest'
  ];

  const results = [];

  for (const file of filesToMove) {
    const src = path.join(/*turbopackIgnore: true*/ rootDir, file);
    const dest = path.join(/*turbopackIgnore: true*/ publicDir, file);
    if (fs.existsSync(src)) {
      try {
        fs.renameSync(src, dest);
        results.push(`Moved ${file}`);
      } catch (e) {
        results.push(`Error moving ${file}: ${e}`);
      }
    } else {
      results.push(`${file} not found in root`);
    }
  }

  return NextResponse.json({ success: true, results });
}
