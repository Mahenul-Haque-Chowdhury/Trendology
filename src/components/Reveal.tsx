"use client"
import { motion, Variants, AnimatePresence } from 'framer-motion'
import React from 'react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
}

export function Reveal({ as: Tag = 'div', delay = 0, children, className = '' }: { as?: any, delay?: number, children: React.ReactNode, className?: string }) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}

const grid: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } }
}
const item: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } }
}

export function StaggerGrid({ className = '', children }: { className?: string, children: React.ReactNode }) {
  const kids = React.Children.toArray(children)
  return (
    <motion.div
      className={className}
      variants={grid}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -80px' }}
      layout
    >
      <AnimatePresence>
        {kids.map((child: any) => (
          <motion.div
            key={child.key || undefined}
            variants={item}
            layout
            exit={{ opacity: 0, y: 8, scale: 0.97, transition: { duration: 0.25 } }}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

export default Reveal
