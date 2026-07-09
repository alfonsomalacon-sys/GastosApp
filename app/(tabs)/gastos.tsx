import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Alert, Modal, ScrollView, StyleSheet,
    Text, TextInput, TouchableOpacity, View
} from 'react-native';
import {
    CATEGORIAS, deleteGasto, Gasto, getGastos, getMeses,
    getResumenMensualPorGrupo, GRUPOS, MESES_NOMBRES, updateGasto
} from '../../storage';

const TIPO_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  F: { bg: '#E6F1FB', text: '#185FA5', label: 'Fijo' },
  V: { bg: '#EAF3DE', text: '#3B6D11', label: 'Variable' },
  D: { bg: '#FAEEDA', text: '#854F0B', label: 'Discrecional' },
};

const MESES_A_MOSTRAR_EN_GRAFICA = 6;
const ALTURA_MAX_BARRA = 120;

function nombreMes(ym: string) {
  const [year, month] = ym.split('-');
  return `${MESES_NOMBRES[month]} ${year}`;
}

function nombreMesCorto(ym: string) {
  const [, month] = ym.split('-');
  return MESES_NOMBRES[month].slice(0, 3);
}

function formatoCompacto(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toLocaleString('es-MX')}`;
}

export default function Gastos() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [editando, setEditando] = useState<Gasto | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState('');

  useFocusEffect(
    useCallback(() => {
      getGastos().then(setGastos);
    }, [])
  );

  const mesActual = new Date().toISOString().slice(0, 7);
  const gastosMesActual = gastos.filter(g => g.fecha.startsWith(mesActual));
  const totalMesActual = gastosMesActual.reduce((s, g) => s + g.monto, 0);

  const meses = getMeses(gastos); // desc: más reciente primero

  const resumenMensual = getResumenMensualPorGrupo(gastos).slice(-MESES_A_MOSTRAR_EN_GRAFICA);
  const maxTotalMensual = Math.max(...resumenMensual.map(r => r.total), 1);

  function abrirEditar(g: Gasto) {
    setEditando(g);
    setDescripcion(g.descripcion);
    setMonto(g.monto.toString());
    setFecha(g.fecha);
  }

  async function guardarEdicion() {
    if (!editando) return;
    await updateGasto(editando.id, {
      ...editando,
      descripcion,
      monto: parseFloat(monto),
      fecha,
    });
    setEditando(null);
    getGastos().then(setGastos);
  }

  function confirmarEliminar(id: string) {
    Alert.alert('Eliminar gasto', '¿Seguro que quieres eliminarlo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          await deleteGasto(id);
          getGastos().then(setGastos);
        }
      }
    ]);
  }

  const catEmoji: Record<string, string> = {};
  CATEGORIAS.forEach(c => { catEmoji[c.nombre] = c.emoji; });

  function renderItem(g: Gasto) {
    const t = TIPO_COLORS[g.tipo] || TIPO_COLORS.F;
    return (
      <TouchableOpacity
        key={g.id}
        style={s.item}
        onPress={() => abrirEditar(g)}
        onLongPress={() => confirmarEliminar(g.id)}
      >
        <View style={s.itemLeft}>
          <Text style={s.itemEmoji}>{catEmoji[g.categoria] || '💰'}</Text>
        </View>
        <View style={s.itemInfo}>
          <Text style={s.itemName}>{g.descripcion}</Text>
          <Text style={s.itemMeta}>{g.categoria}{g.subcategoria ? ` · ${g.subcategoria}` : ''}</Text>
          <Text style={s.itemFecha}>{g.fecha}</Text>
        </View>
        <View style={s.itemRight}>
          <Text style={s.itemMonto}>${g.monto.toLocaleString('es-MX')}</Text>
          <View style={[s.badge, { backgroundColor: t.bg }]}>
            <Text style={[s.badgeText, { color: t.text }]}>{t.label}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerSub}>Gasto de {nombreMes(mesActual)}</Text>
        <Text style={s.headerTotal}>${totalMesActual.toLocaleString('es-MX')} MXN</Text>
        <Text style={s.headerCount}>{gastosMesActual.length} transacciones este mes</Text>
      </View>

      <ScrollView style={s.list}>
        {gastos.length === 0 && (
          <Text style={s.empty}>Aún no hay gastos registrados.</Text>
        )}

        {meses.map(mes => {
          const gastosDelMes = gastos.filter(g => g.fecha.startsWith(mes));
          const totalDelMes = gastosDelMes.reduce((s, g) => s + g.monto, 0);
          return (
            <View key={mes} style={s.mesGrupo}>
              <View style={s.mesHeader}>
                <Text style={s.mesHeaderTitulo}>{nombreMes(mes)}</Text>
                <Text style={s.mesHeaderTotal}>${totalDelMes.toLocaleString('es-MX')}</Text>
              </View>
              {gastosDelMes.map(renderItem)}
            </View>
          );
        })}

        {resumenMensual.length > 0 && (
          <View style={s.chartSection}>
            <Text style={s.sectionLabel}>GASTOS MENSUALES</Text>
            <View style={s.chartCard}>
              <View style={s.chartArea}>
                {resumenMensual.map(r => (
                  <View key={r.mes} style={s.barColumn}>
                    <Text style={s.barTotal}>{formatoCompacto(r.total)}</Text>
                    <View style={s.barTrack}>
                      <View style={s.barStack}>
                        {GRUPOS.map(gr => {
                          const val = r.porGrupo[gr.id] || 0;
                          if (val <= 0) return null;
                          const altura = (val / maxTotalMensual) * ALTURA_MAX_BARRA;
                          return (
                            <View
                              key={gr.id}
                              style={{ height: altura, backgroundColor: gr.color }}
                            />
                          );
                        })}
                      </View>
                    </View>
                    <Text style={s.barLabel}>{nombreMesCorto(r.mes)}</Text>
                  </View>
                ))}
              </View>
              <View style={s.legend}>
                {GRUPOS.map(gr => (
                  <View key={gr.id} style={s.legendItem}>
                    <View style={[s.legendDot, { backgroundColor: gr.color }]} />
                    <Text style={s.legendText}>{gr.nombre}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        <Text style={s.hint}>Toca para editar · Mantén presionado para eliminar</Text>
      </ScrollView>

      <Modal visible={!!editando} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Editar gasto</Text>
            <Text style={s.label}>DESCRIPCIÓN</Text>
            <TextInput style={s.input} value={descripcion} onChangeText={setDescripcion} />
            <Text style={s.label}>MONTO (MXN)</Text>
            <TextInput style={s.input} value={monto} onChangeText={setMonto} keyboardType="numeric" />
            <Text style={s.label}>FECHA</Text>
            <TextInput style={s.input} value={fecha} onChangeText={setFecha} placeholder="YYYY-MM-DD" />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <TouchableOpacity style={[s.btn, { flex: 1, backgroundColor: '#ccc' }]} onPress={() => setEditando(null)}>
                <Text style={[s.btnText, { color: '#333' }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btn, { flex: 1 }]} onPress={guardarEdicion}>
                <Text style={s.btnText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  header: { backgroundColor: '#1A1A2E', padding: 16, paddingBottom: 20 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 2 },
  headerTotal: { fontSize: 28, fontWeight: '500', color: '#fff' },
  headerCount: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  list: { flex: 1, padding: 12 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 },
  mesGrupo: { marginBottom: 16 },
  mesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  mesHeaderTitulo: { fontSize: 13, fontWeight: '600', color: '#555', letterSpacing: 0.3 },
  mesHeaderTotal: { fontSize: 13, fontWeight: '600', color: '#534AB7' },
  item: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 0.5, borderColor: '#e0e0e0', padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  itemLeft: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  itemEmoji: { fontSize: 18 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '500', color: '#222' },
  itemMeta: { fontSize: 11, color: '#888', marginTop: 2 },
  itemFecha: { fontSize: 11, color: '#aaa', marginTop: 1 },
  itemRight: { alignItems: 'flex-end', gap: 4 },
  itemMonto: { fontSize: 14, fontWeight: '500', color: '#222' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 10, fontWeight: '500' },
  chartSection: { marginTop: 4, marginBottom: 8 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#888',
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    padding: 16,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  barColumn: { alignItems: 'center', flex: 1 },
  barTotal: { fontSize: 10, color: '#666', marginBottom: 4 },
  barTrack: {
    height: ALTURA_MAX_BARRA,
    width: 26,
    justifyContent: 'flex-end',
  },
  barStack: {
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'column-reverse',
  },
  barLabel: { fontSize: 11, color: '#888', marginTop: 6 },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 0.5,
    borderTopColor: '#eee',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendText: { fontSize: 11, color: '#666' },
  hint: { textAlign: 'center', color: '#ccc', fontSize: 11, marginTop: 8, marginBottom: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, margin: 12 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#222', marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '500', color: '#888', letterSpacing: 0.5, marginBottom: 6 },
  input: { backgroundColor: '#f8f8f8', borderWidth: 0.5, borderColor: '#e0e0e0', borderRadius: 8, padding: 12, fontSize: 15, marginBottom: 12 },
  btn: { backgroundColor: '#534AB7', borderRadius: 10, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '500' },
});
