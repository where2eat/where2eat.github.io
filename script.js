//Where2Eat\
var myFun1;
var myFun2;
blnGo1 = false;
blnGo2 = false;
var pids='';
var cityname;
var numbers = []; 
var ranges = []; 
var randomInd;
var randomradius;
let gresultsinfo = document.getElementById("results-container");
gresultsinfo.style.visibility = 'hidden'; //'hidden'
function timer1(){
    if (blnGo1) { 
        blnGo1 = false;
        clearInterval(myFun1);    
        alert("timer1");
        details();    
    } 
}
function timer2(){
    if (blnGo2) { 
        blnGo2 = false;
        clearInterval(myFun2); 
        alert("timer2");
        scrollToBottom();      
    } 
}
function generateNumbers()
        {
            // populate the available numbers however you need to..
            for(var i=0; i<20; i+=1)
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
            for(var i=1500; i<21000; i+=1000)
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
      $("#restaurantinfo-div").append("<h1>" + data.results[randomInd].name + "</h1>");
       console.log(randomradius);
      console.log(data.results[0].name);
     try {
  console.log(data.results[19].name);
}
catch(err) {
  console.log(err.message);
}
      $("#restaurantinfo-div").append(locLink);
      $("#restaurantinfo-div").append("<br>");
        //<br>
           try {
       $("#restaurantinfo-div").append("<img src='https://maps.googleapis.com/maps/api/place/photo?photoreference=" + data.results[randomInd].photos[0].photo_reference + "&sensor=false&maxheight=225&maxwidth=225&key=AIzaSyC2oYu6gWezMlWH0C8ACn2mRl81ISqu4mc'" + "/>");
}
catch(err) {
   $("#restaurantinfo-div").append("[NO IMAGE FOUND]");
}
      $("#restaurantinfo-div").append("<br>");
      try {
        var blnOpen = data.results[randomInd].opening_hours.open_now;
      console.log(blnOpen);
      if (blnOpen){
 $("#restaurantinfo-div").append("<b>Open Now? </b>" + "Yes");
      }else{
$("#restaurantinfo-div").append("<b>Open Now? </b>" + "No");
      }
}
catch(err) {
   $("#restaurantinfo-div").append("<b>Open Now? </b>" + "N/A");
}
      $("#restaurantinfo-div").append("<br>");
    }
});
}
function details(){
$.ajax( {
    url  : "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?place_id=" + pids + "&fields=formatted_phone_number,website&key=AIzaSyC2oYu6gWezMlWH0C8ACn2mRl81ISqu4mc",
    success : function( data) {
        var gphonenum = data.result.formatted_phone_number;
        var gwww = data.result.website;
if (gwww != null || gwww != undefined){
$("#restaurantinfo-div").append("website: <a href='" + gwww + "' target='_blank'>link</a>");
}
$("#restaurantinfo-div").append("<br>");
if (gphonenum != undefined || gphonenum != null){
$("#restaurantinfo-div").append("<a href='tel:" + gphonenum + "'>" + gphonenum + "</a>");
}
$("#restaurantinfo-div").append("<br>");
$("#restaurantinfo-div").append("<br><p style='background-color:#64A7FE;color:#FFFFFF'><b>Tap GO! button above for another eatery!</b></p>");
    }
});
blnGo2 = true;
}
function getZipCode(zip) {
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

function clearDiv(elementID) { 
var div = document.getElementById(elementID); 
while(div.firstChild) { 
  div.removeChild(div.firstChild); 
} 
} 
function showPosition(position) {
let btngo = document.getElementById("go");  
btngo.style.visibility = 'hidden'; //'hidden'
let ginfo = document.getElementById("restaurantinfo-div");
ginfo.style.visibility = 'hidden'; //'hidden'
let gresultsinfo = document.getElementById("results-container");
gresultsinfo.style.visibility = 'hidden'; //'hidden'
let gcityinfo = document.getElementById("cityinfo-div");
gcityinfo.style.visibility = 'hidden'; //'hidden'
 let spinner = document.getElementById("loading");
spinner.style.visibility = 'visible'; //'hidden'
clearDiv("restaurantinfo-div");
clearDiv("cityinfo-div");
  var long = position.coords.longitude;
  var lat = position.coords.latitude;
  setTimeout(getLocationID(long, lat),1000)
  setTimeout(details, 5000);
  //setTimeout(function(){ details(); }, 5000);
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
  let ginfo = document.getElementById("restaurantinfo-div");
ginfo.style.visibility = 'visible'; //'hidden'
let gcityinfo = document.getElementById("cityinfo-div");
gcityinfo.style.visibility = 'visible'; //'hidden'
let gresultsinfo = document.getElementById("results-container");
gresultsinfo.style.visibility = 'visible'; //'hidden'
    let btngo = document.getElementById("go");
btngo.style.visibility = 'visible'; //'hidden'
}
