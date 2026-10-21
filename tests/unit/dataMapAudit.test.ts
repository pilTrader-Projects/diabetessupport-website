import fs from 'fs';
import path from 'path';

describe('Data Privacy Map Compliance Audit (docs/DATA_MAP.md) - P1-01', () => {
  const dataMapPath = path.resolve(process.cwd(), 'docs/DATA_MAP.md');
  const sanityCheckPath = path.resolve(process.cwd(), 'tests/sanity_check.ts');

  it('ensures docs/DATA_MAP.md exists and is substantive', () => {
    expect(fs.existsSync(dataMapPath)).toBe(true);
    const content = fs.readFileSync(dataMapPath, 'utf8');
    expect(content.length).toBeGreaterThan(1000);
  });

  it('contains all mandatory sections from 1 to 8', () => {
    const content = fs.readFileSync(dataMapPath, 'utf8');
    expect(content).toMatch(/## 1\.\s+Executive Summary & Regulatory Framework/i);
    expect(content).toMatch(/## 2\.\s+Data Protection Officer \(DPO\) & Governance/i);
    expect(content).toMatch(/## 3\.\s+Comprehensive Touchpoint Inventory/i);
    expect(content).toMatch(/## 4\.\s+Sensitive Personal Information \(SPI\) & Health Data Classification/i);
    expect(content).toMatch(/## 5\.\s+Third-Party Sub-Processors & Data Flows/i);
    expect(content).toMatch(/## 6\.\s+Data Subject Rights Fulfillment Mechanism/i);
    expect(content).toMatch(/## 7\.\s+Compliance Red Flags & Risk Audit/i);
    expect(content).toMatch(/## 8\.\s+Prioritized Remediation Roadmap/i);
  });

  it('cites statutory Philippine and international privacy authorities', () => {
    const content = fs.readFileSync(dataMapPath, 'utf8');
    expect(content).toContain('Republic Act No. 10173');
    expect(content).toContain('Data Privacy Act of 2012');
    expect(content).toContain('National Privacy Commission');
    expect(content).toContain('Section 3(l)');
    expect(content).toContain('Section 3(g)');
  });

  it('documents all 10 core application touchpoints (TP-01 through TP-10)', () => {
    const content = fs.readFileSync(dataMapPath, 'utf8');
    for (let i = 1; i <= 10; i++) {
      const tpId = `TP-${i.toString().padStart(2, '0')}`;
      expect(content).toContain(tpId);
    }
    // Verify touchpoint specifics
    expect(content).toContain('NewsletterOptInForm');
    expect(content).toContain('LeadCaptureForm');
    expect(content).toContain('KitOptInForm');
    expect(content).toContain('GlycoSense Health Tracker');
    expect(content).toContain('DeviceSync');
    expect(content).toContain('Community Forum');
    expect(content).toContain('bts_admin_session');
    expect(content).toContain('GoogleAnalytics');
    expect(content).toContain('AdSenseScript');
  });

  it('classifies health metrics and symptoms as Sensitive Personal Information (SPI)', () => {
    const content = fs.readFileSync(dataMapPath, 'utf8');
    expect(content).toMatch(/Blood Glucose Readings/i);
    expect(content).toMatch(/Blood Pressure/i);
    expect(content).toMatch(/Metabolic Symptoms/i);
    expect(content).toMatch(/Metabolic Stage/i);
  });

  it('documents all critical third-party sub-processors', () => {
    const content = fs.readFileSync(dataMapPath, 'utf8');
    expect(content).toContain('Vercel, Inc.');
    expect(content).toContain('MongoDB Atlas');
    expect(content).toContain('Brevo (Sendinblue SAS)');
    expect(content).toContain('Google LLC (Analytics)');
    expect(content).toContain('Google LLC (AdSense)');
  });

  it('identifies all 5 active compliance red flags with remediation targets', () => {
    const content = fs.readFileSync(dataMapPath, 'utf8');
    expect(content).toContain('RF-01');
    expect(content).toContain('RF-02');
    expect(content).toContain('RF-03');
    expect(content).toContain('RF-04');
    expect(content).toContain('RF-05');

    // Cross-reference to roadmap milestones
    expect(content).toContain('P1-03');
    expect(content).toContain('P1-04');
    expect(content).toContain('P1-06');
    expect(content).toContain('P1-07');
    expect(content).toContain('P0-GATE');
  });

  it('verifies docs/DATA_MAP.md is registered in tests/sanity_check.ts requiredPaths', () => {
    const sanityCheckContent = fs.readFileSync(sanityCheckPath, 'utf8');
    expect(sanityCheckContent).toContain("'docs/DATA_MAP.md'");
  });
});
