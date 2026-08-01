export interface ProfileEntry {
  name: string;
  note?: string;
  href?: string;
}

export interface TimelineEntry {
  age: string;
  text: string;
}

export const timeline: TimelineEntry[] = [
  { age: "00", text: "Born in New Delhi" },
  { age: "03", text: "Moved to London" },
  { age: "07", text: "Taught myself to code. Malware, first." },
  { age: "12", text: "Team England, World Youth Chess Championships" },
  { age: "15", text: "Top 50 nationally in mathematics olympiads" },
  {
    age: "16",
    text: "Offers from Britain's best boarding schools, on financial aid",
  },
  { age: "17", text: "PROMYS Europe, six weeks of number theory at Oxford" },
  { age: "18", text: "Rationality camp, full scholarship" },
  {
    age: "19",
    text: "Youngest investor at Entrepreneurs First, then up to Oxford",
  },
  { age: "now", text: "Left in first year. Building at microagi full time." },
];

export const record: ProfileEntry[] = [
  { name: "Team England", note: "World Youth Chess Championships" },
  { name: "British Chess Championships", note: "winner" },
  { name: "PROMYS Europe", note: "top 30 in Europe, six weeks at Oxford" },
  { name: "ASPR", note: "rationality camp, top 30 globally, full scholarship" },
  {
    name: "British Mathematical Olympiad",
    note: "round 2 distinction, top 50 nationally",
  },
  { name: "Maclaurin Olympiad", note: "silver, top 50 nationally" },
  { name: "Pareto Fellow" },
];

export const work: ProfileEntry[] = [
  { name: "microagi", note: "full time" },
  {
    name: "Bluedot Impact",
    note: "Def/Acc operator, helping people start AI safety companies",
  },
  { name: "Soda.io", note: "growth, backed by Hummingbird and Point Nine" },
  {
    name: "Entrepreneurs First",
    note: "talent investment, originally invited as founder",
  },
];

export const built: ProfileEntry[] = [
  {
    name: "Varsity Hackathon",
    note: "Oxford vs Cambridge, founder and director, $20,000 raised",
  },
  {
    name: "Def/Acc, AI Security",
    note: "hackathons organised with Bluedot Impact",
  },
  {
    name: "Intrvue.ai",
    note: "AI interviewer for 11+ admissions, revenue in a week",
  },
  { name: "ProtocolML", note: "real-time fraud detection for telecoms" },
  { name: "Founderyoke", note: "matching for co-founders" },
  { name: "Gramira", note: "instant LLM text correction in any text box" },
  {
    name: "Volution",
    note: "air-allergen sensors, a team of nine, I was CEO",
    href: "/pages/volution/",
  },
  {
    name: "Papers",
    note: "fractional linear transformations, China's environmental policy",
  },
];

export const elsewhere: ProfileEntry[] = [
  { name: "Recurse Center", note: "programming retreat, New York" },
  { name: "ARBOx3", note: "machine learning alignment research bootcamp" },
  {
    name: "Optiver European Chess Championship",
    note: "finals, the only player still at school",
  },
  {
    name: "Y Combinator AI Startup School",
    note: "flown out to San Francisco",
  },
];
