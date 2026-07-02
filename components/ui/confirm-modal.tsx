import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Spacing, Fonts, Radius, Shadows, type PaletteType } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
  showCancel = true,
}: ConfirmModalProps) {
  const colors = useThemeColors();
  const s = createStyles(colors);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel || onConfirm}>
      <View style={s.overlay}>
        <View style={s.modalContainer}>
          <View style={s.iconContainer}>
            <MaterialIcons 
              name={isDestructive ? 'warning' : 'info'} 
              size={32} 
              color={isDestructive ? colors.danger : colors.loan} 
            />
          </View>
          
          <Text style={s.title}>{title}</Text>
          <Text style={s.message}>{message}</Text>
          
          <View style={s.actionRow}>
            {showCancel && (
              <>
                <Pressable style={[s.btn, s.cancelBtn]} onPress={onCancel}>
                  <Text style={s.cancelBtnTxt}>{cancelText}</Text>
                </Pressable>
                <View style={{ width: Spacing.md }} />
              </>
            )}
            <Pressable 
              style={[s.btn, isDestructive ? s.destructiveBtn : s.confirmBtn]} 
              onPress={onConfirm}
            >
              <Text style={s.confirmBtnTxt}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: PaletteType) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContainer: {
    backgroundColor: colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    width: '100%',
    alignItems: 'center',
    borderWidth: colors.borderWidth,
    borderColor: colors.border,
    ...Shadows.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: colors.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.heading,
    color: colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    fontFamily: Fonts.body,
    color: colors.textSecondary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: colors.bgInput,
    borderWidth: colors.borderWidth,
    borderColor: colors.border,
  },
  cancelBtnTxt: {
    fontSize: 14,
    fontFamily: Fonts.heading,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  confirmBtn: {
    backgroundColor: colors.loan,
  },
  destructiveBtn: {
    backgroundColor: colors.danger,
  },
  confirmBtnTxt: {
    fontSize: 14,
    fontFamily: Fonts.heading,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
