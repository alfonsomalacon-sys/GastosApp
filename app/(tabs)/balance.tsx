import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CATEGORIAS, Gasto, getGastos, getMeses, MESES_NOMBRES } from '../../storage';

export default function Balance() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().toISOString().slice(0, 7));

  useFocusEffect(
    useCallback(() => {
      getGastos().then(setGastos);
    }, [])
  );

  const meses = getMeses(gastos);
  if (!meses.includes(mesSeleccionado) && meses.length > 0) {
    // no hacer nada, el mes seleccionado puede no tener gastos aún
  }

  const gastosMes = gastos.filter(g => g.fecha.startsWith(mesSeleccionado));
  const totalMes = gastosMes.reduce((s, g) => s + g.monto, 0);

  const porCategoria = CATEGORIAS.map(cat => {
    const items = gastosMes.filter(g => g.categoria === cat.nombre);
    const total = items.reduce((s, g) => s + g.monto, 0);
    return { ...cat, total, count: items.length };
  }).filter(c => c.total > 0);

  const porTipo = {
    F: gastosMes.filter(g => g.tipo === 'F').reduce((s, g) => s + g.monto, 0),
    V: gastosMes.filter(g => g.tipo === 'V').reduce((s, g) => s + g.monto, 0),
    D: gastosMes.filter(g => g.tipo === 'D').reduce((s, g) => s + g.monto, 0),
  };

  const porPago = {
    Efectivo: gastosMes.filter(g => g.formaPago === 'Efectivo').reduce((s, g) => s + g.monto, 0),
    Transferencia: gastosMes.filter(g => g.formaPago === 'Transferencia').reduce((s, g) => s + g.monto, 0),
    Tarjeta: gastosMes.filter(g => g.formaPago === 'Tarjeta').reduce((s, g) => s + g.monto, 0),
  };

  const COLORS = ['#378ADD', '#639922', '#EF9F27', '#534AB7', '#D85A30', '#1D9E75', '#D4537E'];

  function nombreMes(ym: string) {
    const [year, month] = ym.split('-');
    return `${MESES_NOMBRES[month]} ${year}`;
  }

  return (
    <ScrollView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerSub}>Total gastado</Text>
        <Text style={s.headerTotal}>${totalMes.toLocaleString('es-MX')} MXN</Text>
        <Text style={s.headerMes}>{nombreMes(mesSeleccionado)}</Text>
        <View style={s.statsRow}>
          <View style={s.stat}>
            <Text style={s.statLabel}>Fijo</Text>
            <Text style={s.statVal}>${porTipo.F.toLocaleString('es-MX')}</Text>
          </View>
          <View style={s.stat}>
            <Text style={s.statLabel}>Variable</Text>
            <Text style={s.statVal}>${porTipo.V.toLocaleString('es-MX')}</Text>
          </View>
          <View style={s.stat}>
            <Text style={s.statLabel}>Discrecional</Text>
            <Text style={s.statVal}>${porTipo.D.toLocaleString('es-MX')}</Text>
          </View>
        </View>
      </View>

      {/* Selector de mes */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>SELECCIONAR MES</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(meses.length > 0 ? meses : [mesSeleccionado]).map(m => (
            <TouchableOpacity
              key={m}
              style={[s.mesPill, mesSeleccionado === m && s.mesPillActive]}
              onPress={() => setMesSeleccionado(m)}
            >
              <Text style={[s.mesPillText, mesSeleccionado === m && s.mesPillTextActive]}>
                {nombreMes(m)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Por forma de pago */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>POR FORMA DE PAGO</Text>
        <View style={s.pagoRow}>
          <View style={s.pagoCard}>
            <Text style={s.pagoEmoji}>💵</Text>
            <Text style={s.pagoLabel}>Efectivo</Text>
            <Text style={s.pagoVal}>${porPago.Efectivo.toLocaleString('es-MX')}</Text>
          </View>
          <View style={s.pagoCard}>
            <Text style={s.pagoEmoji}>🏦</Text>
            <Text style={s.pagoLabel}>Transferencia</Text>
            <Text style={s.pagoVal}>${porPago.Transferencia.toLocaleString('es-MX')}</Text>
          </View>
          <View style={s.pagoCard}>
            <Text style={s.pagoEmoji}>💳</Text>
            <Text style={s.pagoLabel}>Tarjeta</Text>
            <Text style={s.pagoVal}>${porPago.Tarjeta.toLocaleString('es-MX')}</Text>
          </View>
        </View>
      </View>

      {/* Por categoría */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>GASTOS POR CATEGORÍA</Text>
        {porCategoria.length === 0 && (
          <Text style={s.empty}>No hay gastos en {nombreMes(mesSeleccionado)}.</Text>
        )}
        {porCategoria.map((cat, i) => {
          const pct = totalMes > 0 ? (cat.total / totalMes) * 100 : 0;
          return (
            <View key={cat.id} style={s.catRow}>
              <View style={s.catTop}>
                <Text style={s.catName}>{cat.emoji} {cat.nombre}</Text>
                <Text style={s.catAmount}>${cat.total.toLocaleString('es-MX')}</Text>
              </View>
              <View style={s.catMeta}>
                <Text style={s.catCount}>{cat.count} transacción{cat.count !== 1 ? 'es' : ''}</Text>
                <Text style={s.catPct}>{pct.toFixed(1)}%</Text>
              </View>
              <View style={s.barBg}>
                <View style={[s.barFill, {
                  width: `${pct}%` as any,
                  backgroundColor: COLORS[i % COLORS.length]
                }]} />
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  header: {
    backgroundColor: '#1A1A2E',
    padding: 16,
    paddingBottom: 20,
  },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 2 },
  headerTotal: { fontSize: 28, fontWeight: '500', color: '#fff' },
  headerMes: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 8 },
  stat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 8,
  },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)' },
  statVal: { fontSize: 13, fontWeight: '500', color: '#fff', marginTop: 2 },
  section: { padding: 12, paddingBottom: 0 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#888',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 20, fontSize: 15, marginBottom: 12 },
  mesPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    marginRight: 8,
    marginBottom: 4,
  },
  mesPillActive: { backgroundColor: '#1A1A2E', borderColor: '#1A1A2E' },
  mesPillText: { fontSize: 13, color: '#555' },
  mesPillTextActive: { color: '#fff', fontWeight: '500' },
  pagoRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  pagoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    padding: 10,
    alignItems: 'center',
  },
  pagoEmoji: { fontSize: 20, marginBottom: 4 },
  pagoLabel: { fontSize: 10, color: '#888', marginBottom: 2 },
  pagoVal: { fontSize: 13, fontWeight: '500', color: '#222' },
  catRow: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    padding: 12,
    marginBottom: 8,
  },
  catTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  catName: { fontSize: 13, fontWeight: '500', color: '#222' },
  catAmount: { fontSize: 13, fontWeight: '500', color: '#222' },
  catMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  catCount: { fontSize: 11, color: '#888' },
  catPct: { fontSize: 11, color: '#888' },
  barBg: { height: 4, backgroundColor: '#f0f0f0', borderRadius: 2 },
  barFill: { height: 4, borderRadius: 2 },
});