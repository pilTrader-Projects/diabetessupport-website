/**
 * 5-Step Learning Roadmap Configuration for Before the Numbers.
 *
 * @usecase Defines the guided self-recovery curriculum displayed on /learn and shareable step routes.
 * References existing published MongoDB learning resource slugs without modifying the underlying model.
 */

export interface RoadmapStep {
  id: string;
  order: number;
  title: string;
  goal: string;
  resourceSlugs: string[];
  safetyNote?: string;
  editionNotes?: Record<'global' | 'ph', Record<string, string>>;
}

export const ROADMAP_STEPS: RoadmapStep[] = [
  {
    id: 'understand',
    order: 1,
    title: 'Understand',
    goal: 'What insulin does and why cells become resistant behind normal blood sugar readings.',
    resourceSlugs: [
      'what-is-insulin-c4ruxp',
      'what-is-insulin-resistance-jason-fung-r0d5lj',
    ],
    editionNotes: {
      global: {
        'what-is-insulin-c4ruxp':
          'Foundational physiology lecture on insulin as the body’s master storage hormone.',
        'what-is-insulin-resistance-jason-fung-r0d5lj':
          'How constant high circulating insulin directly leads to receptor downregulation.',
      },
      ph: {
        'what-is-insulin-c4ruxp':
          'Mahalagang panimula: paano nagtatrabaho ang insulin sa katawan bago tumaas ang asukal.',
        'what-is-insulin-resistance-jason-fung-r0d5lj':
          'Paliwanag ni Dr. Fung kung bakit napapagod ang cells sa sobrang dalas na pagkain.',
      },
    },
  },
  {
    id: 'spot-signs',
    order: 2,
    title: 'Spot the Signs',
    goal: 'Why standard fasting glucose tests can look completely normal for up to a decade.',
    resourceSlugs: [
      'your-blood-sugar-can-look-normal-while-trouble-is-already-brewing-xbrfv_',
      '163-what-your-glucose-monitor-is-missing-9mtnpd',
    ],
    editionNotes: {
      global: {
        'your-blood-sugar-can-look-normal-while-trouble-is-already-brewing-xbrfv_':
          'The pancreas overproduces insulin for years before routine glucose tests turn abnormal.',
        '163-what-your-glucose-monitor-is-missing-9mtnpd':
          'Why finger-prick snapshots miss the hidden insulin trajectory.',
      },
      ph: {
        'your-blood-sugar-can-look-normal-while-trouble-is-already-brewing-xbrfv_':
          'Bakit normal ang fasting blood sugar mo kahit may insulin resistance na sa loob.',
        '163-what-your-glucose-monitor-is-missing-9mtnpd':
          'Ang hindi nakikita ng ordinaryong glucometer kung insulin ang tunay na problema.',
      },
    },
  },
  {
    id: 'know-causes',
    order: 3,
    title: 'Know the Causes',
    goal: 'Food frequency, refined carbohydrates, visceral fat accumulation, and stress hormones.',
    resourceSlugs: [
      'what-causes-insulin-resistance-insulin-resistance-jason-fung-crzpdh',
      '156-the-most-dangerous-fat-in-your-body-mkgnws',
    ],
    editionNotes: {
      global: {
        'what-causes-insulin-resistance-insulin-resistance-jason-fung-crzpdh':
          'The overflow model: how continuous eating overwhelms hepatic and cellular storage.',
        '156-the-most-dangerous-fat-in-your-body-mkgnws':
          'Visceral adipose tissue around internal organs as a primary driver of disease.',
      },
      ph: {
        'what-causes-insulin-resistance-insulin-resistance-jason-fung-crzpdh':
          'Bakit ang labis na kanin, matamis na inumin, at meryenda ang nagpapalala ng insulin overflow.',
        '156-the-most-dangerous-fat-in-your-body-mkgnws':
          'Taba sa loob ng tiyan (visceral fat) at ang panganib ng fatty liver sa mga Pilipino.',
      },
    },
  },
  {
    id: 'take-action',
    order: 4,
    title: 'Take Action',
    goal: 'Evidence-based nutrition changes, daily muscle movement, and circadian sleep restoration.',
    resourceSlugs: [
      'dr-ben-bikman-how-to-reverse-insulin-resistance-through-diet-exercise-sleep-gmyosh',
      'how-to-lower-blood-sugar-without-cutting-carbs-the-diabetes-code-clinic-part-66-v2kkgm',
    ],
    editionNotes: {
      global: {
        'dr-ben-bikman-how-to-reverse-insulin-resistance-through-diet-exercise-sleep-gmyosh':
          'Practical protocol: prioritize protein, manage carbohydrate timing, and leverage muscle glucose uptake.',
        'how-to-lower-blood-sugar-without-cutting-carbs-the-diabetes-code-clinic-part-66-v2kkgm':
          'Meal sequencing, fiber buffering, and timing strategies from clinical practice.',
      },
      ph: {
        'dr-ben-bikman-how-to-reverse-insulin-resistance-through-diet-exercise-sleep-gmyosh':
          'Praktikal na gabay: unahin ang protina, bawas sa asukal, at sapat na tulog sa gabi.',
        'how-to-lower-blood-sugar-without-cutting-carbs-the-diabetes-code-clinic-part-66-v2kkgm':
          'Paano magpababa ng asukal sa dugo sa pamamagitan ng tamang pagkakasunod ng pagkain.',
      },
    },
  },
  {
    id: 'stay-safe',
    order: 5,
    title: 'Stay Safe',
    goal: 'Essential medication precautions and clinical monitoring when adjusting nutrition or fasting.',
    safetyNote:
      'Fasting and low-carbohydrate nutrition cause rapid drops in blood sugar. If you take insulin, sulfonylureas, or blood pressure medications, you MUST consult your prescribing physician before altering your diet or meal frequency to prevent severe hypoglycemia.',
    resourceSlugs: [
      'fasting-and-medication-what-precautions-to-take-fasting-atucqo',
      'reversing-diabetes-the-roles-medication-and-diet-play-mwnygx',
    ],
    editionNotes: {
      global: {
        'fasting-and-medication-what-precautions-to-take-fasting-atucqo':
          'Critical precautions: why medication doses must be clinically tapered as food intake changes.',
        'reversing-diabetes-the-roles-medication-and-diet-play-mwnygx':
          'Cardiologist perspective on treating the underlying metabolic cause rather than just medicating symptoms.',
      },
      ph: {
        'fasting-and-medication-what-precautions-to-take-fasting-atucqo':
          'Mahigpit na babala: ang mga umiinom ng gamot ay kailangang magpa-supervise sa doktor bago mag-ayuno.',
        'reversing-diabetes-the-roles-medication-and-diet-play-mwnygx':
          'Pananaw ng cardiologist sa ligtas na pakikipagtulungan sa doktor habang binabago ang pamumuhay.',
      },
    },
  },
];
