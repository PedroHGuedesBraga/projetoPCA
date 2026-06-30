import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Contrato } from '@/types/contrato';
import { Item } from '@/types/item';

interface ContratoPDFProps {
  contrato: Contrato;
  itens: Item[];
  logo?: string | null;
  secretariaNome?: string;
}

const BLUE = '#1a4d99';
const GREEN = '#2d7a27';
const GOLD = '#f0c040';
const LIGHT_BLUE = '#eef3fb';
const GRAY = '#6b7280';
const DARK = '#1f2937';

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, color: DARK, backgroundColor: '#ffffff' },

  headerWrapper: { flexDirection: 'column' },
  header: { backgroundColor: BLUE, paddingVertical: 18, paddingRight: 30, paddingLeft: 0, flexDirection: 'row', alignItems: 'center' },
  headerStrip: { backgroundColor: GREEN, width: 10, alignSelf: 'stretch', marginRight: 18 },
  headerGoldLine: { backgroundColor: GOLD, height: 3 },
  logo: { width: 55, height: 55, marginRight: 14 },
  headerTextBlock: { flex: 1 },
  headerTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  headerSubtitle: { fontSize: 9, color: '#b8d4f0', marginTop: 3 },

  body: { paddingHorizontal: 30, paddingVertical: 20 },

  infoBox: { backgroundColor: LIGHT_BLUE, borderRadius: 4, padding: 12, marginBottom: 20 },
  infoTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: BLUE, marginBottom: 8 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  infoItem: { width: '50%', marginBottom: 5 },
  infoLabel: { fontSize: 8, color: GRAY, fontFamily: 'Helvetica-Bold', marginBottom: 1 },
  infoValue: { fontSize: 10, color: DARK },

  tableTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: BLUE, marginBottom: 8 },
  table: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 4, overflow: 'hidden' },

  tableHeader: { flexDirection: 'row', backgroundColor: BLUE, paddingVertical: 7, paddingHorizontal: 8 },
  tableHeaderCell: { color: '#ffffff', fontFamily: 'Helvetica-Bold', fontSize: 8 },

  tableRow: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  tableRowAlt: { backgroundColor: '#f9fafb' },
  tableCell: { fontSize: 8, color: DARK },

  colNome: { flex: 2.5 },
  colQtd: { width: 40 },
  colUnidade: { width: 65 },
  colAprovado: { width: 55, textAlign: 'center' },

  footer: { position: 'absolute', bottom: 20, left: 30, right: 30, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 7, color: '#9ca3af' },
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const [year, month, day] = dateStr.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
};

const statusLabel: Record<string, string> = {
  aprovado: 'APROVADO',
  andamento: 'EM ANDAMENTO',
  urgente: 'URGENTE',
  rascunho: 'RASCUNHO',
};

export function ContratoPDF({ contrato, itens, logo, secretariaNome }: ContratoPDFProps) {
  const geradoEm = new Date().toLocaleString('pt-BR');

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* CABEÇALHO */}
        <View style={styles.headerWrapper}>
          <View style={styles.header}>
            <View style={styles.headerStrip} />
            {logo && <Image src={logo} style={styles.logo} />}
            <View style={styles.headerTextBlock}>
              <Text style={styles.headerTitle}>PREFEITURA DE NAZAREZINHO</Text>
              {secretariaNome && <Text style={styles.headerSubtitle}>{secretariaNome}</Text>}
              <Text style={[styles.headerSubtitle, { marginTop: 6 }]}>Sistema de Gestão de Contratos — PCA</Text>
            </View>
          </View>
          <View style={styles.headerGoldLine} />
        </View>

        <View style={styles.body}>

          {/* INFORMAÇÕES DO CONTRATO */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>{contrato.nome}</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>DATA DO CONTRATO</Text>
                <Text style={styles.infoValue}>{formatDate(contrato.data)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>STATUS</Text>
                <Text style={styles.infoValue}>{statusLabel[contrato.status] || contrato.status.toUpperCase()}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>TOTAL DE ITENS</Text>
                <Text style={styles.infoValue}>{itens.length}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>SITUAÇÃO</Text>
                <Text style={styles.infoValue}>{contrato.aprovado ? 'Aprovado' : 'Pendente de aprovação'}</Text>
              </View>
              {contrato.codigoRastreio && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>CÓDIGO DE RASTREIO</Text>
                  <Text style={[styles.infoValue, { fontFamily: 'Helvetica-Bold', color: BLUE }]}>{contrato.codigoRastreio}</Text>
                </View>
              )}
            </View>
          </View>

          {/* TABELA DE ITENS */}
          <Text style={styles.tableTitle}>Itens do Contrato</Text>
          <View style={styles.table}>

            {/* HEADER DA TABELA */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colNome]}>NOME</Text>
              <Text style={[styles.tableHeaderCell, styles.colQtd]}>QTD</Text>
              <Text style={[styles.tableHeaderCell, styles.colUnidade]}>UNIDADE</Text>
              <Text style={[styles.tableHeaderCell, styles.colAprovado]}>APROVADO</Text>
            </View>

            {/* LINHAS */}
            {itens.length === 0 ? (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', color: GRAY }]}>Nenhum item cadastrado</Text>
              </View>
            ) : (
              itens.map((item, index) => (
                <View key={item.id} style={[styles.tableRow, index % 2 !== 0 ? styles.tableRowAlt : {}]}>
                  <Text style={[styles.tableCell, styles.colNome]}>{item.nome}</Text>
                  <Text style={[styles.tableCell, styles.colQtd]}>{item.quantidadeItem}</Text>
                  <Text style={[styles.tableCell, styles.colUnidade]}>{item.unidadeDeMedida}</Text>
                  <Text style={[styles.tableCell, styles.colAprovado, { textAlign: 'center' }]}>{item.aprovado ? 'Sim' : 'Não'}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* RODAPÉ */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Sistema PCA — Prefeitura de Nazarezinho</Text>
          <Text style={styles.footerText}>Gerado em: {geradoEm}</Text>
        </View>

      </Page>
    </Document>
  );
}
