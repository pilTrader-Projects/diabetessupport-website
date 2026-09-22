import fs from 'fs';
import path from 'path';

describe('PWA & Android WebAPK Installability Standards', () => {
  const rootDir = process.cwd();

  describe('Web App Manifest Configuration', () => {
    it('should export a valid Next.js manifest generator with Android WebAPK required fields', async () => {
      const manifestModule = await import('@/app/manifest');
      const manifestGenerator = manifestModule.default;
      expect(typeof manifestGenerator).toBe('function');

      const manifest = manifestGenerator();

      // Android WebAPK mandatory fields
      expect(manifest.name).toBeDefined();
      expect(manifest.name?.length).toBeGreaterThan(0);
      expect(manifest.short_name).toBeDefined();
      expect(manifest.short_name?.length).toBeGreaterThan(0);
      expect(manifest.short_name?.length).toBeLessThanOrEqual(30);

      expect(manifest.start_url).toBe('/');
      expect(manifest.scope).toBe('/');
      expect(manifest.display).toBe('standalone');
      expect(manifest.background_color).toBe('#0f172a');
      expect(manifest.theme_color).toBe('#1e3a8a');

      // Android WebAPK icon requirements
      expect(Array.isArray(manifest.icons)).toBe(true);
      const icons = manifest.icons || [];

      // Check standard 192x192 icon
      const icon192 = icons.find((i: any) => i.sizes === '192x192' && (!i.purpose || i.purpose.includes('any')));
      expect(icon192).toBeDefined();
      expect(icon192?.type).toBe('image/png');

      // Check standard 512x512 icon
      const icon512 = icons.find((i: any) => i.sizes === '512x512' && (!i.purpose || i.purpose.includes('any')));
      expect(icon512).toBeDefined();
      expect(icon512?.type).toBe('image/png');

      // Check adaptive maskable icon for Android
      const maskableIcon = icons.find((i: any) => i.purpose?.includes('maskable'));
      expect(maskableIcon).toBeDefined();
      expect(maskableIcon?.type).toBe('image/png');
    });

    it('should have a static public/manifest.json matching manifest specifications for fallback web clients', () => {
      const staticManifestPath = path.join(rootDir, 'public', 'manifest.json');
      expect(fs.existsSync(staticManifestPath)).toBe(true);

      const content = JSON.parse(fs.readFileSync(staticManifestPath, 'utf8'));
      expect(content.name).toBeDefined();
      expect(content.short_name).toBeDefined();
      expect(content.start_url).toBe('/');
      expect(content.display).toBe('standalone');
      expect(content.icons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Service Worker & Offline Fallback', () => {
    it('should have public/sw.js with mandatory fetch, install, and activate event listeners', () => {
      const swPath = path.join(rootDir, 'public', 'sw.js');
      expect(fs.existsSync(swPath)).toBe(true);

      const swContent = fs.readFileSync(swPath, 'utf8');
      // Android WebAPK strictly checks for a registered service worker with a fetch event handler
      expect(swContent).toMatch(/addEventListener\(\s*['"]fetch['"]/);
      expect(swContent).toMatch(/addEventListener\(\s*['"]install['"]/);
      expect(swContent).toMatch(/addEventListener\(\s*['"]activate['"]/);
    });

    it('should have an offline fallback page in src/app/offline/page.tsx', () => {
      const offlinePagePath = path.join(rootDir, 'src', 'app', 'offline', 'page.tsx');
      expect(fs.existsSync(offlinePagePath)).toBe(true);
    });
  });

  describe('PWA Icon Assets Generation', () => {
    const requiredIcons = [
      'public/icons/icon-192x192.png',
      'public/icons/icon-512x512.png',
      'public/icons/icon-maskable-192x192.png',
      'public/icons/icon-maskable-512x512.png',
      'public/icons/apple-touch-icon.png',
      'public/favicon.ico',
    ];

    test.each(requiredIcons)('icon file %s should exist and have non-zero size', (iconRelPath) => {
      const fullPath = path.join(rootDir, iconRelPath);
      expect(fs.existsSync(fullPath)).toBe(true);
      const stats = fs.statSync(fullPath);
      expect(stats.size).toBeGreaterThan(100);
    });
  });
});
