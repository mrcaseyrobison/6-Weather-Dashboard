// Global Variables
const userSearchHistory = [];

const openWeatherAPI = "https://api.openweathermap.org";
const openWeatherAPIKey = "93599ab684518639511e1336572d35c0";

const userSearch = document.getElementById("search-form");
const userInput = document.getElementById("search-input");
const todayWeather = document.getElementById("today");
const weatherForecast = document.getElementById("forecast");
const searchHistory = document.getElementById("search-history");

// Use Day.JS to render time zones
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

// Display past searches in a list
function displaySearchHistory() {
    searchHistory.innerHTML ="";

// For loop to list array of user search history
for (let i = userSearchHistory.length; i >= 0; i--) {
    const historyBtn = document.createElement('button');
    historyBtn.setAttribute("type", "button");
    historyBtn.setAttribute("today forecast");
    historyBtn.classList.add('history-btn');
    historyBtn.setAttribute('data-search', searchHistory[i]);
    historyBtn.textContent = userSearchHistory[i];
    searchHistory.append[historyBtn];
    }
}

// Search on button click 
function citySearch(event) {
    let search = userInput.value.trim();
    fetchCoords(search);
    userInput.value = '';
}

// Save search history to local storage and to display it
function writeHistory(search) {
    if(userSearchHistory.indexOf(search) !== -1){
        return;
    }
    userSearchHistory.push(search);
    
    localStorage.setItem('search-history', JSON.stringify(userSearchHistory));
    displaySearchHistory();
}

// Function to retrieve from local storage
function getSearchHistory() {
    const searchArchive = localStorage.getItem('search-history');
    if (searchArchive) {
        userSearchHistory = JSON.parse(searchArchive);
    }
    displaySearchHistory();
}

// Fetch Latitude & Longitude from weatherAPI
function fetchCoords(search) {
    const apiURL = `${openWeatherAPI}/geo/1.0/direct?q=${search}&appid=${openWeatherAPIKey}`;
    fetch(apiURL)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        if (!data[0]) {
            alert('You must choose a real city!');
        } else {
            let cityData = data[0];
            let cityName = cityData.name;
            let lat = cityData.lat;
            let lon = cityData.lon;
            let cityCountry = cityData.country;
            writeHistory(search);
            fetchWeather(cityName, cityCountry, lat, lon);
        }
    })
}

// Function to fetch weather data from weatherAPI
function fetchWeather (cityName, cityCountry, lat, lon) {
    const weather = `${openWeatherAPI}/data/2.5/onecall?lat=${lat}&long=${lon}&units=imperial&exclude=minutely,hourly&appid=${openWeatherAPIKey}`;
    fetch(weather)
    .then(function(response) {
        return response.json();
    })
    .then (function(data) {
        displayData(cityName, cityCountry, data);
    });
}

// Function to display weather data from weatherAPI
function displayData(cityName, cityCountry, data) {
    displayToday(cityName, cityCountry, data.current, data.timezone);
    displayForecast(data.daily, data.timezone)
}

// Function to render HTML from data
function renderTodayWeather(cityName, cityCountry, weather, timezone) {
    let data = dayjs().tz(timezone).format('MM/DD/YYYY');
    // Store data from API to variables
    let temp = weather.temp;
    let iconURL = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
    let iconDescription = weather.weather[0].description || weather[0].main;
    let wind = weather.wind_speed;
    let humidity = weather.humidity;
    let uvIndex = weather.uvi;

    // Create elements from data
    let cityNameEl = document.createElement('h2');
    let tempEl = document.createElement('p');
    let weatherIcon = document.createElement('img');
    let windEl = document.createElement('p');
    let humidityEl = document.createElement('p');
    let uvIndexEl = document.createElement('p');
    let uvBadge = document.createElement('button');

    // UVI badges
    weatherIcon.setAttribute('src', iconURL);
    weatherIcon.setAttribute('alt', iconDescription);
    weatherIcon.setAttribute('class', 'weather-img');
    uvBadge.classList.add('btn', 'btn-sm');

    if (uvIndex < 3) {
        uvBadge.classList.add('btn-success');
    } else if (uvIndex < 7) {
        uvBadge.classList.add('btn-warning');
    } else {
        uvBadge.classList.add('btn-danger')
    }

    // Render card elements to HTML
    cityNameEl.textContent = `Current Weather for ${cityName}, ${cityCountry} ($${data})`;
    tempEl.textContent = `Temperature: ${temp} F`;
    windEl.textContent = `Wind Speed: ${wind} MPH`;
    humidityEl.textContent = `Humidity: ${humidity}%`;
    uvIndexEl.textContent = `UV Index: `;
    uvBadge.textContent = uvIndex;
    uvIndexEl.append(uvBadge);

    // Use append to dynamically display data
    todayWeather.innerHTML = "";
    todayWeather.append(cityNameEl, weatherIcon, tempEl, windEl, humidityEl, uvIndexEl);
    } 
    

