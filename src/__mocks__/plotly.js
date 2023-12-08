import EventEmitter from 'event-emitter';
import {vi} from 'vitest';

const state = {};

const ASYNC_DELAY = 1;

export default {
  newPlot: vi.fn((gd) => {
    state.gd = gd;
    EventEmitter(state.gd); // eslint-disable-line new-cap

    setTimeout(() => {
      state.gd.emit('plotly_afterplot');
    }, ASYNC_DELAY);
  }),
  react: vi.fn((gd) => {
    state.gd = gd;
    EventEmitter(state.gd); // eslint-disable-line new-cap

    setTimeout(() => {
      state.gd.emit('plotly_afterplot');
    }, ASYNC_DELAY);
  }),
  relayout: vi.fn((gd) => {
    state.gd = gd;
    setTimeout(() => {
      state.gd.emit('plotly_relayout');
    }, ASYNC_DELAY);
  }),
  restyle: vi.fn((gd) => {
    state.gd = gd;
    setTimeout(() => {
      state.gd.emit('plotly_restyle');
    }, ASYNC_DELAY);
  }),
  update: vi.fn(),
  purge: vi.fn(() => {
    state.gd = null;
  }),
};
