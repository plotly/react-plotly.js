# react-plotly.js changelog

For more context information, please read through the
[release notes](https://github.com/plotly/react-plotly.js/releases).

To see all merged commits on the default branch that will be part of the next plotly.js release, go to:

<https://github.com/plotly/react-plotly.js/compare/vX.Y.Z...main>

where X.Y.Z is the semver of most recent react-plotly.js release.

## [Unreleased]

### Added

- Added missing `onTreemapClick` and `onIcicleClick` event props for the `plotly_treemapclick` and `plotly_icicleclick` events [[#376](https://github.com/plotly/react-plotly.js/pull/376)]
- Added additional missing events: `onLegendTitleClick`, `onLegendTitleDoubleClick`, `onBeforePlot`, `onAnimating`, and `onTransitioned` [[#376](https://github.com/plotly/react-plotly.js/pull/376)]

### Fixed

- Returning `false` from `onSunburstClick`, `onTreemapClick`, or `onIcicleClick` now prevents the drill-down [[#376](https://github.com/plotly/react-plotly.js/pull/376)]
  - `onUpdate` now fires for these via `plotly_animated`, so it reports the figure after the new `level` is applied and no longer fires when the drill-down is cancelled

### Removed

- Removed the errantly added `onClickAnywhere` and `onHoverAnywhere` props [[#376](https://github.com/plotly/react-plotly.js/pull/376)]
  - plotly.js has no `plotly_clickanywhere` or `plotly_hoveranywhere` events, so these never fired
  - `clickanywhere` and `hoveranywhere` are **layout attributes** that widen the ordinary `plotly_click` / `plotly_hover`, so the feature is reached through `onClick` / `onHover` with the layout flag set — see the README

## [4.0.0] - 2026-06-18

### Added

- Added native ESM output alongside CJS [[#367](https://github.com/plotly/react-plotly.js/pull/367)]
  - Published artifacts now live under `dist/` instead of at the repo root; the `main` entry moved from `react-plotly.js` to `./dist/index.cjs`
  - Dropped the unminified UMD bundle
  - `import Plot from 'react-plotly.js'` now resolves correctly in Rolldown and any other strict ESM environment
- Added TypeScript declaration files (`index.d.ts` / `factory.d.ts`) [[#368](https://github.com/plotly/react-plotly.js/pull/368)]

### Changed

- Update linting dependencies [[#366](https://github.com/plotly/react-plotly.js/pull/366)]
- Refactored the wrapper from a class component to a functional component using hooks [[#369](https://github.com/plotly/react-plotly.js/pull/369)]
  - Refs forwarded to `<Plot>` now resolve to the rendered `<div>` element (the plotly graph div) directly via `forwardRef`, instead of to the class instance
  - **Migration:** replace `ref.current.el` with `ref.current`

### Fixed

- `onPurge` now fires and `Plotly.purge` runs on unmount [[#372](https://github.com/plotly/react-plotly.js/pull/372)]
- Plot is re-initialized correctly after React StrictMode's dev-only simulated unmount/remount [[#372](https://github.com/plotly/react-plotly.js/pull/372)]
- TypeScript declarations now expose ref forwarding so consumers can attach a typed `ref` prop without a TS error [[#373](https://github.com/plotly/react-plotly.js/pull/373)]

## [3.0.0] - 2026-06-09

### Added

- `onClickAnywhere` and `onHoverAnywhere` event props [[#360](https://github.com/plotly/react-plotly.js/pull/360)]
  - **Correction:** plotly.js v3 introduced `clickanywhere` / `hoveranywhere` as _layout attributes_, not as events, so these props never fired. They are removed in the next release.

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
