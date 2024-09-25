
// Variáveis globais para as camadas, cores e legendas
var biomeLayer;
var cultureLayer;
var stateLayer;

window.biomeColors = {};
window.cultureColors = {};
window.stateColors = {};

// Elemento para a legenda
var legend = L.control({ position: 'bottomleft' });

// Função para atualizar a legenda com cores e nomes
function updateLegend(colors) {
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
        div.innerHTML = '<h4>Legenda</h4>';
        for (var id in colors) {
            var color = colors[id].color;
            var name = colors[id].name;
            div.innerHTML += `<i style="background:${color}"></i> ${name}<br>`;
        }
        return div;
    };
    legend.addTo(map);
}

// Função para exibir o popup com o nome do recurso específico
function bindLayerPopup(layer, colors, propertyName) {
    layer.on('click', function (event) {
        var feature = event.layer.feature;
        var id = feature.properties[propertyName];  // Pega o ID do bioma/cultura/estado
        var name = colors[id] ? colors[id].name : 'Nome não disponível';

        var popupContent = '<b>Nome: </b>' + name;
        L.popup()
            .setLatLng(event.latlng)
            .setContent(popupContent)
            .openOn(map);
    });
}

async function loadMarkers() {
    try {
        const response = await fetch('map_data/Aethralis Markers pt.geojson');
        const data = await response.json();

        var poiLayerGroup = L.layerGroup();

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

                poiLayerGroup.addLayer(marker);
                return marker;
            }
        });

        layerGroups['Pontos de Interesse'] = poiLayerGroup;

    } catch (error) {
        console.error('Erro ao carregar o GeoJSON dos Pontos de Interesse:', error);
    }
}

async function loadRoutes() {
    var routeGraph = {};
    var nodeTree = rbush();

    try {
        const response = await fetch('map_data/Aethralis Routes.geojson');
        const data = await response.json();

        L.geoJSON(data, {
            style: routeStyle,
            onEachFeature: function (feature, layer) {
                var group = feature.properties.group;
                layer.bindPopup("<b>Grupo de Rota: </b>" + group);
                addRouteToLayer(layer, group);

                var geometry = feature.geometry;
                if (geometry.type === "LineString") {
                    processCoordinates(geometry.coordinates);
                } else if (geometry.type === "MultiLineString") {
                    geometry.coordinates.forEach(function(coords) {
                        processCoordinates(coords);
                    });
                }
            }
        });

        window.routeGraph = routeGraph;
        window.nodeTree = nodeTree;

    } catch (error) {
        console.error('Erro ao carregar o GeoJSON das rotas:', error);
    }

    function processCoordinates(coordinates) {
        for (var i = 0; i < coordinates.length; i++) {
            var coord = coordinates[i];
            var nodeId = coord.toString();
            if (!routeGraph[nodeId]) {
                routeGraph[nodeId] = {
                    coord: coord,
                    neighbors: []
                };
                nodeTree.insert({
                    minX: coord[0],
                    minY: coord[1],
                    maxX: coord[0],
                    maxY: coord[1],
                    id: nodeId
                });
            }
            if (i > 0) {
                var prevCoord = coordinates[i - 1];
                var prevNodeId = prevCoord.toString();
                routeGraph[nodeId].neighbors.push(prevNodeId);
                routeGraph[prevNodeId].neighbors.push(nodeId);
            }
        }
    }
}

async function loadRivers() {
    try {
        const response = await fetch('map_data/Aethralis Rivers.geojson');
        const data = await response.json();

        var riverLayerGroup = L.layerGroup();

        L.geoJSON(data, {
            style: riverStyle,
            onEachFeature: function (feature, layer) {
                var riverName = feature.properties.name;
                layer.bindPopup("<b>Rio: </b>" + riverName);
                riverLayerGroup.addLayer(layer);
            }
        });

        layerGroups['Rios'] = riverLayerGroup;

    } catch (error) {
        console.error('Erro ao carregar o GeoJSON dos rios:', error);
    }
}

async function loadCities() {
    try {
        const response = await fetch('map_data/Aethralis Burgs.geojson');
        const data = await response.json();

        L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                var properties = feature.properties || {};
                var cityName = properties.Burg || "Nome não definido";
                var isCapital = properties.Capital !== null;
                var cityGeneratorLink = properties["City Generator Link"] || null;

                var cityLinkHTML = cityGeneratorLink ? `<br><a href="${cityGeneratorLink}" target="_blank">Mapa da cidade</a>` : '';

                var marker = L.marker(latlng, {
                    icon: getCityIcon(cityName, isCapital)
                });

                var cityPopupContent = "<b>Cidade: " + cityName + "</b><br>" +
                    "Província: " + (properties.Province || "Não definida") + "<br>" +
                    "Estado: " + (properties.State || "Não definido") + "<br>" +
                    "Cultura: " + (properties.Culture || "Não definida") + "<br>" +
                    "Religião: " + (properties.Religion || "Não definida") + "<br>" +
                    "População: " + (properties.Population || "Não definida") + "<br>" +
                    "Elevação: " + (properties['Elevation (m)'] || "Não definida") + "<br>" +
                    "Temperatura: " + (properties.Temperature || "Não definida") + "<br>" +
                    cityLinkHTML;

                marker.bindPopup(cityPopupContent);

                if (isCapital) {
                    capitalLayerGroup.addLayer(marker);
                } else {
                    nonCapitalLayerGroup.addLayer(marker);
                }
                return marker;
            }
        });

    } catch (error) {
        console.error('Erro ao carregar o GeoJSON das cidades:', error);
    }
}


async function loadBiomes() {
    try {
        const responseCSV = await fetch('map_data/Aethralis Biomes.csv');
        const csvText = await responseCSV.text();

        window.biomeColors = {};
        const lines = csvText.split('\n').slice(1);
        lines.forEach(line => {
            const [id, name, color] = line.split(',');
            window.biomeColors[id] = { name, color };
        });

        const responseGeoJSON = await fetch('map_data/Aethralis Cells.geojson');
        const data = await responseGeoJSON.json();

        biomeLayer = L.geoJSON(data, {
            style: function (feature) {
                const biomeId = feature.properties.biome;
                const biomeColor = window.biomeColors[biomeId] ?
                    window.biomeColors[biomeId].color : '#000000';

                return {
                    fillColor: biomeColor,
                    weight: 1,
                    opacity: 0.25,
                    color: biomeColor,
                    fillOpacity: 0.7
                };
            }
        });

        layerGroups['Biomas'] = biomeLayer;

        // Adicionar popup ao clicar na camada, mostrando o nome do bioma
        bindLayerPopup(biomeLayer, window.biomeColors, 'biome');

    } catch (error) {
        console.error('Erro ao carregar os biomas:', error);
    }
}

async function loadCultures() {
    try {
        const responseCSV = await fetch('map_data/Aethralis Cultures.csv');
        const csvText = await responseCSV.text();

        window.cultureColors = {};
        const lines = csvText.split('\n').slice(1);
        lines.forEach(line => {
            const [id, name, color] = line.split(',');
            window.cultureColors[id] = { name, color };
        });

        const responseGeoJSON = await fetch('map_data/Aethralis Cells.geojson');
        const data = await responseGeoJSON.json();

        cultureLayer = L.geoJSON(data, {
            style: function (feature) {
                const cultureId = feature.properties.culture;
                const cultureColor = window.cultureColors[cultureId] ?
                    window.cultureColors[cultureId].color : '#000000';

                return {
                    fillColor: cultureColor,
                    weight: 1,
                    opacity: 0.25,
                    color: cultureColor,
                    fillOpacity: 0.7
                };
            }
        });

        layerGroups['Culturas'] = cultureLayer;

        // Adicionar popup ao clicar na camada, mostrando o nome da cultura
        bindLayerPopup(cultureLayer, window.cultureColors, 'culture');

    } catch (error) {
        console.error('Erro ao carregar as culturas:', error);
    }
}

async function loadStates() {
    try {
        const responseCSV = await fetch('map_data/Aethralis States.csv');
        const csvText = await responseCSV.text();

        window.stateColors = {};
        const lines = csvText.split('\n').slice(1);
        lines.forEach(line => {
            const [id, name, fullName, form, color] = line.split(',');
            window.stateColors[id] = { name, color };
        });

        const responseGeoJSON = await fetch('map_data/Aethralis Cells.geojson');
        const data = await responseGeoJSON.json();

        stateLayer = L.geoJSON(data, {
            style: function (feature) {
                const stateId = feature.properties.state;
                const stateColor = window.stateColors[stateId] ?
                    window.stateColors[stateId].color : '#000000';

                return {
                    fillColor: stateColor,
                    weight: 1,
                    opacity: 0.25,
                    color: stateColor,
                    fillOpacity: 0.7
                };
            }
        });

        layerGroups['Estados'] = stateLayer;

        // Adicionar popup ao clicar na camada, mostrando o nome do estado
        bindLayerPopup(stateLayer, window.stateColors, 'state');
        
    } catch (error) {
        console.error('Erro ao carregar os estados:', error);
    }
}
