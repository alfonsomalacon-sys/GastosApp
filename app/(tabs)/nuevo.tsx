import { useState } from 'react';
import {
    Alert,
    ScrollView, StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { CATEGORIAS, saveGasto } from '../../storage';

export default function NuevoGasto() {
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [catIndex, setCatIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [tipo, setTipo] = useState<'F' | 'V' | 'D'>('F');
  const [formaPago, setFormaPago] = useState<'Efectivo' | 'Transferencia' | 'Tarjeta'>('Efectivo');

  const cat = CATEGORIAS[catIndex];

  async function guardar() {
    if (!descripcion || !monto) {
      Alert.alert('Faltan datos', 'Por favor llena descripción y monto.');
      return;
    }
    await saveGasto({
      id: Date.now().toString(),
      fecha,
      descripcion,
      monto: parseFloat(monto),
      categoria: cat.nombre,
      subcategoria: cat.subs[subIndex] || '',
      tipo,
      formaPago,
    });
    Alert.alert('✅ Guardado', 'Gasto registrado correctamente.');
    setDescripcion('');
    setMonto('');
    setSubIndex(0);
  }

  return (
    <ScrollView style={s.container}>
      <View style={s.card}>
        <Text style={s.label}>DESCRIPCIÓN</Text>
        <TextInput
          style={s.input}
          placeholder="Ej: Gasolina, Uber, Mercado..."
          value={descripcion}
          onChangeText={setDescripcion}
        />

        <Text style={s.label}>MONTO (MXN)</Text>
        <TextInput
          style={s.input}
          placeholder="0.00"
          keyboardType="numeric"
          value={monto}
          onChangeText={setMonto}
        />

        <Text style={s.label}>FECHA</Text>
        <TextInput
          style={s.input}
          value={fecha}
          onChangeText={setFecha}
          placeholder="YYYY-MM-DD"
        />
      </View>

      <View style={s.card}>
        <Text style={s.label}>CATEGORÍA</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {CATEGORIAS.map((c, i) => (
            <TouchableOpacity
              key={c.id}
              style={[s.pill, catIndex === i && s.pillActive]}
              onPress={() => { setCatIndex(i); setSubIndex(0); }}
            >
              <Text style={[s.pillText, catIndex === i && s.pillTextActive]}>
                {c.emoji} {c.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {cat.subs.length > 0 && (
          <>
            <Text style={s.label}>SUBCATEGORÍA</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {cat.subs.map((sub, i) => (
                <TouchableOpacity
                  key={i}
                  style={[s.pill, subIndex === i && s.pillActive]}
                  onPress={() => setSubIndex(i)}
                >
                  <Text style={[s.pillText, subIndex === i && s.pillTextActive]}>{sub}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        <Text style={s.label}>TIPO DE GASTO</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {(['F', 'V', 'D'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[s.pill, tipo === t && s.pillActive]}
              onPress={() => setTipo(t)}
            >
              <Text style={[s.pillText, tipo === t && s.pillTextActive]}>
                {t === 'F' ? 'Fijo' : t === 'V' ? 'Variable' : 'Discrecional'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>FORMA DE PAGO</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['Efectivo', 'Transferencia', 'Tarjeta'] as const).map(p => (
            <TouchableOpacity
              key={p}
              style={[s.pill, formaPago === p && s.pillActivePago]}
              onPress={() => setFormaPago(p)}
            >
              <Text style={[s.pillText, formaPago === p && s.pillTextActivePago]}>
                {p === 'Efectivo' ? '💵 Efectivo' : p === 'Transferencia' ? '🏦 Transferencia' : '💳 Tarjeta'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={s.btn} onPress={guardar}>
        <Text style={s.btnText}>Guardar gasto</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4', padding: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: '#888',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    marginBottom: 10,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#ccc',
    backgroundColor: '#f8f8f8',
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: '#EEEDFE',
    borderColor: '#534AB7',
  },
  pillActivePago: {
    backgroundColor: '#E1F5EE',
    borderColor: '#0F6E56',
  },
  pillText: { fontSize: 13, color: '#555' },
  pillTextActive: { color: '#3C3489', fontWeight: '500' },
  pillTextActivePago: { color: '#0F6E56', fontWeight: '500' },
  btn: {
    backgroundColor: '#534AB7',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '500' },
});