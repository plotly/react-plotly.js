import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
require('../../../node_modules/codemirror/mode/javascript/javascript')

import styles from './code.css'

require('insert-css')(`
.ReactCodeMirror,
.CodeMirror {
    height: 100%;
}
`)

export default class Code extends Component {
    render () {
        const classes = [styles.codeContainer]
        if (!this.props.valid) classes.push(styles['codeContainer--invalid'])

        return <div className={classes.join(' ')}>
            <CodeMirror
                value={this.props.value}
                onChange={this.props.onChange}
                options={{
                    mode: {
                        name: 'javascript',
                        json: true
                    }
                }}
            />
        </div>
    }
}
