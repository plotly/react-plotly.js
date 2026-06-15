import React, {forwardRef, useCallback, useEffect, useRef} from 'react';

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
  'BeforeHover',
  'ButtonClicked',
  'Click',
  'ClickAnnotation',
  'ClickAnywhere',
  'Deselect',
  'DoubleClick',
  'Framework',
  'Hover',
  'HoverAnywhere',
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
  'WebGlContextLost',
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

// Module-level frozen defaults so identity stays stable across renders when a
// consumer omits the prop. Without this, the `===` checks in the update
// effect would always see "changed" and trigger a needless Plotly.react.
const DEFAULT_DATA = Object.freeze([]);
const DEFAULT_STYLE = Object.freeze({position: 'relative', display: 'inline-block'});

function getPlotlyEventName(eventName) {
  return 'plotly_' + eventName.toLowerCase();
}

export default function plotComponentFactory(Plotly) {
  return forwardRef(function PlotlyComponent(
    {
      data = DEFAULT_DATA,
      layout,
      config,
      frames,
      revision,
      onInitialized,
      onUpdate,
      onPurge,
      onError,
      debug = false,
      style = DEFAULT_STYLE,
      className,
      useResizeHandler = false,
      divId,
      ...eventProps
    },
    forwardedRef
  ) {
    const elRef = useRef(null);
    const promiseRef = useRef(Promise.resolve());
    const handlersRef = useRef({});
    const resizeHandlerRef = useRef(null);
    const unmountingRef = useRef(false);
    const prevRef = useRef(null);

    // Refs that mirror the latest values of callbacks consumed by listeners
    // attached during mount (which must keep stable identity across renders).
    const onUpdateRef = useRef(onUpdate);
    onUpdateRef.current = onUpdate;
    const onPurgeRef = useRef(onPurge);
    onPurgeRef.current = onPurge;

    // Stable closure for plotly update events. Reads latest `onUpdate` via the
    // ref so the listener identity stays the same across renders — we need the
    // same function reference for both `.on(...)` and `.removeListener(...)`.
    const handleUpdate = useRef(() => {
      const cb = onUpdateRef.current;
      if (typeof cb !== 'function' || !elRef.current) {
        return;
      }
      const el = elRef.current;
      const frames = el._transitionData ? el._transitionData._frames : null;
      cb({data: el.data, layout: el.layout, frames}, el);
    }).current;

    const setRef = useCallback(
      (el) => {
        elRef.current = el;
        if (typeof forwardedRef === 'function') {
          forwardedRef(el);
        } else if (forwardedRef) {
          forwardedRef.current = el;
        }
        if (debug && isBrowser && el) {
          window.gd = el;
        }
      },
      [forwardedRef, debug]
    );

    // Mount + update effect: no deps array, so it runs after every render —
    // mirroring the original componentDidMount + componentDidUpdate flow.
    useEffect(() => {
      unmountingRef.current = false;

      if (prevRef.current === null) {
        prevRef.current = {data, layout, config, frames, revision};
        runPlotlyReact(true, onInitialized, true);
        return;
      }

      const prev = prevRef.current;
      const numPrev = prev.frames && prev.frames.length ? prev.frames.length : 0;
      const numNext = frames && frames.length ? frames.length : 0;

      const figureChanged = !(
        prev.layout === layout &&
        prev.data === data &&
        prev.config === config &&
        numPrev === numNext
      );
      const revisionWasDefined = prev.revision !== void 0;
      const revisionChanged = prev.revision !== revision;

      prevRef.current = {data, layout, config, frames, revision};

      if (!figureChanged && (!revisionWasDefined || !revisionChanged)) {
        return;
      }

      runPlotlyReact(false, onUpdate, false);
    });

    // Cleanup effect — runs on unmount only.
    useEffect(() => {
      const el = elRef.current;
      return () => {
        unmountingRef.current = true;
        if (el) {
          if (typeof onPurgeRef.current === 'function') {
            const frames = el._transitionData ? el._transitionData._frames : null;
            onPurgeRef.current({data: el.data, layout: el.layout, frames}, el);
          }
          if (el.removeListener) {
            updateEvents.forEach((evt) => el.removeListener(evt, handleUpdate));
          }
          Plotly.purge(el);
        }
        if (resizeHandlerRef.current && isBrowser) {
          window.removeEventListener('resize', resizeHandlerRef.current);
          resizeHandlerRef.current = null;
        }
      };
    }, []);

    function runPlotlyReact(shouldInvokeResize, figureCallback, shouldAttachUpdateEvents) {
      promiseRef.current = promiseRef.current
        .then(() => {
          if (unmountingRef.current) {
            return void 0;
          }
          if (!elRef.current) {
            throw new Error('Missing element reference');
          }
          return Plotly.react(elRef.current, {data, layout, config, frames});
        })
        .then(() => {
          if (unmountingRef.current) {
            return;
          }
          syncWindowResize(shouldInvokeResize);
          syncEventHandlers();
          invokeFigureCallback(figureCallback);
          if (shouldAttachUpdateEvents) {
            attachUpdateEvents();
          }
        })
        .catch((err) => {
          if (typeof onError === 'function') {
            onError(err);
          }
        });
    }

    function invokeFigureCallback(callback) {
      if (typeof callback !== 'function' || !elRef.current) {
        return;
      }
      const el = elRef.current;
      const f = el._transitionData ? el._transitionData._frames : null;
      callback({data: el.data, layout: el.layout, frames: f}, el);
    }

    function attachUpdateEvents() {
      if (!elRef.current || !elRef.current.removeListener) {
        return;
      }
      updateEvents.forEach((evt) => elRef.current.on(evt, handleUpdate));
    }

    function syncWindowResize(invoke) {
      if (!isBrowser) {
        return;
      }
      if (useResizeHandler && !resizeHandlerRef.current) {
        resizeHandlerRef.current = () => Plotly.Plots.resize(elRef.current);
        window.addEventListener('resize', resizeHandlerRef.current);
        if (invoke) {
          resizeHandlerRef.current();
        }
      } else if (!useResizeHandler && resizeHandlerRef.current) {
        window.removeEventListener('resize', resizeHandlerRef.current);
        resizeHandlerRef.current = null;
      }
    }

    function syncEventHandlers() {
      eventNames.forEach((eventName) => {
        const prop = eventProps['on' + eventName];
        const handler = handlersRef.current[eventName];
        const hasHandler = Boolean(handler);
        if (prop && !hasHandler) {
          addEventHandler(eventName, prop);
        } else if (!prop && hasHandler) {
          removeEventHandler(eventName);
        } else if (prop && hasHandler && prop !== handler) {
          removeEventHandler(eventName);
          addEventHandler(eventName, prop);
        }
      });
    }

    function addEventHandler(eventName, prop) {
      handlersRef.current[eventName] = prop;
      elRef.current.on(getPlotlyEventName(eventName), prop);
    }

    function removeEventHandler(eventName) {
      elRef.current.removeListener(getPlotlyEventName(eventName), handlersRef.current[eventName]);
      delete handlersRef.current[eventName];
    }

    return <div id={divId} style={style} ref={setRef} className={className} />;
  });
}
