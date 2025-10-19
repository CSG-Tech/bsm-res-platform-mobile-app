
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const passengerTypes = [
  {
    id: 'adult',
  },
  {
    id: 'child',

  },
  {
    id: 'infant',

  },
];

const ITEM_HEIGHT = 40; 
const NumberScroller = ({ value, onValueChange, min = 0, max = 5 }) => {
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
        renderItem={({ item }) => (
          <View style={styles.numberItem}>
            <Text style={item === value ? styles.activeNumberText : styles.inactiveNumberText}>
              {item}
            </Text>
          </View>
        )}
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
    const [tempCounts, setTempCounts] = useState(initialCounts);

    useEffect(() => {
        if (visible) {
            setTempCounts(initialCounts);
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
        <View style={styles.modalContainer}>
          <View style={styles.handleBar} />
          <Text style={styles.modalTitle}>Number of Passengers</Text>
          
          <Image 
            source={require('../assets/images/Passengers-drawer.png')}
            style={styles.groupImage}
            resizeMode="cover"
          />

          <View style={styles.countersWrapper}>
            {passengerTypes.map((type, index) => (
                <View key={type.id} style={styles.counterBlock}>
                    <Text style={styles.counterLabel}>{type.label}</Text>
                    <Text style={styles.counterAge}>{type.ageRange}</Text>
                    <NumberScroller 
                        value={tempCounts[type.id]}
                        onValueChange={(newValue) => handleValueChange(type.id, newValue)}
                        min={type.id === 'adult' ? 1 : 0}
                        max={5}
                    />
                </View>
            ))}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={[styles.footerButton, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.footerButton, styles.okButton]} onPress={() => onConfirm(tempCounts)}>
              <Text style={styles.okButtonText}>OK</Text>
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
        paddingTop: 24,
        paddingBottom: 40,
    },
    handleBar: {
        width: 56,
        height: 5,
        backgroundColor: '#e5e7eb',
        borderRadius: 2.5,
        alignSelf: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontFamily: 'Inter-Bold',
        fontWeight: 'bold',
        color: 'black',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 24,
    },
    groupImage: {
        width: '100%',
        height: 110, 
        marginBottom: -20,
    },
    countersWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 24,
    },
    counterBlock: {
        flex: 1,
        alignItems: 'center',
    },
    counterLabel: {
        fontFamily: 'Inter-Bold',
        fontWeight: 'bold',
        fontSize: 14,
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
        marginTop: 24,
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