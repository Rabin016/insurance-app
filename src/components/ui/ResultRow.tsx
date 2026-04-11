import React from "react";
import { StyleSheet, View } from "react-native";
import Typography from "./Typography";
import { useTheme } from "../../context/ThemeContext";

interface ResultRowProps {
  label: string;
  value: string;
  isBold?: boolean;
  color?: string;
  primary?: boolean;
}

export default function ResultRow({ label, value, isBold = false, color, primary = false }: ResultRowProps) {
  const { colors } = useTheme();
  
  return (
    <View style={styles.resultRow}>
      <Typography 
        variant="body" 
        color={color || (primary ? "#F97316" : colors.textSecondary)} 
        style={(isBold || primary) && { fontWeight: "700" }}
      >
        {label}
      </Typography>
      <Typography 
        variant="body" 
        color={color || colors.text} 
        style={{ fontWeight: "600", textAlign: "right" }}
      >
        {value}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  resultRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingVertical: 4 
  },
});
