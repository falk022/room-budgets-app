import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import moment from 'moment';

export default function CalculationsScreen() {
  const [calculations, setCalculations] = useState<{ total: number; date: string }[]>([]);
  const [filteredCalculations, setFilteredCalculations] = useState<{ total: number; date: string }[]>([]); // State for filtered calculations
  const [currentMonth, setCurrentMonth] = useState(moment().format('MMMM YYYY'));
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      loadCalculations();
    }, [currentMonth]) // Re-run loadCalculations whenever currentMonth changes
  );

  const loadCalculations = async () => {
    const savedCalculations = await AsyncStorage.getItem('calculations');
    if (savedCalculations) {
      const parsedCalculations = JSON.parse(savedCalculations);

    // Sort calculations by date in ascending order
    const sortedCalculations = parsedCalculations.sort((a, b) => 
      moment(a.date, 'YYYY-MM-DD').isBefore(moment(b.date, 'YYYY-MM-DD')) ? -1 : 1
    );

      setCalculations(sortedCalculations);
      filterCalculations(sortedCalculations, currentMonth); // Filter calculations based on the selected month
    }
  };

  const filterCalculations = (calculations: { total: number; date: string }[], month: string) => {
    const filtered = calculations.filter((calculation) =>
      moment(calculation.date, 'YYYY-MM-DD').format('MMMM YYYY') === month
    );
    setFilteredCalculations(filtered);
  };

  const removeCalculation = async (date: string, total: number) => {
    // Find the exact item in the original calculations array
    const updatedCalculations = calculations.filter(
      (calculation) => !(calculation.date === date && calculation.total === total)
    );
  
    setCalculations(updatedCalculations);
    await AsyncStorage.setItem('calculations', JSON.stringify(updatedCalculations));
  
    // Re-filter calculations after removal
    filterCalculations(updatedCalculations, currentMonth);
  };

  const handleEdit = (item: { total: number; date: string }, index: number) => {
    navigation.navigate('tc2', { calculation: item, index });
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prevMonth) =>
      moment(prevMonth, 'MMMM YYYY')
        .add(direction === 'next' ? 1 : -1, 'months')
        .format('MMMM YYYY')
    );
  };

  return (
    <ScrollView style={{ flex: 1, padding: 1 }}>
    <View style={{ padding: 40 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <TouchableOpacity onPress={() => changeMonth('prev')}>
          <Feather name="chevron-left" size={24} color="black" />
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderWidth: 1, borderRadius: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginHorizontal: 10 }}>{currentMonth}</Text>
        </View>

        <TouchableOpacity onPress={() => changeMonth('next')}>
          <Feather name="chevron-right" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('calculator')}>
          <Feather name="plus" size={24} color="black" style={{ marginLeft: 10 }} />
        </TouchableOpacity>
      </View>

    {/* Total for the Month */}
    <View style={{ marginBottom: 20, padding: 10, borderWidth: 2, borderRadius: 10, backgroundColor: '#f8f9fa' }}>
        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
          Total This Month: MVR {filteredCalculations.reduce((sum, item) => sum + item.total, 0)}
        </Text>
      </View>

      <FlatList
        data={filteredCalculations}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15, borderWidth: 2, padding: 10 }}>
            <View>
              <Text>Total: MVR {item.total}</Text>
              <Text>Date: {item.date}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              {/* Edit Calculation Button */}
              <TouchableOpacity style={{ marginRight: 10 }}>  
                <Feather name="edit" size={24} color="blue" />
              </TouchableOpacity>
              {/* Remove Calculation Button */}
              <TouchableOpacity onPress={() => removeCalculation(item.date, item.total)}>
                <Feather name="trash" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
    </ScrollView>
  );
}
