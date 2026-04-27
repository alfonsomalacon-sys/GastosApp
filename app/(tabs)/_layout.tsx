import { router, Tabs } from 'expo-router';
import { signOut } from 'firebase/auth';
import { Alert, Text, TouchableOpacity } from 'react-native';
import { auth } from '../../firebase';

export default function TabLayout() {
  async function cerrarSesion() {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir', style: 'destructive',
        onPress: async () => {
          await signOut(auth);
          router.replace('/login');
        }
      }
    ]);
  }

  return (
    <Tabs
      screenOptions={{
        headerRight: () => (
          <TouchableOpacity onPress={cerrarSesion} style={{ marginRight: 16 }}>
            <Text style={{ color: '#534AB7', fontSize: 14 }}>Salir</Text>
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: '#534AB7',
      }}
    >
      <Tabs.Screen
        name="nuevo"
        options={{
          title: 'Nuevo gasto',
          tabBarLabel: 'Nuevo',
          tabBarIcon: ({ color }) => <TabIcon label="+" color={color} />,
        }}
      />
      <Tabs.Screen
        name="gastos"
        options={{
          title: 'Mis gastos',
          tabBarLabel: 'Gastos',
          tabBarIcon: ({ color }) => <TabIcon label="=" color={color} />,
        }}
      />
      <Tabs.Screen
        name="balance"
        options={{
          title: 'Balance y flujo',
          tabBarLabel: 'Balance',
          tabBarIcon: ({ color }) => <TabIcon label="◎" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ label, color }: { label: string; color: string }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 20, color }}>{label}</Text>;
}