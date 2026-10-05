import { SITE_CONFIG } from '../../src/config/constants';
import { buildOrganizationSchema, buildWebSiteSchema } from '../../src/lib/schema';
import { metadata as homeMetadata } from '../../src/app/page';

describe('Before the Numbers Rebranding Validation', () => {
  it('validates master brand name, tagline, and canonical domain in SITE_CONFIG', () => {
    expect(SITE_CONFIG.author).toBe('Before the Numbers');
    expect(SITE_CONFIG.domain).toBe('www.beforethenumbers.org');
    expect(SITE_CONFIG.title).toContain('Before the Numbers');
    expect(SITE_CONFIG.title).toContain("Don't Wait for the Diagnosis");
    expect(SITE_CONFIG.description).toContain('Before the Numbers');
  });

  it('validates root metadata aligns with Before the Numbers global mission', () => {
    expect(homeMetadata.title).toContain('Before the Numbers');
    expect(homeMetadata.title).toContain("Don't Wait for the Diagnosis");
    expect(homeMetadata.description).toContain('Before the Numbers');
  });

  it('generates schema with Before the Numbers organization', () => {
    const orgSchema = buildOrganizationSchema();
    expect(orgSchema['@context']).toBe('https://schema.org');
    expect(orgSchema.name).toBe('Before the Numbers');
    expect(orgSchema.url).toBe('https://www.beforethenumbers.org');

    const webSchema = buildWebSiteSchema();
    expect(webSchema.name).toBe('Before the Numbers');
    expect(webSchema.url).toBe('https://www.beforethenumbers.org');
  });
});
