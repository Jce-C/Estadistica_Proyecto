// ========================================
// MÓDULO DE GRÁFICOS
// ========================================
// Maneja la creación y renderizado de todos los gráficos usando Chart.js
// Incluye: Histograma, Gráfico Circular y Diagrama de Caja

// Variables globales para los gráficos activos
let chartHistograma = null;
let chartPastel = null;
let chartBoxPlot = null;

// Paleta de colores consistente para todos los gráficos
const CHART_COLORS = {
    primary: '#D9A590',
    secondary: '#E8A9A3',
    tertiary: '#D4C89F',
    green: '#476645',
    pink: '#D9A7B0',
    text: '#5A4A4A',
    grid: 'rgba(90, 74, 74, 0.1)',
    palette: ['#E8B4BC', '#E8A9A3', '#D4C89F', '#A8B89F', '#D8A5AA', '#E8B9A9', '#B6D7A8', '#D9A7B0']
};

// ========================================
// RESETEO DE CANVAS
// ========================================

// Limpia y resetea un canvas para dibujar un nuevo gráfico
// Esto previene problemas de renderizado cuando se recrean gráficos
function resetCanvas(id) {
    const canvas = document.getElementById(id);
    if (!canvas) return null;

    // Eliminar estilos inline que Chart.js añade
    canvas.removeAttribute('style');
    canvas.style.width = '';
    canvas.style.height = '';
    
    // Ajustar dimensiones del canvas
    const parent = canvas.parentNode;
    const computedStyle = window.getComputedStyle(parent);
    canvas.width = parseInt(computedStyle.width);
    
    // El boxplot necesita más altura que los demás gráficos
    if (id === 'boxplot') {
        canvas.height = 350;
    } else {
        canvas.height = 260;
    }
    
    return canvas;
}

// ========================================
// GENERACIÓN DE GRÁFICOS
// ========================================

// Genera los tres gráficos principales basados en los datos procesados
// tabla: datos de frecuencia calculados
// datosRaw: datos originales sin procesar
// tipoDato: 'cuantitativo' o 'cualitativo'
// contexto: descripción opcional del análisis
function generarGraficos(tabla, datosRaw = [], tipoDato = 'cuantitativo', contexto = '') {
    // Destruir gráficos existentes para evitar superposiciones
    if (chartHistograma) {
        chartHistograma.destroy();
        chartHistograma = null;
    }
    if (chartPastel) {
        chartPastel.destroy();
        chartPastel = null;
    }
    if (chartBoxPlot) {
        chartBoxPlot.destroy();
        chartBoxPlot = null;
    }

    // Preparar datos para los gráficos
    const labels = tabla.map(t => String(t.x));
    const dataFi = tabla.map(t => Number(t.fi));
    const dataPi = tabla.map(t => Number(t.pi));
    
    const tituloHistograma = contexto ? `Distribución - ${contexto.substring(0, 50)}${contexto.length > 50 ? '...' : ''}` : 'Distribución de Frecuencias';
    const labelFrecuencia = contexto ? 'Frecuencia' : 'Frecuencia Absoluta';
    const mostrarLeyenda = !!contexto;

    // ========================================
    // 1. HISTOGRAMA (Gráfico de Barras)
    // ========================================
    try {
        const canvas1 = resetCanvas('mainChart');
        if (canvas1) {
            chartHistograma = new Chart(canvas1.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: labelFrecuencia,
                        data: dataFi,
                        backgroundColor: '#D9A590',
                        borderColor: '#D9A590',
                        borderWidth: 2,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: mostrarLeyenda,
                            text: tituloHistograma,
                            color: CHART_COLORS.text,
                            font: { size: 14, weight: '600' },
                            padding: { bottom: 10 }
                        },
                        legend: { 
                            display: mostrarLeyenda,
                            position: 'top',
                            labels: {
                                color: CHART_COLORS.text,
                                padding: 10,
                                font: { size: 11 }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            titleColor: CHART_COLORS.text,
                            bodyColor: CHART_COLORS.text,
                            borderColor: CHART_COLORS.grid,
                            borderWidth: 1
                        },
                        zoom: {
                            limits: { y: { min: 0 } },
                            pan: { enabled: true, mode: 'xy' },
                            zoom: {
                                wheel: { enabled: true },
                                pinch: { enabled: true },
                                mode: 'xy'
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { color: CHART_COLORS.text },
                            grid: { color: CHART_COLORS.grid },
                            title: {
                                display: true,
                                text: 'Frecuencia',
                                color: CHART_COLORS.text,
                                font: { size: 12, weight: '600' }
                            }
                        },
                        x: {
                            ticks: { color: CHART_COLORS.text },
                            grid: { color: CHART_COLORS.grid },
                            title: {
                                display: true,
                                text: tipoDato === 'cuantitativo' ? 'Valores' : 'Categorías',
                                color: CHART_COLORS.text,
                                font: { size: 12, weight: '600' }
                            }
                        }
                    }
                }
            });
        }
    } catch (e) { console.warn("Error Histograma:", e); }

    // ========================================
    // 2. GRÁFICO CIRCULAR (Pie Chart)
    // ========================================
    try {
        const canvas2 = resetCanvas('pieChart');
        if (canvas2) {
            // Asignar colores diferentes a cada segmento
            const backgroundColors = dataPi.map((_, i) => CHART_COLORS.palette[i % CHART_COLORS.palette.length]);

            chartPastel = new Chart(canvas2.getContext('2d'), {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: dataPi,
                        backgroundColor: backgroundColors,
                        borderWidth: 3,
                        borderColor: '#ffffff',
                        hoverBorderWidth: 4,
                        hoverOffset: 15
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: 15
                    },
                    plugins: {
                        title: {
                            display: mostrarLeyenda,
                            text: contexto ? `Proporciones - ${contexto.substring(0, 40)}${contexto.length > 40 ? '...' : ''}` : '',
                            color: CHART_COLORS.text,
                            font: { size: 14, weight: '600' },
                            padding: { bottom: 10 }
                        },
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: CHART_COLORS.text,
                                padding: 12,
                                font: { size: 11, weight: '500' },
                                boxWidth: 18,
                                boxHeight: 18,
                                useBorderRadius: true,
                                borderRadius: 4
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            titleColor: CHART_COLORS.text,
                            bodyColor: CHART_COLORS.text,
                            borderColor: CHART_COLORS.grid,
                            borderWidth: 2,
                            padding: 12,
                            displayColors: true,
                            callbacks: {
                                label: function(context) {
                                    let label = context.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    label += context.parsed.toFixed(2) + '%';
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
        }
    } catch (e) { console.warn("Error Pie Chart:", e); }

    // ========================================
    // 3. DIAGRAMA DE CAJA Y BIGOTES (Boxplot)
    // ========================================
    // Solo se genera para datos cuantitativos
    if (tipoDato === 'cuantitativo' && datosRaw.length > 0) {
        try {
            const canvas3 = resetCanvas('boxplot');
            if (canvas3 && typeof Chart.controllers.boxplot !== 'undefined') {
                // Calcular cuartiles para el tooltip
                const sorted = [...datosRaw].sort((a, b) => a - b);
                const min = sorted[0];
                const max = sorted[sorted.length - 1];
                const q1 = sorted[Math.floor(sorted.length * 0.25)];
                const q2 = sorted[Math.floor(sorted.length * 0.5)];
                const q3 = sorted[Math.floor(sorted.length * 0.75)];
                
                chartBoxPlot = new Chart(canvas3.getContext('2d'), {
                    type: 'boxplot',
                    data: {
                        labels: ['Distribución'],
                        datasets: [{
                            label: 'Datos',
                            data: [datosRaw],
                            backgroundColor: 'rgba(107, 142, 107, 0.4)',
                            borderColor: '#6B8E6B',
                            borderWidth: 2,
                            outlierBackgroundColor: '#BC8389',
                            outlierBorderColor: '#BC8389',
                            outlierRadius: 4,
                            itemRadius: 0,
                            itemStyle: 'circle',
                            itemBackgroundColor: '#6B8E6B',
                            itemBorderColor: '#6B8E6B'
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: mostrarLeyenda },
                            title: {
                                display: true,
                                text: contexto ? `Diagrama de Caja - ${contexto.substring(0, 40)}${contexto.length > 40 ? '...' : ''}` : 'Diagrama de Caja y Bigotes',
                                color: CHART_COLORS.text,
                                font: {
                                    size: 16,
                                    weight: 'bold',
                                    family: 'Poppins'
                                },
                                padding: { bottom: 10 }
                            },
                            tooltip: {
                                enabled: true,
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                titleColor: CHART_COLORS.text,
                                bodyColor: CHART_COLORS.text,
                                borderColor: '#6B8E6B',
                                borderWidth: 2,
                                padding: 12,
                                displayColors: false,
                                callbacks: {
                                    label: function(context) {
                                        return [
                                            `Mínimo: ${min.toFixed(2)}`,
                                            `Q1: ${q1.toFixed(2)}`,
                                            `Mediana: ${q2.toFixed(2)}`,
                                            `Q3: ${q3.toFixed(2)}`,
                                            `Máximo: ${max.toFixed(2)}`
                                        ];
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Valores',
                                    color: CHART_COLORS.text,
                                    font: { size: 12, weight: 'bold' }
                                },
                                ticks: { 
                                    color: CHART_COLORS.text,
                                    font: { size: 11 }
                                },
                                grid: { 
                                    color: CHART_COLORS.grid,
                                    drawBorder: true,
                                    borderColor: CHART_COLORS.text
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Distribución',
                                    color: CHART_COLORS.text,
                                    font: { size: 12, weight: 'bold' }
                                },
                                ticks: { 
                                    color: CHART_COLORS.text,
                                    font: { size: 11 }
                                },
                                grid: { 
                                    display: false,
                                    drawBorder: true,
                                    borderColor: CHART_COLORS.text
                                }
                            }
                        }
                    }
                });
            }
        } catch (e) { console.warn("Error BoxPlot:", e); }
    } else {
        // Si los datos son cualitativos, mostrar mensaje en lugar del boxplot
        const canvas3 = document.getElementById('boxplot');
        if (canvas3) {
            const ctx = canvas3.getContext('2d');
            ctx.clearRect(0, 0, canvas3.width, canvas3.height);
            ctx.font = '14px Poppins';
            ctx.fillStyle = CHART_COLORS.text;
            ctx.textAlign = 'center';
            ctx.fillText('No disponible para datos cualitativos', canvas3.width / 2, canvas3.height / 2);
        }
    }
}

// ========================================
// LEYENDAS CON IA (OBSOLETO - NO SE USA)
// ========================================

// Esta función fue parte de una versión anterior que generaba leyendas con IA
// Se mantiene por compatibilidad pero ya no se invoca
async function generarLeyendasIA(datosRaw, contexto, tipoDato) {
    const stats = {};
    
    if (tipoDato === 'cuantitativo') {
        const sorted = [...datosRaw].sort((a, b) => a - b);
        stats.media = datosRaw.reduce((sum, val) => sum + val, 0) / datosRaw.length;
        stats.mediana = sorted[Math.floor(sorted.length * 0.5)];
        stats.q1 = sorted[Math.floor(sorted.length * 0.25)];
        stats.q3 = sorted[Math.floor(sorted.length * 0.75)];
    }
    
    try {
        const [histogramLegend, pieLegend, boxplotLegend] = await Promise.all([
            generateChartLegend('histogram', contexto, datosRaw, stats),
            generateChartLegend('pie', contexto, datosRaw, stats),
            tipoDato === 'cuantitativo' ? generateChartLegend('boxplot', contexto, datosRaw, stats) : Promise.resolve('')
        ]);
        
        const histogramEl = document.getElementById('histogram-legend');
        const pieEl = document.getElementById('pie-legend');
        const boxplotEl = document.getElementById('boxplot-legend');
        
        if (histogramEl) histogramEl.textContent = histogramLegend;
        if (pieEl) pieEl.textContent = pieLegend;
        if (boxplotEl) boxplotEl.textContent = boxplotLegend;
    } catch (error) {
        console.error('Error generando leyendas:', error);
    }
}
