import React from 'react'
import styles from './plot.css'

import createPlotly from '../../../src'
const PlotlyComponent = createPlotly(Plotly)


export default class Plot extends React.Component {
    shouldComponentUpdate (nextProps) {
        return nextProps.valid
    }

    render () {
        return (
            <div className={styles.container}>
                <PlotlyComponent
                    data={this.props.data.data}
                    layout={this.props.data.layout}
                    config={this.props.data.config}
                    frames={this.props.data.frames}
                    fit
                />
            </div>
        );
    }
}
