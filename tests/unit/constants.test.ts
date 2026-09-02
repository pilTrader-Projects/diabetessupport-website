/**
 * Unit Test Suite for Site Constants & PWA App Registry.
 *
 * @usecase Verifies that SITE_CONFIG and PWA_APPS comply with SOLID clean architecture rules (no empty or invalid values).
 * @dependencies SITE_CONFIG, PWA_APPS from src/config/constants.ts.
 */
import { SITE_CONFIG, PWA_APPS } from '../../src/config/constants';

describe('SITE_CONFIG Constant Validation (SOLID / Clean Code)', () => {
  it('should define essential site metadata', () => {
    expect(SITE_CONFIG.title).toBeDefined();
    expect(SITE_CONFIG.description).toBeDefined();
    expect(SITE_CONFIG.domain).toBe('diabetescareph.com');
  });

  it('should define target PWA apps for promotion', () => {
    expect(PWA_APPS).toHaveLength(3);
    expect(PWA_APPS[0].id).toBe('glucose-logger');
    expect(PWA_APPS[1].id).toBe('meal-logger');
    expect(PWA_APPS[2].id).toBe('ai-health-companion');
  });

  it('should ensure each PWA app has valid target URL and description', () => {
    PWA_APPS.forEach((app) => {
      expect(app.name).toBeTruthy();
      expect(app.url).toMatch(/^https?:\/\//);
      expect(app.tagline).toBeTruthy();
    });
  });
});
