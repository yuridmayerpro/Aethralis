// Função para carregar o GeoJSON dos marcadores
function loadMarkers() {
    fetch('map_data/Aethralis Markers.geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                pointToLayer: function (feature, latlng) {
                    var properties = feature.properties || {};
                    var markerName = properties.Name || "Nome não definido";
                    var markerNote = properties.Note || "Sem descrição disponível";
                    var markerIcon = properties.Icon || "⚠️";

                    var marker = L.marker(latlng, {
                        icon: getCustomIcon(markerIcon)
                    });

                    marker.bindPopup("<b>" + markerName + "</b><br>" + markerNote);
                    marker.bindTooltip(markerName, { direction: "top" });

                    addMarkerToLayer(marker, properties.Type || "Desconhecido");

                    return marker;
                }
            });
        })
        .catch(error => console.error('Erro ao carregar o GeoJSON dos marcadores:', error));
}

// Função para carregar o GeoJSON das rotas
function loadRoutes() {
    fetch('map_data/Aethralis Routes.geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                style: routeStyle,
                onEachFeature: function (feature, layer) {
                    var group = feature.properties.group;
                    layer.bindPopup("<b>Grupo de Rota: </b>" + group);
                    addRouteToLayer(layer, group);
                }
            });
        })
        .catch(error => console.error('Erro ao carregar o GeoJSON das rotas:', error));
}

// Função para carregar o GeoJSON dos rios
function loadRivers() {
    fetch('map_data/Aethralis Rivers.geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                style: riverStyle,
                onEachFeature: function (feature, layer) {
                    var riverName = feature.properties.name;
                    layer.bindPopup("<b>Rio: </b>" + riverName);
                    addRiverToLayer(layer, riverName);
                }
            });
        })
        .catch(error => console.error('Erro ao carregar o GeoJSON dos rios:', error));
}

// Função para carregar o GeoJSON das cidades
function loadCities() {
    fetch('map_data/Aethralis Burgs.geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                pointToLayer: function (feature, latlng) {
                    var properties = feature.properties || {};
                    var cityName = properties.Burg || "Nome não definido";
                    var isCapital = properties.Capital !== null;

                    var marker = L.marker(latlng, {
                        icon: getCityIcon(cityName, isCapital)
                    });

                    var cityPopupContent = "<b>Cidade: " + cityName + "</b><br>" +
                        "Província: " + (properties.Province || "Província não definida") + "<br>" +
                        "Estado: " + (properties.State || "Estado não definido") + "<br>" +
                        "Cultura: " + (properties.Culture || "Cultura não definida") + "<br>" +
                        "Religião: " + (properties.Religion || "Religião não definida") + "<br>" +
                        "População: " + (properties.Population || "População não definida");

                    marker.bindPopup(cityPopupContent);

                    // Adicionar o marcador ao grupo de capitais ou não capitais
                    if (isCapital) {
                        capitalLayerGroup.addLayer(marker);
                    } else {
                        nonCapitalLayerGroup.addLayer(marker);
                    }

                    return marker;
                }
            });
        })
        .catch(error => console.error('Erro ao carregar o GeoJSON das cidades:', error));
}