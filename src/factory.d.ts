import type React from 'react';

/**
 * The snapshot of plot state passed to figure callbacks.
 * `data`, `layout`, and the entries of `frames` are plotly.js objects; this
 * package does not depend on `@types/plotly.js`, so they are typed as
 * `unknown`. Consumers wanting tighter types can re-declare with imports
 * from `plotly.js`.
 */
export interface Figure {
  data: unknown[];
  layout: unknown;
  frames: unknown[] | null;
}

export type FigureCallback = (figure: Figure, graphDiv: HTMLElement) => void;
export type EventCallback = (event: any) => void;

export interface PlotParams {
  data?: unknown[];
  layout?: unknown;
  config?: unknown;
  frames?: unknown[];
  revision?: number;
  onInitialized?: FigureCallback;
  onUpdate?: FigureCallback;
  onPurge?: FigureCallback;
  onError?: (err: Error) => void;
  debug?: boolean;
  style?: React.CSSProperties;
  className?: string;
  useResizeHandler?: boolean;
  divId?: string;

  onAfterExport?: EventCallback;
  onAfterPlot?: EventCallback;
  onAnimated?: EventCallback;
  onAnimating?: EventCallback;
  onAnimatingFrame?: EventCallback;
  onAnimationInterrupted?: EventCallback;
  onAutoSize?: EventCallback;
  onBeforeExport?: EventCallback;
  onBeforeHover?: EventCallback;
  onBeforePlot?: EventCallback;
  onButtonClicked?: EventCallback;
  onClick?: EventCallback;
  onClickAnnotation?: EventCallback;
  onDeselect?: EventCallback;
  onDoubleClick?: EventCallback;
  onFramework?: EventCallback;
  onHover?: EventCallback;
  onIcicleClick?: EventCallback;
  onLegendClick?: EventCallback;
  onLegendDoubleClick?: EventCallback;
  onLegendTitleClick?: EventCallback;
  onLegendTitleDoubleClick?: EventCallback;
  onRelayout?: EventCallback;
  onRelayouting?: EventCallback;
  onRestyle?: EventCallback;
  onRedraw?: EventCallback;
  onSelected?: EventCallback;
  onSelecting?: EventCallback;
  onSliderChange?: EventCallback;
  onSliderEnd?: EventCallback;
  onSliderStart?: EventCallback;
  onSunburstClick?: EventCallback;
  onTransitioned?: EventCallback;
  onTransitioning?: EventCallback;
  onTransitionInterrupted?: EventCallback;
  onTreemapClick?: EventCallback;
  onUnhover?: EventCallback;
  onWebGlContextLost?: EventCallback;
}

/**
 * Build a Plot component bound to a specific plotly.js instance. Use this
 * when shipping a custom plotly.js bundle (e.g. the basic, cartesian, or
 * a custom partial bundle) instead of the full library.
 *
 * The returned component is `forwardRef`-wrapped, so consumers can attach a
 * ref to access the underlying graph div (e.g. for `Plotly.animate` calls
 * outside the React update cycle).
 */
declare function createPlotlyComponent(
  Plotly: unknown
): React.ForwardRefExoticComponent<PlotParams & React.RefAttributes<HTMLDivElement>>;

export default createPlotlyComponent;
