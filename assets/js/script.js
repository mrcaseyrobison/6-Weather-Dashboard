// Global Variables
const userSearchHistory = [];
const openWeatherAPI = "https://api.openweathermap.org";
const openWeatherAPIKey = "93599ab684518639511e1336572d35c0";
const userSearch = document.getElementById("search-form");
const userInput = document.getElementById("search-input");
const todayWeather = document.getElementById("today");
const weatherForecast = document.getElementById("forecast");
const searchHistory = document.getElementById("search-history");

// Display past searches in a list
(displaySearchHistory) => {
    searchHistory.innerHTML ="";

// For loop to list array of user search history
for (let i = userSearchHistory.length; i >= 0; i--) {
    const btn = document.createElement('button');
    btn.setAttribute("type", "button");
    btn.setAttribute("today forecast");
    btn.classList.add('history-btn');
    btn.setAttribute('data-search', searchHistory[i]);
    btn.textContent = userSearchHistory[i];
    searchHistory.append[btn];
    }
}
