"use strict";

function findBestTime(
  preferencesArray,
  weightsArray,
  forecastMatrix,
  daySelection,
  currentHour,
  userTimes
) {
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
      let difference =
        Math.round(Math.abs(preferencesArray[j] - forecastMatrix[j][i]) * 10) /
        10;
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

  // let compositeScore = calculateCompositeScore(weightsArray, differenceArray);
  // console.log(compositeScore);

  return [overallBestTime, userBestTime];
}

// // Function to calculate the composite score
// function calculateCompositeScore(weightsArray, differenceArray) {
//   let totalWeight = weightsArray.reduce((acc, weight) => acc + weight, 0);
//   let compositeScore = 0;

//   for (let i = 0; i < differenceArray.length; i++) {
//     for (let j = 0; j < weightsArray.length; j++) {
//       compositeScore += weightsArray[j] * differenceArray[i][j];
//     }
//   }

//   // Normalize composite score to 0-100
//   let normalizedScore = (compositeScore / totalWeight) * 100;

//   return Math.round(normalizedScore * 10) / 10;
// }

export { findBestTime };
