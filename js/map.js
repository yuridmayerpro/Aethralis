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

