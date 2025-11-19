// ========================================
// MÓDULO DE ESTADÍSTICA
// ========================================
// Contiene todas las funciones matemáticas para análisis estadístico
// Soporta datos cuantitativos (números) y cualitativos (texto)

const Estadistica = {
    // Verifica si un valor es numérico válido
    esNumero: (valor) => !isNaN(parseFloat(valor)) && isFinite(valor),

    // ========================================
    // MEDIDAS DE TENDENCIA CENTRAL
    // ========================================
    
    // Calcula el promedio de un conjunto de datos
    media: (datos) => {
        const suma = datos.reduce((acc, val) => acc + val, 0);
        return (suma / datos.length);
    },

    // Calcula el valor central cuando los datos están ordenados
    mediana: (datos) => {
        const ordenados = [...datos].sort((a, b) => a - b);
        const mid = Math.floor(ordenados.length / 2);
        if (ordenados.length % 2 !== 0) return ordenados[mid];
        return (ordenados[mid - 1] + ordenados[mid]) / 2;
    },

    // Calcula la diferencia entre el valor máximo y mínimo
    rango: (datos) => {
        const max = Math.max(...datos);
        const min = Math.min(...datos);
        return (max - min);
    },

    // ========================================
    // MEDIDAS DE DISPERSIÓN
    // ========================================
    
    // Calcula la varianza (qué tan dispersos están los datos)
    // esPoblacion: true para población (divide por N), false para muestra (divide por n-1)
    varianza: (datos, media, esPoblacion = false) => {
        if (datos.length < 2) return 0;
        const sum = datos.reduce((acc, val) => acc + Math.pow(val - media, 2), 0);
        const divisor = esPoblacion ? datos.length : datos.length - 1;
        return (sum / divisor);
    },

    // Calcula la desviación estándar (raíz cuadrada de la varianza)
    desviacion: (varianza) => Math.sqrt(varianza),

    // ========================================
    // MODA (valor más frecuente)
    // ========================================
    
    // Encuentra el o los valores que más se repiten
    // Retorna objeto con tipo (unimodal, multimodal, amodal) y valores
    moda: (datos, tipoDato = 'cuantitativo') => {
        // Contar frecuencia de cada valor
        const frecuencia = {};
        datos.forEach(val => frecuencia[val] = (frecuencia[val] || 0) + 1);

        const frecArray = Object.entries(frecuencia).map(([val, frec]) => ({
            valor: val,
            frecuencia: frec
        }));

        if (frecArray.length === 0) {
            return { tipo: 'amodal', valor: 'N/A', modas: [], frecuencia: 0 };
        }

        // Ordenar por frecuencia descendente
        frecArray.sort((a, b) => b.frecuencia - a.frecuencia);
        const maxFrec = frecArray[0].frecuencia;

        // Si todos los valores aparecen solo una vez, no hay moda
        if (maxFrec === 1 && frecArray.length === datos.length) {
            return { tipo: 'amodal', valor: 'Amodal', modas: [], frecuencia: 1 };
        }

        // Obtener todos los valores con la frecuencia máxima
        const modas = frecArray
            .filter(item => item.frecuencia === maxFrec)
            .map(item => tipoDato === 'cuantitativo' ? Number(item.valor) : item.valor);

        if (tipoDato === 'cuantitativo') {
            modas.sort((a, b) => a - b);
        }

        // Si todas las categorías son modas, es amodal
        if (modas.length === frecArray.length) {
            return { tipo: 'amodal', valor: 'Amodal', modas: [], frecuencia: maxFrec };
        }

        // Una sola moda
        if (modas.length === 1) {
            return { tipo: 'unimodal', valor: String(modas[0]), modas: modas, frecuencia: maxFrec };
        }

        // Muchas modas (más de 3)
        if (modas.length > 3) {
            return { tipo: 'multimodal', valor: 'Multimodal', modas: modas, frecuencia: maxFrec };
        }

        // 2 o 3 modas
        return { tipo: 'multimodal', valor: modas.join(', '), modas: modas, frecuencia: maxFrec };
    },

    // ========================================
    // ANÁLISIS DE DATOS ORDINALES
    // ========================================
    
    // Detecta si los datos siguen una escala ordinal conocida (ej: malo, regular, bueno)
    // Retorna información sobre la escala y permite calcular estadísticas ordinales
    analisisOrdinal: (datosTexto) => {
        const datosLimp = datosTexto.map(d => d.toLowerCase().trim());
        const datosUnicos = [...new Set(datosLimp)];

        // Escalas ordinales reconocidas (el orden es importante)
        const escalasConocidas = [
            ['pesimo', 'malo', 'regular', 'bueno', 'excelente'],
            ['muy insatisfecho', 'insatisfecho', 'neutral', 'satisfecho', 'muy satisfecho'],
            ['totalmente en desacuerdo', 'en desacuerdo', 'neutral', 'de acuerdo', 'totalmente de acuerdo'],
            ['malo', 'regular', 'bueno'],
            ['bajo', 'medio', 'alto'],
            ['nunca', 'rara vez', 'a veces', 'frecuentemente', 'siempre'],
            ['nunca', 'casi nunca', 'ocasionalmente', 'casi siempre', 'siempre'],
            ['xs', 's', 'm', 'l', 'xl', 'xxl'],
            ['ninguno', 'primaria', 'secundaria', 'tecnico', 'tecnologo', 'pregrado', 'posgrado', 'especializacion', 'maestria', 'doctorado'],
            ['estrato 1', 'estrato 2', 'estrato 3', 'estrato 4', 'estrato 5', 'estrato 6'],
            ['deficiente', 'insuficiente', 'aceptable', 'sobresaliente', 'excelente']
        ];

        let escalaEncontrada = null;

        // Buscar una escala que contenga todos los datos únicos
        for (const escala of escalasConocidas) {
            const todosPertenecen = datosUnicos.every(dato => escala.includes(dato));
            if (todosPertenecen && datosUnicos.length > 1) {
                escalaEncontrada = escala;
                break;
            }
        }

        if (!escalaEncontrada) {
            return { esOrdinal: false };
        }

        // Convertir datos textuales a valores numéricos según su posición en la escala
        const datosNumericos = datosLimp.map(d => {
            const index = escalaEncontrada.indexOf(d);
            return index !== -1 ? index + 1 : null;
        }).filter(val => val !== null);

        // Calcular estadísticas sobre los valores ordinales convertidos
        const media = Estadistica.media(datosNumericos);
        const mediana = Estadistica.mediana(datosNumericos);
        const rango = Estadistica.rango(datosNumericos);
        const varianza = Estadistica.varianza(datosNumericos, media, false);
        const desviacion = Estadistica.desviacion(varianza);

        // Convertir resultados numéricos de vuelta a etiquetas de texto
        const mediaIdx = Math.round(media) - 1;
        const medianaIdx = Math.round(mediana) - 1;

        return {
            esOrdinal: true,
            escala: escalaEncontrada,
            mediaNumerica: media,
            mediaEtiqueta: escalaEncontrada[mediaIdx] || 'N/A',
            medianaNumerica: mediana,
            medianaEtiqueta: escalaEncontrada[medianaIdx] || 'N/A',
            rango,
            varianza,
            desviacion
        };
    },

    // ========================================
    // TABLA DE FRECUENCIAS
    // ========================================
    
    // Genera tabla completa con frecuencias absolutas, relativas y acumuladas
    tablaFrecuencias: (datos, esNumerico = true) => {
        const frecuencia = {};
        
        // Contar frecuencia de cada valor
        datos.forEach(val => {
            const key = esNumerico ? Number(val) : val;
            frecuencia[key] = (frecuencia[key] || 0) + 1;
        });

        let listaFrecuencias = Object.entries(frecuencia).map(([val, fi]) => ({
            x: esNumerico ? Number(val) : val,
            fi: fi
        }));

        // Ordenar: numéricos por valor, textuales por frecuencia
        if (esNumerico) {
            listaFrecuencias.sort((a, b) => a.x - b.x);
        } else {
            listaFrecuencias.sort((a, b) => b.fi - a.fi);
        }

        const n = datos.length;
        let Fi = 0;

        // Calcular frecuencias relativas y acumuladas
        const tabla = listaFrecuencias.map(item => {
            Fi += item.fi;
            const hi = item.fi / n;
            const pi = (hi * 100);
            
            return {
                x: item.x,
                fi: item.fi,
                Fi: Fi,
                hi: hi.toFixed(4),
                pi: pi.toFixed(2)
            };
        });

        return tabla;
    }
};
