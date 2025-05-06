module.exports = {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    {
      rules: {
        "regex-scope": (parsed, _when = "always", value = new RegExp("")) => {
          if (!parsed.scope) {
            return [true, ""];
          }

          return value.test(parsed.scope.toUpperCase())
            ? [true, ""]
            : [false, "scope must be present"];
        },
      },
    },
  ],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
    // 'regex-scope': [
    //   2,
    //   'always',
    //   new RegExp(/^(ENG|WEB|MOB)-.*?(?=[).:\n; -]|$)/),
    // ],
  },
};
