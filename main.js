const API_KEY = 'zwnfedkyJ0m-ITfTerDfqg';
const BASE_URL = 'http://realtime.mbta.com/developer/api/v2/';
const FORMAT = 'json'

const ROUTES = {
  redline: 'Red',
  bus: '77',
};

const STOPS = {
  alewife: 'place-alfcl',
  magoun: '2268',
  gladstone: '2274',
};

const buildEndpoint = (endpoint, params) => {
  const paramStr = params.reduce((prev, curr) => prev += `&${curr.name}=${curr.value}`, '');
  return `${BASE_URL}${endpoint}?api_key=${API_KEY}&format=${FORMAT}${paramStr}`;
};

const ENDPOINTS = {
  stopsbyroute: (route) => buildEndpoint('stopsbyroute', [{ name: 'route', value: route }]),
  predictionsbystop: (stop) => buildEndpoint('predictionsbystop', [{ name: 'stop', value: stop }]),
};

async function getJSON(url) {
  const response = await fetch(url);
  const json = await response.json();
  return json;
}

async function getRedlineTimes() {
  const json = await getJSON(ENDPOINTS.predictionsbystop(STOPS.alewife));
  const subway = json.mode.filter((mode) => mode.mode_name === 'Subway');
  if (subway.length === 0) throw new Error('no subway found');
  const outbound = subway[0].route.reduce((prev, curr) => {
    const southbound = curr.direction.filter((direction) => direction.direction_name === 'Southbound');
    if (southbound.length === 1) prev.push(southbound[0]);
    return prev;
  }, []);
  if (outbound.length === 0) throw new Error('no outbound direction found');
  const trips = outbound[0].trip;
  if (trips.length === 0) throw new Error('no trips found');
  return trips;
}

// Do some things
// getJSON(ENDPOINTS.stopsbyroute(ROUTES.redline)).then((json) => console.log('stopsbyroute - redline', json));
// getJSON(ENDPOINTS.stopsbyroute(ROUTES.bus)).then((json) => console.log('stopsbyroute - bus', json));
getJSON(ENDPOINTS.predictionsbystop(STOPS.alewife)).then((json) => console.log('predictionsbystop - alewife', json));
// getJSON(ENDPOINTS.predictionsbystop(STOPS.magoun)).then((json) => console.log('predictionsbystop - magoun', json));
// getJSON(ENDPOINTS.predictionsbystop(STOPS.gladstone)).then((json) => console.log('predictionsbystop - gladstone', json));

getRedlineTimes()
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error('redline error:', error.message);
  });
