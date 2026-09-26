import { AiQualifierService } from '../../src/services/aiQualifierService';

describe('AiQualifierService (TDD Unit Tests)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Token Optimization & Sanitization', () => {
    it('should strip URLs, promo codes, timestamps, and cap description length', () => {
      const rawDescription = `In this episode, we break down insulin resistance and visceral fat.
Check out our sponsor at https://example.com/sponsor and use code BEN5 for 10% off.
Timestamps:
00:00 Introduction
02:15 What is Insulin Resistance?
10:45 Reversing Fatty Liver
Follow me on Instagram https://instagram.com/drbenbikman
Disclaimer: This video is for educational purposes only and is not medical advice.`;

      const sanitized = AiQualifierService.sanitizeDescription(rawDescription, 200);
      expect(sanitized).not.toContain('https://');
      expect(sanitized).not.toContain('use code');
      expect(sanitized).not.toContain('00:00');
      expect(sanitized).not.toContain('Disclaimer:');
      expect(sanitized).toContain('insulin resistance and visceral fat');
      expect(sanitized.length).toBeLessThanOrEqual(200);
    });
  });

  describe('Deterministic Heuristic Classifier', () => {
    it('should qualify high-relevance content on Insulin Resistance and Diabetes', async () => {
      const result = await AiQualifierService.qualifyResource({
        title: 'How Insulin Resistance Causes Type 2 Diabetes and How to Reverse It',
        description: 'In this lecture, we examine fasting glucose, HbA1c, and how low carb nutrition restores insulin sensitivity.',
        authorityName: 'Dr. Ben Bikman',
        authoritySpecialties: ['Insulin Resistance', 'Low Carb'],
      });

      expect(result.isRelevant).toBe(true);
      expect(result.relevanceScore).toBeGreaterThanOrEqual(70);
      expect(result.matchedTopics).toContain('Insulin Resistance');
      expect(result.matchedTopics).toContain('Type 2 Diabetes');
      expect(result.suggestedTakeaways).toHaveLength(3);
      expect(result.relevanceReason).toContain('Directly aligns with metabolic health advocacy');
    });

    it('should qualify content on Intermittent Fasting and Autophagy', async () => {
      const result = await AiQualifierService.qualifyResource({
        title: 'The Cellular Switch: How Intermittent Fasting Activates Autophagy',
        description: 'Deep dive into time-restricted eating, lipid energy metabolism, and reducing visceral fat.',
        authorityName: 'Dr. Jason Fung',
        authoritySpecialties: ['Intermittent Fasting'],
      });

      expect(result.isRelevant).toBe(true);
      expect(result.relevanceScore).toBeGreaterThanOrEqual(50);
      expect(result.matchedTopics).toContain('Intermittent Fasting');
    });

    it('should qualify content discussing GLP-1, Retatrutide, and Amylin metabolic hormones', async () => {
      const result = await AiQualifierService.qualifyResource({
        title: '153: Why Amylin May Be the Most Important Weight Loss Hormone',
        description: 'Amylin is an insulin-sparing hormone released with insulin that slows digestion and curbs appetite.',
        authorityName: 'Dr. Ben Bikman',
      });

      expect(result.isRelevant).toBe(true);
      expect(result.relevanceScore).toBeGreaterThanOrEqual(50);
    });

    it('should disqualify off-topic content such as gym workouts or travel vlogs', async () => {
      const result = await AiQualifierService.qualifyResource({
        title: 'Shoulder Workout Routine & Bicep Curl Hypertrophy Split',
        description: 'Complete chest day and shoulder workout routine for maximum arm hypertrophy at the gym.',
        authorityName: 'Fitness Channel',
      });

      expect(result.isRelevant).toBe(false);
      expect(result.relevanceScore).toBeLessThan(50);
      expect(result.relevanceReason).toContain('Insufficient focus on metabolic health');
    });

    it('should disqualify unrelated personal vlogs and gaming setup videos', async () => {
      const result = await AiQualifierService.qualifyResource({
        title: 'My 2026 Gaming Setup Tour and Unboxing',
        description: 'Touring my new studio, gaming setup, microphone and camera gear.',
      });

      expect(result.isRelevant).toBe(false);
      expect(result.relevanceScore).toBeLessThan(50);
    });
  });

  describe('AI API Integration (Gemini)', () => {
    it('should call Gemini API when GEMINI_API_KEY is configured and parse JSON output', async () => {
      process.env.GEMINI_API_KEY = 'mock-gemini-key';

      const mockAiPayload = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    isRelevant: true,
                    relevanceScore: 94,
                    relevanceReason: 'Direct clinical evidence on reversing fatty liver through low-carb dietary intervention.',
                    matchedTopics: ['Fatty Liver', 'Low Carb'],
                    suggestedTakeaways: [
                      'Fatty liver is driven by fructose and high insulin.',
                      'Carbohydrate restriction rapidly mobilizes intrahepatic lipid stores.',
                      'Normalizing liver enzymes improves peripheral insulin sensitivity.',
                    ],
                  }),
                },
              ],
            },
          },
        ],
      };

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAiPayload),
      });

      const result = await AiQualifierService.qualifyResource({
        title: 'Reversing Fatty Liver Disease with Low Carb',
        description: 'Clinical trial review of NAFLD remission.',
        customFetch: mockFetch as any,
      });

      expect(mockFetch).toHaveBeenCalled();
      expect(result.isRelevant).toBe(true);
      expect(result.relevanceScore).toBe(94);
      expect(result.matchedTopics).toEqual(['Fatty Liver', 'Low Carb']);
      expect(result.relevanceReason).toContain('Direct clinical evidence');
    });

    it('should gracefully fall back to heuristic evaluation if AI API call fails', async () => {
      process.env.GEMINI_API_KEY = 'mock-broken-key';

      const mockFetch = jest.fn().mockRejectedValue(new Error('Network error calling AI service'));

      const result = await AiQualifierService.qualifyResource({
        title: 'How Insulin Resistance Controls Blood Sugar',
        description: 'Comprehensive lecture on glucose spikes and type 2 diabetes management.',
        customFetch: mockFetch as any,
      });

      // Fallback kicks in and evaluates via heuristic engine
      expect(result.isRelevant).toBe(true);
      expect(result.matchedTopics).toContain('Insulin Resistance');
    });
  });
});
