function getSearchResults(searchQuerry){
  $.getJSON('../cgi-bin/getBody.py', { name: searchQuerry }, function(data) {
    $.each(data, function(index, element) {
      var body = new CelestialBody(element.name, element.semiMajorAxis, element.eccentricty,
         element.inclination, element.longitudeOfNode, element.longitudeOfPericenter, element.meanAnomaly2000);
      var bodySprite = new CelestialBodySprite(body, planetSprite, 20, true);
      var orbit = new Orbit(body, getRandomColorHex());

      planets.push(body);
      celestialBodySprites.push(bodySprite);
      orbits.push(orbit);
      addResult(bodySprite, orbit);
    });
  });

}

function getRandomColorHex(){
  return parseInt(randomColor().replace("#", "0x"));
}
