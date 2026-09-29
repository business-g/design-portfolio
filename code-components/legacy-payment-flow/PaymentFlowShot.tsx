"use client";

/* eslint-disable @next/next/no-img-element */

import React from "react";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

import styles from "./PaymentFlowShot.module.css";

const ASSETS = {
  product: "/payment-flow-preview/assets/sub-icon.png",
  info: "/payment-flow-preview/assets/info.svg",
  arrow: "/payment-flow-preview/arrow-down.svg",
  eth: "/payment-flow-preview/assets/eth.svg",
  usdt: "/payment-flow-preview/assets/usdt.svg",
  tron: "/payment-flow-preview/assets/tron.svg",
  bnb: "/payment-flow-preview/assets/bnb.svg",
  polygon: "/payment-flow-preview/assets/polygon.svg",
  arbitrum: "/payment-flow-preview/assets/arbitrum.svg",
  optimism: "/payment-flow-preview/assets/optimism.svg",
  base: "/payment-flow-preview/assets/base.svg",
} as const;

type Method = "card" | "crypto";
type Network =
  | "Ethereum"
  | "Solana"
  | "Tron"
  | "BNB"
  | "Polygon"
  | "Arbitrum"
  | "Optimism"
  | "Base";
type Token =
  | "USDT"
  | "USDC"
  | "TUSD"
  | "ETH"
  | "DAI"
  | "SHIB"
  | "CAKE"
  | "LINK"
  | "UNI"
  | "AAVE"
  | "SOL"
  | "JUP"
  | "MORPHO"
  | "PYTH"
  | "BONK"
  | "VIRTUAL"
  | "TRX"
  | "JST"
  | "SUN"
  | "USDD"
  | "PENGU"
  | "BNB"
  | "FDUSD"
  | "XRP"
  | "DOGE"
  | "POL"
  | "WETH"
  | "ARB"
  | "OP"
  | "SNX"
  | "ZRO"
  | "AERO"
  | "B3";

const networkOptions: Array<{ value: Network; icon: string }> = [
  { value: "Ethereum", icon: ASSETS.eth },
  { value: "Solana", icon: "/payment-flow-preview/Solana.svg" },
  { value: "Tron", icon: ASSETS.tron },
  { value: "BNB", icon: ASSETS.bnb },
  { value: "Polygon", icon: ASSETS.polygon },
  { value: "Arbitrum", icon: ASSETS.arbitrum },
  { value: "Optimism", icon: ASSETS.optimism },
  { value: "Base", icon: ASSETS.base },
];

const expandedNetworkOptions: Array<{ value: Network; icon: string }> = [
  ...networkOptions,
  { value: "Ethereum", icon: ASSETS.eth },
];

const tokensByNetwork: Record<Network, Token[]> = {
  Ethereum: ["USDT", "USDC", "ETH", "DAI", "SHIB", "LINK", "UNI", "AAVE"],
  Solana: ["USDT", "USDC", "SOL", "JUP", "MORPHO", "PYTH", "BONK", "VIRTUAL"],
  Tron: ["USDT", "USDC", "TRX", "JST", "ETH", "TUSD", "SUN", "USDD"],
  BNB: ["USDT", "USDC", "BNB", "FDUSD", "CAKE", "ETH", "XRP", "DOGE"],
  Polygon: ["USDT", "USDC", "POL", "WETH", "CAKE", "DAI", "LINK", "AAVE"],
  Arbitrum: ["USDT", "USDC", "ETH", "ARB", "CAKE", "LINK", "UNI", "MORPHO"],
  Optimism: ["USDT", "USDC", "ETH", "OP", "AAVE", "LINK", "SNX", "ZRO"],
  Base: ["USDC", "USDT", "ETH", "MORPHO", "AERO", "CAKE", "VIRTUAL", "B3"],
};

const tokenUsdPrices: Record<Token, number> = {
  AAVE: 66.47,
  AERO: 0.364302,
  ARB: 0.085852,
  B3: 0.00054388,
  BNB: 603.43,
  BONK: 0.00000444,
  CAKE: 1.34,
  DAI: 1,
  DOGE: 0.087352,
  ETH: 1673.86,
  FDUSD: 1,
  JST: 0.076042,
  JUP: 0.174263,
  LINK: 7.97,
  MORPHO: 1.97,
  OP: 0.107375,
  POL: 0.075165,
  PYTH: 0.03796666,
  PENGU: 0.00679866,
  SHIB: 0.00000498,
  SNX: 0.245577,
  SOL: 67.44,
  SUN: 0.01693816,
  TRX: 0.315921,
  TUSD: 1,
  UNI: 2.52,
  USDC: 1,
  USDD: 1,
  USDT: 1,
  VIRTUAL: 0.640218,
  WETH: 1673.59,
  XRP: 1.14,
  ZRO: 0.934391,
};

const usdTargetAmount = 79;
const qrMatrixSize = 33;

function formatTokenAmount(token: Token) {
  const price = tokenUsdPrices[token];
  const amount = usdTargetAmount / price;
  const maximumFractionDigits = amount >= 1_000_000 ? 0 : amount >= 1 ? 4 : 6;

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: amount >= 1_000_000 ? 0 : 2,
    maximumFractionDigits,
  }).format(amount);
}

function isLongAmount(tokenAmount: string, token: Token) {
  return `${tokenAmount} ${token}`.length > 14;
}

function formatCardNumberInput(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiryInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function randomFromSeed(seed: number) {
  let value = seed + 0x6d2b79f5;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

function getFinderPixel(row: number, col: number, startRow: number, startCol: number) {
  const localRow = row - startRow;
  const localCol = col - startCol;
  const inside = localRow >= 0 && localRow <= 6 && localCol >= 0 && localCol <= 6;
  if (!inside) return null;

  return (
    localRow === 0 ||
    localRow === 6 ||
    localCol === 0 ||
    localCol === 6 ||
    (localRow >= 2 && localRow <= 4 && localCol >= 2 && localCol <= 4)
  );
}

function createQrPixels(payload: string) {
  const baseSeed = hashString(payload);

  return Array.from({ length: qrMatrixSize * qrMatrixSize }, (_, index) => {
    const row = Math.floor(index / qrMatrixSize);
    const col = index % qrMatrixSize;
    const finderPixel =
      getFinderPixel(row, col, 2, 2) ??
      getFinderPixel(row, col, 2, 24) ??
      getFinderPixel(row, col, 24, 2);

    if (finderPixel !== null) return finderPixel;

    const distanceFromCenter = Math.hypot(row - 16, col - 16);
    if (distanceFromCenter <= 6.6) return false;

    if ((row === 8 && col > 9 && col < 23) || (col === 8 && row > 9 && row < 23)) {
      return (row + col) % 2 === 0;
    }

    const seed = baseSeed + row * 374761393 + col * 668265263;
    const nearbyWeight = (row > 10 && row < 23 ? 0.04 : 0) + (col > 10 && col < 23 ? 0.04 : 0);

    return randomFromSeed(seed) < 0.39 + nearbyWeight;
  });
}

function QrPixelGrid({ payload }: { payload: string }) {
  const pixels = createQrPixels(payload);

  return (
    <div key={payload} className={styles.qrPixelGrid} role="img" aria-label="QR code">
      {pixels.map((active, index) => {
        return (
          <span
            key={`${payload}-${index}`}
            className={`${styles.qrPixel} ${active ? styles.qrPixelOn : ""}`.trim()}
          />
        );
      })}
    </div>
  );
}

function getTokenIcon(token: Token) {
  const tokenIcons: Partial<Record<Token, string>> = {
    AAVE: "/payment-flow-preview/assets/tokens/AAVE.svg",
    AERO: "/payment-flow-preview/assets/tokens/AERO.svg",
    ARB: ASSETS.arbitrum,
    B3: "/payment-flow-preview/assets/tokens/B3.svg",
    BNB: "/payment-flow-preview/assets/tokens/BNB.svg",
    BONK: "/payment-flow-preview/assets/tokens/BONK.svg",
    CAKE: "/payment-flow-preview/assets/tokens/CAKE.svg",
    DAI: "/payment-flow-preview/assets/tokens/DAI.svg",
    DOGE: "/payment-flow-preview/assets/tokens/DOGE.svg",
    ETH: ASSETS.eth,
    FDUSD: "/payment-flow-preview/assets/tokens/FDUSD.svg",
    JUP: "/payment-flow-preview/assets/tokens/JUP.svg",
    JST: "/payment-flow-preview/assets/tokens/JST.svg",
    LINK: "/payment-flow-preview/assets/tokens/LINK.svg",
    MORPHO: "/payment-flow-preview/assets/tokens/MORPHO.svg",
    OP: ASSETS.optimism,
    PENGU: "/payment-flow-preview/assets/tokens/PENGU.svg",
    POL: ASSETS.polygon,
    PYTH: "/payment-flow-preview/assets/tokens/PYTH.svg",
    SHIB: "/payment-flow-preview/assets/tokens/SHIB.svg",
    SOL: "/payment-flow-preview/Solana.svg",
    SNX: "/payment-flow-preview/assets/tokens/SNX.svg",
    SUN: "/payment-flow-preview/assets/tokens/SUN.svg",
    TRX: ASSETS.tron,
    TUSD: "/payment-flow-preview/assets/tokens/TUSD.svg",
    UNI: "/payment-flow-preview/assets/tokens/UNI.svg",
    USDC: "/payment-flow-preview/assets/tokens/USDC.svg",
    USDD: "/payment-flow-preview/assets/tokens/USDD.svg",
    USDT: ASSETS.usdt,
    VIRTUAL: "/payment-flow-preview/assets/tokens/VIRTUAL.svg",
    WETH: "/payment-flow-preview/assets/tokens/WETH.svg",
    XRP: "/payment-flow-preview/assets/tokens/XRP.svg",
    ZRO: "/payment-flow-preview/assets/tokens/ZRO.svg",
  };

  return tokenIcons[token] ?? null;
}

function getTokenOptions(network: Network): Array<{ value: Token; icon: string | null }> {
  return tokensByNetwork[network].map((value) => ({
    value,
    icon: getTokenIcon(value),
  }));
}

function Dropdown<T extends string>({
  label,
  labelClassName,
  value,
  options,
  open,
  onToggle,
  onSelect,
}: {
  label: string;
  labelClassName?: string;
  value: T;
  options: Array<{ value: T; icon: string | null }>;
  open: boolean;
  onToggle: () => void;
  onSelect: (value: T) => void;
}) {
  const active = options.find((option) => option.value === value);

  return (
    <div className={styles.fieldCard}>
      <p className={`${styles.fieldLabel} ${labelClassName ?? ""}`.trim()}>{label}</p>
      <div className={styles.selectWrap}>
        <button className={styles.selectButton} type="button" onClick={onToggle}>
          <span className={styles.selectLeft}>
            {active?.icon ? (
              <img className={styles.tokenIcon} src={active.icon} alt="" />
            ) : (
              <span className={styles.tokenFallbackIcon}>{value.slice(0, 2)}</span>
            )}
            <span className={styles.selectValue}>{value}</span>
          </span>
          <img
            className={`${styles.arrow} ${open ? styles.arrowOpen : ""}`.trim()}
            src={ASSETS.arrow}
            alt=""
          />
        </button>

        {open ? (
          <div className={styles.menu}>
            {options.map((option) => (
              <button
                key={option.value}
                className={`${styles.menuItem} ${option.value === value ? styles.menuItemActive : ""}`.trim()}
                type="button"
                onClick={() => onSelect(option.value)}
              >
                {option.icon ? (
                  <img className={styles.tokenIcon} src={option.icon} alt="" />
                ) : (
                  <span className={styles.tokenFallbackIcon}>{option.value.slice(0, 2)}</span>
                )}
                <span>{option.value}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function getNetworkIcon(network: Network) {
  return networkOptions.find((option) => option.value === network)?.icon ?? ASSETS.eth;
}

function getAvailableToken(network: Network, token: Token) {
  return tokensByNetwork[network].includes(token) ? token : tokensByNetwork[network][0];
}

export function PaymentFlowShot() {
  const rootRef = useRef<HTMLElement | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const networkPanelTimeoutRef = useRef<number | null>(null);

  const [scale, setScale] = useState(1);
  const [method, setMethod] = useState<Method>("crypto");
  const [network, setNetwork] = useState<Network>("Ethereum");
  const [token, setToken] = useState<Token>("USDT");
  const [openDropdown, setOpenDropdown] = useState<"network" | "token" | null>(null);
  const [networkPanelPhase, setNetworkPanelPhase] = useState<"closed" | "entering" | "open" | "exiting">("closed");
  const [copied, setCopied] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const depositAddress = "0x8F3A67C1A7D2B98E";
  const tokenOptions = getTokenOptions(network);
  const tokenAmount = formatTokenAmount(token);
  const qrPayload = `${depositAddress}|${network}|${token}|${tokenAmount}`;
  const qrTokenIcon = getTokenIcon(token);
  const amountValueClassName = `${styles.amountValue} ${isLongAmount(tokenAmount, token) ? styles.amountValueLong : ""}`.trim();

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const updateScale = () => {
      const bounds = node.getBoundingClientRect();
      const nextScale = Math.min(bounds.width / 602, bounds.height / 646);
      setScale(Number.isFinite(nextScale) ? nextScale : 1);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current !== null) window.clearTimeout(toastTimeoutRef.current);
      if (networkPanelTimeoutRef.current !== null) window.clearTimeout(networkPanelTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const close = () => setOpenDropdown(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(depositAddress);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = depositAddress;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopied(true);
    if (toastTimeoutRef.current !== null) window.clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => {
      setCopied(false);
      toastTimeoutRef.current = null;
    }, 1800);
  };

  const openNetworkPanel = () => {
    if (networkPanelTimeoutRef.current !== null) {
      window.clearTimeout(networkPanelTimeoutRef.current);
      networkPanelTimeoutRef.current = null;
    }
    setOpenDropdown("network");
    setNetworkPanelPhase("entering");
    networkPanelTimeoutRef.current = window.setTimeout(() => {
      setNetworkPanelPhase("open");
      networkPanelTimeoutRef.current = null;
    }, 240);
  };

  const openTokenPanel = () => {
    if (networkPanelTimeoutRef.current !== null) {
      window.clearTimeout(networkPanelTimeoutRef.current);
      networkPanelTimeoutRef.current = null;
    }
    setOpenDropdown("token");
    setNetworkPanelPhase("entering");
    networkPanelTimeoutRef.current = window.setTimeout(() => {
      setNetworkPanelPhase("open");
      networkPanelTimeoutRef.current = null;
    }, 240);
  };

  const closeNetworkPanel = () => {
    if (networkPanelTimeoutRef.current !== null) {
      window.clearTimeout(networkPanelTimeoutRef.current);
      networkPanelTimeoutRef.current = null;
    }
    setNetworkPanelPhase("exiting");
    networkPanelTimeoutRef.current = window.setTimeout(() => {
      setOpenDropdown(null);
      setNetworkPanelPhase("closed");
      networkPanelTimeoutRef.current = null;
    }, 180);
  };

  const rootStyle = { "--payment-scale": scale.toString() } as CSSProperties;

  if (openDropdown === "network" || openDropdown === "token") {
    const isNetworkPanel = openDropdown === "network";
    const panelLabel = isNetworkPanel ? "Network" : "Token";
    const selectedValue = isNetworkPanel ? network : token;
    const selectedIcon = isNetworkPanel ? getNetworkIcon(network) : getTokenIcon(token);
    const expandedOptions = isNetworkPanel ? expandedNetworkOptions : tokenOptions;

    return (
      <main ref={rootRef} className={styles.page} style={rootStyle}>
        <div className={styles.stage}>
          <section className={styles.card}>
            <div className={styles.purchaseBlock}>
              <img className={styles.productIcon} src={ASSETS.product} alt="" />
              <div>
                <p className={styles.eyebrow}>You&apos;re purchasing</p>
                <h1 className={styles.title}>90-day license key</h1>
              </div>
            </div>

            <div className={styles.singleSelectorStage}>
              <div
                className={`${styles.expandedSelectorCard} ${
                  networkPanelPhase === "exiting" ? styles.expandedSelectorExit : styles.expandedSelectorEnter
                }`.trim()}
              >
                <p className={`${styles.fieldLabel} ${styles.fieldLabelWideInset}`.trim()}>{panelLabel}</p>
                <div
                  className={`${styles.expandedSelectorInner} ${
                    networkPanelPhase === "exiting"
                      ? styles.expandedSelectorInnerExit
                      : styles.expandedSelectorInnerEnter
                  }`.trim()}
                >
                  <button
                    className={`${styles.selectButton} ${styles.expandedSelectButton}`.trim()}
                    type="button"
                    onClick={closeNetworkPanel}
                  >
                    <span className={styles.selectLeft}>
                      {selectedIcon ? (
                        <img className={styles.tokenIcon} src={selectedIcon} alt="" />
                      ) : (
                        <span className={styles.tokenFallbackIcon}>{selectedValue.slice(0, 2)}</span>
                      )}
                      <span className={styles.selectValue}>{selectedValue}</span>
                    </span>
                    <img className={`${styles.arrow} ${styles.arrowOpen}`.trim()} src={ASSETS.arrow} alt="" />
                  </button>
                  <div className={styles.menuDivider} />
                  <div className={styles.menu}>
                    {expandedOptions.map((option, index) => (
                      <button
                        key={`${option.value}-${option.icon}-${index}`}
                        className={`${styles.menuItem} ${
                          networkPanelPhase === "exiting" ? styles.menuItemExit : styles.menuItemAnimated
                        } ${option.value === selectedValue ? styles.menuItemActive : ""}`.trim()}
                        type="button"
                        style={{
                          animationDelay:
                            networkPanelPhase === "exiting"
                              ? `${Math.max(0, (expandedOptions.length - index - 1) * 8)}ms`
                              : `${24 + index * 8}ms`,
                        }}
                        onClick={() => {
                          if (isNetworkPanel) {
                            const nextNetwork = option.value as Network;
                            setNetwork(nextNetwork);
                            setToken((currentToken) => getAvailableToken(nextNetwork, currentToken));
                          } else {
                            setToken(option.value as Token);
                          }
                          closeNetworkPanel();
                        }}
                      >
                        {option.icon ? (
                          <img className={styles.tokenIcon} src={option.icon} alt="" />
                        ) : (
                          <span className={styles.tokenFallbackIcon}>{option.value.slice(0, 2)}</span>
                        )}
                        <span>{option.value}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main ref={rootRef} className={styles.page} style={rootStyle}>
      <div className={styles.stage}>
        <section className={styles.card}>
          <div className={styles.purchaseBlock}>
            <img className={styles.productIcon} src={ASSETS.product} alt="" />
            <div>
              <p className={styles.eyebrow}>You&apos;re purchasing</p>
              <h1 className={styles.title}>90-day license key</h1>
            </div>
          </div>

          <div className={`${styles.methodSwitch} ${method === "crypto" ? styles.methodSwitchCrypto : ""}`.trim()}>
            <span className={styles.switchThumb} aria-hidden="true" />
            <button
              type="button"
              className={`${styles.switchButton} ${method === "card" ? styles.switchButtonActive : ""}`}
              onClick={() => setMethod("card")}
            >
              Card
            </button>
            <button
              type="button"
              className={`${styles.switchButton} ${method === "crypto" ? styles.switchButtonActive : ""}`}
              onClick={() => setMethod("crypto")}
            >
              Crypto
            </button>
          </div>

          {method === "crypto" ? (
            <div className={styles.methodPanel} key="crypto">
              <div className={styles.sectionGrid}>
                <div onClick={(event) => event.stopPropagation()}>
                  <Dropdown
                    label="Network"
                    labelClassName={styles.fieldLabelWideInset}
                    value={network}
                    options={networkOptions}
                    open={false}
                    onToggle={openNetworkPanel}
                    onSelect={(nextValue) => {
                      setNetwork(nextValue);
                      setOpenDropdown(null);
                    }}
                  />
                </div>

                <div onClick={(event) => event.stopPropagation()}>
                  <Dropdown
                    label="Token"
                    value={token}
                    options={tokenOptions}
                    open={false}
                    onToggle={openTokenPanel}
                    onSelect={(nextValue) => {
                      setToken(nextValue);
                      setOpenDropdown(null);
                    }}
                  />
                </div>
              </div>

              <div className={styles.cryptoLayout}>
                <div className={styles.qrCard}>
                  <div className={styles.qrImageWrap}>
                    <QrPixelGrid payload={qrPayload} />
                    {qrTokenIcon ? (
                      <img className={styles.qrTokenIcon} src={qrTokenIcon} alt="" />
                    ) : (
                      <span className={styles.qrTokenFallbackIcon}>{token.slice(0, 2)}</span>
                    )}
                  </div>
                  <p className={styles.qrCaption}>Scan to pay</p>
                </div>

                <div className={styles.detailsCol}>
                  <div className={styles.amountCard}>
                    <p className={styles.detailLabel}>Amount to send</p>
                    <span className={amountValueClassName}>
                      {tokenAmount} {token}
                    </span>
                  </div>

                  <div className={styles.addressCard}>
                    <p className={styles.detailLabel}>Deposit address</p>
                    <div className={styles.addressRow}>
                      <span className={styles.addressValue}>0x8F3A67C1...A7D2B98E</span>
                      <button
                        className={styles.copyButton}
                        type="button"
                        onClick={handleCopy}
                        aria-label="Copy deposit address"
                      >
                        <span className={`${styles.copyIconWrap} ${copied ? styles.copyIconWrapCopied : ""}`.trim()}>
                          <svg
                            className={`${styles.copyIcon} ${styles.copyIconDefault}`}
                            viewBox="0 0 16 16"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M5.33398 5.33203V3.46536C5.33398 2.71863 5.33398 2.34526 5.47931 2.06004C5.60714 1.80916 5.81111 1.60519 6.062 1.47736C6.34721 1.33203 6.72058 1.33203 7.46732 1.33203H12.534C13.2807 1.33203 13.6541 1.33203 13.9393 1.47736C14.1902 1.60519 14.3942 1.80916 14.522 2.06004C14.6673 2.34526 14.6673 2.71863 14.6673 3.46536V8.53203C14.6673 9.27877 14.6673 9.65214 14.522 9.93735C14.3942 10.1882 14.1902 10.3922 13.9393 10.52C13.6541 10.6654 13.2807 10.6654 12.534 10.6654H10.6673M3.46732 14.6654H8.53398C9.28072 14.6654 9.65409 14.6654 9.9393 14.52C10.1902 14.3922 10.3942 14.1882 10.522 13.9374C10.6673 13.6521 10.6673 13.2788 10.6673 12.532V7.46536C10.6673 6.71863 10.6673 6.34526 10.522 6.06004C10.3942 5.80916 10.1902 5.60519 9.9393 5.47736C9.65409 5.33203 9.28072 5.33203 8.53398 5.33203H3.46732C2.72058 5.33203 2.34721 5.33203 2.062 5.47736C1.81111 5.60519 1.60714 5.80916 1.47931 6.06004C1.33398 6.34526 1.33398 6.71863 1.33398 7.46536V12.532C1.33398 13.2788 1.33398 13.6521 1.47931 13.9374C1.60714 14.1882 1.81111 14.3922 2.062 14.52C2.34721 14.6654 2.72058 14.6654 3.46732 14.6654Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <svg
                            className={`${styles.copyIcon} ${styles.copyIconSuccess}`}
                            viewBox="0 0 16 16"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M2.5 7.97713L5.99039 12.5L13.5 3.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.notice}>
                <img className={styles.noticeIcon} src={ASSETS.info} alt="" />
                <p className={styles.noticeText}>
                  Send exactly {tokenAmount} {token} on {network}. Scan the QR code or send the exact
                  amount to the provided address. Payments via other networks will not be processed.
                </p>
              </div>
            </div>
          ) : (
            <div className={`${styles.methodPanel} ${styles.cardPaymentForm}`} key="card">
              <div className={`${styles.cardInputCard} ${styles.paymentAmountCard}`.trim()}>
                <p className={styles.cardInputLabel}>Payment amount</p>
                <p className={styles.paymentAmountValue}>$79.00</p>
              </div>

              <div className={styles.cardInputCard}>
                <p className={styles.cardInputLabel}>Card number</p>
                <div className={styles.cardInputArea}>
                  <input
                    className={styles.cardInput}
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(event) => setCardNumber(formatCardNumberInput(event.target.value))}
                  />
                </div>
              </div>

              <div className={styles.cardInputCard}>
                <p className={styles.cardInputLabel}>Card holder name</p>
                <div className={styles.cardInputArea}>
                  <input
                    className={styles.cardInput}
                    autoComplete="cc-name"
                    placeholder="John Doe"
                    value={cardHolderName}
                    onChange={(event) => setCardHolderName(event.target.value)}
                  />
                </div>
              </div>

              <div className={styles.cardFieldsRow}>
                <div className={styles.cardInputCard}>
                  <p className={styles.cardInputLabel}>Expiry date</p>
                  <div className={styles.cardInputArea}>
                    <input
                      className={styles.cardInput}
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(event) => setExpiryDate(formatExpiryInput(event.target.value))}
                    />
                  </div>
                </div>

                <div className={styles.cardInputCard}>
                  <p className={styles.cardInputLabel}>CVV</p>
                  <div className={styles.cardInputArea}>
                    <input
                      className={styles.cardInput}
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="123"
                      value={cvv}
                      onChange={(event) => setCvv(event.target.value.replace(/\D/g, "").slice(0, 3))}
                    />
                  </div>
                </div>
              </div>

              <button className={styles.payButton} type="button">
                Pay $79.00
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
