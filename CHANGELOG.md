# react-plotly.js changelog

For more context information, please read through the
[release notes](https://github.com/plotly/react-plotly.js/releases).

To see all merged commits on the default branch that will be part of the next plotly.js release, go to:

<https://github.com/plotly/react-plotly.js/compare/vX.Y.Z...master>

where X.Y.Z is the semver of most recent react-plotly.js release.

## [Unreleased]

## [3.0.0] - 2026-06-09

### Added

- `onClickAnywhere` and `onHoverAnywhere` event props for the corresponding `plotly_clickanywhere` and `plotly_hoveranywhere` events introduced in plotly.js v3 [[#360](https://github.com/plotly/react-plotly.js/pull/360)]

### Changed

- Migrated CI from CircleCI to GitHub Actions [[#362](https://github.com/plotly/react-plotly.js/pull/362)]
- Migrated test framework from enzyme to `@testing-library/react` and bumped jest from 26 to 29 [[#363](https://github.com/plotly/react-plotly.js/pull/363)]

### Removed

- Dropped support for plotly.js v1.x and v2.x; the `plotly.js` peer dependency now requires `>=3.0.0` [[#360](https://github.com/plotly/react-plotly.js/pull/360)]
- Dropped support for React versions older than 18; the `react` peer dependency now requires `^18.0.0 || ^19.0.0` [[#364](https://github.com/plotly/react-plotly.js/pull/364)]

## [2.6.0] - 2022-09-07

### Added

- `onWebGlContextLost` event prop for the `plotly_webglcontextlost` event [[#222](https://github.com/plotly/react-plotly.js/pull/222)], with thanks to @markovist for the contribution!

### Changed

- Updated dependencies [[#285](https://github.com/plotly/react-plotly.js/pull/285)]
