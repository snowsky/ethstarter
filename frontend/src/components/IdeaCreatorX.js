import React, { Component } from 'react';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import { FlatButton, RaisedButton } from 'material-ui';
import ContractInfoSection from './ContractInfoSection';
import Milestones from './Milestones';
import Store from '../Store';
import axios from 'axios';
import images from '../data/images';
import WEB3 from '../crypto/metamask';

class IdeaCreatorX extends Component {

  constructor(props) {
    super(props);
    this.state = {
      finished: false,
      stepIndex: 0,
    };
  }

  createContractX() {

    Store.dispatch({
      type: 'CONTRACT_CREATE_PENDING'
    });

    const address = WEB3.eth.coinbase;
    axios
      .post('/proposals/create', {
        image_url: images.pop(),
        address: address,
        title: this.state.title,
        description: this.state.desc,
        price: this.state.price,
        royalty: this.state.royalty,
        mileStones: this.state.milestones,
      })
      .then(response => {
        if (response.data && typeof response.data === 'string') {
          Store.dispatch({
            type: 'CONTRACT_CREATE_SUCCEEDED',
            payload: {
              address: response.data,
            }
          })
        } else {
          Store.dispatch({
            type: 'CONTRACT_CREATE_FAILED',
            payload: {
              error: 'Error Creating Contract',
            }
          })
        }
      })
      .catch(err => {
        Store.dispatch({
          type: 'CONTRACT_CREATE_FAILED',
          payload: {
            error: 'Error Creating Contract',
          }
        });
      });
  }

  handleNext = () => {
    console.log('milestons: ', this.state.milestones);
    const {stepIndex} = this.state;
    const finished = stepIndex >= 2;
    this.setState({
      stepIndex: stepIndex + 1,
      finished: finished,
    });
    if (finished) {
      this.state.milestones.pop();
      this.state.milestones.map(m => {
        delete m.index;
        return m;
      });
      this.createContractX()
    }
  };

  handlePrev = () => {
    const {stepIndex} = this.state;
    if (stepIndex > 0) {
      this.setState({stepIndex: stepIndex - 1});
    }
  };

  setInfo = (info) => {
    this.state.title = info.title;
    this.state.desc = info.description;
    this.state.price = info.price;
    this.state.royalty = info.royalty;
  };

  setMilestones = (milestones) => {
    this.state.milestones = milestones;
  };

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return <ContractInfoSection infoCB={this.setInfo.bind(this)} />;
      case 1:
        return <Milestones milestoneCB={this.setMilestones.bind(this)} />;
      case 2:
        return '';
      default:
        return '';
    }
  }

  render() {
    const {finished, stepIndex} = this.state;
    const contentStyle = {margin: '0 16px'};
    const btnStyle = { display: 'flex', flexDirection: 'columns', marginTop: '12px'};
    if (stepIndex >= 2) {
      btnStyle.marginTop = '32px';
      btnStyle.justifyContent = 'center';
    }

    return (
      <div style={{width: '100%', maxWidth: 700, margin: 'auto'}}>
        <Stepper activeStep={stepIndex}>
          <Step>
            <StepLabel>Tell the World about it</StepLabel>
          </Step>
          <Step>
            <StepLabel>Set your Milestones</StepLabel>
          </Step>
          <Step>
            <StepLabel>Create your Contract</StepLabel>
          </Step>
        </Stepper>
        <div style={contentStyle}>
          {finished ?
            (<h2>Loading...</h2>)
            :
            (
              <div>
                <div>{this.getStepContent(stepIndex)}</div>
                <div style={btnStyle}>
                  <FlatButton
                    label="Back"
                    disabled={stepIndex === 0}
                    onClick={this.handlePrev}
                    style={{marginRight: '12px'}}
                  />
                  <RaisedButton
                    label={stepIndex === 2 ? 'Create Contract' : 'Next'}
                    primary={true}
                    onClick={this.handleNext}
                  />
                </div>
              </div>
            )}
        </div>
      </div>
    );
  }
}

export default IdeaCreatorX;