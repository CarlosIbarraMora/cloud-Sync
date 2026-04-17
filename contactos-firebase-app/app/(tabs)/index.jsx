import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// firestore functions
import {
    addDoc,
    collection,
    getDocs,
    orderBy,
    query,
    where,
} from "firebase/firestore";

import { db } from "../../firebaseConfig";

export default function App() {
  // forms States
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");

  // contact-list states
  const [contactos, setContactos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  //New UI filtro
  const [soloConEmail, setSoloConEmail] = useState(false);

  const agregarContacto = async () => {
    // validation
    if (!nombre.trim() || !telefono.trim()) {
      Alert.alert("Error", "Por favor completa nombre y teléfono");
      return;
    }

    setGuardando(true);

    try {
      // Add document to contacts
      const docRef = await addDoc(collection(db, "contactos"), {
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        email: email.trim(),
        fechaCreacion: new Date().toISOString(),
      });

      console.log("Contacto guardado con ID:", docRef.id);

      // form clean
      setNombre("");
      setEmail("");
      setTelefono("");
      // reload contact-list
      obtenerContactos();

      Alert.alert("Éxito", "Contacto guardado correctamente");
    } catch (Error) {
      console.error("Errro al guardar", Error);
      Alert.alert("Error", "No se pudo guardar el contacto");
    } finally {
      setGuardando(false);
    }
  };

  //Modified Step 12
  const obtenerContactos = async (filtroEmail = null) => {
    setCargando(true);
    try {
      let q;

      if (filtroEmail) {
        q = query(
          collection(db, "contactos"),
          where("email", "!=", ""),
          orderBy("email", "asc"),
          orderBy("nombre", "asc"),
        );
      } else {
        q = query(collection(db, "contactos"), orderBy("nombre", "asc"));
      }

      const querySnapshot = await getDocs(q);

      const listaContactos = [];
      querySnapshot.forEach((doc) => {
        listaContactos.push({ id: doc.id, ...doc.data() });
      });

      setContactos(listaContactos);
      console.log(`${listaContactos.length} contactos obtenidos`);
    } catch (error) {
      console.error("Error al obtener contactos:", error);
      Alert.alert("Error", "No se pudieron cargar los contactos");
    } finally {
      setCargando(false);
    }
  };
  // Cargar contactos al montar el componente
  useEffect(() => {
    obtenerContactos(soloConEmail);
  }, [soloConEmail]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.titulo}> Contactos Firestore</Text>
        <Text style={styles.subtitulo}>
          {contactos.length} contacto{contactos.length !== 1 ? "s" : ""}
        </Text>
      </View>
      {/* Formulario */}
      <View style={styles.formulario}>
        <Text style={styles.labelFormulario}>Agregar Nuevo Contacto</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre completo *"
          value={nombre}
          onChangeText={setNombre}
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="Teléfono *"
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="phone-pad"
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="Email (opcional)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#999"
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[styles.boton, guardando && styles.botonDeshabilitado]}
          onPress={agregarContacto}
          disabled={guardando}
        >
          {guardando ? (
            <View style={styles.botonCargando}>
              <ActivityIndicator color="#1A1A1A" size="small" />
              <Text style={styles.textoBotonCargando}>Guardando...</Text>
            </View>
          ) : (
            <Text style={styles.textoBoton}> Guardar Contacto</Text>
          )}
        </TouchableOpacity>
      </View>
      {/* Lista de Contactos */}
      <View style={styles.contenedorLista}>
        <View style={styles.headerLista}>
          <Text style={styles.tituloLista}>Mis Contactos</Text>

          <View style={styles.filtroContainer}>
            <Text style={styles.textoFiltro}>Solo con email</Text>
            <Switch
              value={soloConEmail}
              onValueChange={(valor) => {
                setSoloConEmail(valor);
              }}
              trackColor={{ false: "#E0E0E0", true: "#FFD54F" }}
              thumbColor={soloConEmail ? "#FDB813" : "#f4f3f4"}
            />
          </View>
          <TouchableOpacity onPress={() => obtenerContactos(soloConEmail)}>
            <Text style={styles.textoRecargar}> Recargar</Text>
          </TouchableOpacity>
        </View>
        {cargando ? (
          <View style={styles.centrado}>
            <ActivityIndicator size="large" color="#FDB813" />
            <Text style={styles.textoCargando}>Cargando contactos...</Text>
          </View>
        ) : (
          <FlatList
            data={contactos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.tarjetaContacto}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatar}>
                    {item.nombre.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.infoContacto}>
                  <Text style={styles.nombreContacto}>{item.nombre}</Text>
                  <Text style={styles.telefonoContacto}> {item.telefono}</Text>
                  {item.email ? (
                    <Text style={styles.emailContacto}> {item.email}</Text>
                  ) : null}
                </View>
              </View>
            )}
            ListEmptyComponent={() => (
              <View style={styles.centrado}>
                <Text style={styles.textoVacio}> </Text>
                <Text style={styles.textoVacio}>
                  No hay contactos guardados
                </Text>
                <Text style={styles.subtextoVacio}>
                  Agrega tu primer contacto usando el formulario
                </Text>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separador} />}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#FDB813",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 5,
  },
  subtitulo: {
    fontSize: 16,
    color: "#4A4A4A",
  },
  formulario: {
    backgroundColor: "#FFFFFF",
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  labelFormulario: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    color: "#1A1A1A",
  },
  boton: {
    backgroundColor: "#FDB813",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  botonDeshabilitado: {
    backgroundColor: "#FFD54F",
    opacity: 0.7,
  },
  textoBoton: {
    color: "#1A1A1A",
    fontSize: 18,
    fontWeight: "bold",
  },
  contenedorLista: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    margin: 15,
    marginTop: 0,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLista: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    flexWrap: "wrap",
  },
  tituloLista: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C2C2C",
  },
  textoRecargar: {
    fontSize: 14,
    color: "#FDB813",
    fontWeight: "600",
  },
  tarjetaContacto: {
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF9C4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatar: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  infoContacto: {
    flex: 1,
  },
  nombreContacto: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  telefonoContacto: {
    fontSize: 14,
    color: "#4A4A4A",
    marginBottom: 2,
  },
  emailContacto: {
    fontSize: 14,
    color: "#666",
  },
  separador: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 80,
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  textoCargando: {
    marginTop: 10,
    fontSize: 16,
    color: "#4A4A4A",
  },
  textoVacio: {
    fontSize: 48,
    marginBottom: 10,
    textAlign: "center",
  },
  subtextoVacio: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 5,
  },
  filtroContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  textoFiltro: {
    fontSize: 14,
    color: "#4A4A4A",
    marginRight: 8,
  },
  botonCargando: {
    flexDirection: "row",
    alignItems: "center",
  },
  textoBotonCargando: {
    marginLeft: 10,
    color: "#1A1A1A",
    fontSize: 16,
    fontWeight: "600",
  },
});
