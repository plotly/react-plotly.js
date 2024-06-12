import { useLayoutEffect, useState, useMemo } from 'react';
import { head, prop, compose, pick, objOf, mergeDeepRight } from 'ramda';
import { stream, scan } from 'flyd';

/**
* A simple debouncing function
*/
const debounce = (fn, delay) => {
   let timeout;

   return function (...args) {
      const functionCall = () => fn.apply(this, args);

      timeout && clearTimeout(timeout);
      timeout = setTimeout(functionCall, delay);
   };
};

const getSizeForLayout = compose(objOf('layout'), pick(['width', 'height']), prop('contentRect'), head);

export default function usePlotly() {
   const updates = useMemo(stream, []);
   const appendData = useMemo(stream, []);
   const plotlyState = useMemo(
      () => scan(mergeDeepRight, { data: [], config: {}, layout: {} }, updates),
      []
   );

   const observer = new ResizeObserver(debounce(compose(updates, getSizeForLayout), 100));
   const [internalRef, setRef] = useState(null);
   useLayoutEffect(() => {
      if (internalRef) {
         observer.observe(internalRef);
         const endS = plotlyState.map(state => {
            Plotly.react(internalRef, state);
         });

         const endAppend = appendData.map(({ data, tracePos }) => Plotly.extendTraces(internalRef, data, tracePos));

         return () => {
            Plotly.purge(internalRef);
            observer.unobserve(internalRef);
            endAppend.end(true);
            endS.end(true);
         };
      }
   }, [internalRef, plotlyState, updates, appendData]);

   return { ref: setRef, updates, appendData };
}
