export const applyAntiInspect = () => {
  // Só roda em produção! Assim você, como dev, não perde acesso no localhost.
  if (import.meta.env.MODE !== 'production') return;

  // Bloqueia o Botão Direito
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // Bloqueia Atalhos de Teclado Clássicos
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') e.preventDefault();
    // Ctrl + Shift + I (Inspecionar)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') e.preventDefault();
    // Ctrl + Shift + J (Console)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') e.preventDefault();
    // Ctrl + Shift + C (Selecionar Elemento)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') e.preventDefault();
    // Ctrl + U (Ver Código Fonte)
    if (e.ctrlKey && e.key === 'U') e.preventDefault();
  });
};