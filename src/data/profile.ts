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
  { age: "17", text: "PROMYS Europe, top 30 in Europe" },
  { age: "18", text: "ASPR '24 rationality camp, full scholarship" },
  {
    age: "19",
    text: "Youngest investor at Entrepreneurs First, then up to Oxford",
  },
  { age: "20", text: "Dropped out to join microagi full time" },
];

export const work: ProfileEntry[] = [
  { name: "EF" },
  { name: "Bluedot Impact" },
  { name: "microagi" },
];

export const other: ProfileEntry[] = [
  { name: "ARBOx3" },
  { name: "Varsity Hackathon Founder" },
  { name: "joinorbita.com", href: "https://joinorbita.com" },
];
