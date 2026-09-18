// Shared 20x20 stroke icons for admin KPI cards (dashboard + reviews),
// matching the thin-stroke, rounded-cap style used across the admin nav
// and notification icons.
export const KPI_ICONS = {
  bag: (
    <path
      d="M5.5 7.5h9l.6 9.5a1 1 0 0 1-1 1.05H5.9a1 1 0 0 1-1-1.05l.6-9.5Z M7.5 7.5V6a2.5 2.5 0 0 1 5 0v1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  clock: (
    <>
      <circle cx="10" cy="10" r="7.25" />
      <path d="M10 6v4l2.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  check: (
    <>
      <circle cx="10" cy="10" r="7.25" />
      <path d="M6.75 10.25 9 12.5l4.25-5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  stack: (
    <path
      d="M10 3 17 6.5 10 10 3 6.5 10 3Z M3 10l7 3.5 7-3.5 M3 13.5l7 3.5 7-3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  hourglass: (
    <path
      d="M5.5 3h9 M5.5 17h9 M6 3c0 3 1.5 5 4 6-2.5 1-4 3-4 6M14 3c0 3-1.5 5-4 6 2.5 1 4 3 4 6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  rupee: (
    <path
      d="M6 4h8M6 7.5h8M6 4c3.5 0 5.5 1 5.5 3.5S9.5 11 6 11h1.5L14 17"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  box: (
    <path
      d="M3 6.5 10 3l7 3.5v7L10 17l-7-3.5v-7Z M3 6.5 10 10l7-3.5 M10 10v7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  truck: (
    <path
      d="M2.5 5.5h8v8h-8Z M10.5 8.5h4l2.5 2.5v2.5h-6.5Z M5 16a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z M13.5 16a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  home: (
    <path
      d="M3.5 9.5 10 4l6.5 5.5V17a1 1 0 0 1-1 1h-3.5v-5h-4v5H4.5a1 1 0 0 1-1-1V9.5Z M8 14.5l1.5 1.5 2.5-3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  xCircle: (
    <>
      <circle cx="10" cy="10" r="7.25" />
      <path d="M7.5 7.5l5 5M12.5 7.5l-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  undo: (
    <path
      d="M4 8.5h7a4.5 4.5 0 0 1 0 9H9.5 M4 8.5l3-3M4 8.5l3 3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  chat: (
    <path
      d="M3 4.5h14v9H8.5L5 16.5v-3H3Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  eye: (
    <>
      <path d="M2.5 10s2.8-5.5 7.5-5.5S17.5 10 17.5 10 14.7 15.5 10 15.5 2.5 10 2.5 10Z" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.25" />
    </>
  ),
  star: (
    <path
      d="M10 2.8l2.14 4.53 4.96.62-3.63 3.5.94 4.95L10 13.9l-4.41 2.5.94-4.95-3.63-3.5 4.96-.62L10 2.8Z"
      strokeLinejoin="round"
    />
  ),
} as const;
