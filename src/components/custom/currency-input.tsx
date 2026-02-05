import type React from 'react'
import { useState, useEffect } from 'react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface CurrencyInputProps extends Omit<React.ComponentProps<'input'>, 'onChange'> {
  value?: number
  onChange?: (value: number) => void
  currency?: string
  locale?: string
}

export function CurrencyInput({
  value = 0,
  onChange,
  placeholder = 'R$ 0,00',
  currency = 'BRL',
  locale = 'pt-BR',
  className,
  disabled = false,
  required = false,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('')

  // Formatar número para moeda
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Converter string para número
  const parseCurrency = (value: string): number => {
    // Remove todos os caracteres que não são dígitos
    const numbers = value.replace(/\D/g, '')
    // Converte para centavos e depois para reais
    return numbers ? Number.parseInt(numbers) / 100 : 0
  }

  // Atualizar display quando value prop muda
  useEffect(() => {
    if (value !== undefined) {
      setDisplayValue(formatCurrency(value))
    }
  }, [value, currency, locale])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numericValue = parseCurrency(inputValue)

    // Formatar e atualizar display
    const formatted = formatCurrency(numericValue)
    setDisplayValue(formatted)

    // Chamar callback onChange
    if (onChange) {
      onChange(numericValue)
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Selecionar todo o texto ao focar
    e.target.select()
  }

  return (
    <Input
      id='currency-input'
      type='text'
      value={displayValue}
      onChange={handleInputChange}
      onFocus={handleFocus}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className={cn(className)}
    />
  )
}
