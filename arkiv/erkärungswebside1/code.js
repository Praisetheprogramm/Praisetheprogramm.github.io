// Darkmode Umschalten
const toggleBtn = document.getElementById('toggle-theme');
toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

function toggleMenu() {
  document.getElementById("menu").classList.toggle("show");
}
window.onclick = function(e) {
  if (!e.target.matches('.dropdown button')) {
    document.getElementById("menu").classList.remove("show");
    }
}
