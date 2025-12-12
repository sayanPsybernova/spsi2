import { motion } from "framer-motion";

export default function Loader({ text = "Loading..." }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 dark:bg-slate-950/90 backdrop-blur-md"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-conic from-primary-500/20 via-accent-500/10 to-primary-500/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative flex flex-col items-center gap-8 p-12 rounded-3xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 shadow-2xl"
      >
        {/* Animated loader rings */}
        <div className="relative w-24 h-24">
          {/* Outer ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 border-r-primary-300"
          />

          {/* Middle ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border-4 border-transparent border-t-accent-500 border-l-accent-300"
          />

          {/* Inner ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 rounded-full border-4 border-transparent border-b-cyan-500 border-r-cyan-300"
          />

          {/* Center dot */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/50"
          />
        </div>

        {/* Loading dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -8, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
              }}
              className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
            />
          ))}
        </div>

        {/* Text */}
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-lg font-semibold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent"
        >
          {text}
        </motion.p>

        {/* Progress bar */}
        <div className="w-48 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1/2 h-full bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 rounded-full"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
