export function ShopPlusLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* SH */}
      <text
        x="0"
        y="38"
        fontFamily="Inter, ui-sans-serif, sans-serif"
        fontWeight="900"
        fontSize="42"
        letterSpacing="-2"
        fill="#1e3a8a"
      >
        SH
      </text>

      {/* O circle with AI inside */}
      <circle cx="104" cy="22" r="20" fill="url(#aiGrad)" opacity="0.15" />
      <circle cx="104" cy="22" r="20" stroke="url(#aiGrad)" strokeWidth="2.5" fill="none" />
      {/* AI text inside circle */}
      <text
        x="104"
        y="29"
        textAnchor="middle"
        fontFamily="Inter, ui-sans-serif, sans-serif"
        fontWeight="800"
        fontSize="16"
        fill="url(#aiGrad)"
      >
        Ai
      </text>

      {/* P+ */}
      <text
        x="126"
        y="38"
        fontFamily="Inter, ui-sans-serif, sans-serif"
        fontWeight="900"
        fontSize="42"
        letterSpacing="-2"
        fill="#1e3a8a"
      >
        P+
      </text>

      {/* Subtitle */}
      <text
        x="0"
        y="50"
        fontFamily="Inter, ui-sans-serif, sans-serif"
        fontWeight="500"
        fontSize="9"
        letterSpacing="2"
        fill="#1e3a8a"
        opacity="0.6"
      >
        AI-POWERED CRM
      </text>

      <defs>
        <linearGradient id="aiGrad" x1="84" y1="2" x2="124" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
    </svg>
  );
}
