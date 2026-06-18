/** @jest-environment jsdom */
import React, {StrictMode, useState} from 'react';
import {act, render} from '@testing-library/react';
import createComponent from '../factory';
import once from 'onetime';

describe('<Plotly/>', () => {
  let Plotly, PlotComponent;

  // `setProps` re-renders via a hook-driven wrapper; `gd` exposes the rendered
  // DOM element (which the mocked Plotly.react augments to an EventEmitter,
  // so tests can simulate plotly events directly).
  function createPlot(props) {
    return new Promise((resolve, reject) => {
      let setProps;
      let gd;
      const Wrapper = () => {
        const [currentProps, setCurrentProps] = useState(props);
        setProps = (next) => act(() => setCurrentProps((prev) => ({...prev, ...next})));
        return (
          <PlotComponent
            {...currentProps}
            ref={(el) => {
              gd = el;
            }}
            onInitialized={() =>
              resolve({
                setProps,
                get gd() {
                  return gd;
                },
                get props() {
                  return currentProps;
                },
              })
            }
            onError={reject}
          />
        );
      };
      render(<Wrapper />);
    });
  }

  function expectPlotlyAPICall(method, props, defaultArgs) {
    expect(method).toHaveBeenCalledWith(
      expect.anything(),
      Object.assign(
        defaultArgs || {
          data: [],
          config: undefined, // eslint-disable-line no-undefined
          layout: undefined, // eslint-disable-line no-undefined
          frames: undefined, // eslint-disable-line no-undefined
        },
        props || {}
      )
    );
  }

  describe('with mocked plotly.js', () => {
    beforeEach(() => {
      Plotly = jest.requireMock('../__mocks__/plotly.js').default;
      PlotComponent = createComponent(Plotly);
    });

    describe('initialization', function () {
      test('calls Plotly.react on instantiation', (done) => {
        createPlot({})
          .then(() => {
            expect(Plotly.react).toHaveBeenCalled();
          })
          .catch((err) => {
            done(err);
          })
          .then(done);
      });

      test('passes data', (done) => {
        createPlot({
          data: [{x: [1, 2, 3]}],
          layout: {title: 'foo'},
        })
          .then(() => {
            expectPlotlyAPICall(Plotly.react, {
              data: [{x: [1, 2, 3]}],
              layout: {title: 'foo'},
            });
          })
          .catch((err) => done(err))
          .then(done);
      });

      test('accepts width and height', (done) => {
        createPlot({
          layout: {width: 320, height: 240},
        })
          .then(() => {
            expectPlotlyAPICall(Plotly.react, {
              layout: {width: 320, height: 240},
            });
          })
          .catch((err) => done(err))
          .then(done);
      });
    });

    describe('plot updates', () => {
      test('updates data', (done) => {
        createPlot({
          layout: {width: 123, height: 456},
          onUpdate: once(() => {
            expectPlotlyAPICall(Plotly.react, {
              data: [{x: [1, 2, 3]}],
              layout: {width: 123, height: 456},
            });
            done();
          }),
        })
          .then((plot) => {
            plot.setProps({data: [{x: [1, 2, 3]}]});
          })
          .catch((err) => done(err));
      });

      test('updates data when revision is defined but not changed', (done) => {
        createPlot({
          revision: 1,
          layout: {width: 123, height: 456},
          onUpdate: once(() => {
            expectPlotlyAPICall(Plotly.react, {
              data: [{x: [1, 2, 3]}],
              layout: {width: 123, height: 456},
            });
            done();
          }),
        })
          .then((plot) => {
            plot.setProps({revision: 1, data: [{x: [1, 2, 3]}]});
          })
          .catch((err) => done(err));
      });

      test('sets the title', (done) => {
        createPlot({
          onUpdate: once(() => {
            expectPlotlyAPICall(Plotly.react, {
              layout: {title: 'test test'},
            });
            done();
          }),
        })
          .then((plot) => {
            plot.setProps({layout: {title: 'test test'}});
          })
          .catch((err) => done(err));
      });

      test('revision counter', (done) => {
        var callCnt = 0;
        createPlot({
          revision: 0,
          onUpdate: () => {
            callCnt++;

            // Should only get one update. Make it asynchronous in order
            // to make sure we haven't accidentally ended the test before
            // we've checked the third and fourth calls:
            if (callCnt === 2) {
              setTimeout(() => {
                expect(Plotly.react).not.toHaveBeenCalledTimes(2);
                done();
              }, 100);
            }
          },
        })
          .then((plot) => {
            // Update with and without revision bumps:
            /* eslint-disable no-magic-numbers */
            setTimeout(() => plot.setProps({layout: {title: 'test test'}}), 10);
            setTimeout(() => plot.setProps({revision: 1, layout: {title: 'test test'}}), 20);
            setTimeout(() => plot.setProps({revision: 1, layout: {title: 'test test'}}), 30);
            setTimeout(() => plot.setProps({revision: 2, layout: {title: 'test test'}}), 40);
          })
          .catch((err) => done(err));
      });
    });

    describe('manging event handlers', () => {
      test('should add an event handler when one does not already exist', (done) => {
        let received;
        const onRelayout = (evt) => {
          received = evt;
        };

        createPlot({onRelayout})
          .then((plot) => {
            expect(plot.props.onRelayout).toBe(onRelayout);
            // The mocked Plotly.react makes gd an EventEmitter. Fire the
            // event and verify the handler was wired through.
            plot.gd.emit('plotly_relayout', {hello: 'world'});
            expect(received).toEqual({hello: 'world'});
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('StrictMode', () => {
      // Regression: in dev StrictMode, React runs effects setup-cleanup-setup
      // to surface missing cleanup. Our cleanup calls Plotly.purge, so the
      // simulated re-setup must re-initialize. Without resetting prevRef in
      // cleanup, the mount/update effect skips re-init and the chart is dead.
      test('re-initializes plot after simulated remount', (done) => {
        Plotly.react.mockClear();
        Plotly.purge.mockClear();

        let initCount = 0;
        render(
          <StrictMode>
            <PlotComponent
              data={[{x: [1, 2, 3]}]}
              onInitialized={() => {
                initCount++;
              }}
              onError={(err) => done(err)}
            />
          </StrictMode>
        );

        setTimeout(() => {
          try {
            // Purge ran (StrictMode simulated unmount). React must run again
            // afterwards to bring the plot back.
            expect(Plotly.purge).toHaveBeenCalledTimes(1);
            expect(Plotly.react.mock.calls.length).toBeGreaterThan(Plotly.purge.mock.calls.length);
            expect(initCount).toBeGreaterThanOrEqual(1);
            done();
          } catch (e) {
            done(e);
          }
        }, 50);
      });
    });

    describe('unmount', () => {
      // Regression: React detaches callback refs before useEffect cleanups run,
      // so reading the ref from cleanup sees `null`. The cleanup effect must
      // capture the element at setup time so onPurge/Plotly.purge still fire.
      test('fires onPurge and Plotly.purge on unmount', (done) => {
        const purgeCalls = [];
        let gd;
        let resolveInit;
        const initialized = new Promise((resolve) => {
          resolveInit = resolve;
        });

        const result = render(
          <PlotComponent
            data={[{x: [1, 2, 3]}]}
            ref={(el) => {
              gd = el;
            }}
            onPurge={(figure, el) => purgeCalls.push({figure, gd: el})}
            onInitialized={once(resolveInit)}
            onError={(err) => done(err)}
          />
        );

        initialized
          .then(() => {
            // Capture before unmount — our ref callback nulls `gd` on detach.
            const capturedGd = gd;
            act(() => result.unmount());
            expect(Plotly.purge).toHaveBeenCalledWith(capturedGd);
            expect(purgeCalls).toHaveLength(1);
            expect(purgeCalls[0].gd).toBe(capturedGd);
            done();
          })
          .catch(done);
      });
    });
  });
});
