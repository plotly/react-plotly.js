import React, { Component } from 'react'

export default function (Plotly) {
    return class PlotlyComponent extends Component {
        getRef = el => this.el = el

        static defaultProps = {
            fit: true
        }

        constructor (props) {
            super(props);
            this.p = Promise.resolve();
            this.attached = false;
        }

        componentWillMount () {
            if (this.props.fit && typeof window !== "undefined") {
                this.attached = true;
                window.addEventListener('resize', this.handleResize)
            }
        }

        componentWillUnmount () {
            if (this.attached) {
                window.removeEventListener('resize', this.handleResize);
                this.attached = false;
            }

            Plotly.purge(this.el);
        }

        applySize (layout) {
            if (!this.props.fit) return layout;
            const size = this.getSize();
            layout.width = size.width;
            layout.height = size.height;
            return layout;
        }

        getSize = () => {
            const rect = this.el.parentElement.getBoundingClientRect();

            return {
                width: rect.width,
                height: rect.height
            }
        }

        handleResize = () => {
            this.p = this.p.then(() => {
                return Plotly.relayout(this.el, this.getSize());
            });
        }

        componentDidMount () {
            this.p = this.p.then(() => {
                return Plotly.plot(this.el, {
                    data: this.props.data,
                    layout: this.applySize(this.props.layout),
                    config: this.props.config,
                    frames: this.props.frames
                });
            });
        }

        componentWillReceiveProps (nextProps) {
            this.p = this.p.then(() => {
                return Plotly.newPlot(this.el, {
                    data: nextProps.data,
                    layout: this.applySize(this.props.layout),
                    config: this.props.config,
                    frames: this.props.frames
                });
            });
        }

        render () {
            return <div ref={this.getRef}/>
        }
    }
}
