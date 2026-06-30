export interface Theme {
  nome: string;
  corPrimaria: string;
  corSecundaria: string;
  logoTipo: 'prefeitura';
  headerBackground?: string;
  headerBorder?: string;
}

export const themes: Record<string, Theme> = {
  prefeitura: {
    nome: "Prefeitura de Nazarezinho",
    corPrimaria: "#1a4d99",
    corSecundaria: "#2d7a27",
    logoTipo: "prefeitura",
    headerBackground: "linear-gradient(90deg, #2d7a27 0%, #1a4d99 100%)",
    headerBorder: "3px solid #f0c040",
  },
};

export function getTheme(): Theme {
  return themes.prefeitura;
}
