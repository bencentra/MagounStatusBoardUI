<template>
<div class="route">
  <h2>{{name}}</h2>
  <div v-if="data.length">
    <p>{{displayNextTrip()}}</p>
    <p>Upcoming departures:</p>
    <ul>
      <li v-for="trip in data">{{displayTrip(trip)}}</li>
    </ul>
  </div>
  <div v-else>
    <p>No data available</p>
  </div>
</div>
</template>

<script>
import * as dates from '../dates';

export default {
  props: ['data', 'name'],
  methods: {
    displayNextTrip() {
      const firstTrip = this.data[0];
      if (firstTrip) {
        const timeTo = dates.minutesUntil(firstTrip.departure);
        const timeOf = dates.getTimeString(firstTrip.departure);
        return `Next departure in ${timeTo} minutes (${timeOf})`;
      } else {
        return `No upcoming departures`;
      }
    },
    displayTrip(trip) {
      const timeTo = dates.minutesUntil(trip.departure);
      const timeOf = dates.getTimeString(trip.departure);
      return `${timeTo} minutes (${timeOf})`;
    }
  }
}
</script>

<style>

</style>
