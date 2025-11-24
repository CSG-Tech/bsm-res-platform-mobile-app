import { Calendar } from 'react-native-calendars';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, I18nManager } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { t } from 'i18next';

export const FloatingLabelDatePicker = ({ label, placeholder, value, onChangeDate, maxDate, minDate, styles }) => {
  const [showCalendar, setShowCalendar] = useState(false);

  const handleDayPress = (day) => {
    // Format as DD/MM/YYYY
    const [year, month, dayNum] = day.dateString.split('-');
    const formatted = `${dayNum}/${month}/${year}`;
    onChangeDate(formatted);
    setShowCalendar(false);
  };

  // Convert DD/MM/YYYY to YYYY-MM-DD for Calendar component
  const getCalendarDate = () => {
    if (!value) return undefined;
    const parts = value.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return undefined;
  };

  return (
    <>
      <TouchableOpacity style={styles.inputContainer} onPress={() => setShowCalendar(true)}>
        <Text style={[styles.inputLabel, I18nManager.isRTL ? { right: 14 } : { left: 14 }]}>
          {label}
        </Text>
        <View style={[styles.selectContent, { flexDirection: I18nManager.isRTL ? "row-reverse" : "row" }]}>
          <Text style={[styles.selectPlaceholder, { color: value ? "#000000" : "#b6bdcf" }]}>
            {value || placeholder}
          </Text>
          <ChevronDown size={24} color="#5c7095" />
        </View>
      </TouchableOpacity>

      <Modal visible={showCalendar} transparent animationType="slide" onRequestClose={() => setShowCalendar(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.calendarTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)} style={styles.modalClose}>
                <Text style={styles.modalCloseText}>{t("reservation.close")}</Text>
              </TouchableOpacity>
            </View>
            
            <Calendar
              onDayPress={handleDayPress}
              markedDates={value ? {
                [getCalendarDate()]: { selected: true, selectedColor: '#092863' }
              } : {}}
              maxDate={maxDate}
              minDate={minDate}
              theme={{
                todayTextColor: '#092863',
                arrowColor: '#092863',
                selectedDayBackgroundColor: '#092863',
                selectedDayTextColor: '#ffffff',
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};