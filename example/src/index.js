import React from "react";
import ReactDOM from "react-dom";
import Plot from "./components/plot";
import Code from "./components/code";
var fs = require("fs");
import path from "path";
import styles from "./index.css";
import Dat, { DatNumber, DatBoolean } from "react-dat-gui";
import DatSelect from "./components/DatSelect.jsx";
import beautify from "json-beautify";

const initialData = fs.readFileSync(__dirname + "/example.json", "utf8");

class App extends React.Component {
  state = {
    value: initialData,
    data: "",
    valid: true,
    config: {
      width: 0,
      height: 0,
      fit: true,
    },
    mocks: [],
  };

  componentDidMount() {
    this.handleCode(initialData);

    fetch(
      "https://api.github.com/repositories/45646037/contents/test/image/mocks"
    ).then(data => {
      data.json().then(mocks => {
        this.setState({
          mocks: [{ label: "- Select -", value: "" }].concat(
            mocks.map(m => ({
              label: m.name,
              value: m.download_url,
            }))
          ),
        });
      });
    });
  }

  handleCode = str => {
    try {
      var parsed = JSON.parse(str);
      var beautified = beautify(parsed, null, 2, 30);

      this.setState({
        valid: true,
        value: beautified,
        data: parsed,
      });
    } catch (e) {
      this.setState({ valid: false });
    }
  };

  handleConfig = data => {
    const update = {
      width: !!data.width ? data.width : undefined,
      height: !!data.height ? data.height : undefined,
      fit: data.fit,
    };

    this.setState(Object.assign(this.state.config, update));

    var input = Object.assign({}, this.state.data);
    input.layout = input.layout || {};
    input.layout.width = update.width;
    input.layout.height = update.height;

    if (this.state.config.fit && !update.fit) {
      delete input.layout.width;
      delete input.layout.height;
    }

    this.handleCode(JSON.stringify(input));
  };

  selectMock = url => {
    fetch(url).then(data => {
      data.text().then(str => {
        this.handleCode(str);
      });
    });
  };

  render() {
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
            onChange={this.handleCode}
          />
          <Dat
            data={this.state.config}
            onUpdate={this.handleConfig}
            style={{ zIndex: 100, marginTop: "1px" }}
          >
            <DatBoolean path="fit" label="Fit" />
            <DatNumber path="width" min={0} max={1024} step={1} label="Width" />
            <DatNumber
              path="height"
              min={0}
              max={1024}
              step={1}
              label="Height"
            />
            <DatSelect
              path="mock"
              label="mock"
              items={this.state.mocks}
              onUpdate={this.selectMock}
            />
          </Dat>
        </div>
      </div>
    );
  }
}

const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(<App />, root);
