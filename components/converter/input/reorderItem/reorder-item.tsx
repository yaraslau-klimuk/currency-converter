import { ReactNode, RefObject } from "react"
import {
  AnimatePresence,
  DraggableProps,
  motion,
  Reorder,
  useDragControls,
} from "framer-motion"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

import { buttonVariants, itemVariants } from "./variants"

export interface ReorderItemProps<T> {
  value: T
  dragConstraints: DraggableProps["dragConstraints"]
  showControls: boolean
  children: ReactNode
}

const ReorderItem = <T,>({
  dragConstraints,
  value,
  showControls,
  children,
}: ReorderItemProps<T>) => {
  const controls = useDragControls()

  return (
    <Reorder.Item
      dragConstraints={dragConstraints}
      dragElastic={0.2}
      whileDrag={{ scale: 1.03 }}
      value={value}
      dragControls={controls}
      dragListener={false}
      variants={itemVariants}
      initial="initial"
      animate="visible"
      exit="hidden"
      className="relative mb-3 box-border flex w-full items-center rounded-lg bg-transparent last:!mb-0"
      role="listitem"
    >
      {children}
      <AnimatePresence initial={false}>
        {showControls && (
          <Button
            asChild
            size="icon"
            variant="ghost"
            className={
              "text-border hover:text-ring absolute right-1 z-0 size-6 h-full cursor-grab touch-none transition-colors hover:bg-transparent"
            }
            onPointerDown={(e) => {
              e.currentTarget.style.cursor = "grabbing"
              controls.start(e, { snapToCursor: true })
            }}
            onPointerUp={(e) => (e.currentTarget.style.cursor = "grab")}
          >
            <motion.button
              variants={buttonVariants}
              initial="initial"
              animate="visible"
              exit="hidden"
            >
              <Icons.drag />
            </motion.button>
          </Button>
        )}
      </AnimatePresence>
    </Reorder.Item>
  )
}

export default ReorderItem
