'use client'

import React, { forwardRef } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native'
import { useTheme } from '@/hooks/useTheme'

interface ButtonProps {
  children: React.ReactNode
  onPress?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  fullWidth?: boolean
  style?: any
}

export const Button = forwardRef<View, ButtonProps>(
  ({ children, onPress, variant = 'primary', size = 'md', disabled = false, fullWidth = false, style, ...props }, ref) => {
    const { colors } = useTheme()

    const baseStyles = [
      styles.base,
      styles[variant],
      sizes[size],
      fullWidth && styles.fullWidth,
      disabled && styles.disabled,
      style,
    ]

    return (
      <TouchableOpacity
        ref={ref}
        {...props}
        style={baseStyles}
        disabled={disabled}
        activeOpacity={disabled ? 1 : 0.8}
      >
        <Text style={textStyles[variant]}>{children}</Text>
      </TouchableOpacity>
    )
  }
)

Button.displayName = 'Button'

const sizes = {
  sm: { paddingVertical: 8, paddingHorizontal: 16 },
  md: { paddingVertical: 12, paddingHorizontal: 20 },
  lg: { paddingVertical: 16, paddingHorizontal: 28 },
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primary: {
    backgroundColor: '#0ea5e9',
  },
  secondary: {
    backgroundColor: '#64748b',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#0ea5e9',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: '#ef4444',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
})

const textStyles = StyleSheet.create({
  primary: { color: '#fff', fontWeight: '600' },
  secondary: { color: '#fff', fontWeight: '600' },
  outline: { color: '#0ea5e9', fontWeight: '600' },
  ghost: { color: '#0ea5e9', fontWeight: '600' },
  danger: { color: '#fff', fontWeight: '600' },
})

interface InputProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  label?: string
  error?: string
  multiline?: boolean
  numberOfLines?: number
  style?: any
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ value, onChangeText, placeholder, label, error, multiline = false, numberOfLines = 4, style, ...props }, ref) => {
    const { colors } = useTheme()

    return (
      <View style={[inputStyles.container, style]}>
        {label && <Text style={inputStyles.label}>{label}</Text>}
        <View style={inputStyles.inputWrapper}>
          <TextInput
            ref={ref}
            {...props}
            style={[
              inputStyles.input,
              multiline && inputStyles.textArea,
              { borderColor: error ? '#ef4444' : colors.border },
              { backgroundColor: colors.surface },
              { color: colors.text },
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            multiline={multiline}
            numberOfLines={numberOfLines}
            textAlignVertical={multiline ? 'top' : 'center'}
          />
        </View>
        {error && <Text style={inputStyles.errorText}>{error}</Text>}
      </View>
    )
  }
)

Input.displayName = 'Input'

const inputStyles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 14, fontWeight: '500' },
  inputWrapper: { borderRadius: 10, overflow: 'hidden' },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 48,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  errorText: { fontSize: 12, color: '#ef4444' },
})

interface CardProps {
  children: React.ReactNode
  style?: any
}

export const Card = forwardRef<View, CardProps>(
  ({ children, style, ...props }, ref) => {
    const { colors } = useTheme()
    return (
      <View
        ref={ref}
        style={[
          cardStyles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    )
  }
)

Card.displayName = 'Card'

const cardStyles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
})

interface DividerProps {
  style?: any
}

export const Divider = ({ style }: DividerProps) => {
  const { colors } = useTheme()
  return <View style={[dividerStyles.divider, { backgroundColor: colors.border }, style]} />
}

const dividerStyles = StyleSheet.create({
  divider: { height: 1, marginVertical: 8 },
})

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  style?: any
}

export const Badge = ({ children, variant = 'default', style }: BadgeProps) => {
  const { colors } = useTheme()
  const variantStyles = {
    default: { backgroundColor: colors.surfaceVariant, color: colors.textSecondary },
    primary: { backgroundColor: colors.primary, color: '#fff' },
    success: { backgroundColor: colors.success, color: '#fff' },
    warning: { backgroundColor: colors.warning, color: '#fff' },
    danger: { backgroundColor: colors.error, color: '#fff' },
  }
  return (
    <View style={[badgeStyles.base, variantStyles[variant], style]}>
      <Text style={badgeStyles.text}>{children}</Text>
    </View>
  )
}

const badgeStyles = StyleSheet.create({
  base: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
})

interface ModalProps {
  visible: boolean
  children: React.ReactNode
  onClose: () => void
  style?: any
}

export const Modal = ({ visible, children, onClose, style }: ModalProps) => {
  if (!visible) return null
  const { colors } = useTheme()
  return (
    <View style={modalStyles.overlay} onTouchStart={onClose}>
      <View style={[modalStyles.content, { backgroundColor: colors.surface }, style]} onTouchStart={(e) => e.stopPropagation()}>
        {children}
      </View>
    </View>
  )
}

const modalStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
  },
})