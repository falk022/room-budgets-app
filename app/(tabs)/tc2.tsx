import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function TestCalculateScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  // State to hold the calculation data
  const [total, setTotal] = useState(0);
  const [date, setDate] = useState('');

  // Function to update the state whenever the route params change (i.e., when a new calculation is selected)
  useEffect(() => {
    if (route.params?.calculation) {
      const { calculation } = route.params;
      setTotal(calculation.total);
      setDate(calculation.date);
    }
  }, [route.params?.calculation]);

  // Function to handle the save of the updated calculation
  const saveCalculation = async () => {
    if (isNaN(total) || total <= 0 || !date) {
      Alert.alert('Error', 'Please provide a valid total and date.');
      return;
    }

    // Load the existing calculations from AsyncStorage
    const savedCalculations = await AsyncStorage.getItem('calculations');
    const calculations = savedCalculations ? JSON.parse(savedCalculations) : [];

    // Update the calculation at the specified index
    const { index } = route.params;
    calculations[index] = { total, date };

    // Save the updated calculations array back to AsyncStorage
    await AsyncStorage.setItem('calculations', JSON.stringify(calculations));

    // Notify the user and navigate back to the calculations screen
    Alert.alert('Success', 'Calculation updated successfully!');
    navigation.goBack(); // Go back to the calculations screen
  };

  // Handle change in total value to prevent NaN when input is empty
  const handleTotalChange = (text: string) => {
    const parsedValue = parseFloat(text);
    setTotal(isNaN(parsedValue) || text === "" ? 0 : parsedValue);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ padding: 20, flex: 1 }}>
        <TextInput
          value={total.toString()}
          onChangeText={handleTotalChange}
          placeholder="Enter total"
          keyboardType="numeric"
          style={{ marginBottom: 10, borderWidth: 1, padding: 8 }}
        />
        <TextInput
          value={date}
          onChangeText={(text) => setDate(text)}
          placeholder="Enter date"
          style={{ marginBottom: 20, borderWidth: 1, padding: 8 }}
        />
        <Button title="Save Calculation" onPress={saveCalculation} />
      </View>
    </TouchableWithoutFeedback>
  );
}
