export const guideCategories = ['All', 'Everyday Safety', "Women's Safety", 'Student Safety', 'Travel', 'Workplace', 'Family'];

export type Guide = {
  title: string; category: string; type: string; time: string;
  tone: string; excerpt: string;
  /** Set once a resource actually exists; otherwise the card says it is coming. */
  href?: string;
  checklistId?: string;
};

export const guides: Guide[] = [
  { title: 'The everyday carry check', category: 'Everyday Safety', type: 'Checklist', time: '4 min', tone: 'terracotta', excerpt: 'A simple monthly habit for the objects, contacts and information you rely on.', checklistId: 'women-commute' },
  { title: 'Late class, calm commute', category: 'Student Safety', type: 'Guide', time: '6 min', tone: 'navy', excerpt: 'Practical planning for campus days that run into the evening.', checklistId: 'campus' },
  { title: 'Before the cab arrives', category: 'Travel', type: 'Checklist', time: '3 min', tone: 'sage', excerpt: 'Small checks that make unfamiliar journeys feel more prepared.', checklistId: 'travel-safety' },
  { title: 'Build your emergency contact card', category: 'Everyday Safety', type: 'Tool', time: '5 min', tone: 'sand', excerpt: 'The information worth keeping accessible when your phone is not.', href: '#emergency-card' },
  { title: 'Working late, moving well', category: 'Workplace', type: 'Guide', time: '5 min', tone: 'navy', excerpt: 'A thoughtful end-of-day routine for offices and teams.', checklistId: 'workplace' },
  { title: 'A family preparedness hour', category: 'Family', type: 'Workshop', time: '60 min', tone: 'terracotta', excerpt: 'A calm conversation plan for roles, contacts and meeting points.', checklistId: 'family-kit' },
  { title: 'Trusting the quiet signal', category: "Women's Safety", type: 'Editorial', time: '7 min', tone: 'sage', excerpt: 'Turning situational awareness into a steady habit, without living in fear.', checklistId: 'women-commute' },
];

