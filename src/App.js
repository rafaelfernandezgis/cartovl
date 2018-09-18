import React, { Component } from 'react'
import {AgGridReact} from "ag-grid-react"
import carto from '@carto/carto-vl'
import mbgl from '@carto/mapbox-gl'

import 'ag-grid/dist/styles/ag-grid.css';
import 'ag-grid/dist/styles/ag-theme-material.css';


import './App.css';

//const mbgl = window.mapboxgl;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gridOptions: {
          context: {
              componentParent: this
          }
      },
      columnDefs: this.createColumnDefs(),
      defaultColDef: {
          width: 100
      },
      rowSelection: "single",
      localeText: {
          noRowsToShow: 'Ninguna fila que mostrar todavia'
      },
      page: {
        current: 1,
        last: 1
      },
      height: window.innerHeight,
      data: null
    };
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
    //mbgl.accessToken = 'pk.eyJ1IjoicmFmYWVsZmVybmFuZGV6Z2lzIiwiYSI6IjBjNGViZjA2NzcyOTliOTk0Y2RjOWU0ZTQ3YmZkZjMxIn0.wAh4BuKcpN3SMAv-NVm-Sg';
    const map = new mbgl.Map({
      container: this.mapContainer,
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: [-3.706467, 40.455674],
      zoom: 10,
      dragRotate: false
    });
    const nav = new mbgl.NavigationControl({
      showCompass: false
    });
    map.addControl(nav, 'bottom-right');
    
    carto.setDefaultAuth({
      user: 'udasaas',
      apiKey: 'PS9dIXm9Kd2n6GW_TztbZQ' //Urban2018
    });
    
    const source = new carto.source.SQL("SELECT geo.name, ind.cartodb_id, ind.category_id, ind.i_a, ind.y_r_qq, ind.y_s_qq, ind.o_a_qq, ind.s_t_qq, ind.n_viv_norm, ind.i_u_qq_rk, ind.id, ind.n_eda, ind.n_viv, ind.o_a, ind.o_pm, ind.o_pu, ind.o_pu_qq, ind.o_u, ind.o_u_qq, ind.o_u_qq_rk, ind.operation, ind.p_e_ter, ind.p_ed_39, ind.p_viv_pp, ind.p_viv_vac, ind.pa_edu_c, ind.pa_edu_g, ind.pa_ocio, ind.pa_p, ind.pa_tp, ind.r_d_rk, ind.r_g, ind.r_s_rk, ind.r_t_rk, ind.renthog_06_13_m, ind.s_fn, ind.s_p, ind.s_pc, ind.s_t, ind.s_u, ind.s_u_qq, ind.s_u_qq_rk, ind.viv_edad_efc, ind.y_r, ind.y_s, geo.the_geom, geo.the_geom_webmercator FROM udasaas.geo_boundary_geometry as geo INNER JOIN udasaas.rgi ind on geo.id = ind.id WHERE ( (ind.type=13 and ind.l_10='España') or (ind.type=13 and ind.l_10='Italia') or (ind.type=13 and ind.l_10='Peru') ) and ind.category_id is null and ind.operation = 1");
    const s = carto.expressions;
    const viz = new carto.Viz({
      color: s.rgba(204, 204, 204, 0.75),
      //strokeColor: opacity(BlueViolet, 0.8),
      strokeWidth: 2,
      variables: {
        list: s.viewportFeatures(s.prop('cartodb_id'), s.prop('name'), s.prop('i_a'), s.prop('y_r_qq'), s.prop('y_s_qq'), s.prop('o_a_qq'), s.prop('s_t_qq'), s.prop('n_viv_norm'), s.prop('i_u_qq_rk'), s.prop('n_eda'), s.prop('n_viv'), s.prop('o_u_qq_rk')),
        name: s.prop('name')
      }
    });
    const layer = new carto.Layer('myLayer', source, viz);
    layer.addTo(map);
    const interactivity = new carto.Interactivity(layer);
    const delay = 50;
    let clickedFeatureId = null;
    
    interactivity.on('featureEnter', event => {
      event.features.forEach(feature => {
        if (feature.id !== clickedFeatureId) {
          feature.color.blendTo('opacity(DeepPink, 0.5)', delay)
          feature.strokeWidth.blendTo('3', delay);
          feature.strokeColor.blendTo('opacity(white, 0.9)', delay);
        }
      });
    });
    interactivity.on('featureLeave', event => {
      event.features.forEach(feature => {
        if (feature.id !== clickedFeatureId) {
          feature.color.reset(delay);
          feature.strokeWidth.reset(delay);
          feature.strokeColor.reset(delay);
        }
      });
    });
    interactivity.on('featureClick', event => {
      if (event.features.length) {
        const feature = event.features[0];
        clickedFeatureId = feature.id;
        feature.color.blendTo('opacity(LimeGreen, 0.5)', delay)
        //feature.strokeWidth.blendTo('7', delay);
        //feature.strokeColor.blendTo('opacity(LimeGreen, 0.8)', delay);

        //Put on top the selected polygon
        console.log(this.state.data);
        let self = this;
        console.log(this.state.gridOptions.api.getModel().getRowCount());
        this.state.gridOptions.api.forEachNode(function (node, index) {
          if (feature.id === node.data.cartodb_id) {
            alert(node.data.name);
              
            //node.setSelected(true, false);
            //self.state.gridOptions.api.ensureIndexVisible(index);
            //self.state.gridOptions.api.ensureNodeVisible(node, 'top');
          }
      })
      }
    });
    interactivity.on('featureClickOut', event => {
      if (event.features.length) {
        const feature = event.features[0];
        clickedFeatureId = '';
        feature.color.reset(delay);
        //feature.strokeWidth.reset(delay);
        //feature.strokeColor.reset(delay);
      }
    });
    
    layer.on('updated', () => {
      let myArr = [];
      viz.variables.list.value.forEach(feature => {
        //console.log('id:', feature.cartodb_id, 'name:', feature.name);
        
        myArr.push({rownumber: myArr.length+1, cartodb_id:feature.cartodb_id, name:feature.name, i_a: feature.i_a, y_r_qq: feature.y_r_qq,
          y_s_qq: feature.y_s_qq, o_a_qq: feature.o_a_qq, s_t_qq: feature.s_t_qq, n_viv_norm: feature.n_viv_norm, i_u_qq_rk: feature.i_u_qq_rk, n_eda: feature.n_eda, n_viv: feature.n_viv, o_u_qq_rk: feature.o_u_qq_rk});
        
      });
      this.setState({data: myArr});
    });
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }
  updateWindowDimensions = () => {
    this.setState({ ...this.state, height: window.innerHeight })
  }

  createColumnDefs() {
    return [
        {field: 'rownumber', headerName: '#', cellStyle: {textAlign: 'center'}},
        {field: 'cartodb_id', headerName: 'ID', cellStyle: {textAlign: 'center'}},
        {field: 'name', headerName: 'Name', width: 300, cellStyle: {textAlign: 'center', fontWeight: "bold"}},
        {field: 'i_a', headerName: 'i_a', cellStyle: {textAlign: 'center'}},
        {field: 'y_r_qq', headerName: 'y_r_qq', cellStyle: {textAlign: 'center'}},
        {field: 'y_s_qq', headerName: 'y_s_qq', cellStyle: {textAlign: 'center'}},
        {field: 'o_a_qq', headerName: 'o_a_qq', cellStyle: {textAlign: 'center'}},
        {field: 's_t_qq', headerName: 's_t_qq', cellStyle: {textAlign: 'center'}},
        {field: 'n_viv_norm', headerName: 'n_viv_norm', cellStyle: {textAlign: 'center'}},
        {field: 'i_u_qq_rk', headerName: 'i_u_qq_rk', cellStyle: {textAlign: 'center'}},
        {field: 'n_eda', headerName: 'n_eda', cellStyle: {textAlign: 'center'}},
        {field: 'n_viv', headerName: 'n_viv', cellStyle: {textAlign: 'center'}},
        {field: 'o_u_qq_rk', headerName: 'o_u_qq_rk', cellStyle: {textAlign: 'center'}}
    ]
  }
  onSelectionChanged = (params) => {
    //let data = params.api.getSelectedRows()[0];
    console.log('onSelectionChanged');
  }

  render() {
    return (
      <div style={{height: this.state.height}}>
        <div ref={el => this.mapContainer = el} style={{height: '50%', width: '100%'}} />
        <div style={{height: '50%'}}>
          <div style={{ boxSizing: "border-box", width: '100%', height: "100%", overflowX: 'scroll' }} className="ag-theme-material">
            <AgGridReact 
                // properties
                id='urban'
                columnDefs={this.state.columnDefs}
                defaultColDef={this.state.defaultColDef}
                rowSelection={this.state.rowSelection}
                //suppressRowClickSelection //Still is multiple selection but a click in a cell doesnt mean a row selection
                rowData={this.state.data}
                enableSorting
                localeText={this.state.localeText}
                enableColResize={true}
                gridOptions={this.state.gridOptions}

                // events
                //onGridReady={this.onGridReady}
                //onRowSelected={this.onRowSelected}
                //onRowDataChanged={this.onRowDataChanged}
                onSelectionChanged={this.onSelectionChanged}
                >
            </AgGridReact>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
