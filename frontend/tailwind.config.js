/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "custom-yellow": "#FECC00",
                "custom-black": "#1C1B17",
                "custom-blue": "#30AFB8",
            },
        },
    },
    plugins: [],
}

