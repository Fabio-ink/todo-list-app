export function setupResizableFeatures() {
  console.log("Configurando funcionalidades de redimensionamento.");
  const table = document.querySelector("table");

  // Carregar e aplicar larguras salvas das colunas
  const savedColumnWidths = JSON.parse(localStorage.getItem("columnWidths"));
  const headers = table.querySelectorAll("th");

  if (savedColumnWidths) {
    headers.forEach((header, index) => {
      if (savedColumnWidths[index]) {
        header.style.width = savedColumnWidths[index];
      }
    });
  }

  headers.forEach(header => {
    const resizer = document.createElement("div");
    resizer.classList.add("resizer");
    header.appendChild(resizer);
    resizer.addEventListener("mousedown", initColumnResize);
  });

  function initColumnResize(e) {
    e.stopPropagation();
    e.preventDefault();
    const header = e.target.parentElement;
    const startX = e.pageX;
    const startWidth = header.offsetWidth;

    function doDrag(e) {
      const newWidth = startWidth + (e.pageX - startX);
      if (newWidth > 40) {
        header.style.width = `${newWidth}px`;
      }
    }

    function stopDrag() {
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);

      // Salvar as novas larguras no localStorage
      const newWidths = Array.from(headers).map(h => h.style.width || window.getComputedStyle(h).width);
      localStorage.setItem("columnWidths", JSON.stringify(newWidths));
    }

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  }
}
