import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, Button, FlatList, TouchableOpacity, 
  TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from "@/hooks/useColorScheme";

export default function ManageRoomsScreen() {
  const [roomName, setRoomName] = useState('');
  const [rooms, setRooms] = useState<string[]>([]);
  const inputRef = useRef<TextInput | null>(null); // Reference for TextInput

  const colorScheme = useColorScheme();

  useEffect(() => {
    loadRooms();
  }, []);

  // Load rooms from AsyncStorage
  const loadRooms = async () => {
    const savedRooms = await AsyncStorage.getItem('rooms');
    if (savedRooms) {
      setRooms(JSON.parse(savedRooms));
    }
  };

  // Add a new room
  const addRoom = async () => {
    if (!roomName.trim()) return;
    const newRooms = [...rooms, roomName];
    setRooms(newRooms);
    await AsyncStorage.setItem('rooms', JSON.stringify(newRooms));
    setRoomName('');

    inputRef.current?.focus(); // Auto-focus on TextInput after adding a room
  };

  // Remove a room and its associated budget
  const removeRoom = async (roomToRemove: string) => {
    const updatedRooms = rooms.filter(room => room !== roomToRemove);
    setRooms(updatedRooms);
    await AsyncStorage.setItem('rooms', JSON.stringify(updatedRooms));

    // Remove the budget for the removed room
    const savedBudgets = await AsyncStorage.getItem('budgets');
    if (savedBudgets) {
      const updatedBudgets = JSON.parse(savedBudgets);
      delete updatedBudgets[roomToRemove]; // Remove the specific budget for the room
      await AsyncStorage.setItem('budgets', JSON.stringify(updatedBudgets));
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ padding: 40, flex: 1 }}>
            <Text style={{ fontWeight: 'bold', padding: 5 }}>Manage Rooms:</Text>
            <TextInput
              autoFocus={true} // Automatically pops up the keyboard
              ref={inputRef} // Attach ref to the TextInput
              value={roomName}
              onChangeText={setRoomName}
              placeholder="Enter room name"
              style={{ borderBottomWidth: 1, marginBottom: 10 }}
            />
            <Button title="Add Room" onPress={addRoom} />
            
            <Text style={{ padding: 5, fontWeight: 'bold' }}>Added Rooms:</Text>
            <FlatList
              style={{ padding: 5 }}
              data={rooms}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>{item}</Text>
                  <TouchableOpacity onPress={() => removeRoom(item)}>
                    <Text style={{ color: 'red' }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
