import type { Specialty } from "./specialties";

export type HealthTip = {
  id: string;
  icon: string;
  name: string;
  /** What to search for on the Find Doctor page. */
  searchAs: string;
  specialty: Specialty;
  symptoms: string[];
  homeCare: string[];
  prevention: string[];
  /** Warning signs — when home care is not enough. */
  seeDoctor: string[];
};

// General guidance only — no medicine doses. Always list the warning signs.
export const HEALTH_TIPS: HealthTip[] = [
  {
    id: "cough-cold",
    icon: "🤧",
    name: "Cough & Cold",
    searchAs: "cold",
    specialty: "General Physician",
    symptoms: ["Runny or blocked nose", "Sneezing", "Cough", "Mild sore throat", "Mild body ache"],
    homeCare: [
      "Rest well and sleep enough",
      "Drink plenty of warm fluids — warm water, soups, herbal tea",
      "Steam inhalation 2–3 times a day to open the nose",
      "Gargle with warm salt water for throat irritation",
      "Honey with warm water can soothe cough (not for babies under 1 year)",
    ],
    prevention: [
      "Wash hands often with soap for 20 seconds",
      "Cover mouth and nose with your elbow when you cough or sneeze",
      "Avoid touching eyes, nose and mouth",
      "Keep distance from people who are sick",
      "Eat fruits and vegetables rich in vitamin C",
    ],
    seeDoctor: [
      "Cough lasts more than 2 weeks",
      "Difficulty breathing or chest pain",
      "High fever above 102°F (39°C) or fever for more than 3 days",
      "Blood in cough or thick green/yellow phlegm with fever",
    ],
  },
  {
    id: "fever",
    icon: "🌡️",
    name: "Viral Fever",
    searchAs: "fever",
    specialty: "General Physician",
    symptoms: ["Body temperature above 100°F (38°C)", "Body ache", "Tiredness", "Headache", "Chills"],
    homeCare: [
      "Take complete rest",
      "Drink plenty of water, ORS, coconut water and soups",
      "Sponge the body with normal (not cold) water if the fever is high",
      "Wear light cotton clothes",
      "Eat light, easy-to-digest food like khichdi or dal rice",
    ],
    prevention: [
      "Wash hands regularly",
      "Drink clean, boiled or filtered water",
      "Avoid close contact with sick people",
      "Keep your vaccinations up to date",
    ],
    seeDoctor: [
      "Fever lasts more than 3 days",
      "Temperature above 103°F (39.5°C)",
      "Rash, stiff neck, confusion or severe headache",
      "Fever in a baby under 3 months — see a doctor immediately",
      "Fits (seizures), breathing trouble or very drowsy",
    ],
  },
  {
    id: "sore-throat",
    icon: "🗣️",
    name: "Sore Throat",
    searchAs: "throat",
    specialty: "ENT Specialist",
    symptoms: ["Pain or scratchy feeling in throat", "Pain while swallowing", "Hoarse voice", "Swollen tonsils"],
    homeCare: [
      "Gargle with warm salt water 3–4 times a day",
      "Drink warm liquids like tea with honey and ginger",
      "Rest your voice",
      "Avoid very cold drinks and spicy, oily food",
    ],
    prevention: [
      "Don't share glasses, bottles or utensils",
      "Wash hands often",
      "Avoid smoking and smoke-filled places",
    ],
    seeDoctor: [
      "Trouble breathing or swallowing saliva",
      "Lasts more than a week",
      "High fever or white patches on tonsils",
      "Lump in the neck or blood in saliva",
    ],
  },
  {
    id: "dengue",
    icon: "🦟",
    name: "Dengue",
    searchAs: "fever",
    specialty: "General Physician",
    symptoms: [
      "Sudden high fever",
      "Severe headache and pain behind the eyes",
      "Severe joint and muscle pain",
      "Skin rash",
      "Nausea and vomiting",
    ],
    homeCare: [
      "See a doctor and get a blood test if you suspect dengue",
      "Drink plenty of fluids — water, ORS, coconut water, juices",
      "Take full rest",
      "Do NOT take painkillers like ibuprofen or aspirin unless a doctor says so — they can increase bleeding risk",
    ],
    prevention: [
      "Don't let water collect in coolers, pots, tyres and flower vases — empty them weekly",
      "Use mosquito nets, repellents and window screens",
      "Wear full-sleeve clothes, especially in early morning and evening",
      "Keep surroundings clean",
    ],
    seeDoctor: [
      "Any suspected dengue — always get checked",
      "Bleeding from gums or nose, or blood in vomit/stool — go to hospital immediately",
      "Severe stomach pain or repeated vomiting",
      "Feeling very weak, restless or cold, clammy skin",
    ],
  },
  {
    id: "malaria",
    icon: "🦟",
    name: "Malaria",
    searchAs: "fever",
    specialty: "General Physician",
    symptoms: ["Fever with shivering and chills", "Sweating as fever goes down", "Headache", "Vomiting", "Body ache"],
    homeCare: [
      "Malaria needs a blood test and prescribed medicine — see a doctor",
      "Drink plenty of fluids and rest",
      "Complete the full course of medicine given by the doctor",
    ],
    prevention: [
      "Sleep under a mosquito net",
      "Use mosquito repellent and coils",
      "Remove stagnant water around the house",
      "Wear long-sleeved clothes in the evening",
    ],
    seeDoctor: [
      "Any fever with chills in the monsoon season",
      "Confusion, fits or extreme weakness — go to hospital immediately",
      "Yellow eyes, dark urine or breathing difficulty",
    ],
  },
  {
    id: "diarrhoea",
    icon: "🚽",
    name: "Diarrhoea & Food Poisoning",
    searchAs: "diarrhea",
    specialty: "Gastroenterologist",
    symptoms: ["Loose, watery stools", "Stomach cramps", "Nausea or vomiting", "Weakness"],
    homeCare: [
      "Drink ORS (oral rehydration solution) after every loose stool",
      "Take small sips of water, coconut water, buttermilk, rice water",
      "Eat light food — banana, curd rice, khichdi, toast",
      "Avoid oily, spicy food, milk and outside food until better",
    ],
    prevention: [
      "Drink boiled or filtered water",
      "Wash hands before eating and after using the toilet",
      "Avoid street food and cut fruits sold in the open",
      "Store cooked food covered and eat it fresh",
    ],
    seeDoctor: [
      "Signs of dehydration — very little urine, dry mouth, dizziness",
      "Blood in stool or high fever",
      "Lasts more than 2 days (or more than 1 day in children)",
      "Child or elderly person who cannot keep fluids down",
    ],
  },
  {
    id: "acidity",
    icon: "🔥",
    name: "Acidity & Indigestion",
    searchAs: "acidity",
    specialty: "Gastroenterologist",
    symptoms: ["Burning in chest or upper stomach", "Sour taste in mouth", "Bloating and burping", "Nausea"],
    homeCare: [
      "Eat smaller meals at regular times",
      "Drink cold milk or buttermilk",
      "Don't lie down for 2–3 hours after eating",
      "Raise your head while sleeping",
    ],
    prevention: [
      "Avoid very spicy, oily and fried food",
      "Limit tea, coffee, alcohol and fizzy drinks",
      "Don't skip meals or eat late at night",
      "Quit smoking and manage stress",
    ],
    seeDoctor: [
      "Chest pain spreading to arm, jaw or back — this may be the heart, call 108",
      "Black stools or vomiting blood",
      "Difficulty swallowing or weight loss",
      "Acidity most days for more than 2 weeks",
    ],
  },
  {
    id: "headache",
    icon: "🤕",
    name: "Headache & Migraine",
    searchAs: "headache",
    specialty: "Neurologist",
    symptoms: [
      "Pain in the head or forehead",
      "Throbbing pain on one side (migraine)",
      "Sensitivity to light or noise",
      "Nausea",
    ],
    homeCare: [
      "Rest in a quiet, dark room",
      "Drink water — dehydration often causes headaches",
      "Apply a cold or warm compress on the forehead or neck",
      "Gently massage the temples and neck",
    ],
    prevention: [
      "Sleep 7–8 hours at regular times",
      "Don't skip meals",
      "Take breaks from mobile and computer screens",
      "Note and avoid your triggers (certain foods, stress, strong smells)",
    ],
    seeDoctor: [
      "Sudden, very severe headache ('worst ever') — go to hospital immediately",
      "Headache with fever and stiff neck",
      "Weakness, blurred vision, trouble speaking or confusion",
      "Headache after a head injury",
    ],
  },
  {
    id: "typhoid",
    icon: "🍲",
    name: "Typhoid",
    searchAs: "fever",
    specialty: "General Physician",
    symptoms: ["Fever that slowly rises over days", "Weakness", "Stomach pain", "Headache", "Loss of appetite"],
    homeCare: [
      "Typhoid needs a test and prescribed antibiotics — see a doctor",
      "Drink plenty of boiled water and fluids",
      "Eat soft, home-cooked food",
      "Complete the full antibiotic course even if you feel better",
    ],
    prevention: [
      "Drink boiled or purified water",
      "Wash hands before eating and after the toilet",
      "Avoid raw food and street food",
      "Ask your doctor about the typhoid vaccine",
    ],
    seeDoctor: ["Fever for more than 3 days", "Severe stomach pain or swelling", "Blood in stool or vomiting"],
  },
  {
    id: "eye-flu",
    icon: "👁️",
    name: "Conjunctivitis (Eye Flu)",
    searchAs: "eye",
    specialty: "Ophthalmologist",
    symptoms: ["Red, pink eyes", "Watering or sticky discharge", "Itching or burning", "Eyelids stuck in the morning"],
    homeCare: [
      "Clean eyes gently with clean water or cotton",
      "Use a clean towel and don't share it",
      "Avoid rubbing your eyes",
      "Don't use eye drops without a doctor's advice",
    ],
    prevention: [
      "Wash hands often, especially after touching eyes",
      "Don't share towels, pillows, eye makeup or glasses",
      "Stay home from school or work while it is spreading",
    ],
    seeDoctor: [
      "Eye pain or blurry vision",
      "Strong sensitivity to light",
      "No improvement after 3–4 days",
      "Newborn baby with red eyes",
    ],
  },
  {
    id: "heat-stroke",
    icon: "☀️",
    name: "Heat Stroke & Dehydration",
    searchAs: "weakness",
    specialty: "General Physician",
    symptoms: [
      "Very high body temperature",
      "Hot, dry skin or heavy sweating",
      "Dizziness and headache",
      "Fast heartbeat",
      "Confusion",
    ],
    homeCare: [
      "Heat stroke is an emergency — call 108",
      "Move the person to a cool, shaded place",
      "Cool the body with wet cloths and fanning",
      "Give sips of water or ORS if the person is awake",
    ],
    prevention: [
      "Drink water often, even if you don't feel thirsty",
      "Avoid going out between 12 pm and 4 pm in summer",
      "Wear light, loose cotton clothes and a cap",
      "Take ORS, lemon water, buttermilk in hot weather",
    ],
    seeDoctor: [
      "Confusion, fainting or fits — call 108 immediately",
      "Body temperature does not come down",
      "Vomiting and unable to drink",
    ],
  },
  {
    id: "skin-allergy",
    icon: "🧴",
    name: "Skin Allergy & Rashes",
    searchAs: "skin",
    specialty: "Dermatologist",
    symptoms: ["Itching", "Red patches or bumps", "Dry, flaky skin", "Swelling"],
    homeCare: [
      "Wash with mild soap and lukewarm water",
      "Apply a cool compress to calm itching",
      "Use a gentle moisturiser",
      "Wear loose cotton clothes and don't scratch",
    ],
    prevention: [
      "Find and avoid what triggers it (soap, food, dust, plants)",
      "Keep skin clean and dry, especially in humid weather",
      "Don't share towels or clothes",
    ],
    seeDoctor: [
      "Swelling of lips, face or throat or trouble breathing — call 108",
      "Rash with fever",
      "Rash that spreads fast, blisters or oozes",
      "No improvement in a week",
    ],
  },
  {
    id: "constipation",
    icon: "🥦",
    name: "Constipation",
    searchAs: "constipation",
    specialty: "Gastroenterologist",
    symptoms: ["Fewer than 3 bowel movements a week", "Hard, dry stools", "Straining", "Bloated stomach"],
    homeCare: [
      "Drink 8–10 glasses of water a day",
      "Eat fibre — fruits like papaya and guava, vegetables, whole grains",
      "Walk or exercise for 30 minutes daily",
      "Don't ignore the urge to go to the toilet",
    ],
    prevention: ["Eat fibre-rich food every day", "Stay active", "Keep a regular toilet routine"],
    seeDoctor: [
      "Blood in stool",
      "Severe stomach pain or vomiting",
      "Unexplained weight loss",
      "Lasts more than 2 weeks",
    ],
  },
];
