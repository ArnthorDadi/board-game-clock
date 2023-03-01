const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		colors: {
			background: "rgb(var(--color-background) / <alpha-value>)",
			...colors,
		},
		extend: {
			// that is animation class
			animation: {
				fade: "fadeOut 10s ease-out 0s normal 1 forwards",
			},

			// that is actual animation
			keyframes: (themed) => ({
				fadeOut: {
					"0%": {opacity: 1},
					"80%": {opacity: 0.7},
					"100%": {opacity: 0},
				},
			}),
		},
	},
	mode: "jit",
	plugins: [],
};
