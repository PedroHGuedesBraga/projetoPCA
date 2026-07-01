import api from "@/services/api";

export interface Aprovado {
  id: string;
  nomeEmpresa: string;
  dataContrato: string;
  documentoPath: string;
  createdAt: string;
}

const aprovadoService = {
  getAll: async (): Promise<Aprovado[]> => {
    const res = await api.get("/aprovado");
    return res.data;
  },

  getById: async (id: string): Promise<Aprovado> => {
    const res = await api.get(`/aprovado/${id}`);
    return res.data;
  },

  upload: async (nomeEmpresa: string, dataContrato: string, file: File): Promise<Aprovado> => {
    const formData = new FormData();
    formData.append("nomeEmpresa", nomeEmpresa);
    formData.append("dataContrato", dataContrato);
    formData.append("documento", file);
    const res = await api.post("/aprovado", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  downloadDocumento: async (id: string, nomeEmpresa: string): Promise<void> => {
    const res = await api.get(`/aprovado/documento/${id}`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${nomeEmpresa}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default aprovadoService;
