/** Safety Hub copy and structure from whaleora.vercel.app, mapped onto
 *  products and tools this site actually ships. */

export type HubProductSlug = 'sos-alarm' | 'pepperspray' | 'whistle' | 'windowbreaker';

export type HubNumber = {
  id: string;
  label: string;
  number?: string;
  note?: string;
};

export type HubChecklist = {
  id: string;
  title: string;
  description: string;
  items: string[];
};

export type HubTool =
  | { kind: 'checklist'; checklistId: string }
  | { kind: 'card'; title: string; description: string; href: string };

export type HubProfile = {
  id: string;
  title: string;
  short: string;
  context: string;
  subtitle: string;
  heading: string;
  intro: string;
  products: HubProductSlug[];
  numbers: string[];
  tools: HubTool[];
  programmes: string[];
  brief: string[];
  libraryCategory: string;
};

export const everydayHabits = [
  'Write one emergency number on paper, not just in your phone.',
  'Put the thing you’d reach for somewhere you can actually reach it.',
  'Look at an unfamiliar route before you’re standing in it.',
  'Tell one person when the plan changes. One is enough.',
  'When something feels off, leave first and explain later.',
  'Charge the phone before you leave — not after you’re already out.',
  'Save the last-mile (gate, stand, hostel block) before you need it.',
  'Keep a paper backup of stay details when you’re travelling.',
  'Agree a meeting point at home, not only a group chat.',
  'Test the alarm or whistle once, so you know it works.',
] as const;

export const hubNumbers: HubNumber[] = [
  { id: 'universal', label: 'All emergencies', number: '112', note: 'Police, fire and ambulance' },
  { id: 'women', label: 'Women helpline', number: '1091' },
  { id: 'police', label: 'Police', number: '100' },
  { id: 'ambulance', label: 'Ambulance', number: '108' },
  { id: 'fire', label: 'Fire', number: '101' },
  { id: 'childline', label: 'Childline', number: '1098' },
  { id: 'tourist', label: 'Tourist helpline', number: '1363' },
  { id: 'campus', label: 'Campus security', note: 'The number on your ID card or hostel board — not a national line.' },
];

export const hubChecklists: HubChecklist[] = [
  {
    id: 'women-commute',
    title: 'Women’s safety checklist',
    description: 'Late-night commute checklist and personal safety essentials.',
    items: [
      'Share live location with one person before you leave.',
      'Confirm the cab number matches the app before the door closes.',
      'Keep the SOS alarm or whistle on the bag you are actually carrying.',
      'Sit where you can leave without asking anyone to move.',
      'If the route changes, say so out loud and get out at a lit stop.',
      'Have 1091 and 112 written down, not only saved as contacts.',
      'Tell one person when you are home. One is enough.',
    ],
  },
  {
    id: 'travel-prep',
    title: 'Travel preparedness',
    description: 'Ride-sharing safety, hotel checks and solo-travel basics.',
    items: [
      'Screenshot the stay address and the host/driver details.',
      'Keep a paper copy of one key contact and the stay name.',
      'Use verified transport; don’t flag a random car at the airport.',
      'On a first night, note two exits from the room before you sleep.',
      'Save offline maps for the last mile from station to stay.',
      'Carry the alarm on the body, not in checked luggage.',
    ],
  },
  {
    id: 'campus',
    title: 'Campus safety guide',
    description: 'Hostel, late class and campus emergency planning.',
    items: [
      'Save campus security and one local friend, not only family back home.',
      'Agree a late-night check-in with a roommate or batchmate.',
      'Look at the last-mile from library or lab before the first late night.',
      'Know two ways out of the hostel floor and the lab.',
      'Keep the whistle on the bag you take to class, not the one in the cupboard.',
      'If a plan changes after 9pm, say so before you move.',
    ],
  },
  {
    id: 'night-travel',
    title: 'Night travel guide',
    description: 'Safe commute protocols and peer travel.',
    items: [
      'Leave with someone when you can; it is a logistics choice, not a character test.',
      'Stand in the lit part of the stand, not the shortcut through the lot.',
      'Share the vehicle number before the wheels move.',
      'Keep one ear free. Music can wait until you’re inside.',
      'If you feel off, get down at a shop or station and rebook.',
    ],
  },
  {
    id: 'travel-safety',
    title: 'Travel safety checklist',
    description: 'Hotel safety, cab safety and solo travel tips.',
    items: [
      'Photograph your luggage tag and the cab number.',
      'Don’t announce the room number in a lobby.',
      'Use the door latch; check the peephole before opening.',
      'Keep documents in two places: one on you, one in the bag.',
      'Tell one person the hotel name and the morning plan.',
    ],
  },
  {
    id: 'documents',
    title: 'Passport and document backup',
    description: 'How to keep copies you can reach if the phone dies.',
    items: [
      'Photograph passport, ticket and stay confirmation.',
      'Email those photos to yourself, and to one person you trust.',
      'Keep a paper print of the stay address in the bag, not only the phone.',
      'Write the embassy/consulate number if you are leaving India.',
      'Do not store card PINs or OTPs with the copies.',
    ],
  },
  {
    id: 'workplace',
    title: 'Workplace safety guide',
    description: 'Office commute and late-evening travel protocols.',
    items: [
      'Tell one colleague when you are leaving after hours.',
      'Park or wait where the building lights still reach.',
      'Keep the alarm on the bag you take to the desk, not in a drawer.',
      'If a client meeting overruns, update the person expecting you.',
      'Avoid the unlit cut-through even if it saves four minutes.',
    ],
  },
  {
    id: 'family-kit',
    title: 'Family safety kit',
    description: 'A calm household plan and child-safety checklist.',
    items: [
      'Pick one out-of-area relative as the family contact.',
      'Write 112 and 1098 where children can see them.',
      'Agree a meeting place outside the building.',
      'Practise the plan once without making it a scare story.',
      'Keep a small torch, paper contacts and any daily medicine in one tin.',
    ],
  },
  {
    id: 'institution',
    title: 'Institution toolkit',
    description: 'Preparedness and emergency-response planning for a campus or workplace.',
    items: [
      'Map the help that already exists: security desk, warden, floor marshal.',
      'Make escalation routes specific: names, numbers, what “urgent” means.',
      'Run one drill a term, then leave the resources up afterwards.',
      'Match tools to the group — night-shift and first-year are not the same kit.',
      'Give people something they can reread privately, not only a session.',
    ],
  },
];

export const hubProfiles: HubProfile[] = [
  {
    id: 'women',
    title: "Women's Safety",
    short: 'Women',
    context: 'Everyday movement',
    subtitle: 'Feel confident wherever life takes you.',
    heading: 'Confidence without the constant vigilance.',
    intro: 'A calm starting point for solo commutes, shared rides and the moments when your instincts ask you to change the plan.',
    products: ['sos-alarm', 'pepperspray', 'whistle'],
    numbers: ['women', 'police', 'ambulance'],
    tools: [
      { kind: 'checklist', checklistId: 'women-commute' },
      { kind: 'card', title: 'Emergency contact card', description: 'A printable ICE card for your wallet or lockscreen.', href: '#emergency-card' },
      { kind: 'checklist', checklistId: 'travel-prep' },
    ],
    programmes: ["Women's safety awareness session"],
    brief: [
      'Share your live location before travelling alone.',
      'Keep emergency contacts one tap away.',
      'Use verified transport whenever possible.',
      'Carry a personal safety device within reach.',
      'Trust your instincts if a situation feels unsafe.',
    ],
    libraryCategory: "Women's Safety",
  },
  {
    id: 'student',
    title: 'Student Safety',
    short: 'Students',
    context: 'Campus & shared living',
    subtitle: 'Stay safe on campus and beyond.',
    heading: 'A plan that still works when class runs late.',
    intro: 'Useful routines for campus days, new neighbourhoods and the blur between studying, socialising and getting home.',
    products: ['sos-alarm', 'whistle'],
    numbers: ['campus', 'police', 'ambulance'],
    tools: [
      { kind: 'checklist', checklistId: 'campus' },
      { kind: 'card', title: 'Student emergency card', description: 'ICE card plus campus security on the same piece of paper.', href: '#emergency-card' },
      { kind: 'checklist', checklistId: 'night-travel' },
    ],
    programmes: ['Campus safety workshop'],
    brief: [
      'Save campus security numbers.',
      'Avoid walking the unlit stretch late at night.',
      'Keep your phone charged before leaving campus.',
      'Inform a friend when you’re travelling.',
      'Know your nearest two exits.',
    ],
    libraryCategory: 'Student Safety',
  },
  {
    id: 'traveller',
    title: 'Travel Safety',
    short: 'Travellers',
    context: 'Transit & new places',
    subtitle: 'Prepare before every journey.',
    heading: 'Stay curious. Make the boring decisions early.',
    intro: 'Preparation for cabs, stations, unfamiliar stays and the small pieces of information that matter when your phone does not.',
    products: ['sos-alarm', 'whistle', 'windowbreaker'],
    numbers: ['tourist', 'police', 'ambulance'],
    tools: [
      { kind: 'checklist', checklistId: 'travel-safety' },
      { kind: 'card', title: 'Emergency travel card', description: 'Quick-reference ICE card for local or longer trips.', href: '#emergency-card' },
      { kind: 'checklist', checklistId: 'documents' },
    ],
    programmes: ['Travel awareness session'],
    brief: [
      'Share your itinerary with someone you trust.',
      'Keep digital copies of important documents.',
      'Use verified transport services.',
      'Save offline maps before travelling.',
      'Carry emergency essentials within easy reach.',
    ],
    libraryCategory: 'Travel',
  },
  {
    id: 'professional',
    title: 'Working Professional',
    short: 'Professionals',
    context: 'Commutes & field work',
    subtitle: 'Stay prepared during your daily commute.',
    heading: 'For the day that ends later than planned.',
    intro: 'A practical end-of-day routine for office teams, independent workers and anyone moving between appointments alone.',
    products: ['sos-alarm', 'pepperspray'],
    numbers: ['police', 'ambulance'],
    tools: [
      { kind: 'checklist', checklistId: 'workplace' },
      { kind: 'card', title: 'Emergency planning', description: 'Build the card you would want a colleague to find.', href: '#emergency-card' },
    ],
    programmes: ['Corporate safety programme'],
    brief: [
      'Plan your commute in advance.',
      'Share your ETA with family.',
      'Avoid isolated routes after dark.',
      'Keep emergency contacts accessible.',
      'Carry your SOS device every day.',
    ],
    libraryCategory: 'Workplace',
  },
  {
    id: 'parent',
    title: 'Parents & Families',
    short: 'Families',
    context: 'Shared preparedness',
    subtitle: 'Prepare your family for emergencies.',
    heading: 'One plan, understood by everyone at home.',
    intro: 'Simple, age-appropriate ways to agree on contacts, meeting points and what to do when you cannot reach each other.',
    products: ['sos-alarm', 'whistle'],
    numbers: ['childline', 'police'],
    tools: [
      { kind: 'checklist', checklistId: 'family-kit' },
      { kind: 'card', title: 'ICE for every member', description: 'One card template, filled in for each person at home.', href: '#emergency-card' },
    ],
    programmes: ['Family safety workshop'],
    brief: [
      'Create a family emergency plan.',
      'Teach children emergency numbers.',
      'Keep ICE information updated.',
      'Practise the plan once, calmly.',
      'Keep a small kit in one known place.',
    ],
    libraryCategory: 'Family',
  },
  {
    id: 'institution',
    title: 'Institutions',
    short: 'Institutions',
    context: 'Schools, teams & communities',
    subtitle: 'Create safer campuses and workplaces.',
    heading: 'Turn individual habits into shared practice.',
    intro: 'A useful first look for people shaping safety culture across campuses, workplaces, schools and community groups.',
    products: ['sos-alarm', 'whistle', 'pepperspray', 'windowbreaker'],
    numbers: ['police', 'fire', 'ambulance'],
    tools: [
      { kind: 'checklist', checklistId: 'institution' },
      { kind: 'card', title: 'Awareness campaign planner', description: 'How we run a session, then leave the resources behind.', href: '/institutions' },
    ],
    programmes: ['School programme', 'College programme', 'Corporate programme', 'NGO programme'],
    brief: [
      'Conduct regular safety drills.',
      'Review evacuation procedures.',
      'Train staff and volunteers.',
      'Inspect emergency equipment frequently.',
      'Promote a culture of preparedness.',
    ],
    libraryCategory: 'All',
  },
];

export const hubProgrammes = [
  { title: 'Schools', text: 'Interactive safety awareness and teacher resources.' },
  { title: 'Colleges', text: 'Campus-focused personal safety and emergency planning.' },
  { title: 'Corporates', text: 'Employee wellbeing and workplace safety sessions.' },
  { title: 'NGOs & communities', text: 'Outreach initiatives and custom safety kits.' },
] as const;

export const checklistById = new Map(hubChecklists.map((item) => [item.id, item]));
export const numberById = new Map(hubNumbers.map((item) => [item.id, item]));
