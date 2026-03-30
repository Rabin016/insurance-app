/**
 * FireScreen — Main Fire Insurance Premium Calculator screen.
 *
 * Updated with:
 * - ResultCard fixes: Added missing ${} for template literals.
 * - Alignment fixes: Removed flex:1 from labels to prevent vertical stacking.
 * - Terminology match: Changed to "Net Premium" and "Total Amount".
 */

import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
  Pressable,
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
import AppToggle from "../components/ui/AppToggle";
import AppButton from "../components/ui/AppButton";
import AppSlider from "../components/ui/AppSlider";
import SectionCard from "../components/ui/SectionCard";
import Typography from "../components/ui/Typography";

import { OCCUPANCY_TYPES, RISK_CLASSES } from "../constants/fireInsurance";
import {
  calculatePremium,
  formatCurrency,
  getPremiumRate,
  calculateTSI,
  PremisesEntry,
  PremiumResult,
} from "../utils/fireCalculations";

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function newPremises(): PremisesEntry {
  return {
    id: generateId(),
    riskClass: "CLASS_I",
    occupancyType: null,
    premiumRate: "",
    sumInsured: "",
    isPercentage: true,
  };
}

const getLabel = (value: string | null, options: any) => {
  return options.find((o: any) => o.value === value)?.label || "Premises";
};

// ─────────────────────────────────────────────────────────────────────────────
// PremisesCard
// ─────────────────────────────────────────────────────────────────────────────
interface PremisesCardProps {
  entry: PremisesEntry;
  index: number;
  totalCount: number;
  tsi: number;
  onUpdate: (id: string, updates: Partial<PremisesEntry>) => void;
  onRemove: (id: string) => void;
  occRef: React.RefObject<AppSelectRef | null>;
  rateRef: React.RefObject<TextInput | null>;
  sumRef: React.RefObject<TextInput | null>;
}

function PremisesCard({
  entry,
  index,
  totalCount,
  tsi,
  onUpdate,
  onRemove,
  occRef,
  rateRef,
  sumRef,
}: PremisesCardProps) {
  const occupancyLabel = getLabel(entry.occupancyType, OCCUPANCY_TYPES);
  const cardTitle = entry.occupancyType ? `${occupancyLabel} ${index + 1}` : `Premises ${index + 1}`;

  const handleRiskClassChange = (value: string) => {
    const riskClass = value as PremisesEntry["riskClass"];
    const rate = getPremiumRate(riskClass, entry.occupancyType);
    onUpdate(entry.id, { riskClass, premiumRate: rate > 0 ? rate.toString() : "" });
  };

  const handleOccupancyChange = (value: string) => {
    const occupancyType = value as PremisesEntry["occupancyType"];
    const rate = getPremiumRate(entry.riskClass, occupancyType);
    onUpdate(entry.id, { occupancyType, premiumRate: rate > 0 ? rate.toString() : "" });
    setTimeout(() => {
      if (!rate) rateRef.current?.focus();
      else sumRef.current?.focus();
    }, 100);
  };

  return (
    <Animated.View entering={FadeInDown.duration(300).springify()}>
      <SectionCard title={cardTitle} accent style={styles.premisesCard}>
        {totalCount > 1 && (
          <Pressable
            style={styles.removeBtnContainer}
            onPress={() => onRemove(entry.id)}
          >
            <View style={styles.removeBtnCircle}>
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </View>
          </Pressable>
        )}

        <AppSegmentedControl
          label="RISK CLASSIFICATION"
          options={RISK_CLASSES}
          value={entry.riskClass}
          onChange={handleRiskClassChange}
        />

        <AppSelect
          ref={occRef}
          label="Occupancy Type"
          labelIcon="business-outline"
          options={OCCUPANCY_TYPES as any}
          value={entry.occupancyType}
          onChange={handleOccupancyChange}
          placeholder="Select occupancy type"
        />

        <AppInput
          ref={rateRef}
          label="Premium Rate"
          value={entry.premiumRate}
          onChangeText={(v) => onUpdate(entry.id, { premiumRate: v })}
          suffix="%"
          placeholder="0.00"
          hint="Edit manually if needed"
          returnKeyType="next"
          onSubmitEditing={() => sumRef.current?.focus()}
        />

        <AppToggle
          label="Calculate By:"
          value={entry.isPercentage}
          options={[
            { label: "%", value: true },
            { label: "Amount", value: false },
          ]}
          onChange={(newVal) => onUpdate(entry.id, { isPercentage: newVal })}
        />

        <AppInput
          ref={sumRef}
          label={entry.isPercentage ? "Sum Insured Percentage" : "Sum Insured Amount"}
          value={entry.sumInsured}
          onChangeText={(text) => onUpdate(entry.id, { sumInsured: text })}
          prefix={entry.isPercentage ? undefined : "BDT"}
          suffix={entry.isPercentage ? "%" : undefined}
          placeholder={entry.isPercentage ? "100" : "0.00"}
          hint={entry.isPercentage ? `Of Total Sum Insured (BDT ${formatCurrency(tsi)})` : "Direct allocation"}
          returnKeyType="done"
        />
      </SectionCard>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main FireScreen Component
// ─────────────────────────────────────────────────────────────────────────────
export default function FireScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const limitRef = useRef<TextInput>(null);
  const toleranceRef = useRef<TextInput>(null);
  const premisesRefs = useRef<Record<string, {
    occ: React.RefObject<AppSelectRef | null>;
    rate: React.RefObject<TextInput | null>;
    sum: React.RefObject<TextInput | null>;
  }>>({});

  const [limitAmount, setLimitAmount] = useState("");
  const [bankTolerance, setBankTolerance] = useState("10");
  const [discount, setDiscount] = useState("");
  const [premises, setPremises] = useState([newPremises()]);
  const [rsdEnabled, setRsdEnabled] = useState(false);
  const [result, setResult] = useState<PremiumResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const limitNum = parseFloat(limitAmount) || 0;
  const toleranceNum = parseFloat(bankTolerance) || 0;
  const tsi = calculateTSI(limitNum, toleranceNum);

  const handleUpdatePremises = useCallback((id: string, updates: Partial<PremisesEntry>) => {
    setPremises((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const handleRemovePremises = useCallback((id: string) => {
    setPremises((prev) => prev.filter((p) => p.id !== id));
    delete premisesRefs.current[id];
    setResult(null);
  }, []);

  const handleAddPremises = () => {
    const p = newPremises();
    setPremises((prev) => [...prev, p]);
    setResult(null);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleReset = () => {
    setLimitAmount("");
    setBankTolerance("10");
    setDiscount("");
    setPremises([newPremises()]);
    setRsdEnabled(false);
    setResult(null);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleCalculate = () => {
    const limitVal = parseFloat(limitAmount) || 0;
    if (limitVal < 100000) {
      Alert.alert("Validation Error", "Limit Amount at least 1,00,000 BDT.");
      return;
    }
    const incomplete = premises.some(p => !p.premiumRate || !p.sumInsured);
    if (incomplete) {
      Alert.alert("Validation Error", "Please fill all fields.");
      return;
    }
    let totalSI = 0;
    premises.forEach(p => {
      const siVal = parseFloat(p.sumInsured) || 0;
      totalSI += p.isPercentage ? (tsi * (siVal / 100)) : siVal;
    });
    if (Math.abs(totalSI - tsi) > 1) {
      Alert.alert("Validation Error", "Total Premises Sum Insured must equal Total Sum Insured.");
      return;
    }
    setIsCalculating(true);
    setTimeout(() => {
      const discountVal = parseFloat(discount) || 0;
      const res = calculatePremium(premises, limitNum, toleranceNum, rsdEnabled, discountVal);
      setResult(res);
      setIsCalculating(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
    }, 500);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} behavior={Platform.OS === "android" ? "height" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.fireIconBadge}>
                <Ionicons name="flame" size={20} color="#F97316" />
              </View>
              <View>
                <Typography variant="caption" style={styles.headerSubtitle}>PREMIUM CALCULATOR</Typography>
                <Typography variant="heading" style={styles.headerTitle}>Fire Insurance</Typography>
              </View>
            </View>
          </View>
          <View style={styles.headerBorder} />
        </Animated.View>

        <ScrollView
          ref={scrollRef} style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 60 }]}
          showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.duration(350).delay(100)}>
            <SectionCard title="Basic Information" accent>
              <AppInput ref={limitRef} label="Limit Amount" labelIcon="cash-outline" value={limitAmount} onChangeText={(v) => { setLimitAmount(v); setResult(null); }} prefix="BDT" placeholder="500,000" hint="Min 1,0,0,000 BDT" returnKeyType="next" onSubmitEditing={() => toleranceRef.current?.focus()} />
              <AppInput ref={toleranceRef} label="Bank Tolerance" value={bankTolerance} onChangeText={(v) => { setBankTolerance(v); setResult(null); }} suffix="%" placeholder="10" hint={limitNum > 0 ? `Total Sum Insured: BDT ${formatCurrency(tsi)}` : "Added to limit"} returnKeyType="next" />
            </SectionCard>
          </Animated.View>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionDot} />
              <Typography variant="subheading">Premises Occupations</Typography>
            </View>
          </View>

          {premises.map((entry, index) => {
            if (!premisesRefs.current[entry.id]) {
              premisesRefs.current[entry.id] = { occ: React.createRef<AppSelectRef | null>(), rate: React.createRef<TextInput | null>(), sum: React.createRef<TextInput | null>() };
            }
            const refs = premisesRefs.current[entry.id]!;
            return (
              <PremisesCard
                key={entry.id} entry={entry} index={index}
                totalCount={premises.length} tsi={tsi}
                onUpdate={handleUpdatePremises} onRemove={handleRemovePremises}
                occRef={refs.occ} rateRef={refs.rate} sumRef={refs.sum}
              />
            );
          })}

          <AppButton title="+ Add Another Premises" onPress={handleAddPremises} variant="secondary" />

          <SectionCard style={styles.rsdCard}>
            <AppSlider
              value={rsdEnabled}
              onChange={(v) => { setRsdEnabled(v); setResult(null); }}
              label="RSD Coverage"
              description="Riots, Strikes & Damage protection"
              showProtectionIcon={true}
            />
          </SectionCard>

          <Animated.View entering={FadeInDown.duration(350).delay(350)}>
            <SectionCard title="Offers & Discounts">
              <AppInput
                label="Discount (%)"
                labelIcon="gift-outline"
                value={discount}
                onChangeText={(v) => { setDiscount(v); setResult(null); }}
                suffix="%"
                placeholder="0"
                hint="Percentage discount on total Net Premium"
                returnKeyType="done"
              />
            </SectionCard>
          </Animated.View>

          <View style={styles.actionButtons}>
            <AppButton title="Calculate Premium" onPress={handleCalculate} variant="primary" loading={isCalculating} icon={<Ionicons name="calculator" size={18} color="#fff" />} />
            <View style={styles.resetButtonWrap}>
              <AppButton title="Reset Form" onPress={handleReset} variant="ghost" disabled={isCalculating} />
            </View>
          </View>

          {result && <ResultCard result={result} premises={premises} />}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ResultCard Detail Components
// ─────────────────────────────────────────────────────────────────────────────
function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.resultRow}>
      <Typography variant="body" style={styles.resultLabel}>{label}</Typography>
      <Typography variant="body" style={styles.resultValue}>{value}</Typography>
    </View>
  );
}

function ResultCard({ result, premises }: { result: PremiumResult; premises: PremisesEntry[] }) {
  return (
    <Animated.View entering={SlideInDown.duration(400).springify()}>
      <SectionCard title="Calculation Result" subtitle="Rounded to nearest BDT" style={styles.resultCard}>
        <View style={styles.resultIcon}>
          <Ionicons name="receipt-outline" size={28} color="#F97316" />
        </View>
        <ResultRow label="Total Sum Insured" value={`BDT ${formatCurrency(result.totalSumInsured)}`} />
        <View style={styles.breakdownHeader}>
          <Typography variant="caption" style={styles.breakdownLabel}>Premium Breakdown</Typography>
        </View>
        
        {result.premisesResults.map((pr, idx) => {
          const occLabel = getLabel(premises[idx]?.occupancyType, OCCUPANCY_TYPES);
          const label = premises[idx]?.occupancyType ? `${occLabel} ${idx + 1}` : `Premises ${idx + 1}`;
          return (
            <View key={pr.id} style={styles.premisesResultRow}>
              <View style={styles.premisesResultInfo}>
                <Typography variant="caption" color="#9CA3AF">{label} ({pr.rate}%)</Typography>
                <Typography variant="caption" color="#4B5563">Value: BDT {formatCurrency(pr.sumInsured)}</Typography>
              </View>
              <Typography variant="body" style={styles.premisesResultValue}>BDT {formatCurrency(pr.netPremium)}</Typography>
            </View>
          );
        })}
        <View style={styles.divider} />
        
        <ResultRow label="Net Premium" value={`BDT ${formatCurrency(result.totalNetPremium)}`} />
        
        {result.discountAmount > 0 && (
          <>
            <ResultRow 
              label="Discount Amount" 
              value={`- BDT ${formatCurrency(result.discountAmount)}`} 
            />
            <ResultRow 
              label="Deducted Net Premium" 
              value={`BDT ${formatCurrency(result.discountedNetPremium)}`} 
            />
          </>
        )}

        <ResultRow label="VAT (15%)" value={`BDT ${formatCurrency(result.vatAmount)}`} />
        
        <View style={styles.divider} />
        <View style={styles.netPremiumRow}>
          <Typography variant="subheading" style={styles.netLabel}>Total Amount</Typography>
          <Animated.View entering={ZoomIn.duration(400).delay(200)}>
            <Typography variant="mono" style={{ fontSize: 24, color: "#F97316" }}>BDT {formatCurrency(result.totalPremium)}</Typography>
          </Animated.View>
        </View>
      </SectionCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0D1117" },
  header: { paddingHorizontal: 20, paddingTop: 12 },
  headerContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 14 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  fireIconBadge: { width: 42, height: 42, borderRadius: 12, backgroundColor: "rgba(249,115,22,0.15)", borderWidth: 1, borderColor: "rgba(249,115,22,0.3)", alignItems: "center", justifyContent: "center" },
  headerSubtitle: { color: "#F97316", letterSpacing: 1.2, fontSize: 10, marginBottom: 2 },
  headerTitle: { fontSize: 22 },
  headerBorder: { height: 1, backgroundColor: "#1F2937", marginHorizontal: -20 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: -4, marginTop: 4 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#F97316" },
  premisesCard: { position: "relative" },
  removeBtnContainer: { position: "absolute", top: 12, right: 12, zIndex: 10 },
  removeBtnCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(239,68,68,0.1)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" },
  rsdCard: { marginTop: 4 },
  actionButtons: { gap: 12, marginTop: 8 },
  resetButtonWrap: { marginTop: 4 },
  resultCard: { borderColor: "rgba(249,115,22,0.3)", backgroundColor: "#1A1F2E", marginTop: 12 },
  resultIcon: { alignSelf: "center", marginBottom: 16, width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(249,115,22,0.12)", borderWidth: 1, borderColor: "rgba(249,115,22,0.3)", alignItems: "center", justifyContent: "center" },
  resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  resultLabel: { color: "#9CA3AF" }, // Removed flex: 1 here
  resultValue: { color: "#E5E7EB", fontFamily: "Inter_500Medium", textAlign: "right" },
  breakdownHeader: { marginTop: 12, marginBottom: 6 },
  breakdownLabel: { color: "#F97316", textTransform: "uppercase", letterSpacing: 1, fontSize: 11 },
  premisesResultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, paddingHorizontal: 10, backgroundColor: "rgba(15,23,42,0.6)", borderRadius: 10, marginBottom: 6, borderWidth: 1, borderColor: "#1F2937" },
  premisesResultInfo: { flex: 1 },
  premisesResultValue: { color: "#F9FAFB", fontFamily: "Inter_600SemiBold" },
  divider: { height: 1, backgroundColor: "#2D3748", marginVertical: 10 },
  netPremiumRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  netLabel: { color: "#F9FAFB" },
});
