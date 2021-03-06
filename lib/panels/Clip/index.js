import equals from 'mout/src/array/equals';
import objEquals from 'mout/src/object/equals';
import clone from 'mout/src/lang/clone';
import DoubleSliderElement from 'paraviewweb/src/React/Widgets/DoubleSliderWidget';
import React from 'react';
import ToggleButton from 'paraviewweb/src/React/Widgets/ToggleIconButtonWidget';

import style from 'LightVizStyle/ClipPanel.mcss';

import AbstractPanel from '../AbstractPanel';

import {
  getState,
  updateClipInsideOut,
  updateClipPosition,
  updateClipBoxPosition,
  enableClipBox,
}
from '../../client';

export default React.createClass({

  displayName: 'ClipPanel',

  propTypes: {
    dataset: React.PropTypes.object,
    hideAdditionalControls: React.PropTypes.bool,
  },

  getDefaultProps() {
    return {
      dataset: {
        data: {
          bounds: [0, 1, 0, 1, 0, 1],
        },
      },
    };
  },

  getInitialState() {
    this.oldState = {
      xPosition: (this.props.dataset.data.bounds[0] + this.props.dataset.data.bounds[1]) * 0.5,
      yPosition: (this.props.dataset.data.bounds[2] + this.props.dataset.data.bounds[3]) * 0.5,
      zPosition: (this.props.dataset.data.bounds[4] + this.props.dataset.data.bounds[5]) * 0.5,
      xInsideOut: false,
      yInsideOut: false,
      zInsideOut: false,
    };
    return clone(this.oldState);
  },

  componentDidMount() {
    getState('clip', this, this.modulePanel);
  },

  componentWillReceiveProps(nextProps) {
    const previous = this.props.dataset.data.bounds;
    const next = nextProps.dataset.data.bounds;

    if (!equals(previous, next)) {
      this.setState({
        xPosition: (next[0] + next[1]) * 0.5,
        yPosition: (next[2] + next[3]) * 0.5,
        zPosition: (next[4] + next[5]) * 0.5,
      });
    }
    if (this.props.dataset.autoApply !== nextProps.dataset.autoApply) {
      this.onApply();
    }
  },

  onApply() {
    const {
      xPosition, yPosition, zPosition,
    } = this.state;
    const pos = {
      xPosition, yPosition, zPosition,
    };
    updateClipPosition(pos);
    enableClipBox(false);
    updateClipInsideOut(this.state.xInsideOut, this.state.yInsideOut, this.state.zInsideOut);
    this.oldState = clone(this.state);
    // This is to force a re-render so that the apply button will be disabled again
    this.setState({ applyUpdate: true });
    this.oldState.applyUpdate = true;
  },

  onReset() {
    this.setState(this.oldState);
  },

  updateState(newState) {
    this.oldState = {
      xPosition: newState.xPosition,
      yPosition: newState.yPosition,
      zPosition: newState.zPosition,
      xInsideOut: newState.xInsideOut,
      yInsideOut: newState.yInsideOut,
      zInsideOut: newState.zInsideOut,
    };
    this.setState(clone(this.oldState));
  },

  toggleInsideOut(onOff, name) {
    const {
      xInsideOut, yInsideOut, zInsideOut,
    } = this.state;
    const insideOut = {
      xInsideOut, yInsideOut, zInsideOut,
    };

    this.setState({
      [name]: onOff,
      applyUpdate: false,
    });
    this.oldState.applyUpdate = false;
    insideOut[name] = onOff;

    if (this.props.dataset.autoApply) {
      updateClipInsideOut(insideOut.xInsideOut, insideOut.yInsideOut, insideOut.zInsideOut);
    }
  },

  positionChange(name, value) {
    const {
      xPosition, yPosition, zPosition,
    } = this.state;
    const pos = {
      xPosition, yPosition, zPosition,
    };

    this.setState({
      [name]: value,
      applyUpdate: false,
    });
    this.oldState.applyUpdate = false;

    // Update server
    pos[name] = value;
    if (this.props.dataset.autoApply) {
      updateClipPosition(pos);
    } else {
      enableClipBox(true);
      updateClipBoxPosition(pos);
    }
  },

  render() {
    const needsApply = !objEquals(this.oldState, this.state);
    return (
      <AbstractPanel
        ref={c => (this.modulePanel = c)}
        name="clip"
        dataset={this.props.dataset}
        hideAllButVisibility={this.props.hideAdditionalControls}
        hideInputSelection
        onApply={this.onApply}
        onReset={this.onReset}
        needsApply={needsApply}
        moduleName="Clip"
      >
        <div className={style.line}>
          <ToggleButton
            alwaysOn
            value={this.state.xInsideOut}
            icon={(this.state.xInsideOut ? style.insideOutToggleIconLeft
                                         : style.insideOutToggleIconRight)}
            name="xInsideOut"
            onChange={this.toggleInsideOut}
            style={{ width: '30px' }}
          />
          <DoubleSliderElement
            min={this.props.dataset.data.bounds[0]}
            max={this.props.dataset.data.bounds[1]}
            value={this.state.xPosition}
            name="xPosition"
            onChange={this.positionChange}
          />
        </div>
        <div className={style.line}>
          <ToggleButton
            alwaysOn
            value={this.state.yInsideOut}
            icon={(this.state.yInsideOut ? style.insideOutToggleIconLeft
                                         : style.insideOutToggleIconRight)}
            name="yInsideOut"
            onChange={this.toggleInsideOut}
            style={{ width: '30px' }}
          />
          <DoubleSliderElement
            min={this.props.dataset.data.bounds[2]}
            max={this.props.dataset.data.bounds[3]}
            value={this.state.yPosition}
            name="yPosition"
            onChange={this.positionChange}
          />
        </div>
        <div className={style.line}>
          <ToggleButton
            alwaysOn
            value={this.state.zInsideOut}
            icon={(this.state.zInsideOut ? style.insideOutToggleIconLeft
                                         : style.insideOutToggleIconRight)}
            name="zInsideOut"
            onChange={this.toggleInsideOut}
            style={{ width: '30px' }}
          />
          <DoubleSliderElement
            min={this.props.dataset.data.bounds[4]}
            max={this.props.dataset.data.bounds[5]}
            value={this.state.zPosition}
            name="zPosition"
            onChange={this.positionChange}
          />
        </div>
      </AbstractPanel>
    );
  },
});
