// Function form so the staged file list is NOT appended to `tsc -b`:
// tsc-files can't handle the solution-style tsconfig.json (project references),
// so we type-check the whole app instead — same check as `yarn build`.
export default {
  "src/**/*.{js,jsx,ts,tsx}": (files) => {
    const fileArgs = files.map((f) => JSON.stringify(f)).join(" ");
    return [`eslint --fix ${fileArgs}`, `prettier --write ${fileArgs}`, "tsc -b"];
  },
  "*.{json,css,md}": ["prettier --write"],
};
