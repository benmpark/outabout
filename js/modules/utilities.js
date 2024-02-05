"use strict";

import {
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
var daySelection;

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
function getTime(currentTime) {
  return currentTime.getHours();
}

// /**
//  * Calculates the day of the week. Used for adjusting default times.
//  * @returns {number} The day of the week (e.g., 1 for Monday)
//  */
// function whatDay(currentTime, daySelection) {
//   return (currentTime.getDay() + daySelection) % 7;
// }

/**
 * Figures out which day of the week the day after tomorrow is.
 * @returns {string} The day after tomorrow as a string.
 */
function getDayAfterTomorrow(currentTime) {
  return dayToString((currentTime.getDay() + 2) % 7);
}

/**
 * Updates the page once the user selects the 'Today' button.
 */
function today(
  currentTime,
  absButtons,
  solButtons,
  solarDataObject,
  forecastConditions
) {
  daySelection = 0;
  document.getElementById("target_day").innerText = "later today";
  setTodaysButtons(
    currentTime.getHours(),
    absButtons,
    solButtons,
    solarDataObject
  );
  toggleDefaultTimes(currentTime, daySelection, solarDataObject);
  updatePreferredTimeAndScore(absButtons, solButtons, forecastConditions);
}

/**
 * Updates the page once the user selects the 'Tomorrow' button.
 */
function tomorrow(
  currentTime,
  absButtons,
  solButtons,
  solarDataObject,
  forecastConditions
) {
  daySelection = 1;
  document.getElementById("target_day").innerText = "tomorrow";
  hideTimesAlert();
  setFutureDaysButtons(absButtons, solButtons);
  toggleDefaultTimes(currentTime, daySelection, solarDataObject);
  updatePreferredTimeAndScore(absButtons, solButtons, forecastConditions);
}

/**
 * Updates the page once the user selects the day-after-tomorrow button.
 */
function dayAfter(
  currentTime,
  absButtons,
  solButtons,
  solarDataObject,
  forecastConditions
) {
  daySelection = 2;
  document.getElementById("target_day").innerText =
    getDayAfterTomorrow(currentTime);
  hideTimesAlert();
  setFutureDaysButtons(absButtons, solButtons);
  toggleDefaultTimes(currentTime, daySelection, solarDataObject);
  updatePreferredTimeAndScore(absButtons, solButtons, forecastConditions);
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
function setTodaysButtons(hour, absButtons, solButtons, solarDataObject) {
  let s = 0;
  for (let i = 0; i < hour; i++) {
    absButtons[i].setAttribute("disabled", "");
    absButtons[i].checked = false;
  }

  for (let i = hour; i < 24; i++) {
    absButtons[i].removeAttribute("disabled", "");
  }

  if (solarDataObject == null) {
    return;
  }

  for (let s = 0; s < 8; s++) {
    if (solarDataObject.today.eventHourArray[s + 1] < hour) {
      solButtons[s].setAttribute("disabled", "");
      solButtons[s].checked = false;
    } else {
      solButtons[s].removeAttribute("disabled", "");
    }
  }
}

/**
 * Sets the default times (weekday or weekend) once a future day is selected.
 */
function setFutureDaysButtons(absButtons, solButtons) {
  for (let i = 0; i < 8; i++) {
    absButtons[i].removeAttribute("disabled", "");
    solButtons[i].removeAttribute("disabled", "");
  }
  for (let i = 8; i < 24; i++) {
    absButtons[i].removeAttribute("disabled", "");
  }
}

/**
 * Checks the default times for a weekday.
 */
function toggleDefaultWeekdayTimes(currentTime, daySelection, solarDataObject) {
  let clockTimes = document.querySelectorAll(".clock");
  let solarTimes = document.querySelectorAll(".sun");
  clockTimes.forEach((element) => {
    element.checked =
      element.classList.contains("weekday") &&
      (daySelection ||
        absTimeButtonIds.indexOf(element.id) >= getTime(currentTime))
        ? true
        : false;
  });
  solarTimes.forEach((element) => {
    if (solarDataObject == null) {
      element.checked = element.classList.contains("weekday");
    } else {
      element.checked =
        element.classList.contains("weekday") &&
        (daySelection ||
          solarDataObject.allEventHours[daySelection][
            solarTimeButtonIds.indexOf(element.id) + 1
          ] >= getTime(currentTime))
          ? true
          : false;
    }
  });
  showTimesAlert(currentTime, true);
}

/**
 * Checks the default times for a weekend.
 */
function toggleDefaultWeekendTimes(currentTime, daySelection, solarDataObject) {
  let clockTimes = document.querySelectorAll(".clock");
  let solarTimes = document.querySelectorAll(".sun");
  clockTimes.forEach((element) => {
    element.checked =
      element.classList.contains("weekend") &&
      (daySelection ||
        absTimeButtonIds.indexOf(element.id) >= getTime(currentTime))
        ? true
        : false;
  });
  solarTimes.forEach((element) => {
    if (solarDataObject == null) {
      console.log("No solar data; no location entered.");
      element.checked = element.classList.contains("weekend");
    } else {
      element.checked =
        element.classList.contains("weekend") &&
        (daySelection ||
          solarDataObject.allEventHours[daySelection][
            solarTimeButtonIds.indexOf(element.id) + 1
          ] >= getTime(currentTime))
          ? true
          : false;
    }
  });
  showTimesAlert(currentTime, false);
}

/**
 * Toggles the default times for the currently selected day.
 */
function toggleDefaultTimes(currentTime, daySelection, solarDataObject) {
  switch ((currentTime.getDay() + daySelection) % 7) {
    case 0:
    case 6:
      toggleDefaultWeekendTimes(currentTime, daySelection, solarDataObject);
      break;
    default:
      toggleDefaultWeekdayTimes(currentTime, daySelection, solarDataObject);
  }
}

/**
 * Displays a warning alert if all default times have already passed today.
 * @param boolean isWeekday - Whether today is a weekday or not.
 */
function showTimesAlert(currentTime, isWeekday) {
  let alertSpace = document.getElementById("times-alert-space");
  let hour = getTime(currentTime);
  if (!daySelection && isWeekday && hour > 6 && hour <= 18) {
    alertSpace.innerHTML = `<div id="times-alert" class="alert alert-warning alert-dismissible fade show" role="alert">
                                Some of the default weekday times have already passed today.
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                </div>`;
  } else if (!daySelection && isWeekday && hour > 18) {
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
  var alertElement = document.getElementById("times-alert");
  if (alertElement) {
    alertElement.classList.remove("show");
    alertElement.classList.add("collapse");
  }
}

/**
 * Checks to see if any preferred times have been selected.
 * @returns {boolean} True if no preferred times are checked; otherwise false.
 */
function checkIfNoTimes(absButtons, solButtons) {
  if (document.getElementById("choice-absolute").checked) {
    for (let i = 0; i < 24; i++) {
      if (absButtons[i].checked) {
        return false;
      }
    }
  } else {
    for (let i = 0; i < 8; i++) {
      if (solButtons[i].checked) {
        return false;
      }
    }
  }
  return true;
}

function updateSolarTimes(solarDataObject, daySelection) {
  if (solarDataObject == null) {
    return;
  }
  for (let i = 0; i < 8; i++) {
    let currentSpan = document.getElementById(solarTimeInsertIds[i]);
    currentSpan.innerText = solarDataObject.allEvents[daySelection][i];
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

function integerToTimeText(n, daySelection) {
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
function updatePreferredTimeAndScore(
  absButtons,
  solButtons,
  forecastConditions
) {
  if (checkIfNoTimes(absButtons, solButtons)) {
    preferenceText.innerHTML =
      "<em>Select times below to see your best preferred time.</em>";
    preferredScore.innerText = "";
  } else if (forecastConditions == null) {
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
      [2.5, 2, 1.5, 1, 3, 1],
      forecastConditions,
      daySelection,
      currentHour,
      userHours
    );

    bestTimeSpace.innerText = integerToTimeText(overallBest, daySelection);
    preferenceText.innerHTML = `Within your preferred times, the best time is <span id="best_preferred_time"><strong>${integerToTimeText(
      userBest,
      daySelection
    )}</strong></span>.`;
  }
}

/**
 * Converts degrees Fahrenheit to degrees Celsius.
 * @param {number} f - The temperature in degrees Fahrenheit
 * @returns {number} The temperature in degrees Celsius
 */
function fahrenheitToCelsius(f) {
  return ((f + 40) / 1.8 - 40).toFixed(1);
}

/**
 * Converts miles per hour to kilometers per hour.
 * @param {number} s - The speed in miles per hour
 * @returns {number} The speed in kilometers per hour
 */
function mphToKmh(s) {
  return (s * 1.60934).toFixed(1);
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
  automaticLocation,
  getTime,
  getDayAfterTomorrow,
  today,
  tomorrow,
  dayAfter,
  absoluteTimes,
  relativeTimes,
  setTodaysButtons,
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
