import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistro, setIsRegistro] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor llena todos los campos.');
      return;
    }
    setLoading(true);
    try {
      if (isRegistro) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (e: any) {
      const msg = e.code === 'auth/invalid-credential' ? 'Correo o contraseña incorrectos.'
        : e.code === 'auth/email-already-in-use' ? 'Este correo ya está registrado.'
        : e.code === 'auth/weak-password' ? 'La contraseña debe tener al menos 6 caracteres.'
        : e.code === 'auth/invalid-email' ? 'Correo electrónico inválido.'
        : 'Ocurrió un error. Intenta de nuevo.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.card}>
        <Text style={s.title}>💰 GastosApp</Text>
        <Text style={s.subtitle}>{isRegistro ? 'Crear cuenta' : 'Iniciar sesión'}</Text>

        <Text style={s.label}>CORREO ELECTRÓNICO</Text>
        <TextInput
          style={s.input}
          placeholder="tu@correo.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={s.label}>CONTRASEÑA</Text>
        <TextInput
          style={s.input}
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={s.btn} onPress={handleAuth} disabled={loading}>
          <Text style={s.btnText}>{loading ? 'Cargando...' : isRegistro ? 'Crear cuenta' : 'Entrar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsRegistro(!isRegistro)} style={s.toggle}>
          <Text style={s.toggleText}>
            {isRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, borderWidth: 0.5, borderColor: '#e0e0e0' },
  title: { fontSize: 28, fontWeight: '700', color: '#534AB7', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 24 },
  label: { fontSize: 11, fontWeight: '500', color: '#888', letterSpacing: 0.5, marginBottom: 6 },
  input: { backgroundColor: '#f8f8f8', borderWidth: 0.5, borderColor: '#e0e0e0', borderRadius: 8, padding: 12, fontSize: 15, marginBottom: 16 },
  btn: { backgroundColor: '#534AB7', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  toggle: { marginTop: 16, alignItems: 'center' },
  toggleText: { color: '#534AB7', fontSize: 14 },
});