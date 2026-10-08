export const SPECIALTIES = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Dentist",
  "Pediatrician",
  "Gynecologist",
  "Orthopedic",
  "Neurologist",
  "ENT Specialist",
  "Ophthalmologist",
  "Psychiatrist",
  "Gastroenterologist",
  "Endocrinologist",
  "Pulmonologist",
  "Urologist",
  "Nephrologist",
  "Oncologist",
] as const;

export type Specialty = (typeof SPECIALTIES)[number];

/**
 * How each specialty appears in OpenStreetMap: the `healthcare:speciality`
 * tag value(s), plus words commonly found in clinic/hospital names.
 */
export const SPECIALTY_MATCH: Record<Specialty, { osm: string[]; words: RegExp }> = {
  "General Physician": { osm: ["general", "family_medicine", "internal"], words: /general|family|physician|polyclinic/i },
  Cardiologist: { osm: ["cardiology"], words: /cardi|heart/i },
  Dermatologist: { osm: ["dermatology"], words: /derma|skin|hair|cosmet/i },
  Dentist: { osm: ["dentist", "dentistry", "dental_oral_maxillo_facial_surgery", "orthodontics"], words: /dent|tooth|teeth|smile|oral/i },
  Pediatrician: { osm: ["paediatrics"], words: /child|kid|paed|pediat|baby/i },
  Gynecologist: { osm: ["gynaecology", "obstetrics"], words: /gyn|maternity|women|mother|ivf|fertility|nursing home/i },
  Orthopedic: { osm: ["orthopaedics", "trauma"], words: /ortho|bone|joint|spine|fracture/i },
  Neurologist: { osm: ["neurology", "neurosurgery"], words: /neuro|brain/i },
  "ENT Specialist": { osm: ["otolaryngology"], words: /\bent\b|ear|nose|throat/i },
  Ophthalmologist: { osm: ["ophthalmology"], words: /eye|ophthal|vision|netra|optic/i },
  Psychiatrist: { osm: ["psychiatry"], words: /psych|mental|mind|rehab/i },
  Gastroenterologist: { osm: ["gastroenterology"], words: /gastro|liver|digest/i },
  Endocrinologist: { osm: ["endocrinology", "diabetology"], words: /diabet|endocr|thyroid|sugar/i },
  Pulmonologist: { osm: ["pulmonology"], words: /pulmo|chest|lung|tb\b/i },
  Urologist: { osm: ["urology"], words: /urolog|stone/i },
  Nephrologist: { osm: ["nephrology"], words: /nephro|kidney|dialysis/i },
  Oncologist: { osm: ["oncology"], words: /onco|cancer|tumou?r/i },
};

// Disease / symptom keywords → specialty to search for.
const DISEASE_MAP: [RegExp, Specialty][] = [
  [/heart|chest pain|blood pressure|\bbp\b|hypertension|cardiac|palpitation/i, "Cardiologist"],
  [/skin|acne|rash|eczema|psoriasis|hair ?fall|allerg/i, "Dermatologist"],
  [/tooth|teeth|dental|\bgums?\b|cavity|root canal/i, "Dentist"],
  [/child|baby|infant|\bkids?\b|vaccin/i, "Pediatrician"],
  [/pregnan|period|menstru|pcos|pcod|uterus|fertility/i, "Gynecologist"],
  [/bone|fracture|joint|knee|back pain|spine|arthritis|sprain/i, "Orthopedic"],
  [/migraine|headache|seizure|epilep|stroke|paralysis|nerve|parkinson/i, "Neurologist"],
  [/\bears?\b|earache|nose|throat|sinus|tonsil|hearing/i, "ENT Specialist"],
  [/\beyes?\b|vision|cataract|glaucoma/i, "Ophthalmologist"],
  [/depress|anxiety|stress|mental|insomnia|sleep|bipolar/i, "Psychiatrist"],
  [/stomach|acidity|gastric|liver|ulcer|constipation|diarrh|digest/i, "Gastroenterologist"],
  [/diabet|sugar|thyroid|hormone|obesity/i, "Endocrinologist"],
  [/asthma|lung|breath|cough|\btb\b|tuberculosis|pneumonia/i, "Pulmonologist"],
  [/urine|urinary|prostate|bladder/i, "Urologist"],
  [/kidney|dialysis|renal/i, "Nephrologist"],
  [/cancer|tumou?r|chemo/i, "Oncologist"],
  [/fever|cold|flu|viral|infection|weakness|body pain/i, "General Physician"],
];

export function specialtyForDisease(disease: string): Specialty | null {
  for (const [re, specialty] of DISEASE_MAP) if (re.test(disease)) return specialty;
  return null;
}

export function isSpecialty(s: string): s is Specialty {
  return (SPECIALTIES as readonly string[]).includes(s);
}

/** Readable labels for OSM speciality values, e.g. "orthopaedics" → "Orthopaedics". */
export function prettySpeciality(value: string) {
  return value.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}
