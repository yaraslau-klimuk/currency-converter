import {
  ChangeEventHandler,
  FC,
  FocusEventHandler,
  InputHTMLAttributes,
  KeyboardEventHandler,
  useRef,
} from "react"
import Bowser from "bowser"

import { Currency } from "@/types/currency"
import { cn } from "@/lib/utils"
import { Flag, FlagSetsType } from "@/components/ui/flag"
import { Input } from "@/components/ui/input"

interface CurrencyInputProps extends InputHTMLAttributes<HTMLInputElement> {
  currency: Currency
  flagSet: FlagSetsType
  containerClassName?: string
  onRemoveShortcut?: () => void
}

const CurrencyInput: FC<CurrencyInputProps> = ({
  currency,
  flagSet,
  containerClassName,
  value,
  onChange,
  onRemoveShortcut,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const osName = Bowser.getParser(window.navigator.userAgent).getOSName()
  const isMac = osName === "macOS"

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleFocus: FocusEventHandler<HTMLInputElement> = (event) => {
    const input = event.target

    setTimeout(() => {
      const length = input.value.length
      input.setSelectionRange(length, length)
    }, 0)
  }

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    let newValue = event.target.value
    newValue = newValue.replace(',', '.')

    if (newValue === "" || /^\d*\.?\d*$/.test(newValue)) {
      if (onChange) {
        event.target.value = newValue
        onChange(event)
      }
    }
  }

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (onRemoveShortcut) {
      if (
        (isMac && event.key === "Backspace" && event.metaKey) ||
        (!isMac && event.key === "Backspace" && event.ctrlKey)
      ) {
        event.preventDefault()
        onRemoveShortcut()
      }
    }
  }

  return (
    <div
      onClick={focusInput}
      className={cn(
        "bg-background focus-within:ring-ring ring-offset-background flex w-full cursor-pointer select-none items-center justify-between rounded-lg border p-4 transition-shadow focus-within:ring-2 focus-within:ring-offset-2",
        containerClassName
      )}
    >
      <div className="mr-1 flex shrink-0">
        <Flag flagSet={flagSet} countryCode={currency.countryCode} size={32} />
        <div className="ml-3 flex flex-col justify-center">
          <span className="text-nowrap pb-1 text-base leading-3">
            {currency.currencyName}
          </span>
          <span className="text-ring text-sm leading-3">
            {currency.currencyCode}
          </span>
        </div>
      </div>

      <Input
        ref={inputRef}
        value={value}
        className="size-auto min-w-3 max-w-[40%] shrink text-ellipsis rounded-none border-none p-0 text-right text-base tabular-nums focus-visible:ring-0 focus-visible:ring-offset-0"
        inputMode="decimal"
        placeholder="0"
        aria-label={`${currency.currencyCode} currency input`}
        onFocus={handleFocus}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...props}
      />
    </div>
  )
}

CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput, type CurrencyInputProps }
