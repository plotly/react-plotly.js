# react-plotly.js

> A [plotly.js](https://github.com/plotly/plotly.js) React component from [Plotly](https://plot.ly/)

## Installation

```bash
$ npm install react-plotly.js plotly.js
```

## Usage

### With bundled `plotly.js`

[`plotly.js`](https://github.com/plotly/plotly.js) is a peer dependency of `react-plotly.js`. If you would like to bundle `plotly.js` with the rest of your project, you must install it separately.

```bash
$ npm install -S react-plotly.js plotly.js
```

Since `plotly.js` is a peer dependency, you do not need to require it separately to use it.

```javascript
import Plot from 'react-plotly.js'

render () {
  return <Plot 
    data={...}
    layout={...}
    frames={...}
    config={...}
  />
}
```

### With external `plotly.js`

If you wish to use a version of `plotly.js` that is not bundled with the rest of your project, whether a [CDN version](https://plot.ly/javascript/getting-started/#plotlyjs-cdn) or through a [static distribution bundle](https://github.com/plotly/plotly.js/tree/master/dist), you may skip installing `plotly.js` and ignore the peer dependency warning.

```bash
$ npm install -S react-plotly.js
```

Given perhaps a script tag that has loaded a CDN version of plotly.js,

```html
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
```

you may then inject Plotly and use the returned React component:

```javascript
import plotComponentFactory from 'react-plotly.js/factory'
const Plot = plotComponentFactory(Plotly);

render () {
  return <Plot
    data={...}
    layout={...}
    frames={...}
    config={...}
  />
}
```

**Note**: You must ensure `Plotly` is available before your React app tries to render the component. That could mean perhaps using script tag (without `async` or `defer`) or a utility like [load-script](https://www.npmjs.com/package/load-script).

## API

### Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `data` | `Array` | `[]` | list of trace objects |
| `layout` | `Object` | `undefined` | layout object |
| `config` | `Object` | `undefined` | config object |
| `frames` | `Array` | `undefined` | list of frame objects |
| `fit` | `Boolean` | `false` | When true, disregards `layout.width` and `layout.height` and fits to the parent div size, updating on `window.resize` |
| `debug` | `Boolean` | `false` | Assign the graph div to `window.gd` for debugging |
| `onInitialized` | `Function` | `undefined` | Callback executed once after plot is initialized |
| `onUpdate` | `Function` | `undefined` | Callback executed when a plotly.js API method is invoked |
| `onError` | `Function` | `undefined` | Callback executed when a plotly.js API method rejects |

### Event handler props

Event handlers for [`plotly.js` events](https://plot.ly/javascript/plotlyjs-events/) may be attached through the following props.

| Prop | Type | Plotly Event |
| ---- | ---- | ----------- |
| `onAfterExport` | `Function` | `plotly_afterexport` |
| `onAfterPlot` | `Function` | `plotly_afterplot` |
| `onAnimated` | `Function` | `plotly_animated` |
| `onAnimatingFrame` | `Function` | `plotly_animatingframe` |
| `onAnimationInterrupted` | `Function` | `plotly_animationinterrupted` |
| `onAutoSize` | `Function` | `plotly_autosize` |
| `onBeforeExport` | `Function` | `plotly_beforeexport` |
| `onButtonClicked` | `Function` | `plotly_buttonclicked` |
| `onClick` | `Function` | `plotly_click` |
| `onClickAnnotation` | `Function` | `plotly_clickannotation` |
| `onDeselect` | `Function` | `plotly_deselect` |
| `onDoubleClick` | `Function` | `plotly_doubleclick` |
| `onFramework` | `Function` | `plotly_framework` |
| `onHover` | `Function` | `plotly_hover` |
| `onRelayout` | `Function` | `plotly_relayout` |
| `onRestyle` | `Function` | `plotly_restyle` |
| `onRedraw` | `Function` | `plotly_redraw` |
| `onSelected` | `Function` | `plotly_selected` |
| `onSelecting` | `Function` | `plotly_selecting` |
| `onSliderChange` | `Function` | `plotly_sliderchange` |
| `onSliderEnd` | `Function` | `plotly_sliderend` |
| `onSliderStart` | `Function` | `plotly_sliderstart` |
| `onTransitioning` | `Function` | `plotly_transitioning` |
| `onTransitionInterrupted` | `Function` | `plotly_transitioninterrupted` |
| `onUnhover` | `Function` | `plotly_unhover` |

## Roadmap

This component currently creates a new plot every time the input changes. That makes it stable and good enough for production use, but `plotly.js` will soon gain react-style support for computing and drawing changes incrementally. What does that mean for you? That means you can expect to keep using this component with little or no modification but that the plotting will simply happen much faster when you upgrade to the first version of `plotly.js` to support this feature. If this component requires any significant changes, a new major version will be released at the same time to ensure stability.

## Development

To get started:

```bash
$ npm install
$ npm start
```

To build the dist version:

```bash
$ npm run prepublishOnly
```

To run the tests:

```bash
$ npm run test
```

## License

&copy; 2017 Plotly, Inc. MIT License.
