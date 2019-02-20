import React, {Component} from 'react';
import PropTypes from 'prop-types';

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
  'LegendClick',
  'LegendDoubleClick',
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
  class PlotlyComponent extends Component {
    constructor(props) {
      super(props);

      this.p = Promise.resolve();
      this.resizeHandler = null;
      this.handlers = {};

      this.syncWindowResize = this.syncWindowResize.bind(this);
      this.syncEventHandlers = this.syncEventHandlers.bind(this);
      this.attachUpdateEvents = this.attachUpdateEvents.bind(this);
      this.getRef = this.getRef.bind(this);
      this.handleUpdate = this.handleUpdate.bind(this);
      this.figureCallback = this.figureCallback.bind(this);
    }

    componentDidMount() {
      this.p = this.p
        .then(() => {
          return Plotly.newPlot(this.el, {
            data: this.props.data,
            layout: this.props.layout,
            config: this.props.config,
            frames: this.props.frames,
          });
        })
        .then(() => this.syncWindowResize(null, true))
        .then(this.syncEventHandlers)
        .then(this.attachUpdateEvents)
        .then(() => this.figureCallback(this.props.onInitialized))
        .catch(err => {
          console.error('Error while plotting:', err); // eslint-disable-line no-console
          if (this.props.onError) {
            this.props.onError(err);
          }
        });
    }

    componentWillUpdate(nextProps) {
      if (nextProps.revision !== void 0 && nextProps.revision === this.props.revision) {
        // if revision is set and unchanged, do nothing
        return;
      }

      const numPrevFrames =
        this.props.frames && this.props.frames.length ? this.props.frames.length : 0;
      const numNextFrames =
        nextProps.frames && nextProps.frames.length ? nextProps.frames.length : 0;
      if (
        nextProps.layout === this.props.layout &&
        nextProps.data === this.props.data &&
        nextProps.config === this.props.config &&
        numNextFrames === numPrevFrames
      ) {
        // prevent infinite loops when component is re-rendered after onUpdate
        // frames *always* changes identity so fall back to check length only :(
        return;
      }

      this.p = this.p
        .then(() => {
          return Plotly.react(this.el, {
            data: nextProps.data,
            layout: nextProps.layout,
            config: nextProps.config,
            frames: nextProps.frames,
          });
        })
        .then(() => this.syncEventHandlers(nextProps))
        .then(() => this.syncWindowResize(nextProps))
        .then(() => this.figureCallback(nextProps.onUpdate))
        .catch(err => {
          console.error('Error while plotting:', err); // eslint-disable-line no-console
          if (this.props.onError) {
            this.props.onError(err);
          }
        });
    }

    componentWillUnmount() {
      this.figureCallback(this.props.onPurge);

      if (this.resizeHandler && isBrowser) {
        window.removeEventListener('resize', this.resizeHandler);
        this.resizeHandler = null;
      }

      this.removeUpdateEvents();

      Plotly.purge(this.el);
    }

    attachUpdateEvents() {
      if (!this.el || !this.el.removeListener) {
        return;
      }

      for (let i = 0; i < updateEvents.length; i++) {
        this.el.on(updateEvents[i], this.handleUpdate);
      }
    }

    removeUpdateEvents() {
      if (!this.el || !this.el.removeListener) {
        return;
      }

      for (let i = 0; i < updateEvents.length; i++) {
        this.el.removeListener(updateEvents[i], this.handleUpdate);
      }
    }

    handleUpdate() {
      this.figureCallback(this.props.onUpdate);
    }

    figureCallback(callback) {
      if (typeof callback === 'function') {
        const {data, layout} = this.el;
        const frames = this.el._transitionData ? this.el._transitionData._frames : null;
        const figure = {data, layout, frames};
        callback(figure, this.el);
      }
    }

    syncWindowResize(propsIn, invoke) {
      const props = propsIn || this.props;
      if (!isBrowser) {
        return;
      }

      if (props.useResizeHandler && !this.resizeHandler) {
        this.resizeHandler = () => {
          return Plotly.Plots.resize(this.el);
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

    getRef(el) {
      this.el = el;

      if (this.props.debug && isBrowser) {
        window.gd = this.el;
      }
    }

    // Attach and remove event handlers as they're added or removed from props:
    syncEventHandlers(propsIn) {
      // Allow use of nextProps if passed explicitly:
      const props = propsIn || this.props;

      for (let i = 0; i < eventNames.length; i++) {
        const eventName = eventNames[i];
        const prop = props['on' + eventName];
        const hasHandler = Boolean(this.handlers[eventName]);

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

    render() {
      return (
        <div
          id={this.props.divId}
          style={this.props.style}
          ref={this.getRef}
          className={this.props.className}
        />
      );
    }
  }

  PlotlyComponent.propTypes = {
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
    className: PropTypes.string,
    useResizeHandler: PropTypes.bool,
    divId: PropTypes.string,
  };

  for (let i = 0; i < eventNames.length; i++) {
    PlotlyComponent.propTypes['on' + eventNames[i]] = PropTypes.func;
  }

  PlotlyComponent.defaultProps = {
    debug: false,
    useResizeHandler: false,
    data: [],
    style: {position: 'relative', display: 'inline-block'},
  };

  return PlotlyComponent;
}
