let datosCSV = [];
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
  

    document.addEventListener("DOMContentLoaded", function () {
        // Obtener referencias a los elementos select del DOM
        const selectRio = document.getElementById("rio-select");
        const selectPuntos = document.getElementById("puntos-select");
        const selectAnio = document.getElementById("anio-select");
        let datosBiologicos = [];
    
        // Poblado del select de ríos con los valores de la variable 'rios'
        rios.forEach((rio) => {
            const option = document.createElement("option");
            option.value = rio;
            option.text = rio;
            selectRio.add(option);
        });
    
        // Evento cuando se selecciona un río
        selectRio.addEventListener("change", function () {
            const nombreRioSeleccionado = selectRio.value;
            if (!nombreRioSeleccionado) return mostrarPopupError("Seleccione un río."); // Validación
    
            limpiarSelects(selectPuntos, selectAnio); // Limpiar selects dependientes
            poblarSelectPuntos(nombreRioSeleccionado); // Poblar los puntos según el río seleccionado
        });
    
        // Evento cuando se selecciona un punto de muestreo
        selectPuntos.addEventListener("change", function () {
            const puntoSeleccionado = selectPuntos.value;
            if (!puntoSeleccionado) return mostrarPopupError("Seleccione un punto."); // Validación
    
            limpiarSelects(selectAnio); // Limpiar el select de años
            poblarSelectAnios(); // Poblar los años disponibles para el punto seleccionado
        });
    
        // Evento cuando se selecciona un año
        selectAnio.addEventListener("change", function () {
            if (selectAnio.value) buscarDatos(); // Si hay un valor seleccionado, se buscan los datos
        });
    
        // Función para limpiar las opciones de los selects dados
        function limpiarSelects(...selects) {
            selects.forEach((select) => {
                select.innerHTML = '<option value="">Seleccione una opción</option>'; // Restablecer con opción predeterminada
            });
        }
    
        // Función para poblar el select de puntos de muestreo según el río seleccionado
        function poblarSelectPuntos(rio) {
            const puntos = datosBiologicos
                .filter((dato) => dato.RIO === rio) // Filtrar datos por río
                .map((dato) => dato.PUNTO) // Obtener los puntos de muestreo
                .filter((v, i, a) => a.indexOf(v) === i); // Eliminar duplicados
    
            // Agregar opciones al select de puntos
            puntos.forEach((punto) => {
                const option = document.createElement("option");
                option.value = punto;
                option.text = punto;
                selectPuntos.add(option);
            });
        }
    
        // Función para poblar el select de años según los datos disponibles
        function poblarSelectAnios() {
            selectAnio.innerHTML = ''; // Limpiar opciones del select
    
            const aniosSet = new Set(); // Usar un Set para evitar años duplicados
            let maxAnio = null; // Variable para almacenar el año más reciente
    
            datosBiologicos.forEach(dato => {
                let anio; // Variable para almacenar el año
    
                if (dato.FECHA instanceof Date) {
                    // Si la fecha es un objeto Date, obtener el año
                    anio = dato.FECHA.getFullYear();
                } else if (typeof dato.FECHA === "string") {
                    // Si la fecha es una cadena, dividir para extraer el año
                    const fechaParts = dato.FECHA.split(/[-\/]/);
                    anio = fechaParts[0].length === 4 ? fechaParts[0] : fechaParts[2];
                } else {
                    console.warn("Formato de fecha no válido:", dato.FECHA); // Mensaje de advertencia
                    return; // Ignorar datos con formatos inválidos
                }
    
                anio = Number(anio); // Convertir a número
    
                // Si el año es válido, agregar al Set y actualizar el año máximo
                if (!isNaN(anio)) {
                    aniosSet.add(anio);
                    if (maxAnio === null || anio > maxAnio) {
                        maxAnio = anio;
                    }
                }
            });
    
            // Ordenar los años en orden ascendente
            const aniosOrdenados = Array.from(aniosSet).sort((a, b) => a - b);
    
            // Agregar las opciones al select hasta el año más reciente
            aniosOrdenados.forEach(anio => {
                if (anio <= maxAnio) {
                    const option = document.createElement('option');
                    option.value = anio;
                    option.textContent = anio;
                    selectAnio.appendChild(option);
                }
            });
    
            // Agregar opción para seleccionar "Todos los años"
            const optionTodos = document.createElement('option');
            optionTodos.value = "Todos";
            optionTodos.textContent = "Todos";
            selectAnio.appendChild(optionTodos);
        }
 
    // Función para buscar datos según la selección del usuario
function buscarDatos() {
    // Obtener valores seleccionados en los selects
    const nombreRioSeleccionado = selectRio.value;
    const puntoSeleccionado = selectPuntos.value;
    const anioSeleccionado = selectAnio.value;

    // Filtrar datos por río y punto de muestreo
    let datosFiltrados = datosBiologicos.filter(
        (dato) =>
            dato.RIO === nombreRioSeleccionado && dato.PUNTO === puntoSeleccionado
    );

    // Si se selecciona un año específico, filtrar también por año
    if (anioSeleccionado !== "Todos") {
        datosFiltrados = datosFiltrados.filter((dato) => {
            let anio;

            // Verificar si la fecha es un objeto Date o una cadena de texto
            if (dato.FECHA instanceof Date) {
                anio = dato.FECHA.getFullYear(); // Obtener el año si es Date
            } else if (typeof dato.FECHA === "string") {
                const fechaParts = dato.FECHA.split(/[-\/]/); // Separar la fecha en partes
                anio = fechaParts[0].length === 4 ? fechaParts[0] : fechaParts[2]; // Extraer el año
            } else {
                console.warn("Dato sin fecha válida:", dato); // Mensaje de advertencia
                return false; // Excluir datos con fechas no válidas
            }

            return anio == anioSeleccionado; // Comparar con el año seleccionado
        });
    }

    console.log("Datos filtrados:", datosFiltrados); // Mostrar datos filtrados en consola para depuración

    actualizarTabla(datosFiltrados, "tabla2"); // Actualizar la tabla con los datos filtrados
    limpiarGrafico(); // Limpiar gráfico anterior

    // Si hay datos filtrados, generar gráficos; de lo contrario, mostrar error
    if (datosFiltrados.length > 0) {
        actualizarGraficas(datosFiltrados, puntoSeleccionado);
    } else {
        mostrarPopupError("No hay datos disponibles para esta selección.");
    }
}

// Función para actualizar los gráficos con los datos filtrados
function actualizarGraficas(datos, punto) {
    limpiarGrafico(); // Limpiar gráficos previos

    // Generar nuevos gráficos con los datos filtrados
    generarGrafico(datos, punto, '#grafico1');
    generarGrafico2(datos, '#grafico2');
    generarGrafico3(datos, '#grafico3');
    generarGrafico4(datos, '#grafico4');
    generarGrafico5(datos, '#grafico5');
    generarGrafico6(datos, '#grafico6');
    generarGrafico7(datos, '#grafico7');
    generarGrafico8(datos, '#grafico8');
    generarGrafico9(datos, '#grafico9');
}

// Función para cargar datos desde un archivo CSV al cargar la página
cargarDatosCSV('https://raw.githubusercontent.com/TIESPOCH/Calidadagua/EdisonFlores/Parametrosfisio.csv', 'tabla2');

// Función para cargar los datos del CSV y actualizar la tabla
function cargarDatosCSV(url, tablaId) {
    Papa.parse(url, {
        download: true, // Descargar el archivo CSV
        header: true, // Indicar que la primera fila contiene encabezados
        complete: function (results) {
            datosBiologicos = results.data; // Almacenar los datos en la variable global
            actualizarTabla(datosBiologicos, tablaId); // Actualizar la tabla con los datos cargados
        },
        error: function (error) {
            mostrarPopupError("Error al cargar CSV: " + error.message); // Mostrar mensaje de error si falla la carga
        },
    });
}


    // Obtener el botón que activa la barra lateral
const toggleBtn = document.getElementById("sidebar-toggle-btn");

// Añadir un evento al hacer clic en el botón
toggleBtn.addEventListener("click", function () {
    // Obtener la barra lateral, el contenido principal y el icono dentro del botón
    const sidebar = document.querySelector(".sidebar");
    const content = document.querySelector(".content");
    const icon = toggleBtn.querySelector("i");

    // Alternar la clase "collapsed" en la barra lateral para cambiar su estado (colapsado o expandido)
    sidebar.classList.toggle("collapsed");
    // Alternar la clase "expanded" en el contenido principal para ajustarse a la barra lateral
    content.classList.toggle("expanded");

    // Cambiar el icono dependiendo de si la barra lateral está colapsada o no
    icon.classList.toggle("fa-chevron-right", sidebar.classList.contains("collapsed"));
    icon.classList.toggle("fa-chevron-left", !sidebar.classList.contains("collapsed"));
});

});

  // Función para limpiar los gráficos eliminando los elementos SVG existentes
function limpiarGrafico() {
    d3.select("#grafico1 svg").remove();
    d3.select("#grafico2 svg").remove();
    d3.select("#grafico3 svg").remove();
    d3.select("#grafico4 svg").remove();
    d3.select("#grafico5 svg").remove();
    d3.select("#grafico6 svg").remove();
    d3.select("#grafico7 svg").remove();
    d3.select("#grafico8 svg").remove();
    d3.select("#grafico9 svg").remove();
}

// Función para mostrar un mensaje de error en un popup
function mostrarPopupError(mensaje) {
    const popup = document.getElementById("error-popup"); // Obtener el elemento del popup
    const popupText = document.getElementById("error-popup-text"); // Obtener el contenedor del mensaje
    popupText.textContent = mensaje; // Asignar el mensaje de error
    popup.style.display = "block"; // Mostrar el popup
}

// Función para cerrar el popup de error
function cerrarPopup() {
    const popup = document.getElementById("error-popup"); // Obtener el popup
    popup.style.display = "none"; // Ocultar el popup
}

// Función para actualizar la tabla con los datos proporcionados
function actualizarTabla(datos, tablaId) {
    const tabla = document.getElementById(tablaId); // Obtener la tabla por su ID
    const thead = tabla.querySelector('thead tr'); // Obtener la fila del encabezado
    const tbody = tabla.querySelector('tbody'); // Obtener el cuerpo de la tabla
    
    // Limpiar el contenido de la tabla antes de actualizarla
    thead.innerHTML = '';
    tbody.innerHTML = '';
    
    // Si no hay datos, terminar la función
    if (datos.length === 0) return;

    // Definir las columnas que se mostrarán en la tabla
    const camposAMostrar = ['RIO', 'FECHA', 'Clasificacion ', 'Temperatura', 'Ph', 
                            'Oxigeno disuelto', 'Nitratos', 'Fosfatos', 'DBO5', 'CALIDAD AGUA NSF'];
    
    // Llenar el encabezado de la tabla con los nombres de las columnas
    camposAMostrar.forEach(campo => {
        const th = document.createElement('th'); // Crear un elemento <th>
        th.textContent = campo; // Asignar el nombre de la columna
        thead.appendChild(th); // Agregar la columna al encabezado
    });
    
    // Llenar el cuerpo de la tabla con los datos
    datos.forEach(dato => {
        const tr = document.createElement('tr'); // Crear una nueva fila
        camposAMostrar.forEach(campo => {
            const td = document.createElement('td'); // Crear una celda
            td.textContent = dato[campo]; // Asignar el valor del dato a la celda
            tr.appendChild(td); // Agregar la celda a la fila
        });
        tbody.appendChild(tr); // Agregar la fila al cuerpo de la tabla
    });
}

function generarGrafico2(datos, contenedor) {
    // Transformar datos para Google Charts en un formato adecuado
    const datosGrafico = [['Fecha', 'Temperatura']]; // Definir encabezados
    datos.forEach(dato => {
        datosGrafico.push([new Date(dato.FECHA), parseFloat(dato.Temperatura)]); // Convertir la fecha y temperatura
    });

    // Cargar la biblioteca Google Charts con el paquete 'corechart'
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(drawChart); // Llamar a la función de dibujo cuando la biblioteca esté lista

    function drawChart() {
        const data = google.visualization.arrayToDataTable(datosGrafico); // Convertir datos en formato de tabla

        const containerElement = document.querySelector(contenedor); // Obtener el contenedor del gráfico

        function draw() {
            const width = containerElement.clientWidth; // Obtener el ancho del contenedor
            const height = containerElement.clientHeight || 400; // Usar altura predeterminada si no se especifica

            // Configuración de opciones del gráfico
            const options = {
                title: 'Temperatura a lo largo del tiempo', // Título del gráfico
                titleTextStyle: {
                    fontSize: 16, 
                    bold: true,   
                    color: 'black',
                    italic: false
                },
                hAxis: {
                    title: 'Fecha', // Etiqueta del eje X
                    format: 'yyyy', // Formato del año
                    gridlines: { count: 15 }, // Cantidad de líneas de la cuadrícula
                    slantedText: true, // Inclinar las etiquetas del eje X
                    slantedTextAngle: 45 // Ángulo de inclinación
                },
                vAxis: {
                    title: 'Temperatura (°C)', // Etiqueta del eje Y
                    viewWindow: {
                        min: Math.min(...datosGrafico.slice(1).map(d => d[1])), // Mínimo del eje Y
                        max: Math.max(...datosGrafico.slice(1).map(d => d[1]))  // Máximo del eje Y
                    }
                },
                legend: { position: 'none' }, // Ocultar la leyenda
                width: width, // Ajustar al ancho del contenedor
                height: height, // Ajustar a la altura del contenedor
                bar: { groupWidth: '80%' }, // Ancho de las barras
                explorer: {
                    actions: ['dragToZoom', 'rightClickToReset'], // Permitir zoom y restablecimiento con clic derecho
                    axis: 'horizontal', // Aplicar zoom solo en el eje X
                    keepInBounds: true // Mantener los datos dentro de los límites
                }
            };

            const chart = new google.visualization.ColumnChart(containerElement); // Crear gráfico de columnas
            chart.draw(data, options); // Dibujar el gráfico con los datos y opciones
        }

        draw(); // Dibujar el gráfico inicialmente

        // Redibujar el gráfico cuando la ventana cambia de tamaño para mantener la responsividad
        window.addEventListener('resize', draw);
    }
}

function generarGrafico3(datos, contenedor) {
    // Ordenar los datos por fecha para asegurar una secuencia cronológica correcta
    datos.sort((a, b) => new Date(a.FECHA) - new Date(b.FECHA));

    // Transformar datos para Google Charts en un formato adecuado
    const datosGrafico = [['Fecha', 'pH']]; // Definir encabezados
    datos.forEach(dato => {
        datosGrafico.push([new Date(dato.FECHA), parseFloat(dato.Ph)]); // Convertir fecha y pH a valores adecuados
    });

    // Cargar la biblioteca Google Charts con el paquete 'corechart'
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(drawChart); // Llamar a la función de dibujo cuando la biblioteca esté lista

    function drawChart() {
        const data = google.visualization.arrayToDataTable(datosGrafico); // Convertir datos en formato de tabla

        const containerElement = document.querySelector(contenedor); // Obtener el contenedor del gráfico

        function draw() {
            const width = containerElement.clientWidth; // Obtener el ancho del contenedor
            const height = containerElement.clientHeight || 400; // Usar altura predeterminada si no se especifica

            // Configuración de opciones del gráfico
            const options = {
                title: 'pH a lo largo del tiempo', // Título del gráfico
                hAxis: {
                    title: 'Fecha', // Etiqueta del eje X
                    format: 'yyyy', // Formato del año
                    gridlines: { count: 10 }, // Cantidad de líneas de la cuadrícula
                    slantedText: true, // Inclinar las etiquetas del eje X
                    slantedTextAngle: 45 // Ángulo de inclinación
                },
                vAxis: {
                    title: 'pH', // Etiqueta del eje Y
                    viewWindow: {
                        min: Math.min(...datosGrafico.slice(1).map(d => d[1])), // Mínimo del eje Y
                        max: Math.max(...datosGrafico.slice(1).map(d => d[1]))  // Máximo del eje Y
                    }
                },
                legend: { position: 'none' }, // Ocultar la leyenda
                areaOpacity: 0.3, // Transparencia del área
                curveType: 'function', // Línea curva en el gráfico
                pointSize: 5, // Tamaño de los puntos en la gráfica
                width: width, // Ajustar al ancho del contenedor
                height: height, // Ajustar a la altura del contenedor
                explorer: {
                    actions: ['dragToZoom', 'rightClickToReset'], // Permitir zoom y restablecimiento con clic derecho
                    axis: 'horizontal', // Aplicar zoom solo en el eje X
                    keepInBounds: true // Mantener los datos dentro de los límites
                }
            };

            const chart = new google.visualization.AreaChart(containerElement); // Crear gráfico de área
            chart.draw(data, options); // Dibujar el gráfico con los datos y opciones
        }

        draw(); // Dibujar el gráfico inicialmente

        // Redibujar el gráfico cuando la ventana cambia de tamaño para mantener la responsividad
        window.addEventListener('resize', draw);
    }
}

function generarGrafico4(datos, contenedor) {
    // Transformar datos para Google Charts
    const datosGrafico = [['Año', 'Oxígeno Disuelto']];

    // Extraer y procesar datos
    datos.forEach(dato => {
        const fecha = new Date(dato.FECHA); // Convertir la fecha a objeto Date
        const oxigenoDisuelto = parseFloat(dato['Oxigeno disuelto']); // Convertir a número
        datosGrafico.push([fecha, oxigenoDisuelto]);
    });

    // Cargar Google Charts con el paquete 'corechart'
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(drawChart); // Ejecutar la función cuando la carga se complete

    function drawChart() {
        const data = google.visualization.arrayToDataTable(datosGrafico); // Convertir datos en formato de tabla

        const containerElement = document.querySelector(contenedor); // Obtener el contenedor del gráfico
        
        function draw() {
            const width = containerElement.clientWidth; // Obtener ancho del contenedor
            const height = containerElement.clientHeight || 400; // Usar altura predeterminada si no se especifica

            // Configuración del gráfico
            const options = {
                title: 'Oxígeno Disuelto a lo largo del tiempo',
                titleTextStyle: {
                    fontSize: 16, // Tamaño del título
                    bold: true,   // Negrita en el título
                    color: '#333', // Color del texto
                    italic: false // No usar cursiva
                },
                hAxis: {
                    title: 'Año', // Etiqueta del eje X
                    format: 'yyyy', // Mostrar solo el año
                    gridlines: { count: 6 }, // Número de líneas de cuadrícula
                    ticks: Array.from(new Set(datosGrafico.slice(1).map(d => d[0]))) // Asegurar que los años sean únicos
                },
                vAxis: {
                    title: 'Oxígeno Disuelto', // Etiqueta del eje Y
                    viewWindow: {
                        min: Math.min(...datosGrafico.slice(1).map(d => d[1])), // Mínimo del eje Y
                        max: Math.max(...datosGrafico.slice(1).map(d => d[1]))  // Máximo del eje Y
                    }
                },
                legend: { position: 'none' }, // Ocultar leyenda
                areaOpacity: 0.3, // Transparencia del área
                curveType: 'function', // Suavizar líneas
                pointSize: 5, // Tamaño de los puntos en la gráfica
                width: width, // Ajustar al ancho del contenedor
                height: height, // Ajustar a la altura del contenedor
                explorer: {
                    actions: ['dragToZoom', 'rightClickToReset'], // Zoom y reinicio con clic derecho
                    axis: 'horizontal', // Zoom solo en el eje horizontal
                    keepInBounds: true // Mantener dentro de los límites
                }
            };

            const chart = new google.visualization.AreaChart(containerElement); // Crear el gráfico de área
            chart.draw(data, options); // Dibujar con los datos y opciones configuradas
        }

        draw(); // Dibujar el gráfico inicialmente

        // Redibujar el gráfico cuando la ventana cambia de tamaño para mantener responsividad
        window.addEventListener('resize', draw);
    }
}

function generarGrafico5(datos, contenedor) {
    // Transformar datos para Google Charts
    const datosGrafico = [['Fecha', 'Nitratos', { role: 'tooltip', type: 'string', p: { html: true } }]]; // Definir estructura de datos con tooltips en HTML
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]; // Array con nombres de los meses
    
    // Extraer y procesar datos
    datos.forEach(dato => {
        const fecha = new Date(dato.FECHA); // Convertir la fecha a objeto Date
        const año = fecha.getFullYear().toString(); // Obtener el año como string
        const mes = meses[fecha.getMonth()]; // Obtener el nombre del mes
        const dia = fecha.getDate(); // Obtener el día del mes
        const nitratos = parseFloat(dato['Nitratos']); // Convertir el valor de nitratos a número
        const fechaFormateada = `${mes} ${dia}, ${fecha.getFullYear()}`; // Formatear la fecha para el tooltip
        
        // Agregar los datos transformados al array
        datosGrafico.push([año, nitratos, ` ${fechaFormateada}<br>Nitratos: ${nitratos}`]);
    });

    // Cargar Google Charts con el paquete 'corechart'
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(drawChart); // Llamar a la función cuando la carga se complete

    function drawChart() {
        const data = google.visualization.arrayToDataTable(datosGrafico); // Convertir los datos en un formato compatible con Google Charts

        const containerElement = document.querySelector(contenedor); // Obtener el contenedor del gráfico
        
        function draw() {
            const width = containerElement.clientWidth; // Obtener el ancho del contenedor
            const height = containerElement.clientHeight || 400; // Establecer una altura predeterminada si no está definida

            // Configuración del gráfico
            const options = {
                title: 'Comparación de Nitratos por Fecha',
                titleTextStyle: {
                    fontSize: 16, // Tamaño del título
                    bold: true,   // Negrita en el título
                    color: 'black', // Color del título
                    italic: false // No usar cursiva
                },
                hAxis: {
                    title: 'Nitratos', // Etiqueta del eje horizontal
                    titleTextStyle: { color: 'black' }
                },
                vAxis: {
                    title: 'Fecha', // Etiqueta del eje vertical
                    titleTextStyle: { color: 'black' },
                    gridlines: { count: -1 } // Ajustar las líneas de cuadrícula automáticamente
                },
                legend: { position: 'none' }, // Ocultar leyenda
                tooltip: { isHtml: true }, // Habilitar tooltips con formato HTML para mostrar la fecha y el valor de nitratos
                width: width, // Ajustar el ancho al tamaño del contenedor
                height: height, // Ajustar la altura al tamaño del contenedor
                explorer: {
                    actions: ['dragToZoom', 'rightClickToReset'], // Habilitar zoom y reinicio con clic derecho
                    axis: 'horizontal', // Permitir zoom en el eje horizontal
                    keepInBounds: true // Mantener el gráfico dentro de los límites definidos
                }
            };

            const chart = new google.visualization.BarChart(containerElement); // Crear el gráfico de barras
            chart.draw(data, options); // Dibujar el gráfico con los datos y opciones configuradas
        }

        draw(); // Dibujar el gráfico inicialmente

        // Redibujar el gráfico cuando la ventana cambia de tamaño para mantener la responsividad
        window.addEventListener('resize', draw);
    }
}


function generarGrafico6(datos, contenedor) {
    // Transformar datos para Google Charts
    const datosGrafico = [['Fecha', 'Fosfatos', { role: 'tooltip', type: 'string', p: { html: true } }]]; // Definir estructura de datos con tooltips en HTML
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]; // Array con nombres de los meses
    
    // Extraer y procesar datos
    datos.forEach(dato => {
        const fecha = new Date(dato.FECHA); // Convertir la fecha a objeto Date
        const año = fecha.getFullYear().toString(); // Obtener el año como string
        const mes = meses[fecha.getMonth()]; // Obtener el nombre del mes
        const dia = fecha.getDate(); // Obtener el día del mes
        const fosfatos = parseFloat(dato['Fosfatos']); // Convertir el valor de fosfatos a número
        const fechaFormateada = `${mes} ${dia}, ${fecha.getFullYear()}`; // Formatear la fecha para el tooltip
        
        // Agregar los datos transformados al array
        datosGrafico.push([año, fosfatos, `<div><b>Fecha:</b> ${fechaFormateada}<br><b>Fosfatos:</b> ${fosfatos}</div>`]);
    });

    // Cargar Google Charts con el paquete 'corechart'
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart); // Llamar a la función cuando la carga se complete

    function drawChart() {
        const data = google.visualization.arrayToDataTable(datosGrafico); // Convertir los datos en un formato compatible con Google Charts

        const containerElement = document.querySelector(contenedor); // Obtener el contenedor del gráfico

        function draw() {
            const width = containerElement.clientWidth; // Obtener el ancho del contenedor
            const height = containerElement.clientHeight || 400; // Establecer una altura predeterminada si no está definida

            // Configuración del gráfico
            const options = {
                title: 'Comparación de Fosfatos por Fecha',
                titleTextStyle: {
                    fontSize: 16, // Tamaño del título
                    bold: true,   // Negrita en el título
                    color: '#333', // Color del título
                    italic: false // No usar cursiva
                },
                hAxis: {
                    title: 'Fosfatos', // Etiqueta del eje horizontal
                    titleTextStyle: { color: '#333' },
                    minValue: 0 // Asegurar que la escala comience en 0
                },
                vAxis: {
                    title: 'Año', // Etiqueta del eje vertical
                    titleTextStyle: { color: '#333' }
                },
                legend: { position: 'none' }, // Ocultar leyenda
                tooltip: { isHtml: true }, // Habilitar tooltips con formato HTML para mostrar la fecha y el valor de fosfatos
                width: width, // Ajustar el ancho al tamaño del contenedor
                height: height, // Ajustar la altura al tamaño del contenedor
                explorer: {
                    actions: ['dragToZoom', 'rightClickToReset'], // Habilitar zoom y reinicio con clic derecho
                    axis: 'horizontal', // Permitir zoom en el eje horizontal
                    keepInBounds: true // Mantener el gráfico dentro de los límites definidos
                }
            };

            const chart = new google.visualization.BarChart(containerElement); // Crear el gráfico de barras
            chart.draw(data, options); // Dibujar el gráfico con los datos y opciones configuradas
        }

        draw(); // Dibujar el gráfico inicialmente

        // Redibujar el gráfico cuando la ventana cambia de tamaño para mantener la responsividad
        window.addEventListener('resize', draw);
    }
}


function generarGrafico7(datos, contenedor) {
    // Transformar datos para Google Charts
    const datosGrafico = [['Fecha', 'Turbiedad']]; // Definir la estructura del array de datos con encabezados

    // Extraer y procesar datos
    datos.forEach(dato => {
        const fecha = new Date(dato.FECHA); // Convertir la fecha a objeto Date
        const turbiedad = parseFloat(dato['Turbiedad']); // Convertir el valor de turbiedad a número
        datosGrafico.push([fecha, turbiedad]); // Añadir fecha y turbiedad al array de datos
    });

    // Cargar Google Charts con el paquete 'corechart'
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart); // Llamar a la función cuando la carga se complete

    function drawChart() {
        const data = google.visualization.arrayToDataTable(datosGrafico); // Convertir los datos a formato de Google Charts

        const containerElement = document.querySelector(contenedor); // Obtener el contenedor del gráfico

        function draw() {
            const width = containerElement.clientWidth; // Obtener el ancho del contenedor
            const height = containerElement.clientHeight || 400; // Altura predeterminada si no está definida

            // Configuración del gráfico
            const options = {
                title: 'Turbiedad a lo largo del tiempo',
                titleTextStyle: {
                    fontSize: 16, // Tamaño de fuente del título
                    bold: true,   // Negrita en el título
                    color: '#333', // Color del título
                    italic: false // No usar cursiva
                },
                hAxis: {
                    title: 'Fecha', // Etiqueta del eje horizontal
                    format: 'yyyy', // Formato de fecha en el eje X
                    slantedText: true, // Inclinar el texto para mejor legibilidad
                    slantedTextAngle: 45 // Ángulo de inclinación del texto
                },
                vAxis: {
                    title: 'Turbiedad', // Etiqueta del eje vertical
                    titleTextStyle: { color: '#333' }
                },
                legend: { position: 'none' }, // Ocultar la leyenda
                width: width, // Ajustar el ancho al tamaño del contenedor
                height: height, // Ajustar la altura al tamaño del contenedor
                explorer: {
                    actions: ['dragToZoom', 'rightClickToReset'], // Habilitar zoom y reinicio con clic derecho
                    axis: 'horizontal', // Permitir zoom en el eje horizontal
                    keepInBounds: true // Mantener el gráfico dentro de los límites definidos
                }
            };

            const chart = new google.visualization.ColumnChart(containerElement); // Crear un gráfico de columnas
            chart.draw(data, options); // Dibujar el gráfico con los datos y opciones configuradas
        }

        draw(); // Dibujar el gráfico inicialmente

        // Redibujar el gráfico cuando la ventana cambia de tamaño para mantener la responsividad
        window.addEventListener('resize', draw);
    }
}

function generarGrafico8(datos, contenedor) {
    // Transformar datos para Google Charts
    const datosGrafico = [['Fecha', 'DBO5']]; // Definir la estructura del array de datos con encabezados

    // Extraer y procesar datos
    datos.forEach(dato => {
        const fecha = new Date(dato.FECHA); // Convertir la fecha a objeto Date
        const dbo5 = parseFloat(dato['DBO5']); // Convertir el valor de DBO5 a número
        datosGrafico.push([fecha, dbo5]); // Añadir fecha y DBO5 al array de datos
    });

    // Cargar Google Charts con el paquete 'corechart'
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart); // Llamar a la función cuando la carga se complete

    function drawChart() {
        const data = google.visualization.arrayToDataTable(datosGrafico); // Convertir los datos a formato de Google Charts

        const containerElement = document.querySelector(contenedor); // Obtener el contenedor del gráfico

        function draw() {
            const width = containerElement.clientWidth; // Obtener el ancho del contenedor
            const height = containerElement.clientHeight || 400; // Altura predeterminada si no está definida

            // Configuración del gráfico
            const options = {
                title: 'DBO5 a lo largo del tiempo',
                titleTextStyle: {
                    fontSize: 16, // Tamaño de fuente del título
                    bold: true,   // Negrita en el título
                    color: '#333', // Color del título
                    italic: false // No usar cursiva
                },
                hAxis: {
                    title: 'Fecha', // Etiqueta del eje horizontal
                    format: 'yyyy', // Formato de fecha en el eje X
                    slantedText: true, // Inclinar el texto para mejor legibilidad
                    slantedTextAngle: 45 // Ángulo de inclinación del texto
                },
                vAxis: {
                    title: 'DBO5', // Etiqueta del eje vertical
                    titleTextStyle: { color: '#333' }
                },
                legend: { position: 'none' }, // Ocultar la leyenda
                width: width, // Ajustar el ancho al tamaño del contenedor
                height: height, // Ajustar la altura al tamaño del contenedor
                curveType: 'function', // Suavizar las líneas
                explorer: {
                    actions: ['dragToZoom', 'rightClickToReset'], // Habilitar zoom y reinicio con clic derecho
                    axis: 'horizontal', // Permitir zoom en el eje horizontal
                    keepInBounds: true // Mantener el gráfico dentro de los límites definidos
                },
                pointSize: 5 // Tamaño de los puntos en el gráfico
            };

            const chart = new google.visualization.LineChart(containerElement); // Crear un gráfico de líneas
            chart.draw(data, options); // Dibujar el gráfico con los datos y opciones configuradas
        }

        draw(); // Dibujar el gráfico inicialmente

        // Redibujar el gráfico cuando la ventana cambia de tamaño para mantener la responsividad
        window.addEventListener('resize', draw);
    }
}


function generarGrafico9(datos, contenedor) {
    // Transformar datos para Google Charts
    const datosGrafico = [['Clasificación', 'Cantidad']]; // Definir la estructura inicial de los datos con encabezados

    // Contar la cantidad de cada clasificación
    const clasificacionesCount = {}; // Objeto para almacenar la cantidad de cada clasificación
    datos.forEach(dato => {
        const clasificacion = dato['Clasificacion ']; // Obtener la clasificación (asegúrate de usar el nombre exacto de la columna)
        if (clasificacionesCount[clasificacion]) {
            clasificacionesCount[clasificacion]++; // Incrementar el contador si la clasificación ya existe
        } else {
            clasificacionesCount[clasificacion] = 1; // Inicializar el contador si es la primera vez que aparece
        }
    });

    // Preparar los datos para el gráfico
    Object.keys(clasificacionesCount).forEach(clasificacion => {
        datosGrafico.push([clasificacion, clasificacionesCount[clasificacion]]); // Añadir la clasificación y su cantidad
    });

    // Cargar Google Charts con el paquete 'corechart'
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart); // Llamar a la función drawChart cuando Google Charts se haya cargado

    function drawChart() {
        const data = google.visualization.arrayToDataTable(datosGrafico); // Convertir los datos a formato de Google Charts

        const containerElement = document.querySelector(contenedor); // Obtener el contenedor del gráfico

        function draw() {
            const width = containerElement.clientWidth; // Obtener el ancho del contenedor
            const height = containerElement.clientHeight || 400; // Altura predeterminada si no está definida

            // Mapear clasificaciones a colores
            const colores = {
                'Buena': '#4CAF50',   // Verde
                'Regular': '#FF9800', // Naranja
                'Mala': '#F44336'     // Rojo
            };

            // Crear un array de colores según el orden de las clasificaciones en los datos
            const colorArray = datosGrafico.slice(1).map(row => colores[row[0]] || '#000000'); // Color negro por defecto si la clasificación no está en el mapa

            // Configuración del gráfico
            const options = {
                title: 'Distribución de Clasificaciones', // Título del gráfico
                titleTextStyle: {
                    fontSize: 16, // Tamaño de fuente del título
                    bold: true,   // Hacer el título en negrita
                    color: '#333', // Color del título
                    italic: false // No usar cursiva
                },
                pieSliceText: 'label', // Mostrar etiquetas en las rebanadas del gráfico
                legend: { position: 'right' }, // Posición de la leyenda
                pieStartAngle: 100, // Ajustar el ángulo de inicio de la gráfica
                width: width, // Ajustar el ancho al tamaño del contenedor
                height: height, // Ajustar la altura al tamaño del contenedor
                colors: colorArray // Aplicar los colores a las rebanadas del gráfico
            };

            const chart = new google.visualization.PieChart(containerElement); // Crear un gráfico de tipo 'PieChart'
            chart.draw(data, options); // Dibujar el gráfico con los datos y opciones configuradas
        }

        draw(); // Dibujar el gráfico inicialmente

        // Redibujar el gráfico cuando la ventana cambia de tamaño para mantener la responsividad
        window.addEventListener('resize', draw);
    }
}

function generarGrafico(data, puntoSeleccionado, contenedor) {
    // Convertir fechas y calidad del agua a números
    data.forEach(d => {
        d.FECHA = new Date(d.FECHA);  // Convertir FECHA a un objeto Date
        d['CALIDAD AGUA NSF'] = +d['CALIDAD AGUA NSF'];  // Asegurar que CALIDAD AGUA NSF es un número
    });

    // Encontrar la fecha mínima y máxima en los datos para definir el dominio del eje X
    const minFecha = d3.min(data, d => d.FECHA);
    const maxFecha = d3.max(data, d => d.FECHA);

    // Añadir un mes a la última fecha para extender el eje X
    const maxFechaExtendida = d3.timeMonth.offset(maxFecha, 0.5);

    // Ordenar los datos por fecha
    data.sort((a, b) => a.FECHA - b.FECHA);

    // Definir los colores para los rangos de calidad del agua
    const colorScale = d3.scaleThreshold()
        .domain([50.09, 68.25])
        .range(['#D32F2F', '#FBC02D', '#388E3C']);

    // Encontrar el mínimo y máximo de CALIDAD AGUA NSF en los datos
    const minCalidadAgua = d3.min(data, d => d['CALIDAD AGUA NSF']);
    const maxCalidadAgua = d3.max(data, d => d['CALIDAD AGUA NSF']);

    // Ajustar el dominio del eje Y con un margen de 2 unidades
    const yDomain = [minCalidadAgua, maxCalidadAgua + 2];

    // Obtener las dimensiones del contenedor para crear un gráfico responsivo
    const containerWidth = d3.select(contenedor).node().getBoundingClientRect().width;
    const containerHeight = d3.select(contenedor).node().getBoundingClientRect().height;

    const margin = { top: 20, right: 20, bottom: 70, left: 50 },
        width = containerWidth - margin.left - margin.right,
        height = containerHeight - margin.top - margin.bottom;

    // Eliminar cualquier SVG existente dentro del contenedor antes de crear uno nuevo
    d3.select(contenedor).selectAll("svg").remove();

    // Crear el contenedor SVG donde se dibujará el gráfico
    const svg = d3.select(contenedor).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Definir la escala del eje X (fechas)
    const x = d3.scaleTime()
        .domain([minFecha, maxFechaExtendida])
        .range([0, width]);

    // Definir la escala del eje Y para la calidad del agua
    const y = d3.scaleLinear()
        .domain(yDomain)
        .nice() // Hacer los valores más fáciles de leer
        .range([height, 0]);

    // Crear el eje Y y agregarlo al gráfico
    const yAxis = d3.axisLeft(y);

    // Generar líneas de referencia basadas en los valores del eje Y
    const yTicks = y.ticks(); // Obtener los ticks generados automáticamente
    yTicks.forEach(tickValue => {
        const color = colorScale(tickValue); // Obtener el color correspondiente para cada tick
        svg.append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", y(tickValue))
            .attr("y2", y(tickValue))
            .attr("stroke", color)
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "5,5"); // Hacer líneas discontinuas
    });

    // Definir la línea de datos (grafico de la calidad del agua)
    const line = d3.line()
        .curve(d3.curveMonotoneX) // Suavizar la línea para mejorar la visualización
        .x(d => x(d.FECHA))
        .y(d => y(d['CALIDAD AGUA NSF']));

    // Agregar los ejes X y Y al gráfico
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %Y"))) // Formato de la fecha en el eje X
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)"); // Rotar los textos de las fechas para mejor legibilidad

    svg.append("g")
        .call(yAxis);

    // Dibujar la línea de datos en el gráfico
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    // Agregar puntos interactivos para cada dato
    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => x(d.FECHA))
        .attr("cy", d => y(d['CALIDAD AGUA NSF']))
        .attr("r", 5) // Tamaño de los puntos
        .attr("fill", "black")
        .attr("stroke", "white")
        .on("mouseover", function(event, d) {
            // Ampliar el tamaño del punto cuando se pasa el mouse
            d3.select(this).transition().duration(200).attr("r", 6);

            // Crear un tooltip con información detallada
            const tooltipGroup = svg.append("g")
                .attr("class", "tooltip-group");

            const background = tooltipGroup.append("rect")
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("rx", 5)
                .attr("ry", 5);

            const text1 = tooltipGroup.append("text")
                .attr("x", 0)
                .attr("y", -18)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .text("CALIDAD DE AGUA NSF: " + d['CALIDAD AGUA NSF']);

            const text2 = tooltipGroup.append("text")
                .attr("x", 0)
                .attr("y", 0)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .text("FECHA DE MUESTRA: " + d3.timeFormat("%d/%m/%Y")(d.FECHA));

            const text3 = tooltipGroup.append("text")
                .attr("x", 0)
                .attr("y", 18)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .text("Clasificación: " + d['Clasificacion ']);

            // Obtener el tamaño del tooltip para posicionarlo dinámicamente
            const bbox = tooltipGroup.node().getBBox();
            background
                .attr("x", bbox.x - 10)
                .attr("y", bbox.y - 5)
                .attr("width", bbox.width + 20)
                .attr("height", bbox.height + 10);

            let tooltipX = x(d.FECHA);
            let tooltipY = y(d["CALIDAD AGUA NSF"]) - 40;

            // Ajustar la posición del tooltip para que se quede dentro del gráfico
            if (tooltipX + bbox.width / 2 + 10 > width) {
                tooltipX = width - bbox.width / 2 - 10;
            } else if (tooltipX - bbox.width / 2 - 10 < 0) {
                tooltipX = bbox.width / 2 + 10;
            }

            if (tooltipY - bbox.height - 10 < 0) {
                tooltipY = y(d["CALIDAD AGUA NSF"]) + bbox.height + 10;
            }

            tooltipGroup.attr("transform", `translate(${tooltipX},${tooltipY})`);
        })
        .on("mouseout", function() {
            // Volver al tamaño original del punto al quitar el mouse
            d3.select(this).transition().duration(200).attr("r", 5);
            svg.select(".tooltip-group").remove(); // Eliminar el tooltip
        });

    // Agregar el título del gráfico
    const titulo = "Calidad del Agua NSF en el " + data[0].RIO + " en el punto " + puntoSeleccionado;
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 3)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text(titulo);

    // Manejar el redimensionamiento del gráfico para que sea responsivo
    window.addEventListener('resize', () => {
        d3.select(contenedor).select("svg").remove(); // Eliminar el gráfico existente
        generarGrafico(data, puntoSeleccionado, contenedor); // Redibujar el gráfico
    });

    return svg;
}
