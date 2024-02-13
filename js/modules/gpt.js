function calculateScore(forecast, userPreferences) {
  // User preferences (you might want to get these as function parameters)
  const {
    temperatureWeight,
    dewPointWeight,
    precipitationWeight,
    windSpeedWeight,
  } = userPreferences;

  // Forecast data (you might want to get these as function parameters)
  const { temperature, dewPoint, precipitation, windSpeed } = forecast;

  // Calculate the score based on user preferences
  const temperatureScore =
    temperatureWeight * Math.abs(userPreferences.temperature - temperature);
  const dewPointScore =
    dewPointWeight * Math.abs(userPreferences.dewPoint - dewPoint);
  const precipitationScore =
    precipitationWeight *
    Math.abs(userPreferences.precipitation - precipitation);
  const windSpeedScore =
    windSpeedWeight * Math.abs(userPreferences.windSpeed - windSpeed);

  // Sum up the scores
  const totalScore =
    temperatureScore + dewPointScore + precipitationScore + windSpeedScore;

  return totalScore;
}

function findBestTimeForPreferences(forecastData, userPreferences) {
  let bestTime = null;
  let lowestScore = Infinity;

  // Loop through the forecast data
  for (const time of forecastData) {
    // Calculate the score for each time
    const score = calculateScore(time, userPreferences);
    console.log(score);

    // Update the best time if the current score is lower
    if (score < lowestScore) {
      lowestScore = score;
      bestTime = time;
    }
  }

  return bestTime;
}

// Example usage
const userPreferences = {
  temperature: 75,
  dewPoint: 60,
  precipitation: 0.1,
  windSpeed: 10,
  temperatureWeight: 2,
  dewPointWeight: 1.5,
  precipitationWeight: 3,
  windSpeedWeight: 1,
};

const forecastData = [
  {
    time: "12:00 PM",
    temperature: 74,
    dewPoint: 58,
    precipitation: 0.0,
    windSpeed: 8,
  },
  {
    time: "3:00 PM",
    temperature: 76,
    dewPoint: 62,
    precipitation: 0.2,
    windSpeed: 12,
  },
  // Add more forecast data as needed
];

const bestTime = findBestTimeForPreferences(forecastData, userPreferences);
console.log("Best time for preferences:", bestTime);
