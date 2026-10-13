// ===== 食光机 · 应用逻辑 =====
(function () {
  "use strict";

  const LS_REVIEWS = "sg_reviews_v1";
  const LS_PREFS = "sg_prefs_v1";
  const LS_FAV = "sg_fav_v1";

  // ---------- 本地存储 ----------
  function loadJSON(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function saveJSON(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

  let userReviews = loadJSON(LS_REVIEWS, []);      // 用户发布的点评
  let prefs = loadJSON(LS_PREFS, { likes: [], budget: 25, spicy: 3, name: "同学" });
  let favs = loadJSON(LS_FAV, []);                 // 收藏的菜品id

  // ---------- 索引 ----------
  const winById = {}; WINDOWS.forEach(w => winById[w.id] = w);
  const canteenById = {}; CANTEENS.forEach(c => canteenById[c.id] = c);
  const dishById = {}; DISHES.forEach(d => dishById[d.id] = d);

  function allReviews(dishId) {
    const seed = SEED_REVIEWS.filter(r => r.dish === dishId);
    const mine = userReviews.filter(r => r.dish === dishId).map(r => Object.assign({}, r, { mine: true }));
    return mine.concat(seed).sort((a, b) => (b.time || "").localeCompare(a.time || ""));
  }

  // 综合评分：种子 base/count 与用户新点评加权
  function dishStats(dish) {
    const mine = userReviews.filter(r => r.dish === dish.id);
    let sum = dish.base * dish.count, cnt = dish.count;
    mine.forEach(r => { sum += r.stars; cnt += 1; });
    const rating = cnt ? sum / cnt : dish.base;
    // 维度均分
    const rs = allReviews(dish.id);
    const dim = (k) => {
      const arr = rs.map(r => r[k]).filter(v => typeof v === "number");
      return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : rating;
    };
    return {
      rating: Math.round(rating * 10) / 10,
      count: cnt,
      taste: Math.round(dim("taste") * 10) / 10,
      portion: Math.round(dim("portion") * 10) / 10,
      value: Math.round(dim("value") * 10) / 10,
      wait: Math.round(dim("wait") * 10) / 10,
      reviewCount: rs.length,
    };
  }

  function windowStats(w) {
    const dishes = DISHES.filter(d => d.w === w.id);
    if (!dishes.length) return { rating: 0, count: 0, dishes: 0 };
    let sum = 0, cnt = 0;
    dishes.forEach(d => { const s = dishStats(d); sum += s.rating * s.count; cnt += s.count; });
    return { rating: cnt ? Math.round((sum / cnt) * 10) / 10 : 0, count: cnt, dishes: dishes.length };
  }

  function canteenStats(c) {
    const wins = WINDOWS.filter(w => w.canteen === c.id);
    const dishes = DISHES.filter(d => wins.some(w => w.id === d.w));
    let sum = 0, cnt = 0;
    dishes.forEach(d => { const s = dishStats(d); sum += s.rating * s.count; cnt += s.count; });
    return { rating: cnt ? Math.round((sum / cnt) * 10) / 10 : 0, windows: wins.length, dishes: dishes.length, count: cnt };
  }

  // ---------- 小工具 ----------
  const SPICY_LABEL = ["不辣", "微辣", "中辣", "重辣"];
  function starStr(n, max = 5) { const full = Math.round(n); return "★".repeat(full) + "☆".repeat(max - full); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])); }
  function queueLabel(q) { return q === 1 ? "畅通" : q === 2 ? "一般" : "爆满"; }
  function now() {
    const d = new Date(), p = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }
  function isFav(id) { return favs.indexOf(id) >= 0; }

  function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._timer); t._timer = setTimeout(() => t.classList.remove("show"), 1800);
  }

  // 菜品卡片 HTML
  function dishCard(d, opts) {
    opts = opts || {};
    const s = dishStats(d), w = winById[d.w];
    const avoid = s.rating < 3.3;
    const hot = s.count >= 200;
    return `
    <div class="dish" data-open-dish="${d.id}">
      <div class="thumb">${d.emoji}</div>
      <div class="info">
        <div class="name">${esc(d.name)}
          ${d.isNew ? '<span class="badge new">新菜</span>' : ""}
          ${avoid ? '<span class="badge avoid">避雷</span>' : hot ? '<span class="badge hot">人气</span>' : ""}
        </div>
        <div class="win">${w.emoji} ${esc(w.name)} · ${esc(canteenById[w.canteen].name.split("（")[0])}</div>
        <div class="meta">
          <span class="rating ${avoid ? "low" : ""}"><span class="star">★</span>${s.rating}<span class="cnt">(${s.count})</span></span>
          <span class="price"><small>¥</small>${d.price}</span>
          ${d.spicy ? `<span class="tag spicy">${SPICY_LABEL[d.spicy]}</span>` : ""}
          ${opts.showQueue ? `<span class="queue-dot"><i class="q${w.queue}"></i>${queueLabel(w.queue)}</span>` : ""}
        </div>
      </div>
    </div>`;
  }

  function rankRow(i, d, subText) {
    const s = dishStats(d);
    return `
    <div class="rank-item" data-open-dish="${d.id}">
      <div class="rank-no">${i}</div>
      <div class="thumb">${d.emoji}</div>
      <div class="info">
        <div class="nm">${esc(d.name)}</div>
        <div class="sub">${subText}</div>
      </div>
      <div class="rating ${s.rating < 3.3 ? "low" : ""}"><span class="star">★</span>${s.rating}</div>
    </div>`;
  }

  // ---------- 视图切换 ----------
  let currentView = "home";
  const views = ["home", "canteen", "rank", "me", "detail"];
  function switchView(name) {
    currentView = name;
    views.forEach(v => document.getElementById("view-" + v).classList.toggle("active", v === name));
    document.querySelectorAll(".tabbar .tab[data-nav]").forEach(t => t.classList.toggle("on", t.dataset.nav === name));
    // 详情页隐藏搜索栏
    document.getElementById("searchBar").style.display = name === "detail" ? "none" : "flex";
    window.scrollTo(0, 0);
  }

  // ---------- 首页 ----------
  function renderHome() {
    const top = DISHES.map(d => ({ d, s: dishStats(d) }))
      .filter(x => x.s.rating >= 4.4).sort((a, b) => b.s.rating - a.s.rating || b.s.count - a.s.count).slice(0, 4);
    const news = DISHES.filter(d => d.isNew).slice(0, 4);
    const avoid = DISHES.map(d => ({ d, s: dishStats(d) })).filter(x => x.s.rating < 3.3).sort((a, b) => a.s.rating - b.s.rating).slice(0, 3);

    document.getElementById("view-home").innerHTML = `
      <div class="quick">
        <div class="q" data-nav-go="rank"><div class="ico">🏆</div><div class="txt">好评榜</div></div>
        <div class="q" data-action="spin"><div class="ico">🎲</div><div class="txt">吃啥</div></div>
        <div class="q" data-nav-go="canteen"><div class="ico">🍚</div><div class="txt">逛食堂</div></div>
        <div class="q" data-action="avoid"><div class="ico">⚠️</div><div class="txt">避雷区</div></div>
      </div>

      <div class="hero">
        <div class="big">🎲</div>
        <div>
          <div class="t">今天吃什么？</div>
          <div class="d">按你的口味智能抽一道，治好选择困难</div>
        </div>
        <button class="btn" data-action="spin">帮我选</button>
      </div>

      <div class="section-title">🔥 高分好评榜 <span class="more" data-nav-go="rank">全部 ›</span></div>
      ${top.map(x => dishCard(x.d, { showQueue: true })).join("")}

      <div class="section-title">✨ 新菜上架</div>
      <div class="chips">
        ${news.map(d => {
          const s = dishStats(d);
          return `<div class="chip" data-open-dish="${d.id}" style="display:flex;align-items:center;gap:6px">
            <span style="font-size:18px">${d.emoji}</span>
            <span>${esc(d.name)}</span>
            <span style="color:var(--gold)">★${s.rating}</span>
          </div>`;
        }).join("")}
      </div>

      ${avoid.length ? `
      <div class="section-title" style="margin-top:18px">⚠️ 近期踩雷预警</div>
      <div class="card" style="padding:6px 14px">
        ${avoid.map(x => `
          <div class="rank-item" data-open-dish="${x.d.id}">
            <div class="thumb" style="background:#fdecea">${x.d.emoji}</div>
            <div class="info">
              <div class="nm">${esc(x.d.name)}</div>
              <div class="sub" style="color:var(--red)">${esc(winById[x.d.w].name)} · 大家反馈${x.s.rating < 3 ? "较差" : "一般"}</div>
            </div>
            <div class="rating low"><span class="star">★</span>${x.s.rating}</div>
          </div>`).join("")}
      </div>` : ""}
    `;
  }

  // ---------- 食堂页 ----------
  let canteenDrill = null; // 当前展开的食堂id
  function renderCanteen() {
    const el = document.getElementById("view-canteen");
    if (!canteenDrill) {
      el.innerHTML = `
        <div class="section-title">全校食堂 <span class="more" style="color:var(--muted);font-weight:400">${CANTEENS.length}个</span></div>
        ${CANTEENS.map(c => {
          const s = canteenStats(c);
          return `
          <div class="canteen-card" data-open-canteen="${c.id}">
            <div class="h">
              <div class="emoji">${c.emoji}</div>
              <div>
                <div class="nm">${esc(c.name)}</div>
                <div class="loc">📍 ${esc(c.location)} · 🕐 ${c.hours}</div>
              </div>
            </div>
            <div class="stats">
              <div class="stat"><div class="v">★${s.rating}</div><div class="l">综合评分</div></div>
              <div class="stat"><div class="v">${s.windows}</div><div class="l">窗口</div></div>
              <div class="stat"><div class="v">${s.dishes}</div><div class="l">在架菜品</div></div>
              <div class="stat"><div class="v">${s.count}</div><div class="l">累计点评</div></div>
            </div>
          </div>`;
        }).join("")}
      `;
      return;
    }
    const c = canteenById[canteenDrill];
    const wins = WINDOWS.filter(w => w.canteen === c.id);
    el.innerHTML = `
      <button class="btn-ghost" style="margin-bottom:14px" data-open-canteen="">‹ 返回全部食堂</button>
      <div class="section-title">${c.emoji} ${esc(c.name)}</div>
      ${wins.map(w => {
        const ws = windowStats(w);
        const dishes = DISHES.filter(d => d.w === w.id).sort((a, b) => dishStats(b).rating - dishStats(a).rating);
        return `
        <div class="card">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
            <span style="font-size:26px">${w.emoji}</span>
            <div style="flex:1">
              <div style="font-weight:700;font-size:15px">${esc(w.name)}
                <span class="tag" style="margin-left:4px">${esc(w.cuisine)}</span>
              </div>
              <div style="font-size:12px;color:var(--muted);margin-top:2px">
                <span class="rating" style="font-size:12px"><span class="star">★</span>${ws.rating}</span>
                · ${ws.dishes}道菜
                · <span class="queue-dot"><i class="q${w.queue}"></i>排队${queueLabel(w.queue)}</span>
              </div>
            </div>
          </div>
          <div style="margin-top:10px">
            ${dishes.map(d => dishCard(d)).join("")}
          </div>
        </div>`;
      }).join("")}
    `;
  }

  // ---------- 排行页 ----------
  let rankTab = "praise";
  function renderRank() {
    const el = document.getElementById("view-rank");
    const tabs = [
      { k: "praise", t: "好评榜" }, { k: "value", t: "性价比" },
      { k: "hot", t: "人气榜" }, { k: "avoid", t: "避雷榜" }, { k: "new", t: "新菜" },
    ];
    let list = [], subFn = null;
    const withStats = DISHES.map(d => ({ d, s: dishStats(d) }));
    if (rankTab === "praise") { list = withStats.slice().sort((a, b) => b.s.rating - a.s.rating || b.s.count - a.s.count); subFn = x => `${esc(winById[x.d.w].name)} · ${x.s.count}人点评`; }
    if (rankTab === "value") { list = withStats.slice().map(x => ({ ...x, v: x.s.rating / Math.max(x.d.price, 1) * 10 })).sort((a, b) => b.v - a.v); subFn = x => `¥${x.d.price} · ★${x.s.rating} · 每元${(x.s.rating / x.d.price * 10).toFixed(1)}分`; }
    if (rankTab === "hot") { list = withStats.slice().sort((a, b) => b.s.count - a.s.count); subFn = x => `${x.s.count}人点评 · ${esc(winById[x.d.w].name)}`; }
    if (rankTab === "avoid") { list = withStats.slice().sort((a, b) => a.s.rating - b.s.rating).slice(0, 8); subFn = x => `${esc(winById[x.d.w].name)} · 评分偏低，谨慎尝试`; }
    if (rankTab === "new") { list = withStats.filter(x => x.d.isNew).sort((a, b) => b.s.rating - a.s.rating); subFn = x => `新品 · ${esc(winById[x.d.w].name)}`; }

    el.innerHTML = `
      <div class="pill-nav">
        ${tabs.map(t => `<button class="${rankTab === t.k ? "on" : ""}" data-rank-tab="${t.k}">${t.t}</button>`).join("")}
      </div>
      ${rankTab === "avoid" ? '<div class="divider-note">⚠️ 以下为近期评分较低的菜品，帮你避雷</div>' : ""}
      <div class="card" style="padding:4px 14px">
        ${list.length ? list.map((x, i) => rankRow(i + 1, x.d, subFn(x))).join("") : '<div class="empty"><span class="ico">🍽️</span>暂无数据</div>'}
      </div>
    `;
  }

  // ---------- 我的 ----------
  let meTab = "prefs";
  function renderMe() {
    const el = document.getElementById("view-me");
    const mineCount = userReviews.length;
    const nav = `
      <div class="pill-nav">
        <button class="${meTab === "prefs" ? "on" : ""}" data-me-tab="prefs">口味偏好</button>
        <button class="${meTab === "reviews" ? "on" : ""}" data-me-tab="reviews">我的点评(${mineCount})</button>
        <button class="${meTab === "fav" ? "on" : ""}" data-me-tab="fav">收藏(${favs.length})</button>
      </div>`;

    if (meTab === "prefs") {
      el.innerHTML = nav + `
        <div class="card">
          <div class="field" style="margin-bottom:14px">
            <label>你的昵称</label>
            <input class="txt" id="prefName" value="${esc(prefs.name)}" placeholder="怎么称呼你" />
          </div>
          <div class="field">
            <label>喜欢的口味（可多选，用于智能推荐）</label>
            <div id="prefTags">
              ${TASTE_TAGS.map(t => `<span class="tag ${prefs.likes.indexOf(t) >= 0 ? "on" : ""}" data-pref-tag="${t}" style="cursor:pointer;padding:6px 12px;font-size:13px">${t}</span>`).join("")}
            </div>
          </div>
          <div class="field">
            <label>单餐预算：¥<span id="budgetVal">${prefs.budget}</span></label>
            <input type="range" id="prefBudget" min="5" max="50" step="1" value="${prefs.budget}" style="width:100%" />
          </div>
          <div class="field">
            <label>能吃辣：<span id="spicyVal">${SPICY_LABEL[prefs.spicy]}</span>及以下</label>
            <input type="range" id="prefSpicy" min="0" max="3" step="1" value="${prefs.spicy}" style="width:100%" />
          </div>
          <button class="btn-primary" id="savePrefs">保存偏好</button>
        </div>
        <div class="divider-note">偏好保存在你的浏览器本地，仅用于「今天吃什么」智能推荐</div>
      `;
      const b = document.getElementById("prefBudget"), bv = document.getElementById("budgetVal");
      b.oninput = () => bv.textContent = b.value;
      const sp = document.getElementById("prefSpicy"), sv = document.getElementById("spicyVal");
      sp.oninput = () => sv.textContent = SPICY_LABEL[+sp.value];
      document.getElementById("savePrefs").onclick = () => {
        prefs.name = document.getElementById("prefName").value.trim() || "同学";
        prefs.budget = +b.value; prefs.spicy = +sp.value;
        saveJSON(LS_PREFS, prefs); toast("偏好已保存 ✅");
      };
      return;
    }

    if (meTab === "reviews") {
      if (!userReviews.length) {
        el.innerHTML = nav + `<div class="empty"><span class="ico">📝</span>你还没有发布过点评<br/><span style="font-size:12px">去菜品详情页写下第一条评价吧</span></div>`;
        return;
      }
      el.innerHTML = nav + userReviews.slice().reverse().map(r => {
        const d = dishById[r.dish]; if (!d) return "";
        return `
        <div class="card">
          <div style="display:flex;align-items:center;gap:10px;cursor:pointer" data-open-dish="${d.id}">
            <div class="thumb" style="width:44px;height:44px;font-size:24px;border-radius:10px;background:var(--brand-soft);display:flex;align-items:center;justify-content:center">${d.emoji}</div>
            <div style="flex:1"><div style="font-weight:700">${esc(d.name)}</div>
            <div style="font-size:11px;color:var(--muted)">${esc(winById[d.w].name)} · ${r.time}</div></div>
            <div class="stars" style="color:var(--gold)">${starStr(r.stars)}</div>
          </div>
          <div style="font-size:14px;margin-top:8px;color:#333">${esc(r.text)}</div>
          <button class="btn-ghost" style="margin-top:10px;padding:8px" data-del-review="${r.id}">删除这条点评</button>
        </div>`;
      }).join("");
      return;
    }

    // 收藏
    const favDishes = favs.map(id => dishById[id]).filter(Boolean);
    el.innerHTML = nav + (favDishes.length
      ? favDishes.map(d => dishCard(d)).join("")
      : `<div class="empty"><span class="ico">⭐</span>还没有收藏<br/><span style="font-size:12px">在菜品详情页点右上角星标即可收藏</span></div>`);
  }

  // ---------- 详情页 ----------
  function renderDetail(dishId) {
    const d = dishById[dishId]; if (!d) { switchView("home"); return; }
    const w = winById[d.w], c = canteenById[w.canteen];
    const s = dishStats(d);
    const rs = allReviews(dishId);
    const el = document.getElementById("view-detail");

    const barRow = (lab, v) => `<div class="bar-row"><span class="lab">${lab}</span><div class="bar-track"><div class="bar-fill" style="width:${v / 5 * 100}%"></div></div><span style="width:26px;text-align:right;color:var(--brand);font-weight:600">${v}</span></div>`;

    el.innerHTML = `
      <button class="back-btn" data-back>‹ 返回</button>
      <div class="detail-hero">
        <div style="text-align:right;margin-top:-8px">
          <span style="font-size:24px;cursor:pointer" data-fav="${d.id}">${isFav(d.id) ? "⭐" : "☆"}</span>
        </div>
        <div class="emoji">${d.emoji}</div>
        <div class="nm">${esc(d.name)} ${d.isNew ? '<span class="badge new">新菜</span>' : ""}</div>
        <div class="win" data-open-canteen="${c.id}" style="cursor:pointer;text-decoration:underline">${c.emoji} ${esc(c.name)} › ${w.emoji} ${esc(w.name)}</div>
        <div class="price">¥${d.price}</div>
        <div style="margin-top:8px">
          ${d.spicy ? `<span class="tag spicy">${SPICY_LABEL[d.spicy]}</span>` : `<span class="tag">不辣</span>`}
          <span class="queue-dot" style="margin-left:6px"><i class="q${w.queue}"></i>排队${queueLabel(w.queue)}</span>
        </div>
        <div style="margin-top:10px">
          ${d.tags.map(t => `<span class="tag">${esc(t)}</span>`).join("")}
        </div>
        <div class="score-box">
          <div class="s"><div class="big-score">${s.rating}</div><div class="l">${s.count}人评分</div></div>
          <div class="s" style="text-align:left;flex:1;justify-content:center">
            ${barRow("味道", s.taste)}${barRow("份量", s.portion)}${barRow("性价比", s.value)}${barRow("排队快", s.wait)}
          </div>
        </div>
      </div>

      <div class="card">
        <div style="font-size:13px;color:var(--muted);margin-bottom:4px">菜品介绍</div>
        <div style="font-size:14px">${esc(d.desc)}</div>
      </div>

      <button class="btn-primary" style="margin-bottom:16px" data-review="${d.id}">✍️ 我要点评这道菜</button>

      <div class="section-title">全部点评 <span class="more" style="color:var(--muted);font-weight:400">${rs.length}条</span></div>
      <div class="card">
        ${rs.length ? rs.map(r => reviewHTML(r)).join("") : '<div class="empty"><span class="ico">💬</span>还没有点评，来做第一个吃螃蟹的人</div>'}
      </div>
    `;
  }

  function reviewHTML(r) {
    const dim = [];
    if (r.taste) dim.push(`味道${r.taste}`); if (r.portion) dim.push(`份量${r.portion}`);
    if (r.value) dim.push(`性价比${r.value}`); if (r.wait) dim.push(`排队快${r.wait}`);
    return `
    <div class="review ${r.mine ? "mine" : ""}">
      <div class="rh">
        <div class="avatar">${r.mine ? "🙂" : "👤"}</div>
        <div>
          <div class="un">${esc(r.user)} ${r.mine ? '<span class="badge new">我</span>' : ""}</div>
          <div class="stars">${starStr(r.stars)}</div>
        </div>
        <div class="time">${esc(r.time || "")}</div>
      </div>
      <div class="txt">${esc(r.text)}</div>
      ${r.tags && r.tags.length ? `<div style="margin-top:6px">${r.tags.map(t => `<span class="tag">${esc(t)}</span>`).join("")}</div>` : ""}
      ${dim.length ? `<div class="dims">${dim.join(" · ")}</div>` : ""}
      <div class="likes" data-like="${r.id}">👍 有用 ${r.likes || 0}</div>
    </div>`;
  }

  // ---------- 「今天吃什么」推荐 ----------
  function recommendScore(d) {
    const s = dishStats(d), w = winById[d.w];
    let score = s.rating * 18, reasons = [];
    score += (s.count >= 150 ? 6 : 0);
    if (d.isNew) { score += 8; reasons.push("新菜尝鲜"); }
    if (d.price <= prefs.budget) { score += 6; } else { score -= 40; reasons.push("超预算"); }
    if (d.spicy <= prefs.spicy) { score += 4; } else { score -= 35; }
    const cuisineHit = prefs.likes.indexOf(w.cuisine) >= 0;
    const tagHit = d.tags.some(t => prefs.likes.indexOf(t) >= 0);
    if (cuisineHit || tagHit) { score += 16; reasons.push("合你口味"); }
    if (s.rating >= 4.5) reasons.push("高分好评");
    if (s.value && s.value >= 4.5) reasons.push("性价比高");
    if (w.queue === 1) { score += 4; reasons.push("不用排队"); }
    if (s.rating < 3.3) score -= 50;
    return { score, reason: reasons.slice(0, 2).join(" · ") || "口碑不错" };
  }

  function openSpin() {
    const scored = DISHES.map(d => ({ d, r: recommendScore(d) })).filter(x => x.r.score > 0);
    scored.sort((a, b) => b.r.score - a.r.score);
    const pool = scored.slice(0, Math.min(8, scored.length));
    const mask = document.getElementById("mask");

    function show(result) {
      if (!result) {
        mask.innerHTML = `<div class="sheet">
          <h3>🎲 今天吃什么</h3>
          <div class="desc">结合你的口味偏好（预算¥${prefs.budget} · ${SPICY_LABEL[prefs.spicy]}以内 · ${prefs.likes.length ? prefs.likes.join("/") : "不限口味"}）智能推荐</div>
          <div style="text-align:center;padding:20px 0"><div style="font-size:60px">🍽️</div>
            <div style="color:var(--muted);font-size:13px;margin-top:10px">选择困难？让我帮你决定！</div></div>
          <button class="btn-primary" id="doSpin">开始抽一道</button>
          <button class="btn-ghost" style="margin-top:10px" data-close>再想想</button>
        </div>`;
        mask.classList.add("show");
        document.getElementById("doSpin").onclick = () => {
          // 加权随机
          const total = pool.reduce((a, x) => a + Math.max(x.r.score, 1), 0);
          let rnd = Math.random() * total, pick = pool[0];
          for (const x of pool) { rnd -= Math.max(x.r.score, 1); if (rnd <= 0) { pick = x; break; } }
          show(pick);
        };
        return;
      }
      const d = result.d, s = dishStats(d), w = winById[d.w];
      mask.innerHTML = `<div class="sheet">
        <div class="spin-result">
          <div style="font-size:13px;color:var(--muted)">今天就吃它 👇</div>
          <div class="emoji">${d.emoji}</div>
          <div class="nm">${esc(d.name)}</div>
          <div style="color:var(--muted);font-size:13px;margin-top:6px">${w.emoji} ${esc(w.name)} · ${esc(canteenById[w.canteen].name.split("（")[0])}</div>
          <div style="margin-top:10px"><span class="rating"><span class="star">★</span>${s.rating}</span> <span class="price" style="margin-left:8px">¥${d.price}</span></div>
          <div class="why">💡 ${esc(result.r.reason)}</div>
        </div>
        <button class="btn-primary" id="goDish">看看详情</button>
        <div style="display:flex;gap:10px;margin-top:10px">
          <button class="btn-ghost" id="reSpin">换一个</button>
          <button class="btn-ghost" data-close>就它了</button>
        </div>
      </div>`;
      mask.classList.add("show");
      document.getElementById("goDish").onclick = () => { closeMask(); openDish(d.id); };
      document.getElementById("reSpin").onclick = () => show(null);
    }
    show(null);
  }

  // ---------- 点评弹窗 ----------
  function openReviewSheet(dishId) {
    const d = dishById[dishId];
    const mask = document.getElementById("mask");
    const state = { stars: 0, taste: 0, portion: 0, value: 0, wait: 0, tags: [] };
    const quickTags = ["味道赞", "性价比高", "份量足", "排队久", "偏咸", "偏油", "偏贵", "出餐快", "会回购", "踩雷"];

    function starHTML(n, attr) {
      return `<span class="mini-stars" data-stars="${attr}">${"★".repeat(n)}${"☆".repeat(5 - n)}</span>`;
    }
    mask.innerHTML = `<div class="sheet">
      <h3>点评 · ${esc(d.name)}</h3>
      <div class="desc">${winById[d.w].emoji} ${esc(winById[d.w].name)} · 你的点评会帮助同学避雷</div>

      <div class="field">
        <label>总体评分</label>
        <div class="star-input" id="starMain">
          ${[1,2,3,4,5].map(i => `<span data-v="${i}">☆</span>`).join("")}
        </div>
      </div>

      <div class="field">
        <label>细分打分（选填）</label>
        <div class="dim-input"><span>味道</span>${starHTML(0,"taste")}</div>
        <div class="dim-input"><span>份量</span>${starHTML(0,"portion")}</div>
        <div class="dim-input"><span>性价比</span>${starHTML(0,"value")}</div>
        <div class="dim-input"><span>排队快</span>${starHTML(0,"wait")}</div>
      </div>

      <div class="field">
        <label>快捷标签</label>
        <div id="revTags">${quickTags.map(t => `<span class="tag" data-rtag="${t}" style="cursor:pointer;padding:6px 12px">${t}</span>`).join("")}</div>
      </div>

      <div class="field">
        <label>详细评价</label>
        <textarea id="revText" rows="3" placeholder="味道如何？份量够不够？值不值这个价？"></textarea>
      </div>

      <button class="btn-primary" id="submitReview">发布点评</button>
      <button class="btn-ghost" style="margin-top:10px" data-close>取消</button>
    </div>`;
    mask.classList.add("show");

    // 主星级
    const mainSpans = mask.querySelectorAll("#starMain span");
    function paintMain(n) { mainSpans.forEach((sp, i) => { sp.textContent = i < n ? "★" : "☆"; sp.classList.toggle("on", i < n); }); }
    mainSpans.forEach(sp => sp.onclick = () => { state.stars = +sp.dataset.v; paintMain(state.stars); });

    // 细分星级（点星号文字里第几个星）
    mask.querySelectorAll("[data-stars]").forEach(el => {
      el.onclick = (e) => {
        // 依据点击位置估算第几颗星
        const rect = el.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        let v = Math.max(1, Math.min(5, Math.ceil(ratio * 5)));
        if (el.textContent.indexOf("☆") >= 0 && v === state[el.dataset.stars]) v = 0; // 再次点相同则取消
        state[el.dataset.stars] = v;
        el.textContent = "★".repeat(v) + "☆".repeat(5 - v);
      };
    });

    // 标签
    mask.querySelectorAll("[data-rtag]").forEach(el => {
      el.onclick = () => {
        const t = el.dataset.rtag, i = state.tags.indexOf(t);
        if (i >= 0) { state.tags.splice(i, 1); el.classList.remove("on"); }
        else { state.tags.push(t); el.classList.add("on"); }
      };
    });

    document.getElementById("submitReview").onclick = () => {
      if (!state.stars) { toast("请先给个总体星级 ⭐"); return; }
      const text = document.getElementById("revText").value.trim();
      if (!text) { toast("写两句评价再发布吧 ✍️"); return; }
      const rev = {
        id: "u" + Date.now(), dish: dishId, user: prefs.name || "同学",
        stars: state.stars, taste: state.taste, portion: state.portion,
        value: state.value, wait: state.wait, text: text, tags: state.tags,
        time: now(), likes: 0,
      };
      userReviews.push(rev); saveJSON(LS_REVIEWS, userReviews);
      closeMask(); toast("点评发布成功 🎉"); renderDetail(dishId);
    };
  }

  // ---------- 弹窗工具 ----------
  function closeMask() { const m = document.getElementById("mask"); m.classList.remove("show"); m.innerHTML = ""; }

  let detailReturn = "home";
  function openDish(id) { if (currentView !== "detail") detailReturn = currentView; renderDetail(id); switchView("detail"); }

  function openAvoid() {
    rankTab = "avoid"; renderRank(); switchView("rank");
  }

  // ---------- 搜索 ----------
  function doSearch(q) {
    q = q.trim().toLowerCase();
    const el = document.getElementById("view-home");
    if (!q) { renderHome(); return; }
    const res = DISHES.filter(d => {
      const w = winById[d.w], c = canteenById[w.canteen];
      return (d.name + d.desc + d.tags.join("") + w.name + w.cuisine + c.name).toLowerCase().indexOf(q) >= 0;
    }).sort((a, b) => dishStats(b).rating - dishStats(a).rating);
    switchView("home");
    el.innerHTML = `
      <div class="section-title">搜索「${esc(q)}」 <span class="more" id="clearSearch">清空 ✕</span></div>
      ${res.length ? res.map(d => dishCard(d, { showQueue: true })).join("") : '<div class="empty"><span class="ico">🔍</span>没找到相关菜品<br/><span style="font-size:12px">换个关键词试试，比如「面」「辣」「清真」</span></div>'}
    `;
    document.getElementById("clearSearch").onclick = () => { document.getElementById("searchInput").value = ""; renderHome(); };
  }

  // ---------- 全局事件委托 ----------
  document.addEventListener("click", function (e) {
    const t = e.target;
    const closest = (sel) => t.closest(sel);

    if (closest("[data-close]") || t.id === "mask") { closeMask(); return; }

    const navGo = closest("[data-nav-go]"); if (navGo) { switchView(navGo.dataset.navGo); return; }
    const navTab = closest(".tabbar .tab[data-nav]"); if (navTab) { const n = navTab.dataset.nav; if (n === "canteen") canteenDrill = null; render(n); switchView(n); return; }

    const act = closest("[data-action]");
    if (act) {
      if (act.dataset.action === "spin") { openSpin(); return; }
      if (act.dataset.action === "avoid") { openAvoid(); return; }
    }

    const od = closest("[data-open-dish]"); if (od) { openDish(od.dataset.openDish); return; }
    const oc = closest("[data-open-canteen]");
    if (oc) { canteenDrill = oc.dataset.openCanteen || null; renderCanteen(); switchView("canteen"); return; }
    const rt = closest("[data-rank-tab]"); if (rt) { rankTab = rt.dataset.rankTab; renderRank(); return; }
    const mt = closest("[data-me-tab]"); if (mt) { meTab = mt.dataset.meTab; renderMe(); return; }
    const rv = closest("[data-review]"); if (rv) { openReviewSheet(rv.dataset.review); return; }
    const bk = closest("[data-back]"); if (bk) { const back = detailReturn || "home"; render(back); switchView(back); return; }
    const fv = closest("[data-fav]");
    if (fv) { const id = fv.dataset.fav; const i = favs.indexOf(id); if (i >= 0) { favs.splice(i, 1); toast("已取消收藏"); } else { favs.push(id); toast("已收藏 ⭐"); } saveJSON(LS_FAV, favs); renderDetail(id); return; }
    const lk = closest("[data-like]");
    if (lk) {
      const id = lk.dataset.like;
      const ur = userReviews.find(r => r.id === id);
      if (ur) { ur.likes = (ur.likes || 0) + 1; saveJSON(LS_REVIEWS, userReviews); }
      lk.textContent = "👍 有用 " + ((parseInt(lk.textContent.replace(/\D/g, ""), 10) || 0) + 1);
      return;
    }
    const dr = closest("[data-del-review]");
    if (dr) { const id = dr.dataset.delReview; userReviews = userReviews.filter(r => r.id !== id); saveJSON(LS_REVIEWS, userReviews); toast("已删除"); renderMe(); return; }
    const pt = closest("[data-pref-tag]");
    if (pt) { const tag = pt.dataset.prefTag; const i = prefs.likes.indexOf(tag); if (i >= 0) prefs.likes.splice(i, 1); else prefs.likes.push(tag); pt.classList.toggle("on"); saveJSON(LS_PREFS, prefs); return; }
  });

  document.getElementById("searchInput").addEventListener("input", function (e) { doSearch(e.target.value); });

  // ---------- 渲染分发 ----------
  function render(name) {
    if (name === "home") renderHome();
    else if (name === "canteen") renderCanteen();
    else if (name === "rank") renderRank();
    else if (name === "me") renderMe();
  }

  // 首次进入
  renderHome();
})();
