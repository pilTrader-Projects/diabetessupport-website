# GlycoSense: Intended Use Statement & Regulatory Position Dossier

**Document ID**: `REG-DTH-001`  
**Applicable Jurisdictions**: Philippines (FDA Circular No. 2021-020), United States (US FDA 21 U.S.C. 360j(o)), International (IMDRF SaMD Standards)  
**Effective Date**: September 2026  
**Classification Target**: Non-Device General Wellness & Personal Health Record (PHR) Software  

---

## 1. Intended Use & Target Population

### 1.1 Intended User
* Adult individuals (18+ years) seeking an accessible, cost-effective digital diary to manually log and track biometric numbers (e.g. self-monitored blood glucose, blood pressure, weight, and self-reported meal records).
* Family providers, carers, and breadwinners tracking health metrics for personal wellness management and informed clinical discussions with their licensed healthcare providers.

### 1.2 Purpose & Scope
* **Primary Objective**: Serve as a patient-facing digital logbook and descriptive visualization tool for self-monitored metabolic indicators.
* **Secondary Objective**: Provide educational health literacy materials, low-glycemic dietary meal suggestions, and organized PDF export capabilities to facilitate productive consultations with licensed physicians.

---

## 2. Explicit Clinical & Technical Exclusions

To maintain strict compliance with non-medical device status and avoid Software as a Medical Device (SaMD) or Clinical Decision Support (CDS) device classification, GlycoSense **explicitly does NOT**:

1. **No Automated Medical Diagnosis**: The software does not diagnose diabetes, prediabetes, metabolic syndrome, diabetic nephropathy, retinopathy, or any organ disease.
2. **No Clinical Glomerular Filtration Rate (eGFR) Calculations**: The app does not generate clinical renal diagnostic scores or declare clinical kidney failure stages.
3. **No Drug Interaction Monitoring or Dosage Prescriptions**: The medication log is purely text-based personal record-keeping. The algorithm does not calculate insulin bolus/basal requirements, adjust pharmaceutical regimens, or trigger medication alerts.
4. **No Continuous Real-Time Diagnostic Telemetry**: The system relies strictly on asynchronous, user-initiated manual entry and does not interface directly with active surgical implants or medical hardware sensors.
5. **No Medical Triage or Emergency Intervention**: The platform does not provide acute hypoglycemic or ketoacidosis emergency dispatch services.

---

## 3. Artificial Intelligence & Trend Analysis Boundaries

* **Algorithm Function**: The platform's AI models operate solely at a **descriptive and educational level**. They summarize user-logged meal descriptions alongside user-entered post-meal glucose numbers to generate user-friendly retrospective correlation charts.
* **Data Transparency**: All generated charts and insights represent retrospective correlations of user-supplied values and are explicitly labeled as informational wellness insights for physician review.

---

## 4. Data Privacy, Encryption & Consent Architecture

* **Jurisdiction**: Philippine Data Privacy Act of 2012 (RA 10173) and HIPAA security benchmarks.
* **Sensitive Personal Information (SPI)**: Self-reported blood glucose readings, blood pressure, and optional lab notes are encrypted in transit (TLS 1.3) and encrypted at rest.
* **User Control**: Users retain the absolute right to export, redact, or permanently delete their historical logging data at any time.

---

## 5. Regulatory Compliance Affirmation

GlycoSense is designed, deployed, and maintained exclusively as an independent health education and personal health logging platform. Any display of clinical metric targets (e.g. ADA-aligned thresholds for HbA1c, Fasting Glucose, and Postprandial Glucose) serves purely as general health literacy reference for user education.
