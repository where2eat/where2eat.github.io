var queryURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=42.271131, -89.093995&radius=10000&type=restaurant&key=AIzaSyC2oYu6gWezMlWH0C8ACn2mRl81ISqu4mc';
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
        var randomInd = Math.floor(Math.random() * 50);

        var randomRestaurant = response.results[randomInd].name;
        var mainURL = response.restaurants[randomInd].vicinity;
 alert(randomRestaurant);
     alert(mainURL);
        //alert("OK" + "<br>" + restaurantEl + "<br>" + locLink + "<br>" + ratingEl + "<br>" + cuisineEl + "<br>" + menuEl + "<br>" + timingEl + "<br>" + featImg);
        //$("#restaurantinfo-div").append(randomRestaurant,"<br>" , mainURL,"<br><p style='background-color:#64A7FE;color:#FFFFFF'><b>Tap button again for another eatery!</b></p>");
       // document.getElementById("restaurantinfo-div").innerHTML = "OK" + "<br>" + restaurantEl + "<br>" + locLink + "<br>" + ratingEl + "<br>" + cuisineEl + "<br>" + menuEl + "<br>" + timingEl + "<br>" + featImg;
      });
    }
}
