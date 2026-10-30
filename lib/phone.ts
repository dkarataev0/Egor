/** Маска +7 (XXX) XXX-XX-XX. Принимает любой ввод, в том числе вставку 8… и +7… */
export function formatPhone(input: string): string {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("8") || d.startsWith("7")) d = d.slice(1);
  d = d.slice(0, 10);
  if (!d) return input.trim().startsWith("+") ? "+7" : "";
  let out = "+7";
  if (d.length > 0) out += " (" + d.slice(0, 3);
  if (d.length >= 3) out += ")";
  if (d.length > 3) out += " " + d.slice(3, 6);
  if (d.length > 6) out += "-" + d.slice(6, 8);
  if (d.length > 8) out += "-" + d.slice(8, 10);
  return out;
}

export const phoneDigits = (s: string) => {
  const d = s.replace(/\D/g, "");
  return d.length === 11 ? d.slice(1) : d.slice(-10);
};

export const isValidPhone = (s: string) => /^[3-9]\d{9}$/.test(phoneDigits(s));
