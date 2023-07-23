const params = {
    url: "https://api.openweathermap.org/data/2.5/",
    api: "12bc2351f03115a6149dfefd65ce38fb",
    unit: "metric",
};

const units = document.querySelector("#units");
const search = document.querySelector("#search");

function changeUnits() {
    units.addEventListener("change", () => {
        params.unit = units.value;
        getLocalWeather();
        // if (status == false) {
        //     getLocalWeather();
        // } else {
        //     getWeather();
        // }
    });
}

document.addEventListener("focusin", (event) => {
    if (event.target !== search) {
        return false;
    }
    search.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            getWeather(search.value);
        }
    });
});

async function getWeather(city) {
    const response = await fetch(`${params.url}weather?q=${city}&units=${params.unit}&appid=${params.api}`);

    if (response.ok) {
        const data = await response.json();
        console.log(data);
    } else {
        console.log("Ошибка сервера: ", response.statusText);
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
            console.log(data);
        } else {
            console.log("Ошибка сервера: ", response);
        }
    } catch (error) {
        console.log("Error: ", error.message);
    }
}

changeUnits();
getLocalWeather();
