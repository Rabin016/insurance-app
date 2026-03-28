/**
 * FireScreen — Main Fire Insurance Premium Calculator screen.
 *
 * Updated with logic from formula.md:
 * - TSI = Limit + Bank Tolerance %
 * - Sum Insured Mode (Amount vs Percentage)
 * - Editable Premium Rate
 * - Premium = Sum Insured * (Rate + RSD)%
 * - Final = Net Premium + 15% VAT
 */

import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  Switch,
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
import AppSelect from "../components/ui/AppSelect";
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
    riskClass: null,
    occupancyType: null,
    premiumRate: "",
    sumInsured: "",
    isPercentage: false, // Default to BDT Amount mode
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PremisesCard — Individual premises occupation block
// ─────────────────────────────────────────────────────────────────────────────
interface PremisesCardProps {
  entry: PremisesEntry;
  index: number;
  totalCount: number;
  tsi: number;
  onUpdate: (id: string, updates: Partial<PremisesEntry>) => void;
  onRemove: (id: string) => void;
}

function PremisesCard({
  entry,
  index,
  totalCount,
  tsi,
  onUpdate,
  onRemove,
}: PremisesCardProps) {
  const handleRiskClassChange = (value: string) => {
    const riskClass = value as PremisesEntry["riskClass"];
    const rate = getPremiumRate(riskClass, entry.occupancyType);
    onUpdate(entry.id, { riskClass, premiumRate: rate > 0 ? rate.toString() : "" });
  };

  const handleOccupancyChange = (value: string) => {
    const occupancyType = value as PremisesEntry["occupancyType"];
    const rate = getPremiumRate(entry.riskClass, occupancyType);
    onUpdate(entry.id, { occupancyType, premiumRate: rate > 0 ? rate.toString() : "" });
  };

  const toggleMode = () => {
    onUpdate(entry.id, { isPercentage: !entry.isPercentage });
  };

  return (
    <Animated.View entering={FadeInDown.duration(300).springify()}>
      <SectionCard
        title={`Premises ${index + 1}`}
        accent
        style={styles.premisesCard}
      >
        {/* Remove button */}
        {totalCount > 1 && (
          <Pressable
            style={styles.removeBtn}
            onPress={() => onRemove(entry.id)}
            accessibilityLabel={`Remove Premises ${index + 1}`}
          >
            <Ionicons name="close-circle" size={22} color="#EF4444" />
          </Pressable>
        )}

        {/* Risk Classification */}
        <AppSelect
          label="Risk Classification"
          options={RISK_CLASSES as unknown as { label: string; value: string }[]}
          value={entry.riskClass}
          onChange={handleRiskClassChange}
          placeholder="Select risk class"
        />

        {/* Occupancy Type */}
        <AppSelect
          label="Occupancy Type"
          options={OCCUPANCY_TYPES as unknown as { label: string; value: string }[]}
          value={entry.occupancyType}
          onChange={handleOccupancyChange}
          placeholder="Select occupancy type"
        />

        {/* Premium Rate — Editable */}
        <AppInput
          label="Premium Rate"
          value={entry.premiumRate}
          onChangeText={(v) => onUpdate(entry.id, { premiumRate: v })}
          suffix="%"
          placeholder="0.00"
          hint="Edit manually or select class/occupancy above"
        />

        {/* Sum Insured Mode Toggle */}
        <View style={styles.modeToggleRow}>
          <Typography variant="label">Sum Insured Mode:</Typography>
          <View style={styles.modeToggle}>
            <Pressable 
              onPress={toggleMode}
              style={[styles.modeBtn, !entry.isPercentage && styles.modeBtnActive]}
            >
              <Typography variant="caption" style={!entry.isPercentage ? styles.modeTextActive : styles.modeText}>
                Amount
              </Typography>
            </Pressable>
            <Pressable 
              onPress={toggleMode}
              style={[styles.modeBtn, entry.isPercentage && styles.modeBtnActive]}
            >
              <Typography variant="caption" style={entry.isPercentage ? styles.modeTextActive : styles.modeText}>
                Percentage
              </Typography>
            </Pressable>
          </View>
        </View>

        {/* Sum Insured */}
        <AppInput
          label={entry.isPercentage ? "Sum Insured (Percentage)" : "Sum Insured (Amount)"}
          value={entry.sumInsured}
          onChangeText={(text) => onUpdate(entry.id, { sumInsured: text })}
          prefix={entry.isPercentage ? undefined : "BDT"}
          suffix={entry.isPercentage ? "%" : undefined}
          placeholder={entry.isPercentage ? "100" : "0.00"}
          hint={
            entry.isPercentage 
              ? `Calculated based on TSI (BDT ${formatCurrency(tsi)})`
              : `Portion of TSI (BDT ${formatCurrency(tsi)})`
          }
        />
      </SectionCard>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ResultCard — Displays results based on formula.md
// ─────────────────────────────────────────────────────────────────────────────
function ResultCard({ result }: { result: PremiumResult }) {
  return (
    <Animated.View entering={SlideInDown.duration(400).springify()}>
      <SectionCard
        title="Calculation Result"
        subtitle="Verified against formula.md rules"
        style={styles.resultCard}
      >
        <View style={styles.resultIcon}>
          <Ionicons name="shield-checkmark" size={28} color="#F97316" />
        </View>

        <ResultRow label="Total Sum Insured (TSI)" value={`BDT ${formatCurrency(result.totalSumInsured)}`} />
        
        {/* Detailed breakdown per premises */}
        <View style={styles.breakdownHeader}>
          <Typography variant="caption" style={styles.breakdownLabel}>Breakdown per Premises</Typography>
        </View>
        
        {result.premisesResults.map((pr, idx) => (
          <View key={pr.id} style={styles.premisesResultRow}>
            <View style={styles.premisesResultInfo}>
              <Typography variant="caption" color="#9CA3AF">P{idx + 1} ({pr.rate}%)</Typography>
              <Typography variant="caption" color="#4B5563">SI: BDT {formatCurrency(pr.sumInsured)}</Typography>
            </View>
            <Typography variant="body" style={styles.premisesResultValue}>
              BDT {formatCurrency(pr.netPremium)}
            </Typography>
          </View>
        ))}

        <View style={styles.divider} />

        <ResultRow label="Total Net Premium" value={`BDT ${formatCurrency(result.totalNetPremium)}`} />
        <ResultRow label="VAT (15%)" value={`BDT ${formatCurrency(result.vatAmount)}`} />

        <View style={styles.divider} />

        <View style={styles.netPremiumRow}>
          <Typography variant="subheading" style={styles.netLabel}>
            Total Premium
          </Typography>
          <Animated.View entering={ZoomIn.duration(400).delay(200)}>
            <Typography variant="mono">
              BDT {formatCurrency(result.totalPremium)}
            </Typography>
          </Animated.View>
        </View>
      </SectionCard>
    </Animated.View>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.resultRow}>
      <Typography variant="body" style={styles.resultLabel}>{label}</Typography>
      <Typography variant="body" style={styles.resultValue}>{value}</Typography>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FireScreen — Main screen component
// ─────────────────────────────────────────────────────────────────────────────
export default function FireScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  // Form state
  const [limitAmount, setLimitAmount] = useState("");
  const [bankTolerance, setBankTolerance] = useState("10"); // Default 10%
  const [premises, setPremises] = useState<PremisesEntry[]>([newPremises()]);
  const [rsdEnabled, setRsdEnabled] = useState(false);
  const [result, setResult] = useState<PremiumResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Computed TSI
  const limitNum = parseFloat(limitAmount) || 0;
  const toleranceNum = parseFloat(bankTolerance) || 0;
  const tsi = calculateTSI(limitNum, toleranceNum);

  const handleUpdatePremises = useCallback(
    (id: string, updates: Partial<PremisesEntry>) => {
      setPremises((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    },
    []
  );

  const handleRemovePremises = useCallback((id: string) => {
    setPremises((prev) => prev.filter((p) => p.id !== id));
    setResult(null);
  }, []);

  const handleAddPremises = () => {
    setPremises((prev) => [...prev, newPremises()]);
    setResult(null);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleCalculate = () => {
    const limitVal = parseFloat(limitAmount) || 0;
    if (limitVal < 100000) {
      Alert.alert("Validation Error", "Limit Amount must be at least 1,00,000 BDT (1 Lac).");
      return;
    }

    const incomplete = premises.some(p => !p.premiumRate || !p.sumInsured);
    if (incomplete) {
      Alert.alert("Validation Error", "Please provide Premium Rate and Sum Insured for all premises.");
      return;
    }

    // Validation for Sum Insured totals
    let totalSumInsured = 0;
    premises.forEach(p => {
      const siVal = parseFloat(p.sumInsured) || 0;
      totalSumInsured += p.isPercentage ? (tsi * (siVal / 100)) : siVal;
    });

    // Check if it matches TSI (allow for tiny floating point rounding)
    const diff = Math.abs(totalSumInsured - tsi);
    if (diff > 1) {
      Alert.alert(
        "Validation Error", 
        `The total of all premises (BDT ${formatCurrency(totalSumInsured)}) must equal the Total Sum Insured (TSI = BDT ${formatCurrency(tsi)}).\n\nPlease adjust the percentages or amounts.`
      );
      return;
    }

    setIsCalculating(true);
    setTimeout(() => {
      const res = calculatePremium(premises, limitNum, toleranceNum, rsdEnabled);
      setResult(res);
      setIsCalculating(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
    }, 500);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.fireIconBadge}>
              <Ionicons name="flame" size={20} color="#F97316" />
            </View>
            <View>
              <Typography variant="caption" style={styles.headerSubtitle}>
                INSURP PREMIUM CALCULATOR
              </Typography>
              <Typography variant="heading" style={styles.headerTitle}>
                Fire Insurance
              </Typography>
            </View>
          </View>
        </View>
        <View style={styles.headerBorder} />
      </Animated.View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.duration(350).delay(100)}>
          <SectionCard title="Basic Information" accent>
            <AppInput
              label="Limit Amount"
              value={limitAmount}
              onChangeText={(v) => { setLimitAmount(v); setResult(null); }}
              prefix="BDT"
              placeholder="500,000"
              hint="Minimum 1,00,000 BDT"
            />
            <AppInput
              label="Bank Tolerance"
              value={bankTolerance}
              onChangeText={(v) => { setBankTolerance(v); setResult(null); }}
              suffix="%"
              placeholder="10"
              hint={limitNum > 0 ? `TSI = BDT ${formatCurrency(tsi)}` : "Percentage added to limit"}
            />
          </SectionCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(350).delay(180)}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionDot} />
              <Typography variant="subheading">Premises Occupations</Typography>
            </View>
          </View>
        </Animated.View>

        {premises.map((entry, index) => (
          <PremisesCard
            key={entry.id}
            entry={entry}
            index={index}
            totalCount={premises.length}
            tsi={tsi}
            onUpdate={handleUpdatePremises}
            onRemove={handleRemovePremises}
          />
        ))}

        <Animated.View entering={FadeInDown.duration(300).delay(250)}>
          <AppButton
            title="+ Add Another Premises"
            onPress={handleAddPremises}
            variant="secondary"
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(350).delay(300)}>
          <SectionCard style={styles.rsdCard}>
            <AppSlider
              value={rsdEnabled}
              onChange={(v) => { setRsdEnabled(v); setResult(null); }}
              label="RSD Coverage (0.13%)"
              description="Riots, Strikes & Damage protection"
            />
          </SectionCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(350).delay(380)}>
          <View style={styles.calculateBtnWrap}>
            <AppButton
              title="Calculate Premium"
              onPress={handleCalculate}
              variant="primary"
              loading={isCalculating}
              icon={<Ionicons name="calculator" size={18} color="#fff" />}
            />
          </View>
        </Animated.View>

        {result && <ResultCard result={result} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0D1117" },
  header: { paddingHorizontal: 20, paddingTop: 12, backgroundColor: "#0D1117" },
  headerContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 14 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  fireIconBadge: { width: 42, height: 42, borderRadius: 12, backgroundColor: "rgba(249,115,22,0.15)", borderWidth: 1, borderColor: "rgba(249,115,22,0.3)", alignItems: "center", justifyContent: "center" },
  headerSubtitle: { color: "#F97316", letterSpacing: 1.2, fontSize: 10, marginBottom: 2 },
  headerTitle: { fontSize: 22 },
  headerBorder: { height: 1, backgroundColor: "#1F2937", marginHorizontal: -20 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 4 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10, marginTop: 12 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#F97316" },
  premisesCard: { position: "relative" },
  removeBtn: { position: "absolute", top: 14, right: 14, zIndex: 10, padding: 2 },
  modeToggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 12, paddingVertical: 4, borderTopWidth: 1, borderTopColor: "#2D3748" },
  modeToggle: { flexDirection: "row", backgroundColor: "#111827", borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: "#2D3748" },
  modeBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  modeBtnActive: { backgroundColor: "#F97316" },
  modeText: { color: "#9CA3AF" },
  modeTextActive: { color: "#fff", fontFamily: "Inter_600SemiBold" },
  rsdCard: { marginTop: 4 },
  calculateBtnWrap: { marginTop: 8, marginBottom: 8 },
  resultCard: { borderColor: "rgba(249,115,22,0.3)", backgroundColor: "#1A1F2E" },
  resultIcon: { alignSelf: "center", marginBottom: 16, width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(249,115,22,0.12)", borderWidth: 1, borderColor: "rgba(249,115,22,0.3)", alignItems: "center", justifyContent: "center" },
  resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  resultLabel: { color: "#9CA3AF", flex: 1 },
  resultValue: { color: "#E5E7EB", fontFamily: "Inter_500Medium" },
  breakdownHeader: { marginTop: 12, marginBottom: 6 },
  breakdownLabel: { color: "#F97316", textTransform: "uppercase", letterSpacing: 1 },
  premisesResultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6, paddingHorizontal: 8, backgroundColor: "rgba(31,41,55,0.4)", borderRadius: 6, marginBottom: 4 },
  premisesResultInfo: { flex: 1 },
  premisesResultValue: { color: "#F9FAFB", fontFamily: "Inter_600SemiBold" },
  divider: { height: 1, backgroundColor: "#2D3748", marginVertical: 10 },
  netPremiumRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  netLabel: { color: "#F9FAFB" },
  disclaimer: { marginTop: 14, textAlign: "center", color: "#4B5563", lineHeight: 18 },
});
