function openCity(evt, cityName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " active";
}

// Get the element with id="defaultOpen" and click on it
var tabChooser = Math.floor(Math.random() * 3);
var tabChooser2 = Math.floor(Math.random() * 3);
document.getElementById("defaultOpen"+tabChooser).click();
document.getElementById("defaultOpenProject"+tabChooser2).click();

function openProjects(evt, cityName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("projectcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("projectlinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " active";
}

function openHobbies(evt, cityName) {
  // Declare all variables
  var i, hobbycontent, hobbylinks;

  // Get all elements with class="tabcontent" and hide them
  hobbycontent = document.getElementsByClassName("hobbycontent");
  for (i = 0; i < hobbycontent.length; i++) {
    if (hobbycontent[i].style.display == "none") {
      hobbycontent[i].style.display = "block";
      console.log(evt.currentTarget.className);
      evt.currentTarget.className += " active";
      console.log(evt.currentTarget.className);
    } else {
      hobbycontent[i].style.display = "none";
      // remove " active" from the button class name so it doesn't highlight when closed
      evt.currentTarget.className = evt.currentTarget.className.substring(0, evt.currentTarget.className.length - 7);
    }
  }
}
