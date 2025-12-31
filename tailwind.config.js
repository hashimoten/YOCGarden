/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'in': 'in .6s both',
                'in-reverse': 'in-reverse .6s both',
            },
            keyframes: {
                'in': {
                    '0%': { transform: 'translateY(18px)', opacity: 0 },
                    '100%': { transform: 'translateY(0)', opacity: 1 },
                },
                'in-reverse': {
                    '0%': { transform: 'translateY(-18px)', opacity: 0 },
                    '100%': { transform: 'translateY(0)', opacity: 1 },
                }
            }
        },
    },
    plugins: [],
}
