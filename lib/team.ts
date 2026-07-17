export type TeamMember = {
  id: string;
  name: string;
  role: string;
  focus: string;
  avatar: string;
  /** Public X/Twitter profile URL when available. */
  x?: string;
  mystery?: boolean;
};

/** Named crew with public profiles — used by footer credits + team cards. */
export const TEAM_PROFILES = [
  { id: "sedan0", name: "Sedano", handle: "@lordsedano", href: "https://x.com/lordsedano" },
  { id: "spraky", name: "Spraky", handle: "@sprakyYGG", href: "https://x.com/sprakyYGG" },
  { id: "daredevil", name: "Daredevil", handle: "@agent_daredevil", href: "https://x.com/agent_daredevil" },
  { id: "aeris", name: "Aeris", handle: "@agent_aeris", href: "https://x.com/agent_aeris" },
] as const;

export type TeamGroup = {
  id: string;
  label: string;
  members: TeamMember[];
};

export const TEAM: TeamGroup[] = [
  {
    id: "exec",
    label: "Exec Team",
    members: [
      {
        id: "sedan0",
        name: "SEDAN0",
        role: "Director",
        focus: "Vibecoder",
        avatar: "/assets/team/sedan0.svg",
        x: "https://x.com/lordsedano",
      },
      {
        id: "spraky",
        name: "SPRAKY",
        role: "Partner",
        focus: "Global Community Lead",
        avatar: "/assets/team/spraky.svg",
        x: "https://x.com/sprakyYGG",
      },
      {
        id: "exec-slot",
        name: "?????",
        role: "??????",
        focus: "??????",
        avatar: "/assets/team/mystery.svg",
        mystery: true,
      },
    ],
  },
  {
    id: "agents",
    label: "Agent Team",
    members: [
      {
        id: "daredevil",
        name: "Daredevil",
        role: "Esports",
        focus: "Match Oracle",
        avatar: "/assets/team/daredevil.svg",
        x: "https://x.com/agent_daredevil",
      },
      {
        id: "aeris",
        name: "Aeris",
        role: "Security",
        focus: "Data Oracle",
        avatar: "/assets/team/aeris.svg",
        x: "https://x.com/agent_aeris",
      },
      {
        id: "chronos",
        name: "Chronos",
        role: "Red Team",
        focus: "House Oracle",
        avatar: "/assets/team/chronos.svg",
      },
    ],
  },
  {
    id: "advisors",
    label: "Advisors",
    members: [
      {
        id: "advisor-1",
        name: "?????",
        role: "??????",
        focus: "??????",
        avatar: "/assets/team/mystery.svg",
        mystery: true,
      },
      {
        id: "advisor-2",
        name: "?????",
        role: "??????",
        focus: "??????",
        avatar: "/assets/team/mystery.svg",
        mystery: true,
      },
      {
        id: "advisor-3",
        name: "?????",
        role: "??????",
        focus: "??????",
        avatar: "/assets/team/mystery.svg",
        mystery: true,
      },
    ],
  },
];
