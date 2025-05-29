
document.addEventListener("DOMContentLoaded", () => {
  // 1) Leemos los textos de los premios desde el DOM
  const premios = Array.from(
    document.querySelectorAll('.premios-list li')
  ).map(li => li.textContent.trim());
  const N      = premios.length;        // número de segmentos
  const degSeg = 360 / N;               // ángulo por segmento

  const ruleta   = document.getElementById("ruleta");
  const girarBtn = document.getElementById("girarBtn");

  let girando    = false;
  let anguloBase = 0; // posición actual normalizada [0..360)

  // Función para extraer el ángulo real aplicado al elemento
  function getRotationAngle(el) {
    const tr = getComputedStyle(el).transform;
    if (tr === "none") return 0;
    const [a, b] = tr.match(/matrix\((.+)\)/)[1].split(",").map(Number);
    let ang = Math.round(Math.atan2(b, a) * 180/Math.PI);
    return ang < 0 ? ang + 360 : ang;
  }

  girarBtn.addEventListener("click", () => {
    if (girando) return;
    girando = true;
    girarBtn.disabled = true;

    // Escogemos un ángulo aleatorio y vueltas entre 5 y 7
    const randomAng = Math.random() * 360;
    const vueltas   = 5 + Math.floor(Math.random() * 3);
    const deltaDeg  = vueltas * 360 + (180 - randomAng);

    // Reiniciamos sin animación a la posición base
    ruleta.style.transition = "none";
    ruleta.style.transform  = `rotate(${anguloBase}deg)`;
    void ruleta.offsetWidth; // forzar reflow

    // Con la transición CSS definida (5s), giramos deltaDeg
    ruleta.style.transition = "";
    ruleta.style.transform  = `rotate(${anguloBase + deltaDeg}deg)`;
  });

  ruleta.addEventListener("transitionend", () => {
    // 1) Actualizamos la base al ángulo real final
    const finalAng  = getRotationAngle(ruleta);
    anguloBase      = finalAng;

    // 2) Calculamos la posición relativa al punto de la flecha (180°)
    let raw    = (180 - finalAng + 360) % 360;
    const posInSeg = raw % degSeg;
    const margin   = degSeg * 0.1;   // 10% de tolerancia

    // 3) Si cae en el límite de un segmento, pedimos que intente de nuevo
    if (posInSeg < margin || posInSeg > degSeg - margin) {
      Swal.fire({
        icon: 'info',
        title: '¡Casi…!',
        text: 'Vuelve a intentarlo',
        confirmButtonText: 'OK'
      }).then(() => {
        girando = false;
        girarBtn.disabled = false;
      });
      return;
    }

    // 4) Si no, determinamos el índice y mostramos el premio
    const idx        = Math.floor(raw / degSeg);
    const premioText = premios[idx];

    Swal.fire({
      background: '#fff',
      html: `
        <div style="
          font-size: 2.5rem;
          font-weight: 800;
          color: #ff7043;
          text-align: center;
          text-transform: uppercase;
        ">
          🎉 ¡PREMIO!<br>${premioText}
        </div>
      `,
      confirmButtonText: '¡Genial!',
      didOpen: () => {
        confetti({
          particleCount: 300,
          spread: 60,
          origin: { y: 0.4 }
        });
      }
    }).then(() => {
      girando = false;
      girarBtn.disabled = false;
    });
  });
});
