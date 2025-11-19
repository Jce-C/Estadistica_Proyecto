# Statistical Analysis Web Application

## Overview

This web-based statistical analysis tool, developed for a Statistics and Probability course, offers comprehensive descriptive statistics for both quantitative and qualitative data. It features interactive visualizations (histograms, pie charts, box plots) and AI-powered contextual analysis using Google's Gemini AI. Users can input data manually, load demo datasets, or import Excel files, and the application calculates key statistical measures (mean, median, mode, range, variance, standard deviation). The tool generates professional executive-quality PDF reports with complete analysis workflow documentation. The project aims to provide an intuitive and free-to-use educational resource for statistical exploration.

## Recent Changes (November 19, 2025 - Latest Session)

### Replit Environment Setup and Major UX Improvements (Current Session - Latest)
- **GitHub Import Setup**: Successfully configured the project for Replit environment
  - Installed Python 3.11 and all required dependencies
  - Cleaned up requirements.txt (removed duplicates)
  - Created .gitignore for Python environment
  - Configured GEMINI_API_KEY secret for AI features
  - Set up Flask Server workflow on port 5000 with webview output
  - Configured autoscale deployment with Gunicorn for production
- **Critical PDF Export Bug Fix**: Fixed data retrieval issue in exportarPDF function
  - Added `datosOriginales` and `contexto` properties to `ultimoAnalisis` object in both quantitative and qualitative data paths
  - Changed `const stats = ultimoAnalisis.estadisticas` to `const stats = ultimoAnalisis` (stats are at root level)
  - Fixed `stats.desviacionEstandar` to `stats.desviacion` to match actual property name
  - Fixed moda display to use `stats.moda.valor` instead of assuming array structure
  - PDF export now works correctly without errors
- **Chart Improvements**: Enhanced visualizations with better axis labeling and cleaner design
  - Added axis titles to all charts (Histograma: Y="Frecuencia", X="Valores/Categorías"; Boxplot: X="Valores")
  - Removed verbose AI-generated legend paragraphs below charts for cleaner, more concise presentation
  - Legends are now integrated directly into the charts themselves
- **Enhanced PDF Report**: Complete conclusions now included in exported PDFs
  - Basic statistical conclusions automatically added to PDF report
  - AI-generated analysis included when context is provided
  - Both conclusion sections properly formatted and positioned in the PDF
  - Saves `conclusionBasica` and `conclusionIA` to `ultimoAnalisis` object for PDF export
- **Button Improvements**: Simplified execute button for better UX
  - Removed complex ripple animation (::after pseudo-element) that caused visual issues
  - Reduced padding from 0.85rem 2rem to 0.75rem 1.5rem for more compact size
  - Cleaner hover animation with simple lift effect
- **Code Documentation**: All major files now have comprehensive comments
  - statistics.js: Documented all statistical calculations (mean, median, mode, variance, etc.)
  - charts.js: Explained chart generation process (histogram, pie chart, boxplot)
  - main.js: Added overview comments for main analysis function and navigation system
  - server.py: Fully documented backend APIs (AI integration, Excel processing, etc.)
  - Comments are direct, explanatory, and avoid condescension
- **Application Status**: Fully operational and ready to use

### Mejoras en Exportación PDF y Leyendas de Gráficos con IA (Previous Session)
- **Corrección de Error PDF**: Arreglados IDs de canvas incorrectos en exportarPDF
  - Cambiados de 'histograma', 'piechart' a 'mainChart', 'pieChart' para coincidir con el HTML
  - PDF ahora se genera exitosamente sin errores
- **Limpieza de HTML**: Eliminada línea "Desarrollado con: Python, Streamlit, OpenAI" del info-card
- **Sistema de Leyendas con IA**: Implementación completa de leyendas contextuales para gráficos
  - Nuevo endpoint `/api/generate-chart-legend` en server.py usando Gemini AI
  - Genera leyendas específicas de 1-2 oraciones para cada tipo de gráfico (histograma, circular, caja)
  - Funciona con o sin contexto del usuario
  - Leyendas se generan automáticamente cuando hay datos disponibles
  - Elementos `<p>` agregados en HTML debajo de cada gráfico para mostrar leyendas
  - Función `generarLeyendasIA()` en charts.js que llama al endpoint y muestra leyendas
  - Leyendas mejoran significativamente la comprensión visual de los gráficos

### Replit Environment Setup (Previous Session)
- **GitHub Import Completed**: Successfully imported and configured the project for Replit environment
- **Python Dependencies Installed**: 
  - Flask 3.1.2 (web framework)
  - Flask-CORS 6.0.1 (CORS support)
  - google-genai 1.51.0 (Gemini AI integration)
  - gunicorn 23.0.0 (production WSGI server)
  - pandas 2.2.0 (data processing for Excel files)
  - openpyxl 3.1.2 (Excel file parsing)
- **Environment Configuration**:
  - Created .gitignore file for Python environment
  - Configured GEMINI_API_KEY secret for AI features
  - Verified server binding to 0.0.0.0:5000 for Replit proxy compatibility
- **Workflow Configuration**: 
  - Set up Flask Server workflow on port 5000 with webview output
  - Server successfully running and serving all static assets
  - CORS enabled for development flexibility
  - Cache control headers configured to prevent caching issues
- **Deployment Configuration**: 
  - Configured autoscale deployment using Gunicorn production server
  - Production command: `gunicorn --bind=0.0.0.0:5000 --reuse-port server:app`
- **Application Status**: Fully operational and ready to use

### Server-Side Excel Processing with pandas (Previous Session)
- **Backend Excel Endpoint**: Created `/api/upload-excel` endpoint in server.py
  - Uses pandas with openpyxl engine for robust Excel file parsing
  - Returns structured JSON with column metadata (names, types, data counts)
  - Provides preview rows for UI display
  - Includes raw series data for analysis
  - File size limit: 10MB with proper validation
  - Supports .xlsx and .xls formats
- **Excel Preview UI**: Replaced textarea with interactive table preview
  - Shows first 10 rows of Excel data in formatted table
  - Column selection dropdown for choosing which column to analyze
  - Automatic column filtering (excludes empty columns)
  - Graceful error handling with user-friendly notifications
  - Clean toggle between textarea and Excel preview modes
- **Context-Aware Chart Legends**: Enhanced visualization system
  - Chart titles now display data context when provided
  - Histogram: Shows "Distribución de [context]"
  - Pie Chart: Shows "Proporciones - [context]"
  - Box Plot: Shows "Diagrama de Caja - [context]"
  - Intelligent truncation for long context strings (40 char limit)
  - Seamless integration with existing chart generation workflow
- **Bug Fixes**: Corrected DOM rendering issue in mostrarExcelPreview (changed createElement('tbody') to createElement('tr'))
- **Updated Dependencies**: Added pandas and openpyxl to requirements.txt

### Enhanced User Manual and Documentation
- **Comprehensive Manual Update**: Expanded user manual from 5 to 8 sections covering all features
  - Section 1: Data input methods (manual, file upload, random data generation)
  - Section 2: AI-powered context generation with detailed instructions
  - Section 3: Automatic data type detection
  - Section 4: Statistical results and interactive card details
  - Section 5: AI analysis and narrative conclusions
  - Section 6: Interactive visualizations with descriptions
  - Section 7: Chatbot assistant features and usage examples
  - Section 8: Complete PDF export documentation with file format and content details

### UI/UX Improvements
- **Wider Chatbot Window**: Increased chatbot width from 320px to 380px for better readability and user experience
- **Better Visual Hierarchy**: Enhanced manual structure with clear step-by-step instructions

### Excel Import Intelligence
- **Smart Table Parsing**: Implemented intelligent Excel/XLSX import with natural table structure understanding
  - Automatic header detection (skips text-heavy first rows)
  - Column density analysis (identifies columns with >50% valid data)
  - Multi-level fallback system prevents data loss in sparse tables
  - User feedback with Toast notifications when no data is found
  - Handles empty cells, mixed data types, and irregular table structures
- **Improved Data Extraction**: procesarTablaExcel() function replaces simple flat().join() with sophisticated parsing
  - Filters empty rows and columns
  - Identifies data-rich columns vs. headers or empty columns
  - Falls back to extracting all non-empty cells if no clear structure is found

### Executive PDF Export
- **Professional Report Generation**: Fully implemented PDF export with jsPDF and autotable
  - **Branded Cover Page**: Color header with application title and university branding
  - **Document Metadata**: Automatic date stamping in Spanish locale
  - **Complete Data Workflow**: Shows transformation from raw data to insights
    1. Context and analysis description
    2. Original raw data as entered by user
    3. Detected data type (quantitative/qualitative)
    4. Statistical measures table with all calculated values
    5. High-quality visualizations (histogram, pie chart, box plot as PNG images)
    6. Complete frequency table with absolute, relative, and cumulative frequencies
    7. AI-generated narrative analysis and conclusions
    8. Automatic page numbering
  - **Smart Pagination**: Automatic page breaks prevent content splitting
  - **Error Handling**: Graceful fallbacks for missing charts or tables
  - **User Feedback**: Toast notifications for export status
  - **Filename Format**: analisis-estadistico-[timestamp].pdf

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The application utilizes a pure HTML5, CSS3, and vanilla JavaScript frontend with a multi-view Single Page Application (SPA) pattern. A custom CSS design system with CSS variables ensures consistent theming, employing Google Fonts (Lora, Poppins, Major Mono Display) and a warm color palette. Key UI components include view-based navigation, textarea-based data input with AI context integration, and a floating chat bubble for AI assistance. Animations are clean CSS-based, focusing on smooth transitions without distracting background patterns in input areas. Charting is handled by Chart.js, providing custom-styled histograms, pie charts, and horizontal box plots.

### Technical Implementations

**Frontend**:
-   **Technology**: HTML5, CSS3, Vanilla JavaScript.
-   **Routing**: Client-side routing for input, results, and visualizations views.
-   **Design**: Custom CSS design system with variables, Google Fonts (Lora, Poppins, Major Mono Display), warm color palette (#BC8389, #EFEBCE, #D9A590).
-   **Components**: Interactive buttons with gradient and hover effects, redesigned statistics cards with multi-layer gradients, pill-shaped data type badges, modern user manual typography, and a reordered graph display (Histogram → Circular Chart → Box Plot → Frequency Table).
-   **Charting**: Chart.js for interactive visualizations (histogram, pie chart, box plot) with custom styling.
-   **Animations**: Smooth CSS animations, including button interactions and chat bubble effects; removed animated background elements for a cleaner interface.

**Backend**:
-   **Framework**: Flask (Python) acts as a static file server and API endpoint provider.
-   **AI Integration**: Secure server-side handling of all AI calls to Google Gemini AI (gemini-2.5-flash model) using `google-genai` Python package.
-   **API Endpoints**:
    -   `GET /`: Serves `index.html`.
    -   `GET /<path>`: Serves static assets.
    -   `POST /api/generate-context`: Generates single-line dataset descriptions.
    -   `POST /api/generate-analysis`: Provides concise statistical interpretations.
    -   `POST /api/chat`: Powers the conversational AI chatbot.
    -   `POST /api/upload-excel`: Processes Excel files with pandas and returns structured data with column metadata.
-   **CORS**: Enabled via Flask-CORS for development flexibility.
-   **Statistical Engine**: Pure JavaScript (`statistics.js`) for calculating mean, median, mode, range, variance (population/sample), and standard deviation for both quantitative and qualitative data.
-   **State Management**: Global `ultimoAnalisis` object and `analysisContext` variable manage current analysis results and AI context within the client-side session.

### System Design Choices

The application is client-side focused with no persistent data storage (no database). All data and analysis results are stored in memory during a user session. AI functionalities are securely proxied through the Flask backend to protect API keys. The system is designed as a single-user educational tool without authentication or authorization mechanisms. The project structure is streamlined, with all static assets served from the root directory and no nested folders for simplicity.

## External Dependencies

*   **Google Gemini AI**: `google-genai` Python package for server-side AI integration using the `gemini-2.5-flash` model (free tier). Utilized for context generation, statistical analysis, and conversational chat. API key managed via `GEMINI_API_KEY` environment variable.
*   **pandas**: Python library (2.2.3) for powerful data manipulation and analysis, used for server-side Excel file processing.
*   **openpyxl**: Python library (3.1.5) for reading and writing Excel 2010 xlsx/xlsm files, used as pandas engine for Excel processing.
*   **Chart.js**: Client-side JavaScript library for generating interactive statistical charts (histograms, pie charts, box plots) with context-aware titles.
*   **jsPDF**: Client-side PDF generation library (v2.5.1) for creating executive reports.
*   **jsPDF-AutoTable**: Plugin (v3.5.29) for generating formatted tables in PDF documents.
*   **XLSX.js**: Client-side library for reading Excel files (XLSX, XLS formats) with intelligent table parsing.
*   **Font Awesome**: CDN-loaded icon library (v6.4.0) for UI iconography.
*   **Google Fonts**: CDN-loaded font families (Lora, Poppins, Major Mono Display) for typography.
*   **SweetAlert2**: Client-side library for custom, styled modal dialogs and alerts, used for user notifications and the user manual.
*   **Flask**: Python web framework (3.1.2) for backend server operations and API endpoint provision.
*   **Flask-CORS**: Flask extension (6.0.1) to enable Cross-Origin Resource Sharing.
*   **Gunicorn**: Production-grade WSGI server (23.0.0) for deployment, configured for Replit's environment.