/**
 * FireScreen — Fire Insurance Premium Calculator.
 * 
 * Refined with:
 * - Theme support (Light/Dark).
 * - Compact layout and reordered results.
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

import { AppScreenWithHeader } from "../components/ui/AppScreen";
import ScreenHeader from "../components/ui/ScreenHeader";
import ResultRow from "../components/ui/ResultRow";

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

import { useTheme } from "../context/ThemeContext";

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
    occupancyType: "SHOP", // Default to Shop
    premiumRate: "0.15",    // Default rate for Class I Shop
    sumInsured: "100",      // Default to 100%
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
  const { colors, isDark } = useTheme();
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
            <View style={[styles.removeBtnCircle, { backgroundColor: isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.1)" }]}>
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
          hint={entry.isPercentage ? `Of Total TSI (BDT ${formatCurrency(tsi)})` : undefined}
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
  const { colors, isDark } = useTheme();
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
  const [rsdEnabled, setRsdEnabled] = useState(true); // Default to true
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
    // Focus the new occupancy selector after a short delay
    setTimeout(() => {
      const refs = premisesRefs.current[p.id];
      if (refs && refs.occ.current) {
        refs.occ.current.open(); // Corrected from toggle() to open()
      }
    }, 150);
  };

  const handleReset = () => {
    setLimitAmount("");
    setBankTolerance("10");
    setDiscount("");
    setPremises([newPremises()]);
    setRsdEnabled(true);
    setResult(null);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleCalculate = () => {
    const limitVal = parseFloat(limitAmount) || 0;
    if (limitVal < 100000) {
      Alert.alert("Validation Error", "Minimum Limit Amount 1,00,000 BDT.");
      return;
    }
    const incomplete = premises.some(p => !p.premiumRate || !p.sumInsured);
    if (incomplete) {
      Alert.alert("Validation Error", "Please fill all fields for all premises.");
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
    <AppScreenWithHeader
      scrollRef={scrollRef}
      header={
        <ScreenHeader 
          title="Fire Insurance" 
          subtitle="PREMIUM CALCULATOR" 
          iconName="flame" 
        />
      }
    >
          <Animated.View entering={FadeInDown.duration(350).delay(100)}>
            <SectionCard title="Basic Information" accent>
              <AppInput ref={limitRef} label="Limit Amount" labelIcon="cash-outline" value={limitAmount} onChangeText={(v) => { setLimitAmount(v); setResult(null); }} prefix="BDT" placeholder="500,000" returnKeyType="next" onSubmitEditing={() => toleranceRef.current?.focus()} />
              <AppInput ref={toleranceRef} label="Bank Tolerance" value={bankTolerance} onChangeText={(v) => { setBankTolerance(v); setResult(null); }} suffix="%" placeholder="10" hint={limitNum > 0 ? `TSI: BDT ${formatCurrency(tsi)}` : undefined} returnKeyType="next" />
            </SectionCard>
          </Animated.View>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionDot} />
              <Typography variant="subheading">Premises Layout</Typography>
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

          <SectionCard style={{ marginTop: 4 }}>
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
                returnKeyType="done"
              />
            </SectionCard>
          </Animated.View>

          <View style={styles.actionButtons}>
            <AppButton title="Calculate Premium" onPress={handleCalculate} variant="primary" loading={isCalculating} icon={<Ionicons name="calculator" size={18} color="#fff" />} />
            <AppButton title="Reset Form" onPress={handleReset} variant="ghost" disabled={isCalculating} />
          </View>

          {result && <ResultCard result={result} premises={premises} />}
    </AppScreenWithHeader>
  );
}


function ResultCard({ result, premises }: { result: PremiumResult; premises: PremisesEntry[] }) {
  const { isDark, colors } = useTheme();
  const totalBeforeDiscount = result.totalNetPremium + result.vatAmount;

  return (
    <Animated.View entering={SlideInDown.duration(400).springify()}>
      <SectionCard 
        title="Calculation Result" 
        subtitle="Final Premium Summary" 
        style={[styles.resultCard, { borderColor: isDark ? "rgba(249,115,22,0.35)" : "rgba(249,115,22,0.15)", backgroundColor: isDark ? "#2E3238" : "#F8FAFC" }]}
      >
        <View style={[styles.resultIcon, { backgroundColor: isDark ? "rgba(249,115,22,0.1)" : "rgba(249,115,22,0.05)" }]}>
          <Ionicons name="receipt-outline" size={24} color="#F97316" />
        </View>

        <ResultRow label="Total Sum Insured" value={`BDT ${formatCurrency(result.totalSumInsured)}`} />
        
        <View style={styles.breakdownHeader}>
          <Typography variant="caption" color="#F97316" style={{ textTransform: "uppercase", letterSpacing: 1 }}>Premium Breakdown</Typography>
        </View>
        
        {result.premisesResults.map((pr, idx) => {
          const occLabel = getLabel(premises[idx]?.occupancyType, OCCUPANCY_TYPES);
          const label = premises[idx]?.occupancyType ? `${occLabel} ${idx + 1}` : `Premises ${idx + 1}`;
          return (
            <View key={pr.id} style={[styles.premisesResultRow, { backgroundColor: isDark ? "rgba(15,23,42,0.6)" : "rgba(241,245,249,0.5)", borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Typography variant="caption" color={colors.textSecondary}>{label} ({pr.rate}%)</Typography>
                <Typography variant="caption" color={colors.textSecondary} style={{ fontSize: 10 }}>Val: BDT {formatCurrency(pr.sumInsured)}</Typography>
              </View>
              <Typography variant="body" style={{ fontWeight: "700" }}>BDT {formatCurrency(pr.netPremium)}</Typography>
            </View>
          );
        })}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        <ResultRow label="Net Premium" value={`BDT ${formatCurrency(result.totalNetPremium)}`} />
        <ResultRow label="VAT (15%)" value={`BDT ${formatCurrency(result.vatAmount)}`} />
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        {result.discountAmount > 0 ? (
          <>
            <ResultRow 
              label="Total (Without Discount)" 
              value={`BDT ${formatCurrency(totalBeforeDiscount)}`} 
              primary
            />
            <ResultRow 
              label={`Discount (${result.discountAmount > 0 ? "Applied" : ""})`} 
              value={`- BDT ${formatCurrency(result.discountAmount)}`} 
              color="#10B981"
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </>
        ) : null}
        
        <View style={styles.totalRow}>
          <Typography variant="subheading" style={{ fontSize: 18 }}>Final Premium</Typography>
          <Animated.View entering={ZoomIn.duration(400).delay(200)}>
            <Typography variant="mono" style={{ fontSize: 24, color: "#F97316" }}>BDT {formatCurrency(result.totalPremium)}</Typography>
          </Animated.View>
        </View>
      </SectionCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: -4, marginTop: 4 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#F97316" },
  premisesCard: { position: "relative" },
  removeBtnContainer: { position: "absolute", top: 12, right: 12, zIndex: 10 },
  removeBtnCircle: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" },
  actionButtons: { gap: 10, marginTop: 4 },
  resultCard: { borderWidth: 1.5, marginTop: 10 },
  resultIcon: { alignSelf: "center", marginBottom: 12, width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: "rgba(249,115,22,0.2)", alignItems: "center", justifyContent: "center" },
  breakdownHeader: { marginTop: 8, marginBottom: 4 },
  premisesResultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8, marginBottom: 4, borderWidth: 1 },
  divider: { height: 1, marginVertical: 8, opacity: 0.5 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
});
