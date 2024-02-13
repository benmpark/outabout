"use strict";

import {
  currentTime,
  sunTimes,
  weatherForecast,
  userAbsSelections,
  userSolarSelections,
  absTimeButtons,
  solarTimeButtons,
  defaultWeekdayTimes,
  defaultWeekendTimes,
  currentHour,
  processUserLocation,
  temperatureSlider,
  dewPointSlider,
  cloudCoverSlider,
  uvSlider,
  precipitationIntensitySlider,
  windSpeedSlider,
  parameterIncludeArray,
  weightsArray,
  isMetric,
  localConditions,
} from "../custom_script.js";
import { findBestTime } from "./preferred_time.js";

// MODULE VARIABLES
let daySelection;

let bestTimeSpace = document.getElementById("best-time");
let bestScore = document.getElementById("best_score");
let bestForecast = document.getElementById("best-time-forecast");
let preferenceText = document.getElementById("preferred-time-text");
let preferredScore = document.getElementById("best_preferred_score");
let preferredForecast = document.getElementById("preferred-time-forecast");

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
 * Determines if a day is a weekday.
 * @param {number} day - The numerical day of the week
 * @returns {boolean} true if Monday-Friday else false
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

// /**
//  * Updates the page once the user selects the 'Today' button.
//  */
// function today() {
//   document.getElementById("target_day").innerText = "later today";
//   setTodaysButtons(getTime());
//   toggleDefaultTimes();
//   updatePreferredTimeAndScore();
// }

// /**
//  * Updates the page once the user selects the 'Tomorrow' button.
//  */
// function tomorrow() {
//   document.getElementById("target_day").innerText = "tomorrow";
//   hideTimesAlert();
//   setFutureDaysButtons();
//   toggleDefaultTimes();
//   updatePreferredTimeAndScore();
// }

// /**
//  * Updates the page once the user selects the day-after-tomorrow button.
//  */
// function dayAfter() {
//   document.getElementById("target_day").innerText = getDayAfterTomorrow();
//   hideTimesAlert();
//   setFutureDaysButtons();
//   toggleDefaultTimes();
//   updatePreferredTimeAndScore();
// }

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
    if (sunTimes.today.eventHourArray[s + 1] < hour) {
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

// /**
//  * Checks the default times for a weekday.
//  */
// function toggleDefaultWeekdayTimes() {
//   document.getElementById("default-weekday").classList.add("checked");
//   document.getElementById("default-weekend").classList.remove("checked");
//   const clockTimes = document.querySelectorAll(".clock");
//   const solarTimes = document.querySelectorAll(".sun");
//   clockTimes.forEach((element) => {
//     element.checked =
//       element.classList.contains("weekday") &&
//       (daySelection || absTimeButtonIds.indexOf(element.id) >= getTime())
//         ? true
//         : false;
//   });
//   solarTimes.forEach((element) => {
//     if (sunTimes == null) {
//       element.checked = element.classList.contains("weekday");
//     } else {
//       element.checked =
//         element.classList.contains("weekday") &&
//         (daySelection ||
//           sunTimes.allEventHours[daySelection][
//             solarTimeButtonIds.indexOf(element.id) + 1
//           ] >= getTime())
//           ? true
//           : false;
//     }
//   });
//   showTimesAlert(true);
// }

/**
 * Checks the default times for a weekday.
 */
function toggleDefaultWeekdayTimes() {
  if (document.getElementById("choice-absolute").checked) {
    userAbsSelections[daySelection] = [6, 7, 8, 17, 18];
  } else {
    userSolarSelections[daySelection] = [1, 2, 5, 6];
  }
  showTimesAlert(false);
}

/**
 * Checks the default times for a weekend.
 */
function toggleDefaultWeekendTimes() {
  if (document.getElementById("choice-absolute").checked) {
    userAbsSelections[daySelection] = [
      8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
    ];
  } else {
    userSolarSelections[daySelection] = [2, 3, 4, 5];
  }
  showTimesAlert(false);
}

function checkIfDefaultTimes() {
  let isAbsolute = document.getElementById("choice-absolute").checked;
  if (isAbsolute) {
    if (
      userAbsSelections[daySelection].length == 5 &&
      userAbsSelections[daySelection].every(
        (value, index) => value === [6, 7, 8, 17, 18][index]
      )
    ) {
      defaultWeekdayTimes.classList.add("checked");
      defaultWeekendTimes.classList.remove("checked");
    } else if (
      userAbsSelections[daySelection].length == 11 &&
      userAbsSelections[daySelection].every(
        (value, index) =>
          value === [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18][index]
      )
    ) {
      defaultWeekendTimes.classList.add("checked");
      defaultWeekdayTimes.classList.remove("checked");
    } else {
      defaultWeekdayTimes.classList.remove("checked");
      defaultWeekendTimes.classList.remove("checked");
    }
  } else {
    if (
      userSolarSelections[daySelection].length == 4 &&
      userSolarSelections[daySelection].every(
        (value, index) => value === [1, 2, 5, 6][index]
      )
    ) {
      defaultWeekdayTimes.classList.add("checked");
      defaultWeekendTimes.classList.remove("checked");
    } else if (
      userSolarSelections[daySelection].length == 4 &&
      userSolarSelections[daySelection].every(
        (value, index) => value === [2, 3, 4, 5][index]
      )
    ) {
      defaultWeekendTimes.classList.add("checked");
      defaultWeekdayTimes.classList.remove("checked");
    } else {
      defaultWeekdayTimes.classList.remove("checked");
      defaultWeekendTimes.classList.remove("checked");
    }
  }
}

function toggleTimes() {
  const clockTimes = document.querySelectorAll(".clock");
  const solarTimes = document.querySelectorAll(".sun");
  clockTimes.forEach((element) => {
    element.checked =
      userAbsSelections[daySelection].includes(
        absTimeButtonIds.indexOf(element.id)
      ) &&
      (daySelection || absTimeButtonIds.indexOf(element.id) >= getTime())
        ? true
        : false;
  });
  solarTimes.forEach((element) => {
    if (sunTimes == null) {
      element.checked = userSolarSelections[daySelection].includes(
        solarTimeButtonIds.indexOf(element.id)
      );
    } else {
      element.checked =
        userSolarSelections[daySelection].includes(
          solarTimeButtonIds.indexOf(element.id)
        ) &&
        (daySelection ||
          sunTimes.allEventHours[daySelection][
            solarTimeButtonIds.indexOf(element.id) + 1
          ] >= getTime())
          ? true
          : false;
    }
  });
}

// /**
//  * Toggles the default times for the currently selected day.
//  */
// function toggleDefaultTimes() {
//   switch ((currentTime.getDay() + daySelection) % 7) {
//     case 0:
//     case 6:
//       toggleDefaultWeekendTimes();
//       break;
//     default:
//       toggleDefaultWeekdayTimes();
//   }
// }

/**
 * Displays a warning alert if all default times have already passed today.
 * @param boolean isWeekday - Whether today is a weekday or not.
 */
function showTimesAlert(isWeekday) {
  const alertSpace = document.getElementById("times-alert-space");
  let hour = getTime();
  let allSome;
  let dayType;
  if (daySelection || (isWeekday && hour <= 6) || (!isWeekday && hour <= 8)) {
    alertSpace.innerHTML = ``;
    return;
  }
  if (!daySelection && isWeekday && hour > 6 && hour <= 18) {
    allSome = "Some";
    dayType = "weekday";
  } else if (!daySelection && isWeekday && hour > 18) {
    allSome = "All";
    dayType = "weekday";
  } else if (!daySelection && !isWeekday && hour > 8 && hour <= 18) {
    allSome = "Some";
    dayType = "weekend";
  } else if (!daySelection && !isWeekday && hour > 18) {
    allSome = "All";
    dayType = "weekend";
  } else {
    console.log("Somethign weird happened...");
  }
  alertSpace.innerHTML = `<div id="times-alert" class="alert alert-warning alert-dismissible fade show" 
    role="alert">${allSome} of the default ${dayType} times have already passed today.<button type="button" 
    class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
}

/**
 * Hides any previously displayed alert about default times having passed.
 */
function hideTimesAlert() {
  let alertElement = document.getElementById("times-alert");
  if (alertElement) {
    alertElement.classList.remove("show");
    alertElement.classList.add("collapse");
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

function checkIfNoParameters() {
  for (let i = 0; i < 6; i++) {
    if (parameterIncludeArray[i] == 1) {
      return false;
    }
  }
  return true;
}

function displayForecastData(forecast, hour, isMetric) {
  let temp = Math.round(forecast.hourlyTemps[hour]);
  let dewPoint = Math.round(forecast.hourlyDewPoints[hour]);
  let cloudCover = forecast.hourlyCloudCover[hour];
  let uv = Math.round(forecast.hourlyUV[hour]);
  let precip = forecast.hourlyPrecip[hour];
  let windSpeed = forecast.hourlyWind[hour];
  if (isMetric) {
    temp = fahrenheitToCelsius(temp);
    dewPoint = fahrenheitToCelsius(dewPoint);
    precip = inchesToMillimeters(precip);
    windSpeed = mphToKmh(windSpeed);
  }
  let units = isMetric
    ? [`&#8451;`, ` mm/hr`, `km/h`]
    : [`&#8457;`, `"/hr`, `mph`];
  let outputHTML = `<strong>Forecast:</strong> ${temp}${units[0]} (Dew Point ${dewPoint}${units[0]}), Cloud Cover ${cloudCover}&percnt;, UV Index ${uv}, Precipitation ${precip}${units[1]}, Wind Speed ${windSpeed} ${units[2]}`;
  return outputHTML;
}

/**
 * Updates the displayed current conditions.
 */
function updateCurrentConditions() {
  const currentTemp = document.getElementById("current-condition-temp");
  const currentApparent = document.getElementById(
    "current-condition-dew-point"
  );
  if (currentTemp != null) {
    if (isMetric) {
      currentTemp.innerHTML = `${
        Math.round(fahrenheitToCelsius(localConditions.currentTemp) * 10) / 10
      }&#8451;`;
      currentApparent.innerHTML = `${
        Math.round(fahrenheitToCelsius(localConditions.apparentTemp) * 10) / 10
      }&#8451;`;
    } else {
      currentTemp.innerHTML = `${Math.round(
        localConditions.currentTemp
      )}&#8457;`;
      currentApparent.innerHTML = `${Math.round(
        localConditions.apparentTemp
      )}&#8457;`;
    }
  }
}

function getCheckedTimeButtons(isAbsolute) {
  let activeClass = isAbsolute ? ".clock" : ".sun";
  let hoursSelected = [];
  const buttons = document.querySelectorAll(activeClass);
  const checkedButtons = Array.from(buttons).filter((button) => button.checked);
  checkedButtons.forEach((button) => {
    if (isAbsolute) {
      hoursSelected.push(absTimeButtonIds.indexOf(button.id));
    } else {
      hoursSelected.push(solarTimeButtonIds.indexOf(button.id));
    }
  });
  if (isAbsolute) {
    userAbsSelections[daySelection] = hoursSelected;
  } else {
    userSolarSelections[daySelection] = hoursSelected;
  }
}

/**
 * Updates the best time (and score) within the user's checked times.
 */
function updatePreferredTimeAndScore() {
  if (checkIfNoParameters()) {
    preferenceText.innerHTML =
      "<em>You must have at least one weather parameter selected.</em>";
    preferredScore.innerText = "";
    return;
  } else if (weatherForecast == null) {
    preferenceText.innerHTML = "<em>Enter a location to get a forecast.</em>";
    preferredScore.innerText = "";
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
      const buttons = document.querySelectorAll(".sun");
      const checkedButtons = Array.from(buttons).filter(
        (button) => button.checked
      );
      checkedButtons.forEach((button) => {
        let startIndex = solarTimeButtonIds.indexOf(button.id);
        let startHour = sunTimes.allEventHours[daySelection][startIndex];
        let endHour = sunTimes.allEventHours[daySelection][startIndex + 1];
        if (startHour == endHour) {
          userHours.push(startHour + 24 * daySelection);
        } else {
          for (let i = startHour; i < endHour; i++) {
            userHours.push(i + 24 * daySelection);
          }
        }
      });
    }
    // (Re)calcute score here
    let selectWeights = new Array(6);
    for (let i = 0; i < 6; i++) {
      selectWeights[i] = parameterIncludeArray[i] * weightsArray[i];
    }
    let [overallBest, overallScore, userBest, userScore] = findBestTime(
      sliderValues,
      selectWeights,
      weatherForecast.forecastGrid,
      daySelection,
      currentHour,
      userHours
    );

    bestTimeSpace.innerText = integerToTimeText(overallBest);
    bestScore.innerText = overallScore;
    bestForecast.innerHTML = displayForecastData(
      weatherForecast,
      overallBest,
      isMetric
    );
    if (userBest == null) {
      preferenceText.innerHTML =
        "<em>Select times below to see your best preferred time.</em>";
      preferredScore.innerText = "";
      preferredForecast.innerHTML = ``;
      return;
    } else {
      preferenceText.innerHTML = `Within your preferred times, the best time is <span id="best_preferred_time"><strong>${integerToTimeText(
        userBest
      )}</strong></span>.`;
      preferredScore.innerText = userScore;
      preferredForecast.innerHTML = displayForecastData(
        weatherForecast,
        userBest,
        isMetric
      );
    }
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
 * Converts inches to millimeters.
 * @param {number} f - The measurement in inches
 * @returns {number} The measurement in millimeters
 */
function inchesToMillimeters(inches) {
  return Math.round(inches * 25.4);
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
    limit.innerHTML = `&nbsp;and colder&nbsp;&#129482;`;
  } else if (slider.value <= 32) {
    limit.innerHTML = `&nbsp;&#129398;`;
  } else if (slider.value < 50) {
    limit.innerHTML = `&nbsp;&#128556;`;
  } else if (slider.value < 60) {
    limit.innerHTML = `&nbsp;&#128578;`;
  } else if (slider.value < 80) {
    limit.innerHTML = `&nbsp;&#128512;`;
  } else if (slider.value < 100) {
    limit.innerHTML = `&nbsp;&#129397;`;
  } else if (slider.value == 100) {
    limit.innerHTML = `&nbsp;and hotter&nbsp;&#129760;`;
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
    limit.innerHTML = `&nbsp;and drier&nbsp;&#127964;`;
  } else if (slider.value < 50) {
    limit.innerHTML = `&nbsp;&#127964;`;
  } else if (slider.value < 65) {
    limit.innerHTML = `&nbsp;&#128578;`;
  } else if (slider.value < 75) {
    limit.innerHTML = `&nbsp;&#129494;`;
  } else if (slider.value < 80) {
    limit.innerHTML = `&nbsp;&#128548;`;
  } else if (slider.value == 80) {
    limit.innerHTML = `&nbsp;and muggier&nbsp;&#128548;`;
  } else {
    limit.innerText = "";
  }
}

/**
 * Updates the cloud cover slider display.
 */
function printCloudCover(value) {
  if (Number(value) < 10) {
    return `${value}&percnt;&nbsp;&nbsp;&#9728;`;
  } else if (Number(value) < 40) {
    return `${value}&percnt;&nbsp;&nbsp;&#127780;`;
  } else if (Number(value) < 70) {
    return `${value}&percnt;&nbsp;&nbsp;&#9925;`;
  } else if (Number(value) <= 100) {
    return `${value}&percnt;&nbsp;&nbsp;&#9729;`;
  } else {
    return ``;
  }
}

function colorUvValue(span, value) {
  switch (value) {
    case "0":
      span.style.setProperty("color", "black");
      break;
    case "1":
      span.style.setProperty("color", "#42da24");
      break;
    case "2":
      span.style.setProperty("color", "#42da24");
      break;
    case "3":
      span.style.setProperty("color", "#d5c321");
      break;
    case "4":
      span.style.setProperty("color", "#d39420");
      break;
    case "5":
      span.style.setProperty("color", "#d16b1f");
      break;
    case "6":
      span.style.setProperty("color", "#cc4721");
      break;
    case "7":
      span.style.setProperty("color", "#cc4721");
      break;
    case "8":
      span.style.setProperty("color", "#bc061e");
      break;
  }
}

/**
 * Updates the precipitation intensity slider display.
 */
function printPrecipitationIntensity(value) {
  if (Number(value) == 0) {
    return "None";
  } else if (Number(value) < 0.1) {
    return `${value}"/hour <span style="font-weight: 200;">(light)</span>`;
  } else if (Number(value) < 0.3) {
    return `${value}"/hr <span style="font-weight: 200;">(moderate)</span>`;
  } else if (Number(value) == 0.3) {
    return `${value}"/hour+ <span style="font-weight: 200;">(heavy)</span>`;
  } else {
    return ``;
  }
}

/**
 * Updates the wind speed slider display.
 */
function displayWindSpeed(text, slider, limit, isMetric) {
  text.innerText = isMetric ? mphToKmh(parseFloat(slider.value)) : slider.value;
  if (slider.value == 0) {
    limit.innerHTML = ``;
  } else if (slider.value > 0 && slider.value <= 10) {
    limit.innerHTML = `&nbsp;&#127811;`;
  } else if (slider.value <= 20) {
    limit.innerHTML = `&nbsp;&#127788;`;
  } else if (slider.value < 30) {
    limit.innerHTML = `&nbsp;&#128168;`;
  } else if (slider.value == 30) {
    limit.innerHTML = `&nbsp;and blustrier&nbsp;&#128168;`;
  } else {
    limit.innerHTML = ``;
  }
}

export {
  daySelection,
  automaticLocation,
  isWeekday,
  getTime,
  getDayAfterTomorrow,
  applyDay,
  absoluteTimes,
  relativeTimes,
  setTodaysButtons,
  setFutureDaysButtons,
  toggleDefaultWeekdayTimes,
  toggleDefaultWeekendTimes,
  checkIfDefaultTimes,
  toggleTimes,
  updateSolarTimes,
  getArrayIndex,
  updateCurrentConditions,
  getCheckedTimeButtons,
  updatePreferredTimeAndScore,
  imperialUnits,
  metricUnits,
  displayTemp,
  displayDewPoint,
  printCloudCover,
  colorUvValue,
  printPrecipitationIntensity,
  displayWindSpeed,
};
