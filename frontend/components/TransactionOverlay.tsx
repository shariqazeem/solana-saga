"use client";

import { useTransactionState } from "@/providers/TransactionStateProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, XCircle, Wallet } from "lucide-react";

/**
 * Overlay component that displays transaction status.
 *
 * Prevents white screen issue on mobile by:
 * 1. Showing a visible loading state during wallet deep link flow
 * 2. Maintaining UI presence while the app switches to/from wallet
 * 3. Providing visual feedback for transaction phases
 */
export function TransactionOverlay() {
  const { state, isProcessing, reset } = useTransactionState();

  const getPhaseContent = () => {
    switch (state.phase) {
      case "preparing":
        return {
          icon: <Loader2 className="w-8 h-8 animate-spin text-[#00F3FF]" />,
          title: "Preparing Transaction",
          subtitle: "Getting ready...",
        };
      case "awaiting_signature":
        return {
          icon: <Wallet className="w-8 h-8 text-[#00F3FF] animate-pulse" />,
          title: "Approve in Wallet",
          subtitle: "Please sign the transaction in your wallet",
        };
      case "signing":
        return {
          icon: <Loader2 className="w-8 h-8 animate-spin text-[#00F3FF]" />,
          title: "Signing Transaction",
          subtitle: "Waiting for signature...",
        };
      case "sending":
        return {
          icon: <Loader2 className="w-8 h-8 animate-spin text-[#00FF88]" />,
          title: "Sending Transaction",
          subtitle: "Broadcasting to network...",
        };
      case "confirming":
        return {
          icon: <Loader2 className="w-8 h-8 animate-spin text-[#00FF88]" />,
          title: "Confirming",
          subtitle: "Waiting for confirmation...",
        };
      case "success":
        return {
          icon: <CheckCircle className="w-8 h-8 text-[#00FF88]" />,
          title: "Success!",
          subtitle: state.signature
            ? `TX: ${state.signature.slice(0, 8)}...${state.signature.slice(-8)}`
            : "Transaction completed",
        };
      case "error":
        return {
          icon: <XCircle className="w-8 h-8 text-[#FF0044]" />,
          title: "Transaction Failed",
          subtitle: state.error || "Something went wrong",
        };
      default:
        return null;
    }
  };

  const content = getPhaseContent();
  const showOverlay = isProcessing || state.phase === "success" || state.phase === "error";

  return (
    <AnimatePresence>
      {showOverlay && content && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            // Allow dismissing error/success states
            if (state.phase === "error" || state.phase === "success") {
              e.stopPropagation();
              reset();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#0f1115] border border-white/10 rounded-2xl p-6 max-w-sm mx-4 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-white/5">
                {content.icon}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-white mb-2">
              {content.title}
            </h3>

            {/* Subtitle */}
            <p className="text-sm text-gray-400 mb-4">
              {content.subtitle}
            </p>

            {/* Progress indicator for active states */}
            {isProcessing && (
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#00F3FF] to-[#FF00FF]"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: 30,
                    ease: "linear",
                  }}
                />
              </div>
            )}

            {/* Dismiss button for error/success */}
            {(state.phase === "error" || state.phase === "success") && (
              <button
                onClick={reset}
                className="mt-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
              >
                {state.phase === "error" ? "Try Again" : "Done"}
              </button>
            )}

            {/* Mobile hint for awaiting signature */}
            {state.phase === "awaiting_signature" && (
              <p className="text-xs text-gray-500 mt-4">
                If your wallet app opened, please complete the transaction there.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
