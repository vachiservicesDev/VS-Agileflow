export interface GuidePost {
  slug: string
  title: string
  description: string
  date: string
  minutesToRead: number
  body: string[]
}

export const guides: GuidePost[] = [
  {
    slug: 'sprint-planning-tips',
    title: '5 Tips for Effective Sprint Planning',
    description: 'Practical tactics to run crisp planning sessions and unlock team momentum.',
    date: '2025-09-10',
    minutesToRead: 5,
    body: [
      'Keep the goal explicit. Align on a single sprint goal that everyone can articulate.',
      'Timebox estimation. Use Planning Poker to keep discussion focused and avoid anchoring.',
      'Clarify acceptance criteria. A clear definition prevents rework and misaligned scope.',
      'Sequence by value and risk. Pull high-value or unknown stories earlier for learning.',
      'Finish strong. Confirm capacity, owners, and definition of done for each committed story.'
    ]
  },
  {
    slug: 'productive-retrospectives',
    title: 'How to Run a Productive Retrospective',
    description: 'A lightweight format that produces insights and action items without ceremony fatigue.',
    date: '2025-09-08',
    minutesToRead: 6,
    body: [
      'Start with safety. Remind the team that learning beats blame.',
      'Use a simple frame: Keep / Start / Stop. Capture insights rapidly on sticky notes.',
      'Cluster and vote. Group similar themes, dot-vote to prioritize, then discuss top items.',
      'Lock actions. Convert insights to 1–3 concrete owners and due dates.',
      'Close with a confidence check to measure sentiment and improve next time.'
    ]
  }
]

export const getGuideBySlug = (slug: string) => guides.find(g => g.slug === slug)

