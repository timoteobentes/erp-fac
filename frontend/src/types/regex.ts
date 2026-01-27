export const validateEmail = (email: string) => {
  const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return regex.test(email);
};

export const maskRegexCNPJ = (value: string) => {
  const maskedValue = value.replace(/\D/g, "")
                            .replace(/^(\d{2})(\d)/, "$1.$2")
                            .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
                            .replace(/\.(\d{3})(\d)/, ".$1/$2")
                            .replace(/(\d{4})(\d)/, "$1-$2")
                            .slice(0, 18);
  return maskedValue
}

export const maskRegexCPF = (value: string) => {
  const maskedValue = value?.replace(/\D/g, "")
                            ?.replace(/(\d{3})(\d)/, "$1.$2")
                            ?.replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
                            ?.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
                            ?.slice(0, 14);
  return maskedValue
}

export const maskRegexPhone = (value: string) => {
  const maskedValue = value.replace(/\D/g, "")
                            .replace(/^(\d{2})(\d)/g, "($1) $2")
                            .replace(/(\d{5})(\d)/, "$1-$2")
                            .slice(0, 15);
  return maskedValue;
}

export const maskRegexCEP = (value: string) => {
  const maskedValue = value.replace(/\D/g, "")
                            .replace(/^(\d{5})(\d)/, "$1-$2")
                            .slice(0, 9);
  return maskedValue;
}

export const maskRegexRG = (value: string) => {
  const maskedValue = value.replace(/\D/g, "")
                            .replace(/^(\d{7})(\d)/, "$1-$2")
                            .slice(0, 9);
  return maskedValue;
}