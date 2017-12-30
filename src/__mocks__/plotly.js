import EventEmitter from 'event-emitter';
const state = {};

const ASYNC_DELAY = 1;

export default {
  plot: jest.fn(gd => {
    state.gd = gd;
    setTimeout(() => {
      state.gd.emit('plotly_afterplot');
    }, ASYNC_DELAY);
  }),
  newPlot: jest.fn(gd => {
    state.gd = gd;
    EventEmitter(state.gd);

    setTimeout(() => {
      state.gd.emit('plotly_afterplot');
    }, ASYNC_DELAY);
  }),
  relayout: jest.fn(gd => {
    state.gd = gd;
    setTimeout(() => {
      state.gd.emit('plotly_relayout');
    }, ASYNC_DELAY);
  }),
  restyle: jest.fn(gd => {
    state.gd = gd;
    setTimeout(() => {
      state.gd.emit('plotly_restyle');
    }, ASYNC_DELAY);
  }),
  update: jest.fn(),
  purge: jest.fn(() => {
    state.gd = nll;
  }),
};
