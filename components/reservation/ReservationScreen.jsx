import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  I18nManager,
  Modal,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ChevronDown, Plus, X } from "lucide-react-native";
import FloatingLabelDatePicker from "./FloatingLabelDatePicker";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useForm, Controller } from "react-hook-form";

// API helpers
import {
  getAllDegrees,
  getAllVisas,
  getAllNationalities,
  getAllPrices,
} from "../../axios/services/reservationService";
// fields as mandatory
const REQUIRED_FIELDS = [
  "firstName",
  "lastName",
  "gender",
  "birthdate",
  "nationality",
  "birthplace",
  "degree",
  "visaNumber",
  "visaType",
  "passportNumber",
  "passportIssuingDate",
  "passportExpirationDate",
];

const isDuplicatePassport = (passportNumber, currentPassengerId, allPassengers) => {
  if (!passportNumber || passportNumber.trim() === '') return false;
  
  const trimmedPassport = passportNumber.trim().toUpperCase();
  
  return allPassengers.some(
    passenger => 
      passenger.id !== currentPassengerId && 
      passenger.passportNumber && 
      passenger.passportNumber.trim().toUpperCase() === trimmedPassport
  );
};

const isPassengerValid = (passenger, allPassengers = []) => {
  console.log('Validating passenger:', passenger.id);
  
  // Check for duplicate passport
  if (passenger.passportNumber && isDuplicatePassport(passenger.passportNumber, passenger.id, allPassengers)) {
    console.log(`  Duplicate passport detected for passenger ${passenger.id}`);
    return false;
  }
  
  const validationResults = REQUIRED_FIELDS.map((field) => {
    const value = passenger[field];
    let isValid = false;
    
    if (typeof value === "string") {
      isValid = value.trim().length > 0;
    } else if (typeof value === "object" && value !== null) {
      isValid = true;
    } else {
      isValid = value !== null && value !== undefined && value !== "";
    }
    
    console.log(`  ${field}: ${JSON.stringify(value)} -> ${isValid ? 'VALID' : 'INVALID'}`);
    return isValid;
  });
  
  const allValid = validationResults.every(v => v);
  console.log(`  Overall: ${allValid ? 'VALID' : 'INVALID'}`);
  return allValid;
};
/* -------------------------------------
  Utilities
-------------------------------------*/
const parseDateSafe = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

const createEmptyPassenger = (id) => ({
  id,
  firstName: "",
  middleName: "",
  lastName: "",
  gender: null,
  nationality: null,
  visaType: null,
  degree: null,
  passportNumber: "",
  birthdate: "",
  birthplace: "",
  travelClass: null,
});

/* -------------------------------------
  FloatingLabelSelect
-------------------------------------*/
const FloatingLabelSelect = ({
  label,
  placeholder,
  valueLabel,
  onSelect,
  options,
  fetchOptions,
  tripSerialForDegrees,
  renderItemLabel,
  styles,
}) => {
  const { t, i18n } = useTranslation();

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const cacheRef = FloatingLabelSelect._cache || (FloatingLabelSelect._cache = new Map());

  const openSelect = async () => {
    Keyboard.dismiss();
    setOpen(true);
    setQuery("");
    if (options && options.length) {
      setItems(options);
      return;
    }

    const key = fetchOptions ? `${fetchOptions.name}:${tripSerialForDegrees ?? ""}` : null;
    if (key && cacheRef.has(key)) {
      setItems(cacheRef.get(key));
      return;
    }

    setLoading(true);
    try {
      const res = await (tripSerialForDegrees ? fetchOptions(tripSerialForDegrees) : fetchOptions());
      const arr = res?.data ?? res ?? [];
      if (key) cacheRef.set(key, arr);
      setItems(arr);
    } catch (err) {
      console.warn("FloatingLabelSelect fetch error", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();

    return items.filter((it) => {
      const labelText =
        (renderItemLabel && renderItemLabel(it, i18n.language)) ||
        it.name ||
        it.degreeEnglishName || it.degreeArabName ||
        it.natName || it.natArbName ||
        it.visaTypeName || it.visaTypeArbName ||
        it.currencyPrint ||
        it.countryName ||
        it.label ||
        "";

      return String(labelText).toLowerCase().includes(q);
    });
  }, [items, query, i18n.language]);

  return (
    <>
      <TouchableOpacity style={styles.inputContainer} onPress={openSelect}>
        <Text style={[styles.inputLabel, I18nManager.isRTL ? { right: 14 } : { left: 14 }]}>{label}</Text>
        <View style={[styles.selectContent, { flexDirection: I18nManager.isRTL ? "row-reverse" : "row" }]}>
          <Text style={[styles.selectPlaceholder,{ color: !valueLabel ? "#b6bdcf" : "#000000" }]}>{valueLabel || placeholder}</Text>
          <ChevronDown size={24} color="#5c7095" />
        </View>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={() => setOpen(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={styles.modalBox}>
                  <View style={styles.modalHeader}>
                    <TextInput
                      placeholder={t("reservation.search")}
                      value={query}
                      onChangeText={setQuery}
                      style={styles.modalSearch}
                      autoFocus
                    />
                    <TouchableOpacity onPress={() => setOpen(false)} style={styles.modalClose}>
                      <Text style={styles.modalCloseText}>{t("reservation.close")}</Text>
                    </TouchableOpacity>
                  </View>

                  {loading ? (
                    <ActivityIndicator size="large" color="#092863" style={{ marginTop: 24 }} />
                  ) : (
                    <FlatList
                      data={filtered}
                      keyExtractor={(item, idx) =>
                        String(
                          item?.oracleDegreeCode ??
                          item?.oracleNatCode ??
                          item?.oracleVisaTypeCode ??
                          item?.id ??
                          idx
                        )
                      }
                      keyboardShouldPersistTaps="handled"
                      renderItem={({ item }) => {
                        const labelText =
                          (renderItemLabel && renderItemLabel(item, i18n.language)) ||
                          item?.name ||
                          item?.degreeEnglishName || item?.degreeArabName ||
                          item?.natName || item?.natArbName ||
                          item?.visaTypeName || item?.visaTypeArbName ||
                          item?.currencyPrint ||
                          item?.countryName ||
                          item?.label ||
                          "";

                        return (
                          <TouchableOpacity
                            style={styles.modalItem}
                            onPress={() => {
                              onSelect(item);
                              setOpen(false);
                            }}
                          >
                            <Text style={styles.modalItemText}>{labelText}</Text>
                          </TouchableOpacity>
                        );
                      }}
                      ListEmptyComponent={
                        <Text style={styles.modalNoResults}>{t("reservation.noResults")}</Text>
                      }
                    />
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

/* -------------------------------------
  FloatingLabelInput
-------------------------------------*/
const FloatingLabelInput = ({ label, placeholder, value, onChangeText, styles, onFocus }) => (
  <View style={styles.inputContainer}>
    <Text style={[styles.inputLabel, I18nManager.isRTL ? { right: 14 } : { left: 14 }]}>
      {label}
    </Text>
    <TextInput 
      placeholder={placeholder} 
      placeholderTextColor="#b6bdcf" 
      style={[styles.textInput, { textAlign: I18nManager.isRTL ? "right" : "left" }]} 
      value={value} 
      onChangeText={onChangeText}
      onFocus={onFocus}  // Add this
    />
  </View>
);

/* -------------------------------------
  PassengerInformationSection
-------------------------------------*/
const PassengerInformationSection = ({
  passengers,
  selectedPassengerId,
  onSelectPassenger,
  onAddPassenger,
  onRemovePassenger,
  styles,
}) => (
  <View style={styles.sectionContainer}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.passengerScroll} inverted={I18nManager.isRTL}>
      {passengers.map((passenger, index) => {
        const isSelected = selectedPassengerId === passenger.id;
        return (
          <TouchableOpacity
            key={passenger.id}
            onPress={() => onSelectPassenger(passenger.id)}
            style={[
              styles.passengerButton, 
              isSelected ? styles.passengerButtonSelected : styles.passengerButtonDefault,
              passenger.hasError && { borderColor: 'red', borderWidth: 2 }
            ]}
          >
            {passenger.hasError && (
              <View style={{ position: 'absolute', top: -5, right: -5, backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>!</Text>
              </View>
            )}
            {isSelected && index > 0 && (
              <TouchableOpacity
                style={styles.removePassengerIcon}
                onPress={(e) => {
                  e.stopPropagation();
                  onRemovePassenger(passenger.id);
                }}
              >
                <X size={20} color="#000" />
              </TouchableOpacity>
            )}
            <Text style={styles.passengerButtonText}>{passenger.label}</Text>
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity style={styles.addPassengerButton} onPress={onAddPassenger}>
        <Plus size={24} color="#06193b" />
      </TouchableOpacity>
    </ScrollView>
  </View>
);

/* -------------------------------------
  TravelDetailsSection
-------------------------------------*/
const TravelDetailsSection = ({ passengerDetails, onInputChange, control, errors,watch, t, styles,tripSerial, passportErrors }) => {
  if (!passengerDetails) return null;
  const { i18n } = useTranslation();
  const passengerId = passengerDetails.id;

  const genderOptions = [
    { id: "M", label: t("reservation.male") || "Male" },
    { id: "F", label: t("reservation.female") || "Female" },
  ];

  return (
    <View style={styles.travelDetailsContainer}>
      <View style={styles.formSection}>
        <Text style={styles.formSectionTitle}>{t("reservation.passengerInfo")}</Text>
        <View style={styles.inputRow}>
          <View style={{flex: 1}} >
            <FloatingLabelInput
              label={t("reservation.firstName")}
              placeholder={t("reservation.enter")}
              value={passengerDetails.firstName}
              onChangeText={(text) => onInputChange("firstName", text)}
              styles={styles}
              onFocus={() => {}}
            />
          </View>
          <View style={{flex: 1}}>
            <FloatingLabelInput
              label={t("reservation.lastName")}
              placeholder={t("reservation.enter")}
              value={passengerDetails.lastName}
              onChangeText={(text) => onInputChange("lastName", text)}
              styles={styles}
              onFocus={() => {}}
            />
          </View>
        </View>
          <FloatingLabelInput
            label={t("reservation.middleName")}
            placeholder={t("reservation.enter")}
            value={passengerDetails.middleName}
            onChangeText={(text) => onInputChange("middleName", text)}
            styles={styles}
            onFocus={() => {}}
          />
        <FloatingLabelSelect
          label={t("reservation.gender")}
          placeholder={t("reservation.select")}
          options={genderOptions}
          valueLabel={passengerDetails.gender ? genderOptions.find((g) => g.id === passengerDetails.gender)?.label : null}
          onSelect={(item) => onInputChange("gender", item.id)}
          styles={styles}/>
        <FloatingLabelDatePicker 
          label={t("reservation.birthdate")} 
          placeholder="DD/MM/YYYY" 
          value={passengerDetails.birthdate} 
          onChangeDate={(text) => onInputChange("birthdate", text)} 
          styles={styles} 
          onFocus={() => {}}
        />
      </View>
      <View style={styles.formSection}>
        <Text style={styles.formSectionTitle}>{t("reservation.travelDetails")}</Text>
        <FloatingLabelSelect
          label={t("reservation.nationality")}
          placeholder={t("reservation.select")}
          fetchOptions={getAllNationalities}
          valueLabel={
            passengerDetails.nationality
              ? i18n.language === 'ar'
                ? passengerDetails.nationality.natArbName
                : passengerDetails.nationality.natName
              : null
          }
          onSelect={(item) => onInputChange("nationality", item)}
          renderItemLabel={(it, lang) => lang === "ar" ? it.natArbName : it.natName}
          styles={styles}
        />
          <FloatingLabelInput 
            label={t("reservation.birthplace")} 
            placeholder={t("reservation.enter")} 
            value={passengerDetails.birthplace} 
            onChangeText={(text) => onInputChange("birthplace", text)}
            styles={styles} 
            onFocus={() => {}}/>
        <FloatingLabelSelect
          label={t("reservation.class")}
          placeholder={t("reservation.select")}
          fetchOptions={(tripSerial) => getAllDegrees(tripSerial)}
          tripSerialForDegrees={tripSerial}
          valueLabel={
            passengerDetails.degree
              ? i18n.language === "ar"
                ? passengerDetails.degree.degreeArabName
                : passengerDetails.degree.degreeEnglishName
              : null
          }
          onSelect={(item) => onInputChange("degree", item)}
          renderItemLabel={(it) =>
            i18n.language === "ar" ? it.degreeArabName : it.degreeEnglishName
          }
          styles={styles}
        />
          <FloatingLabelInput 
            label={t("reservation.visaNumber")} 
            placeholder={t("reservation.enter")} 
            value={passengerDetails.visaNumber} 
            onChangeText={(text) => onInputChange("visaNumber", text)}
            styles={styles} 
            onFocus={() => {}}
          />
        <FloatingLabelSelect
          label={t("reservation.visaType")}
          placeholder={t("reservation.select")}
          fetchOptions={getAllVisas}
          valueLabel={
            passengerDetails.visaType
              ? i18n.language === 'ar'
                ? passengerDetails.visaType.visaTypeArbName
                : passengerDetails.visaType.visaTypeName
              : null
          }
          onSelect={(item) => onInputChange("visaType", item)}
          renderItemLabel={(it, lang) =>
            lang === "ar" ? it.visaTypeArbName : it.visaTypeName
          }
          styles={styles}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formSectionTitle}>{t("reservation.passportDetails")}</Text>
          {/* passport number */}
          <Controller
            control={control}
            name={`${passengerId}.passportNumber`}
            rules={{
              required: t("reservation.passportRequired"),
              pattern: {
                value: /^[A-Z0-9]{6,9}$/,
                message: t("reservation.passportInvalid")
              }
            }}
            render={({ field: { onChange, value } }) => (
              <FloatingLabelInput
                label={t("reservation.passportNumber")}
                placeholder={t("reservation.enter")}
                value={value}
                onChangeText={(text) => {
                  onChange(text); // Update form
                  onInputChange("passportNumber", text); // Update state
                }}
                styles={styles}
                onFocus={() => {}}
              />
            )}
          />
            {errors[passengerId]?.passportNumber && (
              <Text style={{ color: "red" }}>{errors[passengerId].passportNumber.message}</Text>
          )}
          {passportErrors[passengerId] && (
            <Text style={{       color: "red", 
                fontSize: 12, 
                marginTop: -12,  // Negative margin to bring it closer to input
                marginLeft: 10,
                fontFamily: "Inter-Regular"}}>
            ⚠️ {passportErrors[passengerId]}
          </Text>
          )}
          {/* passport issuing date */}
          <Controller
            control={control}
            name={`${passengerId}.passportIssuingDate`}
            rules={{
              required: "Issuing date is required",
              validate: (val) => new Date(val) <= new Date() || "Issuing date cannot be in the future"
            }}
            render={({ field: { onChange, value } }) => (
              <FloatingLabelDatePicker
                label={t("reservation.passportIssuingDate")}
                placeholder="DD/MM/YYYY"
                value={value}
                onChangeDate={(date) => {
                  onChange(date); // Update form
                  onInputChange("passportIssuingDate", date); // Update state
                }}
                styles={styles}
                onFocus={() => {}}
              />
            )}
          />
            {errors[passengerId]?.passportIssuingDate && (
              <Text style={{ color: "red" }}>{errors[passengerId].passportIssuingDate.message}</Text>
          )}
          {/* passport expiration date */}
          <Controller
            control={control}
            name={`${passengerId}.passportExpirationDate`}
            rules={{
              required: "Expiration date is required",
              validate: (val) => {
                const issueDate = watch(`${passengerId}.passportIssuingDate`);
                return new Date(val) > new Date(issueDate) || "Expiration must be after issue date";
              }
            }}
            render={({ field: { onChange, value } }) => (
              <FloatingLabelDatePicker
                label={t("reservation.passportExpirationDate")}
                placeholder="DD/MM/YYYY"
                value={value}
                onChangeDate={(date) => {
                  onChange(date); // Update form
                  onInputChange("passportExpirationDate", date); // Update state
                }}
                styles={styles}
                onFocus={() => {}}
              />
            )}
          />
          {errors[passengerId]?.passportExpirationDate && (
            <Text style={{ color: "red" }}>{errors[passengerId].passportExpirationDate.message}</Text>
        )}
      </View>
    </View>
  );
};

/* -------------------------------------
  Main ReservationScreen
-------------------------------------*/
const ReservationScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [availablePrices, setAvailablePrices] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [passportErrors, setPassportErrors] = useState({});


  // Check for duplicates whenever passport numbers change
  useEffect(() => {
    const errors = {};
    
    allPassengersDetails.forEach((passenger) => {
      if (passenger.passportNumber && passenger.passportNumber.trim()) {
        const hasDuplicate = allPassengersDetails.some(
          p => 
            p.id !== passenger.id && 
            p.passportNumber && 
            p.passportNumber.trim().toUpperCase() === passenger.passportNumber.trim().toUpperCase()
        );
        
        if (hasDuplicate) {
          errors[passenger.id] = t("reservation.duplicatePassport");
        }
      }
    });
    
    setPassportErrors(errors);
  }, [allPassengersDetails]);

 useEffect(() => {
    const fetchPrices = async () => {
      if (!tripSerial) return;
      
      setLoadingPrices(true);
      try {
        const response = await getAllPrices(tripSerial, 1);
        setAvailablePrices(response.data || response || []);
        console.log('Fetched prices:', response.data || response);
      } catch (error) {
        console.error('Failed to fetch prices:', error);
      } finally {
        setLoadingPrices(false);
      }
    };
    
    fetchPrices();
  }, [tripSerial]);

  const safeParse = (v) => {
    if (!v) return null;
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  };

  const incomingTrip = safeParse(params?.tripName);
  const fromPort = params?.fromPort ?? (incomingTrip?.lineLatName?.split("-")?.[0]?.trim() ?? "");
  const toPort = params?.toPort ?? (incomingTrip?.lineLatName?.split("-")?.[1]?.trim() ?? "");
  const tripSerial = incomingTrip?.tripSerial ?? params?.tripSerial ?? params?.tripSerialId ?? null;
  const travelClassFromParams = params?.travelClass ?? incomingTrip?.classEnglishName ?? incomingTrip?.classArabName ?? "";
  const travelClassIdFromParams = params?.travelClassId ?? incomingTrip?.classId ?? null;

  const parsedPassengersCount = (() => {
    try {
      const p = typeof params?.passengers === "string" ? JSON.parse(params.passengers) : params?.passengers;
      return p || { adult: 1, child: 0, infant: 0 };
    } catch {
      return { adult: 1, child: 0, infant: 0 };
    }
  })();

  const totalPassengers = parsedPassengersCount.adult + parsedPassengersCount.child + parsedPassengersCount.infant;

  const [allPassengersDetails, setAllPassengersDetails] = useState(() => {
    const arr = [];
    for (let i = 1; i <= Math.max(1, totalPassengers); i++) {
      const p = createEmptyPassenger(i);
      p.travelClass = travelClassFromParams;
      arr.push(p);
    }
    return arr;
  });

  const [selectedPassengerId, setSelectedPassengerId] = useState(1);

  const passengerTabs = allPassengersDetails.map((p) => {
    const fullName = [p.firstName, p.lastName].filter(Boolean).join(' ');
    const hasDuplicatePassport = p.passportNumber && isDuplicatePassport(p.passportNumber, p.id, allPassengersDetails);
    
    return {
      id: p.id,
      label: fullName || t("reservation.passengerLabel", { count: p.id }),
      hasError: hasDuplicatePassport
    };
  });

  const currentPassengerDetails = allPassengersDetails.find((p) => p.id === selectedPassengerId);


  const handleAddPassenger = () => {
    const newId = allPassengersDetails.length > 0 ? Math.max(...allPassengersDetails.map((p) => p.id)) + 1 : 1;
    setAllPassengersDetails((prev) => [...prev, createEmptyPassenger(newId)]);
    setSelectedPassengerId(newId);
  };

  const handleRemovePassenger = (idToRemove) => {
    if (allPassengersDetails.length <= 1) return;
    const updated = allPassengersDetails.filter((p) => p.id !== idToRemove);
    setAllPassengersDetails(updated);
    if (selectedPassengerId === idToRemove) {
      setSelectedPassengerId(updated[0]?.id ?? 1);
    }
  };

  const handleContinue = () => {
    const payload = {
      tripSerial,
      fromPort,
      toPort,
      passengers: allPassengersDetails,
    };
    router.push({ pathname: "/summary", params: { payload: JSON.stringify(payload) } });
  };

  const stylesComputed = getStyles(isRTL);
  // const scrollViewRef = React.useRef(null);
  
  const currentPassenger = allPassengersDetails?.find(p => p.id === selectedPassengerId);
  const currentPassengerPrice = currentPassenger?.price || 0;

  const totalPrice = (allPassengersDetails || []).reduce((sum, passenger) => {
    return sum + (passenger.price || 0);
  }, 0);
  const isFormValid = allPassengersDetails.every(p => isPassengerValid(p, allPassengersDetails));
// validation for passport, expiry and start date
const { control, handleSubmit, watch, formState: { errors }, setValue } = useForm({
  mode: 'onChange',
  defaultValues: allPassengersDetails.reduce((acc, p) => {
    acc[p.id] = { 
      passportNumber: p.passportNumber,
      passportIssuingDate: p.passportIssuingDate,
      passportExpirationDate: p.passportExpirationDate
    };
    return acc;
  }, {})
});

  useEffect(() => {
    allPassengersDetails.forEach((p) => {
        setValue(`${p.id}.passportNumber`, p.passportNumber || '');
        setValue(`${p.id}.passportIssuingDate`, p.passportIssuingDate || '');
        setValue(`${p.id}.passportExpirationDate`, p.passportExpirationDate || '');
    });
  }, [allPassengersDetails, setValue, selectedPassengerId]);

  
  const updatePassengerField = (id, field, value) => {
    setAllPassengersDetails((prev) => 
      prev.map((p) => {
        if (p.id !== id) return p;
        
        if (field === 'degree' && value) {
          console.log('Updating degree for passenger', id, 'to', value);
          console.log('availablePrices', availablePrices);
          return { 
            ...p, 
            degree: value,
            price: availablePrices.find(pr => pr.degreeCode === value.oracleDegreeCode)?.convertedPrice || 0,
            originalPrice: availablePrices.find(pr => pr.degreeCode === value.oracleDegreeCode)?.originalPrice || 0
          };
        }
        
        return { ...p, [field]: value };
      })
    );
  };

const hasErrors = Object.keys(errors).length > 0;
console.log('=== BUTTON STATE ===');
console.log('isFormValid:', isFormValid);
console.log('hasErrors:', hasErrors);
console.log('Button should be enabled:', isFormValid && !hasErrors);

const onSubmit = (data) => {
  const updatedPassengers = allPassengersDetails.map((p) => ({
    ...p,
    passportNumber: data[p.id].passportNumber,
    passportIssuingDate: data[p.id].passportIssuingDate,
    passportExpirationDate: data[p.id].passportExpirationDate
  }));
  
  const payload = {
    tripSerial,
    fromPort,
    toPort,
    passengers: updatedPassengers
  };
  router.push({ pathname: "/summary", params: { payload: JSON.stringify(payload) } });
};

  const currencyDisplay = useMemo(() => {
    const firstPrice = availablePrices[0];
    if (!firstPrice) return 'SAR';
    
    return isRTL ? firstPrice.currencyArbPrint : firstPrice.currencyPrint;
  }, [availablePrices, isRTL]);

  return (
    <SafeAreaView style={stylesComputed.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={stylesComputed.container}>
        <View style={stylesComputed.header}>
          <TouchableOpacity onPress={() => router.back()} style={stylesComputed.backButton}>
            <ArrowLeft size={30} color="#000" style={I18nManager.isRTL && { transform: [{ scaleX: -1 }] }} />
          </TouchableOpacity>
          <Text style={stylesComputed.headerTitle}>{t("reservation.headerTitle")}</Text>
        </View>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={0} >
          <KeyboardAwareScrollView
            style={{ flex: 1 }}
            contentContainerStyle={stylesComputed.scrollContent}
            enableOnAndroid={true}
            extraScrollHeight={150}  // Increased from 120 to 150
            extraHeight={150}        // Added extra height
            enableAutomaticScroll={true}  // Ensures automatic scrolling
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableResetScrollToCoords={false}>
            <View style={stylesComputed.tripSummary}>
              <Text style={stylesComputed.tripTitle}>{incomingTrip?.tripName ?? t("reservation.trip")}</Text>
              <Text style={stylesComputed.tripSub}>{`${fromPort} → ${toPort}`}</Text>
              <Text style={stylesComputed.tripSub}>{`${t("reservation.class")}: ${travelClassFromParams}`}</Text>
            </View>
            <PassengerInformationSection
              passengers={passengerTabs}
              selectedPassengerId={selectedPassengerId}
              onSelectPassenger={setSelectedPassengerId}
              onAddPassenger={handleAddPassenger}
              onRemovePassenger={handleRemovePassenger}
              styles={stylesComputed}/>
            <TravelDetailsSection
              passengerDetails={currentPassengerDetails}
              onInputChange={(field, value) => updatePassengerField(selectedPassengerId, field, value)}
              control={control}     
              errors={errors}       
              watch={watch}         
              t={t}
              tripSerial={tripSerial}
              styles={stylesComputed}
              passportErrors={passportErrors}
              />
          </KeyboardAwareScrollView>
          <View style={stylesComputed.footer}>
            <View style={stylesComputed.priceSection}>
              <View style={stylesComputed.priceRow}>
                <Text style={stylesComputed.priceLabel}>
                  {currentPassengerDetails?.firstName && currentPassengerDetails?.lastName
                    ? `${currentPassengerDetails.firstName} ${currentPassengerDetails.lastName}`
                    : t("reservation.passengerLabel", { count: selectedPassengerId })}:
                </Text>
                <Text style={stylesComputed.priceValue}>
                  {currentPassengerPrice.toFixed(2)} {currencyDisplay}
                </Text>
              </View>
              
              <View style={[stylesComputed.priceRow, stylesComputed.totalRow]}>
                <Text style={stylesComputed.totalLabel}>
                  {t("reservation.totalPrice")}:
                </Text>
                <Text style={stylesComputed.totalValue}>
                  {totalPrice.toFixed(2)} {currencyDisplay}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[
                stylesComputed.continueButton,
                (!isFormValid || hasErrors) && { backgroundColor: "#b6bdcf" }  // Gray when INVALID or has errors
              ]}
              disabled={!isFormValid || hasErrors}  // Disabled when INVALID or has errors
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={stylesComputed.continueButtonText}>
                {t("reservation.continue")}
              </Text>
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

/* -------------------------------------
  Styles
-------------------------------------*/
const getStyles = (isRTL) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#fbfcff" },
    container: { flex: 1 },
    header: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 20,
      paddingBottom: 12,
      paddingHorizontal: 24,
      backgroundColor: "white",
    },
    backButton: { position: "absolute", left: 24, bottom: 12 },
    headerTitle: { fontFamily: "Inter-Medium", fontSize: 16, color: "black" },
    scrollContent: { 
      paddingBottom: 220,
      gap: 12, 
      paddingHorizontal: 0 
    },
    tripSummary: { backgroundColor: "#ECF3FF", padding: 20, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
    tripTitle: { fontSize: 18, fontFamily: "Inter-Bold", color: "#092863" },
    tripSub: { fontSize: 14, color: "#5c7095", marginTop: 6 },

    sectionContainer: { backgroundColor: "white", paddingVertical: 16 },
    passengerScroll: { paddingHorizontal: 26, alignItems: "center", gap: 16 },
    passengerButton: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 18, borderRadius: 8, height: 56 },
    passengerButtonDefault: { backgroundColor: "#fbfcff" },
    passengerButtonSelected: { backgroundColor: "#edf3ff", borderWidth: 1, borderColor: "#6291e8" },
    removePassengerIcon: { marginRight: 12 },
    passengerButtonText: { fontFamily: "Inter-Medium", fontSize: 14, color: "black" },
    addPassengerButton: { padding: 10 },

    travelDetailsContainer: { gap: 12 },
    formSection: { backgroundColor: "white", paddingVertical: 20, paddingHorizontal: 24, gap: 18 },
    formSectionTitle: { fontFamily: "Inter-Bold", fontSize: 14, color: "#5c7095", textAlign: isRTL ? "right" : "left" },
    inputRow: { flexDirection: isRTL ? "row-reverse" : "row", gap: 16 },

    inputContainer: {
      flex: 1,
      height: 56,
      borderWidth: 1,
      borderColor: "#b6bdcf",
      borderRadius: 16,
      justifyContent: "center",
      paddingHorizontal: 24,
      position: "relative",
      backgroundColor: "white",
    },
    inputLabel: { position: "absolute", top: -10, left: 14, backgroundColor: "white", paddingHorizontal: 8, fontFamily: "Inter-Regular", fontSize: 13, color: "#4e4e4e" },
    textInput: { fontFamily: "Inter-Regular", fontSize: 14, color: "black", height: "100%"},
    selectContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    selectPlaceholder: { fontFamily: "Inter-Regular", fontSize: 14 },

    footer: {
      position: "absolute",
      bottom: 0,
      width: "100%",
      paddingVertical: 16,
      paddingBottom: 24,
      paddingHorizontal: 24,
      backgroundColor: "white",
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: -12 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 24,
      gap: 16,
    },
    continueButton: { backgroundColor: "#06193b", borderRadius: 16, height: 60, alignItems: "center", justifyContent: "center" },
    continueButtonText: { fontFamily: "Inter-Bold", fontSize: 16, color: "white" },

    /* Modal styles */
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
    modalBox: { backgroundColor: "white", paddingVertical: 10, paddingHorizontal: 8, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "70%" },
    modalHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
    modalSearch: { flex: 1, backgroundColor: "#f4f6fb", borderRadius: 12, paddingHorizontal: 12, height: 44 },
    modalClose: { paddingHorizontal: 12 },
    modalCloseText: { color: "#092863", fontWeight: "600" },
    modalItem: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
    modalItemText: { fontSize: 15, color: "#222" },
    modalNoResults: { padding: 20, textAlign: "center", color: "#999" },
    priceSection: {
      gap: 8,
    },
    priceRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    priceLabel: {
      fontFamily: "Inter-Regular",
      fontSize: 14,
      color: "#5c7095",
    },
    priceValue: {
      fontFamily: "Inter-Medium",
      fontSize: 14,
      color: "#092863",
    },
    totalRow: {
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: "#e0e0e0",
    },
    totalLabel: {
      fontFamily: "Inter-Bold",
      fontSize: 16,
      color: "#092863",
    },
    totalValue: {
      fontFamily: "Inter-Bold",
      fontSize: 18,
      color: "#092863",
    },
});

/* -------------------------------------
  Export
-------------------------------------*/
export default ReservationScreen;
