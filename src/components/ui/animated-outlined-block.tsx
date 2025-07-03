import { CSSProperties } from "react";

export default function AnimatedOutlinedBlock() {
  return (
    <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
      <div
        style={
          {
            "--background": "30 41 59",
            "--highlight": "255 255 255",

            "--bg-color":
              "linear-gradient(rgb(var(--background)), rgb(var(--background)))",
            "--border-color": `linear-gradient(145deg,
              rgb(var(--highlight)) 0%,
              rgb(var(--highlight) / 0.3) 33.33%,
              rgb(var(--highlight) / 0.14) 66.67%,
              rgb(var(--highlight) / 0.1) 100%)
            `,
          } as CSSProperties
        }
        className="flex aspect-[2/1] w-full max-w-md flex-col items-center justify-center rounded-xl border border-transparent p-8 text-center
        [background:padding-box_var(--bg-color),border-box_var(--border-color)]"
      >
        <p className="text-xl font-medium text-white">Hello, gradient</p>
      </div>
    </div>
  );
}