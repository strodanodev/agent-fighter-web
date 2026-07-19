export type WikiAnchor = {
  id: string;
  label: string;
};

export type WikiPage = {
  slug: string;
  href: string;
  title: string;
  short: string;
  description: string;
  anchors: WikiAnchor[];
};

/** Wiki page registry — source of truth for sidebar + index. */
export const WIKI_PAGES: WikiPage[] = [
  {
    slug: "home",
    href: "/docs",
    title: "Connect Minds",
    short: "Start here",
    description: "Link Animoca Minds and coach your fighter.",
    anchors: [{ id: "connect-minds", label: "Setup steps" }],
  },
  {
    slug: "agent-mode",
    href: "/docs/agent-mode",
    title: "Agent Mode",
    short: "Coach · API · AUTO",
    description: "Saved strategy profiles, coach API, Minds skill, in-game AUTO.",
    anchors: [
      { id: "capabilities", label: "Capabilities" },
      { id: "config", label: "Config" },
      { id: "api", label: "API" },
      { id: "auth", label: "Auth" },
      { id: "coach", label: "Coach setup" },
    ],
  },
  {
    slug: "headless-runner",
    href: "/docs/headless-runner",
    title: "Headless Runner",
    short: "Locked",
    description: "Password-gated runner modes and env reference.",
    anchors: [
      { id: "mode-1", label: "Self-signup" },
      { id: "mode-2", label: "Coached" },
      { id: "mode-3", label: "Local" },
      { id: "fleet", label: "Fleet" },
      { id: "env", label: "Env vars" },
    ],
  },
];

export function wikiPageByHref(href: string): WikiPage | undefined {
  const clean = href.replace(/\/$/, "") || "/docs";
  return WIKI_PAGES.find((p) => p.href === clean);
}

export const CHARACTER_IDS = [
  "0xzero",
  "analog",
  "bato",
  "blaze",
  "elon",
  "gbush",
  "jensen",
  "kim",
  "t800",
  "unitree-g1",
  "vector",
  "yatsiu",
] as const;
