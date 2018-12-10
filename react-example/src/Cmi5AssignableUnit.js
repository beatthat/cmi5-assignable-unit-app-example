import React, { Component } from 'react';

const CMI_STATUS = {
  NONE: 0,
  LOADING: 1,
  READY: 2,
  RESULT_SENT: 3,
  ERROR: -1
}

/**
 * A reusable wrapper Component that handles cmi initialization
 * for a question (cmi5 assignable unit), which should be a child component.
 *
 * Cmi5AssignableUnit will inject the following props to it's child:
 *
 * passed:
 * A function for the assignable unit to call when the question was answered correctly.
 * For arguments, accepts either a single normalized score (0-1) value
 * or an object that's a valid XAPI result 'score'
 * @see https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Data.md#Score
 *
 * failed:
 * A function for the assignable unit to call when the question was answered incorrectly.
 * For arguments, accepts either a single normalized score (0-1) value
 * or an object that's a valid XAPI result 'score'
 * @see https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Data.md#Score
 *
 * cmi:
 * the Cmi5 instance, which can be used directly
 * @see ../public/cm5.js
 *
 * The actions for 'passed' and 'failed' are injected to child components
 * to provide a simple/safe way to submit results: this wrapped will handle
 * the actual initialization of cmi5,
 * and if either of the inject 'passed' or 'failed' functions is called
 * before cmi5 is ready, it will store the result and submit when ready.
 */
export default class Cmi5AssignableUnit extends Component {

  constructor(props) {
    super(props);
    this.state = {
      cmiStatus: CMI_STATUS.NONE
    }
    this.trySubmitScore = this.trySubmitScore.bind(this);
    this.passed = this.passed.bind(this);
    this.failed = this.failed.bind(this);
  }

  passed(score) {
    this.trySubmitScore(score, true)
  }

  failed(score) {
    this.trySubmitScore(score, false)
  }

  trySubmitScore(result, isPassing) {
    const score = isNaN(Number(result))? result: { scaled: Number(result) }
    switch(this.state.cmiStatus) {
      case CMI_STATUS.READY:
        if(isPassing) {
          this.state.cmi.passed(score)
        }
        else {
          this.state.cmi.failed(score)
        }
        this.setState({
          ...this.state,
          cmiStatus: CMI_STATUS.RESULT_SENT
        })
        break
      case CMI_STATUS.RESULT_SENT:
        console.log('result already sent')
        break
      default:
        // save the score to submit when cmi is ready
        this.setState({
          ...this.state,
          scorePendingSubmit: { score, isPassing }
        })
        break
    }
  }

  componentDidMount()
  {
    try {
      const Cmi5 = window.Cmi5
      const cmi = new Cmi5(window.location.href)

      cmi.start((err, result) => {
        if(err) {
          this.setState({
            ...this.state,
            cmiStatus: CMI_STATUS.ERROR,
            cmiMessage: err.message
          })
          console.error(err)
          return
        }

        console.log('ok!')
        this.setState({
          ...this.state,
          cmiStatus: CMI_STATUS.READY,
        })
      })

      this.setState({
        ...this.state,
        cmi: cmi
      })
    }
    catch(errInit) {
      console.error(`error loading cmi: ${errInit.message}`)
      this.setState({
        ...this.state,
        cmiStatus: CMI_STATUS.NONE,
        cmiMessage: errInit.message
      })
    }

  }

  render()
  {
    switch(this.state.cmiStatus) {
      case CMI_STATUS.READY:
        if(this.state.scorePendingSubmit) {
          this.trySubmitScore(
            this.state.scorePendingSubmit.score,
            this.state.scorePendingSubmit.isPassing
          )
        }
        break
      case CMI_STATUS.ERROR:
        console.error(`cmi error: ${this.state.cmiMessage}`)
        break
      default:
        console.log(`cmi status updated to ${this.state.cmiStatus}`)
    }

    const { children } = this.props;
    const assignableUnit = React.Children.map(children, child =>
      React.cloneElement(child, {
        cmi: this.state.cmi,
        passed: this.passed, // action for child to call on passed
        failed: this.failed // action for child to call on failed
       }
     )
    )

    return(
    <div>
        <div>{assignableUnit}</div>
    </div>
    )
   }
 }
