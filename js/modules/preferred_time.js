"use strict";

function findBestTime(
  preferencesArray,
  weightsArray,
  forecastMatrix,
  daySelection,
  currentHour,
  userTimes
) {
  // console.log("Running findBestTime...");
  const weightsSum = weightsArray.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );
  console.log(weightsSum);
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

  // dev mode
  let scores = new Array(endPoint - startPoint);

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
    if (hourlyScore > bestOverallScore) {
      overallBestTime = i;
      bestOverallScore = Math.round(hourlyScore);
    }
    if (hourlyScore > bestUserScore && userTimes.includes(i)) {
      userBestTime = i;
      bestUserScore = Math.round(hourlyScore);
    }
  }
  console.log(differenceArray);
  console.log(scores);

  return [overallBestTime, bestOverallScore, userBestTime, bestUserScore];
}

export { findBestTime };
