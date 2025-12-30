import { useTranslation } from 'react-i18next';
import CalendarModal from '../calendar/CalendarModal';
import { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';

const FloatingLabelDatePicker = ({ label, value, onChangeDate, styles, onFocus }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const [showPicker, setShowPicker] = useState(false);
  
  const handleOpen = () => {
    if (onFocus) {
      onFocus(); // Trigger scroll behavior
    }
    setShowPicker(true);
  };

  return (
    <>
      <TouchableOpacity style={styles.inputContainer} onPress={() => setOpen(true)}>
        <Text style={styles.inputLabel}>{label}</Text>
        <Text style={styles.selectPlaceholder}>
          {value || 'DD/MM/YYYY'}
        </Text>
      </TouchableOpacity>

      <CalendarModal
        visible={open}
        title={label}
        selectedDate={value}
        onClose={() => setOpen(false)}
        onSelect={(day) => {
          onChangeDate(day.dateString);
          setOpen(false);
        }}
      />
    </>
  );
};
export default FloatingLabelDatePicker;