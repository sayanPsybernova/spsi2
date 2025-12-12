import { motion } from "framer-motion";

export default function AnimatedBackground({ variant = "default" }) {
  if (variant === "mesh") {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Animated mesh gradient */}
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950" />

        {/* Floating orbs */}
        <motion.div
          animate={{
            x: [0, 100, 50, 0],
            y: [0, -50, 100, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-primary-400/30 to-accent-400/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 40, 0],
            y: [0, 80, -40, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/3 -right-40 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -60, 30, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-40 left-1/3 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-purple-500/20 rounded-full blur-3xl"
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>
    );
  }

  if (variant === "aurora") {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950" />

        {/* Aurora effect */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 opacity-30"
            style={{
              background: `linear-gradient(
                45deg,
                transparent 0%,
                rgba(99, 102, 241, 0.3) 25%,
                rgba(168, 85, 247, 0.2) 50%,
                rgba(236, 72, 153, 0.3) 75%,
                transparent 100%
              )`,
              backgroundSize: "400% 400%",
            }}
          />
        </div>

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              y: [null, Math.random() * -500],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "geometric") {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />

        {/* Animated geometric shapes */}
        <svg className="absolute inset-0 w-full h-full opacity-5 dark:opacity-10">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Floating geometric elements */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-20 w-40 h-40 border border-primary-300/20 dark:border-primary-700/20 rounded-lg"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-40 left-20 w-60 h-60 border border-accent-300/20 dark:border-accent-700/20 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-slate-300/10 dark:border-slate-700/10 rounded-3xl rotate-45"
        />
      </div>
    );
  }

  // Default variant - premium gradient
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />

      {/* Animated gradient blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-primary-200/40 to-primary-400/20 dark:from-primary-800/20 dark:to-primary-600/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 0.9, 1.1, 1],
          x: [0, -40, 20, 0],
          y: [0, 40, -20, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-accent-200/30 to-pink-400/20 dark:from-accent-800/15 dark:to-pink-600/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 0.9, 1],
          x: [0, 30, -30, 0],
          y: [0, -20, 40, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-1/4 left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-cyan-200/30 to-blue-400/20 dark:from-cyan-800/15 dark:to-blue-600/10 rounded-full blur-3xl"
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
