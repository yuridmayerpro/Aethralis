// Inicializar o mapa com um zoom mínimo de 4
var map = L.map('map', {
    minZoom: 4,  // Configura o zoom mínimo para o mapa
    maxZoom: 8   // Opcional: zoom máximo
}).setView([35.2016, 0], 4);  // Define a posição inicial e o zoom inicial

// Camada base especificada, também com zoom mínimo
var tilesource_layer = L.tileLayer('map/{z}/{x}/{y}.png', {
    attribution: 'Created by QGIS',
    minZoom: 4  // Configura o zoom mínimo para a camada de tiles
}).addTo(map);

// Objeto para armazenar os grupos de camadas (marcadores, rotas e rios)
var layerGroups = {};

// Configuração inicial do controle de camadas agrupadas
var groupedLayersControl = L.control.groupedLayers(null, {}, {
    groupCheckboxes: true
}).addTo(map);

// Função para customizar ícones baseados no emoji
function getCustomIcon(iconEmoji) {
    return L.divIcon({
        className: 'custom-icon',
        html: iconEmoji,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
}

// Grupos de camadas para Capitais e Não Capitais
var capitalLayerGroup = L.layerGroup();  // Não adicionar diretamente ao mapa
var nonCapitalLayerGroup = L.layerGroup();  // Não adicionar diretamente ao mapa

// Adicionar os grupos de camadas ao controle de camadas, sem adicioná-los ao mapa inicialmente
groupedLayersControl.addOverlay(capitalLayerGroup, "Capitais", "Cidades");
groupedLayersControl.addOverlay(nonCapitalLayerGroup, "Não Capitais", "Cidades");