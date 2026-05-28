// components.jsx — UI components for 꾹꾹이 아카이브

const { useState, useEffect, useMemo, useCallback, useRef } = React;

// ─── helpers ───────────────────────────────────────────────────────────────
const fmtKDate = (iso) => {
  const d = new Date(iso + "T00:00:00");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} (${days[d.getDay()]})`;
};
const daysUntil = (iso) => {
  const now = new Date();now.setHours(0, 0, 0, 0);
  const d = new Date(iso + "T00:00:00");
  return Math.round((d - now) / 86400000);
};
const parseRunStart = (run = "") => {
  const text = String(run || "");
  const match = text.match(/\d{4}[.-]\d{1,2}[.-]\d{1,2}/);
  if (!match) return null;
  return new Date(match[0].replace(/\./g, "-"));
};

// ─── Photo block (real image when code is an image file) ───────────────
function PH({ ratio = "3 / 4", label = "PHOTO", code, style }) {
  const isImage = typeof code === "string" && /\.(png|jpe?g|gif|webp|svg)$/i.test(code);

  return (
    <div className="ph" style={{ aspectRatio: ratio, width: "100%", overflow: "hidden", position: "relative", ...style }}>
      {isImage ? (
        <img
          src={code}
          alt={label}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <>
          <span className="cnr">{code || "img/—"}</span>
          <span className="lbl">{label}</span>
        </>
      )}
    </div>
  );
}

// ─── Top nav ──────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", on, { passive: true });
    on();
    return () => window.removeEventListener("scroll", on);
  }, []);

  const items = [
  ["about", "About"],
  ["schedule", "Schedule"],
  ["works", "Works"],
  ["gallery", "Gallery"]];


  const jump = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 60, behavior: "smooth" });
  };

  return (
    <>
      <div style={{
        position: "fixed",
        top: 26,
        left: 32,
        zIndex: 60,
        fontFamily: "var(--mono)",
        fontSize: 16,
        fontWeight: 600,
        letterSpacing: ".18em",
        color: "var(--accent)",
        textTransform: "uppercase",
        pointerEvents: "none"
      }}>
        KOOKOOKI
      </div>

    <nav
      style={{
        position: "fixed", top: 26, left: 32, right: 0, zIndex: 60,
        display: "flex", justifyContent: "center",
        padding: "0 18px",
        pointerEvents: "none",
        transition: "top .25s"
      }}>

      <div style={{
        pointerEvents: "auto",
        background: scrolled ? "var(--paper)" : "rgba(255,250,239,.7)",
        backdropFilter: "blur(14px) saturate(160%)",
        WebkitBackdropFilter: "blur(14px) saturate(160%)",
        border: "1px solid var(--rule)",
        borderRadius: 999,
        boxShadow: scrolled ? "var(--shadow-md)" : "var(--shadow-sm)",
        padding: "8px 22px",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        gap: 28,
        transition: "box-shadow .25s, background .25s",
        maxWidth: "calc(100vw - 36px)"
      }}>
        <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
          <span style={{ color: "var(--accent)", fontSize: 12 }}>✧</span>
          {items.map(([id, label]) =>
          <a key={id} href={`#${id}`} onClick={jump(id)} style={{
            textDecoration: "none", color: "var(--ink-soft)",
            fontSize: 13, letterSpacing: ".02em", fontWeight: 500
          }}>{label}</a>
          )}
          <span style={{ color: "var(--accent)", fontSize: 12 }}>✧</span>
        </div>
      </div>
    </nav>
  </>);
}

function Hero({ variant = "cover", nameSize = 220, serifFamily = "Noto Serif KR" }) {
  const next = SCHEDULE.find((s) => daysUntil(s.date) >= 0);
  const dday = next ? daysUntil(next.date) : null;

  // Top + bottom magazine masthead
  const Masthead = () =>
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "var(--paper)", border: "1px solid var(--rule)",
    borderRadius: 999, padding: "10px 22px",
    boxShadow: "var(--shadow-sm)",
    fontFamily: "var(--sans)", fontSize: 12, color: "var(--ink-soft)",
    letterSpacing: ".02em"
  }}>
      <div> <span style={{ color: "var(--accent)" }}></span></div>
      <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", letterSpacing: "-.005em", fontSize: 14, color: "var(--ink)" }}>

    </div>
      <div></div>
    </div>;


  return (
    <header id="top" style={{ padding: "72px 32px 24px", maxWidth: 1280, margin: "0 auto" }}>

      <div style={{
        display: "grid",
        gridTemplateColumns: variant === "portrait-left" ? "minmax(320px, 440px) 1fr" : "1fr minmax(320px, 440px)",
        gap: 56,
        alignItems: "stretch",
        marginTop: 18
      }}>
        {variant === "portrait-left" &&
        <div className="tilt-l" style={{ display: "none" }}>
            <PH ratio="3 / 4" label="" code="hero-01.jpg" />
          </div>
        }

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 0 }}>
        </div>

        {variant !== "portrait-left" &&
        <div className="tilt-r" style={{ display: "none" }}>
            <PH ratio="3 / 4" label="PORTRAIT" code="01.jpg" />
          </div>
        }
      </div>

    </header>);

}

// ─── About section ────────────────────────────────────────────────────────
function About() {
  const debutValue = PROFILE.debutDate || PROFILE.debut_date || "";
  const debut = useMemo(() => new Date(debutValue + "T00:00:00"), [debutValue]);

  // Live-updating debut counter
  const debutInfo = useMemo(() => {
    if (Number.isNaN(debut.getTime())) return "데뷔일 정보 없음";
    const now = new Date();
    const days = Math.floor((now - debut) / 86400000);
    let years = now.getFullYear() - debut.getFullYear();
    const before = now.getMonth() < debut.getMonth() ||
      (now.getMonth() === debut.getMonth() && now.getDate() < debut.getDate());
    if (before) years -= 1;
    return `${days.toLocaleString("ko-KR")}일 · ${years}주년`;
  }, [debut]);

  const anniversary = useMemo(() => {
    if (Number.isNaN(debut.getTime())) return null;
    const now = new Date();
    const candidate = new Date(now.getFullYear(), debut.getMonth(), debut.getDate());
    if (candidate < now) candidate.setFullYear(candidate.getFullYear() + 1);
    const diffDays = Math.ceil((candidate - now) / 86400000);
    return {
      year: candidate.getFullYear(),
      days: diffDays,
      label: `${candidate.getFullYear()}년 데뷔 ${candidate.getFullYear() - debut.getFullYear()}주년`
    };
  }, [debut]);

  const birthStr = PROFILE.birthDate || PROFILE.birth_date || "1991-03-14";

  const facts = [
    ["이름",     PROFILE.nameKo    || PROFILE.name_ko  || ""],
    ["생년월일", birthStr.replace(/-/g, ".").slice(0, 10).replace(/\./g, ".")],
    ["MBTI",     PROFILE.mbti      || ""],
    ["데뷔",     PROFILE.debutDate || PROFILE.debut_date
                   ? (PROFILE.debutDate || PROFILE.debut_date).replace(/-/g, ".") + " 뮤지컬 〈삼총사〉"
                   : ""],
  ].filter(([, v]) => v);
  const birthday = useMemo(() => {
    const d = new Date(birthStr + "T00:00:00");
    if (Number.isNaN(d.getTime())) return null;
    const now = new Date();
    const candidate = new Date(now.getFullYear(), d.getMonth(), d.getDate());
    if (candidate < now) candidate.setFullYear(candidate.getFullYear() + 1);
    const diffDays = Math.ceil((candidate - now) / 86400000);
    return { days: diffDays, label: `${candidate.getFullYear()}년 생일` };
  }, [birthStr]);
  return (
    <section id="about" style={{ padding: "120px 32px 80px", maxWidth: 1280, margin: "0 auto" }}>
      <SectionHeader chapter="01" label="About" title="배우 선한국" />

      <div style={{
        display: "grid", gridTemplateColumns: "1fr minmax(280px, 380px)", gap: 64,
        marginTop: 56, alignItems: "start"
      }}>
        {/* Facts table on the left */}
        <div>

          <table style={{
            width: "100%", borderCollapse: "collapse",
            fontFamily: "var(--sans)"
          }}>
            <tbody>
              {facts.map(([k, v]) =>
              <tr key={k} style={{ borderBottom: "1px dashed var(--rule)" }}>
                  <td style={{
                  padding: "20px 0", color: "var(--ink-soft)",
                  fontWeight: 500, fontSize: 13, width: 160,
                  verticalAlign: "top"
                }}>{k}</td>
                  <td style={{
                  padding: "20px 0", color: "var(--ink)",
                  fontFamily: "var(--serif)", fontSize: 22, fontWeight: 600,
                  letterSpacing: "-.005em", lineHeight: 1.35
                }}>
                    {k === "데뷔" ?
                  <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span>{v}</span>
                        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-soft)" }}>
                          +{debutInfo}
                          {anniversary ? <span style={{ marginLeft: 8 }}>· D-{anniversary.days}</span> : null}
                        </span>
                      </span> :
                  k === "생년월일" && birthday ?
                  <span>
                        {v}
                        <span style={{ marginLeft: 8, fontSize: 16 }}>(D-{birthday.days})</span>
                      </span> :
                  v}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 16 }}>
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".18em", color: "var(--ink-soft)", textTransform: "uppercase", marginBottom: 4 }}>Booking</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>사의 찬미 예매</div>
            </div>
            <div style={{ width: 1, height: 36, background: "var(--rule)", flexShrink: 0 }} />
            <div style={{ display: "flex", gap: 10 }}>
            {[
              { href: "https://www.ticketlink.co.kr/product/63166", label: "티켓링크" },
              { href: "https://ticket.yes24.com/Perf/58416",        label: "예스24" },
            ].map(({ href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center",
                  padding: "10px 20px",
                  background: "var(--paper)", color: "var(--ink)",
                  border: "1px solid var(--rule)",
                  fontFamily: "var(--sans)", fontSize: 13, fontWeight: 600,
                  borderRadius: 999, textDecoration: "none",
                  letterSpacing: ".02em",
                  boxShadow: "var(--shadow-sm)",
                  transition: "background .18s, color .18s, border-color .18s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--accent)";
                  e.currentTarget.style.color = "var(--paper)";
                  e.currentTarget.style.borderColor = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--paper)";
                  e.currentTarget.style.color = "var(--ink)";
                  e.currentTarget.style.borderColor = "var(--rule)";
                }}
              >
                {label}
              </a>
            ))}
            </div>
          </div>

        </div>

        {/* Profile photo on the right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <PH ratio="3 / 4" label="PROFILE" code="profile-01.jpg" />
          <div style={{
            border: "1px solid var(--rule)", borderRadius: 18,
            padding: "14px 16px", background: "rgba(255,255,255,.55)"
          }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".18em", color: "var(--ink-soft)", textTransform: "uppercase" }}>
              Official
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
              {[
                { key: "instagram", icon: "images/instagram.svg",  iconW: 20, label: "@sunkorea91",            fallback: "https://www.instagram.com/sunkorea91/" },
                { key: "youtube",   icon: "images/youtube.svg",    iconW: 20, label: "서동진과 선한국의 유튜브", fallback: "https://www.youtube.com/@sunseo2910" },
                { key: "kakao",     icon: "images/kakao.jpg",      iconW: 18, label: "벼랑끝에 선 한국 뮤지컬", fallback: "https://open.kakao.com/o/g1r9ty6f" },
              ].map(({ key, icon, iconW, label, fallback }) => {
                const href = (PROFILE.social && PROFILE.social[key]) || fallback;
                return (
                  <a key={key} href={href} target="_blank" rel="noreferrer" style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    fontFamily: "var(--serif)", fontSize: 14, color: "var(--ink)", textDecoration: "none"
                  }}>
                    <img src={icon} alt={key} style={{ width: iconW, height: iconW, objectFit: "contain" }} />
                    {label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>);

}

// ─── Concerts strip (small, under Works) ──────────────────────────────────
function ConcertsStrip() {
  return (
    <div style={{ marginTop: 56, paddingTop: 28, borderTop: ".5px solid var(--ink)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".22em", color: "var(--ink-soft)", textTransform: "uppercase" }}>

          </span>
          <h3 style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 700, margin: 0 }}>

          </h3>
        </div>
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-soft)", letterSpacing: ".06em" }}>
          {CONCERTS.length} entries
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0 32px" }}>
        {CONCERTS.map((c, i) =>
        <div key={i} style={{
          display: "grid", gridTemplateColumns: "100px 1fr auto",
          gap: 16, padding: "14px 0", borderBottom: ".5px solid var(--rule)",
          alignItems: "baseline"
        }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-soft)" }}>{c.date}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 16, fontWeight: 500 }}>{c.title}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--accent)", letterSpacing: ".08em", textTransform: "uppercase" }}>
              w/ {c.with}
            </div>
          </div>
        )}
      </div>
    </div>);

}

// ─── shared section header ────────────────────────────────────────────────
function SectionHeader({ chapter, label, title, right, chipStyle = {}, labelStyle = {}, titleStyle = {} }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "flex-end",
      paddingBottom: 22, gap: 16, flexWrap: "wrap"
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{
            background: "var(--accent)", color: "var(--paper)",
            fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600,
            borderRadius: 999, padding: "6px 14px",
            boxShadow: "var(--shadow-sm)",
            ...chipStyle
          }}>Ch.{chapter}</span>
          {label ? <span style={{
            fontFamily: "var(--sans)", fontSize: 12, fontWeight: 500,
            color: "var(--ink-soft)", letterSpacing: ".02em",
            ...labelStyle
          }}>
            ✦ {label}
          </span> : null}
        </div>
        <h2 style={{
          fontFamily: "var(--serif)", fontSize: 56, fontWeight: 700,
          margin: 0, letterSpacing: "-.015em", lineHeight: 1,
          color: "var(--ink)",
          ...titleStyle
        }}>
          {title}
        </h2>
      </div>
      {right}
    </div>);

}

// ─── Works ────────────────────────────────────────────────────────────────
function Works() {
  const [yearFilter, setYearFilter] = useState("all");
  const sourceWorks = (window.WORKS && window.WORKS.length ? window.WORKS : WORKS);
  const years = useMemo(() => [...new Set(sourceWorks.map((w) => w.year).filter(Boolean))].sort((a, b) => b - a), [sourceWorks]);
  const recentYears = useMemo(() => years.filter((y) => y >= 2020), [years]);
  const before2020 = useMemo(() => years.filter((y) => y < 2020), [years]);
  const filtered = useMemo(() => {
    const sorted = [...sourceWorks].sort((a, b) => {
      const aStart = parseRunStart(a.run) || new Date((a.year || 0) + "-01-01T00:00:00");
      const bStart = parseRunStart(b.run) || new Date((b.year || 0) + "-01-01T00:00:00");
      return bStart.getTime() - aStart.getTime() || String(b.title || "").localeCompare(String(a.title || ""));
    });
    if (yearFilter === "all") return sorted;
    if (yearFilter === "before-2020") return sorted.filter((w) => (w.year || 0) < 2020);
    return sorted.filter((w) => String(w.year) === String(yearFilter));
  }, [yearFilter, sourceWorks]);

  return (
    <section id="works" style={{
      padding: "120px 32px 80px", maxWidth: 1280, margin: "0 auto"
    }}>
      <SectionHeader chapter="03" label="Works" title="출연 작품" />

      <div style={{ marginTop: 20, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {[["all", "전체 연도"], ...recentYears.map((y) => [y, String(y)]), ...(before2020.length > 0 ? [["before-2020", "2020 이전"]] : [])].map(([val, lbl]) => (
          <button key={val} onClick={() => setYearFilter(val)} style={{
            padding: "8px 14px", border: "1px solid var(--rule)", borderRadius: 999, cursor: "pointer",
            background: String(yearFilter) === String(val) ? "var(--ink)" : "var(--paper)",
            color: String(yearFilter) === String(val) ? "var(--paper)" : "var(--ink)",
            fontFamily: "var(--sans)", fontSize: 12, fontWeight: 500,
            transition: "background .15s, color .15s"
          }}>{lbl}</button>
        ))}
      </div>

      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((w, i) =>
        <div key={i} className="softcard" style={{
          display: "grid",
          gridTemplateColumns: "72px 1fr 1fr 220px 60px",
          gap: 24, padding: "22px 24px",
          alignItems: "center"
        }}>
            <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: "var(--paper-warm)", border: "1px solid var(--rule)",
            borderRadius: 999, padding: "6px 0",
            fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink)", fontWeight: 600,
            letterSpacing: ".02em"
          }}>{w.year}</div>
            <div>
              <div style={{
              fontFamily: "var(--serif)", fontSize: 22, fontWeight: 700,
              lineHeight: 1.25, color: "var(--ink)"
            }}>{w.title}</div>
              <div style={{
              display: "inline-block", marginTop: 6,
              fontFamily: "var(--sans)", fontSize: 11, fontWeight: 500,
              color: "var(--accent)", background: "var(--paper-warm)",
              borderRadius: 999, padding: "2px 10px"
            }}>{w.kind}</div>
            </div>
            <div style={{ fontSize: 14, color: "var(--ink)" }}>{w.role}</div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
              <div>{w.venue}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, marginTop: 4 }}>{w.run}</div>
            </div>
            <div style={{
            fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-soft)",
            textAlign: "right", letterSpacing: ".02em"
          }}>
              #{String(filtered.length - i).padStart(2, "0")}
            </div>
          </div>
        )}
      </div>
    </section>);

}

// ─── Schedule (with D-Day countdown) ──────────────────────────────────────
function Schedule() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const sourceWorks = (window.WORKS && window.WORKS.length ? window.WORKS : WORKS);
  const resolveVenue = useCallback((item) => {
    if (item.venue) return item.venue;
    const work = sourceWorks.find((w) => w.id === item.work_id);
    return work?.venue || "";
  }, [sourceWorks]);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return SCHEDULE.filter((s) => new Date(s.date + "T" + s.time + ":00").getTime() >= now);
  }, [tick]);
  const next = upcoming[0] || SCHEDULE[SCHEDULE.length - 1] || null;
  const target = useMemo(() => next ? new Date(next.date + "T" + next.time + ":00") : null, [next?.date, next?.time]);
  const now = new Date();
  const diff = Math.max(0, target ? target - now : 0);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff % 86400000 / 3600000);
  const m = Math.floor(diff % 3600000 / 60000);
  const s = Math.floor(diff % 60000 / 1000);

  return (
    <section id="schedule" style={{
      padding: "40px 32px", maxWidth: 1280, margin: "40px auto"
    }}>
      <div style={{
        background: "linear-gradient(160deg, #3a2a1e 0%, #2b2118 100%)",
        color: "#faf3e3",
        borderRadius: "var(--radius-lg)",
        padding: "60px 56px",
        boxShadow: "var(--shadow-md)",
        position: "relative", overflow: "hidden"
      }}>
        {/* decorative bear-ear circles */}
        <div style={{
          position: "absolute", top: -40, right: 60, width: 80, height: 80,
          background: "rgba(184,127,77,.15)", borderRadius: "50%"
        }} />
        <div style={{
          position: "absolute", top: -60, right: 130, width: 60, height: 60,
          background: "rgba(184,127,77,.1)", borderRadius: "50%"
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <SectionHeader
            chapter="02"
            label="Schedule"
            title="공연 일정"
            right={null}
            chipStyle={{ background: "var(--accent)", color: "#faf3e3" }}
            labelStyle={{ color: "rgba(250,243,227,.7)" }}
            titleStyle={{ color: "#faf3e3" }}
          />
        </div>

        {/* Countdown */}
        {next ? (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 64, marginTop: 56 }}>
          <div>
            <div style={{
              display: "inline-block",
              background: "rgba(184,127,77,.2)", color: "#faf3e3",
              fontFamily: "var(--sans)", fontSize: 12, fontWeight: 500,
              borderRadius: 999, padding: "6px 14px", marginBottom: 18
            }}>
              ♡ 다음 공연까지
            </div>
            <div style={{ display: "flex", gap: 32, alignItems: "baseline", fontFamily: "var(--serif)" }}>
              {[["일", d], ["시간", h], ["분", m], ["초", s]].map(([lbl, v], i) =>
              <div key={lbl}>
                  <div style={{
                  fontSize: 96, fontWeight: 700, lineHeight: 1,
                  letterSpacing: "-.04em", color: i === 0 ? "#e8a370" : "#faf3e3",
                  fontVariantNumeric: "tabular-nums"
                }}>{String(v).padStart(2, "0")}</div>
                  <div style={{ fontFamily: "var(--sans)", fontSize: 12, fontWeight: 500, color: "rgba(250,243,227,.55)", marginTop: 8 }}>{lbl}</div>
                </div>
              )}
            </div>
          </div>

          <div style={{
            background: "#faf3e3", color: "var(--ink)",
            borderRadius: "var(--radius-md)", padding: 28, alignSelf: "end",
            boxShadow: "0 8px 24px rgba(0,0,0,.25)"
          }}>
            <div style={{
              display: "inline-block", background: "var(--accent)", color: "#faf3e3",
              fontFamily: "var(--mono)", fontSize: 10, fontWeight: 600,
              borderRadius: 999, padding: "4px 12px", marginBottom: 14, letterSpacing: ".1em"
            }}>NEXT UP ♡</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginBottom: 12, color: "var(--ink)" }}>
              {next.title}
              {next.role && <span style={{
                display: "inline-block", marginLeft: 10, fontSize: 12,
                fontWeight: 500, color: "var(--accent)", background: "var(--paper-warm)",
                borderRadius: 999, padding: "3px 10px", verticalAlign: "middle", fontFamily: "var(--sans)"
              }}>{next.role}</span>}
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.75 }}>
              <div>{fmtKDate(next.date)} · {next.time}</div>
              <div>{resolveVenue(next)}</div>
              {next.note && <div style={{
                display: "inline-block", marginTop: 8, color: "var(--accent)",
                background: "var(--paper-warm)", fontSize: 11, padding: "3px 10px", borderRadius: 999, fontWeight: 500
              }}>✧ {next.note}</div>}
            </div>
          </div>
        </div>
        ) : (
          <div style={{ marginTop: 56, color: "rgba(250,243,227,.5)", fontFamily: "var(--serif)", fontSize: 16, textAlign: "center" }}>
            공연 일정을 불러오는 중이에요. ♡
          </div>
        )}

        {/* List */}
        <div style={{ marginTop: 56, position: "relative", zIndex: 1 }}>
          <div style={{
            fontFamily: "var(--sans)", fontSize: 11, fontWeight: 500,
            color: "rgba(250,243,227,.5)",
            paddingBottom: 12, marginBottom: 8,
            display: "grid",
            gridTemplateColumns: "100px 80px 1.5fr 1.2fr 140px 80px",
            gap: 20
          }}>
            <div>날짜</div><div>시간</div><div>작품</div><div>공연장</div><div>비고</div><div style={{ textAlign: "right" }}>D-Day</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {upcoming.length === 0 &&
            <div style={{
              padding: "40px 20px", textAlign: "center",
              color: "rgba(250,243,227,.5)", fontFamily: "var(--serif)",
              fontSize: 16
            }}>
              예정된 공연이 아직 없어요. ♡
            </div>
            }
          {upcoming.map((s, i) => {
              const dd = daysUntil(s.date);
              return (
                <div key={i} style={{
                  display: "grid",
                  gridTemplateColumns: "100px 80px 1.5fr 1.2fr 140px 80px",
                  gap: 20, padding: "14px 18px",
                  background: "rgba(250,243,227,.04)",
                  borderRadius: "var(--radius-sm)",
                  alignItems: "center"
                }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                  {s.date.slice(5).replace("-", ".")}
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 13 }}>{s.time}</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: "19px", fontWeight: "600", width: "180px" }}>{s.title}</div>
                <div style={{ fontSize: 13, color: "rgba(250,243,227,.65)" }}>
                  {resolveVenue(s) || "—"}
                </div>
                <div>
                  {s.note ? <span style={{
                      fontFamily: "var(--sans)", fontSize: 11, fontWeight: 500,
                      color: "#e8a370", background: "rgba(184,127,77,.15)",
                      borderRadius: 999, padding: "3px 10px"
                    }}>{s.note}</span> : <span style={{ color: "rgba(250,243,227,.3)" }}>—</span>}
                </div>
                <div style={{
                    fontFamily: "var(--mono)", fontSize: 13, textAlign: "right",
                    color: "#e8a370",
                    fontVariantNumeric: "tabular-nums", fontWeight: 600
                  }}>
                  {dd === 0 ? "D-DAY" : `D-${dd}`}
                </div>
              </div>);

            })}
          </div>
        </div>
      </div>
    </section>);

}

// ─── Gallery (with lightbox) ──────────────────────────────────────────────
function Gallery() {
  const [open, setOpen] = useState(null);
  const [tab, setTab] = useState("프로필");

  const profileReal = GALLERY.filter((g) => g.tag === "PROFILE");
  const profileSlots = Math.max(profileReal.length, 4);
  const profileItems = Array.from({ length: profileSlots }, (_, i) => profileReal[i] || null);
  const etcItems = GALLERY.filter((g) => g.tag !== "PROFILE");

  const filtered = tab === "프로필"
    ? profileItems.filter(Boolean)
    : etcItems;

  useEffect(() => { setOpen(null); }, [tab]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((o) => (o + 1) % filtered.length);
      if (e.key === "ArrowLeft") setOpen((o) => (o - 1 + filtered.length) % filtered.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered]);

  const bentoSpans = [
    { gc: "span 2", gr: "span 2" },
    { gc: "span 1", gr: "span 1" },
    { gc: "span 1", gr: "span 2" },
    { gc: "span 1", gr: "span 1" },
    { gc: "span 1", gr: "span 1" },
    { gc: "span 2", gr: "span 2" },
    { gc: "span 1", gr: "span 1" },
    { gc: "span 1", gr: "span 1" },
  ];

  const TabBtn = ({ id, label }) => (
    <button
      onClick={() => setTab(id)}
      style={{
        padding: "8px 20px", border: "1px solid var(--rule)", borderRadius: 999,
        background: tab === id ? "var(--ink)" : "var(--paper)",
        color: tab === id ? "var(--paper)" : "var(--ink)",
        fontFamily: "var(--sans)", fontSize: 13, fontWeight: 500, cursor: "pointer",
        transition: "background .18s, color .18s"
      }}
    >{label}</button>
  );

  const GalleryCard = ({ g, i, style = {}, onClick, hideLabels = false }) => (
    <button key={g.id} onClick={onClick} style={{
      padding: 0, border: 0, background: "transparent", cursor: "pointer",
      position: "relative", ...style
    }}>
      <div className="ph" style={{ width: "100%", height: "100%", aspectRatio: "auto", overflow: "hidden" }}>
        {g.image
          ? <img src={g.image} alt={g.caption} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block", zIndex: 0 }} />
          : null}
        {!hideLabels && <span className="cnr" style={{ zIndex: 1 }}>{g.id}.jpg</span>}
        {!hideLabels && <span className="lbl" style={{ zIndex: 1 }}>{g.tag}</span>}
      </div>
      <div style={{
        position: "absolute", inset: 0, opacity: 0, transition: "opacity .2s",
        background: "rgba(42,29,18,.6)", color: "var(--paper)",
        display: "flex", alignItems: "flex-end", padding: 16,
        fontFamily: "var(--serif)", fontSize: 16, fontWeight: 500
      }}
      onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
      onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
        {g.caption} →
      </div>
    </button>
  );

  return (
    <section id="gallery" style={{ padding: "120px 32px 120px", maxWidth: 1280, margin: "0 auto" }}>
      <SectionHeader
        chapter="04"
        label="Gallery"
        title="갤러리"
        right={
          <div style={{ display: "flex", gap: 8 }}>
            <TabBtn id="프로필" label="프로필" />
            <TabBtn id="기타" label="기타" />
          </div>
        }
      />

      {/* 프로필 tab — uniform 3/4 grid, 17 slots */}
      {tab === "프로필" && (
        <div style={{
          marginTop: 32,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16
        }}>
          {profileItems.map((g, i) =>
            g ? (
              <div key={g.id} style={{ aspectRatio: "3 / 4", position: "relative" }}>
                <GalleryCard g={g} i={profileItems.slice(0, i + 1).filter(Boolean).length - 1} style={{ width: "100%", height: "100%" }} onClick={() => setOpen(filtered.indexOf(g))} hideLabels />
              </div>
            ) : (
              <div key={`empty-${i}`} style={{
                aspectRatio: "3 / 4",
                border: "1px dashed var(--rule)",
                borderRadius: "var(--radius-sm)",
                background: "var(--paper-warm)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: 6,
                color: "var(--ink-soft)"
              }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".14em" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            )
          )}
        </div>
      )}

      {/* 기타 tab — 준비중 */}
      {tab === "기타" && (
        <div style={{
          marginTop: 56, padding: "80px 0",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          borderTop: "1px dashed var(--rule)"
        }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".22em", color: "var(--ink-soft)", textTransform: "uppercase" }}>Coming soon</span>
          <span style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 600, color: "var(--ink)" }}>준비중입니다</span>
        </div>
      )}

      {open !== null &&
      <div onClick={() => setOpen(null)} style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(20,14,9,.92)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 40, backdropFilter: "blur(8px)"
      }}>
        <button onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + filtered.length) % filtered.length); }} style={{
          position: "absolute", left: 32, top: "50%", transform: "translateY(-50%)",
          background: "transparent", color: "var(--paper)", border: ".5px solid rgba(251,244,227,.4)",
          width: 48, height: 48, borderRadius: "50%", fontSize: 18
        }}>←</button>
        <button onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % filtered.length); }} style={{
          position: "absolute", right: 32, top: "50%", transform: "translateY(-50%)",
          background: "transparent", color: "var(--paper)", border: ".5px solid rgba(251,244,227,.4)",
          width: 48, height: 48, borderRadius: "50%", fontSize: 18
        }}>→</button>
        <button onClick={() => setOpen(null)} style={{
          position: "absolute", right: 32, top: 32,
          background: "transparent", color: "var(--paper)",
          border: ".5px solid rgba(251,244,227,.4)", padding: "6px 14px",
          fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".1em"
        }}>ESC ×</button>

        <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 900, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ position: "relative", maxHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {filtered[open]?.image
              ? <img src={filtered[open].image} alt={filtered[open].caption} style={{ maxHeight: "75vh", maxWidth: "100%", objectFit: "contain", display: "block", borderRadius: 4 }} />
              : <div style={{
                  width: 320, height: 420,
                  background: `repeating-linear-gradient(135deg, rgba(251,244,227,.08) 0 14px, transparent 14px 28px), rgba(251,244,227,.04)`,
                  border: ".5px solid rgba(251,244,227,.2)", borderRadius: 4,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "rgba(251,244,227,.4)", fontFamily: "var(--mono)", fontSize: 12
                }}>{filtered[open]?.id}.jpg</div>
            }
          </div>
          <div style={{ marginTop: 14, color: "var(--paper)", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".14em", color: "rgba(251,244,227,.4)" }}>
              {String(open + 1).padStart(2, "0")} / {String(filtered.length).padStart(2, "0")}
            </div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 500 }}>{filtered[open]?.caption}</div>
          </div>
        </div>
      </div>
      }
    </section>);
}

// ─── Scroll to top ────────────────────────────────────────────────────────
function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const on = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", on, { passive: true });
    on();
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{
        position: "fixed", bottom: 36, right: 36, zIndex: 50,
        width: 44, height: 44, borderRadius: "50%",
        border: "1px solid var(--rule)",
        background: "var(--paper)",
        color: "var(--ink)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        boxShadow: "var(--shadow-md)",
        fontFamily: "var(--mono)", fontSize: 16,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity .25s, background .18s, color .18s, border-color .18s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--accent)";
        e.currentTarget.style.color = "var(--paper)";
        e.currentTarget.style.borderColor = "var(--accent)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--paper)";
        e.currentTarget.style.color = "var(--ink)";
        e.currentTarget.style.borderColor = "var(--rule)";
      }}
      aria-label="맨 위로"
    >
      ↑
    </button>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      borderTop: ".5px solid var(--rule)",
      padding: "40px 32px",
      maxWidth: 1280, margin: "0 auto",
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
      fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".12em",
      color: "var(--ink-soft)", textTransform: "uppercase"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src="images/떡국.png"
            alt="떡국"
            style={{ width: 60, height: "auto" }}
          />
          <div style={{
            fontFamily: "var(--mono)", fontWeight: 600, fontSize: 16,
            color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".18em"
          }}>
            KOOKOOKI
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 12, whiteSpace: "nowrap" }}>
          문의 · <a href="https://instagram.com/kook_ooki" target="_blank" rel="noreferrer" style={{ color: "var(--accent)", textDecoration: "none", letterSpacing: ".06em" }}>@kook_ooki</a>
        </div>
      </div>
    </footer>);

}

Object.assign(window, { Nav, Hero, About, Works, Schedule, Gallery, Footer, SectionHeader, PH, ConcertsStrip, ScrollToTop });