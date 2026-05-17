/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0E1A",
        card: "#111827",
        primary: "#3B82F6",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        text: "#F9FAFB",
        "accent-purple": "#8B5CF6",
      },
    },
  },
  plugins: [],
}
