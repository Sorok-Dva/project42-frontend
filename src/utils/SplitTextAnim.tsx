import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { useEffect } from 'react'
import SplitType from 'split-type'
import { useLocation } from 'react-router-dom'

const SplitTextAnimations = () => {
  const location = useLocation()
  const pathname = location.pathname

  useEffect(() => {
    if (window.innerWidth >= 992) {
      gsap.registerPlugin(ScrollTrigger)

      // Destroy all existing ScrollTrigger instances
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())

      new SplitType('.title-anim', {
        types: ['chars', 'words'],
      })

      const titleAnims = document.querySelectorAll('.title-anim')
      titleAnims.forEach((titleAnim) => {
        const charElements = titleAnim.querySelectorAll('.char')

        charElements.forEach((char, index) => {
          const tl2 = gsap.timeline({
            scrollTrigger: {
              trigger: char,
              start: 'top 90%',
              end: 'bottom 60%',
              scrub: false,
              markers: false,
              toggleActions: 'play none none none',
            },
          })

          const charDelay = index * 0.03

          tl2.from(char, {
            duration: 0.8,
            x: 70,
            delay: charDelay,
            autoAlpha: 0,
          })
        })
      })

      const titleElements = document.querySelectorAll('.title-anim')

      titleElements.forEach((el) => {
        const triggerEl = el as gsap.DOMTarget
        gsap.to(triggerEl, {
          scrollTrigger: {
            trigger: triggerEl,
            start: 'top 100%',
            markers: false,
            onEnter: () => {
              if (el instanceof Element) {
                el.classList.add('title-anim-active')
              }
            },
          },
        })
      })
    }
  }, [pathname])

  return null
}

export default SplitTextAnimations
