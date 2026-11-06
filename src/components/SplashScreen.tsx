import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';
import { useLanguage } from '../contexts/LanguageContext';
import { BRAND_TAGLINE } from '../constants/brand';

interface SplashScreenProps {
  onComplete: () => void;
  soundEnabled: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, soundEnabled }) => {
  const [isVisible, setIsVisible] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { t } = useLanguage();

  const playStartupSound = () => {
    if (!soundEnabled) return;

    const attemptPlay = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        if (ctx.state === 'suspended') {
          const resume = () => {
            ctx.resume().then(() => {
              play(ctx);
              window.removeEventListener('click', resume);
              window.removeEventListener('touchstart', resume);
            });
          };
          window.addEventListener('click', resume);
          window.addEventListener('touchstart', resume);
        } else {
          play(ctx);
        }
      } catch (e) {
        console.warn('Audio context failed to initialize:', e);
      }
    };

    const play = (ctx: AudioContext) => {
      const now = ctx.currentTime;

      // 1. Soft Ambient Tone (Pad)
      const ambient = ctx.createOscillator();
      const ambientGain = ctx.createGain();
      ambient.type = 'sine';
      ambient.frequency.setValueAtTime(220, now); // A3
      ambient.frequency.exponentialRampToValueAtTime(110, now + 2);
      
      ambientGain.gain.setValueAtTime(0, now);
      ambientGain.gain.linearRampToValueAtTime(0.1, now + 0.5);
      ambientGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      ambient.connect(ambientGain);
      ambientGain.connect(ctx.destination);

      // 2. Gentle Digital Chime
      const playChime = (freq: number, startTime: number, vol: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(vol, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 2);
      };

      playChime(659.25, now + 0.3, 0.05); // E5
      playChime(880.00, now + 0.5, 0.04); // A5
      playChime(1108.73, now + 0.7, 0.03); // C#6

      // 3. Melodic Shimmer
      const shimmer = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(1760, now + 0.8); // A6
      
      shimmerGain.gain.setValueAtTime(0, now + 0.8);
      shimmerGain.gain.linearRampToValueAtTime(0.02, now + 1.2);
      shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      shimmer.connect(shimmerGain);
      shimmerGain.connect(ctx.destination);

      ambient.start(now);
      shimmer.start(now + 0.8);

      ambient.stop(now + 2.5);
      shimmer.stop(now + 2.5);
    };

    attemptPlay();
  };

  useEffect(() => {
    // Start sound on mount (if allowed by browser/interaction)
    playStartupSound();

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Allow fade out animation to finish
    }, 2500);

    return () => {
      clearTimeout(timer);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-bg dark:bg-dark-bg overflow-hidden"
        >
          <div className="relative flex flex-col items-center gap-8 max-w-sm w-full px-6">
            {/* Animated Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                duration: 1.2, 
                ease: [0.22, 1, 0.36, 1],
                delay: 0.2
              }}
            >
              <Logo className="h-20 w-auto" />
            </motion.div>

            {/* Brand Name & Tagline */}
            <div className="flex flex-col items-center gap-3 text-center">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-4xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary tracking-tight"
              >
                {t('splash.greeting', 'Xperiens')}
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 1.4 }}
                className="text-sm font-serif italic text-brand-text-secondary dark:text-dark-text-secondary mt-2 max-w-[280px]"
              >
                {BRAND_TAGLINE}
              </motion.p>
            </div>

            {/* Subtle loading indicator */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.8, delay: 0.4, ease: 'easeInOut' }}
              className="absolute bottom-[-40px] left-0 h-[1px] bg-brand-accent/20"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
