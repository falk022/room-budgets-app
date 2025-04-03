import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart } from 'react-native-chart-kit';
import moment from 'moment';

export default function AnalyticsScreen() {
  const [monthlyData, setMonthlyData] = useState<{ month: string; total: number }[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadCalculations();
    }, [])
  );

  const loadCalculations = async () => {
    const savedCalculations = await AsyncStorage.getItem('calculations');
    if (savedCalculations) {
      const parsedCalculations = JSON.parse(savedCalculations);

      // Group calculations by month
      const totalsByMonth: { [key: string]: number } = {};

      parsedCalculations.forEach((calc: { total: number; date: string }) => {
        const month = moment(calc.date, 'YYYY-MM-DD').format('MMM YYYY'); // Shortened month names
        totalsByMonth[month] = (totalsByMonth[month] || 0) + calc.total;
      });

      // Convert to array format for chart
      const formattedData = Object.keys(totalsByMonth).map((month) => ({
        month,
        total: totalsByMonth[month],
      }));

      setMonthlyData(formattedData);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }} contentContainerStyle={{ flexGrow: 1 }}>
  <View>
    <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
      Monthly Budget Analytics
    </Text>

    {monthlyData.length > 0 ? (
      <ScrollView horizontal>
        <ScrollView>
          <BarChart
            data={{
              labels: monthlyData.map((data) => data.month),
              datasets: [{ data: monthlyData.map((data) => data.total) }],
            }}
            width={monthlyData.length * 50} // Dynamic width for better spacing
            height={monthlyData.length * 50} // Dynamic height for better spacing
            yAxisLabel="MVR "
            fromZero
            showValuesOnTopOfBars
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#f7f7f7',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              barPercentage: 0.6, // Adjust bar width
            }}
            style={{ borderRadius: 10 }}

            
            
            verticalLabelRotation={90}
            horizontalLabelRotation ={0}
          />
          
        </ScrollView>
      </ScrollView>
    ) : (
      <Text style={{ textAlign: 'center', marginTop: 20 }}>No data available</Text>
    )}
  </View>
</ScrollView>
  );
}
