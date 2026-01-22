/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    green: '#5BB58C',
                    dark: '#1B4D3E', // Assuming a dark green based on descriptions, can be adjusted
                },
                background: {
                    accent: '#F3F4F6',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Or system-ui, using a safe default for now
            },
            keyframes: {
                'slide-down': {
                    '0%': { transform: 'translateY(-100%)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                }
            },
            animation: {
                'slide-down': 'slide-down 0.3s ease-out',
            }
        },
    },
    plugins: [],
}
