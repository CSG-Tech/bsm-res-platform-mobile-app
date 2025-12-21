import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive sizing helpers
const isTablet = SCREEN_WIDTH >= 768;
const wp = (percentage) => (SCREEN_WIDTH * percentage) / 100;
const hp = (percentage) => (SCREEN_HEIGHT * percentage) / 100;
const fontSize = (size) => (SCREEN_WIDTH / 375) * size;

const getStyles = (isRTL) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a6f',
  },
  backgroundGradient: {
    flex: 1,
    position: 'relative',
    paddingBottom: hp(11.8), // Add padding for tab bar
  },
  dotsPatternTopLeft: {
    position: 'absolute',
    top: hp(2.5),
    left: wp(2.5),
    zIndex: 0,
  },
  dotsRow: {
    flexDirection: 'row',
    marginBottom: hp(1.5),
  },
  dot: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: '#fff',
    marginRight: wp(3),
  },
  linesPatternTopRight: {
    position: 'absolute',
    top: hp(5),
    right: 0,
    alignItems: 'flex-end',
    zIndex: 0,
  },
  line: {
    height: hp(0.4),
    backgroundColor: '#4a7bc8',
    marginBottom: hp(0.75),
    borderRadius: hp(0.2),
  },
  curvedShape: {
    position: 'absolute',
    top: hp(7.5),
    right: -wp(13),
    width: wp(106),
    height: wp(106),
    borderRadius: wp(53),
    backgroundColor: 'rgba(74, 123, 200, 0.15)',
    zIndex: 0,
  },
  header: {
    paddingHorizontal: wp(6.4),
    paddingTop: hp(2.5),
    flexDirection: 'row',
    justifyContent: 'flex-end',
    zIndex: 1,
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langText: {
    fontSize: fontSize(18),
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
  langDivider: {
    fontSize: fontSize(18),
    color: '#fff',
    marginHorizontal: wp(2),
    opacity: 0.5,
  },
  langInactive: {
    opacity: 0.6,
  },
  titleContainer: {
    paddingHorizontal: wp(6.4),
    marginTop: hp(3.75),
    marginBottom: hp(5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  title: {
    fontSize: fontSize(isTablet ? 48 : 42),
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  notificationButton: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(7.5),
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  formCard: {
    marginHorizontal: wp(6.4),
    maxWidth: isTablet ? 600 : '100%',
    alignSelf: 'center',
    width: '100%',
    backgroundColor: '#ffffffff',
    borderRadius: wp(8),
    padding: wp(8.5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp(1.25) },
    shadowOpacity: 0.25,
    shadowRadius: hp(2.5),
    elevation: 10,
    zIndex: 1,
  },
  inputContainer: {
    marginBottom: hp(3),
  },
  label: {
    fontSize: fontSize(14),
    fontFamily: 'Inter-Regular',
    color: '#4e4e4e',
    backgroundColor: '#fff',
    paddingHorizontal: wp(2),
  },
  labelContainer: {
    position: 'absolute',
    top: -hp(1.5),
    left: wp(5.3),
    backgroundColor: '#fff',
    paddingHorizontal: wp(2),
    zIndex: 2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requiredStar: {
    fontSize: fontSize(14),
    color: '#dc2626',
    marginLeft: wp(0.5),
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: wp(4.3),
    paddingHorizontal: wp(5.3),
    paddingVertical: hp(2),
    fontSize: fontSize(16),
    color: '#333',
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  inputError: {
    borderColor: '#dc2626',
    borderWidth: 2,
  },
  searchButton: {
    backgroundColor: '#0a1f44',
    borderRadius: wp(4.3),
    paddingVertical: hp(2.5),
    alignItems: 'center',
    marginTop: hp(1),
    shadowColor: '#0a1f44',
    shadowOffset: { width: 0, height: hp(0.5) },
    shadowOpacity: 0.3,
    shadowRadius: hp(1),
    elevation: 5,
  },
  searchButtonText: {
    fontSize: fontSize(18),
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
});

export default function TicketsScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const styles = getStyles(isRTL);
  const [lastName, setLastName] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [reservationNumber, setReservationNumber] = useState('');
  const [errors, setErrors] = useState({
    lastName: false,
    passportNumber: false,
    reservationNumber: false,
  });

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const validateFields = () => {
    const newErrors = {
      lastName: false,
      passportNumber: false,
      reservationNumber: false,
    };

    let isValid = true;

    // Reservation number is required
    if (!reservationNumber.trim()) {
      newErrors.reservationNumber = true;
      isValid = false;
    }

    // Either lastName OR passportNumber must be filled
    if (!lastName.trim() && !passportNumber.trim()) {
      newErrors.lastName = true;
      newErrors.passportNumber = true;
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      Alert.alert(
        t('findTickets.validationError'),
        t('findTickets.validationErrorMessage')
      );
    }

    return isValid;
  };

  const handleSearch = () => {
    if (!validateFields()) {
      return;
    }

    router.push({
      pathname: '/eticket',
      params: {
        lastName: lastName,
        passportNumber: passportNumber,
        reservationNumber: reservationNumber,
      },
    });
    console.log('Searching tickets...', { lastName, passportNumber, reservationNumber });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Background with decorative pattern */}
      <LinearGradient
        colors={['#1e3a6f', '#2b5a9e', '#4a7bc8']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative dots pattern - top left */}
        <View style={styles.dotsPatternTopLeft}>
          {[...Array(6)].map((_, row) => (
            <View key={row} style={styles.dotsRow}>
              {[...Array(6)].map((_, col) => (
                <View
                  key={col}
                  style={[
                    styles.dot,
                    { opacity: 0.15 + (row + col) * 0.05 },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>

        {/* Decorative horizontal lines - top right */}
        <View style={styles.linesPatternTopRight}>
          {[...Array(8)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.line,
                {
                  width: wp(20) + i * wp(4),
                  opacity: 0.2 + i * 0.05,
                },
              ]}
            />
          ))}
        </View>

        {/* Curved decorative shape */}
        <View style={styles.curvedShape} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleLanguage} style={styles.languageToggle}>
            <Text style={styles.langText}>EN</Text>
            <Text style={styles.langDivider}>|</Text>
            <Text style={[styles.langText, styles.langInactive]}>AR</Text>
          </TouchableOpacity>
        </View>

        {/* Title and notification */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t('findTickets.title')}</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={fontSize(28)} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Form card */}
        <View style={styles.formCard}>
          {/* Last Name */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.lastName && styles.inputError]}
              placeholder={t('findTickets.enterPlaceholder')}
              placeholderTextColor="#a0a0a0"
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                if (text.trim() || passportNumber.trim()) {
                  setErrors({ ...errors, lastName: false, passportNumber: false });
                }
              }}
            />
            <View style={styles.labelContainer}>
              <Text style={styles.label}>{t('findTickets.lastName')}</Text>
            </View>
          </View>

          {/* Passport Number */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.passportNumber && styles.inputError]}
              placeholder={t('findTickets.enterPlaceholder')}
              placeholderTextColor="#a0a0a0"
              value={passportNumber}
              onChangeText={(text) => {
                setPassportNumber(text);
                if (text.trim() || lastName.trim()) {
                  setErrors({ ...errors, lastName: false, passportNumber: false });
                }
              }}
            />
            <View style={styles.labelContainer}>
              <Text style={styles.label}>{t('findTickets.passportNumber')}</Text>
            </View>
          </View>

          {/* Reservation Number */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.reservationNumber && styles.inputError]}
              placeholder={t('findTickets.enterPlaceholder')}
              placeholderTextColor="#a0a0a0"
              value={reservationNumber}
              onChangeText={(text) => {
                setReservationNumber(text);
                if (text.trim()) {
                  setErrors({ ...errors, reservationNumber: false });
                }
              }}
            />
            <View style={styles.labelContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>{t('findTickets.reservationNumber')}</Text>
                <Text style={styles.requiredStar}>*</Text>
              </View>
            </View>
          </View>

          {/* Search Button */}
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            activeOpacity={0.8}
          >
            <Text style={styles.searchButtonText}>{t('findTickets.search')}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}