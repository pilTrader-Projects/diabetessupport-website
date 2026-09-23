import React from 'react';
import ReactDOMServer from 'react-dom/server';
import fs from 'fs';
import path from 'path';

// Note: Template will be imported from src/app/template
let Template: any;
try {
  Template = require('@/app/template').default;
} catch {
  // Anticipate failure before file creation in TDD
  Template = null;
}

describe('Standardized Page Transition & Smooth Scroll Ergonomics', () => {
  describe('Page Transition Template (src/app/template.tsx)', () => {
    it('exports a valid React component function', () => {
      expect(Template).toBeDefined();
      expect(typeof Template).toBe('function');
    });

    it('wraps page children inside a container with the page-transition-enter class', () => {
      if (!Template) {
        throw new Error('Template is not defined yet');
      }
      const renderedHtml = ReactDOMServer.renderToString(
        <Template>
          <div data-testid="child-page">Sample Page Content</div>
        </Template>
      );

      expect(renderedHtml).toContain('page-transition-enter');
      expect(renderedHtml).toContain('Sample Page Content');
    });
  });

  describe('Global CSS Transition Styles (src/app/globals.css)', () => {
    const cssPath = path.join(process.cwd(), 'src/app/globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    it('defines pageSlideUpFade keyframes with translateY and opacity', () => {
      expect(cssContent).toContain('@keyframes pageSlideUpFade');
      expect(cssContent).toContain('translateY(');
      expect(cssContent).toContain('opacity:');
    });

    it('defines .page-transition-enter with hardware-accelerated properties', () => {
      expect(cssContent).toContain('.page-transition-enter');
      expect(cssContent).toContain('animation: pageSlideUpFade');
      expect(cssContent).toContain('will-change: transform, opacity');
    });

    it('includes accessibility support for prefers-reduced-motion', () => {
      expect(cssContent).toContain('prefers-reduced-motion: reduce');
      expect(cssContent).toContain('.page-transition-enter');
    });

    it('enables targeted smooth scrolling for anchor targets without global html scroll-smooth conflict', () => {
      expect(cssContent).toMatch(/:target/);
      expect(cssContent).toContain('scroll-behavior: smooth');
    });
  });

  describe('Root Layout (src/app/layout.tsx)', () => {
    const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');

    it('does not apply scroll-smooth directly to html to prevent route change bounce', () => {
      expect(layoutContent).not.toContain('<html lang="en" className="scroll-smooth"');
      expect(layoutContent).toContain('<html lang="en"');
    });
  });
});
