"use strict";

function findBestTime(
  preferencesArray,
  weightsArray,
  forecastMatrix,
  daySelection,
  currentHour,
  userTimes
) {
  console.log(weightsArray);
  // console.log("User Times:", userTimes);
  // console.log("Forecast data:", forecastMatrix);
  // console.log("Day:", daySelection);
  let startPoint = daySelection ? daySelection * 24 : currentHour;
  let endPoint = daySelection ? startPoint + 24 : 24;

  let differenceArray = new Array(endPoint - startPoint);
  for (let i = 0; i < differenceArray.length; i++) {
    differenceArray[i] = new Array(weightsArray.length);
  }

  let overallBestTime;
  let userBestTime;
  let lowestOverallScore = Infinity;
  let lowestUserScore = Infinity;

  for (let i = startPoint; i < endPoint; i++) {
    let hourlyScore = 0;
    for (let j = 0; j < weightsArray.length; j++) {
      // console.log(preferencesArray[j], forecastMatrix[j][i]);
      let difference =
        Math.round(Math.abs(preferencesArray[j] - forecastMatrix[j][i]) * 10) /
        10;
      // console.log(difference);
      differenceArray[i - startPoint][j] = difference;
      hourlyScore += weightsArray[j] * difference;
    }
    if (hourlyScore < lowestOverallScore) {
      lowestOverallScore = Math.round(hourlyScore * 10) / 10;
      overallBestTime = i;
    }
    if (hourlyScore < lowestUserScore && userTimes.includes(i)) {
      lowestUserScore = Math.round(hourlyScore * 10) / 10;
      userBestTime = i;
    }
  }
  // console.log(differenceArray);
  // console.log(overallBestTime, userBestTime);
  return [overallBestTime, userBestTime];
}

export { findBestTime };

// const userTimes = [32, 33, 34, 35];

// const weightsArray = [2.5, 2, 1.5, 1, 3, 1];

// let samplePreferences = [65, 55, 25, 2, 0, 5];

let sampleForecast = [
  [
    31.9, 32.2, 32.3, 32.3, 32.5, 32.6, 32.4, 32.8, 33.3, 35.0, 36.3, 37.1,
    37.4, 40.1, 40.8, 40.6, 39.3, 38.3, 38.0, 36.6, 35.8, 35.8, 36.0, 36.1,
    36.0, 36.2, 36.3, 36.2, 35.9, 35.5, 35.0, 34.7, 35.8, 37.9, 39.5, 40.9,
    41.8, 42.3, 41.2, 40.2, 39.1, 38.3, 37.6, 36.7, 36.3, 36.3, 34.4, 34.0,
    32.8, 31.9, 31.5, 31.6, 31.4, 31.3, 30.9, 30.6, 30.2, 30.1, 30.3, 30.8,
    31.6, 33.0, 34.5, 34.9, 34.9, 33.9, 33.0, 32.2, 31.7, 31.4, 30.8, 30.4,
  ],
  [
    29.0, 29.1, 29.7, 30.0, 30.2, 30.5, 30.3, 29.6, 30.1, 31.5, 32.5, 33.3,
    33.9, 31.8, 33.5, 34.9, 36.1, 35.9, 35.6, 34.0, 33.5, 34.0, 33.9, 34.3,
    34.2, 34.4, 34.7, 34.6, 34.4, 34.0, 33.2, 33.5, 34.8, 35.2, 35.7, 36.4,
    37.3, 37.5, 36.8, 35.8, 35.9, 35.7, 35.5, 35.2, 34.7, 33.9, 33.9, 30.8,
    28.7, 27.9, 26.9, 26.7, 26.8, 26.5, 26.0, 25.8, 25.7, 25.6, 25.2, 25.0,
    25.5, 26.3, 17.8, 17.7, 18.1, 19.0, 20.2, 20.6, 19.7, 18.3, 17.8, 16.6,
  ],
  [
    40, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
    100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
    100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
    100, 100, 100, 100, 47, 17, 100, 100, 100, 100, 100, 100, 100, 100, 100, 66,
    100, 100, 86, 98, 91, 56, 82, 73, 7, 7, 5,
  ],
  [
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.15, 0.75, 1.6, 2.25, 2.75, 2.6,
    1.65, 0.85, 0.3, 0.05, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0, 0.2, 0.75, 1.55, 2.25, 2.9, 2.9, 2.1, 1.45, 0.75, 0.1,
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2,
    0.95, 1.65, 2.5, 2.75, 2.4, 2.3, 1.75, 0.8, 0.2, 0.0, 0.0, 0.0, 0.0, 0.0,
    0.0,
  ],
  [
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
    0.0, 0.071, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
  ],
  [
    4.3, 2.6, 3.0, 3.5, 3.7, 4.0, 4.3, 3.1, 5.2, 7.8, 8.0, 9.3, 8.0, 7.8, 5.8,
    3.2, 2.9, 3.5, 3.8, 3.8, 3.6, 3.4, 3.4, 3.7, 3.6, 4.2, 4.4, 3.7, 3.8, 3.0,
    3.5, 3.3, 3.4, 5.5, 7.0, 6.2, 5.6, 5.6, 6.8, 6.9, 4.9, 5.7, 7.2, 5.6, 4.9,
    6.7, 8.3, 10.0, 9.6, 8.1, 8.9, 9.6, 10.7, 11.3, 11.5, 11.7, 11.9, 11.8,
    11.7, 12.7, 12.5, 12.2, 12.5, 12.4, 11.3, 10.7, 10.5, 11.6, 12.5, 13.1,
    13.3, 12.9,
  ],
];

// findBestTime(samplePreferences, weightsArray, sampleForecast, 1, 6, userTimes);
