///////////////////////////////////////////////////////////////////////////////
// GENERAL UTILITY FUNCTIONS //////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

"use strict";

import { currentTime, processUserLocation } from "../custom_script.js";
import { updatePreferredTimeAndScore } from "./preferred_time.js";
import {
  setTodaysButtons,
  setFutureDaysButtons,
  toggleTimes,
  hideTimesAlert,
  updateSolarTimes,
  checkIfDefaultTimes,
} from "./time_preferences.js";

// MODULE VARIABLE
let daySelection;

/**
 * Finds the user's current location.
 */
function automaticLocation() {
  let alertSpace = document.getElementById("location-alert-space");
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;

        processUserLocation(`${lat}, ${lon}`);
      },
      function (error) {
        alertSpace.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
            Error getting geolocation: ${error.message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;
      },
      { enableHighAccuracy: true }
    );
  } else {
    alertSpace.innerHTML = `<div class="alert danger-warning alert-dismissible fade show" role="alert">
        Geolocation does not appear to be supported by your browser.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
  }
}

/**
 * Determines if a day is a weekday.
 * @param {number} day - The numerical day of the week
 * @returns {boolean} - true if Monday-Friday else false
 */
function isWeekday(day) {
  switch (day % 7) {
    case 0:
    case 6:
      return false;
    default:
      return true;
  }
}

/**
 * Converts the numerical day of the week to a string.
 * @param {number} day - The numerical day of the week
 * @returns {string} - The day of the week expressed as a string
 */
function dayToString(day) {
  switch (day) {
    case 0:
      return "Sunday";
    case 1:
      return "Monday";
    case 2:
      return "Tuesday";
    case 3:
      return "Wednesday";
    case 4:
      return "Thursday";
    case 5:
      return "Friday";
    case 6:
      return "Saturday";
    default:
      return "N/A";
  }
}

/**
 * Gets the number of hours past the midnight hour.
 * @returns {number} - The hour portion of the 24-hour time
 */
function getTime() {
  return currentTime.getHours();
}

/**
 * Figures out which day of the week the day after tomorrow is.
 * @returns {string} - The day after tomorrow as a string.
 */
function getDayAfterTomorrow() {
  return dayToString((currentTime.getDay() + 2) % 7);
}

/**
 * Updates the components of the page depending on which day button is pressed.
 * @param {string} dayTarget - The name of the day button pressed.
 */
function applyDay(dayTarget) {
  if (dayTarget == "choice-today") {
    daySelection = 0;
    document.getElementById("target_day").innerText = "later today";
    setTodaysButtons(getTime());
    // showTimesAlert();
  } else {
    daySelection = dayTarget == "choice-tomorrow" ? 1 : 2;
    document.getElementById("target_day").innerText =
      dayTarget == "choice-tomorrow" ? "tomorrow" : getDayAfterTomorrow();
    hideTimesAlert();
    setFutureDaysButtons();
  }
  updateSolarTimes();
  toggleTimes();
  updatePreferredTimeAndScore();
  checkIfDefaultTimes();
}

/**
 * Calculates the appropriate array index given the current hour
 * @param {number} hour - The current hour of the day
 * @param {number} day - How many days into the future
 * @returns {number} - The corresponding index of the forecast data arrays
 */
function getArrayIndex(hour, day) {
  return day * 24 + hour;
}

/**
 * Converts an integer between 0 and 71 to a readable time of day.
 * @param {number} n – The number of hours since midnight of the current day.
 * @returns {string} - The 12-hour time, e.g., "7 am"
 */
function integerToTimeText(n) {
  n -= 24 * daySelection;
  if (n == 0) {
    return "12 am";
  } else if (n < 12) {
    return `${n} am`;
  } else if (n == 12) {
    return "12 pm";
  } else {
    return `${n - 12} pm`;
  }
}

/**
 * Converts degrees Fahrenheit to degrees Celsius.
 * @param {number} f - The temperature in degrees Fahrenheit
 * @returns {number} - The temperature in degrees Celsius
 */
function fahrenheitToCelsius(degF) {
  return ((degF + 40) / 1.8 - 40).toFixed(1);
}

/**
 * Converts inches to millimeters.
 * @param {number} f - The measurement in inches
 * @returns {number} - The measurement in millimeters
 */
function inchesToMillimeters(inches) {
  return Math.round(inches * 25.4);
}

/**
 * Converts miles per hour to kilometers per hour.
 * @param {number} s - The speed in miles per hour
 * @returns {number} - The speed in kilometers per hour
 */
function mphToKmh(speed) {
  return (speed * 1.60934).toFixed(1);
}

/**
 * Sets all units displayed to imperial units.
 */
function imperialUnits(degrees, speeds) {
  degrees.forEach((element) => {
    element.innerHTML = `&#8457;`;
  });
  speeds.forEach((element) => {
    element.innerText = " mph";
  });
  const rateLabel = document.getElementById("precip-rate");
  if (rateLabel) {
    rateLabel.innerText = `"/hr`;
  }
}

/**
 * Sets all units displayed to metric units.
 * @param {*} degrees
 * @param {*} speeds
 */
function metricUnits(degrees, speeds) {
  degrees.forEach((element) => {
    element.innerHTML = `&#8451;`;
  });
  speeds.forEach((element) => {
    element.innerText = " km/h";
  });
  const rateLabel = document.getElementById("precip-rate");
  if (rateLabel) {
    rateLabel.innerText = " mm/hr";
  }
}

export {
  daySelection,
  automaticLocation,
  isWeekday,
  getTime,
  getDayAfterTomorrow,
  applyDay,
  integerToTimeText,
  getArrayIndex,
  updatePreferredTimeAndScore,
  fahrenheitToCelsius,
  mphToKmh,
  inchesToMillimeters,
  imperialUnits,
  metricUnits,
};
