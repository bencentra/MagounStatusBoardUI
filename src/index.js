import 'babel-polyfill';
import Vue from 'vue';
import Dashboard from './dashboard.vue';
import * as mbta from './mbta';
import * as weather from './weather';
import * as dates from './dates';

const fiveMinutesInMillis = 1000 * 60 * 5;

function displayPredictionsList(selector, data) {
  const section = document.querySelector(selector);
  section.innerHTML = '';
  // const trips = normalizeTrips(data);
  const trips = data;
  const firstTrip = trips.shift();
  if (firstTrip) {
    const nextTrain = document.createElement('div');
    const minutesUntilNextTrain = dates.minutesUntil(firstTrip.departure);
    const nextTrainText = document.createTextNode(`Next Departure in ${minutesUntilNextTrain} minutes (${dates.getTimeString(firstTrip.departure)})`);
    nextTrain.appendChild(nextTrainText);
    section.appendChild(nextTrain);
  }
  if (trips.length > 0) {
    const msg = document.createElement('p');
    msg.appendChild(document.createTextNode('Upcoming departures:'));
    section.appendChild(msg);
    const list = document.createElement('ul');
    trips.forEach((trip) => {
      const item = document.createElement('li');
      const minutesUntilTrain = dates.minutesUntil(trip.departure);
      item.appendChild(document.createTextNode(`${minutesUntilTrain} minutes (${dates.getTimeString(trip.departure)})`));
      list.appendChild(item);
    });
    section.appendChild(list);
  }
}

function displayPredictions() {
  Object.keys(mbta.STOPS).forEach((name) => {
    const stop = mbta.STOPS[name];
    mbta.getPredictionsByStop(stop)
      .then((data) => {
        console.log(name, data);
        displayPredictionsList(`#${name} .times`, data);
      })
      .catch((error) => {
        console.error(`${name} error:`, error.message);
      });
  });
}

function displayForecast(selector, data) {
  const {weather, main} = data;
  const section = document.querySelector(selector);
  const str = `<strong>Weather:</strong> ${main.temp}℉, ${weather[0].main}`;
  section.innerHTML = str;
}

function displayForecasts() {
  Object.keys(weather.PLACES).forEach((name) => {
    const place = weather.PLACES[name];
    weather.getForecast(place)
      .then((data) => {
        console.log(data);
        displayForecast(`.forecast`, data);
      })
      .catch((error) => {
        console.error(`${name} error:`, error.message);
      });
  });
}

function displayDate(selector, date) {
  if (!date) {
    date = new Date();
  }
  const str = dates.getDateString(date);
  document.querySelector(selector).innerHTML = str;
}

function init() {
  function refresh() {
    displayPredictions();
    displayForecasts();
    document.querySelector('.last-updated').innerHTML = `Last updated: ${dates.getTimeString(new Date())}`;
  }

  function setRefreshInterval() {
    return setInterval(refresh, fiveMinutesInMillis);
  }

  // Display initial data;
  displayDate('.date');
  refresh();

  // Test for route alerts
  // Object.keys(ROUTES).forEach((route) => {
  //   fetchJSON(ENDPOINTS.alertsbyroute(ROUTES[route])).then(console.log).catch(console.error);
  // });

  // Refresh the data every five minutes
  let interval = setRefreshInterval();

  // Hook up the manual refresh button;
  const refreshBtn = document.querySelector('.refresh');
  refreshBtn.addEventListener('click', () => {
    clearInterval(interval);
    refresh();
    interval = setRefreshInterval();
  });
}

function init() {
  const dashboard = new Vue({
    el: '#dashboard',
    render: h => h(Dashboard),
  });
}

export {
  init,
};
