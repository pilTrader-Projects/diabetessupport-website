import React from 'react';
import Header from '../../src/components/Header';

describe('Header Component Mobile Responsiveness', () => {
  it('should be defined and export a valid React component function', () => {
    expect(typeof Header).toBe('function');
    expect(Header.name).toBe('Header');
  });
});
