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
  /** The first link on every page, for keyboard users. */
  skipLink: 'Skip to content',

  /** The shared Open Graph image in `public/`. */
  og: {
    image: '/og.png',
    width: 1200,
    height: 630,
    alt: 'Off the Happy Path: notes on software engineering as it actually goes.',
  },

  /** Display names for tags, by slug. Any tag not listed shows in sentence case. */
  tagNames: {
    ai: 'AI (honestly)',
  } as Record<string, string>,

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
    { id: 'about', label: 'About', href: '/about/' },
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
    /** The meta description of each type page. */
    descriptions: {
      essay: 'Essays from Off the Happy Path, newest first.',
      note: 'Short notes from Off the Happy Path, newest first.',
      rant: 'Rants from Off the Happy Path, newest first.',
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

  post: {
    /** The kicker reads `№ 015 · ESSAY · Filed 2026-11-12`. */
    filed: 'Filed',
    /** The entry details column, in order. */
    meta: {
      label: 'Entry details',
      entry: 'Entry',
      filed: 'Filed',
      revised: 'Revised',
      readingTime: 'Reading time',
      filedUnder: 'Filed under',
      confidence: 'Confidence',
      /** Shown for a missing revised date or no tags. */
      none: '—',
      /** `9 min`. */
      minutes: 'min',
    },
    reply: {
      label: 'Reply',
      /** `Disagree? Good. [Email me] with the subject line “Re: № 015.” I read all of it…` */
      before: 'Disagree? Good. ',
      link: 'Email me',
      subjectBefore: ' with the subject line “',
      subjectAfter: '.” I read all of it and answer most of it.',
      /** The subject is this plus the entry number: `Re: № 015`. */
      subjectPrefix: 'Re: ',
    },
    more: {
      label: 'More entries',
      previous: '← Previous',
      next: 'Next →',
      /** Next, on the newest entry. */
      newestEnd: 'Not written yet.',
      /** Previous, on the oldest entry. */
      oldestEnd: 'Nothing before this. It starts here.',
    },
    share: {
      label: 'Share',
      /** The button's label, and what it reads for about 2 seconds after a copy. */
      copy: 'Copy link',
      copied: 'Copied',
      /** Screen-reader messages in the box's live region. */
      copiedStatus: 'Link copied',
      fallbackStatus: 'Press Ctrl+C or Cmd+C to copy',
      /** The share links, in order. Labels are plain words: no logos or icons. */
      networks: [
        { id: 'email', label: 'Email' },
        { id: 'linkedin', label: 'LinkedIn' },
        { id: 'bluesky', label: 'Bluesky' },
        { id: 'x', label: 'X' },
      ],
    },
  },

  /** `1 entry`, `3 entries`. */
  entryCount: { one: 'entry', other: 'entries' },

  /** Tag pages, `/tag/<slug>/`. */
  tag: {
    kicker: 'Filed under',
    /** The dek reads `3 entries, newest first.` */
    dekAfter: ', newest first.',
    /** The description reads `Entries filed under Process, newest first.` */
    descriptionBefore: 'Entries filed under ',
    descriptionAfter: ', newest first.',
  },

  /** The archive, `/archive/`. */
  archive: {
    kicker: 'Archive',
    title: 'Every entry',
    metaTitle: 'Archive',
    /** The dek reads `3 entries, grouped by year, newest first.` */
    dekAfter: ', grouped by year, newest first.',
    description: 'Every entry in Off the Happy Path, grouped by year, newest first.',
    empty: 'No entries yet.',
  },

  /** `/about/`. The paragraphs are the home aside's ABOUT THIS LOG copy (M5 writes the real page). */
  about: {
    kicker: 'About',
    title: 'About this log',
    metaTitle: 'About',
    description: 'Who writes Off the Happy Path, and how to reply.',
    /** The aside's accessible name for the AUTHOR / COVERAGE / STATUS column. */
    metaLabel: 'About the log',
    /** The "On AI" section, around its "email me" link. The footer links here. */
    ai: {
      id: 'on-ai',
      heading: 'On AI',
      before:
        "Yes, AI helped build this site: the layout, the build scripts, most of the plumbing. And yes, it helps me get drafts into shape. No, it isn't the brains here. The ideas, the stories and the opinions are mine, and so are the mistakes. If something reads like a person didn't write it, ",
      link: 'email me',
      after: ' and tell me where.',
    },
  },

  /** The 404 page. */
  notFound: {
    kicker: '№ 404 · Not found',
    title: 'Nothing filed here',
    metaTitle: 'Not found',
    dek: 'This page doesn’t exist, or it moved and nobody updated the ticket.',
    linksLabel: 'Where to go instead',
    links: [
      { label: 'Back to the log', href: '/' },
      { label: 'Every entry', href: '/archive/' },
      { label: 'RSS feed', href: '/rss.xml' },
    ],
  },

  footer: {
    left: "© 2026 Tony Albacete · Opinions are mine, not my employer's.",
    right: 'Plain HTML. No tracking. No pop-ups. Hosted for $0.',
    /** After the right-hand line: a link to the About page's "On AI" section. */
    ai: { label: 'Built with some help from AI →', href: '/about/#on-ai' },
  },
} as const;

export type NavId = (typeof site.nav)[number]['id'];
export type FilterId = (typeof site.log.filters)[number]['id'];
