/* eslint-disable @typescript-eslint/ban-types */
import Plotly from 'plotly.js-dist-min';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {usePrevious} from './hooks/use-previous.mjs';

declare global {
  interface Window {
    gd: Plotly.PlotlyHTMLElement | HTMLDivElement;
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
    const el = useRef<HTMLDivElement>(null);
    const mountEffectWasRun = useRef(false);

    const [unmounting, setUnmounting] = useState(false);
    const [handlers, setHandlers] = useState<{[K in PlotlyEvent]?: Function}>({});

    const prevConfig = usePrevious(props.config);
    const prevData = usePrevious(data);
    const prevFrames = usePrevious(props.frames);
    const prevLayout = usePrevious(props.layout);
    const prevRevision = usePrevious(props.revision);

    const resizeHandler = useCallback(() => {
      if (el.current) {
        return plotly.Plots.resize(el.current);
      }

      return null;
    }, []);

    const syncWindowResize = useCallback(
      (invoke: boolean) => {
        if (!isBrowser) {
          return;
        }

        if (useResizeHandler && resizeHandler !== null) {
          window.addEventListener('resize', resizeHandler);
          if (invoke) {
            resizeHandler();
          }
        } else if (!useResizeHandler && resizeHandler !== null) {
          window.removeEventListener('resize', resizeHandler);
        }
      },
      [resizeHandler, useResizeHandler]
    );

    const figureCallback = useCallback((callback: Function) => {
      const element = el.current as unknown as Plotly.PlotlyHTMLElement;
      if (typeof callback === 'function' && element) {
        const {data, layout} = element;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const frames = (element as unknown as any)?._transitionData?._frames;
        const figure = {data, layout, frames};
        callback(figure, element);
      }
    }, []);

    const handleUpdate = useCallback(() => {
      if (typeof props.onUpdate !== 'undefined') {
        figureCallback(props.onUpdate);
      }
    }, [figureCallback, props.onUpdate]);

    const attachUpdateEvents = useCallback(() => {
      const element = el.current as unknown as Plotly.PlotlyHTMLElement;
      if (!element || !element.on) {
        return;
      }

      updateEvents.forEach((updateEvent) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        element.on(updateEvent as any, handleUpdate);
      });
    }, [handleUpdate]);

    const removeUpdateEvents = useCallback(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const element = el.current as unknown as any;
      // removeListener does not exist on type PlotlyHTMLElement
      if (!element || !element.removeListener) {
        return;
      }

      updateEvents.forEach((updateEvent) => {
        element.removeListener(updateEvent, handleUpdate);
      });
    }, [handleUpdate]);

    const updatePlotly = useCallback(
      (
        shouldInvokeResizeHandler: boolean,
        figureCallbackFunction: Function | undefined,
        shouldAttachUpdateEvents: boolean
      ) => {
        Promise.resolve()
          .then(() => {
            if (unmounting) {
              return;
            }

            if (!el.current) {
              throw new Error('Missing element reference');
            }

            // eslint-disable-next-line consistent-return
            return plotly.react(el.current, data, props.layout, props.config);
          })
          .then(() => {
            if (unmounting) {
              return;
            }
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
      [attachUpdateEvents, data, figureCallback, props, syncWindowResize, unmounting]
    );

    // componentDidMount
    useEffect(() => {
      if (!mountEffectWasRun.current) {
        setUnmounting(false);
        updatePlotly(true, props.onInitialized, true);
      }

      return () => {
        mountEffectWasRun.current = true;
      };
    }, [props.onInitialized, updatePlotly]);

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
      const element = el.current;

      return () => {
        setUnmounting(false);

        if (typeof props.onPurge !== 'undefined') {
          figureCallback(props.onPurge);
        }

        if (resizeHandler !== null && isBrowser) {
          window.removeEventListener('resize', resizeHandler);
        }

        removeUpdateEvents();

        if (element) {
          Plotly.purge(element);
        }
      };
    }, [figureCallback, props.onPurge, removeUpdateEvents, resizeHandler]);

    useEffect(() => {
      if (debug && isBrowser && el.current) {
        window.gd = el.current;
      }
    }, [debug]);

    const getPlotlyEventName = useCallback((eventName: PlotlyEvent): PlotlyHTMLElementEvent => {
      return ('plotly_' + eventName.toLowerCase()) as PlotlyHTMLElementEvent;
    }, []);

    const addEventHandler = useCallback(
      (eventName: PlotlyEvent, prop: Function) => {
        handlers[eventName] = prop;
        const event = getPlotlyEventName(eventName);
        const callback = handlers[eventName];
        if (el.current && callback) {
          // Cast the current element as a PlotlyHTMLElement
          // Disable rule to get around "No overload matches this call" error
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (el.current as unknown as Plotly.PlotlyHTMLElement).on(event as any, callback as any);
        }
      },
      [getPlotlyEventName, handlers]
    );

    const removeEventHandler = useCallback(
      (eventName: PlotlyEvent) => {
        const event = getPlotlyEventName(eventName);
        const callback = handlers[eventName];
        if (el.current && callback) {
          (el.current as unknown as Plotly.PlotlyHTMLElement).removeEventListener(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            event as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            callback as any
          );
          setHandlers((prevHandlers) => {
            delete prevHandlers[eventName];
            return prevHandlers;
          });
        }
      },
      [getPlotlyEventName, handlers]
    );

    // Attach and remove event handlers as they're added or removed from props:
    useEffect(() => {
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
    }, [addEventHandler, handlers, props, removeEventHandler]);

    return <div id={props.divId} style={style} ref={el} className={props.className} />;
  }

  return PlotlyComponent;
}
