import { SITE_CONFIG } from '@/config/constants';
import { IPost } from '@/types/blog';

/**
 * Builds MedicalOrganization JSON-LD Schema for DiabetesCare PH.
 *
 * @usecase Declares structured organization metadata, medical topics, and social verification for search engines.
 * @dependencies SITE_CONFIG constant.
 * @returns {Record<string, any>} Schema.org compliant MedicalOrganization JSON-LD object.
 */
export function buildOrganizationSchema(): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: 'DiabetesCare PH',
    url: `https://${SITE_CONFIG.domain}`,
    logo: `https://${SITE_CONFIG.domain}/images/logo.png`,
    description: SITE_CONFIG.description,
    sameAs: [SITE_CONFIG.social.facebook, SITE_CONFIG.social.twitter],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support & Educational Inquiries',
      url: `https://${SITE_CONFIG.domain}/contact`,
    },
    knowsAbout: [
      'Type 2 Diabetes Mellitus',
      'Prediabetes and Insulin Resistance',
      'Blood Glucose Self-Monitoring',
      'Glycemic Index and Diet Management',
      'HbA1c Blood Testing',
    ],
  };
}

/**
 * Builds WebSite JSON-LD Schema with SearchAction for Sitelinks Searchbox.
 */
export function buildWebSiteSchema(): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DiabetesCare PH',
    url: `https://${SITE_CONFIG.domain}`,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `https://${SITE_CONFIG.domain}/blog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Builds combined BlogPosting and MedicalWebPage JSON-LD Schema for individual articles.
 *
 * @usecase Enhances article indexing with author credentials, medical entity categorization, and image attributes.
 * @param {IPost} post Blog post entity from database.
 * @param {string} slug Unique URL slug of the post.
 * @dependencies SITE_CONFIG constant.
 * @returns {Record<string, any>} Schema.org compliant Article JSON-LD object.
 */
export function buildArticleSchema(post: IPost, slug: string): Record<string, any> {
  const pageUrl = `https://${SITE_CONFIG.domain}/blog/${slug}`;
  const publishDate = post.publishedAt
    ? new Date(post.publishedAt).toISOString()
    : new Date().toISOString();
  const updateDate = post.updatedAt
    ? new Date(post.updatedAt).toISOString()
    : publishDate;

  return {
    '@context': 'https://schema.org',
    '@type': ['BlogPosting', 'MedicalWebPage'],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    headline: post.title,
    description: post.excerpt || post.metaDescription || SITE_CONFIG.description,
    image: post.featuredImage || `https://${SITE_CONFIG.domain}/images/default-og.jpg`,
    datePublished: publishDate,
    dateModified: updateDate,
    author: {
      '@type': 'Organization',
      name: SITE_CONFIG.author,
      url: `https://${SITE_CONFIG.domain}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'DiabetesCare PH',
      logo: {
        '@type': 'ImageObject',
        url: `https://${SITE_CONFIG.domain}/images/logo.png`,
      },
    },
    about: {
      '@type': 'MedicalCondition',
      name: 'Type 2 Diabetes',
      possibleTreatment: [
        {
          '@type': 'LifestyleModification',
          name: 'Low-GI Diet, Daily Walking, Routine Blood Sugar Logging',
        },
      ],
    },
    aspect: 'Overview, Prevention, Self-Monitoring, Dietary Management',
  };
}

/**
 * Builds BreadcrumbList JSON-LD Schema for hierarchical navigation.
 *
 * @usecase Outputs structured breadcrumb paths for Google SERP rich snippet display.
 * @param {Array<{ name: string; url: string }>} items Ordered breadcrumb entries.
 * @returns {Record<string, any>} Schema.org compliant BreadcrumbList JSON-LD object.
 */
export function buildBreadcrumbSchema(
  items: { name: string; url: string }[]
): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Builds SoftwareApplication JSON-LD Schema for the GlycoSense PWA tool.
 *
 * @usecase Informs search crawlers of the free progressive web app product offering.
 * @returns {Record<string, any>} Schema.org compliant SoftwareApplication JSON-LD object.
 */
export function buildSoftwareAppSchema(): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'GlycoSense',
    operatingSystem: 'Web, Progressive Web App (PWA), iOS, Android',
    applicationCategory: 'HealthApplication',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'PHP',
    },
    featureList: [
      'Cost-efficient manual finger-prick glucose tracking',
      'Blood pressure & urinalysis logging',
      'Doctor-ready printable PDF health summaries',
      'Zero continuous monitor lock-in',
    ],
  };
}

/**
 * Builds DiscussionForumPosting JSON-LD Schema for community thread pages.
 *
 * @usecase Powers Google's Discussion Forum rich snippets with question and comment structure.
 * @param {IThread} thread Discussion thread entity.
 * @param {IReply[]} replies List of community replies.
 * @returns {Record<string, any>} Schema.org compliant DiscussionForumPosting JSON-LD object.
 */
export function buildDiscussionForumPostingSchema(
  thread: { title: string; slug: string; content: string; authorAlias: string; authorTag: string; createdAt?: Date },
  replies: Array<{ content: string; authorAlias: string; authorTag: string; createdAt?: Date }>
): Record<string, any> {
  const threadUrl = `https://${SITE_CONFIG.domain}/community/${thread.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    '@id': threadUrl,
    headline: thread.title,
    articleBody: thread.content,
    datePublished: thread.createdAt ? new Date(thread.createdAt).toISOString() : new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: `${thread.authorAlias} (${thread.authorTag})`,
    },
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/CommentAction',
      userInteractionCount: replies.length,
    },
    comment: replies.map((r) => ({
      '@type': 'Comment',
      text: r.content,
      dateCreated: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      author: {
        '@type': 'Person',
        name: `${r.authorAlias} (${r.authorTag})`,
      },
    })),
  };
}

/**
 * Builds MedicalWebPage and ItemPage JSON-LD Schema for the Insulin Reset / Hidden Clock Funnel.
 *
 * @usecase Exposes rich clinical context around Dr. Benjamin Bikman's hyperinsulinemia research and the free 3-page downloadable cheat sheet.
 * @dependencies SITE_CONFIG constant.
 * @returns {Record<string, any>} Schema.org compliant MedicalWebPage JSON-LD object.
 */
export function buildInsulinResetSchema(): Record<string, any> {
  const pageUrl = `https://${SITE_CONFIG.domain}/insulin-reset`;
  return {
    '@context': 'https://schema.org',
    '@type': ['WebPage', 'MedicalWebPage'],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    headline: 'Your "Normal" Blood Sugar Test is a Lie: The Insulin Reset Protocol',
    description:
      'Your body can hide a crumbling metabolism for 10 to 15 years by forcing your pancreas to work overtime. Discover Dr. Bikman metabolic research and download the free 3-page cheat sheet.',
    url: pageUrl,
    about: [
      {
        '@type': 'MedicalCondition',
        name: 'Hyperinsulinemia and Insulin Resistance',
        code: {
          '@type': 'MedicalCode',
          code: 'E11.9',
          codingSystem: 'ICD-10',
        },
      },
    ],
    hasPart: {
      '@type': 'DigitalDocument',
      name: 'The 3-Page Hidden Clock Cheat Sheet',
      encodingFormat: 'application/pdf',
      isAccessibleForFree: true,
      description: 'The Glucose Illusion, The Organ Wrecking Ball, and The 4 Golden Rules to reset insulin sensitivity naturally.',
    },
    publisher: {
      '@type': 'MedicalOrganization',
      name: 'DiabetesCare PH',
      url: `https://${SITE_CONFIG.domain}`,
      logo: `https://${SITE_CONFIG.domain}/images/logo.png`,
    },
  };
}

/**
 * Builds MedicalOrganization JSON-LD Schema strictly aligning with institutional entity crawler grounding.
 *
 * @usecase Grounds DiabetesCare PH entity definition with address, mission, and institutional details for GEO/AEO crawler engines.
 * @dependencies SITE_CONFIG constant.
 * @returns {Record<string, any>} Schema.org compliant MedicalOrganization JSON-LD object.
 */
export function buildHomeMedicalOrgSchema(): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: 'DiabetesCare PH',
    url: `https://${SITE_CONFIG.domain}`,
    logo: `https://${SITE_CONFIG.domain}/images/logo.png`,
    description:
      'An advocacy community providing complimentary lifestyle tools and predictive metabolic frameworks to counter chronic disease vectors within the Philippines.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'PH',
    },
  };
}

/**
 * Builds FAQPage JSON-LD Schema for GEO/AEO conversational search answering.
 *
 * @usecase Optimizes the community root page for high-frequency voice search and LLM Answer Engine queries.
 * @returns {Record<string, any>} Schema.org compliant FAQPage JSON-LD object.
 */
export function buildCommunityHomeFaqSchema(): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How can I naturally reverse metabolic decline at home in the Philippines?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Reversing metabolic decline involves prioritizing clean ancestral proteins, eliminating hidden sugars in processed local products, utilizing time-restricted feeding windows, and accurately logging post-meal trends to identify systemic carbohydrate triggers.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why is standard fasting blood sugar not enough to detect early insulin resistance?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Standard fasting glucose tests only elevate after the pancreas has spent 10 to 15 years overproducing insulin to compensate for resistance. Hyperinsulinemia and visceral adiposity appear more than a decade before fasting blood sugar crosses the prediabetes threshold.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is GlycoSense free and compliant with Philippine privacy laws?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, GlycoSense is a zero-cost digital health dashboard designed for Filipino family providers, operating in strict compliance with the Philippine Data Privacy Act of 2012 (RA 10173).',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the common early symptoms of hyperinsulinemia in Filipino adults?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Common early warnings include stubborn midsection visceral fat (The Belly Anchor), severe post-lunch fatigue (The 3 PM Crash), neck skin tags or acanthosis nigricans (Skin Alarms), and frequent nocturnal urination (The 3 AM Wake-up).',
        },
      },
    ],
  };
}


