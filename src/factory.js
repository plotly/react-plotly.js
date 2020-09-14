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
  'Relayouting',
  'Restyle',
  'Redraw',
  'Selected',
  'Selecting',
  'SliderChange',
  'SliderEnd',
  'SliderStart',
  'SunburstClick',
  'Transitioning',
  'TransitionInterrupted',
  'Unhover',
];

const updateEvents = [
  'plotly_restyle',
  'plotly_redraw',
  'plotly_relayout',
  'plotly_relayouting',
  'plotly_doubleclick',
  'plotly_animated',
  'plotly_sunburstclick',
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
      this.updatePlotly = this.updatePlotly.bind(this);
    }

    updatePlotly(shouldInvokeResizeHandler, figureCallbackFunction, shouldAttachUpdateEvents) {
      this.p = this.p
        .then(() => {
          if (this.unmounting) {
            return;
          }
          if (!this.el) {
            throw new Error('Missing element reference');
          }
          // eslint-disable-next-line consistent-return
          return Plotly.react(this.el, {
            data: this.props.data,
            layout: this.props.layout,
            config: this.props.config,
            frames: this.props.frames,
          });
        })
        .then(() => {
          if (this.unmounting) {
            return;
          }
          this.syncWindowResize(shouldInvokeResizeHandler);
          this.syncEventHandlers();
          this.figureCallback(figureCallbackFunction);
          if (shouldAttachUpdateEvents) {
            this.attachUpdateEvents();
          }
        })
        .catch((err) => {
          if (this.props.onError) {
            this.props.onError(err);
          }
        });
    }

    componentDidMount() {
      this.unmounting = false;

      this.updatePlotly(true, this.props.onInitialized, true);
    }

    componentDidUpdate(prevProps) {
      this.unmounting = false;

      // frames *always* changes identity so fall back to check length only :(
      const numPrevFrames =
        prevProps.frames && prevProps.frames.length ? prevProps.frames.length : 0;
      const numNextFrames =
        this.props.frames && this.props.frames.length ? this.props.frames.length : 0;

      const figureChanged = !(
        prevProps.layout === this.props.layout &&
        prevProps.data === this.props.data &&
        prevProps.config === this.props.config &&
        numNextFrames === numPrevFrames
      );
      const revisionDefined = prevProps.revision !== void 0;
      const revisionChanged = prevProps.revision !== this.props.revision;

      if (!figureChanged && (!revisionDefined || (revisionDefined && !revisionChanged))) {
        return;
      }

      this.updatePlotly(false, this.props.onUpdate, false);
    }

    componentWillUnmount() {
      this.unmounting = true;

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

      updateEvents.forEach((updateEvent) => {
        this.el.on(updateEvent, this.handleUpdate);
      });
    }

    removeUpdateEvents() {
      if (!this.el || !this.el.removeListener) {
        return;
      }

      updateEvents.forEach((updateEvent) => {
        this.el.removeListener(updateEvent, this.handleUpdate);
      });
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

    syncWindowResize(invoke) {
      if (!isBrowser) {
        return;
      }

      if (this.props.useResizeHandler && !this.resizeHandler) {
        this.resizeHandler = () => Plotly.Plots.resize(this.el);
        window.addEventListener('resize', this.resizeHandler);
        if (invoke) {
          this.resizeHandler();
        }
      } else if (!this.props.useResizeHandler && this.resizeHandler) {
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
    syncEventHandlers() {
      eventNames.forEach((eventName) => {
        const prop = this.props['on' + eventName];
        const handler = this.handlers[eventName];
        const hasHandler = Boolean(handler);

        if (prop && !hasHandler) {
          this.addEventHandler(eventName, prop);
        } else if (!prop && hasHandler) {
          // Needs to be removed:
          this.removeEventHandler(eventName);
        } else if (prop && hasHandler && prop !== handler) {
          // replace the handler
          this.removeEventHandler(eventName);
          this.addEventHandler(eventName, prop);
        }
      });
    }

    addEventHandler(eventName, prop) {
      this.handlers[eventName] = prop;
      this.el.on(this.getPlotlyEventName(eventName), this.handlers[eventName]);
    }

    removeEventHandler(eventName) {
      this.el.removeListener(this.getPlotlyEventName(eventName), this.handlers[eventName]);
      delete this.handlers[eventName];
    }

    getPlotlyEventName(eventName) {
      return 'plotly_' + eventName.toLowerCase();
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

  eventNames.forEach((eventName) => {
    PlotlyComponent.propTypes['on' + eventName] = PropTypes.func;
  });

  PlotlyComponent.defaultProps = {
    debug: false,
    useResizeHandler: false,
    data: [],
    style: {position: 'relative', display: 'inline-block'},
  };

  return PlotlyComponent;
}
