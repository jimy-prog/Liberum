/* ============================================================
   Liberum Mock — structured test content model
   Test → Section → (Passage) → QuestionGroup → Question → Option
   ============================================================ */

export type QuestionType = "mcq" | "tfng" | "completion" | "multi";

export interface Question {
  id: string;
  number: number;
  type: QuestionType;
  text: string;
  options?: string[];
  correct: string; // demo answer key for auto-scored sections
  explanation?: string;
}

export interface QuestionGroup {
  id: string;
  title: string; // instruction line, e.g. "Questions 1–5 · True / False / Not Given"
  instruction: string;
  mediaUrl?: string;
  questions: Question[];
}

export interface Passage {
  title: string;
  subtitle: string;
  paragraphs: string[];
}

export interface ExamSection {
  id: "listening" | "reading" | "writing" | "speaking";
  name: string;
  durationMin: number;
  passage?: Passage;
  groups: QuestionGroup[];
}

export interface MockTest {
  id: string;
  title: string;
  type: "Full Mock" | "Reading" | "Listening" | "Writing" | "Speaking";
  difficulty: "Intermediate" | "Upper-Intermediate" | "Advanced";
  durationMin: number;
  questionsCount: number;
  sections: ("listening" | "reading" | "writing" | "speaking")[];
  status: "new" | "in-progress" | "completed";
  attempts: number;
  bestBand?: number;
}

export const MOCK_TESTS: MockTest[] = [
  { id: "m1", title: "IELTS Academic Mock 01", type: "Full Mock", difficulty: "Upper-Intermediate", durationMin: 165, questionsCount: 80, sections: ["listening", "reading", "writing", "speaking"], status: "completed", attempts: 2, bestBand: 7.0 },
  { id: "m2", title: "IELTS Academic Mock 02", type: "Full Mock", difficulty: "Advanced", durationMin: 165, questionsCount: 80, sections: ["listening", "reading", "writing", "speaking"], status: "new", attempts: 0 },
  { id: "m3", title: "IELTS Reading Practice 01", type: "Reading", difficulty: "Intermediate", durationMin: 60, questionsCount: 40, sections: ["reading"], status: "completed", attempts: 1, bestBand: 7.0 },
  { id: "m4", title: "IELTS Listening Practice 02", type: "Listening", difficulty: "Intermediate", durationMin: 32, questionsCount: 40, sections: ["listening"], status: "new", attempts: 0 },
  { id: "m5", title: "IELTS Writing Sprint 01", type: "Writing", difficulty: "Upper-Intermediate", durationMin: 60, questionsCount: 2, sections: ["writing"], status: "new", attempts: 0 },
  { id: "m6", title: "IELTS Speaking Simulator 01", type: "Speaking", difficulty: "Intermediate", durationMin: 14, questionsCount: 3, sections: ["speaking"], status: "new", attempts: 0 },
];

/* ---------------- Reading passage (original content) ---------------- */
const READING_PASSAGE: Passage = {
  title: "The Hidden Value of Urban Trees",
  subtitle: "Reading Passage 1 · You should spend about 20 minutes on Questions 1–13",
  paragraphs: [
    "Cities around the world are rediscovering what ecologists have long understood: urban trees are not decoration, but infrastructure. A single mature oak can absorb over 150 kilograms of carbon dioxide a year, while its canopy cools surrounding streets by as much as five degrees. In neighbourhoods where summer temperatures regularly exceed comfortable levels, this cooling effect is not a luxury — it is a measurable public health intervention.",
    "Yet the economic argument may be the most persuasive. Properties on tree-lined streets consistently command higher prices, and shoppers linger longer — and spend more — in retail districts with mature canopy cover. Some municipalities now treat their urban forest as a financial asset, budgeting for it accordingly. One American city calculated that every dollar invested in street trees returned nearly three dollars in combined benefits, from reduced energy consumption to improved stormwater management.",
    "The challenge is longevity. Street trees face compacted soil, restricted root space and constant construction. The average street tree in a dense city centre survives only a fraction of its natural lifespan, and replacing a lost mature tree takes decades. Urban foresters therefore argue that planting is the easy part; the true investment is in the unglamorous decades of watering, pruning and protection that follow.",
    "Public perception adds a further complication. Residents frequently petition for trees to be removed, citing falling leaves, blocked light or fears about pollen. Surveys suggest that people consistently underestimate the benefits of the trees outside their own homes, while overestimating the inconvenience. Successful urban forestry programmes have learned to treat community engagement as seriously as soil science — a tree that is loved is a tree that survives.",
    "Looking forward, cities are beginning to map their canopies with the same rigour they apply to roads and water pipes. Satellite imagery, street-level sensors and citizen reporting now feed into live registries that track the health of individual trees. The goal is no longer simply to plant more, but to keep more alive — because in the arithmetic of urban forestry, a forty-year-old tree is worth far more than forty saplings.",
  ],
};

const READING_GROUPS: QuestionGroup[] = [
  {
    id: "rg1",
    title: "Questions 1–5 · True / False / Not Given",
    instruction:
      "Do the following statements agree with the information given in the passage? Choose TRUE if the statement agrees with the information, FALSE if it contradicts the information, or NOT GIVEN if there is no information on this.",
    questions: [
      { id: "rq1", number: 1, type: "tfng", text: "Urban trees can lower street temperatures.", options: ["True", "False", "Not Given"], correct: "True", explanation: "Paragraph 1: a canopy 'cools surrounding streets by as much as five degrees.'" },
      { id: "rq2", number: 2, type: "tfng", text: "An oak absorbs more CO₂ than any other tree species.", options: ["True", "False", "Not Given"], correct: "Not Given", explanation: "The passage gives a figure for oaks but never compares species." },
      { id: "rq3", number: 3, type: "tfng", text: "Shoppers spend less in tree-lined retail districts.", options: ["True", "False", "Not Given"], correct: "False", explanation: "Paragraph 2 states shoppers 'linger longer — and spend more'." },
      { id: "rq4", number: 4, type: "tfng", text: "Replacing a mature street tree is a quick process.", options: ["True", "False", "Not Given"], correct: "False", explanation: "Paragraph 3: 'replacing a lost mature tree takes decades.'" },
      { id: "rq5", number: 5, type: "tfng", text: "Most residents support the removal of urban trees.", options: ["True", "False", "Not Given"], correct: "Not Given", explanation: "The passage mentions petitions for removal but gives no majority view." },
    ],
  },
  {
    id: "rg2",
    title: "Questions 6–9 · Multiple Choice",
    instruction: "Choose the correct letter, A, B, C or D.",
    questions: [
      { id: "rq6", number: 6, type: "mcq", text: "According to the passage, the writer describes urban trees as 'infrastructure' because they", options: ["are expensive to maintain", "provide measurable public services", "are planted by city governments", "last longer than buildings"], correct: "B", explanation: "Paragraph 1 links the word to cooling and public health benefits." },
      { id: "rq7", number: 7, type: "mcq", text: "The American city study found that street trees", options: ["cost more than they return", "returned triple their investment", "reduced property prices", "required no budgeting"], correct: "B", explanation: "Paragraph 2: 'every dollar invested… returned nearly three dollars'." },
      { id: "rq8", number: 8, type: "mcq", text: "Urban foresters believe the hardest part of their work is", options: ["choosing the right species", "planting trees correctly", "decades of ongoing care", "measuring canopy cover"], correct: "C", explanation: "Paragraph 3: 'the true investment is in the unglamorous decades of watering, pruning and protection.'" },
      { id: "rq9", number: 9, type: "mcq", text: "Successful programmes treat community engagement as", options: ["a minor detail", "less important than soil", "equally important as soil science", "a replacement for planting"], correct: "C", explanation: "Paragraph 4: engagement 'as seriously as soil science'." },
    ],
  },
  {
    id: "rg3",
    title: "Questions 10–13 · Sentence Completion",
    instruction: "Complete the sentences below. Write NO MORE THAN TWO WORDS from the passage for each answer.",
    questions: [
      { id: "rq10", number: 10, type: "completion", text: "A mature oak can absorb more than 150 kilograms of ________ each year.", correct: "carbon dioxide", explanation: "Paragraph 1." },
      { id: "rq11", number: 11, type: "completion", text: "Street trees suffer from compacted soil and restricted ________.", correct: "root space", explanation: "Paragraph 3." },
      { id: "rq12", number: 12, type: "completion", text: "Residents often underestimate the ________ of nearby trees.", correct: "benefits", explanation: "Paragraph 4." },
      { id: "rq13", number: 13, type: "completion", text: "Live registries now track the ________ of individual trees.", correct: "health", explanation: "Paragraph 5." },
    ],
  },
];

/* ---------------- Listening (demo — audio pending backend) ---------------- */
const LISTENING_GROUPS: QuestionGroup[] = [
  {
    id: "lg1",
    title: "Questions 1–5 · Multiple Choice",
    instruction: "You will hear a student talking to a university accommodation officer. Choose the correct letter, A, B or C.",
    questions: [
      { id: "lq1", number: 1, type: "mcq", text: "The student is looking for accommodation", options: ["near the city centre", "close to the university", "in a shared house"], correct: "B" },
      { id: "lq2", number: 2, type: "mcq", text: "The maximum rent the student can pay per month is", options: ["£400", "£550", "£650"], correct: "B" },
      { id: "lq3", number: 3, type: "mcq", text: "The officer says the rooms on North Road", options: ["are newly renovated", "include all bills", "are in high demand"], correct: "C" },
      { id: "lq4", number: 4, type: "mcq", text: "The student prefers a room with", options: ["a private bathroom", "a large desk", "a garden view"], correct: "A" },
      { id: "lq5", number: 5, type: "mcq", text: "The viewing appointment is arranged for", options: ["Tuesday morning", "Thursday afternoon", "Friday evening"], correct: "B" },
    ],
  },
  {
    id: "lg2",
    title: "Questions 6–10 · Note Completion",
    instruction: "Complete the notes below. Write NO MORE THAN TWO WORDS for each answer.",
    questions: [
      { id: "lq6", number: 6, type: "completion", text: "Name of residence: ________ Hall", correct: "Maple" },
      { id: "lq7", number: 7, type: "completion", text: "Monthly rent: £________ (bills included)", correct: "520" },
      { id: "lq8", number: 8, type: "completion", text: "Kitchen is shared with ________ other students", correct: "four" },
      { id: "lq9", number: 9, type: "completion", text: "Deposit required: one ________ rent", correct: "month's" },
      { id: "lq10", number: 10, type: "completion", text: "Bring a form of ________ to the viewing", correct: "identification" },
    ],
  },
];

/* ---------------- Writing tasks ---------------- */
export const WRITING_TASKS = [
  {
    id: "w1",
    label: "Task 1",
    minutes: 20,
    minWords: 150,
    prompt:
      "The chart below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    hasChart: true,
  },
  {
    id: "w2",
    label: "Task 2",
    minutes: 40,
    minWords: 250,
    prompt:
      "Some people believe that university education should be free for all students. To what extent do you agree or disagree? Give reasons for your answer and include any relevant examples from your own knowledge or experience.",
    hasChart: false,
  },
];

/* ---------------- Speaking parts ---------------- */
export const SPEAKING_PARTS = [
  {
    id: "sp1",
    label: "Part 1",
    title: "Introduction & Interview",
    prepSec: 0,
    speakSec: 90,
    prompt: "Let's talk about your home town. Where is it? What do you like most about it? Has it changed much in recent years?",
  },
  {
    id: "sp2",
    label: "Part 2",
    title: "Individual Long Turn",
    prepSec: 60,
    speakSec: 120,
    prompt:
      "Describe a teacher who has influenced you.\n\nYou should say:\n· who this person is\n· what subject they taught\n· what made their lessons special\n\nand explain how they influenced you.",
  },
  {
    id: "sp3",
    label: "Part 3",
    title: "Two-way Discussion",
    prepSec: 0,
    speakSec: 120,
    prompt: "How has technology changed the way people learn? Do you think online learning will ever fully replace classrooms? Why do some students learn better alone than in groups?",
  },
];

export const EXAM_SECTIONS: ExamSection[] = [
  { id: "listening", name: "Listening", durationMin: 10, groups: LISTENING_GROUPS },
  { id: "reading", name: "Reading", durationMin: 20, passage: READING_PASSAGE, groups: READING_GROUPS },
  { id: "writing", name: "Writing", durationMin: 60, groups: [] },
  { id: "speaking", name: "Speaking", durationMin: 14, groups: [] },
];

/* ---------------- History / results seed data ---------------- */
export interface AttemptResult {
  id: string;
  testTitle: string;
  date: string;
  overall: number;
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  status: "Scored" | "AI estimated" | "Pending review";
}

export const HISTORY: AttemptResult[] = [
  { id: "a1", testTitle: "IELTS Academic Mock 01", date: "Aug 16, 2026", overall: 7.0, listening: 7.5, reading: 7.0, writing: 6.5, speaking: 7.0, status: "Scored" },
  { id: "a2", testTitle: "IELTS Reading Practice 01", date: "Aug 9, 2026", overall: 7.0, listening: 0, reading: 7.0, writing: 0, speaking: 0, status: "Scored" },
  { id: "a3", testTitle: "IELTS Academic Mock 01", date: "Jul 26, 2026", overall: 6.5, listening: 7.0, reading: 6.5, writing: 6.0, speaking: 6.5, status: "Scored" },
  { id: "a4", testTitle: "IELTS Listening Practice 01", date: "Jul 12, 2026", overall: 6.5, listening: 6.5, reading: 0, writing: 0, speaking: 0, status: "Scored" },
  { id: "a5", testTitle: "IELTS Academic Mock 00", date: "Jun 28, 2026", overall: 6.0, listening: 6.5, reading: 6.0, writing: 5.5, speaking: 6.0, status: "Scored" },
];

export const BAND_TREND = [
  { label: "Jun", value: 6.0 },
  { label: "Jul 12", value: 6.5 },
  { label: "Jul 26", value: 6.5 },
  { label: "Aug 9", value: 7.0 },
  { label: "Aug 16", value: 7.0 },
];

/* ---------------- Teacher seed data ---------------- */
export const TEACHER_STUDENTS = [
  { id: "s1", name: "Jasur Toshev", initials: "JT", color: "#1FAD55", tests: 5, avg: 7.0, last: "Aug 16" },
  { id: "s2", name: "Madina Rahimova", initials: "MR", color: "#7B61FF", tests: 4, avg: 6.5, last: "Aug 14" },
  { id: "s3", name: "Sofia Karimova", initials: "SK", color: "#F5A623", tests: 3, avg: 6.0, last: "Aug 11" },
  { id: "s4", name: "Bekzod Alimov", initials: "BA", color: "#3B82F6", tests: 6, avg: 7.5, last: "Aug 17" },
  { id: "s5", name: "Nilufar Saidova", initials: "NS", color: "#D946EF", tests: 2, avg: 5.5, last: "Aug 2" },
  { id: "s6", name: "Timur Yusupov", initials: "TY", color: "#0EA5E9", tests: 4, avg: 6.5, last: "Aug 15" },
];

export const TEACHER_RESULTS = [
  { student: "Bekzod Alimov", test: "IELTS Academic Mock 01", date: "Aug 17", overall: 7.5, l: 8.0, r: 7.5, w: 7.0, s: 7.5, status: "Scored" },
  { student: "Jasur Toshev", test: "IELTS Academic Mock 01", date: "Aug 16", overall: 7.0, l: 7.5, r: 7.0, w: 6.5, s: 7.0, status: "Scored" },
  { student: "Timur Yusupov", test: "IELTS Reading Practice 01", date: "Aug 15", overall: 7.0, l: 0, r: 7.0, w: 0, s: 0, status: "Scored" },
  { student: "Madina Rahimova", test: "IELTS Academic Mock 01", date: "Aug 14", overall: 6.5, l: 7.0, r: 6.5, w: 6.0, s: 6.5, status: "Scored" },
  { student: "Sofia Karimova", test: "IELTS Writing Sprint 01", date: "Aug 11", overall: 6.0, l: 0, r: 0, w: 6.0, s: 0, status: "AI estimated" },
  { student: "Nilufar Saidova", test: "IELTS Academic Mock 01", date: "Aug 2", overall: 5.5, l: 6.0, r: 5.5, w: 5.0, s: 5.5, status: "Scored" },
];

export const TEACHER_LIBRARY = [
  { id: "m1", name: "IELTS Academic Mock 01", type: "Full Mock", status: "Published", created: "Jun 12", questions: 80, assigned: 12 },
  { id: "m2", name: "IELTS Academic Mock 02", type: "Full Mock", status: "Published", created: "Jul 30", questions: 80, assigned: 8 },
  { id: "m3", name: "IELTS Reading Practice 01", type: "Reading", status: "Published", created: "Jul 2", questions: 40, assigned: 15 },
  { id: "m7", name: "IELTS Listening Practice 03", type: "Listening", status: "Draft", created: "Aug 19", questions: 24, assigned: 0 },
  { id: "m8", name: "Writing Sprint — Task 2 Pack", type: "Writing", status: "Draft", created: "Aug 20", questions: 5, assigned: 0 },
  { id: "m9", name: "IELTS Academic Mock 00", type: "Full Mock", status: "Archived", created: "May 3", questions: 80, assigned: 21 },
];

/* Band conversion (approximate, academic reading/listening out of 40) */
export function scoreToBand(correct: number, total: number): number {
  const pct = total === 0 ? 0 : correct / total;
  if (pct >= 0.95) return 9;
  if (pct >= 0.875) return 8.5;
  if (pct >= 0.8) return 8;
  if (pct >= 0.75) return 7.5;
  if (pct >= 0.65) return 7;
  if (pct >= 0.575) return 6.5;
  if (pct >= 0.5) return 6;
  if (pct >= 0.4) return 5.5;
  if (pct >= 0.3) return 5;
  return 4.5;
}

export function roundHalf(n: number): number {
  return Math.round(n * 2) / 2;
}
