import React from 'react';
import styles from './plot.css';

import PlotComponent from '../../../src/react-plotly.js';

export default class Plot extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.valid;
  }

  render() {
    return (
      <div className={styles.container}>
        <PlotComponent
          data={this.props.data.data}
          layout={this.props.data.layout}
          config={this.props.data.config}
          frames={this.props.data.frames}
          fit={this.props.fit}
          onClick={e => console.log('plotly_click:', e)}
          onHover={e => console.log('plotly_hover:', e)}
          onUnhover={e => console.log('plotly_unhover:', e)}
          debug
        />
      </div>
    );
  }
}
