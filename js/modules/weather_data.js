class CurrentConditions {
  constructor(currentTemp, apparentTemp, isDaytime, pop) {
    this.currentTemp = currentTemp;
    this.apparentTemp = apparentTemp;
    this.isDaytime = isDaytime;
    this.pop = pop;
    this.displayHTML = `Currently <span id="current-condition-temp">${this.currentTemp.toFixed(
      0
    )}&#8457;</span> (feels like <span id="current-condition-dew-point">${this.apparentTemp.toFixed(
      0
    )}&#8457;</span>). Chance of precipitation ${this.pop}&percnt;.`;
  }
}

class ForecastData {
  constructor(
    dailyHighs,
    dailyLows,
    hourlyTemps,
    hourlyDewPoints,
    hourlyCloudCover,
    hourlyUV,
    hourlyPrecip,
    hourlyWind
  ) {
    this.dailyHighs = dailyHighs;
    this.dailyLows = dailyLows;
    this.hourlyTemps = hourlyTemps;
    this.hourlyDewPoints = hourlyDewPoints;
    this.hourlyCloudCover = hourlyCloudCover;
    this.hourlyUV = hourlyUV;
    this.hourlyPrecip = hourlyPrecip;
    this.hourlyWind = hourlyWind;
    this.units = "&#8457;";

    this.forecastGrid = [
      hourlyTemps,
      hourlyDewPoints,
      hourlyCloudCover,
      hourlyUV,
      hourlyPrecip,
      hourlyWind,
    ];
  }
}

// Export the CurrentConditions class to be used by other files
export { CurrentConditions, ForecastData };
