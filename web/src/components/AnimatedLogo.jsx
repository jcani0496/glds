// web/src/components/AnimatedLogo.jsx
import MorphingTextGLDS from "./MorphingTextGLDS.jsx";

export default function AnimatedLogo({ width = 220, showWordmark = true }) {
  return (
    <div className="grid place-items-center select-none">
      <svg
        className="logo-svg"
        viewBox="0 0 300 240"
        width={width}
        role="img"
        aria-label="GLDS isotipo animado"
      >
        <g style={{ isolation: "isolate" }}>
          {/* CIAN */}
          <circle
            className="logo-circle c1"
            cx="110"
            cy="110"
            r="85"
            fill="#29ABE2"
            fillOpacity="0.9"
            style={{ mixBlendMode: "screen", "--tx": "-80px", "--ty": "-40px" }}
          />
          {/* MAGENTA */}
          <circle
            className="logo-circle c2"
            cx="190"
            cy="110"
            r="85"
            fill="#EC008C"
            fillOpacity="0.9"
            style={{ mixBlendMode: "screen", "--tx": "80px", "--ty": "-40px" }}
          />
          {/* AMARILLO */}
          <circle
            className="logo-circle c3"
            cx="150"
            cy="170"
            r="85"
            fill="#FFF200"
            fillOpacity="0.9"
            style={{ mixBlendMode: "screen", "--tx": "0px", "--ty": "90px" }}
          />
        </g>
      </svg>

      {showWordmark && (
        <div className="mt-3">
          <MorphingTextGLDS texts={["GLDS", "PROMOVEMOS TU MARCA"]} interval={3000} />
        </div>
      )}
    </div>
  );
}