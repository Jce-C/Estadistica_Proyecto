let chatHistory = [];
let analysisContext = null;

async function generateContextForData(datos) {
    try {
        const response = await fetch('/api/generate-context', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ datos })
        });

        if (!response.ok) {
            throw new Error('Error en el servidor');
        }

        const data = await response.json();
        return data.context;
    } catch (error) {
        console.error('Error generando contexto:', error);
        return 'Conjunto de datos para análisis estadístico.';
    }
}

async function generateAnalysisWithContext(stats, context, datos) {
    try {
        const response = await fetch('/api/generate-analysis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ stats, context, datos })
        });

        if (!response.ok) {
            throw new Error('Error en el servidor');
        }

        const data = await response.json();
        return data.analysis;
    } catch (error) {
        console.error('Error generando análisis:', error);
        return 'Los datos han sido procesados correctamente. Consulta las estadísticas para más detalles.';
    }
}

async function chatWithAI(userMessage, includeAnalysis = false) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: userMessage,
                history: chatHistory,
                analysisContext: includeAnalysis ? analysisContext : null
            })
        });

        if (!response.ok) {
            throw new Error('Error en el servidor');
        }

        const data = await response.json();
        const reply = data.reply;
        
        chatHistory.push({ role: 'user', content: userMessage });
        chatHistory.push({ role: 'assistant', content: reply });
        
        if (chatHistory.length > 20) {
            chatHistory = chatHistory.slice(-20);
        }

        return reply;
    } catch (error) {
        console.error('Error en chat:', error);
        throw error;
    }
}

async function generateChartLegend(chartType, context, datos, stats) {
    try {
        const response = await fetch('/api/generate-chart-legend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ chartType, context, datos, stats })
        });

        if (!response.ok) {
            return '';
        }

        const data = await response.json();
        return data.legend || '';
    } catch (error) {
        console.error('Error generando leyenda:', error);
        return '';
    }
}

function setAnalysisContext(data) {
    analysisContext = data;
}

function clearChatHistory() {
    chatHistory = [];
}
