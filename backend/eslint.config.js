import tsEslint from '@typescript-eslint/parser';
import tsEslintPlugin from '@typescript-eslint/eslint-plugin';

export default [{
	files: ["**/*.ts", "**/*.tsx"],
	ignores: [".eslintrc.js"],
	languageOptions: {
		parser: tsEslint,
	},
	plugins: {
		"@typescript-eslint": tsEslintPlugin,
	},
	rules: {
		"semi": ["warn", "never"],
		"no-multi-spaces": "error",
		"indent": ["warn", "tab"],
		"quotes": ["warn", "single"],
		"space-in-parens": ["warn", "never"],
		"comma-spacing": ["warn", { "before": false, "after": true }],
		"key-spacing": ["warn", { "beforeColon": false, "afterColon": true }],
		"object-curly-spacing": ["warn", "always", { "arraysInObjects": true }],
		"array-bracket-spacing": ["warn", "always"],
		"keyword-spacing": ["warn", { "before": true, "after": true }],
		"space-infix-ops": "warn",
		"space-before-blocks": "warn",
		"no-multiple-empty-lines": "warn",
		//"@typescript-eslint/no-explicit-any": "warn",
		"no-console": ["error", { allow: [ "info"] }],
	},
}]