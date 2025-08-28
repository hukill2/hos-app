"use client";
import { useEffect, useState } from "react";

type Duty = "OFF" | "SB" | "DRIVE" | "ON";
type Event = { time: string; status: Duty };

function rowIndex(s: Duty) {
  return ["OFF", "SB", "DRIVE", "ON"].indexOf(s);
}

function HosSvg({ slots }: { slots: Duty[] }) {
  const width = 1200,
    height = 300,
    left = 60,
    top = 20,
    right = 20,
    bottom = 30;
  const innerW = width - left - right,
    innerH = height - top - bottom,
    laneStep = innerH / 3;
  const x = (i: number) => left + (i / 96) * innerW;
  const y = (s: Duty) => top + rowIndex(s) * laneStep;
  let d = `M ${x(0)} ${y(slots[0])}`;
  let prev = slots[0],
    y0 = y(prev);
  for (let i = 1; i < 96; i++) {
    const s = slots[i];
    if (s !== prev) {
      d += ` L ${x(i)} ${y0} L ${x(i)} ${y(s)}`;
      y0 = y(s);
      prev = s;
    }
  }
  d += ` L ${x(96)} ${y0}`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%">
      {["OFF", "SB", "DRIVE", "ON"].map((label, r) => (
        <text
          key={label}
          x={8}
          y={top + r * laneStep + 4}
          fontSize={12}
          fontFamily="monospace">
          {label}
        </text>
      ))}
      {["OFF", "SB", "DRIVE", "ON"].map((_, r) => (
        <line
          key={r}
          x1={left}
          x2={left + innerW}
          y1={top + r * laneStep}
          y2={top + r * laneStep}
          stroke="#bbb"
        />
      ))}
      {[...Array(25)].map((_, h) => (
        <g key={h}>
          <line
            x1={left + (h / 24) * innerW}
            x2={left + (h / 24) * innerW}
            y1={top}
            y2={top + innerH}
            stroke="#eee"
          />
          <text
            x={left + (h / 24) * innerW}
            y={top + innerH + 15}
            textAnchor="middle"
            fontSize={11}
            fontFamily="monospace">
            {String(h).padStart(2, "0")}:00
          </text>
        </g>
      ))}
      <path d={d} fill="none" stroke="black" strokeWidth={2} />
      <rect
        x={left}
        y={top}
        width={innerW}
        height={innerH}
        fill="none"
        stroke="#333"
      />
    </svg>
  );
}

export default function Page({ params }: { params: { date: string } }) {
  const [events, setEvents] = useState<Event[]>([
    { time: "00:00", status: "OFF" },
  ]);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/hos/${params.date}`);
      if (r.ok) {
        const d = await r.json();
        if (d) {
          setEvents(d.events);
          setData(d);
        }
      }
    })();
  }, [params.date]);

  const add = () =>
    setEvents((e) => [...e, { time: "08:00", status: "DRIVE" }]);
  const save = async () => {
    const r = await fetch(`/api/hos/${params.date}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        events,
      }),
    });
    const d = await r.json();
    setData(d);
  };

  // render slots if returned; otherwise build from events on server after save
  const slots: Duty[] = data?.slots || new Array(96).fill("OFF");

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">HOS for {params.date}</h1>
      <HosSvg slots={slots} />
      <div className="space-y-2">
        {events.map((e, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={e.time}
              onChange={(ev) =>
                setEvents((arr) =>
                  arr.map((x, j) =>
                    j === i ? { ...x, time: ev.target.value } : x
                  )
                )
              }
              className="border px-2 py-1 w-24"
            />
            <select
              value={e.status}
              onChange={(ev) =>
                setEvents((arr) =>
                  arr.map((x, j) =>
                    j === i ? { ...x, status: ev.target.value as Duty } : x
                  )
                )
              }
              className="border px-2 py-1">
              <option>OFF</option>
              <option>SB</option>
              <option>DRIVE</option>
              <option>ON</option>
            </select>
          </div>
        ))}
        <div className="flex gap-2">
          <button onClick={add} className="border px-3 py-1">
            Add event
          </button>
          <button onClick={save} className="border px-3 py-1">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
