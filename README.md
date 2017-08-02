# plotlyjs-react

> A React component for plotly.js charts <a href="https://z8tgespzmd63w51brzdh360ryvgt3m1ho.netlify.com/">&rarr; See demo</a>

## Installation

Not yet published

```bash
$ npm install plotlyjs-react
```

## Usage

The component definition is created by dependency injection so that you can use whichever version of plotly.js you'd like, including the CDN versions.

```javascript
const createPlotlyComponent = require('plotlyjs-react');
const PlotlyComponent = createPlotlyComponent(Plotly);

render () {
  <PlotlyComponent
    data={...}
    layout={...}
    frames={...}
    config={...}
  />
}
```

## API

### Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `data` | `Array` | `[]` | list of trace objects |
| `layout` | `Object` | `undefined` | layout object |
| `config` | `Object` | `undefined` | config object |
| `frames` | `Array` | `undefined` | list of frame objects |
| `fit` | `Boolean` | `false` | When true, fits plot to its parent container and updates on window resize |
| `width` | `Number` | `undefined` | Width of the plot; overrides `fit` |
| `height` | `Number` | `undefined` | Heigh of the plot; overrides `fit` |

### Event handler props

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

## Development

To get started:

```bash
$ npm install
$ npm start
```

To build the dist version:

```bash
$ npm run prepublish
```

## License

&copy; 2017 Plotly, Inc. MIT License.
