import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  transparent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightAction,
  rightIcon,
  onRightPress,
  transparent = false,
}) => {
  return (
    <View style={[styles.container, transparent && styles.transparent]}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        )}
        {title && (
          <View style={styles.titleWrap}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
          </View>
        )}
      </View>
      <View style={styles.right}>
        {rightAction ? (
          rightAction
        ) : rightIcon ? (
          <TouchableOpacity onPress={onRightPress} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name={rightIcon} size={22} color={COLORS.text} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  transparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
