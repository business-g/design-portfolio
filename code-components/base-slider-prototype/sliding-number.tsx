import React from "react";

import { useEffect, useRef } from "react";
import {
  motion,
  motionValue,
  type MotionValue,
  useSpring,
  useTransform,
} from "motion/react";

const TRANSITION = {
  type: "spring" as const,
  stiffness: 320,
  damping: 28,
  mass: 0.45,
};

function normalizeDigit(value: number) {
  return ((value % 10) + 10) % 10;
}

function Digit({
  value,
  place,
  reducedMotion,
  onAnimationComplete,
}: {
  value: number;
  place: number;
  reducedMotion: boolean;
  onAnimationComplete?: () => void;
}) {
  const valueAtPlace = Math.floor(value / place);
  const initial = motionValue(valueAtPlace);
  const animatedValue = useSpring(initial, TRANSITION);
  const targetRef = useRef(valueAtPlace);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const direction = Math.sign(value - previousValueRef.current);
    const currentDigit = normalizeDigit(targetRef.current);
    const nextDigit = normalizeDigit(valueAtPlace);
    let digitDelta = 0;

    if (direction > 0) {
      digitDelta = (nextDigit - currentDigit + 10) % 10;
    } else if (direction < 0) {
      digitDelta = -((currentDigit - nextDigit + 10) % 10);
    }

    const nextTarget = targetRef.current + digitDelta;
    targetRef.current = nextTarget;
    previousValueRef.current = value;

    if (reducedMotion) {
      animatedValue.jump(nextTarget);
    } else {
      animatedValue.set(nextTarget);
    }
  }, [animatedValue, reducedMotion, value, valueAtPlace]);

  useEffect(() => {
    if (!onAnimationComplete) return;
    return animatedValue.on("animationComplete", onAnimationComplete);
  }, [animatedValue, onAnimationComplete]);

  return (
    <span className="sliding-digit">
      <span className="sliding-digit-placeholder">0</span>
      {Array.from({ length: 10 }, (_, number) => (
        <NumberGlyph key={number} value={animatedValue} number={number} />
      ))}
    </span>
  );
}

function NumberGlyph({ value, number }: { value: MotionValue<number>; number: number }) {
  const y = useTransform(value, (latest) => {
    const placeValue = ((latest % 10) + 10) % 10;
    const offset = (10 + number - placeValue) % 10;
    let distance = offset;

    if (offset > 5) distance -= 10;
    return `${distance * 100}%`;
  });

  return (
    <motion.span className="sliding-digit-number" style={{ y }}>
      {number}
    </motion.span>
  );
}

type SlidingNumberProps = {
  value: number;
  padStart?: boolean;
  decimalSeparator?: string;
  reducedMotion?: boolean;
  onAnimationComplete?: () => void;
};

export function SlidingNumber({
  value,
  padStart = false,
  decimalSeparator = ".",
  reducedMotion = false,
  onAnimationComplete,
}: SlidingNumberProps) {
  const absValue = Math.abs(value);
  const [integerPart, decimalPart] = absValue.toString().split(".");
  const integerValue = Number.parseInt(integerPart, 10);
  const paddedInteger = padStart && integerValue < 10 ? `0${integerPart}` : integerPart;
  const integerDigits = paddedInteger.split("");
  const integerPlaces = integerDigits.map((_, index) =>
    Math.pow(10, integerDigits.length - index - 1),
  );

  return (
    <span className="core-sliding-number">
      {value < 0 && "-"}
      {integerDigits.map((_, index) => (
        <Digit
          key={`position-${integerPlaces[index]}`}
          value={integerValue}
          place={integerPlaces[index]}
          reducedMotion={reducedMotion}
          onAnimationComplete={index === 0 ? onAnimationComplete : undefined}
        />
      ))}
      {decimalPart && (
        <>
          <span>{decimalSeparator}</span>
          {decimalPart.split("").map((_, index) => (
            <Digit
              key={`decimal-${index}`}
              value={Number.parseInt(decimalPart, 10)}
              place={Math.pow(10, decimalPart.length - index - 1)}
              reducedMotion={reducedMotion}
            />
          ))}
        </>
      )}
    </span>
  );
}
