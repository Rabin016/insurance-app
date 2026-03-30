/**
 * MarineScreen — Marine Insurance Premium Calculator.
 * 
 * Features:
 * - Foreign currency conversion (USD/GBP/EUR to BDT).
 * - Dynamic rates based on Transport Mode (Sea/Air/Land).
 * - Smooth timing-based animations (consistent with Fire page).
 */

import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
  Platform,
  KeyboardAvoidingView,
  TextInput,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInDown,
  ZoomIn,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppInput from "../components/ui/AppInput";
import AppSelect, { AppSelectRef } from "../components/ui/AppSelect";
import AppSegmentedControl from "../components/ui/AppSegmentedControl";
import AppButton from "../components/ui/AppButton";
import AppSlider from "../components/ui/AppSlider";
import SectionCard from "../components/ui/SectionCard";
import Typography from "../components/ui/Typography";

import {
  TRANSPORT_MODES,
  MARINE_CONDITIONS,
  MARINE_RATE_MATRIX,
  CURRENCY_OPTIONS,
  TransportMode,
} from "../constants/marineInsurance";
import {
  calculateMarinePremium,
  formatCurrencyMarine,
  getMarineRate,
  MarineResult,
} from "../utils/marineCalculations";

export default function MarineScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  // Refs for focusing
  const limitRef = useRef<TextInput>(null);
  const toleranceRef = useRef<TextInput>(null);
  const rateRef = useRef<TextInput>(null);
  const premiumRateRef = useRef<TextInput>(null);

  // State
  const [limitAmount, setLimitAmount] = useState("");
  const [currency, setCurrency] = useState<string>("USD");
  const [bankTolerance, setBankTolerance] = useState("10");
  const [currencyRate, setCurrencyRate] = useState("120.00");
  
  const [transportMode, setTransportMode] = useState<TransportMode>("SEA");
  const [condition, setCondition] = useState<string | null>(null);
  const [premiumRate, setPremiumRate] = useState("");
  const [warEnabled, setWarEnabled] = useState(false);
  
  const [result, setResult] = useState<MarineResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────────
  // Event Handlers
  // ─────────────────────────────────────────────────────────────────────────────

  const handleTransportModeChange = (mode: string) => {
    const nextMode = mode as TransportMode;
    setTransportMode(nextMode);
    setCondition(null); // Reset condition when mode changes
    setPremiumRate("");
    setResult(null);
  };

  const handleConditionChange = (value: string) => {
    setCondition(value);
    const rate = getMarineRate(transportMode, value);
    setPremiumRate(rate > 0 ? rate.toString() : "");
    setResult(null);
    setTimeout(() => premiumRateRef.current?.focus(), 100);
  };

  const handleCalculate = () => {
    const limit = parseFloat(limitAmount) || 0;
    const rate = parseFloat(currencyRate) || 0;
    const tol = parseFloat(bankTolerance) || 0;
    const pRate = parseFloat(premiumRate) || 0;

    if (limit <= 0) {
      Alert.alert("Validation Error", "Please enter a valid Limit Amount.");
      return;
    }
    if (rate <= 0) {
      Alert.alert("Validation Error", "Please enter a valid Currency Rate.");
      return;
    }
    if (!condition) {
      Alert.alert("Validation Error", "Please select a Condition of Cover.");
      return;
    }

    setIsCalculating(true);
    setTimeout(() => {
      const res = calculateMarinePremium(limit, tol, rate, pRate, warEnabled);
      setResult(res);
      setIsCalculating(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
    }, 500);
  };

  const handleReset = () => {
    setLimitAmount("");
    setCurrency("USD");
    setBankTolerance("10");
    setCurrencyRate("120.00");
    setTransportMode("SEA");
    setCondition(null);
    setPremiumRate("");
    setWarEnabled(false);
    setResult(null);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Rendering
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "android" ? "height" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.marineIconBadge}>
                <Ionicons name="boat-outline" size={20} color="#F97316" />
              </View>
              <View>
                <Typography variant="caption" style={styles.headerSubtitle}>PREMIUM CALCULATOR</Typography>
                <Typography variant="heading" style={styles.headerTitle}>Marine Insurance</Typography>
              </View>
            </View>
          </View>
          <View style={styles.headerBorder} />
        </Animated.View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 60 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Basic Information */}
          <Animated.View entering={FadeInDown.duration(350).delay(100)}>
            <SectionCard title="Value & Currency" accent>
              <View style={styles.currencyRow}>
                <View style={styles.currencyInputWrap}>
                   <AppInput
                    ref={limitRef}
                    label="Limit Amount"
                    labelIcon="cash-outline"
                    value={limitAmount}
                    onChangeText={(v) => { setLimitAmount(v); setResult(null); }}
                    prefix={currency === "USD" ? "$" : currency === "GBP" ? "£" : "€"}
                    placeholder="10,000"
                    returnKeyType="next"
                    onSubmitEditing={() => rateRef.current?.focus()}
                  />
                </View>
                <View style={styles.currencySelectWrap}>
                  <AppSelect
                    label="Currency"
                    value={currency}
                    onChange={(v) => { setCurrency(v); setResult(null); }}
                    options={CURRENCY_OPTIONS as any}
                    placeholder="USD"
                  />
                </View>
              </View>

              <AppInput
                ref={rateRef}
                label="Currency Rate (to BDT)"
                labelIcon="swap-horizontal-outline"
                value={currencyRate}
                onChangeText={(v) => { setCurrencyRate(v); setResult(null); }}
                prefix="BDT"
                placeholder="120.00"
                hint="Current conversion rate to Bangladeshi Taka"
                returnKeyType="next"
                onSubmitEditing={() => toleranceRef.current?.focus()}
              />

              <AppInput
                ref={toleranceRef}
                label="Bank Tolerance"
                labelIcon="stats-chart-outline"
                value={bankTolerance}
                onChangeText={(v) => { setBankTolerance(v); setResult(null); }}
                suffix="%"
                placeholder="10"
                returnKeyType="done"
              />
            </SectionCard>
          </Animated.View>

          {/* Transport Config */}
          <Animated.View entering={FadeInDown.duration(350).delay(200)}>
            <SectionCard title="Transport Details">
              <AppSegmentedControl
                label="TRANSPORT VIA"
                options={TRANSPORT_MODES}
                value={transportMode}
                onChange={handleTransportModeChange}
              />

              <AppSelect
                label="Condition of Cover"
                labelIcon="shield-checkmark-outline"
                options={MARINE_CONDITIONS[transportMode]}
                value={condition}
                onChange={handleConditionChange}
                placeholder="Select condition"
              />

              <AppInput
                ref={premiumRateRef}
                label="Premium Rate"
                labelIcon="pricetag-outline"
                value={premiumRate}
                onChangeText={(v) => { setPremiumRate(v); setResult(null); }}
                suffix="%"
                placeholder="0.00"
                returnKeyType="done"
              />
            </SectionCard>
          </Animated.View>

          {/* Options */}
          <Animated.View entering={FadeInDown.duration(350).delay(300)}>
             <SectionCard style={styles.optionCard}>
                <AppSlider
                  value={warEnabled}
                  onChange={(v) => { setWarEnabled(v); setResult(null); }}
                  label="Include War & SRCC"
                  description="War and Strike Risks coverage (Standard 0.05%)"
                  showProtectionIcon={true}
                />
              </SectionCard>
          </Animated.View>

          {/* Buttons */}
          <View style={styles.actionButtons}>
            <AppButton
              title="Calculate Marine Premium"
              onPress={handleCalculate}
              variant="primary"
              loading={isCalculating}
              icon={<Ionicons name="calculator" size={18} color="#fff" />}
            />
            <View style={styles.resetButtonWrap}>
              <AppButton
                title="Reset Form"
                onPress={handleReset}
                variant="ghost"
                disabled={isCalculating}
              />
            </View>
          </View>

          {/* Results */}
          {result && <MarineResultCard result={result} currencySymbol={currency === "USD" ? "$" : currency === "GBP" ? "£" : "€"} currencyCode={currency} />}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Result Components
// ─────────────────────────────────────────────────────────────────────────────

function ResultRow({ label, value, isTsi = false }: { label: string; value: string; isTsi?: boolean }) {
  return (
    <View style={styles.resultRow}>
      <Typography variant="body" style={isTsi ? styles.tsiLabel : styles.resultLabel}>{label}</Typography>
      <Typography variant="body" style={styles.resultValue}>{value}</Typography>
    </View>
  );
}

function MarineResultCard({ result, currencySymbol, currencyCode }: { result: MarineResult; currencySymbol: string; currencyCode: string }) {
  return (
    <Animated.View entering={SlideInDown.duration(400).springify()}>
      <SectionCard title="Marine Result" subtitle="Cover Note Breakdown" style={styles.resultCard}>
        <View style={styles.resultIcon}>
          <Ionicons name="receipt-outline" size={28} color="#F97316" />
        </View>

        <ResultRow 
          label={`TSI in ${currencyCode}`} 
          value={`${currencySymbol} ${formatCurrencyMarine(result.tsiInForeign)}`} 
          isTsi 
        />
        <ResultRow 
          label="TSI in BDT" 
          value={`BDT ${formatCurrencyMarine(result.tsiInBDT)}`} 
        />
        
        <View style={styles.divider} />
        
        <ResultRow 
          label={`Marine @ ${result.marineRate.toFixed(2)}%`} 
          value={`BDT ${formatCurrencyMarine(result.marinePremium)}`} 
        />
        {result.warSurcharge > 0 && (
          <ResultRow 
            label={`WAR & SRCC @ ${result.warRate.toFixed(4)}%`} 
            value={`BDT ${formatCurrencyMarine(result.warSurcharge)}`} 
          />
        )}
        
        <ResultRow label="Net Premium" value={`BDT ${formatCurrencyMarine(result.netPremium)}`} />
        <ResultRow label="VAT @ 15%" value={`BDT ${formatCurrencyMarine(result.vatAmount)}`} />
        <ResultRow label="Stamp Duty" value={`BDT ${formatCurrencyMarine(result.stampDuty)}`} />
        
        <View style={styles.divider} />
        
        <View style={styles.totalRow}>
          <Typography variant="subheading" style={styles.totalLabel}>Total Premium</Typography>
          <Animated.View entering={ZoomIn.duration(400).delay(200)}>
            <Typography variant="mono" style={styles.totalValue}>
              BDT {formatCurrencyMarine(result.totalPremium)}
            </Typography>
          </Animated.View>
        </View>
      </SectionCard>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0D1117" },
  header: { paddingHorizontal: 20, paddingTop: 12 },
  headerContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 14 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  marineIconBadge: { 
    width: 42, height: 42, borderRadius: 12, 
    backgroundColor: "rgba(249,115,22,0.15)", borderWidth: 1, borderColor: "rgba(249,115,22,0.3)", 
    alignItems: "center", justifyContent: "center" 
  },
  headerSubtitle: { color: "#F97316", letterSpacing: 1.2, fontSize: 10, marginBottom: 2 },
  headerTitle: { fontSize: 22 },
  headerBorder: { height: 1, backgroundColor: "#1F2937", marginHorizontal: -20 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  
  currencyRow: { flexDirection: "row", gap: 12 },
  currencyInputWrap: { flex: 1.6 },
  currencySelectWrap: { flex: 1 },
  
  optionCard: { marginTop: 4 },
  actionButtons: { gap: 12, marginTop: 8 },
  resetButtonWrap: { marginTop: 4 },
  
  // Results
  resultCard: { borderColor: "rgba(249,115,22,0.3)", backgroundColor: "#1A1F2E", marginTop: 12 },
  resultIcon: { alignSelf: "center", marginBottom: 16, width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(249,115,22,0.12)", borderWidth: 1, borderColor: "rgba(249,115,22,0.3)", alignItems: "center", justifyContent: "center" },
  resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  tsiLabel: { color: "#F97316", fontFamily: "Inter_600SemiBold" },
  resultLabel: { color: "#9CA3AF" },
  resultValue: { color: "#E5E7EB", fontFamily: "Inter_500Medium", textAlign: "right" },
  divider: { height: 1, backgroundColor: "#2D3748", marginVertical: 10 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  totalLabel: { color: "#F9FAFB" },
  totalValue: { fontSize: 24, color: "#F97316" },
});
