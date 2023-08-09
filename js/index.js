const params = {
    url: "https://api.openweathermap.org/data/2.5/",
    api: "12bc2351f03115a6149dfefd65ce38fb",
    unit: "metric",
};
const ls = localStorage;
let cities = [];

const units = document.querySelector("#units");
const search = document.querySelector("#search");
const weatherList = document.querySelector(".weather-list__wrapper");
const addCityButton = document.querySelector(".weather__add");
// const deleteCityButton = document.querySelector(".weather-list__delete-city");
let currentCity = false;

let weatherSearched = false;

function changeUnits() {
    units.addEventListener("change", () => {
        params.unit = units.value;
        if (weatherSearched) {
            getWeather(search.value);
        } else {
            getLocalWeather();
        }
    });
}

search.addEventListener("keypress", (event) => {
    let value = search.value;
    trimmedValue = value.trim();
    if (event.key === "Enter") {
        if (trimmedValue == "") {
            search.style.border = "2px solid red";
            return false;
        } else {
            search.style.border = "";
        }
        getWeather(trimmedValue);
        weatherSearched = true;
    }
});

async function getWeather(city) {
    const response = await fetch(`${params.url}weather?q=${city}&units=${params.unit}&appid=${params.api}`);
    const data = await response.json();

    if (response.ok) {
        output([data.name, data.main.temp, data.weather[0].main, data.main.temp_max, data.main.temp_min]);
        currentCity = data.name;
    } else {
        search.style.border = "2px solid red";
        output(null, "Город не найден");
    }
}

async function getLocalWeather() {
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => resolve(position),
                (error) => reject(error)
            );
        });

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const response = await fetch(`${params.url}weather?lat=${lat}&lon=${lon}&units=${params.unit}&appid=${params.api}`);
        const data = await response.json();

        if (response.ok) {
            output([data.name, data.main.temp, data.weather[0].main, data.main.temp_max, data.main.temp_min]);
            currentCity = data.name;
        } else {
            output(null, "Ошибка сервера");
        }
    } catch (error) {
        console.log("Error: ", error.message);
        output(null, "Пользователь отклонил геолокацию");
    }
}

function output(data, error = false) {
    const city = document.querySelector("#hero-city");
    const temp = document.querySelector("#hero-temp");
    const desc = document.querySelector("#hero-desc");
    const maxTemp = document.querySelector("#hero-max-temp");
    const minTemp = document.querySelector("#hero-min-temp");
    if (error != false) {
        city.innerHTML = error;
        temp.innerHTML = "";
        desc.innerHTML = "";
        maxTemp.innerHTML = "";
        minTemp.innerHTML = "";
        return false;
    }

    city.innerHTML = data[0];
    temp.innerHTML = Math.round(data[1]) + "&#176;";
    desc.innerHTML = data[2];
    maxTemp.innerHTML = "Max: " + Math.round(data[3]) + "&#176;";
    minTemp.innerHTML = "Min: " + Math.round(data[4]) + "&#176;";
}

function selectCityFromList(event) {
    let elem = event.target;
    if (!elem.classList.contains("weather-list__item")) {
        return false;
    }
    let cityName = elem.dataset.name;
    getWeather(cityName);
}

function createListItem(currentCity) {
    const wrapper = document.querySelector(".weather-list__wrapper");

    let item = document.createElement("div");
    let title = document.createElement("h3");
    let cross = document.createElement("button");

    item.classList.add("weather-list__item");
    cross.classList.add("weather-list__delete-city");

    item.setAttribute("data-name", currentCity);
    cross.setAttribute("data-name", currentCity);

    title.innerHTML = currentCity;
    cross.innerHTML = "&#10008";

    item.append(title);
    item.append(cross);
    wrapper.append(item);
}

function addCityToList() {
    let list = JSON.parse(localStorage.getItem("cities")) || [];
    if (!currentCity) {
        console.log("No current city");
        return false;
    }
    if (list.indexOf(currentCity) !== -1) {
        console.log("City already in list");
        return false;
    }
    createListItem(currentCity);

    cities.push(currentCity);
    ls.setItem("cities", JSON.stringify(cities));
}

function deleteCityFromList(event) {
    if (!event.target.classList.contains("weather-list__delete-city")) {
        return false;
    }
    let index = cities.indexOf(event.target.dataset.name);
    if (index !== -1) {
        cities.splice(index, 1);

        const listItemDOM = event.target.closest(".weather-list__item");
        if (listItemDOM) {
            listItemDOM.remove();
        }

        ls.setItem("cities", JSON.stringify(cities));
    }
}

function loadCityList() {
    let list = JSON.parse(localStorage.getItem("cities"));
    if (list === null) {
        return false;
    }
    cities = [...list];

    if (list === null) {
        console.log("No cities in localStorage");
        return false;
    }

    for (const item of list) {
        createListItem(item);
    }
}

document.querySelector(".weather__list-clear").addEventListener("click", () => {
    localStorage.removeItem("cities");
    window.location.reload();
});

changeUnits();
getLocalWeather();
loadCityList();
weatherList.addEventListener("click", selectCityFromList);
addCityButton.addEventListener("click", addCityToList);
weatherList.addEventListener("click", deleteCityFromList);
