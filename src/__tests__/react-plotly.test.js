import React from 'react';
import createComponent from '../factory';
import once from 'onetime';
import {mount} from 'enzyme';

describe('<Plotly/>', () => {
  let Plotly, PlotComponent;

  function createPlot(props) {
    return new Promise((resolve, reject) => {
      const plot = mount(
        <PlotComponent
          {...props}
          onInitialized={() => {
            resolve(plot);
          }}
          onError={reject}
        />
      );
    });
  }

  function expectPlotlyAPICall(method, props, defaultArgs) {
    expect(method).toHaveBeenCalledWith(
      expect.anything(),
      Object.assign(
        defaultArgs || {
          data: [],
          config: undefined,
          layout: undefined,
          frames: undefined,
        },
        props || {}
      )
    );
  }

  describe('with mocked plotly.js', () => {
    beforeEach(() => {
      Plotly = require.requireMock('../__mocks__/plotly.js').default;
      PlotComponent = createComponent(Plotly);

      // Override the parent element size:
      PlotComponent.prototype.getParentSize = () => ({
        width: 123,
        height: 456,
      });
    });

    describe('initialization', function() {
      it('calls Plotly.newPlot on instantiation', done => {
        createPlot({})
          .then(() => {
            expect(Plotly.newPlot).toHaveBeenCalled();
          })
          .catch(err => {
            done.fail(err);
          })
          .then(done);
      });

      it('passes data', done => {
        createPlot({
          data: [{x: [1, 2, 3]}],
          layout: {title: 'foo'},
        })
          .then(() => {
            expectPlotlyAPICall(Plotly.newPlot, {
              data: [{x: [1, 2, 3]}],
              layout: {title: 'foo'},
            });
          })
          .catch(err => done.fail(err))
          .then(done);
      });

      it('accepts width and height', done => {
        createPlot({
          layout: {width: 320, height: 240},
        })
          .then(() => {
            expectPlotlyAPICall(Plotly.newPlot, {
              layout: {width: 320, height: 240},
            });
          })
          .catch(err => done.fail(err))
          .then(done);
      });

      it('overrides the height when fit: true', done => {
        createPlot({
          layout: {width: 320, height: 240},
          fit: true,
        })
          .then(() => {
            expectPlotlyAPICall(Plotly.newPlot, {
              layout: {width: 320, height: 240},
            });
          })
          .catch(err => done.fail(err))
          .then(done);
      });
    });

    describe('plot updates', () => {
      it('updates data', done => {
        createPlot({
          fit: true,
          layout: {width: 123, height: 456},
          onUpdate: once(() => {
            expectPlotlyAPICall(Plotly.newPlot, {
              data: [{x: [1, 2, 3]}],
              layout: {width: 123, height: 456},
            });
            done();
          }),
        })
          .then(plot => {
            plot.setProps({data: [{x: [1, 2, 3]}]});
          })
          .catch(err => done.fail(err));
      });

      it('sets the title', done => {
        createPlot({
          fit: false,
          onUpdate: once(() => {
            expectPlotlyAPICall(Plotly.newPlot, {
              layout: {title: 'test test'},
            });
            done();
          }),
        })
          .then(plot => {
            plot.setProps({layout: {title: 'test test'}});
          })
          .catch(err => done.fail(err));
      });

      it('clears adds event handlers on every newPlot', done => {
        let wrapper;
        createPlot({
          fit: false,
          onClick: jest.fn(),
          onUpdate: () => {
            expect(wrapper.instance().clearLocalEventHandlers).toBeCalled();
            done();
          },
        })
          .then(plot => {
            wrapper = plot;
            wrapper.instance().clearLocalEventHandlers = jest.fn();
            expect(Object.keys(wrapper.instance().handlers)).toEqual(['Click']);
            plot.setProps({layout: {title: 'test test'}});
          })
          .catch(err => done.fail(err));
      });
    });

    describe('responding to window events', () => {
      describe('with fit: true', () => {
        it('does not call relayout on initialization', done => {
          createPlot({
            fit: true,
            onRelayout: () => done.fail('Unexpected relayout event'),
          })
            .then(() => {
              setTimeout(done, 20);
            })
            .catch(err => done.fail(err));
        });

        it('calls relayout on window resize when fit: true', done => {
          let relayoutCnt = 0;
          createPlot({
            fit: true,
            onRelayout: () => {
              relayoutCnt++;
              if (relayoutCnt === 1) {
                setTimeout(done, 20);
              }
            },
          })
            .then(() => {
              window.dispatchEvent(new Event('resize'));
            })
            .catch(err => done.fail(err));
        });
      });

      describe('with fit: false', () => {
        it('does not call relayout on init', done => {
          createPlot({
            fit: false,
            onRelayout: () => done.fail('Unexpected relayout event'),
          })
            .then(() => {
              setTimeout(done, 20);
            })
            .catch(err => done.fail(err));
        });

        it('does not call relayout on window resize', done => {
          createPlot({
            fit: false,
            onRelayout: () => done.fail('Unexpected relayout event'),
          })
            .then(() => {
              window.dispatchEvent(new Event('resize'));
              setTimeout(done, 20);
            })
            .catch(err => done.fail(err));
        });
      });
    });
  });
});
