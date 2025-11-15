import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  FlatList,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import { useForm, Controller } from 'react-hook-form';

type Params = { doctorId?: string };

type FormValues = {
  patientId: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  dob?: string; // ISO date
  sex?: 'male' | 'female' | 'other';
  weight?: string; // numeric as string
  weightUnit?: 'kg' | 'lb';
  notes?: string;
};

export default function BookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Params>();
  const doctorId = params.doctorId ?? 'unknown';

  // Mock doctor
  const doctor = useMemo(() => ({ id: doctorId, name: 'Dr. Nana Cooper', specialty: 'General Practitioner' }), [doctorId]);

  const [selectedDate, setSelectedDate] = useState<string>(moment().format('YYYY-MM-DD'));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);

  const { control, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: { patientId: '', lastName: '', firstName: '', middleName: '', dob: undefined, sex: 'male', weightUnit: 'kg', weight: '', notes: '' },
  });

  const dob = watch('dob');
  const age = dob ? moment().diff(moment(dob), 'years') : undefined;

  // Mock availability per-date (could be fetched from services/appointments)
  const mockSlotsForDate = (date: string) => {
    // simple deterministic mock: change slots based on day
    const day = moment(date).day();
    if (day === 0 || day === 6) return ['10:00 AM', '11:00 AM', '01:00 PM'];
    return ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM'];
  };

  const slots = mockSlotsForDate(selectedDate);

  const onConfirm = (values: FormValues) => {
    if (!selectedSlot) {
      Alert.alert('Select time', 'Please select a time slot before confirming.');
      return;
    }

    // basic validation
    if (!values.patientId || !values.lastName || !values.firstName || !values.dob) {
      Alert.alert('Missing fields', 'Please complete required personal details (ID, Last name, First name, DOB).');
      return;
    }

    const payload = {
      doctorId,
      appointment: { date: selectedDate, time: selectedSlot },
      patient: { ...values, age },
    };
    console.log('Confirm booking payload:', payload);
    // open booking-confirmation modal
    router.push('/(modals)/booking-confirmation');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Book with {doctor.name}</Text>
        <Text style={styles.sub}>{doctor.specialty}</Text>
      </View>

      <View style={styles.calendarWrap}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <Calendar
          onDayPress={(d) => {
            setSelectedDate(d.dateString);
            setSelectedSlot(null);
          }}
          markedDates={{ [selectedDate]: { selected: true, selectedColor: '#0b6efd' } }}
          disableAllTouchEventsForDisabledDays
        />
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Available Time Slots — {moment(selectedDate).format('ddd, DD MMM')}</Text>
        <FlatList
          data={slots}
          keyExtractor={(s) => s}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => {
            const selected = item === selectedSlot;
            return (
              <TouchableOpacity onPress={() => setSelectedSlot(item)} style={[styles.slot, selected && styles.slotSelected]}>
                <Text style={[styles.slotText, selected && { color: '#fff' }]}>{item}</Text>
              </TouchableOpacity>
            );
          }}
        />

        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Patient Details</Text>

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
                <TouchableOpacity onPress={() => onChange('kg')} style={[styles.unitBtn, value === 'kg' && styles.unitBtnActive]}><Text style={value === 'kg' ? { color: '#fff' } : {}}>-kg</Text></TouchableOpacity>
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
          <TouchableOpacity style={styles.confirmBtn} onPress={handleSubmit(onConfirm)}>
            <Text style={styles.confirmText}>Confirm Booking</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700' },
  sub: { color: '#666', marginTop: 4 },

  calendarWrap: { marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },

  form: { marginTop: 8 },
  label: { color: '#666', fontSize: 13 },
  input: { height: 44, borderWidth: 1, borderColor: '#eee', borderRadius: 8, paddingHorizontal: 10, marginTop: 6, backgroundColor: '#fafafa' },

  rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },

  slot: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginRight: 8, backgroundColor: '#fff' },
  slotSelected: { backgroundColor: '#0b6efd', borderColor: '#0b6efd' },
  slotText: { color: '#333', fontWeight: '600' },

  actions: { marginTop: 18, alignItems: 'center' },
  confirmBtn: { backgroundColor: '#0b6efd', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  confirmText: { color: '#fff', fontWeight: '700' },

  sexOption: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginRight: 8 },
  sexOptionSelected: { backgroundColor: '#0b6efd', borderColor: '#0b6efd' },

  unitBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginLeft: 6 },
  unitBtnActive: { backgroundColor: '#0b6efd', borderColor: '#0b6efd' },

  modalWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '92%', maxHeight: '80%', backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  modalCloseBtn: { padding: 12, alignItems: 'center' },
});