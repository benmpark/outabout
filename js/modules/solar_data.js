/** Class representing the solar events in a day. */
class DayEvents {
  /**
   * Create a DayEvents object.
   * @param {string} dawn - Time of dawn
   * @param {string} sunrise - Time of sunrise
   * @param {string} noon - Time of noon
   * @param {string} goldenPM - Time of golden hour (afternoon)
   * @param {string} sunset - Time of sunset
   * @param {string} dusk - Time of dusk
   */
  constructor(dawn, sunrise, noon, goldenPM, sunset, dusk) {
    this.dawn = dawn;
    this.sunrise = sunrise;
    this.goldenAM = getMorningGoldenHour(sunrise, goldenPM, sunset);
    this.noon = noon;
    this.goldenPM = goldenPM;
    this.sunset = sunset;
    this.dusk = dusk;
    this.eventArray = [
      "12:00 AM",
      shaveSeconds(this.dawn),
      shaveSeconds(this.sunrise),
      shaveSeconds(this.goldenAM),
      shaveSeconds(this.noon),
      shaveSeconds(this.goldenPM),
      shaveSeconds(this.sunset),
      shaveSeconds(this.dusk),
    ];
    this.eventHourArray = [
      0,
      timeStringToHour(this.dawn),
      timeStringToHour(this.sunrise),
      timeStringToHour(this.goldenAM),
      timeStringToHour(this.noon),
      timeStringToHour(this.goldenPM),
      timeStringToHour(this.sunset),
      timeStringToHour(this.dusk),
      24,
    ];
  }
}

/** Class for processing raw solar time data. */
class SolarData {
  /**
   *
   * @param {Object} results - The JSON data from the API call
   */
  constructor(results) {
    this.today = new DayEvents(
      results[0].dawn,
      results[0].sunrise,
      results[0].solar_noon,
      results[0].golden_hour,
      results[0].sunset,
      results[0].dusk
    );

    this.tomorrow = new DayEvents(
      results[1].dawn,
      results[1].sunrise,
      results[1].solar_noon,
      results[1].golden_hour,
      results[1].sunset,
      results[1].dusk
    );

    this.dayAfter = new DayEvents(
      results[2].dawn,
      results[2].sunrise,
      results[2].solar_noon,
      results[2].golden_hour,
      results[2].sunset,
      results[2].dusk
    );

    this.allEvents = [
      this.today.eventArray,
      this.tomorrow.eventArray,
      this.dayAfter.eventArray,
    ];

    this.allEventHours = [
      this.today.eventHourArray,
      this.tomorrow.eventHourArray,
      this.dayAfter.eventHourArray,
    ];
  }
}

/**
 * Takes a string representing the time and removes the seconds
 * @param {string} timeString - the time as a string
 * @returns {string} - The time displayed with no seconds
 */
function shaveSeconds(timeString) {
  const singleDigitHour = timeString[1] == ":";
  let hoursMinutes = singleDigitHour
    ? timeString.slice(0, 4)
    : timeString.slice(0, 5);
  return hoursMinutes + timeString.slice(-3);
}

/**
 * Parses the hours, minutes, and seconds from a time string.
 * @param {string} timeString - the time as a string
 * @returns {number[]} - an array with the values of hours, minutes, and seconds
 */
function getHMS(timeString) {
  let timeComponents = timeString.split(" ");
  let isMorning = timeComponents[1] == "AM" ? true : false;
  let hmsComponents = timeComponents[0].split(":");
  let hours = parseFloat(hmsComponents[0]);
  if (hours == 12 && isMorning) {
    hours = 0;
  } else if (!isMorning && hours != 12) {
    hours += 12;
  }
  return [hours, parseFloat(hmsComponents[1]), parseFloat(hmsComponents[2])];
}

/**
 * Takes the time string and returns the nearest whole hour (on the same day)
 * @param {string} timeString - the time as a string
 * @returns {number} - The closest hour
 */
function timeStringToHour(timeString) {
  let hms = getHMS(timeString);
  let hours = hms[0];
  if (parseFloat(hms[1]) >= 30 && hours < 23) {
    hours += 1;
  }
  return hours;
}

/**
 * Converts a Date object to a string containing the time
 * @param {Date} date - the Date object
 * @returns {string} - the time represented as a string
 */
function dateObjectToTimeString(date) {
  let hours = date.getHours();
  let suffix;
  if (hours < 12) {
    suffix = "AM";
    if (hours == 0) {
      hours = 12;
    }
  } else {
    suffix = "PM";
    if (hours > 12) {
      hours -= 12;
    }
  }
  let minutes = date.getMinutes();
  //   let seconds = date.getSeconds();
  return `${hours}:${minutes.toString().padStart(2, "0")} ${suffix}`;

  //   // version with seconds displayed
  //   return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
  //     .toString()
  //     .padStart(2, "0")} ${suffix}`;
}

/**
 * Converts a time string to a Date object.
 *
 * Only deals with hours, minutes, and seconds; the date is set to
 * January 1, 1970 by default.
 * @param {string} timeString - the time as a string
 * @returns {Date} - the time as a Date object
 */
function getDateObject(timeString) {
  let [hh, mm, ss] = getHMS(timeString);
  let tempString = `1970-01-01T${hh.toString().padStart(2, "0")}:${mm
    .toString()
    .padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
  return new Date(tempString);
}

/**
 * Calculates the beginning of the morning golden hour.
 * @param {string} sunrise - the sunrise time
 * @param {string} goldenStart - the start of the afternoon golden hour
 * @param {string} sunset - the sunset time
 * @returns {string} - the beginning of the morning golden hour
 */
function getMorningGoldenHour(sunrise, goldenStart, sunset) {
  let goldenHourLength =
    getDateObject(sunset).getTime() - getDateObject(goldenStart).getTime();
  let dateObject = new Date(
    getDateObject(sunrise).getTime() + goldenHourLength
  );
  return dateObjectToTimeString(dateObject);
}

export default SolarData;
