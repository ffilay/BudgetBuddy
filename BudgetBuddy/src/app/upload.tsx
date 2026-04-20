import * as DocumentPicker from 'expo-document-picker';
import * as XLSX from 'xlsx';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { Brand } from '@/constants/theme';
import { useBudget } from '@/context/budget';

const VALID_CATS = ['Food', 'Fun', 'Transport', 'Housing', 'Education', 'Health', 'Shopping', 'Other'];

type PickState = 'idle' | 'loading' | 'done' | 'error';

export default function UploadScreen() {
  const { addExpense, totalBudget, setTotalBudget, clearExpenses } = useBudget();
  const [pickState, setPickState] = useState<PickState>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ amount: number; category: string; note: string }[]>([]);
  const [budgetStr, setBudgetStr] = useState(totalBudget.toFixed(0));

  const handlePickFile = async () => {
    try {
      setPickState('loading');
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/plain', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        setPickState('idle');
        return;
      }

      const asset = result.assets[0];
      setFileName(asset.name);
      setFileUri(asset.uri);

      const rows = await parseFile(asset.uri, asset.name);

      if (rows.length === 0) {
        setPickState('error');
        Alert.alert('No valid rows found', 'Make sure your CSV has columns: date, amount, category, note');
        return;
      }

      setPreview(rows.slice(0, 5));
      setPickState('done');
    } catch {
      setPickState('error');
      Alert.alert('Error reading file', 'Could not read the selected file.');
    }
  };

  const handleImport = async () => {
    if (!fileUri || !fileName) return;
    try {
      const rows = await parseFile(fileUri, fileName);
      rows.forEach((r) => addExpense(r.amount, r.category, r.note));
      Alert.alert('Import complete!', `${rows.length} expense${rows.length !== 1 ? 's' : ''} imported from ${fileName}.`);
      setPickState('idle');
      setFileName(null);
      setFileUri(null);
      setPreview([]);
    } catch {
      Alert.alert('Import failed', 'Something went wrong during import.');
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Clear all expenses?',
      'This will delete all logged expenses and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear', style: 'destructive', onPress: () => {
            clearExpenses();
            setPickState('idle');
            setFileName(null);
            setFileUri(null);
            setPreview([]);
          }
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <SafeAreaView>
        <View style={styles.header}>
          <Text style={styles.title}>Upload</Text>
          <Text style={styles.subtitle}>Import your bank statement, set your budget, or reset your account.</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Upload Card */}
        <TouchableOpacity
          style={[styles.uploadCard, pickState === 'done' && styles.uploadCardDone]}
          onPress={handlePickFile}
          activeOpacity={0.8}
          disabled={pickState === 'loading'}
        >
          {pickState === 'loading' ? (
            <ActivityIndicator color={Brand.sage} size="large" />
          ) : pickState === 'done' ? (
            <>
              <Text style={styles.uploadIconDone}>📄</Text>
              <Text style={styles.uploadFilename}>{fileName}</Text>
              <Text style={styles.uploadChangeText}>Tap to choose a different file</Text>
            </>
          ) : (
            <>
              <Text style={styles.uploadIcon}>⬆️</Text>
              <Text style={styles.uploadPrompt}>Upload Bank Statement</Text>
              <Text style={styles.uploadSub}>Tap to select a CSV file from your device</Text>
              <View style={styles.uploadFormats}>
                <Text style={styles.uploadFormatBadge}>CSV</Text>
                <Text style={styles.uploadFormatBadge}>XLSX</Text>
                <Text style={styles.uploadFormatBadge}>XLS</Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* Preview */}
        {pickState === 'done' && preview.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <Text style={styles.sectionDesc}>First {preview.length} rows from your file</Text>
            {preview.map((row, i) => (
              <View key={i} style={styles.previewRow}>
                <Text style={styles.previewCat}>{row.category}</Text>
                {!!row.note && <Text style={styles.previewNote}>{row.note}</Text>}
                <Text style={styles.previewAmount}>-${row.amount.toFixed(2)}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.importBtn} onPress={handleImport} activeOpacity={0.85}>
              <Text style={styles.importBtnText}>Import All Expenses</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* CSV Format Guide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CSV Format</Text>
          <Text style={styles.sectionDesc}>
            Your bank CSV should have these columns (in any order):
          </Text>
          <View style={styles.codeBox}>
            <Text style={styles.code}>date, amount, category, note</Text>
            <Text style={styles.codeDim}>2025-04-15, 12.50, Food, Lunch</Text>
            <Text style={styles.codeDim}>2025-04-16, 40.00, Transport, Gas</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Valid categories: Food, Fun, Transport, Housing, Education, Health, Shopping, Other
          </Text>
        </View>

        {/* Budget Setting */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Budget</Text>
          <Text style={styles.sectionDesc}>Set how much you plan to spend each month</Text>
          <View style={styles.inputRow}>
            <Text style={styles.dollar}>$</Text>
            <Text
              style={styles.budgetInput}
              onPress={() => {
                Alert.prompt(
                  'Set Monthly Budget',
                  'Enter your monthly budget amount',
                  (val) => {
                    const n = parseFloat(val);
                    if (n > 0) { setTotalBudget(n); setBudgetStr(n.toFixed(0)); }
                  },
                  'plain-text',
                  budgetStr,
                  'decimal-pad'
                );
              }}
            >
              {budgetStr}
            </Text>
            <Text style={styles.budgetTap}>tap to edit</Text>
          </View>
        </View>

        {/* Danger */}
        <View style={[styles.section, styles.dangerSection]}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <Text style={styles.sectionDesc}>Permanently delete all logged expenses</Text>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleClear} activeOpacity={0.85}>
            <Text style={styles.dangerBtnText}>Clear All Expenses</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

async function parseFile(uri: string, name: string): Promise<{ amount: number; category: string; note: string }[]> {
  const isXlsx = name.toLowerCase().endsWith('.xlsx') || name.toLowerCase().endsWith('.xls');

  if (isXlsx) {
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    return extractRows(rows);
  } else {
    const response = await fetch(uri);
    const text = await response.text();
    const rows = text.trim().split('\n').map((line) =>
      line.split(',').map((s) => s.trim().replace(/^"|"$/g, ''))
    );
    return extractRows(rows);
  }
}

function extractRows(rows: any[][]): { amount: number; category: string; note: string }[] {
  const results: { amount: number; category: string; note: string }[] = [];
  const header = rows[0]?.map((p: any) => String(p ?? '').trim().toLowerCase());
  const hasHeader = header?.some((cell) => cell === 'amount');
  const amountHeaderIdx = hasHeader ? header.findIndex((cell) => cell === 'amount') : -1;
  const rowsToParse = hasHeader ? rows.slice(1) : rows;

  for (const parts of rowsToParse) {
    const cells = parts.map((p: any) => String(p ?? '').trim());
    if (cells.length < 2) continue;

    let amount = 0;
    let amountIdx = -1;

    if (amountHeaderIdx >= 0) {
      const n = parseAmountCell(cells[amountHeaderIdx]);
      if (n !== null) {
        amount = n;
        amountIdx = amountHeaderIdx;
      }
    } else {
      for (let i = 0; i < cells.length; i++) {
        const n = parseAmountCell(cells[i]);
        if (n !== null) { amount = n; amountIdx = i; break; }
      }
    }

    if (amountIdx === -1) continue;

    const remaining = cells.filter((_, i) => i !== amountIdx);
    const catMatch = remaining.find((p) =>
      VALID_CATS.some((c) => c.toLowerCase() === p.toLowerCase())
    );
    const category = catMatch
      ? VALID_CATS.find((c) => c.toLowerCase() === catMatch.toLowerCase())!
      : 'Other';
    const note = remaining
      .filter((p) => p !== catMatch && !/^\d{4}[-/]\d{2}[-/]\d{2}/.test(p) && p.length > 0 && isNaN(Number(p)))
      .join(', ');

    results.push({ amount, category, note });
  }
  return results;
}

function parseAmountCell(value: string) {
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(value)) return null;

  const cleaned = value.replace(/[$,\s]/g, '');
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;

  const amount = Math.abs(Number(cleaned));
  return amount > 0 ? amount : null;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.background },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  title: { fontSize: 42, fontWeight: '600', color: Brand.primaryDark, lineHeight: 50 },
  subtitle: { fontSize: 13, color: Brand.sage, marginTop: 4 },
  content: { padding: 16, gap: 14, paddingBottom: 40 },

  uploadCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Brand.cardBorder,
    borderStyle: 'dashed',
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  uploadCardDone: {
    borderStyle: 'solid',
    borderColor: Brand.sage,
    backgroundColor: '#f0f5ee',
  },
  uploadIcon: { fontSize: 40 },
  uploadIconDone: { fontSize: 40 },
  uploadPrompt: { fontSize: 18, fontWeight: '600', color: Brand.primaryDark },
  uploadSub: { fontSize: 13, color: Brand.sage, textAlign: 'center' },
  uploadFormats: { flexDirection: 'row', gap: 8, marginTop: 4 },
  uploadFormatBadge: {
    backgroundColor: Brand.inputBg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '600',
    color: Brand.sage,
  },
  uploadFilename: { fontSize: 16, fontWeight: '600', color: Brand.primaryDark, textAlign: 'center' },
  uploadChangeText: { fontSize: 12, color: Brand.sage },

  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Brand.cardBorder,
    padding: 18,
    gap: 10,
  },
  dangerSection: { borderColor: '#fecaca' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Brand.primaryDark },
  sectionDesc: { fontSize: 13, color: Brand.sage, lineHeight: 19 },
  codeBox: {
    backgroundColor: Brand.inputBg,
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  code: { fontFamily: 'Courier', fontSize: 12, color: Brand.primaryDark, fontWeight: '600' },
  codeDim: { fontFamily: 'Courier', fontSize: 12, color: Brand.sage },

  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Brand.cardBorder,
    gap: 8,
  },
  previewCat: { fontSize: 13, fontWeight: '600', color: Brand.primaryDark, width: 80 },
  previewNote: { flex: 1, fontSize: 12, color: Brand.sage },
  previewAmount: { fontSize: 13, fontWeight: '700', color: Brand.warning },

  importBtn: {
    backgroundColor: Brand.sage,
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  importBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.inputBg,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 4,
  },
  dollar: { fontSize: 20, fontWeight: '700', color: Brand.sage },
  budgetInput: { flex: 1, fontSize: 24, fontWeight: '700', color: Brand.primaryDark },
  budgetTap: { fontSize: 11, color: Brand.sage },

  dangerBtn: {
    backgroundColor: '#fee2e2',
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dangerBtnText: { fontSize: 15, fontWeight: '700', color: '#ef4444' },
});
