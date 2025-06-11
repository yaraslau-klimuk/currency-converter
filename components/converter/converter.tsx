"use client"

import { useEffect, useRef, useState } from "react"
import supportedCurrencies from "@/helpers/currencies"
import { AnimatePresence, Reorder } from "framer-motion"
import Skeleton from "react-loading-skeleton"
import { useIsClient, useLocalStorage } from "usehooks-ts"

import { Currency, CurrencyCode, Rate } from "@/types/currency"
import { Settings } from "@/types/settings"
import { Button } from "@/components/ui/button"
import { InputContextMenu } from "@/components/converter/input"
import CurrencySelectModal from "@/components/currency-select-modal"
import { Icons } from "@/components/icons"
import SettingsModal from "@/components/settings-modal"

import Container from "./container"
import { Input } from "./input"

interface ConverterProps {
  rates: Rate
}

const defaultCurrencies: Currency[] = [
  {
    currencyCode: "USD",
    currencyName: "US Dollar",
    countryCode: "US",
  },
  {
    currencyCode: "EUR",
    currencyName: "Euro",
    countryCode: "EU",
  },
  {
    currencyCode: "GBP",
    currencyName: "British Pound",
    countryCode: "GB",
  },
]

const MAX_LENGTH = 10

export default function Converter({ rates }: ConverterProps) {
  const isClient = useIsClient()

  const [state, setState] = useState<Rate>({} as Rate)
  const [currencies, setCurrencies] = useLocalStorage<Currency[]>(
    "currencies",
    defaultCurrencies
  )
  const [settings] = useLocalStorage<Settings>("settings", {
    flagSet: "colorful",
  })
  const [draggedCurrency, setDraggedCurrency] = useState<CurrencyCode | null>(
    null
  )
  const [isCurrenciesListOpen, setIsCurrenciesListOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isEditModeEnabled, setIsEditModeEnabled] = useState(false)

  const listRef = useRef<HTMLDivElement>(null)
  const addButtonRef = useRef<HTMLButtonElement | null>(null)
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null)

  const availableCurrencies = supportedCurrencies.filter((currency) => {
    return !currencies.some(
      (item) => item.currencyCode === currency.currencyCode
    )
  })

  useEffect(() => {
    setState(rates)
  }, [rates])

  const convertCurrencies = (currencyCode: CurrencyCode, value: string) => {
    setState({ ...state, [currencyCode]: value ? value : "" })

    const filteredCurrencies = Object.keys(state).filter(
      (key) => key !== currencyCode
    )

    const convertedCurrencies = filteredCurrencies.reduce((acc, key) => {
      const convertedValue =
        (Number(value) / rates[currencyCode]) * rates[key as keyof Rate]

      const formattedValue = convertedValue.toFixed(2).toString()

      let trimmedValue =
        formattedValue.length > MAX_LENGTH
          ? formattedValue.slice(0, MAX_LENGTH)
          : formattedValue

      if (trimmedValue.endsWith(".")) {
        trimmedValue = trimmedValue.slice(0, -1)
      }

      return { ...acc, [key]: trimmedValue }
    }, {})

    setState((prev) => ({ ...prev, ...convertedCurrencies }))
  }

  const onSelectCurrency = (currency: Currency) => {
    setIsCurrenciesListOpen(false)
    setTimeout(() => setCurrencies((prev) => [...prev, currency]), 200)
    setTimeout(() => addButtonRef.current?.focus(), 100)
  }

  const onOpenCurrenciesList = () => setIsCurrenciesListOpen(true)
  const onOpenSettingsModal = () => setIsSettingsModalOpen(true)
  const onEnableEditMode = () => setIsEditModeEnabled(true)
  const onDisableEditMode = () => setIsEditModeEnabled(false)

  const onRemoveCurrency = (currency: Currency) => {
    if (currencies.length > 2) {
      setCurrencies((prev) =>
        prev.filter((item) => item.currencyCode !== currency.currencyCode)
      )
    }
  }

  const setIsDragged = (currencyCode: CurrencyCode, value: boolean) => {
    if (value) {
      if (currencies.length > 2) {
        setDraggedCurrency(currencyCode)
      }
    } else {
      setDraggedCurrency((prev) => (prev === currencyCode ? null : prev))
    }
  }

  const onCurrencySelectModalOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        addButtonRef.current?.focus()
      }, 100)
    }

    setIsCurrenciesListOpen(open)
  }

  const onSettingsModalOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        settingsButtonRef.current?.focus()
      }, 100)
    }

    setIsSettingsModalOpen(open)
  }

  return (
    <>
      <Container>
        <div className="flex items-center justify-between border-b p-3 sm:p-4">
          <div className="flex">
            <Button
              ref={settingsButtonRef}
              size="icon"
              variant="outline"
              className="size-8"
              aria-label="Settings"
              onClick={onOpenSettingsModal}
            >
              <Icons.settings size={20} />
            </Button>
          </div>
          {isEditModeEnabled ? (
            <Button
              variant="outline"
              className="h-8 px-2"
              aria-label="Done"
              onClick={onDisableEditMode}
            >
              <Icons.check size={18} className="mr-1" />
              Done
            </Button>
          ) : (
            <Button
              ref={addButtonRef}
              variant="outline"
              className="h-8 px-2"
              disabled={availableCurrencies.length === 0}
              aria-label="Add currency"
              onClick={onOpenCurrenciesList}
            >
              <Icons.plus size={18} className="mr-1" />
              Add
            </Button>
          )}
        </div>

        <div className="flex flex-col px-3 pb-10 pt-4 sm:mx-auto sm:w-[70%] sm:px-4">
          <h2 className="pb-5 text-3xl font-bold leading-tight tracking-tighter">
            Converter
          </h2>

          <div ref={listRef}>
            {!isClient ? (
              <Skeleton
                containerClassName="flex flex-col"
                className="mb-4"
                width={"100%"}
                height={66}
                count={4}
                inline
              />
            ) : (
              <Reorder.Group
                layoutScroll
                axis="y"
                values={currencies}
                className="relative flex flex-col"
                role="list"
                onReorder={setCurrencies}
              >
                <AnimatePresence initial={false} mode="sync">
                  {currencies.map((currency) => (
                    <InputContextMenu
                      key={currency.currencyCode}
                      disabled={isEditModeEnabled}
                      isDeleteDisabled={currencies.length <= 2}
                      onEditModeClick={onEnableEditMode}
                      onDeleteClick={() => onRemoveCurrency(currency)}
                    >
                      <Input
                        showControls={isEditModeEnabled}
                        flagSet={settings.flagSet}
                        currency={currency}
                        value={state[currency.currencyCode] || ""}
                        maxLength={MAX_LENGTH}
                        dragConstraints={listRef}
                        draggable={currencies.length > 2}
                        isDragged={currency.currencyCode === draggedCurrency}
                        setIsDragged={setIsDragged}
                        onChange={(event) =>
                          convertCurrencies(
                            currency.currencyCode,
                            event.target.value
                          )
                        }
                        onRemove={onRemoveCurrency}
                        onRemoveShortcut={onRemoveCurrency}
                      />
                    </InputContextMenu>
                  ))}
                </AnimatePresence>
              </Reorder.Group>
            )}
          </div>
        </div>
      </Container>

      <CurrencySelectModal
        isOpen={isCurrenciesListOpen}
        onOpenChange={onCurrencySelectModalOpenChange}
        currencies={availableCurrencies}
        setCurrency={onSelectCurrency}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onOpenChange={onSettingsModalOpenChange}
      />
    </>
  )
}
