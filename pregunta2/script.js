const participantsInput = document.getElementById("participants");
const charCount = document.getElementById("charCount");
const generarBtn = document.getElementById("generar");
const limpiarBtn = document.getElementById("limpiar");
const resultadoDiv = document.getElementById("resultado");
const accionesDiv = document.getElementById("acciones");
const select = document.getElementById("divisionValue");
const radios = document.querySelectorAll('input[name="division"]');

participantsInput.addEventListener("input", () => {
  charCount.textContent = participantsInput.value.length;
});

limpiarBtn.addEventListener("click", () => {
  participantsInput.value = "";
  charCount.textContent = "0";
  document.getElementById("titulo").value = "";
  resultadoDiv.classList.add("hidden");
  accionesDiv.classList.add("hidden");
  resultadoDiv.innerHTML = "";
});

generarBtn.addEventListener("click", () => {
  let participantes = participantsInput.value
    .split("\n")
    .map(p => p.trim())
    .filter(p => p.length > 0);

  if (participantes.length > 100) {
    alert("Solo se permiten hasta 100 participantes.");
    return;
  }

  const modo = document.querySelector('input[name="division"]:checked').value;

  // Extraer número del texto del <select>
  const valorTexto = select.options[select.selectedIndex].textContent;
  const valor = parseInt(valorTexto); // ej. "3 equipos ✓" → 3

  const titulo = document.getElementById("titulo").value || "Equipos";

  if (participantes.length === 0) {
    alert("Ingrese al menos un participante.");
    return;
  }

  shuffle(participantes);
  let equipos = [];

  if (modo === "equipos") {
    for (let i = 0; i < valor; i++) equipos.push([]);
    participantes.forEach((p, i) => {
      equipos[i % valor].push(p);
    });
  } else {
    const totalEquipos = Math.ceil(participantes.length / valor);
    for (let i = 0; i < totalEquipos; i++) equipos.push([]);
    participantes.forEach((p, i) => {
      equipos[Math.floor(i / valor)].push(p);
    });
  }

  resultadoDiv.innerHTML = "";
  equipos.forEach((equipo, i) => {
    const div = document.createElement("div");
    div.className = "equipo";
    div.innerHTML = `
      <h3>${titulo} - Equipo ${i + 1}</h3>
      <ul>${equipo.map(p => `<li>${p}</li>`).join("")}</ul>
    `;
    resultadoDiv.appendChild(div);
  });

  resultadoDiv.classList.remove("hidden");
  accionesDiv.classList.remove("hidden");
});

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function copiar() {
  const text = document.getElementById("resultado").innerText;
  navigator.clipboard.writeText(text);
  alert("Equipos copiados al portapapeles.");
}

function copiarColumnas() {
  const equipos = document.querySelectorAll(".equipo ul");
  let cols = [];
  equipos.forEach(ul => {
    const items = [...ul.querySelectorAll("li")].map(li => li.textContent);
    cols.push(items.join("\n"));
  });
  navigator.clipboard.writeText(cols.join("\n\n"));
  alert("Equipos copiados en columnas.");
}

function descargar() {
  const equipos = document.querySelectorAll(".equipo");
  if (equipos.length === 0) {
    alert("Primero genera los equipos.");
    return;
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const padding = 20;
  const columnWidth = 250;
  const rowHeight = 20;
  const maxColumns = 3;

  const totalWidth = (columnWidth + padding) * Math.min(equipos.length, maxColumns);
  const totalRows = Math.ceil(equipos.length / maxColumns);
  let maxItemsPerEquipo = 0;

  equipos.forEach(e => {
    const itemCount = e.querySelectorAll("li").length;
    if (itemCount > maxItemsPerEquipo) maxItemsPerEquipo = itemCount;
  });

  const totalHeight = totalRows * (rowHeight * (maxItemsPerEquipo + 2) + padding);

  canvas.width = totalWidth;
  canvas.height = totalHeight;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "16px Arial";
  ctx.fillStyle = "#333";

  let x = 0, y = 0;

  equipos.forEach((equipo, index) => {
    const titulo = equipo.querySelector("h3").textContent;
    const integrantes = [...equipo.querySelectorAll("li")].map(li => li.textContent);

    const col = index % maxColumns;
    const row = Math.floor(index / maxColumns);

    x = col * (columnWidth + padding) + padding;
    y = row * (rowHeight * (maxItemsPerEquipo + 2) + padding) + padding;

    ctx.fillStyle = "#d52e92";
    ctx.fillRect(x - 5, y - 20, columnWidth - 10, 25);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(titulo, x, y);

    ctx.fillStyle = "#333";
    integrantes.forEach((name, i) => {
      ctx.fillText("• " + name, x, y + (i + 1) * rowHeight);
    });
  });

  const link = document.createElement("a");
  link.download = "equipos.jpg";
  link.href = canvas.toDataURL("image/jpeg");
  link.click();
}


// Generar dinámicamente el menú según el modo
function actualizarOpciones() {
  const modo = document.querySelector('input[name="division"]:checked').value;
  select.innerHTML = "";
  for (let i = 2; i <= 10; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = modo === "equipos" ? `${i} equipos ✓` : `${i} por equipo`;
    select.appendChild(option);
  }
}

actualizarOpciones();
radios.forEach(radio => {
  radio.addEventListener("change", actualizarOpciones);
});
