// currency
const currency = "$";
// prices
const prices = {
    'Basic': 9,
    'Premium': 19,
    'Lux': 29
};

// narrow search to this city
const city = document.getElementById('city');
const cityName = city.value.replace(" ", "+");
// start
const start = document.getElementById('start');
const startDropdown = document.getElementById('start-dropdown');
// end
const end = document.getElementById('end');
const endDropdown = document.getElementById('end-dropdown');


start.value = "";
end.value = "";
city.value = "";

/**
 * Change location + Address Autocomplete
 * 
 */
function changeLocation(input, dropdown) {

    dropdown.innerHTML = "";

    if (input.value.length >= 3) {

        dropdown.classList.remove("uk-hidden");

        fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + input.value + city.value + '&sensor=false')
            .then(function (response) {
                return response.json();
            })
            .then(function (json) {
                // if there is results display them
                // if not display no results message
                if (json.results.length > 0) {

                    dropdown.innerHTML = "";

                    for (var i = 0; i < json.results.length; i++) {
                        dropdown.innerHTML += "<li><a href='#'>" + json.results[i].formatted_address + "</a></li>";
                    }

                } else {
                    dropdown.innerHTML = "<li><span>No Results</span></li>";
                }
            });
            
    }

    // set the address and reset dropdown
    dropdown.addEventListener("click", function (e) {
        // event delegation
        if (e.target && e.target.nodeName == "A") {
            input.value = e.target.innerHTML;
        }
        dropdown.innerHTML = "";
        dropdown.classList.add("uk-hidden");
    });

}

var setStart = function () {
    changeLocation(start, startDropdown);
};

var setEnd = function () {
    changeLocation(end, endDropdown);
};

start.addEventListener('keyup', setStart);
end.addEventListener('keyup', setEnd);


/**
 *  Google Map + Route Render + Change map Center by City
 *
 */
function initMap() {

    // map init
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: { lat: 44.786784, lng: 20.449985 },
    });
    // directionsDisplay.setMap(map);

    // display route on start change
    start.addEventListener('change', function () {

        // clear pricing and data HTML
        clearRouteData();

        if (start.value.length >= 3) {
            changeMapCenter(start.value);
            calculateAndDisplayRoute(directionsService, directionsDisplay);
            directionsDisplay.setMap(map);
        }

    });

    // display route on end change
    end.addEventListener('change', function () {

        // clear pricing and data HTML
        clearRouteData();

        if (end.value.length >= 3) {
            changeMapCenter(start.value);
            calculateAndDisplayRoute(directionsService, directionsDisplay);
            directionsDisplay.setMap(map);
        }

    });

    // change center of the map (based on city select) 
    // using changeMapCenter() function below
    city.addEventListener('change', function () {

        // reset inputs
        start.value = "";
        end.value = "";

        // chaneg map center
        changeMapCenter(city.value);
        
        // remove map route
        directionsDisplay.setMap();

        // clear pricing and data HTML
        clearRouteData();
        
    });

    // chnage map center function
    function changeMapCenter(address) {
        //get the city lat and lng
        return fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&sensor=false')
            .then(function (response) {
                return response.json();
            })
            .then(function (json) {
                let thisLat = json.results[0].geometry.location['lat'];
                let thisLng = json.results[0].geometry.location['lng'];
                // console.log(json);
                let center = { lat: thisLat, lng: thisLng };
                map.setCenter(center);

            });
    }

}

/**
 * Get info about the route,
 * distance, time etc..
 * 
 */
function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    directionsService.route({
        origin: start.value,
        destination: end.value,
        travelMode: 'DRIVING'
    }, function (response, status) {
        if (status === 'OK') {
            // console.log(response);
            directionsDisplay.setDirections(response);
            // run our HTML display function
            getRouteData(response);
        } else {
            //console.log('Directions request failed due to ' + status)
        }
    });
}


/**
 *  Display routeData and Pricing HTML
 * 
 */
function getRouteData(data) {

    let distanceText = data.routes[0].legs[0].distance.text;
    let distanceValue = data.routes[0].legs[0].distance.value;
    let km = Math.round(distanceValue / 1000);

    let duration = data.routes[0].legs[0].duration.text;

    let startAddress = data.routes[0].legs[0].start_address;
    let endAddress = data.routes[0].legs[0].end_address;


    let routeDataElement = document.getElementById("route-data");
    routeDataElement.innerHTML = "";

    document.getElementById("route-data").classList.remove("uk-hidden");

    // display distance + duration + heading
    routeDataElement.innerHTML += "<li><h4>Route Info</h4></li>";
    routeDataElement.innerHTML += "<li><span>Distance</span><span>" + distanceText + "</span></li>";
    routeDataElement.innerHTML += "<li><span>Duration</span><span>" + duration + "</span></li>";
    routeDataElement.innerHTML += "<li><h4>Pricing</h4></li>";

    for (var plan in prices) {
        let text = plan;
        let price = prices[plan] * km;
        routeDataElement.innerHTML += "<li><span>" + text + "</span><span>" + currency + price + "</span></li>";
    }

    start.addEventListener('keyup', function () {
        clearRouteData();
    });

    end.addEventListener('keyup', function () {
        clearRouteData();
    });

}


/**
 *  Clear Data & Pricing HTML
 * 
 */
function clearRouteData() {

    let routeDataElement = document.getElementById("route-data");
    routeDataElement.innerHTML = "";
    document.getElementById("route-data").classList.add("uk-hidden");

}