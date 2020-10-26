//Where2Eat
var pids='';
var cityname;
var numbers = []; 
var ranges = []; 
var randomInd;
var randomradius;
let gresultsinfo = document.getElementById("results-container");
gresultsinfo.style.visibility = 'hidden'; //'hidden'
function generateNumbers()
        {
            // populate the available numbers however you need to..
            for(var i=1; i<20; i+=1)
            {
                numbers.push(i);
            }
        }
 function spin()
        {
            if(numbers.length==0)
            {
                // then we've used  up all available numbers..start new game or whatever you need to do..
               // alert("starting again");
               generateNumbers();
            }
            var rand = Math.floor(Math.random()*numbers.length); // select an index randomly based on the number of remaining available numbers..
            randomInd = numbers[rand];
            numbers.splice(rand,1); // remove the number we selected so it can't be selected next time..
            // document.getElementById("number").innerHTML = num;
            console.log(numbers);
        }
function generateNumbers2()
        {
            // populate the available numbers however you need to..
            for(var i=1500; i<20000; i+=1500)
            {
                ranges.push(i);
            }
        }
 function spin2()
        {
            if(ranges.length==0)
            {
                // then we've used  up all available numbers..start new game or whatever you need to do..
                //alert("starting again");
                generateNumbers2();
            }
            var rand = Math.floor(Math.random()*ranges.length); // select an index randomly based on the number of remaining available numbers..
            randomradius = ranges[rand];
            ranges.splice(rand,1); // remove the number we selected so it can't be selected next time..
            // document.getElementById("number").innerHTML = num;
            console.log(ranges);
        }
function searchWeather(name) {
  var APIKey = "88679b3ed150543b880c7b4c2f742ac1"; // currently Alex's API key
  var userInput = name; //$("#city-input").val();
  // building URL we need to access API
  var queryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    userInput +
    "&appid=" +
    APIKey;

  $.ajax({
    // Ajax function to access query
    url: queryURL,
    method: "GET",
    error: function(e) {
    alert('No restaurants found, please try again!');
    },
  }).then(function (response) {
    var cityName = $("<h1>").text(response.name); // creating the variable for city name
    var mainWeather = $("<h2>").text(response.weather[0].main); // creating the name for the main weather data value
    var weatherIcon = response.weather[0].icon;
    var iconURL = "https://openweathermap.org/img/w/" + weatherIcon + ".png";
    iconEl = $("<img>").attr("src", iconURL);
    $("#cityinfo-div").empty(); // emptying div
    $("#cityinfo-div").append(cityName, "Current Weather:<br>",mainWeather);// appending the under inputted city name, and the corresponding main weather data value
    $(mainWeather).append(iconEl); //appends weather icon after the weather description

    function weatherBackground(weather) {
      var weather = response.weather[0].main;
      // if (weather == "Clear") {
      //   $("body").css("background-image", "url(./Assets/clear.jpg)");
      // } else if (weather == "Thunderstorm") {
      //   $("body").css("background-image", "url(./Assets/thunderstorm.jpg)");
      // }
      switch(weather) {
        case "Clear":
          $("body").css("background-image", "url(./Assets/clear.jpg)");
          break;
        case "Thunderstorm":
          $("body").css("background-image", "url(./Assets/thunderstorm.jpg)");
          break;
        case "Clouds":
          $("body").css("background-image", "url(./Assets/clouds.jpg)");
          break;
        case "Drizzle":
          $("body").css("background-image", "url(./Assets/drizzle.jpg)");
          break;
        case "Rain":
          $("body").css("background-image", "url(./Assets/rain.png)");
          break;
        case "Snow":
          $("body").css("background-image", "url(./Assets/snow.jpg)");
          break;
        case "Mist":
          $("body").css("background-image", "url(./Assets/mist.png)");
          break;
        Default:
          $("body").css("background-image", "url(./Assets/food.jpg)");
          break;
      }
      
      
    }
    weatherBackground();
  });
}

function getCityID(inputCity) {
  //function to extract cityID of user input from zomato api
  var userInput = inputCity //$("#city-input").val();
  var queryURL = "https://developers.zomato.com/api/v2.1/cities?q=" + userInput;

  $.ajax({
    url: queryURL,
    method: "GET",
    headers: {
      Accept: "application/json",
      "user-key": "e27ebe249bf6837584304788457085eb",
    },
  }).then(function (response) {
    console.log(response.location_suggestions[0].id);
    var userCity = response.location_suggestions[0].id; //grabs the first location suggestion's ID
    function getRestaurants(userCity) {
      //another function to serach for restaurants based on city ID
      var queryURL2 =
        "https://developers.zomato.com/api/v2.1/search?entity_id=" +
        userCity +
        "&entity_type=city&count=100";
      console.log(queryURL2);

      $.ajax({
        url: queryURL2,
        method: "GET",
        headers: {
          Accept: "application/json",
          "user-key": "e27ebe249bf6837584304788457085eb",
        },
      }).then(function (response) {
        var randomInd = Math.floor(Math.random() * 20);

        var randomRestaurant = response.restaurants[randomInd].restaurant.name;
        var mainURL = response.restaurants[randomInd].restaurant.url;
        var menuURL = response.restaurants[randomInd].restaurant.menu_url;
        var featImg = $("<img>").attr("src", response.restaurants[randomInd].restaurant.featured_image);
        var restaurantEl = $("<a>").text(randomRestaurant);
        var menuEl = $("<a>").text("Menu");
        var restTiming = response.restaurants[randomInd].restaurant.timings;
        var timingEl = $("<div>").text("Hours of Operation: "+restTiming);
        var restCuisine = response.restaurants[randomInd].restaurant.cuisines;
        var cuisineEl = $("<div>").text("Cuisine: "+restCuisine);
        var restRating = response.restaurants[randomInd].restaurant.user_rating.aggregate_rating;
        var ratingEl = $("<div>").text("Aggregate Rating: "+restRating);
        var restLocation = response.restaurants[randomInd].restaurant.location.address;
        var locLink = $("<a>").text(restLocation);

        menuEl.attr("href", menuURL);
        menuEl.attr("target", "_blank");
        restaurantEl.attr("href", mainURL);
        restaurantEl.attr("target", "_blank");
        locLink.attr("href", "https://google.com/maps/place/" + restLocation.replace(/\s+/g, "+"));
        locLink.attr("target", "_blank");
 
        //alert("OK" + "<br>" + restaurantEl + "<br>" + locLink + "<br>" + ratingEl + "<br>" + cuisineEl + "<br>" + menuEl + "<br>" + timingEl + "<br>" + featImg);
        $("#restaurantinfo-div").append(restaurantEl,"<br>" , locLink, ratingEl, cuisineEl, menuEl, timingEl, featImg,"<br><p style='background-color:#64A7FE;color:#FFFFFF'><b>Tap button again for another eatery!</b></p>");
       // document.getElementById("restaurantinfo-div").innerHTML = "OK" + "<br>" + restaurantEl + "<br>" + locLink + "<br>" + ratingEl + "<br>" + cuisineEl + "<br>" + menuEl + "<br>" + timingEl + "<br>" + featImg;
      });
    }
    getRestaurants(userCity);
  });
}

function getLocationID(long, lat) {
  clearDiv("restaurantinfo-div");
  clearDiv("cityinfo-div");
  spin();
   spin2();
$.ajax( {
    url  : 'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + lat + ',' +  long + '&radius=' + randomradius + '&type=restaurant&key=AIzaSyC2oYu6gWezMlWH0C8ACn2mRl81ISqu4mc',
    success : function( data) {
        pids = data.results[randomInd].place_id;
        var restLocation = data.results[randomInd].vicinity;
       var city = restLocation.split(",");
       searchWeather(city[1].trim());
       var locLink = $("<a>").text(restLocation);
        locLink.attr("href", "https://google.com/maps/place/" + restLocation.replace(/\s+/g, "+"));
      locLink.attr("target", "_blank");
      $("#restaurantinfo-div").append("<h1>" + data.results[randomInd].name + '</h1>');
      var blnOpen = data.results[randomInd].opening_hours.open_now;
      if (blnOpen){
 $("#restaurantinfo-div").append("<b>Open Now? </b>" + "Yes<br>");
      }else{
$("#restaurantinfo-div").append("<b>Open Now? </b>" + "No<br>");
      }
      
      $("#restaurantinfo-div").append(locLink);
      $("#restaurantinfo-div").append("<br><img src='https://maps.googleapis.com/maps/api/place/photo?photoreference=" + data.results[randomInd].photos[0].photo_reference + "&sensor=false&maxheight=225&maxwidth=225&key=AIzaSyC2oYu6gWezMlWH0C8ACn2mRl81ISqu4mc'" + "/>");
      //"<br><p style='background-color:#64A7FE;color:#FFFFFF'><b>Tap button again for another eatery!</b></p>"
    }
});
}
function details(){
   //console.log("https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?place_id=" + pids + "&fields=formatted_phone_number&key=AIzaSyC2oYu6gWezMlWH0C8ACn2mRl81ISqu4mc");
$.ajax( {
    url  : "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?place_id=" + pids + "&fields=formatted_phone_number,website&key=AIzaSyC2oYu6gWezMlWH0C8ACn2mRl81ISqu4mc",
    success : function( data) {
        var gphonenum = data.result.formatted_phone_number;
        var gwww = data.result.website;
        if (gwww != null || gwww != undefined){
$("#restaurantinfo-div").append("<br>website: <a href='" + gwww + "' target='_blank'>link</a><br>");
}
if (gphonenum != undefined || gphonenum != null){
$("#restaurantinfo-div").append("<br>Phone: " + gphonenum + '<br>');
}
    }
});
$("#restaurantinfo-div").append("<br><p style='background-color:#64A7FE;color:#FFFFFF'><b>Tap the GO! button again for another eatery!</b></p>");
}
function getZipCode(zip) {
  //function to extract cityID of user input from zomato api
 // var userInput = $("#city-input").val();
//  var queryURL = "https://developers.zomato.com/api/v2.1/cities?q=" + userInput;
var queryURL = "https://public.opendatasoft.com/api/records/1.0/search/?dataset=us-zip-code-latitude-and-longitude&q=" + zip;
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    cityname = response.records[0].fields.city; //grabs the first location suggestion's ID
    document.getElementById('city-input').value = response.records[0].fields.city;
    alert(cityname);
      });
}


$("#select-city").on("click", function (event) {
  // creating the on click event to take in the user input city value
 event.preventDefault();
  let spinner = document.getElementById("loading");
spinner.style.visibility = 'visible'; //'hidden'
  //NEW ***************************
 // var zipname = $("#city-input").val().trim();
  //alert(zipname);
 // getZipCode(zipname);

 // alert(cityname);
 //  var inputCity = cityname; // $("#city-input").val().trim();
  
  //NEW ***************************
 var inputCity = $("#city-input").val().trim();
  clearDiv("restaurantinfo-div");
  clearDiv("cityinfo-div");

//alert(inputCity);
  searchWeather(inputCity);
  getCityID(inputCity);
setTimeout(scrollToBottom,3000);
});
function clearDiv(elementID) { 
            var div = document.getElementById(elementID); 
              
            while(div.firstChild) { 
                div.removeChild(div.firstChild); 
            } 
        } 
function showPosition(position) {
//results-container
        
clearDiv("restaurantinfo-div");
clearDiv("cityinfo-div");
let gresultsinfo = document.getElementById("results-container");
gresultsinfo.style.visibility = 'hidden'; //'hidden'
let gcityinfo = document.getElementById("cityinfo-div");
gcityinfo.style.visibility = 'hidden'; //'hidden'
    let ginfo = document.getElementById("restaurantinfo-div");
ginfo.style.visibility = 'hidden'; //'hidden'
    let btngo = document.getElementById("go");
btngo.style.visibility = 'hidden'; //'hidden'
 let spinner = document.getElementById("loading");
spinner.style.visibility = 'visible'; //'hidden'
  var long = position.coords.longitude;
  var lat = position.coords.latitude;
  console.log(lat);
    console.log(long);
  //getLocationID(long, lat);
  setTimeout(getLocationID(long, lat),1000)
  setTimeout(function(){ details(); }, 5000);
  setTimeout(scrollToBottom,7000);
}
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else { 
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}
function scrollToBottom() {
         window.scrollTo(0, document.body.scrollHeight);
         //document.body.style.cursor = 'default';
   let spinner = document.getElementById("loading");
spinner.style.visibility = 'hidden'; //'hidden'
    let btngo = document.getElementById("go");
btngo.style.visibility = 'visible'; //'hidden'
  let ginfo = document.getElementById("restaurantinfo-div");
ginfo.style.visibility = 'visible'; //'hidden'
let gcityinfo = document.getElementById("cityinfo-div");
gcityinfo.style.visibility = 'visible'; //'hidden'
let gresultsinfo = document.getElementById("results-container");
gresultsinfo.style.visibility = 'visible'; //'hidden'
}
