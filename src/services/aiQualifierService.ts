import { IRelevanceQualification } from '../types/learning';

/**
 * AI Relevance Qualifier & Content Moderation Engine.
 *
 * @usecase Evaluates candidate videos, articles, and research against our core medical advocacy:
 *   - Metabolic Health Awareness
 *   - Insulin Resistance & Hyperinsulinemia
 *   - Pre-Diabetes & Type 2 Diabetes (Reversal, Remission, Management)
 *   - Blood Glucose Control & HbA1c
 *   - Low Carbohydrate & Ketogenic Nutrition
 *   - Intermittent Fasting, Time-Restricted Eating & Autophagy
 *   - Fatty Liver Disease (NAFLD/MASLD) & Visceral Adiposity
 *   - Lipid Energy Model & Cardiovascular Risk Mitigation
 *
 * Disqualifies unrelated content (general workout routines, travel vlogs, gaming, unboxings).
 */
export class AiQualifierService {
  private static readonly QUALIFICATION_THRESHOLD = 50;

  /**
   * Sanitizes video descriptions to minimize token consumption by stripping URLs,
   * promo/affiliate links, timestamps, and boilerplate disclaimers.
   */
  public static sanitizeDescription(desc: string, maxChars = 400): string {
    if (!desc) return '';
    return desc
      // Remove URLs (http/https)
      .replace(/https?:\/\/\S+/gi, '')
      // Remove timestamps like 00:00 or 12:34
      .replace(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g, '')
      // Remove promo codes and affiliate boilerplate
      .replace(/(?:use code|discount code|subscribe|follow me on|disclaimer:).*/gi, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxChars);
  }

  /**
   * Evaluates a resource candidate and decides if it is qualified to be published.
   */
  public static async qualifyResource(params: {
    title: string;
    description?: string;
    authorityName?: string;
    authoritySpecialties?: string[];
    customFetch?: (url: string, init?: any) => Promise<any>;
  }): Promise<IRelevanceQualification> {
    const { title, description = '', authorityName = '', authoritySpecialties = [], customFetch } = params;

    // Token optimization: Clean and trim description to essential topic summary only
    const cleanDescription = this.sanitizeDescription(description);

    // Check if an AI API key is configured (Gemini or OpenAI)
    const geminiKey = process.env.GEMINI_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    if (geminiKey) {
      try {
        const aiResult = await this.evaluateWithGemini(
          title,
          cleanDescription,
          authorityName,
          authoritySpecialties,
          geminiKey,
          customFetch
        );
        if (aiResult) return aiResult;
      } catch (err: any) {
        console.warn('Gemini qualification failed, falling back to heuristic engine:', err.message);
      }
    } else if (openAiKey) {
      try {
        const aiResult = await this.evaluateWithOpenAI(
          title,
          cleanDescription,
          authorityName,
          authoritySpecialties,
          openAiKey,
          customFetch
        );
        if (aiResult) return aiResult;
      } catch (err: any) {
        console.warn('OpenAI qualification failed, falling back to heuristic engine:', err.message);
      }
    }

    // Default: Deterministic Clinical Ontology Engine
    return this.evaluateWithHeuristicEngine(title, cleanDescription, authorityName, authoritySpecialties);
  }

  /**
   * Deterministic Medical Advocacy Ontology Evaluator.
   */
  public static evaluateWithHeuristicEngine(
    title: string,
    description: string,
    authorityName: string,
    authoritySpecialties: string[]
  ): IRelevanceQualification {
    const combinedText = `${title} ${description}`.toLowerCase();

    // 1. Tier 1: Core Advocacy Markers (+35 points each, capped at 70)
    // Metabolic Health, Insulin Resistance, Diabetes, Fasting, Low Carb / Keto, Fatty Liver
    const tier1Keywords = [
      'insulin resistance',
      'hyperinsulinemia',
      'insulin sensitive',
      'insulin sensitivity',
      'type 2 diabetes',
      't2d',
      'pre-diabetes',
      'prediabetes',
      'revers.* diabetes',
      'diabetes remission',
      'hba1c',
      'blood sugar',
      'blood glucose',
      'glucose spike',
      'metabolic syndrome',
      'metabolic health',
      'metabolic flexibility',
      'intermittent fasting',
      'fasting',
      'autophagy',
      'low carb',
      'lchf',
      'ketogenic',
      'ketosis',
      'ketone',
      'fatty liver',
      'nafld',
      'masld',
    ];

    // 2. Tier 2: Hormones, Biomarkers & Therapeutic Modalities (+25 points each)
    const tier2Keywords = [
      'time-restricted eating',
      'visceral fat',
      'triglyceride',
      'lipid energy model',
      'cgm',
      'continuous glucose',
      'glucagon',
      'amylin',
      'retatrutide',
      'tirzepatide',
      'glp-1',
      'bioenergetics',
      'carbohydrate restriction',
      'insulin',
    ];

    // 3. Tier 3: Biomarkers & Physiology (+15 points each)
    const tier3Keywords = [
      'mitochondria',
      'mitochondrial',
      'satiety',
      'leptin',
      'adipose',
      'adiposity',
      'fructose',
      'seed oils',
      'insulin-sparing',
      'gluconeogenesis',
      'metabolism',
      'glycemic index',
      'sugar addiction',
    ];

    // 4. Disqualification / Off-topic Penalties (-45 points each)
    const disqualifiers = [
      'workout routine',
      'bicep curl',
      'shoulder workout',
      'chest day',
      'hypertrophy split',
      'travel vlog',
      'flight vlog',
      'q&a life update',
      'gaming setup',
      'unboxing',
      'mukbang',
      'movie review',
      'music video',
      'album reaction',
      'vacation in',
    ];

    let score = 0;
    const matchedTopicsSet = new Set<string>();

    // Evaluate Tier 1
    let tier1Matches = 0;
    for (const kw of tier1Keywords) {
      const reg = new RegExp(`\\b${kw}`, 'i');
      if (reg.test(combinedText)) {
        tier1Matches++;
        if (tier1Matches <= 2) score += 35;
        if (/insulin/i.test(kw)) matchedTopicsSet.add('Insulin Resistance');
        if (/diabet/i.test(kw)) matchedTopicsSet.add('Type 2 Diabetes');
        if (/glucose|blood sugar|hba1c/i.test(kw)) matchedTopicsSet.add('Blood Sugar Control');
        if (/metabolic/i.test(kw)) matchedTopicsSet.add('Metabolic Health');
      }
    }

    // Evaluate Tier 2
    for (const kw of tier2Keywords) {
      const reg = new RegExp(`\\b${kw}`, 'i');
      if (reg.test(combinedText)) {
        score += 25;
        if (/fasting|autophagy/i.test(kw)) matchedTopicsSet.add('Intermittent Fasting');
        if (/low carb|lchf/i.test(kw)) matchedTopicsSet.add('Low Carb');
        if (/keto/i.test(kw)) matchedTopicsSet.add('Ketogenic Diet');
        if (/fatty liver|nafld|masld/i.test(kw)) matchedTopicsSet.add('Fatty Liver');
        if (/lipid|triglyceride/i.test(kw)) matchedTopicsSet.add('Lipid Health');
      }
    }

    // Evaluate Tier 3
    for (const kw of tier3Keywords) {
      const reg = new RegExp(`\\b${kw}`, 'i');
      if (reg.test(combinedText)) {
        score += 15;
        if (/mitochondria/i.test(kw)) matchedTopicsSet.add('Mitochondrial Health');
        if (/satiety|leptin/i.test(kw)) matchedTopicsSet.add('Satiety & Hormones');
      }
    }

    // Boost if authority has known relevant specialties
    if (authoritySpecialties.length > 0 && score > 0) {
      score += 15;
      for (const sp of authoritySpecialties) {
        matchedTopicsSet.add(sp);
      }
    }

    // Subtract penalties
    for (const dq of disqualifiers) {
      const reg = new RegExp(`\\b${dq}`, 'i');
      if (reg.test(combinedText)) {
        score -= 45;
      }
    }

    // Clamp score 0 to 100
    const finalScore = Math.max(0, Math.min(100, score));
    const isRelevant = finalScore >= this.QUALIFICATION_THRESHOLD;

    const matchedTopics = Array.from(matchedTopicsSet);
    if (matchedTopics.length === 0) {
      matchedTopics.push(isRelevant ? 'Metabolic Health' : 'General');
    }

    // Rationale construction
    let relevanceReason = '';
    if (isRelevant) {
      relevanceReason = `Directly aligns with metabolic health advocacy (${matchedTopics.slice(0, 3).join(', ')}). Relevance score: ${finalScore}/100.`;
    } else {
      relevanceReason = `Insufficient focus on metabolic health, insulin resistance, or diabetes management. Relevance score: ${finalScore}/100.`;
    }

    // Construct clinical takeaways
    const suggestedTakeaways = this.synthesizeTakeaways(title, description, matchedTopics, authorityName);

    return {
      isRelevant,
      relevanceScore: finalScore,
      relevanceReason,
      matchedTopics,
      suggestedTakeaways,
    };
  }

  /**
   * Evaluates content using Google Gemini API.
   */
  private static async evaluateWithGemini(
    title: string,
    description: string,
    authorityName: string,
    authoritySpecialties: string[],
    apiKey: string,
    customFetch?: (url: string, init?: any) => Promise<any>
  ): Promise<IRelevanceQualification | null> {
    const fetchFn = customFetch || fetch;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `You are a clinical metabolic health curator for a diabetes support platform advocating for:
- Metabolic Health Awareness & Insulin Resistance
- Pre-Diabetes & Type 2 Diabetes Reversal/Remission
- Low Carb & Ketogenic Diets
- Intermittent Fasting & Autophagy
- Fatty Liver, Visceral Fat & Lipid Energy Metabolism

Candidate Content:
- Title: "${title}"
- Description: "${description}"
- Authority: "${authorityName}" (Specialties: ${authoritySpecialties.slice(0, 3).join(', ')})

Evaluate if this content is HIGHLY RELEVANT to metabolic health advocacy. Disqualify general gym workouts, travel vlogs, personal updates, or off-topic banter.

Respond strictly with valid JSON:
{
  "isRelevant": boolean,
  "relevanceScore": number (0 to 100),
  "relevanceReason": "concise 1-2 sentence clinical rationale",
  "matchedTopics": ["Topic 1", "Topic 2"],
  "suggestedTakeaways": ["Key point 1", "Key point 2", "Key point 3"]
}`;

    const res = await fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsed = JSON.parse(rawText);
    return {
      isRelevant: Boolean(parsed.isRelevant),
      relevanceScore: Number(parsed.relevanceScore) || 0,
      relevanceReason: String(parsed.relevanceReason || ''),
      matchedTopics: Array.isArray(parsed.matchedTopics) ? parsed.matchedTopics : ['Metabolic Health'],
      suggestedTakeaways: Array.isArray(parsed.suggestedTakeaways) ? parsed.suggestedTakeaways : [],
    };
  }

  /**
   * Evaluates content using OpenAI API.
   */
  private static async evaluateWithOpenAI(
    title: string,
    description: string,
    authorityName: string,
    authoritySpecialties: string[],
    apiKey: string,
    customFetch?: (url: string, init?: any) => Promise<any>
  ): Promise<IRelevanceQualification | null> {
    const fetchFn = customFetch || fetch;
    const url = 'https://api.openai.com/v1/chat/completions';

    const systemPrompt = `You are a clinical metabolic health curator for a diabetes support platform.
Advocacy: Insulin Resistance, Type 2 Diabetes, Pre-diabetes, Low Carb, Fasting, Autophagy, Fatty Liver, Metabolic Health.
Disqualify: general gym bodybuilding routines, travel vlogs, personal updates, gaming.
Return JSON:
{
  "isRelevant": boolean,
  "relevanceScore": number,
  "relevanceReason": string,
  "matchedTopics": string[],
  "suggestedTakeaways": string[]
}`;

    const res = await fetchFn(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Title: ${title}\nDescription: ${description.slice(0, 600)}\nAuthority: ${authorityName}`,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return {
      isRelevant: Boolean(parsed.isRelevant),
      relevanceScore: Number(parsed.relevanceScore) || 0,
      relevanceReason: String(parsed.relevanceReason || ''),
      matchedTopics: Array.isArray(parsed.matchedTopics) ? parsed.matchedTopics : ['Metabolic Health'],
      suggestedTakeaways: Array.isArray(parsed.suggestedTakeaways) ? parsed.suggestedTakeaways : [],
    };
  }

  /**
   * Extracts or synthesizes structured clinical takeaways for qualified resources.
   */
  private static synthesizeTakeaways(
    title: string,
    description: string,
    matchedTopics: string[],
    authorityName: string
  ): string[] {
    const takeaways: string[] = [];

    // Check if description already contains numbered bullets
    const lines = description.split('\n');
    for (const line of lines) {
      const match = line.match(/^(\d+\.|\-|\*|•)\s*(.+)/);
      if (match && match[2].trim().length > 15 && match[2].trim().length < 220) {
        takeaways.push(match[2].trim());
        if (takeaways.length >= 3) break;
      }
    }

    // If fewer than 3 takeaways extracted from description, formulate relevant ones
    if (takeaways.length < 3) {
      takeaways.push(`Key scientific overview on "${title.replace(/["']/g, '')}".`);
      if (matchedTopics.length > 0) {
        takeaways.push(`Clinical relevance to ${matchedTopics.slice(0, 2).join(' and ')} in metabolic health.`);
      } else {
        takeaways.push(`Biochemical implications for blood glucose regulation and insulin signaling.`);
      }
      takeaways.push(`Actionable nutritional and lifestyle recommendations from ${authorityName || 'metabolic experts'}.`);
    }

    return takeaways.slice(0, 3);
  }
}
