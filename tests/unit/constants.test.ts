/**
 * Unit Test Suite for Site Constants & Awareness Pillars.
 *
 * @usecase Verifies that SITE_CONFIG and AWARENESS_PILLARS comply with SOLID clean architecture rules (no empty or invalid values).
 * @dependencies SITE_CONFIG, AWARENESS_PILLARS from src/config/constants.ts.
 */
import { SITE_CONFIG, AWARENESS_PILLARS } from '../../src/config/constants';

describe('SITE_CONFIG Constant Validation (SOLID / Clean Code)', () => {
  it('should define essential site metadata', () => {
    expect(SITE_CONFIG.title).toBeDefined();
    expect(SITE_CONFIG.description).toBeDefined();
    expect(SITE_CONFIG.domain).toBe('diabetescareph.com');
  });

  it('should define educational awareness pillars for the campaign', () => {
    expect(AWARENESS_PILLARS).toHaveLength(3);
    expect(AWARENESS_PILLARS[0].id).toBe('silent-killer');
    expect(AWARENESS_PILLARS[1].id).toBe('status-quo-trap');
    expect(AWARENESS_PILLARS[2].id).toBe('early-detection');
  });

  it('should ensure each awareness pillar has valid statistics and descriptions', () => {
    AWARENESS_PILLARS.forEach((pillar) => {
      expect(pillar.title).toBeTruthy();
      expect(pillar.stat).toBeTruthy();
      expect(pillar.description).toBeTruthy();
    });
  });
});
