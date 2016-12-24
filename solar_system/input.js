var datGUI;
var pauseButton;
var followDropDown;
var followedObjectName = "None";
var followableNames = []

var showAsteroids = true;

var searchString = "Ceres";
var searchResultsShow = [];
var searchResultsFolder;
var searchResultsSprites = [];
var searchResultsOrbits = [];
var resultIndex = 0;

createFollowablePlanetsArray();

function loadGUI(){
  datGUI = new dat.GUI({autoplace: false});
  var container = document.getElementById("guiContainer");
  container.appendChild(datGUI.domElement);

  datGUI.add(this, 'timeWarp', -100000000, +100000000).name("Time Warp").step(1).listen();
  pauseButton = datGUI.add(this, 'tooglePause').name("Pause").listen();
  datGUI.add(this, 'showAsteroids').name("Show Asteroid Belts").onChange(toogleAsteroidBelts);

  followDropDown = datGUI.add(this, 'followedObjectName', followableNames).name("Follow").onChange(followListener).listen();

  searchFolder = datGUI.addFolder("Search");
  searchFolder.add(this, 'searchString').name("Designation");
  searchFolder.add(this, 'search').name("Search").listen();
  searchFolder.open();


}

function toogleAsteroidBelts(){
  if(showAsteroids){
    enableAsteroidBelts();
  }
  else{
    disableAsteroidBelts();
  }
}

function enableAsteroidBelts(){
  for(sprite of celestialBodySprites){
    if(sprite.flag == ASTEROID_BELT_FLAG){
      sprite.addTo(scene);
      sprite.shouldDisplay = true;
    }
  }
}

function disableAsteroidBelts(){
  for(sprite of celestialBodySprites){
    if(sprite.flag == ASTEROID_BELT_FLAG){
      sprite.removeFrom(scene);
      sprite.shouldDisplay = false;
    }
  }
}

function search(){
  resultIndex = 0;
  searchResultsShow = [];
  searchResultsSprites = [];
  searchResultsOrbits = [];
  deleteGUI();
  loadGUI();
  searchResultsFolder = datGUI.addFolder("Search Results");
  searchResultsFolder.add(this, 'showAll').name("Show All");
  searchResultsFolder.add(this, 'hideAll').name("Hide All");
  getSearchResults(searchString);
}

function showAll(){
  for (var i = 0; i < searchResultsShow.length; i++){
    searchResultsShow[i] = true;
  }
  updateSearchResult();
}

function hideAll(){
  for (var i = 0; i < searchResultsShow.length; i++){
    searchResultsShow[i] = false;
  }
  updateSearchResult();
}

function addResult(resultSprite, resultOrbit){
  resultSprite.shouldDisplay = true;
  searchResultsShow.push(true);
  searchResultsFolder.add(searchResultsShow, resultIndex).name(resultSprite.planet.name).listen().onChange(updateSearchResult);
  searchResultsSprites.push(resultSprite);
  searchResultsOrbits.push(resultOrbit);
  searchResultsFolder.open();
  updateSearchResult();
  resultIndex++;
}

function deleteGUI(){
  var container = document.getElementById("guiContainer");
  container.removeChild(datGUI.domElement);

}

function updateSearchResult(){
  for(var i = 0; i < searchResultsShow.length; i++){
    if(searchResultsShow[i]){
      searchResultsSprites[i].addTo(scene);
      scene.add(searchResultsOrbits[i].mesh);
      searchResultsSprites[i].shouldDisplay = true;
    }
    else{
      searchResultsSprites[i].removeFrom(scene);
      scene.remove(scene.getObjectById(searchResultsOrbits[i].mesh.id));
      searchResultsSprites[i].shouldDisplay = false;
    }

  }
}

function tooglePause(){
  paused = !paused;
  if(paused)
    pauseButton.name("Start");
  else
    pauseButton.name("Pause");
}

function createFollowablePlanetsArray(){
  followableNames = ["None"];
  console.log("uaie");
  for(body of followablePlanets){
      followableNames.push(body.name);
  }
}

function followListener(){
  if(followedObjectName == "None"){
    followedObjectId = -1;
  }
  else{
    for(var i = 0; i < celestialBodySprites.length; i++){
      if(celestialBodySprites[i].planet.name == followedObjectName){
        followedObjectId = i;
        console.log(i);
        break;
      }
    }
  }
}

window.onkeydown = function (e) {
    var code = e.keyCode ? e.keyCode : e.which;
    if (code === 32) { //SPACE key
      tooglePause();
    }
    else if(code === 39){ //RIGHT ARROW
      timeWarp *= 2;
    }
    else if(code === 37){  //LEFT ARROW
      timeWarp /= 2;
    }

    else if(code === 79){
      toogleOrbits();
    }

    if(code >= 49 && code <= 57){
      isZooming = true;
      zoomedFrames = 0;
      dollyOut(5);
    }

};
