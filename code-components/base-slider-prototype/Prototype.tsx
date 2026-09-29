import React from "react";

import {
  AnimatePresence,
  animate,
  motion,
  type MotionValue,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";

import {
  PointerEvent as ReactPointerEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { SlidingNumber } from "./sliding-number";

const HOURS_IN_DAY = 24;
const STEP = 0.25;
const MIN_DURATION = 1;
const INITIAL_START = 8;
const INITIAL_END = 11;

const dayOptions = [
  { label: "Every weekday", context: "Weekdays" },
  { label: "Every day", context: "Every day" },
  { label: "Weekends", context: "Weekends" },
] as const;
const FREQUENCY_PILL_WIDTHS = [117, 85, 84] as const;

type SaveLabelAnimation = {
  direction: 1 | -1;
  reducedMotion: boolean;
};

const SAVE_LABEL_VARIANTS = {
  enter: ({ direction, reducedMotion }: SaveLabelAnimation) => ({
    opacity: 0,
    y: reducedMotion ? 0 : direction * 4,
    filter: reducedMotion ? "blur(0px)" : "blur(2px)",
  }),
  center: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
  },
  exit: ({ direction, reducedMotion }: SaveLabelAnimation) => ({
    opacity: 0,
    y: reducedMotion ? 0 : direction * -4,
    filter: reducedMotion ? "blur(0px)" : "blur(2px)",
  }),
};

type Handle = "start" | "end" | "range";
type ParticleSide = Exclude<Handle, "range">;
type HandleMotionMode = "expand" | "contract";
type StreakPhysics = {
  active: boolean;
  side: ParticleSide;
  mode: HandleMotionMode;
  speed: number;
  pendingDistance: number;
  lastMotionAt: number;
};
type StreakParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  thickness: number;
  age: number;
  lifetime: number;
  alpha: number;
  direction: 1 | -1;
  phase: number;
  wobble: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function rubberClamp(value: number, min: number, max: number) {
  const soften = (distance: number) => (distance * 0.22) / (1 + distance * 0.22);
  if (value < min) return min - soften(min - value);
  if (value > max) return max + soften(value - max);
  return value;
}

function snap(value: number) {
  return Math.round(value / STEP) * STEP;
}

function formatTime(value: number) {
  const minutes = Math.round(clamp(value, 0, HOURS_IN_DAY) * 60);
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function getCellCoverage(hour: number, start: number, end: number) {
  const cellStart = hour;
  const cellEnd = hour + 1;
  return clamp(Math.min(cellEnd, end) - Math.max(cellStart, start), 0, 1);
}

function getCellPull(hour: number, start: number, end: number) {
  const coverage = getCellCoverage(hour, start, end);
  if (coverage === 0) return 0;
  if (start > hour && start < hour + 1) return coverage;
  if (end > hour && end < hour + 1) return -coverage;

  return 0;
}

function ReactiveHourCell({
  hour,
  startTime,
  endTime,
  reducedMotion,
  disabled,
  locked,
  onSelect,
}: {
  hour: number;
  startTime: MotionValue<number>;
  endTime: MotionValue<number>;
  reducedMotion: boolean;
  disabled: boolean;
  locked: boolean;
  onSelect: (hour: number) => void;
}) {
  const coverage = useTransform(
    [startTime, endTime],
    ([start, end]: number[]) => getCellCoverage(hour, start, end),
  );
  const pull = useTransform(
    [startTime, endTime],
    ([start, end]: number[]) => getCellPull(hour, start, end),
  );
  const absorption = useTransform(coverage, (value) => value * value);
  const x = useTransform(pull, (value) =>
    reducedMotion ? 0 : Math.sign(value) * value * value * 4.5,
  );
  const scaleX = useTransform(absorption, (value) =>
    reducedMotion ? 1 : 1 - value * 0.72,
  );
  const scaleY = useTransform(absorption, (value) =>
    reducedMotion ? 1 : 1 - value * 0.12,
  );
  const opacity = useTransform(absorption, (value) => 1 - value);
  const transformOrigin = useTransform(pull, (value) => {
    if (value < 0) return "left center";
    if (value > 0) return "right center";
    return "center";
  });

  return (
    <button
      className="hour-cell"
      type="button"
      disabled={disabled}
      data-locked={locked ? "true" : undefined}
      aria-label={`Move access window to include ${formatTime(hour)}`}
      onClick={() => onSelect(hour)}
    >
      <motion.span
        aria-hidden="true"
        className="hour-cell-shape"
        style={{ x, scaleX, scaleY, opacity, transformOrigin }}
      />
    </button>
  );
}

function DurationSlidingNumber({
  value,
  compact = false,
  reducedMotion = false,
}: {
  value: MotionValue<number>;
  compact?: boolean;
  reducedMotion?: boolean;
}) {
  const initialDisplayValue = value.get();
  const initialTotalMinutes = Math.round(initialDisplayValue * 60);
  const initialMinutes = initialTotalMinutes % 60;
  const [displayValue, setDisplayValue] = useState(initialDisplayValue);
  const [renderedMinutes, setRenderedMinutes] = useState(initialMinutes);
  const [showMinutes, setShowMinutes] = useState(initialMinutes > 0);
  const [minutesSettlingToZero, setMinutesSettlingToZero] = useState(false);
  const displayValueRef = useRef(initialDisplayValue);
  const minutesVisibleRef = useRef(initialMinutes > 0);
  const minutesSettlingRef = useRef(false);

  const finishMinuteRemoval = () => {
    if (!minutesSettlingRef.current) return;

    minutesSettlingRef.current = false;
    minutesVisibleRef.current = false;
    setShowMinutes(false);
    setMinutesSettlingToZero(false);
  };

  useEffect(() => {
    let frame = 0;
    const unsubscribe = value.on("change", (next) => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const rounded = Math.round(next * 4) / 4;
        if (displayValueRef.current === rounded) return;

        displayValueRef.current = rounded;
        setDisplayValue(rounded);

        if (compact) return;

        const nextTotalMinutes = Math.round(rounded * 60);
        const nextMinutes = nextTotalMinutes % 60;

        if (nextMinutes > 0) {
          minutesSettlingRef.current = false;
          minutesVisibleRef.current = true;
          setShowMinutes(true);
          setMinutesSettlingToZero(false);
          setRenderedMinutes(nextMinutes);
        } else if (minutesVisibleRef.current) {
          setRenderedMinutes(0);
          if (reducedMotion) {
            minutesSettlingRef.current = false;
            minutesVisibleRef.current = false;
            setShowMinutes(false);
            setMinutesSettlingToZero(false);
          } else {
            minutesSettlingRef.current = true;
            setMinutesSettlingToZero(true);
          }
        }
      });
    });
    return () => {
      unsubscribe();
      window.cancelAnimationFrame(frame);
    };
  }, [compact, reducedMotion, value]);

  const totalMinutes = Math.round(displayValue * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (compact) {
    const compactValue = hours > 0 ? hours : minutes;
    const compactUnit = hours > 0 ? "h" : "m";
    return (
      <span className="sliding-number">
        <span className="duration-part">
          <SlidingNumber value={compactValue} reducedMotion={reducedMotion} />
          <span>{compactUnit}</span>
        </span>
      </span>
    );
  }

  return (
    <motion.span
      className="sliding-number"
      layout={!reducedMotion}
      transition={{
        layout: reducedMotion
          ? { duration: 0 }
          : { type: "spring", duration: 0.24, bounce: 0 },
      }}
    >
      {hours > 0 && (
        <motion.span
          className="duration-part"
          layout={reducedMotion ? false : "position"}
          transition={{
            layout: reducedMotion
              ? { duration: 0 }
              : { type: "spring", duration: 0.24, bounce: 0 },
          }}
        >
          <SlidingNumber value={hours} reducedMotion={reducedMotion} />
          <span>h</span>
        </motion.span>
      )}
      <AnimatePresence initial={false} mode="popLayout">
        {showMinutes && (
          <motion.span
            key="minutes"
            className="duration-part"
            layout={reducedMotion ? false : "position"}
            initial={
              reducedMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    transform: "translateY(3px) scale(0.97)",
                    filter: "blur(2px)",
                  }
            }
            animate={{ opacity: 1, transform: "translateY(0) scale(1)", filter: "blur(0px)" }}
            exit={
              reducedMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    transform: "translateY(-3px) scale(0.97)",
                    filter: "blur(2px)",
                  }
            }
            transition={{
              duration: reducedMotion ? 0.1 : 0.14,
              ease: [0.19, 1, 0.22, 1],
              layout: reducedMotion
                ? { duration: 0 }
                : { type: "spring", duration: 0.24, bounce: 0 },
            }}
          >
            <SlidingNumber
              value={renderedMinutes}
              padStart={minutesSettlingToZero}
              reducedMotion={reducedMotion}
              onAnimationComplete={minutesSettlingToZero ? finishMinuteRemoval : undefined}
            />
            <span>m</span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.span>
  );
}

const LOCK_SHACKLE_OPEN =
  "M5.33594 7.33333V4.66667C5.33594 3.95942 5.61689 3.28115 6.11699 2.78105C6.61708 2.28095 7.29536 2 8.0026 2C8.70985 2 9.38813 2.28095 9.88822 2.78105C10.3883 3.28115 10.6693 3.95942 10.6693 4.66667V4.95";
const LOCK_SHACKLE_CLOSED =
  "M5.33594 7.33333V4.66667C5.33594 3.95942 5.61689 3.28115 6.11699 2.78105C6.61708 2.28095 7.29536 2 8.0026 2C8.70985 2 9.38813 2.28095 9.88822 2.78105C10.3883 3.28115 10.6693 3.95942 10.6693 4.66667V7.33333";
const LOCK_ICON_REVEAL_DELAY = 0.28;
const LOCK_SHACKLE_CLOSE_DELAY = 0.48;

function AnimatedLockIcon({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <motion.svg
      className="animated-lock-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      initial={false}
      animate={
        reducedMotion
          ? { transform: "translateY(0)" }
          : {
              transform: ["translateY(0)", "translateY(1px)", "translateY(0)"],
            }
      }
      transition={{
        duration: reducedMotion ? 0 : 0.18,
        delay: reducedMotion ? 0 : LOCK_SHACKLE_CLOSE_DELAY + 0.06,
        times: [0, 0.38, 1],
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <path
        d="M3.33594 8.66927C3.33594 8.31565 3.47641 7.97651 3.72646 7.72646C3.97651 7.47641 4.31565 7.33594 4.66927 7.33594H11.3359C11.6896 7.33594 12.0287 7.47641 12.2787 7.72646C12.5288 7.97651 12.6693 8.31565 12.6693 8.66927V12.6693C12.6693 13.0229 12.5288 13.362 12.2787 13.6121C12.0287 13.8621 11.6896 14.0026 11.3359 14.0026H4.66927C4.31565 14.0026 3.97651 13.8621 3.72646 13.6121C3.47641 13.362 3.33594 13.0229 3.33594 12.6693V8.66927Z"
        stroke="#A1A1AA"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.33594 10.6667C7.33594 10.8435 7.40618 11.013 7.5312 11.1381C7.65622 11.2631 7.82579 11.3333 8.0026 11.3333C8.17942 11.3333 8.34898 11.2631 8.47401 11.1381C8.59903 11.013 8.66927 10.8435 8.66927 10.6667C8.66927 10.4899 8.59903 10.3203 8.47401 10.1953C8.34898 10.0702 8.17942 10 8.0026 10C7.82579 10 7.65622 10.0702 7.5312 10.1953C7.40618 10.3203 7.33594 10.4899 7.33594 10.6667Z"
        stroke="#A1A1AA"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.g
        initial={
          reducedMotion
            ? false
            : {
                transform: "rotate(-16deg)",
              }
        }
        animate={{ transform: "rotate(0deg)" }}
        transition={{
          type: "spring",
          duration: reducedMotion ? 0 : 0.26,
          bounce: reducedMotion ? 0 : 0.16,
          delay: reducedMotion ? 0 : LOCK_SHACKLE_CLOSE_DELAY,
        }}
        style={{ transformBox: "fill-box", transformOrigin: "left bottom" }}
      >
        <motion.path
          initial={reducedMotion ? false : { d: LOCK_SHACKLE_OPEN }}
          animate={{ d: LOCK_SHACKLE_CLOSED }}
          transition={{
            duration: reducedMotion ? 0 : 0.18,
            delay: reducedMotion ? 0 : LOCK_SHACKLE_CLOSE_DELAY,
            ease: [0.19, 1, 0.22, 1],
          }}
          d={reducedMotion ? LOCK_SHACKLE_CLOSED : LOCK_SHACKLE_OPEN}
          stroke="#A1A1AA"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </motion.svg>
  );
}

function HandleStreakCanvas({
  side,
  physicsRef,
  wakeRef,
  reducedMotion,
}: {
  side: ParticleSide;
  physicsRef: RefObject<StreakPhysics>;
  wakeRef: RefObject<(() => void) | null>;
  reducedMotion: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let lastFrameAt = 0;
    const particles: StreakParticle[] = [];

    const resizeCanvas = () => {
      const nextWidth = canvas.clientWidth;
      const nextHeight = canvas.clientHeight;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = nextWidth;
      height = nextHeight;
      canvas.width = Math.max(1, Math.round(nextWidth * pixelRatio));
      canvas.height = Math.max(1, Math.round(nextHeight * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const spawnParticle = (speedProgress: number, mode: HandleMotionMode) => {
      if (particles.length >= 220) return;
      const direction = (side === "start" ? 1 : -1) as 1 | -1;
      const modeEnergy = mode === "expand" ? 0.92 : 1.08;
      const centeredSample = (Math.random() + Math.random()) * 0.5;
      const distributedY = Math.random() * 0.72 + centeredSample * 0.28;
      const centeredY = distributedY * Math.max(height - 4, 1) + 2;
      const lifetime =
        mode === "expand" ? 240 + Math.random() * 130 : 190 + Math.random() * 110;

      particles.push({
        x: side === "start" ? Math.random() * 1.5 : width - Math.random() * 1.5,
        y: centeredY,
        vx: direction * (30 + speedProgress * 165) * modeEnergy * (0.78 + Math.random() * 0.44),
        vy: (Math.random() - 0.5) * (5 + speedProgress * 8),
        length: (4 + speedProgress * 28) * (0.55 + Math.random() * 0.6),
        thickness: 0.42 + Math.random() * 0.42,
        age: 0,
        lifetime,
        alpha: 0.58 + Math.random() * 0.3,
        direction,
        phase: Math.random() * Math.PI * 2,
        wobble: 0.18 + Math.random() * (0.42 + speedProgress * 0.28),
      });
    };

    const drawParticle = (particle: StreakParticle) => {
      const progress = particle.age / particle.lifetime;
      const enter = Math.min(particle.age / 14, 1);
      const opacity = particle.alpha * enter * Math.pow(1 - progress, 1.18);
      const visibleLength = particle.length * (0.72 + progress * 0.28);
      const tailX = particle.x - particle.direction * visibleLength;
      const middleX = tailX + particle.direction * visibleLength * 0.58;
      const wave = Math.sin(progress * 8 + particle.phase) * particle.wobble;
      const gradient = context.createLinearGradient(tailX, particle.y, particle.x, particle.y);

      gradient.addColorStop(0, "rgba(160, 216, 255, 0)");
      gradient.addColorStop(0.48, `rgba(199, 232, 255, ${opacity * 0.58})`);
      gradient.addColorStop(1, `rgba(255, 255, 255, ${opacity})`);

      context.beginPath();
      context.moveTo(tailX, particle.y - wave * 0.28);
      context.lineTo(middleX, particle.y + wave);
      context.lineTo(particle.x, particle.y - wave * 0.22);
      context.strokeStyle = gradient;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.globalAlpha = 0.26;
      context.lineWidth = particle.thickness + 0.9;
      context.stroke();
      context.globalAlpha = 1;
      context.lineWidth = particle.thickness;
      context.stroke();
    };

    const render = (now: number) => {
      frame = 0;
      const delta = Math.min(lastFrameAt ? now - lastFrameAt : 16.67, 32);
      lastFrameAt = now;
      const physics = physicsRef.current;

      if (physics.side === side && now - physics.lastMotionAt > 34) {
        physics.speed *= Math.exp(-delta / 72);
      }

      if (physics.active && physics.side === side && physics.pendingDistance > 0) {
        const speedProgress = clamp(Math.sqrt(physics.speed / 650), 0, 1);
        const spacing = 2.15 - speedProgress * 1.15;
        let count = Math.floor(physics.pendingDistance / spacing);

        if (particles.length === 0 && physics.pendingDistance > 0.8) count = Math.max(count, 1);
        count = Math.min(count, 28);
        physics.pendingDistance = Math.max(0, physics.pendingDistance - count * spacing);
        for (let index = 0; index < count; index += 1) {
          spawnParticle(speedProgress, physics.mode);
        }
      }

      context.clearRect(0, 0, width, height);
      context.save();
      context.globalCompositeOperation = "lighter";

      let liveParticles = 0;
      for (const particle of particles) {
        particle.age += delta;
        if (particle.age >= particle.lifetime) continue;

        particle.x += (particle.vx * delta) / 1000;
        particle.y += (particle.vy * delta) / 1000;
        particle.vx *= Math.exp(-delta / 360);
        particle.vy *= Math.exp(-delta / 250);
        particles[liveParticles] = particle;
        liveParticles += 1;
        drawParticle(particle);
      }
      particles.length = liveParticles;
      context.restore();

      if ((physics.active && physics.side === side) || particles.length > 0) {
        frame = window.requestAnimationFrame(render);
      }
    };

    const wake = () => {
      if (reducedMotion || frame) return;
      lastFrameAt = performance.now();
      frame = window.requestAnimationFrame(render);
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
      wake();
    });
    resizeObserver.observe(canvas);
    wakeRef.current = wake;

    if (reducedMotion) context.clearRect(0, 0, width, height);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      if (wakeRef.current === wake) wakeRef.current = null;
    };
  }, [physicsRef, reducedMotion, side, wakeRef]);

  return (
    <canvas
      ref={canvasRef}
      className={`handle-streak-canvas handle-streak-canvas-${side}`}
      aria-hidden="true"
    />
  );
}

export default function Home() {
  const trackRef = useRef<HTMLDivElement>(null);
  const startHandleRef = useRef<HTMLButtonElement>(null);
  const endHandleRef = useRef<HTMLButtonElement>(null);
  const startStreakWakeRef = useRef<(() => void) | null>(null);
  const endStreakWakeRef = useRef<(() => void) | null>(null);
  const streakPhysicsRef = useRef<StreakPhysics>({
    active: false,
    side: "start",
    mode: "expand",
    speed: 0,
    pendingDistance: 0,
    lastMotionAt: 0,
  });
  const handleMotionModeRef = useRef<HandleMotionMode | null>(null);
  const dragRef = useRef<{
    type: Handle;
    pointerId: number;
    startValue: number;
    endValue: number;
    startX: number;
    lastX: number;
    lastTime: number;
    velocity: number;
    directionTravel: number;
    pointerVelocity: number;
  } | null>(null);
  const startTime = useMotionValue(INITIAL_START);
  const endTime = useMotionValue(INITIAL_END);
  const prefersReducedMotion = useReducedMotion();
  const [selectedDay, setSelectedDay] = useState<(typeof dayOptions)[number]>(dayOptions[0]);
  const [activeDrag, setActiveDrag] = useState<Handle | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockAnimationCycle, setLockAnimationCycle] = useState(0);

  const startLeft = useTransform(startTime, (value) => `${(value / HOURS_IN_DAY) * 100}%`);
  const endLeft = useTransform(endTime, (value) => `${(value / HOURS_IN_DAY) * 100}%`);
  const rangeWidth = useTransform(
    [startTime, endTime],
    ([start, end]: number[]) => `${((end - start) / HOURS_IN_DAY) * 100}%`,
  );
  const startLabel = useTransform(startTime, formatTime);
  const endLabel = useTransform(endTime, formatTime);
  const durationValue = useTransform(
    [startTime, endTime],
    ([start, end]: number[]) => Math.round((end - start) * 4) / 4,
  );
  const saveLabelAnimation: SaveLabelAnimation = {
    direction: isLocked ? 1 : -1,
    reducedMotion: Boolean(prefersReducedMotion),
  };
  useMotionValueEvent(startTime, "change", (value) => {
    startHandleRef.current?.setAttribute(
      "aria-valuenow",
      String(Math.round(clamp(value, 0, HOURS_IN_DAY) * 4) / 4),
    );
    startHandleRef.current?.setAttribute("aria-valuetext", formatTime(value));
  });

  useMotionValueEvent(endTime, "change", (value) => {
    endHandleRef.current?.setAttribute(
      "aria-valuenow",
      String(Math.round(clamp(value, 0, HOURS_IN_DAY) * 4) / 4),
    );
    endHandleRef.current?.setAttribute("aria-valuetext", formatTime(value));
  });

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      const track = trackRef.current;
      if (!drag || !track || event.pointerId !== drag.pointerId) return;

      const width = track.getBoundingClientRect().width;
      const deltaHours = ((event.clientX - drag.startX) / width) * HOURS_IN_DAY;
      const now = performance.now();
      const elapsed = Math.max(now - drag.lastTime, 1);
      const pointerDeltaX = event.clientX - drag.lastX;
      drag.velocity = ((pointerDeltaX / width) * HOURS_IN_DAY * 1000) / elapsed;
      const instantPointerVelocity = (pointerDeltaX * 1000) / elapsed;
      drag.pointerVelocity = drag.pointerVelocity * 0.58 + instantPointerVelocity * 0.42;
      drag.directionTravel += pointerDeltaX;

      if (drag.type !== "range") {
        const physics = streakPhysicsRef.current;
        physics.side = drag.type;
        physics.speed = Math.abs(drag.pointerVelocity);
        physics.pendingDistance += Math.abs(pointerDeltaX);
        physics.lastMotionAt = now;
      }

      if (drag.type !== "range" && Math.abs(drag.directionTravel) >= 2) {
        const nextMode =
          drag.type === "start"
            ? drag.directionTravel < 0
              ? "expand"
              : "contract"
            : drag.directionTravel > 0
              ? "expand"
              : "contract";

        if (handleMotionModeRef.current !== nextMode) {
          handleMotionModeRef.current = nextMode;
        }
        streakPhysicsRef.current.mode = nextMode;
        streakPhysicsRef.current.active = true;
        drag.directionTravel = 0;
      }

      if (drag.type === "start") startStreakWakeRef.current?.();
      if (drag.type === "end") endStreakWakeRef.current?.();

      drag.lastX = event.clientX;
      drag.lastTime = now;

      if (drag.type === "start") {
        startTime.set(rubberClamp(drag.startValue + deltaHours, 0, endTime.get() - MIN_DURATION));
      } else if (drag.type === "end") {
        endTime.set(
          rubberClamp(drag.endValue + deltaHours, startTime.get() + MIN_DURATION, HOURS_IN_DAY),
        );
      } else {
        const duration = drag.endValue - drag.startValue;
        const nextStart = rubberClamp(drag.startValue + deltaHours, 0, HOURS_IN_DAY - duration);
        startTime.set(nextStart);
        endTime.set(nextStart + duration);
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;

      const transition = prefersReducedMotion
        ? { duration: 0.12 }
        : { type: "spring" as const, stiffness: 620, damping: 42, mass: 0.7, velocity: drag.velocity };

      if (drag.type === "range") {
        const duration = drag.endValue - drag.startValue;
        const nextStart = clamp(snap(startTime.get()), 0, HOURS_IN_DAY - duration);
        animate(startTime, nextStart, transition);
        animate(endTime, nextStart + duration, transition);
      } else if (drag.type === "start") {
        animate(startTime, clamp(snap(startTime.get()), 0, endTime.get() - MIN_DURATION), transition);
      } else {
        animate(endTime, clamp(snap(endTime.get()), startTime.get() + MIN_DURATION, HOURS_IN_DAY), transition);
      }

      dragRef.current = null;
      streakPhysicsRef.current.active = false;
      if (drag.type === "start") startStreakWakeRef.current?.();
      if (drag.type === "end") endStreakWakeRef.current?.();
      handleMotionModeRef.current = null;
      setActiveDrag(null);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [endTime, prefersReducedMotion, startTime]);

  const beginDrag = (event: ReactPointerEvent<HTMLElement>, type: Handle) => {
    if (dragRef.current) return;
    const track = trackRef.current;
    if (!track) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    handleMotionModeRef.current = null;
    setActiveDrag(type);
    if (type !== "range") {
      streakPhysicsRef.current.active = false;
      streakPhysicsRef.current.side = type;
      streakPhysicsRef.current.speed = 0;
      streakPhysicsRef.current.pendingDistance = 0;
      streakPhysicsRef.current.lastMotionAt = performance.now();
    }
    dragRef.current = {
      type,
      pointerId: event.pointerId,
      startValue: startTime.get(),
      endValue: endTime.get(),
      startX: event.clientX,
      lastX: event.clientX,
      lastTime: performance.now(),
      velocity: 0,
      directionTravel: 0,
      pointerVelocity: 0,
    };
  };

  const nudge = (type: Exclude<Handle, "range">, direction: number) => {
    const amount = direction * STEP;
    if (type === "start") {
      startTime.set(clamp(snap(startTime.get() + amount), 0, endTime.get() - MIN_DURATION));
    } else {
      endTime.set(clamp(snap(endTime.get() + amount), startTime.get() + MIN_DURATION, HOURS_IN_DAY));
    }
  };

  const moveRangeToHour = (hour: number) => {
    if (dragRef.current) return;

    const start = startTime.get();
    const end = endTime.get();
    const duration = end - start;
    let nextStart = start;

    if (hour < start) {
      nextStart = hour;
    } else if (hour >= end) {
      nextStart = hour + 1 - duration;
    } else {
      return;
    }

    nextStart = clamp(snap(nextStart), 0, HOURS_IN_DAY - duration);
    const transition = prefersReducedMotion
      ? { duration: 0.12 }
      : { type: "spring" as const, duration: 0.34, bounce: 0 };

    animate(startTime, nextStart, transition);
    animate(endTime, nextStart + duration, transition);
  };

  const toggleScheduleLock = () => {
    if (isLocked) {
      setIsLocked(false);
      return;
    }

    setLockAnimationCycle((cycle) => cycle + 1);
    setIsLocked(true);
  };

  return (
    <main className="canvas">
      <section
        className="surface"
        data-editing={isLocked ? "false" : "true"}
        aria-label="Data export schedule prototype"
      >
        <div className="schedule-card">
          <header className="header">
            <div className="app-copy">
              <h1>Data export schedule</h1>
            </div>
          </header>

          <div className="timeline">
            <div className="timeline-primary-spacer" aria-hidden="true" />
            <div
              className="ribbon"
              ref={trackRef}
              data-dragging={activeDrag ? "true" : undefined}
              data-drag-mode={activeDrag ?? undefined}
              data-fixed={isLocked ? "true" : undefined}
            >
              <motion.div
                className="hour-grid"
                animate={{ opacity: 1 }}
                transition={{ duration: 0 }}
              >
                {Array.from({ length: 24 }, (_, hour) => (
                  <ReactiveHourCell
                    key={hour}
                    hour={hour}
                    startTime={startTime}
                    endTime={endTime}
                    reducedMotion={Boolean(prefersReducedMotion)}
                    disabled={isLocked}
                    locked={isLocked}
                    onSelect={moveRangeToHour}
                  />
                ))}
              </motion.div>

              <AnimatePresence initial={false}>
                {isLocked && (
                  <motion.div
                    key={`locked-zone-start-${lockAnimationCycle}`}
                    className="locked-zone locked-zone-start"
                    style={{ width: startLeft, transformOrigin: "left center" }}
                    initial={
                      prefersReducedMotion
                        ? { opacity: 0, transform: "scaleX(1)" }
                        : { opacity: 0, transform: "scaleX(0.98)" }
                    }
                    animate={{ opacity: 1, transform: "scaleX(1)" }}
                    exit={{
                      opacity: 0,
                      transform: prefersReducedMotion ? "scaleX(1)" : "scaleX(0.98)",
                      transition: {
                        duration: prefersReducedMotion ? 0.1 : 0.12,
                        ease: [0.19, 1, 0.22, 1],
                      },
                    }}
                    transition={{
                      duration: prefersReducedMotion ? 0.12 : 0.18,
                      delay: prefersReducedMotion ? 0 : 0.12,
                      ease: [0.19, 1, 0.22, 1],
                    }}
                  >
                    <motion.span
                      className="locked-zone-lock"
                      initial={
                        prefersReducedMotion
                          ? { opacity: 0, transform: "translateY(0)" }
                          : { opacity: 0, transform: "translateY(2px)" }
                      }
                      animate={{ opacity: 1, transform: "translateY(0)" }}
                      exit={{
                        opacity: 0,
                        transform: prefersReducedMotion ? "translateY(0)" : "translateY(1px)",
                        transition: { duration: prefersReducedMotion ? 0.1 : 0.08 },
                      }}
                      transition={{
                        opacity: {
                          duration: prefersReducedMotion ? 0.12 : 0.11,
                          delay: prefersReducedMotion ? 0 : LOCK_ICON_REVEAL_DELAY,
                          ease: [0.19, 1, 0.22, 1],
                        },
                        transform: prefersReducedMotion
                          ? { duration: 0 }
                          : {
                              type: "spring",
                              duration: 0.22,
                              bounce: 0,
                              delay: LOCK_ICON_REVEAL_DELAY,
                            },
                      }}
                    >
                      <AnimatedLockIcon
                        key={`start-lock-${lockAnimationCycle}`}
                        reducedMotion={Boolean(prefersReducedMotion)}
                      />
                    </motion.span>
                  </motion.div>
                )}
                {isLocked && (
                  <motion.div
                    key={`locked-zone-end-${lockAnimationCycle}`}
                    className="locked-zone locked-zone-end"
                    style={{ left: endLeft, transformOrigin: "right center" }}
                    initial={
                      prefersReducedMotion
                        ? { opacity: 0, transform: "scaleX(1)" }
                        : { opacity: 0, transform: "scaleX(0.98)" }
                    }
                    animate={{ opacity: 1, transform: "scaleX(1)" }}
                    exit={{
                      opacity: 0,
                      transform: prefersReducedMotion ? "scaleX(1)" : "scaleX(0.98)",
                      transition: {
                        duration: prefersReducedMotion ? 0.1 : 0.12,
                        ease: [0.19, 1, 0.22, 1],
                      },
                    }}
                    transition={{
                      duration: prefersReducedMotion ? 0.12 : 0.18,
                      delay: prefersReducedMotion ? 0 : 0.12,
                      ease: [0.19, 1, 0.22, 1],
                    }}
                  >
                    <motion.span
                      className="locked-zone-lock"
                      initial={
                        prefersReducedMotion
                          ? { opacity: 0, transform: "translateY(0)" }
                          : { opacity: 0, transform: "translateY(2px)" }
                      }
                      animate={{ opacity: 1, transform: "translateY(0)" }}
                      exit={{
                        opacity: 0,
                        transform: prefersReducedMotion ? "translateY(0)" : "translateY(1px)",
                        transition: { duration: prefersReducedMotion ? 0.1 : 0.08 },
                      }}
                      transition={{
                        opacity: {
                          duration: prefersReducedMotion ? 0.12 : 0.11,
                          delay: prefersReducedMotion ? 0 : LOCK_ICON_REVEAL_DELAY,
                          ease: [0.19, 1, 0.22, 1],
                        },
                        transform: prefersReducedMotion
                          ? { duration: 0 }
                          : {
                              type: "spring",
                              duration: 0.22,
                              bounce: 0,
                              delay: LOCK_ICON_REVEAL_DELAY,
                            },
                      }}
                    >
                      <AnimatedLockIcon
                        key={`end-lock-${lockAnimationCycle}`}
                        reducedMotion={Boolean(prefersReducedMotion)}
                      />
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                className="selection"
                style={{ left: startLeft, width: rangeWidth }}
                data-fixed={isLocked ? "true" : undefined}
                onPointerDown={isLocked ? undefined : (event) => beginDrag(event, "range")}
                animate={
                  isLocked && !prefersReducedMotion
                    ? { transform: ["scaleY(1)", "scaleY(0.94)", "scaleY(1)"] }
                    : { transform: "scaleY(1)" }
                }
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.24,
                  delay: prefersReducedMotion ? 0 : 0.05,
                  ease: [0.65, 0, 0.35, 1],
                }}
                role="group"
                aria-label={
                  isLocked
                    ? "Fixed access window"
                    : "Selected access window. Drag to move the whole range."
                }
              >
                <HandleStreakCanvas
                  side="start"
                  physicsRef={streakPhysicsRef}
                  wakeRef={startStreakWakeRef}
                  reducedMotion={Boolean(prefersReducedMotion)}
                />
                <HandleStreakCanvas
                  side="end"
                  physicsRef={streakPhysicsRef}
                  wakeRef={endStreakWakeRef}
                  reducedMotion={Boolean(prefersReducedMotion)}
                />
                <span className="selection-duration">
                  <span className="duration-full">
                    <DurationSlidingNumber
                      value={durationValue}
                      reducedMotion={Boolean(prefersReducedMotion)}
                    />
                  </span>
                  <span className="duration-compact">
                    <DurationSlidingNumber
                      value={durationValue}
                      compact
                      reducedMotion={Boolean(prefersReducedMotion)}
                    />
                  </span>
                </span>
              </motion.div>

              <AnimatePresence initial={false}>
                {!isLocked && (
                  <motion.button
                    key="start-handle"
                    ref={startHandleRef}
                    className="handle"
                    style={{ left: startLeft }}
                    initial={{ opacity: 0, transform: "translateX(6px) scale(0.9)" }}
                    animate={{ opacity: 1, transform: "scale(1)" }}
                    exit={{ opacity: 0, transform: "translateX(6px) scale(0.88)" }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.14, ease: [0.19, 1, 0.22, 1] }}
                    type="button"
                    role="slider"
                    aria-label="Access start time"
                    aria-valuemin={0}
                    aria-valuemax={24}
                    aria-valuenow={INITIAL_START}
                    aria-valuetext={formatTime(INITIAL_START)}
                    aria-orientation="horizontal"
                    data-active={activeDrag === "start" ? "true" : undefined}
                    onPointerDown={(event) => beginDrag(event, "start")}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowLeft" || event.key === "ArrowDown") nudge("start", -1);
                      if (event.key === "ArrowRight" || event.key === "ArrowUp") nudge("start", 1);
                    }}
                  >
                    <span />
                    <span />
                  </motion.button>
                )}
                {!isLocked && (
                  <motion.button
                    key="end-handle"
                    ref={endHandleRef}
                    className="handle"
                    style={{ left: endLeft }}
                    initial={{ opacity: 0, transform: "translateX(-6px) scale(0.9)" }}
                    animate={{ opacity: 1, transform: "scale(1)" }}
                    exit={{ opacity: 0, transform: "translateX(-6px) scale(0.88)" }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.14, ease: [0.19, 1, 0.22, 1] }}
                    type="button"
                    role="slider"
                    aria-label="Access end time"
                    aria-valuemin={0}
                    aria-valuemax={24}
                    aria-valuenow={INITIAL_END}
                    aria-valuetext={formatTime(INITIAL_END)}
                    aria-orientation="horizontal"
                    data-active={activeDrag === "end" ? "true" : undefined}
                    onPointerDown={(event) => beginDrag(event, "end")}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowLeft" || event.key === "ArrowDown") nudge("end", -1);
                      if (event.key === "ArrowRight" || event.key === "ArrowUp") nudge("end", 1);
                    }}
                  >
                    <span />
                    <span />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className="ruler-labels" aria-hidden="true">
              {[0, 6, 12, 18, 24].map((hour, index) => (
                <span
                  data-edge={index === 0 ? "start" : index === 4 ? "end" : undefined}
                  style={{ left: `${(hour / HOURS_IN_DAY) * 100}%` }}
                  key={hour}
                >
                  {formatTime(hour)}
                </span>
              ))}
            </div>

            <div
              className="schedule-frequency-reveal"
              data-open={isLocked ? "false" : "true"}
              aria-hidden={isLocked}
            >
                <motion.div
                  className="schedule-frequency"
                  initial={false}
                  animate={
                    isLocked
                      ? { opacity: 0, transform: "translateY(-3px) scale(0.98)" }
                      : { opacity: 1, transform: "translateY(0) scale(1)" }
                  }
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.14,
                    ease: [0.19, 1, 0.22, 1],
                  }}
                >
                  <span className="schedule-frequency-label">Schedule frequency</span>
                  <div className="frequency-options" role="group" aria-label="Schedule frequency">
                    {dayOptions.map((option, index) => {
                        const selected = option.label === selectedDay.label;

                        return (
                          <motion.button
                            className={selected ? "frequency-option selected" : "frequency-option"}
                            type="button"
                            aria-pressed={selected}
                            disabled={isLocked}
                            tabIndex={isLocked ? -1 : 0}
                            key={option.label}
                            style={{ width: FREQUENCY_PILL_WIDTHS[index] }}
                            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                            transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
                            onClick={() => setSelectedDay(option)}
                          >
                            <motion.span
                              className="frequency-option-active"
                              aria-hidden="true"
                              initial={false}
                              animate={{
                                opacity: selected ? 1 : 0,
                                transform:
                                  selected || prefersReducedMotion
                                    ? "scaleX(1) scaleY(1)"
                                    : "scaleX(0.86) scaleY(0.92)",
                              }}
                              transition={{
                                duration: prefersReducedMotion ? 0.12 : selected ? 0.18 : 0.11,
                                ease: selected ? [0.19, 1, 0.22, 1] : [0.4, 0, 1, 1],
                              }}
                            />
                            <span className="frequency-option-label">{option.label}</span>
                          </motion.button>
                        );
                    })}
                  </div>
                </motion.div>
            </div>
          </div>

          <footer className="footer">
            <div className="context">
              <img src="/assets/base-slider-prototype/clock-share.svg" alt="" width="16" height="16" />
              <span>
                {selectedDay.context} · Amsterdam (UTC+2) · <motion.span>{startLabel}</motion.span>–
                <motion.span>{endLabel}</motion.span>
              </span>
            </div>
            <div className="actions">
              <motion.button
                className="save"
                type="button"
                layout={!prefersReducedMotion}
                style={{ borderRadius: 999 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                transition={{
                  layout: prefersReducedMotion
                    ? { duration: 0 }
                    : { type: "spring", duration: 0.26, bounce: 0 },
                  scale: { duration: 0.1, ease: [0.16, 1, 0.3, 1] },
                }}
                onClick={toggleScheduleLock}
              >
                <AnimatePresence
                  mode="popLayout"
                  initial={false}
                  custom={saveLabelAnimation}
                >
                  <motion.span
                    className="save-label"
                    key={isLocked ? "edit" : "save"}
                    custom={saveLabelAnimation}
                    variants={SAVE_LABEL_VARIANTS}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      duration: prefersReducedMotion ? 0.1 : 0.15,
                      ease: [0.19, 1, 0.22, 1],
                    }}
                  >
                    {isLocked ? "Edit schedule" : "Save schedule"}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}
