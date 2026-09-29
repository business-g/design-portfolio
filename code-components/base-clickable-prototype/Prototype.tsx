import React, { useEffect, useState } from "react";

type StepStatus = "complete" | "running" | "waiting";

const actions = [
  {
    title: "Read order",
    time: "12:44:01",
    source: "Shopify",
    durationMs: 2500,
    nodeId: "6198:2468",
  },
  {
    title: "Check refund policy",
    time: "12:44:03",
    source: "Policy engine",
    durationMs: 2300,
    nodeId: "6198:2473",
  },
  {
    title: "Issue $420 refund",
    time: "12:44:04",
    source: "Stripe",
    durationMs: 2600,
    nodeId: "6198:2478",
  },
  {
    title: "Send refund confirmation",
    time: null,
    source: null,
    durationMs: 2400,
    nodeId: "6198:2486",
  },
] as const;

const RUN_SEGMENT_ROTATIONS = [188, 278, 8, 98] as const;

function RunProgressIcon({
  statuses,
  runId,
}: {
  statuses: StepStatus[];
  runId: number;
}) {
  return (
    <svg
      className="run-progress"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      {RUN_SEGMENT_ROTATIONS.map((rotation, index) => {
        const status = statuses[index] ?? "waiting";
        const circleProps = {
          cx: 16,
          cy: 16,
          r: 13.1,
          pathLength: 100,
          strokeDasharray: "20.5 79.5",
          strokeLinecap: "butt" as const,
          strokeWidth: 2.8,
          transform: `rotate(${rotation} 16 16)`,
        };

        return (
          <g key={rotation}>
            <circle
              className={`run-progress-segment is-${status}`}
              {...circleProps}
            />
            <circle
              className={`run-progress-fill${status === "waiting" ? "" : ` is-${status}`}`}
              key={`${runId}-${index}`}
              {...circleProps}
            />
          </g>
        );
      })}
    </svg>
  );
}

function ActionStatus({ status }: { status: StepStatus }) {
  return (
    <span className={`action-status is-${status}`} aria-hidden="true">
      <span className="action-status-layer action-status-waiting">
        <img src="/assets/base-clickable-prototype/action-waiting.png" alt="" />
      </span>
      <span className="action-status-layer action-status-running">
        <img src="/assets/base-clickable-prototype/action-running.png" alt="" />
      </span>
      <span className="action-status-layer action-status-complete">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle
            className="action-check-ring"
            cx="7"
            cy="7"
            r="6.25"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            className="action-check-mark"
            d="M4.1 7.05 6.15 9.1 10.05 5.05"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>
  );
}

function getActionDetail(
  action: (typeof actions)[number],
  status: StepStatus,
  activeStepSeconds: number,
) {
  if (status === "waiting") {
    return "Not started · Waiting for the previous action";
  }

  const context = [action.time, action.source].filter(Boolean).join(" · ");
  const durationLabel = `${(action.durationMs / 1000).toFixed(1)}s`;
  const statusText =
    status === "complete"
      ? action.source
        ? durationLabel
        : `Completed · ${durationLabel}`
      : `Running ${activeStepSeconds}s`;

  return context ? `${context} · ${statusText}` : statusText;
}

function ActionContent({
  action,
  status,
  activeStepSeconds,
}: {
  action: (typeof actions)[number];
  status: StepStatus;
  activeStepSeconds: number;
}) {
  return (
    <>
      <ActionStatus status={status} />
      <span className="action-copy">
        <span
          className={`action-title${status === "running" ? " is-shimmering" : ""}`}
        >
          {action.title}
        </span>
        <span className="action-detail">
          {getActionDetail(action, status, activeStepSeconds)}
        </span>
      </span>
    </>
  );
}

function ActionsContent({
  statuses,
  activeStepSeconds,
}: {
  statuses: StepStatus[];
  activeStepSeconds: number;
}) {
  return (
    <>
      {actions.map((action, index) => (
        <div
          className="action-row"
          key={action.title}
          data-node-id={action.nodeId}
        >
          <ActionContent
            action={action}
            status={statuses[index]}
            activeStepSeconds={activeStepSeconds}
          />
        </div>
      ))}

      <span className="guide-line" aria-hidden="true" />
      {actions.map((action, index) => (
        <span
          className="action-guide"
          key={`${action.title}-guide`}
          style={{ top: `${7.5 + index * 46}px` }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

export default function Home() {
  const [isOpen, setIsOpen] = useState(true);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [runId, setRunId] = useState(0);

  const totalSteps = actions.length;
  const totalDurationMs = actions.reduce(
    (total, action) => total + action.durationMs,
    0,
  );
  const isComplete = completedSteps === totalSteps;
  const statuses: StepStatus[] = actions.map((_, index) =>
    index < completedSteps
      ? "complete"
      : index === completedSteps && !isComplete
        ? "running"
        : "waiting",
  );
  const activeStepSeconds = isComplete
    ? 0
    : Math.min(
        3,
        Math.max(
          1,
          Math.floor(
            (elapsedSeconds * 1000 -
              actions
                .slice(0, completedSteps)
                .reduce((total, action) => total + action.durationMs, 0)) /
              1000,
          ) + 1,
        ),
      );

  useEffect(() => {
    setCompletedSteps(0);
    setElapsedSeconds(0);

    const stepTimers = actions.map((_, index) =>
      window.setTimeout(
        () => setCompletedSteps(index + 1),
        actions
          .slice(0, index + 1)
          .reduce((total, action) => total + action.durationMs, 0),
      ),
    );
    const elapsedTimer = window.setInterval(() => {
      setElapsedSeconds((current) =>
        Math.min(current + 1, Math.floor(totalDurationMs / 1000)),
      );
    }, 1000);
    const finishTimer = window.setTimeout(() => {
      window.clearInterval(elapsedTimer);
      setElapsedSeconds(Math.floor(totalDurationMs / 1000));
    }, totalDurationMs);

    return () => {
      stepTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearInterval(elapsedTimer);
      window.clearTimeout(finishTimer);
    };
  }, [runId, totalDurationMs]);

  function toggleDetails() {
    setIsOpen((current) => !current);
  }

  function restartPrototype() {
    setCompletedSteps(0);
    setElapsedSeconds(0);
    setRunId((current) => current + 1);
  }

  return (
    <main
      className="prototype-canvas"
      data-node-id={isOpen ? "6198:2448" : "6196:2346"}
    >
      <button
        className="prototype-restart"
        type="button"
        aria-label="Restart prototype"
        onClick={restartPrototype}
      >
        <span className="prototype-restart-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6.49988 2.15708C9.43378 1.40474 12.4813 2.91472 13.6073 5.74107C13.7502 6.10016 13.5748 6.50719 13.2157 6.65024C12.8566 6.79317 12.4496 6.61772 12.3065 6.25864C11.4726 4.16602 9.25609 3.00591 7.05945 3.46372L6.84753 3.51353C6.03311 3.7231 5.29113 4.15067 4.70105 4.74985C4.11099 5.34907 3.69497 6.09733 3.49792 6.91489C3.30087 7.7326 3.32948 8.58911 3.58191 9.39146C3.83435 10.1937 4.30088 10.9121 4.93054 11.4696C5.56027 12.0272 6.33011 12.4031 7.1571 12.5565C7.98397 12.7099 8.83716 12.6352 9.62488 12.3407C10.4127 12.0461 11.1054 11.542 11.6288 10.8836C12.1521 10.2253 12.4871 9.43721 12.5966 8.60337C12.6468 8.22005 12.9984 7.94959 13.3817 7.99985C13.7648 8.05035 14.0345 8.40185 13.9843 8.78501C13.8418 9.87097 13.4061 10.8974 12.7245 11.7547C12.0429 12.6121 11.141 13.2676 10.1151 13.6512C9.08925 14.0348 7.9781 14.1322 6.90124 13.9325C5.82454 13.7326 4.8227 13.2434 4.0028 12.5174C3.18285 11.7914 2.57566 10.8561 2.24695 9.81138C1.91825 8.7666 1.88 7.65155 2.13659 6.58677C2.39316 5.52226 2.93475 4.54768 3.703 3.76743C4.47148 2.98711 5.43921 2.42994 6.49988 2.15708Z"
              fill="currentColor"
            />
            <path
              d="M12.6353 2.66663C12.6353 2.28014 12.9481 1.96661 13.3346 1.96644C13.7212 1.96644 14.0347 2.28003 14.0347 2.66663V5.99964C14.0347 6.38624 13.7212 6.69984 13.3346 6.69984H10.0015C9.61494 6.69984 9.30135 6.38624 9.30135 5.99964C9.30152 5.61319 9.61505 5.30042 10.0015 5.30042H12.6353V2.66663Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span className="prototype-restart-spinner" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="currentColor"
              strokeOpacity="0.2"
              strokeWidth="1.5"
            />
            <path
              d="M8 2a6 6 0 0 1 6 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>

      <section
        className={`run-shell${isOpen ? " is-open" : ""}`}
        aria-label="Customer refund run"
      >
        <article
          className="run-card"
          data-node-id={isOpen ? "6198:2449" : "6196:2348"}
        >
          <button
            className="run-header"
            type="button"
            aria-expanded={isOpen}
            aria-controls="run-actions"
            onClick={toggleDetails}
            data-node-id={isOpen ? "6198:2450" : "6196:2349"}
          >
            <span
              className="run-identity"
              data-node-id={isOpen ? "6198:2451" : "6196:2350"}
            >
              <span
                className="run-icon"
                data-node-id={isOpen ? "6198:2452" : "6196:2367"}
              >
                <RunProgressIcon statuses={statuses} runId={runId} />
              </span>

              <span
                className="run-title"
                data-node-id={isOpen ? "6198:2457" : "6196:2355"}
              >
                <span className="task-name">Process customer refund</span>
                <span className="task-detail">Billing 03 · run_91ac</span>
              </span>
            </span>

            <span
              className="run-state"
              data-node-id={isOpen ? "6198:2460" : "6196:2358"}
            >
              <span className="status-line">
                <span
                  className={`status-dot${isComplete ? " is-complete" : ""}`}
                  aria-hidden="true"
                />
                <span>{isComplete ? "Completed" : `Running ${elapsedSeconds}s`}</span>
              </span>
              <span className="progress-line">
                {completedSteps} of {totalSteps} completed
              </span>
            </span>

            <span className="chevron" aria-hidden="true">
              <img src="/assets/base-clickable-prototype/chevron-down.svg" alt="" />
            </span>
          </button>

          <div className={`actions-reveal${isOpen ? " is-open" : ""}`}>
            <div className="actions-reveal-clip">
              <div
                className={`actions-stack${isOpen ? " is-visible" : ""}`}
                id="run-actions"
                data-node-id="6198:2467"
                aria-hidden={!isOpen}
              >
                <ActionsContent
                  statuses={statuses}
                  activeStepSeconds={activeStepSeconds}
                />
              </div>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
