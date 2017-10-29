<template>
<div id="dashboard">
  <!-- <h1>Hello {{test}}</h1> -->
  <div class="row">
    <div class="col third">
      <div class="date">{{date}}</div>
    </div>
    <div class="col third">
      <h1 class="header">53 Magoun Street</h1>
    </div>
    <div class="col third">
      <div class="forecast">{{weather}}</div>
    </div>
  </div>
  <div class="row">
    <div class="col third">
      {{alewife}}
    </div>
    <div class="col third">
      {{magoun}}
    </div>
    <div class="col third">
      {{gladstone}}
    </div>
  </div>
  <div class="row">
    <div class="col whole center">
      <button class="refresh" v-on:click="update()">Refresh</button>
    </div>
  </div>
</div>
</template>

<script>
import * as mbta from './mbta';
import * as weather from './weather';
import * as dates from './dates';

export default {
  data() {
    return {
      date: dates.getDateString(new Date()),
      alewife: [],
      magoun: [],
      gladstone: [],
      weather: {},
    }
  },
  methods: {
    update() {
      mbta.getPredictionsByStop(mbta.STOPS.alewife)
        .then((data) => this.alewife = data);
      mbta.getPredictionsByStop(mbta.STOPS.magoun)
        .then((data) => this.magoun = data);
      mbta.getPredictionsByStop(mbta.STOPS.gladstone)
        .then((data) => this.gladstone = data);
      weather.getForecast(weather.PLACES.magoun)
        .then((data) => this.weather = data);
    }
  }
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

.forecast {
  padding-top: 8px;
  font-size: 1.2em;
  text-align: right;
}

.date {
  padding-top: 8px;
  font-size: 1.2em;
}
</style>
