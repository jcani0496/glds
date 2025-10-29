import MorphingTextGLDS from "./MorphingTextGLDS.jsx";

export default function AnimatedLogo({ width = 220, showWordmark = true }) {
  return (
    <div className="grid place-items-center select-none">
      <svg
        className="logo-svg"
        viewBox="0 0 300 280"
        width={width}
        role="img"
        aria-label="GLDS isotipo animado"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g style={{ isolation: "isolate" }}>
          {/* CIAN */}
          <circle
            className="logo-circle logo-circle-1"
            cx="110"
            cy="110"
            r="85"
            fill="#29ABE2"
            fillOpacity="0.9"
            filter="url(#glow)"
            style={{ mixBlendMode: "screen" }}
          />
          {/* MAGENTA */}
          <circle
            className="logo-circle logo-circle-2"
            cx="190"
            cy="110"
            r="85"
            fill="#EC008C"
            fillOpacity="0.9"
            filter="url(#glow)"
            style={{ mixBlendMode: "screen" }}
          />
          {/* AMARILLO */}
          <circle
            className="logo-circle logo-circle-3"
            cx="150"
            cy="170"
            r="85"
            fill="#FFF200"
            fillOpacity="0.9"
            filter="url(#glow)"
            style={{ mixBlendMode: "screen" }}
          />
        </g>
      </svg>

      {showWordmark && (
        <div className="mt-3">
          <MorphingTextGLDS texts={["GLDS", "PROMOVEMOS TU MARCA"]} interval={3000} />
        </div>
      )}

      <style>{`
        .logo-svg {
          filter: drop-shadow(0 0 20px rgba(229, 193, 88, 0.3));
        }

        .logo-circle {
          transform-origin: center;
          animation: logo-pulse 4s ease-in-out infinite;
        }

        .logo-circle-1 {
          animation-delay: 0s;
        }

        .logo-circle-2 {
          animation-delay: 0.4s;
        }

        .logo-circle-3 {
          animation-delay: 0.8s;
        }

        @keyframes logo-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .logo-circle {
            animation: none;
          }
          .logo-svg {
            filter: none;
          }
        }

        @media (hover: hover) {
          .logo-svg:hover .logo-circle {
            animation: logo-pulse 2s ease-in-out infinite;
          }
        }
      `}</style>
    </div>
  );
}