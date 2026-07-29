// The single source of truth for the plotly.js events this wrapper forwards.
//
// The naming convention is:
//   - events are attached as `'plotly_' + name.toLowerCase()`
//   - react props are `'on' + name`
//
// `triggersUpdate` marks events plotly.js emits *after* changing the figure;
// the wrapper listens to those and fires `onUpdate`. Never set it on a
// cancelable event — that adds a second listener alongside the consumer's,
// and plotly keeps only the last listener's return value, so a consumer's
// `return false` could be discarded. The drill-down clicks rely on
// `plotly_animated` instead.
//
// The `on*` prop types in `factory.d.ts` are maintained by hand against this list
export const events = [
  {name: 'AfterExport'},
  {name: 'AfterPlot'},
  {name: 'Animated', triggersUpdate: true},
  {name: 'Animating'},
  {name: 'AnimatingFrame'},
  {name: 'AnimationInterrupted'},
  {name: 'AutoSize'},
  {name: 'BeforeExport'},
  {name: 'BeforeHover'},
  {name: 'BeforePlot'},
  {name: 'ButtonClicked'},
  {name: 'Click'},
  {name: 'ClickAnnotation'},
  {name: 'Deselect'},
  {name: 'DoubleClick', triggersUpdate: true},
  {name: 'Framework'},
  {name: 'Hover'},
  {name: 'IcicleClick'},
  {name: 'LegendClick'},
  {name: 'LegendDoubleClick'},
  {name: 'LegendTitleClick'},
  {name: 'LegendTitleDoubleClick'},
  {name: 'Relayout', triggersUpdate: true},
  {name: 'Relayouting', triggersUpdate: true},
  {name: 'Restyle', triggersUpdate: true},
  {name: 'Redraw', triggersUpdate: true},
  {name: 'Selected'},
  {name: 'Selecting'},
  {name: 'SliderChange'},
  {name: 'SliderEnd'},
  {name: 'SliderStart'},
  {name: 'SunburstClick'},
  {name: 'Transitioned'},
  {name: 'Transitioning'},
  {name: 'TransitionInterrupted'},
  {name: 'TreemapClick'},
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
