"use client";

import { useMemo, useState } from "react";
import { Numbers } from "@sfinterface/numbers";
import { ActivityChart } from "./ActivityChart";

type Period = "week" | "month";

const topics = [
  { id: "billing", label: "Billing", color: "#8254f7", week: 2580, month: 10840 },
  { id: "access", label: "Account access", color: "#08b9bc", week: 1120, month: 4710 },
  { id: "imports", label: "Data imports", color: "#eb278a", week: 760, month: 3220 },
  { id: "integrations", label: "Integrations", color: "#ed5962", week: 360, month: 1530 },
  { id: "features", label: "Feature questions", color: "#277cf0", week: 248, month: 1020 },
] as const;

const initialSelected = ["billing", "access", "imports"];

export default function Home() {
  const [period, setPeriod] = useState<Period>("week");
  const [selected, setSelected] = useState<string[]>(initialSelected);

  const allSelected = selected.length === topics.length;
  const selectedTopics = useMemo(() => topics.filter((topic) => selected.includes(topic.id)), [selected]);
  const displayedWeekTotal = Math.round(selectedTopics.reduce((sum, topic) => sum + topic.week, 0) * 3682 / 4460);
  const displayedMonthTotal = Math.round(selectedTopics.reduce((sum, topic) => sum + topic.month, 0) * 3682 / 4460);
  const displayedTotal = period === "week" ? displayedWeekTotal : displayedMonthTotal;

  function toggleTopic(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function toggleAll() {
    setSelected(allSelected ? [] : topics.map((topic) => topic.id));
  }

  function changePeriod(next: Period) {
    setPeriod(next);
  }

  return (
    <main className="stage">
      <section className="card" aria-label="Support volume">
        <header className="card-header">
          <div className="heading">
            <h1>Support volume</h1>
            <p>New conversations by topic</p>
          </div>
          <div className="period-switch" role="group" aria-label="Time period">
            <span className={`period-indicator ${period === "month" ? "is-month" : ""}`} aria-hidden="true" />
            <button type="button" className={period === "week" ? "active" : ""} aria-pressed={period === "week"} onClick={() => changePeriod("week")}>Week</button>
            <button type="button" className={period === "month" ? "active" : ""} aria-pressed={period === "month"} onClick={() => changePeriod("month")}>Month</button>
          </div>
        </header>

        <div className="content">
          <div className="table-side">
            <div className="table-head">
              <button type="button" className="checkbox-button" role="checkbox" aria-label="Select all topics" aria-checked={allSelected} onClick={toggleAll}>
                <span className={`checkbox-visual${allSelected ? " is-checked" : ""}`} aria-hidden="true">
                  <svg className="checkbox-check" viewBox="0 0 16 16" focusable="false"><path d="m3.5 8.2 3 3 6-6.4" /></svg>
                </span>
              </button>
              <button type="button" className="topic-heading" onClick={toggleAll}>Topic</button>
              <span className="conversations-label">Conversations</span>
            </div>

            <div className="rows">
              {topics.map((topic) => {
                const checked = selected.includes(topic.id);
                return (
                  <button type="button" key={topic.id} className="table-row" role="checkbox" aria-checked={checked} onClick={() => toggleTopic(topic.id)}>
                    <span className={`checkbox-visual${checked ? " is-checked" : ""}`} aria-hidden="true">
                      <svg className="checkbox-check" viewBox="0 0 16 16" focusable="false"><path d="m3.5 8.2 3 3 6-6.4" /></svg>
                    </span>
                    <span className="topic-label">{topic.label}</span>
                    <span className="color-mark" style={{ backgroundColor: topic.color }} />
                    <span className="count">{topic[period].toLocaleString("en-US")}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="graphic-area" aria-live="polite">
            <div className="graphic-metric"><strong className={String(displayedTotal).startsWith("1") ? "starts-with-one" : undefined}><Numbers value={displayedTotal} locale="en-US" transition="roll" duration={280} /></strong><span>conversations</span></div>
            <div className="chart-slot" data-node-id="6816:18518" aria-label="Graphic here">
              <ActivityChart period={period} topics={selectedTopics} displayedTotal={displayedTotal} />
            </div>
          </div>
        </div>
        <footer className="card-footer">
          <div className="date-range"><img src="/assets/support-volume-figma-prototype/calendar-time.svg" width={16} height={16} alt="" /><span>{period === "week" ? "Sep 24–30, 2026" : "Sep 2026"}</span></div>
          <button className="export-button" type="button">Export CSV</button>
        </footer>
      </section>
    </main>
  );
}
