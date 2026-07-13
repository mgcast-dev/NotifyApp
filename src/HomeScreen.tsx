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

  // Estado para controlar las notificaciones
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

  const toggleDndMode = async (newValue: boolean) => {
    setIsDndEnabled(newValue);
    try {
      await PermissionsModule.syncDndSettings(newValue, isSilentMode);
      console.log("Modo indulto sincronizado con Kotlin. Activo:", newValue, "Silencioso:", isSilentMode);
    } catch (e) {
      console.error("Error sincronizando modo indulto", e);
    }
  };

  const toggleSilentMode = async (newValue: boolean) => {
    setIsSilentMode(newValue);
    try {
      await AsyncStorage.setItem('@silent_mode', JSON.stringify(newValue));
      await PermissionsModule.syncDndSettings(isDndEnabled, newValue);
      console.log("Modo Silencioso sincronizado con Kotlin:", newValue);
    } catch (e) {
      console.error("Error sincronizando modo silencioso", e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NOTIFY APP</Text>

      {/* TARJETA DE CONFIGURACIÓN PRINCIPAL */}
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Modo Indulto</Text>
          <Text style={styles.subLabel}>Permitir alertas de la lista</Text>
          <Switch 
            value={isDndEnabled} 
            onValueChange={toggleDndMode}
            trackColor={{ false: "#333", true: "#0f0" }}
            thumbColor={isDndEnabled ? "#fff" : "#f4f3f4"}
            style={{ alignSelf: 'flex-start', marginTop: 8 }}
          />
        </View>

        <View style={{ alignItems: 'flex-end', justifyContent: 'center', paddingLeft: 10 }}>
          <Text style={[styles.label, { color: isDndEnabled ? '#fff' : '#444' }]}>Silencioso</Text>
          <Text style={styles.subLabel}>Solo vibración</Text>
          <Switch 
            value={isSilentMode} 
            onValueChange={toggleSilentMode}
            disabled={!isDndEnabled}
            trackColor={{ false: "#333", true: "#f0f" }}
            thumbColor={isSilentMode ? "#fff" : "#f4f3f4"}
            style={{ marginTop: 8 }}
          />
        </View>
      </View>

      {/* TARJETA DE PERMISOS DEL SISTEMA */}
      <View style={styles.card}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.label}>Acceso a Notificaciones</Text>
          <Text style={styles.subLabel}>
            {hasNotificationPermission 
              ? "Servicio configurado correctamente." 
              : "Necesario para detectar mensajes entrantes."}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.permissionButton, 
            { backgroundColor: hasNotificationPermission ? '#222' : '#f00' }
          ]} 
          onPress={requestPermission}
          disabled={hasNotificationPermission}
        >
          <Text style={{ 
            color: hasNotificationPermission ? '#0f0' : '#fff', 
            fontWeight: 'bold',
            fontSize: 12 
          }}>
            {hasNotificationPermission ? "ACTIVO" : "OTORGAR"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* SECCIÓN DE CONTACTOS INDULTADOS */}
      <View style={{ flex: 1, marginTop: 10 }}>
        <View style={styles.listHeader}>
          <Text style={styles.label}>Contactos Indultados</Text>
          <TouchableOpacity onPress={() => setIsModalVisible(true)}>
            <Text style={styles.addText}>+ AÑADIR</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.contactItem}>
              <Text style={styles.contactName}>{item.name}</Text>
            </View>
          )}
        />
      </View>

      {/* MODAL PARA AÑADIR CONTACTO */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={[styles.label, { marginBottom: 15 }]}>Nombre del contacto</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Mamá o Juan"
              placeholderTextColor="#666"
              value={newContactName}
              onChangeText={setNewContactName}
              autoFocus={true}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)}
                style={[styles.cancelButton, { backgroundColor: '#444' }]}
              >
                <Text style={styles.buttonText}>CANCELAR</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={addNewContact}
                style={[styles.saveButton, { backgroundColor: '#0f0' }]}
              >
                <Text style={styles.buttonText}>GUARDAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  title: { color: '#0f0', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'stretch', backgroundColor: '#111', padding: 20, borderRadius: 10, marginBottom: 15 },
  label: { color: '#fff', fontSize: 16, fontWeight: '600' },
  subLabel: { color: '#aaa', fontSize: 12, marginTop: 4 },
  buttonText: { color: '#000', fontWeight: 'bold' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, paddingHorizontal: 5 },
  addText: { color: '#0f0', fontWeight: 'bold', fontSize: 15 },
  contactItem: { backgroundColor: '#1a1a1a', padding: 15, borderRadius: 5, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: '#0f0' },
  contactName: { color: '#fff', fontSize: 15 },
  permissionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 85,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#0f0',
  },
  cancelButton: { padding: 10, borderRadius: 5, minWidth: 100, alignItems: 'center' },
  saveButton: { padding: 10, borderRadius: 5, minWidth: 100, alignItems: 'center' }
});

export default HomeScreen;