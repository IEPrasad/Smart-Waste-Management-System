import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SchedulePickupScreen() {
  const router = useRouter();
  
  // State
  const [selectedDate, setSelectedDate] = useState(15);
  const [currentMonth, setCurrentMonth] = useState(0); // January = 0
  const [currentYear, setCurrentYear] = useState(2026);
  const [wasteTypes, setWasteTypes] = useState({
    compost: false,
    recycling: false,
  });
  const [comment, setComment] = useState('');

  // Calendar logic
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Previous month's days
    const prevMonthDays = getDaysInMonth(currentMonth - 1, currentYear);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isPast: true,
      });
    }

    // Current month's days
    const today = new Date();
    const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const isPast = isCurrentMonth && i < today.getDate();
      days.push({
        day: i,
        isCurrentMonth: true,
        isPast,
      });
    }

    return days;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const toggleWasteType = (type: 'compost' | 'recycling') => {
    setWasteTypes({
      ...wasteTypes,
      [type]: !wasteTypes[type],
    });
  };

  const handleConfirm = () => {
    // Validation
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    const selectedTypes = [];
    if (wasteTypes.compost) selectedTypes.push('Compost');
    if (wasteTypes.recycling) selectedTypes.push('Recycling');

    if (selectedTypes.length === 0) {
      Alert.alert('Error', 'Please select at least one waste type');
      return;
    }

    // Success
    Alert.alert(
      'Pickup Scheduled!',
      `Date: ${monthNames[currentMonth]} ${selectedDate}, ${currentYear}\nWaste Types: ${selectedTypes.join(', ')}\nComment: ${comment || 'None'}`,
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const calendarDays = generateCalendarDays();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Pickup</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Select Date Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          
          {/* Calendar */}
          <View style={styles.calendarContainer}>
            {/* Month Navigation */}
            <View style={styles.monthNavigation}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.monthArrow}>
                <Ionicons name="chevron-back" size={20} color="#000000" />
              </TouchableOpacity>
              <Text style={styles.monthYear}>
                {monthNames[currentMonth]} {currentYear}
              </Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.monthArrow}>
                <Ionicons name="chevron-forward" size={20} color="#000000" />
              </TouchableOpacity>
            </View>

            {/* Day Headers */}
            <View style={styles.dayHeaderRow}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Text key={day} style={styles.dayHeader}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {calendarDays.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dayCell}
                  onPress={() => {
                    if (item.isCurrentMonth && !item.isPast) {
                      setSelectedDate(item.day);
                    }
                  }}
                  disabled={!item.isCurrentMonth || item.isPast}
                >
                  <View
                    style={[
                      styles.dayCellInner,
                      selectedDate === item.day && item.isCurrentMonth && styles.selectedDay,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !item.isCurrentMonth && styles.dayTextDisabled,
                        item.isPast && styles.dayTextPast,
                        selectedDate === item.day && item.isCurrentMonth && styles.selectedDayText,
                      ]}
                    >
                      {item.day}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Waste Type Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Waste Type</Text>
          
          {/* Compost */}
          <TouchableOpacity
            style={styles.wasteTypeCard}
            onPress={() => toggleWasteType('compost')}
          >
            <View style={styles.wasteTypeLeft}>
              <View style={[styles.checkbox, wasteTypes.compost && styles.checkboxChecked]}>
                {wasteTypes.compost && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
              <Ionicons name="leaf" size={20} color="#10B981" />
              <Text style={styles.wasteTypeText}>Compost</Text>
            </View>
          </TouchableOpacity>

          {/* Recycling */}
          <TouchableOpacity
            style={styles.wasteTypeCard}
            onPress={() => toggleWasteType('recycling')}
          >
            <View style={styles.wasteTypeLeft}>
              <View style={[styles.checkbox, wasteTypes.recycling && styles.checkboxChecked]}>
                {wasteTypes.recycling && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
              <Ionicons name="sync" size={20} color="#3B82F6" />
              <Text style={styles.wasteTypeText}>Recycling</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Comment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comment</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Add your comment (optional)"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmButtonText}>Confirm Pickup</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  headerSpacer: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 18,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 10,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
  },
  monthArrow: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYear: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  dayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayHeader: {
    width: 36,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: -35,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellInner: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDay: {
    backgroundColor: '#10B981',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000000',
  },
  dayTextDisabled: {
    color: '#D1D5DB',
  },
  dayTextPast: {
    color: '#D1D5DB',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  wasteTypeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wasteTypeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  wasteTypeText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
  },
  commentInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 10,
    fontSize: 13,
    color: '#000000',
    minHeight: 70,
  },
  confirmButton: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 12,
    marginHorizontal: 18,
    marginTop: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
