// Variável global para o controle de camadas
var groupedLayersControl;

function getCustomIcon(iconEmoji) {
    return L.divIcon({
        className: 'custom-icon',
        html: iconEmoji,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
}

function addRouteToLayer(layer, group) {
    if (!layerGroups[group]) {
        layerGroups[group] = L.layerGroup();
    }
    layerGroups[group].addLayer(layer);
}

function routeStyle(feature) {
    var group = feature.properties.group;
    var style = {
        color: "#000000",
        weight: 2,
        opacity: 0.8,
        dashArray: '5, 5'
    };

    if (group === 'roads') {
        style.color = '#8D502A';
        style.weight = 5;
    } else if (group === 'trails') {
        style.color = '#924217';
        style.weight = 2;
    } else if (group === 'searoutes') {
        style.color = '#B16925';
        style.weight = 3;
    }

    return style;
}

function riverStyle(feature) {
    return {
        color: '#1E90FF',
        weight: feature.properties.width * 10 || 2,
        opacity: 0.6
    };
}

function getCityIcon(cityName, isCapital) {
    if (isCapital) {
        return L.divIcon({
            className: 'custom-city-icon',
            html: `<div class="city-star">★</div><div class="city-name-bold">${cityName}</div>`,
            iconSize: [60, 30],
            iconAnchor: [12, 10],
            popupAnchor: [0, -10]
        });
    } else {
        return L.divIcon({
            className: 'custom-city-icon',
            html: `<div class="city-point"></div><div class="city-name">${cityName}</div>`,
            iconSize: [50, 20],
            iconAnchor: [12, 10],
            popupAnchor: [0, -10]
        });
    }
}

var capitalLayerGroup = L.layerGroup();
var nonCapitalLayerGroup = L.layerGroup();

layerGroups['Capitais'] = capitalLayerGroup;
layerGroups['Não Capitais'] = nonCapitalLayerGroup;

function initializeLayerControl() {
    var baseLayers = {
        'Mapa Base': tilesource_layer
    };

    var groupedOverlays = {
        'Marcadores': {
            'Pontos de Interesse': layerGroups['Pontos de Interesse']
        },
        'Transporte': {
            'Marcadores de Rota': markersLayerGroup,
            'Caminho Calculado': routeLayerGroup,
            'Roads': layerGroups['roads'],
            'Trails': layerGroups['trails'],
            'Searoutes': layerGroups['searoutes']
        },
        'Sistema hídrico': {
            'Rios': layerGroups['Rios']
        },
        'Cidades': {
            'Capitais': layerGroups['Capitais'],
            'Não Capitais': layerGroups['Não Capitais']
        },
        'Camadas': {
            'Biomas': layerGroups['Biomas'],
            'Culturas': layerGroups['Culturas'],
            'Estados': layerGroups['Estados']
        }
    };

    groupedLayersControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
        groupCheckboxes: true
    }).addTo(map);

    applyStylesToLayerControl();

    // Atualizar a legenda conforme as camadas são ativadas/desativadas
    map.on('overlayadd', function (event) {
        if (event.layer === layerGroups['Biomas']) {
            updateLegend(window.biomeColors);
        } else if (event.layer === layerGroups['Culturas']) {
            updateLegend(window.cultureColors);
        } else if (event.layer === layerGroups['Estados']) {
            updateLegend(window.stateColors);
        }
    });

    map.on('overlayremove', function (event) {
        if (event.layer === layerGroups['Biomas'] ||
            event.layer === layerGroups['Culturas'] ||
            event.layer === layerGroups['Estados']) {
            legend.remove();
        }
    });
}

function applyStylesToLayerControl() {
    setTimeout(function() {
        var allLabels = document.querySelectorAll('.leaflet-control-layers label');

        allLabels.forEach(function(label) {
            if (label.classList.contains('leaflet-control-layers-group-label')) {
                var span = label.querySelector('span');
                if (span) {
                    span.style.fontSize = '100%';
                    span.style.color = '#000';
                    span.style.fontWeight = 'bold';
                    span.style.marginLeft = '0';
                }
                var checkbox = label.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.style.marginLeft = '0';
                }
            } else {
                var span = label.querySelector('span');
                if (span) {
                    span.style.fontSize = '90%';
                    span.style.color = '#666';
                    span.style.marginLeft = '15px';
                }
                var checkbox = label.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.style.marginLeft = '15px';
                }
            }
        });
    }, 100);
}
