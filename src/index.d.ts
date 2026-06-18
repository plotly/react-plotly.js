import type React from 'react';
import type {PlotParams} from './factory';

declare const Plot: React.ForwardRefExoticComponent<
  PlotParams & React.RefAttributes<HTMLDivElement>
>;

export default Plot;
export {Figure, FigureCallback, EventCallback, PlotParams} from './factory';
