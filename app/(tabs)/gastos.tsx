import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Alert,
    ScrollView, StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { deleteGasto, Gasto, getGastos } from '../../storage';

const TIPO_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  F: { bg: '#E6F1FB', text: '#185FA5', label: 'Fijo' },
  V: { bg: '#EAF3DE', text: '#3B6D11', label: 'Variable' },
  D: { bg: '#FAEEDA', text: '#854F0B', label: 'Discrecional' },
};

export default function Gastos() {
  const [gastos, setGastos] = useState<Gasto[]>([]);

  useFocusEffect(
    useCallback(() => {
      getGastos().then(setGastos);
    }, [])
  );

  const total = gastos.reduce((s, g) => s + g.monto, 0);

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

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerSub}>Total registrado</Text>
        <Text style={s.headerTotal}>${total.toLocaleString('es-MX')} MXN</Text>
        <Text style={s.headerCount}>{gastos.length} transacciones</Text>
      </View>

      <ScrollView style={s.list}>
        {gastos.length === 0 && (
          <Text style={s.empty}>Aún no hay gastos registrados.</Text>
        )}
        {gastos.map(g => {
          const t = TIPO_COLORS[g.tipo] || TIPO_COLORS.F;
          return (
            <TouchableOpacity
              key={g.id}
              style={s.item}
              onLongPress={() => confirmarEliminar(g.id)}
            >
              <View style={s.itemLeft}>
                <Text style={s.itemEmoji}>
                  {/* busca el emoji de la categoría */}
                  {'💰'}
                </Text>
              </View>
              <View style={s.itemInfo}>
                <Text style={s.itemName}>{g.descripcion}</Text>
                <Text style={s.itemMeta}>
                  {g.categoria}
                  {g.subcategoria ? ` · ${g.subcategoria}` : ''}
                </Text>
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
        })}
        <Text style={s.hint}>Mantén presionado un gasto para eliminarlo</Text>
      </ScrollView>
    </View>
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
  headerCount: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  list: { flex: 1, padding: 12 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 },
  item: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  itemLeft: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemEmoji: { fontSize: 18 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '500', color: '#222' },
  itemMeta: { fontSize: 11, color: '#888', marginTop: 2 },
  itemFecha: { fontSize: 11, color: '#aaa', marginTop: 1 },
  itemRight: { alignItems: 'flex-end', gap: 4 },
  itemMonto: { fontSize: 14, fontWeight: '500', color: '#222' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 10, fontWeight: '500' },
  hint: { textAlign: 'center', color: '#ccc', fontSize: 11, marginTop: 8, marginBottom: 20 },
});