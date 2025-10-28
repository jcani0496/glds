// web/src/components/ThemeToggle.jsx
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../lib/theme.js";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      className={`relative inline-flex items-center w-16 h-9 p-1 rounded-full border backdrop-blur transition-colors
        ${isDark ? "justify-start border-white/10 bg-black/40" : "justify-end border-black/10 bg-white/70"}
        ${className}`}
      aria-label="Cambiar tema"
    >
      {/* knob */}
      <motion.div
        layout
        className="w-7 h-7 rounded-full bg-white dark:bg-zinc-800 shadow-md"
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
      />

      {/* íconos */}
      <motion.div
        initial={false}
        animate={{ opacity: isDark ? 1 : 0, scale: isDark ? 1 : 0.8 }}
        className="absolute left-2 text-yellow-300"
      >
        <Moon className="w-4 h-4" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ opacity: isDark ? 0 : 1, scale: isDark ? 0.8 : 1 }}
        className="absolute right-2 text-yellow-600"
      >
        <Sun className="w-4 h-4" />
      </motion.div>
    </button>
  );
}