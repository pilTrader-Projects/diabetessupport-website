import React from 'react';
import ReactDOMServer from 'react-dom/server';
import CoreMetricsSection from '@/components/home/CoreMetricsSection';
import CurationDetails from '@/components/learning/CurationDetails';
import VideoPlayerModal from '@/components/learning/VideoPlayerModal';
import { ILearningResource } from '@/types/learning';
import fs from 'fs';
import path from 'path';

describe('Claims, Content & Endorsement Audit (P0-03)', () => {
  describe('Static Page File Audits (Forbidden Claims)', () => {
    it('ensures src/app/page.tsx does not contain misleading commercial or advertising claims', () => {
      const homePageContent = fs.readFileSync(
        path.join(process.cwd(), 'src/app/page.tsx'),
        'utf-8'
      );

      // Must not claim "zero ads"
      expect(homePageContent).not.toMatch(/zero ads/i);

      // Must not claim "zero-commercial barrier"
      expect(homePageContent).not.toMatch(/zero-commercial barrier/i);

      // Must not claim "non-promotional educational movement"
      expect(homePageContent).not.toMatch(/non-promotional educational movement/i);
    });

    it('ensures src/app/ph/page.tsx does not claim zero commercial barrier', () => {
      const phPageContent = fs.readFileSync(
        path.join(process.cwd(), 'src/app/ph/page.tsx'),
        'utf-8'
      );

      expect(phPageContent).not.toMatch(/zero commercial barrier/i);
    });
  });

  describe('CoreMetricsSection SaMD & Regulatory Note', () => {
    it('frames GlycoSense strictly as personal logging without claiming advanced AI features', () => {
      const html = ReactDOMServer.renderToString(<CoreMetricsSection />);

      // Must frame as personal logging
      expect(html).toContain('GlycoSense personal logging features provide descriptive statistical data trends');

      // Must not claim AI features in the operational note
      expect(html).not.toContain('GlycoSense AI features');
    });
  });

  describe('YouTube Media Attribution & Non-Endorsement Disclaimers', () => {
    const mockResource: ILearningResource = {
      _id: 'res-123',
      title: 'Understanding Insulin Dynamics',
      slug: 'understanding-insulin-dynamics',
      summary: 'Executive scientific summary of metabolic regulation.',
      sourceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      authorityName: 'Dr. Benjamin Bikman',
      authorityTitle: 'Metabolic Scientist & Author',
      platform: 'youtube',
      status: 'published',
      type: 'video',
      duration: '45 mins',
      publishedAt: new Date('2026-01-01T00:00:00.000Z'),
      keyTakeaways: ['Insulin drives fat storage.'],
      citations: ['Bikman B. Why We Get Sick. 2020.'],
      topics: ['insulin', 'metabolism'],
    };

    it('renders YouTube speaker attribution and non-affiliation statement in CurationDetails', () => {
      const html = ReactDOMServer.renderToString(<CurationDetails resource={mockResource} />);

      expect(html).toContain('Video by Dr. Benjamin Bikman on YouTube');
      expect(html).toContain('not affiliated with, sponsored by, or endorsed by');
    });

    it('renders YouTube speaker attribution and non-affiliation statement in VideoPlayerModal', () => {
      const html = ReactDOMServer.renderToString(
        <VideoPlayerModal
          isOpen={true}
          onClose={() => {}}
          resource={mockResource}
        />
      );

      expect(html).toContain('Video by');
      expect(html).toContain('Dr. Benjamin Bikman');
      expect(html).toContain('on YouTube');
      expect(html).toContain('not affiliated with or endorsed by');
    });
  });
});
