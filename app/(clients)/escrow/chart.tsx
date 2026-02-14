import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

export default function ExpenseChart() {
  const barData = [
    { 
      value: 566.3, 
      label: 'Mon', 
      frontColor: '#4A90E2',
      topLabelComponent: () => (
        <Text style={{ fontSize: 10, color: '#8B92A7' }}>₦566.3k</Text>
      )
    },
    { value: 50, label: 'Tue', frontColor: '#4A90E2' },
    { value: 150, label: 'Wed', frontColor: '#4A90E2' },
    { 
      value: 952.94, 
      label: 'Thu', 
      frontColor: '#4A90E2',
      topLabelComponent: () => (
        <Text style={{ fontSize: 10, color: '#8B92A7' }}>₦386.7k</Text>
      )
    },
    { value: 250, label: 'Fri', frontColor: '#4A90E2' },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.dropdown}>
        <Text style={styles.dropdownText}>This Week</Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={styles.statHeader}>
            <View style={styles.dot} />
            <Text style={styles.statLabel}>Money In</Text>
          </View>
          <Text style={styles.statValue}>#0.00</Text>
        </View>

        <View style={styles.statItem}>
          <View style={styles.statHeader}>
            <View style={styles.dot} />
            <Text style={styles.statLabel}>Money Out</Text>
          </View>
          <Text style={styles.statValue}>#952,940.00</Text>
        </View>
      </View>

      <BarChart
        data={barData}
        barWidth={22}
        spacing={30}
        roundedTop
        roundedBottom
        hideRules
        xAxisThickness={0}
        yAxisThickness={0}
        yAxisTextStyle={styles.yAxisText}
        noOfSections={3}
        maxValue={1000}
        isAnimated
        animationDuration={800}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FD',
    borderRadius: 20,
    padding: 20,
    margin: 16,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8EEFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  dropdownText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 6,
  },
  dropdownIcon: {
    color: '#4A90E2',
    fontSize: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statItem: {
    flex: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
    marginRight: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#8B92A7',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1D2E',
  },
  yAxisText: {
    fontSize: 11,
    color: '#8B92A7',
  },
});