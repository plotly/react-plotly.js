/* eslint-disable @typescript-eslint/ban-types */
import Plotly from 'plotly.js-dist-min';

declare global {
  interface Window {
    gd: Plotly.PlotlyHTMLElement | HTMLDivElement;
  }
}

export type ReactEventProps = Partial<{
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

export type PlotlyComponentProps = Partial<{
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

export type PlotlyEvent =
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

export type PlotlyHTMLElementEvent =
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
