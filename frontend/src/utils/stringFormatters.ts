export const toTitleCase = (str: string) => {
  if (!str) return '';
  const preposicoes = ['da', 'de', 'do', 'das', 'dos', 'e'];
  
  return str.toLowerCase().split(' ').map((palavra, index) => {
    if (index !== 0 && preposicoes.includes(palavra)) {
      return palavra;
    }
    return palavra.charAt(0).toUpperCase() + palavra.slice(1);
  }).join(' ');
};

// Remove espaços duplos e espaços no começo/fim (Higiene básica)
export const sanitizeString = (str: string) => {
  if (!str) return '';
  return str.trim().replace(/\s+/g, ' ');
};