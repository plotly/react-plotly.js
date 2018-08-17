var Plotly = require('plotly.js/lib/core');

// Load in the trace types for pie, and choropleth
Plotly.register([
    require('plotly.js/lib/pie'),
    require('plotly.js/lib/choropleth')
]);

module.exports = Plotly;

//import plotComponentFactory from './factory';
//import Plotly from 'plotly.js/dist/plotly';

//const PlotComponent = plotComponentFactory(Plotly);

//export default PlotComponent;
