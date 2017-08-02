import React from 'react'
import ReactDOM from 'react-dom'
import Plot from './components/plot'
import Code from './components/code'
var fs = require('fs');
import path from 'path'
import styles from './index.css'
import Dat, { DatNumber, DatBoolean } from 'react-dat-gui'


const initialData = fs.readFileSync(__dirname + '/example.json', 'utf8');

class App extends React.Component {
    state = {
        value: initialData,
        data: JSON.parse(initialData),
        valid: true,
        config: {
            fit: true
        },
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

    handleConfig = (data) => {
        this.setState(Object.assign(this.state.config, {
            width: !!data.width ? data.width : undefined,
            height: !!data.height ? data.height : undefined,
            fit: data.fit,
        }));
    }

    render () {
        return (
            <div>
                <Plot
                    data={this.state.data}
                    valid={this.state.valid}
                    width={this.state.config.width}
                    height={this.state.config.height}
                    fit={this.state.config.fit}
                />
                <div className={styles.container}>
                    <Code
                        value={this.state.value}
                        valid={this.state.valid}
                        onChange={this.handleChangeData}
                    />
                    <Dat
                        data={this.state.config}
                        onUpdate={this.handleConfig}
                        style={{zIndex: 100, marginTop: '1px'}}
                    >
                        <DatBoolean path="fit" label="Fit"/>
                        <DatNumber path="width" min={0} max={1024} step={1} label="Width" />
                        <DatNumber path="height" min={0} max={1024} step={1} label="Height" />
                    </Dat>
                </div>
            </div>
        );
    }
}

const root = document.createElement('div');
document.body.appendChild(root);
ReactDOM.render(<App/>, root);
