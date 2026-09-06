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
