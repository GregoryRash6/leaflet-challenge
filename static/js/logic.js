// Earthquake URL
var earthquakesURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Plates URL
var platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Earthquake LayerGroup
var earthquakes = new L.LayerGroup();

// Plates LayerGroup
var tectonicPlates = new L.LayerGroup();

// Satellite Tile Layer
var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
});

// Grayscale Tile Layer
var grayscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "light-v10",
  accessToken: API_KEY
});

// Outdoor Tile Layer
var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "outdoors-v11",
  accessToken: API_KEY
});

// Dark Tile Layer
var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "dark-v10",
  accessToken: API_KEY
});

// Define baseMaps
var baseMaps = {
    "Satellite": satelliteMap,
    "Grayscale": grayscaleMap,
    "Outdoors": outdoorsMap,
    "Dark": darkMap
};

// Define overlayMaps
var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines": tectonicPlates
};

// Create Map
var myMap = L.map("map", {
    center: [15.5994, -28.6731],
    zoom: 3,
    layers: [satelliteMap, earthquakes]
});

// Create a Layer Control
L.control.layers(baseMaps, overlayMaps).addTo(myMap);

// D3 Retrieval 
d3.json(earthquakesURL, function(earthquakeData) {
    // Function to Determine Size of Marker
    function markerSize(magnitude) {
        if (magnitude === 0) {
          return 1;
        }
        return magnitude * 3;
    }
    // Function to Determine Style of Marker
    function styleInfo(feature) {
        return {
          opacity: 1,
          fillOpacity: 1,
          fillColor: chooseColor(feature.properties.mag),
          color: "#000000",
          radius: markerSize(feature.properties.mag),
          stroke: true,
          weight: 0.5
        };
    }
    // Function to Determine Color of Marker
    function chooseColor(magnitude) {
        switch (true) {
        case magnitude > 5:
            return "#bd0026";
        case magnitude > 4:
            return "#f03b20";
        case magnitude > 3:
            return "#fd8d3c";
        case magnitude > 2:
            return "#feb24c";
        case magnitude > 1:
            return "#fed976";
        default:
            return "#ffffb2";
        }
    }
    // Create a GeoJSON Layer
    L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h4>Location: " + feature.properties.place + 
            "</h4><hr><p>Date & Time: " + new Date(feature.properties.time) + 
            "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
        }
    // Add earthquakeData 
    }).addTo(earthquakes);
    // Add earthquakes Layer
    earthquakes.addTo(myMap);

    // D3 Retrieval
    d3.json(platesURL, function(plateData) {
        // Create a GeoJSON Layer
        L.geoJson(plateData, {
            color: "#DC143C",
            weight: 2
        // Add plateData
        }).addTo(tectonicPlates);
        // Add tectonicPlates Layer
        tectonicPlates.addTo(myMap);
    });

    // Set Up Legend
    var legend = L.control({ position: "bottomleft" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend"), 
        magnitudeLevels = [0, 1, 2, 3, 4, 5];

        div.innerHTML += "<h3>Magnitude</h3>"

        for (var i = 0; i < magnitudeLevels.length; i++) {
            div.innerHTML +=
                '<i style="background: ' + chooseColor(magnitudeLevels[i] + 1) + '"></i> ' +
                magnitudeLevels[i] + (magnitudeLevels[i + 1] ? '&ndash;' + magnitudeLevels[i + 1] + '<br>' : '+');
        }
        return div;
    };
    // Add Legend
    legend.addTo(myMap);
});