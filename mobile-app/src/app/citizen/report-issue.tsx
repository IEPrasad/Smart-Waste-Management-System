import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type PriorityLevel = 'low' | 'medium' | 'high';
type IssueType = 'missed-pickup' | 'damaged-bin' | 'incorrect-sorting' | 'other';

export default function ReportIssueScreen() {
  const router = useRouter();
  
  const [issueType, setIssueType] = useState<IssueType | null>(null);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [showIssueTypePicker, setShowIssueTypePicker] = useState(false);

  const issueTypes = [
    { value: 'missed-pickup', label: 'Missed Pickup' },
    { value: 'damaged-bin', label: 'Damaged Bin' },
    { value: 'incorrect-sorting', label: 'Incorrect Sorting' },
    { value: 'other', label: 'Other' },
  ];

  const handlePhotoUpload = () => {
    Alert.alert('Photo Upload', 'Photo upload feature will be added soon!');
  };

  const handleSubmit = () => {
    // Validation
    if (!issueType) {
      Alert.alert('Error', 'Please select an issue type');
      return;
    }

    if (description.trim().length < 10) {
      Alert.alert('Error', 'Description must be at least 10 characters');
      return;
    }

    // Success
    Alert.alert(
      'Report Submitted!',
      'Your report will be reviewed within 24 hours',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Issue</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Issue Type */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Issue Type<Text style={styles.required}> * </Text>
          </Text>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setShowIssueTypePicker(!showIssueTypePicker)}
          >
            <Text style={[styles.dropdownText, !issueType && styles.placeholder]}>
              {issueType 
                ? issueTypes.find(t => t.value === issueType)?.label 
                : 'Select issue type'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#000000" />
          </TouchableOpacity>

          {showIssueTypePicker && (
            <View style={styles.picker}>
              {issueTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={styles.pickerItem}
                  onPress={() => {
                    setIssueType(type.value as IssueType);
                    setShowIssueTypePicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Description<Text style={styles.required}> *</Text>
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Please describe the issue in detail..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
          <Text style={styles.helperText}>Minimum 10 characters required</Text>
        </View>

        {/* Upload Evidence */}
        <View style={styles.section}>
          <Text style={styles.label}>Upload Evidence (Optional)</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={handlePhotoUpload}>
            <View style={styles.uploadContent}>
              <View style={styles.cameraIconContainer}>
                <Ionicons name="camera" size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.uploadText}>Tap to upload photo</Text>
              <Text style={styles.uploadSubtext}>PNG, JPG up to 10MB</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Priority Level */}
        <View style={styles.section}>
          <Text style={styles.label}>Priority Level</Text>
          <View style={styles.priorityRow}>
            <TouchableOpacity
              style={[
                styles.priorityButton,
                priority === 'low' && styles.priorityButtonActive,
              ]}
              onPress={() => setPriority('low')}
            >
              <View style={[styles.priorityDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={[
                styles.priorityText,
                priority === 'low' && styles.priorityTextActive
              ]}>
                Low
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.priorityButton,
                priority === 'medium' && styles.priorityButtonActive,
              ]}
              onPress={() => setPriority('medium')}
            >
              <View style={[styles.priorityDot, { backgroundColor: '#F97316' }]} />
              <Text style={[
                styles.priorityText,
                priority === 'medium' && styles.priorityTextActive
              ]}>
                Medium
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.priorityButton,
                priority === 'high' && styles.priorityButtonActive,
              ]}
              onPress={() => setPriority('high')}
            >
              <View style={[styles.priorityDot, { backgroundColor: '#EF4444' }]} />
              <Text style={[
                styles.priorityText,
                priority === 'high' && styles.priorityTextActive
              ]}>
                High
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.label}>Contact Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone number (optional)"
            placeholderTextColor="#9CA3AF"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={[styles.input, { marginTop: 10 }]}
            placeholder="Email address (optional)"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Submit Issue Report</Text>
        </TouchableOpacity>

        {/* Footer Note */}
        <View style={styles.footer}>
          <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
          <Text style={styles.footerText}>
            Your report will be reviewed within 24 hours
          </Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  headerSpacer: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 18,
    marginTop: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 14,
    color: '#000000',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  picker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
    overflow: 'hidden',
  },
  pickerItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemText: {
    fontSize: 14,
    color: '#000000',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    fontSize: 14,
    color: '#000000',
    minHeight: 90,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  uploadBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    padding: 24,
    alignItems: 'center',
  },
  uploadContent: {
    alignItems: 'center',
  },
  cameraIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
  },
  priorityButtonActive: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  priorityTextActive: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000000',
  },
  submitButton: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingVertical: 14,
    marginHorizontal: 18,
    marginTop: 20,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
