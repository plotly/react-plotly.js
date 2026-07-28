// The single source of truth for the plotly.js events this wrapper forwards.
//
// The naming convention is:
//   - events are attached as `'plotly_' + name.toLowerCase()`
//   - react props are `'on' + name`
//
// `triggersUpdate` marks events that plotly.js emits *after* mutating the
// figure itself (drill-downs, zooms, restyles). For those the wrapper has to
// re-read the graph div and fire `onUpdate`. Keeping the flag on the same
// record as the name is deliberate: a new drill-down event cannot be added
// without deciding whether it updates the figure.
//
// The `on*` prop types in `factory.d.ts` are maintained by hand against this list
export const events = [
  {name: 'AfterExport'},
  {name: 'AfterPlot'},
  {name: 'Animated', triggersUpdate: true},
  {name: 'AnimatingFrame'},
  {name: 'AnimationInterrupted'},
  {name: 'AutoSize'},
  {name: 'BeforeExport'},
  {name: 'BeforeHover'},
  {name: 'ButtonClicked'},
  {name: 'Click'},
  {name: 'ClickAnnotation'},
  {name: 'ClickAnywhere'},
  {name: 'Deselect'},
  {name: 'DoubleClick', triggersUpdate: true},
  {name: 'Framework'},
  {name: 'Hover'},
  {name: 'HoverAnywhere'},
  {name: 'IcicleClick', triggersUpdate: true},
  {name: 'LegendClick'},
  {name: 'LegendDoubleClick'},
  {name: 'Relayout', triggersUpdate: true},
  {name: 'Relayouting', triggersUpdate: true},
  {name: 'Restyle', triggersUpdate: true},
  {name: 'Redraw', triggersUpdate: true},
  {name: 'Selected'},
  {name: 'Selecting'},
  {name: 'SliderChange'},
  {name: 'SliderEnd'},
  {name: 'SliderStart'},
  {name: 'SunburstClick', triggersUpdate: true},
  {name: 'Transitioning'},
  {name: 'TransitionInterrupted'},
  {name: 'TreemapClick', triggersUpdate: true},
  {name: 'Unhover'},
  {name: 'WebGlContextLost'},
];

/** The plotly.js event name a given entry is attached as. */
export function getPlotlyEventName(eventName) {
  return 'plotly_' + eventName.toLowerCase();
}

/** The React prop name a given entry is read from. */
export function getPropName(eventName) {
  return 'on' + eventName;
}

export const eventNames = events.map((event) => event.name);

export const updateEvents = events
  .filter((event) => event.triggersUpdate)
  .map((event) => getPlotlyEventName(event.name));
