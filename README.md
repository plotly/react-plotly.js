# plotly.js-react

> A React component for plotly.js charts <a href="https://z8tgespzmd63w51brzdh360ryvgt3m1ho.netlify.com/">&rarr; See demo</a>

## Installation

Not yet published

```bash
$ npm install plotly.js-react
```

## Usage

The component definition is created by dependency injection so that you can use whichever version of plotly.js you'd like, including the [CDN versions](https://plot.ly/javascript/getting-started/#plotlyjs-cdn).

```javascript
const createPlotlyComponent = require('plotly.js-react');
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

The only requirement is that plotly.js is loaded before you inject it. You may need to use a module like [load-script](https://www.npmjs.com/package/load-script) to ensure it's available.

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
| `onInitialized | `Function` | null | Callback executed once after plot is initialized |
| `onUpdate | `Function` | null | Callback executed when a plotly.js API method is invoked |
| `onError | `Function` | null | Callback executed when a plotly.js API method rejects |

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

## See also

- [plotly-react-editor](https://github.com/plotly/plotly-react-editor)

## License

&copy; 2017 Plotly, Inc. MIT License.
