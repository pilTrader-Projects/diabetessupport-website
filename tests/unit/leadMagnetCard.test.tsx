import React from 'react';
import LeadMagnetCard from '../../src/components/LeadMagnetCard';
import NewsletterOptInForm from '../../src/components/NewsletterOptInForm';
import KitOptInForm from '../../src/components/KitOptInForm';

describe('LeadMagnetCard and NewsletterOptInForm Native Lead Capture Components', () => {
  describe('LeadMagnetCard Component', () => {
    it('is a valid React component and instantiates with default props', () => {
      const element = <LeadMagnetCard />;
      expect(element).toBeDefined();
      expect(typeof LeadMagnetCard).toBe('function');
    });

    it('instantiates correctly with custom title, subtitle, and source', () => {
      const element = (
        <LeadMagnetCard
          title="Custom Protective Tracking"
          subtitle="Custom subtitle description"
          source="companion_app_users"
        />
      );
      expect(element).toBeDefined();
      expect(element.props.title).toBe('Custom Protective Tracking');
      expect(element.props.source).toBe('companion_app_users');
    });
  });

  describe('NewsletterOptInForm Component', () => {
    it('is a valid React component and instantiates with card layout', () => {
      const element = <NewsletterOptInForm layout="card" source="newsletter" />;
      expect(element).toBeDefined();
      expect(typeof NewsletterOptInForm).toBe('function');
    });

    it('instantiates with inline layout', () => {
      const element = <NewsletterOptInForm layout="inline" source="article_test" />;
      expect(element).toBeDefined();
      expect(element.props.layout).toBe('inline');
    });
  });

  describe('KitOptInForm Backward Compatibility Re-export', () => {
    it('re-exports NewsletterOptInForm cleanly', () => {
      expect(KitOptInForm).toBe(NewsletterOptInForm);
      const element = <KitOptInForm />;
      expect(element).toBeDefined();
    });
  });
});
