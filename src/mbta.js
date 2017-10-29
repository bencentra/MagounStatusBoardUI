import { fetchJSON } from './fetch';

const fiveMinutesInMillis = 1000 * 60 * 5;

const MBTA_API_KEY = 'zwnfedkyJ0m-ITfTerDfqg';
const MBTA_BASE_URL = 'https://realtime.mbta.com/developer/api/v2/';
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

function buildMbtaEndpoint(endpoint, params) {
  const paramStr = params.reduce((prev, curr) => prev += `&${curr.name}=${curr.value}`, '');
  return `${MBTA_BASE_URL}${endpoint}?api_key=${MBTA_API_KEY}&format=${FORMAT}${paramStr}`;
}

const ENDPOINTS = {
  stopsbyroute: (route) => buildMbtaEndpoint('stopsbyroute', [{ name: 'route', value: route }]),
  predictionsbystop: (stop) => buildMbtaEndpoint('predictionsbystop', [{ name: 'stop', value: stop }]),
  alertsbyroute: (route) => buildMbtaEndpoint('alertsbyroute', [{name: 'route', value: route}]),
};

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

async function getPredictionsByStop(stop) {
  const json = await fetchJSON(ENDPOINTS.predictionsbystop(stop.stop_id));
  const mode = json.mode.filter(m => m.mode_name.toLowerCase() === stop.mode);
  if (mode.length === 0) {
    // throw new Error(`no ${stop.mode} found`);
    console.error(`no ${stop.mode} found`);
    return [];
  }
  const direction = mode[0].route.reduce((prev, curr) => {
    const tmp = curr.direction.filter(d => d.direction_name.toLowerCase() === stop.direction);
    if (tmp.length === 1) prev.push(tmp[0]);
    return prev;
  }, []);
  if (direction.length === 0) {
    // throw new Error(`no direction ${stop.direction} found`);
    console.error(`no direction ${stop.direction} found`);
    return [];
  }
  const trips = direction[0].trip;
  if (trips.length === 0) {
    // throw new Error('no trips found');
    console.error('no trips found');
    return [];
  }
  return normalizeTrips(trips);
}

async function getAllPredictions() {
  const promises = [];
  Object.keys(STOPS).forEach((stop) => {
    promises.push(getPredictionsByStop(stop));
  });
  return Promise.all(promises);
}

export {
  ROUTES,
  STOPS,
  getPredictionsByStop,
  getAllPredictions,
};
