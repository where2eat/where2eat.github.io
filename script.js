// Where2Eat — fixed version 2
// Created: Chuck Konkol
// Fixes: weather JSON parse, places via REST + working proxy (PlacesService was hanging)

var API_KEY = "AIzaSyC2oYu6gWezMlWH0C8ACn2mRl81ISqu4mc";

var selectedRest = null;
var userLat, userLon;

// ─── Roulette helpers ────────────────────────────────────────────────
var numbers = [];
var ranges = [];
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
  var loading = document.getElementById("loading");
  var go = document.getElementById("go");
  var results = document.getElementById("results-container");
  if (loading) loading.style.display = on ? "block" : "none";
  if (go) go.style.display = on ? "none" : "inline-block";
  if (results) results.style.display = on ? "none" : "block";
}

// ─── Weather (wttr.in, force JSON) ───────────────────────────────────
function searchWeather(lat, lon) {
  var url = "https://wttr.in/" + lat + "," + lon + "?format=j1";

  $.ajax({
    url: url,
    method: "GET",
    dataType: "json",          // critical — wttr does not send application/json
    timeout: 8000
  })
    .done(function (data) {
      try {
        var cur = data.current_condition[0];
        var desc = cur.weatherDesc[0].value;
        var tempC = cur.temp_C;
        var tempF = cur.temp_F;
        var wind = cur.windspeedKmph + " km/h";
        var hum = cur.humidity + "%";
        var icon = cur.weatherIconUrl && cur.weatherIconUrl[0] ? cur.weatherIconUrl[0].value : null;

        var main = "Clear";
        var d = (desc || "").toLowerCase();
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
        $("#cityinfo-div").html("<p style='color:#c0392b'>⚠ Weather data unavailable.</p>");
      }
    })
    .fail(function () {
      $("#cityinfo-div").html("<p style='color:#c0392b'>⚠ Weather unavailable right now.</p>");
    });
}

function setWeatherBackground(main) {
  var map = {
    Clear: "./Assets/clear.jpg",
    Thunderstorm: "./Assets/thunderstorm.jpg",
    Clouds: "./Assets/clouds.jpg",
    Drizzle: "./Assets/drizzle.jpg",
    Rain: "./Assets/rain.png",
    Snow: "./Assets/snow.jpg",
    Mist: "./Assets/mist.png"
  };
  $("body").css("background-image", "url(" + (map[main] || "./Assets/food.jpg") + ")");
}

// ─── Proxy helper (allorigins works with Google REST) ────────────────
function proxyUrl(raw) {
  return "https://api.allorigins.win/get?url=" + encodeURIComponent(raw);
}

// ─── Nearby Search via REST + proxy ──────────────────────────────────
function getLocationID(lat, lon) {
  clearDiv("restaurantinfo-div");
  clearDiv("cityinfo-div");
  spin(20);
  spin2();

  searchWeather(lat, lon);

  var googleUrl =
    "https://maps.googleapis.com/maps/api/place/nearbysearch/json" +
    "?location=" + lat + "," + lon +
    "&radius=" + randomradius +
    "&type=restaurant" +
    "&key=" + API_KEY;

  $.ajax({
    url: proxyUrl(googleUrl),
    method: "GET",
    dataType: "json",
    timeout: 15000
  })
    .done(function (wrapper) {
      var data;
      try {
        data = typeof wrapper.contents === "string" ? JSON.parse(wrapper.contents) : wrapper.contents;
      } catch (e) {
        showError("Could not parse restaurant data.");
        return;
      }

      if (data.status !== "OK" || !data.results || data.results.length === 0) {
        showError("No restaurants found nearby (" + (data.status || "unknown") + "). Try again!");
        return;
      }

      var idx = Math.floor(Math.random() * Math.min(data.results.length, 20));
      selectedRest = data.results[idx];

      renderRestaurant(selectedRest, randomradius);
      fetchDetails(selectedRest.place_id);
    })
    .fail(function () {
      showError("Couldn't reach the restaurant service. Check your connection and try again.");
    });
}

function showError(msg) {
  $("#restaurantinfo-div").html("<p style='color:#c0392b'>⚠ " + msg + "</p>");
  showLoading(false);
}

// ─── Render restaurant card ──────────────────────────────────────────
function renderRestaurant(r, radiusUsed) {
  var $div = $("#restaurantinfo-div").empty();

  $div.append("<h1>" + (r.name || "Restaurant") + "</h1>");

  var addr = r.vicinity || "Address not provided";
  var link = $("<a>")
    .text(addr)
    .attr("href", "https://maps.google.com/?q=" + encodeURIComponent(addr))
    .attr("target", "_blank");
  $div.append(link);

  if (r.photos && r.photos.length > 0) {
    var photoUrl =
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=225&photoreference=" +
      r.photos[0].photo_reference +
      "&key=" + API_KEY;
    $div.append(
      "<br><img src='" + photoUrl + "' style='max-width:225px;max-height:225px;border-radius:8px;margin:8px 0' onerror=\"this.style.display='none'\">"
    );
  }

  if (r.opening_hours) {
    $div.append("<p><b>Open Now?</b> " + (r.opening_hours.open_now ? "✅ Yes" : "❌ No (call ahead)") + "</p>");
  }

  $div.append("<p style='color:gray;font-size:13px'>Within ~" + Math.round(radiusUsed / 100) / 10 + " km search radius</p>");
  $div.append("<div id='details-slot'></div>");
}

// ─── Place Details via REST + proxy ──────────────────────────────────
function fetchDetails(placeId) {
  var fields = [
    "formatted_phone_number",
    "website",
    "rating",
    "user_ratings_total",
    "price_level",
    "formatted_address",
    "opening_hours",
    "name"
  ].join(",");

  var googleUrl =
    "https://maps.googleapis.com/maps/api/place/details/json" +
    "?place_id=" + placeId +
    "&fields=" + encodeURIComponent(fields) +
    "&key=" + API_KEY;

  $.ajax({
    url: proxyUrl(googleUrl),
    method: "GET",
    dataType: "json",
    timeout: 12000
  })
    .done(function (wrapper) {
      var data;
      try {
        data = typeof wrapper.contents === "string" ? JSON.parse(wrapper.contents) : wrapper.contents;
      } catch (e) {
        $("#details-slot").html("<p style='color:#c0392b'>⚠ Extra details unavailable.</p>");
        showLoading(false);
        scrollToBottom();
        return;
      }

      var d = data.result || {};
      var $slot = $("#details-slot").empty();

      if (d.rating) {
        var stars = "";
        for (var s = 0; s < 5; s++) stars += s < Math.round(d.rating) ? "★" : "☆";
        $slot.append(
          "<p class='stars'>" +
            stars +
            " " +
            d.rating +
            " <span style='color:#888;font-size:13px'>(" +
            (d.user_ratings_total || 0) +
            " reviews)</span></p>"
        );
      }

      if (d.price_level) {
        $slot.append("<p><b>Price:</b> " + "$".repeat(d.price_level) + "</p>");
      }

      if (d.formatted_address) {
        $slot.append("<p><b>Address:</b> " + d.formatted_address + "</p>");
      }

      if (d.formatted_phone_number) {
        $slot.append("<p><a href='tel:" + d.formatted_phone_number + "'>" + d.formatted_phone_number + "</a></p>");
      } else {
        $slot.append("<p><b>Phone:</b> [not listed]</p>");
      }

      if (d.website) {
        $slot.append("<p><b>Website:</b> <a href='" + d.website + "' target='_blank'>" + d.website + "</a></p>");
      } else {
        $slot.append("<p><b>Website:</b> [not listed]</p>");
      }

      if (d.opening_hours && d.opening_hours.weekday_text) {
        var $hours = $("<ul>").css({ margin: "4px 0", padding: "0 0 0 20px" });
        $.each(d.opening_hours.weekday_text, function (_, line) {
          $hours.append($("<li>").text(line));
        });
        $slot.append("<p><b>Hours:</b></p>").append($hours);
      }

      showLoading(false);
      scrollToBottom();
    })
    .fail(function () {
      $("#details-slot").html("<p style='color:#c0392b'>⚠ Extra details unavailable.</p>");
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
  setTimeout(function () {
    getLocationID(userLat, userLon);
  }, 400);
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
