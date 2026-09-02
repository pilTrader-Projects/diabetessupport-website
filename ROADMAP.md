# Project Roadmap: Diabetes Support Website & Platform

## Overview
Migration of `diabetescareph.wordpress.com` to a modern custom Next.js + MongoDB platform supporting automated API publishing, Kit marketing integration, Google AdSense monetization, and PWA product promotion.

---

## 🎯 Milestones & Issues

### Milestone 1: Project Setup & Architecture
- [x] **[Issue #1](https://github.com/pilTrader-Projects/diabetessupport-website/issues/1)** `[COMPLETED]`: Initialize Next.js (App Router), TypeScript, and Design System foundation.
- [ ] **[Issue #2](https://github.com/pilTrader-Projects/diabetessupport-website/issues/2)**: Implement MongoDB database client & post schema models.

### Milestone 2: WordPress Legacy Data Migration
- [ ] **[Issue #3](https://github.com/pilTrader-Projects/diabetessupport-website/issues/3)**: Build migration tool to import posts from `diabetescareph.wordpress.com`.

### Milestone 3: Automated Content Publishing API
- [ ] **[Issue #4](https://github.com/pilTrader-Projects/diabetessupport-website/issues/4)**: Implement secure `POST /api/v1/posts` endpoint with API Key authentication.

### Milestone 4: Blog Engine & SEO Optimization
- [ ] **[Issue #5](https://github.com/pilTrader-Projects/diabetessupport-website/issues/5)**: Create Blog feed, post view, category navigation, dynamic SEO metadata, and sitemap.

### Milestone 5: Marketing & Lead Capture (Kit)
- [ ] **[Issue #6](https://github.com/pilTrader-Projects/diabetessupport-website/issues/6)**: Integrate Kit (ConvertKit) opt-in forms & landing page sub-routes.

### Milestone 6: Ad Monetization
- [ ] **[Issue #7](https://github.com/pilTrader-Projects/diabetessupport-website/issues/7)**: Implement Google AdSense slots, fallback UI, and dynamic `/ads.txt`.

### Milestone 7: PWA Apps Promotion Engine
- [ ] **[Issue #8](https://github.com/pilTrader-Projects/diabetessupport-website/issues/8)**: Implement high-converting PWA promotional banners, sticky CTAs, and app feature cards.

---

## 🛡️ Engineering Standards & Workflow
- **Test-Driven Development (TDD)**: Unit & Integration tests created before or alongside code.
- **Sanity Checks**: Mandatory execution of `npm run sanity` before merging PRs.
- **Surgical Git Workflow**: Feature branch (`<issue>-<slug>`) -> PR -> Code Review -> Merge to `main`.
