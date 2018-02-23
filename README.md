# react-plotly.js

![plotly-react-logo](https://static1.squarespace.com/static/5a5adfdea9db09d594a841f3/t/5a5af2c5e2c48307ed4a21b6/1515975253370/)

> A [plotly.js](https://github.com/plotly/plotly.js) React component from [Plotly](https://plot.ly/). The basis of Plotly's [React component suite](https://plot.ly/products/react/).

👉 [DEMO](http://react-plotly.js-demo.getforge.io/)

👉 [Demo source code](https://github.com/plotly/react-plotly.js-demo-app)

***

## Contents
- [Installation](#installation)
- [Quick start](#quick-start)
- [Usage](#usage)
  * [With local plotly.js](#with-local-plotlyjs)
    + [build with webpack](#build-with-webpack)
  * [With external plotly.js (for example by `<script>` tag)](#with-external-plotlyjs)
    + [build with create-react-app](#build-with-create-react-app)
  * [As a standalone bundle](#as-a-standalone-bundle)
- [API](#api)
  * [props](#props)
  * [Event handler props](#event-handler-props)
- [Roadmap](#roadmap)
- [Development](#development)

## Installation

```bash
$ npm install react-plotly.js plotly.js
```

## Quick start

The easiest way to use this component is to import and pass data to a plot component. To import the component,

```javascript
import Plot from 'react-plotly.js'
```

Then to render a plot,

```javascript
render () {
  return (
    <Plot
      data={[
        {
          type: 'scatter',
          mode: 'lines+points',
          x: [1, 2, 3],
          y: [2, 6, 3],
          marker: {color: 'red'}
        },
        {
          type: 'bar',
          x: [1, 2, 3],
          y: [2, 5, 3]
        }
      ]}

      layout={{
        width: 320,
        height: 240,
        title: 'A Fancy Plot'
      }}
    />
  );
}
```

You should see a plot like this:

<p align="center">
  <img src="docs/example.png" alt="Example plot" width="320" height="240">
</p>

For a full description of Plotly chart types and attributes see the following resources:

- [Plotly JavaScript API documentation](https://plot.ly/javascript/)
- [Full plotly.js attribute listing](https://plot.ly/javascript/reference/)

## Usage

Using this component inside a larger application may require some additional considerations in addition to the simple usage example above. The following sections detail two basic use-cases.

### With local plotly.js

[`plotly.js`](https://github.com/plotly/plotly.js) is a peer dependency of `react-plotly.js`. If you would like to bundle `plotly.js` with the rest of your project and use it in this component, you must install it separately.

```bash
$ npm install -S react-plotly.js plotly.js
```

Since `plotly.js` is a peer dependency, you do not need to require it separately to use it:

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

#### Build with Webpack

If you build your project using webpack, you'll have to follow [these instructions](https://github.com/plotly/plotly.js#building-plotlyjs-with-webpack) in order to successfully bundle plotly.js.

If you are building with Webpack but do not have access to the Webpack configuration (i.e. you are using `create-react-app`) or if you don't want to configure webpack see next section.


### With external plotly.js

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
/* global Plotly:true */

import createPlotlyComponent from 'react-plotly.js/factory'

/* (Note that Plotly is already defined from loading plotly.js through a <script> tag) */
const Plot = createPlotlyComponent(Plotly);

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


#### Build with `create-react-app`

If you are using `create-react-app` you will not have access to the Webpack configuration unless you choose to `eject`. 

* If you do not want to `eject`, you must use an *external* plotly.js using the instructions immediately above. This [demo app](http://react-plotly.js-demo.getforge.io/) was built with `create-react-app` using this approach. 
* If you wish to use `create-react-app` with a *local* plotly.js, you will need to `eject` and follow the Webpack instructions above.

### As a standalone bundle

For quick one-off demos on [CodePen](https://codepen.io/) or [JSFiddle](https://jsfiddle.net/), you may wish to just load the component directly as a script tag. We don't host the bundle directly, so you should never rely on this to work forever or in production, but you can use a third-party service to load the factory version of the component from, for example, [https://unpkg.com/react-plotly.js@latest/dist/create-plotly-component.js](https://unpkg.com/react-plotly.js@latest/dist/create-plotly-component.js).

You can load the component with:

```html
<script src="https://unpkg.com/react-plotly.js@1.0.1/dist/create-plotly-component.js"></script>
```

And instantiate the component with

```javascript
const Plot = createPlotlyComponent(Plotly);

ReactDOM.render(
  React.createElement(Plot, {
    data: [{x: [1, 2, 3], y: [2, 1, 3]}]
  }),
  document.getElementById('root')
);
```

You can see an example of this method in action [here](https://codepen.io/rsreusser/pen/qPgwwJ?editors=1010).

## API

### Props

**Note**: for the time being, this component may mutate its `layout` and `data` props in response to user input, going against React rules. This behaviour will change in the near future.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `data` | `Array` | `[]` | list of trace objects |
| `layout` | `Object` | `undefined` | layout object |
| `config` | `Object` | `undefined` | config object |
| `style`  | `Object` | `{position: 'relative', display: 'inline-block'}` | used to style the `<div>` into which the plot is rendered |
| `className`  | `string` | `undefined` | applied to the `<div>` into which the plot is rendered |
| `frames` | `Array` | `undefined` | list of frame objects |
| `useResizeHandler` | `Boolean` | `false` | When true, adds a call to `Plotly.Plot.resize()` as a `window.resize` event handler |
| `revision` | `Number` | `undefined` | When provided, causes the plot to update *only* when the revision is incremented. |
| `debug` | `Boolean` | `false` | Assign the graph div to `window.gd` for debugging |
| `onInitialized` | `Function` | `undefined` | Callback executed after plot is initialized |
| `onPurge` | `Function` | `undefined` | Callback executed when component unmounts. Unmounting triggers a Plotly.purge event which strips the graphDiv of all plotly.js related information including data and layout. This hook gives application writers a chance to pull data and layout off the DOM. |
| `onUpdate` | `Function` | `undefined` | Callback executed when a plotly.js API method resolves |
| `onError` | `Function` | `undefined` | Callback executed when a plotly.js API method rejects |
| `fit` | `Boolean` | `false` | *deprecated* When true, will set `layout.height` and `layout.width` to the component's parent's size if they are unspecified, and will update them on `window.resize` |

To make a plot responsive, i.e. to fill its containing element and resize when the window is resized, use `style` or `className` to set the dimensions of the element (i.e. using `width: 100%; height: 100%` or some similar values) and set `useResizeHandler` to `true` while setting `layout.autosize` to `true` and leaving `layout.height` and `layout.width` undefined. This will implement the behaviour documented here: https://plot.ly/javascript/responsive-fluid-layout/

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

This component currently creates a new plot every time the input changes. That makes it stable and good enough for production use, but `plotly.js` will soon gain react-style support for computing and drawing changes incrementally. What does that mean for you? That means you can expect to keep using this component with little modification but that the plotting will simply happen much faster when you upgrade to the first version of `plotly.js` to support this feature. If this component requires any significant changes, a new major version will be released at the same time to ensure stability. See [plotly/react-plotly.js#2](https://github.com/plotly/react-plotly.js/issues/2) for more information about this feature.

## Development

To get started:

```bash
$ npm install
$ npm start
```

To transpile from ES2015 + JSX into the ES5 npm-distributed version:

```bash
$ npm run prepublishOnly
```

To run the tests:

```bash
$ npm run test
```

## License

&copy; 2017 Plotly, Inc. MIT License.
