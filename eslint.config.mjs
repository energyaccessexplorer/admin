import globals from "globals";
import js from "@eslint/js";

export default [
	{
		"ignores": ["lib/*.js"],
	},
	js.configs.recommended,
	{
		"languageOptions": {
			"globals": {
				...globals.browser,
				"SELF": "writable",
				"Chart": "readonly",
				"dt": "readonly",
				"jwt_decode": "readonly"
			},
			"ecmaVersion": "latest",
			"sourceType": "module",
		},
		"rules": {
			"comma-dangle": ["error", "always-multiline"],
			"indent": ["error", "tab"],
			"key-spacing": ["error", {
				"align": {
					"beforeColon": false,
					"afterColon": true,
					"on": "value",
					"mode": "minimum",
				},
			}],
			"linebreak-style": ["error", "unix"],
			"quotes": "off",
			"quote-props": ["error", "always"],
			"semi": ["error", "always"],
			"prefer-const": "error",
			"no-cond-assign": "off",
			"no-console": "off",
			"no-useless-escape": "off",
			"no-extra-semi": "off",
			"no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
			"no-prototype-builtins": "off",
			"no-unused-vars": ["warn", {
				"varsIgnorePattern": "^_",
				"argsIgnorePattern": "^_",
			}],
		},
	},
];
