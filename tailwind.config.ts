import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        val: {
          red: "#FF4655",
          redHover: "#FF5E6C",
          redDark: "#B82C38",
          black: "#0B0E14",
          surface: "#121720",
          surfaceHover: "#18202C",
          surfaceElevated: "#1E2736",
          border: "#232E3F",
          borderLight: "#334155",
          white: "#ECE8E1",
          muted: "#8B97A6",
          dim: "#536273",
        },
        rank: {
          iron: "#7F8590",
          bronze: "#B0794C",
          silver: "#B9CAD6",
          gold: "#EBB338",
          platinum: "#2CBDB8",
          diamond: "#A970EE",
          ascendant: "#19C978",
          immortal: "#EA3867",
          radiant: "#FFE873",
        },
      },
      fontFamily: {
        gaming: ["Tungsten", "Oswald", "Impact", "sans-serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        "val-glow": "0 0 20px -3px rgba(255, 70, 85, 0.35)",
        "val-glow-sm": "0 0 10px -2px rgba(255, 70, 85, 0.25)",
        "val-glow-cyan": "0 0 15px -3px rgba(44, 189, 184, 0.3)",
      },
      backgroundImage: {
        "val-gradient": "linear-gradient(135deg, rgba(255, 70, 85, 0.15) 0%, rgba(18, 23, 32, 0) 60%)",
        "val-mesh": "radial-gradient(at 0% 0%, rgba(255, 70, 85, 0.12) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(44, 189, 184, 0.08) 0px, transparent 50%)",
      },
    },
  },
  plugins: [],
};
export default config;

