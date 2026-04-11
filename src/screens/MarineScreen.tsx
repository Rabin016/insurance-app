/**
 * MarineScreen — Marine Insurance Premium Calculator.
 * 
 * Refined with:
 * - Theme support (Light/Dark).
 * - Compact layout and reordered results.
 */

import React, { useRef, useState } from "react";
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

import { AppScreenWithHeader } from "../components/ui/AppScreen";
import ScreenHeader from "../components/ui/ScreenHeader";
import ResultRow from "../components/ui/ResultRow";

import AppInput from "../components/ui/AppInput";
import AppSelect from "../components/ui/AppSelect";
import AppSegmentedControl from "../components/ui/AppSegmentedControl";
import AppButton from "../components/ui/AppButton";
import AppSlider from "../components/ui/AppSlider";
import SectionCard from "../components/ui/SectionCard";
import Typography from "../components/ui/Typography";

import {
  TRANSPORT_MODES,
  MARINE_CONDITIONS,
  TransportMode,
} from "../constants/marineInsurance";
import {
  calculateMarinePremium,
  formatCurrencyMarine,
  getMarineRate,
  MarineResult,
} from "../utils/marineCalculations";

import { useTheme } from "../context/ThemeContext";

export default function MarineScreen() {
  const { colors, isDark } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  
  // Refs
  const limitRef = useRef<TextInput>(null);
  const rateRef = useRef<TextInput>(null);
  const toleranceRef = useRef<TextInput>(null);
  const premiumRateRef = useRef<TextInput>(null);

  // State
  const [limitAmount, setLimitAmount] = useState("");
  const [bankTolerance, setBankTolerance] = useState("10");
  const [currencyRate, setCurrencyRate] = useState("120.00");
  const [discount, setDiscount] = useState("");
  
  const [transportMode, setTransportMode] = useState<TransportMode>("SEA");
  const [condition, setCondition] = useState<string | null>("ICC_C"); // Default to ICC C
  const [premiumRate, setPremiumRate] = useState("0.30"); // Default rate for ICC C
  const [warEnabled, setWarEnabled] = useState(true); // Default to true
  
  const [result, setResult] = useState<MarineResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Handlers
  const handleTransportModeChange = (mode: string) => {
    const nextMode = mode as TransportMode;
    setTransportMode(nextMode);
    setCondition(null);
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
      const discountVal = parseFloat(discount) || 0;
      const res = calculateMarinePremium(limit, tol, rate, pRate, warEnabled, transportMode, discountVal);
      setResult(res);
      setIsCalculating(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
    }, 500);
  };

  const handleReset = () => {
    setLimitAmount("");
    setBankTolerance("10");
    setCurrencyRate("120.00");
    setDiscount("");
    setTransportMode("SEA");
    setCondition("ICC_C");
    setPremiumRate("0.30");
    setWarEnabled(true);
    setResult(null);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <AppScreenWithHeader
      scrollRef={scrollRef}
      header={
        <ScreenHeader 
          title="Marine Insurance" 
          subtitle="PREMIUM CALCULATOR" 
          iconName="boat-outline" 
        />
      }
    >
          <Animated.View entering={FadeInDown.duration(350).delay(100)}>
            <SectionCard title="Value & Currency" accent>
              <AppInput
                ref={limitRef}
                label="Limit Amount"
                labelIcon="cash-outline"
                value={limitAmount}
                onChangeText={(v) => { setLimitAmount(v); setResult(null); }}
                prefix="$"
                placeholder="10,000"
                returnKeyType="next"
                onSubmitEditing={() => rateRef.current?.focus()}
              />

              <AppInput
                ref={rateRef}
                label="Currency Rate (to BDT)"
                labelIcon="swap-horizontal-outline"
                value={currencyRate}
                onChangeText={(v) => { setCurrencyRate(v); setResult(null); }}
                prefix="BDT"
                placeholder="120.00"
                hint="Conversion rate to Bangladeshi Taka"
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

          <Animated.View entering={FadeInDown.duration(350).delay(300)}>
            <SectionCard style={{ marginTop: 4 }}>
              <AppSlider
                value={warEnabled}
                onChange={(v) => { setWarEnabled(v); setResult(null); }}
                label="Include War & SRCC"
                description="Standard coverage at 0.05%"
                showProtectionIcon={true}
              />
            </SectionCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(350).delay(350)}>
            <SectionCard title="Offers & Discounts">
              <AppInput
                label="Discount (%)"
                labelIcon="gift-outline"
                value={discount}
                onChangeText={(v) => { setDiscount(v); setResult(null); }}
                suffix="%"
                placeholder="0"
                returnKeyType="done"
              />
            </SectionCard>
          </Animated.View>

          <View style={styles.actionButtons}>
            <AppButton
              title="Calculate Marine Premium"
              onPress={handleCalculate}
              variant="primary"
              loading={isCalculating}
              icon={<Ionicons name="calculator" size={18} color="#fff" />}
            />
            <AppButton
              title="Reset Form"
              onPress={handleReset}
              variant="ghost"
              disabled={isCalculating}
            />
          </View>

          {result && <MarineResultCard result={result} />}
    </AppScreenWithHeader>
  );
}


function MarineResultCard({ result }: { result: MarineResult }) {
  const { isDark, colors } = useTheme();
  
  const totalBeforeDiscount = result.netPremium + result.vatAmount + result.stampDuty;

  return (
    <Animated.View entering={SlideInDown.duration(400).springify()}>
      <SectionCard 
        title="Marine Result" 
        subtitle="Cover Note Breakdown" 
        style={[styles.resultCard, { borderColor: isDark ? "rgba(249,115,22,0.35)" : "rgba(249,115,22,0.15)", backgroundColor: isDark ? "#2E3238" : "#F8FAFC" }]}
      >
        <View style={[styles.resultIcon, { backgroundColor: isDark ? "rgba(249,115,22,0.1)" : "rgba(249,115,22,0.05)" }]}>
          <Ionicons name="receipt-outline" size={24} color="#F97316" />
        </View>

        <ResultRow label="TSI in USD" value={`$ ${formatCurrencyMarine(result.tsiInForeign)}`} primary />
        <ResultRow label="TSI in BDT" value={`BDT ${formatCurrencyMarine(result.tsiInBDT)}`} />
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        <ResultRow label={`Marine @ ${result.marineRate.toFixed(2)}%`} value={`BDT ${formatCurrencyMarine(result.marinePremium)}`} />
        {result.warSurcharge > 0 && (
          <ResultRow label={`WAR & SRCC @ ${result.warRate.toFixed(3)}%`} value={`BDT ${formatCurrencyMarine(result.warSurcharge)}`} />
        )}
        <ResultRow label="VAT @ 15%" value={`BDT ${formatCurrencyMarine(result.vatAmount)}`} />
        <ResultRow label="Stamp Duty" value={`BDT ${formatCurrencyMarine(result.stampDuty)}`} />
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        {result.discountAmount > 0 ? (
          <>
            <ResultRow 
              label="Total (Without Discount)" 
              value={`BDT ${formatCurrencyMarine(totalBeforeDiscount)}`} 
              color="#F97316"
            />
            <ResultRow 
              label={`Discount (${result.discountPercent}%)`} 
              value={`- BDT ${formatCurrencyMarine(result.discountAmount)}`} 
              color="#10B981"
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </>
        ) : null}
        
        <View style={styles.totalRow}>
          <Typography variant="subheading" style={{ fontSize: 18 }}>Final Premium</Typography>
          <Animated.View entering={ZoomIn.duration(400).delay(200)}>
            <Typography variant="mono" style={{ fontSize: 24, color: "#F97316" }}>
              BDT {formatCurrencyMarine(result.totalPremium)}
            </Typography>
          </Animated.View>
        </View>
      </SectionCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  actionButtons: { gap: 10, marginTop: 4 },
  resultCard: { borderWidth: 1.5, marginTop: 10 },
  resultIcon: { alignSelf: "center", marginBottom: 12, width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: "rgba(249,115,22,0.2)", alignItems: "center", justifyContent: "center" },
  divider: { height: 1, marginVertical: 8, opacity: 0.5 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
});
