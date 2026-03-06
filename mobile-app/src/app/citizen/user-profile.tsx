import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import {
  getCitizenProfile,
  updateCitizenProfile,
  updatePassword,
  getCurrentUserId,
  uploadAvatarPhoto,
  updateAvatarUrl,
} from '@/services/userProfileService';
import type { CitizenProfile } from '@/services/userProfileService';

// ── Gradient palette ─────────────────────────────────────────────────────────
const GRADIENT: [string, string] = ['#065F46', '#059669'];

export default function ProfileScreen() {
  const router = useRouter();

  // Profile data
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [pushNotifications, setPushNotifications] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Avatar state
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
    } catch {
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const userId = await getCurrentUserId();
      if (!userId) { Alert.alert('Error', 'User not found. Please log in again.'); return; }

      const { data, error } = await updateCitizenProfile(userId, {
        email,
        mobile_number: phone,
      });
      if (error) { Alert.alert('Error', error); return; }
      if (data) {
        setProfile(data);
        Alert.alert('Success', 'Your changes have been saved!');
      }
    } catch {
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields'); return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirm password do not match'); return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long'); return;
    }
    try {
      setChangingPassword(true);
      const { error } = await updatePassword(currentPassword, newPassword);
      if (error) { Alert.alert('Error', error); return; }
      Alert.alert('Success', 'Your password has been changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      Alert.alert('Error', 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  // ── Pick & upload avatar ────────────────────────────────────────
  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets.length) return;

    const uri = result.assets[0].uri;
    const userId = await getCurrentUserId();
    if (!userId) { Alert.alert('Error', 'Please log in again.'); return; }

    setIsUploadingAvatar(true);
    const { url, error } = await uploadAvatarPhoto(uri, userId);
    if (error) {
      setIsUploadingAvatar(false);
      Alert.alert('Upload Failed', error);
      return;
    }
    const { error: saveErr } = await updateAvatarUrl(userId, url!);
    setIsUploadingAvatar(false);
    if (saveErr) {
      Alert.alert('Save Failed', saveErr);
      return;
    }
    setAvatarUri(url);
    Alert.alert('Success', 'Profile photo updated!');
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.auth.signOut();
            if (error) { Alert.alert('Error', 'Failed to logout'); return; }
            router.replace('/role-selection');
          } catch {
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  };

  // ── Avatar initials ───────────────────────────────────────────────────────
  const initials = fullName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase() || '?';

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#1D4ED8" />
        <Text style={styles.loadingText}>Loading profile…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#065F46" />

      {/* ── Gradient header ── */}
      <LinearGradient colors={GRADIENT} style={styles.headerGradient}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Profile</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar hero card ── */}
        <LinearGradient
          colors={GRADIENT}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroDecorCircle} />
          <View style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.avatarCameraBtn}
              onPress={handlePickAvatar}
              activeOpacity={0.8}
              disabled={isUploadingAvatar}
            >
              {isUploadingAvatar
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="camera" size={16} color="#fff" />
              }
            </TouchableOpacity>
          </View>
          <Text style={styles.heroName}>{fullName || '—'}</Text>
          <Text style={styles.heroEmail}>{email || '—'}</Text>

          <View style={styles.statsStrip}>
            <View style={styles.statItem}>
              <Ionicons name="call-outline" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statLbl}>{phone || '—'}</Text>
            </View>
            {profile && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="card-outline" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.statLbl}>{profile.nic_number || '—'}</Text>
                </View>
              </>
            )}
          </View>
        </LinearGradient>

        {/* ── Personal Information ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionAccent, { backgroundColor: '#059669' }]} />
            <Ionicons name="person-outline" size={18} color="#059669" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>

          {/* Full Name - Read Only */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Full Name</Text>
            <View style={[styles.inputWrapper, styles.readOnlyWrapper]}>
              <Ionicons name="person" size={17} color="#9CA3AF" style={styles.inputIcon} />
              <Text style={styles.readOnlyText}>{fullName || profile?.full_name || '—'}</Text>
              <Ionicons name="lock-closed" size={15} color="#D1D5DB" />
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={17} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#C0C9D4"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!saving}
              />
              <Ionicons name="create-outline" size={17} color="#9CA3AF" />
            </View>
          </View>

          {/* Phone Number */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={17} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                placeholderTextColor="#C0C9D4"
                keyboardType="phone-pad"
                editable={!saving}
              />
              <Ionicons name="create-outline" size={17} color="#9CA3AF" />
            </View>
          </View>

          {/* Read-only fields */}
          {profile && (
            <>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>NIC Number</Text>
                <View style={[styles.inputWrapper, styles.readOnlyWrapper]}>
                  <Ionicons name="card-outline" size={17} color="#9CA3AF" style={styles.inputIcon} />
                  <Text style={styles.readOnlyText}>{profile.nic_number}</Text>
                  <Ionicons name="lock-closed" size={15} color="#D1D5DB" />
                </View>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Assessment Number</Text>
                <View style={[styles.inputWrapper, styles.readOnlyWrapper]}>
                  <Ionicons name="document-text-outline" size={17} color="#9CA3AF" style={styles.inputIcon} />
                  <Text style={styles.readOnlyText}>{profile.assessment_number}</Text>
                  <Ionicons name="lock-closed" size={15} color="#D1D5DB" />
                </View>
              </View>
            </>
          )}

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={saving}
            style={[styles.actionBtnWrap, saving && styles.disabledOpacity]}
          >
            <LinearGradient
              colors={GRADIENT}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.actionBtnGradient}
            >
              {saving
                ? <ActivityIndicator size="small" color="#fff" />
                : <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                  <Text style={styles.actionBtnText}>Save Changes</Text>
                </>
              }
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── Security ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionAccent, { backgroundColor: '#059669' }]} />
            <Ionicons name="shield-checkmark-outline" size={18} color="#059669" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Security</Text>
          </View>

          {/* Current Password */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={17} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor="#C0C9D4"
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
                editable={!changingPassword}
              />
              <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                <Ionicons
                  name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18} color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="key-outline" size={17} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor="#C0C9D4"
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                editable={!changingPassword}
              />
              <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                <Ionicons
                  name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18} color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="key-outline" size={17} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter new password"
                placeholderTextColor="#C0C9D4"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                editable={!changingPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18} color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Change Password Button */}
          <TouchableOpacity
            onPress={handlePasswordChange}
            activeOpacity={0.85}
            disabled={changingPassword}
            style={[styles.actionBtnWrap, changingPassword && styles.disabledOpacity]}
          >
            <LinearGradient
              colors={['#065F46', '#059669']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.actionBtnGradient}
            >
              {changingPassword
                ? <ActivityIndicator size="small" color="#fff" />
                : <>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#fff" />
                  <Text style={styles.actionBtnText}>Change Password</Text>
                </>
              }
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── Notification Settings ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionAccent, { backgroundColor: '#7C3AED' }]} />
            <Ionicons name="notifications-outline" size={18} color="#7C3AED" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>

          <View style={styles.notificationRow}>
            <View style={styles.notifLeft}>
              <View style={[styles.notifIconBox, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="notifications" size={20} color="#7C3AED" />
              </View>
              <View style={styles.notifText}>
                <Text style={styles.notifTitle}>Push Notifications</Text>
                <Text style={styles.notifSub}>Receive alerts on your device</Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: '#E5E7EB', true: '#C4B5FD' }}
              thumbColor={pushNotifications ? '#7C3AED' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* ── Logout ── */}
        <View style={styles.sectionCard}>
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.85}
            style={styles.actionBtnWrap}
          >
            <LinearGradient
              colors={['#991B1B', '#DC2626']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.actionBtnGradient}
            >
              <Ionicons name="log-out-outline" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Log Out</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6B7280' },

  // ── Header ──────────────────────────────────────────────────────────────────
  headerGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : (StatusBar.currentHeight ?? 24) + 8,
    paddingBottom: 16,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  headerSpacer: { width: 36 },

  // ── Scroll ───────────────────────────────────────────────────────────────────
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },

  // ── Hero card ────────────────────────────────────────────────────────────────
  heroCard: {
    borderRadius: 20, padding: 24, marginBottom: 20, overflow: 'hidden',
    alignItems: 'center',
    shadowColor: '#059669', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 7,
  },
  heroDecorCircle: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -50,
  },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.45)',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  heroName: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4, letterSpacing: 0.2 },
  heroEmail: { fontSize: 16, color: 'rgba(255,255,255,0.75)', marginBottom: 16 },

  statsStrip: {
    flexDirection: 'row', width: '100%',
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 8,
    alignItems: 'center',
  },
  statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  statLbl: { fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  statDivider: { width: 1, height: 22, backgroundColor: 'rgba(255,255,255,0.25)' },

  // ── Section card ─────────────────────────────────────────────────────────────
  sectionCard: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 16,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 5, elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 16,
  },
  sectionAccent: { width: 4, height: 20, borderRadius: 2, marginRight: 8 },
  sectionIcon: { marginRight: 6 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },

  // ── Field ────────────────────────────────────────────────────────────────────
  fieldContainer: { marginBottom: 12 },
  label: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10, borderWidth: 1.2, borderColor: '#E5E7EB',
    paddingHorizontal: 12, height: 46,
  },
  readOnlyWrapper: { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 17, color: '#111827', height: '100%' },
  readOnlyText: { flex: 1, fontSize: 17, color: '#6B7280' },

  // ── Notification row ─────────────────────────────────────────────────────────
  notificationRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  notifLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  notifIconBox: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  notifText: { flex: 1 },
  notifTitle: { fontSize: 17, fontWeight: '600', color: '#111827', marginBottom: 2 },
  notifSub: { fontSize: 14, color: '#9CA3AF' },

  // ── Action button ────────────────────────────────────────────────────────────
  actionBtnWrap: { marginTop: 16, borderRadius: 12, overflow: 'hidden' },
  actionBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14,
  },
  actionBtnText: { fontSize: 18, fontWeight: '700', color: '#fff' },

  disabledOpacity: { opacity: 0.6 },

  // ── Avatar photo ──────────────────────────────────────────────
  avatarWrap: {
    width: 86, height: 86, marginBottom: 12,
    position: 'relative', alignItems: 'center', justifyContent: 'center',
  },
  avatarImage: {
    width: 86, height: 86, borderRadius: 43,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)',
  },
  avatarCameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#059669',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
});