/**
 * Site-wide text. Components read from here instead of hard-coding copy.
 * Mono labels are written in sentence case here and set in capitals by CSS,
 * so screen readers read words rather than letters.
 */
export const site = {
  name: 'Off the Happy Path',
  /** The masthead breaks the name onto these lines. */
  nameLines: ['Off the', 'Happy Path'],
  author: 'Tony Albacete',
  tagline:
    'Notes on software engineering as it actually goes: vague tickets, legacy code, interviews, meetings, and the occasional thing that worked the first time.',
  email: 'tbalbacete@gmail.com',
  github: 'https://github.com/tbalbacete',
  rss: '/rss.xml',

  masthead: {
    titleLabel: 'Title of document',
    cells: [
      { label: 'Author', value: 'Tony Albacete, software engineer' },
      { label: 'Coverage', value: 'The job, not the hype' },
      { label: 'Status', value: 'Ongoing. Mostly.' },
    ],
  },

  /** Main nav. `id` is what pages pass to mark the active item. */
  nav: [
    { id: 'writing', label: 'Writing', href: '/' },
    { id: 'notes', label: 'Notes', href: '/type/note/' },
    { id: 'about', label: 'About', href: '#about' },
    { id: 'rss', label: 'RSS', href: '/rss.xml' },
  ],

  log: {
    /** Heading over the list, per filter. */
    headings: {
      all: 'Log: all entries, newest first',
      essay: 'Log: essays, newest first',
      note: 'Log: notes, newest first',
      rant: 'Log: rants, newest first',
    },
    /** Filter links, in order. */
    filters: [
      { id: 'all', label: 'All', href: '/' },
      { id: 'essay', label: 'Essays', href: '/type/essay/' },
      { id: 'note', label: 'Notes', href: '/type/note/' },
      { id: 'rant', label: 'Rants', href: '/type/rant/' },
    ],
    /** The single line a type page shows when it has no posts. */
    empty: {
      essay: 'No essays yet.',
      note: 'No notes yet.',
      rant: 'No rants yet.',
    },
    noEntries: 'No entries yet.',
    latest: 'Latest',
    draft: 'Draft',
    readEntry: 'Read entry →',
    /** Rendered as `Older entries (008–001) →`. */
    older: 'Older entries',
    olderHref: '/archive/',
  },

  aside: {
    currently: {
      heading: 'Currently',
      labels: { shipping: 'Shipping', reading: 'Reading', annoyedBy: 'Mildly annoyed by' },
    },
    filedUnder: 'Filed under',
    about: {
      heading: 'About this log',
      intro:
        'I write software for a living, outside the big-tech bubble. This is where I write down what the job is actually like.',
      /** The second paragraph, around its "email me" link. */
      reply: {
        before: "There's no comments section. If you disagree, ",
        link: 'email me',
        after: ". If you agree, also email me. That's rarer.",
      },
    },
    links: { rss: 'RSS feed', github: 'GitHub', email: 'Email' },
  },

  footer: {
    left: "© 2026 Tony Albacete · Opinions are mine, not my employer's.",
    right: 'Plain HTML. No tracking. No pop-ups. Hosted for $0.',
  },
} as const;

export type NavId = (typeof site.nav)[number]['id'];
export type FilterId = (typeof site.log.filters)[number]['id'];
