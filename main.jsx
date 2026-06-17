// app.jsx — root + Tweaks

const SUPABASE_URL = "https://wacptqjmyabpcluiqbik.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_MNjxC1iwNMKk8EQQ_jDahg_eFgW_o-Z";

// 초기값 — Supabase 로딩 전 첫 렌더에서 undefined 에러 방지
window.PROFILE   = window.PROFILE   || { nameKo: "", nameEn: "", debutDate: "", birthDate: "", mbti: "", social: {}, facts: [], notes: [], galleryId: null };
window.WORKS     = window.WORKS     || [];
window.SCHEDULE  = window.SCHEDULE  || [];
window.GALLERY   = window.GALLERY   || [];
window.CONCERTS  = window.CONCERTS  || [];

function normalizeProfile(profile) {
  if (!profile) return window.PROFILE || {};
  return {
    ...profile,
    nameKo:    profile.name_ko    || profile.nameKo    || "",
    nameEn:    profile.name_en    || profile.nameEn    || "",
    debutDate: profile.debut_date || profile.debutDate || "",
    birthDate: profile.birth_date || profile.birthDate || "",
    mbti:      profile.mbti       || "",
    social:    profile.social     || {},
    notes:     profile.notes      || [],
    galleryId: profile.gallery_id || profile.galleryId || null,
  };
}

function App() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!window.supabase) {
      setLoaded(true);
      return;
    }

    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    Promise.all([
      client.from("profile").select("id, name_ko, name_en, debut_date, birth_date, social, mbti, gallery_id").limit(1),
      client.from("works").select("*").order("year", { ascending: false }),
      client.from("schedule").select("*").order("date", { ascending: true }),
      client.from("gallery").select("*").order("load_dtm", { ascending: false }),
      client.from("concerts").select("*").order("date", { ascending: false }),
    ]).then(([profile, works, schedule, gallery, concerts]) => {
      if (!profile.error && profile.data?.[0])    window.PROFILE  = normalizeProfile(profile.data[0]);
      if (!works.error && works.data?.length)      window.WORKS    = works.data;
      if (!schedule.error && schedule.data?.length) window.SCHEDULE = schedule.data;
      if (!concerts.error && concerts.data?.length) window.CONCERTS = concerts.data;
      if (!gallery.error && gallery.data?.length) {
        const worksData = window.WORKS || [];
        const runStart = (run = "") => {
          const m = String(run || "").match(/\d{4}[.-]\d{1,2}[.-]\d{1,2}/);
          return m ? m[0].replace(/\./g, "-") : "";
        };
        window.GALLERY = gallery.data.map((g) => {
          const work = worksData.find((w) => w.id === g.id);
          const S3 = "https://kookooki-992382653551-ap-northeast-2-an.s3.ap-northeast-2.amazonaws.com";
          return {
            ...g,
            image: g.image && !g.image.startsWith("http") ? `${S3}/${g.image}` : g.image,
            _run: work?.run || "",
            caption: work
              ? `〈${work.title}〉 ${work.role}${work.year ? ` · ${work.year}` : ""}`
              : (g.caption || g.id),
          };
        }).sort((a, b) => (b.load_dtm || "").localeCompare(a.load_dtm || ""));
      }
      setLoaded(true);
    }).catch((error) => {
      console.error("Supabase load error", error);
      setLoaded(true);
    });
  }, []);

  // Apply palette to CSS variables
  React.useEffect(() => {
    const [bg, ink, accent] = t.palette;
    const root = document.documentElement;
    root.style.setProperty("--bg", bg);
    root.style.setProperty("--ink", ink);
    root.style.setProperty("--accent", accent);
    // derive soft variants
    root.style.setProperty("--ink-soft", mix(ink, bg, .45));
    root.style.setProperty("--bg-soft", mix(bg, ink, .12));
    root.style.setProperty("--paper", mix(bg, "#ffffff", .35));
    root.style.setProperty("--rule", ink + "2e");
  }, [t.palette]);

  // Grain overlay
  const grainStyle = t.grain ? {
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1,
    backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .35 0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.5'/></svg>`
    )}")`,
    mixBlendMode: "multiply", opacity: .18,
  } : { display: "none" };

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {!loaded && <div style={{ position: "fixed", inset: 0, zIndex: 99, background: "rgba(246,241,230,.85)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--sans)", color: "var(--ink-soft)" }}>로딩중…</div>}
      <div style={grainStyle} aria-hidden="true"></div>

      <Nav />
      <Hero
        variant={t.heroVariant}
        nameSize={t.heroNameSize}
        serifFamily={t.serifFamily}
      />
      <About />
      <Schedule />
      <Works />
      <Gallery />
      <Footer />
      <ScrollToTop />

      <TweaksPanel>
        <TweakSection label="팔레트" />
        <TweakColor
          label="컬러 팔레트"
          value={t.palette}
          options={[
            ["#f3e9d5", "#2a1d12", "#b6512e"], // 크림 + 갈색 + 테라코타 (기본)
            ["#ede4d3", "#1c1a18", "#7a5a3a"], // 페이퍼 + 잉크 + 카멜
            ["#e8dcc4", "#3d2817", "#c97b3b"], // 따뜻한 모카
            ["#f6f1e6", "#2b2118", "#8b5e3c"], // 라이트 베이지
            ["#dfd1b8", "#1f1812", "#9b3b1f"], // 진한 카키 베이지
            ["#1f1814", "#f3e9d5", "#d6864f"], // 다크 리버스
          ]}
          onChange={(v) => setTweak("palette", v)}
        />

        <TweakSection label="타이포그래피" />
        <TweakRadio
          label="제목 서체"
          value={t.serifFamily}
          options={["Noto Serif KR", "Gowun Batang", "Nanum Myeongjo"]}
          onChange={(v) => setTweak("serifFamily", v)}
        />
        <TweakSlider
          label="이름 크기"
          value={t.heroNameSize}
          min={140} max={300} step={10} unit="px"
          onChange={(v) => setTweak("heroNameSize", v)}
        />

        <TweakSection label="히어로 레이아웃" />
        <TweakRadio
          label="포트레이트 위치"
          value={t.heroVariant}
          options={["cover", "portrait-left"]}
          onChange={(v) => setTweak("heroVariant", v)}
        />

        <TweakSection label="질감" />
        <TweakToggle
          label="필름 그레인"
          value={t.grain}
          onChange={(v) => setTweak("grain", v)}
        />
      </TweaksPanel>
    </div>
  );
}

// Tiny color mixer (hex only)
function mix(a, b, t) {
  const pa = parseHex(a), pb = parseHex(b);
  if (!pa || !pb) return a;
  const r = Math.round(pa[0] * (1 - t) + pb[0] * t);
  const g = Math.round(pa[1] * (1 - t) + pb[1] * t);
  const bl = Math.round(pa[2] * (1 - t) + pb[2] * t);
  return "#" + [r, g, bl].map(x => x.toString(16).padStart(2, "0")).join("");
}
function parseHex(h) {
  if (!h) return null;
  let s = h.replace("#", "");
  if (s.length === 3) s = s.split("").map(c => c + c).join("");
  if (s.length !== 6) return null;
  return [0,2,4].map(i => parseInt(s.slice(i, i+2), 16));
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
