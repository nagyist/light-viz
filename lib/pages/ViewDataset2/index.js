/* global window */
import React from 'react';
import clone from 'mout/src/lang/clone';
import VtkRenderer from 'paraviewweb/src/React/Renderers/VtkRenderer';
import SvgIcon from 'paraviewweb/src/React/Widgets/SvgIconWidget';

import style from 'LightVizStyle/ViewDataset2.mcss';

import Section from '../../panels/Section';
import modules from '../../modules';
import TimePanel from '../../panels/Time';
import ColorMap from '../../widgets/ColorMap';
import lightVizIcon from '../../../svg/LightViz.svg';

import {
  resetCamera,
  loadDataset,
  getConnection,
  getClient,
  saveThumbnail,
  setForegroundColor,
  setBackgroundColor,
}
from '../../client';

const colors = [{
  label: 'White',
  pvcolor: '1 1 1',
  pvbgcolor: '0 0 0',
  cssColor: [255, 255, 255],
  cssBGColor: [0, 0, 0],
}, {
  label: 'Red',
  pvcolor: '.8 .2 .2',
  pvbgcolor: '.3 .3 .3',
  cssColor: [204, 51, 51],
  cssBGColor: [77, 77, 77],
}, {
  label: 'Green',
  pvcolor: '.2 .8 .2',
  pvbgcolor: '.4 .2 .2',
  cssColor: [51, 204, 51],
  cssBGColor: [102, 51, 51],
}];

function updateColors(e) {
  const idx = e.target.dataset.index;
  const scheme = colors[idx];
  setForegroundColor(scheme.pvcolor);
  setBackgroundColor(scheme.pvbgcolor);
}

export default React.createClass({

  displayName: 'ViewDataset2',

  propTypes: {
    location: React.PropTypes.object,
    params: React.PropTypes.object,
    profile: React.PropTypes.object,
  },

  contextTypes: {
    router: React.PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      time: 0,
      dataset: {
        empty: true,
        data: {
          arrays: [{ range: [0, 100], name: 'unkown', location: 'unkown', label: '' }],
          time: [],
          bounds: [0, 1, 0, 1, 0, 1],
        },
      },
      datasetId: null,
      showControls: false,
    };
  },

  componentWillMount() {
    this.setState({
      datasetId: this.props.params.datasetId,
    });
    loadDataset(this.props.params.datasetId, dataset => this.setState({
      dataset,
    }));
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.datasetId !== this.state.datasetId) {
      this.setState({
        datasetId: nextProps.params.datasetId,
      });
      loadDataset(this.props.params.datasetId, dataset => this.setState({
        dataset,
      }));
    }
  },

  querySaveThumbnail() {
    window.confirm('Add a snapshot of the current view to this dataset\'s thumbnails?\n' +
      'The view will be resized and the camera reset before taking the screenshot.');
    // I'd like to ask the user if they are sure here...
    saveThumbnail();
  },

  listDataSets() {
    this.context.router.push('/list');
  },

  toggleShowControls(e) {
    const show = !this.state.showControls;
    this.setState({ showControls: show });
  },

  toggleAutoApply() {
    const newAA = !this.state.dataset.autoApply;
    const newDataset = clone(this.state.dataset);
    newDataset.autoApply = newAA;
    this.setState({ dataset: newDataset });
  },

  render() {
    const hideTimeControls = this.state.dataset.data.time.length === 0;

    const controlPanelClass = this.state.showControls ?
      style.controlPanel : style.controlPanelHidden;
    const controlsClass = this.state.showControls ? style.controls : style.controlsHidden;

    const newModules = modules.filter((mdl) => {
      if (this.props.profile.modules_included.includes(mdl.name)) {
        return true;
      }
      if (this.props.profile.modules_included.length === 0 &&
        !this.props.profile.modules_excluded.includes(mdl.name)) {
        return true;
      }
      return false;
    });

    if (this.state.dataset.empty) {
      return <div className={style.loadingDataset}>Dataset loading...</div>;
    }

    return (
      <div className={style.viewDataset}>
        <div className={controlPanelClass}>
          <div className={style.showControlsIconDiv}>
            <div className={style.lineItem}>
              <i
                className={this.state.showControls ? style.addThumbnailButton : style.hidden}
                onClick={this.querySaveThumbnail}
              />
              {colors.map((c, idx) => {
                const myfg = c.cssColor.join(',');
                const mybg = c.cssBGColor.join(',');
                const mygradient = `radial-gradient(rgb(${myfg}) 30%, rgb(${mybg}) 45%)`;
                return (
                  <div
                    className={this.state.showControls ? style.colorItem : style.hidden}
                    key={idx}
                    style={{ background: mygradient }}
                    data-index={idx}
                    onClick={updateColors}
                  />
                );
              })}
              <div
                className={this.state.showControls ? style.toggleAutoApplyDiv : style.hidden}
                onClick={this.toggleAutoApply}
              >
                <i className={this.state.dataset.autoApply ? style.autoApplyOnIcon : style.autoApplyOffIcon} />
                Auto-Apply
              </div>
            </div>
            <div className={style.lineItem}>
              <i
                className={style.listDataSetsButton}
                onClick={this.listDataSets}
              />
              <i className={style.resetViewButton} onClick={resetCamera} />
              <div className={style.logo} onClick={this.toggleShowControls}>
                <SvgIcon
                  icon={lightVizIcon}
                  height="30px"
                  width="30px"
                  style={{ position: 'absolute', top: '-6px', left: 0 }}
                />
              </div>
            </div>
          </div>
          <div className={controlsClass}>
            {hideTimeControls ? null :
              <div>
                <TimePanel
                  className={style.timeContainer}
                  location={this.props.location}
                  params={this.props.params}
                  dataset={this.state.dataset}
                />
              </div>
            }
            <ColorMap dataset={this.state.dataset} />
            {newModules.map(panel =>
              <Section
                className={style.section}
                key={panel.name}
                panel={panel}
                {...this.props}
                dataset={this.state.dataset}
              />
            )}
          </div>
        </div>
        <VtkRenderer
          className={style.vtkRenderer}
          connection={getConnection()}
          client={getClient()}
        />
      </div>
    );
  },
});
