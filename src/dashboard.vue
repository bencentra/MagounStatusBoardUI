<template>
<div id="dashboard">
  <!-- <h1>Hello {{test}}</h1> -->
  <div class="row">
    <div class="col third">
      <div class="date">{{date}}</div>
    </div>
    <div class="col third center">
      <h1 class="header">53 Magoun Street</h1>
    </div>
    <div class="col third">
      <Weather :data="weather"/>
    </div>
  </div>
  <div class="row">
    <div class="col third">
      <Route :data="alewife" :name="'Red Line Inbound - Alewife'"/>
    </div>
    <div class="col third">
      <Route :data="magoun" :name="'Bus 77 South - Magoun'"/>
    </div>
    <div class="col third">
      <Route :data="gladstone" :name="'Bus 77 North - Gladstone'"/>
    </div>
  </div>
  <div class="row">
    <div class="col whole center">
      <button class="refresh" v-on:click="refresh()">Refresh</button>
      <div><em>Last updated: {{lastUpdated}}</em></div>
    </div>
  </div>
</div>
</template>

<script>
import * as mbta from './mbta';
import * as weather from './weather';
import * as dates from './dates';
import Weather from './components/weather.vue';
import Route from './components/route.vue';

const fiveMinutesInMillis = 1000 * 60 * 5;

let intervalId = null;

export default {
  data() {
    return {
      date: dates.getDateString(new Date()),
      alewife: [],
      magoun: [],
      gladstone: [],
      weather: null,
      lastUpdated: '',
    }
  },
  methods: {
    update() {
      console.log('update');
      mbta.getPredictionsByStop(mbta.STOPS.alewife).then((data) => this.alewife = data);
      mbta.getPredictionsByStop(mbta.STOPS.magoun).then((data) => this.magoun = data);
      mbta.getPredictionsByStop(mbta.STOPS.gladstone).then((data) => this.gladstone = data);
      weather.getForecast(weather.PLACES.magoun).then((data) => this.weather = data);
      this.lastUpdated = dates.getTimeString(new Date());
    },
    refresh() {
      console.log('refresh');
      clearInterval(intervalId);
      this.update();
      intervalId = setInterval(() => this.update(), fiveMinutesInMillis);
    },
  },
  created: function() {
    this.update();
    intervalId = setInterval(() => this.update(), fiveMinutesInMillis);
  },
  components: {
    Weather,
    Route,
  },
}
</script>

<style>
* {
  box-sizing: border-box;
}

body, html {
  width: 100%;
  height: 100%;
  padding: 0px;
  margin: 0px;
}

#dashboard {
  width: 100%;
  height: 100%;
  padding: 10px;
}

.row {
  clear: both;
}

.center {
  text-align: center;
}

.col {
  float: left;
}

.whole {
  width: 100%;
}

.half {
  width: 50%;
}

.third {
  width: 33%;
}

.fourth {
  width: 25%;
}

.header {
  margin: 0px;
}

.refresh {
  font-size: 1.2em;
}

.date {
  padding-top: 8px;
  font-size: 1.2em;
}
</style>
