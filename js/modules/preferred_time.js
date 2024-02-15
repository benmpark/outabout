"use strict";

import {
  currentHour,
  temperatureSlider,
  dewPointSlider,
  cloudCoverSlider,
  uvSlider,
  windSpeedSlider,
  precipitationIntensitySlider,
  parameterIncludeArray,
  weightsArray,
  noPrecipToggle,
  isMetric,
  sunTimes,
  weatherForecast,
} from "../custom_script.js";

import {
  absTimeButtonIds,
  solarTimeButtonIds,
  checkIfNoTimes,
} from "./time_preferences.js";

import {
  daySelection,
  getDayAfterTomorrow,
  integerToTimeText,
} from "./utilities.js";

import {
  checkIfNoParameters,
  displayForecastData,
} from "./weather_preferences.js";

// MODULE VARIABLES
const bestScore = document.getElementById("best_score");
const bestForecast = document.getElementById("best-time-forecast");
const preferenceText = document.getElementById("preferred-time-text");
const preferredScore = document.getElementById("best_preferred_score");
const preferredForecast = document.getElementById("preferred-time-forecast");

/**
 * Finds the best overall and preferred times to get outside for given preferences.
 * @param {number[]} preferencesArray - array of values from the preferences sliders
 * @param {number[]} weightsArray - array of values from the relative weight dropdowns
 * @param {boolean} noPrecip - toggle for whether to exclude any times with precip.
 * @param {number[][]} forecastMatrix - array of arrays with forecast data
 * @param {number} daySelection - the current day selection (0, 1, or 2)
 * @param {number} currentHour - the current hour of the day (0 to 23, inclusive)
 * @param {number[]} userTimes - an array of times selected by the user for the given day
 * @returns {number[]} - the overall best time and score, and the best preferred time and score
 */
function findBestTime(
  preferencesArray,
  weightsArray,
  noPrecip,
  forecastMatrix,
  daySelection,
  currentHour,
  userTimes
) {
  const weightsSum = weightsArray.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );
  const categoryAdjustments = [1, 0.667, 0.4, 4, 2, 133.333, 0.667];
  const startPoint = daySelection ? daySelection * 24 : currentHour;
  const endPoint = daySelection ? startPoint + 24 : 24;

  let differenceArray = new Array(endPoint - startPoint);
  for (let i = 0; i < differenceArray.length; i++) {
    differenceArray[i] = new Array(weightsArray.length);
  }

  let overallBestTime;
  let userBestTime;
  let bestOverallScore = -Infinity;
  let bestUserScore = -Infinity;

  let scores = new Array(endPoint - startPoint); // for developing

  for (let i = startPoint; i < endPoint; i++) {
    let rawScore = 0;
    let hourlyScore;
    for (let j = 0; j < weightsArray.length; j++) {
      let difference =
        Math.round(Math.abs(preferencesArray[j] - forecastMatrix[j][i]) * 10) /
        10;
      differenceArray[i - startPoint][j] = difference;
      rawScore += weightsArray[j] * categoryAdjustments[j] * difference;
      hourlyScore = 100 - rawScore / weightsSum;
    }
    scores[i - startPoint] = hourlyScore;

    if (
      hourlyScore > bestOverallScore &&
      (!noPrecip || forecastMatrix[5][i] == 0)
    ) {
      overallBestTime = i;
      bestOverallScore = Math.round(hourlyScore);
    }
    if (
      hourlyScore > bestUserScore &&
      userTimes.includes(i) &&
      (!noPrecip || forecastMatrix[5][i] == 0)
    ) {
      userBestTime = i;
      bestUserScore = Math.round(hourlyScore);
    }
  }
  //   console.log(differenceArray);
  //   console.log(scores);

  return [overallBestTime, bestOverallScore, userBestTime, bestUserScore];
}

/**
 * Updates the best time (and score) within the user's checked times.
 */
function updatePreferredTimeAndScore() {
  // First check to make sure at least one weather parameter has been set.
  if (checkIfNoParameters()) {
    preferenceText.innerHTML =
      "<em>You must have at least one weather parameter selected.</em>";
    preferredScore.innerText = "";
    return;
    // Then check to make sure a location has been specified.
  } else if (weatherForecast == null) {
    preferenceText.innerHTML = "<em>Enter a location to get a forecast.</em>";
    preferredScore.innerText = "";
    return;
    // Otherwise, run the actual function.
  } else {
    // Get the user's preferred conditions from the slider values.
    let sliderValues = [
      temperatureSlider.value,
      dewPointSlider.value,
      cloudCoverSlider.value,
      uvSlider.value,
      windSpeedSlider.value,
      precipitationIntensitySlider.value,
    ];

    // See which times are preferred by the user
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

    // Calculate the score here
    // See how the user has weighted the various parameters
    let selectWeights = new Array(6);
    for (let i = 0; i < 6; i++) {
      selectWeights[i] = parameterIncludeArray[i] * weightsArray[i];
    }
    // Run the algorithm that finds the best overall and preferred times
    let [overallBest, overallScore, userBest, userScore] = findBestTime(
      sliderValues,
      selectWeights,
      noPrecipToggle.checked,
      weatherForecast.forecastGrid,
      daySelection,
      currentHour,
      userHours
    );

    // Update the components of the page accordingly.
    let targetDay;
    switch (daySelection) {
      case 0:
        targetDay = "later today";
        break;
      case 1:
        targetDay = "tomorrow";
        break;
      case 2:
        targetDay = getDayAfterTomorrow();
        break;
      default:
        targetDay = "N/A";
    }

    // Handle cases where the user specified no times with precipitation
    if (overallBest == null) {
      document.getElementById(
        "best-time-text"
      ).innerHTML = `<em>There are no times available ${targetDay} with no precipitation forecast.</em>`;
      bestScore.innerText = "";
      bestForecast.innerHTML = "";
    } else {
      document.getElementById(
        "best-time-text"
      ).innerHTML = `The best time to get outside <span id="target_day">${targetDay}</span> is <strong>${integerToTimeText(
        overallBest
      )}</strong>.`;
      bestScore.innerText = overallScore;
      bestForecast.innerHTML = displayForecastData(
        weatherForecast,
        overallBest,
        isMetric
      );
    }
    // For the best preferred time, also check to ensure that at least one time
    // has been selected by the user.
    if (userBest == null) {
      preferenceText.innerHTML = checkIfNoTimes()
        ? "<em>Select times below to see your best preferred time.</em>"
        : "<em>There are no times available with no precipitation forecast.</em>";
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

export { updatePreferredTimeAndScore };
