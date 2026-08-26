import { useEffect, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";

// ----------------------------------------------------------------------
/**
 * Auto-advancing illustration strip for the login panel.
 * Slides left every `INTERVAL` ms. All artwork is inline SVG - nothing is
 * fetched, so it renders instantly and can never 404.
 */

const INTERVAL = 2000;

const VIOLET = "#8B5CF6";
const VIOLET_DEEP = "#6D28D9";
const VIOLET_SOFT = "#C4B5FD";
const MINT = "#5EEAD4";
const AMBER = "#FCD34D";

function Glow() {
  return (
    <>
      <ellipse cx="130" cy="150" rx="112" ry="112" fill="url(#glow)" />
      <defs>
        <radialGradient id="glow">
          <stop offset="0%" stopColor={VIOLET} stopOpacity="0.55" />
          <stop offset="70%" stopColor={VIOLET} stopOpacity="0.08" />
          <stop offset="100%" stopColor={VIOLET} stopOpacity="0" />
        </radialGradient>
      </defs>
    </>
  );
}

/** 1 - phone with a card flying out (mobile payments) */
function ArtMobilePay() {
  return (
    <svg viewBox="0 0 260 300" width="100%" height="100%" role="img" aria-label="Mobile payments">
      <Glow />
      <g transform="rotate(-14 130 160)">
        <rect x="86" y="82" width="92" height="160" rx="14" fill="#1E1B4B" stroke={VIOLET_SOFT} strokeOpacity="0.4" />
        <rect x="94" y="92" width="76" height="140" rx="10" fill="#2E1065" />
        <circle cx="132" cy="150" r="30" fill={VIOLET} fillOpacity="0.25" stroke={VIOLET_SOFT} strokeWidth="2" />
        <text x="132" y="160" textAnchor="middle" fill="#fff" fontSize="26" fontWeight="700">
          ₹
        </text>
        <rect x="106" y="196" width="52" height="7" rx="3.5" fill={VIOLET_SOFT} fillOpacity="0.5" />
        <rect x="116" y="210" width="32" height="7" rx="3.5" fill={VIOLET_SOFT} fillOpacity="0.3" />
      </g>
      <g transform="rotate(-14 130 160)">
        <rect x="120" y="46" width="104" height="62" rx="10" fill={VIOLET_DEEP} stroke={MINT} strokeOpacity="0.5" />
        <rect x="130" y="62" width="26" height="18" rx="4" fill={AMBER} />
        <rect x="130" y="88" width="60" height="6" rx="3" fill="#fff" fillOpacity="0.55" />
      </g>
    </svg>
  );
}

/** 2 - shield + lock (secure infrastructure) */
function ArtSecurity() {
  return (
    <svg viewBox="0 0 260 300" width="100%" height="100%" role="img" aria-label="Secure infrastructure">
      <Glow />
      <path
        d="M130 62l64 26v58c0 44-27 78-64 92-37-14-64-48-64-92V88l64-26z"
        fill="#2E1065"
        stroke={VIOLET_SOFT}
        strokeOpacity="0.55"
        strokeWidth="2"
      />
      <path d="M130 62l64 26v58c0 44-27 78-64 92V62z" fill={VIOLET} fillOpacity="0.16" />
      <rect x="106" y="146" width="48" height="40" rx="8" fill={VIOLET} />
      <path d="M116 146v-12a14 14 0 0128 0v12" fill="none" stroke={MINT} strokeWidth="6" strokeLinecap="round" />
      <circle cx="130" cy="164" r="5" fill="#1E1B4B" />
      <rect x="128" y="166" width="4" height="12" rx="2" fill="#1E1B4B" />
    </svg>
  );
}

/** 3 - rising bars + trend line (growth analytics) */
function ArtGrowth() {
  return (
    <svg viewBox="0 0 260 300" width="100%" height="100%" role="img" aria-label="Growth analytics">
      <Glow />
      <rect x="58" y="92" width="144" height="126" rx="14" fill="#1E1B4B" stroke={VIOLET_SOFT} strokeOpacity="0.35" />
      <rect x="76" y="164" width="20" height="38" rx="5" fill={VIOLET} fillOpacity="0.55" />
      <rect x="106" y="142" width="20" height="60" rx="5" fill={VIOLET} fillOpacity="0.75" />
      <rect x="136" y="152" width="20" height="50" rx="5" fill={VIOLET} fillOpacity="0.6" />
      <rect x="166" y="118" width="20" height="84" rx="5" fill={MINT} fillOpacity="0.85" />
      <path d="M78 150l30-18 28 12 40-34" fill="none" stroke={AMBER} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="176" cy="110" r="6" fill={AMBER} />
    </svg>
  );
}

/** 4 - wallet with stacked cards */
function ArtWallet() {
  return (
    <svg viewBox="0 0 260 300" width="100%" height="100%" role="img" aria-label="Unified wallet">
      <Glow />
      <rect x="62" y="96" width="136" height="44" rx="10" fill={VIOLET} fillOpacity="0.35" transform="rotate(-8 130 118)" />
      <rect x="70" y="118" width="120" height="40" rx="10" fill={MINT} fillOpacity="0.35" transform="rotate(-4 130 138)" />
      <rect x="60" y="140" width="140" height="86" rx="16" fill="#2E1065" stroke={VIOLET_SOFT} strokeOpacity="0.5" strokeWidth="2" />
      <rect x="60" y="166" width="140" height="16" fill={VIOLET} fillOpacity="0.35" />
      <rect x="150" y="160" width="44" height="28" rx="8" fill="#1E1B4B" stroke={MINT} strokeOpacity="0.6" />
      <circle cx="172" cy="174" r="6" fill={MINT} />
      <rect x="78" y="196" width="46" height="7" rx="3.5" fill="#fff" fillOpacity="0.4" />
    </svg>
  );
}

/** 5 - globe with transfer arcs (settlement network) */
function ArtNetwork() {
  return (
    <svg viewBox="0 0 260 300" width="100%" height="100%" role="img" aria-label="Settlement network">
      <Glow />
      <circle cx="130" cy="156" r="62" fill="#2E1065" stroke={VIOLET_SOFT} strokeOpacity="0.5" strokeWidth="2" />
      <ellipse cx="130" cy="156" rx="62" ry="24" fill="none" stroke={VIOLET_SOFT} strokeOpacity="0.35" />
      <ellipse cx="130" cy="156" rx="26" ry="62" fill="none" stroke={VIOLET_SOFT} strokeOpacity="0.35" />
      <path d="M68 156h124" stroke={VIOLET_SOFT} strokeOpacity="0.35" />
      <path d="M74 110c34-26 78-26 112 0" fill="none" stroke={MINT} strokeWidth="3" strokeLinecap="round" strokeDasharray="6 8" />
      <path d="M74 202c34 26 78 26 112 0" fill="none" stroke={AMBER} strokeWidth="3" strokeLinecap="round" strokeDasharray="6 8" />
      <circle cx="74" cy="110" r="7" fill={MINT} />
      <circle cx="186" cy="202" r="7" fill={AMBER} />
      <circle cx="130" cy="156" r="10" fill={VIOLET} />
    </svg>
  );
}

const SLIDES = [
  { key: "pay", art: <ArtMobilePay />, caption: "Move money in seconds, not days." },
  { key: "secure", art: <ArtSecurity />, caption: "Bank-grade security on every request." },
  { key: "growth", art: <ArtGrowth />, caption: "Watch every rupee, live." },
  { key: "wallet", art: <ArtWallet />, caption: "One wallet for every service." },
  { key: "network", art: <ArtNetwork />, caption: "Settlements across the network." },
];

// ----------------------------------------------------------------------

export default function FintechSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;

    const timer = setInterval(
      () => setIndex((current) => (current + 1) % SLIDES.length),
      INTERVAL
    );

    return () => clearInterval(timer);
  }, [paused]);

  return (
    <Stack
      alignItems="center"
      sx={{ width: "100%" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Box sx={{ width: "100%", overflow: "hidden" }}>
        <Stack
          direction="row"
          sx={{
            width: `${SLIDES.length * 100}%`,
            transform: `translateX(-${index * (100 / SLIDES.length)}%)`,
            transition: "transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {SLIDES.map((slide) => (
            <Stack
              key={slide.key}
              alignItems="center"
              sx={{ width: `${100 / SLIDES.length}%`, flexShrink: 0, px: 2 }}
            >
              <Box sx={{ width: "100%", maxWidth: 230, height: 250 }}>{slide.art}</Box>
              <Typography
                sx={{
                  mt: 1,
                  fontSize: 13.5,
                  textAlign: "center",
                  color: "rgba(255,255,255,0.72)",
                }}
              >
                {slide.caption}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* dots */}
      <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
        {SLIDES.map((slide, dot) => (
          <Box
            key={slide.key}
            onClick={() => setIndex(dot)}
            sx={{
              width: dot === index ? 22 : 7,
              height: 7,
              borderRadius: 99,
              cursor: "pointer",
              backgroundColor:
                dot === index ? "#fff" : "rgba(255,255,255,0.32)",
              transition: "all 0.35s ease",
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
}
