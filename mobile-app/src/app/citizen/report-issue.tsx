import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { createWasteIssue, uploadIssuePhoto } from '@/services/wasteIssues';

type PriorityLevel = 'low' | 'medium' | 'high';
type IssueType = 'missed-pickup' | 'damaged-bin' | 'incorrect-sorting' | 'other';

const ISSUE_TYPES: { value: IssueType; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { value: 'missed-pickup', label: 'Missed Pickup', icon: 'car-outline' },
  { value: 'damaged-bin', label: 'Damaged Bin', icon: 'trash-outline' },
  { value: 'incorrect-sorting', label: 'Incorrect Sorting', icon: 'swap-horizontal-outline' },
  { value: 'other', label: 'Other', icon: 'help-circle-outline' },
];

const PRIORITY_CONFIG: Record<PriorityLevel, { color: string; bg: string; label: string }> = {
  low: { color: '#D97706', bg: '#FEF3C7', label: 'Low' },
  medium: { color: '#EA580C', bg: '#FFF7ED', label: 'Medium' },
  high: { color: '#DC2626', bg: '#FEE2E2', label: 'High' },
};

export default function ReportIssueScreen() {
  const router = useRouter();
  const [issueType, setIssueType] = useState<IssueType | null>(null);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const selectedIssue = ISSUE_TYPES.find(t => t.value === issueType);

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Required', 'Please allow access to your photo library to upload evidence.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8, aspect: [4, 3] });
    if (!result.canceled && result.assets.length > 0) setPhotoUri(result.assets[0].uri);
  };

  const handleRemovePhoto = () => Alert.alert('Remove Photo', 'Remove the selected photo?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: () => setPhotoUri(null) }]);

  const handleSubmit = async () => {
    if (!issueType) { Alert.alert('Required', 'Please select an issue type.'); return; }
    if (description.trim().length < 10) { Alert.alert('Too Short', 'Description must be at least 10 characters.'); return; }
    setIsSubmitting(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user?.id) throw new Error(userError?.message || 'Unable to find your account');
      const userId = userData.user.id;
      let photoUrl: string | undefined;
      if (photoUri) {
        setIsUploadingPhoto(true);
        const { url, error: uploadErr } = await uploadIssuePhoto(photoUri, userId);
        setIsUploadingPhoto(false);
        if (uploadErr) {
          Alert.alert('Photo Upload Failed', uploadErr + '\n\nDo you want to submit without the photo?', [
            { text: 'Cancel', style: 'cancel', onPress: () => setIsSubmitting(false) },
            { text: 'Submit Without Photo', onPress: async () => { await submitIssue(userId, undefined); } },
          ]);
          return;
        }
        photoUrl = url ?? undefined;
      }
      await submitIssue(userId, photoUrl);
    } catch (e) { Alert.alert('Error', e instanceof Error ? e.message : 'Something went wrong.'); } finally { setIsSubmitting(false); setIsUploadingPhoto(false); }
  };

  const submitIssue = async (userId: string, photoUrl?: string) => {
    const { error } = await createWasteIssue(userId, issueType!, description.trim(), priority, { email: email || undefined, mobileNo: phone || undefined, photoUrl });
    if (error) throw new Error(error);
    Alert.alert('✅ Report Submitted', 'Your report will be reviewed within 24 hours.', [{ text: 'OK', onPress: () => router.back() }]);
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor="#7F1D1D" />

      <LinearGradient colors={['#7F1D1D', '#B91C1C']} style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.btn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>Report an Issue</Text>
          <Text style={s.headerSub}>We'll respond within 24 hours</Text>
        </View>
        <View style={s.btn}><Ionicons name="warning-outline" size={22} color="#FECACA" /></View>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Ionicons name="list-outline" size={18} color="#DC2626" />
            <Text style={s.cardTitle}>Issue Type <Text style={s.req}>*</Text></Text>
          </View>
          <TouchableOpacity style={[s.dropdown, pickerOpen && s.dropdownOpen]} onPress={() => setPickerOpen(p => !p)} activeOpacity={0.8}>
            <View style={s.row}>
              {selectedIssue ? <><Ionicons name={selectedIssue.icon} size={18} color="#DC2626" style={{ marginRight: 8 }} /><Text style={s.dropdownSelected}>{selectedIssue.label}</Text></> : <Text style={s.dropdownPlaceholder}>Select issue type…</Text>}
            </View>
            <Ionicons name={pickerOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#6B7280" />
          </TouchableOpacity>
          {pickerOpen && (
            <View style={s.picker}>
              {ISSUE_TYPES.map((t, i) => (
                <TouchableOpacity key={t.value} style={[s.pickerItem, i < ISSUE_TYPES.length - 1 && s.pickerBorder]} onPress={() => { setIssueType(t.value); setPickerOpen(false); }}>
                  <View style={s.row}>
                    <View style={[s.pickerIcon, t.value === issueType && { backgroundColor: '#FEE2E2' }]}>
                      <Ionicons name={t.icon} size={16} color={t.value === issueType ? '#DC2626' : '#6B7280'} />
                    </View>
                    <Text style={[s.pickerText, t.value === issueType && { color: '#DC2626', fontWeight: '700' }]}>{t.label}</Text>
                  </View>
                  {t.value === issueType && <Ionicons name="checkmark" size={16} color="#DC2626" />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={s.card}>
          <View style={s.cardHeader}>
            <Ionicons name="create-outline" size={18} color="#DC2626" />
            <Text style={s.cardTitle}>Description <Text style={s.req}>*</Text></Text>
          </View>
          <TextInput style={s.textArea} placeholder="Please describe the issue in detail…" placeholderTextColor="#9CA3AF" multiline numberOfLines={5} value={description} onChangeText={setDescription} textAlignVertical="top" />
          <View style={s.charRow}>
            <Ionicons name="information-circle-outline" size={13} color="#9CA3AF" />
            <Text style={[s.charText, description.length < 10 && description.length > 0 && { color: '#DC2626' }]}>{description.length} chars · minimum 10</Text>
          </View>
        </View>

        <View style={s.card}>
          <View style={s.cardHeader}>
            <Ionicons name="camera-outline" size={18} color="#DC2626" />
            <Text style={s.cardTitle}>Evidence <Text style={s.opt}>(optional)</Text></Text>
          </View>
          {photoUri ? (
            <View style={s.preview}>
              <Image source={{ uri: photoUri }} style={s.previewImg} resizeMode="cover" />
              <View style={s.previewOverlay}>
                <TouchableOpacity style={s.removeBtn} onPress={handleRemovePhoto} activeOpacity={0.8}>
                  <Ionicons name="close-circle" size={28} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={s.previewFooter}>
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <Text style={s.previewText}>Photo selected</Text>
                <TouchableOpacity onPress={handlePickPhoto} activeOpacity={0.7}><Text style={s.changeText}>Change</Text></TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={s.upload} onPress={handlePickPhoto} activeOpacity={0.8}>
              <View style={s.uploadIcon}><Ionicons name="cloud-upload-outline" size={28} color="#DC2626" /></View>
              <Text style={s.uploadTitle}>Tap to upload photo</Text>
              <Text style={s.uploadSub}>PNG or JPG · from your gallery</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={s.card}>
          <View style={s.cardHeader}>
            <Ionicons name="flag-outline" size={18} color="#DC2626" />
            <Text style={s.cardTitle}>Priority Level</Text>
          </View>
          <View style={s.priorityRow}>
            {(Object.entries(PRIORITY_CONFIG) as [PriorityLevel, typeof PRIORITY_CONFIG[PriorityLevel]][]).map(([key, cfg]) => {
              const active = priority === key;
              return (
                <TouchableOpacity key={key} style={[s.priorityBtn, active && { borderColor: cfg.color, backgroundColor: cfg.bg }]} onPress={() => setPriority(key)} activeOpacity={0.8}>
                  <View style={[s.priorityDot, { backgroundColor: cfg.color }]} />
                  <Text style={[s.priorityText, active && { color: cfg.color, fontWeight: '700' }]}>{cfg.label}</Text>
                  {active && <Ionicons name="checkmark-circle" size={14} color={cfg.color} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={s.card}>
          <View style={s.cardHeader}>
            <Ionicons name="call-outline" size={18} color="#DC2626" />
            <Text style={s.cardTitle}>Contact <Text style={s.opt}>(optional)</Text></Text>
          </View>
          <View style={s.contactField}>
            <View style={s.contactIcon}><Ionicons name="phone-portrait-outline" size={16} color="#DC2626" /></View>
            <TextInput style={s.contactInput} placeholder="Phone number" placeholderTextColor="#9CA3AF" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>
          <View style={[s.contactField, { marginTop: 10 }]}>
            <View style={s.contactIcon}><Ionicons name="mail-outline" size={16} color="#DC2626" /></View>
            <TextInput style={s.contactInput} placeholder="Email address" placeholderTextColor="#9CA3AF" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>
        </View>

        <TouchableOpacity style={[s.submitBtn, isSubmitting && { opacity: 0.65 }]} onPress={handleSubmit} disabled={isSubmitting} activeOpacity={0.85}>
          <LinearGradient colors={['#DC2626', '#B91C1C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.submitGrad}>
            {isSubmitting ? <><ActivityIndicator color="#fff" /><Text style={s.submitText}>{isUploadingPhoto ? 'Uploading photo…' : 'Submitting…'}</Text></> : <><Ionicons name="send-outline" size={18} color="#fff" /><Text style={s.submitText}>Submit Issue Report</Text></>}
          </LinearGradient>
        </TouchableOpacity>

        <View style={s.footer}>
          <Ionicons name="shield-checkmark-outline" size={15} color="#6B7280" />
          <Text style={s.footerText}>Reports are reviewed within 24 hours</Text>
        </View>
        <View style={{ height: 48 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 52 : (StatusBar.currentHeight ?? 24) + 8, paddingBottom: 16 },
  btn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  req: { color: '#DC2626' },
  opt: { fontSize: 12, fontWeight: '400', color: '#9CA3AF' },
  row: { flexDirection: 'row', alignItems: 'center' },
  dropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, backgroundColor: '#F9FAFB' },
  dropdownOpen: { borderColor: '#DC2626', backgroundColor: '#FFF5F5' },
  dropdownSelected: { fontSize: 15, color: '#111827', fontWeight: '500' },
  dropdownPlaceholder: { fontSize: 14, color: '#9CA3AF' },
  picker: { marginTop: 8, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff' },
  pickerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 13 },
  pickerBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  pickerIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  pickerText: { fontSize: 14, color: '#374151' },
  textArea: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 14, color: '#111827', minHeight: 110, backgroundColor: '#F9FAFB' },
  charRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  charText: { fontSize: 11, color: '#9CA3AF' },
  upload: { borderWidth: 2, borderStyle: 'dashed', borderColor: '#FECACA', borderRadius: 12, padding: 28, alignItems: 'center', backgroundColor: '#FFF5F5' },
  uploadIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  uploadTitle: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 },
  uploadSub: { fontSize: 12, color: '#9CA3AF' },
  preview: { borderRadius: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: '#E5E7EB' },
  previewImg: { width: '100%', height: 180 },
  previewOverlay: { position: 'absolute', top: 8, right: 8 },
  removeBtn: { backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 16 },
  previewFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#F9FAFB', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  previewText: { flex: 1, fontSize: 13, color: '#374151', fontWeight: '500' },
  changeText: { fontSize: 13, color: '#DC2626', fontWeight: '600' },
  priorityRow: { flexDirection: 'row', gap: 10 },
  priorityBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  contactField: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, overflow: 'hidden', backgroundColor: '#F9FAFB' },
  contactIcon: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FEE2E2' },
  contactInput: { flex: 1, paddingHorizontal: 12, fontSize: 14, color: '#111827', height: 44 },
  submitBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 14 },
  submitGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 },
  footerText: { fontSize: 12, color: '#6B7280' },
});