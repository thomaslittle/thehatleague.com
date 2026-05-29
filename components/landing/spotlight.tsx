// Brand take on Aceternity's "Spotlight (new)": twin angled gradient beams
// shining down from the top corners with a slow horizontal drift — left in
// brand orange, right in a cool blue so it reads against the orange hero.
// Pure CSS (see .thl-spotlight* in globals.css) — no framer-motion / effects.

const ORANGE = "26, 100%"; // brand orange (≈ #F76103)
const BLUE = "210, 100%"; // cool contrast beam

function beams(hue: string) {
  return {
    first: `radial-gradient(68% 68% at 55% 31%, hsla(${hue}, 65%, 0.38) 0, hsla(${hue}, 58%, 0.14) 45%, hsla(${hue}, 45%, 0) 80%)`,
    second: `radial-gradient(50% 50% at 50% 50%, hsla(${hue}, 65%, 0.24) 0, hsla(${hue}, 58%, 0.10) 70%, transparent 100%)`,
    third: `radial-gradient(50% 50% at 50% 50%, hsla(${hue}, 65%, 0.18) 0, hsla(${hue}, 45%, 0.08) 70%, transparent 100%)`,
  };
}

const LEFT = beams(ORANGE);
const RIGHT = beams(BLUE);

const BEAM = "1380px";
const MAIN_W = "560px";
const THIN_W = "240px";

export function Spotlight() {
  return (
    <div
      aria-hidden
      className="thl-spotlight pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Left beam — orange */}
      <div className="thl-spotlight-left absolute top-0 left-0 h-full w-full">
        <div
          className="absolute top-0 left-0"
          style={{
            transform: "translateY(-350px) rotate(-45deg)",
            background: LEFT.first,
            width: MAIN_W,
            height: BEAM,
          }}
        />
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{
            transform: "rotate(-45deg) translate(5%, -50%)",
            background: LEFT.second,
            width: THIN_W,
            height: BEAM,
          }}
        />
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{
            transform: "rotate(-45deg) translate(-180%, -70%)",
            background: LEFT.third,
            width: THIN_W,
            height: BEAM,
          }}
        />
      </div>

      {/* Right beam — blue (mirrored) */}
      <div className="thl-spotlight-right absolute top-0 right-0 h-full w-full">
        <div
          className="absolute top-0 right-0"
          style={{
            transform: "translateY(-350px) rotate(45deg)",
            background: RIGHT.first,
            width: MAIN_W,
            height: BEAM,
          }}
        />
        <div
          className="absolute top-0 right-0 origin-top-right"
          style={{
            transform: "rotate(45deg) translate(-5%, -50%)",
            background: RIGHT.second,
            width: THIN_W,
            height: BEAM,
          }}
        />
        <div
          className="absolute top-0 right-0 origin-top-right"
          style={{
            transform: "rotate(45deg) translate(180%, -70%)",
            background: RIGHT.third,
            width: THIN_W,
            height: BEAM,
          }}
        />
      </div>
    </div>
  );
}
