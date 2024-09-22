import { useState } from "react"
import Image from "next/image"
import Skeleton from "react-loading-skeleton"

import "react-loading-skeleton/dist/skeleton.css"

import { cn } from "@/lib/utils"

export type FlagSetsType = "colorful" | "default"

export const flagSets: Record<FlagSetsType, string> = {
  colorful: "https://hatscripts.github.io/circle-flags/flags/",
  default: "https://flagicons.lipis.dev/flags/1x1/",
}

export interface FlagProps {
  countryCode: string
  flagSet?: FlagSetsType
  size?: number
  className?: string
  flagClassName?: string
}

export function Flag({
  countryCode,
  flagSet = "colorful",
  size = 22,
  className,
  flagClassName,
}: FlagProps) {
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  return (
    <div
      className={cn("flex", className)}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {!isLoaded && (
        <Skeleton
          circle
          width={`${size}px`}
          height={`${size}px`}
          containerClassName={cn("flex items-center")}
        />
      )}
      <Image
        src={flagSets[flagSet] + countryCode.toLowerCase() + ".svg"}
        alt={countryCode}
        width={size}
        height={size}
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
        className={cn(
          `rounded-full border ${isLoaded ? "opacity-100" : "opacity-0"}`,
          flagClassName
        )}
        onLoadingComplete={() => setIsLoaded(true)}
      />
    </div>
  )
}
