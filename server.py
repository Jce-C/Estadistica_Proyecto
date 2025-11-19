#!/usr/bin/env python3
# ========================================
# SERVIDOR BACKEND - FLASK + GEMINI AI
# ========================================
# API REST que proporciona:
# - Servir archivos estáticos (HTML, CSS, JS)
# - Generar contextos narrativos con IA
# - Generar análisis estadísticos con IA
# - Chat interactivo para ayuda estadística
# - Procesamiento de archivos Excel
# ========================================

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from google import genai

# Configuración de Flask
app = Flask(__name__, static_folder='.')
CORS(app)  # Habilitar CORS para peticiones desde el frontend

# ========================================
# CONFIGURACIÓN DE GEMINI AI
# ========================================
# Obtener la API key desde las variables de entorno (Replit Secrets)
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError(
        "ERROR: GEMINI_API_KEY no encontrada en las variables de entorno.\n"
        "Por favor, configura tu clave API de Gemini en Replit Secrets.\n"
        "Obtén tu clave gratis en: https://aistudio.google.com/apikey"
    )

client = genai.Client(api_key=GEMINI_API_KEY)

# ========================================
# RUTAS PARA SERVIR ARCHIVOS ESTÁTICOS
# ========================================

@app.route('/')
def index():
    """Sirve la página principal index.html"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Sirve cualquier archivo estático (CSS, JS, imágenes)"""
    return send_from_directory('.', path)

# ========================================
# API: GENERAR CONTEXTO NARRATIVO
# ========================================
# Recibe datos y genera una descripción contextual usando Gemini AI
# Detecta automáticamente si los datos son numéricos o textuales

@app.route('/api/generate-context', methods=['POST'])
def generate_context():
    try:
        data = request.get_json()
        print(f"[DEBUG] Datos recibidos: {data}")
        datos = data.get('datos', [])
        
        if not datos:
            print("[DEBUG] No se proporcionaron datos")
            return jsonify({'error': 'No se proporcionaron datos'}), 400
        
        # Intentar procesar como datos numéricos
        try:
            datos_numericos = [float(d) for d in datos]
            min_val = min(datos_numericos)
            max_val = max(datos_numericos)
            cantidad = len(datos_numericos)
            
            # Detectar si son enteros o decimales
            son_enteros = all(d == int(d) for d in datos_numericos)
            tipo_numero = "enteros" if son_enteros else "decimales"
            
            # Preparar muestra de datos para el prompt
            datos_str = ', '.join(map(str, datos[:20]))
            if len(datos) > 20:
                datos_str += '...'
            
            print(f"[DEBUG] Análisis: {cantidad} valores, rango {min_val}-{max_val}, tipo {tipo_numero}")
            
            # Prompt para generar contexto de datos numéricos
            prompt = f"""Genera un contexto narrativo realista de 2-3 oraciones para estos datos estadísticos:
- Rango: {min_val} a {max_val}
- Cantidad: {cantidad} valores
- Tipo: {tipo_numero}

Crea un escenario empresarial, educativo o de investigación en Riohacha/La Guajira que explique QUÉ se está midiendo y POR QUÉ.

Ejemplo del estilo deseado:
"Una empresa de logística en Riohacha está auditando los tiempos de entrega de sus motorizados para optimizar las rutas. Se tomó una muestra aleatoria de los pedidos entregados durante la última hora pico."

Genera un contexto similar apropiado para estos datos. NO uses puntos suspensivos."""
            
            print("[DEBUG] Llamando a Gemini (GRATIS)...")
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            
            context = response.text.strip() if response.text else "Conjunto de datos para análisis."
            print(f"[DEBUG] Contexto generado: {context}")
            return jsonify({'context': context})
            
        except Exception as inner_e:
            # Si falla el procesamiento numérico, tratar como datos cualitativos
            print(f"[DEBUG] Error procesando datos numéricos: {inner_e}")
            datos_str = ', '.join(map(str, datos[:20]))
            if len(datos) > 20:
                datos_str += '...'
            
            # Prompt para generar contexto de datos cualitativos
            prompt = f"""Genera un contexto narrativo realista de 2-3 oraciones para estos datos cualitativos: {datos_str}

Crea un escenario empresarial, educativo o de investigación en Riohacha/La Guajira que explique QUÉ se está midiendo y POR QUÉ.

Ejemplo: "El departamento de recursos humanos de la Universidad de La Guajira realizó una encuesta de satisfacción laboral entre sus docentes. Los datos recopilados ayudarán a identificar áreas de mejora en el ambiente de trabajo."

Genera un contexto similar apropiado para estos datos cualitativos."""
            
            print("[DEBUG] Llamando a Gemini para datos cualitativos (GRATIS)...")
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            
            context = response.text.strip() if response.text else "Datos para análisis."
            print(f"[DEBUG] Contexto generado (cualitativo): {context}")
            return jsonify({'context': context})
        
    except Exception as e:
        print(f"[ERROR] Error en generate_context: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# ========================================
# API: GENERAR ANÁLISIS ESTADÍSTICO CON IA
# ========================================
# Recibe estadísticas calculadas y genera un análisis narrativo detallado

@app.route('/api/generate-analysis', methods=['POST'])
def generate_analysis():
    try:
        data = request.get_json()
        stats = data.get('stats', {})
        context = data.get('context', '')
        datos = data.get('datos', [])
        
        # Preparar muestra de datos
        datos_str = ', '.join(map(str, datos[:15]))
        if len(datos) > 15:
            datos_str += '...'
        
        # Calcular información de frecuencias
        from collections import Counter
        datos_list = list(datos)
        counter = Counter(datos_list)
        freq_info = ", ".join([f"{val} aparece {count} {'vez' if count == 1 else 'veces'}" for val, count in counter.most_common(5)])
        
        # Prompt para generar análisis narrativo
        prompt = f"""Contexto: {context}

Datos completos: {datos_str}
Frecuencias: {freq_info}

Estadísticas calculadas:
- Media: {stats.get('media')}
- Mediana: {stats.get('mediana')}
- Moda: {stats.get('moda')}
- Rango: {stats.get('rango')}
- Desviación estándar: {stats.get('desviacion')}

Genera una conclusión narrativa detallada de 3-5 oraciones al estilo de este ejemplo:

"Los resultados mostraron que la gran mayoría, un total de seis entregas, se realizaron en exactamente 15 minutos. Hubo un grupo rápido de cuatro pedidos que llegaron en apenas 10 minutos. Sin embargo, debido al tráfico en el centro, tres entregas tardaron 25 minutos y dos pedidos más lejanos demoraron 30 minutos. Finalmente, hubo un único caso excepcional de una entrega express que tardó solo 5 minutos."

Analiza los datos reales y genera una conclusión similar que:
1. Mencione las frecuencias más importantes
2. Explique patrones observados
3. Destaque valores extremos o inusuales
4. Use lenguaje narrativo y profesional

NO repitas las estadísticas básicas, enfócate en contar la historia de los datos."""
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        
        analysis = response.text.strip() if response.text else "Análisis completado."
        return jsonify({'analysis': analysis})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ========================================
# API: CHAT INTERACTIVO PARA AYUDA
# ========================================
# Proporciona un asistente virtual que responde preguntas sobre estadística

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message', '')
        chat_history = data.get('history', [])
        analysis_context = data.get('analysisContext')
        
        # Instrucciones del sistema para el asistente
        system_instruction = """Eres un asistente de estadística amigable y útil. Ayudas a los usuarios a entender:
1. Cómo usar la aplicación de análisis estadístico
2. Qué significan las diferentes estadísticas (media, mediana, moda, etc.)
3. Cómo interpretar los gráficos

Responde de forma clara, concisa y amigable. Usa un lenguaje sencillo sin tecnicismos innecesarios."""
        
        # Agregar contexto del análisis actual si existe
        if analysis_context:
            system_instruction += f"\n\nDatos del análisis actual:\n{analysis_context}"
        
        # Construir prompt con historial de conversación
        chat_messages = "\n".join([f"{msg['role']}: {msg['content']}" for msg in chat_history[-10:]])
        full_prompt = f"{system_instruction}\n\nHistorial de conversación:\n{chat_messages}\n\nUsuario: {message}\n\nAsistente:"
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=full_prompt
        )
        
        reply = response.text.strip() if response.text else "Lo siento, no pude procesar tu mensaje."
        return jsonify({'reply': reply})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ========================================
# API: GENERAR LEYENDAS PARA GRÁFICOS (OBSOLETO)
# ========================================
# Esta función ya no se usa pero se mantiene por compatibilidad

@app.route('/api/generate-chart-legend', methods=['POST'])
def generate_chart_legend():
    try:
        data = request.get_json()
        chart_type = data.get('chartType', '')
        context = data.get('context', '')
        datos = data.get('datos', [])
        stats = data.get('stats', {})
        
        datos_str = ', '.join(map(str, datos[:10]))
        if len(datos) > 10:
            datos_str += '...'
        
        if chart_type == 'histogram':
            context_info = f"\n\nContexto del análisis: {context}" if context else ""
            prompt = f"""Datos: {datos_str}
Estadísticas: Media={stats.get('media', 'N/A')}, Mediana={stats.get('mediana', 'N/A')}{context_info}

Genera una leyenda breve (1-2 oraciones) para un HISTOGRAMA que explique qué muestra la distribución de frecuencias. Sé específico sobre lo que representa cada barra.

Ejemplo: "Cada barra representa la cantidad de valores que aparecen con esa frecuencia. La altura indica cuántas veces se repite cada valor en el conjunto de datos."

Genera una leyenda similar y clara."""
        
        elif chart_type == 'pie':
            context_info = f"\n\nContexto del análisis: {context}" if context else ""
            prompt = f"""Datos: {datos_str}{context_info}

Genera una leyenda breve (1-2 oraciones) para un GRÁFICO CIRCULAR que explique qué representan las proporciones y los segmentos.

Ejemplo: "Cada segmento muestra el porcentaje que representa cada valor del total. Los colores diferentes facilitan comparar las proporciones visualmentevisuales."

Genera una leyenda similar y clara."""
        
        elif chart_type == 'boxplot':
            context_info = f"\n\nContexto del análisis: {context}" if context else ""
            prompt = f"""Estadísticas: Mediana={stats.get('mediana', 'N/A')}, Q1={stats.get('q1', 'N/A')}, Q3={stats.get('q3', 'N/A')}{context_info}

Genera una leyenda breve (1-2 oraciones) para un DIAGRAMA DE CAJA que explique qué muestran la caja, la línea central y los bigotes.

Ejemplo: "La caja muestra el rango donde se concentra el 50% central de los datos. La línea dentro de la caja indica la mediana, y los bigotes muestran los valores mínimos y máximos."

Genera una leyenda similar y clara."""
        
        else:
            return jsonify({'legend': ''}), 200
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        
        legend = response.text.strip() if response.text else ''
        return jsonify({'legend': legend})
        
    except Exception as e:
        print(f"[ERROR] Error en generate_chart_legend: {str(e)}")
        return jsonify({'legend': ''}), 200

# ========================================
# API: PROCESAR ARCHIVOS EXCEL
# ========================================
# Lee archivos Excel y extrae columnas de datos para análisis

@app.route('/api/upload-excel', methods=['POST'])
def upload_excel():
    try:
        import pandas as pd
        import io
        
        # Validar que se envió un archivo
        if 'file' not in request.files:
            return jsonify({'error': 'No se proporcionó ningún archivo'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'Nombre de archivo vacío'}), 400
        
        # Validar extensión de archivo
        if not (file.filename.endswith('.xlsx') or file.filename.endswith('.xls')):
            return jsonify({'error': 'Solo se aceptan archivos Excel (.xlsx, .xls)'}), 400
        
        # Validar tamaño de archivo (máximo 10MB)
        MAX_FILE_SIZE = 10 * 1024 * 1024
        file.seek(0, 2)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({'error': 'Archivo demasiado grande (máximo 10MB)'}), 400
        
        # Leer archivo Excel
        file_bytes = file.read()
        
        try:
            df = pd.read_excel(io.BytesIO(file_bytes), engine='openpyxl')
        except Exception as e:
            print(f"[ERROR] Error leyendo Excel con openpyxl: {e}")
            return jsonify({'error': f'Error al procesar el archivo Excel: {str(e)}'}), 500
        
        if df.empty:
            return jsonify({'error': 'El archivo Excel está vacío'}), 400
        
        # Analizar cada columna y detectar tipo de datos
        columns_info = []
        for col in df.columns:
            col_data = df[col].dropna()
            
            if col_data.empty:
                inferred_type = 'empty'
            elif pd.api.types.is_numeric_dtype(col_data):
                inferred_type = 'cuantitativo'
            else:
                inferred_type = 'cualitativo'
            
            columns_info.append({
                'name': str(col),
                'type': inferred_type,
                'count': int(col_data.count())
            })
        
        # Preparar vista previa de los primeros 10 registros
        preview_rows = df.head(10).fillna('').to_dict(orient='records')
        
        # Extraer datos de cada columna
        raw_series = {}
        for col in df.columns:
            col_data = df[col].dropna().tolist()
            raw_series[str(col)] = col_data
        
        print(f"[DEBUG] Excel procesado: {len(df)} filas, {len(df.columns)} columnas")
        
        return jsonify({
            'success': True,
            'columns': columns_info,
            'previewRows': preview_rows,
            'rawSeries': raw_series,
            'totalRows': len(df),
            'filename': file.filename
        })
        
    except Exception as e:
        print(f"[ERROR] Error en upload_excel: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# ========================================
# CONFIGURACIÓN DE CACHÉ
# ========================================
# Deshabilitar caché para que los cambios se vean inmediatamente

@app.after_request
def add_header(response):
    """Agrega headers para prevenir caché del navegador"""
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

# ========================================
# INICIO DEL SERVIDOR
# ========================================

if __name__ == "__main__":
    PORT = 5000
    print(f"Server running at http://0.0.0.0:{PORT}/")
    app.run(host="0.0.0.0", port=PORT, debug=False)
