type P = { className?: string };
const base = {
  width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true,
};

export const Icon = {
  shield: (p: P) => (<svg {...base} {...p}><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></svg>),
  ruler: (p: P) => (<svg {...base} {...p}><path d="M3 17L17 3l4 4L7 21l-4-4z" /><path d="M7 13l2 2M10 10l2 2M13 7l2 2" /></svg>),
  factory: (p: P) => (<svg {...base} {...p}><path d="M3 21V10l6 4V10l6 4V6h6v15H3z" /><path d="M8 21v-3M13 21v-3M18 21v-3" /></svg>),
  wrench: (p: P) => (<svg {...base} {...p}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></svg>),
  palette: (p: P) => (<svg {...base} {...p}><path d="M12 3a9 9 0 100 18c1.5 0 2-1 1.5-2s0-2 1.5-2h2a3 3 0 003-3c0-6-4-11-8-11z" /><circle cx="8" cy="11" r="1" /><circle cx="12" cy="7.5" r="1" /><circle cx="16" cy="10" r="1" /></svg>),
  check: (p: P) => (<svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.7 2.7L16 9.5" /></svg>),
  phone: (p: P) => (<svg {...base} {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" /></svg>),
  chat: (p: P) => (<svg {...base} {...p}><path d="M4 5h16v11H9l-5 4V5z" /></svg>),
  pin: (p: P) => (<svg {...base} {...p}><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>),
  clock: (p: P) => (<svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>),
  close: (p: P) => (<svg {...base} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>),
  menu: (p: P) => (<svg {...base} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>),
  plus: (p: P) => (<svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>),
  arrow: (p: P) => (<svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>),
  note: (p: P) => (<svg {...base} {...p}><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></svg>),
  star: (p: P) => (<svg {...base} {...p}><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" /></svg>),
};

export type IconName = keyof typeof Icon;
