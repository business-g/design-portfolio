import React from "react";

/* eslint-disable @next/next/no-img-element */

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { NeuroNoise } from "@paper-design/shaders-react";

import styles from "./VpnPreviewShot.module.css";

function FlashIcon({
  active,
  loading,
}: {
  active: boolean;
  loading: boolean;
}) {
  const className = [
    styles.ctaIcon,
    active ? styles.ctaIconActive : "",
    loading ? styles.ctaIconLoading : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      className={className}
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M41.79 25.0134H34.58V8.21338C34.58 4.29338 32.4567 3.50005 29.8667 6.44005L28 8.56338L12.2034 26.53C10.0334 28.98 10.9434 30.9867 14.21 30.9867H21.42V47.7867C21.42 51.7067 23.5434 52.5 26.1334 49.56L28 47.4367L43.7967 29.47C45.9667 27.02 45.0567 25.0134 41.79 25.0134Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function VpnPreviewShot() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [buttonState, setButtonState] = useState<"idle" | "loading" | "active">(
    "idle",
  );
  const [isPressed, setIsPressed] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPingChecking, setIsPingChecking] = useState(false);
  const [pingMs, setPingMs] = useState(80);
  const [pingValueKey, setPingValueKey] = useState(0);
  const [tapIndicator, setTapIndicator] = useState({
    x: 0,
    y: 0,
    isReady: false,
  });
  const [tapIndicators, setTapIndicators] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const [scale, setScale] = useState(1);
  const cloudRefs = useRef<Array<HTMLDivElement | null>>([]);
  const rafRef = useRef(0);
  const tapIndicatorIdRef = useRef(0);
  const isIdle = buttonState === "idle";
  const isLoading = buttonState === "loading";
  const isActive = buttonState === "active";
  const showShader = isLoading || isActive;

  useEffect(() => {
    if (buttonState !== "loading") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setButtonState("active");
    }, 2100);

    return () => window.clearTimeout(timeoutId);
  }, [buttonState]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isActive]);

  useEffect(() => {
    if (!isPingChecking) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsPingChecking(false);
      setPingMs(Math.floor(Math.random() * (80 - 56 + 1)) + 56);
      setPingValueKey((current) => current + 1);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [isPingChecking]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) {
      return;
    }

    const updateScale = () => {
      const bounds = node.getBoundingClientRect();
      const nextScale = Math.min(bounds.width / 453, bounds.height / 918);
      setScale(Number.isFinite(nextScale) ? nextScale : 1);
    };

    updateScale();

    const observer = new ResizeObserver(() => {
      updateScale();
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      window.cancelAnimationFrame(rafRef.current);
      cloudRefs.current.forEach((cloud) => {
        if (!cloud) return;
        cloud.style.transition = "";
        cloud.style.transform = "";
      });
      return;
    }

    const motionConfig = [
      { xAmplitude: 12, yAmplitude: 4, period: 4200, phase: 0.2 },
      { xAmplitude: -15, yAmplitude: 5, period: 3900, phase: 1.45 },
      { xAmplitude: 13, yAmplitude: -4, period: 4500, phase: 2.6 },
    ];

    if (isLoading) {
      let animationStartTime: number | null = null;

      const animateClouds = (timestamp: number) => {
        if (animationStartTime === null) {
          animationStartTime = timestamp;
        }

        const introProgress = Math.min(
          (timestamp - animationStartTime) / 320,
          1,
        );
        const introEase = 1 - (1 - introProgress) ** 3;

        cloudRefs.current.forEach((cloud, index) => {
          if (!cloud) return;

          const config = motionConfig[index];
          const progress = ((timestamp % config.period) / config.period) * Math.PI * 2;
          const offsetX =
            Math.sin(progress + config.phase) * config.xAmplitude * introEase;
          const offsetY =
            Math.cos(progress + config.phase) * config.yAmplitude * introEase;

          cloud.style.transition = "";
          cloud.style.transform = `translate3d(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px, 0)`;
        });

        rafRef.current = window.requestAnimationFrame(animateClouds);
      };

      rafRef.current = window.requestAnimationFrame(animateClouds);

      return () => {
        window.cancelAnimationFrame(rafRef.current);
      };
    }

    window.cancelAnimationFrame(rafRef.current);
    cloudRefs.current.forEach((cloud) => {
      if (!cloud) return;
      cloud.style.transition = "transform 520ms cubic-bezier(0.215, 0.61, 0.355, 1)";
      cloud.style.transform = "translate3d(0, 0, 0)";
    });
  }, [isLoading]);

  const formattedTimer = new Date(elapsedSeconds * 1000)
    .toISOString()
    .slice(11, 19);

  const rootClassName = [
    styles.page,
  ].join(" ");

  return (
    <main
      ref={rootRef}
      className={rootClassName}
      style={
        {
          "--vpn-scale": scale.toString(),
        } as CSSProperties
      }
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        setTapIndicator({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
          isReady: true,
        });
      }}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;

        const id = tapIndicatorIdRef.current++;
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;
        setTapIndicator({
          x,
          y,
          isReady: true,
        });
        setTapIndicators((current) => [
          ...current,
          { id, x, y },
        ]);
        window.setTimeout(() => {
          setTapIndicators((current) =>
            current.filter((indicator) => indicator.id !== id),
          );
        }, 360);
      }}
    >
      <div className={styles.tapIndicatorLayer} aria-hidden="true">
        {tapIndicator.isReady ? (
          <span
            className={styles.tapIndicator}
            style={{ left: `${tapIndicator.x}px`, top: `${tapIndicator.y}px` }}
          />
        ) : null}
        {tapIndicators.map((indicator) => (
          <span
            key={indicator.id}
            className={styles.tapIndicatorPulse}
            style={{ left: `${indicator.x}px`, top: `${indicator.y}px` }}
          />
        ))}
      </div>

      <div className={styles.phoneShellStage}>
        <div className={styles.phoneShell}>
          <img
            className={styles.phoneShellFrame}
            src="/assets/legacy-vpn-preview/phone-bg.png"
            alt=""
            aria-hidden="true"
          />

          <section className={styles.screenFrame} aria-label="VPN app preview">
            <img
              className={styles.statusBar}
              src="/assets/legacy-vpn-preview/status-bar.svg"
              alt=""
              aria-hidden="true"
            />

            <div className={styles.screenTitleBlock}>
              <h1 className={styles.screenTitle}>
                {isActive ? (
                  formattedTimer
                ) : isLoading ? (
                  <span className={styles.screenTitleLoading}>
                    <span className={styles.screenTitleWord}>Connecting</span>
                    <span className={styles.screenTitleDots} aria-hidden="true">
                      <span className={styles.screenTitleDot}>.</span>
                      <span className={styles.screenTitleDot}>.</span>
                      <span className={styles.screenTitleDot}>.</span>
                    </span>
                  </span>
                ) : (
                  "Disconnected"
                )}
              </h1>

              <div
                className={`${styles.connectionStatus} ${
                  isActive ? styles.connectionStatusVisible : ""
                }`}
                aria-hidden={!isActive}
              >
                <img
                  className={styles.connectionStatusIcon}
                  src="/assets/legacy-vpn-preview/shield-icon.svg"
                  alt=""
                />
                <span className={styles.connectionStatusText}>
                  Connection protected
                </span>
              </div>
            </div>

            {[
              { src: "/assets/legacy-vpn-preview/cloud-3.png", layer: styles.cloudLayer3, idle: styles.cloudLayer3Idle },
              { src: "/assets/legacy-vpn-preview/cloud-2.png", layer: styles.cloudLayer2, idle: styles.cloudLayer2Idle },
              { src: "/assets/legacy-vpn-preview/cloud-1.png", layer: styles.cloudLayer1, idle: styles.cloudLayer1Idle },
            ].map((cloud, index) => (
              <div
                key={cloud.src}
                className={`${styles.cloudLayer} ${cloud.layer} ${isIdle ? cloud.idle : ""}`}
                aria-hidden="true"
              >
                <div
                  ref={(node) => {
                    cloudRefs.current[index] = node;
                  }}
                  className={styles.cloudMotion}
                >
                  <img
                    className={`${styles.cloudImage} ${isActive ? styles.cloudImageActive : ""}`}
                    src={cloud.src}
                    alt=""
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              className={`${styles.ctaShell} ${isPressed ? styles.ctaShellPressed : ""}`}
              aria-pressed={isActive}
              onClick={() => {
                setButtonState((current) => {
                  setElapsedSeconds(0);
                  if (current === "idle") return "loading";
                  return "idle";
                });
              }}
              onPointerDown={() => setIsPressed(true)}
              onPointerUp={() => setIsPressed(false)}
              onPointerCancel={() => setIsPressed(false)}
              onPointerLeave={() => setIsPressed(false)}
              onBlur={() => setIsPressed(false)}
            >
              <div className={styles.ctaCore}>
                {showShader ? (
                  <NeuroNoise
                    scale={0.07}
                    speed={3.07}
                    contrast={0.58}
                    brightness={0.05}
                    frame={265231.8189999915}
                    colorBack="#00000000"
                    colorMid={isLoading ? "#FFD0B8" : "#B8BAFE"}
                    colorFront="#FFFFFF"
                    style={{
                      backgroundColor: isLoading ? "#F7AB85" : "#9492F7",
                      borderRadius: "9999px",
                      height: "100%",
                      width: "100%",
                    }}
                  />
                ) : (
                  <div
                    className={`${styles.ctaFill} ${
                      isLoading
                        ? styles.ctaFillLoading
                        : isActive
                          ? styles.ctaFillActive
                          : ""
                    }`}
                  />
                )}
                <FlashIcon active={isActive} loading={isLoading} />
              </div>
            </button>

            <section className={styles.locationCard} aria-label="Server location">
              <div className={styles.locationCardMeta}>
                <span className={styles.locationCardPingLabel}>Ping</span>
                <div className={styles.locationCardPingStatus}>
                  <span
                    key={pingValueKey}
                    className={`${styles.locationCardPingValue} ${
                      pingValueKey ? styles.locationCardPingValueUpdating : ""
                    }`}
                  >
                    {pingMs} ms
                  </span>
                  <button
                    type="button"
                    className={styles.locationCardPingButton}
                    aria-label="Check ping"
                    disabled={isPingChecking}
                    onClick={() => setIsPingChecking(true)}
                  >
                    {isPingChecking ? (
                      <span className={styles.locationCardPingLoader} aria-hidden="true" />
                    ) : (
                      <img
                        className={styles.locationCardPingIcon}
                        src="/assets/legacy-vpn-preview/check-ping-button.svg"
                        alt=""
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </div>
              </div>

              <div className={styles.locationCardInner}>
                <div className={styles.locationCardInfo}>
                  <img
                    className={styles.locationCardFlag}
                    src="/assets/legacy-vpn-preview/flag.svg"
                    alt=""
                    aria-hidden="true"
                  />
                  <div className={styles.locationCardCopy}>
                    <p className={styles.locationCardCountry}>Ireland</p>
                    <p className={styles.locationCardCity}>Dublin</p>
                  </div>
                </div>

                <img
                  className={styles.locationCardSignal}
                  src="/assets/legacy-vpn-preview/signal-status.svg"
                  alt=""
                  aria-hidden="true"
                />
              </div>
            </section>

            <nav className={styles.bottomNav} aria-label="Primary navigation">
              <button type="button" className={styles.bottomNavItem} aria-label="Settings">
                <img
                  className={styles.bottomNavIcon}
                  src="/assets/legacy-vpn-preview/settings.svg"
                  alt=""
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                className={`${styles.bottomNavItem} ${styles.bottomNavItemActive}`}
                aria-current="page"
                aria-label="Home"
              >
                <img
                  className={styles.bottomNavIcon}
                  src="/assets/legacy-vpn-preview/home.svg"
                  alt=""
                  aria-hidden="true"
                />
              </button>
              <button type="button" className={styles.bottomNavItem} aria-label="Routing">
                <img
                  className={styles.bottomNavIcon}
                  src="/assets/legacy-vpn-preview/routing.svg"
                  alt=""
                  aria-hidden="true"
                />
              </button>
            </nav>
          </section>
        </div>
      </div>
    </main>
  );
}
