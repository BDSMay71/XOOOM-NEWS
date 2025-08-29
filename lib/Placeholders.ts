// lib/placeholders.ts
export const XOOOM_LOCAL_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0ea5e9"/>
      <stop offset="100%" stop-color="#1f2937"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <g font-family="Arial, Helvetica, sans-serif" fill="#ffffff" text-anchor="middle">
    <text x="600" y="320" font-size="92" font-weight="700">XOOOM LOCAL</text>
    <text x="600" y="390" font-size="36" opacity="0.85">Local news near you</text>
  </g>
</svg>
`);
