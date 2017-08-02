import React, { Component } from 'react'
import PropTypes from 'prop-types'
import isNumeric from 'fast-isnumeric'
import objectAssign from 'object-assign'

// The naming convention is:
//   - events are attached as `'plotly_' + eventName.toLowerCase()`
//   - react props are `'on' + eventName`
const eventNames = [
    'AfterExport',
    'AfterPlot',
    'Animated',
    'AnimatingFrame',
    'AnimationInterrupted',
    'AutoSize',
    'BeforeExport',
    'ButtonClicked',
    'Click',
    'ClickAnnotation',
    'Deselect',
    'DoubleClick',
    'Framework',
    'Hover',
    'Relayout',
    'Restyle',
    'Redraw',
    'Selected',
    'Selecting',
    'SliderChange',
    'SliderEnd',
    'SliderStart',
    'Transitioning',
    'TransitionInterrupted',
    'Unhover',
]

// Check if a window is available since SSR (server-side rendering)
// breaks unnecessarily if you try to use it server-side.
const isBrowser = typeof window !== "undefined"

export default function (Plotly) {
    const hasReactAPIMethod = !!Plotly.react

    class PlotlyComponent extends Component {
        constructor(props) {
            super(props)

            this.p = Promise.resolve();
            this.resizeHandler = null;
            this.handlers = {};

            this.attachWindowResize = this.attachWindowResize.bind(this);
            this.detachWindowResize = this.detachWindowResize.bind(this);
            this.syncEventHandlers = this.syncEventHandlers.bind(this);
            this.getRef = this.getRef.bind(this);
        }

        componentDidMount () {
            this.p = this.p.then(() => {
                return Plotly.plot(this.el, {
                    data: this.props.data,
                    layout: this.applySize(this.props.layout),
                    config: this.props.config,
                    frames: this.props.frames
                });
            })
                .then(this.attachWindowResize)
                .then(this.syncEventHandlers);
        }

        componentWillReceiveProps (nextProps) {
            this.p = this.p.then(() => {
                return (hasReactAPIMethod ? Plotly.react : Plotly.newPlot)(this.el, {
                    data: nextProps.data,
                    layout: this.applySize(this.props.layout),
                    config: this.props.config,
                    frames: this.props.frames
                }).then(this.syncEventHandlers);
            });
        }

        componentWillUnmount () {
            if (this.resizeHandler && isBrowser) {
                window.removeEventListener('resize', this.handleResize);
                this.resizeHandler = null;
            }

            Plotly.purge(this.el);
        }

        attachWindowResize () {
            if (this.props.fit && isBrowser && !this.resizeHandler) {
                this.resizeHandler = () => {
                    this.p = this.p.then(() => {
                        return Plotly.relayout(this.el, this.getSize());
                    });
                }
                window.addEventListener('resize', this.resizeHandler)
            }
        }

        detachWindowResize () {
            if (this.resizeHandler && isBrowser) {
                window.removeEventListener('resize', this.resizeHandler);
                this.resizeHandler = null;
            }
        }

        getRef (el) {
            this.el = el
        }

        // Attach and remove event handlers as they're added or removed from props:
        syncEventHandlers () {
            for (let i = 0; i < eventNames.length; i++) {
                const eventName = eventNames[i]
                const prop = this.props['on' + eventName];
                const hasHandler = !!this.handlers[eventName]

                if (prop && !hasHandler) {
                    let handler = this.handlers[eventName] = this.props['on' + eventName]
                    this.el.on('plotly_' + eventName.toLowerCase(), handler)
                } else if (!prop && hasHandler) {
                    // Needs to be removed:
                    this.el.off('plotly_' + eventName.toLowerCase(), this.handlers[eventName]);
                    delete this.handlers[eventName];
                }
            }
        }

        applySize (layout) {
            const size = this.getSize()

            // Shallow-clone the layout so that we don't have to
            // modify the original object:
            layout = objectAssign({}, layout);
            objectAssign(layout, this.getSize());
            return layout;

        }

        getSize () {
            let rect;
            const hasWidth = isNumeric(this.props.width);
            const hasHeight = isNumeric(this.props.height);

            if (!hasWidth || !hasHeight) {
                rect = this.el.parentElement.getBoundingClientRect();
            }

            return {
                width: hasWidth ? parseInt(this.props.width) : rect.width,
                height: hasHeight ? parseInt(this.props.height) : rect.height
            }
        }

        render () {
            return <div ref={this.getRef}/>
        }
    }

    PlotlyComponent.propTypes = {
        fit: PropTypes.bool,
        width: PropTypes.number,
        height: PropTypes.number,
        data: PropTypes.arrayOf(PropTypes.object),
        config: PropTypes.object,
        layout: PropTypes.object,
        frames: PropTypes.arrayOf(PropTypes.object)
    }

    for (let i = 0; i < eventNames.length; i++) {
        PlotlyComponent.propTypes['on' + eventNames[i]] = PropTypes.func;
    }

    PlotlyComponent.defaultProps = {
        fit: false,
        data: [],
        width: null,
        height: null
    }

    return PlotlyComponent
}
