# plotlyjs-react

> A React component for plotly.js charts

## Installation

Not yet published

```bash
$ npm install plotlyjs-react
```

## Usage

The component definition is created by dependency injection so that you can use whichever version of plotly.js you'd like, including the CDN versions.

```javascript
const PlotlyComponent = require('plotlyjs-react')(Plotly)

render () {
  <PlotlyComponent
    data={...}
    layout={...}
    frames={...}
    config={...}
    fit
  />
}
```

## License

&copy; 2017 Plotly, Inc. MIT License
