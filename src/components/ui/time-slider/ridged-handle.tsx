import React from "react";

// The drag handle a locked slice morphs into (from the scrub dot). A rounded
// rectangle with horizontal ridges — ridges run perpendicular to the slice's
// vertical travel to read as a grip. Styled to match the flat teal slider
// language (fill #eef8f9, accent #177991).
export default function RidgedHandle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="34" height="26" viewBox="0 0 34 26" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect
        x="1.25" y="1.25" width="31.5" height="23.5" rx="7"
        fill="#eef8f9" stroke="#177991" strokeWidth="1.5"
      />
      <g stroke="#177991" strokeWidth="1.5" strokeLinecap="round">
        <line x1="12" y1="9.5" x2="22" y2="9.5" />
        <line x1="12" y1="13" x2="22" y2="13" />
        <line x1="12" y1="16.5" x2="22" y2="16.5" />
      </g>
    </svg>
  );
}
