import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TextInput,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import Task from "../components/Task";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  onSnapshot,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import {
  Fab,
  Icon,
  Box,
  Center,
  NativeBaseProvider,
  FormControl,
  Input,
  Button,
  AddIcon,
  CheckIcon,
  WarningOutlineIcon,
  Toast,
  Modal,
  VStack,
  Divider,
  Select,
  HStack,
} from "native-base";
import { Ionicons, AntDesign } from "@expo/vector-icons";

const SelectedScreen = ({ route, navigation }) => {
  /* props */
  const { title, listId } = route.params;

  /* tasks state */
  const [tasks, setTasks] = useState([]);

  /* modal */
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  /* task data */
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState("");

  /* firebase query - all tasks */
  const collectionRef = collection(db, "Lists", listId, "tasks");
  const queryAll = collectionRef;

  /* firebase query - active tasks */
  const queryActive = query(
    collectionRef,
    where("task_isCompleted", "==", false)
  );

  /* firebase query - completed tasks */
  const queryCompleted = query(
    collectionRef,
    where("task_isCompleted", "==", true)
  );

  /* filter state */
  const [filterValue, setFilterValue] = useState(queryAll);

  /* update filter */
  const updateFilter = (value) => {
    if (value == "queryActive") {
      setFilterValue(queryActive);
    } else if (value == "queryCompleted") {
      setFilterValue(queryCompleted);
    } else {
      setFilterValue(queryAll);
    }
    getTasks(filterValue);
  };

  /* getTask from firebase db */
  const getTasks = async () => {
    let data;
    data = await getDocs(filterValue);
    data = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setTasks(data);
  };

  /* refresh */
  const [refreshing, setRefreshing] = useState(false);

  const wait = (timeout) => {
    return new Promise((resolve) => setTimeout(resolve, timeout));
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getTasks(filterValue);
    wait(500).then(() => setRefreshing(false));
  }, []);

  /* addTask to firebase db */
  const handleAddTask = () => {
    const myDoc = doc(db, "Lists", listId, "tasks", taskTitle);

    const docData = {
      task_deadline: taskDeadline,
      task_description: taskDescription,
      task_isCompleted: false,
      task_title: taskTitle,
    };

    setDoc(myDoc, docData)
      .then(() => {
        Toast.show({ title: "Úloha vytvorená!" });
      })
      .catch((error) => {
        Toast.show({ title: error.message });
      });

    setShowModal(false);
    setTaskTitle("");
    setTaskDescription("");
    setTaskDeadline("");
    onRefresh();
    tasks.length + 1;
  };

  /* searchBar */
  const [search, setSearch] = useState("");

  const onChangeText = useCallback((search) => {
    setSearch(search);
  }, []);

  /* form */
  const [formData, setData] = useState({});
  const [errors, setErrors] = useState({});

  const validateTitle = () => {
    if (formData.title === undefined) {
      setErrors({ ...errors, title: "Názov je povinný" });
      return false;
    } else if (formData.title.length < 3) {
      setErrors({ ...errors, title: "Názov je príliš krátky" });
      return false;
    }
    setTaskTitle(formData.title);
    return true;
  };

  const validateDescription = () => {
    if (formData.description === undefined) {
      setErrors({ ...errors, description: "Popis je povinný" });
      return false;
    } else if (formData.description.length < 3) {
      setErrors({ ...errors, description: "Popis je príliš krátky" });
      return false;
    }
    setTaskDescription(formData.description);
    return true;
  };
  const validateDeadline = () => {
    if (formData.deadline === undefined) {
      setErrors({ ...errors, deadline: "Dátum je povinný" });
      return false;
    }
    setTaskDeadline(formData.deadline);
    return true;
  };

  const onSubmit = () => {
    validateTitle() && validateDescription() && validateDeadline()
      ? [setErrors({}), handleAddTask(), setShowModal(false), onRefresh()]
      : console.log("Chyba");
    setData("");
  };

  useEffect(() => {
    getTasks(filterValue);

    /* REALTIME DATA */
    /* 
      onSnapshot(query, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          tasks.push(doc.data());
        });
      }); 
      */

    navigation.setOptions({
      title: title,
      headerStyle: {
        borderBottomWidth: 0,
      },
    });
  }, []);

  if (tasks.length > 0) {
    /* task render */
    return (
      <NativeBaseProvider>
        {/* search bar & filter */}
        <HStack space={3} justifyContent="center" my={3}>
          <VStack
            space={10}
            w="50%"
            divider={
              <Box px="2">
                <Divider />
              </Box>
            }
          >
            <VStack w="100%" space={5} alignSelf="center">
              <Input
                placeholder="Vyhľadať"
                fontSize={16}
                variant="filled"
                backgroundColor={"white"}
                width="100%"
                py="3"
                px="3"
                borderWidth="1"
                onChangeText={onChangeText}
                value={search}
                InputLeftElement={
                  <Icon
                    ml="2"
                    size="4"
                    color="black.400"
                    as={<Ionicons name="ios-search" />}
                  />
                }
              />
            </VStack>
          </VStack>
          <Select
            fontSize={16}
            variant={"filled"}
            backgroundColor={"white"}
            borderWidth="1"
            borderColor={"white"}
            py="3"
            px="3"
            width={125}
            minWidth="1"
            accessibilityLabel="SelectFilter"
            placeholder={
              queryAll ? "Všetky" : queryActive ? "Aktívne" : "Dokončené"
            }
            _selectedItem={{
              bg: "teal.600",
              endIcon: <CheckIcon size="5" />,
            }}
            onValueChange={(itemValue) => updateFilter(itemValue)}
          >
            <Select.Item label="Dokončené" value={"queryCompleted"} />
            <Select.Item label="Aktívne" value={"queryActive"} />
            <Select.Item label="Všetky" value={"queryAll"} />
          </Select>
        </HStack>

        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.buttonContainer}>
            {tasks
              .sort(function (a, b) {
                if (a.title > b.title) return 1;
                if (a.title < b.title) return -1;
                return 0;
              })
              .filter((task) =>
                task.task_title.toLowerCase().includes(search.toLowerCase())
              )
              .map((task, key) => {
                return (
                  <Task
                    title={task.task_title}
                    text={task.task_description}
                    time={task.task_deadline}
                    isCompleted={task.task_isCompleted}
                    key={key}
                    listId={listId}
                    onRefresh={onRefresh}
                  />
                );
              })}
          </View>
          {/* task creation */}
          <View style={styles.container}>
            <Fab
              renderInPortal={false}
              shadow={8}
              size="sm"
              icon={<AddIcon size={6} />}
              placement={"top-right"}
              onPress={toggleModal}
            />
            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
              <Modal.Content maxWidth="400px">
                <Modal.CloseButton />
                <Modal.Header>Pridať úlohu</Modal.Header>
                <Modal.Body>
                  <FormControl isRequired isInvalid={"title" in errors}>
                    <FormControl.Label
                      _text={{
                        bold: true,
                      }}
                    >
                      Názov
                    </FormControl.Label>
                    <Input
                      placeholder="Moja nová úloha"
                      onChangeText={(value) =>
                        setData({ ...formData, title: value })
                      }
                    />
                    {"title" in errors ? (
                      <FormControl.ErrorMessage style={{ color: "red" }}>
                        Názov musí obsahovať minimálne 3 znaky
                      </FormControl.ErrorMessage>
                    ) : (
                      <FormControl.HelperText>
                        Názov musí obsahovať minimálne 3 znaky
                      </FormControl.HelperText>
                    )}
                  </FormControl>

                  <FormControl isRequired isInvalid={"description" in errors}>
                    <FormControl.Label
                      _text={{
                        bold: true,
                      }}
                    >
                      Popis
                    </FormControl.Label>
                    <Input
                      placeholder="Môj popis k úlohe"
                      onChangeText={(value) =>
                        setData({ ...formData, description: value })
                      }
                    />
                    {"description" in errors ? (
                      <FormControl.ErrorMessage style={{ color: "red" }}>
                        Popis musí obsahovať minimálne 3 znaky
                      </FormControl.ErrorMessage>
                    ) : (
                      <FormControl.HelperText>
                        Popis musí obsahovať minimálne 3 znaky
                      </FormControl.HelperText>
                    )}
                  </FormControl>

                  <FormControl isRequired isInvalid={"deadline" in errors}>
                    <FormControl.Label
                      _text={{
                        bold: true,
                      }}
                    >
                      Dátum
                    </FormControl.Label>
                    <Input
                      placeholder="1.1.2030"
                      onChangeText={(value) =>
                        setData({ ...formData, deadline: value })
                      }
                    />
                    {"deadline" in errors ? (
                      <FormControl.ErrorMessage style={{ color: "red" }}>
                        Dátum je povinný
                      </FormControl.ErrorMessage>
                    ) : (
                      <FormControl.HelperText>
                        Dátum je povinný
                      </FormControl.HelperText>
                    )}
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
                    <Button onPress={onSubmit} mt="5" colorScheme="cyan">
                      Uložiť
                    </Button>
                  </Button.Group>
                </Modal.Footer>
              </Modal.Content>
            </Modal>
          </View>
        </ScrollView>
      </NativeBaseProvider>
    );
  } else {
    return (
      /* task creation */
      <NativeBaseProvider>
        {/* search bar & filter */}
        <HStack space={3} justifyContent="center" my={3}>
          <VStack
            space={10}
            w="50%"
            divider={
              <Box px="2">
                <Divider />
              </Box>
            }
          >
            <VStack w="100%" space={5} alignSelf="center">
              <Input
                placeholder="Vyhľadať"
                fontSize={16}
                variant="filled"
                backgroundColor={"white"}
                width="100%"
                py="3"
                px="3"
                borderWidth="1"
                onChangeText={onChangeText}
                value={search}
                InputLeftElement={
                  <Icon
                    ml="2"
                    size="4"
                    color="black.400"
                    as={<Ionicons name="ios-search" />}
                  />
                }
              />
            </VStack>
          </VStack>
          <Select
            fontSize={16}
            variant={"filled"}
            backgroundColor={"white"}
            borderWidth="1"
            borderColor={"white"}
            py="3"
            px="3"
            width={125}
            defaultValue={queryAll}
            minWidth="1"
            accessibilityLabel="SelectFilter"
            placeholder={
              queryAll ? "Všetky" : queryActive ? "Aktívne" : "Dokončené"
            }
            _selectedItem={{
              bg: "teal.600",
              endIcon: <CheckIcon size="5" />,
            }}
            onValueChange={(itemValue) => updateFilter(itemValue)}
          >
            <Select.Item label="Dokončené" value={"queryCompleted"} />
            <Select.Item label="Aktívne" value={"queryActive"} />
            <Select.Item label="Všetky" value={"queryAll"} />
          </Select>
        </HStack>
        <View style={styles.container}>
          <Text style={styles.initialText}>Vytvor si tvoju dennú úlohu!</Text>
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
                <Modal.Header>Pridať úlohu</Modal.Header>
                <Modal.Body>
                  <FormControl isRequired isInvalid={"title" in errors}>
                    <FormControl.Label
                      _text={{
                        bold: true,
                      }}
                    >
                      Názov
                    </FormControl.Label>
                    <Input
                      placeholder="Moja úloha"
                      onChangeText={(value) =>
                        setData({ ...formData, title: value })
                      }
                    />
                    {"title" in errors ? (
                      <FormControl.ErrorMessage style={{ color: "red" }}>
                        Názov musí obsahovať minimálne 3 znaky
                      </FormControl.ErrorMessage>
                    ) : (
                      <FormControl.HelperText>
                        Názov musí obsahovať minimálne 3 znaky
                      </FormControl.HelperText>
                    )}
                  </FormControl>

                  <FormControl isRequired isInvalid={"description" in errors}>
                    <FormControl.Label
                      _text={{
                        bold: true,
                      }}
                    >
                      Popis
                    </FormControl.Label>
                    <Input
                      placeholder="Môj popis k úlohe"
                      onChangeText={(value) =>
                        setData({ ...formData, description: value })
                      }
                    />
                    {"description" in errors ? (
                      <FormControl.ErrorMessage style={{ color: "red" }}>
                        Popis musí obsahovať minimálne 3 znaky
                      </FormControl.ErrorMessage>
                    ) : (
                      <FormControl.HelperText>
                        Popis musí obsahovať minimálne 3 znaky
                      </FormControl.HelperText>
                    )}
                  </FormControl>

                  <FormControl isRequired isInvalid={"deadline" in errors}>
                    <FormControl.Label
                      _text={{
                        bold: true,
                      }}
                    >
                      Dátum
                    </FormControl.Label>
                    <Input
                      placeholder="1.1.2030"
                      onChangeText={(value) =>
                        setData({ ...formData, deadline: value })
                      }
                    />
                    {"deadline" in errors ? (
                      <FormControl.ErrorMessage style={{ color: "red" }}>
                        Dátum je povinný
                      </FormControl.ErrorMessage>
                    ) : (
                      <FormControl.HelperText>
                        Dátum je povinný
                      </FormControl.HelperText>
                    )}
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
                    <Button onPress={onSubmit} mt="5" colorScheme="cyan">
                      Uložiť
                    </Button>
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

export default SelectedScreen;

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
    backgroundColor: "#E1E1E1",
    width: "100%",
    paddingHorizontal: 15,
    paddingVertical: 30,
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
    width: "100%",
    textAlign: "center",
  },
  buttonDescription: {
    fontSize: 16,
  },
  buttonDeadline: {
    fontSize: 16,
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
  formInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 4,
    padding: 4,
  },
});
