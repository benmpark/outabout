"use strict";

import {
  currentTime,
  sunTimes,
  weatherForecast,
  absTimeButtons,
  solarTimeButtons,
  currentHour,
  processUserLocation,
  temperatureSlider,
  dewPointSlider,
  cloudCoverSlider,
  uvSlider,
  precipitationIntensitySlider,
  windSpeedSlider,
} from "../custom_script.js";
import { findBestTime } from "./preferred_time.js";

// MODULE VARIABLES
let daySelection;

let bestTimeSpace = document.getElementById("best-time");
let preferenceText = document.getElementById("preferred-time-text");
let preferredScore = document.getElementById("best_preferred_score");

const absTimeButtonIds = [
  "12am",
  "1am",
  "2am",
  "3am",
  "4am",
  "5am",
  "6am",
  "7am",
  "8am",
  "9am",
  "10am",
  "11am",
  "12pm",
  "1pm",
  "2pm",
  "3pm",
  "4pm",
  "5pm",
  "6pm",
  "7pm",
  "8pm",
  "9pm",
  "10pm",
  "11pm",
];

const solarTimeButtonIds = [
  "night_am",
  "civil_am",
  "golden_am",
  "morning",
  "afternoon",
  "golden_pm",
  "civil_pm",
  "night_pm",
];

const solarTimeInsertIds = [
  "pre-dawn-time",
  "dawn-time",
  "am-golden-time",
  "morning-time",
  "afternoon-time",
  "pm-golden-time",
  "dusk-time",
  "post-dusk-time",
];

///////////////////////////////////////////////////////////////////////////////
// UTILITY FUNCTIONS //////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

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
 * Converts the numerical day of the week to a string.
 * @param {number} day - The numerical day of the week
 * @returns {string} The day of the week expressed as a string
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
 * @returns {number} The hour portion of the 24-hour time
 */
function getTime() {
  return currentTime.getHours();
}

/**
 * Figures out which day of the week the day after tomorrow is.
 * @returns {string} The day after tomorrow as a string.
 */
function getDayAfterTomorrow() {
  return dayToString((currentTime.getDay() + 2) % 7);
}

function applyDay(dayTarget) {
  if (dayTarget == "choice-today") {
    daySelection = 0;
    document.getElementById("target_day").innerText = "later today";
    setTodaysButtons(getTime());
    showTimesAlert();
  } else {
    daySelection = dayTarget == "choice-tomorrow" ? 1 : 2;
    document.getElementById("target_day").innerText =
      dayTarget == "choice-tomorrow" ? "tomorrow" : getDayAfterTomorrow();
    hideTimesAlert();
    setFutureDaysButtons();
    updateSolarTimes();
  }
  toggleDefaultTimes();
  updatePreferredTimeAndScore();
}

/**
 * Updates the page once the user selects the 'Today' button.
 */
function today() {
  document.getElementById("target_day").innerText = "later today";
  setTodaysButtons(getTime());
  toggleDefaultTimes();
  updatePreferredTimeAndScore();
}

/**
 * Updates the page once the user selects the 'Tomorrow' button.
 */
function tomorrow() {
  document.getElementById("target_day").innerText = "tomorrow";
  hideTimesAlert();
  setFutureDaysButtons();
  toggleDefaultTimes();
  updatePreferredTimeAndScore();
}

/**
 * Updates the page once the user selects the day-after-tomorrow button.
 */
function dayAfter() {
  document.getElementById("target_day").innerText = getDayAfterTomorrow();
  hideTimesAlert();
  setFutureDaysButtons();
  toggleDefaultTimes();
  updatePreferredTimeAndScore();
}

/**
 * Sets the time preference options to be the 24 hours of the day.
 */
function absoluteTimes() {
  document.getElementById("sun_hours").classList.add("d-none");
  document.getElementById("absolute_hours").classList.remove("d-none");
}

/**
 * Sets the time preference options to be the relative to the timing of the sun.
 */
function relativeTimes() {
  document.getElementById("absolute_hours").classList.add("d-none");
  document.getElementById("sun_hours").classList.remove("d-none");
}

/**
 * Sets the default times (weekday or weekend) once 'today' is selected.
 * @param {number} hour - The current hour of the day
 */
function setTodaysButtons(hour) {
  let s = 0;
  for (let i = 0; i < hour; i++) {
    absTimeButtons[i].setAttribute("disabled", "");
    absTimeButtons[i].checked = false;
  }

  for (let i = hour; i < 24; i++) {
    absTimeButtons[i].removeAttribute("disabled", "");
  }

  if (sunTimes == null) {
    return;
  }

  for (let s = 0; s < 8; s++) {
    if (solarDataObject.today.eventHourArray[s + 1] < hour) {
      solarTimeButtons[s].setAttribute("disabled", "");
      solarTimeButtons[s].checked = false;
    } else {
      solarTimeButtons[s].removeAttribute("disabled", "");
    }
  }
}

/**
 * Sets the default times (weekday or weekend) once a future day is selected.
 */
function setFutureDaysButtons() {
  for (let i = 0; i < 8; i++) {
    absTimeButtons[i].removeAttribute("disabled", "");
    solarTimeButtons[i].removeAttribute("disabled", "");
  }
  for (let i = 8; i < 24; i++) {
    absTimeButtons[i].removeAttribute("disabled", "");
  }
}

/**
 * Checks the default times for a weekday.
 */
function toggleDefaultWeekdayTimes() {
  let clockTimes = document.querySelectorAll(".clock");
  let solarTimes = document.querySelectorAll(".sun");
  clockTimes.forEach((element) => {
    element.checked =
      element.classList.contains("weekday") &&
      (daySelection || absTimeButtonIds.indexOf(element.id) >= getTime())
        ? true
        : false;
  });
  solarTimes.forEach((element) => {
    if (sunTimes == null) {
      element.checked = element.classList.contains("weekday");
    } else {
      element.checked =
        element.classList.contains("weekday") &&
        (daySelection ||
          sunTimes.allEventHours[daySelection][
            solarTimeButtonIds.indexOf(element.id) + 1
          ] >= getTime())
          ? true
          : false;
    }
  });
  showTimesAlert(true);
}

/**
 * Checks the default times for a weekend.
 */
function toggleDefaultWeekendTimes() {
  let clockTimes = document.querySelectorAll(".clock");
  let solarTimes = document.querySelectorAll(".sun");
  clockTimes.forEach((element) => {
    element.checked =
      element.classList.contains("weekend") &&
      (daySelection || absTimeButtonIds.indexOf(element.id) >= getTime())
        ? true
        : false;
  });
  solarTimes.forEach((element) => {
    if (sunTimes == null) {
      console.log("No solar data; no location entered.");
      element.checked = element.classList.contains("weekend");
    } else {
      element.checked =
        element.classList.contains("weekend") &&
        (daySelection ||
          sunTimes.allEventHours[daySelection][
            solarTimeButtonIds.indexOf(element.id) + 1
          ] >= getTime())
          ? true
          : false;
    }
  });
  showTimesAlert(false);
}

/**
 * Toggles the default times for the currently selected day.
 */
function toggleDefaultTimes() {
  switch ((currentTime.getDay() + daySelection) % 7) {
    case 0:
    case 6:
      toggleDefaultWeekendTimes();
      break;
    default:
      toggleDefaultWeekdayTimes();
  }
}

/**
 * Displays a warning alert if all default times have already passed today.
 * @param boolean isWeekday - Whether today is a weekday or not.
 */
function showTimesAlert(isWeekday) {
  let alertSpace = document.getElementById("times-alert-space");
  let hour = getTime();
  if (!daySelection && isWeekday && hour > 6 && hour <= 18) {
    alertSpace.innerHTML = `<div id="times-alert" class="alert alert-warning alert-dismissible fade show" role="alert">
                                Some of the default weekday times have already passed today.
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                </div>`;
  } else if (!daySelection && isWeekday && hour > 18) {
    console.log("No more default weekday times.");
    alertSpace.innerHTML = `<div id="times-alert" class="alert alert-warning alert-dismissible fade show" role="alert">
                                All of the default weekday times have already passed today.
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                </div>`;
  } else if (!daySelection && !isWeekday && hour > 8 && hour <= 18) {
    alertSpace.innerHTML = `<div id="times-alert" class="alert alert-warning alert-dismissible fade show" role="alert">
                                Some of the default weekend times have already passed today.
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                </div>`;
  } else if (!daySelection && !isWeekday && hour > 18) {
    alertSpace.innerHTML = `<div id="times-alert" class="alert alert-warning alert-dismissible fade show" role="alert">
                                All of the default weekend times have already passed today.
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                </div>`;
  }
}

/**
 * Hides any previously displayed alert about default times having passed.
 */
function hideTimesAlert() {
  let alertElement = document.getElementById("times-alert");
  if (alertElement) {
    alertElement.classList.remove("show");
    alertElement.classList.add("collapse");
    console.log("Should have hidden...");
  }
}

/**
 * Checks to see if any preferred times have been selected.
 * @returns {boolean} True if no preferred times are checked; otherwise false.
 */
function checkIfNoTimes() {
  if (document.getElementById("choice-absolute").checked) {
    for (let i = 0; i < 24; i++) {
      if (absTimeButtons[i].checked) {
        return false;
      }
    }
  } else {
    for (let i = 0; i < 8; i++) {
      if (solarTimeButtons[i].checked) {
        return false;
      }
    }
  }
  return true;
}

function updateSolarTimes() {
  if (sunTimes == null) {
    return;
  }
  for (let i = 0; i < 8; i++) {
    let currentSpan = document.getElementById(solarTimeInsertIds[i]);
    currentSpan.innerText = sunTimes.allEvents[daySelection][i];
  }
}

/**
 * Calculates the appropriate array index given the current hour
 * @param {number} hour - The current hour of the day
 * @param {number} day - How many days into the future
 * @returns {number} The corresponding index of the forecast data arrays
 */
function getArrayIndex(hour, day) {
  return day * 24 + hour;
}

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
 * Updates the best time (and score) within the user's checked times.
 */
function updatePreferredTimeAndScore() {
  if (checkIfNoTimes()) {
    preferenceText.innerHTML =
      "<em>Select times below to see your best preferred time.</em>";
    preferredScore.innerText = "";
  } else if (weatherForecast == null) {
    return;
  } else {
    let sliderValues = [
      temperatureSlider.value,
      dewPointSlider.value,
      cloudCoverSlider.value,
      uvSlider.value,
      precipitationIntensitySlider.value,
      windSpeedSlider.value,
    ];
    let userHours = new Array();
    if (document.getElementById("choice-absolute").checked) {
      const buttons = document.querySelectorAll(".clock");
      const checkedButtons = Array.from(buttons).filter(
        (button) => button.checked
      );
      checkedButtons.forEach((button) => {
        userHours.push(absTimeButtonIds.indexOf(button.id) + daySelection * 24);
      });
    } else {
      console.log("Will implement solar preferences shortly.");
    }
    // (Re)calcute score here
    // console.log(forecastConditions);
    let [overallBest, userBest] = findBestTime(
      sliderValues,
      [2.5, 0, 0, 0, 0, 0],
      weatherForecast.forecastGrid,
      daySelection,
      currentHour,
      userHours
    );

    bestTimeSpace.innerText = integerToTimeText(overallBest);
    preferenceText.innerHTML = `Within your preferred times, the best time is <span id="best_preferred_time"><strong>${integerToTimeText(
      userBest
    )}</strong></span>.`;
  }
}

/**
 * Converts degrees Fahrenheit to degrees Celsius.
 * @param {number} f - The temperature in degrees Fahrenheit
 * @returns {number} The temperature in degrees Celsius
 */
function fahrenheitToCelsius(degF) {
  return ((degF + 40) / 1.8 - 40).toFixed(1);
}

/**
 * Converts miles per hour to kilometers per hour.
 * @param {number} s - The speed in miles per hour
 * @returns {number} The speed in kilometers per hour
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
}

/**
 * Sets all units displayed to metric units.
 */
function metricUnits(degrees, speeds) {
  degrees.forEach((element) => {
    element.innerHTML = `&#8451;`;
  });

  speeds.forEach((element) => {
    element.innerText = " km/h";
  });
}

/**
 * Updates the temperature slider display.
 */
function displayTemp(text, slider, limit, isMetric) {
  text.innerText = isMetric
    ? fahrenheitToCelsius(parseFloat(slider.value))
    : slider.value;
  if (slider.value == 0) {
    limit.innerText = " and colder";
  } else if (slider.value == 100) {
    limit.innerText = " and hotter";
  } else {
    limit.innerText = "";
  }
}

/**
 * Updates the dew point slider display.
 */
function displayDewPoint(text, slider, limit, isMetric) {
  text.innerText = isMetric
    ? fahrenheitToCelsius(parseFloat(slider.value))
    : slider.value;
  if (slider.value == 40) {
    limit.innerText = " and drier";
  } else if (slider.value == 80) {
    limit.innerText = " and muggier";
  } else {
    limit.innerText = "";
  }
}

// function displayDewPoint(value, isMetric) {
//   return isMetric ? fahrenheitToCelsius(parseFloat(value)) : value;
// }

/**
 * Updates the cloud cover slider display.
 */
function printCloudCover(value) {
  switch (value) {
    case "0":
      return `Sunny &#9728;`;
    case "1":
      return `Partly Cloudy &#127780;`;
    case "2":
      return `Mostly Cloudy &#9925;`;
    case "3":
      return `Overcast &#9729;`;
    default:
      return ``;
  }
}

// NB - There is no function for updating the UV Index slider because
// scale starts at 0 and has no unit conversion necessary.

/**
 * Updates the precipitation intensity slider display.
 */
function printPrecipitationIntensity(value) {
  switch (value) {
    case "0":
      return "None";
    case "1":
      return "Light";
    case "2":
      return "Moderate";
    case "3":
      return "Heavy";
    default:
      return "";
  }
}

/**
 * Updates the wind speed slider display.
 */
function displayWindSpeed(text, slider, limit, isMetric) {
  text.innerText = isMetric ? mphToKmh(parseFloat(slider.value)) : slider.value;
  if (slider.value == 30) {
    limit.innerText = " and blustrier";
  } else {
    limit.innerText = "";
  }
}

// function displayWindSpeed(value, isMetric) {
//   return isMetric ? mphToKmh(parseFloat(value)) : value;
// }

// /**
//  * Updates the slider display values.
//  */
// function updateSliderDisplays(temp, dewPoint, windSpeed, isMetric) {
//   displayTemp(temp, isMetric);
//   displayDewPoint(dewPoint, isMetric);
//   displayWindSpeed(windSpeed, isMetric);
// }

export {
  daySelection,
  automaticLocation,
  getTime,
  getDayAfterTomorrow,
  applyDay,
  absoluteTimes,
  relativeTimes,
  setTodaysButtons,
  setFutureDaysButtons,
  toggleDefaultWeekdayTimes,
  toggleDefaultWeekendTimes,
  updateSolarTimes,
  getArrayIndex,
  updatePreferredTimeAndScore,
  imperialUnits,
  metricUnits,
  displayTemp,
  displayDewPoint,
  printCloudCover,
  printPrecipitationIntensity,
  displayWindSpeed,
};
