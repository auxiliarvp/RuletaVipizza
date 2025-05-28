// ruleta.js
// Asegúrate de tener SweetAlert2 y canvas-confetti cargados antes en tu HTML.

document.addEventListener("DOMContentLoaded", () => {
  const lis     = Array.from(document.querySelectorAll('.premios-list li'));
  const premios = lis.map(li => li.textContent.trim());
  const N       = premios.length;             // 10 segmentos
  const degSeg  = 360 / N;

  const ruleta   = document.getElementById("ruleta");
  const girarBtn = document.getElementById("girarBtn");

  let girando    = false;
  let anguloBase = 0;

  function getRotationAngle(el) {
    const tr = getComputedStyle(el).transform;
    if (tr === "none") return 0;
    const [a, b] = tr.match(/matrix\((.+)\)/)[1].split(",").map(Number);
    let ang = Math.round(Math.atan2(b, a) * 180/Math.PI);
    return ang < 0 ? ang + 360 : ang;
  }

  // Lleva cuántas veces salió cada premio
  const counts = Array(N).fill(0);

  girarBtn.addEventListener("click", () => {
    if (girando) return;
    girando = true;
    girarBtn.disabled = true;

    const randomAng = Math.random() * 360;
    const vueltas   = 5 + Math.floor(Math.random() * 3);
    const deltaDeg  = vueltas * 360 + (180 - randomAng);

    // reset sin animación
    ruleta.style.transition = "none";
    ruleta.style.transform  = `rotate(${anguloBase}deg)`;
    void ruleta.offsetWidth;

    // con transición CSS
    ruleta.style.transition = "";
    ruleta.style.transform  = `rotate(${anguloBase + deltaDeg}deg)`;
  });

  ruleta.addEventListener("transitionend", () => {
    // 1) Actualiza base
    const finalAng = getRotationAngle(ruleta);
    anguloBase     = finalAng;

    // 2) calcula índice
    let raw = (180 - finalAng + 360) % 360;
    const idx = Math.floor(raw / degSeg);

    // 3) Si ya salió 2 veces → tentativa inválida
    if (counts[idx] >= 2) {
      lis[idx].classList.add('unavailable');
      Swal.fire({
        icon: 'warning',
        title: 'Premio no disponible',
        text: 'Tienes otro intento.',
        confirmButtonText: 'OK'
      }).then(() => {
        girando = false;
        girarBtn.disabled = false;
      });
      return;
    }

    // 4) Premio válido: contamos y tachamos si llegó a 2
    counts[idx]++;
    if (counts[idx] === 2) {
      lis[idx].classList.add('unavailable');
    }

    // 5) Mostramos premio con confeti
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
        confetti({ particleCount: 300, spread: 60, origin: { y: 0.4 } });
      }
    }).then(() => {
      // 6) Tras cerrar, comprobamos si ya no queda ninguno disponible
      const todosTachados = lis.every(li => li.classList.contains('unavailable'));
      if (todosTachados) {
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
              🎊 Gracias por participar en la Ruleta Vipizza
            </div>
          `,
          showConfirmButton: false,
          timer: 3000,
          didOpen: () => {
            confetti({ particleCount: 500, spread: 100, origin: { y: 0.4 } });
          }
        });
        // deshabilitar definitivamente
        girarBtn.disabled = true;
      } else {
        // 7) si quedan premios, reactivar botón
        girando = false;
        girarBtn.disabled = false;
      }
    });
  });
});
