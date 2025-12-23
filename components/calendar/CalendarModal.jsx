import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>

          <Calendar
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