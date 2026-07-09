import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from './firebase';

export interface Gasto {
  id: string;
  fecha: string;
  descripcion: string;
  monto: number;
  categoria: string;
  subcategoria: string;
  tipo: 'F' | 'V' | 'D';
  formaPago: 'Efectivo' | 'Transferencia' | 'Tarjeta';
}

function userCollection() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('No hay usuario autenticado');
  return collection(db, 'usuarios', uid, 'gastos');
}

export async function getGastos(): Promise<Gasto[]> {
  try {
    const q = query(userCollection(), orderBy('fecha', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Gasto));
  } catch {
    return [];
  }
}

export async function saveGasto(gasto: Omit<Gasto, 'id'>): Promise<void> {
  await addDoc(userCollection(), gasto);
}

export async function deleteGasto(id: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  await deleteDoc(doc(db, 'usuarios', uid, 'gastos', id));
}

export async function updateGasto(id: string, gasto: Omit<Gasto, 'id'>): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  await updateDoc(doc(db, 'usuarios', uid, 'gastos', id), { ...gasto });
}

export function getMeses(gastos: Gasto[]): string[] {
  const set = new Set(gastos.map(g => g.fecha.slice(0, 7)));
  return Array.from(set).sort().reverse();
}

export const MESES_NOMBRES: Record<string, string> = {
  '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
  '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
  '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre',
};

export const CATEGORIAS = [
  { id: '1', nombre: 'Hogar y vivienda', emoji: '🏠', subs: ['a. Hipoteca/Alquiler','b. Misceláneos','c. Compras','d. Cuotas asoc.','e. Serv. Alarma'] },
  { id: '2', nombre: 'Automóvil y transporte', emoji: '🚗', subs: ['a. Cuota','b. Gasolina','c. Parking','d. Inscripciones','e. Lubricantes','f. Mantenimiento','g. Reparaciones','h. Accesorios','i. Buses/Taxis','j. Tickets aéreos','k. Autolavado'] },
  { id: '3', nombre: 'Alimentos', emoji: '🥦', subs: ['a. Provisiones','b. Restaurantes','c. Refrigerios'] },
  { id: '4', nombre: 'Ropa', emoji: '👗', subs: ['a. Indumentaria','b. Calzados','c. Accesorios','d. Joyas','e. Sastre','f. Tintorería','g. Lavandería','h. Zapatero','i. Restauraciones'] },
  { id: '5', nombre: 'Cuidado personal', emoji: '💆', subs: ['a. Artículos tocador','b. Artículos rasurar','c. Manicura','d. Pedicura','e. Peluquería','f. Masajes','g. Spa/Gym'] },
  { id: '6', nombre: 'Cuidado de la salud', emoji: '🏥', subs: ['a. Médicos','b. Dentista','c. Otros','d. Anteojos','e. Oftalmólogo','f. Pediatra','g. Prescripciones','h. Psicólogo/Terapia','i. Médicos','j. Cuidado mascotas','k. Escuela','l. Servicios','m. Suministros'] },
  { id: '7', nombre: 'Entretenimiento', emoji: '🎭', subs: ['a. Libros','b. Cable TV','c. Audios','d. Clubs/Baile','e. Conciertos','f. Hobbies','g. Huéspedes','h. Licores/Tabaco','i. Salidas','j. Películas','k. Turismo','l. Teatro/Cine','m. Comidas afuera'] },
  { id: '8', nombre: 'Regalos', emoji: '🎁', subs: ['a. Aniversarios','b. Cumpleaños','c. Tarjetas','d. Navidad','e. Hanukkah','f. Pascua','g. Flores','h. Regalos de amor','i. Casamientos'] },
  { id: '9', nombre: 'Educación', emoji: '📚', subs: ['a. Libros','b. Clases','c. Honorarios','d. Seminarios','e. Grabaciones','f. Clases','g. Talleres'] },
  { id: '10', nombre: 'Vacaciones', emoji: '✈️', subs: ['a. Intereses especiales','b. Verano','c. Invierno','d. Fin de semana','e. Fondos de viajes'] },
  { id: '11', nombre: 'Gastos de negocios', emoji: '💼', subs: [] },
  { id: '12', nombre: 'Cuidado y dependencias', emoji: '👨‍👩‍👧', subs: ['a. Pensión','b. Auto','c. Cuidado de niños','d. Cuidado diario','e. Ropa','f. Eventos familiares','g. Comida'] },
  { id: '13', nombre: 'Inversiones y ahorros', emoji: '💰', subs: ['a. Bonos','b. Fondos de retiro','c. Seguros','d. Empleado','e. Cuentas de ahorro','f. Plan previsor PABS','g. Puerquito'] },
  { id: '14', nombre: 'Seguros', emoji: '🛡️', subs: ['a. Automóvil','b. Incapacidad','c. Salud','d. Vivienda','e. Vida'] },
  { id: '15', nombre: 'Espiritual', emoji: '🙏', subs: ['a. Contribuciones','b. Limosna','c. Séptima tradición','d. Diezmo','e. Seminarios'] },
  { id: '16', nombre: 'Deudas repagadas', emoji: '💳', subs: ['a. Tarjetas de crédito','b. Cargos de tiendas','c. Préstamos familiares','d. Préstamos estudiantiles','e. Acciones confiables','f. Otros'] },
  { id: '17', nombre: 'Servicios', emoji: '🔧', subs: ['a. Agua','b. Electricidad','c. Gas','d. Recolección residuos','e. Teléfonos y celulares'] },
  { id: '18', nombre: 'Impuestos', emoji: '🧾', subs: ['a. Ingresos federales','b. Ingresos estatales','c. Seguridad social','d. Propiedad/Casa','e. Otras propiedades','f. Negocios','g. Ciudad/País','h. Otros'] },
  { id: '19', nombre: 'Lecciones aprendidas', emoji: '📝', subs: [] },
  { id: '20', nombre: 'Honorarios pagados', emoji: '🤝', subs: [] },
];

// ── Grupos de categoría (para el resumen mensual y la gráfica) ──────────────
// Cada categoría de CATEGORIAS cae en exactamente uno de estos grupos.
export interface GrupoGasto {
  id: string;
  nombre: string;
  color: string;
  categorias: string[];
}

export const GRUPOS: GrupoGasto[] = [
  {
    id: 'corriente',
    nombre: 'Gasto corriente',
    color: '#534AB7',
    // Renta, agua, luz, gas, mandado, gasolina, educación, etc.
    categorias: ['Hogar y vivienda', 'Servicios', 'Alimentos', 'Automóvil y transporte', 'Educación'],
  },
  {
    id: 'salud',
    nombre: 'Salud',
    color: '#E4572E',
    categorias: ['Cuidado de la salud'],
  },
  {
    id: 'ocio',
    nombre: 'Ocio y entretenimiento',
    color: '#F2A93B',
    // Entretenimiento, salidas, comidas afuera y alcohol ya están dentro de esta categoría.
    categorias: ['Entretenimiento'],
  },
  {
    id: 'proteccion',
    nombre: 'Ahorro y protección',
    color: '#2E8B57',
    categorias: ['Inversiones y ahorros', 'Seguros'],
  },
  {
    id: 'deudas',
    nombre: 'Deudas e impuestos',
    color: '#6B7280',
    categorias: ['Deudas repagadas', 'Impuestos'],
  },
  {
    id: 'otros',
    nombre: 'Otros',
    color: '#9CA3AF',
    categorias: [
      'Ropa', 'Cuidado personal', 'Regalos', 'Vacaciones', 'Gastos de negocios',
      'Cuidado y dependencias', 'Espiritual', 'Lecciones aprendidas', 'Honorarios pagados',
    ],
  },
];

export function grupoDeCategoria(categoria: string): GrupoGasto {
  return GRUPOS.find(g => g.categorias.includes(categoria)) || GRUPOS[GRUPOS.length - 1];
}

export interface ResumenMensual {
  mes: string; // 'YYYY-MM'
  total: number;
  porGrupo: Record<string, number>; // grupoId -> total
}

// Agrupa los gastos por mes y, dentro de cada mes, por grupo de categoría.
// Regresa los meses en orden cronológico ascendente (útil para graficar de izq. a der.).
export function getResumenMensualPorGrupo(gastos: Gasto[]): ResumenMensual[] {
  const mapa: Record<string, ResumenMensual> = {};
  gastos.forEach(g => {
    const mes = g.fecha.slice(0, 7);
    if (!mapa[mes]) {
      mapa[mes] = { mes, total: 0, porGrupo: {} };
      GRUPOS.forEach(gr => { mapa[mes].porGrupo[gr.id] = 0; });
    }
    const grupo = grupoDeCategoria(g.categoria);
    mapa[mes].porGrupo[grupo.id] += g.monto;
    mapa[mes].total += g.monto;
  });
  return Object.values(mapa).sort((a, b) => a.mes.localeCompare(b.mes));
}