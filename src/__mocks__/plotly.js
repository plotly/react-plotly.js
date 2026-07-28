import EventEmitter from 'event-emitter';
const state = {};

const ASYNC_DELAY = 1;

// Real plotly.js binds node's EventEmitter onto the graph div, so a gd exposes
// `removeListener` (see plotly.js src/lib/events.js). The `event-emitter`
// package only gives us `off`, and the wrapper treats a missing
// `removeListener` as "not a plotly graph div" — which silently disabled the
// whole update-event path under test. Alias it so the mock matches reality.
function attachEmitter(gd) {
  EventEmitter(gd); // eslint-disable-line new-cap
  gd.removeListener = gd.off;
  return gd;
}

export default {
  plot: jest.fn((gd) => {
    state.gd = gd;
    setTimeout(() => {
      state.gd.emit('plotly_afterplot');
    }, ASYNC_DELAY);
  }),
  newPlot: jest.fn((gd) => {
    state.gd = attachEmitter(gd);

    setTimeout(() => {
      state.gd.emit('plotly_afterplot');
    }, ASYNC_DELAY);
  }),
  react: jest.fn((gd) => {
    state.gd = attachEmitter(gd);

    setTimeout(() => {
      state.gd.emit('plotly_afterplot');
    }, ASYNC_DELAY);
  }),
  relayout: jest.fn((gd) => {
    state.gd = gd;
    setTimeout(() => {
      state.gd.emit('plotly_relayout');
    }, ASYNC_DELAY);
  }),
  restyle: jest.fn((gd) => {
    state.gd = gd;
    setTimeout(() => {
      state.gd.emit('plotly_restyle');
    }, ASYNC_DELAY);
  }),
  update: jest.fn(),
  purge: jest.fn(() => {
    state.gd = null;
  }),
};
