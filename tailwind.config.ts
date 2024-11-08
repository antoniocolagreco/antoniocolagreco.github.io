import tailwindcssForms from "@tailwindcss/forms"
import type { Config } from "tailwindcss"
import tailwindcssAnimate from "tailwindcss-animate"

const config: Config = {
    content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
    theme: {
        extend: {},
    },
    plugins: [tailwindcssForms, tailwindcssAnimate],
}

export default config
