module.exports = {
    extends: [
        // add more generic rulesets here, such as:
        // 'eslint:recommended',
        // 'plugin:vue/vue3-recommended',
        'plugin:vue/base' // Use this if you are using Vue.js 2.x.
    ],
    overrides: [
        {
            files: ['src/views/**/*.vue'],
            rules: {
                'vue/multi-word-component-names': 0,
            },
        },
    ],
}