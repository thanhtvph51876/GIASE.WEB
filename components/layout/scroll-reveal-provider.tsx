"use client"

import { useEffect, type ReactNode } from "react"

const REVEAL_SELECTOR = ".reveal, .stagger-item"

function isInInitialViewport(element: Element) {
  const rect = element.getBoundingClientRect()
  return rect.top < window.innerHeight * 0.92 && rect.bottom > 0
}

export function ScrollRevealProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const elements = () => Array.from(document.querySelectorAll(REVEAL_SELECTOR))

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      elements().forEach((element) => element.classList.add("reveal-visible"))
      return
    }

    const observed = new WeakSet<Element>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add("reveal-visible")
          observer.unobserve(entry.target)
        })
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.12,
      },
    )

    const observeElements = () => {
      elements().forEach((element) => {
        if (observed.has(element)) return
        observed.add(element)

        if (isInInitialViewport(element)) {
          element.classList.add("reveal-visible")
          return
        }

        observer.observe(element)
      })
    }

    observeElements()
    document.documentElement.classList.add("reveal-ready")

    const mutationObserver = new MutationObserver(observeElements)
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      mutationObserver.disconnect()
      observer.disconnect()
      document.documentElement.classList.remove("reveal-ready")
    }
  }, [])

  return <>{children}</>
}
