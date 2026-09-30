/**
 * Shared text processing utilities for the Learning Hub domain.
 */

/**
 * Extracts 2-4 key takeaways from a video/episode description.
 * Falls back to generic metabolic health bullets if no structured list found.
 */
export function extractTakeaways(description: string, title: string): string[] {
  const takeaways: string[] = [];
  const lines = description.split('\n').map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    if (/^(\d+[\.)]|•|-|\*)\s+(.+)/.test(line)) {
      const cleaned = line.replace(/^(\d+[\.)]|•|-|\*)\s+/, '').trim();
      if (cleaned.length > 10 && cleaned.length < 200) {
        takeaways.push(cleaned);
      }
    }
    if (takeaways.length >= 3) break;
  }

  if (takeaways.length === 0) {
    takeaways.push(`Key scientific overview presented on ${title}.`);
    takeaways.push(`Clinical context and lifestyle implications for metabolic health.`);
    takeaways.push(`Practical takeaways on fasting schedules and carbohydrate management.`);
  }

  return takeaways;
}
