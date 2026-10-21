import fs from 'fs';
import path from 'path';

// Load .env variables if present BEFORE module imports
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match && match[1] && !process.env[match[1]]) {
      process.env[match[1]] = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
    }
  });
}

import { dbConnect } from '../src/lib/dbConnect';
import { AuthorityModel } from '../src/models/Authority';
import { LearningResourceModel } from '../src/models/LearningResource';

export interface AffiliateLinkItem {
  url: string;
  source: string;
  title?: string;
  merchant?: string;
}

export type LinkHealthStatus = 'healthy' | 'broken' | 'warning' | 'error';

export interface LinkCheckResult {
  url: string;
  source: string;
  title?: string;
  status: LinkHealthStatus;
  httpStatus?: number;
  finalUrl?: string;
  message?: string;
}

export interface AffiliateLinkCheckReport {
  total: number;
  healthy: number;
  broken: number;
  warnings: number;
  results: LinkCheckResult[];
}

export interface CheckAffiliateLinksOptions {
  urls?: AffiliateLinkItem[];
  checkDatabase?: boolean;
  timeoutMs?: number;
  fetchFn?: typeof fetch;
}

/**
 * Harvests all known affiliate recommendation URLs from the MongoDB database.
 */
export async function harvestDatabaseAffiliateLinks(): Promise<AffiliateLinkItem[]> {
  const harvested: AffiliateLinkItem[] = [];

  try {
    await dbConnect();

    // 1. Harvest from Authorities
    const authorities = await AuthorityModel.find({}).lean();
    for (const auth of authorities) {
      const books = (auth as any).recommendedBooks || [];
      for (const book of books) {
        if (book.affiliateUrl && typeof book.affiliateUrl === 'string') {
          harvested.push({
            url: book.affiliateUrl.trim(),
            source: `Authority: ${auth.name}`,
            title: book.title,
            merchant: book.platformName || 'Amazon',
          });
        }
      }
    }

    // 2. Harvest from Learning Resources
    const resources = await LearningResourceModel.find({
      'recommendedBooks.0': { $exists: true },
    }).lean();
    for (const res of resources) {
      const books = (res as any).recommendedBooks || [];
      for (const book of books) {
        if (book.affiliateUrl && typeof book.affiliateUrl === 'string') {
          harvested.push({
            url: book.affiliateUrl.trim(),
            source: `Resource: ${res.title}`,
            title: book.title,
            merchant: book.platformName || 'Amazon',
          });
        }
      }
    }
  } catch (error) {
    console.warn('[Check Affiliate Links] Database connection warning:', (error as Error).message);
  }

  return harvested;
}

/**
 * Checks a single affiliate link via HTTP GET / HEAD with anti-bot prevention headers.
 */
export async function checkSingleAffiliateLink(
  item: AffiliateLinkItem,
  options: { timeoutMs?: number; fetchFn?: typeof fetch } = {}
): Promise<LinkCheckResult> {
  const { timeoutMs = 8000, fetchFn = fetch } = options;
  const rawUrl = item.url.trim();

  // Basic URL syntax validation
  if (!/^https?:\/\//i.test(rawUrl)) {
    return {
      url: rawUrl,
      source: item.source,
      title: item.title,
      status: 'broken',
      message: 'Invalid URL scheme. Must begin with http:// or https://',
    };
  }

  let parsedOrigin: string;
  try {
    parsedOrigin = new URL(rawUrl).hostname;
  } catch {
    return {
      url: rawUrl,
      source: item.source,
      title: item.title,
      status: 'broken',
      message: 'Malformed URL could not be parsed.',
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchFn(rawUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const httpStatus = response.status;
    const finalUrl = response.url || rawUrl;

    // Check for 4xx broken states (e.g., 404 Not Found, 410 Gone)
    if (httpStatus === 404 || httpStatus === 410) {
      return {
        url: rawUrl,
        source: item.source,
        title: item.title,
        status: 'broken',
        httpStatus,
        finalUrl,
        message: `HTTP ${httpStatus}: Listing not found or expired.`,
      };
    }

    // Amazon anti-bot challenge note: 503 from Amazon is often CAPTCHA bot mitigation
    if (httpStatus === 503 && (parsedOrigin.includes('amazon') || parsedOrigin.includes('amzn'))) {
      return {
        url: rawUrl,
        source: item.source,
        title: item.title,
        status: 'warning',
        httpStatus,
        finalUrl,
        message: 'HTTP 503: Amazon automated bot mitigation challenge encountered.',
      };
    }

    if (httpStatus >= 400) {
      return {
        url: rawUrl,
        source: item.source,
        title: item.title,
        status: 'error',
        httpStatus,
        finalUrl,
        message: `HTTP ${httpStatus}: Server responded with error status.`,
      };
    }

    // Check for unexpected host redirection
    let finalHost = '';
    try {
      finalHost = new URL(finalUrl).hostname;
    } catch {
      finalHost = '';
    }

    // Warn if link redirected to an unrelated domain
    if (finalHost && !finalHost.includes(parsedOrigin.replace(/^www\./, '')) && !parsedOrigin.includes('amzn.to')) {
      return {
        url: rawUrl,
        source: item.source,
        title: item.title,
        status: 'warning',
        httpStatus,
        finalUrl,
        message: `Redirected to external host: ${finalHost}`,
      };
    }

    return {
      url: rawUrl,
      source: item.source,
      title: item.title,
      status: 'healthy',
      httpStatus,
      finalUrl,
      message: 'OK (200-399)',
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    const isAbort = error.name === 'AbortError';
    return {
      url: rawUrl,
      source: item.source,
      title: item.title,
      status: 'broken',
      message: isAbort ? `Request timed out after ${timeoutMs}ms.` : `Network connection error: ${error.message}`,
    };
  }
}

/**
 * Main routine: Collects, deduplicates, and checks all affiliate URLs.
 */
export async function checkAffiliateLinks(
  options: CheckAffiliateLinksOptions = {}
): Promise<AffiliateLinkCheckReport> {
  const { urls: providedUrls, checkDatabase = true, timeoutMs = 8000, fetchFn = fetch } = options;

  let allItems: AffiliateLinkItem[] = [];

  if (providedUrls && providedUrls.length > 0) {
    allItems = [...providedUrls];
  } else if (checkDatabase) {
    allItems = await harvestDatabaseAffiliateLinks();
  }

  // Deduplicate by URL
  const uniqueMap = new Map<string, AffiliateLinkItem>();
  for (const item of allItems) {
    if (!uniqueMap.has(item.url)) {
      uniqueMap.set(item.url, item);
    }
  }

  const uniqueItems = Array.from(uniqueMap.values());
  const results: LinkCheckResult[] = [];

  console.log(`\n🔍 [Affiliate Link Health Check] Scanning ${uniqueItems.length} unique affiliate URL(s)...`);

  for (const item of uniqueItems) {
    const result = await checkSingleAffiliateLink(item, { timeoutMs, fetchFn });
    results.push(result);

    const icon =
      result.status === 'healthy'
        ? '✅'
        : result.status === 'warning'
        ? '⚠️'
        : '❌';

    console.log(
      `  ${icon} [${result.status.toUpperCase()}] ${item.title || item.url} (${item.source}) -> ${result.message}`
    );
  }

  const healthy = results.filter((r) => r.status === 'healthy').length;
  const broken = results.filter((r) => r.status === 'broken' || r.status === 'error').length;
  const warnings = results.filter((r) => r.status === 'warning').length;

  console.log('\n📊 [Summary Report]');
  console.log(`  Total Links: ${results.length}`);
  console.log(`  Healthy:     ${healthy}`);
  console.log(`  Warnings:    ${warnings}`);
  console.log(`  Broken:      ${broken}\n`);

  return {
    total: results.length,
    healthy,
    broken,
    warnings,
    results,
  };
}

if (require.main === module) {
  checkAffiliateLinks()
    .then((report) => {
      if (report.broken > 0) {
        console.warn(`[Affiliate Health Check] Found ${report.broken} broken affiliate link(s).`);
        process.exit(1);
      } else {
        console.log('[Affiliate Health Check] All affiliate links verified healthy.');
        process.exit(0);
      }
    })
    .catch((err) => {
      console.error('[Affiliate Health Check] Execution failed:', err);
      process.exit(1);
    });
}
