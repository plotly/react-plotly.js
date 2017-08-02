import result from "lodash.result";
import isString from "lodash.isstring";
import React, { PropTypes } from "react";

class DatSelect extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      })
    ).isRequired,
    data: PropTypes.object,
    path: PropTypes.string,
    label: PropTypes.string,
    labelWidth: PropTypes.number,
    liveUpdate: PropTypes.bool,
    onUpdate: PropTypes.func,
    _onUpdateValue: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillMount() {
    this.setState({
      value: this.getValue(),
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: this.getValue(nextProps),
    });
  }

  getValue(props = this.props) {
    return result(props.data, props.path);
  }

  handleChange(event) {
    const value = event.target.value;
    this.setState({ value }, () => {
      this.props.liveUpdate && this.update();
    });
  }

  update() {
    const { value } = this.state;
    this.props._onUpdateValue &&
      this.props._onUpdateValue(this.props.path, value);
    this.props.onUpdate && this.props.onUpdate(value);
  }

  render() {
    const { path, label, labelWidth, items } = this.props;
    const labelText = isString(label) ? label : path;
    return (
      <li className="cr select">
        <label>
          <span className="label-text" style={{ width: `${labelWidth}%` }}>
            {labelText}
          </span>

          <select
            value={this.state.value}
            style={{ width: `${100 - labelWidth}%` }}
            onChange={this.handleChange}
          >
            {items &&
              items.map(i =>
                <option key={i.label} value={i.value}>
                  {i.label}
                </option>
              )}
          </select>
        </label>
      </li>
    );
  }
}

export default DatSelect;
