# react-plotly.js

![plotly-react-logo](https://static1.squarespace.com/static/5a5adfdea9db09d594a841f3/t/5a5af2c5e2c48307ed4a21b6/1515975253370/)

> A [plotly.js](https://github.com/plotly/plotly.js) React component from
> [Plotly](https://plot.ly/). The basis of Plotly's
> [React component suite](https://plot.ly/products/react/).

👉 [DEMO](http://react-plotly.js-demo.getforge.io/)

👉 [Demo source code](https://github.com/plotly/react-plotly.js-demo-app)

---

## Contents

* [Installation](#installation)
* [Quick start](#quick-start)
* [Customizing the `plotly.js` bundle](#customizing-the-plotlyjs-bundle)
* [Loading from a `<script>` tag](#loading-from-a-script-tag)
* [API](#api)
  * [props](#props)
  * [Event handler props](#event-handler-props)
* [Development](#development)

## Installation

```bash
$ npm install react-plotly.js plotly.js
```

## Quick start

The easiest way to use this component is to import and pass data to a plot component. To import the component,

```javascript
import Plot from 'react-plotly.js';
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
  <img src="example.png" alt="Example plot" width="320" height="240">
</p>

For a full description of Plotly chart types and attributes see the following resources:

* [Plotly JavaScript API documentation](https://plot.ly/javascript/)
* [Full plotly.js attribute listing](https://plot.ly/javascript/reference/)

## Customizing the `plotly.js` bundle

By default, the `Plot` component exported by this library loads a precompiled version of all of `plotly.js`, so `plotly.js` must be installed as a peer dependency. This bundle is around 6Mb unminified, and minifies to just over 2Mb.

If you do not wish to use this version of `plotly.js`, e.g. if you want to use a [different precompiled bundle](https://github.com/plotly/plotly.js/blob/master/dist/README.md#partial-bundles) or if your wish to [assemble you own customized bundle](https://github.com/plotly/plotly.js#modules), or if you wish to load `plotly.js` [from a CDN](https://github.com/plotly/plotly.js#use-the-plotlyjs-cdn-hosted-by-fastly), you can skip the installation of as a peer dependency (and ignore the resulting warning) and use the `createPlotComponent` method to get a `Plot` component, instead of importing it:

```javascript
// simplest method: uses precompiled complete bundle from `plotly.js`
import Plot from 'react-plotly.js';

// customizable method: use your own `Plotly` object
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);
```

## Loading from a `<script>` tag

For quick one-off demos on [CodePen](https://codepen.io/) or [JSFiddle](https://jsfiddle.net/), you may wish to just load the component directly as a script tag. We don't host the bundle directly, so you should never rely on this to work forever or in production, but you can use a third-party service to load the factory version of the component from, for example, [https://unpkg.com/react-plotly.js@latest/dist/create-plotly-component.js](https://unpkg.com/react-plotly.js@latest/dist/create-plotly-component.js).

You can load plotly.js and the component factory with:

```html
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script src="https://unpkg.com/react-plotly.js@latest/dist/create-plotly-component.js"></script>
```

And instantiate the component with

```javascript
const Plot = createPlotlyComponent(Plotly);

ReactDOM.render(
  React.createElement(Plot, {
    data: [{x: [1, 2, 3], y: [2, 1, 3]}],
  }),
  document.getElementById('root')
);
```

You can see an example of this method in action
[here](https://codepen.io/rsreusser/pen/qPgwwJ?editors=1010).

## API

### Props

**Note**: This component will not refresh the plot unless either the `revision` prop is defined and has changed, OR unless a shallow equality check on `data`, `layout`, `frames` and `config` fails.

**Note**: for the time being, this component may mutate its `layout` and `data` props in response to user input, going against React rules. This behaviour will change in the near future once https://github.com/plotly/plotly.js/issues/2389 is completed.

| Prop               | Type       | Default                                           | Description                                                                                                                                                                                                                                                     |
| ------------------ | ---------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`             | `Array`    | `[]`                                              | list of trace objects                                                                                                                                                                                                                                           |
| `layout`           | `Object`   | `undefined`                                       | layout object                                                                                                                                                                                                                                                   |
| `config`           | `Object`   | `undefined`                                       | config object                                                                                                                                                                                                                                                   |
| `style`            | `Object`   | `{position: 'relative', display: 'inline-block'}` | used to style the `<div>` into which the plot is rendered                                                                                                                                                                                                       |
| `id`               | `string`   | `undefined`                                       | id assigned to the `<div>` into which the plot is rendered.                                                                                                                                                                                                     |
| `className`        | `string`   | `undefined`                                       | applied to the `<div>` into which the plot is rendered                                                                                                                                                                                                          |
| `frames`           | `Array`    | `undefined`                                       | list of frame objects                                                                                                                                                                                                                                           |
| `useResizeHandler` | `Boolean`  | `false`                                           | When true, adds a call to `Plotly.Plot.resize()` as a `window.resize` event handler                                                                                                                                                                             |
| `revision`         | `Number`   | `undefined`                                       | When provided, causes the plot to update _only_ when the revision is incremented.                                                                                                                                                                               |
| `debug`            | `Boolean`  | `false`                                           | Assign the graph div to `window.gd` for debugging                                                                                                                                                                                                               |
| `onInitialized`    | `Function` | `undefined`                                       | Callback executed after plot is initialized. This function recieves a reference to the `<div>` DOM node as an argument, from which `data`, `layout`, `config`, and `frames` can be extracted and persisted.                                                     |
| `onPurge`          | `Function` | `undefined`                                       | Callback executed when component unmounts. Unmounting triggers a Plotly.purge event which strips the graphDiv of all plotly.js related information including data and layout. This hook gives application writers a chance to pull data and layout off the DOM. |
| `onUpdate`         | `Function` | `undefined`                                       | Callback executed when a plotly.js API method resolves. This function recieves a reference to the `<div>` DOM node as an argument, from which `data`, `layout`, `config`, and `frames` can be extracted and persisted.                                          |
| `onError`          | `Function` | `undefined`                                       | Callback executed when a plotly.js API method rejects                                                                                                                                                                                                           |
| `fit`              | `Boolean`  | `false`                                           | _deprecated_ When true, will set `layout.height` and `layout.width` to the component's parent's size if they are unspecified, and will update them on `window.resize`                                                                                           |

To make a plot responsive, i.e. to fill its containing element and resize when the window is resized, use `style` or `className` to set the dimensions of the element (i.e. using `width: 100%; height: 100%` or some similar values) and set `useResizeHandler` to `true` while setting `layout.autosize` to `true` and leaving `layout.height` and `layout.width` undefined. This will implement the behaviour documented here: https://plot.ly/javascript/responsive-fluid-layout/

### Event handler props

Event handlers for
[`plotly.js` events](https://plot.ly/javascript/plotlyjs-events/) may be
attached through the following props.

| Prop                      | Type       | Plotly Event                   |
| ------------------------- | ---------- | ------------------------------ |
| `onAfterExport`           | `Function` | `plotly_afterexport`           |
| `onAfterPlot`             | `Function` | `plotly_afterplot`             |
| `onAnimated`              | `Function` | `plotly_animated`              |
| `onAnimatingFrame`        | `Function` | `plotly_animatingframe`        |
| `onAnimationInterrupted`  | `Function` | `plotly_animationinterrupted`  |
| `onAutoSize`              | `Function` | `plotly_autosize`              |
| `onBeforeExport`          | `Function` | `plotly_beforeexport`          |
| `onButtonClicked`         | `Function` | `plotly_buttonclicked`         |
| `onClick`                 | `Function` | `plotly_click`                 |
| `onClickAnnotation`       | `Function` | `plotly_clickannotation`       |
| `onDeselect`              | `Function` | `plotly_deselect`              |
| `onDoubleClick`           | `Function` | `plotly_doubleclick`           |
| `onFramework`             | `Function` | `plotly_framework`             |
| `onHover`                 | `Function` | `plotly_hover`                 |
| `onRelayout`              | `Function` | `plotly_relayout`              |
| `onRestyle`               | `Function` | `plotly_restyle`               |
| `onRedraw`                | `Function` | `plotly_redraw`                |
| `onSelected`              | `Function` | `plotly_selected`              |
| `onSelecting`             | `Function` | `plotly_selecting`             |
| `onSliderChange`          | `Function` | `plotly_sliderchange`          |
| `onSliderEnd`             | `Function` | `plotly_sliderend`             |
| `onSliderStart`           | `Function` | `plotly_sliderstart`           |
| `onTransitioning`         | `Function` | `plotly_transitioning`         |
| `onTransitionInterrupted` | `Function` | `plotly_transitioninterrupted` |
| `onUnhover`               | `Function` | `plotly_unhover`               |

## Development

To get started:

```bash
$ npm install
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
