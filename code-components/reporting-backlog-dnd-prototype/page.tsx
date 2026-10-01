import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, Reorder, motion, useDragControls, useReducedMotion } from "motion/react";
import { Numbers } from "@sfinterface/numbers";
import BellIcon from "./bell-icon";
import styles from "./page.module.css";

type BacklogItem = { id: string; title: string; description: string };

const initialItems: BacklogItem[] = [
  { id: "views", title: "Saved report views", description: "Reopen reports with the same filters" },
  { id: "email", title: "Scheduled email reports", description: "Send a PDF report each week" },
  { id: "period", title: "Period comparison", description: "Compare current and previous periods" },
  { id: "export", title: "Export chart image", description: "Download a chart as PNG" },
];
const storageKey = "reporting-backlog-order";

function orderedItems(ids: string[]): BacklogItem[] {
  if (ids.length !== initialItems.length || new Set(ids).size !== initialItems.length) return initialItems;
  const ordered = ids.map((id) => initialItems.find((item) => item.id === id));
  return ordered.every((item): item is BacklogItem => Boolean(item)) ? ordered : initialItems;
}

function moveItem(items: BacklogItem[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function BacklogRow({ item, index, total, onKeyboardMove, editable, interactive }: {
  item: BacklogItem;
  index: number;
  total: number;
  onKeyboardMove: (id: string, nextIndex: number) => void;
  editable: boolean;
  interactive: boolean;
}) {
  const controls = useDragControls();
  const reduceMotion = useReducedMotion();
  return (
    <Reorder.Item
      as="li"
      value={item}
      drag={interactive ? "y" : false}
      dragListener={false}
      dragControls={controls}
      dragElastic={0.15}
      dragMomentum={false}
      layout={reduceMotion ? undefined : true}
      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 38 }}
      className={styles.row}
    >
      <div className={styles.rowInner}>
        <span className={`${styles.rank} ${styles[`rank${index + 1}`]}`} aria-hidden="true">
          <Numbers value={index + 1} transition="roll" duration={300} blur={false} />
        </span>
        <div className={styles.rowText}>
          <span className={styles.rowTitle}>{item.title}</span>
          <span className={styles.rowDescription}>{item.description}</span>
        </div>
        <AnimatePresence initial={false}>
        {editable && <motion.button
          key="drag-handle"
          type="button"
          className={styles.dragHandle}
          disabled={!interactive}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.88 }}
          transition={{ duration: reduceMotion ? 0.1 : 0.18, ease: "easeOut" }}
          aria-label={`Move ${item.title}. Position ${index + 1} of ${total}. Use arrow keys to reorder.`}
          onPointerDown={(event) => controls.start(event)}
          onKeyDown={(event) => {
            let nextIndex = index;
            if (event.key === "ArrowUp") nextIndex = Math.max(0, index - 1);
            if (event.key === "ArrowDown") nextIndex = Math.min(total - 1, index + 1);
            if (event.key === "Home") nextIndex = 0;
            if (event.key === "End") nextIndex = total - 1;
            if (nextIndex !== index) {
              event.preventDefault();
              onKeyboardMove(item.id, nextIndex);
            }
          }}
        >
          <span className={styles.dragDots} aria-hidden="true">
            {Array.from({ length: 6 }, (_, dot) => <span key={dot} />)}
          </span>
        </motion.button>}
        </AnimatePresence>
      </div>
    </Reorder.Item>
  );
}

export default function Home() {
  const [items, setItems] = useState(initialItems);
  const [savedItems, setSavedItems] = useState(initialItems);
  const [announcement, setAnnouncement] = useState("");
  const [ringCount, setRingCount] = useState(0);
  const [phase, setPhase] = useState<"editing" | "ringing" | "saved">("editing");
  const saveDelay = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const restored = orderedItems(JSON.parse(stored));
          setItems(restored);
          setSavedItems(restored);
        }
      } catch {
        // The prototype still works when local storage is unavailable.
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => () => {
    if (saveDelay.current) clearTimeout(saveDelay.current);
  }, []);

  function keyboardMove(id: string, nextIndex: number) {
    const index = items.findIndex((item) => item.id === id);
    const next = moveItem(items, index, nextIndex);
    setItems(next);
    setPhase("editing");
    setAnnouncement(`${next[nextIndex].title} moved to position ${nextIndex + 1}.`);
  }

  function saveOrder() {
    setSavedItems(items);
    try { localStorage.setItem(storageKey, JSON.stringify(items.map((item) => item.id))); } catch {}
    setRingCount((count) => count + 1);
    setPhase(reduceMotion ? "saved" : "ringing");
    setAnnouncement(reduceMotion ? "Order saved in this prototype." : "Saving order.");
  }

  function finishSave() {
    if (phase !== "ringing") return;
    saveDelay.current = setTimeout(() => {
      setPhase("saved");
      setAnnouncement("Order saved in this prototype.");
      saveDelay.current = null;
    }, 300);
  }

  function discardOrder() {
    setItems(savedItems);
    setPhase("editing");
    setAnnouncement("Changes discarded. The last saved order is restored.");
  }

  function editOrder() {
    setPhase("editing");
    setAnnouncement("Order editing enabled.");
  }

  return (
    <MotionConfig reducedMotion="user">
      <main className={styles.stage}>
        <section className={styles.panel} aria-labelledby="backlog-title">
          <header className={styles.header}>
            <h1 id="backlog-title">Reporting backlog</h1>
            <p>Order candidates for the next planning review</p>
          </header>
          <Reorder.Group as="ol" axis="y" values={items} onReorder={(next) => { setItems(next); setPhase("editing"); }} className={styles.list} aria-label="Reporting backlog priorities">
            {items.map((item, index) => (
              <BacklogRow key={item.id} item={item} index={index} total={items.length} onKeyboardMove={keyboardMove} editable={phase !== "saved"} interactive={phase === "editing"} />
            ))}
          </Reorder.Group>
          <footer className={styles.footer}>
            <AnimatePresence initial={false}>
            {phase !== "saved" && <motion.div
              key="notice"
              className={styles.notice}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, filter: "blur(2px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, filter: "blur(2px)" }}
              transition={{ duration: reduceMotion ? 0.1 : 0.18, ease: [0.22, 1, 0.36, 1] as const }}
            >
              <BellIcon key={ringCount} ringing={phase === "ringing"} onRingEnd={finishSave} />
              <span className={phase === "ringing" ? styles.noticeShimmer : undefined}>Saving this order will notify the team</span>
            </motion.div>}
            </AnimatePresence>
            <div className={styles.actions} data-phase={phase}>
              <AnimatePresence initial={false}>
              {phase === "editing" && <motion.div
                key="discard"
                className={styles.actionSlot}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, filter: "blur(2px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, filter: "blur(2px)" }}
                transition={{ duration: reduceMotion ? 0.1 : 0.18, ease: [0.22, 1, 0.36, 1] as const }}
              >
                <button className={`${styles.action} ${styles.secondary}`} onClick={discardOrder} type="button">Discard</button>
              </motion.div>}
              </AnimatePresence>
              <button
                className={`${styles.action} ${styles.primary}`}
                onClick={phase === "saved" ? editOrder : saveOrder}
                type="button"
                disabled={phase === "ringing"}
                aria-busy={phase === "ringing"}
                aria-label={phase === "ringing" ? "Saving order" : undefined}
              >
                {phase === "ringing" ? <span className={styles.buttonSpinner} aria-hidden="true" /> : phase === "saved" ? "Edit order" : "Save order"}
              </button>
            </div>
          </footer>
          <div className={styles.srOnly} role="status" aria-live="polite">{announcement}</div>
        </section>
      </main>
    </MotionConfig>
  );
}
