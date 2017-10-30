import 'babel-polyfill';
import Vue from 'vue';
import Dashboard from './dashboard.vue';
import * as mbta from './mbta';
import * as weather from './weather';
import * as dates from './dates';

function init() {
  const dashboard = new Vue({
    el: '#dashboard',
    render: h => h(Dashboard),
  });
}

export {
  init,
};
