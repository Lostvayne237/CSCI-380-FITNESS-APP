import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAuth } from '../../context/AuthContext';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, authError } = useAuth();

  const submit = async () => {
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch {
      /* handled */
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'admin' | 'trainer' | 'member') => {
    const map = {
      admin: { email: 'admin@fitpro.com', password: 'admin123' },
      trainer: { email: 'trainer@fitpro.com', password: 'trainer123' },
      member: { email: 'member@fitpro.com', password: 'member123' },
    };
    setEmail(map[role].email);
    setPassword(map[role].password);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f9ff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <View style={{ alignItems: 'center', marginBottom: 28 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Ionicons name="barbell" size={32} color="#fff" />
            </View>
            <Text style={{ fontSize: 28, fontWeight: '800', color: colors.primary }}>FitPro</Text>
            <Text style={{ color: colors.textMuted, marginTop: 6 }}>Welcome back</Text>
          </View>

          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: '#bfdbfe',
            }}
          >
            <Text style={{ fontWeight: '600', marginBottom: 8, color: colors.text }}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
                color: colors.text,
              }}
            />

            <Text style={{ fontWeight: '600', marginBottom: 8, color: colors.text }}>Password</Text>
            <View style={{ position: 'relative', marginBottom: 8 }}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 14,
                  paddingRight: 48,
                  color: colors.text,
                }}
              />
              <Pressable
                onPress={() => setShowPassword(s => !s)}
                style={{ position: 'absolute', right: 12, top: 14 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color={colors.textMuted}
                />
              </Pressable>
            </View>

            <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={{ alignSelf: 'flex-end' }}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Forgot password?</Text>
            </Pressable>

            {authError ? (
              <View
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: '#fef2f2',
                  borderWidth: 1,
                  borderColor: '#fecaca',
                }}
              >
                <Text style={{ color: colors.danger }}>{authError}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={submit}
              disabled={loading}
              style={{
                marginTop: 16,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
                backgroundColor: colors.primary,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: '700' }}>Sign in</Text>
              )}
            </Pressable>

            <Pressable onPress={() => navigation.navigate('SignUp')} style={{ marginTop: 16 }}>
              <Text style={{ textAlign: 'center', color: colors.textMuted }}>
                Don&apos;t have an account?{' '}
                <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign up</Text>
              </Text>
            </Pressable>

            <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
              <Text style={{ textAlign: 'center', fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>
                Demo accounts
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  onPress={() => fillDemo('admin')}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: '#f3e8ff',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#6b21a8', fontWeight: '600', fontSize: 12 }}>Admin</Text>
                </Pressable>
                <Pressable
                  onPress={() => fillDemo('trainer')}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: '#dbeafe',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#1d4ed8', fontWeight: '600', fontSize: 12 }}>Trainer</Text>
                </Pressable>
                <Pressable
                  onPress={() => fillDemo('member')}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: '#dcfce7',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#166534', fontWeight: '600', fontSize: 12 }}>Member</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
