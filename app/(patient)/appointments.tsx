import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import moment from 'moment-timezone';
import { useForm, Controller, SubmitHandler, Control, UseFormSetValue, UseFormWatch, UseFormSetError, UseFormClearErrors, FieldErrors } from 'react-hook-form';
import { useRouter } from 'expo-router';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

// Custom sanitization functions
const sanitizeText = (value: string) => {
  return value.trim().replace(/[^\w\s-]/g, '');
};

const sanitizeMedicalNotes = (value: string) => {
  return value.trim().replace(/[^\w\s,.;:-]/g, '');
};

// Validation schema
interface FormValues {
  patientId: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  dob: string;
  sex: 'male' | 'female' | 'other';
  weight?: string;
  weightUnit?: 'kg' | 'lb';
  notes?: string;
}

const validationSchema = yup.object().shape({
  patientId: yup
    .string()
    .required('ID is required')
    .min(6, 'ID must be at least 6 characters')
    .matches(/^[A-Z0-9-]+$/i, 'ID can only contain letters, numbers, and hyphens')
    .transform(sanitizeText),
  
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .matches(/^[A-Za-z\s-]+$/, 'Last name can only contain letters, spaces, and hyphens')
    .transform(sanitizeText),
  
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .matches(/^[A-Za-z\s-]+$/, 'First name can only contain letters, spaces, and hyphens')
    .transform(sanitizeText),
  
  middleName: yup
    .string()
    .optional()
    .matches(/^[A-Za-z\s-]*$/, 'Middle name can only contain letters, spaces, and hyphens')
    .transform(value => value ? sanitizeText(value) : value),
  
  dob: yup
    .string()
    .required('Date of birth is required')
    .test('age', 'Patient must be between 0 and 120 years old', value => {
      if (!value) return false;
      const age = moment().diff(moment(value), 'years');
      return age >= 0 && age <= 120;
    }),
  
  sex: yup
    .string()
    .required('Sex is required')
    .oneOf(['male', 'female', 'other'] as const, 'Invalid sex selected'),
  
  weight: yup
    .string()
    .optional()
    .matches(/^\d*\.?\d*$/, 'Weight must be a valid number')
    .test('weight-range', 'Weight must be between 1 and 500', value => {
      if (!value) return true;
      const numValue = parseFloat(value);
      return !isNaN(numValue) && numValue > 0 && numValue <= 500;
    }),
  
  weightUnit: yup
    .string()
    .optional()
    .oneOf(['kg', 'lb'] as const, 'Invalid weight unit'),
  
  notes: yup
    .string()
    .optional()
    .max(1000, 'Notes must not exceed 1000 characters')
    .transform(sanitizeMedicalNotes),
});

interface ScanType {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: string;
  preparation: string[];
}

type Appointment = {
  id: string;
  date: string;
  time: string;
  doctor: string;
  status: "upcoming" | "completed" | "cancelled";
  patientId: string;
  scanType?: {
    id: string;
    name: string;
  };
};

type Tab = 'upcoming' | 'past' | 'book';

// Component constants
const scanTypes = [
  {
    id: 'ct',
    name: 'CT Scan',
    description: 'Computer Tomography scan using X-rays and computer processing',
    duration: '15-30 minutes',
    price: '₱8,000 - ₱15,000',
    preparation: [
      'No food 4 hours before scan',
      'No metallic objects/jewelry',
      'Wear comfortable clothing',
      'Bring previous scans if any'
    ]
  },
  {
    id: 'xray',
    name: 'X-Ray',
    description: 'Traditional radiographic imaging for bones and chest',
    duration: '5-10 minutes',
    price: '₱800 - ₱2,000',
    preparation: [
      'Remove metallic objects/jewelry',
      'Wear comfortable clothing',
      'No special diet restrictions'
    ]
  },
  {
    id: 'mammogram',
    name: 'Mammogram',
    description: 'X-ray examination of breast tissue for cancer screening',
    duration: '20-30 minutes',
    price: '₱3,000 - ₱5,000',
    preparation: [
      'No deodorant, lotion, or powder',
      'Wear two-piece clothing',
      'Schedule 1 week after period',
      'Bring previous mammograms'
    ]
  },
  {
    id: 'ultrasound',
    name: 'Ultrasound',
    description: 'Sound wave imaging for soft tissues and organs',
    duration: '15-30 minutes',
    price: '₱1,500 - ₱3,500',
    preparation: [
      'Full bladder required',
      'No food 6-8 hours before (abdominal)',
      'Wear loose comfortable clothing'
    ]
  },
  {
    id: 'mri',
    name: 'MRI',
    description: 'Magnetic Resonance Imaging for detailed tissue examination',
    duration: '30-60 minutes',
    price: '₱12,000 - ₱25,000',
    preparation: [
      'No metallic objects/implants',
      'No makeup or hair products',
      'Notify staff of claustrophobia',
      'No food 4 hours before scan'
    ]
  }
];

export default function Appointments() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [selectedDate, setSelectedDate] = useState<string>(moment().format('YYYY-MM-DD'));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedScan, setSelectedScan] = useState<string | null>(null);
  const [showScanDetails, setShowScanDetails] = useState<boolean>(false);
  const [availableSlots, setAvailableSlots] = useState<{ [date: string]: string[] }>({});
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [conflictingAppointments, setConflictingAppointments] = useState<Appointment[]>([]);
  const [userTimezone] = useState(moment.tz.guess());
  // Scan type data
  const scanTypes = [
    {
      id: 'ct',
      name: 'CT Scan',
      description: 'Computer Tomography scan using X-rays and computer processing',
      duration: '15-30 minutes',
      price: '₱8,000 - ₱15,000',
      preparation: [
        'No food 4 hours before scan',
        'No metallic objects/jewelry',
        'Wear comfortable clothing',
        'Bring previous scans if any'
      ]
    },
    {
      id: 'xray',
      name: 'X-Ray',
      description: 'Traditional radiographic imaging for bones and chest',
      duration: '5-10 minutes',
      price: '₱800 - ₱2,000',
      preparation: [
        'Remove metallic objects/jewelry',
        'Wear comfortable clothing',
        'No special diet restrictions'
      ]
    },
    {
      id: 'mammogram',
      name: 'Mammogram',
      description: 'X-ray examination of breast tissue for cancer screening',
      duration: '20-30 minutes',
      price: '₱3,000 - ₱5,000',
      preparation: [
        'No deodorant, lotion, or powder',
        'Wear two-piece clothing',
        'Schedule 1 week after period',
        'Bring previous mammograms'
      ]
    },
    {
      id: 'ultrasound',
      name: 'Ultrasound',
      description: 'Sound wave imaging for soft tissues and organs',
      duration: '15-30 minutes',
      price: '₱1,500 - ₱3,500',
      preparation: [
        'Full bladder required',
        'No food 6-8 hours before (abdominal)',
        'Wear loose comfortable clothing'
      ]
    },
    {
      id: 'mri',
      name: 'MRI',
      description: 'Magnetic Resonance Imaging for detailed tissue examination',
      duration: '30-60 minutes',
      price: '₱12,000 - ₱25,000',
      preparation: [
        'No metallic objects/implants',
        'No makeup or hair products',
        'Notify staff of claustrophobia',
        'No food 4 hours before scan'
      ]
    }
  ];

  const appointments: Appointment[] = [
    { 
      id: "1", 
      date: "2025-11-10", 
      time: "10:00", 
      doctor: "Dr. Nana Cooper", 
      status: "upcoming",
      patientId: "123456",
      scanType: { id: "mri", name: "MRI" }
    },
    { 
      id: "2", 
      date: "2025-10-15", 
      time: "09:00", 
      doctor: "Dr. Alex Riley", 
      status: "completed",
      patientId: "123456",
      scanType: { id: "ct", name: "CT Scan" }
    },
    { 
      id: "3", 
      date: "2025-09-02", 
      time: "13:30", 
      doctor: "Dr. Sam Lee", 
      status: "cancelled",
      patientId: "123456",
      scanType: { id: "xray", name: "X-Ray" }
    },
  ];

  const methods = useForm<FormValues>({
    defaultValues: { 
      patientId: '', 
      lastName: '', 
      firstName: '', 
      middleName: undefined, 
      dob: '', 
      sex: 'male', 
      weightUnit: 'kg', 
      weight: undefined, 
      notes: undefined 
    },
    mode: 'onBlur',
    resolver: (yupResolver(validationSchema) as any)
  });
  
  const { 
    control, 
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    setError,
    clearErrors
  } = methods;

  const dob = watch('dob');
  const age = dob ? moment().diff(moment(dob), 'years') : undefined;

  // Filter appointments by tab
  const filteredAppointments = useMemo(() => {
    const now = moment();
    if (activeTab === 'upcoming') {
      return appointments.filter(a => moment(a.date).isAfter(now, 'day') || a.status === 'upcoming');
    }
    if (activeTab === 'past') {
      return appointments.filter(a => moment(a.date).isBefore(now, 'day') || a.status === 'completed' || a.status === 'cancelled');
    }
    return appointments;
  }, [appointments, activeTab]);

  // Mock available slots (fetch from API in production)
  const currentDaySlots = useMemo(() => {
    if (!selectedDate) return [];
    return availableSlots[selectedDate] || [];
  }, [selectedDate, availableSlots]);

  const checkForDuplicateAppointments = (values: FormValues) => {
    if (!selectedDate || !selectedSlot) return [];
    
    const proposedTime = moment.tz(`${selectedDate} ${selectedSlot}`, userTimezone);
    const thirtyDaysBefore = proposedTime.clone().subtract(30, 'days');
    const thirtyDaysAfter = proposedTime.clone().add(30, 'days');

    return appointments.filter(apt => {
      // Check for same patient ID
      const samePatient = values.patientId === apt.patientId;
      if (!samePatient) return false;

      const aptTime = moment.tz(`${apt.date} ${apt.time}`, userTimezone);
      // Check if appointment is within 30 days before or after
      const isWithinTimeframe = aptTime.isBetween(thirtyDaysBefore, thirtyDaysAfter, 'day', '[]');
      // Check if it's the same scan type
      const sameScanType = apt.scanType?.id === selectedScan;

      return isWithinTimeframe && sameScanType;
    });
  };

  const onConfirm: SubmitHandler<FormValues> = async (values) => {
    try {
      // Basic validation
      if (!selectedSlot || !selectedDoctor) {
        setError('root', { 
          type: 'manual',
          message: 'Please select a doctor and time slot.'
        });
        return;
      }

      if (!selectedScan) {
        setError('root', {
          type: 'manual',
          message: 'Please select a scan type.'
        });
        return;
      }

      // Check for duplicate appointments
      const duplicates = checkForDuplicateAppointments(values);
      if (duplicates.length > 0) {
        setError('root', {
          type: 'manual',
          message: `Warning: You already have ${duplicates.length} similar appointment(s) scheduled within 30 days. Please confirm with your doctor if multiple scans are needed.`
        });
        return;
      }

      // Validate age restrictions for specific scan types
      const currentScanType = scanTypes.find(s => s.id === selectedScan);
      const patientAge = moment().diff(moment(values.dob), 'years');
      if (currentScanType?.id === 'mammogram' && patientAge < 40) {
        setError('root', {
          type: 'manual',
          message: 'Mammogram screening is typically recommended for patients 40 years and older. Please consult with your doctor for special cases.'
        });
        return;
      }

      const selectedScanType = scanTypes.find(s => s.id === selectedScan);
      const payload = {
        doctorId: selectedDoctor,
        appointment: { 
          date: selectedDate, 
          time: selectedSlot,
          scanType: {
            id: selectedScanType?.id,
            name: selectedScanType?.name,
            duration: selectedScanType?.duration,
            price: selectedScanType?.price
          }
        },
        patient: { ...values, age },
      };
      console.log('Confirm booking payload:', payload);
      router.push('/(modals)/booking-confirmation');
    } catch (error) {
      console.error('Error confirming appointment:', error);
      setError('root', {
        type: 'manual',
        message: 'An error occurred while confirming your appointment. Please try again.'
      });
    }
  };

  const renderAppointmentList = () => (
    <FlatList
      data={filteredAppointments}
      keyExtractor={(i) => i.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardLeft}>
            <Text style={styles.dateText}>{item.date}</Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>

          <View style={styles.cardRight}>
            <Text style={styles.doctorText}>{item.doctor}</Text>
            <Text style={[styles.status, item.status === "upcoming" ? styles.upcoming : item.status === "completed" ? styles.completed : styles.cancelled]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
      )}
    />
  );

  // Scan type data
  // Scan type data already declared as a constant at the top of the file

  // Mock doctor schedule - in production, fetch from API
  const doctorSchedule = {
    workDays: [1, 2, 3, 4, 5], // Monday to Friday
    workHours: {
      start: '09:00',
      end: '17:00',
      lunchBreak: { start: '12:00', end: '13:00' }
    },
    appointmentDuration: 30, // minutes
    unavailableDates: ['2025-11-25', '2025-12-25'] // holidays or time off
  };

  // Check if a date should be disabled
  const isDateDisabled = (date: string) => {
    const dayOfWeek = moment(date).day();
    const isWorkDay = doctorSchedule.workDays.includes(dayOfWeek);
    const isUnavailable = doctorSchedule.unavailableDates.includes(date);
    const isPast = moment(date).isBefore(moment(), 'day');
    return !isWorkDay || isUnavailable || isPast;
  };

  // Generate available time slots for a date
  const generateTimeSlots = (date: string) => {
    const slots: string[] = [];
    const startTime = moment.tz(date + ' ' + doctorSchedule.workHours.start, userTimezone);
    const endTime = moment.tz(date + ' ' + doctorSchedule.workHours.end, userTimezone);
    const lunchStart = moment.tz(date + ' ' + doctorSchedule.workHours.lunchBreak.start, userTimezone);
    const lunchEnd = moment.tz(date + ' ' + doctorSchedule.workHours.lunchBreak.end, userTimezone);

    let currentTime = startTime.clone();
    while (currentTime.isBefore(endTime)) {
      // Skip lunch break
      if (currentTime.isSameOrAfter(lunchStart) && currentTime.isBefore(lunchEnd)) {
        currentTime = lunchEnd.clone();
        continue;
      }

      const timeSlot = currentTime.format('HH:mm');
      slots.push(timeSlot);
      currentTime.add(doctorSchedule.appointmentDuration, 'minutes');
    }

    return slots;
  };

  // Check for conflicting appointments
  const checkConflicts = (date: string, time: string) => {
    const selectedDateTime = moment.tz(date + ' ' + time, userTimezone);
    const duration = doctorSchedule.appointmentDuration;
    const selectedEnd = selectedDateTime.clone().add(duration, 'minutes');

    return appointments.filter(apt => {
      const aptDateTime = moment.tz(apt.date + ' ' + apt.time, userTimezone);
      const aptEnd = aptDateTime.clone().add(duration, 'minutes');
      return (
        (selectedDateTime.isSameOrAfter(aptDateTime) && selectedDateTime.isBefore(aptEnd)) ||
        (selectedEnd.isAfter(aptDateTime) && selectedEnd.isSameOrBefore(aptEnd))
      );
    });
  };

  // Fetch available slots when date changes
  useEffect(() => {
    if (!selectedDate || isDateDisabled(selectedDate)) {
      setAvailableSlots({});
      return;
    }

    setLoadingSlots(true);
    // Simulate API call delay
    const fetchSlots = async () => {
      try {
        // In production, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 500));
        const slots = generateTimeSlots(selectedDate);
        
        // Filter out slots that have conflicts
        const availableSlots = slots.filter(time => {
          const conflicts = checkConflicts(selectedDate, time);
          return conflicts.length === 0;
        });

        setAvailableSlots(prev => ({
          ...prev,
          [selectedDate]: availableSlots
        }));
      } catch (error) {
        console.error('Error fetching slots:', error);
        alert('Failed to load available time slots');
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate]);

  // Update conflicts when slot is selected
  useEffect(() => {
    if (selectedDate && selectedSlot) {
      const conflicts = checkConflicts(selectedDate, selectedSlot);
      setConflictingAppointments(conflicts);
    } else {
      setConflictingAppointments([]);
    }
  }, [selectedDate, selectedSlot]);
  
  const renderBookingForm = () => (
    <ScrollView 
      style={styles.bookingForm}
      contentContainerStyle={styles.bookingFormContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.calendarWrap}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <Calendar
          onDayPress={(d) => {
            if (!isDateDisabled(d.dateString)) {
              setSelectedDate(d.dateString);
              setSelectedSlot(null);
            }
          }}
          minDate={moment().format('YYYY-MM-DD')}
          markedDates={{
            ...Object.fromEntries(
              doctorSchedule.workDays.map(day => {
                const date = moment().day(day).format('YYYY-MM-DD');
                return [date, { marked: true, dotColor: '#0b6efd' }];
              })
            ),
            ...Object.fromEntries(
              doctorSchedule.unavailableDates.map(date => [
                date,
                { disabled: true, disableTouchEvent: true }
              ])
            ),
            [selectedDate]: { selected: true, selectedColor: '#0b6efd' }
          }}
          disabledDaysIndexes={[0, 6]} // Disable weekends
          disableAllTouchEventsForDisabledDays={true}
        />
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>
          Available Time Slots — {selectedDate ? moment(selectedDate).format('ddd, DD MMM') : 'Select a date'}
        </Text>
        
        {loadingSlots ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#0b6efd" />
            <Text style={styles.loadingText}>Loading available slots...</Text>
          </View>
        ) : currentDaySlots.length > 0 ? (
          <FlatList
            data={currentDaySlots}
            keyExtractor={(s) => s}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8 }}
            renderItem={({ item }) => {
              const selected = item === selectedSlot;
              const localTime = moment.tz(selectedDate + ' ' + item, userTimezone).format('hh:mm A');
              return (
                <TouchableOpacity 
                  onPress={() => setSelectedSlot(item)} 
                  style={[styles.slot, selected && styles.slotSelected]}
                >
                  <Text style={[styles.slotText, selected && { color: '#fff' }]}>{localTime}</Text>
                </TouchableOpacity>
              );
            }}
          />
        ) : (
          <View style={styles.noSlotsContainer}>
            <Text style={styles.noSlotsText}>
              {selectedDate 
                ? "No available slots for this date" 
                : "Select a date to see available slots"}
            </Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Select Scan Type</Text>
        <FlatList
          data={scanTypes}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => {
            const selected = item.id === selectedScan;
            return (
              <TouchableOpacity 
                onPress={() => {
                  setSelectedScan(selected ? null : item.id);
                  setShowScanDetails(true);
                }} 
                style={[styles.scanOption, selected && styles.scanOptionSelected]}
              >
                <Text style={[styles.scanName, selected && { color: '#fff' }]}>{item.name}</Text>
                <Text style={[styles.scanDuration, selected && { color: '#fff' }]}>{item.duration}</Text>
              </TouchableOpacity>
            );
          }}
        />

        {selectedScan && showScanDetails && (
          <View style={styles.scanDetails}>
            <View style={styles.scanHeader}>
              <View>
                <Text style={styles.scanDetailName}>
                  {scanTypes.find(s => s.id === selectedScan)?.name}
                </Text>
                <Text style={styles.scanPrice}>
                  {scanTypes.find(s => s.id === selectedScan)?.price}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowScanDetails(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Hide Details</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.scanDescription}>
              {scanTypes.find(s => s.id === selectedScan)?.description}
            </Text>

            <Text style={[styles.label, { marginTop: 12, marginBottom: 8 }]}>Required Preparation:</Text>
            {scanTypes
              .find(s => s.id === selectedScan)
              ?.preparation.map((prep, index) => (
                <View key={index} style={styles.prepItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.prepText}>{prep}</Text>
                </View>
              ))
            }
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Patient Details</Text>

        <Controller
          control={control}
          name="patientId"
          render={({ field: { onChange, value } }) => (
            <>
              <Text style={styles.label}>ID</Text>
              <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder="National ID / Passport" />
            </>
          )}
        />

        <View style={styles.rowInputs}>
          <Controller control={control} name="lastName" render={({ field: { onChange, value } }) => (
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder="Last name" />
            </View>
          )} />

          <Controller control={control} name="firstName" render={({ field: { onChange, value } }) => (
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>First Name</Text>
              <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder="First name" />
            </View>
          )} />
        </View>

        <Controller control={control} name="middleName" render={({ field: { onChange, value } }) => (
          <>
            <Text style={styles.label}>Middle Name</Text>
            <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder="Middle name (optional)" />
          </>
        )} />

        <View style={{ marginTop: 10 }}>
          <Text style={styles.label}>Date of Birth</Text>
          <Controller control={control} name="dob" render={({ field: { onChange, value } }) => (
            <TouchableOpacity onPress={() => setShowDobPicker(true)} style={[styles.input, { justifyContent: 'center' }]}>
              <Text>{value ? moment(value).format('DD/MM/YY') : 'Select date of birth'}</Text>
            </TouchableOpacity>
          )} />
          {age !== undefined ? <Text style={{ marginTop: 6, color: '#666' }}>Age: {age} years</Text> : null}
        </View>

        <Modal visible={showDobPicker} transparent animationType="slide">
          <View style={styles.modalWrap}>
            <View style={styles.modalContent}>
              <Calendar onDayPress={(d) => { setValue('dob', d.dateString); setShowDobPicker(false); }} maxDate={moment().format('YYYY-MM-DD')} />
              <TouchableOpacity onPress={() => setShowDobPicker(false)} style={styles.modalCloseBtn}><Text style={{ color: '#0b6efd' }}>Close</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={{ marginTop: 10 }}>
          <Text style={styles.label}>Sex</Text>
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            {[
              { key: 'male', label: 'Male' },
              { key: 'female', label: 'Female' },
              { key: 'other', label: 'Other' },
            ].map((opt) => (
              <Controller key={opt.key} control={control} name="sex" render={({ field: { onChange, value } }) => (
                <TouchableOpacity onPress={() => onChange(opt.key as any)} style={[styles.sexOption, value === opt.key && styles.sexOptionSelected]}>
                  <Text style={value === opt.key ? { color: '#fff' } : { color: '#333' }}>{opt.label}</Text>
                </TouchableOpacity>
              )} />
            ))}
          </View>
        </View>

        <View style={{ marginTop: 10 }}>
          <Text style={styles.label}>Weight</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Controller control={control} name="weight" render={({ field: { onChange, value } }) => (
              <TextInput keyboardType="numeric" style={[styles.input, { flex: 1 }]} value={value} onChangeText={onChange} placeholder="e.g. 70" />
            )} />

            <Controller control={control} name="weightUnit" render={({ field: { onChange, value } }) => (
              <View style={{ marginLeft: 8, flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => onChange('kg')} style={[styles.unitBtn, value === 'kg' && styles.unitBtnActive]}><Text style={value === 'kg' ? { color: '#fff' } : {}}>kg</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => onChange('lb')} style={[styles.unitBtn, value === 'lb' && styles.unitBtnActive]}><Text style={value === 'lb' ? { color: '#fff' } : {}}>lb</Text></TouchableOpacity>
              </View>
            )} />
          </View>
        </View>

        <Controller control={control} name="notes" render={({ field: { onChange, value } }) => (
          <>
            <Text style={[styles.label, { marginTop: 12 }]}>Medical Comments / History</Text>
            <TextInput style={[styles.input, { height: 100 }]} value={value} onChangeText={onChange} multiline placeholder="Add any relevant medical history" />
          </>
        )} />

        <View style={styles.actions}>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleSubmit(onConfirm as any)}>
            <Text style={styles.confirmText}>Confirm Booking</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]} 
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>Upcoming</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'past' && styles.activeTab]} 
            onPress={() => setActiveTab('past')}
          >
            <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>Past</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'book' && styles.activeTab]} 
            onPress={() => setActiveTab('book')}
          >
            <Text style={[styles.tabText, activeTab === 'book' && styles.activeTabText]}>Book New</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'book' ? renderBookingForm() : renderAppointmentList()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1 },
  listContent: { paddingTop: 16, paddingBottom: 40 },
  bookingFormContent: { paddingTop: 16, paddingBottom: 120 },

  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderColor: '#0b6efd' },
  tabText: { color: '#666' },
  activeTabText: { color: '#0b6efd', fontWeight: '600' },

  bookingForm: { flex: 1, paddingHorizontal: 16 },
  calendarWrap: { marginTop: 12, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },

  form: { marginTop: 8, paddingBottom: 40 },
  label: { color: '#666', fontSize: 13 },
  input: { height: 44, borderWidth: 1, borderColor: '#eee', borderRadius: 8, paddingHorizontal: 10, marginTop: 6, backgroundColor: '#fafafa' },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },

  card: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f2f2f2",
    marginBottom: 10,
    backgroundColor: "#fafafa",
    marginHorizontal: 16,
  },
  cardLeft: { width: 110 },
  dateText: { fontWeight: "700" },
  timeText: { color: "#666", marginTop: 6 },
  cardRight: { flex: 1, alignItems: "flex-end" },
  doctorText: { fontWeight: "700" },
  status: { marginTop: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontWeight: "700" },
  upcoming: { backgroundColor: "#edf7f1", color: "#0a8a59" },
  completed: { backgroundColor: "#eef2ff", color: "#4b5cff" },
  cancelled: { backgroundColor: "#fff0f0", color: "#d83b3b" },

  // Time slot styles
  loadingContainer: { 
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginVertical: 8
  },
  loadingText: { 
    marginTop: 8,
    color: '#666',
    fontSize: 14
  },
  noSlotsContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginVertical: 8
  },
  noSlotsText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center'
  },
  slot: { 
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginRight: 8,
    backgroundColor: '#fff'
  },
  slotSelected: { 
    backgroundColor: '#0b6efd',
    borderColor: '#0b6efd'
  },
  slotText: { 
    color: '#333',
    fontWeight: '600'
  },

  sexOption: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginRight: 8 },
  sexOptionSelected: { backgroundColor: '#0b6efd', borderColor: '#0b6efd' },

  unitBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginLeft: 6 },
  unitBtnActive: { backgroundColor: '#0b6efd', borderColor: '#0b6efd' },

  modalWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '92%', maxHeight: '80%', backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  modalCloseBtn: { padding: 12, alignItems: 'center' },

  // Scan type styles
  scanOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginRight: 8,
    backgroundColor: '#fff',
    minWidth: 140,
  },
  scanOptionSelected: {
    backgroundColor: '#0b6efd',
    borderColor: '#0b6efd',
  },
  scanName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  scanDuration: {
    fontSize: 13,
    color: '#666',
  },
  scanDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  scanDetailName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  scanPrice: {
    fontSize: 15,
    color: '#0b6efd',
    fontWeight: '600',
  },
  scanDescription: {
    color: '#4a4a4a',
    lineHeight: 20,
    marginBottom: 16,
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#e9ecef',
  },
  closeButtonText: {
    color: '#495057',
    fontSize: 13,
  },
  prepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0b6efd',
    marginRight: 8,
  },
  prepText: {
    color: '#4a4a4a',
    flex: 1,
  },

  actions: { marginTop: 18, alignItems: 'center' },
  confirmBtn: { backgroundColor: '#0b6efd', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  confirmText: { color: '#fff', fontWeight: '700' },
});
