export interface PwaAppConfig {
  id: string;
  name: string;
  url: string;
  tagline: string;
  description: string;
  icon: string;
}

export const SITE_CONFIG = {
  title: 'DiabetesCare PH - Health, Monitoring & Companion Platform',
  description:
    'Comprehensive diabetes support, glucose reading tracker, meal logging, AI companion, and health insights for the Philippines community.',
  domain: 'diabetescareph.com',
  wordpressApiUrl:
    'https://public-api.wordpress.com/wp/v2/sites/diabetescareph.wordpress.com',
  author: 'DiabetesCare PH Team',
  social: {
    facebook: 'https://facebook.com/diabetescareph',
    twitter: 'https://twitter.com/diabetescareph',
  },
};

export const PWA_APPS: PwaAppConfig[] = [
  {
    id: 'glucose-logger',
    name: 'Blood Glucose Reading Tracker',
    url: 'https://base44.app/glucose-tracker',
    tagline: 'Track your daily fasting and post-meal blood sugar levels effortlessly.',
    description:
      'Log glucose readings, generate trends, and share report summaries directly with your physician.',
    icon: '🩸',
  },
  {
    id: 'meal-logger',
    name: 'Diabetic Meal & Carb Logger',
    url: 'https://base44.app/meal-logger',
    tagline: 'Log meals and estimate glycemic load in seconds.',
    description:
      'Calculate carbohydrate counts, track dietary fiber, and discover diabetes-friendly recipes.',
    icon: '🥗',
  },
  {
    id: 'ai-health-companion',
    name: 'AI Health Companion',
    url: 'https://base44.app/ai-companion',
    tagline: '24/7 AI-powered assistance for your diabetes management questions.',
    description:
      'Get personalized guidance on meal plans, lifestyle habits, and glucose trend analysis.',
    icon: '🤖',
  },
];

export const ADSENSE_CONFIG = {
  publisherId: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'ca-pub-0000000000000000',
  enabled: process.env.NEXT_PUBLIC_ENABLE_ADS !== 'false',
};

export const KIT_MARKETING_CONFIG = {
  formId: process.env.NEXT_PUBLIC_KIT_FORM_ID || '',
  scriptUrl: process.env.NEXT_PUBLIC_KIT_SCRIPT_URL || '',
};
