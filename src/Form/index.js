import React from 'react'
import PropTypes from 'prop-types'
import autobind from 'autobind-decorator'
import omit from 'lodash/omit'
import keys from 'lodash/keys'
import isFunction from 'lodash/isFunction'
import getNewValue from './getNewValue'
import isReactNative from '../utility/isReactNative'

export default class Form extends React.Component {
  static propTypes = {
    /**
     * The fields of the form
     */
    children: PropTypes.node,
    /**
     * The object that has the values of the form.
     */
    state: PropTypes.object,
    /**
     * A callback that fires when the form value changes.
     * The argument will be the state with the updated field value.
     */
    onChange: PropTypes.func,
    /**
     * Pass error messages in a object
     */
    errorMessages: PropTypes.object,
    /**
     * Use form tag as a container
     */
    useFormTag: PropTypes.bool,
    /**
     * A function that is called when the form is submitted.
     */
    onSubmit: PropTypes.func
  }

  static defaultProps = {
    onChange: () => {},
    errorMessages: null,
    useFormTag: true
  }

  static childContextTypes = {
    doc: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    errorMessages: PropTypes.object,
    form: PropTypes.any
  }

  state = {}

  constructor(props) {
    super(props)
    if (props.doc) {
      throw new Error('Doc prop is deprecated, please use state instead')
    }
  }

  getChildContext() {
    return {
      doc: this.getValue(),
      onChange: this.onChange,
      errorMessages: this.props.errorMessages,
      form: this
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.state !== this.props.state) {
      this.setState({value: null}) // will reset state because doc prop has changed
    }
  }

  @autobind
  getValue() {
    return this.state.value || this.props.state || {}
  }

  @autobind
  onChange(fieldName, fieldValue) {
    const value = getNewValue(this.getValue(), fieldName, fieldValue)
    this.setState({value})
    this.props.onChange(value)
  }

  @autobind
  onFormSubmit(event) {
    event.preventDefault()
    return this.submit()
  }

  @autobind
  submit() {
    if (!isFunction(this.props.onSubmit)) {
      throw new Error('You should pass a onSubmit prop')
    }
    return this.props.onSubmit(this.getValue())
  }

  render() {
    const domProps = omit(this.props, keys(Form.propTypes))
    if (isReactNative()) {
      return this.props.children
    }
    if (this.props.useFormTag) {
      return (
        <form {...domProps} onSubmit={this.onFormSubmit}>
          {this.props.children}
        </form>
      )
    } else {
      return (
        <div {...domProps}>
          {this.props.children}
        </div>
      )
    }
  }
}
