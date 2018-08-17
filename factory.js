'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = plotComponentFactory;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// The naming convention is:
//   - events are attached as `'plotly_' + eventName.toLowerCase()`
//   - react props are `'on' + eventName`
var eventNames = ['AfterExport', 'AfterPlot', 'Animated', 'AnimatingFrame', 'AnimationInterrupted', 'AutoSize', 'BeforeExport', 'ButtonClicked', 'Click', 'ClickAnnotation', 'Deselect', 'DoubleClick', 'Framework', 'Hover', 'LegendClick', 'LegendDoubleClick', 'Relayout', 'Restyle', 'Redraw', 'Selected', 'Selecting', 'SliderChange', 'SliderEnd', 'SliderStart', 'Transitioning', 'TransitionInterrupted', 'Unhover'];

var updateEvents = ['plotly_restyle', 'plotly_redraw', 'plotly_relayout', 'plotly_doubleclick', 'plotly_animated'];

// Check if a window is available since SSR (server-side rendering)
// breaks unnecessarily if you try to use it server-side.
var isBrowser = typeof window !== 'undefined';

function plotComponentFactory(Plotly) {
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
      _this.attachUpdateEvents = _this.attachUpdateEvents.bind(_this);
      _this.getRef = _this.getRef.bind(_this);
      _this.handleUpdate = _this.handleUpdate.bind(_this);
      _this.figureCallback = _this.figureCallback.bind(_this);
      return _this;
    }

    _createClass(PlotlyComponent, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        var _this2 = this;

        this.p = this.p.then(function () {
          return Plotly.newPlot(_this2.el, {
            data: _this2.props.data,
            layout: _this2.props.layout,
            config: _this2.props.config,
            frames: _this2.props.frames
          });
        }).then(function () {
          return _this2.syncWindowResize(null, true);
        }).then(this.syncEventHandlers).then(this.attachUpdateEvents).then(function () {
          return _this2.figureCallback(_this2.props.onInitialized);
        }).catch(function (err) {
          console.error('Error while plotting:', err);
          return _this2.props.onError && _this2.props.onError(err);
        });
      }
    }, {
      key: 'componentWillUpdate',
      value: function componentWillUpdate(nextProps) {
        var _this3 = this;

        if (nextProps.revision !== void 0 && nextProps.revision === this.props.revision) {
          // if revision is set and unchanged, do nothing
          return;
        }

        var numPrevFrames = this.props.frames && this.props.frames.length ? this.props.frames.length : 0;
        var numNextFrames = nextProps.frames && nextProps.frames.length ? nextProps.frames.length : 0;
        if (nextProps.layout === this.props.layout && nextProps.data === this.props.data && nextProps.config === this.props.config && numNextFrames === numPrevFrames) {
          // prevent infinite loops when component is re-rendered after onUpdate
          // frames *always* changes identity so fall back to check length only :(
          return;
        }

        this.p = this.p.then(function () {
          return Plotly.react(_this3.el, {
            data: nextProps.data,
            layout: nextProps.layout,
            config: nextProps.config,
            frames: nextProps.frames
          });
        }).then(function () {
          return _this3.syncEventHandlers(nextProps);
        }).then(function () {
          return _this3.syncWindowResize(nextProps);
        }).then(function () {
          return _this3.figureCallback(nextProps.onUpdate);
        }).catch(function (err) {
          console.error('Error while plotting:', err);
          _this3.props.onError && _this3.props.onError(err);
        });
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        this.figureCallback(this.props.onPurge);

        if (this.resizeHandler && isBrowser) {
          window.removeEventListener('resize', this.resizeHandler);
          this.resizeHandler = null;
        }

        this.removeUpdateEvents();

        Plotly.purge(this.el);
      }
    }, {
      key: 'attachUpdateEvents',
      value: function attachUpdateEvents() {
        if (!this.el || !this.el.removeListener) return;

        for (var i = 0; i < updateEvents.length; i++) {
          this.el.on(updateEvents[i], this.handleUpdate);
        }
      }
    }, {
      key: 'removeUpdateEvents',
      value: function removeUpdateEvents() {
        if (!this.el || !this.el.removeListener) return;

        for (var i = 0; i < updateEvents.length; i++) {
          this.el.removeListener(updateEvents[i], this.handleUpdate);
        }
      }
    }, {
      key: 'handleUpdate',
      value: function handleUpdate() {
        this.figureCallback(this.props.onUpdate);
      }
    }, {
      key: 'figureCallback',
      value: function figureCallback(callback) {
        if (typeof callback === 'function') {
          var _el = this.el,
              data = _el.data,
              layout = _el.layout;

          var frames = this.el._transitionData ? this.el._transitionData._frames : null;
          var figure = { data: data, layout: layout, frames: frames }; // for extra clarity!
          callback(figure, this.el);
        }
      }
    }, {
      key: 'syncWindowResize',
      value: function syncWindowResize(propsIn, invoke) {
        var _this4 = this;

        var props = propsIn || this.props;
        if (!isBrowser) return;

        if (props.useResizeHandler && !this.resizeHandler) {
          this.resizeHandler = function () {
            return Plotly.Plots.resize(_this4.el);
          };
          window.addEventListener('resize', this.resizeHandler);
          if (invoke) {
            this.resizeHandler();
          }
        } else if (!props.useResizeHandler && this.resizeHandler) {
          window.removeEventListener('resize', this.resizeHandler);
          this.resizeHandler = null;
        }
      }
    }, {
      key: 'getRef',
      value: function getRef(el) {
        this.el = el;

        if (this.props.debug && isBrowser) {
          window.gd = this.el;
        }
      }

      // Attach and remove event handlers as they're added or removed from props:

    }, {
      key: 'syncEventHandlers',
      value: function syncEventHandlers(propsIn) {
        // Allow use of nextProps if passed explicitly:
        var props = propsIn || this.props;

        for (var i = 0; i < eventNames.length; i++) {
          var eventName = eventNames[i];
          var prop = props['on' + eventName];
          var hasHandler = !!this.handlers[eventName];

          if (prop && !hasHandler) {
            this.handlers[eventName] = prop;
            this.el.on('plotly_' + eventName.toLowerCase(), this.handlers[eventName]);
          } else if (!prop && hasHandler) {
            // Needs to be removed:
            this.el.removeListener('plotly_' + eventName.toLowerCase(), this.handlers[eventName]);
            delete this.handlers[eventName];
          }
        }
      }
    }, {
      key: 'render',
      value: function render() {
        return _react2.default.createElement('div', {
          id: this.props.divId,
          style: this.props.style,
          ref: this.getRef,
          className: this.props.className
        });
      }
    }]);

    return PlotlyComponent;
  }(_react.Component);

  PlotlyComponent.propTypes = {
    data: _propTypes2.default.arrayOf(_propTypes2.default.object),
    config: _propTypes2.default.object,
    layout: _propTypes2.default.object,
    frames: _propTypes2.default.arrayOf(_propTypes2.default.object),
    revision: _propTypes2.default.number,
    onInitialized: _propTypes2.default.func,
    onPurge: _propTypes2.default.func,
    onError: _propTypes2.default.func,
    onUpdate: _propTypes2.default.func,
    debug: _propTypes2.default.bool,
    style: _propTypes2.default.object,
    className: _propTypes2.default.string,
    useResizeHandler: _propTypes2.default.bool,
    divId: _propTypes2.default.string
  };

  for (var i = 0; i < eventNames.length; i++) {
    PlotlyComponent.propTypes['on' + eventNames[i]] = _propTypes2.default.func;
  }

  PlotlyComponent.defaultProps = {
    debug: false,
    useResizeHandler: false,
    data: [],
    style: { position: 'relative', display: 'inline-block' }
  };

  return PlotlyComponent;
}
module.exports = exports['default'];
//# sourceMappingURL=factory.js.map