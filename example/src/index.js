import React from 'react'
import ReactDOM from 'react-dom'
import Plot from './components/plot'
import Code from './components/code'
var fs = require('fs');
import path from 'path'
import styles from './index.css'

const initialData = fs.readFileSync(__dirname + '/example.json', 'utf8');

class App extends React.Component {
    state = {
        value: initialData,
        data: JSON.parse(initialData),
        valid: true
    }

    handleChangeData = str => {
        try {
            this.setState({
                valid: true,
                value: str,
                data: JSON.parse(str)
            });
        } catch (e) {
            this.setState({valid: false});
        }
    }

    render () {
        return (
            <div>
                <Plot
                    data={this.state.data}
                    valid={this.state.valid}
                />
                <Code
                    value={this.state.value}
                    valid={this.state.valid}
                    onChange={this.handleChangeData}
                />
            </div>
        );
    }
}

const root = document.createElement('div');
document.body.appendChild(root);
ReactDOM.render(<App/>, root);
