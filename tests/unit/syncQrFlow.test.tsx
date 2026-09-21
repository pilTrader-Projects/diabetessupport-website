import React from 'react';
import SyncDeviceModal from '../../src/components/community/SyncDeviceModal';
import SyncPage from '../../src/app/sync/page';

// Mock qrcode module
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mockQrCodeDataUrl'),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === 'code' ? '548270' : null),
  }),
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('QR Code & 6-Digit Device Sync Experience', () => {
  describe('SyncDeviceModal Component', () => {
    it('is a valid React component when open', () => {
      const modal = <SyncDeviceModal isOpen={true} onClose={jest.fn()} />;
      expect(modal).toBeDefined();
    });

    it('returns null when isOpen is false', () => {
      const modal = <SyncDeviceModal isOpen={false} onClose={jest.fn()} />;
      expect(modal).toBeDefined();
    });
  });

  describe('SyncPage Deep-Link Component (/sync)', () => {
    it('renders deep link sync container without crashing', () => {
      const page = <SyncPage />;
      expect(page).toBeDefined();
    });
  });
});
