// Função para adicionar marcador à camada correta
function addMarkerToLayer(marker, type) {
    if (!layerGroups[type]) {
        layerGroups[type] = L.layerGroup();
        groupedLayersControl.addOverlay(layerGroups[type], type, "Marcadores");
    }
    layerGroups[type].addLayer(marker);
}

// Função para adicionar rota à camada correta
function addRouteToLayer(layer, group) {
    if (!layerGroups[group]) {
        layerGroups[group] = L.layerGroup();
        groupedLayersControl.addOverlay(layerGroups[group], group, "Rotas");
    }
    layerGroups[group].addLayer(layer);
}

// Função para adicionar rio à camada correta
function addRiverToLayer(layer, name) {
    if (!layerGroups[name]) {
        layerGroups[name] = L.layerGroup();
        groupedLayersControl.addOverlay(layerGroups[name], name, "Rios");
    }
    layerGroups[name].addLayer(layer);
}

// Função para definir o estilo das rotas com base no tipo (group)
function routeStyle(feature) {
    var group = feature.properties.group;
    var style = {
        color: "#000000",  // Cor padrão (preto)
        weight: 2,         // Espessura padrão
        opacity: 0.8,
        dashArray: '5, 5'  // Tracejado padrão
    };

    // Aplicar estilos condicionalmente com base no tipo de rota
    if (group === 'roads') {
        style.color = '#8D502A';
        style.weight = 5;  // Roads com maior espessura
    } else if (group === 'trails') {
        style.color = '#924217';
        style.weight = 2;  // Trails com espessura menor
    } else if (group === 'searoutes') {
        style.color = '#B16925';
        style.weight = 3;  // Searoutes com espessura intermediária
    }

    return style;
}

// Função para definir o estilo dos rios
function riverStyle(feature) {
    return {
        color: '#1E90FF',  // Cor azul clara para rios
        weight: feature.properties.width * 10 || 2,  // Usar a propriedade de largura para ajustar o peso da linha
        opacity: 0.6
    };
}

// Função para customizar ícones de cidades (ponto ou estrela) e o nome da cidade
function getCityIcon(cityName, isCapital) {
    if (isCapital) {
        // Ícone de estrela para capital e nome em negrito
        return L.divIcon({
            className: 'custom-city-icon', // Classe CSS personalizada para o estilo do ícone
            html: `<div class="city-star">★</div><div class="city-name-bold">${cityName}</div>`, // Estrela e nome em negrito
            iconSize: [60, 30], // Tamanho total do ícone
            iconAnchor: [12, 10], // Ponto de ancoragem do ícone
            popupAnchor: [0, -10] // Onde o popup deve aparecer, em relação ao ícone
        });
    } else {
        // Ícone de ponto para cidades normais
        return L.divIcon({
            className: 'custom-city-icon', // Classe CSS personalizada para o estilo do ícone
            html: `<div class="city-point"></div><div class="city-name">${cityName}</div>`, // Ponto e nome normal
            iconSize: [50, 20], // Tamanho total do ícone
            iconAnchor: [12, 10], // Ponto de ancoragem do ícone
            popupAnchor: [0, -10] // Onde o popup deve aparecer, em relação ao ícone
        });
    }
}