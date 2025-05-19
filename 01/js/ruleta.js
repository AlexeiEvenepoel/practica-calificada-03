// Declaración de variables globales
const COLORES_RULETA = ["#F94144", "#4D908E", "#277DA1", "#F9C74F", "#90BE6D"];
let elementosRuleta = [];
let elementosOcultos = [];
let anguloActual = 0;
let estaGirando = false;
let elementoSeleccionadoIndex = -1;
let modoEdicion = false;

// Elementos del DOM
document.addEventListener("DOMContentLoaded", function () {
  // Obtener referencias a los elementos del DOM
  const ruletaCanvas = document.getElementById("ruletaCanvas");
  const ctx = ruletaCanvas.getContext("2d");
  const elementosTextArea = document.getElementById("elementosTextArea");
  const btnIniciar = document.getElementById("btnIniciar");
  const btnReiniciar = document.getElementById("btnReiniciar");
  const btnEditar = document.getElementById("btnEditar");
  const btnEsconder = document.getElementById("btnEsconder");
  const btnTitulo = document.getElementById("btnTitulo");
  const elementoSeleccionadoDiv = document.getElementById(
    "elementoSeleccionado"
  );
  const mensajeRuleta = document.getElementById("mensajeRuleta");

  // Inicialización
  inicializarRuleta();

  // Agregar listeners de eventos
  agregarEventListeners();

  // Funciones principales
  function inicializarRuleta() {
    // Cargar elementos desde el textarea
    cargarElementosDesdeTextArea();

    // Dibujar la ruleta inicial
    dibujarRuleta();
  }

  function agregarEventListeners() {
    // F3: Eventos para girar la ruleta
    ruletaCanvas.addEventListener("click", girarRuleta);
    mensajeRuleta.addEventListener("click", girarRuleta);
    btnIniciar.addEventListener("click", girarRuleta);

    // F8: Reiniciar la ruleta
    btnReiniciar.addEventListener("click", reiniciarRuleta);

    // F4, F5, F7: Eventos para el textarea
    elementosTextArea.addEventListener("click", habilitarEdicion);
    btnEditar.addEventListener("click", habilitarEdicion);
    elementosTextArea.addEventListener("input", actualizarRuletaDesdeTxtArea);

    // F6: Ocultar elemento seleccionado
    btnEsconder.addEventListener("click", ocultarElementoSeleccionado);

    // Eventos de teclado
    document.addEventListener("keydown", manejarTeclas);

    // Título (no especificado en requisitos pero está en la UI)
    btnTitulo.addEventListener("click", cambiarTitulo);
  }

  // F1 y F2: Dibujar la ruleta con sus sectores y colores
  function dibujarRuleta() {
    // Obtener elementos visibles (no ocultos)
    const elementosVisibles = elementosRuleta.filter(
      (elem) => !elementosOcultos.includes(elem)
    );

    // Si no hay elementos, dibujar círculo vacío
    if (elementosVisibles.length === 0) {
      ctx.clearRect(0, 0, ruletaCanvas.width, ruletaCanvas.height);
      ctx.beginPath();
      ctx.arc(
        ruletaCanvas.width / 2,
        ruletaCanvas.height / 2,
        180,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "#EEEEEE";
      ctx.fill();
      ctx.stroke();
      mensajeRuleta.textContent = "No hay elementos";
      return;
    }

    // Limpiar el canvas
    ctx.clearRect(0, 0, ruletaCanvas.width, ruletaCanvas.height);

    // Calcular el ángulo para cada sector
    const anguloSector = (Math.PI * 2) / elementosVisibles.length;

    // Dibujar cada sector de la ruleta
    elementosVisibles.forEach((elemento, index) => {
      // Calcular ángulos para este sector
      const startAngle = anguloActual + index * anguloSector;
      const endAngle = startAngle + anguloSector;

      // Dibujar sector
      ctx.beginPath();
      ctx.moveTo(ruletaCanvas.width / 2, ruletaCanvas.height / 2);
      ctx.arc(
        ruletaCanvas.width / 2,
        ruletaCanvas.height / 2,
        180,
        startAngle,
        endAngle
      );
      ctx.closePath();

      // Asignar color (repite colores si hay más de 5 elementos)
      ctx.fillStyle = COLORES_RULETA[index % COLORES_RULETA.length];
      ctx.fill();
      ctx.stroke();

      // Agregar texto del elemento
      const textAngle = startAngle + anguloSector / 2;
      const textX = ruletaCanvas.width / 2 + Math.cos(textAngle) * 130;
      const textY = ruletaCanvas.height / 2 + Math.sin(textAngle) * 130;

      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2);
      ctx.fillStyle = "black";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.fillText(elemento, 0, 0);
      ctx.restore();
    });

    // Dibujar círculo central
    ctx.beginPath();
    ctx.arc(
      ruletaCanvas.width / 2,
      ruletaCanvas.height / 2,
      50,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "#333333";
    ctx.fill();

    // Actualizar mensaje
    mensajeRuleta.textContent = estaGirando
      ? "girando..."
      : "haz clic para girarlo";
  }

  // F3: Girar la ruleta aleatoriamente
  function girarRuleta() {
    // Evitar múltiples giros simultáneos
    if (estaGirando) return;

    const elementosVisibles = elementosRuleta.filter(
      (elem) => !elementosOcultos.includes(elem)
    );

    // Verificar si hay elementos para girar
    if (elementosVisibles.length === 0) {
      elementoSeleccionadoDiv.textContent = "No hay elementos disponibles";
      return;
    }

    // Configurar animación
    estaGirando = true;
    mensajeRuleta.textContent = "girando...";

    // Generar ángulo aleatorio para el giro (entre 5 y 10 vueltas)
    const vueltas = 5 + Math.random() * 5;
    const anguloFinal = anguloActual + Math.PI * 2 * vueltas;

    // Determinar duración del giro (entre 3 y 5 segundos)
    const duracion = 3000 + Math.random() * 2000;
    const tiempoInicio = performance.now();    // Función de animación del giro
    function animarGiro(tiempoActual) {
      // Calcular progreso de la animación
      const tiempoTranscurrido = tiempoActual - tiempoInicio;
      const progreso = Math.min(tiempoTranscurrido / duracion, 1);

      // Función de easing para desacelerar gradualmente
      const progresoEasing = 1 - Math.pow(1 - progreso, 3);

      // Calcular ángulo actual según el progreso
      anguloActual =
        anguloActual + (anguloFinal - anguloActual) * progresoEasing;

      // Calcular y mostrar el elemento seleccionado en tiempo real
      if (progreso > 0.95) { // Cuando está cerca del final
        const anguloNormalizado = anguloActual % (Math.PI * 2);
        const anguloPuntero = -Math.PI / 2;
        const anguloSector = (Math.PI * 2) / elementosVisibles.length;
        const sectorSeleccionado = Math.floor(((anguloPuntero - anguloNormalizado) / anguloSector) % elementosVisibles.length);
        elementoSeleccionadoIndex = (sectorSeleccionado + elementosVisibles.length) % elementosVisibles.length;
        elementoSeleccionadoDiv.textContent = elementosVisibles[elementoSeleccionadoIndex];
      }

      // Dibujar la ruleta con el nuevo ángulo
      dibujarRuleta();

      // Continuar la animación si no ha terminado
      if (progreso < 1) {
        requestAnimationFrame(animarGiro);
      } else {
        finalizarGiro(elementosVisibles);
      }
    }

    // Iniciar animación
    requestAnimationFrame(animarGiro);
  }
  // Finalizar el giro y mostrar el resultado
  function finalizarGiro(elementosVisibles) {
    estaGirando = false;

    // Normalizar el ángulo final
    anguloActual = anguloActual % (Math.PI * 2);

    // El elemento ya debería estar mostrado por la animación
    // Solo actualizamos el estado final y el mensaje

    // Actualizar estado visual
    dibujarRuleta();

    // Actualizar mensaje
    mensajeRuleta.textContent = "haz clic para girarlo";

    console.log(
      "Elemento seleccionado:",
      elementoSeleccionado,
      "Índice:",
      elementoSeleccionadoIndex
    );
  }

  // F4, F5: Cargar y actualizar elementos desde el textarea
  function cargarElementosDesdeTextArea() {
    const texto = elementosTextArea.value.trim();
    if (texto) {
      elementosRuleta = texto.split("\n").filter((item) => item.trim() !== "");
    } else {
      elementosRuleta = [];
    }
    console.log("Elementos cargados:", elementosRuleta);
  }

  // F5: Actualizar la ruleta cuando cambia el textarea
  function actualizarRuletaDesdeTxtArea() {
    if (!modoEdicion) return;

    cargarElementosDesdeTextArea();
    dibujarRuleta();
  }

  // F7: Habilitar edición del textarea
  function habilitarEdicion() {
    modoEdicion = true;
    elementosTextArea.readOnly = false;
    elementosTextArea.focus();
    console.log("Modo edición habilitado");
  }

  // F6: Ocultar el elemento seleccionado
  function ocultarElementoSeleccionado() {
    if (elementoSeleccionadoIndex === -1 || !elementosRuleta.length) return;

    const elementosVisibles = elementosRuleta.filter(
      (elem) => !elementosOcultos.includes(elem)
    );
    if (elementoSeleccionadoIndex >= elementosVisibles.length) return;

    const elementoSeleccionado = elementosVisibles[elementoSeleccionadoIndex];

    // Agregar el elemento a la lista de ocultos si no está ya
    if (!elementosOcultos.includes(elementoSeleccionado)) {
      elementosOcultos.push(elementoSeleccionado);
    }

    // Actualizar el textarea para marcar el elemento como oculto
    resaltarElementosOcultos();

    // Redibujar la ruleta sin el elemento oculto
    dibujarRuleta();

    console.log("Elemento ocultado:", elementoSeleccionado);
  }

  // Resaltar elementos ocultos en el textarea
  function resaltarElementosOcultos() {
    // Crear un textarea temporal para manipular el contenido
    const tempTextArea = document.createElement("div");
    tempTextArea.innerHTML = elementosTextArea.value
      .split("\n")
      .map((linea) => {
        const elemento = linea.trim();
        if (elementosOcultos.includes(elemento)) {
          return `<span class="elemento-oculto">${linea}</span>`;
        }
        return linea;
      })
      .join("<br>");

    // Reemplazar el contenido del textarea
    const nuevoTexto = tempTextArea.innerText;
    elementosTextArea.value = nuevoTexto;
  }

  // F8: Reiniciar la ruleta y mostrar todos los elementos
  function reiniciarRuleta() {
    elementosOcultos = [];
    elementoSeleccionadoIndex = -1;
    elementoSeleccionadoDiv.textContent = "";

    // Recargar elementos desde textarea
    cargarElementosDesdeTextArea();

    // Redibujar la ruleta
    dibujarRuleta();

    console.log("Ruleta reiniciada");
  }

  // F9: Pantalla completa
  function alternarPantallaCompleta() {
    const container = document.querySelector(".container");

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
      container.classList.add("fullscreen");
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      container.classList.remove("fullscreen");
    }
  }

  // Cambiar el título (no especificado en requisitos pero está en la UI)
  function cambiarTitulo() {
    const nuevoTitulo = prompt(
      "Ingrese un nuevo título:",
      "Aula Virtual - Ruleta"
    );
    if (nuevoTitulo !== null && nuevoTitulo.trim() !== "") {
      document.querySelector("h1").textContent = nuevoTitulo;
    }
  }

  // Función para manejar teclas
  function manejarTeclas(evento) {
    switch (evento.key) {
      case " ": // F3: SPACE para girar la ruleta
        evento.preventDefault();
        girarRuleta();
        break;
      case "s": // F6: S para ocultar el elemento seleccionado
      case "S":
        evento.preventDefault();
        ocultarElementoSeleccionado();
        break;
      case "r": // F8: R para reiniciar
      case "R":
        evento.preventDefault();
        reiniciarRuleta();
        break;
      case "e": // F7: E para editar
      case "E":
        evento.preventDefault();
        habilitarEdicion();
        break;
      case "f": // F9: F para pantalla completa
      case "F":
        evento.preventDefault();
        alternarPantallaCompleta();
        break;
    }
  }
});
