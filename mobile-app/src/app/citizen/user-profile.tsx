import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, TextInput, Switch, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { getCitizenProfile, updateCitizenProfile, updatePassword, getCurrentUserId, uploadAvatarPhoto, updateAvatarUrl } from '@/services/userProfileService';
import type { CitizenProfile } from '@/services/userProfileService';

const GRADIENT: [string, string] = ['#065F46', '#059669'];

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userId = await getCurrentUserId();
      if (!userId) { Alert.alert('Error', 'User not found. Please log in again.'); return; }
      const { data, error } = await getCitizenProfile(userId);
      if (error) { Alert.alert('Error', error); return; }
      if (data) {
        setProfile(data);
        setFullName(data.full_name);
        setEmail(data.email);
        setPhone(data.mobile_number);
        if (data.avatar_url) setAvatarUri(data.avatar_url);
      }
    } catch { Alert.alert('Error', 'Failed to load profile data'); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const userId = await getCurrentUserId();
      if (!userId) { Alert.alert('Error', 'User not found. Please log in again.'); return; }
      const { data, error } = await updateCitizenProfile(userId, { email, mobile_number: phone });
      if (error) { Alert.alert('Error', error); return; }
      if (data) { setProfile(data); Alert.alert('Success', 'Your changes have been saved!'); }
    } catch { Alert.alert('Error', 'Failed to save changes'); } finally { setSaving(false); }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) { Alert.alert('Error', 'Please fill in all password fields'); return; }
    if (newPassword !== confirmPassword) { Alert.alert('Error', 'New password and confirm password do not match'); return; }
    if (newPassword.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters long'); return; }
    try {
      setChangingPassword(true);
      const { error } = await updatePassword(currentPassword, newPassword);
      if (error) { Alert.alert('Error', error); return; }
      Alert.alert('Success', 'Your password has been changed successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch { Alert.alert('Error', 'Failed to change password'); } finally { setChangingPassword(false); }
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Required', 'Please allow access to your photo library.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.85 });
    if (result.canceled || !result.assets.length) return;
    const uri = result.assets[0].uri;
    const userId = await getCurrentUserId();
    if (!userId) { Alert.alert('Error', 'Please log in again.'); return; }
    setIsUploadingAvatar(true);
    const { url, error } = await uploadAvatarPhoto(uri, userId);
    if (error) { setIsUploadingAvatar(false); Alert.alert('Upload Failed', error); return; }
    const { error: saveErr } = await updateAvatarUrl(userId, url!);
    setIsUploadingAvatar(false);
    if (saveErr) { Alert.alert('Save Failed', saveErr); return; }
    setAvatarUri(url);
    Alert.alert('Success', 'Profile photo updated!');
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive', onPress: async () => {
          try {
            const { error } = await supabase.auth.signOut();
            if (error) { Alert.alert('Error', 'Failed to logout'); return; }
            router.replace('/role-selection');
          } catch { Alert.alert('Error', 'Failed to logout'); }
        }
      }
    ]);
  };

  const initials = fullName.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || '?';

  if (loading) return (<View style={s.loadWrap}><ActivityIndicator size="large" color="#1D4ED8" /><Text style={s.loadText}>Loading profile…</Text></View>);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#065F46" />

      <LinearGradient colors={GRADIENT} style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.btn}><Ionicons name="arrow-back" size={22} color="#fff" /></TouchableOpacity>
        <Text style={s.headerTitle}>Profile & Settings</Text>
        <View style={s.btn} />
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.avatarCard}>
          <TouchableOpacity onPress={handlePickAvatar} disabled={isUploadingAvatar} activeOpacity={0.8}>
            <View style={s.avatarWrap}>
              {isUploadingAvatar ? (
                <ActivityIndicator size="large" color="#059669" />
              ) : avatarUri ? (
                <Image source={{ uri: avatarUri }} style={s.avatarImg} />
              ) : (
                <Text style={s.avatarInitials}>{initials}</Text>
              )}
            </View>
            <View style={s.avatarEditBadge}><Ionicons name="camera" size={16} color="#fff" /></View>
          </TouchableOpacity>
          <Text style={s.avatarName}>{fullName}</Text>
          <Text style={s.avatarEmail}>{email}</Text>
        </View>

        <View style={s.card}>
          <View style={s.cardHeader}><Ionicons name="person-outline" size={18} color="#059669" /><Text style={s.cardTitle}>Personal Information</Text></View>
          <View style={s.inputRow}>
            <Text style={s.inputLabel}>Full Name</Text>
            <TextInput style={[s.input, { color: '#9CA3AF' }]} value={fullName} editable={false} />
          </View>
          <View style={s.inputRow}>
            <Text style={s.inputLabel}>Email</Text>
            <TextInput style={s.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View style={s.inputRow}>
            <Text style={s.inputLabel}>Phone Number</Text>
            <TextInput style={s.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>
          <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.65 }]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
            <LinearGradient colors={GRADIENT} style={s.saveGrad}>
              {saving ? <><ActivityIndicator size="small" color="#fff" /><Text style={s.saveText}>Saving…</Text></> : <><Ionicons name="checkmark-circle" size={18} color="#fff" /><Text style={s.saveText}>Save Changes</Text></>}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={s.card}>
          <View style={s.cardHeader}><Ionicons name="lock-closed-outline" size={18} color="#059669" /><Text style={s.cardTitle}>Change Password</Text></View>
          <View style={s.inputRow}>
            <Text style={s.inputLabel}>Current Password</Text>
            <View style={s.passWrap}>
              <TextInput style={s.passInput} value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry={!showCurrentPassword} />
              <TouchableOpacity onPress={() => setShowCurrentPassword(p => !p)} style={s.passEye}><Ionicons name={showCurrentPassword ? "eye-off" : "eye"} size={18} color="#9CA3AF" /></TouchableOpacity>
            </View>
          </View>
          <View style={s.inputRow}>
            <Text style={s.inputLabel}>New Password</Text>
            <View style={s.passWrap}>
              <TextInput style={s.passInput} value={newPassword} onChangeText={setNewPassword} secureTextEntry={!showNewPassword} />
              <TouchableOpacity onPress={() => setShowNewPassword(p => !p)} style={s.passEye}><Ionicons name={showNewPassword ? "eye-off" : "eye"} size={18} color="#9CA3AF" /></TouchableOpacity>
            </View>
          </View>
          <View style={s.inputRow}>
            <Text style={s.inputLabel}>Confirm New Password</Text>
            <View style={s.passWrap}>
              <TextInput style={s.passInput} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} />
              <TouchableOpacity onPress={() => setShowConfirmPassword(p => !p)} style={s.passEye}><Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={18} color="#9CA3AF" /></TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={[s.saveBtn, changingPassword && { opacity: 0.65 }]} onPress={handlePasswordChange} disabled={changingPassword} activeOpacity={0.85}>
            <LinearGradient colors={['#DC2626', '#B91C1C']} style={s.saveGrad}>
              {changingPassword ? <><ActivityIndicator size="small" color="#fff" /><Text style={s.saveText}>Changing…</Text></> : <><Ionicons name="key-outline" size={18} color="#fff" /><Text style={s.saveText}>Change Password</Text></>}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={s.card}>
          <View style={s.cardHeader}><Ionicons name="settings-outline" size={18} color="#059669" /><Text style={s.cardTitle}>Preferences</Text></View>
          <View style={s.switchRow}>
            <View style={s.switchLeft}>
              <Ionicons name="notifications-outline" size={20} color="#059669" />
              <View><Text style={s.switchLabel}>Push Notifications</Text><Text style={s.switchDesc}>Receive pickup updates</Text></View>
            </View>
            <Switch value={pushNotifications} onValueChange={setPushNotifications} trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }} thumbColor={pushNotifications ? '#059669' : '#fff'} />
          </View>
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <View style={s.logoutWrap}>
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            <Text style={s.logoutText}>Logout</Text>
          </View>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' },
  loadWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  loadText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 52 : (StatusBar.currentHeight ?? 24) + 8, paddingBottom: 16 },
  btn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },
  avatarCard: { backgroundColor: '#fff', borderRadius: 20, paddingVertical: 32, paddingHorizontal: 20, marginBottom: 20, alignItems: 'center', elevation: 3 },
  avatarWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden' },
  avatarImg: { width: 100, height: 100, borderRadius: 50 },
  avatarInitials: { fontSize: 36, fontWeight: '700', color: '#059669' },
  avatarEditBadge: { position: 'absolute', bottom: 16, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: '#059669', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
  avatarName: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4 },
  avatarEmail: { fontSize: 14, color: '#6B7280' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  inputRow: { marginBottom: 12 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827', backgroundColor: '#F9FAFB' },
  passWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#F9FAFB' },
  passInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827' },
  passEye: { paddingHorizontal: 12 },
  saveBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 8 },
  saveGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  saveText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  switchLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  switchLabel: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 2 },
  switchDesc: { fontSize: 13, color: '#6B7280' },
  logoutBtn: { backgroundColor: '#FEE2E2', borderRadius: 14, overflow: 'hidden', borderWidth: 1.5, borderColor: '#FECACA', marginBottom: 14 },
  logoutWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#DC2626' },
});