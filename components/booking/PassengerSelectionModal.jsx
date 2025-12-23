import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PanResponder } from 'react-native';
import AdultIcon from '../../assets/images/passengers/Adult.svg';
import InfantIcon from '../../assets/images/passengers/Infant.svg';
import ChildIcon from '../../assets/images/passengers/Child.svg';

const convertToArabicNumerals = (number) => {
  if (number === undefined || number === null) return '';
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(number).replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
};

const passengerTypes = [
  {
    id: 'adult',
    labelKey: 'passenger.adult',
    ageRangeKey: 'passenger.adultAge',
    icon: ()=> <AdultIcon width={65} height={65}/>,
  },
  {
    id: 'child',
    labelKey: 'passenger.child',
    ageRangeKey: 'passenger.childAge',
    icon: ()=> <ChildIcon width={35} height={35}/>
  },
  {
    id: 'infant',
    labelKey: 'passenger.infant',
    ageRangeKey: 'passenger.infantAge',
    icon: ()=> <InfantIcon width={30} height={30}/>
  },
];

const ITEM_HEIGHT = 40;

const NumberScroller = ({ value, onValueChange, min = 0, max = 5 }) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  const flatListRef = useRef(null);
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  useEffect(() => {
    const initialIndex = numbers.indexOf(value);
    if (flatListRef.current && initialIndex > -1) {
      setTimeout(() => flatListRef.current.scrollToIndex({ index: initialIndex, animated: false }), 100);
    }
  }, [value]);

  const handleMomentumScrollEnd = (event) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const index = Math.round(yOffset / ITEM_HEIGHT);
    const newValue = numbers[index];
    if (newValue !== undefined) {
      onValueChange(newValue);
    }
  };

  return (
    <View style={styles.scrollerContainer}>
      <FlatList
        ref={flatListRef}
        data={numbers}
        keyExtractor={(item) => item.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumScrollEnd}
        renderItem={({ item }) => {
          const displayText = isArabic ? convertToArabicNumerals(item) : item;
          return (
            <View style={styles.numberItem}>
              <Text style={item === value ? styles.activeNumberText : styles.inactiveNumberText}>
                {displayText}
              </Text>
            </View>
          );
        }}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
      />
    </View>
  );
};

export const PassengerSelectionModal = ({ visible, onClose, onConfirm, initialCounts }) => {
    const { t } = useTranslation();
    const [tempCounts, setTempCounts] = useState(initialCounts);
    const [dragDistance, setDragDistance] = useState(0);

    // Drag down to close - only on header area
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          // Only activate drag if moving vertically more than horizontally
          return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && gestureState.dy > 5;
        },
        onPanResponderMove: (_, gestureState) => {
          // Only allow dragging down
          if (gestureState.dy > 0) {
            setDragDistance(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          // Close if dragged down more than 100px
          if (gestureState.dy > 100) {
            onClose();
          } else {
            setDragDistance(0);
          }
        },
        onPanResponderTerminationRequest: () => true,
      })
    ).current;

    useEffect(() => {
        if (visible) {
            setTempCounts(initialCounts);
            setDragDistance(0);
        }
    }, [visible, initialCounts]);

    const handleValueChange = (typeId, newValue) => {
        setTempCounts(prevCounts => ({
            ...prevCounts,
            [typeId]: newValue,
        }));
    };
  

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { transform: [{ translateY: dragDistance }] }]}>
          {/* Only the header area is draggable */}
          <View style={styles.draggableHeader} {...panResponder.panHandlers}>
            <View style={styles.handleBar} />
            <Text style={styles.modalTitle}>{t('passenger.modalTitle')}</Text>
          </View>
          
          <View style={styles.countersWrapper}>
            {passengerTypes.map((type, index) => (
                <React.Fragment key={type.id}>
                    <View style={styles.counterBlock}>
                      <View style={styles.imageContainer}>
                        {typeof type.icon === 'function' ? (
                          type.icon()
                        ) : (
                          <Image
                            source={type.icon}
                            style={{ width: type.width, height: type.height }}
                            resizeMode="contain"
                          />
                        )}
                      </View>
                        <Text style={styles.counterLabel}>{t(type.labelKey)}</Text>
                        <Text style={styles.counterAge}>{t(type.ageRangeKey)}</Text>
                        <NumberScroller 
                            value={tempCounts[type.id]}
                            onValueChange={(newValue) => handleValueChange(type.id, newValue)}
                            min={type.id === 'adult' ? 1 : 0}
                            max={10}
                        />
                    </View>
                    
                    {index < passengerTypes.length - 1 && (
                        <View style={styles.separator} />
                    )}
                </React.Fragment>
            ))}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={[styles.footerButton, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.footerButton, styles.okButton]} onPress={() => onConfirm(tempCounts)}>
              <Text style={styles.okButtonText}>{t('common.ok')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40,
    },
    draggableHeader: {
        paddingTop: 24,
        paddingBottom: 24,
    },
    handleBar: {
        width: 56,
        height: 10,
        backgroundColor: '#e5e7eb',
        borderRadius: 15,
        alignSelf: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontFamily: 'Inter-Bold',
        fontWeight: 'bold',
        color: 'black',
        fontSize: 18,
        textAlign: 'center',
        paddingHorizontal: 24,
    },
    countersWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
    },
    counterBlock: {
        flex: 1,
        alignItems: 'center',
    },
    passengerIcon: {
        marginBottom: 12,
    },
    imageContainer: {
        height: 50, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 12, 
    },
    separator: {
        width: 1,
        height: 180, 
        backgroundColor: '#e5e7eb', 
        marginHorizontal: 8,
    },
    counterLabel: {
        fontFamily: 'Inter-Bold',
        fontWeight: 'bold',
        fontSize: 14,
        color: 'black',
        marginBottom: 4,
    },
    counterAge: {
        fontFamily: 'Inter-Regular',
        color: '#878d9a',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    scrollerContainer: {
        height: ITEM_HEIGHT * 2, 
        width: '80%',
        overflow: 'hidden',
    },
    numberItem: {
        height: ITEM_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeNumberText: {
        fontFamily: 'Inter-Bold',
        fontWeight: 'bold',
        fontSize: 24,
        color: 'black',
    },
    inactiveNumberText: {
        fontFamily: 'Inter-Regular',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#b6bdcf',
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 32,
        paddingHorizontal: 24,
    },
    footerButton: {
        flex: 1,
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#edf3ff',
    },
    cancelButtonText: {
        color: '#1e1e1e',
        fontWeight: 'bold',
        fontSize: 16,
    },
    okButton: {
        backgroundColor: '#06193b',
    },
    okButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});