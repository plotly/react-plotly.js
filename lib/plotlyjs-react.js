"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = createPlotlyComponent;

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _fastIsnumeric = require("fast-isnumeric");

var _fastIsnumeric2 = _interopRequireDefault(_fastIsnumeric);

var _objectAssign = require("object-assign");

var _objectAssign2 = _interopRequireDefault(_objectAssign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// The naming convention is:
//   - events are attached as `'plotly_' + eventName.toLowerCase()`
//   - react props are `'on' + eventName`
var eventNames = ["AfterExport", "AfterPlot", "Animated", "AnimatingFrame", "AnimationInterrupted", "AutoSize", "BeforeExport", "ButtonClicked", "Click", "ClickAnnotation", "Deselect", "DoubleClick", "Framework", "Hover", "Relayout", "Restyle", "Redraw", "Selected", "Selecting", "SliderChange", "SliderEnd", "SliderStart", "Transitioning", "TransitionInterrupted", "Unhover"];

// Check if a window is available since SSR (server-side rendering)
// breaks unnecessarily if you try to use it server-side.
var isBrowser = typeof window !== "undefined";

function createPlotlyComponent(Plotly) {
  var hasReactAPIMethod = !!Plotly.react;

  var PlotlyComponent = function (_Component) {
    _inherits(PlotlyComponent, _Component);

    function PlotlyComponent(props) {
      _classCallCheck(this, PlotlyComponent);

      var _this = _possibleConstructorReturn(this, (PlotlyComponent.__proto__ || Object.getPrototypeOf(PlotlyComponent)).call(this, props));

      _this.p = Promise.resolve();
      _this.resizeHandler = null;
      _this.handlers = {};

      _this.syncWindowResize = _this.syncWindowResize.bind(_this);
      _this.syncEventHandlers = _this.syncEventHandlers.bind(_this);
      _this.getRef = _this.getRef.bind(_this);
      return _this;
    }

    _createClass(PlotlyComponent, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this2 = this;

        this.p = this.p.then(function () {
          return Plotly.plot(_this2.el, {
            data: _this2.props.data,
            layout: _this2.sizeAdjustedLayout(_this2.props.layout),
            config: _this2.props.config,
            frames: _this2.props.frames
          });
        }).then(function () {
          _this2.syncWindowResize();
          _this2.syncEventHandlers();
        });
      }
    }, {
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(nextProps) {
        var _this3 = this;

        this.p = this.p.then(function () {
          return (hasReactAPIMethod ? Plotly.react : Plotly.newPlot)(_this3.el, {
            data: nextProps.data,
            layout: _this3.sizeAdjustedLayout(nextProps.layout),
            config: nextProps.config,
            frames: nextProps.frames
          }).then(function () {
            _this3.syncEventHandlers(nextProps);
            _this3.syncWindowResize(nextProps);
          });
        });
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        if (this.resizeHandler && isBrowser) {
          window.removeEventListener("resize", this.handleResize);
          this.resizeHandler = null;
        }

        Plotly.purge(this.el);
      }
    }, {
      key: "syncWindowResize",
      value: function syncWindowResize(props) {
        var _this4 = this;

        props = props || this.props;
        if (!isBrowser) return;

        if (props.fit && !this.resizeHandler) {
          if (!this.resizeHandler) {
            this.resizeHandler = function () {
              _this4.p = _this4.p.then(function () {
                return Plotly.relayout(_this4.el, _this4.getSize());
              });
            };
            window.addEventListener("resize", this.resizeHandler);
            this.resizeHandler();
          }
        } else if (!props.fit && this.resizeHandler) {
          window.removeEventListener('resize', this.resizeHandler);
          this.resizeHandler = null;
        }
      }
    }, {
      key: "getRef",
      value: function getRef(el) {
        this.el = el;

        if (this.props.debug && isBrowser) {
          window.gd = this.el;
        }
      }

      // Attach and remove event handlers as they're added or removed from props:

    }, {
      key: "syncEventHandlers",
      value: function syncEventHandlers(props) {
        // Allow use of nextProps if passed explicitly:
        props = props || this.props;

        for (var i = 0; i < eventNames.length; i++) {
          var eventName = eventNames[i];
          var prop = props["on" + eventName];
          var hasHandler = !!this.handlers[eventName];

          if (prop && !hasHandler) {
            var handler = this.handlers[eventName] = props["on" + eventName];
            this.el.on("plotly_" + eventName.toLowerCase(), handler);
          } else if (!prop && hasHandler) {
            // Needs to be removed:
            this.el.off("plotly_" + eventName.toLowerCase(), this.handlers[eventName]);
            delete this.handlers[eventName];
          }
        }
      }
    }, {
      key: "sizeAdjustedLayout",
      value: function sizeAdjustedLayout(layout) {
        var size = this.getSize();

        // Shallow-clone the layout so that we don't have to
        // modify the original object:
        layout = (0, _objectAssign2.default)({}, layout);
        (0, _objectAssign2.default)(layout, this.getSize());
        return layout;
      }
    }, {
      key: "getSize",
      value: function getSize() {
        var rect = void 0;
        var hasWidth = (0, _fastIsnumeric2.default)(this.props.width);
        var hasHeight = (0, _fastIsnumeric2.default)(this.props.height);

        if (!hasWidth || !hasHeight) {
          rect = this.el.parentElement.getBoundingClientRect();
        }

        return {
          width: hasWidth ? parseInt(this.props.width) : rect.width,
          height: hasHeight ? parseInt(this.props.height) : rect.height
        };
      }
    }, {
      key: "render",
      value: function render() {
        return _react2.default.createElement("div", { ref: this.getRef });
      }
    }]);

    return PlotlyComponent;
  }(_react.Component);

  PlotlyComponent.propTypes = {
    fit: _propTypes2.default.bool,
    width: _propTypes2.default.number,
    height: _propTypes2.default.number,
    data: _propTypes2.default.arrayOf(_propTypes2.default.object),
    config: _propTypes2.default.object,
    layout: _propTypes2.default.object,
    frames: _propTypes2.default.arrayOf(_propTypes2.default.object)
  };

  for (var i = 0; i < eventNames.length; i++) {
    PlotlyComponent.propTypes["on" + eventNames[i]] = _propTypes2.default.func;
  }

  PlotlyComponent.defaultProps = {
    fit: false,
    data: [],
    width: null,
    height: null
  };

  return PlotlyComponent;
}
module.exports = exports["default"];

//# sourceMappingURL=plotlyjs-react.js.map