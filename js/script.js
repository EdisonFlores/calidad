// Variables globales
let map;
let marker;
let filaSeleccionada = null;
let datosCSV = [];
let datosBiologicos = [];
let datosFisicoquimicos = [];
let rios = ["RIO HUASAGA", "RIO CHAPIZA", "RIO ZAMORA", "RIO UPANO", "RIO JURUMBAINO",
    "RIO KALAGLAS", "RIO YUQUIPA", "RIO PAN DE AZÚCAR",
    "RIO BLANCO", 
    "RIO TUTANANGOZA", "RIO INDANZA", "RIO MIRIUMI ",
    "RIO YUNGANZA", "RIO CUYES", "RIO ZAMORA", "RIO EL IDEAL", "RIO MORONA",
    "RIO MUCHINKIN", "RIO NAMANGOZA", "RIO SANTIAGO", "RIO PASTAZA", "RIO CHIWIAS",
    "RIO TUNA CHIGUAZA", "RÍO PALORA", "RIO LUSHIN", "RIO NAMANGOZA",
    "RIO PAUTE", "RIO YAAPI", "RIO HUAMBIAZ", "RIO TZURIN", "RIO MANGOSIZA", "RIO PUCHIMI",
     "RIO MACUMA", "RIO PANGUIETZA", "RIO PASTAZA", "RIO PALORA", "RIO TUNA ",
    "RIO WAWAIM GRANDE","RIO LUSHIN"];
   // Función para inicializar el mapa
   function inicializarMapa() {
    // Crea un mapa con Leaflet y lo asigna a la variable 'map'
    map = L.map('map').setView([-1.831239, -78.183406], 6.60); // Centra el mapa en Ecuador con un zoom de 6.6

    // Agrega la capa de mapas de OpenStreetMap con su respectiva atribución
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map); // Añade la capa al mapa
}



// Función para mostrar en el mapa y en la consola los campos especificados
function mostrarEnMapa(registro, fila) {
    // Extrae y convierte las coordenadas a formato numérico
    const lat = parseFloat(registro['COORD- X']);
    const lon = parseFloat(registro['COORD- Y']);

    // Verifica si las coordenadas son válidas
    if (isNaN(lat) || isNaN(lon)) {
        mostrarPopupError("Las coordenadas no son válidas.");
        return;
    }

    const coordenadas = { latitude: lat, longitude: lon };

    // Elimina la clase 'selected' de todas las filas para limpiar selecciones previas
    document.querySelectorAll('tr.selected').forEach(fila => fila.classList.remove('selected'));

    // Añade la clase 'selected' a la fila actual y la guarda como seleccionada
    fila.classList.add('selected');
    filaSeleccionada = fila;

    // Busca la fecha en el dataset correspondiente dependiendo del tipo de datos
    let fecha = '';
    if (registro.hasOwnProperty('ÍNDICE BMWP/Col.1')) {
        fecha = obtenerFechaPorID(datosBiologicos, registro['ID']); // Datos biológicos
    } else if (registro.hasOwnProperty('Clasificacion ')) {
        fecha = obtenerFechaPorID(datosFisicoquimicos, registro['ID']); // Datos fisicoquímicos
    }

    // Genera el contenido del pop-up dependiendo del tipo de datos
    let popupContent = '';
    if (registro.hasOwnProperty('ÍNDICE BMWP/Col.1')) {
        popupContent = generarContenidoPopupBiologicos(registro, fecha);
        generarGraficoBarras(registro); // Genera gráfico de barras para datos biológicos
    } else if (registro.hasOwnProperty('Clasificacion ')) {
        popupContent = generarContenidoPopupFisicoquimicos(registro, fecha);
        generarGraficosFisicoquimicos(registro); // Genera gráficos fisicoquímicos
    } else {
        // Si no hay información específica, muestra un mensaje genérico
        popupContent = `
            <div>
                <strong>Río:</strong> ${registro['RIO']}<br>
                <strong>Punto:</strong> ${registro['PUNTO']}<br>
                <strong>Fecha:</strong> ${fecha}<br>
                <strong>Información no disponible</strong>
            </div>
        `;
    }

    // Si ya existe un marcador, se actualiza su posición y contenido
    if (marker) {
        marker.setLatLng([coordenadas.latitude, coordenadas.longitude])
              .setPopupContent(popupContent)
              .openPopup();
    } else {
        // Si no hay marcador, se crea uno nuevo y se añade al mapa
        marker = L.marker([coordenadas.latitude, coordenadas.longitude])
                  .addTo(map)
                  .bindPopup(popupContent)
                  .openPopup();
    }

    // Añade eventos para mostrar el popup cuando el mouse pasa sobre el marcador
    marker.on('mouseover', function() {
        marker.openPopup();
    });

    marker.on('mouseout', function() {
        marker.closePopup();
    });

    // Centra el mapa en la nueva ubicación con un nivel de zoom de 15
    map.setView([coordenadas.latitude, coordenadas.longitude], 15);
}
// Función para obtener la fecha por ID
function obtenerFechaPorID(datos, id) {
    // Busca en el array de datos el registro que tenga el ID especificado
    const registro = datos.find(item => item['ID'] === id);
    // Retorna la fecha del registro si se encuentra, de lo contrario, muestra un mensaje por defecto
    return registro ? registro['FECHA'] : 'Fecha no disponible';
}

// Función para limpiar el área de información
function limpiarInfoArea() {
    // Selecciona el contenedor donde se muestra la información adicional
    const infoArea = document.querySelector('.info-area');
    // Reinicia el contenido del área de información con un encabezado predeterminado
    infoArea.innerHTML = '<h2><i class="fas fa-info-circle"></i> Información Adicional</h2>';
}

// Función para abrir una pestaña específica
function abrirPestania(evt, tabName) {
    // Oculta todas las pestañas de contenido
    const tabcontent = document.getElementsByClassName('tabcontent');
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }

    // Elimina la clase 'active' de todos los enlaces de pestañas
    const tablinks = document.getElementsByClassName('tablink');
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }

    // Muestra la pestaña seleccionada
    document.getElementById(tabName).style.display = 'block';
    // Marca el botón de la pestaña como activo
    evt.currentTarget.className += ' active';

    // Muestra el contenedor del dropdown cuando se cambia de pestaña
    document.getElementById("dropdown-container").style.display = "flex";

    // Limpia el área de información al cambiar de pestaña para evitar contenido anterior
    limpiarInfoArea();
}


// Función para cargar datos CSV y mostrarlos en las tablas
function cargarDatosCSV(url, tablaId) {
    // Usa PapaParse para leer el archivo CSV desde la URL proporcionada
    Papa.parse(url, {
        download: true, // Habilita la descarga del archivo CSV
        header: true, // Interpreta la primera fila como encabezados de columna
        complete: function(results) { // Se ejecuta cuando la carga del CSV finaliza
            const datos = results.data; // Almacena los datos obtenidos

            // Guarda los datos en la variable correspondiente según la tabla destino
            if (tablaId === 'tabla1') {
                datosBiologicos = datos; // Datos biológicos
            } else if (tablaId === 'tabla2') {
                datosFisicoquimicos = datos; // Datos fisicoquímicos
            }

            // Llama a la función para actualizar la tabla con los datos cargados
            actualizarTabla(datos, tablaId);

            // Si los datos corresponden a la tabla1, se cargan los nombres de los ríos
            if (tablaId === 'tabla1') {
                cargarNombresRios();
            }
        },
        error: function(error) { // Manejo de errores en la carga del CSV
            mostrarPopupError("Error al cargar el archivo CSV: " + error.message);
        }
    });
}


// Función para actualizar la tabla con los datos cargados
function actualizarTabla(datos, tablaId) {
    const tabla = document.getElementById(tablaId).getElementsByTagName('tbody')[0];
    const thead = document.getElementById(tablaId).getElementsByTagName('thead')[0].getElementsByTagName('tr')[0];
    tabla.innerHTML = '';
    thead.innerHTML = '';

    if (datos.length === 0) return;

    // Obtener los campos específicos para cada tabla
    let camposAMostrar = [];
    if (tablaId === 'tabla1') {
        camposAMostrar = ['ID', 'RIO', 'PUNTO','Nivel 10','Nivel 9','Nivel 8','Nivel 7','Nivel 6','Nivel 5','Nivel 4','Nivel 3','Nivel 2','Nivel 1', 'RIQUEZA ABSOLUTA', 'DIVERSIDAD SEGÚN SHANNON', 'CALIDAD DEL AGUA SEGÚN SHANNON', 'ÍNDICE BMWP/Col', 'ÍNDICE BMWP/Col.1'];
    } else if (tablaId === 'tabla2') {
        camposAMostrar = ['ID', 'RIO', 'PUNTO', 'Temperatura', 'Ph', 'Oxigeno disuelto', 'Solidos_Totales', 'Nitratos', 'Fosfatos', 'Turbiedad', 'DBO5', 'Coliformes fecales', 'CALIDAD AGUA NSF', 'Clasificacion '];
    }

    // Crear encabezados de tabla
    camposAMostrar.forEach(campo => {
        const th = document.createElement('th');
        th.textContent = campo;
        thead.appendChild(th);
    });

    // Llenar la tabla con los datos
    datos.forEach(registro => {
        const fila = tabla.insertRow();

        camposAMostrar.forEach(campo => {
            const celda = fila.insertCell();
            celda.textContent = registro[campo];
        });

        fila.onclick = () => mostrarEnMapa(registro, fila);
    });
}

// Mapeo de opciones amigables a los nombres de los campos del dataset
const mapeoCamposFisicoquimicos = {
    // Mapea las opciones de búsqueda a los campos correspondientes en el dataset fisicoquímico
    "Busqueda por río": "RIO", // Asocia la búsqueda por río con el campo RIO
    "Busqueda por calidad del agua": "CALIDAD AGUA NSF", // Asocia la búsqueda por calidad del agua con el campo CALIDAD AGUA NSF
    "Busqueda por coliformes fecales": "Coliformes fecales", // Mapea coliformes fecales
    "Busqueda por DBO5": "DBO5", // Mapea DBO5
    "Busqueda por turbiedad": "Turbiedad", // Mapea turbiedad
    "Busqueda por fosfatos": "Fosfatos", // Mapea fosfatos
    "Busqueda por nitratos": "Nitratos", // Mapea nitratos
    "Busqueda por sólidos totales": "Solidos_Totales", // Mapea sólidos totales
    "Busqueda por oxígeno disuelto": "Oxigeno disuelto", // Mapea oxígeno disuelto
    "Busqueda por pH": "Ph", // Mapea pH
    "Busqueda por temperatura": "Temperatura" // Mapea temperatura
};

const mapeoCamposBiologicos = {
    // Mapea las opciones de búsqueda a los campos correspondientes en el dataset biológico
    "Busqueda por río": "RIO", // Asocia la búsqueda por río con el campo RIO
    "Busqueda por riqueza absoluta": "RIQUEZA ABSOLUTA", // Mapea la búsqueda por riqueza absoluta
    "Busqueda por diversidad (Shannon)": "DIVERSIDAD SEGÚN SHANNON", // Mapea la búsqueda por diversidad Shannon
    "Busqueda por calidad del agua (Shannon)": "CALIDAD DEL AGUA SEGÚN SHANNON", // Mapea la búsqueda por calidad del agua Shannon
    "Busqueda por índice BMWP/Col": "ÍNDICE BMWP/Col" // Mapea la búsqueda por índice BMWP/Col
};

// Actualiza las opciones del desplegable según la pestaña seleccionada
function actualizarOpciones(tipo) {
    // Obtiene el elemento del select donde se mostrarán las opciones
    const parametroSelect = document.getElementById('parametro-select');
    
    // Limpia las opciones actuales y agrega una opción predeterminada
    parametroSelect.innerHTML = '<option value="">Seleccione un criterio</option>';

    // Define las opciones a mostrar según el tipo seleccionado (fisicoquímicos o biológicos)
    const opciones = tipo === 'fisicoquimicos' 
        ? Object.keys(mapeoCamposFisicoquimicos) // Si el tipo es fisicoquímicos, usa el mapeo de fisicoquímicos
        : Object.keys(mapeoCamposBiologicos);   // Si el tipo es biológicos, usa el mapeo de biológicos

    // Itera sobre las opciones y las agrega al desplegable
    opciones.forEach(opcion => {
        const option = document.createElement('option'); // Crea un nuevo elemento <option>
        option.value = opcion; // Asigna el valor de la opción
        option.textContent = opcion; // Asigna el texto visible de la opción
        parametroSelect.appendChild(option); // Añade la opción al select
    });
}

// Mostrar u ocultar el select de ríos y el select de orden según la opción seleccionada
document.getElementById('parametro-select').addEventListener('change', function () {
    // Obtiene los elementos de los selects de ríos y orden
    const rioSelect = document.getElementById('rio-select');
    const ordenSelect = document.getElementById('orden-select');
    const parametroSeleccionado = this.value; // Obtiene el valor de la opción seleccionada

    // Muestra el select de ríos si se selecciona "Filtrar por río", de lo contrario lo oculta
    rioSelect.style.display = parametroSeleccionado === "Busqueda por río" ? "block" : "none";
    
    // Muestra el select de orden si no se selecciona "Filtrar por río" y hay una opción seleccionada
    ordenSelect.style.display = parametroSeleccionado !== "Busqueda por río" && parametroSeleccionado ? "block" : "none";
});


function buscarDatos() {
    // Obtiene el valor seleccionado en los filtros de parámetros, río y orden
    const parametroSeleccionado = document.getElementById('parametro-select').value;
    const rioSeleccionado = document.getElementById('rio-select').value;
    const ordenSeleccionado = document.getElementById('orden-select').value; // Obtener el tipo de orden seleccionado

    // Identifica la tabla activa según la pestaña seleccionada (biológica o fisicoquímica)
    const tablaId = document.getElementById('biological-parameters-tab').classList.contains('active') ? 'tabla1' : 'tabla2';
    
    // Selecciona los datos correspondientes a la tabla activa
    const datos = tablaId === 'tabla1' ? datosBiologicos : datosFisicoquimicos;

    let datosFiltrados = [...datos]; // Clona los datos para evitar modificar el original

    // Selecciona el campo adecuado según el tipo de tabla (biológica o fisicoquímica)
    const campo = tablaId === 'tabla1'
        ? mapeoCamposBiologicos[parametroSeleccionado] // Mapeo para datos biológicos
        : mapeoCamposFisicoquimicos[parametroSeleccionado]; // Mapeo para datos fisicoquímicos

    // Filtra los datos por río si se selecciona "Busqueda por río" y hay un río seleccionado
    if (parametroSeleccionado === "Busqueda por río" && rioSeleccionado) {
        datosFiltrados = datosFiltrados.filter(dato => dato['RIO'] === rioSeleccionado);
    }

    // Ordena los datos según el campo y el criterio de orden seleccionados
    if (campo && campo !== "RIO") {
        datosFiltrados.sort((a, b) => {
            const valorA = a[campo] ?? 0; // Maneja valores nulos para evitar errores
            const valorB = b[campo] ?? 0;

            // Ordena según el criterio seleccionado (ascendente o descendente)
            return ordenSeleccionado === 'asc' ? valorA - valorB : valorB - valorA;
        });
    }

    // Actualiza la tabla con los datos filtrados y ordenados
    actualizarTabla(datosFiltrados, tablaId);
}


// Inicializar las opciones y cargar los ríos al cargar la página
document.addEventListener('DOMContentLoaded', function () {
    cargarNombresRios(); // Carga los nombres de los ríos
    actualizarOpciones('biologicos'); // Inicializa las opciones con parámetros biológicos
});

// Agregar eventos a los botones de pestañas para actualizar las opciones
document.getElementById('biological-parameters-tab').addEventListener('click', () => {
    actualizarOpciones('biologicos'); // Cambia a opciones de parámetros biológicos al hacer clic en la pestaña correspondiente
});

document.getElementById('physicochemical-parameters-tab').addEventListener('click', () => {
    actualizarOpciones('fisicoquimicos'); // Cambia a opciones de parámetros fisicoquímicos al hacer clic en la pestaña correspondiente
});

// Agregar evento al botón de búsqueda para ejecutar la función de búsqueda
document.getElementById('buscar-btn').addEventListener('click', buscarDatos);

// Inicializar las opciones y cargar los ríos al cargar la página
document.addEventListener('DOMContentLoaded', function () {
    cargarNombresRios(); // Carga los nombres de los ríos
    actualizarOpciones('biologicos'); // Inicializa con parámetros biológicos
});

// Función para cargar los nombres de los ríos en el menú desplegable
function cargarNombresRios() {
    const selectRios = document.getElementById('rio-select'); 
    selectRios.innerHTML = '<option value="">Seleccione un río</option>'; // Limpiar opciones previas

    // Crear una opción para cada nombre de río en el array 'rios'
    rios.forEach(nombreRio => {
        const opcion = document.createElement('option'); // Crear un elemento <option>
        opcion.value = nombreRio; // Establecer el valor del option
        opcion.textContent = nombreRio; // Establecer el texto visible del option
        selectRios.appendChild(opcion); // Agregar la opción al select
    });
}

// Función para mostrar el popup de error
function mostrarPopupError(mensaje) {
    const popup = document.getElementById('error-popup'); // Obtener el popup de error
    const textoPopup = document.getElementById('error-popup-text'); // Obtener el área de texto dentro del popup
    textoPopup.textContent = mensaje; // Establecer el mensaje del error
    popup.style.display = 'block'; // Mostrar el popup
}

// Función para cerrar el popup de error
function cerrarPopup() {
    const popup = document.getElementById('error-popup'); // Obtener el popup de error
    popup.style.display = 'none'; // Ocultar el popup
}


// Inicialización del mapa y carga de datos al cargar la página
window.onload = function() {
    inicializarMapa(); // Inicializar el mapa
    abrirPestania({currentTarget: document.getElementById('biological-parameters-tab')}, 'tab1'); // Abrir la pestaña de parámetros biológicos por defecto
    document.getElementById('buscar-btn').addEventListener('click', buscarDatos); // Agregar evento al botón de búsqueda
    document.getElementById('biological-parameters-tab').addEventListener('click', () => cargarDatosCSV('https://raw.githubusercontent.com/TIESPOCH/Calidadagua/EdisonFlores/tablabio.csv', 'tabla1')); // Cargar datos biológicos al hacer clic en la pestaña correspondiente
    document.getElementById('physicochemical-parameters-tab').addEventListener('click', () => cargarDatosCSV('https://raw.githubusercontent.com/TIESPOCH/Calidadagua/EdisonFlores/Parametrosfisio.csv', 'tabla2')); // Cargar datos fisicoquímicos al hacer clic en la pestaña correspondiente
};

// Nuevo código para llenar el menú desplegable con ríos y buscar datos
document.addEventListener("DOMContentLoaded", function () {
    const selectRio = document.getElementById('rio-select'); // Obtener el elemento select de ríos
    rios.forEach(rio => {
        const option = document.createElement('option'); // Crear una nueva opción para cada río
        option.value = rio; // Establecer el valor de la opción
        option.text = rio; // Establecer el texto visible de la opción
        selectRio.add(option); // Agregar la opción al select
    });

    const buscarBtn = document.getElementById('buscar-btn'); // Obtener el botón de búsqueda
    buscarBtn.addEventListener('click', function () {
        const selectedRio = selectRio.value; // Obtener el río seleccionado
        if (!selectedRio) { // Si no se selecciona un río
            mostrarPopupError("Por favor seleccione un río."); // Mostrar un error
            return;
        }
        buscarDatos(); // Llamar a la función para buscar los datos
    });
});

// Función para generar el contenido del popup para parámetros biológicos
function generarContenidoPopupBiologicos(registro, fecha) {
    const nombreRio = registro['RIO']; // Obtener el nombre del río
    const puntoRio = registro['PUNTO']; // Obtener el punto del río
    const indiceBMWP = registro['ÍNDICE BMWP/Col.1']; // Obtener el índice BMWP
    const calidadshanon = registro['CALIDAD DEL AGUA SEGÚN SHANNON']; // Obtener la calidad según Shannon

    return `
        <div>
            <strong>Río:</strong> ${nombreRio}<br>
            <strong>Punto:</strong> ${puntoRio}<br>
            <strong>ÍNDICE BMWP/Col.1:</strong> ${indiceBMWP}<br>
            <strong>Calidad según Shanon:</strong> ${calidadshanon}<br>
            <strong>Fecha:</strong> ${fecha}
        </div>
    `;
}

// Función para generar el contenido del popup para parámetros fisicoquímicos
function generarContenidoPopupFisicoquimicos(registro, fecha) {
    const nombreRio = registro['RIO']; // Obtener el nombre del río
    const puntoRio = registro['PUNTO']; // Obtener el punto del río
    const clasificacion = registro['Clasificacion ']; // Obtener la clasificación de calidad del agua

    return `
        <div>
            <strong>Río:</strong> ${nombreRio}<br>
            <strong>Punto:</strong> ${puntoRio}<br>
            <strong>Clasificación de calidad del agua:</strong> ${clasificacion}<br>
            <strong>Fecha:</strong> ${fecha}
        </div>
    `;
}

const valoresExcelentes = {
    'Ph': [6.5, 9], // pH ideal entre 6.5 y 9
    'Oxigeno disuelto': 8, // Oxígeno disuelto ideal mayor a 8 mg/L
    'Nitratos': 13, // Niveles ideales de Nitratos menores o iguales a 13 mg/L
    'DBO5': 20, // Demanda Bioquímica de Oxígeno (DBO5) ideal debe ser menor o igual a 20 mg/L
    'Coliformes Fecales': 0, // Ningún valor de coliformes fecales es ideal
    'CALIDAD AGUA NSF': 100 // Un valor de calidad de agua según NSF ideal es 100
};

function generarGraficosFisicoquimicos(registro) {
    // Limpiar el área de información antes de generar nuevos gráficos
    limpiarInfoArea();

    // Definir los parámetros que se mostrarán en los gráficos
    const parametros = [
        'DBO5', 'Nitratos', 'Oxigeno disuelto', 'Ph', 'Coliformes fecales', 'CALIDAD AGUA NSF'
    ];

    // Seleccionar el área donde se mostrará la información
    const infoArea = document.querySelector('.info-area');
    // Inicializar el título de la sección de información adicional
    infoArea.innerHTML = '<h2><i class="fas fa-info-circle"></i> Información Adicional</h2>';

    let filaDiv; // Variable para almacenar filas de gráficos

    // Iterar sobre los parámetros para generar gráficos
    parametros.forEach((parametro, index) => {
        // Cada tres parámetros, crear una nueva fila para los gráficos
        if (index % 3 === 0) {
            filaDiv = document.createElement('div');
            filaDiv.className = 'fila-graficos';  // Agregar clase de fila
            infoArea.appendChild(filaDiv);  // Añadir la fila al área de información
        }

        // Crear un div para cada gráfico individual
        const chartDiv = document.createElement('div');
        chartDiv.className = 'chart';  // Asignar clase de gráfico
        filaDiv.appendChild(chartDiv);  // Añadir el gráfico a la fila

        // Obtener el valor registrado del parámetro actual en el registro
        const valorRegistrado = parseFloat(registro[parametro]);

        let rangoEscala;  // Variable para el rango de la escala del gráfico
        let colorRegistrado, colorIdeal;  // Colores para el valor registrado y el ideal
        let titulo;  // Título del gráfico

        // Configuración específica de cada parámetro
        switch (parametro) {
            case 'DBO5':
                // Definir rango de escala para DBO5
                rangoEscala = [0, Math.max(25, valorRegistrado)];
                // Determinar el color según el valor registrado
                colorRegistrado = valorRegistrado < 20 ? 'blue' : valorRegistrado === 20 ? 'green' : 'red';
                colorIdeal = 'green';  // Color ideal
                titulo = 'Comparación de niveles de DBO5';  // Título del gráfico
                break;
            case 'Nitratos':
                rangoEscala = [0, Math.max(25, valorRegistrado)];
                colorRegistrado = valorRegistrado < 13 ? 'blue' : valorRegistrado === 13 ? 'green' : 'red';
                colorIdeal = 'green';
                titulo = 'Comparación de niveles de Nitratos';
                break;
            case 'Oxigeno disuelto':
                rangoEscala = [0, Math.max(100, valorRegistrado)];
                colorRegistrado = valorRegistrado > 8 ? 'blue' : valorRegistrado === 8 ? 'green' : 'red';
                colorIdeal = 'green';
                titulo = 'Comparación de niveles de Oxígeno Disuelto';
                break;
            case 'Ph':
                rangoEscala = [0, 14];
                colorRegistrado = valorRegistrado >= 6.5 && valorRegistrado <= 9 ? 'blue' : 'red';
                colorIdeal = 'green';
                titulo = 'Comparación de niveles de pH';
                break;
            case 'Coliformes fecales':
                rangoEscala = [0, valorRegistrado];
                colorRegistrado = 'red';
                colorIdeal = 'green';
                titulo = 'Comparación de niveles de Coliformes Fecales';
                break;
            case 'CALIDAD AGUA NSF':
                rangoEscala = [0, 100];
                colorIdeal = 'blue';  // Color ideal de la calidad del agua
                if (valorRegistrado >= 91) colorRegistrado = 'blue';  // Establecer colores según el valor registrado
                else if (valorRegistrado >= 71) colorRegistrado = 'green';
                else if (valorRegistrado >= 51) colorRegistrado = 'yellow';
                else if (valorRegistrado >= 26) colorRegistrado = 'red';
                else colorRegistrado = 'black';
                titulo = 'Comparación Calidad del Agua NSF';
                break;
        }

        // Crear los datos para el gráfico, incluyendo el criterio admisible y el valor registrado
        const data = [
            { name: 'Criterio Admisible', value: valoresExcelentes[parametro] instanceof Array ? valoresExcelentes[parametro][1] : valoresExcelentes[parametro], color: colorIdeal },
            { name: 'Valor Registrado', value: valorRegistrado, color: colorRegistrado }
        ];

        // Definir dimensiones del gráfico y márgenes
        const width = 400;
        const height = 300;
        const margin = { top: 40, right: 30, bottom: 60, left: 40 };  // Margen superior incrementado para el título

        // Crear el SVG para el gráfico
        const svg = d3.select(chartDiv).append('svg')
            .attr('width', width)
            .attr('height', height)
            .style("filter", "drop-shadow(3px 3px 3px rgba(0, 0, 0, 0.4))");  // Agregar sombra 3D al gráfico

        // Definir la escala en el eje X
        const x = d3.scaleBand()
            .domain(data.map(d => d.name))  // Mapeo de nombres para las barras
            .range([margin.left, width - margin.right])  // Rango en el eje X
            .padding(0.1);  // Espaciado entre las barras

        // Definir la escala en el eje Y
        const y = d3.scaleLinear()
            .domain([0, rangoEscala[1]]).nice()  // Rango en el eje Y
            .range([height - margin.bottom, margin.top]);  // Posición vertical del gráfico

        // Crear el eje X
        const xAxis = g => g
            .attr('transform', `translate(0,${height - margin.bottom})`)  // Ubicación del eje X
            .call(d3.axisBottom(x).tickSizeOuter(0));  // Llamar al eje X

        // Crear el eje Y
        const yAxis = g => g
            .attr('transform', `translate(${margin.left},0)`)  // Ubicación del eje Y
            .call(d3.axisLeft(y))
            .call(g => g.select('.domain').remove());  // Eliminar la línea de la "dominio" del eje Y

        // Crear las barras del gráfico
        svg.append('g')
            .selectAll('rect')
            .data(data)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.name))  // Posición X de cada barra
            .attr('y', d => y(d.value))  // Posición Y de cada barra
            .attr('height', d => y(0) - y(d.value))  // Altura de cada barra
            .attr('width', x.bandwidth())  // Ancho de cada barra
            .attr('fill', d => d.color)  // Color de las barras según el valor
            .style('filter', 'url(#3d-bar-filter)');  // Aplicar filtro 3D a las barras

        // Añadir los valores sobre cada barra
        svg.selectAll('rect')
            .each(function (d) {
                d3.select(this.parentNode).append('text')
                    .attr('x', x(d.name) + x.bandwidth() / 2)  // Ubicación del texto sobre la barra
                    .attr('y', y(d.value) - 5)  // Ajuste de la posición vertical
                    .attr('text-anchor', 'middle')  // Centrar el texto
                    .text(d.value);  // Mostrar el valor registrado
            });

        // Añadir los ejes X y Y al gráfico
        svg.append('g').call(xAxis);
        svg.append('g').call(yAxis);

        // Añadir un título al gráfico
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', margin.top / 2)  // Posición del título
            .attr('text-anchor', 'middle')
            .attr('font-size', '16px')  // Tamaño del texto del título
            .text(titulo);  // Mostrar el título

        // Añadir pie de gráfico con la etiqueta "Valor"
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height + margin.bottom - 10)  // Ajustar la posición del pie
            .attr('text-anchor', 'middle')
            .text('Valor');

        // Definir el filtro 3D para las barras
        svg.append('defs')
            .append('filter')
            .attr('id', '3d-bar-filter')
            .append('feDropShadow')
            .attr('dx', 3)  // Desplazamiento horizontal de la sombra
            .attr('dy', 3)  // Desplazamiento vertical de la sombra
            .attr('stdDeviation', 2)  // Desviación estándar para el difuso de la sombra
            .attr('flood-color', 'rgba(0, 0, 0, 0.4)');  // Color de la sombra
    });
}

function generarGraficoBarras(registro) {
    // Limpiar el área de información al cambiar de pestaña
    limpiarInfoArea();
    const infoArea = document.querySelector('.info-area');
    infoArea.innerHTML = '<h2><i class="fas fa-info-circle"></i> Información Adicional</h2><br><br>';

    // Crear fila para los tres primeros gráficos
    const fila1Div = document.createElement('div');
    fila1Div.className = 'fila-graficos';
    infoArea.appendChild(fila1Div);

    // Ajustar tamaño de los contenedores
    const chartSize = 400;

    // Primer gráfico: Diversidad según Shannon
    const shannonDiv = document.createElement('div');
    shannonDiv.className = 'chart grande';
    shannonDiv.style.width = `${chartSize}px`;
    shannonDiv.style.height = `${chartSize}px`;
    fila1Div.appendChild(shannonDiv);

    const shannonValor = parseFloat(registro['DIVERSIDAD SEGÚN SHANNON']);
    const shannonData = [{ name: 'Diversidad', value: shannonValor, color: 'yellow', calidad: registro['CALIDAD DEL AGUA SEGÚN SHANNON'] }];
    crearGraficoBarrasSimple(shannonDiv, shannonData, 'ÍNDICE DE DIVERSIDAD SEGÚN SHANNON', 0, 3);

    // Segundo gráfico: Comparación del ÍNDICE BMWP/Col
    const bmwpDiv = document.createElement('div');
    bmwpDiv.className = 'chart grande';
    bmwpDiv.style.width = `${chartSize}px`;
    bmwpDiv.style.height = `${chartSize}px`;
    fila1Div.appendChild(bmwpDiv);

    const bmwpValor = parseFloat(registro['ÍNDICE BMWP/Col']);
    let bmwpColor;
    if (bmwpValor < 36) bmwpColor = 'red';
    else if (bmwpValor < 60) bmwpColor = 'yellow';
    else if (bmwpValor < 85) bmwpColor = 'green';
    else bmwpColor = 'blue';

    const bmwpData = [
        { name: 'Valor Admisible', value: 85, color: 'blue', indice: 'ÍNDICE BMWP/Col.1' },
        { name: 'Valor Registrado', value: bmwpValor, color: bmwpColor, indice: 'ÍNDICE BMWP/Col.1' }
    ];

    crearGraficoBarrasSimple(bmwpDiv, bmwpData, 'Comparación del ÍNDICE BMWP/Col', 0, 130);

    // Tercer gráfico: Diagrama de sectores de la riqueza absoluta
    const riquezaDiv = document.createElement('div');
    riquezaDiv.className = 'chart grande';
    riquezaDiv.style.width = `${chartSize}px`;
    riquezaDiv.style.height = `${chartSize}px`;
    fila1Div.appendChild(riquezaDiv);

    const niveles = ['Nivel 10', 'Nivel 9', 'Nivel 8', 'Nivel 7', 'Nivel 6', 'Nivel 5', 'Nivel 4', 'Nivel 3', 'Nivel 2', 'Nivel 1'];
    const riquezaAbsoluta = niveles.reduce((sum, nivel) => sum + parseFloat(registro[nivel]), 0);

    const riquezaData = niveles.map((nivel, index) => ({
        name: nivel,
        value: parseFloat(registro[nivel]),
        level: 10 - index // Niveles de 10 a 1
    }));

    crearDiagramaSectores(riquezaDiv, riquezaData, 'Presencia de Macroinvertebrados', riquezaAbsoluta);

    // Crear fila para el cuarto gráfico
    const fila2Div = document.createElement('div');
    fila2Div.className = 'fila-graficos';
    infoArea.appendChild(fila2Div);

    // Cuarto gráfico: Comparación de los niveles
    const nivelesDiv = document.createElement('div');
    nivelesDiv.className = 'chart extendido';
    nivelesDiv.style.width = `${chartSize}px`;
    nivelesDiv.style.height = `${chartSize}px`;
    fila2Div.appendChild(nivelesDiv);

    const nivelesData = niveles.map(nivel => ({
        name: nivel,
        value: parseFloat(registro[nivel]),
        color: 'steelblue'
    }));

    crearGraficoBarrasSimple(nivelesDiv, nivelesData, 'Comparación de Niveles', 0, Math.max(...nivelesData.map(d => d.value)) + 10);

    // Funciones para crear los gráficos
    function crearGraficoBarrasSimple(container, data, title, yMin, yMax) {
        const width = 400;
        const height = 400;
        const margin = { top: 60, right: 20, bottom: 40, left: 40 };

        const svg = d3.select(container).append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('filter', 'drop-shadow(3px 3px 3px rgba(0, 0, 0, 0.4))');

        const x = d3.scaleBand()
            .domain(data.map(d => d.name))
            .range([margin.left, width - margin.right])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([yMin, yMax]).nice()
            .range([height - margin.bottom, margin.top]);

        const xAxis = g => g
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).tickSizeOuter(0));

        const yAxis = g => g
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y))
            .call(g => g.select('.domain').remove());

        svg.append('g')
            .selectAll('rect')
            .data(data)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.name))
            .attr('y', d => y(d.value))
            .attr('height', d => y(0) - y(d.value))
            .attr('width', x.bandwidth())
            .attr('fill', d => d.color)
            .style('filter', 'url(#3d-bar-filter)') // Añadir filtro 3D
            .on('mouseover', function(event, d) {
                d3.select(this).attr('fill', d3.rgb(d.color).darker(2));
                const [mouseX, mouseY] = d3.pointer(event);
                d3.select(container).append('text')
                    .attr('class', 'tooltip')
                    .attr('x', mouseX)
                    .attr('y', mouseY - 10)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '12px')
                    .attr('font-weight', 'bold')
                    .attr('fill', 'black')
                    .text(d.calidad || d.indice || d.value);
            })
            .on('mouseout', function(event, d) {
                d3.select(this).attr('fill', d.color);
                d3.selectAll('.tooltip').remove();
            });

        svg.append('g').call(xAxis);
        svg.append('g').call(yAxis);

        svg.append('text')
            .attr('x', width / 2)
            .attr('y', margin.top / 2)
            .attr('text-anchor', 'middle')
            .attr('font-size', '16px')
            .text(title);

        // Añadir los valores en la barra
        svg.selectAll(".text")        
            .data(data)
            .enter()
            .append("text")
            .attr("class","label")
            .attr("x", (d) => x(d.name) + x.bandwidth() / 2)
            .attr("y", (d) => y(d.value) - 5)
            .attr("text-anchor", "middle")
            .text((d) => d.value);

        // Definir el filtro 3D
        svg.append('defs')
            .append('filter')
            .attr('id', '3d-bar-filter')
            .append('feDropShadow')
            .attr('dx', 3)
            .attr('dy', 3)
            .attr('stdDeviation', 2)
            .attr('flood-color', 'rgba(0, 0, 0, 0.4)');

        return svg;
    }

    function crearDiagramaSectores(container, data, title, total) {
        const width = 350;
        const height = 350;
        const margin = 50;  // Margen para el título y el pie de página
        const radius = Math.min(width, height - margin * 2) / 2;  // Ajustar el radio para que encaje en el espacio disponible
        const arc = d3.arc().outerRadius(radius - 10).innerRadius(0);
        const labelArc = d3.arc().outerRadius(radius - 40).innerRadius(radius - 40);
        const pie = d3.pie().sort(null).value(d => d.value);
    
        const colors = {
            10: '#0000CC',
            9: '#0000FF',
            8: '#00FF00',
            7: '#66FF66',
            6: '#FFFF00',
            5: '#CCCC00',
            4: '#FFA500',
            3: '#FF8C00',
            2: '#FF0000',
            1: '#8B0000'
        };
    
        const svg = d3.select(container).append('svg')
            .attr('width', width)
            .attr('height', height + margin * 2);  // Aumentamos la altura para el margen superior e inferior
    
        // Título
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', margin / 2)  // Posicionar el título en el margen superior
            .attr('text-anchor', 'middle')
            .attr('font-size', '16px')
            .text(title);
    
        // Grupo del gráfico
        const g = svg.append('g')
            .attr('transform', `translate(${width / 2},${(height / 2) + margin})`);
    
        const filteredData = data.filter(d => d.value > 0);
    
        const arcs = g.selectAll('.arc')
            .data(pie(filteredData))
            .enter().append('g')
            .attr('class', 'arc');
    
        arcs.append('path')
            .attr('d', arc)
            .style('fill', d => colors[d.data.level])
            .style('filter', 'url(#3d-sector-filter)') // Añadir filtro 3D
            .on('mouseover', function(event, d) {
                d3.select(this).transition()
                    .duration(200)
                    .attr('d', d3.arc().outerRadius(radius).innerRadius(0));
    
                const percentage = ((d.data.value / total) * 100).toFixed(2);
    
                // Actualizar el contenido del texto fijo
                fixedTooltip.html(`<div>Nivel ${d.data.level}: ${d.data.value}</div><div>${percentage}%</div>`);
            })
            .on('mouseout', function() {
                d3.select(this).transition()
                    .duration(200)
                    .attr('d', arc);
    
                // Limpiar el contenido del texto fijo al salir del sector
                fixedTooltip.html('');
            });
    
        arcs.append('text')
            .attr('transform', d => `translate(${labelArc.centroid(d)})`)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .text(d => d.data.value);
    
        // Texto de "Riqueza Absoluta"
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height + margin - 10)  // Posicionar el texto de "Riqueza Absoluta" en el margen inferior
            .attr('text-anchor', 'middle')
            .attr('font-size', '14px')
            .text(`Riqueza Absoluta: ${total}`);
    
        // Crear un elemento para el tooltip fijo
        const fixedTooltip = d3.select(container).append('div')
            .attr('class', 'fixed-tooltip')
            .style('position', 'absolute')
            .style('top', '50px')  // Posicionar el tooltip fijo en el margen superior
            .style('left', '40%')
            .style('transform', 'translateX(-50%)')
            .style('background', '#fff')
            .style('border', '1px solid #ccc')
            .style('padding', '5px')
            .style('pointer-events', 'none');

        // Definir el filtro 3D
        svg.append('defs')
            .append('filter')
            .attr('id', '3d-sector-filter')
            .append('feDropShadow')
            .attr('dx', 3)
            .attr('dy', 3)
            .attr('stdDeviation', 2)
            .attr('flood-color', 'rgba(0, 0, 0, 0.4)');

        return svg;
    }
}
