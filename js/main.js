// ========================================
// APLICACIÓN DE ANÁLISIS ESTADÍSTICO
// ========================================
// Archivo principal que coordina:
// - Entrada y validación de datos (manual, demo, Excel)
// - Ejecución de cálculos estadísticos
// - Generación de gráficos y visualizaciones
// - Análisis con IA usando Google Gemini
// - Exportación de informes PDF

// ========================================
// VARIABLE GLOBAL PARA ALMACENAR DATOS DEL ANÁLISIS
// ========================================
// Almacena todos los resultados del análisis actual para acceso global
// Se usa en la exportación PDF y visualizaciones

let ultimoAnalisis = {
    datos: [],
    media: null,
    mediana: null,
    moda: null,
    rango: null,
    varianza: null,
    desviacion: null,
    esPoblacion: false,
    tipoDato: 'cuantitativo'
};

// ========================================
// SISTEMA DE NAVEGACIÓN ENTRE VISTAS
// ========================================
// Maneja la transición entre las tres pantallas:
// 1. Entrada de datos (input)
// 2. Resultados estadísticos (results)
// 3. Visualizaciones gráficas (visualizations)

function showView(viewName) {
    const views = ['input', 'results', 'visualizations'];
    views.forEach(v => {
        const viewEl = document.getElementById(`view-${v}`);
        if (viewEl) {
            viewEl.classList.remove('active');
        }
    });
    
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
        targetView.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(btn => btn.classList.remove('active'));
    if (viewName === 'input') {
        navButtons[0]?.classList.add('active');
    }
}

function toggleManualPanel() {
    const panel = document.getElementById('manual-panel');
    panel.classList.toggle('active');
}

// ========================================
// NOTIFICACIONES (TOAST)
// ========================================
// Muestra mensajes de éxito, error o advertencia en la esquina superior derecha

function mostrarNotificacion(tipo, mensajes) {
    const mensaje = Array.isArray(mensajes) ? mensajes[Math.floor(Math.random() * mensajes.length)] : mensajes;
    
    const Swal = window.Swal;
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.style.background = 'white';
            toast.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
            toast.style.borderRadius = '12px';
            toast.style.padding = '1rem';
        }
    });
    
    Toast.fire({
        icon: tipo,
        title: mensaje,
        iconColor: tipo === 'success' ? '#6B8E6B' : tipo === 'error' ? '#BC8389' : '#D9A590'
    });
}

const Toast = {
    fire: ({ icon, title }) => mostrarNotificacion(icon, title)
};

// ========================================
// SISTEMA DE TABS (Manual/Archivo)
// ========================================

function toggleInput(mode) {
    const manualBtn = document.getElementById('btn-manual');
    const fileBtn = document.getElementById('btn-file');
    const manualDiv = document.getElementById('input-manual-container');
    const fileDiv = document.getElementById('input-file-container');
    
    if (mode === 'manual') {
        manualBtn.classList.add('active');
        fileBtn.classList.remove('active');
        manualDiv.classList.remove('hidden');
        fileDiv.classList.add('hidden');
    } else {
        fileBtn.classList.add('active');
        manualBtn.classList.remove('active');
        fileDiv.classList.remove('hidden');
        manualDiv.classList.add('hidden');
    }
}

// ========================================
// PROCESAMIENTO DE ARCHIVOS
// ========================================

function procesarTablaExcel(datosJson) {
    if (!datosJson || datosJson.length === 0) {
        return "";
    }
    
    const filas = datosJson.filter(fila => fila && fila.length > 0);
    
    if (filas.length === 0) {
        return "";
    }
    
    const esEncabezado = (fila) => {
        const celdasConTexto = fila.filter(celda => {
            return celda !== null && celda !== undefined && 
                   typeof celda === 'string' && 
                   isNaN(Number(celda));
        });
        return celdasConTexto.length > fila.length * 0.5;
    };
    
    let inicioFilas = 0;
    if (filas.length > 1 && esEncabezado(filas[0])) {
        inicioFilas = 1;
    }
    
    const datosFilas = filas.slice(inicioFilas);
    
    if (datosFilas.length === 0) {
        return "";
    }
    
    const numColumnas = Math.max(...datosFilas.map(f => f.length));
    const columnasConDatos = [];
    
    for (let col = 0; col < numColumnas; col++) {
        let celdasValidas = 0;
        let celdasVacias = 0;
        
        for (let fila of datosFilas) {
            const celda = fila[col];
            if (celda !== null && celda !== undefined && celda !== '') {
                celdasValidas++;
            } else {
                celdasVacias++;
            }
        }
        
        if (celdasValidas > celdasVacias && celdasValidas >= 2) {
            columnasConDatos.push(col);
        }
    }
    
    let datosExtraidos = [];
    
    if (columnasConDatos.length > 0) {
        for (let fila of datosFilas) {
            for (let col of columnasConDatos) {
                const celda = fila[col];
                if (celda !== null && celda !== undefined && celda !== '') {
                    datosExtraidos.push(celda);
                }
            }
        }
    }
    
    if (datosExtraidos.length === 0) {
        datosExtraidos = datosFilas.flat().filter(celda => 
            celda !== null && celda !== undefined && celda !== ''
        );
    }
    
    if (datosExtraidos.length === 0) {
        Toast.fire({ 
            icon: 'warning', 
            title: 'No se encontraron datos en el archivo Excel. Intente con otro formato.' 
        });
        return "";
    }
    
    return datosExtraidos.join(", ");
}

let excelData = null;

function procesarArchivoUnificado(input) {
    if (input.files.length === 0) return;
    const archivo = input.files[0];
    const nombre = archivo.name.toLowerCase();

    const agregarDatosAlInput = (datos) => {
        const inputEl = document.getElementById('data-input');
        const valorActual = inputEl.value.trim();
        inputEl.value = valorActual.length > 0 ? valorActual + "\n" + datos : datos;
    };

    const alTerminarCarga = (datosLeidos) => {
        agregarDatosAlInput(datosLeidos);
        toggleInput('manual');
        mostrarCampoContexto();
        mostrarNotificacion('success', [
            '¡Archivo cargado con éxito!',
            '¡Datos importados correctamente!',
            '¡Listo! Tus datos están aquí',
            '¡Archivo procesado exitosamente!'
        ]);
        input.value = "";
    };

    if (nombre.endsWith('.xlsx') || nombre.endsWith('.xls')) {
        procesarExcelConPandas(archivo, input);
    } else {
        const lector = new FileReader();
        lector.onload = function (e) {
            alTerminarCarga(e.target.result);
        };
        lector.readAsText(archivo);
    }
}

async function procesarExcelConPandas(archivo, inputElement) {
    const formData = new FormData();
    formData.append('file', archivo);
    
    try {
        mostrarNotificacion('info', 'Procesando archivo Excel...');
        
        const response = await fetch('/api/upload-excel', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al procesar Excel');
        }
        
        const data = await response.json();
        excelData = data;
        
        mostrarExcelPreview(data);
        inputElement.value = "";
        
    } catch (error) {
        console.error('Error procesando Excel:', error);
        mostrarNotificacion('error', error.message || 'Error al procesar el archivo Excel');
        inputElement.value = "";
    }
}

function mostrarExcelPreview(data) {
    const previewContainer = document.getElementById('excel-preview-container');
    const fileContainer = document.getElementById('input-file-container');
    const filenameEl = document.getElementById('excel-filename');
    const thead = document.getElementById('excel-thead');
    const tbody = document.getElementById('excel-tbody');
    const columnButtons = document.getElementById('column-buttons');
    
    fileContainer.classList.add('hidden');
    previewContainer.classList.remove('hidden');
    
    filenameEl.textContent = `Archivo: ${data.filename} (${data.totalRows} filas, ${data.columns.length} columnas)`;
    
    thead.innerHTML = '';
    tbody.innerHTML = '';
    columnButtons.innerHTML = '';
    
    if (data.previewRows.length > 0) {
        const headerRow = document.createElement('tr');
        headerRow.style.background = '#6B8E6B';
        headerRow.style.color = 'white';
        headerRow.style.position = 'sticky';
        headerRow.style.top = '0';
        
        data.columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col.name;
            th.style.padding = '0.6rem';
            th.style.textAlign = 'left';
            th.style.borderBottom = '2px solid white';
            th.style.fontWeight = '600';
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        
        data.previewRows.forEach((row, idx) => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #eee';
            if (idx % 2 === 0) tr.style.background = '#f9f9f9';
            
            data.columns.forEach(col => {
                const td = document.createElement('td');
                td.textContent = row[col.name] || '-';
                td.style.padding = '0.5rem';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    }
    
    data.columns.forEach(col => {
        if (col.type !== 'empty' && col.count > 0) {
            const btn = document.createElement('button');
            btn.textContent = `${col.name} (${col.type})`;
            btn.style.padding = '0.6rem 1.2rem';
            btn.style.border = '2px solid #6B8E6B';
            btn.style.background = 'white';
            btn.style.color = '#6B8E6B';
            btn.style.borderRadius = '8px';
            btn.style.cursor = 'pointer';
            btn.style.fontWeight = '500';
            btn.style.fontSize = '0.85rem';
            btn.style.transition = 'all 0.3s';
            
            btn.onmouseover = () => {
                btn.style.background = '#6B8E6B';
                btn.style.color = 'white';
            };
            btn.onmouseout = () => {
                btn.style.background = 'white';
                btn.style.color = '#6B8E6B';
            };
            
            btn.onclick = () => seleccionarColumnaExcel(col.name, data);
            columnButtons.appendChild(btn);
        }
    });
}

function seleccionarColumnaExcel(columnName, data) {
    const datosColumna = data.rawSeries[columnName];
    
    if (!datosColumna || datosColumna.length === 0) {
        mostrarNotificacion('warning', 'La columna seleccionada está vacía');
        return;
    }
    
    const inputEl = document.getElementById('data-input');
    inputEl.value = datosColumna.join(', ');
    
    limpiarExcelPreview();
    toggleInput('manual');
    mostrarCampoContexto();
    
    const contextEl = document.getElementById('data-context');
    if (contextEl && !contextEl.value.trim()) {
        contextEl.value = `Datos de la columna "${columnName}" del archivo ${data.filename}`;
    }
    
    mostrarNotificacion('success', `Columna "${columnName}" cargada con ${datosColumna.length} valores`);
}

function limpiarExcelPreview() {
    const previewContainer = document.getElementById('excel-preview-container');
    const fileContainer = document.getElementById('input-file-container');
    
    previewContainer.classList.add('hidden');
    fileContainer.classList.remove('hidden');
    
    excelData = null;
    
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = "";
}

// ========================================
// UTILIDADES DE DATOS
// ========================================

async function cargarDemo() {
    const inputEl = document.getElementById('data-input');
    const valorActual = inputEl.value.trim();
    
    if (valorActual.length > 0) {
        const resultado = await Swal.fire({
            title: 'Reemplazar datos',
            text: 'Ya hay datos en el panel. ¿Deseas reemplazarlos?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Reemplazar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#6B8E6B',
            cancelButtonColor: '#A89FA8'
        });
        
        if (!resultado.isConfirmed) {
            return;
        }
    }
    
    mostrarCampoContexto();
    
    const generadores = {
        continua: [
            () => Array.from({ length: 30 }, () => (Math.random() * (1.95 - 1.50) + 1.50).toFixed(2)),
            () => Array.from({ length: 25 }, () => (Math.random() * (40.0 - 35.0) + 35.0).toFixed(1)),
        ],
        discreta: [
            () => Array.from({ length: 40 }, () => Math.floor(Math.random() * 9)),
            () => Array.from({ length: 50 }, () => Math.floor(Math.random() * (25 - 17 + 1) + 17)),
        ],
        cualitativa: [
            () => {
                const colores = ['Rojo', 'Azul', 'Verde', 'Amarillo', 'Naranja', 'Morado'];
                return Array.from({ length: 30 }, () => colores[Math.floor(Math.random() * colores.length)]);
            },
            () => {
                const niveles = ['Bajo', 'Medio', 'Alto'];
                return Array.from({ length: 35 }, () => niveles[Math.floor(Math.random() * niveles.length)]);
            },
            () => {
                const calificaciones = ['Excelente', 'Bueno', 'Regular', 'Malo'];
                return Array.from({ length: 40 }, () => calificaciones[Math.floor(Math.random() * calificaciones.length)]);
            },
            () => {
                const generos = ['Masculino', 'Femenino'];
                return Array.from({ length: 45 }, () => generos[Math.floor(Math.random() * generos.length)]);
            },
            () => {
                const satisfaccion = ['Muy satisfecho', 'Satisfecho', 'Neutral', 'Insatisfecho', 'Muy insatisfecho'];
                return Array.from({ length: 50 }, () => satisfaccion[Math.floor(Math.random() * satisfaccion.length)]);
            }
        ]
    };
    
    const categorias = ['continua', 'discreta', 'cualitativa'];
    const categoriaElegida = categorias[Math.floor(Math.random() * categorias.length)];
    const opcionesDisponibles = generadores[categoriaElegida];
    const generadorSeleccionado = opcionesDisponibles[Math.floor(Math.random() * opcionesDisponibles.length)];
    const datosNuevos = generadorSeleccionado();
    
    inputEl.value = datosNuevos.join(', ');
    
    mostrarNotificacion('success', [
        '¡Datos de ejemplo generados!',
        '¡Listo! Datos aleatorios cargados',
        '¡Prueba estos datos!',
        '¡Datos de demostración listos!'
    ]);
}

function limpiarDatos() {
    document.getElementById('data-input').value = "";
    document.getElementById('file-upload').value = "";
    const contextSection = document.getElementById('context-section');
    if (contextSection) {
        contextSection.style.display = 'none';
    }
    const contextArea = document.getElementById('data-context');
    if (contextArea) {
        contextArea.value = '';
    }
    showView('input');
    mostrarNotificacion('warning', [
        'Datos borrados correctamente',
        'Panel limpiado',
        'Todo limpio y listo',
        'Datos eliminados exitosamente'
    ]);
}

// ========================================
// FUNCIÓN PRINCIPAL: EJECUTAR ANÁLISIS
// ========================================
// Esta es la función central que:
// 1. Valida y procesa los datos ingresados
// 2. Detecta si son numéricos o textuales
// 3. Calcula todas las estadísticas
// 4. Genera gráficos y tablas
// 5. Crea análisis con IA si hay contexto

async function ejecutarAnalisis() {
    const textoRaw = document.getElementById('data-input').value;

    let datosPre = textoRaw.split(/[,;\n]+/).map(val => val.trim()).filter(val => val !== "");

    if (datosPre.length === 0) {
        mostrarNotificacion('error', [
            'No hay datos para analizar',
            'Primero ingresa algunos datos',
            'El campo está vacío',
            'Necesitas ingresar datos primero'
        ]);
        return;
    }

    let datosCrudos = [];
    const muestra = datosPre[0];
    const empiezaConNumero = /^-?\d/.test(muestra);
    const tieneEspacios = muestra.includes(' ');

    if (empiezaConNumero && tieneEspacios) {
        datosCrudos = textoRaw.split(/[\s,;\n]+/).map(val => val.trim()).filter(val => val !== "");
    } else {
        datosCrudos = datosPre;
    }

    let conteoNumeros = 0;
    datosCrudos.forEach(d => {
        if (Estadistica.esNumero(d)) conteoNumeros++;
    });
    const esCuantitativaDetectada = (conteoNumeros / datosCrudos.length) > 0.9;
    let esCuantitativa = esCuantitativaDetectada;

    const tipoDetectado = esCuantitativaDetectada ? "Cuantitativa" : "Cualitativa";
    mostrarNotificacion('info', [
        `Detecté datos tipo ${tipoDetectado}`,
        `Tus datos parecen ser ${tipoDetectado}`,
        `Procesando como variable ${tipoDetectado}`,
        `Analizando datos ${tipoDetectado}s`
    ]);

    const tipoDatoFinal = esCuantitativa ? 'cuantitativo' : 'cualitativo';
    const badge = document.getElementById('badge-tipo-dato');

    let media, mediana, rango, varianza, desviacion;
    let mediaStr, medianaStr, modaStr, rangoStr, varianzaStr, desviacionStr;
    let tabla;
    let datosParaGraficos = [];

    if (esCuantitativa) {
        const datosNum = datosCrudos.map(num => parseFloat(num)).filter(num => !isNaN(num));
        datosParaGraficos = datosNum;

        const esDiscreto = datosNum.every(num => Number.isInteger(num));
        const tipoVariable = esDiscreto ? "Cuantitativa Discreta" : "Cuantitativa Continua";

        media = Estadistica.media(datosNum);
        mediana = Estadistica.mediana(datosNum);
        const modaObj = Estadistica.moda(datosNum, tipoDatoFinal);
        rango = Estadistica.rango(datosNum);
        varianza = Estadistica.varianza(datosNum, media, false);
        desviacion = Estadistica.desviacion(varianza);
        tabla = Estadistica.tablaFrecuencias(datosNum, true);

        mediaStr = media.toFixed(2);
        medianaStr = mediana.toFixed(2);
        
        if (modaObj.tipo === 'multimodal' && modaObj.modas && modaObj.modas.length > 2) {
            modaStr = `Multimodal (${modaObj.modas.length})`;
        } else {
            modaStr = modaObj.valor;
        }
        
        rangoStr = rango.toFixed(2);
        varianzaStr = varianza.toFixed(2);
        desviacionStr = desviacion.toFixed(2);

        // Guardar datos para mostrar información detallada
        ultimoAnalisis = {
            datos: datosNum,
            datosOriginales: datosCrudos,
            contexto: document.getElementById('data-context').value,
            media: media,
            mediana: mediana,
            moda: modaObj,
            rango: rango,
            varianza: varianza,
            desviacion: desviacion,
            esPoblacion: false,
            tipoDato: 'cuantitativo'
        };

        badge.innerText = tipoVariable;
        
        const cvVal = (media !== 0) ? ((desviacion / media) * 100) : 0;
        const cv = cvVal.toFixed(2);
        let dispersionText = "";
        if (media === 0) {
            dispersionText = "no se puede calcular (media es cero)";
        } else if (cvVal < 15) {
            dispersionText = "baja (datos homogéneos)";
        } else if (cvVal < 30) {
            dispersionText = "moderada";
        } else {
            dispersionText = "alta (datos heterogéneos)";
        }

        const conclusionBasica = `Se analizaron un total de ${datosNum.length} datos. El promedio obtenido es de ${media.toFixed(2)}. En cuanto a la dispersión, los datos varían en un rango de ${rango.toFixed(2)} unidades. El coeficiente de variación es del ${cv}%, lo que indica una dispersión ${dispersionText} con respecto a la media.`;
        
        document.getElementById('analisis-texto').innerHTML = `
            Se analizaron un total de <strong>${datosNum.length} datos</strong>. El promedio obtenido es de <strong>${media.toFixed(2)}</strong>.
            <br><br>
            En cuanto a la dispersión, los datos varían en un rango de <strong>${rango.toFixed(2)}</strong> unidades.
            El coeficiente de variación es del <strong>${cv}%</strong>, lo que indica una dispersión <strong>${dispersionText}</strong> con respecto a la media.
        `;
        
        ultimoAnalisis.conclusionBasica = conclusionBasica;
    } else {
        const datosTexto = datosCrudos;
        tabla = Estadistica.tablaFrecuencias(datosTexto, false);
        const modaObj = Estadistica.moda(datosTexto, tipoDatoFinal);
        
        badge.innerText = "Variable Cualitativa";
        mediaStr = medianaStr = rangoStr = varianzaStr = desviacionStr = "--";
        
        if (modaObj.tipo === 'multimodal' && modaObj.modas && modaObj.modas.length > 2) {
            modaStr = `Multimodal (${modaObj.modas.length})`;
        } else {
            modaStr = modaObj.valor;
        }
        
        // Guardar datos para mostrar información detallada
        ultimoAnalisis = {
            datos: datosTexto,
            datosOriginales: datosCrudos,
            contexto: document.getElementById('data-context').value,
            media: null,
            mediana: null,
            moda: modaObj,
            rango: null,
            varianza: null,
            desviacion: null,
            esPoblacion: false,
            tipoDato: 'cualitativo'
        };
        
        const conclusionBasica = `Análisis de ${datosTexto.length} datos cualitativos. La categoría más frecuente es: "${modaStr}".`;
        
        document.getElementById('analisis-texto').innerHTML = `
            Análisis de <strong>${datosTexto.length} datos cualitativos</strong>.<br>
            La categoría más frecuente es: <strong>"${modaStr}"</strong>.
        `;
        
        ultimoAnalisis.conclusionBasica = conclusionBasica;
    }

    mostrarResultados(mediaStr, medianaStr, modaStr, rangoStr, varianzaStr, desviacionStr);
    generarTablaHTML(tabla);
    
    const contexto = document.getElementById('data-context')?.value || '';
    generarGraficos(tabla, datosParaGraficos, tipoDatoFinal, contexto);
    
    showView('results');
    mostrarNotificacion('success', [
        '¡Análisis completado exitosamente!',
        '¡Listo! Aquí están tus resultados',
        '¡Datos analizados con éxito!',
        '¡Resultados calculados!',
        '¡Análisis finalizado correctamente!'
    ]);
    
    await generarAnalisisConIA(datosCrudos, {
        media: mediaStr,
        mediana: medianaStr,
        moda: modaStr,
        rango: rangoStr,
        varianza: varianzaStr,
        desviacion: desviacionStr
    });
}

async function generarAnalisisConIA(datos, stats) {
    const aiBox = document.getElementById('ai-conclusion-box');
    const aiTexto = document.getElementById('ai-analisis-texto');
    
    let contexto = document.getElementById('data-context')?.value || '';
    
    if (!contexto || contexto.trim() === '') {
        aiBox.style.display = 'none';
        ultimoAnalisis.conclusionIA = '';
        return;
    }
    
    aiBox.style.display = 'block';
    aiTexto.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generando análisis inteligente...';
    
    try {
        const analysisText = await generateAnalysisWithContext(stats, contexto, datos);
        
        aiTexto.textContent = analysisText;
        ultimoAnalisis.conclusionIA = analysisText;
        
        const contextData = `Contexto: ${contexto}\n\nDatos analizados: ${datos.slice(0, 20).join(', ')}${datos.length > 20 ? '...' : ''}\n\nEstadísticas:\n- Media: ${stats.media}\n- Mediana: ${stats.mediana}\n- Moda: ${stats.moda}\n- Rango: ${stats.rango}\n- Desviación: ${stats.desviacion}\n\nConclusión: ${analysisText}`;
        setAnalysisContext(contextData);
        
    } catch (error) {
        console.error('Error generando análisis con IA:', error);
        aiBox.style.display = 'none';
        ultimoAnalisis.conclusionIA = '';
    }
}

// ========================================
// MOSTRAR RESULTADOS EN CARDS
// ========================================

function mostrarResultados(media, mediana, moda, rango, varianza, dev) {
    animarValor('val-media', media);
    animarValor('val-mediana', mediana);
    animarValor('val-moda', moda);
    animarValor('val-rango', rango);
    animarValor('val-varianza', varianza);
    animarValor('val-desviacion', dev);
}

function animarValor(id, valorFinal) {
    const elemento = document.getElementById(id);
    if (!elemento) return;

    if (!Estadistica.esNumero(valorFinal)) {
        if (id === 'val-moda' && ultimoAnalisis.moda && ultimoAnalisis.moda.tipo === 'multimodal' && ultimoAnalisis.moda.modas && ultimoAnalisis.moda.modas.length > 2) {
            const modas = ultimoAnalisis.moda.modas;
            elemento.innerHTML = `
                <div style="font-size: 1.2rem; font-weight: 700;">Multimodal</div>
                <div style="font-size: 0.75rem; margin-top: 0.3rem; opacity: 0.85;">
                    ${modas.join(', ')}
                </div>
            `;
        } else {
            elemento.innerText = valorFinal;
        }
        return;
    }

    const finalValue = parseFloat(valorFinal);
    const duration = 800;
    let startTime = null;

    const finalValueStr = String(valorFinal);
    const decimalIndex = finalValueStr.indexOf('.');
    const decimalPlaces = decimalIndex > 0 ? finalValueStr.length - 1 - decimalIndex : 0;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);

        let currentValue = 0 + (finalValue - 0) * percentage;
        elemento.innerText = currentValue.toFixed(decimalPlaces);

        if (progress < duration) {
            window.requestAnimationFrame(step);
        } else {
            elemento.innerText = finalValue.toFixed(decimalPlaces);
        }
    }
    window.requestAnimationFrame(step);
}

// ========================================
// TABLA DE FRECUENCIAS HTML
// ========================================
// Genera la tabla HTML con frecuencias absolutas, relativas y acumuladas
// Incluye fila de totales al final

function generarTablaHTML(tabla) {
    const tbody = document.getElementById('frequency-table-body');
    tbody.innerHTML = "";

    let sumaFi = 0;
    let sumaHi = 0;
    let sumaPi = 0;

    tabla.forEach(fila => {
        sumaFi += parseFloat(fila.fi);
        sumaHi += parseFloat(fila.hi);
        sumaPi += parseFloat(fila.pi);

        const row = `
            <tr>
                <td>${fila.x}</td>
                <td>${fila.fi}</td>
                <td>${fila.Fi}</td>
                <td>${fila.hi}</td>
                <td>${fila.pi}%</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    const totalHiStr = sumaHi.toFixed(4);
    const totalPiStr = Math.round(sumaPi) + "%";

    const filaTotal = `
        <tr style="background: rgba(0,0,0,0.1); font-weight: 700;">
            <td>TOTAL</td>
            <td>${sumaFi}</td>
            <td>--</td>
            <td>${totalHiStr}</td>
            <td>${totalPiStr}</td>
        </tr>
    `;

    tbody.innerHTML += filaTotal;
}

// ========================================
// MOSTRAR INFORMACIÓN DE ESTADÍSTICAS
// ========================================

window.mostrarInfoEstadistica = function(tipo) {
    if (!ultimoAnalisis || !ultimoAnalisis.datos || ultimoAnalisis.datos.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Información no disponible',
            text: 'Primero debes ejecutar un análisis con datos para ver los detalles de las estadísticas.',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#6B8E6B'
        });
        return;
    }

    const info = {
        media: {
            nombre: 'Media Aritmética',
            categoria: 'Medida de Tendencia Central',
            formula: '<strong>x̄ = Σx / n</strong>',
            significado: 'Representa el promedio de todos los valores del conjunto de datos.',
            calculo: () => {
                if (ultimoAnalisis.tipoDato !== 'cuantitativo') {
                    return 'Esta medida solo aplica para datos cuantitativos.';
                }
                const n = ultimoAnalisis.datos.length;
                const suma = ultimoAnalisis.datos.reduce((acc, val) => acc + val, 0);
                const datosStr = ultimoAnalisis.datos.slice(0, 10).join(' + ') + (n > 10 ? ' + ...' : '');
                return `
                    <strong>Cálculo paso a paso:</strong><br>
                    1. Suma de todos los datos: ${datosStr} = ${suma.toFixed(2)}<br>
                    2. Cantidad de datos (n): ${n}<br>
                    3. Media = ${suma.toFixed(2)} / ${n} = <strong>${ultimoAnalisis.media.toFixed(2)}</strong>
                `;
            }
        },
        mediana: {
            nombre: 'Mediana',
            categoria: 'Medida de Tendencia Central',
            formula: '<strong>Me = valor central (ordenado)</strong>',
            significado: 'Es el valor que divide el conjunto de datos ordenados en dos partes iguales.',
            calculo: () => {
                if (ultimoAnalisis.tipoDato !== 'cuantitativo') {
                    return 'Esta medida solo aplica para datos cuantitativos.';
                }
                const ordenados = [...ultimoAnalisis.datos].sort((a, b) => a - b);
                const n = ordenados.length;
                const mid = Math.floor(n / 2);
                const datosStr = ordenados.slice(0, 10).join(', ') + (n > 10 ? ', ...' : '');
                
                if (n % 2 !== 0) {
                    return `
                        <strong>Cálculo paso a paso:</strong><br>
                        1. Datos ordenados: [${datosStr}]<br>
                        2. Cantidad de datos: ${n} (impar)<br>
                        3. Posición central: ${mid + 1}<br>
                        4. Mediana = <strong>${ordenados[mid].toFixed(2)}</strong>
                    `;
                } else {
                    return `
                        <strong>Cálculo paso a paso:</strong><br>
                        1. Datos ordenados: [${datosStr}]<br>
                        2. Cantidad de datos: ${n} (par)<br>
                        3. Valores centrales: ${ordenados[mid - 1].toFixed(2)} y ${ordenados[mid].toFixed(2)}<br>
                        4. Mediana = (${ordenados[mid - 1].toFixed(2)} + ${ordenados[mid].toFixed(2)}) / 2 = <strong>${ultimoAnalisis.mediana.toFixed(2)}</strong>
                    `;
                }
            }
        },
        moda: {
            nombre: 'Moda',
            categoria: 'Medida de Tendencia Central',
            formula: '<strong>Mo = valor(es) con mayor frecuencia</strong>',
            significado: 'Es el valor o valores que más se repiten en el conjunto de datos.',
            calculo: () => {
                const modaObj = ultimoAnalisis.moda;
                const frecuencia = {};
                ultimoAnalisis.datos.forEach(val => frecuencia[val] = (frecuencia[val] || 0) + 1);
                
                let detalleFrec = Object.entries(frecuencia)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([val, frec]) => `${val}: ${frec} veces`)
                    .join(', ');
                
                return `
                    <strong>Cálculo paso a paso:</strong><br>
                    1. Frecuencias: ${detalleFrec}${Object.keys(frecuencia).length > 5 ? ', ...' : ''}<br>
                    2. Frecuencia máxima: ${modaObj.frecuencia} veces<br>
                    3. Tipo: ${modaObj.tipo}<br>
                    4. Moda = <strong>${modaObj.valor}</strong>
                `;
            }
        },
        rango: {
            nombre: 'Rango',
            categoria: 'Medida de Dispersión',
            formula: '<strong>R = Max - Min</strong>',
            significado: 'Indica la amplitud o variación total de los datos.',
            calculo: () => {
                if (ultimoAnalisis.tipoDato !== 'cuantitativo') {
                    return 'Esta medida solo aplica para datos cuantitativos.';
                }
                const max = Math.max(...ultimoAnalisis.datos);
                const min = Math.min(...ultimoAnalisis.datos);
                return `
                    <strong>Cálculo paso a paso:</strong><br>
                    1. Valor máximo: ${max.toFixed(2)}<br>
                    2. Valor mínimo: ${min.toFixed(2)}<br>
                    3. Rango = ${max.toFixed(2)} - ${min.toFixed(2)} = <strong>${ultimoAnalisis.rango.toFixed(2)}</strong>
                `;
            }
        },
        varianza: {
            nombre: 'Varianza Muestral',
            categoria: 'Medida de Dispersión',
            formula: '<strong>s² = Σ(x - x̄)² / (n - 1)</strong>',
            significado: 'Mide qué tan dispersos están los datos respecto a su media. Se usa n-1 para muestras.',
            calculo: () => {
                if (ultimoAnalisis.tipoDato !== 'cuantitativo') {
                    return 'Esta medida solo aplica para datos cuantitativos.';
                }
                const n = ultimoAnalisis.datos.length;
                const media = ultimoAnalisis.media;
                const sumaDiferencias = ultimoAnalisis.datos.reduce((acc, val) => acc + Math.pow(val - media, 2), 0);
                
                return `
                    <strong>Cálculo paso a paso:</strong><br>
                    1. Media (x̄): ${media.toFixed(2)}<br>
                    2. Calcular (x - x̄)² para cada dato y sumar<br>
                    3. Σ(x - x̄)² = ${sumaDiferencias.toFixed(2)}<br>
                    4. Cantidad de datos (n): ${n}<br>
                    5. Varianza = ${sumaDiferencias.toFixed(2)} / (${n} - 1) = ${sumaDiferencias.toFixed(2)} / ${n - 1} = <strong>${ultimoAnalisis.varianza.toFixed(2)}</strong><br>
                    <small style="color: #666;">Se usa n-1 porque es una muestra, no población completa</small>
                `;
            }
        },
        desviacion: {
            nombre: 'Desviación Estándar',
            categoria: 'Medida de Dispersión',
            formula: '<strong>s = √s²</strong>',
            significado: 'Es la raíz cuadrada de la varianza. Indica la dispersión promedio de los datos respecto a la media, en las mismas unidades que los datos originales.',
            calculo: () => {
                if (ultimoAnalisis.tipoDato !== 'cuantitativo') {
                    return 'Esta medida solo aplica para datos cuantitativos.';
                }
                return `
                    <strong>Cálculo paso a paso:</strong><br>
                    1. Varianza (s²): ${ultimoAnalisis.varianza.toFixed(2)}<br>
                    2. Desviación estándar = √${ultimoAnalisis.varianza.toFixed(2)}<br>
                    3. s = <strong>${ultimoAnalisis.desviacion.toFixed(2)}</strong><br>
                    <small style="color: #666;">La desviación estándar nos devuelve a las unidades originales de los datos</small>
                `;
            }
        }
    };

    const data = info[tipo];
    if (!data) return;

    Swal.fire({
        title: `<span style="color: #BC8389; font-size: 1.8rem; font-weight: 700;">${data.nombre}</span>`,
        html: `
            <div style="text-align: left; max-height: 500px; overflow-y: auto; padding: 1rem 0.5rem;">
                <div style="background: linear-gradient(135deg, #BC8389 0%, #D9A590 100%); color: white; padding: 0.8rem 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; text-align: center; box-shadow: 0 4px 12px rgba(188, 131, 137, 0.2);">
                    <i class="fa-solid fa-chart-line" style="margin-right: 0.5rem;"></i>
                    <strong style="font-size: 1.05rem; letter-spacing: 0.05em;">${data.categoria.toUpperCase()}</strong>
                </div>
                
                <div style="background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); padding: 1.2rem; border-radius: 12px; margin-bottom: 1.5rem; border: 2px solid #6B8E6B;">
                    <h4 style="color: #6B8E6B; margin-top: 0; margin-bottom: 0.8rem; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fa-solid fa-calculator"></i> Fórmula Matemática
                    </h4>
                    <div style="background: white; padding: 1rem; border-radius: 8px; font-size: 1.3rem; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.08); font-family: 'Courier New', monospace; color: #2c2c2c;">
                        ${data.formula}
                    </div>
                </div>
                
                <div style="background: linear-gradient(135deg, #fff9f0 0%, #ffffff 100%); padding: 1.2rem; border-radius: 12px; margin-bottom: 1.5rem; border-left: 4px solid #D9A590;">
                    <h4 style="color: #D9A590; margin-top: 0; margin-bottom: 0.8rem; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fa-solid fa-lightbulb"></i> ¿Qué Significa?
                    </h4>
                    <p style="color: #5A4A4A; font-size: 1rem; line-height: 1.8; margin: 0; text-align: justify;">
                        ${data.significado}
                    </p>
                </div>
                
                <div style="background: linear-gradient(135deg, #f0f8f0 0%, #ffffff 100%); padding: 1.2rem; border-radius: 12px; border: 2px dashed #6B8E6B;">
                    <h4 style="color: #6B8E6B; margin-top: 0; margin-bottom: 1rem; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fa-solid fa-list-ol"></i> Cálculo con Tus Datos
                    </h4>
                    <div style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); font-size: 0.95rem; line-height: 2; color: #2c2c2c;">
                        ${data.calculo()}
                    </div>
                </div>
            </div>
        `,
        width: '750px',
        confirmButtonText: '<i class="fa-solid fa-check-circle"></i> Entendido',
        confirmButtonColor: '#6B8E6B',
        customClass: {
            popup: 'info-estadistica-popup',
            confirmButton: 'info-confirm-btn'
        },
        didOpen: () => {
            const style = document.createElement('style');
            style.textContent = `
                .info-estadistica-popup {
                    border-radius: 20px !important;
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2) !important;
                    font-family: 'Poppins', sans-serif !important;
                }
                .info-confirm-btn {
                    padding: 0.8rem 2.5rem !important;
                    border-radius: 25px !important;
                    font-weight: 600 !important;
                    font-size: 1.05rem !important;
                    letter-spacing: 0.05em !important;
                    box-shadow: 0 4px 12px rgba(107, 142, 107, 0.3) !important;
                    transition: all 0.3s ease !important;
                }
                .info-confirm-btn:hover {
                    transform: translateY(-2px) !important;
                    box-shadow: 0 6px 16px rgba(107, 142, 107, 0.4) !important;
                }
            `;
            document.head.appendChild(style);
        }
    });
}

// ========================================
// EXPORTAR PDF
// ========================================

async function exportarPDF() {
    if (!ultimoAnalisis) {
        Toast.fire({ icon: 'error', title: 'No hay datos para exportar' });
        return;
    }
    
    Toast.fire({ icon: 'info', title: 'Generando PDF ejecutivo...' });
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - 2 * margin;
        let yPos = margin;
        
        const addNewPage = () => {
            doc.addPage();
            yPos = margin;
        };
        
        const checkPageBreak = (requiredSpace) => {
            if (yPos + requiredSpace > pageHeight - margin) {
                addNewPage();
            }
        };
        
        doc.setFillColor(188, 131, 137);
        doc.rect(0, 0, pageWidth, 60, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(26);
        doc.setFont('helvetica', 'bold');
        doc.text('ANÁLISIS ESTADÍSTICO', pageWidth / 2, 25, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Informe Ejecutivo', pageWidth / 2, 35, { align: 'center' });
        doc.text('Universidad de La Guajira', pageWidth / 2, 45, { align: 'center' });
        
        yPos = 75;
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const fecha = new Date().toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        doc.text(`Fecha: ${fecha}`, margin, yPos);
        yPos += 15;
        
        if (ultimoAnalisis.contexto) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(188, 131, 137);
            doc.text('Contexto del Análisis', margin, yPos);
            yPos += 8;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            const contextLines = doc.splitTextToSize(ultimoAnalisis.contexto, contentWidth);
            doc.text(contextLines, margin, yPos);
            yPos += contextLines.length * 5 + 10;
        }
        
        checkPageBreak(40);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(188, 131, 137);
        doc.text('Datos Originales', margin, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        const datosText = ultimoAnalisis.datosOriginales.join(', ');
        const datosLines = doc.splitTextToSize(datosText, contentWidth);
        doc.text(datosLines, margin, yPos);
        yPos += datosLines.length * 5 + 10;
        
        checkPageBreak(50);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(188, 131, 137);
        doc.text('Tipo de Dato', margin, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`${ultimoAnalisis.tipoDato.charAt(0).toUpperCase() + ultimoAnalisis.tipoDato.slice(1)}`, margin, yPos);
        yPos += 15;
        
        checkPageBreak(100);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(188, 131, 137);
        doc.text('Estadísticas Descriptivas', margin, yPos);
        yPos += 10;
        
        const stats = ultimoAnalisis;
        const statsData = [
            ['Medida', 'Valor'],
            ['Media', stats.media !== null && stats.media !== undefined ? stats.media.toFixed(2) : 'N/A'],
            ['Mediana', stats.mediana !== null && stats.mediana !== undefined ? stats.mediana.toFixed(2) : 'N/A'],
            ['Moda', stats.moda ? (stats.moda.valor || 'N/A') : 'N/A'],
            ['Rango', stats.rango !== null && stats.rango !== undefined ? stats.rango.toFixed(2) : 'N/A'],
            ['Varianza', stats.varianza !== null && stats.varianza !== undefined ? stats.varianza.toFixed(2) : 'N/A'],
            ['Desviación Estándar', stats.desviacion !== null && stats.desviacion !== undefined ? stats.desviacion.toFixed(2) : 'N/A']
        ];
        
        doc.autoTable({
            startY: yPos,
            head: [statsData[0]],
            body: statsData.slice(1),
            theme: 'grid',
            headStyles: { 
                fillColor: [188, 131, 137],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 10
            },
            bodyStyles: { fontSize: 9 },
            margin: { left: margin, right: margin },
            tableWidth: contentWidth
        });
        
        yPos = doc.lastAutoTable.finalY + 15;
        
        checkPageBreak(100);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(188, 131, 137);
        doc.text('Visualizaciones', margin, yPos);
        yPos += 10;
        
        const canvasIds = ['mainChart', 'pieChart', 'boxplot'];
        const canvasTitles = ['Histograma', 'Gráfico Circular', 'Diagrama de Caja'];
        
        for (let i = 0; i < canvasIds.length; i++) {
            const canvas = document.getElementById(canvasIds[i]);
            if (canvas) {
                checkPageBreak(80);
                
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(100, 100, 100);
                doc.text(canvasTitles[i], margin, yPos);
                yPos += 5;
                
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = contentWidth * 0.85;
                const imgHeight = (canvas.height / canvas.width) * imgWidth;
                
                doc.addImage(imgData, 'PNG', margin + (contentWidth - imgWidth) / 2, yPos, imgWidth, imgHeight);
                yPos += imgHeight + 10;
            }
        }
        
        if (ultimoAnalisis.tablaFrecuencia && ultimoAnalisis.tablaFrecuencia.length > 0) {
            checkPageBreak(80);
            
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(188, 131, 137);
            doc.text('Tabla de Frecuencias', margin, yPos);
            yPos += 10;
            
            const tableData = [
                ['Valor', 'Frec. Absoluta', 'Frec. Relativa', 'Frec. Acumulada']
            ];
            
            ultimoAnalisis.tablaFrecuencia.forEach(row => {
                tableData.push([
                    row.valor.toString(),
                    row.frecuencia.toString(),
                    row.frecuenciaRelativa.toFixed(4),
                    row.frecuenciaAcumulada.toString()
                ]);
            });
            
            doc.autoTable({
                startY: yPos,
                head: [tableData[0]],
                body: tableData.slice(1),
                theme: 'grid',
                headStyles: { 
                    fillColor: [188, 131, 137],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: 9
                },
                bodyStyles: { fontSize: 8 },
                margin: { left: margin, right: margin },
                tableWidth: contentWidth
            });
            
            yPos = doc.lastAutoTable.finalY + 15;
        }
        
        if (ultimoAnalisis.conclusionBasica) {
            checkPageBreak(50);
            
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(188, 131, 137);
            doc.text('Conclusiones', margin, yPos);
            yPos += 8;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            const conclusionLines = doc.splitTextToSize(ultimoAnalisis.conclusionBasica, contentWidth);
            doc.text(conclusionLines, margin, yPos);
            yPos += conclusionLines.length * 5 + 10;
        }
        
        if (ultimoAnalisis.conclusionIA) {
            checkPageBreak(50);
            
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(188, 131, 137);
            doc.text('Análisis con IA', margin, yPos);
            yPos += 8;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            const iaLines = doc.splitTextToSize(ultimoAnalisis.conclusionIA, contentWidth);
            doc.text(iaLines, margin, yPos);
            yPos += iaLines.length * 5 + 10;
        }
        
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `Página ${i} de ${totalPages}`, 
                pageWidth / 2, 
                pageHeight - 10, 
                { align: 'center' }
            );
        }
        
        doc.save(`analisis-estadistico-${Date.now()}.pdf`);
        
        Toast.fire({ icon: 'success', title: 'PDF descargado exitosamente' });
        
    } catch (error) {
        console.error('Error al generar PDF:', error);
        Toast.fire({ icon: 'error', title: 'Error al generar PDF' });
    }
}

// ========================================
// FUNCIONES DE IA
// ========================================

function toggleAIChat() {
    const chatWindow = document.getElementById('ai-chat-window');
    chatWindow.classList.toggle('active');
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatMessage();
    }
}

async function sendChatMessage() {
    const input = document.getElementById('ai-chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    const messagesContainer = document.getElementById('ai-chat-messages');
    const sendButton = document.getElementById('ai-chat-send');
    
    addChatMessage(message, 'user');
    input.value = '';
    sendButton.disabled = true;
    
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'ai-message bot';
    typingIndicator.innerHTML = `
        <div class="ai-message-avatar">
            <i class="fa-solid fa-robot"></i>
        </div>
        <div class="ai-typing-indicator">
            <div class="ai-typing-dot"></div>
            <div class="ai-typing-dot"></div>
            <div class="ai-typing-dot"></div>
        </div>
    `;
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    try {
        const hasAnalysis = ultimoAnalisis && ultimoAnalisis.datos && ultimoAnalisis.datos.length > 0;
        const response = await chatWithAI(message, hasAnalysis);
        
        messagesContainer.removeChild(typingIndicator);
        addChatMessage(response, 'bot');
    } catch (error) {
        messagesContainer.removeChild(typingIndicator);
        addChatMessage('Lo siento, ha ocurrido un error. Por favor, intenta de nuevo.', 'bot');
    } finally {
        sendButton.disabled = false;
    }
}

function addChatMessage(content, type) {
    const messagesContainer = document.getElementById('ai-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${type}`;
    
    const avatar = type === 'bot' 
        ? '<i class="fa-solid fa-robot"></i>'
        : '<i class="fa-solid fa-user"></i>';
    
    messageDiv.innerHTML = `
        <div class="ai-message-avatar">
            ${avatar}
        </div>
        <div class="ai-message-content">
            ${content}
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function generarContextoIA() {
    const input = document.getElementById('data-input');
    const contextArea = document.getElementById('data-context');
    const button = document.getElementById('btn-gen-context');
    
    const datosStr = input.value.trim();
    if (!datosStr) {
        Toast.fire({ icon: 'warning', title: 'Primero ingrese datos para generar el contexto' });
        return;
    }
    
    const datos = parsearDatos(datosStr);
    if (datos.length === 0) {
        Toast.fire({ icon: 'warning', title: 'No se pudieron procesar los datos' });
        return;
    }
    
    button.disabled = true;
    button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generando...';
    
    try {
        const context = await generateContextForData(datos);
        contextArea.value = context;
        Toast.fire({ icon: 'success', title: 'Contexto generado con IA' });
    } catch (error) {
        Toast.fire({ icon: 'error', title: 'Error al generar contexto' });
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generar con IA';
    }
}

function parsearDatos(str) {
    const separadores = /[\s,;\n]+/;
    const partes = str.split(separadores).map(v => v.trim()).filter(v => v.length > 0);
    
    const esNumero = partes.every(v => !isNaN(parseFloat(v)) && isFinite(v));
    
    if (esNumero) {
        return partes.map(v => parseFloat(v));
    } else {
        return partes;
    }
}

window.mostrarCampoContexto = function() {
    const contextSection = document.getElementById('context-section');
    if (contextSection) {
        contextSection.style.display = 'block';
    }
}
