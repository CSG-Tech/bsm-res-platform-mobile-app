// ReservationScreen.jsx
import React, { useEffect, useMemo, useState } from "react";
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
import { FloatingLabelDatePicker } from "./FloatingLabelDatePicker";

// API helpers - adjust paths to your project
import {
  getAllDegrees,
  getAllVisas,
  getAllNationalities,
  getAllPrices,
} from "../../axios/services/reservationService"; // <<— ensure this path is correct

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
  gender: null, // 'M' or 'F'
  nationality: null, // object or code
  visaType: null,
  degree: null,
  passportNumber: "",
  birthdate: "",
  birthplace: "",
  travelClass: null,
});

/* -------------------------------------
   FloatingLabelSelect - reusable
   supports: options (static) OR fetchOptions (async)
   NOTE: receives `styles` prop from parent
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
        it.name || // fallback generic
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
        <View style={styles.modalOverlay}>
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
                renderItem={({ item }) => {
                  const labelText =
                    (renderItemLabel && renderItemLabel(item, i18n.language)) ||
                    item?.name || // generic fallback
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
        </View>
      </Modal>
    </>
  );
};

/* -------------------------------------
   FloatingLabelInput (uses styles prop)
-------------------------------------*/
const FloatingLabelInput = ({ label, placeholder, value, onChangeText, styles }) => (
  <View style={styles.inputContainer}>
    <Text style={[styles.inputLabel, I18nManager.isRTL ? { right: 14 } : { left: 14 }]}>{label}</Text>
    <TextInput placeholder={placeholder} placeholderTextColor="#b6bdcf" style={[styles.textInput, { textAlign: I18nManager.isRTL ? "right" : "left" }]} value={value} onChangeText={onChangeText} />
  </View>
);

/* -------------------------------------
   PassengerInformationSection (uses styles prop)
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
            style={[styles.passengerButton, isSelected ? styles.passengerButtonSelected : styles.passengerButtonDefault]}
          >
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
   TravelDetailsSection - uses FloatingLabelSelect & styles prop
-------------------------------------*/
const TravelDetailsSection = ({ passengerDetails, onInputChange, t, tripSerial, styles }) => {
  if (!passengerDetails) return null;
  const { i18n } = useTranslation();
  const genderOptions = [
    { id: "M", label: t("reservation.male") || "Male" },
    { id: "F", label: t("reservation.female") || "Female" },
  ];

  return (
    <View style={styles.travelDetailsContainer}>
      <View style={styles.formSection}>
        <Text style={styles.formSectionTitle}>{t("reservation.passengerInfo")}</Text>

        <View style={styles.inputRow}>
          <FloatingLabelInput
            label={t("reservation.firstName")}
            placeholder={t("reservation.enter")}
            value={passengerDetails.firstName}
            onChangeText={(text) => onInputChange("firstName", text)}
            styles={styles}
          />
          <FloatingLabelInput
            label={t("reservation.lastName")}
            placeholder={t("reservation.enter")}
            value={passengerDetails.lastName}
            onChangeText={(text) => onInputChange("lastName", text)}
            styles={styles}
          />
        </View>

        <FloatingLabelInput
          label={t("reservation.middleName")}
          placeholder={t("reservation.enter")}
          value={passengerDetails.middleName}
          onChangeText={(text) => onInputChange("middleName", text)}
          styles={styles}
        />

        <FloatingLabelSelect
          label={t("reservation.gender")}
          placeholder={t("reservation.select")}
          options={genderOptions}
          valueLabel={passengerDetails.gender ? genderOptions.find((g) => g.id === passengerDetails.gender)?.label : null}
          onSelect={(item) => onInputChange("gender", item.id)}
          styles={styles}
        />

        <FloatingLabelDatePicker 
          label={t("reservation.birthdate")} 
          placeholder="DD/MM/YYYY" 
          value={passengerDetails.birthdate} 
          onChangeDate={(text) => onInputChange("birthdate", text)} 
          styles={styles} 
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

        <FloatingLabelInput label={t("reservation.birthplace")} placeholder={t("reservation.enter")} value={passengerDetails.birthplace} onChangeText={(text) => onInputChange("birthplace", text)} styles={styles} />
        <FloatingLabelSelect
          label={t("reservation.class")}
          placeholder={t("reservation.select")}
          fetchOptions={(tripSerial) => getAllDegrees(tripSerial)}
          tripSerialForDegrees={tripSerial} // passes tripSerial to the API
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
        <FloatingLabelInput label={t("reservation.visaNumber")} placeholder={t("reservation.enter")} value={passengerDetails.visaNumber} onChangeText={(text) => onInputChange("visaNumber", text)} styles={styles} />

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
        <FloatingLabelInput label={t("reservation.passportNumber")} placeholder={t("reservation.enter")} value={passengerDetails.passportNumber} onChangeText={(text) => onInputChange("passportNumber", text)} styles={styles} />
        <FloatingLabelInput label={t("reservation.passportIssuingDate")} placeholder="DD/MM/YYYY" value={passengerDetails.passportIssuingDate} onChangeText={(text) => onInputChange("passportIssuingDate", text)} styles={styles} />
        <FloatingLabelInput label={t("reservation.passportExpirationDate")} placeholder="DD/MM/YYYY" value={passengerDetails.passportExpirationDate} onChangeText={(text) => onInputChange("passportExpirationDate", text)} styles={styles} />
      </View>

      {/* Degrees select (depends on tripSerial) */}
    </View>
  );
};

/* -------------------------------------
   Main ReservationScreen
-------------------------------------*/
const ReservationScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams(); // gets params from previous page
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [availablePrices, setAvailablePrices] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);


  // Fetch prices when component mounts
  useEffect(() => {
    const fetchPrices = async () => {
      if (!tripSerial) return;
      
      setLoadingPrices(true);
      try {
        const response = await getAllPrices(tripSerial, /* branchCode */ 1);
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

  // Remove all the useMemo for prices and use this instead:
  const safeParse = (v) => {
    if (!v) return null;
    try {
      return JSON.parse(v);
    } catch {
      return v; // return plain string (like WASA something)
    }
  };

  const incomingTrip = safeParse(params?.tripName);
  const fromPort = params?.fromPort ?? (incomingTrip?.lineLatName?.split("-")?.[0]?.trim() ?? "");
  const toPort = params?.toPort ?? (incomingTrip?.lineLatName?.split("-")?.[1]?.trim() ?? "");
  const tripSerial = incomingTrip?.tripSerial ?? params?.tripSerial ?? params?.tripSerialId ?? null;
  const travelClassFromParams = params?.travelClass ?? incomingTrip?.classEnglishName ?? incomingTrip?.classArabName ?? "";
  const travelClassIdFromParams = params?.travelClassId ?? incomingTrip?.classId ?? null;

  // passengers may be a JSON string
  const parsedPassengersCount = (() => {
    try {
      const p = typeof params?.passengers === "string" ? JSON.parse(params.passengers) : params?.passengers;
      return p || { adult: 1, child: 0, infant: 0 };
    } catch {
      return { adult: 1, child: 0, infant: 0 };
    }
  })();

  const totalPassengers = parsedPassengersCount.adult + parsedPassengersCount.child + parsedPassengersCount.infant;

  // component state
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
    return {
      id: p.id,
      label: fullName || t("reservation.passengerLabel", { count: p.id })
    };
  });
  const currentPassengerDetails = allPassengersDetails.find((p) => p.id === selectedPassengerId);

  // helper to update a passenger
const updatePassengerField = (id, field, value) => {
  setAllPassengersDetails((prev) => 
    prev.map((p) => {
      if (p.id !== id) return p;
      
      // If updating degree, also store its price
      if (field === 'degree' && value) {
        const priceObj = availablePrices.find(
          pr => pr.degreeCode === value.oracleDegreeCode
        );
        
        console.log('Setting price:', priceObj?.convertedPrice); // Debug
        
        return { 
          ...p, 
          degree: value,
          price: priceObj?.convertedPrice || 0,
          originalPrice: priceObj?.originalPrice || 0
        };
      }
      
      return { ...p, [field]: value };
    })
  );
};
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

  // continue button - example: navigate to payment or summary (modify as needed)
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
  // Price calculations with guards
  const currentPassenger = allPassengersDetails?.find(p => p.id === selectedPassengerId);
  const currentPassengerPrice = currentPassenger?.price || 0;

  const totalPrice = (allPassengersDetails || []).reduce((sum, passenger) => {
    return sum + (passenger.price || 0);
  }, 0);

  const currencyDisplay = useMemo(() => {
    const firstPrice = availablePrices[0];
    if (!firstPrice) return 'SAR';
    
    return isRTL ? firstPrice.currencyArbPrint : firstPrice.currencyPrint;
  }, [availablePrices, isRTL]);


  return (
    <SafeAreaView style={stylesComputed.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <View style={stylesComputed.container}>
          <View style={stylesComputed.header}>
            <TouchableOpacity onPress={() => router.back()} style={stylesComputed.backButton}>
              <ArrowLeft size={30} color="#000" style={I18nManager.isRTL && { transform: [{ scaleX: -1 }] }} />
            </TouchableOpacity>
            <Text style={stylesComputed.headerTitle}>{t("reservation.headerTitle")}</Text>
          </View>

          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView 
              contentContainerStyle={[stylesComputed.scrollContent,
                     !isKeyboardVisible && { paddingBottom: 200 }]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
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
            styles={stylesComputed}
          />

          <TravelDetailsSection
            passengerDetails={currentPassengerDetails}
            onInputChange={(field, value) => updatePassengerField(selectedPassengerId, field, value)}
            t={t}
            tripSerial={tripSerial}
            styles={stylesComputed}
          />
          </ScrollView>
          </TouchableWithoutFeedback>


        {!isKeyboardVisible && (
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
            style={stylesComputed.continueButton} 
            onPress={handleContinue}
          >
            <Text style={stylesComputed.continueButtonText}>
              {t("reservation.continue")}
            </Text>
          </TouchableOpacity>
        </View>)}
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/* -------------------------------------
   Styles (copied & extended)
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
    scrollContent: { paddingBottom: 40, gap: 12, paddingHorizontal: 0 },
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
    inputLabel: { position: "absolute", top: -10, left: 14, backgroundColor: "white", paddingHorizontal: 8, fontFamily: "Inter-Regular", fontSize: 14, color: "#4e4e4e" },
    textInput: { fontFamily: "Inter-Regular", fontSize: 14, color: "black", height: "100%" },
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
