import React, {Component} from 'react';
import PropTypes from 'prop-types';
import isNumeric from 'fast-isnumeric';
import objectAssign from 'object-assign';
// import throttle from "throttle-debounce/throttle";

// The naming convention is:
//   - events are attached as `'plotly_' + eventName.toLowerCase()`
//   - react props are `'on' + eventName`
const eventNames = [
  'AfterExport',
  'AfterPlot',
  'Animated',
  'AnimatingFrame',
  'AnimationInterrupted',
  'AutoSize',
  'BeforeExport',
  'ButtonClicked',
  'Click',
  'ClickAnnotation',
  'Deselect',
  'DoubleClick',
  'Framework',
  'Hover',
  'Relayout',
  'Restyle',
  'Redraw',
  'Selected',
  'Selecting',
  'SliderChange',
  'SliderEnd',
  'SliderStart',
  'Transitioning',
  'TransitionInterrupted',
  'Unhover',
];

const updateEvents = [
  'plotly_restyle',
  'plotly_redraw',
  'plotly_relayout',
  'plotly_doubleclick',
  'plotly_animated',
];

// Check if a window is available since SSR (server-side rendering)
// breaks unnecessarily if you try to use it server-side.
const isBrowser = typeof window !== 'undefined';

export default function plotComponentFactory(Plotly) {
  const hasReactAPIMethod = !!Plotly.react;

  class PlotlyComponent extends Component {
    constructor(props) {
      super(props);

      this.p = Promise.resolve();
      this.fitHandler = null;
      this.handlers = {};

      this.syncWindowResize = this.syncWindowResize.bind(this);
      this.syncEventHandlers = this.syncEventHandlers.bind(this);
      this.attachUpdateEvents = this.attachUpdateEvents.bind(this);
      this.getRef = this.getRef.bind(this);

      //this.handleUpdate = throttle(0, this.handleUpdate.bind(this));
      this.handleUpdate = this.handleUpdate.bind(this);
    }

    shouldComponentUpdate(nextProps) {
      return (
        nextProps.revision === void 0 ||
        nextProps.revision !== this.props.revision
      );
    }

    componentDidMount() {
      this.p = this.p
        .then(() => {
          return Plotly.newPlot(this.el, {
            data: this.props.data,
            layout: this.sizeAdjustedLayout(this.props.layout),
            config: this.props.config,
            frames: this.props.frames,
          });
        })
        .then(() => this.syncWindowResize(null, false))
        .then(this.syncEventHandlers)
        .then(this.attachUpdateEvents)
        .then(
          () => this.props.onInitialized && this.props.onInitialized(this.el)
        )
        .catch(e => {
          console.error('Error while plotting:', e);
          return this.props.onError && this.props.onError();
        });
    }

    componentWillUpdate(nextProps) {
      let nextLayout = this.sizeAdjustedLayout(nextProps.layout);

      this.p = this.p
        .then(() => {
          if (hasReactAPIMethod) {
            return Plotly.react(this.el, {
              data: nextProps.data,
              layout: nextLayout,
              config: nextProps.config,
              frames: nextProps.frames,
            });
          } else {
            this.clearLocalEventHandlers();
            return Plotly.newPlot(this.el, {
              data: nextProps.data,
              layout: nextLayout,
              config: nextProps.config,
              frames: nextProps.frames,
            });
          }
        })
        .then(() => this.syncEventHandlers(nextProps))
        .then(() => this.syncWindowResize(nextProps))
        .then(this.attachUpdateEvents)
        .then(() => this.handleUpdate(nextProps))
        .catch(err => {
          console.error('Error while plotting:', err);
          this.props.onError && this.props.onError(err);
        });
    }

    componentWillUnmount() {
      if (this.props.onPurge) {
        this.props.onPurge(this.el);
      }
      if (this.fitHandler && isBrowser) {
        window.removeEventListener('resize', this.handleResize);
        this.fitHandler = null;
      }

      this.removeUpdateEvents();

      Plotly.purge(this.el);
    }

    attachUpdateEvents() {
      for (let i = 0; i < updateEvents.length; i++) {
        this.el.on(updateEvents[i], () => {
          this.handleUpdate();
        });
      }
    }

    removeUpdateEvents() {
      if (!this.el || !this.el.off) return;

      for (let i = 0; i < updateEvents.length; i++) {
        this.el.off(updateEvents[i], this.handleUpdate);
      }
    }

    clearLocalEventHandlers() {
      this.handlers = [];
    }

    handleUpdate(props) {
      props = props || this.props;
      if (props.onUpdate && typeof props.onUpdate === 'function') {
        props.onUpdate(this.el);
      }
    }

    syncWindowResize(props, invoke) {
      props = props || this.props;
      if (!isBrowser) return;

      if (props.fit && !this.fitHandler) {
        this.fitHandler = () => {
          return Plotly.relayout(this.el, this.getSize());
        };
        window.addEventListener('resize', this.fitHandler);

        if (invoke) return this.fitHandler();
      } else if (!props.fit && this.fitHandler) {
        window.removeEventListener('resize', this.fitHandler);
        this.fitHandler = null;
      }

      if (props.useResizeHandler && !this.resizeHandler) {
        this.resizeHandler = () => {
          return Plotly.Plots.resize(this.el);
        };
        window.addEventListener('resize', this.resizeHandler);
      } else if (!props.useResizeHandler && this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler);
        this.resizeHandler = null;
      }
    }

    getRef(el) {
      this.el = el;

      if (this.props.debug && isBrowser) {
        window.gd = this.el;
      }
    }

    // Attach and remove event handlers as they're added or removed from props:
    syncEventHandlers(props) {
      // Allow use of nextProps if passed explicitly:
      props = props || this.props;

      for (let i = 0; i < eventNames.length; i++) {
        const eventName = eventNames[i];
        const prop = props['on' + eventName];
        const hasHandler = !!this.handlers[eventName];

        if (prop && !hasHandler) {
          let handler = (this.handlers[eventName] = props['on' + eventName]);
          this.el.on('plotly_' + eventName.toLowerCase(), handler);
        } else if (!prop && hasHandler) {
          // Needs to be removed:
          this.el.off(
            'plotly_' + eventName.toLowerCase(),
            this.handlers[eventName]
          );
          delete this.handlers[eventName];
        }
      }
    }

    sizeAdjustedLayout(layout) {
      if (this.props.fit) {
        layout = objectAssign({}, layout);
        objectAssign(layout, this.getSize(layout));
      }

      return layout;
    }

    getParentSize() {
      return this.el.parentElement.getBoundingClientRect();
    }

    getSize(layout) {
      let rect;
      layout = layout || this.props.layout;
      const layoutWidth = layout ? layout.width : null;
      const layoutHeight = layout ? layout.height : null;
      const hasWidth = isNumeric(layoutWidth);
      const hasHeight = isNumeric(layoutHeight);

      if (!hasWidth || !hasHeight) {
        rect = this.getParentSize();
      }

      return {
        width: hasWidth ? parseInt(layoutWidth) : rect.width,
        height: hasHeight ? parseInt(layoutHeight) : rect.height,
      };
    }

    render() {
      return <div style={this.props.style} ref={this.getRef} />;
    }
  }

  PlotlyComponent.propTypes = {
    fit: PropTypes.bool,
    data: PropTypes.arrayOf(PropTypes.object),
    config: PropTypes.object,
    layout: PropTypes.object,
    frames: PropTypes.arrayOf(PropTypes.object),
    revision: PropTypes.number,
    onInitialized: PropTypes.func,
    onPurge: PropTypes.func,
    onError: PropTypes.func,
    onUpdate: PropTypes.func,
    debug: PropTypes.bool,
    style: PropTypes.object,
    useResizeHandler: PropTypes.bool,
  };

  for (let i = 0; i < eventNames.length; i++) {
    PlotlyComponent.propTypes['on' + eventNames[i]] = PropTypes.func;
  }

  PlotlyComponent.defaultProps = {
    debug: false,
    fit: false,
    useResizeHandler: false,
    data: [],
    style: {position: 'relative', display: 'inline-block'},
  };

  return PlotlyComponent;
}
