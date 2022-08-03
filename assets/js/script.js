// Global Variables
var userSearchHistory = [];

var openWeatherAPI = "https://api.openweathermap.org";
var openWeatherAPIKey = "93599ab684518639511e1336572d35c0";

var userInput = document.getElementById("searchCity");
var submitSearch = document.getElementById("submitSearch");
var searchHistory = document.getElementById("history");
var clearSearchHistory = document.getElementById("clearSearch");
var todayWeather = document.getElementById("current-weather");
var weatherForecast = document.getElementById("forecast-weather");

// Use Day.JS to render time zones
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

// Search on button click
function citySearch(event) {
    if (!userInput.value) {
        alert("You must enter a real city!")
        return;
    }
    event.preventDefault();
    var search = userInput.value.trim();
    fetchCoords(search);
    userInput.value = "";
}

// Fetch Latitude & Longitude from weatherAPI
function fetchCoords(search) {
    var apiURL = `${openWeatherAPI}/geo/1.0/direct?q=${search}&appid=${openWeatherAPIKey}`;
    fetch(apiURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (!data[0]) {
                alert("You must choose a real city!");
            } else {
                var cityData = data[0];
                var cityName = cityData.name;
                var lat = cityData.lat;
                var lon = cityData.lon;
                var cityCountry = cityData.country;
                writeHistory(search);
                fetchWeather(cityName, cityCountry, lat, lon);
            }
        });
}

// Function to fetch weather data from weatherAPI
function fetchWeather(cityName, cityCountry, lat, lon) {
    var weather = `${openWeatherAPI}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${openWeatherAPIKey}`;
    fetch(weather)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            displayData(cityName, cityCountry, data);
        });
}

// Function to display weather data from weatherAPI
function displayData(cityName, cityCountry, data) {
    displayToday(cityName, cityCountry, data.current, data.timezone);
    displayForecast(data.daily, data.timezone);
}

// Function to render HTML from data
function displayToday(cityName, cityCountry, weather, timezone) {
    var date = dayjs().tz(timezone).format("MM/DD/YYYY");
    // Store data from API to variables
    var temp = weather.temp;
    var iconURL = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
    var iconDescription = weather.weather[0].description || weather[0].main;
    var wind = weather.wind_speed;
    var humidity = weather.humidity;
    var uvIndex = weather.uvi;

    // Create elements from data
    var cityNameEl = document.createElement("h2");
    var tempEl = document.createElement("p");
    var weatherIcon = document.createElement("img");
    var windEl = document.createElement("p");
    var humidityEl = document.createElement("p");
    var uvIndexEl = document.createElement("p");
    var uvBadge = document.createElement("button");

    // UVI badges
    weatherIcon.setAttribute("src", iconURL);
    weatherIcon.setAttribute("alt", iconDescription);
    weatherIcon.setAttribute("class", "weather-img");
    uvBadge.classList.add("btn", "btn-sm");

    if (uvIndex < 3) {
        uvBadge.classList.add("btn-success");
    } else if (uvIndex < 7) {
        uvBadge.classList.add("btn-warning");
    } else {
        uvBadge.classList.add("btn-danger");
    }

    // Render card elements to HTML
    cityNameEl.textContent = `Current Weather for ${cityName}, ${cityCountry} (${date})`;
    tempEl.textContent = `Temperature: ${temp} F`;
    windEl.textContent = `Wind Speed: ${wind} MPH`;
    humidityEl.textContent = `Humidity: ${humidity}%`;
    uvIndexEl.textContent = `UV Index: `;
    uvBadge.textContent = uvIndex;
    uvIndexEl.append(uvBadge);

    // Use append to dynamically display data
    todayWeather.innerHTML = "";
    todayWeather.append(
        cityNameEl,
        weatherIcon,
        tempEl,
        windEl,
        humidityEl,
        uvIndexEl
    );
}

// Fetch 5-Day Forecast
function displayForecast(forecast, timezone) {
    var forecastStart = dayjs().tz(timezone).add(1, "day").startOf("day").unix();
    var forecastEnd = dayjs().tz(timezone).add(6, "day").startOf("day").unix();

    var fiveDayHeaderEl = document.createElement("h4");
    fiveDayHeaderEl.setAttribute("class", "col-12");
    weatherForecast.innerHTML = "";
    fiveDayHeaderEl.textContent = "5-Day Forecast";
    weatherForecast.append(fiveDayHeaderEl);

    // For loop to cycle through data
    for (var i = 0; i < forecast.length; i++) {
        if (forecast[i].dt >= forecastStart && forecast[i].dt < forecastEnd) {
            displayForecastCard(forecast[i], timezone);
        }
    }
}

// Render Forecast Cards
function displayForecastCard(forecast, timezone) {
    var date = forecast.dt;
    var iconURL = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
    var iconDescription = forecast.weather[0].description;
    var forecastTemp = forecast.temp.day;
    var { humidity } = forecast;
    var forecastWind = forecast.wind_speed;

    var col = document.createElement("div");
    var card = document.createElement("div");
    var cardBody = document.createElement("div");
    var cardTitle = document.createElement("h4");
    var weatherIcon = document.createElement("img");
    var tempEl = document.createElement("p");
    var windEl = document.createElement("p");
    var humidityEl = document.createElement("p");

    col.append(card);
    card.append(cardBody);
    cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

    col.setAttribute("class", "col-md forecast-card");
    card.setAttribute("class", "card bg-primary h-100 text-white");
    cardBody.setAttribute("class", "card-bdy p-2");
    cardTitle.setAttribute("class", "card-text");
    tempEl.setAttribute('class', 'card-text');
    windEl.setAttribute('class', 'card-text');
    humidityEl.setAttribute('class', 'card-text')

    cardTitle.textContent = dayjs.unix(date).tz(timezone).format('MM/DD/YYYY');
    weatherIcon.setAttribute('src', iconURL);
    weatherIcon.setAttribute('alt', iconDescription);
    tempEl.textContent = `Temp: ${forecastTemp} F`;
    windEl.textContent = `Wind Speed: ${forecastWind} MPH`;
    humidityEl.textContent = `${humidity} %`;

    weatherForecast.append(col);
}

// Save search history to local storage
function writeHistory(search) {
    if (userSearchHistory.indexOf(search) !== -1) {
        return;
    }
    userSearchHistory.push(search);
    localStorage.setItem("search-history", JSON.stringify(userSearchHistory));
    displaySearchHistory();
}

// Display past searches in a list
function displaySearchHistory() {
    searchHistory.innerHTML = '';

    // For loop to list array of user search history
    for (var i = userSearchHistory.length -1; i>= 0; i--) {
        var buttonItem = document.createElement('button');
        buttonItem.setAttribute('type','button');
        buttonItem.setAttribute('class', 'btn btn-outline-info btn-block btn-history');
        buttonItem.setAttribute('data-search', userSearchHistory[i]);
        buttonItem.textContent = userSearchHistory[i];
        searchHistory.append(buttonItem);
      }
    }

// Function to retrieve from local storage
function getSearchHistory() {
    var userSearchHistory = localStorage.getItem("search-history");
    if (userSearchHistory) {
        userSearchHistory = JSON.parse(userSearchHistory);
    }
    displaySearchHistory();
}

// Function to recall data from previous searches
function previousSearch(event) {
    if (!event.target.matches(".btn-history")) {
        return;
    }
    var btn = event.target;
    var search = btn.getAttribute("data-search");
    fetchCoords(search);
}

// Button to clear previous search history
function clearHistory(event) {
    event.preventDefault();
    userSearchHistory = localStorage.getItem("search-history");
    userSearchHistory = [];
    localStorage.setItem("search-history", JSON.stringify(userSearchHistory));
    searchHistory.innerHTML = "";
    todayWeather.innerHTML = "";
    weatherForecast.innerHTML = "";
    return;
}

getSearchHistory();

submitSearch.addEventListener("click", citySearch);
searchHistory.addEventListener("click", previousSearch);
clearSearchHistory.addEventListener("click", clearHistory);
