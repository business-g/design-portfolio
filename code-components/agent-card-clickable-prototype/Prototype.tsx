import React from "react";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type Variants,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import useMeasure from "react-use-measure";
import { Orb } from "./Orb";

type PopoverStep =
  | "menu"
  | "duration"
  | "reason"
  | "confirm"
  | "suspending"
  | "suspend-success"
  | "restoring"
  | "restore-success";

type SuspensionStep = "duration" | "reason" | "confirm";

type DurationOption = "30 minutes" | "2 hours" | "Until restored";
type ReasonOption = "Unusual activity" | "Maintenance" | "Credential issue" | "Other";

type AuditEvent = {
  action: "Access suspended";
  agent: "Workflow coordinator";
  duration: DurationOption;
  reason: string;
  performedBy: "James Wilson";
  time: "just now";
  affectedConnections: ["Slack", "Jira"];
};

const AGENT_ID = "agent_workflow_coordinator";
const DURATION_OPTIONS: DurationOption[] = ["30 minutes", "2 hours", "Until restored"];
const REASON_OPTIONS: ReasonOption[] = [
  "Unusual activity",
  "Maintenance",
  "Credential issue",
  "Other",
];

const REFERENCE_EASE = [0.23, 1, 0.32, 1] as const;
const FLOW_STEP_EASE = [0.22, 1, 0.36, 1] as const;
const FLOW_COUNT_EASE = [0.4, 0, 0.2, 1] as const;
const DURATION_SELECTION_LEAD_IN_MS = 80;
const POPOVER_HIDDEN_RESET_MS = 160;
const HOVER_GLIDE_SPRING = {
  stiffness: 520,
  damping: 32,
  mass: 0.5,
} as const;

const POPOVER_RESIZE_TRANSITION = {
  duration: 0.28,
  ease: REFERENCE_EASE,
} as const;

const FLOW_STEP_TRANSITION = {
  type: "tween",
  duration: 0.36,
  ease: FLOW_STEP_EASE,
} as const;

const FLOW_COUNT_TRANSITION = {
  type: "tween",
  duration: 0.35,
  ease: FLOW_COUNT_EASE,
} as const;

const FLOW_STEP_VARIANTS: Variants = {
  initial: (direction: 1 | -1) => ({
    opacity: 0,
    transform: `translate3d(${direction * 110}%, 0, 0)`,
  }),
  active: {
    opacity: 1,
    transform: "translate3d(0, 0, 0)",
    transition: FLOW_STEP_TRANSITION,
  },
  exit: (direction: 1 | -1) => ({
    opacity: 0,
    transform: `translate3d(${-direction * 110}%, 0, 0)`,
    transition: FLOW_STEP_TRANSITION,
  }),
};

const FLOW_STEP_REDUCED_VARIANTS: Variants = {
  initial: { opacity: 0 },
  active: {
    opacity: 1,
    transition: { duration: 0.14, ease: REFERENCE_EASE },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.1, ease: REFERENCE_EASE },
  },
};

const FLOW_COUNT_VARIANTS: Variants = {
  initial: (direction: 1 | -1) => ({
    opacity: 0,
    transform: `translate3d(0, ${direction * 4}px, 0)`,
  }),
  active: {
    opacity: 1,
    transform: "translate3d(0, 0, 0)",
    transition: {
      transform: FLOW_COUNT_TRANSITION,
      opacity: { duration: 0.18, ease: FLOW_COUNT_EASE },
    },
  },
  exit: (direction: 1 | -1) => ({
    opacity: 0,
    transform: `translate3d(0, ${-direction * 3}px, 0)`,
    transition: {
      transform: FLOW_COUNT_TRANSITION,
      opacity: { duration: 0.16, ease: FLOW_COUNT_EASE },
    },
  }),
};

const FADE_UP_VARIANTS: Variants = {
  initial: (direction: 1 | -1) => ({
    opacity: 0,
    transform: `translate3d(0, ${direction > 0 ? 6 : -4}px, 0)`,
  }),
  active: {
    opacity: 1,
    transform: "translate3d(0, 0, 0)",
    transition: POPOVER_RESIZE_TRANSITION,
  },
  exit: (direction: 1 | -1) => ({
    opacity: 0,
    transform: `translate3d(0, ${direction > 0 ? -4 : 4}px, 0)`,
    transition: { duration: 0.14, ease: REFERENCE_EASE },
  }),
};

const REDUCED_MOTION_FADE_VARIANTS: Variants = {
  initial: { opacity: 0 },
  active: {
    opacity: 1,
    transition: { duration: 0.14, ease: REFERENCE_EASE },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.1, ease: REFERENCE_EASE },
  },
};

const RESULT_SHELL_VARIANTS: Variants = {
  initial: { opacity: 1 },
  active: { opacity: 1 },
  exit: {
    opacity: 0,
    transition: { duration: 0.1, ease: REFERENCE_EASE },
  },
};

const RESULT_REVEAL_VARIANTS: Variants = {
  initial: {
    opacity: 0,
    transform: "translate3d(0, 5px, 0)",
  },
  active: {
    opacity: 1,
    transform: "translate3d(0, 0, 0)",
    transition: {
      duration: 0.28,
      ease: REFERENCE_EASE,
      delay: 0.035,
      delayChildren: 0.06,
    },
  },
};

const RESULT_REVEAL_REDUCED_VARIANTS: Variants = {
  initial: { opacity: 0 },
  active: {
    opacity: 1,
    transition: {
      duration: 0.16,
      ease: REFERENCE_EASE,
    },
  },
};

const RESULT_CHECK_VARIANTS: Variants = {
  initial: {
    opacity: 0,
    transform: "scale(0.8)",
  },
  active: {
    opacity: 1,
    transform: "scale(1)",
    transition: {
      type: "spring",
      duration: 0.34,
      bounce: 0.12,
    },
  },
};

function RestartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6.5 2.16a6 6 0 0 1 7.11 3.58.7.7 0 0 1-1.3.52 4.61 4.61 0 1 0 .29 2.34.7.7 0 1 1 1.39.18A6 6 0 1 1 6.5 2.16Z"
        fill="currentColor"
      />
      <path
        d="M12.64 2.67a.7.7 0 1 1 1.4 0V6a.7.7 0 0 1-.7.7H10a.7.7 0 1 1 0-1.4h2.64V2.67Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function FlowHeader() {
  return (
    <div className="flow-header">
      <span className="flow-header-icon" aria-hidden="true">
        <img src="/assets/agent-card-clickable-prototype/menu-access.svg" width="16" height="16" alt="" />
      </span>
      <span className="flow-title">Suspend access</span>
    </div>
  );
}

function FlowStepNavigation({
  current,
  total,
  onPrevious,
  direction,
  shouldReduceMotion,
}: {
  current: number;
  total: number;
  onPrevious: () => void;
  direction: 1 | -1;
  shouldReduceMotion: boolean | null;
}) {
  return (
    <div className="flow-step-nav" aria-label={`Step ${current} of ${total}`}>
      <button
        className="flow-step-arrow"
        type="button"
        onClick={onPrevious}
        aria-label="Previous step"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M8.5 3.5 5 7l3.5 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <span className="flow-step-track" aria-hidden="true">
        {Array.from({ length: total }, (_, index) => {
          const step = index + 1;
          const state = step === current ? "active" : step < current ? "complete" : "upcoming";

          return <span className="flow-step-segment" data-state={state} key={step} />;
        })}
      </span>
      <span
        className="flow-step-count"
        aria-live="polite"
        aria-label={`${current}/${total}`}
      >
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.span
            className="flow-step-count-value"
            key={current}
            custom={direction}
            variants={shouldReduceMotion ? FLOW_STEP_REDUCED_VARIANTS : FLOW_COUNT_VARIANTS}
            initial="initial"
            animate="active"
            exit="exit"
            aria-hidden="true"
          >
            {current}/{total}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}

function SuccessHeading({ children }: { children: string }) {
  return (
    <div className="success-heading">
      <motion.span
        className="success-check"
        variants={RESULT_CHECK_VARIANTS}
        aria-hidden="true"
      >
        ✓
      </motion.span>
      <h2>{children}</h2>
    </div>
  );
}

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [popoverStep, setPopoverStepState] = useState<PopoverStep>("menu");
  const [selectedDuration, setSelectedDuration] = useState<DurationOption | null>(null);
  const [selectedReason, setSelectedReason] = useState<ReasonOption | null>(null);
  const [otherReason, setOtherReason] = useState("");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isProtected, setIsProtected] = useState(true);
  const [footerState, setFooterState] = useState<"initial" | "suspended" | "restored">("initial");
  const [auditEvent, setAuditEvent] = useState<AuditEvent | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [announcement, setAnnouncement] = useState("Agent card ready");
  const [stepDirection, setStepDirection] = useState<1 | -1>(1);
  const shouldReduceMotion = useReducedMotion();
  const [measurePopoverContent, popoverContentBounds] = useMeasure();
  const menuHighlightTargetY = useMotionValue(0);
  const menuHighlightSpringY = useSpring(menuHighlightTargetY, HOVER_GLIDE_SPRING);
  const menuHighlightY = shouldReduceMotion ? menuHighlightTargetY : menuHighlightSpringY;
  const menuHighlightTransform = useMotionTemplate`translate3d(0, ${menuHighlightY}px, 0)`;
  const choiceHighlightTargetY = useMotionValue(0);
  const choiceHighlightSpringY = useSpring(choiceHighlightTargetY, HOVER_GLIDE_SPRING);
  const choiceHighlightY = shouldReduceMotion ? choiceHighlightTargetY : choiceHighlightSpringY;
  const choiceHighlightTransform = useMotionTemplate`translate3d(0, ${choiceHighlightY}px, 0)`;

  const menuRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const menuHighlightRef = useRef<HTMLSpanElement>(null);
  const choiceHighlightRef = useRef<HTMLSpanElement>(null);
  const choicePointerPositionRef = useRef<{ x: number; y: number } | null>(null);
  const choiceHoverLockPositionRef = useRef<{ x: number; y: number } | null>(null);
  const otherReasonRef = useRef<HTMLInputElement>(null);
  const keyboardNavigationRef = useRef(false);
  const popoverStepRef = useRef<PopoverStep>("menu");
  const resetTimeoutRef = useRef<number | null>(null);
  const actionTimeoutRef = useRef<number | null>(null);
  const durationAdvanceTimeoutRef = useRef<number | null>(null);

  const isBusy = popoverStep === "suspending" || popoverStep === "restoring";
  const isResultStep =
    popoverStep === "suspend-success" || popoverStep === "restore-success";
  const isSuspensionStep =
    popoverStep === "duration" || popoverStep === "reason" || popoverStep === "confirm";
  const popoverContentKey = isSuspensionStep ? "suspension-flow" : popoverStep;
  const resolvedReason = selectedReason === "Other" ? otherReason.trim() : selectedReason;
  const canContinueReason = Boolean(
    selectedReason && (selectedReason !== "Other" || otherReason.trim()),
  );
  const footerText =
    footerState === "suspended"
      ? "Suspended just now"
      : footerState === "restored"
        ? "Protection restored just now"
        : "Last action 12m ago";

  useEffect(() => {
    function handlePointerInput() {
      keyboardNavigationRef.current = false;
    }

    function handleKeyboardInput() {
      keyboardNavigationRef.current = true;
    }

    window.addEventListener("pointerdown", handlePointerInput, true);
    window.addEventListener("keydown", handleKeyboardInput, true);

    return () => {
      window.removeEventListener("pointerdown", handlePointerInput, true);
      window.removeEventListener("keydown", handleKeyboardInput, true);

      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
      }

      if (actionTimeoutRef.current !== null) {
        window.clearTimeout(actionTimeoutRef.current);
      }

      if (durationAdvanceTimeoutRef.current !== null) {
        window.clearTimeout(durationAdvanceTimeoutRef.current);
      }

    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen && durationAdvanceTimeoutRef.current !== null) {
      window.clearTimeout(durationAdvanceTimeoutRef.current);
      durationAdvanceTimeoutRef.current = null;
    }

    if (!isMenuOpen && menuHighlightRef.current) {
      menuHighlightRef.current.style.opacity = "0";
      menuHighlightRef.current.dataset.visible = "false";
    }
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      return;
    }

    const hiddenResetTimeout = window.setTimeout(() => {
      if (popoverStepRef.current === "menu") {
        return;
      }

      resetPendingScenario();
      setPopoverStepImmediately("menu");
    }, POPOVER_HIDDEN_RESET_MS);

    return () => window.clearTimeout(hiddenResetTimeout);
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function closeOnOutsidePress(event: PointerEvent) {
      const target = event.target as Node;

      if (
        !isBusy &&
        !menuRef.current?.contains(target) &&
        !menuTriggerRef.current?.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isBusy) {
        setIsMenuOpen(false);
        menuTriggerRef.current?.focus();
      }
    }

    window.addEventListener("pointerdown", closeOnOutsidePress);
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("pointerdown", closeOnOutsidePress);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isBusy, isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen || isBusy || !keyboardNavigationRef.current) {
      return;
    }

    const focusFrame = window.requestAnimationFrame(() => {
      const focusTargets = menuRef.current?.querySelectorAll<HTMLElement>("[data-step-focus]");
      focusTargets?.item(focusTargets.length - 1)?.focus();
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [isBusy, isMenuOpen, popoverStep]);

  function resetPendingScenario() {
    if (durationAdvanceTimeoutRef.current !== null) {
      window.clearTimeout(durationAdvanceTimeoutRef.current);
      durationAdvanceTimeoutRef.current = null;
    }

    setSelectedDuration(null);
    setSelectedReason(null);
    setOtherReason("");
  }

  function setPopoverStepImmediately(nextStep: PopoverStep) {
    popoverStepRef.current = nextStep;
    setPopoverStepState(nextStep);
  }

  function transitionToStep(nextStep: PopoverStep) {
    const currentStep = popoverStepRef.current;

    if (nextStep === currentStep) {
      return;
    }

    if (
      currentStep === "duration" &&
      nextStep !== "reason" &&
      durationAdvanceTimeoutRef.current !== null
    ) {
      window.clearTimeout(durationAdvanceTimeoutRef.current);
      durationAdvanceTimeoutRef.current = null;
    }

    const stepOrder: PopoverStep[] = [
      "menu",
      "duration",
      "reason",
      "confirm",
      "suspending",
      "suspend-success",
      "restoring",
      "restore-success",
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    const nextIndex = stepOrder.indexOf(nextStep);

    choiceHoverLockPositionRef.current = choicePointerPositionRef.current;
    hideChoiceHighlight();
    setStepDirection(nextIndex < currentIndex ? -1 : 1);

    popoverStepRef.current = nextStep;
    setPopoverStepState(nextStep);
  }

  function moveMenuHighlight(target: HTMLButtonElement, pointerType?: string) {
    if (pointerType === "touch") {
      return;
    }

    const highlight = menuHighlightRef.current;

    if (!highlight) {
      return;
    }

    const isVisible = highlight.dataset.visible === "true";
    const nextY = target.offsetTop;

    if (!isVisible) {
      menuHighlightTargetY.jump(nextY);
      menuHighlightSpringY.jump(nextY);
    } else {
      menuHighlightTargetY.set(nextY);
    }

    highlight.style.opacity = "1";
    highlight.dataset.visible = "true";
  }

  function hideMenuHighlight() {
    const highlight = menuHighlightRef.current;

    if (!highlight) {
      return;
    }

    highlight.style.opacity = "0";
    highlight.dataset.visible = "false";
  }

  function moveChoiceHighlight(target: HTMLElement, pointerType?: string) {
    if (pointerType === "touch") {
      return;
    }

    const highlight = choiceHighlightRef.current;

    if (!highlight) {
      return;
    }

    const isVisible = highlight.dataset.visible === "true";
    const nextY = target.offsetTop;

    if (!isVisible) {
      choiceHighlightTargetY.jump(nextY);
      choiceHighlightSpringY.jump(nextY);
    } else {
      choiceHighlightTargetY.set(nextY);
    }

    highlight.style.opacity = "1";
    highlight.dataset.visible = "true";
  }

  function hideChoiceHighlight() {
    const highlight = choiceHighlightRef.current;

    if (!highlight) {
      return;
    }

    highlight.style.opacity = "0";
    highlight.dataset.visible = "false";
  }

  function attachChoiceHighlight(node: HTMLSpanElement | null) {
    if (node) {
      choiceHighlightRef.current = node;
    }
  }

  function restoreChoiceHighlightAtPointer(step: SuspensionStep) {
    window.requestAnimationFrame(() => {
      if (popoverStepRef.current !== step) {
        return;
      }

      choiceHoverLockPositionRef.current = null;

      if (keyboardNavigationRef.current || (step !== "duration" && step !== "reason")) {
        return;
      }

      const pointerPosition = choicePointerPositionRef.current;
      const choiceList = choiceHighlightRef.current?.parentElement;

      if (!pointerPosition || !choiceList) {
        return;
      }

      const hoveredRow = document
        .elementFromPoint(pointerPosition.x, pointerPosition.y)
        ?.closest<HTMLElement>(".choice-row");

      if (!hoveredRow || !choiceList.contains(hoveredRow)) {
        hideChoiceHighlight();
        return;
      }

      moveChoiceHighlight(hoveredRow);
    });
  }

  function handleChoicePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") {
      return;
    }

    const nextPointerPosition = { x: event.clientX, y: event.clientY };
    const lockedPointerPosition = choiceHoverLockPositionRef.current;

    choicePointerPositionRef.current = nextPointerPosition;

    if (
      lockedPointerPosition &&
      Math.abs(nextPointerPosition.x - lockedPointerPosition.x) < 1 &&
      Math.abs(nextPointerPosition.y - lockedPointerPosition.y) < 1
    ) {
      return;
    }

    choiceHoverLockPositionRef.current = null;

    const target = (event.target as HTMLElement).closest<HTMLElement>(".choice-row");

    if (!target || !event.currentTarget.contains(target)) {
      return;
    }

    moveChoiceHighlight(target, event.pointerType);
  }

  function toggleMenu() {
    if (isMenuOpen) {
      if (!isBusy) {
        setIsMenuOpen(false);
      }
      return;
    }

    resetPendingScenario();
    setPopoverStepImmediately("menu");
    setIsMenuOpen(true);
  }

  function openDetails() {
    setIsDetailsOpen(true);
    setIsMenuOpen(false);
    setAnnouncement("Agent details opened");
  }

  function closeDetails() {
    setIsDetailsOpen(false);
    setAnnouncement("Agent details closed");
  }

  function manageConnections() {
    setIsMenuOpen(false);
    setAnnouncement("Manage connections selected");
  }

  async function copyAgentId() {
    setIsMenuOpen(false);

    try {
      await navigator.clipboard.writeText(AGENT_ID);
      setAnnouncement("Agent ID copied");
    } catch {
      setAnnouncement("Agent ID could not be copied");
    }
  }

  function openSuspensionFlow() {
    transitionToStep("duration");
  }

  function selectDuration(duration: DurationOption) {
    if (durationAdvanceTimeoutRef.current !== null) {
      window.clearTimeout(durationAdvanceTimeoutRef.current);
    }

    setSelectedDuration(duration);

    durationAdvanceTimeoutRef.current = window.setTimeout(
      () => {
        durationAdvanceTimeoutRef.current = null;
        transitionToStep("reason");
      },
      shouldReduceMotion ? 80 : DURATION_SELECTION_LEAD_IN_MS,
    );
  }

  function selectReason(reason: ReasonOption) {
    setSelectedReason(reason);

    if (reason === "Other") {
      window.requestAnimationFrame(() => otherReasonRef.current?.focus());
    }
  }

  function startSuspension() {
    if (!selectedDuration || !resolvedReason) {
      return;
    }

    if (actionTimeoutRef.current !== null) {
      window.clearTimeout(actionTimeoutRef.current);
    }

    transitionToStep("suspending");
    setAnnouncement("Suspending access");

    actionTimeoutRef.current = window.setTimeout(() => {
      setIsProtected(false);
      setFooterState("suspended");
      setAuditEvent({
        action: "Access suspended",
        agent: "Workflow coordinator",
        duration: selectedDuration,
        reason: resolvedReason,
        performedBy: "James Wilson",
        time: "just now",
        affectedConnections: ["Slack", "Jira"],
      });
      transitionToStep("suspend-success");
      setAnnouncement("Access suspended");
      actionTimeoutRef.current = null;
    }, 3000);
  }

  function startRestore() {
    if (actionTimeoutRef.current !== null) {
      window.clearTimeout(actionTimeoutRef.current);
    }

    transitionToStep("restoring");
    setAnnouncement("Restoring access");

    actionTimeoutRef.current = window.setTimeout(() => {
      setIsProtected(true);
      setFooterState("restored");
      transitionToStep("restore-success");
      setAnnouncement("Access restored");
      actionTimeoutRef.current = null;
    }, 3000);
  }

  function closeSuspensionResult() {
    setIsMenuOpen(false);
    setAnnouncement("Suspension summary closed");
  }

  function restartPrototype() {
    if (isResetting) {
      return;
    }

    if (actionTimeoutRef.current !== null) {
      window.clearTimeout(actionTimeoutRef.current);
      actionTimeoutRef.current = null;
    }

    setIsResetting(true);
    setIsMenuOpen(false);
    setPopoverStepImmediately("menu");
    resetPendingScenario();
    setIsDetailsOpen(false);
    setIsProtected(true);
    setFooterState("initial");
    setAuditEvent(null);
    setAnnouncement("Prototype reset");

    resetTimeoutRef.current = window.setTimeout(() => {
      setIsResetting(false);
      resetTimeoutRef.current = null;
    }, 420);
  }

  function renderSuspensionFlow(step: SuspensionStep) {
    const stepNumber = step === "duration" ? 1 : step === "reason" ? 2 : 3;
    const previousStep =
      step === "duration"
        ? () => transitionToStep("menu")
        : step === "reason"
          ? () => transitionToStep("duration")
          : () => transitionToStep("reason");
    let body: React.ReactNode;

    if (step === "duration") {
      body = (
        <>
          <p className="flow-question flow-prompt">How long should access be suspended?</p>
          <div
            className="choice-list"
            role="radiogroup"
            aria-label="Suspension duration"
            onPointerMove={handleChoicePointerMove}
            onPointerLeave={hideChoiceHighlight}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                hideChoiceHighlight();
              }
            }}
          >
            <motion.span
              ref={attachChoiceHighlight}
              className="choice-hover-highlight"
              data-visible="false"
              aria-hidden="true"
              style={{ transform: choiceHighlightTransform }}
            />
            {DURATION_OPTIONS.map((duration, index) => (
              <button
                className={`choice-row${selectedDuration === duration ? " is-selected" : ""}`}
                type="button"
                role="radio"
                aria-checked={selectedDuration === duration}
                onFocus={(event) => {
                  if (keyboardNavigationRef.current) {
                    moveChoiceHighlight(event.currentTarget);
                  }
                }}
                onClick={() => selectDuration(duration)}
                data-step-focus
                key={duration}
              >
                <span className="choice-key" aria-hidden="true">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="choice-label">{duration}</span>
              </button>
            ))}
          </div>
        </>
      );
    } else if (step === "reason") {
      body = (
        <>
          <p className="flow-question flow-prompt">Why are you suspending access?</p>
          <div
            className="choice-list"
            role="radiogroup"
            aria-label="Suspension reason"
            onPointerMove={handleChoicePointerMove}
            onPointerLeave={hideChoiceHighlight}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                hideChoiceHighlight();
              }
            }}
          >
            <motion.span
              ref={attachChoiceHighlight}
              className="choice-hover-highlight"
              data-visible="false"
              aria-hidden="true"
              style={{ transform: choiceHighlightTransform }}
            />
            {REASON_OPTIONS.map((reason, index) => {
              const isSelected = selectedReason === reason;
              const keyLabel = String.fromCharCode(65 + index);

              if (reason === "Other") {
                return (
                  <div
                    className={`choice-row choice-other${isSelected ? " is-selected" : ""}`}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onFocus={(event) => {
                      if (keyboardNavigationRef.current) {
                        moveChoiceHighlight(event.currentTarget);
                      }
                    }}
                    onClick={() => selectReason(reason)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectReason(reason);
                      }
                    }}
                    data-step-focus
                    key={reason}
                  >
                    <span className="choice-key" aria-hidden="true">{keyLabel}</span>
                    <input
                      ref={otherReasonRef}
                      className="other-reason-input"
                      type="text"
                      value={otherReason}
                      onFocus={() => setSelectedReason("Other")}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => setOtherReason(event.target.value)}
                      placeholder="Something else…"
                      tabIndex={isSelected ? 0 : -1}
                      aria-label="Describe the suspension reason"
                    />
                  </div>
                );
              }

              return (
                <button
                  className={`choice-row${isSelected ? " is-selected" : ""}`}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onFocus={(event) => {
                    if (keyboardNavigationRef.current) {
                      moveChoiceHighlight(event.currentTarget);
                    }
                  }}
                  onClick={() => selectReason(reason)}
                  data-step-focus
                  key={reason}
                >
                  <span className="choice-key" aria-hidden="true">{keyLabel}</span>
                  <span className="choice-label">{reason}</span>
                </button>
              );
            })}
          </div>
          <p className="flow-note flow-note-after-choices">This will be saved to History</p>
        </>
      );
    } else {
      if (!selectedDuration || !resolvedReason) {
        return null;
      }

      body = (
        <>
          <h2 className="flow-question">Suspend Workflow coordinator?</h2>
          <p className="flow-copy flow-confirm-copy">
            Future Slack and Jira tool calls from this agent will be blocked. Actions already in
            progress may still complete normally.
          </p>
          <dl className="flow-summary">
            <div>
              <dt>Duration</dt>
              <dd>{selectedDuration}</dd>
            </div>
            <div>
              <dt>Reason</dt>
              <dd>{resolvedReason}</dd>
            </div>
          </dl>
        </>
      );
    }

    return (
      <section className={`flow-panel${step === "confirm" ? " is-confirm-step" : ""}`}>
        <FlowHeader />
        <div className="flow-step-viewport" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false} custom={stepDirection}>
            <motion.div
              className="flow-step-body"
              key={step}
              custom={stepDirection}
              variants={
                shouldReduceMotion ? FLOW_STEP_REDUCED_VARIANTS : FLOW_STEP_VARIANTS
              }
              initial="initial"
              animate="active"
              exit="exit"
              onAnimationComplete={(definition) => {
                if (definition === "active") {
                  restoreChoiceHighlightAtPointer(step);
                }
              }}
            >
              {body}
            </motion.div>
          </AnimatePresence>
        </div>
        <motion.div
          className="flow-step-footer"
          layout={shouldReduceMotion ? false : "position"}
          transition={shouldReduceMotion ? { duration: 0 } : FLOW_STEP_TRANSITION}
        >
          <FlowStepNavigation
            current={stepNumber}
            total={3}
            onPrevious={previousStep}
            direction={stepDirection}
            shouldReduceMotion={shouldReduceMotion}
          />
          <AnimatePresence mode="popLayout" initial={false} custom={stepDirection}>
            {step === "reason" && (
              <motion.div
                className="flow-step-buttons"
                key="reason-action"
                custom={stepDirection}
                variants={
                  shouldReduceMotion ? FLOW_STEP_REDUCED_VARIANTS : FLOW_STEP_VARIANTS
                }
                initial="initial"
                animate="active"
                exit="exit"
                layout={shouldReduceMotion ? false : "position"}
              >
                <button
                  className="flow-button is-primary"
                  type="button"
                  disabled={!canContinueReason}
                  onClick={() => transitionToStep("confirm")}
                >
                  Continue
                </button>
              </motion.div>
            )}
            {step === "confirm" && (
              <motion.div
                className="flow-step-buttons"
                key="confirm-action"
                custom={stepDirection}
                variants={
                  shouldReduceMotion ? FLOW_STEP_REDUCED_VARIANTS : FLOW_STEP_VARIANTS
                }
                initial="initial"
                animate="active"
                exit="exit"
                layout={shouldReduceMotion ? false : "position"}
              >
                <button className="flow-button is-primary" type="button" onClick={startSuspension}>
                  Suspend access
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>
    );
  }

  function renderPopoverContent(step: PopoverStep) {
    switch (step) {
      case "menu":
        return (
          <div
            className="menu-panel"
            onPointerLeave={hideMenuHighlight}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                hideMenuHighlight();
              }
            }}
          >
            <motion.span
              ref={menuHighlightRef}
              className="menu-hover-highlight"
              data-visible="false"
              aria-hidden="true"
              style={{ transform: menuHighlightTransform }}
            />
            <button
              className="is-inert"
              type="button"
              role="menuitem"
              aria-disabled="true"
              tabIndex={-1}
              onPointerEnter={(event) => moveMenuHighlight(event.currentTarget, event.pointerType)}
            >
              <img
                className="menu-item-icon"
                src="/assets/agent-card-clickable-prototype/menu-details.svg"
                width="16"
                height="16"
                alt=""
                aria-hidden="true"
              />
              <span className="menu-item-label">View details</span>
              <img
                className="menu-item-arrow"
                src="/assets/agent-card-clickable-prototype/menu-item-arrow.svg"
                width="12"
                height="12"
                alt=""
                aria-hidden="true"
              />
            </button>
            <button
              className="is-inert"
              type="button"
              role="menuitem"
              aria-disabled="true"
              tabIndex={-1}
              onPointerEnter={(event) => moveMenuHighlight(event.currentTarget, event.pointerType)}
            >
              <img
                className="menu-item-icon"
                src="/assets/agent-card-clickable-prototype/menu-connections.svg"
                width="16"
                height="16"
                alt=""
                aria-hidden="true"
              />
              <span className="menu-item-label">Manage connections</span>
              <img
                className="menu-item-arrow"
                src="/assets/agent-card-clickable-prototype/menu-item-arrow.svg"
                width="12"
                height="12"
                alt=""
                aria-hidden="true"
              />
            </button>
            <button
              className="is-inert"
              type="button"
              role="menuitem"
              aria-disabled="true"
              tabIndex={-1}
              onPointerEnter={(event) => moveMenuHighlight(event.currentTarget, event.pointerType)}
            >
              <img
                className="menu-item-icon"
                src="/assets/agent-card-clickable-prototype/menu-copy.svg"
                width="16"
                height="16"
                alt=""
                aria-hidden="true"
              />
              <span className="menu-item-label">Copy agent ID</span>
            </button>
            <div className="menu-separator" role="separator" />
            <button
              className="menu-item-access"
              type="button"
              role="menuitem"
              tabIndex={isMenuOpen ? 0 : -1}
              onPointerEnter={(event) => moveMenuHighlight(event.currentTarget, event.pointerType)}
              onFocus={(event) => {
                if (keyboardNavigationRef.current) {
                  moveMenuHighlight(event.currentTarget);
                }
              }}
              onClick={isProtected ? openSuspensionFlow : startRestore}
              data-step-focus
            >
              <img
                className="menu-item-icon"
                src="/assets/agent-card-clickable-prototype/menu-access.svg"
                width="16"
                height="16"
                alt=""
                aria-hidden="true"
              />
              <span className="menu-item-label">
                {isProtected ? "Suspend access" : "Restore access"}
              </span>
              <img
                className="menu-item-arrow"
                src="/assets/agent-card-clickable-prototype/menu-item-arrow.svg"
                width="12"
                height="12"
                alt=""
                aria-hidden="true"
              />
            </button>
          </div>
        );

      case "duration":
      case "reason":
      case "confirm":
        return renderSuspensionFlow(step);

      case "suspending":
        return (
          <section className="loading-panel" role="status" aria-live="polite">
            <span className="flow-loader" data-theme="light" aria-hidden="true">
              <Orb variant="gate" size={20} label="Suspending access" />
            </span>
            <h2>
              <span className="loading-title is-shimmering">
                Suspending access
              </span>
            </h2>
          </section>
        );

      case "suspend-success":
        if (!selectedDuration || !resolvedReason) {
          return null;
        }

        return (
          <motion.section
            className="flow-panel result-panel"
            variants={
              shouldReduceMotion
                ? RESULT_REVEAL_REDUCED_VARIANTS
                : RESULT_REVEAL_VARIANTS
            }
            initial="initial"
            animate="active"
          >
            <div>
              <SuccessHeading>Access suspended</SuccessHeading>
            </div>
            <p className="flow-copy">
              Workflow coordinator can no longer start new Slack or Jira actions.
            </p>
            <dl className="flow-summary">
              <div>
                <dt>Duration</dt>
                <dd>{selectedDuration}</dd>
              </div>
              <div>
                <dt>Reason</dt>
                <dd>{resolvedReason}</dd>
              </div>
              <div>
                <dt>Suspended by</dt>
                <dd>James Wilson</dd>
              </div>
            </dl>
            <div className="result-actions is-end-aligned">
              <button
                className="flow-button is-secondary"
                type="button"
                onClick={closeSuspensionResult}
              >
                Close
              </button>
              <button
                className="flow-button is-primary"
                type="button"
                onClick={startRestore}
                data-step-focus
              >
                Restore access
              </button>
            </div>
          </motion.section>
        );

      case "restoring":
        return (
          <section className="loading-panel" role="status" aria-live="polite">
            <span className="flow-loader" data-theme="light" aria-hidden="true">
              <Orb variant="gate" size={20} label="Restoring access" tone="success" />
            </span>
            <h2>
              <span className="loading-title is-shimmering">
                Restoring access
              </span>
            </h2>
          </section>
        );

      case "restore-success":
        return (
          <motion.section
            className="flow-panel result-panel is-restore-result"
            variants={
              shouldReduceMotion
                ? RESULT_REVEAL_REDUCED_VARIANTS
                : RESULT_REVEAL_VARIANTS
            }
            initial="initial"
            animate="active"
          >
            <div>
              <SuccessHeading>Access restored</SuccessHeading>
            </div>
            <p className="flow-copy">
              Workflow coordinator can start new Slack and Jira actions again.
            </p>
          </motion.section>
        );
    }
  }

  return (
    <main
      className="prototype-canvas"
      data-audit-event={auditEvent ? JSON.stringify(auditEvent) : undefined}
    >
      <button
        className="restart-button"
        type="button"
        onClick={restartPrototype}
        disabled={isResetting}
        aria-busy={isResetting}
        aria-label="Restart prototype"
      >
        <span className="restart-leading" aria-hidden="true">
          <RestartIcon />
        </span>
        <span className="restart-spinner" aria-hidden="true">
          <LoadingSpinner />
        </span>
      </button>

      <section
        className={`agent-surface${isDetailsOpen ? " is-details-open" : ""}`}
        aria-label="Workflow coordinator agent card"
        data-node-id="6353:4572"
      >
        <article className="agent-card" data-node-id="6353:4573">
          <div className="agent-info" data-node-id="6353:4574">
            <div className="card-header" data-node-id="6353:4575">
              <div className="agent-identity" data-node-id="6353:4576">
                <img
                  className={`agent-avatar${isProtected ? "" : " is-suspended"}`}
                  src="/assets/agent-card-clickable-prototype/workflow-coordinator-avatar.png"
                  width="48"
                  height="48"
                  alt="Workflow coordinator avatar"
                  data-node-id="6353:4577"
                />
                <span className="name-status-space" aria-hidden="true" />
              </div>

              <div className="badge-and-state" data-node-id="6353:4584">
                <span
                  className={`status-badge${isProtected ? " is-protected" : " is-suspended"}`}
                  aria-label={`Status: ${isProtected ? "Protected" : "Suspended"}`}
                  data-node-id="6353:4586"
                >
                  {isProtected ? "Protected" : "Suspended"}
                </span>

                <button
                  ref={menuTriggerRef}
                  className="icon-action"
                  type="button"
                  aria-label="Open agent actions"
                  aria-haspopup="menu"
                  aria-expanded={isMenuOpen}
                  aria-controls="agent-actions-popover"
                  onClick={toggleMenu}
                  data-node-id="6353:4588"
                >
                  <img src="/assets/agent-card-clickable-prototype/more.svg" width="16" height="16" alt="" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="description" data-node-id="6353:4590">
              <h1 data-node-id="6353:4591">Workflow coordinator</h1>
              <p data-node-id="6353:4592">Coordinates recurring operational workflows</p>
            </div>
          </div>

          <div className="card-divider" data-node-id="6353:4593" />

          <div className="card-metadata" data-node-id="6353:4594">
            <div className="connected-systems" data-node-id="6353:4595">
              <div className="system-tag" data-node-id="6353:4596">
                <img src="/assets/agent-card-clickable-prototype/slack.svg" width="12" height="12" alt="" aria-hidden="true" />
                <span>Slack</span>
              </div>
              <div className="system-tag" data-node-id="6353:4603">
                <img src="/assets/agent-card-clickable-prototype/jira.svg" width="12" height="12" alt="" aria-hidden="true" />
                <span>Jira</span>
              </div>
            </div>

            <div className="footer-info" data-node-id="6353:4609">
              <img src="/assets/agent-card-clickable-prototype/clock.svg" width="16" height="16" alt="" aria-hidden="true" />
              <span>{footerText}</span>
            </div>
          </div>

          <div
            className={`details-reveal${isDetailsOpen ? " is-open" : ""}`}
            id="agent-details"
            aria-hidden={!isDetailsOpen}
            inert={!isDetailsOpen ? true : undefined}
          >
            <div className="details-reveal-clip">
              <div className="details-panel">
                <div className="details-heading">
                  <span>Agent details</span>
                  <button type="button" onClick={closeDetails}>Close</button>
                </div>
                <dl className="details-list">
                  <div className="detail-row">
                    <dt>Protection</dt>
                    <dd>{isProtected ? "Active" : "Suspended"}</dd>
                  </div>
                  <div className="detail-row">
                    <dt>Connected systems</dt>
                    <dd>Slack, Jira</dd>
                  </div>
                  <div className="detail-row">
                    <dt>Last action</dt>
                    <dd>{footerText}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </article>

        <MotionConfig reducedMotion="user" transition={POPOVER_RESIZE_TRANSITION}>
          <motion.div
            ref={menuRef}
            className={`actions-menu${popoverStep === "menu" ? " is-compact" : " is-flow"}`}
            id="agent-actions-popover"
            role={popoverStep === "menu" ? "menu" : "dialog"}
            aria-label={popoverStep === "menu" ? "Agent actions" : "Suspend access flow"}
            aria-hidden={!isMenuOpen}
            aria-busy={isBusy}
            data-open={isMenuOpen}
            data-step={popoverStep}
            initial={false}
            animate={{ width: popoverStep === "menu" ? 220 : 320 }}
            transition={
              shouldReduceMotion || !isMenuOpen
                ? { duration: 0 }
                : POPOVER_RESIZE_TRANSITION
            }
          >
            <motion.div
              className="popover-size-shell"
              initial={false}
              animate={{
                height: shouldReduceMotion
                  ? "auto"
                  : popoverContentBounds.height || "auto",
              }}
              transition={
                shouldReduceMotion || !isMenuOpen
                  ? { duration: 0 }
                  : FLOW_STEP_TRANSITION
              }
            >
              <div ref={measurePopoverContent} className="popover-measure">
                <AnimatePresence mode="popLayout" initial={false} custom={stepDirection}>
                  <motion.div
                    className={`popover-motion-step${
                      popoverStep === "menu" ? " is-menu-step" : " is-flow-step"
                    }`}
                    key={popoverContentKey}
                    custom={stepDirection}
                    variants={
                      shouldReduceMotion
                        ? REDUCED_MOTION_FADE_VARIANTS
                        : isResultStep
                          ? RESULT_SHELL_VARIANTS
                          : FADE_UP_VARIANTS
                    }
                    initial="initial"
                    animate="active"
                    exit="exit"
                    data-active-step="true"
                  >
                    {renderPopoverContent(popoverStep)}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </MotionConfig>
      </section>

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </main>
  );
}
