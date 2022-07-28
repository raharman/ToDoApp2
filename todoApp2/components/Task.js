import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  NativeBaseProvider,
  Checkbox,
  Text,
  DeleteIcon,
  VStack,
  Toast,
} from "native-base";
import { db } from "../firebase";
import { doc, deleteDoc, setDoc } from "firebase/firestore";

/* Timestamp converter */
/* import moment from "moment-timezone"; */

const Task = (props) => {
  function handleDeletion() {
    deleteDoc(doc(db, "Lists", props.listId, "tasks", props.id))
      .then(() => {
        props.onRefresh();
      })
      .catch((error) => {
        Toast.show({ title: error.message });
      });
  }

  function handleUpdate(value, merge) {
    const docRef = doc(db, "Lists", props.listId, "tasks", props.id);

    setDoc(docRef, value, { merge: merge })
      .then(() => {
        props.onRefresh();
      })
      .catch((error) => {
        Toast.show({ title: error.message });
      });
  }

  return (
    <NativeBaseProvider>
      <View style={styles.item}>
        <View style={styles.itemLeft}>
          <View>
            <Text style={styles.itemTitle}>{props.title}</Text>
            <View>
              <Text style={styles.itemLabel}>{props.text}</Text>
              <Text style={styles.itemDeadline}>
                {/* Timestamp calculation + format */}
                {/* {moment(props.time.toDate()).format("DD.MM.YYYY hh:MM")} */}
                {props.time}
              </Text>
            </View>
          </View>
        </View>
        <VStack space={2} alignItems="center">
          <TouchableOpacity onPress={() => handleDeletion()}>
            <DeleteIcon size={6} />
          </TouchableOpacity>
          <Checkbox
            value="isCompleted"
            accessibilityLabel="checkbox-1"
            defaultIsChecked={props.isCompleted}
            onChange={() =>
              handleUpdate(
                { task_isCompleted: props.isCompleted ? false : true },
                true
              )
            }
          />
        </VStack>
      </View>
    </NativeBaseProvider>
  );
};

export default Task;

const styles = StyleSheet.create({
  item: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    paddingVertical: 30,
    borderRadius: 10,
    marginVertical: 20,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  itemTitle: {
    fontWeight: "bold",
    fontSize: 20,
  },
  itemLabel: {
    fontSize: 16,
  },
  itemDeadline: {
    fontSize: 16,
  },
});
