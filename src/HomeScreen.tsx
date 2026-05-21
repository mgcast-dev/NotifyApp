import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Switch, TouchableOpacity, FlatList, Alert, ActivityIndicator, AppState, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';
import Video from 'react-native-video'; // Importante: Haber instalado npm install react-native-video

const { AudioPickerModule, PermissionsModule } = NativeModules;

interface Contact {
  id: string;
  name: string;
}

const HomeScreen = () => {
  const [isDndEnabled, setIsDndEnabled] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<{name: string, uri: string} | null>(null);
  
  // Estado para controlar si el audio está sonando
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  //Estado para controlar las notificaciones
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newContactName, setNewContactName] = useState('');

  const checkPermission = async () => {
    try {
      // Llamamos al método que creamos en PermissionsModule.kt
      const isGranted = await PermissionsModule.checkNotificationPermission();
      setHasNotificationPermission(isGranted);
    } catch (error) {
      console.error("Error al comprobar permisos:", error);
    }
  };

  // 2. Función para abrir la pantalla de ajustes del sistema
  const requestPermission = async () => {
    try {
      await PermissionsModule.openNotificationSettings();
    } catch (error) {
      Alert.alert("Error", "No se pudo abrir la configuración de notificaciones.");
    }
  };
  useEffect(() => {
    // 1. Función para cargar contactos y audio desde AsyncStorage
    const loadInitialData = async () => {
      try {
        const savedContacts = await AsyncStorage.getItem('@pardoned_contacts');
        if (savedContacts) setContacts(JSON.parse(savedContacts));

        const savedAudio = await AsyncStorage.getItem('@selected_audio');
        if (savedAudio) setSelectedAudio(JSON.parse(savedAudio));
      } catch (e) {
        console.error("Error al cargar datos iniciales", e);
      }
    };

    // 2. Ejecución inicial
    loadInitialData();
    checkPermission(); // Ejecuta la comprobación del permiso al abrir la app

    // 3. Escuchar cuando el usuario vuelve de los Ajustes de Android
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // Si el estado de la app pasa de segundo plano (ajustes) a 'active' (primer plano)
      if (nextAppState === 'active') {
        checkPermission(); // Re-comprobamos el permiso automáticamente
      }
    });

    // 4. Limpieza del listener al desmontar el componente
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
    
    // Sincronización
    const jsonList = JSON.stringify(newList);
    await AsyncStorage.setItem('@pardoned_contacts', jsonList);
    
    try {
      await PermissionsModule.syncContacts(jsonList);
    } catch (e) {
      console.error(e);
    }

    // Limpiar y cerrar
    setNewContactName('');
    setIsModalVisible(false);
  };

  const pickAudio = async () => {
    console.log("1. Botón pulsado");
    try {
      const uri = await AudioPickerModule.pickAudio();
      
      // Limpiamos el nombre del archivo de la URI
      const fileName = uri.split('/').pop() || "Audio seleccionado";
      const audioData = { name: fileName, uri: uri };
      
      setSelectedAudio(audioData);
      await AsyncStorage.setItem('@selected_audio', JSON.stringify(audioData));

      await PermissionsModule.syncAudioUri(uri);
      
      Alert.alert("¡Conseguido!", "Tono seleccionado correctamente.");
    } catch (error) {
      Alert.alert("ERROR", String(error));
    }
  };

  // Función para activar/desactivar el sonido de prueba
  const togglePlay = () => {
    if (!selectedAudio) {
      Alert.alert("Aviso", "Primero selecciona un tono");
      return;
    }
    
    if (isPlaying) {
      // Si está sonando, lo apagamos
      setIsPlaying(false);
      setIsLoadingAudio(false);
    } else {
      // Si no está sonando, iniciamos la carga y la reproducción
      setIsLoadingAudio(true);
      setIsPlaying(true);
    }
  };

  const toggleDndMode = async (newValue: boolean) => {
    setIsDndEnabled(newValue);
    
    // Lo enviamos al cerebro nativo
    try {
      await PermissionsModule.syncDndMode(newValue);
      console.log("Modo indulto sincronizado con Kotlin:", newValue);
    } catch (e) {
      console.error("Error sincronizando modo indulto", e);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>NOTIFY APP</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Modo Indulto</Text>
        <Switch 
          value={isDndEnabled} 
          onValueChange={toggleDndMode}
          trackColor={{ false: "#333", true: "#0f0" }}
          thumbColor={isDndEnabled ? "#fff" : "#f4f3f4"}
        />
      </View>

      <View style={styles.card}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.label}>Acceso a Notificaciones</Text>
          <Text style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>
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
          disabled={hasNotificationPermission} // Si ya lo tiene, no hace falta pulsar más
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
      <View style={{ marginBottom: 20 }}>
        <TouchableOpacity style={styles.button} onPress={pickAudio}>
          <Text style={styles.buttonText}>SELECCIONAR TONO</Text>
        </TouchableOpacity>
        
       {selectedAudio && (
          <View style={styles.audioInfoContainer}>
            <Text style={styles.audioText} numberOfLines={1}>
              Tono: {selectedAudio.name}
            </Text>
            
            {/* BOTÓN CON FEEDBACK DE CARGA */}
            <TouchableOpacity 
              style={[styles.testButton, { backgroundColor: isPlaying ? '#f00' : '#444' }]} 
              onPress={togglePlay}
              disabled={isLoadingAudio} // Deshabilita el botón mientras carga
            >
              {isLoadingAudio ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>{isPlaying ? "STOP" : "PROBAR"}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* REPRODUCTOR OCULTO MEJORADO */}
      {selectedAudio && isPlaying && (
        <Video
          source={{ uri: selectedAudio.uri }}
          playInBackground={true}
          playWhenInactive={true}
          volume={1.0} // Volumen al máximo de la app
          ignoreSilentSwitch="ignore" // Intenta saltarse el modo silencio
          mixWithOthers="duck" // Baja el volumen de Spotify/YouTube temporalmente
          
          // EVENTO DE CARGA: Apaga el spinner cuando el audio está listo para sonar
          onLoad={() => setIsLoadingAudio(false)} 
          
          onEnd={() => {
            setIsPlaying(false);
            setIsLoadingAudio(false);
          }}
          onError={(e) => {
            console.error("Error Video:", e);
            setIsPlaying(false);
            setIsLoadingAudio(false);
            Alert.alert("Error", "No se pudo reproducir este audio.");
          }}
        />
      )}

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
                style={[styles.testButton, { backgroundColor: '#444' }]}
              >
                <Text style={styles.buttonText}>CANCELAR</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={addNewContact}
                style={[styles.testButton, { backgroundColor: '#0f0' }]}
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
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', padding: 20, borderRadius: 10, marginBottom: 15 },
  label: { color: '#fff', fontSize: 16, fontWeight: '600' },
  button: { backgroundColor: '#0f0', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: 'bold' },
  audioInfoContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 10
  },
  audioText: { color: '#aaa', flex: 1 },
  testButton: { padding: 8, borderRadius: 5, marginLeft: 10, minWidth: 80, alignItems: 'center' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  addText: { color: '#0f0', fontWeight: 'bold' },
  contactItem: { backgroundColor: '#1a1a1a', padding: 15, borderRadius: 5, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: '#0f0' },
  contactName: { color: '#fff' },
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
});

export default HomeScreen;