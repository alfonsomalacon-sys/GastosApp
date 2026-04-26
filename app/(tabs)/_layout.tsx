import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#534AB7',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          borderTopWidth: 0.5,
          borderTopColor: '#e0e0e0',
          paddingBottom: 8,
          height: 60,
        },
        headerStyle: { backgroundColor: '#1A1A2E' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="nuevo"
        options={{
          title: 'Nuevo gasto',
          tabBarLabel: 'Nuevo',
          tabBarIcon: ({ color }) => (
            <TabIcon label="+" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="gastos"
        options={{
          title: 'Mis gastos',
          tabBarLabel: 'Gastos',
          tabBarIcon: ({ color }) => (
            <TabIcon label="≡" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="balance"
        options={{
          title: 'Balance y flujo',
          tabBarLabel: 'Balance',
          tabBarIcon: ({ color }) => (
            <TabIcon label="◎" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({ label, color }: { label: string; color: string }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 20, color }}>{label}</Text>;
}