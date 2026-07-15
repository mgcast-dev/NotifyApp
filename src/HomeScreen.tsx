import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Switch, TouchableOpacity, FlatList, Alert, AppState, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';

const { PermissionsModule } = NativeModules;

interface Contact {
  id: string;
  name: string;
}

const HomeScreen = () => {
  const [isDndEnabled, setIsDndEnabled] = useState(false);
  const [isSilentMode, setIsSilentMode] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newContactName, setNewContactName] = useState('');

  const checkPermission = async () => {
    try {
      const isGranted = await PermissionsModule.checkNotificationPermission();
      setHasNotificationPermission(isGranted);
    } catch (error) {
      console.error("Error al comprobar permisos:", error);
    }
  };

  const requestPermission = async () => {
    try {
      await PermissionsModule.openNotificationSettings();
    } catch (error) {
      Alert.alert("Error", "No se pudo abrir la configuración de notificaciones.");
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const savedContacts = await AsyncStorage.getItem('@pardoned_contacts');
        if (savedContacts) setContacts(JSON.parse(savedContacts));

        const savedSilentMode = await AsyncStorage.getItem('@silent_mode');
        if (savedSilentMode) setIsSilentMode(JSON.parse(savedSilentMode));
      } catch (e) {
        console.error("Error al cargar datos iniciales", e);
      }
    };

    loadInitialData();
    checkPermission();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkPermission();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const addNewContact = async () => {
    if (newContactName.trim().length === 0) {
      Alert.alert("Error", "El nombre no puede estar vacío");
      return;
    }

    const newContact: Contact = { 
      id: Date.now().toString(), 
      name: newContactName.trim() 
    };
    
    const newList = [...contacts, newContact];
    setContacts(newList);
    
    const jsonList = JSON.stringify(newList);
    await AsyncStorage.setItem('@pardoned_contacts', jsonList);
    
    try {
      await PermissionsModule.syncContacts(jsonList);
    } catch (e) {
      console.error(e);
    }

    setNewContactName('');
    setIsModalVisible(false);
  };

  const removeContact = async (id: string) => {
    const newList = contacts.filter(contact => contact.id !== id);
    setContacts(newList);
    
    const jsonList = JSON.stringify(newList);
    await AsyncStorage.setItem('@pardoned_contacts', jsonList);
    
    try {
      await PermissionsModule.syncContacts(jsonList);
    } catch (e) {
      console.error("Error al sincronizar tras eliminar", e);
    }
  };

  const toggleDndMode = async (newValue: boolean) => {
    setIsDndEnabled(newValue);
    try {
      await PermissionsModule.syncDndSettings(newValue, isSilentMode);
    } catch (e) {
      console.error("Error sincronizando modo indulto", e);
    }
  };

  const toggleSilentMode = async (newValue: boolean) => {
    setIsSilentMode(newValue);
    try {
      await AsyncStorage.setItem('@silent_mode', JSON.stringify(newValue));
      await PermissionsModule.syncDndSettings(isDndEnabled, newValue);
    } catch (e) {
      console.error("Error sincronizando modo silencioso", e);
    }
  };

  const getInitials = (name: string) => {
    return name.trim().substring(0, 2).toUpperCase();
  };

  return (
    <View style={styles.container}>
      {/* HEADER MINIMALISTA */}
      <View style={styles.header}>
        <Text style={styles.title}>Notify<Text style={styles.titleAccent}>App</Text></Text>
        <Text style={styles.headerSubtitle}>Gestión de privacidad y tiempo</Text>
      </View>

      {/* HERO CARD: ESTADO DE PERMISOS */}
      <View style={[styles.heroCard, hasNotificationPermission ? styles.heroActive : styles.heroInactive]}>
        <View style={styles.heroTextContainer}>
          <View style={styles.statusBadgeRow}>
            <View style={[styles.pulseIndicator, { backgroundColor: hasNotificationPermission ? '#10B981' : '#EF4444' }]} />
            <Text style={styles.heroLabel}>
              {hasNotificationPermission ? "Servicio Activo" : "Acción Requerida"}
            </Text>
          </View>
          <Text style={styles.heroSubLabel}>
            {hasNotificationPermission 
              ? "Escuchando notificaciones en segundo plano." 
              : "Concede el permiso para poder filtrar tus mensajes."}
          </Text>
        </View>
        
        {!hasNotificationPermission && (
          <TouchableOpacity style={styles.heroButton} onPress={requestPermission}>
            <Text style={styles.heroButtonText}>CONFIGURAR</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* PANEL DE CONTROL CENTRAL */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlRow}>
          <View style={styles.controlTextColumn}>
            <Text style={styles.controlLabel}>Modo Indulto</Text>
            <Text style={styles.controlSubLabel}>Bypass avanzado del No Molestar</Text>
          </View>
          <Switch 
            value={isDndEnabled} 
            onValueChange={toggleDndMode}
            trackColor={{ false: "#27272A", true: "#4F46E5" }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.controlRow, !isDndEnabled && styles.disabledRow, styles.noBorderRow]}>
          <View style={styles.controlTextColumn}>
            <Text style={styles.controlLabel}>Modo Silencioso</Text>
            <Text style={styles.controlSubLabel}>Forzar solo vibración de hardware</Text>
          </View>
          <Switch 
            value={isSilentMode} 
            onValueChange={toggleSilentMode}
            disabled={!isDndEnabled}
            trackColor={{ false: "#27272A", true: "#06B6D4" }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* SECCIÓN LISTA BLANCA */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Contactos Indultados ({contacts.length})</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
            <Text style={styles.addButtonText}>＋ Añadir</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.contactCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
              </View>
              <Text style={styles.contactName} numberOfLines={1}>{item.name}</Text>
              <TouchableOpacity style={styles.deleteButton} onPress={() => removeContact(item.id)}>
                <Text style={styles.deleteButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Tu lista blanca está vacía.</Text>
              <Text style={styles.emptySubText}>Los mensajes de tus contactos agregados aquí sonarán incluso en No Molestar.</Text>
            </View>
          }
        />
      </View>

      {/* MODAL PREMIUM (DRAWER-STYLE) */}
      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuevo Contacto Indultado</Text>
            <Text style={styles.modalDescription}>
              Escribe el nombre exactamente como aparece en sus notificaciones de WhatsApp o del sistema.
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Ej. Mamá, Juan Pérez..."
              placeholderTextColor="#71717A"
              value={newContactName}
              onChangeText={setNewContactName}
              autoFocus={true}
              maxLength={40}
            />
            
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity onPress={() => { setIsModalVisible(false); setNewContactName(''); }} style={styles.modalCancelButton}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={addNewContact} style={styles.modalSaveButton}>
                <Text style={styles.modalSaveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B', paddingHorizontal: 20 },
  
  // Header
  header: { marginTop: 24, marginBottom: 20 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  titleAccent: { color: '#4F46E5' },
  headerSubtitle: { color: '#71717A', fontSize: 14, marginTop: 4 },

  // Hero Card (Status)
  heroCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1 },
  heroActive: { backgroundColor: '#061F17', borderColor: '#065F46' },
  heroInactive: { backgroundColor: '#1C1617', borderColor: '#991B1B' },
  heroTextContainer: { flex: 1, marginRight: 8 },
  statusBadgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  pulseIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  heroLabel: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  heroSubLabel: { color: '#A1A1AA', fontSize: 12, lineHeight: 16 },
  heroButton: { backgroundColor: '#EF4444', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 },
  heroButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },

  // Controls
  controlsContainer: { backgroundColor: '#18181B', borderRadius: 16, paddingHorizontal: 16, marginBottom: 24, borderWidth: 1, borderColor: '#27272A' },
  controlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#27272A' },
  noBorderRow: { borderBottomWidth: 0 },
  disabledRow: { opacity: 0.4 },
  controlTextColumn: { flex: 1, marginRight: 16 },
  controlLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  controlSubLabel: { color: '#71717A', fontSize: 13, marginTop: 2 },

  // List Section
  listContainer: { flex: 1 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  listTitle: { color: '#F4F4F5', fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  addButton: { backgroundColor: '#27272A', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10 },
  addButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  
  // Contact Items
  contactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#18181B', padding: 12, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: '#27272A' },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#27272A', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#A1A1AA', fontSize: 12, fontWeight: '700' },
  contactName: { color: '#FFFFFF', fontSize: 15, fontWeight: '500', flex: 1 },
  deleteButton: { padding: 8, marginLeft: 4 },
  deleteButtonText: { color: '#71717A', fontSize: 14, fontWeight: '500' },

  // Empty List State
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 40, paddingHorizontal: 20 },
  emptyText: { color: '#E4E4E7', fontSize: 15, fontWeight: '600', marginBottom: 6 },
  emptySubText: { color: '#52525B', fontSize: 13, textAlign: 'center', lineHeight: 18 },

  // Modal UI
  modalOverlay: { flex: 1, backgroundColor: 'rgba(9, 9, 11, 0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 340, backgroundColor: '#18181B', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#27272A' },
  modalTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  modalDescription: { color: '#71717A', fontSize: 13, lineHeight: 18, marginBottom: 20 },
  input: { backgroundColor: '#09090B', color: '#FFFFFF', padding: 14, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#27272A', marginBottom: 24 },
  modalButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalCancelButton: { paddingVertical: 10, paddingHorizontal: 16, marginRight: 8 },
  modalCancelText: { color: '#A1A1AA', fontSize: 15, fontWeight: '600' },
  modalSaveButton: { backgroundColor: '#4F46E5', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12 },
  modalSaveText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' }
});

export default HomeScreen;