import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import {
  Fab,
  Icon,
  Center,
  NativeBaseProvider,
  Modal,
  FormControl,
  Input,
  Button,
  AddIcon,
  Toast,
  DeleteIcon,
} from "native-base";
import { AntDesign } from "@expo/vector-icons";

const HomeScreen = () => {
  /* navigation */
  const navigation = useNavigation();

  /* modals state */
  const [showModal, setShowModal] = useState(false);
  const [listTitle, setListTitle] = useState("");

  /* lists state && ref */
  const [lists, setLists] = useState([]);
  const listsCollectionRef = collection(db, "Lists");

  /* handle data changes */
  const handleListTitleChange = (text) => setListTitle(text);

  /* getLists from firebase db */
  const getLists = async () => {
    let data;
    data = await getDocs(listsCollectionRef);
    data = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setLists(data);
  };

  /* refresh */
  const [refreshing, setRefreshing] = useState(false);

  const wait = (timeout) => {
    return new Promise((resolve) => setTimeout(resolve, timeout));
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getLists();
    wait(2000).then(() => setRefreshing(false));
  }, []);

  /* addList to firebase db */
  const handleAddList = () => {
    const docRef = doc(db, "Lists", listTitle);

    const docData = {
      list_title: listTitle,
    };

    setDoc(docRef, docData)
      .then(() => {
        Toast.show({ title: "Zoznam vytvorený!" });
      })
      .catch((error) => {
        Toast.show({ title: error.message });
      });

    setShowModal(false);
    setListTitle("");
    onRefresh();
  };

  /* removeList from firebase db */
  function handleDeletion(listID) {
    deleteDoc(doc(db, "Lists", listID))
      .then(() => {
        Toast.show({ title: "Zoznam odstránený!" });
        onRefresh();
      })
      .catch((error) => {
        Toast.show({ title: error.message });
      });
  }

  useEffect(() => {
    getLists();
  }, []);

  if (lists.length > 0) {
    /* lists render */
    return (
      <NativeBaseProvider>
        <ScrollView>
          <View style={styles.buttonContainer}>
            {lists
              .sort(function (a, b) {
                if (a.title > b.title) return 1;
                if (a.title < b.title) return -1;
                return 0;
              })
              .map((list) => {
                return (
                  <TouchableOpacity
                    key={list.id}
                    onPress={() =>
                      navigation.navigate("Selected", {
                        title: list.list_title,
                        listId: list.id,
                      })
                    }
                    style={styles.button}
                  >
                    <Text style={styles.buttonHeader}>{list.list_title}</Text>
                    <TouchableOpacity
                      onPress={() => handleDeletion(list.list_title)}
                    >
                      <DeleteIcon size={6} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
          </View>
          {/* list creation */}
          <View style={styles.container}>
            <Fab
              renderInPortal={false}
              shadow={8}
              size="sm"
              icon={<AddIcon size={6} />}
              placement={"top-right"}
              onPress={() => setShowModal(true)}
            />
            <Center>
              <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                <Modal.Content maxWidth="400px">
                  <Modal.CloseButton />
                  <Modal.Header>Pridať zoznam</Modal.Header>
                  <Modal.Body>
                    <FormControl>
                      <FormControl.Label>Názov</FormControl.Label>
                      <Input
                        value={listTitle}
                        onChangeText={handleListTitleChange}
                      />
                    </FormControl>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button.Group space={2}>
                      <Button
                        variant="ghost"
                        colorScheme="blueGray"
                        onPress={() => {
                          setShowModal(false);
                        }}
                      >
                        Zatvoriť
                      </Button>
                      <Button onPress={() => handleAddList()}>Uložiť</Button>
                    </Button.Group>
                  </Modal.Footer>
                </Modal.Content>
              </Modal>
            </Center>
          </View>
        </ScrollView>
      </NativeBaseProvider>
    );
  } else {
    return (
      /* task creation */
      <NativeBaseProvider>
        <View style={styles.container}>
          <Text style={styles.initialText}>Vytvor si tvoj zoznam!</Text>
          <Fab
            renderInPortal={false}
            shadow={2}
            size="sm"
            icon={<Icon color="white" as={AntDesign} name="plus" size="sm" />}
            right={"43%"}
            left={"43%"}
            bottom={"35%"}
            onPress={() => setShowModal(true)}
          />
          <Center>
            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
              <Modal.Content maxWidth="400px">
                <Modal.CloseButton />
                <Modal.Header>Pridať zoznam</Modal.Header>
                <Modal.Body>
                  <FormControl>
                    <FormControl.Label>Názov</FormControl.Label>
                    <Input
                      value={listTitle}
                      onChangeText={handleListTitleChange}
                    />
                  </FormControl>
                </Modal.Body>
                <Modal.Footer>
                  <Button.Group space={2}>
                    <Button
                      variant="ghost"
                      colorScheme="blueGray"
                      onPress={() => {
                        setShowModal(false);
                      }}
                    >
                      Zatvoriť
                    </Button>
                    <Button onPress={() => handleAddList()}>Uložiť</Button>
                  </Button.Group>
                </Modal.Footer>
              </Modal.Content>
            </Modal>
          </Center>
        </View>
      </NativeBaseProvider>
    );
  }
};

export default HomeScreen;

const styles = StyleSheet.create({
  buttonContainer: {
    width: "80%",
    justifyContent: "center",
    marginLeft: "auto",
    marginRight: "auto",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    width: "100%",
    paddingHorizontal: 15,
    paddingVertical: 25,
    borderRadius: 10,
    marginVertical: 10,
    flexWrap: "wrap",
    alignContent: "center",
  },
  buttonHeader: {
    color: "#3C3C44",
    fontWeight: "700",
    fontSize: 20,
    marginBottom: 5,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  initialText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});
