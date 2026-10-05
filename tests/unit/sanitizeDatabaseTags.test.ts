import { sanitizeTagsList, TAG_REPLACEMENTS } from '../../scripts/sanitize-database-tags';

describe('Database Tag Sanitizer', () => {
  it('corrects "Loose Weight" typo to "Weight Management"', () => {
    const rawTags = ['Loose Weight', 'loose-weight', 'Keto'];
    const cleaned = sanitizeTagsList(rawTags);
    expect(cleaned).toContain('Weight Management');
    expect(cleaned).not.toContain('Loose Weight');
    expect(cleaned).not.toContain('loose-weight');
  });

  it('replaces unhedged "reverse type 2 diabetes" with "Type 2 Remission"', () => {
    const rawTags = ['Reverse Type 2 Diabetes', 'reverse diabetes'];
    const cleaned = sanitizeTagsList(rawTags);
    expect(cleaned).toContain('Type 2 Remission');
    expect(cleaned).not.toContain('Reverse Type 2 Diabetes');
  });

  it('deduplicates tags', () => {
    const rawTags = ['Weight Management', 'Loose Weight', 'loose weight'];
    const cleaned = sanitizeTagsList(rawTags);
    expect(cleaned.filter((t) => t === 'Weight Management').length).toBe(1);
  });
});
