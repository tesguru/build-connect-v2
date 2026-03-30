import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const ITEM_HEIGHT = 56;
const VISIBLE_ITEMS = 5;
const COLUMN_WIDTH = 80;
const COLUMN_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const periods = ['AM', 'PM'];

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
  placeholder?: string;
  hasError?: boolean;
  errorMessage?: string;
  use24Hour?: boolean; // New prop to control format
}

function ScrollColumn({
  data,
  selected,
  onSelect,
}: {
  data: string[];
  selected: string;
  onSelect: (val: string) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const selectedIndex = Math.max(0, data.indexOf(selected));

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
    }, 80);
    return () => clearTimeout(timeout);
  }, []);

  const handleScrollEnd = (e: any) => {
    const raw = e.nativeEvent.contentOffset.y / ITEM_HEIGHT;
    const index = Math.max(0, Math.min(Math.round(raw), data.length - 1));
    onSelect(data[index]);
  };

  const handlePress = (item: string, index: number) => {
    onSelect(item);
    scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
  };

  return (
    <View style={styles.columnWrapper}>
      <View style={styles.selectionHighlight} pointerEvents="none" />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollColumn}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        nestedScrollEnabled
      >
        {data.map((item, index) => {
          const isSelected = item === selected;
          return (
            <TouchableOpacity
              key={item}
              onPress={() => handlePress(item, index)}
              activeOpacity={0.6}
              style={styles.columnItem}
            >
              <Text
                className={isSelected ? 'font-interbold' : 'font-inter'}
                style={isSelected ? styles.itemSelected : styles.itemUnselected}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.fadeTop} pointerEvents="none" />
      <View style={styles.fadeBottom} pointerEvents="none" />
    </View>
  );
}

const TimePicker = ({
  value,
  onChange,
  label,
  placeholder = 'Select time',
  hasError,
  errorMessage,
  use24Hour = false, // Default to 12-hour format for display
}: TimePickerProps) => {
  const [visible, setVisible] = useState(false);

  // Convert 24-hour format to 12-hour format for display
  const convertTo12Hour = (val: string) => {
    if (!val) return { hour: '12', minute: '00', period: 'AM' };
    
    // Check if it's already in 12-hour format
    const match12 = val.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)?$/i);
    if (match12) {
      return {
        hour: String(parseInt(match12[1])).padStart(2, '0'),
        minute: match12[2],
        period: (match12[3] ?? 'AM').toUpperCase(),
      };
    }
    
    // Parse 24-hour format
    const match24 = val.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) {
      let hour = parseInt(match24[1]);
      const minute = match24[2];
      let period = 'AM';
      
      if (hour >= 12) {
        period = 'PM';
        if (hour > 12) hour -= 12;
      }
      if (hour === 0) hour = 12;
      
      return {
        hour: String(hour).padStart(2, '0'),
        minute,
        period,
      };
    }
    
    return { hour: '12', minute: '00', period: 'AM' };
  };

  // Convert 12-hour format to 24-hour format for API
  const convertTo24Hour = (hour12: string, minute: string, period: string): string => {
    let hour = parseInt(hour12);
    
    if (period === 'AM') {
      if (hour === 12) hour = 0;
    } else {
      if (hour !== 12) hour += 12;
    }
    
    return `${String(hour).padStart(2, '0')}:${minute}`;
  };

  const parsed = convertTo12Hour(value);
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [period, setPeriod] = useState(parsed.period);

  const handleOpen = () => {
    const p = convertTo12Hour(value);
    setHour(p.hour);
    setMinute(p.minute);
    setPeriod(p.period);
    setVisible(true);
  };

  const handleConfirm = () => {
    // Always output in 24-hour format for API compatibility
    const time24 = convertTo24Hour(hour, minute, period);
    onChange(time24);
    setVisible(false);
  };

  const handleCancel = () => setVisible(false);

  // Format display value for trigger button
  const getDisplayValue = () => {
    if (!value) return '';
    // If value is in 24-hour format, convert to 12-hour for display
    if (value.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      const converted = convertTo12Hour(value);
      return `${converted.hour}:${converted.minute} ${converted.period}`;
    }
    return value;
  };

  return (
    <View className="flex-1 pb-4">
      {label && (
        <Text className="font-inter text-sm text-gray-700 mb-1">{label}</Text>
      )}

      <TouchableOpacity
        onPress={handleOpen}
        activeOpacity={0.75}
        style={[styles.trigger, hasError && styles.triggerError]}
      >
        <Text
          className="font-inter"
          style={{ fontSize: 14, color: value ? '#111827' : '#9CA3AF' }}
        >
          {getDisplayValue() || placeholder}
        </Text>
        <Text style={{ fontSize: 16 }}>🕐</Text>
      </TouchableOpacity>

      {hasError && errorMessage ? (
        <Text className="font-inter text-red-500 text-sm pt-1">{errorMessage}</Text>
      ) : null}

      <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
        <View style={styles.backdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={handleCancel}
            activeOpacity={1}
          />

          <View style={styles.sheet}>
            <View style={styles.handle} />

            <Text className="font-interbold" style={styles.sheetTitle}>
              Select Time
            </Text>

            <View style={styles.wheelsRow}>
              <ScrollColumn data={hours} selected={hour} onSelect={setHour} />
              <Text className="font-interbold" style={styles.colon}>:</Text>
              <ScrollColumn data={minutes} selected={minute} onSelect={setMinute} />
              {!use24Hour && (
                <>
                  <View style={styles.divider} />
                  <ScrollColumn data={periods} selected={period} onSelect={setPeriod} />
                </>
              )}
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn} activeOpacity={0.7}>
                <Text className="font-interbold" style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirm} style={styles.confirmBtn} activeOpacity={0.85}>
                <Text className="font-interbold" style={styles.confirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: '#fff',
  },
  triggerError: {
    borderColor: '#EF4444',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingBottom: 44,
    paddingHorizontal: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  wheelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 32,
  },
  colon: {
    fontSize: 28,
    color: '#111827',
    width: 18,
    textAlign: 'center',
    marginBottom: 2,
  },
  divider: {
    width: 1,
    height: COLUMN_HEIGHT * 0.5,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 6,
  },
  columnWrapper: {
    width: COLUMN_WIDTH,
    height: COLUMN_HEIGHT,
    overflow: 'hidden',
  },
  scrollColumn: {
    width: COLUMN_WIDTH,
    height: COLUMN_HEIGHT,
  },
  columnItem: {
    height: ITEM_HEIGHT,
    width: COLUMN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemSelected: {
    fontSize: 26,
    color: '#000000',
  },
  itemUnselected: {
    fontSize: 18,
    color: '#6B7280',
  },
  selectionHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 4,
    right: 4,
    height: ITEM_HEIGHT,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
  },
  fadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 2,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 2,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  cancelText: {
    fontSize: 15,
    color: '#374151',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: '#2563EB', // blue-600
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 15,
    color: '#fff',
  },
});

export default TimePicker;