const MBTA_API_KEY = 'zwnfedkyJ0m-ITfTerDfqg';
const WEATHER_API_KEY = 'ece87b5e9ca34587fa0b35ec23421a55';
const MBTA_BASE_URL = 'https://realtime.mbta.com/developer/api/v2/';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/';
const FORMAT = 'json'

const ROUTES = {
  redline: 'Red',
  // greenline: 'Green', // Actually 4 separate routes
  orangeline: 'Orange',
  blueline: 'Blue',
  // silverline: 'Silver', // Actually 5 separate routes
  bus: '77',
};

const STOPS = {
  alewife: {
    stop_id: 'place-alfcl',
    mode: 'subway',
    direction: 'southbound',
  },
  magoun: {
    stop_id: '2268',
    mode: 'bus',
    direction: 'inbound',
  },
  gladstone: {
    stop_id: '2274',
    mode: 'bus',
    direction: 'outbound',
  },
};

const PLACES = {
  magoun: {
    name: '53 Magoun Street',
    lat: '42.399040',
    lon: '-71.135409',
  },
};

const DAYS = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

const MONTHS = {
  0: 'January',
  1: 'February',
  2: 'March',
  3: 'April',
  4: 'May',
  5: 'June',
  6: 'July',
  7: 'August',
  8: 'September',
  9: 'October',
  10: 'November',
  11: 'December',
};

const fiveMinutesInMillis = 1000 * 60 * 5;

const buildMbtaEndpoint = (endpoint, params) => {
  const paramStr = params.reduce((prev, curr) => prev += `&${curr.name}=${curr.value}`, '');
  return `${MBTA_BASE_URL}${endpoint}?api_key=${MBTA_API_KEY}&format=${FORMAT}${paramStr}`;
};

const ENDPOINTS = {
  stopsbyroute: (route) => buildMbtaEndpoint('stopsbyroute', [{ name: 'route', value: route }]),
  predictionsbystop: (stop) => buildMbtaEndpoint('predictionsbystop', [{ name: 'stop', value: stop }]),
  alertsbyroute: (route) => buildMbtaEndpoint('alertsbyroute', [{name: 'route', value: route}]),
  forecast: (lat, lon) => `${WEATHER_BASE_URL}weather?appid=${WEATHER_API_KEY}&lat=${lat}&lon=${lon}&units=imperial`,
};

async function fetchJSON(url) {
  const response = await fetch(url);
  const json = await response.json();
  return json;
}

async function getPredictionsByStop(stop) {
  const json = await fetchJSON(ENDPOINTS.predictionsbystop(stop.stop_id));
  const mode = json.mode.filter(m => m.mode_name.toLowerCase() === stop.mode);
  if (mode.length === 0) throw new Error(`no ${stop.mode} found`);
  const direction = mode[0].route.reduce((prev, curr) => {
    const tmp = curr.direction.filter(d => d.direction_name.toLowerCase() === stop.direction);
    if (tmp.length === 1) prev.push(tmp[0]);
    return prev;
  }, []);
  if (direction.length === 0) throw new Error(`no direction ${stop.direction} found`);
  const trips = direction[0].trip;
  if (trips.length === 0) throw new Error('no trips found');
  return trips;
}

function normalizeTrips(trips) {
  return trips.map((trip) => {
    return {
      prediction: new Date(parseInt(trip.pre_dt, 10) * 1000),
      arrival: new Date(parseInt(trip.sch_arr_dt, 10) * 1000),
      departure: new Date(parseInt(trip.sch_dep_dt, 10) * 1000),
      headsign: trip.trip_headsign,
      name: trip.trip_name
    };
  }).filter((trip) => trip.departure > (Date.now() + fiveMinutesInMillis));
}

function displayPredictionsList(selector, data) {
  const section = document.querySelector(selector);
  section.innerHTML = '';
  const trips = normalizeTrips(data);
  const firstTrip = trips.shift();
  if (firstTrip) {
    const nextTrain = document.createElement('div');
    const minutesUntilNextTrain = minutesUntil(firstTrip.departure);
    const nextTrainText = document.createTextNode(`Next Departure in ${minutesUntilNextTrain} minutes (${getTimeString(firstTrip.departure)})`);
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
      const minutesUntilTrain = minutesUntil(trip.departure);
      item.appendChild(document.createTextNode(`${minutesUntilTrain} minutes (${getTimeString(trip.departure)})`));
      list.appendChild(item);
    });
    section.appendChild(list);
  }
}

function displayPredictions() {
  Object.keys(STOPS).forEach((name) => {
    const stop = STOPS[name];
    getPredictionsByStop(stop)
      .then((data) => {
        console.log(name, data);
        displayPredictionsList(`#${name} .times`, data);
      })
      .catch((error) => {
        console.error(`${name} error:`, error.message);
      });
  });
}

async function getForecast(place) {
  const {name, lat, lon} = place;
  const json = await fetchJSON(ENDPOINTS.forecast(lat, lon));
  return json;
}

function displayForecast(selector, data) {
  const {weather, main} = data;
  const section = document.querySelector(selector);
  const str = `<strong>Weather:</strong> ${main.temp}℉, ${weather[0].main}`;
  section.innerHTML = str;
}

function displayForecasts() {
  Object.keys(PLACES).forEach((name) => {
    const place = PLACES[name];
    getForecast(place)
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
  const str = getDateString(date);
  document.querySelector(selector).innerHTML = str;
}

function minutesUntil(date, date2) {
  if (!date2) date2 = Date.now();
  return parseInt((date - date2) / 1000 / 60, 10);
}

function getTimeString(date) {
  let amPm = 'AM';
  let hour = date.getHours();
  if (hour > 12) {
    hour -= 12;
    amPm = 'PM'
  }
  if (hour === 0) hour = 12;
  let minute = date.getMinutes();
  if (minute < 10) minute = `0${minute}`;
  return `${hour}:${minute} ${amPm}`;
}

function getDateString(date) {
  const day = DAYS[date.getDay()];
  const month = MONTHS[date.getMonth()];
  const year = 1900 + date.getYear();
  const num = date.getDate();
  return `${day}, ${month} ${num}, ${year}`;
}

document.addEventListener('DOMContentLoaded', () => {
  function refresh() {
    displayPredictions();
    displayForecasts();
    document.querySelector('.last-updated').innerHTML = `Last updated: ${getTimeString(new Date())}`;
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
});
