/* eslint-disable @typescript-eslint/ban-types */
import type Plotly from 'plotly.js-dist-min';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {usePrevious} from './hooks/use-previous';

declare global {
  interface Window {
    gd: Plotly.PlotlyHTMLElement;
  }
}

type ReactEventProps = Partial<{
  onAfterExport: EventListener;
  onAfterPlot: Function;
  onAnimated: Function;
  onAnimatingFrame: Function;
  onAnimationInterrupted: Function;
  onAutoSize: Function;
  onBeforeExport: Function;
  onBeforeHover: Function;
  onButtonClicked: Function;
  onClick: Function;
  onClickAnnotation: Function;
  onDeselect: Function;
  onDoubleClick: Function;
  onFramework: Function;
  onHover: Function;
  onLegendClick: Function;
  onLegendDoubleClick: Function;
  onRelayout: Function;
  onRelayouting: Function;
  onRestyle: Function;
  onRedraw: Function;
  onSelected: Function;
  onSelecting: Function;
  onSliderChange: Function;
  onSliderEnd: Function;
  onSliderStart: Function;
  onSunburstClick: Function;
  onTransitioning: Function;
  onTransitionInterrupted: Function;
  onUnhover: Function;
  onWebGlContextLost: Function;
}>;

type PlotlyComponentProps = Partial<{
  data: Plotly.Data[];
  config: Partial<Plotly.Config>;
  layout: Partial<Plotly.Layout>;
  frames: Plotly.Frame[];
  revision: number;
  onInitialized: Function;
  onPurge: Function;
  onError: Function;
  onUpdate: Function;
  debug: boolean;
  style: React.CSSProperties;
  className: React.HTMLProps<HTMLElement>['className'];
  useResizeHandler: boolean;
  divId: string;
}> &
  ReactEventProps;

type PlotlyEvent =
  | 'AfterExport'
  | 'AfterPlot'
  | 'Animated'
  | 'AnimatingFrame'
  | 'AnimationInterrupted'
  | 'AutoSize'
  | 'BeforeExport'
  | 'BeforeHover'
  | 'ButtonClicked'
  | 'Click'
  | 'ClickAnnotation'
  | 'Deselect'
  | 'DoubleClick'
  | 'Framework'
  | 'Hover'
  | 'LegendClick'
  | 'LegendDoubleClick'
  | 'Relayout'
  | 'Relayouting'
  | 'Restyle'
  | 'Redraw'
  | 'Selected'
  | 'Selecting'
  | 'SliderChange'
  | 'SliderEnd'
  | 'SliderStart'
  | 'SunburstClick'
  | 'Transitioning'
  | 'TransitionInterrupted'
  | 'Unhover'
  | 'WebGlContextLost';

type PlotlyHTMLElementEvent =
  | 'plotly_afterexport'
  | 'plotly_afterplot'
  | 'plotly_animated'
  | 'plotly_animatingframe'
  | 'plotly_animationinterrupted'
  | 'plotly_autosize'
  | 'plotly_beforeexport'
  | 'plotly_beforehover'
  | 'plotly_buttonclicked'
  | 'plotly_click'
  | 'plotly_clickannotation'
  | 'plotly_deselect'
  | 'plotly_doubleclick'
  | 'plotly_framework'
  | 'plotly_hover'
  | 'plotly_legendclick'
  | 'plotly_legenddoubleclick'
  | 'plotly_relayout'
  | 'plotly_relayouting'
  | 'plotly_restyle'
  | 'plotly_redraw'
  | 'plotly_selected'
  | 'plotly_selecting'
  | 'plotly_sliderchange'
  | 'plotly_sliderend'
  | 'plotly_sliderstart'
  | 'plotly_sunburstclick'
  | 'plotly_transitioning'
  | 'plotly_transitioninterrupted'
  | 'plotly_unhover'
  | 'plotly_webglcontextlost';

// The naming convention is:
//   - events are attached as `'plotly_' + eventName.toLowerCase()`
//   - react props are `'on' + eventName`
const eventNames: PlotlyEvent[] = [
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
  'WebGlContextLost',
];

const updateEvents = [
  'plotly_propsyle',
  'plotly_redraw',
  'plotly_relayout',
  'plotly_relayouting',
  'plotly_doubleclick',
  'plotly_animated',
  'plotly_sunburstclick',
];

function getPlotlyEventName(eventName: PlotlyEvent): PlotlyHTMLElementEvent {
  return ('plotly_' + eventName.toLowerCase()) as PlotlyHTMLElementEvent;
}

// Check if a window is available since SSR (server-side rendering)
// breaks unnecessarily if you try to use it server-side.
const isBrowser = typeof window !== 'undefined';

export default function createPlotlyComponent(plotly: typeof Plotly) {
  function PlotlyComponent({
    data = [],
    debug = false,
    style = {position: 'relative', display: 'inline-block'},
    useResizeHandler = false,
    ...props
  }: PlotlyComponentProps): React.ReactNode {
    const [el, setEl] = useState<HTMLDivElement | Plotly.PlotlyHTMLElement | null>(null);
    const [gd, setGd] = useState<Plotly.PlotlyHTMLElement | null>(null);

    const mountEffectWasRun = useRef(false);

    const [config, setConfig] = useState(props.config);
    const [handlers, setHandlers] = useState<{[K in PlotlyEvent]?: Function}>({});
    const [resizeHandler, setResizeHandler] = useState<(() => void) | null>(null);

    const prevConfig = usePrevious(props.config);
    const prevData = usePrevious(data);
    const prevFrames = usePrevious(props.frames);
    const prevLayout = usePrevious(props.layout);
    const prevRevision = usePrevious(props.revision);

    const syncWindowResize = useCallback(
      (invoke: boolean) => {
        if (!isBrowser || !gd) {
          return;
        }

        if (useResizeHandler && resizeHandler === null) {
          const _resizeHandler = () => plotly.Plots.resize(gd);
          window.addEventListener('resize', _resizeHandler);
          if (invoke) {
            _resizeHandler();
          }

          setResizeHandler(resizeHandler);
        } else if (!useResizeHandler && resizeHandler !== null) {
          window.removeEventListener('resize', resizeHandler);

          setResizeHandler(null);
        }
      },
      [gd, resizeHandler, useResizeHandler]
    );

    const figureCallback = useCallback(
      (callback: Function) => {
        if (typeof callback === 'function' && gd) {
          const {data, layout} = gd;
          // Property '_transitionData' does not exist on type 'PlotlyHTMLElement'
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const frames = (gd as unknown as any)?._transitionData?._frames;
          const figure = {data, layout, frames};
          callback(figure, gd);
        }
      },
      [gd]
    );

    const handleUpdate = useCallback(() => {
      if (typeof props.onUpdate !== 'undefined') {
        figureCallback(props.onUpdate);
      }
    }, [figureCallback, props.onUpdate]);

    const attachUpdateEvents = useCallback(() => {
      if (!gd?.on) {
        return;
      }

      updateEvents.forEach((updateEvent) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gd.on(updateEvent as any, handleUpdate);
      });
    }, [gd, handleUpdate]);

    const removeUpdateEvents = useCallback(() => {
      // Property 'removeListener' does not exist on type 'PlotlyHTMLElement'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const _gd = gd as unknown as any;
      if (!_gd?.removeListener) {
        return;
      }

      updateEvents.forEach((updateEvent) => {
        _gd.removeListener(updateEvent, handleUpdate);
      });
    }, [gd, handleUpdate]);

    const updatePlotly = useCallback(
      (
        shouldInvokeResizeHandler: boolean,
        figureCallbackFunction: Function | undefined,
        shouldAttachUpdateEvents: boolean
      ) => {
        Promise.resolve()
          .then(() => {
            if (!el) {
              throw new Error('Missing element reference');
            }

            // eslint-disable-next-line consistent-return
            return plotly.react(el, data, props.layout, config).then((plotlyEl) => {
              setGd(plotlyEl);

              if (debug && isBrowser) {
                window.gd = plotlyEl;
              }
            });
          })
          .then(() => {
            syncWindowResize(shouldInvokeResizeHandler);

            if (typeof figureCallbackFunction !== 'undefined') {
              figureCallback(figureCallbackFunction);
            }

            if (shouldAttachUpdateEvents) {
              attachUpdateEvents();
            }
          })
          .catch((err) => {
            if (props.onError) {
              props.onError(err);
            }
          });
      },
      [attachUpdateEvents, config, data, debug, el, figureCallback, props, syncWindowResize]
    );

    const addEventHandler = useCallback(
      (eventName: PlotlyEvent, prop: Function) => {
        handlers[eventName] = prop;
        const event = getPlotlyEventName(eventName);
        const callback = handlers[eventName];
        if (gd && callback) {
          // Disable rule to get around "No overload matches this call" error
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          gd.on(event as any, callback as any);
        }
      },
      [gd, handlers]
    );

    const removeEventHandler = useCallback(
      (eventName: PlotlyEvent) => {
        const event = getPlotlyEventName(eventName);
        const callback = handlers[eventName];
        if (gd && callback) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          gd.removeEventListener(event, callback as any);

          setHandlers((prevHandlers) => {
            delete prevHandlers[eventName];
            return prevHandlers;
          });
        }
      },
      [gd, handlers]
    );

    const getEl = useCallback((el: HTMLDivElement | Plotly.PlotlyHTMLElement | null) => {
      setEl(el);
    }, []);

    // Fix for broken resize on CSS Grid
    // https://github.com/plotly/react-plotly.js/issues/102#issuecomment-510541102
    useEffect(() => {
      if (useResizeHandler && !props?.config?.responsive) {
        setConfig((prevConfig) => ({
          ...prevConfig,
          responsive: true,
        }));
      }
    }, [props?.config?.responsive, useResizeHandler]);

    // componentDidMount
    useEffect(() => {
      if (!mountEffectWasRun.current) {
        updatePlotly(true, props.onInitialized, true);
      }

      return () => {
        mountEffectWasRun.current = true;
      };
    }, [props.config, props.onInitialized, updatePlotly, useResizeHandler]);

    // componentDidUpdate
    useEffect(() => {
      // frames *always* changes identity so fall back to check length only
      const numPrevFrames = prevFrames?.length ?? 0;
      const numNextFrames = props.frames?.length ?? 0;

      const figureChanged = !(
        prevLayout === props.layout &&
        prevData === data &&
        prevConfig === props.config &&
        numPrevFrames === numNextFrames
      );
      const revisionDefined = prevRevision !== void 0;
      const revisionChanged = prevRevision !== props.revision;

      if (!figureChanged && (!revisionDefined || (revisionDefined && !revisionChanged))) {
        return;
      }

      updatePlotly(false, props.onUpdate, false);
    }, [
      data,
      prevConfig,
      prevData,
      prevFrames?.length,
      prevLayout,
      prevRevision,
      props.config,
      props.frames?.length,
      props.layout,
      props.onUpdate,
      props.revision,
      updatePlotly,
    ]);

    // componentWillUnmount
    useEffect(() => {
      return () => {
        if (typeof props.onPurge !== 'undefined') {
          figureCallback(props.onPurge);
        }

        if (resizeHandler !== null && isBrowser) {
          window.removeEventListener('resize', resizeHandler);
        }

        removeUpdateEvents();

        if (gd) {
          plotly.purge(gd);
        }
      };
    }, [figureCallback, gd, props.onPurge, removeUpdateEvents, resizeHandler]);

    // Attach and remove event handlers as they're added or removed from props:
    useEffect(() => {
      if (gd) {
        eventNames.forEach((eventName) => {
          const reactPlotlyEvent = ('on' + eventName) as keyof ReactEventProps;
          const prop = props[reactPlotlyEvent];
          const handler = handlers[eventName];
          const hasHandler = Boolean(handler);

          if (prop && !hasHandler) {
            // Needs to be added
            addEventHandler(eventName, prop);
          } else if (!prop && hasHandler) {
            // Needs to be removed
            removeEventHandler(eventName);
          } else if (prop && hasHandler && prop !== handler) {
            // Needs to be replaced
            removeEventHandler(eventName);
            addEventHandler(eventName, prop);
          }
        });
      }
    }, [addEventHandler, gd, handlers, props, removeEventHandler]);

    return <div id={props.divId} style={style} ref={getEl} className={props.className} />;
  }

  return PlotlyComponent;
}
