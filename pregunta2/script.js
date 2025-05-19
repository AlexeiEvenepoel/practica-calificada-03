const participantsInput = document.getElementById("participants");
const charCount = document.getElementById("charCount");
const generarBtn = document.getElementById("generar");
const limpiarBtn = document.getElementById("limpiar");
const resultadoDiv = document.getElementById("resultado");
const accionesDiv = document.getElementById("acciones");

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
    .filter(p => p !== "")
    .slice(0, 100); // máximo 100

  const modo = document.querySelector('input[name="division"]:checked').value;
  const valor = parseInt(document.getElementById("divisionValue").value);
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
    div.innerHTML = `<h3>${titulo} - Equipo ${i + 1}</h3><ul>${equipo.map(p => `<li>${p}</li>`).join("")}</ul>`;
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
  const div = document.getElementById("resultado");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="600">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,sans-serif">
        ${div.outerHTML}
      </div>
    </foreignObject>
  </svg>`;

  const blob = new Blob([svg], {type: "image/svg+xml;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const img = new Image();

  img.onload = function () {
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    canvas.toBlob(function(blob) {
      const link = document.createElement("a");
      link.download = "equipos.jpg";
      link.href = URL.createObjectURL(blob);
      link.click();
    }, "image/jpeg");
  };

  img.src = url;
}
