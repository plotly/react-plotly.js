import {render, waitFor} from '@testing-library/react';
import once from 'onetime';
import * as React from 'react';
import {beforeEach, describe, expect, test, vi} from 'vitest';

import createPlotlyComponent from '../factory';
import Plot from '../react-plotly';

test('Plot', async () => {
  const {container} = render(
    <Plot
      data={[
        {
          x: [1, 2, 3],
          y: [2, 6, 3],
          type: 'scatter',
          mode: 'lines+markers',
          marker: {color: 'red'},
        },
        {type: 'bar', x: [1, 2, 3], y: [2, 5, 3]},
      ]}
      layout={{width: 320, height: 240, title: 'A Fancy Plot'}}
      config={{responsive: true}}
      style={{height: '100%', width: '100%'}}
      useResizeHandler
      debug
      onAfterExport={() => {}}
      onAfterPlot={() => {}}
      onAnimated={() => {}}
      onAnimatingFrame={() => {}}
      onAnimationInterrupted={() => {}}
      onAutoSize={() => {}}
      onBeforeExport={() => {}}
      onBeforeHover={() => {}}
      onButtonClicked={() => {}}
      onClick={() => {}}
      onClickAnnotation={() => {}}
      onDeselect={() => {}}
      onDoubleClick={() => {}}
      onFramework={() => {}}
      onHover={() => {}}
      onLegendClick={() => {}}
      onLegendDoubleClick={() => {}}
      onRelayout={() => {}}
      onRelayouting={() => {}}
      onRestyle={() => {}}
      onRedraw={() => {}}
      onSelected={() => {}}
      onSelecting={() => {}}
      onSliderChange={() => {}}
      onSliderEnd={() => {}}
      onSliderStart={() => {}}
      onSunburstClick={() => {}}
      onTransitioning={() => {}}
      onTransitionInterrupted={() => {}}
      onUnhover={() => {}}
      onWebGlContextLost={() => {}}
    />
  );

  await waitFor(() =>
    expect(container.querySelector('[class="js-plotly-plot"]')).toBeInTheDocument()
  );
});

describe('<Plotly/>', () => {
  let Plotly, PlotComponent;

  function createPlot(props) {
    return new Promise((resolve, reject) => {
      const plot = render(
        <PlotComponent {...props} onInitialized={() => resolve(plot)} onError={reject} />
      );
    });
  }

  function expectPlotlyAPICall(method, props, defaultArgs) {
    expect(method).toHaveBeenCalledWith(
      expect.anything(),
      Object.assign(defaultArgs || {data: []}, props || {})
    );
  }

  describe('with mocked plotly.js', () => {
    beforeEach(() => {
      Plotly = vi.mock('../__mocks__/plotly.js');
      PlotComponent = createPlotlyComponent(Plotly);

      // Override the parent element size:
      PlotComponent.prototype.getParentSize = () => ({
        width: 123,
        height: 456,
      });
    });

    describe('initialization', function () {
      test('calls Plotly.react on instantiation', async () => {
        try {
          await createPlot({});

          expect(Plotly.react).toHaveBeenCalled();
        } catch (err) {
          return err;
        }
      });

      test('passes data', async () => {
        try {
          await createPlot({
            data: [{x: [1, 2, 3]}],
            layout: {title: 'foo'},
          });

          expectPlotlyAPICall(Plotly.react, {
            data: [{x: [1, 2, 3]}],
            layout: {title: 'foo'},
          });
        } catch (err) {
          return err;
        }
      });

      test('accepts width and height', async () => {
        try {
          await createPlot({
            layout: {width: 320, height: 240},
          });

          expectPlotlyAPICall(Plotly.react, {
            layout: {width: 320, height: 240},
          });
        } catch (err) {
          return err;
        }
      });
    });

    describe('plot updates', () => {
      test('updates data', async () => {
        try {
          const plot = await createPlot({
            layout: {width: 123, height: 456},
            onUpdate: once(() => {
              expectPlotlyAPICall(Plotly.react, {
                data: [{x: [1, 2, 3]}],
                layout: {width: 123, height: 456},
              });
            }),
          });

          plot.setProps({data: [{x: [1, 2, 3]}]});
        } catch (err) {
          return err;
        }
      });

      test('updates data when revision is defined but not changed', async () => {
        try {
          const plot = await createPlot({
            revision: 1,
            layout: {width: 123, height: 456},
            onUpdate: once(() => {
              expectPlotlyAPICall(Plotly.react, {
                data: [{x: [1, 2, 3]}],
                layout: {width: 123, height: 456},
              });
            }),
          });

          plot.setProps({revision: 1, data: [{x: [1, 2, 3]}]});
        } catch (err) {
          return err;
        }
      });

      test('sets the title', async () => {
        try {
          const plot = await createPlot({
            onUpdate: once(() => {
              expectPlotlyAPICall(Plotly.react, {
                layout: {title: 'test test'},
              });
            }),
          });
          plot.setProps({layout: {title: 'test test'}});
        } catch (err) {
          return err;
        }
      });

      test('revision counter', async () => {
        var callCnt = 0;
        try {
          const plot = await createPlot({
            revision: 0,
            onUpdate: () => {
              callCnt++;

              // Should only get one update. Make it asynchronous in order
              // to make sure we haven't accidentally ended the test before
              // we've checked the third and fourth calls:
              if (callCnt === 2) {
                setTimeout(() => {
                  expect(Plotly.react).not.toHaveBeenCalledTimes(2);
                }, 100);
              }
            },
          });
          // Update with and without revision bumps:
          setTimeout(() => plot.setProps({layout: {title: 'test test'}}), 10);
          setTimeout(() => plot.setProps({revision: 1, layout: {title: 'test test'}}), 20);
          setTimeout(() => plot.setProps({revision: 1, layout: {title: 'test test'}}), 30);
          setTimeout(() => plot.setProps({revision: 2, layout: {title: 'test test'}}), 40);
        } catch (err) {
          return err;
        }
      });
    });

    describe('manging event handlers', () => {
      test('should add an event handler when one does not already exist', async () => {
        const onRelayout = () => {};

        try {
          const plot = await createPlot({onRelayout});
          const {handlers} = plot.instance();

          expect(plot.prop('onRelayout')).toBe(onRelayout);
          expect(handlers.Relayout).toBe(onRelayout);
        } catch (err) {
          return err;
        }
      });
    });
  });
});
