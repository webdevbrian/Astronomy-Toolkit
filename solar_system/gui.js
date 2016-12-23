var datGUI;
var pauseButton;
var followDropDown;
var followedObjectName = "None";

function loadGUI(){
  datGUI = new dat.GUI({autoplace: false});
  var container = document.getElementById("guiContainer");
  container.appendChild(datGUI.domElement);
  datGUI.domElement.style.zIndex = 999999;

  datGUI.add(this, 'timeWarp', -100000000, +100000000).name("Time Warp").listen();
  pauseButton = datGUI.add(this, 'tooglePause').name("Pause").listen();
  createFollowablePlanetsArray();
}

function tooglePause(){
  paused = !paused;
  if(paused)
    pauseButton.name("Start");
  else
    pauseButton.name("Pause");
}

function createFollowablePlanetsArray(){
  var array = ["None"];
  for(body of followablePlanets){
      array.push(body.name);
  }
  followDropDown = datGUI.add(this, 'followedObjectName', array).name("Follow").onChange(followListener);
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
