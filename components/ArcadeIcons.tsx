type IconProps = { className?: string };

export function CoinIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
      <path
        d="M16 8.5v15M12.5 12.5c1-.9 2-1.4 3.5-1.4 2.2 0 3.5 1.2 3.5 2.9 0 1.8-1.4 2.7-3.4 3.2l-1.1.3c-1.7.4-2.5 1.1-2.5 2.3 0 1.4 1.3 2.4 3.4 2.4 1.5 0 2.7-.5 3.7-1.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function JoystickIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <rect x="4" y="22" width="24" height="6" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <path d="M16 22V12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="16" cy="9" r="4.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="9" r="2" fill="currentColor" />
    </svg>
  );
}

export function TrophyIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path
        d="M10 6h12v7c0 4-2.5 7-6 7s-6-3-6-7V6z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M10 8H7c0 3 1.5 5 3.5 5M22 8h3c0 3-1.5 5-3.5 5" stroke="currentColor" strokeWidth="2" />
      <path d="M13 20v3h6v-3M11 26h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CrownIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path
        d="M5 22L7 10l5 6 4-8 4 8 5-6 2 12H5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M6 24h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function LoopIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path
        d="M8 16a8 8 0 0 1 13.5-5.8M24 10v5h-5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 16a8 8 0 0 1-13.5 5.8M8 22v-5h5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RankIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path d="M6 24V14h6v10H6zM13 24V8h6v16h-6zM20 24v-7h6v7h-6z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function FistIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path
        d="M8 14V10.5a2 2 0 0 1 4 0V14M12 14V9.5a2 2 0 0 1 4 0V14M16 14V10a2 2 0 0 1 4 0v4M20 14v-2a2 2 0 0 1 3.5 1.2L25 18c0 4-3 7-7.5 7H14c-3.5 0-6-2.5-6-6v-5h0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PrizeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <rect x="7" y="14" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <path d="M11 14V11l5-4 5 4v3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 18v4M13 20h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ShieldIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path
        d="M16 4L6 8v8c0 7 4.5 11.5 10 13 5.5-1.5 10-6 10-13V8L16 4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 16l3 3 5-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CpuIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <rect x="9" y="9" width="14" height="14" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="13" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 4v4M16 4v4M20 4v4M12 24v4M16 24v4M20 24v4M4 12h4M4 16h4M4 20h4M24 12h4M24 16h4M24 20h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function InfinityIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path
        d="M8.5 16c0-2.8 2-5 4.5-5 3.5 0 5.5 5 7.5 5s4.5-2.2 4.5-5-2-5-4.5-5c-3.5 0-5.5 5-7.5 5S8.5 13.2 8.5 16c0 2.8 2 5 4.5 5 3.5 0 5.5-5 7.5-5s4.5 2.2 4.5 5-2 5-4.5 5c-3.5 0-5.5-5-7.5-5S8.5 18.8 8.5 16z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
