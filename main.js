const API_KEY = 'zwnfedkyJ0m-ITfTerDfqg';
const BASE_URL = 'http://realtime.mbta.com/developer/api/v2/';
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

const buildEndpoint = (endpoint, params) => {
  const paramStr = params.reduce((prev, curr) => prev += `&${curr.name}=${curr.value}`, '');
  return `${BASE_URL}${endpoint}?api_key=${API_KEY}&format=${FORMAT}${paramStr}`;
};

const ENDPOINTS = {
  stopsbyroute: (route) => buildEndpoint('stopsbyroute', [{ name: 'route', value: route }]),
  predictionsbystop: (stop) => buildEndpoint('predictionsbystop', [{ name: 'stop', value: stop }]),
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

displayPredictions();
setInterval(displayPredictions, 60 * 1000);

// Do some things
// fetchJSON(ENDPOINTS.stopsbyroute(ROUTES.redline)).then((json) => console.log('stopsbyroute - redline', json));
// fetchJSON(ENDPOINTS.stopsbyroute(ROUTES.bus)).then((json) => console.log('stopsbyroute - bus', json));
// fetchJSON(ENDPOINTS.predictionsbystop(STOPS.alewife.stop_id)).then((json) => console.log('predictionsbystop - alewife', json));
// fetchJSON(ENDPOINTS.predictionsbystop(STOPS.magoun.stop_id)).then((json) => console.log('predictionsbystop - magoun', json));
// fetchJSON(ENDPOINTS.predictionsbystop(STOPS.gladstone.stop_id)).then((json) => console.log('predictionsbystop - gladstone', json));
