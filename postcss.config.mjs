/** @type {import('postcss-load-config').Config} */
const config = {
    plugins: {
        // This is how Tailwind v4 integrates with Next.js (via PostCSS)
        // It replaces the old @tailwindcss/vite plugin we used with Vite
        "@tailwindcss/postcss": {},
    },
}

export default config
