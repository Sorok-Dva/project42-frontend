import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { useEffect } from 'react'
import SplitType from 'split-type'
import { useLocation } from 'react-router-dom'

interface SplitTextAnimationsProps {
  trigger?: number
}

const SplitTextAnimations = ({ trigger }: SplitTextAnimationsProps) => {
  const location = useLocation()
  const pathname = location.pathname

  useEffect(() => {
    if (window.innerWidth >= 992) {
      gsap.registerPlugin(ScrollTrigger)

      // Détruire tous les ScrollTrigger existants pour éviter les doublons
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())

      // Appliquer SplitType sur tous les éléments ayant la classe .title-anim
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
        gsap.to(el, {
          scrollTrigger: {
            trigger: el,
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
  }, [pathname, trigger])
  return null
}

export default SplitTextAnimations
