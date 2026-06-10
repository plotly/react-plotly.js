import type React from 'react';
import type {PlotParams} from './factory';

declare const Plot: React.ComponentType<PlotParams>;

export default Plot;
export {Figure, FigureCallback, EventCallback, PlotParams} from './factory';
