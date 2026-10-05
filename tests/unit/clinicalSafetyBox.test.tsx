import React from 'react';
import ClinicalSafetyBox from '@/components/common/ClinicalSafetyBox';

describe('ClinicalSafetyBox Component', () => {
  it('is a valid React component and renders fasting variant', () => {
    const element = <ClinicalSafetyBox variant="fasting" />;
    expect(element).toBeDefined();
    expect(element.props.variant).toBe('fasting');
  });

  it('renders all variants without error', () => {
    const fasting = <ClinicalSafetyBox variant="fasting" />;
    const medication = <ClinicalSafetyBox variant="medication" />;
    const emergency = <ClinicalSafetyBox variant="emergency" />;
    const general = <ClinicalSafetyBox variant="general" />;
    const all = <ClinicalSafetyBox variant="all" />;

    expect(fasting).toBeDefined();
    expect(medication).toBeDefined();
    expect(emergency).toBeDefined();
    expect(general).toBeDefined();
    expect(all).toBeDefined();
  });
});
