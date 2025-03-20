let datosCSV = [];
let datosBiologicos = [];
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
  const selectRio = document.getElementById("rio-select");
  const selectPuntos = document.getElementById("puntos-select");
  const selectAnio = document.getElementById("anio-select");
  let datosBiologicos = [];

  // Poblado del select de ríos
  rios.forEach((rio) => {
    const option = document.createElement("option");
    option.value = rio;
    option.text = rio;
    selectRio.add(option);
  });

  // Evento cuando se selecciona un río
  selectRio.addEventListener("change", function () {
    const nombreRioSeleccionado = selectRio.value;
    if (!nombreRioSeleccionado) return mostrarPopupError("Seleccione un río.");

    limpiarSelects(selectPuntos, selectAnio);
    poblarSelectPuntos(nombreRioSeleccionado);
  });

  // Evento cuando se selecciona un punto
  selectPuntos.addEventListener("change", function () {
    const puntoSeleccionado = selectPuntos.value;

    if (!puntoSeleccionado) {
      mostrarPopupError("Seleccione un punto.");
      return;
    }

    const datosFiltrados = filtrarDatosPorPunto(puntoSeleccionado);
    actualizarTabla(datosFiltrados, "tabla2");
    poblarSelectAnios(datosFiltrados); // Poblar años según los datos filtrados
  });

  // Evento cuando se selecciona un año
  selectAnio.addEventListener("change", function () {
    if (selectAnio.value) buscarDatos();
  });

  // Función para limpiar selects
  function limpiarSelects(...selects) {
    selects.forEach((select) => {
      select.innerHTML = '<option value="">Seleccione una opción</option>';
    });
  }

  // Función para poblar el select de puntos
  function poblarSelectPuntos(rio) {
    const puntos = datosBiologicos
      .filter((dato) => dato.RIO === rio)
      .map((dato) => dato.PUNTO)
      .filter((v, i, a) => a.indexOf(v) === i); // Eliminar duplicados

    puntos.forEach((punto) => {
      const option = document.createElement("option");
      option.value = punto;
      option.text = punto;
      selectPuntos.add(option);
    });
  }
  // Función para poblar el select de años
function poblarSelectAnios(datos) {
  selectAnio.innerHTML = ''; // Limpiar opciones previas en el select de años

  const aniosSet = new Set(); // Usamos un Set para almacenar años únicos y evitar duplicados

  datos.forEach((dato) => {
      let anio;

      // Verifica si la fecha es un objeto Date válido
      if (dato.FECHA instanceof Date && !isNaN(dato.FECHA)) {
          anio = dato.FECHA.getFullYear(); // Extrae el año de la fecha
      } 
      // Si la fecha es una cadena, intenta extraer el año
      else if (typeof dato.FECHA === "string") {
          const [dia, mes, anioStr] = dato.FECHA.split(/[-\/]/); // Divide la fecha en partes (día, mes, año)
          anio = anioStr; // Toma la parte correspondiente al año
      }

      // Agrega el año al conjunto si es un número válido
      if (!isNaN(anio)) aniosSet.add(Number(anio));
  });

  // Convierte el Set a un Array, ordena los años de menor a mayor y los agrega al select
  Array.from(aniosSet)
      .sort((a, b) => a - b)
      .forEach((anio) => {
          const option = document.createElement("option");
          option.value = anio;
          option.textContent = anio;
          selectAnio.appendChild(option);
      });

  // Agregar la opción "Todos" al final de la lista de años
  const optionTodos = document.createElement("option");
  optionTodos.value = "Todos";
  optionTodos.textContent = "Todos";
  selectAnio.appendChild(optionTodos);
}

// Función para filtrar los datos por punto seleccionado
function filtrarDatosPorPunto(punto) {
  // Retorna solo los datos que coinciden con el punto seleccionado
  return datosBiologicos.filter((dato) => dato.PUNTO === punto);
}


  // Función para buscar datos según los filtros seleccionados
function buscarDatos() {
  // Obtiene el valor seleccionado en cada select
  const nombreRioSeleccionado = selectRio.value;
  const puntoSeleccionado = selectPuntos.value;
  const anioSeleccionado = selectAnio.value;

  // Filtra los datos según el río y el punto seleccionados
  let datosFiltrados = datosBiologicos.filter(
    (dato) => dato.RIO === nombreRioSeleccionado && dato.PUNTO === puntoSeleccionado
  );

  // Si el usuario selecciona un año específico, se filtran los datos por dicho año
  if (anioSeleccionado !== "Todos") {
    datosFiltrados = datosFiltrados.filter((dato) => {
      let anio;

      // Si la fecha está en formato Date, se obtiene el año con getFullYear()
      if (dato.FECHA instanceof Date) {
        anio = dato.FECHA.getFullYear();
      } 
      // Si la fecha es una cadena, se divide en día, mes y año
      else if (typeof dato.FECHA === "string") {
        const [dia, mes, anioStr] = dato.FECHA.split(/[-\/]/);
        anio = anioStr; // Se extrae el año como string
      }

      // Compara el año del dato con el año seleccionado por el usuario
      return anio == anioSeleccionado;
    });
  }

  // Se actualiza la tabla con los datos filtrados
  actualizarTabla(datosFiltrados, "tabla2");

  // Se limpian los gráficos antes de mostrar nuevos datos
  limpiarGrafico();

  // Si hay datos filtrados, se actualizan las gráficas; si no, se muestra un mensaje de error
  if (datosFiltrados.length > 0) {
    actualizarGraficas(datosFiltrados, puntoSeleccionado);
  } else {
    mostrarPopupError("No hay datos disponibles para esta selección.");
  }
}

// Función para actualizar las gráficas con los datos filtrados
function actualizarGraficas(datos, punto) {
  limpiarGrafico(); // Limpia gráficos previos antes de actualizar

  // Genera las gráficas con los datos filtrados y las muestra en los contenedores respectivos
  generarGrafico(datos, punto, "#grafico1");
  generarGraficoshanon(datos, punto, "#grafico2");
  generarGrafico3(datos, "#grafico3");
  generarGrafico4(datos, "#grafico4");
  generarGrafico5(datos, "#grafico5");
}

// Cargar los datos CSV al cargar la página
cargarDatosCSV(
"https://raw.githubusercontent.com/TIESPOCH/Calidadagua/EdisonFlores/tablabio.csv",
"tabla2"
);

// Función para cargar los datos desde un archivo CSV
function cargarDatosCSV(url, tablaId) {
  Papa.parse(url, {
      download: true, // Indica que se debe descargar el archivo desde la URL
      header: true, // Especifica que el CSV tiene encabezados
      complete: function (results) {
          // Procesa los datos obtenidos y convierte el campo FECHA en formato Date
          datosBiologicos = results.data.map((dato) => {
              if (dato.FECHA) {
                  const [dia, mes, anio] = dato.FECHA.split("/").map(Number); // Divide la fecha en partes y las convierte a números
                  dato.FECHA = new Date(anio, mes - 1, dia); // Convierte la fecha en un objeto Date
              }
              return dato; // Retorna el objeto modificado
          });

          // Muestra en consola los datos biológicos cargados para verificación
          console.log("Datos biológicos cargados:", datosBiologicos);

          // Actualiza la tabla con los datos obtenidos del CSV
          actualizarTabla(datosBiologicos, tablaId);
      },
      error: function (error) {
          // Muestra un mensaje de error si hay problemas al cargar el archivo CSV
          mostrarPopupError("Error al cargar CSV: " + error.message);
      },
  });
}

 // Obtiene el botón que alterna la visibilidad de la barra lateral
const toggleBtn = document.getElementById("sidebar-toggle-btn");

// Agrega un evento de escucha para detectar clics en el botón
toggleBtn.addEventListener("click", function () {
    // Obtiene los elementos de la barra lateral, el contenido principal y el ícono dentro del botón
    const sidebar = document.querySelector(".sidebar");
    const content = document.querySelector(".content");
    const icon = toggleBtn.querySelector("i");

    // Alterna la clase "collapsed" en la barra lateral para mostrarla u ocultarla
    sidebar.classList.toggle("collapsed");

    // Alterna la clase "expanded" en el contenido principal para ajustar su tamaño
    content.classList.toggle("expanded");

    // Cambia el ícono según el estado de la barra lateral
    icon.classList.toggle("fa-chevron-right", sidebar.classList.contains("collapsed")); // Muestra la flecha hacia la derecha si está colapsado
    icon.classList.toggle("fa-chevron-left", !sidebar.classList.contains("collapsed")); // Muestra la flecha hacia la izquierda si está expandido
});
});

// Función para limpiar los gráficos eliminando los elementos SVG de cada contenedor
function limpiarGrafico() {
  // Elimina el gráfico en el contenedor #grafico1
  d3.select("#grafico1 svg").remove();
  // Elimina el gráfico en el contenedor #grafico2
  d3.select("#grafico2 svg").remove();
  // Elimina el gráfico en el contenedor #grafico3
  d3.select("#grafico3 svg").remove();
  // Elimina el gráfico en el contenedor #grafico4
  d3.select("#grafico4 svg").remove();
  // Elimina el gráfico en el contenedor #grafico5
  d3.select("#grafico5 svg").remove();
}

// Función para mostrar un popup de error con un mensaje personalizado
function mostrarPopupError(mensaje) {
  const popup = document.getElementById("error-popup"); // Obtiene el popup
  const popupText = document.getElementById("error-popup-text"); // Obtiene el texto dentro del popup

  popupText.textContent = mensaje; // Asigna el mensaje de error al texto del popup
  popup.style.display = "block"; // Muestra el popup en la pantalla
}

// Función para cerrar el popup de error
function cerrarPopup() {
  const popup = document.getElementById("error-popup"); // Obtiene el popup
  popup.style.display = "none"; // Oculta el popup
}

// Función para actualizar la tabla con nuevos datos
function actualizarTabla(datos, tablaId) {
  const tabla = document.getElementById(tablaId); // Obtiene la tabla por su ID
  const thead = tabla.querySelector("thead tr"); // Obtiene la fila del encabezado
  const tbody = tabla.querySelector("tbody"); // Obtiene el cuerpo de la tabla

  // Limpiar los contenidos previos de la tabla (encabezado y cuerpo)
  thead.innerHTML = "";
  tbody.innerHTML = "";

  // Si no hay datos, sale de la función sin hacer nada
  if (datos.length === 0) return;

  // Define las columnas que se mostrarán en la tabla
  const camposAMostrar = [
    "RIO",
    "PUNTO",
    "FECHA",
    "RIQUEZA ABSOLUTA",
    "ÍNDICE BMWP/Col.1",
    "ÍNDICE BMWP/Col",
    "DIVERSIDAD SEGÚN SHANNON",
    "CALIDAD DEL AGUA SEGÚN SHANNON",
  ];

  // Llenar la fila de encabezado con los nombres de las columnas
  camposAMostrar.forEach((campo) => {
    const th = document.createElement("th");
    th.textContent = campo; // Asigna el nombre de la columna
    thead.appendChild(th); // Agrega el encabezado a la tabla
  });

  // Llenar el cuerpo de la tabla con los datos recibidos
  datos.forEach((dato) => {
    const tr = document.createElement("tr"); // Crea una nueva fila para cada dato
    camposAMostrar.forEach((campo) => {
      const td = document.createElement("td");
      td.textContent = dato[campo]; // Asigna el valor del dato a la celda
      tr.appendChild(td); // Agrega la celda a la fila
    });
    tbody.appendChild(tr); // Agrega la fila al cuerpo de la tabla
  });
}

// Función para generar un gráfico de área utilizando Google Charts
function generarGrafico3(datos, contenedor) {
  // Inicializa los datos del gráfico con los encabezados
  const datosGrafico = [['FECHA', 'Riqueza Absoluta']];
  
  // Ordenar los datos por fecha de manera ascendente
  datos.sort((a, b) => new Date(a.FECHA) - new Date(b.FECHA));

  // Agregar los datos a la estructura para Google Charts
  datos.forEach(dato => {
      datosGrafico.push([new Date(dato.FECHA), parseFloat(dato["RIQUEZA ABSOLUTA"])]);
  });

  // Cargar el paquete de Google Charts necesario para los gráficos
  google.charts.load('current', {'packages':['corechart']});
  // Establecer la función que se ejecutará cuando Google Charts esté listo
  google.charts.setOnLoadCallback(drawChart);

  // Función para dibujar el gráfico
  function drawChart() {
      // Convertir los datos al formato adecuado para Google Charts
      const data = google.visualization.arrayToDataTable(datosGrafico);
      
      // Obtener el contenedor del gráfico (elemento HTML donde se mostrará)
      const containerElement = document.querySelector(contenedor);
      const width = containerElement.clientWidth; // Obtener el ancho del contenedor
      const height = containerElement.clientHeight || 400; // Establecer altura predeterminada si no está definida

      // Opciones del gráfico
      const options = {
          title: 'Riqueza Absoluta a lo largo del tiempo', // Título del gráfico
          titleTextStyle: {
              fontSize: 16, // Tamaño de fuente del título
              bold: true,   // Hacer el título en negrita
              color: '#333', // Color del título
              italic: false // No usar cursiva
          },
          hAxis: {
              title: 'Fecha', // Título del eje horizontal
              format: 'yyyy', // Mostrar solo el año en las etiquetas del eje
              gridlines: { count: 15 }, // Número de líneas de la cuadrícula en el eje horizontal
              slantedText: true, // Rotar las etiquetas del eje horizontal si es necesario
              slantedTextAngle: 45 // Ángulo de rotación de las etiquetas
          },
          vAxis: {
              title: 'Riqueza Absoluta', // Título del eje vertical
              viewWindow: {
                  // Establecer los límites visibles en el eje vertical
                  min: Math.min(...datosGrafico.slice(1).map(d => d[1])),
                  max: Math.max(...datosGrafico.slice(1).map(d => d[1]))
              }
          },
          legend: { position: 'none' }, // Ocultar la leyenda
          width: width, // Ancho del gráfico
          height: height, // Altura del gráfico
          pointSize: 5, // Tamaño de los puntos en el gráfico
          explorer: {
              actions: ['dragToZoom', 'rightClickToReset'], // Permite hacer zoom con arrastre y reiniciar con clic derecho
              axis: 'horizontal', // Limitar el zoom al eje horizontal
              keepInBounds: true // Mantener el zoom dentro de los límites del gráfico
          },
          areaOpacity: 0.4, // Opacidad del área debajo de la línea
          colors: ['#1c91c0'], // Color de la línea y área
          lineWidth: 1, // Grosor de la línea
      };

      // Crear el gráfico de área y dibujarlo en el contenedor
      const chart = new google.visualization.AreaChart(containerElement);
      chart.draw(data, options); // Dibuja el gráfico con los datos y opciones
  }
}

// Función para generar un gráfico de líneas utilizando Google Charts
function generarGrafico4(datos, contenedor) {
  // Inicializa los datos del gráfico con los encabezados
  const datosGrafico = [['Fecha', 'ÍNDICE BMWP/Col']];
  
  // Ordenar los datos por fecha de manera ascendente
  datos.sort((a, b) => new Date(a.FECHA) - new Date(b.FECHA));

  // Agregar los datos a la estructura para Google Charts
  datos.forEach(dato => {
      datosGrafico.push([new Date(dato.FECHA), parseFloat(dato["ÍNDICE BMWP/Col"])]);
  });

  // Cargar el paquete de Google Charts necesario para los gráficos
  google.charts.load('current', {'packages':['corechart']});
  // Establecer la función que se ejecutará cuando Google Charts esté listo
  google.charts.setOnLoadCallback(drawChart);

  // Función para dibujar el gráfico
  function drawChart() {
      // Convertir los datos al formato adecuado para Google Charts
      const data = google.visualization.arrayToDataTable(datosGrafico);
      
      // Obtener el contenedor del gráfico (elemento HTML donde se mostrará)
      const containerElement = document.querySelector(contenedor);
      const width = containerElement.clientWidth; // Obtener el ancho del contenedor
      const height = containerElement.clientHeight || 400; // Establecer altura predeterminada si no está definida

      // Opciones del gráfico
      const options = {
          title: 'ÍNDICE BMWP/Col a lo largo del tiempo', // Título del gráfico
          titleTextStyle: {
              fontSize: 16, // Tamaño de fuente del título
              bold: true,   // Hacer el título en negrita
              color: '#333', // Color del título
              italic: false // No usar cursiva
          },
          hAxis: {
              title: 'Fecha', // Título del eje horizontal
              format: 'yyyy', // Mostrar solo el año en las etiquetas del eje
              gridlines: { count: 15 }, // Número de líneas de la cuadrícula en el eje horizontal
              slantedText: true, // Rotar las etiquetas del eje horizontal si es necesario
              slantedTextAngle: 45 // Ángulo de rotación de las etiquetas
          },
          vAxis: {
              title: 'ÍNDICE BMWP/Col', // Título del eje vertical
              viewWindow: {
                  // Establecer los límites visibles en el eje vertical
                  min: Math.min(...datosGrafico.slice(1).map(d => d[1])),
                  max: Math.max(...datosGrafico.slice(1).map(d => d[1]))
              }
          },
          legend: { position: 'none' }, // Ocultar la leyenda
          width: width, // Ancho del gráfico
          height: height, // Altura del gráfico
          pointSize: 5, // Tamaño de los puntos en el gráfico
          explorer: {
              actions: ['dragToZoom', 'rightClickToReset'], // Permite hacer zoom con arrastre y reiniciar con clic derecho
              axis: 'horizontal', // Limitar el zoom al eje horizontal
              keepInBounds: true // Mantener el zoom dentro de los límites del gráfico
          },
          lineWidth: 2, // Grosor de la línea
          colors: ['#e0440e'] // Color de la línea
      };

      // Crear el gráfico de líneas y dibujarlo en el contenedor
      const chart = new google.visualization.LineChart(containerElement);
      chart.draw(data, options); // Dibuja el gráfico con los datos y opciones
  }
}

// Función para generar un gráfico de barras utilizando Google Charts
function generarGrafico5(datos, contenedor) {
  // Inicializa los datos del gráfico con los encabezados
  const datosGrafico = [['Fecha', 'DIVERSIDAD SEGÚN SHANNON']];
  
  // Ordenar los datos por fecha de manera ascendente
  datos.sort((a, b) => new Date(a.FECHA) - new Date(b.FECHA));

  // Agregar los datos a la estructura para Google Charts
  datos.forEach(dato => {
      datosGrafico.push([new Date(dato.FECHA), parseFloat(dato["DIVERSIDAD SEGÚN SHANNON"])]);
  });

  // Cargar el paquete de Google Charts necesario para los gráficos
  google.charts.load('current', {'packages':['corechart']});
  // Establecer la función que se ejecutará cuando Google Charts esté listo
  google.charts.setOnLoadCallback(drawChart);

  // Función para dibujar el gráfico
  function drawChart() {
      // Convertir los datos al formato adecuado para Google Charts
      const data = google.visualization.arrayToDataTable(datosGrafico);
      
      // Obtener el contenedor del gráfico (elemento HTML donde se mostrará)
      const containerElement = document.querySelector(contenedor);
      const width = containerElement.clientWidth; // Obtener el ancho del contenedor
      const height = containerElement.clientHeight || 400; // Establecer altura predeterminada si no está definida

      // Opciones del gráfico
      const options = {
          title: 'DIVERSIDAD SEGÚN SHANNON a lo largo del tiempo', // Título del gráfico
          titleTextStyle: {
              fontSize: 16, // Tamaño de fuente del título
              bold: true,   // Hacer el título en negrita
              color: '#333', // Color del título
              italic: false // No usar cursiva
          },
          hAxis: {
              title: 'Fecha', // Título del eje horizontal
              format: 'yyyy', // Mostrar solo el año en las etiquetas del eje
              gridlines: { count: 15 }, // Número de líneas de la cuadrícula en el eje horizontal
              slantedText: true, // Rotar las etiquetas del eje horizontal si es necesario
              slantedTextAngle: 45 // Ángulo de rotación de las etiquetas
          },
          vAxis: {
              title: 'DIVERSIDAD SEGÚN SHANNON', // Título del eje vertical
              viewWindow: {
                  // Establecer los límites visibles en el eje vertical
                  min: Math.min(...datosGrafico.slice(1).map(d => d[1])),
                  max: Math.max(...datosGrafico.slice(1).map(d => d[1]))
              }
          },
          legend: { position: 'none' }, // Ocultar la leyenda
          width: width, // Ancho del gráfico
          height: height, // Altura del gráfico
          explorer: {
              actions: ['dragToZoom', 'rightClickToReset'], // Permite hacer zoom con arrastre y reiniciar con clic derecho
              axis: 'horizontal', // Limitar el zoom al eje horizontal
              keepInBounds: true // Mantener el zoom dentro de los límites del gráfico
          },
          bar: { groupWidth: '80%' }, // Ajustar el grosor de las barras
          colors: ['#76A7FA'] // Color de las barras
      };

      // Crear el gráfico de barras y dibujarlo en el contenedor
      const chart = new google.visualization.ColumnChart(containerElement);
      chart.draw(data, options); // Dibuja el gráfico con los datos y opciones
  }
}

function generarGrafico(data, puntoSeleccionado, contenedor) {
  // Convertir fechas y el índice BMWP/Col a números
  data.forEach((d) => {
    d.FECHA = new Date(d.FECHA);
    d["ÍNDICE BMWP/Col"] = +d["ÍNDICE BMWP/Col"];
  });

  // Encontrar la fecha mínima y máxima
  const minFecha = d3.min(data, (d) => d.FECHA);
  const maxFecha = d3.max(data, (d) => d.FECHA);

  // Añadir un mes a la última fecha
  const maxFechaExtendida = d3.timeMonth.offset(maxFecha, 0.5);

  // Ordenar y filtrar los datos
  data = data.filter((d) => d.FECHA >= minFecha).sort((a, b) => a.FECHA - b.FECHA);

  // Definir ticks dinámicos en el eje X
  let ticksCount = data.length > 50 ? d3.timeMonth.every(3) : d3.timeMonth.every(6);

 // Encontrar el mínimo y máximo de CALIDAD AGUA NSF en los datos
 const minCalidadAgua = d3.min(data, d => d['ÍNDICE BMWP/Col']);
 const maxCalidadAgua = d3.max(data, d => d['ÍNDICE BMWP/Col']);

 // Ajustar el dominio del eje Y con un margen de 2 unidades
 const yDomain = [minCalidadAgua, maxCalidadAgua + 2];
  // Configurar dimensiones del gráfico
  const containerWidth = d3.select(contenedor).node().getBoundingClientRect().width;
  const containerHeight = d3.select(contenedor).node().getBoundingClientRect().height;

  const margin = { top: 50, right: 20, bottom: 70, left: 50 },
    width = containerWidth - margin.left - margin.right,
    height = containerHeight - margin.top - margin.bottom;

  // Eliminar cualquier gráfico previo
  d3.select(contenedor).selectAll("svg").remove();

  const svg = d3
    .select(contenedor)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Escalas
  const x = d3.scaleTime().domain([minFecha, maxFechaExtendida]).range([0, width]);
  const y = d3.scaleLinear().domain(yDomain).nice().range([height, 0]);

  // Definir línea
  const line = d3
    .line()
    .curve(d3.curveMonotoneX)
    .x((d) => x(d.FECHA))
    .y((d) => y(d["ÍNDICE BMWP/Col"]));

  // Agregar ejes
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(ticksCount).tickFormat(d3.timeFormat("%b %Y")))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");

  svg.append("g").call(d3.axisLeft(y));

  // Escala de colores dinámica
  const colorScale = d3
    .scaleThreshold()
    .domain([36, 50, 85, 130])
    .range(["#D32F2F", "#FBC02D", "#228B22", "#00008B"]);

  // Generar líneas de referencia dinámicas
  const yTicks = y.ticks(10);
  yTicks.forEach((tickValue) => {
    svg
      .append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", y(tickValue))
      .attr("y2", y(tickValue))
      .attr("stroke", colorScale(tickValue))
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
  });

  // Agregar línea de datos
  svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("d", line);

  // Agregar puntos y eventos de interacción
  svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d.FECHA))
    .attr("cy", (d) => y(d["ÍNDICE BMWP/Col"]))
    .attr("r", 5) // Aumentar el tamaño de los puntos para una mejor visualización
    .attr("fill", "black") // Puntos en color negro
    .attr("stroke", "white") // Borde blanco para destacar los puntos
    .on("mouseover", function (event, d) {
      d3.select(this).transition().duration(200).attr("r", 8); // Agrandar el punto al pasar el mouse

      const tooltipGroup = svg.append("g").attr("class", "tooltip-group");

      const background = tooltipGroup
        .append("rect")
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("rx", 5)
        .attr("ry", 5);

      const text1 = tooltipGroup
        .append("text")
        .attr("x", 0)
        .attr("y", -18)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("FECHA DE MUESTRA: " + d3.timeFormat("%d/%m/%Y")(d.FECHA));

      const text2 = tooltipGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("ÍNDICE BMWP/Col:" + d["ÍNDICE BMWP/Col"]);

      const text3 = tooltipGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 18)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text(
          "ÍNDICE BMWP/Col:" +
            d["ÍNDICE BMWP/Col.1"]
        );

      const bbox = tooltipGroup.node().getBBox();
      background
        .attr("x", bbox.x - 10)
        .attr("y", bbox.y - 5)
        .attr("width", bbox.width + 20)
        .attr("height", bbox.height + 10);

      // Asegurar que el tooltip se muestre completamente dentro de los límites del gráfico
      let tooltipX = x(d.FECHA);
      let tooltipY = y(d["ÍNDICE BMWP/Col"]) - 40;

      if (tooltipX + bbox.width / 2 + 10 > width) {
        tooltipX = width - bbox.width / 2 - 10;
      } else if (tooltipX - bbox.width / 2 - 10 < 0) {
        tooltipX = bbox.width / 2 + 10;
      }

      if (tooltipY - bbox.height - 10 < 0) {
        tooltipY = y(d["ÍNDICE BMWP/Col"]) + bbox.height + 10;
      }

      tooltipGroup.attr("transform", `translate(${tooltipX},${tooltipY})`);
    })
    .on("mouseout", function () {
      d3.select(this).transition().duration(200).attr("r", 5); // Restaurar tamaño original del punto
      svg.select(".tooltip-group").remove();
    });

  // Agregar título
  const titulo =
    "ÍNDICE BMWP/Coll en el  " +
    data[0].RIO +
    " en el punto " +
    puntoSeleccionado;
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2) // Mover el título hacia abajo para evitar que se vea tapado
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "bold")
    .text(titulo);

  // Agregar ícono de información
  const infoIcon = svg
    .append("g")
    .attr("class", "info-icon")
    .attr("transform", `translate(${width - 30}, -30)`)
    .on("mouseover", function () {
      legendGroup.style("display", "block");
    })
    .on("mouseout", function () {
      legendGroup.style("display", "none");
    });

  infoIcon
    .append("circle")
    .attr("r", 10)
    .attr("fill", "lightblue")
    .attr("stroke", "black");

  infoIcon
    .append("text")
    .attr("x", 0)
    .attr("y", 4)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "black")
    .text("i");

  // Agregar contenedor de la leyenda (oculto por defecto)
  const legendGroup = svg
    .append("g")
    .attr("class", "legend-group")
    .style("display", "none");

  const legendBackground = legendGroup
    .append("rect")
    .attr("x", width - 235)
    .attr("y", 0)
    .attr("width", 235)
    .attr("height", 100)
    .attr("fill", "white")
    .attr("stroke", "black");

  const legendData = [
    { color: "#D32F2F", label: "Contaminación alta (0-35)" },
    { color: "#FBC02D", label: "Contaminación Moderada (36-49)" },
    { color: "#228B22", label: "Poca Contaminación (50-84)" },
    { color: "#00008B", label: "Poca Contaminación (85>)" },
  ];

  legendGroup
    .selectAll("rect.legend-item")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("class", "legend-item")
    .attr("x", width - 230)
    .attr("y", (d, i) => 20 + i * 20)
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", (d) => d.color);

  legendGroup
    .selectAll("text.legend-item")
    .data(legendData)
    .enter()
    .append("text")
    .attr("class", "legend-item")
    .attr("x", width - 210)
    .attr("y", (d, i) => 29 + i * 20)
    .attr("dy", ".35em")
    .attr("font-size", "12px")
    .text((d) => d.label);

  // Mostrar la leyenda al pasar el mouse sobre el ícono de información
  infoIcon.on("mouseover", function () {
    legendGroup.style("display", "block");
  });

  // Ocultar la leyenda cuando el mouse sale del ícono de información
  infoIcon.on("mouseout", function () {
    legendGroup.style("display", "none");
  });

  // Retornar el objeto SVG para poder modificarlo más tarde si es necesario
  return svg;
}



function generarGraficoshanon(data, puntoSeleccionado, contenedor) {
  // Convertir fechas y el índice DIVERSIDAD SEGÚN SHANNON a números
data.forEach((d) => {
  d.FECHA = new Date(d.FECHA); // Convertir la fecha a un objeto de fecha
  d["DIVERSIDAD SEGÚN SHANNON"] = +d["DIVERSIDAD SEGÚN SHANNON"]; // Asegurarse de que DIVERSIDAD SEGÚN SHANNON es un número
});

// Encontrar la fecha mínima y máxima en los datos para definir el dominio del eje x
const minFecha = d3.min(data, (d) => d.FECHA);
const maxFecha = d3.max(data, (d) => d.FECHA);

// Añadir un mes a la última fecha
const maxFechaExtendida = d3.timeMonth.offset(maxFecha, 0.5);

// Filtrar los datos para empezar desde la fecha mínima encontrada (opcional)
data = data.filter((d) => d.FECHA >= minFecha);

// Ordenar los datos por fecha nuevamente
data.sort((a, b) => a.FECHA - b.FECHA);

// Definir el número de ticks en el eje x dependiendo de la cantidad de datos
let ticksCount = data.length > 50 ? d3.timeMonth.every(3) : d3.timeMonth.every(6);

 // Encontrar el mínimo y máximo de CALIDAD AGUA NSF en los datos
 const minCalidadAgua = d3.min(data, d => d['DIVERSIDAD SEGÚN SHANNON']);
 const maxCalidadAgua = d3.max(data, d => d['DIVERSIDAD SEGÚN SHANNON']);

 // Ajustar el dominio del eje Y con un margen de 2 unidades
 const yDomain = [minCalidadAgua -0.1, maxCalidadAgua ];

// Obtener las dimensiones del contenedor
const containerWidth = d3.select(contenedor).node().getBoundingClientRect().width;
const containerHeight = d3.select(contenedor).node().getBoundingClientRect().height;

const margin = { top: 50, right: 20, bottom: 70, left: 50 },
  width = containerWidth - margin.left - margin.right,
  height = containerHeight - margin.top - margin.bottom;

// Eliminar cualquier SVG existente dentro del contenedor
d3.select(contenedor).selectAll("svg").remove();

const svg = d3
  .select(contenedor)
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Ajustar el dominio del eje X desde la fecha mínima hasta un mes después de la última fecha
const x = d3
  .scaleTime()
  .domain([minFecha, maxFechaExtendida]) // Establecer el dominio del eje x con un mes extra
  .range([0, width]);

const y = d3
  .scaleLinear()
  .domain(yDomain)
  .nice() // Mejorar el aspecto del eje y extendido
  .range([height, 0]);

// Continúa con el resto de tu código para agregar ejes, líneas, puntos, etc.

  const line = d3
    .line()
    .curve(d3.curveMonotoneX) // Aplicar la interpolación que pasa por los puntos
    .x((d) => x(d.FECHA))
    .y((d) => y(d["DIVERSIDAD SEGÚN SHANNON"]));

  // Agregar ejes
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(ticksCount).tickFormat(d3.timeFormat("%b %Y")))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");

  svg.append("g").call(d3.axisLeft(y));

  // Definir la escala de colores
  const colorScale = d3.scaleLinear()
    .domain([0, 1.18, 2.46, 5])
    .range(["#ff5133", "#feef00", "#31a84f"]);

   // Generar líneas de referencia dinámicas
   const yTicks = y.ticks(10);
   yTicks.forEach((tickValue) => {
     svg
       .append("line")
       .attr("x1", 0)
       .attr("x2", width)
       .attr("y1", y(tickValue))
       .attr("y2", y(tickValue))
       .attr("stroke", colorScale(tickValue))
       .attr("stroke-width", 2)
       .attr("stroke-dasharray", "5,5");
   });
 
   // Agregar línea de datos
   svg
     .append("path")
     .datum(data)
     .attr("fill", "none")
     .attr("stroke", "black")
     .attr("stroke-width", 1.5)
     .attr("d", line);
 

  // Agregar puntos y eventos de interacción
  svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d.FECHA))
    .attr("cy", (d) => y(d["DIVERSIDAD SEGÚN SHANNON"]))
    .attr("r", 5) // Aumentar el tamaño de los puntos para una mejor visualización
    .attr("fill", "black") // Puntos en color negro
    .attr("stroke", "white") // Borde blanco para destacar los puntos
    .on("mouseover", function (event, d) {
      d3.select(this).transition().duration(200).attr("r", 8); // Agrandar el punto al pasar el mouse

      const tooltipGroup = svg.append("g").attr("class", "tooltip-group");

      const background = tooltipGroup
        .append("rect")
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("rx", 5)
        .attr("ry", 5);

      const text1 = tooltipGroup
        .append("text")
        .attr("x", 0)
        .attr("y", -18)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("FECHA DE MUESTRA: " + d3.timeFormat("%d/%m/%Y")(d.FECHA));

      const text2 = tooltipGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("DIVERSIDAD SEGÚN SHANNON: " + d["DIVERSIDAD SEGÚN SHANNON"]);

      const text3 = tooltipGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 18)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text(
          "CALIDAD DEL AGUA SEGÚN SHANNON: " +
            d["CALIDAD DEL AGUA SEGÚN SHANNON"]
        );

      const bbox = tooltipGroup.node().getBBox();
      background
        .attr("x", bbox.x - 10)
        .attr("y", bbox.y - 5)
        .attr("width", bbox.width + 20)
        .attr("height", bbox.height + 10);

      // Asegurar que el tooltip se muestre completamente dentro de los límites del gráfico
      let tooltipX = x(d.FECHA);
      let tooltipY = y(d["DIVERSIDAD SEGÚN SHANNON"]) - 40;

      if (tooltipX + bbox.width / 2 + 10 > width) {
        tooltipX = width - bbox.width / 2 - 10;
      } else if (tooltipX - bbox.width / 2 - 10 < 0) {
        tooltipX = bbox.width / 2 + 10;
      }

      if (tooltipY - bbox.height - 10 < 0) {
        tooltipY = y(d["DIVERSIDAD SEGÚN SHANNON"]) + bbox.height + 10;
      }

      tooltipGroup.attr("transform", `translate(${tooltipX},${tooltipY})`);
    })
    .on("mouseout", function () {
      d3.select(this).transition().duration(200).attr("r", 5); // Restaurar tamaño original del punto
      svg.select(".tooltip-group").remove();
    });

  // Agregar título
  const titulo =
    "Diversidad Según Shannon en el río " +
    data[0].RIO +
    " en el punto " +
    puntoSeleccionado;
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2) // Mover el título hacia abajo para evitar que se vea tapado
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "bold")
    .text(titulo);

  // Agregar ícono de información
  const infoIcon = svg
    .append("g")
    .attr("class", "info-icon")
    .attr("transform", `translate(${width - 30}, -30)`)
    .on("mouseover", function () {
      legendGroup.style("display", "block");
    })
    .on("mouseout", function () {
      legendGroup.style("display", "none");
    });

  infoIcon
    .append("circle")
    .attr("r", 10)
    .attr("fill", "lightblue")
    .attr("stroke", "black");

  infoIcon
    .append("text")
    .attr("x", 0)
    .attr("y", 4)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "black")
    .text("i");

  // Agregar contenedor de la leyenda (oculto por defecto)
  const legendGroup = svg
    .append("g")
    .attr("class", "legend-group")
    .style("display", "none");

  const legendBackground = legendGroup
    .append("rect")
    .attr("x", width - 235)
    .attr("y", 0)
    .attr("width", 235)
    .attr("height", 100)
    .attr("fill", "white")
    .attr("stroke", "black");

  const legendData = [
    { color: "#D32F2F", label: "Contaminación alta (0-1.18)" },
    { color: "#FBC02D", label: "Contaminación Moderada (1.19-2.46)" },
    { color: "#228B22", label: "Poca Contaminación (2.46-5)" },
  ];

  legendGroup
    .selectAll("rect.legend-item")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("class", "legend-item")
    .attr("x", width - 230)
    .attr("y", (d, i) => 20 + i * 20)
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", (d) => d.color);

  legendGroup
    .selectAll("text.legend-item")
    .data(legendData)
    .enter()
    .append("text")
    .attr("class", "legend-item")
    .attr("x", width - 210)
    .attr("y", (d, i) => 29 + i * 20)
    .attr("dy", ".35em")
    .attr("font-size", "12px")
    .text((d) => d.label);

  // Mostrar la leyenda al pasar el mouse sobre el ícono de información
  infoIcon.on("mouseover", function () {
    legendGroup.style("display", "block");
  });

  // Ocultar la leyenda cuando el mouse sale del ícono de información
  infoIcon.on("mouseout", function () {
    legendGroup.style("display", "none");
  });

  // Retornar el objeto SVG para poder modificarlo más tarde si es necesario
  return svg;
}

