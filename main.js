const MBTA_API_KEY = 'zwnfedkyJ0m-ITfTerDfqg';
const WEATHER_API_KEY = 'ece87b5e9ca34587fa0b35ec23421a55';
const MBTA_BASE_URL = 'https://realtime.mbta.com/developer/api/v2/';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/';
const FORMAT = 'json'

const ROUTES = {
  redline: 'Red',
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

const buildMbtaEndpoint = (endpoint, params) => {
  const paramStr = params.reduce((prev, curr) => prev += `&${curr.name}=${curr.value}`, '');
  return `${MBTA_BASE_URL}${endpoint}?api_key=${MBTA_API_KEY}&format=${FORMAT}${paramStr}`;
};

const ENDPOINTS = {
  stopsbyroute: (route) => buildMbtaEndpoint('stopsbyroute', [{ name: 'route', value: route }]),
  predictionsbystop: (stop) => buildMbtaEndpoint('predictionsbystop', [{ name: 'stop', value: stop }]),
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
  }).filter((trip) => trip.departure > Date.now());
}

function displayPredictionsList(selector, data) {
  const section = document.querySelector(selector);
  const list = document.createElement('ol');
  normalizeTrips(data).forEach((trip) => {
    const item = document.createElement('li');
    item.appendChild(document.createTextNode(`${trip.departure}`));
    list.appendChild(item);
  });
  section.innerHTML = '';
  section.appendChild(list);
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
  console.log(`last updated: ${Date.now()}`);
}

async function getForecast(place) {
  const {name, lat, lon} = place;
  const json = await fetchJSON(ENDPOINTS.forecast(lat, lon));
  return json;
}

function displayForecast(selector, data) {
  const {weather, main} = data;
  const section = document.querySelector(selector);
  const forecast = document.createElement('ul');
  const tempItem = document.createElement('li');
  tempItem.appendChild(document.createTextNode(main.temp));
  forecast.appendChild(tempItem);
  const weatherItem = document.createElement('li');
  weatherItem.appendChild(document.createTextNode(weather[0].main));
  forecast.appendChild(weatherItem);
  section.innerHTML = '';
  section.appendChild(forecast);
}

function displayForecasts() {
  Object.keys(PLACES).forEach((name) => {
    const place = PLACES[name];
    getForecast(place)
      .then((data) => {
        console.log(data);
        displayForecast(`#weather .forecast`, data);
      })
      .catch((error) => {
        console.error(`${name} error:`, error.message);
      })
  });
}

displayPredictions();
displayForecasts();
setInterval(() => {
  displayPredictions();
  displayForecasts();
}, 60 * 1000 * 5);
