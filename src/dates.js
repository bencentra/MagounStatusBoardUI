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

function getDateString(date) {
  const day = DAYS[date.getDay()];
  const month = MONTHS[date.getMonth()];
  const year = 1900 + date.getYear();
  const num = date.getDate();
  return `${day}, ${month} ${num}, ${year}`;
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

function minutesUntil(date, date2) {
  if (!date2) date2 = Date.now();
  return parseInt((date - date2) / 1000 / 60, 10);
}

export {
  getDateString,
  getTimeString,
  minutesUntil,
};
