/**
 * TDD Unit & Integration Test Suite for Lead Model and Lead Capture API Handler.
 *
 * @usecase Validates schema structure, input sanitization, database persistence, and API responses for /api/v1/leads.
 * @dependencies LeadModel, POST handler from src/app/api/v1/leads/route.ts.
 */
import { LeadModel } from '../../src/models/Lead';
import { POST } from '../../src/app/api/v1/leads/route';

// Mock dbConnect to prevent actual network DB connections during unit test execution
jest.mock('../../src/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

describe('Lead Capture Funnel - Backend Unit Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('LeadModel Schema Validation', () => {
    it('should validate a complete and valid Lead document', async () => {
      const validLead = new LeadModel({
        email: 'PATIENT@EXAMPLE.COM',
        firstName: 'Juan',
        source: 'insulin_reset_protocol',
        symptomsChecked: ['The Belly Anchor', 'The 3 PM Crash'],
      });

      const err = await validLead.validate().catch((e) => e);
      expect(err).toBeUndefined();
      expect(validLead.email).toBe('patient@example.com');
      expect(validLead.status).toBe('subscribed');
      expect(validLead.source).toBe('insulin_reset_protocol');
      expect(validLead.symptomsChecked).toEqual(['The Belly Anchor', 'The 3 PM Crash']);
    });

    it('should fail validation if email is missing', async () => {
      const invalidLead = new LeadModel({
        firstName: 'Maria',
        source: 'insulin_reset_protocol',
      });

      const err = await invalidLead.validate().catch((e) => e);
      expect(err).toBeDefined();
      expect(err.errors.email).toBeDefined();
    });

    it('should default source to insulin_reset_protocol if not provided', () => {
      const lead = new LeadModel({
        email: 'user@example.com',
      });

      expect(lead.source).toBe('insulin_reset_protocol');
      expect(lead.status).toBe('subscribed');
    });
  });

  describe('POST /api/v1/leads Route Handler', () => {
    it('should return 400 Bad Request if request body is not valid JSON', async () => {
      const req = new Request('http://localhost:3000/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid JSON');
    });

    it('should return 400 Bad Request if email is missing', async () => {
      const req = new Request('http://localhost:3000/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: 'Juan' }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Email address is required');
    });

    it('should return 400 Bad Request if email format is invalid', async () => {
      const req = new Request('http://localhost:3000/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'not-an-email', firstName: 'Juan' }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('valid email address');
    });

    it('should return 200 OK with redirectUrl to /reset-success on valid submission', async () => {
      jest.spyOn(LeadModel, 'findOneAndUpdate').mockResolvedValueOnce({
        _id: 'mock_lead_id',
        email: 'juan.delacruz@example.com',
        firstName: 'Juan',
        source: 'insulin_reset_protocol',
      } as any);

      const req = new Request('http://localhost:3000/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: '  juan.delacruz@example.com  ',
          firstName: 'Juan',
          symptomsChecked: ['The Belly Anchor'],
        }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.redirectUrl).toBe('/reset-success');
    });

    it('should qualify METABOLIC_STAGE, persist to DB, and sync to Brevo without direct email sending', async () => {
      const syncSpy = jest.spyOn(require('../../src/services/brevoService').BrevoService, 'syncContact')
        .mockResolvedValueOnce({ success: true, contactId: 101 });

      const findOneAndUpdateSpy = jest.spyOn(LeadModel, 'findOneAndUpdate').mockResolvedValueOnce({
        _id: 'mock_lead_id',
        email: 'patient@example.com',
      } as any);

      const req = new Request('http://localhost:3000/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'patient@example.com',
          firstName: 'Maria',
          symptomsChecked: ['The Belly Anchor', 'The 3 PM Crash', 'Brain Fog'],
          source: 'insulin_reset_protocol',
        }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
        { email: 'patient@example.com' },
        expect.objectContaining({
          $set: expect.objectContaining({
            metabolicStage: 'HIGH_RISK_HYPERINSULINEMIA',
          }),
        }),
        expect.any(Object)
      );
      expect(syncSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'patient@example.com',
          firstName: 'Maria',
          source: 'insulin_reset_protocol',
          symptomsChecked: ['The Belly Anchor', 'The 3 PM Crash', 'Brain Fog'],
          metabolicStage: 'HIGH_RISK_HYPERINSULINEMIA',
        })
      );
    });

    it('should route tag: "newsletter" to subscribed_contacts with GENERAL_AWARENESS stage', async () => {
      const syncSpy = jest.spyOn(require('../../src/services/brevoService').BrevoService, 'syncContact')
        .mockResolvedValueOnce({ success: true, contactId: 102 });

      jest.spyOn(LeadModel, 'findOneAndUpdate').mockResolvedValueOnce({
        _id: 'mock_lead_id',
        email: 'news@example.com',
      } as any);

      const req = new Request('http://localhost:3000/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'news@example.com',
          firstName: 'NewsReader',
          tag: 'newsletter',
        }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(syncSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'news@example.com',
          firstName: 'NewsReader',
          source: 'newsletter',
          metabolicStage: 'GENERAL_AWARENESS',
          listIds: ['subscribed_contacts'],
        })
      );
    });
  });
});
