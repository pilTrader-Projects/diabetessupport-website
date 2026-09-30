import {
  getSavedProtocolIds,
  getSavedProtocolItems,
  saveProtocolResource,
  removeSavedProtocolResource,
  SAVED_PROTOCOL_IDS_KEY,
  SAVED_PROTOCOL_ITEMS_KEY,
  PROTOCOL_UPDATE_EVENT,
} from '../../src/lib/savedProtocolUtils';

describe('savedProtocolUtils (TDD Unit Tests)', () => {
  let storage: Record<string, string> = {};

  beforeAll(() => {
    // Mock global window and localStorage for node test environment
    const localStorageMock = {
      getItem: jest.fn((key: string) => storage[key] || null),
      setItem: jest.fn((key: string, val: string) => {
        storage[key] = val;
      }),
      removeItem: jest.fn((key: string) => {
        delete storage[key];
      }),
      clear: jest.fn(() => {
        storage = {};
      }),
    };

    (global as any).window = {
      dispatchEvent: jest.fn(),
    };
    (global as any).CustomEvent = class CustomEvent {
      type: string;
      detail: any;
      constructor(type: string, params: any) {
        this.type = type;
        this.detail = params?.detail;
      }
    };
    (global as any).localStorage = localStorageMock;
  });

  beforeEach(() => {
    storage = {};
    jest.clearAllMocks();
  });

  const mockResource = {
    _id: 'res-test-1',
    title: 'How Insulin Resistance Fuels Disease',
    slug: 'how-insulin-resistance-fuels-disease',
    type: 'video' as const,
    authorityName: 'Dr. Benjamin Bikman',
    thumbnailUrl: 'https://i.ytimg.com/vi/123/hqdefault.jpg',
  };

  it('returns empty array when nothing is saved', () => {
    expect(getSavedProtocolIds()).toEqual([]);
    expect(getSavedProtocolItems()).toEqual([]);
  });

  it('saves an item and persists ID and item summary into localStorage', () => {
    const result = saveProtocolResource(mockResource);
    expect(result.isSaved).toBe(true);
    expect(result.count).toBe(1);

    expect(getSavedProtocolIds()).toEqual(['res-test-1']);
    const saved = getSavedProtocolItems();
    expect(saved.length).toBe(1);
    expect(saved[0]._id).toBe('res-test-1');
    expect(saved[0].title).toBe(mockResource.title);
  });

  it('toggles an already saved item off when called again', () => {
    saveProtocolResource(mockResource);
    expect(getSavedProtocolIds().length).toBe(1);

    const toggleOffResult = saveProtocolResource(mockResource);
    expect(toggleOffResult.isSaved).toBe(false);
    expect(toggleOffResult.count).toBe(0);
    expect(getSavedProtocolIds()).toEqual([]);
    expect(getSavedProtocolItems()).toEqual([]);
  });

  it('removes an item by ID correctly', () => {
    saveProtocolResource(mockResource);
    const newCount = removeSavedProtocolResource('res-test-1');
    expect(newCount).toBe(0);
    expect(getSavedProtocolIds()).toEqual([]);
  });

  it('dispatches custom event on save and remove', () => {
    const dispatchSpy = jest.spyOn((global as any).window, 'dispatchEvent');
    saveProtocolResource(mockResource);

    expect(dispatchSpy).toHaveBeenCalled();
    const event = dispatchSpy.mock.calls[0][0] as any;
    expect(event.type).toBe(PROTOCOL_UPDATE_EVENT);
    expect(event.detail.action).toBe('saved');
    expect(event.detail.resourceId).toBe('res-test-1');
  });
});
