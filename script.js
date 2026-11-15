// Where2Eat — fixed & expanded
// Created: Chuck Konkol
// Updated: (this revision)

var API_KEY = "AIzaSyC2oYu6gWezMlWH0C8ACn2mRl81ISqu4mc";
var OWM_KEY = "88679b3ed150543b880c7b4c2f742ac1";

var pids = '';
var selectedRest = null;   // store the full chosen result so details() can reuse it
var userLat, userLon;

// ─── Roulette helpers (kept from original) ───────────────────────────
var numbers = [];
var ranges  = [];
var randomInd;
var randomradius;

function generateNumbers(max) {
  numbers = [];
  for (var i = 0; i < max; i++) numbers.push(i);
}
function spin(count) {
  // FIX: bound to actual result count, not a fixed 20
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
  while (el.firstChild) el.removeChild(el.firstChild);
}
function showLoading(on) {
  document.getElementById('loading').style.display = on ? 'block' : 'none';
  document.getElementById('go').style.display     = on ? 'none'  : 'inline-block';
  document.getElementById('results-container').style.display = on ? 'none' : 'block';
}

// ─── Weather — FIXED ─────────────────────────────────────────────────
// OLD BUG: parsed city name from address string → often garbage ("62701", "IL")
// NEW:   use lat/lon directly with OpenWeatherMap geocoded endpoint
function searchWeather(lat, lon) {
  var url = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=" + OWM_KEY;

  $.ajax({ url: url, method: "GET", timeout: 8000 })
    .done(function (r) {
      var cityName  = r.name;
      var main      = r.weather[0].main;
      var desc      = r.weather[0].description;
      var iconCode  = r.weather[0].icon;
      var iconURL   = "https://openweathermap.org/img/w/" + iconCode + ".png";
      var tempC     = Math.round(r.main.temp - 273.15);
      var tempF     = Math.round((tempC * 9/5) + 32);
      var windKmh   = r.wind ? Math.round(r.wind.speed * 3.6) : '–';
      var hum       = r.main ? r.main.humidity + '%' : '–';

      // FIX: build DOM safely; old code used $(mainWeather) as a selector
      var $div = $("#cityinfo-div").empty();
      $div.append("<h1>" + cityName + "</h1>");
      $div.append("<p>Current: <b>" + main + "</b> — " + desc + "</p>");
      $div.append("<p>" + tempC + "°C / " + tempF + "°F&nbsp;&nbsp;💨 " + windKmh + " km/h&nbsp;&nbsp;💧 " + hum + "</p>");
      $div.append($("<img>").attr("src", iconURL).css({ width: 64, height: 64 }));
      setWeatherBackground(main);
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

// ─── Nearby Search — FIXED ───────────────────────────────────────────
function getLocationID(lat, lon) {
  clearDiv("restaurantinfo-div");
  clearDiv("cityinfo-div");
  spin(20);           // generate 20 candidate indices
  spin2();            // pick random radius

  var url = "https://corsproxy.io/?https://maps.googleapis.com/maps/api/place/nearbysearch/json"
          + "?location=" + lat + "," + lon
          + "&radius="  + randomradius
          + "&type=restaurant"
          + "&key="     + API_KEY;

  $.ajax({ url: url, method: "GET", timeout: 12000 })
    .done(function (data) {
      if (data.status !== "OK" || !data.results || data.results.length === 0) {
        $("#restaurantinfo-div").append("<p>No restaurants found nearby. Try again!</p>");
        showLoading(false);
        return;
      }

      // FIX: clamp random index to actual number of results
      var count = Math.min(numbers.length, data.results.length);
      var idx   = Math.floor(Math.random() * count);
      selectedRest = data.results[idx];
      pids = selectedRest.place_id;

      renderRestaurant(selectedRest, randomradius);
      // FIX: chain details() right after render instead of a blind setTimeout
      fetchDetails(pids);
    })
    .fail(function (xhr, status, err) {
      $("#restaurantinfo-div").append("<p style='color:#c0392b'>⚠ Couldn't reach the restaurant service. Check your connection and try again.</p>");
      console.error("Nearby search failed:", status, err);
      showLoading(false);
    });
}

// ─── Render restaurant card — EXPANDED ───────────────────────────────
function renderRestaurant(r, radiusUsed) {
  var $div = $("#restaurantinfo-div").empty();

  // Name
  $div.append("<h1>" + r.name + "</h1>");

  // Address → maps link
  var addr = r.vicinity || "Address not provided";
  var link = $("<a>").text(addr).attr("href", "https://maps.google.com/?q=" + encodeURIComponent(addr)).attr("target","_blank");
  $div.append(link);

  // Photo (first one)
  if (r.photos && r.photos.length > 0) {
    $div.append("<br><img src='https://maps.googleapis.com/maps/api/place/photo?photoreference="
      + r.photos[0].photo_reference + "&sensor=false&maxheight=225&maxwidth=225&key=" + API_KEY
      + "' style='max-width:225px;max-height:225px;border-radius:8px;margin:8px 0' onerror=\"this.style.display='none'\">");
  }

  // Open now
  if (r.opening_hours) {
    $div.append("<p><b>Open Now?</b> " + (r.opening_hours.open_now ? "✅ Yes" : "❌ No (call ahead)") + "</p>");
  }

  // Distance hint
  $div.append("<p style='color:gray;font-size:13px'>Within ~" + Math.round(radiusUsed / 100) / 10 + " km search radius</p>");

  // Placeholder for details (phone, website, rating…) — filled by fetchDetails
  $div.append("<div id='details-slot'></div>");
}

// ─── Place Details — EXPANDED ────────────────────────────────────────
// OLD:  fields = formatted_phone_number, website  (only 2 fields)
// NEW:  adds rating, reviews, price level, full address, cuisine, hours
function fetchDetails(placeId) {
  var FIELDS = [
    "formatted_phone_number","website",
    "rating","user_ratings_total","price_level",
    "formatted_address","cuisine",
    "opening_hours"
  ].join(",");

  var url = "https://corsproxy.io/?https://maps.googleapis.com/maps/api/place/details/json"
          + "?place_id=" + placeId
          + "&fields="   + encodeURIComponent(FIELDS)
          + "&key="      + API_KEY;

  $.ajax({ url: url, method: "GET", timeout: 10000 })
    .done(function (data) {
      var d = data.result;
      var $slot = $("#details-slot");

      // Rating + reviews
      if (d.rating) {
        var stars = "★".repeat(d.price_level || 1) + " ".repeat(Math.max(0, 4 - (d.price_level || 1)));
        var stars = "";
        for (var s = 0; s < 5; s++) stars += s < Math.round(d.rating) ? "★" : "☆";
        $slot.append("<p class='stars'>" + stars + " " + d.rating
          + " <span style='color:#888;font-size:13px'>(" + (d.user_ratings_total || 0) + " reviews)</span></p>");
      }

      // Cuisine types
      if (d.cuisine && d.cuisine.length) {
        $slot.append("<p><b>Cuisine:</b> " + d.cuisine.join(", ") + "</p>");
      }

      // Price level
      if (d.price_level) {
        $slot.append("<p><b>Price:</b> " + "$".repeat(d.price_level) + "</p>");
      }

      // Full address (more precise than vicinity)
      if (d.formatted_address && d.formatted_address !== (selectedRest.vicinity || "")) {
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

      // Opening hours (full day list, not just open/closed)
      if (d.opening_hours && d.opening_hours.weekday_text) {
        var $hours = $("<ul>").css({ margin: "4px 0", padding: "0 0 0 20px" });
        $.each(d.opening_hours.weekday_text, function (_, line) {
          $hours.append($("<li>").text(line));
        });
        $slot.append("<p><b>Hours:</b></p>" + $hours);
      }

      showLoading(false);
      scrollToBottom();
    })
    .fail(function () {
      $slot.append("<p style='color:#c0392b'>⚠ Extra details unavailable.</p>");
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
  // FIX: call directly (small delay just for UX feel), details chained in fetchDetails
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
