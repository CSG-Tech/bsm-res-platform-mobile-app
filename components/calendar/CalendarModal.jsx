import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';

const convertToArabicNumerals = (number) => {
  const arabicNumerals = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  return String(number).replace(/[0-9]/g, d => arabicNumerals[d]);
};

const CustomDay = ({ date, state, marking, onPress }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <TouchableOpacity
      onPress={() => onPress(date)}
      style={[
        styles.dayContainer,
        marking?.selected && styles.daySelected
      ]}
    >
      <Text
        style={[
          styles.dayText,
          state === 'disabled' && styles.dayDisabled,
          state === 'today' && !marking?.selected && styles.dayToday,
          marking?.selected && styles.daySelectedText
        ]}
      >
        {isRTL ? convertToArabicNumerals(date.day) : date.day}
      </Text>
    </TouchableOpacity>
  );
};

const StyledCalendarModal = ({ visible, onClose, onSelect, selectedDate, title }) => {
  const { i18n, t } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  // State for year and month pickers
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);
  
  const yearScrollRef = useRef(null);
  const monthScrollRef = useRef(null);

  // Generate year range (e.g., 1950 to 2100)
  const years = Array.from({ length: 151 }, (_, i) => 1950 + i);

  // Month names
  const months = [
    { value: '01', label: 'January', labelAr: 'يناير' },
    { value: '02', label: 'February', labelAr: 'فبراير' },
    { value: '03', label: 'March', labelAr: 'مارس' },
    { value: '04', label: 'April', labelAr: 'أبريل' },
    { value: '05', label: 'May', labelAr: 'مايو' },
    { value: '06', label: 'June', labelAr: 'يونيو' },
    { value: '07', label: 'July', labelAr: 'يوليو' },
    { value: '08', label: 'August', labelAr: 'أغسطس' },
    { value: '09', label: 'September', labelAr: 'سبتمبر' },
    { value: '10', label: 'October', labelAr: 'أكتوبر' },
    { value: '11', label: 'November', labelAr: 'نوفمبر' },
    { value: '12', label: 'December', labelAr: 'ديسمبر' }
  ];

  // Item height for scroll calculation (paddingVertical + marginVertical + text height)
  const ITEM_HEIGHT = 48; // 12*2 (padding) + 2*2 (margin) + ~20 (text)

  // Auto-scroll to current year when year picker opens
  useEffect(() => {
    if (showYearPicker && yearScrollRef.current) {
      const currentYear = parseInt(currentDate.split('-')[0]);
      const yearIndex = years.indexOf(currentYear);
      if (yearIndex !== -1) {
        setTimeout(() => {
          // Calculate position to center the selected year
          // Subtract half of container height (150) to center the item
          const scrollPosition = (yearIndex * ITEM_HEIGHT);
          yearScrollRef.current?.scrollTo({
            y: Math.max(0, scrollPosition),
            animated: true
          });
        }, 100);
      }
    }
  }, [showYearPicker]);

  // Auto-scroll to current month when month picker opens
  useEffect(() => {
    if (showMonthPicker && monthScrollRef.current) {
      const currentMonth = currentDate.split('-')[1];
      const monthIndex = months.findIndex(m => m.value === currentMonth);
      if (monthIndex !== -1) {
        setTimeout(() => {
          const scrollPosition = (monthIndex * ITEM_HEIGHT) - 126;
          monthScrollRef.current?.scrollTo({
            y: Math.max(0, scrollPosition),
            animated: true
          });
        }, 100);
      }
    }
  }, [showMonthPicker]);

  const handleYearSelect = (year) => {
    const [, month, day] = currentDate.split('-');
    const newDate = `${year}-${month}-${day}`;
    setCurrentDate(newDate);
    setShowYearPicker(false);
  };

  const handleMonthSelect = (monthValue) => {
    const [year, , day] = currentDate.split('-');
    const newDate = `${year}-${monthValue}-${day}`;
    setCurrentDate(newDate);
    setShowMonthPicker(false);
  };

  const getDisplayYear = () => {
    const year = currentDate.split('-')[0];
    return isRTL ? convertToArabicNumerals(year) : year;
  };

  const getDisplayMonth = () => {
    const monthValue = currentDate.split('-')[1];
    const month = months.find(m => m.value === monthValue);
    return isRTL ? month.labelAr : month.label;
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>

          {/* Month and Year selectors */}
          <View style={styles.selectorRow}>
            <TouchableOpacity 
              style={styles.selectorButton}
              onPress={() => {
                setShowMonthPicker(!showMonthPicker);
                setShowYearPicker(false);
              }}
            >
              <Text style={styles.selectorButtonText}>
                {getDisplayMonth()} {showMonthPicker ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.selectorButton}
              onPress={() => {
                setShowYearPicker(!showYearPicker);
                setShowMonthPicker(false);
              }}
            >
              <Text style={styles.selectorButtonText}>
                {getDisplayYear()} {showYearPicker ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Year picker dropdown */}
          {showYearPicker && (
            <View style={styles.pickerContainer}>
              <ScrollView 
                ref={yearScrollRef}
                style={styles.pickerScroll} 
                showsVerticalScrollIndicator={true}
              >
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.pickerItem,
                      currentDate.startsWith(String(year)) && styles.pickerItemSelected
                    ]}
                    onPress={() => handleYearSelect(year)}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      currentDate.startsWith(String(year)) && styles.pickerItemTextSelected
                    ]}>
                      {isRTL ? convertToArabicNumerals(year) : year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Month picker dropdown */}
          {showMonthPicker && (
            <View style={styles.pickerContainer}>
              <ScrollView 
                ref={monthScrollRef}
                style={styles.pickerScroll} 
                showsVerticalScrollIndicator={true}
              >
                {months.map((month) => {
                  const isSelected = currentDate.split('-')[1] === month.value;
                  return (
                    <TouchableOpacity
                      key={month.value}
                      style={[
                        styles.pickerItem,
                        isSelected && styles.pickerItemSelected
                      ]}
                      onPress={() => handleMonthSelect(month.value)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        isSelected && styles.pickerItemTextSelected
                      ]}>
                        {isRTL ? month.labelAr : month.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Calendar */}
          {!showYearPicker && !showMonthPicker && (
            <Calendar
              key={currentDate}
              current={currentDate}
              monthFormat="MMMM yyyy"
              onDayPress={onSelect}
              markedDates={
                selectedDate ? { [selectedDate]: { selected: true } } : {}
              }
              renderArrow={(direction) => (
                <Text style={styles.arrow}>
                  {isRTL
                    ? direction === 'right' ? '>' : '<'
                    : direction === 'left' ? '<' : '>'}
                </Text>
              )}
              dayComponent={CustomDay}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#1e1e1e',
                monthTextColor: '#06193b',
                arrowColor: '#6291e8',
                todayTextColor: '#6291e8',
                textDisabledColor: '#d9e1e8',
                textDayFontFamily: 'Inter-Regular',
                textMonthFontFamily: 'Inter-Bold',
                textMonthFontSize: 18,
              }}
              style={styles.calendar}
            />
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default StyledCalendarModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 12
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  selectorButton: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  selectorButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#06193b'
  },
  pickerContainer: {
    maxHeight: 300,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed'
  },
  pickerScroll: {
    padding: 8
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2
  },
  pickerItemSelected: {
    backgroundColor: '#6291e8'
  },
  pickerItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1e1e1e',
    textAlign: 'center'
  },
  pickerItemTextSelected: {
    color: 'white',
    fontFamily: 'Inter-Bold'
  },
  calendar: {
    borderRadius: 16
  },
  arrow: {
    fontSize: 18,
    color: '#6291e8',
    fontWeight: 'bold'
  },
  closeBtn: {
    marginTop: 12,
    backgroundColor: '#06193b',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  closeText: {
    color: 'white',
    fontFamily: 'Inter-Bold'
  },
  dayContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center'
  },
  daySelected: {
    backgroundColor: '#6291e8',
    borderRadius: 16
  },
  dayText: {
    fontSize: 16,
    color: '#1e1e1e'
  },
  daySelectedText: {
    color: 'white',
    fontWeight: 'bold'
  },
  dayDisabled: {
    color: '#d9e1e8'
  },
  dayToday: {
    color: '#6291e8',
    fontWeight: 'bold'
  }
});