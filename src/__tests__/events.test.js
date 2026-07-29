import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {events, eventNames, getPlotlyEventName, getPropName, updateEvents} from '../events';

// `events` drives the runtime wiring. The two hand-maintained copies — the
// `on*` props in `factory.d.ts` and the README table — can't be derived from
// it, so they're checked here instead. The declarations are shipped to
// consumers but unused by this library, which is why a text comparison is
// enough; nothing here needs the type system.
describe('events', () => {
  test('has no duplicate event names', () => {
    expect(new Set(eventNames).size).toBe(eventNames.length);
  });

  test('every update event is one of the forwarded events', () => {
    const forwarded = eventNames.map(getPlotlyEventName);
    expect(updateEvents.length).toBeGreaterThan(0);
    expect(forwarded).toEqual(expect.arrayContaining(updateEvents));
  });

  test('PlotParams declares a prop for every event', () => {
    const dts = readFileSync(join(__dirname, '..', 'factory.d.ts'), 'utf8');

    // Lines look like: onAfterPlot?: EventCallback;
    const propPattern = /^\s*(on\w+)\?: EventCallback;$/gm;
    const declared = [...dts.matchAll(propPattern)].map(([, prop]) => prop);

    expect(declared).toEqual(events.map((event) => getPropName(event.name)));
  });

  test('README table matches the event list', () => {
    const readme = readFileSync(join(__dirname, '..', '..', 'README.md'), 'utf8');

    // Rows look like: | `onAfterPlot` | `Function` | `plotly_afterplot` |
    const rowPattern = /^\|\s*`(on\w+)`\s*\|\s*`Function`\s*\|\s*`(plotly_\w+)`\s*\|$/gm;
    const documented = [...readme.matchAll(rowPattern)].map(([, prop, event]) => [prop, event]);

    const expected = events.map((event) => [
      getPropName(event.name),
      getPlotlyEventName(event.name),
    ]);

    expect(documented).toEqual(expected);
  });
});
