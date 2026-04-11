/**
 * MotorScreen — Motor Insurance Premium Calculator.
 * 
 * Implements exact formulas matching certificate examples.
 * Integrated with the premium Graphite/Silver theme.
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
import AppCardMultiSelect from "../components/ui/AppCardMultiSelect";
import AppSegmentedControl from "../components/ui/AppSegmentedControl";
import AppButton from "../components/ui/AppButton";
import SectionCard from "../components/ui/SectionCard";
import Typography from "../components/ui/Typography";

import {
  CAPACITY_OPTIONS,
  CapacityClass,
  EXCLUSION_PERILS_OPTIONS,
  ExclusionPeril,
} from "../constants/motorInsurance";
import {
  calculateMotorPremium,
  formatCurrencyMotor,
  MotorResult,
} from "../utils/motorCalculations";

import { useTheme } from "../context/ThemeContext";

export default function MotorScreen() {
  const { colors, isDark } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  
  // Refs
  const fivRef = useRef<TextInput>(null);
  const seatingRef = useRef<TextInput>(null);
  const ncbRef = useRef<TextInput>(null);
  const discountRef = useRef<TextInput>(null);

  // State
  const [fivAmount, setFivAmount] = useState("");
  const [capacity, setCapacity] = useState<CapacityClass>("C1500_1800");
  const [seatingCapacity, setSeatingCapacity] = useState("5");
  const [selectedExclusions, setSelectedExclusions] = useState<string[]>([]);
  const [ncbPercent, setNcbPercent] = useState("");
  const [discount, setDiscount] = useState("");
  
  const [result, setResult] = useState<MotorResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Handlers
  const handleCalculate = () => {
    const fiv = parseFloat(fivAmount) || 0;
    const seating = parseInt(seatingCapacity, 10) || 0;
    const ncb = parseFloat(ncbPercent) || 0;
    const disc = parseFloat(discount) || 0;

    if (fiv <= 0) {
      Alert.alert("Validation Error", "Please enter a valid Full Insured Value.");
      return;
    }
    if (seating <= 0) {
      Alert.alert("Validation Error", "Please enter a valid Seating Capacity.");
      return;
    }

    setIsCalculating(true);
    setTimeout(() => {
      const res = calculateMotorPremium(
        fiv,
        capacity,
        seating,
        selectedExclusions as ExclusionPeril[],
        ncb,
        disc
      );
      setResult(res);
      setIsCalculating(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
    }, 500);
  };

  const handleReset = () => {
    setFivAmount("");
    setCapacity("C1500_1800");
    setSeatingCapacity("5");
    setSelectedExclusions([]);
    setNcbPercent("");
    setDiscount("");
    setResult(null);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <AppScreenWithHeader
      scrollRef={scrollRef}
      header={
        <ScreenHeader 
          title="Motor Insurance" 
          subtitle="PREMIUM CALCULATOR" 
          iconName="car-outline" 
        />
      }
    >
          <Animated.View entering={FadeInDown.duration(350).delay(100)}>
            <SectionCard title="Vehicle Information" accent>
              <AppInput
                ref={fivRef}
                label="Full Insured Value (FIV)"
                labelIcon="cash-outline"
                value={fivAmount}
                onChangeText={(v) => { setFivAmount(v); setResult(null); }}
                prefix="BDT"
                placeholder="32,50,000"
                returnKeyType="next"
                onSubmitEditing={() => seatingRef.current?.focus()}
              />

              <AppSegmentedControl
                label="CARRYING CAPACITY"
                options={CAPACITY_OPTIONS}
                value={capacity}
                onChange={(v) => { setCapacity(v as CapacityClass); setResult(null); }}
              />

              <AppInput
                ref={seatingRef}
                label="Seating Capacity"
                labelIcon="people-outline"
                value={seatingCapacity}
                onChangeText={(v) => { setSeatingCapacity(v); setResult(null); }}
                placeholder="5"
                hint="Including Driver"
                returnKeyType="next"
                onSubmitEditing={() => ncbRef.current?.focus()}
              />
            </SectionCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(350).delay(200)}>
            <SectionCard title="Deductions & Exclusions">
              <AppCardMultiSelect
                label="Less on FIV (Exclusions)"
                labelIcon="shield-half-outline"
                options={EXCLUSION_PERILS_OPTIONS}
                values={selectedExclusions}
                onChange={(vals) => { setSelectedExclusions(vals); setResult(null); }}
              />

              <AppInput
                ref={ncbRef}
                label="No Claim Bonus (NCB)"
                labelIcon="star-outline"
                value={ncbPercent}
                onChangeText={(v) => { setNcbPercent(v); setResult(null); }}
                suffix="%"
                placeholder="40"
                hint="Calculated on Own Damage Premium"
                returnKeyType="next"
                onSubmitEditing={() => discountRef.current?.focus()}
              />
            </SectionCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(350).delay(300)}>
            <SectionCard title="Offers & Discounts">
              <AppInput
                ref={discountRef}
                label="Special Discount"
                labelIcon="gift-outline"
                value={discount}
                onChangeText={(v) => { setDiscount(v); setResult(null); }}
                suffix="%"
                placeholder="0"
                hint="Applied to final net premium"
                returnKeyType="done"
              />
            </SectionCard>
          </Animated.View>

          <View style={styles.actionButtons}>
            <AppButton
              title="Calculate Premium"
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

          {result && <MotorResultCard result={result} />}
    </AppScreenWithHeader>
  );
}


function MotorResultCard({ result }: { result: MotorResult }) {
  const { isDark, colors } = useTheme();
  
  return (
    <Animated.View entering={SlideInDown.duration(400).springify()}>
      <SectionCard 
        title="Premium Computation" 
        subtitle="Detailed Breakdown" 
        style={[styles.resultCard, { borderColor: isDark ? "rgba(249,115,22,0.35)" : "rgba(249,115,22,0.15)", backgroundColor: isDark ? "#2E3238" : "#F8FAFC" }]}
      >
        <View style={[styles.resultIcon, { backgroundColor: isDark ? "rgba(249,115,22,0.1)" : "rgba(249,115,22,0.05)" }]}>
          <Ionicons name="receipt-outline" size={24} color="#F97316" />
        </View>

        <ResultRow label="Basic Premium" value={`BDT ${formatCurrencyMotor(result.basicPremium)}`} />
        <ResultRow label="Plus: 2.65% on FIV" value={`BDT ${formatCurrencyMotor(result.fivAmount)}`} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {result.exclusionAmount > 0 && (
          <>
            <ResultRow 
              label={`Less: ${result.exclusionPercent}% (Exclusions) on FIV`} 
              value={`BDT ${formatCurrencyMotor(result.exclusionAmount)}`} 
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </>
        )}

        <ResultRow label="Own Damage Premium" value={`BDT ${formatCurrencyMotor(result.ownDamagePremium)}`} isBold color={colors.text} />

        {result.ncbAmount > 0 && (
          <ResultRow 
            label={`Less: NCB ${result.ncbPercent}%`} 
            value={`BDT ${formatCurrencyMotor(result.ncbAmount)}`} 
          />
        )}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <ResultRow label="Sub Total" value={`BDT ${formatCurrencyMotor(result.subTotalOwnDamage)}`} isBold color={colors.text} />
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <ResultRow label="Motor Liability Premium" value={`BDT ${formatCurrencyMotor(result.liabilityPremium)}`} />
        {result.passengerAmount > 0 && (
          <ResultRow label={`Passenger (${result.passengerCount} X 225)`} value={`BDT ${formatCurrencyMotor(result.passengerAmount)}`} />
        )}
        <ResultRow label="Paid Driver" value={`BDT ${formatCurrencyMotor(result.paidDriverAmount)}`} />

        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <ResultRow label="Net Premium" value={`BDT ${formatCurrencyMotor(result.totalNetPremium)}`} isBold color={colors.text} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {result.discountAmount > 0 ? (
          <>
            <ResultRow 
              label="Total (Without Discount)" 
              value={`BDT ${formatCurrencyMotor(result.totalNetPremium + result.vatAmount)}`} 
              color="#F97316"
            />
            <ResultRow 
              label={`Discount (${result.discountPercent}%)`} 
              value={`- BDT ${formatCurrencyMotor(result.discountAmount)}`} 
              color="#10B981"
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </>
        ) : null}

        <ResultRow label="Add: VAT @15%" value={`BDT ${formatCurrencyMotor(result.vatAmount)}`} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.totalRow}>
          <Typography variant="subheading" style={{ fontSize: 18 }}>Gross Premium</Typography>
          <Animated.View entering={ZoomIn.duration(400).delay(200)}>
            <Typography variant="mono" style={{ fontSize: 24, color: "#F97316" }}>
              BDT {formatCurrencyMotor(result.totalPremium)}
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
  divider: { height: 1, marginVertical: 6, opacity: 0.5 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4, paddingTop: 6 },
});
