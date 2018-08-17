'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _factory = require('./factory');

var _factory2 = _interopRequireDefault(_factory);

var _core = require('plotly.js/lib/core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.register([require('plotly.js/lib/pie'), require('plotly.js/lib/choropleth'), require('plotly.js/lib/bar'), require('plotly.js/lib/scatter')]);

var PlotComponent = (0, _factory2.default)(_core2.default);
exports.default = PlotComponent;
module.exports = exports['default'];
//# sourceMappingURL=react-plotly.js.map