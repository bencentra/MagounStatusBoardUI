import { fetchJSON } from './fetch';

const WEATHER_API_KEY = 'ece87b5e9ca34587fa0b35ec23421a55';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/';

const PLACES = {
  magoun: {
    name: '53 Magoun Street',
    lat: '42.399040',
    lon: '-71.135409',
  },
};

const ENDPOINTS = {
  forecast: (lat, lon) => `${WEATHER_BASE_URL}weather?appid=${WEATHER_API_KEY}&lat=${lat}&lon=${lon}&units=imperial`,
};

async function getForecast(place) {
  const {lat, lon} = place;
  const json = await fetchJSON(ENDPOINTS.forecast(lat, lon));
  return json;
}

export {
  PLACES,
  getForecast,
};
