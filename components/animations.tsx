"use client"

import { motion, type HTMLMotionProps } from "framer-motion"
import type { ReactNode } from "react"

interface FadeInProps extends Omit<HTMLMotionProps<"div">, "children"> {
    children: ReactNode
    delay?: number
    direction?: "up" | "down" | "left" | "right"
    className?: string
}

export function FadeIn({
    children,
    delay = 0,
    direction = "up",
    className,
    ...props
}: FadeInProps) {
    const directionOffset = {
        up: { y: 24 },
        down: { y: -24 },
        left: { x: 24 },
        right: { x: -24 },
    }

    return (
        <motion.div
            initial={{
                opacity: 0,
                ...directionOffset[direction],
            }}
            whileInView={{
                opacity: 1,
                x: 0,
                y: 0,
            }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
                duration: 0.5,
                delay,
                ease: [0.25, 0.1, 0.25, 1],
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

interface StaggerContainerProps extends Omit<HTMLMotionProps<"div">, "children"> {
    children: ReactNode
    className?: string
    delay?: number
}

export function StaggerContainer({
    children,
    className,
    delay = 0,
    ...props
}: StaggerContainerProps) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            transition={{ staggerChildren: 0.1, delayChildren: delay }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

interface StaggerItemProps extends Omit<HTMLMotionProps<"div">, "children"> {
    children: ReactNode
    className?: string
}

const staggerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
        },
    },
}

export function StaggerItem({ children, className, ...props }: StaggerItemProps) {
    return (
        <motion.div variants={staggerVariants} className={className} {...props}>
            {children}
        </motion.div>
    )
}
