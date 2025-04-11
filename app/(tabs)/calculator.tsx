import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';


export default function RoomBudgetingScreen() {
  const [rooms, setRooms] = useState<string[]>([]);
  const [budgets, setBudgets] = useState<{ [key: string]: string }>({});
  const [total, setTotal] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // State for the selected date
  const [openDatePicker, setOpenDatePicker] = useState(false); // State to control date picker visibility

  useEffect(() => {
    loadRooms();
    loadBudgets();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadRooms();
    }, [])
  );

  const loadRooms = async () => {
    const savedRooms = await AsyncStorage.getItem('rooms');
    if (savedRooms) {
      setRooms(JSON.parse(savedRooms));
    }
  };

  const loadBudgets = async () => {
    const savedBudgets = await AsyncStorage.getItem('budgets');
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
  };

  const handleBudgetChange = (room: string, value: string) => {
    setBudgets((prev) => ({ ...prev, [room]: value }));
  };

  const saveBudgets = async () => {
    await AsyncStorage.setItem('budgets', JSON.stringify(budgets));
  };

  const calculateTotal = async () => {
    const sum = Object.values(budgets).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
    setTotal(sum);

    // Save the total and timestamp to AsyncStorage
    const previousCalculations = JSON.parse(await AsyncStorage.getItem('calculations') || '[]');
    const newCalculation = { total: sum, date: moment(selectedDate).format('YYYY-MM-DD') }; // Use selected date
    const updatedCalculations = [...previousCalculations, newCalculation];

    await AsyncStorage.setItem('calculations', JSON.stringify(updatedCalculations));
    await saveBudgets();
  };

  const clearAllValues = async () => {
    await AsyncStorage.removeItem('budgets');
    await AsyncStorage.removeItem('dailyTotal');
    setBudgets({});
    setTotal(0);
  };

  const showDatePicker = () => {
    setOpenDatePicker(true);
  };

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || selectedDate;
    setOpenDatePicker(false); // Close date picker after selection
    setSelectedDate(currentDate);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <ThemedView style={{ padding: 40 }}>
      {/* Date display */}
      <ThemedText style={{ fontSize: 18, marginBottom: 10 }}>
        Selected Date: {moment(selectedDate).format('MMMM D, YYYY')}
      </ThemedText>
      
      {/* Button to change the date */}
      <TouchableOpacity onPress={showDatePicker} style={{ marginBottom: 20 }}>
        <Text style={{ color: 'blue' }}>Change Date</Text>
      </TouchableOpacity>

      {/* DateTimePicker Modal */}
      {openDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <FlatList
        data={rooms}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View>
            <ThemedText>{item}</ThemedText>
            <TextInput
              placeholder="Enter amount"
              keyboardType="numeric"
              value={budgets[item] || ''}
              onChangeText={(value) => handleBudgetChange(item, value)}
              onBlur={saveBudgets} // Save on input blur
              style={styles.textBox}
            />
          </View>
        )}
      />
      <Button title="Calculate Total" onPress={calculateTotal} />
      <ThemedText>Total: MVR {total}</ThemedText>
      <Button title="Clear All Values" onPress={clearAllValues} color="red" />
    </ThemedView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  textBox: {
    borderBottomWidth: 1, 
    marginBottom: 10, 
    backgroundColor: 'white',
    color: 'black'
  },
})