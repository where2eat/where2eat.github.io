// Where2Eat — fixed version
// Created: Chuck Konkol
// Fixes: weather now loads, places use official Maps JS API (no broken CORS proxy), OpenWeather key removed

var API_KEY = "AIzaSyC2oYu6gWezMlWH0C8ACn2mRl81ISqu4mc"; // Google Maps / Places key (restrict to your domain in console)

var selectedRest = null;
var userLat, userLon;
var placesService = null;

// ─── Roulette helpers ────────────────────────────────────────────────
var numbers = [];
var ranges  = [];
var randomInd;
var randomradius;

function generateNumbers(max) {
  numbers = [];
  for (var i = 0; i < max; i++) numbers.push(i);
}
function spin(count) {
  if (numbers.length === 0) generateNumbers(count);
  randomInd = numbers[Math.floor(Math.random() * numbers.length)];
  numbers.splice(randomInd === numbers.length - 1 ? numbers.length - 1 : numbers.indexOf(randomInd), 1);
}
function generateNumbers2() {
  ranges = [];
  for (var i = 1500; i < 32187; i += 500) ranges.push(i);
}
function spin2() {
  if (ranges.length === 0) generateNumbers2();
  randomradius = ranges[Math.floor(Math.random() * ranges.length)];
  ranges.splice(ranges.indexOf(randomradius), 1);
}

// ─── DOM helpers ──────────────────────────────────────────────────────
function clearDiv(id) {
  var el = document.getElementById(id);
  if (!el) return;
  while (el.firstChild) el.removeChild(el.firstChild);
}
function showLoading(on) {
  var loading = document.getElementById('loading');
  var go = document.getElementById('go');
  var results = document.getElementById('results-container');
  if (loading) loading.style.display = on ? 'block' : 'none';
  if (go) go.style.display = on ? 'none' : 'inline-block';
  if (results) results.style.display = on ? 'none' : 'block';
}

// ─── Weather using wttr.in (free, no key, CORS-friendly) ─────────────
function searchWeather(lat, lon) {
  var url = "https://wttr.in/" + lat + "," + lon + "?format=j1";

  $.ajax({ url: url, method: "GET", timeout: 8000 })
    .done(function (data) {
      try {
        var cur = data.current_condition[0];
        var desc = cur.weatherDesc[0].value;
        var tempC = cur.temp_C;
        var tempF = cur.temp_F;
        var wind = cur.windspeedKmph + " km/h";
        var hum  = cur.humidity + "%";
        var icon = cur.weatherIconUrl[0].value;

        // Approximate main condition for background
        var main = "Clear";
        var d = desc.toLowerCase();
        if (d.includes("rain") || d.includes("drizzle")) main = "Rain";
        else if (d.includes("snow")) main = "Snow";
        else if (d.includes("cloud")) main = "Clouds";
        else if (d.includes("thunder")) main = "Thunderstorm";
        else if (d.includes("mist") || d.includes("fog")) main = "Mist";

        var $div = $("#cityinfo-div").empty();
        $div.append("<h1>Nearby</h1>");
        $div.append("<p>Current: <b>" + desc + "</b></p>");
        $div.append("<p>" + tempC + "°C / " + tempF + "°F&nbsp;&nbsp;💨 " + wind + "&nbsp;&nbsp;💧 " + hum + "</p>");
        if (icon) $div.append($("<img>").attr("src", icon).css({ width: 64, height: 64 }));
        setWeatherBackground(main);
      } catch (e) {
        $("#cityinfo-div").append("<p style='color:#c0392b'>⚠ Weather data unavailable.</p>");
      }
    })
    .fail(function () {
      $("#cityinfo-div").append("<p style='color:#c0392b'>⚠ Weather unavailable right now.</p>");
    });
}

function setWeatherBackground(main) {
  var map = {
    Clear:"./Assets/clear.jpg", Thunderstorm:"./Assets/thunderstorm.jpg",
    Clouds:"./Assets/clouds.jpg", Drizzle:"./Assets/drizzle.jpg",
    Rain:"./Assets/rain.png", Snow:"./Assets/snow.jpg", Mist:"./Assets/mist.png"
  };
  $("body").css("background-image", "url(" + (map[main] || "./Assets/food.jpg") + ")");
}

// ─── Load Google Maps Places library (official browser way) ──────────
function loadGoogleMaps(callback) {
  if (window.google && window.google.maps && window.google.maps.places) {
    callback();
    return;
  }
  var script = document.createElement('script');
  script.src = "https://maps.googleapis.com/maps/api/js?key=" + API_KEY + "&libraries=places&callback=initPlaces";
  script.async = true;
  script.defer = true;
  window.initPlaces = function () {
    // Create a dummy map element (required by PlacesService)
    var mapDiv = document.createElement('div');
    mapDiv.style.display = 'none';
    document.body.appendChild(mapDiv);
    var map = new google.maps.Map(mapDiv, { center: { lat: 0, lng: 0 }, zoom: 1 });
    placesService = new google.maps.places.PlacesService(map);
    callback();
  };
  document.head.appendChild(script);
}

// ─── Nearby Search using PlacesService (no CORS proxy needed) ────────
function getLocationID(lat, lon) {
  clearDiv("restaurantinfo-div");
  clearDiv("cityinfo-div");
  spin(20);
  spin2();

  // Load weather immediately
  searchWeather(lat, lon);

  loadGoogleMaps(function () {
    var request = {
      location: new google.maps.LatLng(lat, lon),
      radius: randomradius,
      type: 'restaurant'
    };

    placesService.nearbySearch(request, function (results, status) {
      if (status !== google.maps.places.PlacesServiceStatus.OK || !results || results.length === 0) {
        $("#restaurantinfo-div").append("<p>No restaurants found nearby. Try again!</p>");
        showLoading(false);
        return;
      }

      var idx = Math.floor(Math.random() * Math.min(results.length, 20));
      selectedRest = results[idx];

      renderRestaurant(selectedRest, randomradius);
      fetchDetails(selectedRest.place_id);
    });
  });
}

// ─── Render restaurant card ──────────────────────────────────────────
function renderRestaurant(r, radiusUsed) {
  var $div = $("#restaurantinfo-div").empty();

  $div.append("<h1>" + (r.name || "Restaurant") + "</h1>");

  var addr = r.vicinity || "Address not provided";
  var link = $("<a>").text(addr)
    .attr("href", "https://maps.google.com/?q=" + encodeURIComponent(addr))
    .attr("target", "_blank");
  $div.append(link);

  if (r.photos && r.photos.length > 0) {
    var photoUrl = r.photos[0].getUrl({ maxWidth: 225, maxHeight: 225 });
    $div.append("<br><img src='" + photoUrl + "' style='max-width:225px;max-height:225px;border-radius:8px;margin:8px 0' onerror=\"this.style.display='none'\">");
  }

  if (r.opening_hours) {
    $div.append("<p><b>Open Now?</b> " + (r.opening_hours.isOpen ? r.opening_hours.isOpen() ? "✅ Yes" : "❌ No (call ahead)" : "Unknown") + "</p>");
  }

  $div.append("<p style='color:gray;font-size:13px'>Within ~" + Math.round(radiusUsed / 100) / 10 + " km search radius</p>");
  $div.append("<div id='details-slot'></div>");
}

// ─── Place Details ───────────────────────────────────────────────────
function fetchDetails(placeId) {
  if (!placesService) return;

  var request = {
    placeId: placeId,
    fields: ['formatted_phone_number', 'website', 'rating', 'user_ratings_total', 'price_level', 'formatted_address', 'opening_hours', 'name']
  };

  placesService.getDetails(request, function (d, status) {
    var $slot = $("#details-slot");
    if (status !== google.maps.places.PlacesServiceStatus.OK || !d) {
      $slot.append("<p style='color:#c0392b'>⚠ Extra details unavailable.</p>");
      showLoading(false);
      scrollToBottom();
      return;
    }

    // Rating stars
    if (d.rating) {
      var stars = "";
      for (var s = 0; s < 5; s++) stars += s < Math.round(d.rating) ? "★" : "☆";
      $slot.append("<p class='stars'>" + stars + " " + d.rating
        + " <span style='color:#888;font-size:13px'>(" + (d.user_ratings_total || 0) + " reviews)</span></p>");
    }

    // Price level
    if (d.price_level) {
      $slot.append("<p><b>Price:</b> " + "$".repeat(d.price_level) + "</p>");
    }

    // Full address
    if (d.formatted_address) {
      $slot.append("<p><b>Address:</b> " + d.formatted_address + "</p>");
    }

    // Phone
    if (d.formatted_phone_number) {
      $slot.append("<p><a href='tel:" + d.formatted_phone_number + "'>" + d.formatted_phone_number + "</a></p>");
    } else {
      $slot.append("<p><b>Phone:</b> [not listed]</p>");
    }

    // Website
    if (d.website) {
      $slot.append("<p><b>Website:</b> <a href='" + d.website + "' target='_blank'>" + d.website + "</a></p>");
    } else {
      $slot.append("<p><b>Website:</b> [not listed]</p>");
    }

    // Opening hours
    if (d.opening_hours && d.opening_hours.weekday_text) {
      var $hours = $("<ul>").css({ margin: "4px 0", padding: "0 0 0 20px" });
      $.each(d.opening_hours.weekday_text, function (_, line) {
        $hours.append($("<li>").text(line));
      });
      $slot.append("<p><b>Hours:</b></p>").append($hours);
    }

    showLoading(false);
    scrollToBottom();
  });
}

// ─── Geolocation entry point ─────────────────────────────────────────
function getLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by this browser.");
    return;
  }
  navigator.geolocation.getCurrentPosition(showPosition, onGeoError, { timeout: 15000, maximumAge: 30000 });
}

function showPosition(position) {
  userLat = position.coords.latitude;
  userLon = position.coords.longitude;
  showLoading(true);
  setTimeout(function () { getLocationID(userLat, userLon); }, 400);
}

function onGeoError(err) {
  var msgs = {
    1: "Location permission denied. Please allow access and retry.",
    2: "Position unavailable. Try again in a moment.",
    3: "Location request timed out."
  };
  alert(msgs[err.code] || "Geolocation error.");
  showLoading(false);
}

function scrollToBottom() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  $("#restaurantinfo-div").append(
    "<br><button class='button' onclick='getLocation()'>🎲 Search Again!</button>"
  );
}
