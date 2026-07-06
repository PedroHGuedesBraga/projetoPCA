import pluginJs from "@eslint/js";
import globals from "globals";

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Configuração padrão para o projeto inteiro (Node.js)
  {
    languageOptions: { 
      globals: {
        ...globals.node,
      }
    }
  },
  
  // Configuração específica para a pasta de testes
  {
    files: ["tests/**/*.js", "tests/**/*.test.js", "**/__tests__/**/*"],
    languageOptions: {
      globals: {
        ...globals.jest, // Isso vai sumir com os erros de 'describe', 'it', 'expect'
      }
    }
  },

  pluginJs.configs.recommended,
];