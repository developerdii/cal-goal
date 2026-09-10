import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },

  // Core recommended rules (syntax + correctness for all JS).
  js.configs.recommended,

  // Vue 3 recommended rules (essential + strongly-recommended + recommended).
  ...pluginVue.configs['flat/recommended'],

  {
    name: 'calgoal/settings',
    files: ['**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.builtin,
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // Single-word utility/root components are intentional in this project.
      'vue/multi-word-component-names': ['error', { ignores: ['App', 'Icon'] }],

      // Formatting-only rules. This project uses its own hand-formatted style
      // (no Prettier), so these layout conventions would only add noise.
      // Correctness rules stay enabled.
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/attributes-order': 'off',
    },
  },
]
