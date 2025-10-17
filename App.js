import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Modal, Alert, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as Notifications from 'expo-notifications';

const Tab = createMaterialTopTabNavigator();

// Simulate test data
const initialInventory = [
  { id: '1', name: 'Widget A', quantity: 5 },
  { id: '2', name: 'Widget B', quantity: 2 },
];
const initialMemos = [
  { id: '1', text: 'Call supplier for more screws' },
  { id: '2', text: 'Clean storage shelves' },
];

function InventoryScreen() {
  const [inventory, setInventory] = useState(initialInventory);
  const [modalVisible, setModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const addItem = () => {
    if (!newItemName.trim()) return;
    const newItem = { id: Date.now().toString(), name: newItemName, quantity: 0 };
    setInventory([...inventory, newItem]);
    setNewItemName('');
    setModalVisible(false);
  };

  const removeItem = (id) => setInventory(inventory.filter(item => item.id !== id));

  const updateQuantity = (id, change) => {
    setInventory(inventory.map(item =>
      item.id === id ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
    ));
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={inventory}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>{item.name}</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.button}>
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.button}>
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteButton}>
                <Text style={styles.deleteText}>X</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <Button title="Add Item" color="#00bfa5" onPress={() => setModalVisible(true)} />
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <TextInput
              placeholder="Enter item name"
              placeholderTextColor="#aaa"
              value={newItemName}
              onChangeText={setNewItemName}
              style={styles.input}
            />
            <Button title="Add" color="#00bfa5" onPress={addItem} />
            <Button title="Cancel" color="gray" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function MemosScreen() {
  const [memos, setMemos] = useState(initialMemos);
  const [newMemo, setNewMemo] = useState('');

  const addMemo = () => {
    if (!newMemo.trim()) return;
    setMemos([...memos, { id: Date.now().toString(), text: newMemo }]);
    setNewMemo('');
  };

  const confirmDeleteMemo = (id, text) => {
    Alert.alert(
      'Delete Memo',
      `Are you sure you want to delete:\n"${text}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeMemo(id) },
      ],
      { cancelable: true }
    );
  };

  const removeMemo = (id) => setMemos(memos.filter(m => m.id !== id));

  return (
    <View style={styles.container}>
      <FlatList
        data={memos}
        keyExtractor={m => m.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => confirmDeleteMemo(item.id, item.text)}>
            <Text style={styles.memoText}>• {item.text}</Text>
          </TouchableOpacity>
        )}
      />
      <TextInput
        placeholder="New memo..."
        placeholderTextColor="#aaa"
        value={newMemo}
        onChangeText={setNewMemo}
        style={styles.input}
      />
      <Button title="Add Memo" color="#00bfa5" onPress={addMemo} />
    </View>
  );
}


function SettingsScreen() {
  const [reminderEnabled, setReminderEnabled] = useState(false);

  useEffect(() => {
    if (reminderEnabled) {
      const interval = setInterval(() => {
        Notifications.scheduleNotificationAsync({
          content: { title: 'Memo Reminder', body: 'You have active memos!' },
          trigger: null,
        });
      }, 3600000); // every hour
      return () => clearInterval(interval);
    }
  }, [reminderEnabled]);

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Hourly Reminders</Text>
      <Button
        title={reminderEnabled ? "Turn Off Reminders" : "Turn On Reminders"}
        color={reminderEnabled ? "gray" : "#00bfa5"}
        onPress={() => setReminderEnabled(!reminderEnabled)}
      />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
<Tab.Navigator
  screenOptions={{
    tabBarStyle: { backgroundColor: '#000', marginTop: 35, elevation: 5 },
    tabBarActiveTintColor: '#00bfa5',
    tabBarInactiveTintColor: '#fff',
    tabBarLabelStyle: { fontSize: 16, fontWeight: 'bold' },
    tabBarIndicatorStyle: { backgroundColor: '#00bfa5', height: 3 },
  }}
>
        <Tab.Screen name="Inventory" component={InventoryScreen} />
        <Tab.Screen name="Memos" component={MemosScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingTop: 20,       // moved content down from the top
    paddingBottom: 70,    // moved content up from the bottom
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#333',
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  itemText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#00bfa5',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantity: {
    color: '#fff',
    fontSize: 18,
    marginHorizontal: 5,
  },
  deleteButton: {
    marginLeft: 8,
  },
  deleteText: {
    color: 'orange',
    fontWeight: 'bold',
  },
  memoText: {
    color: '#fff',
    fontSize: 18,
    paddingVertical: 8,
  },
  input: {
    backgroundColor: '#111',
    color: '#fff',
    borderColor: '#00bfa5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});

