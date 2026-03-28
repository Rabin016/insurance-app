/** @type {import('tailwindcss').Config} */
module.exports = {
  // Include all source files for NativeWind class scanning
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      // Custom color palette matching the Stitch "Fire Insurance" dark design
      colors: {
        // Background layers
        bg: {
          primary: "#0D1117",    // Deepest background
          secondary: "#111827",  // Card background
          tertiary: "#1F2937",   // Elevated card / input bg
          elevated: "#1E293B",   // Glassmorphism card
        },
        // Brand accent — Fire / Amber / Orange
        fire: {
          50:  "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316",  // Primary accent
          600: "#EA580C",  // Pressed / active
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
        },
        // Neutral surface tones
        surface: {
          DEFAULT: "#1E293B",
          border:  "#2D3748",
          muted:   "#374151",
        },
        // Text hierarchy
        text: {
          primary:   "#F9FAFB",
          secondary: "#9CA3AF",
          muted:     "#6B7280",
          accent:    "#F97316",
        },
        // Semantic colors
        success: "#10B981",
        error:   "#EF4444",
        warning: "#F59E0B",
      },
      // Custom font family — Inter for clean modern typography
      fontFamily: {
        inter:      ["Inter_400Regular"],
        "inter-md": ["Inter_500Medium"],
        "inter-sb": ["Inter_600SemiBold"],
        "inter-bd": ["Inter_700Bold"],
      },
      // Custom border radius tokens
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
    },
  },
  plugins: [],
};
