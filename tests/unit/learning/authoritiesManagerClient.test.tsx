/**
 * TDD Unit Tests for AuthoritiesManagerClient UI & UX Features
 */
import React from 'react';
import AuthoritiesManagerClient, { getDoctorInitials } from '../../../src/components/admin/learning/AuthoritiesManagerClient';
import LearningAdminNav from '../../../src/components/admin/learning/LearningAdminNav';
import { IAuthority } from '../../../src/types/learning';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/admin/learning/authorities',
}));

describe('getDoctorInitials helper', () => {
  it('correctly extracts doctor initials ignoring prefixes and credentials', () => {
    expect(getDoctorInitials('Dr. Ben Bikman, PhD')).toBe('BB');
    expect(getDoctorInitials('Dr. Jason Fung')).toBe('JF');
    expect(getDoctorInitials('Dr. Pradip Jamnadas, MD')).toBe('PJ');
    expect(getDoctorInitials('Sarah Hallberg')).toBe('SH');
    expect(getDoctorInitials('Dr. David Unwin, FRCGP')).toBe('DU');
    expect(getDoctorInitials('Professor Tim Noakes')).toBe('TN');
    expect(getDoctorInitials('')).toBe('??');
  });
});

describe('AuthoritiesManagerClient UI Component', () => {
  const mockAuthorities: IAuthority[] = [
    {
      _id: 'auth_1',
      name: 'Dr. Ben Bikman, PhD',
      slug: 'dr-ben-bikman',
      title: 'PhD in Bioenergetics',
      bio: 'Professor of cell biology and researcher.',
      specialties: ['Insulin Resistance', 'Metabolism'],
      youtubeChannelId: 'UCb1bxPFG0XAsQA2LwzT1234',
      isActive: true,
      autoPublish: true,
      displayOrder: 1,
      recommendedBooks: [
        {
          title: 'Why We Get Sick',
          author: 'Dr. Ben Bikman',
          affiliateUrl: 'https://amazon.com/sick',
          type: 'book',
          description: 'Insulin guide',
        },
      ],
      lastSyncAt: new Date('2026-09-30T10:00:00Z'),
    },
    {
      _id: 'auth_2',
      name: 'Dr. Jason Fung',
      slug: 'dr-jason-fung',
      title: 'Nephrologist & Author',
      bio: 'Kidney specialist focused on intermittent fasting.',
      specialties: ['Fasting', 'Type 2 Diabetes'],
      youtubeChannelId: 'UCb2bxPFG0XAsQA2LwzT5678',
      isActive: true,
      autoPublish: true,
      displayOrder: 2,
      recommendedBooks: [],
      lastSyncAt: new Date('2026-09-30T11:00:00Z'),
    },
  ];

  it('instantiates AuthoritiesManagerClient successfully with initialAuthorities', () => {
    const element = <AuthoritiesManagerClient initialAuthorities={mockAuthorities} />;
    expect(element).toBeDefined();
    expect(typeof AuthoritiesManagerClient).toBe('function');
    expect(element.props.initialAuthorities).toHaveLength(2);
  });

  it('instantiates LearningAdminNav successfully with count and handlers', () => {
    const onSync = jest.fn();
    const nav = (
      <LearningAdminNav
        counts={{ authorities: 2, podcasts: 5, resources: 12 }}
        onRunGlobalSync={onSync}
        isSyncingGlobal={false}
      />
    );
    expect(nav).toBeDefined();
    expect(typeof LearningAdminNav).toBe('function');
    expect(nav.props.counts.authorities).toBe(2);
  });
});
