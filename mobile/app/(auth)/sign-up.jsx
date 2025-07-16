import { View, Text, KeyboardAvoidingView,ScrollView, TextInput, Platform, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';

import { router } from 'expo-router';
import { useSignUp } from '@clerk/clerk-expo';
import { authStyles } from '../../assets/styles/auth.styles';
import { COLORS } from '../../constants/colour';
import { Image } from 'expo-image';
import { Ionicons } from "@expo/vector-icons";
import VerifyEmailScreen from '../(auth)/verify-email'; 

const SignUpScreen = () => {
  const { isLoaded, signUp } = useSignUp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); 
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) return Alert.alert("Error", "Please fill all fields");
    if (password.length < 6) return Alert.alert("Error", "Password must be at least 6 characters");

    if (!isLoaded) return;

    setLoading(true);
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      Alert.alert("Error", err.errors?.[0]?.message || "Failed to create account");
      console.log(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification)
    return <VerifyEmailScreen email={email} onBack={() => setPendingVerification(false)} />;

  return (
    <View style={authStyles.container}>
      <KeyboardAvoidingView
        style={authStyles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0} // ✅ use number not string
      >
        <ScrollView
          contentContainerStyle={authStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={authStyles.imageContainer}>
            <Image
              source={require("../../assets/images/i2.png")}
              style={authStyles.image}
              contentFit="contain"
            />
          </View>
          <Text style={authStyles.title}>Create Account</Text>

          <View style={authStyles.formContainer}>
            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                onChangeText={setEmail}
                placeholder='Enter email'
                placeholderTextColor={COLORS.textLight}
                value={email}
                keyboardType='email-address'
                autoCapitalize='none'
              />
            </View>

            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder='Enter Password'
                placeholderTextColor={COLORS.textLight}
                onChangeText={setPassword}
                value={password} 
                secureTextEntry={!showPassword}
                autoCapitalize='none'
              />
              <TouchableOpacity
                style={authStyles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={!showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>

            <View>
              <TouchableOpacity
                style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={authStyles.buttonText}>
                  {loading ? "Creating Account..." : "Sign Up"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={authStyles.linkContainer}
                onPress={() => router.back()}
              >
                <Text style={authStyles.linkText}>
                  Already have an account? <Text style={authStyles.link}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignUpScreen;
