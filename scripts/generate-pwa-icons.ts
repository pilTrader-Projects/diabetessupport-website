import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/**
 * Script to generate high-resolution PWA and Android WebAPK icon assets.
 * Generates both standard ("any") and adaptive ("maskable") icons.
 */
async function generatePwaIcons() {
  const iconsDir = path.join(process.cwd(), 'public', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Base SVG markup for the standard app icon (512x512)
  const standardSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e1b4b"/>
        <stop offset="50%" stop-color="#1e3a8a"/>
        <stop offset="100%" stop-color="#831843"/>
      </linearGradient>
      <linearGradient id="dropGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f43f5e"/>
        <stop offset="60%" stop-color="#e11d48"/>
        <stop offset="100%" stop-color="#9f1239"/>
      </linearGradient>
      <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#34d399"/>
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#f43f5e" flood-opacity="0.45"/>
      </filter>
      <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="10" flood-color="#38bdf8" flood-opacity="0.5"/>
      </filter>
    </defs>

    <!-- Background with rounded corners for standard icon -->
    <rect width="512" height="512" rx="110" fill="url(#bgGrad)"/>
    
    <!-- Outer decorative protective shield/ring -->
    <circle cx="256" cy="256" r="195" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="6"/>
    <circle cx="256" cy="256" r="180" fill="none" stroke="url(#pulseGrad)" stroke-opacity="0.25" stroke-dasharray="16 12" stroke-width="4" filter="url(#ringGlow)"/>

    <!-- Central Blood Drop / Glucose Care Symbol -->
    <g filter="url(#glow)">
      <!-- Blood Drop Shape -->
      <path d="M256,105 C256,105 140,240 140,320 C140,384 192,425 256,425 C320,425 372,384 372,320 C372,240 256,105 256,105 Z" fill="url(#dropGrad)"/>
      <!-- Drop Highlight reflection -->
      <path d="M220,175 C200,215 175,270 175,320 C175,340 185,365 200,380 C185,365 178,340 178,320 C178,265 210,205 220,175 Z" fill="#ffffff" fill-opacity="0.4"/>
    </g>

    <!-- Medical Pulse / Glucose Wave across the drop -->
    <path d="M165,335 L205,335 L225,290 L245,370 L268,310 L285,345 L305,335 L347,335" 
          fill="none" 
          stroke="url(#pulseGrad)" 
          stroke-width="12" 
          stroke-linecap="round" 
          stroke-linejoin="round"
          filter="url(#ringGlow)"/>

    <!-- Tiny sparkle at top -->
    <circle cx="256" cy="120" r="6" fill="#ffffff" opacity="0.9"/>
  </svg>
  `;

  // Maskable SVG markup with safe zone padding (central 80% circle)
  // Background rectangle covers full 100% bleeding edge
  const maskableSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <defs>
      <linearGradient id="bgGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e1b4b"/>
        <stop offset="50%" stop-color="#1e3a8a"/>
        <stop offset="100%" stop-color="#831843"/>
      </linearGradient>
      <linearGradient id="dropGradMask" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f43f5e"/>
        <stop offset="60%" stop-color="#e11d48"/>
        <stop offset="100%" stop-color="#9f1239"/>
      </linearGradient>
      <linearGradient id="pulseGradMask" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#34d399"/>
      </linearGradient>
      <filter id="glowMask" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#f43f5e" flood-opacity="0.45"/>
      </filter>
    </defs>

    <!-- Full bleed background for adaptive icon cropping -->
    <rect width="512" height="512" fill="url(#bgGradMask)"/>

    <!-- Scaled down to safe zone (0.78 scale centered at 256,256) -->
    <g transform="translate(256, 256) scale(0.78) translate(-256, -256)">
      <!-- Outer decorative ring -->
      <circle cx="256" cy="256" r="195" fill="none" stroke="#ffffff" stroke-opacity="0.15" stroke-width="6"/>
      <circle cx="256" cy="256" r="180" fill="none" stroke="url(#pulseGradMask)" stroke-opacity="0.3" stroke-dasharray="16 12" stroke-width="5"/>

      <!-- Blood Drop Shape -->
      <g filter="url(#glowMask)">
        <path d="M256,105 C256,105 140,240 140,320 C140,384 192,425 256,425 C320,425 372,384 372,320 C372,240 256,105 256,105 Z" fill="url(#dropGradMask)"/>
        <path d="M220,175 C200,215 175,270 175,320 C175,340 185,365 200,380 C185,365 178,340 178,320 C178,265 210,205 220,175 Z" fill="#ffffff" fill-opacity="0.4"/>
      </g>

      <!-- Pulse line -->
      <path d="M165,335 L205,335 L225,290 L245,370 L268,310 L285,345 L305,335 L347,335" 
            fill="none" 
            stroke="url(#pulseGradMask)" 
            stroke-width="12" 
            stroke-linecap="round" 
            stroke-linejoin="round"/>

      <circle cx="256" cy="120" r="6" fill="#ffffff" opacity="0.9"/>
    </g>
  </svg>
  `;

  console.log('Rendering PWA icon assets via Sharp...');

  // 1. icon-512x512.png
  await sharp(Buffer.from(standardSvg))
    .resize(512, 512)
    .png({ quality: 95 })
    .toFile(path.join(iconsDir, 'icon-512x512.png'));
  console.log('✅ Generated public/icons/icon-512x512.png');

  // 2. icon-192x192.png
  await sharp(Buffer.from(standardSvg))
    .resize(192, 192)
    .png({ quality: 95 })
    .toFile(path.join(iconsDir, 'icon-192x192.png'));
  console.log('✅ Generated public/icons/icon-192x192.png');

  // 3. icon-maskable-512x512.png
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png({ quality: 95 })
    .toFile(path.join(iconsDir, 'icon-maskable-512x512.png'));
  console.log('✅ Generated public/icons/icon-maskable-512x512.png');

  // 4. icon-maskable-192x192.png
  await sharp(Buffer.from(maskableSvg))
    .resize(192, 192)
    .png({ quality: 95 })
    .toFile(path.join(iconsDir, 'icon-maskable-192x192.png'));
  console.log('✅ Generated public/icons/icon-maskable-192x192.png');

  // 5. apple-touch-icon.png (180x180)
  await sharp(Buffer.from(standardSvg))
    .resize(180, 180)
    .png({ quality: 95 })
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log('✅ Generated public/icons/apple-touch-icon.png');

  // 6. favicon.ico (64x64 PNG format or ICO)
  await sharp(Buffer.from(standardSvg))
    .resize(64, 64)
    .toFormat('png')
    .toFile(path.join(process.cwd(), 'public', 'favicon.ico'));
  console.log('✅ Generated public/favicon.ico');

  console.log('All PWA icon assets successfully generated!');
}

generatePwaIcons().catch((err) => {
  console.error('Failed to generate PWA icons:', err);
  process.exit(1);
});
