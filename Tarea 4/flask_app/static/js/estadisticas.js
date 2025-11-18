// Agregamos un listener para cargar los gráficos una vez que el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
    // Gráfico de línea
    fetch('/estadisticas/linea')
        .then(res => res.json())
        .then(data => {
            Highcharts.chart('grafico-linea', {
                chart: {type: 'line'},
                title: {text: 'Avisos por Día'},
                xAxis: {categories: data.map(d => d.fecha)},
                yAxis: {title: {text: 'Cantidad de Avisos'}},
                series: [{name: 'Avisos', data: data.map(d => d.cantidad)}]
            });
        });

    // Gráfico de torta
    fetch('/estadisticas/torta')
        .then(res => res.json())
        .then(data => {
            Highcharts.chart('grafico-torta', {
                chart: {type: 'pie'},
                title: {text: 'Total de Avisos por Tipo de Mascota'},
                series: [{
                    name: 'Cantidad',
                    data: data.map(d => ({name: d.tipo, y: d.cantidad}))
                }]
            });
        });

    // Gráfico de barras
    fetch('/estadisticas/barras')
        .then(res => res.json())
        .then(data => {
            Highcharts.chart('grafico-barras', {
                chart: {type: 'column'},
                title: {text: 'Avisos por Mes (Gatos vs Perros)'},
                xAxis: {categories: Object.keys(data.gato)},
                yAxis: {title: {text: 'Cantidad de Avisos'}},
                series: [
                    {name: 'Gatos', data: Object.values(data.gato)},
                    {name: 'Perros', data: Object.values(data.perro)}
                ]
            });
        });
});

