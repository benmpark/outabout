class CurrentConditions {
  constructor(units, currentTemp, apparentTemp, isDaytime, pop) {
    this.units = units;
    this.currentTemp = currentTemp;
    this.apparentTemp = apparentTemp;
    this.isDaytime = isDaytime;
    this.pop = pop;
    this.displayHTML = `<em>Currently</em> ${this.currentTemp.toFixed(0)}${
      this.units
    } (feels like ${this.apparentTemp.toFixed(0)}${
      this.units
    }). Chance of precipitation ${this.pop}%.`;
  }
}

class ForecastData {
  constructor(
    units,
    dailyHighs,
    dailyLows,
    hourlyTemps,
    hourlyDewPoints,
    hourlyCloudCover,
    hourlyUV,
    hourlyPrecip,
    hourlyWind
  ) {
    this.units = units;
    this.dailyHighs = dailyHighs;
    this.dailyLows = dailyLows;
    this.hourlyTemps = hourlyTemps;
    this.hourlyDewPoints = hourlyDewPoints;
    this.hourlyCloudCover = hourlyCloudCover;
    this.hourlyUV = hourlyUV;
    this.hourlyPrecip = hourlyPrecip;
    this.hourlyWind = hourlyWind;
  }
}

// Export the CurrentConditions class to be used by other files
export { CurrentConditions, ForecastData };
