export type TeamMember = {
  id: string;
  name: string;
  role: string;
  focus: string;
  avatar: string;
  mystery?: boolean;
};

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
      },
      {
        id: "spraky",
        name: "SPRAKY",
        role: "Partner",
        focus: "Community Lead",
        avatar: "/assets/team/spraky.svg",
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
      },
      {
        id: "aeris",
        name: "Aeris",
        role: "Security",
        focus: "Data Oracle",
        avatar: "/assets/team/aeris.svg",
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
