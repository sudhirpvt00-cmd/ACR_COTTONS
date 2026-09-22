/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F4ECE1',
          300: '#EBDDCC',
          400: '#DECBBA',
          500: '#CCAFA0',
        },
        ivory: '#F6F0E6',
        espresso: '#1A1410',
        gold: {
          50: '#FBF6EA',
          100: '#F4E8C8',
          200: '#E8D5A3',
          300: '#DCC07A',
          400: '#D4AF37',
          500: '#C4A35A',
          600: '#B08D3E',
          700: '#8C6E2C',
        },
        charcoal: {
          50: '#F6F7F9',
          100: '#E8EAED',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#0B0F17',
        },
        maroon: {
          50: '#FAF0F2',
          100: '#F4DEE3',
          200: '#EABDC6',
          500: '#9B1B30',
          600: '#8A182B',
          700: '#751323',
          800: '#60101D',
          900: '#480C16',
        },
        terracotta: {
          50: '#FFF7F2',
          100: '#FFEFE6',
          500: '#E05D26',
          600: '#C84D19',
          700: '#AC3D12',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(138, 24, 43, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 10px 30px -5px rgba(184, 66, 26, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.04)',
        'elevated': '0 20px 40px -10px rgba(138, 24, 43, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
