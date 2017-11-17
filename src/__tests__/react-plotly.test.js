import React from "react";
import { mount } from "enzyme";
import createComponent from "../factory";
import once from "onetime";

describe("<Plotly/>", () => {
  let Plotly, PlotComponent;

  function createPlot(props) {
    return new Promise((resolve, reject) => {
      const plot = mount(
        <PlotComponent
          {...props}
          onInitialized={() => resolve(plot)}
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

  describe("with mocked plotly.js", () => {
    beforeEach(() => {
      Plotly = require.requireMock("../__mocks__/plotly.js").default;
      PlotComponent = createComponent(Plotly);

      // Override the parent element size:
      PlotComponent.prototype.getParentSize = () => ({
        width: 123,
        height: 456,
      });
    });

    describe("initialization", function() {
      test("calls Plotly.newPlot on instantiation", done => {
        createPlot({})
          .then(() => {
            expect(Plotly.newPlot).toHaveBeenCalled();
          })
          .catch(err => {
            done.fail(err);
          })
          .then(done);
      });

      test("passes data", done => {
        createPlot({
          data: [{ x: [1, 2, 3] }],
          layout: { title: "foo" },
        })
          .then(() => {
            expectPlotlyAPICall(Plotly.newPlot, {
              data: [{ x: [1, 2, 3] }],
              layout: { title: "foo" },
            });
          })
          .catch(err => done.fail(err))
          .then(done);
      });

      test("accepts width and height", done => {
        createPlot({
          layout: { width: 320, height: 240 },
        })
          .then(() => {
            expectPlotlyAPICall(Plotly.newPlot, {
              layout: { width: 320, height: 240 },
            });
          })
          .catch(err => done.fail(err))
          .then(done);
      });

      test("overrides the height when fit: true", done => {
        createPlot({
          layout: { width: 320, height: 240 },
          fit: true,
        })
          .then(() => {
            expectPlotlyAPICall(Plotly.newPlot, {
              layout: { width: 320, height: 240 },
            });
          })
          .catch(err => done.fail(err))
          .then(done);
      });
    });

    describe("plot updates", () => {
      test("updates data", done => {
        createPlot({
          fit: true,
          layout: { width: 123, height: 456 },
          onUpdate: once(() => {
            expectPlotlyAPICall(Plotly.newPlot, {
              data: [{ x: [1, 2, 3] }],
              layout: { width: 123, height: 456 },
            });
            done();
          }),
        })
          .then(plot => {
            plot.setProps({ data: [{ x: [1, 2, 3] }] });
          })
          .catch(err => done.fail(err));
      });

      test("sets the title", done => {
        createPlot({
          fit: false,
          onUpdate: once(() => {
            expectPlotlyAPICall(Plotly.newPlot, {
              layout: { title: "test test" },
            });
            done();
          }),
        })
          .then(plot => {
            plot.setProps({ layout: { title: "test test" } });
          })
          .catch(err => done.fail(err));
      });

      test("clear event handlers on newPlot", done => {
        let wrapper;
        createPlot({
          fit: false,
          onClick: jest.fn(),
          onUpdate: once(() => {
            expect(
              wrapper.instance().clearLocalEventHandlers
            ).toHaveBeenCalled();
            done();
          }),
        })
          .then(plot => {
            wrapper = plot;

            // make sure real clearLocalEventHandlers does the job
            expect(Object.keys(wrapper.instance().handlers)).toEqual(["Click"]);
            plot.instance().clearLocalEventHandlers();
            expect(Object.keys(wrapper.instance().handlers)).toEqual([]);

            plot.instance().clearLocalEventHandlers = jest.fn();
            plot.setProps({ layout: { title: "test test" } });
          })
          .catch(err => done.fail(err));
      });

      test("revision counter", done => {
        var callCnt = 0;
        createPlot({
          fit: false,
          revision: 0,
          onUpdate: () => {
            callCnt++;

            // Should only get one update. Make it asynchronous in order
            // to make sure we haven't accidentally ended the test before
            // we've checked the third and fourth calls:
            if (callCnt === 2) {
              setTimeout(() => {
                expect(Plotly.newPlot).not.toHaveBeenCalledTimes(2);
                done();
              }, 100);
            }
          },
        })
          .then(plot => {
            // Update with and without revision bumps:
            setTimeout(
              () => plot.setProps({ layout: { title: "test test" } }),
              10
            );
            setTimeout(
              () =>
                plot.setProps({ revision: 1, layout: { title: "test test" } }),
              20
            );
            setTimeout(
              () =>
                plot.setProps({ revision: 1, layout: { title: "test test" } }),
              30
            );
            setTimeout(
              () =>
                plot.setProps({ revision: 2, layout: { title: "test test" } }),
              40
            );
          })
          .catch(err => done.fail(err));
      });
    });

    describe("responding to window events", () => {
      describe("with fit: true", () => {
        test("does not call relayout on initialization", done => {
          createPlot({
            fit: true,
            onRelayout: () => done.fail("Unexpected relayout event"),
          })
            .then(() => {
              setTimeout(done, 20);
            })
            .catch(err => done.fail(err));
        });

        test("calls relayout on window resize when fit: true", done => {
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
              window.dispatchEvent(new Event("resize"));
            })
            .catch(err => done.fail(err));
        });
      });

      describe("with fit: false", () => {
        test("does not call relayout on init", done => {
          createPlot({
            fit: false,
            onRelayout: () => done.fail("Unexpected relayout event"),
          })
            .then(() => {
              setTimeout(done, 20);
            })
            .catch(err => done.fail(err));
        });

        test("does not call relayout on window resize", done => {
          createPlot({
            fit: false,
            onRelayout: () => done.fail("Unexpected relayout event"),
          })
            .then(() => {
              window.dispatchEvent(new Event("resize"));
              setTimeout(done, 20);
            })
            .catch(err => done.fail(err));
        });
      });
    });
  });
});
