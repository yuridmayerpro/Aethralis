// Função para carregar o GeoJSON dos Pontos de Interesse (POIs)
function loadMarkers() {
    fetch('map_data/Aethralis Markers.geojson')
        .then(response => response.json())
        .then(data => {
            var poiLayerGroup = L.layerGroup();  // Criar um LayerGroup para os Pontos de Interesse

            // Adicionar os pontos de interesse ao LayerGroup
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

                    // Adicionar o marcador ao LayerGroup de Pontos de Interesse
                    poiLayerGroup.addLayer(marker);  
                    return marker;
                }
            });

            // Adicionar o LayerGroup dos Pontos de Interesse ao controle de camadas
            groupedLayersControl.addOverlay(poiLayerGroup, "Pontos de Interesse");

            // Aplicar o estilo em negrito para Pontos de Interesse
            applyBoldStyleToLayers();  // Aplicar o estilo em negrito
        })
        .catch(error => console.error('Erro ao carregar o GeoJSON dos Pontos de Interesse:', error));
}


// Função para aplicar estilo em negrito à opção "Pontos de Interesse"
function applyBoldStyleToLayers() {
    setTimeout(function() {
        var labels = document.querySelectorAll('.leaflet-control-layers-overlays label span');
        labels.forEach(function(label) {
            if (label.textContent.trim() === 'Pontos de Interesse') {
                label.style.fontWeight = 'bold';  // Aplica o estilo negrito
            }
        });
    }, 100);  // Pequeno atraso para garantir que o DOM esteja atualizado
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
            // Criar um LayerGroup para os rios
            var riverLayerGroup = L.layerGroup();

            L.geoJSON(data, {
                style: riverStyle,  // Definir o estilo dos rios
                onEachFeature: function (feature, layer) {
                    var riverName = feature.properties.name;
                    layer.bindPopup("<b>Rio: </b>" + riverName);  // Popup com o nome do rio
                    riverLayerGroup.addLayer(layer);  // Adicionar cada rio ao LayerGroup
                }
            });

            // Adicionar o LayerGroup dos rios fora de qualquer grupo
            groupedLayersControl.addOverlay(riverLayerGroup, "Rios");

            // Aplicar negrito à opção "Rios" no seletor de camadas após o controle ser atualizado
            applyBoldStyleToRivers();
        })
        .catch(error => console.error('Erro ao carregar o GeoJSON dos rios:', error));
}

// Função para aplicar estilo em negrito à opção "Rios"
function applyBoldStyleToRivers() {
    // Espera um pequeno tempo para garantir que o controle de camadas foi atualizado
    setTimeout(function() {
        // Selecionar todas as opções de camadas
        var labels = document.querySelectorAll('.leaflet-control-layers-overlays label span');
        labels.forEach(function(label) {
            if (label.textContent.trim() === 'Rios') {  // Verifica se o texto é 'Rios'
                label.style.fontWeight = 'bold';  // Aplica o estilo negrito
            }
        });
    }, 100);  // Pequeno atraso para garantir que o DOM esteja atualizado
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
                    var cityGeneratorLink = properties["City Generator Link"] || null;  // Link do gerador de cidades

                    // Verifica se o campo "City Generator Link" está presente e cria o link encurtado
                    var cityLinkHTML = cityGeneratorLink ? `<br><a href="${cityGeneratorLink}" target="_blank">Mapa da cidade</a>` : '';

                    var marker = L.marker(latlng, {
                        icon: getCityIcon(cityName, isCapital)
                    });

                    var cityPopupContent = "<b>Cidade: " + cityName + "</b><br>" +
                        "Província: " + (properties.Province || "Província não definida") + "<br>" +
                        "Estado: " + (properties.State || "Estado não definido") + "<br>" +
                        "Cultura: " + (properties.Culture || "Cultura não definida") + "<br>" +
                        "Religião: " + (properties.Religion || "Religião não definida") + "<br>" +
                        "População: " + (properties.Population || "População não definida") + "<br>" +
                        "Elevação: " + (properties['Elevation (m)'] || "Elevação não definida") + "<br>" +
                        "Temperatura: " + (properties.Temperature || "Temperatura não definida") + "<br>";
                        // Verifica se há um link do City Generator
                        if (properties['City Generator Link']) {
                            cityPopupContent += '<br><a href="' + properties['City Generator Link'] + '" target="_blank">Mapa da cidade</a>';
                        }

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


// Função para carregar os biomas
function loadBiomes() {
    // Carregar o CSV com os biomas e suas cores
    fetch('map_data/Aethralis Biomes.csv')
        .then(response => response.text())
        .then(csvText => {
            const biomeColors = {};
            const lines = csvText.split('\n').slice(1);  // Ignora a primeira linha (cabeçalhos)
            lines.forEach(line => {
                const [id, name, color] = line.split(',');
                biomeColors[id] = { name, color };  // Associa ID do bioma com seu nome e cor
            });

            // Carregar o GeoJSON dos biomas
            fetch('map_data/Aethralis Cells.geojson')
                .then(response => response.json())
                .then(data => {
                    // Criar a camada Choropleth
                    const biomeLayer = L.geoJSON(data, {
                        style: function (feature) {
                            const biomeId = feature.properties.biome;
                            const biomeColor = biomeColors[biomeId] ? biomeColors[biomeId].color : '#000000';  // Cor padrão se o bioma não for encontrado

                            return {
                                fillColor: biomeColor,  // Cor de preenchimento do bioma
                                weight: 0.5,  // Espessura do contorno
                                opacity: 0.5,  // Opacidade do contorno
                                color: biomeColor,  // Usar a mesma cor do preenchimento para o contorno
                                fillOpacity: 0.7  // Opacidade do preenchimento do bioma
                            };
                        }
                    });

                    // Adicionar a camada de biomas ao controle de camadas
                    groupedLayersControl.addOverlay(biomeLayer, "Biomas", "Camadas");

                    // Definir o comportamento de exibição da legenda quando a camada for ativada/desativada
                    map.on('overlayadd', function (eventLayer) {
                        if (eventLayer.name === 'Biomas') {
                            showBiomeLegend(biomeColors);  // Mostrar legenda
                        }
                    });

                    map.on('overlayremove', function (eventLayer) {
                        if (eventLayer.name === 'Biomas') {
                            hideBiomeLegend();  // Esconder legenda
                        }
                    });
                })
                .catch(error => console.error('Erro ao carregar o GeoJSON dos biomas:', error));
        })
        .catch(error => console.error('Erro ao carregar o CSV dos biomas:', error));
}

