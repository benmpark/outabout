class DayEvents {
  constructor(dawn, sunrise, noon, goldenPM, sunset, dusk) {
    this.dawn = dawn;
    this.sunrise = sunrise;
    this.goldenAM = getMorningGoldenHour(sunrise, goldenPM, sunset);
    this.noon = noon;
    this.goldenPM = goldenPM;
    this.sunset = sunset;
    this.dusk = dusk;
    this.eventArray = [
      "12:00:00 AM",
      this.dawn,
      this.sunrise,
      this.goldenAM,
      this.noon,
      this.goldenPM,
      this.sunset,
      this.dusk,
    ];
    this.eventHourArray = [
      0,
      timeStringToHour(this.dawn),
      timeStringToHour(this.sunrise),
      timeStringToHour(this.goldenAM),
      timeStringToHour(this.noon),
      timeStringToHour(this.goldenPM),
      timeStringToHour(this.sunset),
      timeStringToHour(this.dusk),
      24,
    ];
  }
}

class SolarData {
  constructor(results) {
    this.today = new DayEvents(
      results[0].dawn,
      results[0].sunrise,
      results[0].solar_noon,
      results[0].golden_hour,
      results[0].sunset,
      results[0].dusk
    );

    this.tomorrow = new DayEvents(
      results[1].dawn,
      results[1].sunrise,
      results[1].solar_noon,
      results[1].golden_hour,
      results[1].sunset,
      results[1].dusk
    );

    this.dayAfter = new DayEvents(
      results[2].dawn,
      results[2].sunrise,
      results[2].solar_noon,
      results[2].golden_hour,
      results[2].sunset,
      results[2].dusk
    );

    this.allEvents = [
      this.today.eventArray,
      this.tomorrow.eventArray,
      this.dayAfter.eventArray,
    ];

    this.allEventHours = [
      this.today.eventHourArray,
      this.tomorrow.eventHourArray,
      this.dayAfter.eventHourArray,
    ];
  }
}

function getHMS(timeString) {
  let timeComponents = timeString.split(" ");
  let isMorning = timeComponents[1] == "AM" ? true : false;
  let hmsComponents = timeComponents[0].split(":");
  let hours = parseFloat(hmsComponents[0]);
  if (hours == 12 && isMorning) {
    hours = 0;
  } else if (!isMorning && hours != 12) {
    hours += 12;
  }
  return [hours, parseFloat(hmsComponents[1]), parseFloat(hmsComponents[2])];
}

function timeStringToHour(timeString) {
  let hms = getHMS(timeString);
  let hours = hms[0];
  if (parseFloat(hms[1]) >= 30 && hours < 23) {
    hours += 1;
  }
  return hours;
}

function dateObjectToTimeString(date) {
  let hours = date.getHours();
  let suffix;
  if (hours < 12) {
    suffix = "AM";
    if (hours == 0) {
      hours = 12;
    }
  } else {
    suffix = "PM";
    if (hours > 12) {
      hours -= 12;
    }
  }
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")} ${suffix}`;
}

function getDateObject(timeString) {
  let [hh, mm, ss] = getHMS(timeString);
  let tempString = `1970-01-01T${hh.toString().padStart(2, "0")}:${mm
    .toString()
    .padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
  return new Date(tempString);
}

function getMorningGoldenHour(sunrise, goldenStart, sunset) {
  let goldenHourLength =
    getDateObject(sunset).getTime() - getDateObject(goldenStart).getTime();
  let dateObject = new Date(
    getDateObject(sunrise).getTime() + goldenHourLength
  );
  return dateObjectToTimeString(dateObject);
}

export default SolarData;
