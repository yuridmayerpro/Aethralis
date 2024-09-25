// Inicializar o mapa com um zoom mínimo de 4
var map = L.map('map', {
    minZoom: 4,
    maxZoom: 8
}).setView([35.2016, 0], 4);

// Camada base especificada, também com zoom mínimo
var tilesource_layer = L.tileLayer('map/{z}/{x}/{y}.png', {
    attribution: 'Created by QGIS',
    minZoom: 4
}).addTo(map);

// Objeto para armazenar os grupos de camadas
var layerGroups = {};

// Variável global para o controle de camadas
var groupedLayersControl;

// Variáveis globais para os grupos de camadas
var markersLayerGroup = L.layerGroup();  // Marcadores de rota
var routeLayerGroup = L.layerGroup();    // Rota calculada


// CÁLCULO DE ROTAS
var speedOnFoot = 5;    // Velocidade média a pé
var speedByHorse = 15;  // Velocidade média a cavalo
var speedByWagon = 10;  // Velocidade média de carroça
var travelHoursPerDay = 12; // Número de horas de viagem por dia

var startNodeId = null;
var endNodeId = null;
var startMarker = null;
var endMarker = null;
var pathLayer = null;

function initializeDraggableMarkers() {
    startMarker = L.marker(map.getCenter(), {
        draggable: true,
        icon: startIcon
    });
    endMarker = L.marker(map.getCenter(), {
        draggable: true,
        icon: endIcon
    });

    startMarker.on('dragend', function() {
        updateRoute();
    });

    endMarker.on('dragend', function() {
        updateRoute();
    });

    markersLayerGroup.addLayer(startMarker);
    markersLayerGroup.addLayer(endMarker);

    updateRoute();
}

function updateRoute() {
    if (!map.hasLayer(startMarker) || !map.hasLayer(endMarker)) {
        return;
    }

    var startLatLng = startMarker.getLatLng();
    var endLatLng = endMarker.getLatLng();

    var startNearest = findNearestNode([startLatLng.lng, startLatLng.lat]);
    var endNearest = findNearestNode([endLatLng.lng, endLatLng.lat]);

    if (!startNearest || !endNearest) {
        alert('Não foi possível encontrar nós de rota próximos aos marcadores.');
        return;
    }

    startNodeId = startNearest.id;
    endNodeId = endNearest.id;

    var path = findShortestPath(startNodeId, endNodeId);
    if (path) {
        var latlngs = path.map(function(nodeId) {
            var coord = window.routeGraph[nodeId].coord;
            return [coord[1], coord[0]]; // [lat, lng]
        });

        routeLayerGroup.clearLayers();
        pathLayer = L.polyline(latlngs, { color: 'blue', weight: 5 });
        routeLayerGroup.addLayer(pathLayer);

        var totalDistance = 0;
        for (var i = 1; i < latlngs.length; i++) {
            var p1 = L.latLng(latlngs[i - 1][0], latlngs[i - 1][1]);
            var p2 = L.latLng(latlngs[i][0], latlngs[i][1]);
            totalDistance += p1.distanceTo(p2);
        }
        var totalDistanceKm = totalDistance / 1000;

        var timeOnFoot = totalDistanceKm / speedOnFoot / travelHoursPerDay;
        var timeByHorse = totalDistanceKm / speedByHorse / travelHoursPerDay;
        var timeByWagon = totalDistanceKm / speedByWagon / travelHoursPerDay;

        function formatTimeInDays(days) {
            return days.toFixed(0) + ' dias';
        }

        var popupContent = '<b>Informações da Rota</b><br>' +
            'Distância: ' + totalDistanceKm.toFixed(2) + ' km<br>' +
            'Tempo a pé: ' + formatTimeInDays(timeOnFoot) + '<br>' +
            'Tempo a cavalo: ' + formatTimeInDays(timeByHorse) + '<br>' +
            'Tempo de carroça: ' + formatTimeInDays(timeByWagon);

        endMarker.unbindPopup();
        endMarker.bindPopup(popupContent).openPopup();
    } else {
        alert('Nenhuma rota encontrada entre os pontos selecionados.');
    }
}

function findNearestNode(coord) {
    var searchRadius = 2;
    var searchResults = window.nodeTree.search({
        minX: coord[0] - searchRadius,
        minY: coord[1] - searchRadius,
        maxX: coord[0] + searchRadius,
        maxY: coord[1] + searchRadius
    });
    if (searchResults.length === 0) {
        return null;
    }

    var minDist = Infinity;
    var nearest = null;
    searchResults.forEach(function(result) {
        var nodeCoord = [result.minX, result.minY];
        var dist = getDistance(coord, nodeCoord);
        if (dist < minDist) {
            minDist = dist;
            nearest = result;
        }
    });
    return nearest;
}

function getDistance(coord1, coord2) {
    var dx = coord1[0] - coord2[0];
    var dy = coord1[1] - coord2[1];
    return Math.sqrt(dx * dx + dy * dy);
}

function findShortestPath(startNodeId, endNodeId) {
    var distances = {};
    var previous = {};
    var queue = new TinyQueue([], function(a, b) {
        return a.priority - b.priority;
    });

    for (var nodeId in window.routeGraph) {
        distances[nodeId] = Infinity;
    }
    distances[startNodeId] = 0;

    queue.push({id: startNodeId, priority: 0});

    while (queue.length) {
        var current = queue.pop();
        var currentId = current.id;

        if (currentId === endNodeId) {
            var path = [];
            var node = endNodeId;
            while (node) {
                path.unshift(node);
                node = previous[node];
            }
            return path;
        }

        var neighbors = window.routeGraph[currentId].neighbors;
        for (var i = 0; i < neighbors.length; i++) {
            var neighborId = neighbors[i];
            var alt = distances[currentId] + getDistance(
                window.routeGraph[currentId].coord,
                window.routeGraph[neighborId].coord
            );
            if (alt < distances[neighborId]) {
                distances[neighborId] = alt;
                previous[neighborId] = currentId;
                queue.push({id: neighborId, priority: alt});
            }
        }
    }

    return null;
}


map.on('overlayremove', function(event) {
    if (event.layer === routeLayerGroup) {
        routeLayerGroup.clearLayers();
    }
});

var startIcon = L.icon({
    iconUrl: 'images/start-icon.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

var endIcon = L.icon({
    iconUrl: 'images/end-icon.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});
