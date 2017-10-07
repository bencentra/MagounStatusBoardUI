const API_KEY = 'wX9NwuHnZU2ToO7GmGR9uw';
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
};

// Do some things
getJSON(ENDPOINTS.stopsbyroute(ROUTES.redline)).then((json) => console.log('stopsbyroute - redline', json));
getJSON(ENDPOINTS.stopsbyroute(ROUTES.bus)).then((json) => console.log('stopsbyroute - bus', json));
getJSON(ENDPOINTS.predictionsbystop(STOPS.alewife)).then((json) => console.log('predictionsbystop - alewife', json));
getJSON(ENDPOINTS.predictionsbystop(STOPS.magoun)).then((json) => console.log('predictionsbystop - magoun', json));
getJSON(ENDPOINTS.predictionsbystop(STOPS.gladstone)).then((json) => console.log('predictionsbystop - gladstone', json));
