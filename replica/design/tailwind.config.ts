import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          hover: 'var(--color-surface-hover)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          input: 'var(--color-border-input)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
        },
        'on-accent': 'var(--color-on-accent)',
        danger: {
          DEFAULT: 'var(--color-danger)',
        },
        'on-danger': 'var(--color-on-danger)',
        success: {
          DEFAULT: 'var(--color-success)',
        },
        'on-success': 'var(--color-on-success)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px', fontWeight: '500' }],
        sm: ['14px', { lineHeight: '20px', fontWeight: '400' }],
        base: ['16px', { lineHeight: '24px', fontWeight: '400' }],
        lg: ['20px', { lineHeight: '28px', fontWeight: '600' }],
        xl: ['28px', { lineHeight: '34px', fontWeight: '700' }],
        display: ['40px', { lineHeight: '48px', fontWeight: '800' }],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        pop: 'var(--shadow-pop)',
      },
      transitionTimingFunction: {
        bounce: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      spacing: {
        header: 'var(--layout-header-height)',
        sidebar: 'var(--layout-sidebar-width)',
        dropzone: 'var(--layout-dropzone-min-height)',
      },
      maxWidth: {
        content: 'var(--layout-max-width)',
      },
    },
  },
  plugins: [],
};

export default config;
