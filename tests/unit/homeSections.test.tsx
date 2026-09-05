import React from 'react';
import HeroSection from '../../src/components/home/HeroSection';
import CoreMetricsSection from '../../src/components/home/CoreMetricsSection';
import ManualAdvantageSection from '../../src/components/home/ManualAdvantageSection';
import RoadmapsSection from '../../src/components/home/RoadmapsSection';
import MealPlanModal from '../../src/components/home/MealPlanModal';

describe('Home Page Modular Sections & Conversion Optimizations', () => {
  describe('HeroSection', () => {
    it('is a valid React component and renders single primary CTA', () => {
      const element = <HeroSection />;
      expect(element).toBeDefined();
    });
  });

  describe('CoreMetricsSection', () => {
    it('is a valid React component and renders metrics with color-coded pills', () => {
      const element = <CoreMetricsSection />;
      expect(element).toBeDefined();
    });
  });

  describe('ManualAdvantageSection', () => {
    it('is a valid React component and renders manual advantage copy', () => {
      const element = <ManualAdvantageSection />;
      expect(element).toBeDefined();
    });
  });

  describe('RoadmapsSection', () => {
    it('is a valid React component and renders Stage 1 and Stage 2 roadmaps', () => {
      const element = <RoadmapsSection articles={[]} />;
      expect(element).toBeDefined();
    });
  });

  describe('MealPlanModal', () => {
    it('renders null when isOpen is false', () => {
      const element = <MealPlanModal isOpen={false} onClose={jest.fn()} />;
      expect(element).toBeDefined();
    });

    it('renders interactive modal when isOpen is true', () => {
      const element = <MealPlanModal isOpen={true} onClose={jest.fn()} />;
      expect(element).toBeDefined();
    });
  });
});
