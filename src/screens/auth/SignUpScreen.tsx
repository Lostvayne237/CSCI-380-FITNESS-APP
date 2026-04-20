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

import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export function SignUpScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<'member' | 'trainer'>('member');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth();

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!name.trim()) throw new Error('Please enter your name');
      if (password !== confirm) throw new Error('Passwords do not match');
      await signUp({ name: name.trim(), email: email.trim(), password, role });
      navigation.navigate('Login');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    opts: { secure?: boolean } = {},
  ) => (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontWeight: '600', marginBottom: 6, color: colors.text }}>{label}</Text>
      <View>
        <TextInput
          value={value}
          onChangeText={onChange}
          secureTextEntry={opts.secure ? !showPassword : false}
          autoCapitalize={label === 'Email' ? 'none' : 'words'}
          keyboardType={label === 'Email' ? 'email-address' : 'default'}
          placeholder={label === 'Full name' ? 'John Doe' : label === 'Email' ? 'you@example.com' : '••••••••'}
          placeholderTextColor={colors.textMuted}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 14,
            paddingRight: opts.secure ? 48 : 14,
            color: colors.text,
          }}
        />
        {opts.secure && label === 'Password' && (
          <Pressable
            onPress={() => setShowPassword(s => !s)}
            style={{ position: 'absolute', right: 12, top: 14 }}
          >
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f9ff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
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
            <Text style={{ fontSize: 26, fontWeight: '800', color: colors.primary }}>Join FitCheck</Text>
            <Text style={{ color: colors.textMuted, marginTop: 6 }}>Start your fitness journey</Text>
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
            <Text style={{ fontWeight: '600', marginBottom: 6, color: colors.text }}>I am signing up as</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
              {(['member', 'trainer'] as const).map(r => (
                <Pressable
                  key={r}
                  onPress={() => setRole(r)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: role === r ? colors.primary : colors.border,
                    backgroundColor: role === r ? '#eff6ff' : '#fff',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontWeight: '900', color: role === r ? colors.primary : colors.text }}>
                    {r === 'member' ? 'Member' : 'Trainer'}
                  </Text>
                </Pressable>
              ))}
            </View>
            {field('Full name', name, setName)}
            {field('Email', email, setEmail)}
            {field('Password', password, setPassword, { secure: true })}
            {error ? (
              <View
                style={{
                  marginBottom: 14,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: '#fef2f2',
                  borderWidth: 1,
                  borderColor: '#fecaca',
                }}
              >
                <Text style={{ color: colors.danger }}>{error}</Text>
              </View>
            ) : null}
            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontWeight: '600', marginBottom: 6, color: colors.text }}>
                Confirm password
              </Text>
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 14,
                  color: colors.text,
                }}
              />
            </View>

            <Pressable
              onPress={submit}
              disabled={loading}
              style={{
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
                backgroundColor: colors.primary,
                opacity: loading ? 0.7 : 1,
                marginTop: 8,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: '700' }}>Create account</Text>
              )}
            </Pressable>

            <Pressable onPress={() => navigation.navigate('Login')} style={{ marginTop: 16 }}>
              <Text style={{ textAlign: 'center', color: colors.textMuted }}>
                Already have an account?{' '}
                <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign in</Text>
              </Text>
            </Pressable>

            <View
              style={{
                marginTop: 16,
                padding: 12,
                borderRadius: 12,
                backgroundColor: '#eff6ff',
                borderWidth: 1,
                borderColor: '#bfdbfe',
              }}
            >
              <Text style={{ fontSize: 12, color: '#1e40af' }}>
                Trainer accounts can view assigned members and set nutrition goals. Admin accounts are not available here.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
