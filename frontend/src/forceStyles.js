// ПРИНУДИТЕЛЬНАЯ УСТАНОВКА СТИЛЕЙ
export const forceStyles = () => {
  // Применяем стили к body
  document.body.style.cssText = `
    margin: 0 !important;
    padding: 20px !important;
    background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%) !important;
    background-attachment: fixed !important;
    min-height: 100vh !important;
    color: #ffffff !important;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
    overflow-x: hidden !important;
  `;
  
  // Применяем стили к root
  const root = document.getElementById('root');
  if (root) {
    root.style.cssText = `
      position: relative;
      z-index: 1;
    `;
  }
  
  console.log('✅ СТИЛИ ПРИНУДИТЕЛЬНО ПРИМЕНЕНЫ!');
};
