/**
 * 大肥鱼世界连接器（浏览器半侧）· M2
 *
 * 三 Tab：我的鱼 / 世界 / 背包。
 * M2 增加：班次（岗位 + 15/30/60 分钟）、今日经验/鱼饼进度、取消班次。
 *
 * @module dsh-pet-connector/client
 */
window.__ModuleLoader__.load({
  id: 'dsh-pet-connector',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useRef, useState } = React

    // 一键中英切换：不侵入业务数据，只在渲染时翻译界面文案。
    const EN_TEXT = {
      '大肥鱼世界': 'Big Fat Fish World',
      '我的鱼': 'My Fish',
      '冒险': 'Adventure',
      '任务': 'Quests',
      '世界': 'World',
      '好友': 'Friends',
      '消息': 'Messages',
      '背包': 'Bag',
      '设置': 'Settings',
      '关闭': 'Close',
      '暂离': 'Away',
      '已上线': 'Online',
      '网关连接中…': 'Connecting gateway…',
      '未加入': 'Not joined',
      '连接器连接中…': 'Connecting connector…',
      '鱼潮': 'Fish Tide',
      '下一次': 'Next',
      '每天 12:00 与 20:00 各 15 分钟。': 'Daily 15-minute tides at 12:00 and 20:00.',
      '限时加成，摸鱼/修仙/下楼溜达都生效。': 'Limited-time bonus: affects work, dungeon and stroll.',
      '去摸鱼': 'Go Work',
      '今日鱼本': 'Cultivation',
      '组队鱼本': 'Cultivation Party',
      '下楼溜达': 'Stroll',
      '上次摸鱼': 'Last Shift',
      '结伴摸鱼': 'Co-op Work',
      '每日签到': 'Daily Check-in',
      '每日委托': 'Daily Quests',
      '每周委托': 'Weekly Quests',
      '成就': 'Achievements',
      '今日运势': 'Today\'s Fortune',
      '今日进度': 'Today\'s Progress',
      '抽一签': 'Draw Fortune',
      '签到': 'Check In',
      '补签': 'Make-up',
      '领取': 'Claim',
      '领取离线奖励': 'Claim Offline Reward',
      '全部已读': 'Mark All Read',
      '返回列表': 'Back',
      '刷新': 'Refresh',
      '发送': 'Send',
      '保存签名': 'Save Bio',
      '设为称号': 'Set Title',
      '取消称号': 'Clear Title',
      '分享': 'Share',
      '复制': 'Copy',
      '添加': 'Add',
      '资料': 'Profile',
      '私聊': 'Chat',
      '串门': 'Visit',
      '送礼': 'Gift',
      '礼物': 'Gift',
      '购买': 'Buy',
      '穿上': 'Equip',
      '强化': 'Upgrade',
      '分解': 'Dismantle',
      '切换地区': 'Change Region',
      '生成恢复码': 'Generate Recovery Code',
      '导出我的数据': 'Export My Data',
      '退出登录': 'Log Out',
      '删除账号': 'Delete Account',
      '发起结伴': 'Start Co-op',
      '加入': 'Join',
      '出发': 'Set Off',
      '开溜': 'Bail',
      '提前开溜': 'Bail Early',
      '确认放弃收益': 'Confirm Forfeit',
      '重新生成配对码': 'Regenerate Pairing Code',
      '取消加入': 'Cancel Join',
      '生成配对码': 'Generate Pairing Code',
      '生成中…': 'Generating…',
      '加载中…': 'Loading…',
      '加载更早': 'Load Older',
      '返回': 'Back',
      '开启': 'On',
      '已关闭': 'Off',
      '已开启': 'On',
      '未定地区': 'No region',
      '签到七日': '7-Day Check-in',
      '月奖已领': 'Monthly reward claimed',
      '领月奖': 'Claim Monthly Reward',
      '新地区': 'New Region',
      '次数用完': 'No attempts left',
      '装备图鉴': 'Item Codex',
      '商店': 'Shop',
      '幸运': 'Luck',
      '经验': 'XP',
      '鱼饼': 'Fishcoins',
      '等级': 'Level',
      '称号': 'Title',
      '地区': 'Region',
      '省份': 'Country / Province',
      '区县': 'District',
      '国家': 'Country',
      '已搬到': 'Moved to ',
      '切换地区失败': 'Failed to change region',
      '地区设置': 'Region Settings',
      '城市': 'City',
      '生日': 'Birthday',
      '生肖': 'Zodiac',
      '五行': 'Element',
      '签名': 'Bio',
      '恢复码': 'Recovery Code',
      '账号': 'Account',
      '互动': 'Interaction',
      '在线': 'Online',
      '离线': 'Offline',
      '未读': 'unread',
      '已读': 'read',
      '在线大鱼': 'Online Fish',
      '世界频道': 'World Chat',
      '世界动态': 'World Feed',
      '排行榜': 'Leaderboards',
      '人气': 'Popularity',
      '收礼': 'Gifts',
      '装备': 'Gear',
      '商店加载中…': 'Loading shop…',
      '还没有消息。陌生人打招呼、好友私聊会出现在这里。': 'No messages yet. Greetings and DMs will show up here.',
      '还没有对话，说第一句吧。': 'No conversation yet. Say hi!',
      '还没有好友。把对方的大肥鱼ID贴进来就行。': 'No friends yet. Paste their Fish ID below.',
      '还没有好友，加好友后才能赠送': 'No friends yet. Add friends to gift.',
      '先加好友才能结伴：去「世界」顶部的好友卡添加。': 'Add a friend first from the friend card in World.',
      '只能和好友结伴；每天同一好友最多 3 次加成。': 'Co-op only with friends; max 3 bonus runs per friend per day.',
      '结伴收益会按双方属相（六合/三合/六冲）与八字（月柱/日柱）合冲浮动：相合有加成，相冲会减成；组队后显示具体修正。': 'Co-op rewards vary with zodiac and birth-chart compatibility: harmony adds bonus, clashes reduce it.',
      '基础 鱼饼 +20% · 经验 +10% · 属相/八字合冲浮动': 'Base +20% Fishcoins · +10% XP · zodiac/birth-chart bonus or penalty',
      '每天抽一次；吉签当天鱼饼/经验有加成，凶签会减成（影响摸鱼、修仙、下楼溜达）。': 'One draw per day. Good fortunes boost today\'s earnings; bad fortunes reduce them.',
      '随机去一座城市，带回鱼饼、经验和一件见闻。': 'Visit a random city and bring back Fishcoins, XP and a story.',
      '协议、城市、生日都在网页完成；不获取定位。': 'Consent, region and birthday are completed on the web; no location access.',
      '右键宠物 →「打开大肥鱼世界」随时回来 · 暂离保留登录': 'Right-click pet → "Open Big Fat Fish World" · Away keeps you logged in',
      '加入后：右键宠物 →「打开大肥鱼世界」': 'After joining: right-click pet → "Open Big Fat Fish World"',
      '说点什么（120 字内）': 'Say something (max 120)',
      '喊一句…': 'Say something…',
      '对方的大肥鱼ID（DFY-XXXX-XX）': 'Their Fish ID (DFY-XXXX-XX)',
      '输入好友的结伴码': 'Friend\'s co-op code',
      '好友的队伍码': 'Friend\'s team code',
      '给鱼改个名字（2–12 字）': 'New pet name (2–12 chars)',
      '一句话签名（30 字以内）': 'One-line bio (max 30)',
      '今日运气爆棚，适合打鱼本。': 'Great luck today — perfect for dungeons.',
      '平稳顺利，按部就班就好。': 'Smooth and steady.',
      '有点小惊喜，记得看一眼世界频道。': 'A small surprise awaits in World Chat.',
      '不着急，慢慢来也会有收获。': 'No rush — steady progress still pays.',
      '今天水逆，摸鱼和鱼本收益都会打折扣，稳一点。': 'Bad luck today: work and dungeon rewards are reduced.',
      '大吉': 'Great Fortune',
      '中吉': 'Good Fortune',
      '小吉': 'Small Fortune',
      '末吉': 'Faint Fortune',
      '凶': 'Bad Fortune',
      '今日加成': 'Today\'s Bonus',
      '今日 Debuff': 'Today\'s Debuff',
      '平台连接中断，正在自动重试…': 'Platform connection lost. Retrying…',
      '⚠️ 平台连接中断，正在自动重试…': '⚠️ Platform connection lost. Retrying…',
      '🌍 3D 地球 · 全球大肥鱼': '🌍 3D Globe · Fish Worldwide',
      '全球大肥鱼地区分布': 'Global fish distribution',
      '加载全球分布…': 'Loading global distribution…',
      '每个点代表玩家手动选择的游戏地区；不读取定位，按当前玩家统计。': 'Each dot is a player-chosen region, not GPS location; counts are live.',
      '还没有地区数据': 'No region data yet',
      '全部': 'All',
      '全服': 'Global',
      '本市': 'City',
      '本区': 'District',
      '好友榜': 'Friends',
      '财富·当前': 'Coins',
      '财富·累计': 'Coins (Total)',
      '等级榜': 'Level',
      '装备榜': 'Gear',
      '收礼榜': 'Gifts',
      '人气榜': 'Popularity',
      '签到成功': 'Check-in complete',
      '改名冷却': 'Rename cooldown',
      '天一次': 'days each',
      '每 30 天可改一次。': 'Can rename every 30 days.',
      '每 24 小时可切换一次地区；切换后城市五行与幸运关系会重算。': 'Region can change every 24 hours; element and luck bonuses are recalculated.',
      '切换地区冷却中': 'Region change cooling down',
      '后可在设置里切换地区': 'until you can change region in Settings',
      '现在可在设置里切换地区': 'You can change region in Settings now',
      '离线每小时 3 鱼饼 / 2 经验，单日上限 8 小时，最多累计 7 天。': 'Offline: 3 Fishcoins / 2 XP per hour, 8h/day, up to 7 days.',
      '暂无可领取': 'Nothing to claim',
      '离线': 'Offline',
      '小时': 'h',
      '分钟': 'min',
      '秒': 's',
      '天': 'd',
      '次': 'x',
      '条未读': ' unread',
      '没有未读': 'No unread',
      '个目标': 'goals',
      '点': 'pts',
      '级': 'Lv',
      '命中': 'hit',
      '每日': 'Daily',
      '每周': 'Weekly',
      '本月签到': 'This month',
      '连续签到': 'Streak',
      '漏签': 'Missed',
      '已装备': 'Equipped',
      '购买成功': 'Purchased',
      '已穿上': 'Equipped',
      '已强化': 'Upgraded',
      '已分解': 'Dismantled',
      '失败': 'failed',
      '成功': 'success',
      '关于': 'About',
    }
    const EN_ENTRIES = Object.entries(EN_TEXT).sort((a, b) => b[0].length - a[0].length)

    function translateText(value) {
      if (typeof value !== 'string' || !/[\u4e00-\u9fff]/.test(value)) return value
      if (EN_TEXT[value]) return EN_TEXT[value]
      let output = value
      for (const [source, target] of EN_ENTRIES) {
        if (!source || !output.includes(source)) continue
        output = output.split(source).join(target)
      }
      return output
    }

    /** 把全球玩家点投影成一张可显示的地球 SVG（轻量、无第三方库）。 */
    function globeImageSrc(points) {
      const size = 300
      const cx = 150
      const cy = 150
      const R = 126
      const rad = Math.PI / 180
      const avgLon = points.length ? points.reduce((sum, point) => sum + point.lon, 0) / points.length : 0
      const rotation = -avgLon
      const parts = [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">`,
        `<defs><radialGradient id="g" cx="35%" cy="28%" r="85%"><stop offset="0%" stop-color="#2d6f9f"/><stop offset="65%" stop-color="#123a57"/><stop offset="100%" stop-color="#071521"/></radialGradient></defs>`,
        `<circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#g)" stroke="#5a9bc8" stroke-width="1"/>`,
      ]
      for (let lat = -60; lat <= 60; lat += 30) {
        const y = cy - Math.sin(lat * rad) * R
        const rx = Math.cos(lat * rad) * R
        parts.push(`<ellipse cx="${cx}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${(rx * 0.12).toFixed(1)}" fill="none" stroke="rgba(140,200,240,0.18)" stroke-width="1"/>`)
      }
      for (let k = 0; k < 6; k += 1) {
        const rx = R * Math.abs(Math.cos((k * 30 + rotation) * rad))
        parts.push(`<ellipse cx="${cx}" cy="${cy}" rx="${rx.toFixed(1)}" ry="${R}" fill="none" stroke="rgba(140,200,240,0.14)" stroke-width="1"/>`)
      }
      const visible = points
        .map((point) => {
          const la = point.lat * rad
          const lo = (point.lon + rotation) * rad
          return { point, x: cx + Math.cos(la) * Math.sin(lo) * R, y: cy - Math.sin(la) * R, z: Math.cos(la) * Math.cos(lo) }
        })
        .filter((entry) => entry.z > 0.06)
        .sort((a, b) => a.z - b.z)
      for (const entry of visible) {
        parts.push(
          `<circle cx="${entry.x.toFixed(1)}" cy="${entry.y.toFixed(1)}" r="${(2 + 2.2 * entry.z).toFixed(1)}" fill="${entry.point.online ? '#2ee6a6' : '#7fb4ff'}" opacity="${(0.35 + 0.65 * entry.z).toFixed(2)}"><title>${String(entry.point.name).replace(/[<>&]/g, '')} · ${String(entry.point.region ?? '').replace(/[<>&]/g, '')}</title></circle>`,
        )
      }
      parts.push('</svg>')
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(parts.join(''))}`
    }
    function localizeNode(node) {
      if (typeof node === 'string') return translateText(node)
      if (Array.isArray(node)) return node.map(localizeNode)
      if (!node || typeof node !== 'object' || !node.type) return node
      const props = node.props && typeof node.props === 'object' ? { ...node.props } : {}
      for (const key of ['placeholder', 'title', 'alt', 'aria-label']) {
        if (typeof props[key] === 'string') props[key] = translateText(props[key])
      }
      const rawChildren = node.children !== undefined ? node.children : props.children
      delete props.children
      const childList = rawChildren === undefined ? [] : Array.isArray(rawChildren) ? rawChildren.map(localizeNode) : [localizeNode(rawChildren)]
      // 用 cloneElement 保留 React 元素身份/keys，避免重建树时重复挂载。
      if (typeof React.cloneElement === 'function') {
        return childList.length > 0 ? React.cloneElement(node, props, ...childList) : React.cloneElement(node, props)
      }
      if (childList.length === 0) return h(node.type, props)
      return h(node.type, props, ...childList)
    }

    function routeBase() {
      try {
        const url = new URL(document.baseURI)
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return '/dsh-pet-connector'
        return url.pathname.replace(/\/+$/, '') + '/dsh-pet-connector'
      } catch {
        return '/dsh-pet-connector'
      }
    }

    async function call(path, init) {
      const response = await fetch(routeBase() + path, init)
      const text = await response.text()
      try {
        return JSON.parse(text)
      } catch {
        return { ok: false, reason: 'bad-json', message: text.slice(0, 200) }
      }
    }

    const postJson = (path, body) =>
      call(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body ?? {}) })

    const token = (name, fallback) => `var(--dsw-alias-${name}, ${fallback})`
    const COLORS = {
      base: token('bg-base', '#10131a'),
      layer1: token('bg-layer-1', '#171b24'),
      layer2: token('bg-layer-2', '#1d2330'),
      border: token('border-l1', '#242b38'),
      borderStrong: token('border-l2', '#33405a'),
      text: token('label-primary', '#e8ecf4'),
      textDim: token('label-secondary', '#8b95a7'),
      brand: token('brand-primary', '#7fb4ff'),
      brandSolid: '#2f6bff',
      ok: token('state-success-primary', '#4ade80'),
      err: token('state-error-primary', '#ff7b7b'),
      idle: token('state-idle-primary', '#55607a'),
    }

    // 用当前主题的文字色和底色混出边框，适配浅色、深色和自定义主题。
    const DFY_BORDER = `color-mix(in srgb, ${COLORS.text} 26%, ${COLORS.layer1})`
    const DFY_BORDER_SOFT = `color-mix(in srgb, ${COLORS.text} 17%, ${COLORS.layer1})`
    const DFY_CARD_BG = `color-mix(in srgb, ${COLORS.layer2} 93%, ${COLORS.text})`
    const DFY_HEADER_BG = `color-mix(in srgb, ${COLORS.layer2} 96%, ${COLORS.text})`
    const DFY_MUTED = `color-mix(in srgb, ${COLORS.textDim} 82%, ${COLORS.text})`
    const DFY_GHOST_BG = `color-mix(in srgb, ${COLORS.text} 6%, transparent)`
    const DFY_BADGE_BG = `color-mix(in srgb, ${COLORS.brand} 15%, transparent)`
    const DFY_TRACK_BG = `color-mix(in srgb, ${COLORS.base} 78%, ${COLORS.text})`
    const DFY_INPUT_BG = `color-mix(in srgb, ${COLORS.base} 96%, ${COLORS.text})`

    const styles = {
      backdrop: {
        position: 'fixed', inset: 0, zIndex: 2147483000, display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'rgba(0, 0, 0, 0.42)', backdropFilter: 'blur(3px)',
      },
      panel: {
        width: 'min(720px, calc(100vw - 40px))', maxHeight: 'min(640px, calc(100vh - 80px))',
        display: 'flex', flexDirection: 'column', background: COLORS.layer1, color: COLORS.text,
        border: `1px solid ${COLORS.borderStrong}`, borderRadius: 16,
        boxShadow: `inset 0 0 0 1px ${DFY_BORDER}, 0 24px 80px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.12)`, overflow: 'hidden',
        font: '14px/1.6 "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
      },
      header: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        padding: '12px 16px', borderBottom: `1px solid ${DFY_BORDER}`, background: DFY_HEADER_BG, boxShadow: `inset 0 -1px 0 ${DFY_BORDER_SOFT}`,
      },
      title: { fontSize: 16, fontWeight: 600, margin: 0 },
      sub: { fontSize: 12, color: DFY_MUTED },
      tabs: { display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 16px', borderBottom: `1px solid ${DFY_BORDER_SOFT}` },
      tab: (active) => ({
        position: 'relative',
        border: `1px solid ${active ? COLORS.brandSolid : DFY_BORDER}`,
        background: active ? COLORS.brandSolid : DFY_GHOST_BG,
        color: active ? '#fff' : DFY_MUTED,
        borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer',
      }),
      body: { padding: '14px 16px', overflow: 'auto', flex: 1 },
      footer: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderTop: `1px solid ${DFY_BORDER}`, fontSize: 12, color: DFY_MUTED, background: DFY_HEADER_BG,
      },
      card: { border: `1px solid ${COLORS.borderStrong}`, background: DFY_CARD_BG, borderRadius: 12, padding: 14, marginBottom: 12, boxShadow: `inset 0 0 0 1px ${DFY_BORDER_SOFT}, 0 1px 2px rgba(0,0,0,0.05)` },
      row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
      name: { fontSize: 18, fontWeight: 600, margin: 0 },
      meta: { fontSize: 12, color: DFY_MUTED },
      badge: {
        display: 'inline-block', padding: '1px 8px', borderRadius: 999, background: DFY_BADGE_BG,
        color: COLORS.brand, fontSize: 12, marginLeft: 6, border: `1px solid ${DFY_BORDER_SOFT}`,
      },
      bar: { height: 8, borderRadius: 4, background: DFY_TRACK_BG, overflow: 'hidden', marginTop: 8 },
      barFill: (pct, color = COLORS.brandSolid) => ({
        height: '100%', width: `${Math.max(0, Math.min(100, pct))}%`, background: color,
      }),
      btn: {
        border: 0, borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600,
        cursor: 'pointer', background: COLORS.brandSolid, color: '#fff',
      },
      btnGhost: {
        border: `1px solid ${DFY_BORDER}`, borderRadius: 8, padding: '7px 14px',
        fontSize: 13, cursor: 'pointer', background: DFY_GHOST_BG, color: COLORS.text,
      },
      select: {
        background: DFY_INPUT_BG, color: COLORS.text, border: `1px solid ${DFY_BORDER}`,
        borderRadius: 8, padding: '7px 10px', fontSize: 13, boxShadow: `inset 0 0 0 1px ${DFY_BORDER_SOFT}`,
      },
      grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 },
      pet: { border: `1px solid ${COLORS.borderStrong}`, background: DFY_CARD_BG, borderRadius: 10, padding: 12, boxShadow: `inset 0 0 0 1px ${DFY_BORDER_SOFT}` },
      petMine: { borderColor: COLORS.brand },
      dot: (online) => ({ display: 'inline-block', width: 8, height: 8, borderRadius: 4, marginRight: 6, background: online ? COLORS.ok : COLORS.idle }),
      empty: { color: DFY_MUTED, textAlign: 'center', padding: '24px 0' },
      error: { color: COLORS.err, fontSize: 12, marginTop: 8 },
      hint: { color: DFY_MUTED, fontSize: 12, marginTop: 8 },
      slot: { border: `2px dashed ${DFY_BORDER}`, borderRadius: 10, padding: 14, textAlign: 'center', color: DFY_MUTED, fontSize: 12, background: DFY_GHOST_BG },
      link: { color: COLORS.brand, cursor: 'pointer', textDecoration: 'underline', background: 'none', border: 0, padding: 0, font: 'inherit' },
      code: {
        font: '600 26px/1 "Consolas", monospace', letterSpacing: 6, padding: '14px 18px',
        borderRadius: 12, border: `1px dashed ${COLORS.borderStrong}`, background: DFY_INPUT_BG, color: COLORS.brand, display: 'inline-block',
      },
    }

    const STATE_LABEL = {
      thinking: '思考中', working: '摸鱼中', result: '收尾中', waiting: '等人回话',
      success: '刚忙完', error: '出错了', idle: '发呆中',
    }

    function percentText(bonus) {
      if (!bonus || typeof bonus.xpMultiplier !== 'number') return ''
      const delta = Math.round((bonus.xpMultiplier - 1) * 100)
      if (delta === 0) return bonus.label || ''
      return `${bonus.label || ''} ${delta > 0 ? '+' : ''}${delta}%`.trim()
    }

    function remainText(endsAt, tick) {
      const remain = Math.max(0, Math.floor((endsAt - Date.now()) / 1000))
      const minutes = Math.floor(remain / 60)
      const seconds = remain % 60
      return `${minutes}:${String(seconds).padStart(2, '0')}`
    }

    /** 鱼系等级图标：彩色大肥鱼，4 条合 1 条更高阶。 */
    function levelFishSrc(badge) {
      const stops = badge.gradient
        ? badge.gradient.map((color, index) => `<stop offset="${(index / Math.max(1, badge.gradient.length - 1)) * 100}%" stop-color="${color}"/>`).join('')
        : ''
      const fill = badge.gradient ? 'url(#g)' : badge.color
      const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">` +
        (stops ? `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">${stops}</linearGradient></defs>` : '') +
        `<path d="M2 12c4-5 10-5 14 0-4 5-10 5-14 0Z" fill="${fill}"/>` +
        `<path d="M16 12l6-4v8Z" fill="${fill}"/>` +
        `<circle cx="6.5" cy="11" r="1.1" fill="#0b1020"/></svg>`
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    }

    /** 组队合冲：属相/八字带来的增益或减成。 */
    function renderCompatLine(compat) {
      if (!compat?.relations?.length) return null
      const pct = (value) => `${value >= 1 ? '+' : ''}${Math.round((value - 1) * 100)}%`
      return h(
        'div',
        {
          style: {
            ...styles.hint,
            marginTop: 4,
            color: compat.score < 0 ? COLORS.err : COLORS.ok,
          },
        },
        `伙伴契合：${compat.summary}；契合修正 鱼饼 ${pct(compat.coinMult)}、经验 ${pct(compat.xpMult)}（在 +20%/+10% 基础上叠加）。`,
      )
    }

    function renderLevelIcons(badges) {
      if (!Array.isArray(badges) || badges.length === 0) return null
      const nodes = []
      for (const badge of badges) {
        const repeat = badge.tier === 'neon' && badge.count > 3 ? 1 : badge.count
        for (let index = 0; index < repeat; index += 1) {
          nodes.push(
            h('img', {
              key: `${badge.tier}-${index}`,
              src: levelFishSrc(badge),
              alt: badge.label,
              title: `${badge.label}${badge.count > 1 ? ` ×${badge.count}` : ''}`,
              'data-level-tier': badge.tier,
              style: { width: 14, height: 14, marginLeft: 2, verticalAlign: -2, display: 'inline-block' },
            }),
          )
        }
        if (badge.tier === 'neon' && badge.count > 3) {
          nodes.push(h('span', { key: 'neon-count', style: { fontSize: 10, marginLeft: 1 } }, `×${badge.count}`))
        }
      }
      return h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 1, marginLeft: 4, verticalAlign: 'middle' } }, nodes)
    }

    let globeScriptPromise = null
    let activeGlobeInstance = null
    let globeMountSeq = 0
    const GLOBE_ASSET_VERSION = '20261124a'

    function loadGlobeScript() {
      if (window.DFYGlobe) return Promise.resolve(window.DFYGlobe)
      if (!globeScriptPromise) {
        globeScriptPromise = new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = `${routeBase()}/globe3d.js?v=${GLOBE_ASSET_VERSION}`
          script.onload = () => resolve(window.DFYGlobe)
          script.onerror = () => reject(new Error('globe3d script failed'))
          document.head.appendChild(script)
        })
      }
      return globeScriptPromise
    }

    /** 真实 3D 地球：WebGL 球体 + 国家地图 + 玩家点，可拖拽/滚轮缩放。 */
    function mountGlobe3d(node, data) {
      if (!node || !data) return
      node.__dfyGlobeData = data
      if (node.__dfyGlobe) {
        node.__dfyGlobe.setPoints(data.points ?? [])
        return
      }
      const seq = ++globeMountSeq
      node.__dfyGlobeMountSeq = seq
      loadGlobeScript()
        .then((lib) => {
          if (!node.isConnected || !lib || node.__dfyGlobeMountSeq !== seq) return
          if (activeGlobeInstance && activeGlobeInstance.node !== node) {
            activeGlobeInstance.instance.destroy()
          }
          node.__dfyGlobe = lib.create(node, { geoUrl: `${routeBase()}/geo`, expandMode: 'inline' })
          activeGlobeInstance = { node, instance: node.__dfyGlobe }
          node.__dfyGlobe.setPoints(node.__dfyGlobeData?.points ?? [])
        })
        .catch(() => {
          if (node.isConnected) node.textContent = '3D 地球加载失败，请检查平台连接。'
        })
    }

    const CONNECTOR_PACKAGE_NAME = 'dsh-pet-connector'
    const AUTO_UPDATE_KEY = 'dfy.autoUpdate'
    const AUTO_UPDATE_AT_KEY = 'dfy.autoUpdateAt'
    const AUTO_UPDATE_INTERVAL_MS = 24 * 60 * 60 * 1000

    const waitMs = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    async function marketCapabilities() {
      const response = await fetch('/dsh-market/api/v1/capabilities', {
        credentials: 'same-origin',
        cache: 'no-store',
      })
      if (!response.ok) throw new Error('NO_MARKET')
      const body = await response.json().catch(() => null)
      if (body?.schema !== 'dsh-market/update-api/v1') throw new Error('NO_MARKET')
      return body
    }

    async function marketUpdateCheck(force = true) {
      await marketCapabilities()
      const response = await fetch(
        `/dsh-market/api/v1/updates?name=${encodeURIComponent(CONNECTOR_PACKAGE_NAME)}${force ? '&force=1' : ''}`,
        { credentials: 'same-origin', cache: 'no-store' },
      )
      const body = await response.json().catch(() => null)
      if (response.status === 404) throw new Error('NOT_INSTALLED')
      if (!response.ok) throw new Error(body?.error || `CHECK_FAILED_${response.status}`)
      if (!body?.package) throw new Error('BAD_RESPONSE')
      return body.package
    }

    async function marketStartUpdate(force = false) {
      await marketCapabilities()
      const response = await fetch('/dsh-market/api/v1/updates', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ packageName: CONNECTOR_PACKAGE_NAME, ...(force ? { force: true } : {}) }),
      })
      const body = await response.json().catch(() => null)
      if (!response.ok) {
        const failure = body?.failure ?? null
        throw new Error(failure?.message || body?.error || `UPDATE_FAILED_${response.status}`)
      }
      const operation = body?.operation ?? body
      if (!operation?.operationId) throw new Error('BAD_OPERATION')
      return operation
    }

    async function waitMarketOperation(operationId, onProgress) {
      for (let attempt = 0; attempt < 120; attempt += 1) {
        const response = await fetch(
          `/dsh-market/api/v1/operations?operationId=${encodeURIComponent(operationId)}`,
          { credentials: 'same-origin', cache: 'no-store' },
        )
        const body = await response.json().catch(() => null)
        if (response.status === 404) throw new Error('OPERATION_LOST')
        if (!response.ok) throw new Error(body?.error || `OPERATION_FAILED_${response.status}`)
        const operation = body?.operation ?? null
        if (!operation) throw new Error('BAD_OPERATION')
        if (typeof onProgress === 'function') onProgress(operation)
        if (['succeeded', 'failed', 'cancelled', 'rolled-back'].includes(operation.state)) return operation
        await waitMs(2000)
      }
      throw new Error('OPERATION_TIMEOUT')
    }

    function updateErrorMessage(error) {
      const code = error?.message ?? String(error)
      if (code === 'NO_MARKET') return '未安装 dsh-market，无法在面板里更新 / dsh-market is not installed'
      if (code === 'NOT_INSTALLED') return '当前安装来源没有可更新的市场记录 / this install has no market update source'
      if (code === 'OPERATION_LOST') return '更新任务已丢失，请打开 DSH 插件页重试 / update task lost'
      if (code === 'OPERATION_TIMEOUT') return '更新超时，请打开 DSH 插件页查看 / update timed out'
      return `更新检查失败 / update check failed: ${code}`
    }

    function UpdateCard({ version, styles, autoUpdate, setAutoUpdate }) {
      const [state, setState] = useState({ phase: 'checking', package: null, error: '', progress: null })
      const mountedRef = useRef(true)
      useEffect(() => () => { mountedRef.current = false }, [])

      const check = useCallback(async (force = true) => {
        setState((prev) => ({ ...prev, phase: 'checking', error: '', progress: null }))
        try {
          const pkg = await marketUpdateCheck(force)
          if (!mountedRef.current) return
          setState({ phase: 'ready', package: pkg, error: '', progress: null })
        } catch (error) {
          if (!mountedRef.current) return
          setState({ phase: 'unavailable', package: null, error: updateErrorMessage(error), progress: null })
        }
      }, [])

      useEffect(() => { void check(true) }, [check])

      const update = useCallback(async () => {
        if (!state.package?.updateAvailable) return
        setState((prev) => ({ ...prev, phase: 'updating', error: '', progress: 0 }))
        try {
          const operation = await marketStartUpdate()
          const finished = await waitMarketOperation(operation.operationId, (current) => {
            if (!mountedRef.current) return
            setState((prev) => ({
              ...prev,
              progress: current.progress?.percent ?? null,
              phase: 'updating',
            }))
          })
          if (!mountedRef.current) return
          if (finished.state === 'succeeded') {
            setState({
              phase: 'done',
              package: { ...state.package, installedVersion: finished.installedVersion ?? state.package.installedVersion, updateAvailable: false },
              error: '',
              progress: 100,
            })
          } else {
            setState((prev) => ({
              ...prev,
              phase: 'error',
              error: finished.failure?.message || `更新状态 / update state: ${finished.state}`,
            }))
          }
        } catch (error) {
          if (!mountedRef.current) return
          setState((prev) => ({ ...prev, phase: 'error', error: updateErrorMessage(error), progress: null }))
        }
      }, [state.package])

      const toggleAuto = () => {
        const next = !autoUpdate
        setAutoUpdate(next)
        try { localStorage.setItem(AUTO_UPDATE_KEY, next ? '1' : '0') } catch { /* ignore */ }
      }

      const pkg = state.package
      const statusText = state.phase === 'checking'
        ? '正在检查更新… / Checking…'
        : state.phase === 'updating'
          ? `正在更新${state.progress == null ? '…' : ` ${state.progress}%`} / Updating`
          : state.phase === 'done'
            ? '更新已安装，刷新或重启 DSH 后生效 / Installed. Refresh or restart DSH.'
            : state.phase === 'error'
              ? state.error
              : state.phase === 'unavailable'
                ? state.error
                : pkg?.updateAvailable
                  ? `发现新版本 ${pkg.latestVersion ?? ''} / Update available`
                  : `已是最新版本 / Up to date${pkg?.installedVersion ? ` · v${pkg.installedVersion}` : ''}`

      return h(
        'div',
        { style: styles.card },
        h('div', { style: styles.row }, h('b', null, '更新 / Updates'), h('span', { style: styles.meta }, version ? `v${version}` : '')),
        h('p', { style: styles.hint }, statusText),
        h(
          'div',
          { style: { ...styles.row, marginTop: 10 } },
          h('button', {
            style: styles.btnGhost,
            disabled: state.phase === 'checking' || state.phase === 'updating',
            onClick: () => void check(true),
          }, '检查更新 / Check'),
          h('button', {
            style: styles.btn,
            disabled: state.phase !== 'ready' || !pkg?.updateAvailable,
            onClick: () => void update(),
          }, state.phase === 'updating' ? '更新中… / Updating' : '立即更新 / Update'),
          h('button', {
            style: { ...styles.btnGhost, opacity: autoUpdate ? 1 : 0.75 },
            onClick: toggleAuto,
          }, autoUpdate ? '24h 自动更新：开 / Auto: ON' : '24h 自动更新：关 / Auto: OFF'),
        ),
        h('p', { style: styles.hint }, '更新通过 dsh-market 公共更新 API 完成；未安装 dsh-market 时会显示不可用。 / Updates use the dsh-market public update API; unavailable without dsh-market.'),
      )
    }

    function AboutCard({ version, styles, autoUpdate, setAutoUpdate }) {
      return h(
        'div',
        null,
        h(
          'div',
          { style: styles.card },
          h('h3', { style: { margin: '0 0 8px' } }, '大肥鱼世界连接器 / Big Fat Fish World Connector'),
          h('p', { style: { margin: '0 0 8px', fontWeight: 700 } }, '不想摸鱼还可修仙！'),
          h('p', { style: { margin: '0 0 8px' } }, '把本机 dsh-pet 接入大肥鱼世界：设备配对、手动选择城市、生日五行、世界在线、三 Tab 面板。'),
          h('p', { style: { margin: '0 0 8px', color: DFY_MUTED } }, '不想摸鱼还可修仙：八个境界地区、手动突破、本命功法、组队秘境和独立修仙榜。'),
          h('p', { style: { margin: '0 0 8px', color: DFY_MUTED } }, 'Connects your local dsh-pet to Big Fat Fish World: device pairing, manual city choice, birthday five-elements, presence, and a three-tab panel.'),
          h('p', { style: styles.hint }, '前置条件 / Prerequisite: 需要先安装并启用 dsh-pet。Install and enable dsh-pet first.'),
          h('p', { style: styles.hint }, '服务器 / Server: ', h('code', null, 'https://fish.virtuallife.cloud')),
          h('p', { style: styles.hint }, 'GitHub: ', h('button', { style: styles.link, onClick: () => window.open('https://github.com/keyszuns/dsh-pet-connector', '_blank', 'noopener') }, 'keyszuns/dsh-pet-connector')),
        ),
        h(UpdateCard, { version, styles, autoUpdate, setAutoUpdate }),
      )
    }

    function Plaza() {
      const [open, setOpen] = useState(false)
      const [lang, setLang] = useState(() => {
        try {
          return localStorage.getItem('dfy.lang') === 'en' ? 'en' : 'zh'
        } catch {
          return 'zh'
        }
      })
      const toggleLang = () => {
        const next = lang === 'en' ? 'zh' : 'en'
        setLang(next)
        try {
          localStorage.setItem('dfy.lang', next)
        } catch {
          /* 忽略隐私模式写入失败 */
        }
      }
      const TAB_KEYS = ['me', 'adventure', 'quests', 'world', 'friends', 'messages', 'bag', 'settings', 'about']
      const [tab, setTab] = useState(() => {
        try {
          const saved = localStorage.getItem('dfy.tab')
          return TAB_KEYS.includes(saved) ? saved : 'me'
        } catch {
          return 'me'
        }
      })
      const openTab = useCallback((next) => {
        setTab(next)
        try {
          localStorage.setItem('dfy.tab', next)
        } catch {
          /* 忽略隐私模式写入失败 */
        }
      }, [])

      const [autoUpdate, setAutoUpdate] = useState(() => {
        try {
          return localStorage.getItem(AUTO_UPDATE_KEY) === '1'
        } catch {
          return false
        }
      })

      // 每 24 小时最多自动更新一次连接器；只在连接器页面已加载时运行。
      useEffect(() => {
        if (!autoUpdate) return undefined
        let cancelled = false
        const tick = async () => {
          if (cancelled) return
          let last = 0
          try {
            last = Number(localStorage.getItem(AUTO_UPDATE_AT_KEY) || 0)
          } catch {
            /* ignore */
          }
          if (Date.now() - last < AUTO_UPDATE_INTERVAL_MS) return
          try {
            localStorage.setItem(AUTO_UPDATE_AT_KEY, String(Date.now()))
          } catch {
            /* ignore */
          }
          try {
            const pkg = await marketUpdateCheck(false)
            if (!pkg?.updateAvailable) return
            const operation = await marketStartUpdate()
            const finished = await waitMarketOperation(operation.operationId)
            try {
              localStorage.setItem('dfy.lastAutoUpdate', JSON.stringify({
                at: Date.now(),
                state: finished.state,
                version: finished.installedVersion ?? null,
              }))
            } catch {
              /* ignore */
            }
          } catch {
            /* 自动更新不可用时保持静默，下一次 24h 再试 */
          }
        }
        const timer = setTimeout(() => void tick(), 30000)
        const interval = setInterval(() => void tick(), 60 * 60 * 1000)
        return () => {
          cancelled = true
          clearTimeout(timer)
          clearInterval(interval)
        }
      }, [autoUpdate])
      const [status, setStatus] = useState(null)
      const [profile, setProfile] = useState(null)
      const [jobs, setJobs] = useState([])
      const [jobId, setJobId] = useState('convenience')
      const [minutes, setMinutes] = useState(30)
      const [pets, setPets] = useState([])
      const [globe, setGlobe] = useState(null)
      const [friends, setFriends] = useState([])
      const [incoming, setIncoming] = useState([])
      const [messages, setMessages] = useState([])
      const [olderMessages, setOlderMessages] = useState([])
      const [messagesHasMore, setMessagesHasMore] = useState(false)
      const [platformDown, setPlatformDown] = useState(false)
      const [unreadMessages, setUnreadMessages] = useState(0)
      const [friendDetail, setFriendDetail] = useState(null)
      const [threadPeer, setThreadPeer] = useState(null)
      const [threadMessages, setThreadMessages] = useState([])
      const threadScrollRef = useRef(null)
      const [threadInput, setThreadInput] = useState('')
      const [threadFriendRequested, setThreadFriendRequested] = useState(false)
      const [board, setBoard] = useState(null)
      const [boardType, setBoardType] = useState('wealth')
      const [boardScope, setBoardScope] = useState('global')
      const [rankScope, setRankScope] = useState('countries')
      const [rankCountry, setRankCountry] = useState('')
      const [rankings, setRankings] = useState(null)
      const [quests, setQuests] = useState([])
      const [checkin, setCheckin] = useState(null)
      const [fortune, setFortune] = useState(null)
      const [weeklyQuests, setWeeklyQuests] = useState([])
      const [achievements, setAchievements] = useState([])
      const [events, setEvents] = useState([])
      const [chatMessages, setChatMessages] = useState([])
      const [chatText, setChatText] = useState('')
      const [friendDfy, setFriendDfy] = useState('')
      const [coopCode, setCoopCode] = useState('')
      const [coopRoom, setCoopRoom] = useState(null)
      const [coopFriends, setCoopFriends] = useState([])
      const [cultivationOpen, setCultivationOpen] = useState(false)
      const [cultivationPlayback, setCultivationPlayback] = useState(null)
      const [cultivationBoard, setCultivationBoard] = useState(null)
      const [cultivationScope, setCultivationScope] = useState('global')
      const [cultivationArea, setCultivationArea] = useState('')
      const [cultivationPill, setCultivationPill] = useState('')
      const [coopInput, setCoopInput] = useState('')
      const [coopFriendQuery, setCoopFriendQuery] = useState('')
      const [coopFriendPick, setCoopFriendPick] = useState('')
      const coopFriendMatches = friends.filter((friend) => {
        const query = coopFriendQuery.trim().toLowerCase()
        if (!query) return true
        return String(friend.name ?? '').toLowerCase().includes(query)
          || String(friend.dfyId ?? '').toLowerCase().includes(query)
      })
      const coopFriendSelected = friends.find((friend) => friend.dfyId === coopFriendPick) ?? null
      const [dungeonCoopCode, setDungeonCoopCode] = useState('')
      const [dungeonCoopInput, setDungeonCoopInput] = useState('')
      const [inventory, setInventory] = useState([])
      const [setBonus, setSetBonus] = useState(0)
      const [codex, setCodex] = useState([])
      const [collectedCount, setCollectedCount] = useState(0)
      const [totalItems, setTotalItems] = useState(0)
      const [giftingId, setGiftingId] = useState(0)
      const [shop, setShop] = useState([])
      const [shopCoins, setShopCoins] = useState(0)
      const [recoveryCode, setRecoveryCode] = useState('')
      const [confirmDelete, setConfirmDelete] = useState(false)
      const [confirmLogout, setConfirmLogout] = useState(false)
      const [renameName, setRenameName] = useState('')
      const [bioEditing, setBioEditing] = useState(false)
      const [bioInput, setBioInput] = useState('')
      const [regionOptions, setRegionOptions] = useState(null)
      const [regionCountries, setRegionCountries] = useState([])
      const [regionSel, setRegionSel] = useState({ country: '', province: '' })
      const [accessory, setAccessory] = useState(() => {
        try {
          return localStorage.getItem('dfy.accessory') === '1'
        } catch {
          return false
        }
      })
      const [petPos, setPetPos] = useState(null)
      const [busy, setBusy] = useState('')
      const [confirmExploreCancel, setConfirmExploreCancel] = useState(false)
      const [error, setError] = useState('')
      const [notice, setNotice] = useState('')
      const bodyRef = useRef(null)
      const [tick, setTick] = useState(0)
      const seenSeq = useRef(0)
      const initialized = useRef(false)

      const refreshStatus = useCallback(async () => {
        // 页面不可见时暂停轮询，避免后台标签页持续打服务器。
        if (typeof document !== 'undefined' && document.hidden) return
        try {
          const next = await call('/status')
          setStatus(next)
          if (next.profile) setProfile(next.profile)
          if (typeof next.openSeq === 'number') {
            if (!initialized.current) {
              initialized.current = true
              seenSeq.current = next.openSeq
            } else if (next.openSeq !== seenSeq.current) {
              seenSeq.current = next.openSeq
              setOpen(true)
            }
          }
          return next
        } catch {
          setError('连接器未响应，检查插件是否启用')
          return null
        }
      }, [])

      const refreshQuests = useCallback(async () => {
        const data = await call('/quests')
        if (data?.ok) setQuests(data.quests ?? [])
      }, [])

      const refreshCheckin = useCallback(async () => {
        const data = await call('/checkin')
        if (data?.ok) setCheckin(data.checkin ?? null)
      }, [])

      const refreshFortune = useCallback(async () => {
        const data = await call('/fortune')
        if (data?.ok) setFortune({ drawn: data.drawn, fortune: data.fortune })
      }, [])

      const refreshWeeklyQuests = useCallback(async () => {
        const data = await call('/weekly-quests')
        if (data?.ok) setWeeklyQuests(data.quests ?? [])
      }, [])

      const refreshAchievements = useCallback(async () => {
        const data = await call('/achievements')
        if (data?.ok) setAchievements(data.achievements ?? [])
      }, [])

      const refreshMe = useCallback(async () => {
        // 页面不可见时暂停轮询，避免后台标签页持续打服务器。
        if (typeof document !== 'undefined' && document.hidden) return
        try {
          const data = await call('/me')
          if (data?.ok) {
            setProfile(data)
            setUnreadMessages(data.unreadMessages ?? 0)
            setPlatformDown(false)
          } else {
            setPlatformDown(true)
          }
          void refreshQuests()
          void refreshCheckin()
          void refreshFortune()
          void refreshWeeklyQuests()
          void refreshAchievements()
          return data
        } catch {
          setPlatformDown(true)
          return null
        }
      }, [refreshQuests, refreshCheckin, refreshFortune, refreshWeeklyQuests, refreshAchievements])

      const refreshBag = useCallback(async () => {
        const [inv, shopData, friendData] = await Promise.all([call('/inventory'), call('/shop'), call('/friends')])
        if (inv?.ok) {
          setInventory(inv.inventory ?? [])
          setCodex(inv.codex ?? [])
          setCollectedCount(inv.collectedCount ?? 0)
          setTotalItems(inv.totalItems ?? 0)
          setSetBonus(inv.setBonus ?? 0)
        }
        if (shopData?.ok) {
          setShop(shopData.items ?? [])
          setShopCoins(shopData.coins ?? 0)
        }
        if (friendData?.ok) setFriends(friendData.friends ?? [])
      }, [])

      const refreshWorld = useCallback(async () => {
        // 页面不可见时暂停轮询，避免后台标签页持续打服务器。
        if (typeof document !== 'undefined' && document.hidden) return
        try {
          const data = await call('/world')
          if (data && Array.isArray(data.pets)) setPets(data.pets)
        } catch {
          setError('平台不可达，先启动平台服务')
        }
      }, [])

      const refreshGlobe = useCallback(async () => {
        // 页面不可见时暂停轮询，避免后台标签页持续打服务器。
        if (typeof document !== 'undefined' && document.hidden) return
        const data = await call('/globe')
        if (data?.ok) setGlobe(data)
      }, [])

      const refreshFriends = useCallback(async () => {
        // 页面不可见时暂停轮询，避免后台标签页持续打服务器。
        if (typeof document !== 'undefined' && document.hidden) return
        const data = await call('/friends')
        if (data?.ok) {
          setFriends(data.friends ?? [])
          setIncoming(data.incoming ?? [])
        }
      }, [])

      const refreshCoop = useCallback(async () => {
        if (typeof document !== 'undefined' && document.hidden) return
        const [data, friendData] = await Promise.all([
          call('/coop/status'),
          call('/coop/friends'),
        ])
        if (data?.ok) {
          setCoopRoom(data.coop ?? null)
          if (data.coop?.code) setCoopCode(data.coop.code)
        }
        if (friendData?.ok) setCoopFriends(friendData.friends ?? [])
      }, [])

      const refreshCultivationBoard = useCallback(async () => {
        if (typeof document !== 'undefined' && document.hidden) return
        const data = await call(`/leaderboards?type=cultivation&scope=${encodeURIComponent(cultivationScope)}`)
        if (data?.ok) setCultivationBoard(data)
      }, [cultivationScope])

      const beginCultivationPlayback = useCallback((log) => {
        if (!log?.segments?.length) return
        setCultivationPlayback({
          segments: log.segments,
          elapsed: 5,
          done: false,
          harvestLog: log.harvestLog ?? '',
          coins: log.coins ?? 0,
          xp: log.xp ?? 0,
          loot: log.loot ?? [],
        })
        setCultivationOpen(true)
      }, [])

      useEffect(() => {
        if (!open || cultivationPlayback) return
        const room = coopRoom
        if (room?.jobId !== 'cultivation') return
        const log = room.cultivation
        if (log?.segments?.length) beginCultivationPlayback(log)
      }, [open, coopRoom, cultivationPlayback, beginCultivationPlayback])

      const refreshMessages = useCallback(async () => {
        // 页面不可见时暂停轮询，避免后台标签页持续打服务器。
        if (typeof document !== 'undefined' && document.hidden) return
        const data = await call('/messages')
        if (data?.ok) {
          setMessages(data.messages ?? [])
          setMessagesHasMore(Boolean(data.hasMore))
          setUnreadMessages(data.unread ?? 0)
        }
      }, [])

      const loadOlderMessages = async () => {
        const combined = [...olderMessages, ...messages]
        if (combined.length === 0) return
        const before = Math.min(...combined.map((message) => message.id))
        setBusy('messages-older')
        try {
          const data = await call(`/messages?before=${before}`)
          if (data?.ok) {
            setOlderMessages([...(data.messages ?? []), ...olderMessages])
            setMessagesHasMore(Boolean(data.hasMore))
          } else {
            setError(data?.message ?? '加载更早消息失败')
          }
        } catch {
          setError('加载更早消息失败')
        } finally {
          setBusy('')
        }
      }

      const refreshThread = useCallback(async () => {
        // 页面不可见时暂停轮询，避免后台标签页持续打服务器。
        if (typeof document !== 'undefined' && document.hidden) return
        if (!threadPeer?.dfyId) return
        const data = await call(`/messages/thread?dfyId=${encodeURIComponent(threadPeer.dfyId)}`)
        if (data?.ok) setThreadMessages(data.messages ?? [])
      }, [threadPeer?.dfyId])

      const refreshBoard = useCallback(async () => {
        const params = new URLSearchParams({ scope: rankScope })
        if (rankScope === 'provinces' && rankCountry) params.set('country', rankCountry)
        const data = await call(`/rankings?${params.toString()}`)
        if (data?.ok) {
          setRankings(data)
          if (rankScope === 'provinces' && !rankCountry && data.country) setRankCountry(data.country)
        }
      }, [rankScope, rankCountry])

      const refreshEvents = useCallback(async () => {
        // 页面不可见时暂停轮询，避免后台标签页持续打服务器。
        if (typeof document !== 'undefined' && document.hidden) return
        const data = await call('/events?limit=1000')
        if (data?.ok) setEvents(data.events ?? [])
      }, [])

      const deleteChatMessage = async (id) => {
        setBusy(`chat-del-${id}`)
        setError('')
        try {
          const data = await call(`/chat/${id}`, { method: 'DELETE' })
          if (!data?.ok) setError(data?.message ?? '撤回失败')
          else setChatMessages(data.messages ?? [])
        } catch {
          setError('撤回失败')
        } finally {
          setBusy('')
        }
      }

      const refreshChat = useCallback(async () => {
        // 页面不可见时暂停轮询，避免后台标签页持续打服务器。
        if (typeof document !== 'undefined' && document.hidden) return
        const data = await call('/chat')
        if (data?.ok) setChatMessages(data.messages ?? [])
      }, [])

      useEffect(() => {
        // 切回标签页时立即刷新，而不是等下一次轮询。
        const onVisibility = () => {
          if (document.hidden) return
          void refreshStatus()
          void refreshMe()
        }
        document.addEventListener('visibilitychange', onVisibility)
        return () => document.removeEventListener('visibilitychange', onVisibility)
      }, [refreshStatus, refreshMe])

      useEffect(() => {
        void refreshStatus()
        const timer = setInterval(() => void refreshStatus(), 2500)
        return () => clearInterval(timer)
      }, [refreshStatus])

      useEffect(() => {
        if (!open) return undefined
        void refreshMe()
        const timer = setInterval(() => void refreshMe(), 2000)
        return () => clearInterval(timer)
      }, [open, refreshMe])

      useEffect(() => {
        if (!open) return undefined
        void call('/jobs').then((data) => {
          if (data?.ok && Array.isArray(data.jobs)) {
            setJobs(data.jobs)
            const first = data.jobs.find((job) => job.unlocked)
            if (first) setJobId((current) => (data.jobs.some((job) => job.id === current) ? current : first.id))
          }
        })
      }, [open])

      useEffect(() => {
        if (!open) return undefined
        if (tab !== 'world') return undefined
        void refreshWorld()
        const timer = setInterval(() => void refreshWorld(), 4000)
        return () => clearInterval(timer)
      }, [open, tab, refreshWorld])

      useEffect(() => {
        if (!open || tab !== 'world') return undefined
        void refreshGlobe()
        const timer = setInterval(() => void refreshGlobe(), 6000)
        return () => clearInterval(timer)
      }, [open, tab, refreshGlobe])

      useEffect(() => {
        if (!open) return undefined
        if (!['world', 'friends', 'messages', 'adventure'].includes(tab)) return undefined
        const load = () => {
          if (tab === 'world') {
            void refreshBoard()
            void refreshEvents()
            void refreshChat()
            void refreshFriends()
          }
          if (tab === 'friends' || tab === 'adventure') void refreshFriends()
          if (tab === 'messages') void refreshMessages()
        }
        load()
        const timer = setInterval(load, 6000)
        return () => clearInterval(timer)
      }, [open, tab, refreshFriends, refreshBoard, refreshEvents, refreshChat, refreshMessages])

      useEffect(() => {
        if (!threadScrollRef.current) return
        threadScrollRef.current.scrollTop = threadScrollRef.current.scrollHeight
      }, [threadMessages.length, threadPeer?.dfyId])

      useEffect(() => {
        if (!open || tab !== 'messages' || !threadPeer?.dfyId) return undefined
        void refreshThread()
        const timer = setInterval(() => void refreshThread(), 5000)
        return () => clearInterval(timer)
      }, [open, tab, refreshThread])

      useEffect(() => {
        if (!open) return undefined
        if (!['adventure', 'friends'].includes(tab) && !cultivationOpen) return undefined
        void refreshCoop()
        const timer = setInterval(() => void refreshCoop(), 3000)
        return () => clearInterval(timer)
      }, [open, tab, cultivationOpen, refreshCoop])

      useEffect(() => {
        if (!open || tab !== 'adventure') return undefined
        void refreshCultivationBoard()
        const timer = setInterval(() => void refreshCultivationBoard(), 15000)
        return () => clearInterval(timer)
      }, [open, tab, refreshCultivationBoard])

      useEffect(() => {
        if (!open || !cultivationOpen || !cultivationPlayback || cultivationPlayback.done) return undefined
        const timer = setInterval(() => {
          setCultivationPlayback((current) => {
            if (!current || current.done) return current
            const elapsed = Math.min(300, current.elapsed + 5)
            const done = elapsed >= 300
            if (done) void refreshMe()
            return { ...current, elapsed, done }
          })
        }, 5000)
        return () => clearInterval(timer)
      }, [open, cultivationOpen, cultivationPlayback?.done, refreshMe])

      const loadRegionOptions = useCallback(async (country, keepCurrent = false) => {
        try {
          const suffix = country ? `?country=${encodeURIComponent(country)}` : ''
          const data = await call(`/region-options${suffix}`)
          if (!data?.ok) return
          setRegionCountries(data.countries ?? [])
          setRegionOptions(data)
          setRegionSel((previous) => ({
            country: data.country.code,
            province: keepCurrent
              ? data.current?.provinceCode ?? ''
              : data.provinces.some((province) => province.code === previous.province)
                ? previous.province
                : '',
          }))
        } catch {
          setError('地区列表加载失败')
        }
      }, [])

      useEffect(() => {
        if (!open || tab !== 'settings' || regionOptions) return undefined
        void loadRegionOptions(undefined, true)
        return undefined
      }, [open, tab, regionOptions, loadRegionOptions])

      useEffect(() => {
        if (!error) return undefined
        const timer = setTimeout(() => setError(''), 6000)
        return () => clearTimeout(timer)
      }, [error])

      useEffect(() => {
        if (!notice) return undefined
        const timer = setTimeout(() => setNotice(''), 6000)
        return () => clearTimeout(timer)
      }, [notice])

      useEffect(() => {
        if (bodyRef.current) bodyRef.current.scrollTop = 0
      }, [tab])

      // 面板世界 Tab 挂载 3D 地球；切走/关闭时销毁，避免后台 WebGL 空转。
      useEffect(() => {
        if (!open || tab !== 'world') return undefined
        const node = document.getElementById('dfy-globe-panel')
        if (!node) return undefined
        if (globe) mountGlobe3d(node, globe)
        return () => {
          if (node.__dfyGlobe) {
            node.__dfyGlobe.destroy()
            node.__dfyGlobe = null
          }
          if (activeGlobeInstance && activeGlobeInstance.node === node) activeGlobeInstance = null
        }
      }, [open, tab])

      useEffect(() => {
        if (!open || tab !== 'world') return undefined
        const node = document.getElementById('dfy-globe-panel')
        if (node && globe) mountGlobe3d(node, globe)
        return undefined
      })

      // 中英切换：只翻译已挂载 DOM 的文本/占位符，不重建 React 树。
      useEffect(() => {
        if (lang !== 'en') return undefined
        const textRecords = new Map()
        const attrRecords = []
        const translateNode = (node) => {
          if (node.nodeType === 3) {
            let record = textRecords.get(node)
            if (!record) {
              record = { original: node.data, applied: null }
              textRecords.set(node, record)
            }
            if (node.data !== record.applied) {
              record.original = node.data
              record.applied = translateText(node.data)
              node.data = record.applied
            }
            return
          }
          if (node.nodeType === 1) {
            for (const attr of ['placeholder', 'title', 'alt', 'aria-label']) {
              if (!node.hasAttribute(attr)) continue
              let entry = attrRecords.find((item) => item.node === node && item.attr === attr)
              if (!entry) {
                entry = { node, attr, original: node.getAttribute(attr), applied: null }
                attrRecords.push(entry)
              }
              const current = node.getAttribute(attr)
              if (current !== entry.applied) {
                entry.original = current
                entry.applied = translateText(current)
                node.setAttribute(attr, entry.applied)
              }
            }
          }
          for (const child of node.childNodes) translateNode(child)
        }
        const translatePanel = () => {
          const dialog = document.querySelector('[role="dialog"]')
          if (dialog) translateNode(dialog)
        }
        translatePanel()
        // 面板每 2 秒会重绘；观察 body，重绘后对新 DOM 继续翻译。
        const observer = new MutationObserver(() => {
          if (lang === 'en') translatePanel()
        })
        observer.observe(document.body, {
          subtree: true,
          childList: true,
          characterData: true,
          attributes: true,
          attributeFilter: ['placeholder', 'title', 'alt', 'aria-label'],
        })
        return () => {
          observer.disconnect()
          for (const [node, record] of textRecords) {
            if (node.isConnected && node.data === record.applied) node.data = record.original
          }
          for (const entry of attrRecords) {
            if (entry.node.isConnected && entry.node.getAttribute(entry.attr) === entry.applied) entry.node.setAttribute(entry.attr, entry.original)
          }
        }
      }, [lang])

      useEffect(() => {
        if (!open) return undefined
        const onKeyDown = (event) => {
          if (event.key === 'Escape') setOpen(false)
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
      }, [open])

      useEffect(() => {
        if (!profile?.shift || profile.shift.kind !== 'explore') setConfirmExploreCancel(false)
      }, [profile?.shift?.id, profile?.shift?.kind])

      useEffect(() => {
        if (!profile?.shift) return undefined
        const timer = setInterval(() => setTick((value) => value + 1), 1000)
        return () => clearInterval(timer)
      }, [profile?.shift])

      useEffect(() => {
        if (!open || !accessory) return undefined
        let stopped = false
        const pull = async () => {
          try {
            const response = await fetch('/dsh-pet-7340/state', { cache: 'no-store' })
            const data = await response.json()
            const position = data?.pets?.main?.position?.data
            if (!stopped && position && typeof position.x === 'number' && typeof position.y === 'number') {
              setPetPos({ x: position.x, y: position.y })
            }
          } catch {
            /* 位置取不到就不画挂件 */
          }
        }
        void pull()
        const timer = setInterval(pull, 1000)
        return () => {
          stopped = true
          clearInterval(timer)
        }
      }, [open, accessory])

      const startPair = async () => {
        setBusy('pair')
        setError('')
        try {
          const data = await postJson('/pair/start')
          if (!data.ok) setError(data.message ?? '生成配对码失败')
        } catch {
          setError('平台不可达')
        } finally {
          setBusy('')
        }
      }

      const say = async (petId) => {
        setBusy('say')
        setError('')
        try {
          const fromDfyId = profile?.dfyId ?? status?.profile?.dfyId ?? ''
          const data = await postJson(`/world/${encodeURIComponent(petId)}/say`, {
            text: '世界频道有人想你啦～',
            fromDfyId,
          })
          if (!data.ok) setError(data.message ?? '发送失败')
          else setNotice(data.from ? '已打招呼，并附上了你的大肥鱼ID' : '已打招呼')
        } catch {
          setError('发送失败')
        } finally {
          setBusy('')
        }
      }

      const startShift = async () => {
        setBusy('shift')
        setError('')
        try {
          const data = await postJson('/shift/start', { jobId, minutes })
          if (!data.ok) setError(data.message ?? '开班失败')
          await refreshMe()
        } catch {
          setError('开班失败')
        } finally {
          setBusy('')
        }
      }

      const cancelShift = async (confirm = false) => {
        const explore = profile?.shift?.kind === 'explore'
        if (explore && !confirm) {
          setConfirmExploreCancel(true)
          setError('下楼溜达提前开溜会放弃本次全部收益；确定要放弃，请再点一次「确认放弃收益」。')
          return
        }
        setBusy('cancel')
        try {
          const data = await postJson('/shift/cancel', { confirm: true })
          if (!data.ok) setError(data.message ?? '取消失败')
          else {
            setConfirmExploreCancel(false)
            if (data.forfeited) setError('已放弃下楼溜达，本次没有获得任何收益。')
          }
          await refreshMe()
        } catch {
          setError('取消失败')
        } finally {
          setBusy('')
        }
      }

      const startRecover = async () => {
        setBusy('recover')
        setError('')
        try {
          const data = await postJson('/pair/start')
          if (!data.ok) setError(data.message ?? '生成配对码失败')
          else window.open(`${status?.platformUrl ?? ''}/recover?code=${data.code}`, '_blank', 'noopener')
        } catch {
          setError('平台不可达')
        } finally {
          setBusy('')
        }
      }

      const copyText = async (text, label) => {
        const fallback = () => {
          try {
            const area = document.createElement('textarea')
            area.value = text
            area.style.position = 'fixed'
            area.style.opacity = '0'
            document.body.appendChild(area)
            area.select()
            document.execCommand('copy')
            document.body.removeChild(area)
            setNotice(`${label}已复制`)
          } catch {
            setError('复制失败，请手动选择文本')
          }
        }
        try {
          if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text)
          else fallback()
          if (navigator.clipboard?.writeText) setNotice(`${label}已复制`)
        } catch {
          fallback()
        }
      }

      const generateRecovery = async () => {
        setBusy('recovery')
        try {
          const data = await postJson('/recovery', {})
          if (data.ok) setRecoveryCode(data.recoveryCode)
          else setError(data.message ?? '生成恢复码失败')
        } catch {
          setError('生成恢复码失败')
        } finally {
          setBusy('')
        }
      }

      const createDungeonCoop = async () => {
        setBusy('dungeon-coop')
        setError('')
        try {
          const data = await postJson('/dungeon/coop/create', {})
          if (!data.ok) setError(data.message ?? '发起组队鱼本失败')
          else {
            setDungeonCoopCode(data.code)
            await refreshMe()
          }
        } catch {
          setError('发起组队鱼本失败')
        } finally {
          setBusy('')
        }
      }

      const joinDungeonCoop = async () => {
        const code = dungeonCoopInput.trim().toUpperCase()
        if (!code) return
        setBusy('dungeon-coop-join')
        setError('')
        try {
          const data = await postJson('/dungeon/coop/join', { code })
          if (!data.ok) setError(data.message ?? '加入组队鱼本失败')
          else {
            setDungeonCoopCode(code)
            setDungeonCoopInput('')
            await refreshMe()
          }
        } catch {
          setError('加入组队鱼本失败')
        } finally {
          setBusy('')
        }
      }

      const startCultivation = async () => {
        const pathNow = profile?.cultivation
        if (cultivationPlayback && !cultivationPlayback.done) {
          setError('秘境正在进行，等这次日志走完再进')
          return
        }
        if ((pathNow?.runCooldownMs ?? 0) > 0) {
          setError(`秘境还在进行，还需等待 ${Math.ceil(pathNow.runCooldownMs / 1000)} 秒`)
          return
        }
        setBusy('cultivation')
        setError('')
        try {
          const areas = profile?.cultivation?.areas ?? []
          const fallbackArea = areas.find((area) => area.unlocked)?.id
          const data = await postJson('/cultivation/start', { areaId: cultivationArea || fallbackArea })
          if (!data.ok) setError(data.message ?? '修仙失败')
          else {
            beginCultivationPlayback(data.log)
            setNotice('进入秘境，日志将每 5 秒推进一步')
            await refreshMe()
          }
        } catch {
          setError('修仙失败')
        } finally {
          setBusy('')
        }
      }

      const breakthroughCultivation = async () => {
        setBusy('cultivation-breakthrough')
        setError('')
        try {
          const data = await postJson('/cultivation/breakthrough', { pillId: cultivationPill || undefined })
          if (!data.ok) setError(data.message ?? '突破失败')
          else {
            setNotice(data.success ? `突破成功，踏入「${data.cultivation?.title ?? '新境界'}」` : '突破失败，损失当前修为的 1/3')
            setCultivationPill('')
            await refreshMe()
          }
        } catch {
          setError('突破失败')
        } finally {
          setBusy('')
        }
      }

      const setCultivationSkill = async (skillId) => {        setBusy('cultivation-skill')
        setError('')
        try {
          const data = await postJson('/cultivation/skill', { skillId })
          if (!data.ok) setError(data.message ?? '切换功法失败')
          else await refreshMe()
        } catch {
          setError('切换功法失败')
        } finally {
          setBusy('')
        }
      }

      const craftPill = async (pillId) => {
        setBusy('cultivation-alchemy')
        setError('')
        try {
          const data = await postJson('/cultivation/alchemy', { skillId: pillId })
          if (!data.ok) setError(data.message ?? '炼丹失败')
          else {
            setNotice(`炼成「${data.pill ?? '丹药'}」`)
            await refreshMe()
          }
        } catch {
          setError('炼丹失败')
        } finally {
          setBusy('')
        }
      }

      const createCultivationCoop = async () => {
        setBusy('cultivation-coop')
        setError('')
        try {
          const areas = profile?.cultivation?.areas ?? []
          const fallbackArea = areas.find((area) => area.unlocked)?.id
          const data = await postJson('/coop/create', {
            jobId: 'cultivation',
            minutes: 30,
            areaId: cultivationArea || fallbackArea,
          })
          if (!data.ok) setError(data.message ?? '创建修仙队伍失败')
          else {
            setCoopRoom(data.coop ?? null)
            setCoopCode(data.code ?? data.coop?.code ?? '')
            await refreshFriends()
            setNotice('修仙队伍已创建，等道友准备')
          }
        } catch {
          setError('创建修仙队伍失败')
        } finally {
          setBusy('')
        }
      }

      const startDungeon = async () => {
        setBusy('dungeon')
        setError('')
        try {
          const data = await postJson('/dungeon/start', {})
          if (!data.ok) setError(data.message ?? '鱼本进不去')
          await refreshMe()
        } catch {
          setError('鱼本进不去')
        } finally {
          setBusy('')
        }
      }

      const sendChat = async () => {
        const text = chatText.trim()
        if (!text) return
        setBusy('chat')
        setError('')
        try {
          const data = await postJson('/chat', { text })
          if (!data.ok) setError(data.message ?? '发送失败')
          else {
            setChatText('')
            setChatMessages(data.messages ?? [])
          }
        } catch {
          setError('发送失败')
        } finally {
          setBusy('')
        }
      }

      const visitFriend = async (dfyId) => {
        setBusy(`visit-${dfyId}`)
        setError('')
        try {
          const data = await postJson('/friends/visit', { dfyId })
          if (!data.ok) setError(data.message ?? '串门失败')
          else await refreshMe()
        } catch {
          setError('串门失败')
        } finally {
          setBusy('')
        }
      }

      const openFriendDetail = async (petId) => {
        if (!petId) return
        try {
          const data = await call(`/pets/${petId}/detail`)
          if (data?.ok) setFriendDetail(data)
          else setError(data?.message ?? '查看资料失败（需要先加好友）')
        } catch {
          setError('查看资料失败')
        }
      }

      const claimOffline = async () => {
        setBusy('offline')
        setError('')
        try {
          const data = await postJson('/offline/claim', {})
          if (!data.ok) setError(data.message ?? '领取失败')
          else {
            setNotice(`离线奖励：+${data.reward?.coins ?? 0} 鱼饼、+${data.reward?.xp ?? 0} 经验`)
            await refreshMe()
          }
        } catch {
          setError('领取失败')
        } finally {
          setBusy('')
        }
      }

      const loadThread = async (dfyId) => {
        try {
          const data = await call(`/messages/thread?dfyId=${encodeURIComponent(dfyId)}`)
          if (data?.ok) {
            setThreadPeer({ ...data.peer, friend: Boolean(data.friend) })
            setThreadMessages(data.messages ?? [])
            setThreadInput('')
            setThreadFriendRequested(false)
            return true
          }
          setError(data?.message ?? '打开会话失败')
        } catch {
          setError('打开会话失败')
        }
        return false
      }

      const openThread = async (dfyId) => {
        await loadThread(dfyId)
        openTab('messages')
        await refreshMessages()
      }

      const sendThreadMessage = async () => {
        if (!threadPeer?.dfyId || !threadInput.trim()) return
        setBusy('dm')
        setError('')
        try {
          const data = await postJson('/messages/send', { toDfyId: threadPeer.dfyId, text: threadInput.trim() })
          if (!data.ok) setError(data.message ?? '发送失败')
          else {
            setThreadInput('')
            await refreshThread()
            await refreshMessages()
          }
        } catch {
          setError('发送失败')
        } finally {
          setBusy('')
        }
      }

      const markMessagesRead = async () => {
        setBusy('messages-read')
        try {
          const data = await postJson('/messages/read', {})
          if (data.ok) await refreshMessages()
        } catch {
          /* 忽略 */
        } finally {
          setBusy('')
        }
      }

      const clearMessages = async (mode) => {
        const thread = mode === 'thread'
        if (thread && !threadPeer?.dfyId) return
        const text = thread ? '确定清除当前会话的全部消息吗？' : '确定清除全部消息吗？'
        if (typeof window !== 'undefined' && typeof window.confirm === 'function' && !window.confirm(text)) return
        setBusy(thread ? 'messages-clear-thread' : 'messages-clear')
        setError('')
        try {
          const path = thread
            ? `/messages/thread?dfyId=${encodeURIComponent(threadPeer.dfyId)}`
            : '/messages'
          const data = await call(path, { method: 'DELETE' })
          if (!data?.ok) {
            setError(data?.message ?? '清除消息失败')
            return
          }
          if (thread) {
            setThreadMessages([])
          } else {
            setThreadPeer(null)
            setThreadMessages([])
            setMessages([])
            setOlderMessages([])
            setMessagesHasMore(false)
          }
          await refreshMessages()
          setNotice(thread ? '会话已清除' : '全部消息已清除')
        } catch {
          setError('清除消息失败')
        } finally {
          setBusy('')
        }
      }

      const togglePublicInteract = async () => {
        setBusy('settings')
        try {
          const next = !(me?.settings?.publicInteract ?? true)
          const data = await postJson('/settings', { publicInteract: next })
          if (!data.ok) setError(data.message ?? '设置失败')
          else await refreshMe()
        } catch {
          setError('设置失败')
        } finally {
          setBusy('')
        }
      }

      const giftFriend = async (dfyId) => {
        setBusy(`gift-${dfyId}`)
        setError('')
        try {
          const data = await postJson('/gifts', { dfyId, amount: 10 })
          if (!data.ok) setError(data.message ?? '送礼失败')
          else await refreshMe()
        } catch {
          setError('送礼失败')
        } finally {
          setBusy('')
        }
      }

      const drawFortune = async () => {
        setBusy('fortune')
        setError('')
        try {
          const data = await postJson('/fortune', {})
          if (!data.ok) setError(data.message ?? '抽签失败')
          else {
            setFortune({ drawn: true, fortune: data.fortune })
            await refreshMe()
          }
        } catch {
          setError('抽签失败')
        } finally {
          setBusy('')
        }
      }

      const claimMakeup = async () => {
        setBusy('checkin-makeup')
        setError('')
        try {
          const data = await postJson('/checkin/makeup', {})
          if (!data.ok) setError(data.message ?? '补签失败')
          else {
            setCheckin(data.checkin ?? null)
            await refreshMe()
          }
        } catch {
          setError('补签失败')
        } finally {
          setBusy('')
        }
      }

      const claimMonthlyCheckin = async () => {
        setBusy('checkin-monthly')
        setError('')
        try {
          const data = await postJson('/checkin/monthly', {})
          if (!data.ok) setError(data.message ?? '领取失败')
          else {
            setCheckin(data.checkin ?? null)
            await refreshMe()
          }
        } catch {
          setError('领取失败')
        } finally {
          setBusy('')
        }
      }

      const doCheckin = async () => {
        setBusy('checkin')
        setError('')
        try {
          const data = await postJson('/checkin', {})
          if (!data.ok) setError(data.message ?? '签到失败')
          else {
            setCheckin(data.checkin ?? null)
            await refreshMe()
          }
        } catch {
          setError('签到失败')
        } finally {
          setBusy('')
        }
      }

      const claimWeeklyQuest = async (id) => {
        setBusy(`week-${id}`)
        try {
          const data = await postJson('/weekly-quests/claim', { id })
          if (!data.ok) setError(data.message ?? '领取失败')
          else {
            setWeeklyQuests(data.quests ?? [])
            await refreshMe()
          }
        } catch {
          setError('领取失败')
        } finally {
          setBusy('')
        }
      }

      const setPetTitle = async (titleId) => {
        setBusy(`title-${titleId || 'off'}`)
        setError('')
        try {
          const data = await postJson('/pet/title', { titleId })
          if (!data.ok) setError(data.message ?? '设置失败')
          else await refreshMe()
        } catch {
          setError('设置失败')
        } finally {
          setBusy('')
        }
      }

      const shareAchievement = async (id) => {
        setBusy(`share-${id}`)
        setError('')
        try {
          const data = await postJson('/achievements/share', { id })
          if (!data.ok) setError(data.message ?? '分享失败')
          else await refreshChat()
        } catch {
          setError('分享失败')
        } finally {
          setBusy('')
        }
      }

      const claimQuest = async (id) => {
        setBusy(`quest-${id}`)
        try {
          const data = await postJson('/quests/claim', { id })
          if (!data.ok) setError(data.message ?? '领取失败')
          else {
            setQuests(data.quests ?? [])
            await refreshMe()
          }
        } catch {
          setError('领取失败')
        } finally {
          setBusy('')
        }
      }

      const startExplore = async () => {
        setBusy('explore')
        setError('')
        try {
          const data = await postJson('/explore/start', {})
          if (!data.ok) setError(data.message ?? '出发失败')
          await refreshMe()
        } catch {
          setError('出发失败')
        } finally {
          setBusy('')
        }
      }

      const giftItem = async (id, dfyId) => {
        setBusy(`gift-${id}`)
        setError('')
        try {
          const data = await postJson('/inventory/gift', { id, dfyId })
          if (!data.ok) setError(data.message ?? '赠送失败')
          else {
            setGiftingId(0)
            await refreshBag()
          }
        } catch {
          setError('赠送失败')
        } finally {
          setBusy('')
        }
      }

      const dismantleItem = async (id) => {
        setBusy(`dismantle-${id}`)
        setError('')
        try {
          const data = await postJson('/inventory/dismantle', { id })
          if (!data.ok) setError(data.message ?? '分解失败')
          else await refreshBag()
        } catch {
          setError('分解失败')
        } finally {
          setBusy('')
        }
      }

      const equipItem = async (id) => {
        setBusy(`equip-${id}`)
        try {
          const data = await postJson('/inventory/equip', { id })
          if (!data.ok) setError(data.message ?? '穿不上')
          await refreshBag()
          await refreshMe()
        } catch {
          setError('穿不上')
        } finally {
          setBusy('')
        }
      }

      const upgradeItem = async (id) => {
        setBusy(`upgrade-${id}`)
        try {
          const data = await postJson('/inventory/upgrade', { id })
          if (!data.ok) setError(data.message ?? '强化失败')
          await refreshBag()
          await refreshMe()
        } catch {
          setError('强化失败')
        } finally {
          setBusy('')
        }
      }

      const buyItem = async (code) => {
        setBusy(`buy-${code}`)
        try {
          const data = await postJson('/shop/buy', { code })
          if (!data.ok) setError(data.message ?? '买不了')
          await refreshBag()
          await refreshMe()
        } catch {
          setError('买不了')
        } finally {
          setBusy('')
        }
      }

      useEffect(() => {
        if (!open) return undefined
        if (tab !== 'bag') return undefined
        void refreshBag()
        return undefined
      }, [open, tab, refreshBag])

      const requestFriend = async (dfyId) => {
        const target = (dfyId ?? '').trim()
        if (!target) return false
        setBusy('friend-add')
        setError('')
        try {
          const data = await postJson('/friends/request', { dfyId: target })
          if (!data.ok) {
            setError(data.message ?? '加好友失败')
            return false
          }
          await refreshFriends()
          setNotice('好友申请已发送')
          return true
        } catch {
          setError('加好友失败')
          return false
        } finally {
          setBusy('')
        }
      }

      const addFriend = async () => {
        const ok = await requestFriend(friendDfy.trim())
        if (ok) setFriendDfy('')
      }

      const acceptFriend = async (dfyId) => {
        setBusy(`friend-accept-${dfyId}`)
        try {
          const data = await postJson('/friends/accept', { dfyId })
          if (!data.ok) setError(data.message ?? '接受失败')
          await refreshFriends()
        } catch {
          setError('接受失败')
        } finally {
          setBusy('')
        }
      }

      const removeFriend = async (dfyId) => {
        setBusy(`friend-remove-${dfyId}`)
        try {
          await postJson('/friends/remove', { dfyId })
          await refreshFriends()
        } catch {
          setError('删除失败')
        } finally {
          setBusy('')
        }
      }

      const createCoop = async () => {
        setBusy('coop-create')
        setError('')
        try {
          const data = await postJson('/coop/create', { jobId, minutes })
          if (!data.ok) setError(data.message ?? '发起结伴失败')
          else {
            setCoopRoom(data.coop ?? null)
            setCoopCode(data.code ?? data.coop?.code ?? '')
            await refreshFriends()
            setNotice('结伴房间已创建，等好友准备')
          }
        } catch {
          setError('发起结伴失败')
        } finally {
          setBusy('')
        }
      }

      const joinCoopFriend = async (dfyId) => {
        const target = (dfyId ?? '').trim()
        if (!target) return
        setBusy('coop-join-friend')
        setError('')
        try {
          const data = await postJson('/coop/join-friend', { dfyId: target })
          if (!data.ok) setError(data.message ?? '加入结伴失败')
          else {
            setCoopRoom(data.coop ?? null)
            setCoopCode(data.code ?? data.coop?.code ?? '')
            setCoopFriendPick('')
            setCoopFriendQuery('')
            setNotice('已进入好友的结伴房间')
          }
        } catch {
          setError('加入结伴失败')
        } finally {
          setBusy('')
        }
      }

      const joinCoop = async () => {
        const code = coopInput.trim().toUpperCase()
        if (!code) return
        setBusy('coop-join')
        setError('')
        try {
          const data = await postJson('/coop/join', { code })
          if (!data.ok) setError(data.message ?? '加入结伴失败')
          else {
            setCoopRoom(data.coop ?? null)
            setCoopCode(data.code ?? data.coop?.code ?? code)
            setCoopInput('')
            setNotice('已加入结伴房间')
          }
        } catch {
          setError('加入结伴失败')
        } finally {
          setBusy('')
        }
      }

      const coopReady = async () => {
        setBusy('coop-ready')
        setError('')
        try {
          const data = await postJson('/coop/ready', { ready: !coopRoom?.youReady })
          if (!data.ok) setError(data.message ?? '准备失败')
          else {
            setCoopRoom(data.coop ?? null)
            await refreshMe()
          }
        } catch {
          setError('准备失败')
        } finally {
          setBusy('')
        }
      }

      const coopStart = async () => {
        setBusy('coop-start')
        setError('')
        try {
          const data = await postJson('/coop/start', {})
          if (!data.ok) setError(data.message ?? '开始结伴失败')
          else {
            setCoopRoom(data.coop ?? null)
            if (data.coop?.jobId === 'cultivation') {
              beginCultivationPlayback(data.coop?.cultivation)
              setNotice('修仙队伍进入秘境，日志每 5 秒推进')
            } else {
              setNotice('结伴摸鱼开始，和日常摸鱼/下楼溜达互不冲突')
            }
            await refreshMe()
          }
        } catch {
          setError('开始结伴失败')
        } finally {
          setBusy('')
        }
      }

      const coopKick = async (dfyId) => {
        if (!dfyId) return
        if (typeof window !== 'undefined' && typeof window.confirm === 'function'
          && !window.confirm('确定把这位成员请出房间吗？对方 30 秒内不能重新加入。')) return
        setBusy('coop-kick')
        setError('')
        try {
          const data = await postJson('/coop/kick', { dfyId })
          if (!data.ok) setError(data.message ?? '踢人失败')
          else {
            setCoopRoom(data.coop ?? null)
            setNotice('已请出该成员')
          }
        } catch {
          setError('踢人失败')
        } finally {
          setBusy('')
        }
      }

      const coopLeave = async () => {
        if (typeof window !== 'undefined' && typeof window.confirm === 'function'
          && !window.confirm(coopRoom?.isHost ? '解散这个结伴房间？' : '离开结伴房间？')) return
        setBusy('coop-leave')
        setError('')
        try {
          const data = await postJson('/coop/leave', {})
          if (!data.ok) setError(data.message ?? '离开房间失败')
          else {
            setCoopRoom(null)
            setCoopCode('')
            await refreshFriends()
            setNotice('已离开结伴房间')
          }
        } catch {
          setError('离开房间失败')
        } finally {
          setBusy('')
        }
      }

      const coopDismiss = () => {
        setCoopRoom(null)
        setCoopCode('')
      }

      const exportData = async () => {
        setBusy('export')
        setError('')
        try {
          const data = await call('/export')
          if (!data?.ok) {
            setError(data?.message ?? '导出失败')
            return
          }
          const text = JSON.stringify(data, null, 2)
          try {
            await navigator.clipboard.writeText(text)
            setNotice(`已导出并复制到剪贴板（${(text.length / 1024).toFixed(1)} KB）`)
          } catch {
            const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
            const link = document.createElement('a')
            link.href = url
            link.download = `dafiyu-${Date.now()}.json`
            link.click()
            URL.revokeObjectURL(url)
            setNotice('已生成导出文件')
          }
        } catch {
          setError('导出失败')
        } finally {
          setBusy('')
        }
      }

      const changeRegion = async () => {
        if (!regionSel.province) return
        setBusy('region')
        setError('')
        try {
          const data = await postJson('/pet/region', { regionCode: regionSel.province })
          if (!data.ok) setError(data.message ?? '切换地区失败')
          else {
            setNotice(`已搬到 ${data.region?.display ?? '新地区'}`)
            await refreshMe()
          }
        } catch {
          setError('切换地区失败')
        } finally {
          setBusy('')
        }
      }

      const saveBio = async () => {
        setBusy('bio')
        setError('')
        try {
          const data = await postJson('/pet/bio', { text: bioInput.trim() })
          if (!data.ok) setError(data.message ?? '签名保存失败')
          else {
            setBioEditing(false)
            await refreshMe()
          }
        } catch {
          setError('签名保存失败')
        } finally {
          setBusy('')
        }
      }

      const renamePet = async () => {
        const name = renameName.trim()
        if (!name) return
        setBusy('rename')
        setError('')
        try {
          const data = await postJson('/pet/rename', { text: name })
          if (!data.ok) setError(data.message ?? '改名失败')
          else {
            setRenameName('')
            await refreshMe()
          }
        } catch {
          setError('改名失败')
        } finally {
          setBusy('')
        }
      }

      const deleteAccount = async () => {
        if (!confirmDelete) {
          setConfirmDelete(true)
          setError('再点一次「确认删除」会永久删掉账号和所有进度，无法恢复。')
          return
        }
        setBusy('delete')
        setError('')
        try {
          const data = await postJson('/account/delete', { confirm: 'DELETE' })
          if (!data.ok) {
            setError(data.message ?? '删除失败')
            return
          }
          setConfirmDelete(false)
          await unpair()
          setOpen(false)
        } catch {
          setError('删除失败')
        } finally {
          setBusy('')
        }
      }

      const logout = async () => {
        if (!confirmLogout) {
          setConfirmLogout(true)
          setNotice('暂离不会退出登录。再点一次「确认退出」会清除本机登录，需要重新加入大肥鱼世界。')
          return
        }
        try {
          await unpair()
          setConfirmLogout(false)
          setOpen(false)
        } catch {
          setError('退出登录失败')
        }
      }

      const unpair = async () => {
        setBusy('reset')
        try {
          await postJson('/pair/reset')
          setProfile(null)
          await refreshStatus()
        } finally {
          setBusy('')
        }
      }

      if (!open) return null

      const paired = Boolean(status?.paired)
      const pending = status?.pending
      const me = profile
      const myId = status?.petId
      const shift = me?.shift
      const today = me?.today
      const caps = me?.caps ?? { xp: 800, coins: 300 }
      const earnedXp = shift?.earned?.xp ?? 0
      const earnedCoins = shift?.earned?.coins ?? 0
      const shownXp = Math.min(caps.xp, today?.xp ?? 0)
      const shownCoins = Math.min(caps.coins, today?.coins ?? 0)

      const coopCard = (() => {
        const room = coopRoom
        const pct = (value) => `${value >= 1 ? '+' : ''}${Math.round((value - 1) * 100)}%`
        const roomStatusText = room?.status === 'waiting' ? '等待准备'
          : room?.status === 'active' ? '摸鱼进行中'
            : room?.status === 'finished' ? '已完成'
              : ''
        const memberRow = (member) => h(
          'div',
          { key: member.petId, style: { ...styles.row, padding: '5px 0', borderBottom: `1px solid ${DFY_BORDER}` } },
          h('span', { style: { flex: '1 1 130px' } }, `${member.name}${member.host ? '（房主）' : ''}`),
          h('span', { style: styles.meta }, `${member.dfyId ?? ''} · Lv.${member.level}`),
          h('span', { style: styles.badge }, member.ready ? '已准备' : '未准备'),
          room?.isHost && !member.host
            ? h('button', {
                style: { ...styles.link, marginLeft: 6 },
                onClick: () => void coopKick(member.dfyId),
                disabled: busy === 'coop-kick',
              }, '踢出')
            : null,
        )
        const friendRows = coopFriendMatches.length
          ? coopFriendMatches.map((friend) => {
              const coopEntry = coopFriends.find((entry) => entry.dfyId === friend.dfyId)
              const friendRoom = coopEntry?.coop
              return h(
                'div',
                { key: friend.dfyId, style: { ...styles.row, padding: '5px 0', borderBottom: `1px solid ${DFY_BORDER}` } },
                h('span', { style: { flex: '1 1 120px' } }, `${friend.name} · ${friend.dfyId ?? ''}`),
                h('span', { style: styles.meta }, friendRoom
                  ? `${friendRoom.status === 'active' ? '结伴中' : '等准备'} · ${friendRoom.memberCount}/${friendRoom.maxMembers} · ${friendRoom.code}`
                  : '未在结伴'),
                friendRoom?.canJoin
                  ? h('button', {
                      style: styles.btnGhost,
                      onClick: () => void joinCoopFriend(friend.dfyId),
                      disabled: busy === 'coop-join-friend',
                    }, '加入房间')
                  : friendRoom
                    ? h('span', { style: styles.meta }, friendRoom.status === 'active' ? '已开始' : '不可加入')
                    : null,
              )
            })
          : h('div', { style: styles.hint }, friends.length === 0 ? '还没有好友。去「世界」加好友后才能结伴。' : '没有符合搜索条件的好友。')

        const roomMembers = room?.members?.length
          ? room.members.map(memberRow)
          : h('div', { style: styles.hint }, '还没有成员。')

        const roomCompat = room?.compat
          ? h(
              'div',
              { style: { marginTop: 8 } },
              h('div', { style: styles.hint }, `相性叠加：鱼饼 ${pct(room.compat.coinMult)} · 经验 ${pct(room.compat.xpMult)} · ${room.compat.pairs} 对关系`),
              renderCompatLine(room.compat),
            )
          : null

        if (!room) {
          return h(
            'div',
            { style: styles.card },
            h(
              'div',
              { style: styles.row },
              h('span', { style: { fontWeight: 600 } }, '结伴摸鱼'),
              h('span', { style: styles.meta }, '房间制 · 最多 4 人 · 与日常摸鱼/下楼溜达并行'),
            ),
            h(
              'div',
              { style: { ...styles.row, marginTop: 8, flexWrap: 'wrap' } },
              h(
                'select',
                { style: { ...styles.select, flex: '1 1 140px' }, value: jobId, onChange: (event) => setJobId(event.target.value) },
                jobs.length
                  ? jobs.map((job) => h('option', { key: job.id, value: job.id, disabled: !job.unlocked }, `${job.name}${job.unlocked ? '' : `（Lv.${job.unlockLevel}）`}`))
                  : [h('option', { key: 'convenience', value: 'convenience' }, '便利店店员')],
              ),
              h(
                'select',
                { style: { ...styles.select, flex: '0 0 110px' }, value: minutes, onChange: (event) => setMinutes(Number(event.target.value)) },
                [15, 30, 60].map((value) => h('option', { key: value, value }, `${value} 分钟`)),
              ),
              h('button', { style: styles.btn, onClick: createCoop, disabled: busy === 'coop-create' }, '创建房间'),
            ),
            h('div', { style: styles.hint }, '创建后会进入等待房间；好友可以点击你的房间直接加入。'),
            h(
              'div',
              { style: { ...styles.row, marginTop: 10, flexWrap: 'wrap' } },
              h('input', {
                style: { ...styles.select, flex: '1 1 170px' },
                placeholder: '输入房间码，例如 COOP-AB12',
                maxLength: 16,
                value: coopInput,
                onChange: (event) => setCoopInput(event.target.value.toUpperCase()),
                onKeyDown: (event) => {
                  if (event.key === 'Enter') void joinCoop()
                },
              }),
              h('button', { style: styles.btnGhost, onClick: joinCoop, disabled: busy === 'coop-join' || !coopInput.trim() }, '用房间码加入'),
            ),
            h('div', { style: { marginTop: 12 } }, h('div', { style: styles.hint }, '好友的结伴状态'), friendRows),
            h('div', { style: styles.hint }, '每个房间最多 4 人；结伴奖励和日常摸鱼、下楼溜达分别结算，不会互相取消。'),
          )
        }

        return h(
          'div',
          { style: { ...styles.card, borderColor: room.status === 'active' ? COLORS.ok : DFY_BORDER } },
          h(
            'div',
            { style: styles.row },
            h('span', { style: { fontWeight: 600 } }, room.jobId === 'cultivation' ? '修仙队伍' : '结伴摸鱼'),
            h('span', { style: styles.badge }, roomStatusText),
            h('span', { style: styles.meta }, `${room.code} · ${room.jobName}${room.areaName ? ` · ${room.areaName}` : ''} · ${room.jobId === 'cultivation' ? '即时战斗' : `${room.minutes} 分钟`} · ${room.memberCount}/${room.maxMembers}`),
          ),
          h('div', { style: { ...styles.row, marginTop: 8 } }, roomMembers),
          roomCompat,
          room.status === 'waiting'
            ? h(
                'div',
                null,
                h('div', { style: styles.hint }, `房主：${room.hostName} · 已准备 ${room.readyCount}/${room.memberCount} · 房间最多 4 人`),
                h(
                  'div',
                  { style: { ...styles.row, marginTop: 8, flexWrap: 'wrap' } },
                  h('button', { style: room.youReady ? styles.btnGhost : styles.btn, onClick: coopReady, disabled: busy === 'coop-ready' }, room.youReady ? '取消准备' : '准备'),
                  room.isHost
                    ? h('button', { style: styles.btn, onClick: coopStart, disabled: busy === 'coop-start' || !room.canStart }, room.canStart ? '开始结伴摸鱼' : '等全员准备')
                    : h('span', { style: styles.meta }, '等房主开始'),
                  h('button', { style: styles.btnGhost, onClick: coopLeave, disabled: busy === 'coop-leave' }, room.isHost ? '解散房间' : '离开房间'),
                ),
                h('div', { style: styles.hint }, '全员准备后房主才能开始；开始后和日常摸鱼/下楼溜达同时进行。'),
              )
            : room.status === 'active'
              ? h(
                  'div',
                  null,
                  h('div', { style: styles.hint }, `进行中，剩余 ${remainText(room.endsAt ?? Date.now(), 0)}；与日常摸鱼/下楼溜达并行，互不取消。`),
                  h('div', { style: styles.hint }, '结束后奖励会自动结算，不需要手动领取。'),
                )
              : h(
                  'div',
                  null,
                  h('div', { style: styles.hint }, '这次结伴摸鱼已完成，奖励已到账。'),
                  room.viewerReward
                    ? h('div', { style: styles.hint }, `本次获得 +${room.viewerReward.coins} 鱼饼 · +${room.viewerReward.xp} 经验`)
                    : null,
                  h(
                    'div',
                    { style: { ...styles.row, marginTop: 8 } },
                    h('button', { style: styles.btnGhost, onClick: coopDismiss }, '收起'),
                    h('button', { style: styles.btnGhost, onClick: coopLeave, disabled: busy === 'coop-leave' }, '离开房间'),
                  ),
                ),
          room.status === 'waiting' ? h('div', { style: { marginTop: 12 } }, h('div', { style: styles.hint }, '好友的结伴状态'), friendRows) : null,
        )
      })()

      const cultivationCard = (() => {
        const path = me?.cultivation
        if (!path) return null
        const stats = path.stats ?? {}
        const lastLog = path.lastLog
        const cultivationTitle = path.title ?? '炼气一层'
        const cultivationLevel = path.cultivationLevel ?? 1
        const cultivationXp = path.cultivationXp ?? 0
        const cultivationNext = path.nextXp ?? 1
        const cultivationProgress = Math.max(0, Math.min(1, path.progress ?? 0))
        const boardEntries = cultivationBoard?.entries ?? []
        const history = path.history ?? []
        const areas = path.areas ?? []
        const skills = path.skills ?? []
        const materials = path.materials ?? []
        const pills = path.pills ?? []
        const breakthroughMajor = Boolean(path.breakthroughMajor)
        const selectedPill = pills.find((pill) => pill.code === cultivationPill) ?? null
        const baseChance = Math.round((path.breakthroughChance ?? 0) * 1000) / 10
        const activeChance = selectedPill ? selectedPill.chanceWithPill : baseChance
        const runInProgress = Boolean(cultivationPlayback && !cultivationPlayback.done)
        const serverRunCooldown = Math.max(0, path.runCooldownMs ?? 0)
        const runLocked = runInProgress || serverRunCooldown > 0
        const cooldownSeconds = Math.max(0, Math.ceil(serverRunCooldown / 1000))
        const selectedArea = areas.find((area) => area.id === cultivationArea)
          ?? areas.find((area) => area.unlocked) ?? areas[0] ?? null
        const selectedAreaId = selectedArea?.id ?? ''
        const statBox = (label, value) => h(
          'div',
          { style: { border: `1px solid ${DFY_BORDER}`, borderRadius: 8, padding: '6px 8px', textAlign: 'center' } },
          h('div', { style: { ...styles.meta, fontSize: 11 } }, label),
          h('div', { style: { fontWeight: 700, fontFamily: 'Consolas, "Courier New", monospace' } }, value),
        )
        const playback = cultivationPlayback
        const elapsed = playback?.elapsed ?? 300
        const playbackDone = playback?.done ?? true
        const allSegments = playback?.segments
          ?? lastLog?.segments
          ?? (lastLog?.battleLog ? String(lastLog.battleLog).split('\n') : [])
        const visibleSegments = playback
          ? allSegments.filter((line) => {
              const match = /^\[(\d{2}):(\d{2})\]/.exec(line)
              if (!match) return true
              return Number(match[1]) * 60 + Number(match[2]) <= elapsed
            })
          : allSegments
        const harvestText = playback
          ? (playbackDone ? playback.harvestLog : '')
          : String(lastLog?.harvestLog ?? '')
        const currentLoot = playback ? (playback.loot ?? []) : (lastLog?.loot ?? [])
        const lootColor = (item) => item.rarity >= 4 ? '#ffb347'
          : item.rarity === 3 ? '#c084fc'
            : item.rarity === 2 ? '#60a5fa' : '#9ca3af'
        const logLine = (line, index) => h(
          'div',
          {
            key: index,
            style: {
              padding: '1px 0',
              color: /装备|掉落/.test(line)
                ? (/传说/.test(line) ? '#ffb347'
                  : /史诗/.test(line) ? '#c084fc'
                    : /稀有/.test(line) ? '#60a5fa'
                      : /普通/.test(line) ? '#9ca3af' : COLORS.ok)
                : COLORS.text,
              fontWeight: /装备|掉落|材料/.test(line) ? 700 : 400,
              background: /装备|掉落|材料/.test(line) ? DFY_BADGE_BG : 'transparent',
              borderRadius: /装备|掉落|材料/.test(line) ? 4 : 0,
            },
          },
          line,
        )
        const logBlock = (playback || lastLog)
          ? h(
              'div',
              { style: { marginTop: 10, borderTop: `1px solid ${DFY_BORDER}`, paddingTop: 10 } },
              h(
                'div',
                { style: { ...styles.row, marginBottom: 4 } },
                h('span', { style: { fontWeight: 600 } }, '⚔ 秘境战斗日志'),
                playback
                  ? h('span', { style: styles.meta }, `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')} / 5:00 · 每 5 秒推进`)
                  : h('span', { style: styles.meta }, '最近一次修行'),
              ),
              playback
                ? h(
                    'div',
                    { style: { height: 5, borderRadius: 999, background: DFY_TRACK_BG, overflow: 'hidden', marginBottom: 6 } },
                    h('div', { style: { width: `${Math.round(elapsed / 300 * 100)}%`, height: '100%', background: COLORS.brand } }),
                  )
                : null,
              h(
                'div',
                {
                  style: {
                    margin: 0,
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: DFY_GHOST_BG,
                    border: `1px solid ${DFY_BORDER_SOFT}`,
                    maxHeight: 280,
                    overflow: 'auto',
                    fontFamily: 'Consolas, "Courier New", monospace',
                    fontSize: 12,
                    lineHeight: 1.65,
                  },
                },
                visibleSegments.map(logLine),
                playback && !playbackDone
                  ? h('div', { style: { ...styles.hint, marginTop: 6 } }, '静候 5 秒，秘境还在继续…')
                  : null,
              ),
              playbackDone && harvestText
                ? h(
                    'div',
                    null,
                    h('div', { style: { fontWeight: 600, margin: '8px 0 4px' } }, '🌾 收获日志'),
                    h('pre', {
                      style: {
                        margin: 0,
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: DFY_GHOST_BG,
                        border: `1px solid ${DFY_BORDER_SOFT}`,
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'Consolas, "Courier New", monospace',
                        fontSize: 12,
                        lineHeight: 1.7,
                        color: COLORS.text,
                      },
                    }, harvestText),
                  )
                : null,
              playbackDone && lastLog
                ? h(
                    'div',
                    null,
                    h('div', { style: { fontWeight: 600, margin: '8px 0 4px' } }, '☯ 机缘'),
                    h('div', { style: styles.hint }, String(lastLog.opportunity ?? '寻常无事')),
                  )
                : null,
            )
          : h('div', { style: { ...styles.hint, marginTop: 8 } }, '还没有修行记录。入秘境走一遭，回来看看自己的战报。')

        return h(
          'div',
          {
            style: {
              ...styles.card,
              border: `1px solid ${DFY_BORDER}`,
              background: `linear-gradient(180deg, ${DFY_CARD_BG}, ${COLORS.layer1})`,
              fontFamily: 'ui-serif, "Songti SC", "Noto Serif CJK SC", serif',
            },
          },
          h(
            'div',
            { style: styles.row },
            h('div', null,
              h('div', { style: { fontWeight: 700, letterSpacing: 1 } }, '我不上班儿了，我要去修仙！'),
              h('div', { style: styles.meta }, `大肥鱼 Lv.${path.level}（不参与修仙等级）· 修仙 Lv.${cultivationLevel} · 不限次数`),
            ),
            h('span', { style: { ...styles.badge, background: DFY_BADGE_BG } }, cultivationTitle),
          ),
          h(
            'div',
            { style: { ...styles.row, marginTop: 8, flexWrap: 'wrap' } },
            h('span', { style: { fontWeight: 600 } }, `境界：${cultivationTitle}`),
            h('span', { style: styles.meta }, `修为 ${cultivationXp}/${cultivationNext} · 修仙榜第 ${path.rank ?? '—'} 名 · 累计修为 ${path.totalXp ?? 0}`),
          ),
          h(
            'div',
            { style: { height: 6, borderRadius: 999, background: DFY_TRACK_BG, overflow: 'hidden', marginTop: 6 } },
            h('div', { style: { width: `${Math.round(cultivationProgress * 100)}%`, height: '100%', background: COLORS.brand } }),
          ),
          areas.length
            ? h(
                'div',
                { style: { marginTop: 10, padding: '8px 10px', borderRadius: 8, border: `1px solid ${DFY_BORDER_SOFT}`, background: DFY_GHOST_BG } },
                h(
                  'div',
                  { style: { ...styles.row, flexWrap: 'wrap', gap: 6 } },
                  h('span', { style: { fontWeight: 600 } }, '秘境地区'),
                  h(
                    'select',
                    {
                      style: { ...styles.select, flex: '1 1 180px' },
                      value: cultivationArea || selectedAreaId,
                      onChange: (event) => setCultivationArea(event.target.value),
                    },
                    areas.map((area) => h('option', {
                      key: area.id,
                      value: area.id,
                      disabled: !area.unlocked,
                    }, `${area.cleared ? '✓ ' : ''}${area.name}${area.unlocked ? '' : `（需 ${area.requiredTitle}）`}`)),
                  ),
                ),
                selectedArea
                  ? h('div', { style: { ...styles.meta, marginTop: 4 } },
                      `${selectedArea.description} · 敌人：${(selectedArea.enemies ?? []).join('、')} · 收益 x${selectedArea.rewardMult}${selectedArea.cleared ? ` · 已通关 ×${selectedArea.clears}` : ' · 首通奖励待领取'}`)
                  : null,
                selectedArea && !selectedArea.unlocked
                  ? h('div', { style: { ...styles.hint, color: COLORS.err } }, `需要修炼到「${selectedArea.requiredTitle}」才能进入`)
                  : null,
              )
            : null,
          h(
            'div',
            { style: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6, marginTop: 10 } },
            statBox('气血', stats.hp ?? 0),
            statBox('攻击', stats.attack ?? 0),
            statBox('防御', stats.defense ?? 0),
            statBox('身法', stats.speed ?? 0),
            statBox('会心', `${stats.crit ?? 0}%`),
            statBox('幸运', stats.luck ?? 0),
          ),
          h(
            'div',
            { style: { ...styles.row, marginTop: 10, flexWrap: 'wrap' } },
            h('span', { style: { fontWeight: 600 } }, '本命功法'),
            h(
              'select',
              {
                style: { ...styles.select, flex: '1 1 160px' },
                value: path.skillId ?? '',
                onChange: (event) => void setCultivationSkill(event.target.value),
                disabled: busy === 'cultivation-skill',
              },
              skills.map((skill) => h('option', {
                key: skill.id,
                value: skill.id,
                disabled: !skill.unlocked,
              }, `${skill.name} · ${skill.effect === 'heal' ? '治疗' : skill.effect === 'shield' ? '护盾' : '攻击'}${skill.unlocked ? '' : `（需 ${skill.requiredTitle}）`}`)),
            ),
            h('span', { style: styles.meta }, path.skillName ?? ''),
          ),
          h(
            'div',
            { style: { marginTop: 10, padding: '8px 10px', borderRadius: 8, border: `1px solid ${DFY_BORDER_SOFT}`, background: DFY_GHOST_BG } },
            h('div', { style: { fontWeight: 700 } }, '材料与炼丹'),
            h(
              'div',
              { style: { display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 5 } },
              materials.filter((material) => (material.amount ?? 0) > 0).map((material) => h(
                'span',
                { key: material.code, style: { ...styles.meta, padding: '2px 6px', borderRadius: 999, background: DFY_BADGE_BG } },
                `${material.icon ?? ''} ${material.name} ×${material.amount}`,
              )),
              materials.every((material) => (material.amount ?? 0) === 0)
                ? h('span', { style: styles.hint }, '还没有材料，去秘境打怪掉落')
                : null,
            ),
            h(
              'div',
              { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 6, marginTop: 8 } },
              pills.map((pill) => h(
                'div',
                { key: pill.code, style: { border: `1px solid ${DFY_BORDER}`, borderRadius: 8, padding: '6px 8px' } },
                h('div', { style: { fontWeight: 700 } }, `${pill.name} ×${pill.owned ?? 0}`),
                h('div', { style: styles.meta }, `${pill.recipe} · 大境界 +${pill.bonus}%`),
                h(
                  'button',
                  {
                    style: { ...styles.btnGhost, marginTop: 4, padding: '4px 8px' },
                    onClick: () => void craftPill(pill.code),
                    disabled: busy === 'cultivation-alchemy' || !pill.craftable,
                  },
                  pill.craftable ? '炼丹' : '材料不足',
                ),
              )),
            ),
          ),
          path.breakthroughReady
            ? h(
                'div',
                { style: { marginTop: 10, padding: '8px 10px', borderRadius: 8, border: `1px solid ${COLORS.brand}`, background: DFY_BADGE_BG } },
                h('div', { style: { fontWeight: 600 } }, `修为圆满，可冲击「${path.breakthroughTitle ?? '下一境界'}」`),
                breakthroughMajor
                  ? h(
                      'div',
                      { style: { marginTop: 4 } },
                      h('div', { style: { ...styles.meta } }, '大境界突破：不服丹基础成功率仅 10%，可服一颗丹药提升，但最高 90%。'),
                      h(
                        'select',
                        {
                          style: { ...styles.select, width: '100%', marginTop: 4 },
                          value: cultivationPill,
                          onChange: (event) => setCultivationPill(event.target.value),
                        },
                        h('option', { value: '' }, `不服丹 · ${baseChance}%`),
                        pills.filter((pill) => (pill.owned ?? 0) > 0).map((pill) => h(
                          'option',
                          { key: pill.code, value: pill.code },
                          `${pill.name}（${pill.owned}颗）· ${pill.chanceWithPill}%`,
                        )),
                      ),
                    )
                  : h('div', { style: { ...styles.meta, marginTop: 2 } }, `小境界突破成功率 ${baseChance}% · 无需服丹`),
                h('div', { style: { ...styles.meta, marginTop: 2 } }, `本次成功率 ${activeChance}% · 失败会损失当前修为的 1/3`),
                h('button', {
                  style: { ...styles.btn, marginTop: 6 },
                  onClick: breakthroughCultivation,
                  disabled: busy === 'cultivation-breakthrough',
                }, busy === 'cultivation-breakthrough' ? '冲击中…' : '冲击境界'),
              )
            : null,
          h(
            'div',
            { style: { ...styles.row, marginTop: 10, flexWrap: 'wrap' } },
            h('button', {
              style: styles.btn,
              onClick: startCultivation,
              disabled: busy === 'cultivation' || !path.unlocked
                || Boolean(selectedArea && !selectedArea.unlocked) || runLocked,
            }, !path.unlocked ? `Lv.${path.unlockLevel} 解锁` : selectedArea && !selectedArea.unlocked
              ? '境界不足' : runInProgress ? '秘境进行中…' : serverRunCooldown > 0
                ? `秘境冷却 ${cooldownSeconds}s` : '独自入秘境'),
            h('button', {
              style: styles.btnGhost,
              onClick: createCultivationCoop,
              disabled: busy === 'cultivation-coop' || !path.unlocked
                || Boolean(selectedArea && !selectedArea.unlocked) || runLocked,
            }, '组队修仙'),
            coopRoom?.jobId === 'cultivation'
              ? h('span', { style: styles.meta }, `队伍 ${coopRoom.code} · ${coopRoom.status === 'waiting' ? '等准备' : '战斗中'}`)
              : null,
          ),
          h('div', { style: styles.hint }, '装备的攻/防/血/速会直接参与战斗；队伍相性相合会加成收益，相冲会减成。'),
          coopRoom?.jobId === 'cultivation'
            ? h('div', { style: { ...styles.hint, marginTop: 6 } }, '组队房间在下方「结伴摸鱼」卡片中，全员准备后由房主开始。')
            : null,
          boardEntries.length
            ? h(
                'div',
                { style: { marginTop: 10, borderTop: `1px solid ${DFY_BORDER}`, paddingTop: 10 } },
                h('div', { style: { ...styles.row } },
                  h('span', { style: { fontWeight: 600 } }, '☯ 修仙榜'),
                  h('span', { style: styles.meta }, `${cultivationScope === 'global' ? '全服' : cultivationScope === 'friends' ? '好友' : '本市'} · 共 ${cultivationBoard?.total ?? boardEntries.length} 位修士`),
                ),
                h(
                  'div',
                  { style: { ...styles.row, gap: 6, marginTop: 4, flexWrap: 'wrap' } },
                  [['global', '全服'], ['friends', '好友'], ['city', '本市']].map(([value, label]) =>
                    h('button', {
                      key: value,
                      style: styles.tab(cultivationScope === value),
                      onClick: () => setCultivationScope(value),
                    }, label),
                  ),
                ),
                h(
                  'div',
                  { style: { marginTop: 4 } },
                  boardEntries.slice(0, 10).map((entry) => h(
                    'div',
                    {
                      key: entry.petId,
                      style: {
                        ...styles.row,
                        padding: '3px 0',
                        borderBottom: `1px solid ${DFY_BORDER_SOFT}`,
                        fontWeight: entry.mine ? 700 : 400,
                      },
                    },
                    h('span', { style: { ...styles.meta, width: 32 } }, `#${entry.rank}`),
                    h('span', { style: { flex: 1 } }, entry.name),
                    h('span', { style: styles.meta }, entry.cultivationTitle ?? entry.label),
                  )),
                ),
              )
            : null,
          history.length
            ? h(
                'div',
                { style: { marginTop: 10, borderTop: `1px solid ${DFY_BORDER}`, paddingTop: 10 } },
                h('div', { style: { fontWeight: 600 } }, '📜 修行札记'),
                h(
                  'div',
                  { style: { marginTop: 4 } },
                  history.map((entry) => h(
                    'div',
                    { key: entry.id, style: { ...styles.row, padding: '2px 0', gap: 6 } },
                    h('span', { style: styles.meta }, `#${entry.id}`),
                    h('span', { style: { flex: 1 } }, `${entry.outcome === 'victory' ? '胜' : '败'} · ${entry.enemy}`),
                    h('span', { style: styles.meta }, `修为 +${entry.xp ?? 0} · 鱼饼 +${entry.coins ?? 0}`),
                  )),
                ),
              )
            : null,
          logBlock,
          currentLoot.length
            ? h(
                'div',
                { style: { marginTop: 10, borderTop: `1px solid ${DFY_BORDER}`, paddingTop: 10 } },
                h('div', { style: { fontWeight: 600, marginBottom: 4 } }, '🎁 本次掉落'),
                h(
                  'div',
                  { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
                  currentLoot.map((item, index) => h(
                    'span',
                    {
                      key: `${item.kind}-${item.code}-${index}`,
                      style: {
                        padding: '3px 8px',
                        borderRadius: 999,
                        border: `1px solid ${lootColor(item)}`,
                        color: lootColor(item),
                        background: DFY_BADGE_BG,
                        fontWeight: 700,
                        fontSize: 12,
                      },
                    },
                    `${item.icon ?? ''} ${item.name}${item.kind === 'material' ? ` ×${item.amount}` : ` · ${item.rarityName}`}`,
                  )),
                ),
              )
            : null,
        )
      })()

      const cultivationEntry = me?.cultivation
        ? h(
            'div',
            { style: styles.card },
            h(
              'div',
              { style: styles.row },
              h(
                'div',
                null,
                h('div', { style: { fontWeight: 700 } }, '我不上班儿了，我要去修仙！'),
                h('div', { style: styles.meta }, `独立境界「${me.cultivation.title ?? '炼气一层'}」· 八处秘境 · 手动突破 · 本命功法`),
              ),
              h('span', { style: { ...styles.badge, background: DFY_BADGE_BG } }, '独立玩法'),
            ),
            h('div', { style: { ...styles.hint, marginTop: 6 } }, '秘境每次约 5 分钟：前 4 分钟普通/精英怪，最后 1 分钟首领。需从独立修仙窗口进入。'),
            h(
              'button',
              { style: { ...styles.btn, marginTop: 8 }, onClick: () => setCultivationOpen(true) },
              '打开修仙秘境',
            ),
          )
        : null

      const cultivationTeamPanel = (() => {
        if (coopRoom?.jobId === 'cultivation') {
          const members = coopRoom.members ?? []
          return h(
            'div',
            { style: { ...styles.card, marginTop: 10, border: `1px solid ${DFY_BORDER}` } },
            h(
              'div',
              { style: styles.row },
              h('span', { style: { fontWeight: 700 } }, '修仙队伍'),
              h('span', { style: styles.badge }, coopRoom.status === 'waiting' ? '准备中' : '已完成'),
              h('span', { style: styles.meta }, `${coopRoom.code} · ${coopRoom.areaName ?? ''} · ${members.length}/${coopRoom.maxMembers}`),
            ),
            members.map((member) => h(
              'div',
              { key: member.petId, style: { ...styles.row, padding: '4px 0' } },
              h('span', null, `${member.name ?? '道友'} ${member.isHost ? '（房主）' : ''}`),
              h('span', { style: { ...styles.meta, color: member.ready ? COLORS.ok : COLORS.muted } }, member.ready ? '已准备' : '未准备'),
            )),
            h(
              'div',
              { style: { ...styles.row, marginTop: 8, flexWrap: 'wrap' } },
              coopRoom.status === 'waiting'
                ? h('button', { style: styles.btnGhost, onClick: coopReady, disabled: busy === 'coop-ready' }, coopRoom.youReady ? '取消准备' : '准备')
                : null,
              coopRoom.isHost && coopRoom.status === 'waiting'
                ? h('button', { style: styles.btn, onClick: coopStart, disabled: busy === 'coop-start' || !coopRoom.canStart }, coopRoom.canStart ? '开始秘境' : '等全员准备')
                : null,
              coopRoom.status === 'waiting'
                ? h('button', { style: styles.btnGhost, onClick: coopLeave, disabled: busy === 'coop-leave' }, coopRoom.isHost ? '解散队伍' : '离开队伍')
                : h('button', { style: styles.btnGhost, onClick: coopDismiss }, '收起'),
            ),
            h('div', { style: styles.hint }, '好友在「冒险 → 结伴摸鱼」里输入房间码加入；全员达到该地区境界才能开始。'),
          )
        }
        return h(
          'div',
          { style: { ...styles.card, marginTop: 10 } },
          h('div', { style: { fontWeight: 700 } }, '组队修仙'),
          h('div', { style: { ...styles.hint, marginTop: 4 } }, '最多 4 人，每人独立结算。创建后把房间码发给好友。'),
          h(
            'button',
            { style: { ...styles.btnGhost, marginTop: 8 }, onClick: createCultivationCoop, disabled: busy === 'cultivation-coop' },
            busy === 'cultivation-coop' ? '创建中…' : '创建修仙队伍',
          ),
        )
      })()

      const cultivationModal = cultivationOpen
        ? h(
            'div',
            {
              style: { ...styles.backdrop, zIndex: 2147483010 },
              onMouseDown: (event) => { if (event.target === event.currentTarget) setCultivationOpen(false) },
            },
            h(
              'div',
              {
                style: {
                  ...styles.panel,
                  width: 'min(860px, calc(100vw - 32px))',
                  maxHeight: 'min(820px, calc(100vh - 48px))',
                },
                role: 'dialog',
                'aria-label': '修仙秘境',
              },
              h(
                'div',
                { style: styles.header },
                h(
                  'div',
                  null,
                  h('h2', { style: { ...styles.title, letterSpacing: 2 } }, '修仙秘境'),
                  h('div', { style: styles.sub }, '独立于大肥鱼的修仙等级 · 每 5 秒推进一段日志 · 一次约 5 分钟'),
                ),
                h(
                  'div',
                  { style: { display: 'flex', gap: 6 } },
                  h('button', { style: styles.btnGhost, onClick: () => setCultivationOpen(false) }, '关闭'),
                ),
              ),
              h(
                'div',
                { style: { ...styles.body, paddingBottom: 14 } },
                cultivationCard,
                cultivationTeamPanel,
              ),
            ),
          )
        : null

      const meTab = h(
        'div',
        null,
        me?.tide
          ? h(
              'div',
              { style: { ...styles.card, borderColor: me.tide.active ? COLORS.ok : DFY_BORDER } },
              h(
                'div',
                { style: styles.row },
                h('span', { style: { fontWeight: 600 } }, me.tide.active ? '🌊 鱼潮进行中' : '🌊 鱼潮'),
                h(
                  'span',
                  { style: styles.meta },
                  me.tide.active
                    ? '鱼饼 +50% · 经验 +10%'
                    : me.tide.nextAt
                      ? `下一次 ${new Date(me.tide.nextAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
                      : '',
                ),
              ),
              h('div', { style: styles.hint }, me.tide.active ? '限时加成，摸鱼/修仙/下楼溜达都生效。' : '每天 12:00 与 20:00 各 15 分钟。'),
            )
          : null,
        checkin
          ? h(
              'div',
              { style: styles.card },
              h(
                'div',
                { style: styles.row },
                h(
                  'div',
                  null,
                  h('div', { style: { fontWeight: 600 } }, '每日签到'),
                  h('div', { style: styles.meta }, `连续签到 ${checkin.streak}/${checkin.maxStreak} 天`),
                ),
                checkin.today
                  ? h('span', { style: styles.meta }, '今天已签到')
                  : h('button', { style: styles.btn, onClick: doCheckin, disabled: busy === 'checkin' }, '签到'),
              ),
              h('div', { style: styles.hint }, `今日奖励 +${checkin.reward.coins} 鱼饼、+${checkin.reward.xp} 经验；连续 3 天额外 +20 鱼饼，7 天额外 +50 鱼饼 +20 经验。`),
              checkin.calendar?.length
                ? h(
                    'div',
                    { style: { display: 'flex', gap: 6, marginTop: 8 } },
                    checkin.calendar.map((day) =>
                      h(
                        'div',
                        {
                          key: day.day,
                          style: {
                            flex: 1,
                            textAlign: 'center',
                            padding: '4px 0',
                            borderRadius: 6,
                            fontSize: 11,
                            border: `1px solid ${day.checked ? COLORS.ok : DFY_BORDER}`,
                            color: day.checked ? COLORS.ok : DFY_MUTED,
                            background: day.today ? `color-mix(in srgb, ${COLORS.brandSolid} 14%, transparent)` : 'transparent',
                          },
                        },
                        h('div', null, day.checked ? '✓' : '·'),
                        h('div', null, day.day.slice(5)),
                      ),
                    ),
                  )
                : null,
              checkin.month
                ? h(
                    'div',
                    { style: { ...styles.row, marginTop: 8 } },
                    h('span', { style: styles.meta }, `本月签到 ${checkin.month.count}/${checkin.month.target} 天`),
                    checkin.month.claimed
                      ? h('span', { style: styles.meta }, '月奖已领')
                      : checkin.month.count >= checkin.month.target
                        ? h('button', { style: styles.btnGhost, onClick: claimMonthlyCheckin, disabled: busy === 'checkin-monthly' }, `领月奖 +${checkin.month.reward.coins} 鱼饼`)
                        : h('span', { style: styles.meta }, `还差 ${checkin.month.target - checkin.month.count} 天`),
                  )
                : null,
              checkin.makeup?.available
                ? h(
                    'div',
                    { style: { ...styles.row, marginTop: 6 } },
                    h('span', { style: styles.meta }, `漏签：${checkin.makeup.day.slice(5)}`),
                    h(
                      'button',
                      { style: styles.btnGhost, onClick: claimMakeup, disabled: busy === 'checkin-makeup' },
                      `补签 ${checkin.makeup.cost} 鱼饼`,
                    ),
                  )
                : null,
            )
          : null,
        h(
          'div',
          { style: styles.card },
          h(
            'div',
            { style: styles.row },
            h('span', { style: { fontWeight: 600 } }, '🎴 今日运势'),
            fortune?.drawn
              ? h('span', { style: { ...styles.badge, color: (fortune.fortune?.coinMult ?? 1) < 1 ? COLORS.err : COLORS.ok } }, fortune.fortune?.kind ?? '已抽')
              : h('button', { style: styles.btnGhost, onClick: drawFortune, disabled: busy === 'fortune' }, '抽一签'),
          ),
          fortune?.drawn
            ? h(
                'div',
                { style: styles.hint },
                `${fortune.fortune?.text ?? '今日运势已抽'}${(fortune.fortune?.coins ?? 0) > 0 ? ` 奖励 +${fortune.fortune?.coins} 鱼饼` : ''}${(fortune.fortune?.xp ?? 0) > 0 ? ` +${fortune.fortune?.xp} 经验` : ''}`,
                h(
                  'div',
                  {
                    style: {
                      marginTop: 4,
                      fontWeight: 600,
                      color: (fortune.fortune?.coinMult ?? 1) < 1 ? COLORS.err : COLORS.ok,
                    },
                  },
                  (fortune.fortune?.coinMult ?? 1) < 1
                    ? `今日 Debuff：鱼饼 ${Math.round(((fortune.fortune?.coinMult ?? 1) - 1) * 100)}%、经验 ${Math.round(((fortune.fortune?.xpMult ?? 1) - 1) * 100)}%`
                    : `今日加成：鱼饼 +${Math.round(((fortune.fortune?.coinMult ?? 1) - 1) * 100)}%、经验 +${Math.round(((fortune.fortune?.xpMult ?? 1) - 1) * 100)}%`,
                ),
              )
            : h('div', { style: styles.hint }, '每天抽一次；吉签当天鱼饼/经验有加成，凶签会减成（影响摸鱼、修仙、下楼溜达）。'),
        ),
        h(
          'div',
          { style: styles.card },
          me
            ? h(
                'div',
                null,
                h(
                  'div',
                  { style: styles.row },
                  h(
                    'div',
                    null,
                    h(
                      'div',
                      null,
                      h('span', { style: styles.name }, me.name),
                      me.element ? h('span', { style: styles.badge }, `${me.zodiac ?? ''}·${me.element}`) : null,
                      me.title ? h('span', { style: styles.badge }, `🏅 ${me.title}`) : null,
                    ),
                    h(
                      'div',
                      { style: styles.meta },
                      me.region?.display ?? '未设置城市',
                      me.region?.element ? ` · 城市五行 ${me.region.element}` : '',
                      me.dfyId ? ` · ${me.dfyId}` : '',
                    ),
                  ),
                  h('div', { style: styles.meta }, `Lv.${me.level}`, renderLevelIcons(me.levelIcons)),
                ),
                h('div', { style: styles.bar }, h('div', { style: styles.barFill((me.intoLevel / Math.max(1, me.nextLevelXp)) * 100) })),
                h('div', { style: styles.meta }, `经验 ${me.intoLevel} / ${me.nextLevelXp}`),
                h(
                  'div',
                  { style: { ...styles.row, marginTop: 10 } },
                  h('span', { style: styles.meta }, `鱼饼 ${me.coins}`, shift ? `（本班已入账 +${earnedCoins}）` : '', ' · ', `幸运 ${Math.round(me.luck)}`),
                  h('span', { style: styles.meta }, percentText(me.bonus)),
                ),
                h(
                  'div',
                  { style: styles.hint },
                  `城市五行 ${me.region?.element ?? '—'}，宠物五行 ${me.element ?? '—'}：${me.bonus?.label ?? '—'}（经验 ×${me.bonus?.xpMultiplier ?? 1}，幸运 ${me.bonus?.luckBonus >= 0 ? '+' : ''}${me.bonus?.luckBonus ?? 0}）`,
                ),
              )
            : h('div', { style: styles.meta }, paired ? '正在同步资料…' : '还没有加入大肥鱼世界。'),
        ),
        today
          ? h(
              'div',
              { style: styles.card },
              h('div', { style: styles.row }, h('span', { style: { fontWeight: 600 } }, '今日进度'), h('span', { style: styles.meta }, `${today.shifts} 个班次`)),
              h('div', { style: { ...styles.meta, marginTop: 8 } }, `经验 ${Math.floor(shownXp)} / ${caps.xp}`, shift ? ` · 本班已入账 +${earnedXp}` : ''),
              h('div', { style: styles.bar }, h('div', { style: styles.barFill((shownXp / caps.xp) * 100, COLORS.ok) })),
              h('div', { style: { ...styles.meta, marginTop: 8 } }, `鱼饼 ${Math.floor(shownCoins)} / ${caps.coins}`, shift ? ` · 本班已入账 +${earnedCoins}` : ''),
              h('div', { style: styles.bar }, h('div', { style: styles.barFill((shownCoins / caps.coins) * 100, COLORS.ok) })),
              shift
                ? h('div', { style: styles.hint }, `服务端每秒入账；本班已入账 +${earnedCoins} 鱼饼 / +${earnedXp} 经验，预计总共 +${shift.projected?.coins ?? 0} 鱼饼 / +${shift.projected?.xp ?? 0} 经验。`)
                : null,
              today.xp >= caps.xp || today.coins >= caps.coins
                ? h('div', { style: styles.hint }, '今日已达上限，超出部分按 10% 结算。')
                : null,
            )
          : null,
        shift
          ? h(
              'div',
              { style: styles.card },
              h(
                'div',
                { style: styles.row },
                h(
                  'div',
                  null,
                  h(
                    'div',
                    { style: { fontWeight: 600 } },
                    shift.kind === 'explore' ? `下楼溜达中：${shift.task ?? shift.jobName}` : `摸鱼中：${shift.jobName}`,
                  ),
                  h(
                    'div',
                    { style: styles.meta },
                    shift.kind === 'explore'
                      ? `剩余 ${remainText(shift.endsAt, tick)} · 完成后一次性结算，提前开溜没有收益`
                      : `剩余 ${remainText(shift.endsAt, tick)} · 已入账 +${shift.earned?.coins ?? 0} 鱼饼 · +${shift.earned?.xp ?? 0} 经验`,
                  ),
                ),
                h(
                  'button',
                  {
                    style: styles.btnGhost,
                    onClick: () => cancelShift(shift.kind === 'explore' ? confirmExploreCancel : true),
                    disabled: busy === 'cancel',
                  },
                  shift.kind === 'explore' ? (confirmExploreCancel ? '确认放弃收益' : '提前开溜') : '开溜',
                ),
              ),
            )
          : h(
              'div',
              { style: styles.card },
              h('div', { style: { fontWeight: 600, marginBottom: 8 } }, '去摸鱼'),
              h(
                'div',
                { style: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' } },
                h(
                  'select',
                  {
                    style: styles.select,
                    value: jobId,
                    onChange: (event) => setJobId(event.target.value),
                  },
                  jobs.length
                    ? jobs.map((job) => h('option', { key: job.id, value: job.id, disabled: !job.unlocked }, `${job.name}${job.unlocked ? '' : `（Lv.${job.unlockLevel}）`}`))
                    : [h('option', { key: 'convenience', value: 'convenience' }, '便利店店员')],
                ),
                h(
                  'select',
                  {
                    style: styles.select,
                    value: minutes,
                    onChange: (event) => setMinutes(Number(event.target.value)),
                  },
                  [15, 30, 60].map((value) => h('option', { key: value, value }, `${value} 分钟`)),
                ),
                h('button', { style: styles.btn, onClick: startShift, disabled: busy === 'shift' || !paired }, busy === 'shift' ? '开工中…' : '去摸鱼'),
              ),
              h('div', { style: styles.hint }, '收益由服务端结算：经验按 4/分钟、鱼饼按 1.5/分钟，再乘岗位与五行系数。'),
            ),
        cultivationEntry,
        me?.explore
          ? h(
              'div',
              { style: styles.card },
              h(
                'div',
                { style: styles.row },
                h(
                  'div',
                  null,
                  h('div', { style: { fontWeight: 600 } }, '下楼溜达'),
                  h('div', { style: styles.meta }, `${me.explore.used}/${me.explore.limit} 次 · ${me.explore.minutes} 分钟`),
                ),
                me.explore.unlocked
                  ? h(
                      'button',
                      {
                        style: styles.btn,
                        onClick: startExplore,
                        disabled: busy === 'explore' || me.explore.used >= me.explore.limit || Boolean(shift),
                      },
                      me.explore.used >= me.explore.limit ? '次数用完' : '出发',
                    )
                  : h('span', { style: styles.meta }, `Lv.${3} 解锁`),
              ),
              h('div', { style: styles.hint }, '随机去一座城市，带回鱼饼、经验和一件见闻。'),
            )
          : null,
        !shift && me?.lastShift
          ? h(
              'div',
              { style: styles.card },
              h(
                'div',
                { style: styles.row },
                h('span', { style: { fontWeight: 600 } }, '上次摸鱼'),
                h('span', { style: styles.meta }, `${me.lastShift.jobName} · +${me.lastShift.coins} 鱼饼 · +${me.lastShift.xp} 经验`),
              ),
            )
          : null,
        coopCard,
        quests.length
          ? h(
              'div',
              { style: styles.card },
              h('div', { style: styles.row }, h('span', { style: { fontWeight: 600 } }, '每日委托'), h('span', { style: styles.meta }, '每天 3 个小目标')),
              quests.map((quest) =>
                h(
                  'div',
                  { key: quest.id, style: { ...styles.row, padding: '6px 0', borderBottom: `1px solid ${DFY_BORDER}` } },
                  h(
                    'div',
                    { style: { flex: 1 } },
                    h('div', null, quest.title),
                    h('div', { style: styles.meta }, `进度 ${quest.progress}/${quest.target} · 奖励 ${quest.reward.coins ? `${quest.reward.coins} 鱼饼` : ''}${quest.reward.xp ? `${quest.reward.coins ? ' + ' : ''}${quest.reward.xp} 经验` : ''}`),
                  ),
                  quest.claimed
                    ? h('span', { style: styles.meta }, '已领取')
                    : quest.claimable
                      ? h('button', { style: styles.btnGhost, onClick: () => claimQuest(quest.id), disabled: busy === `quest-${quest.id}` }, '领取')
                      : h('span', { style: styles.meta }, '未完成'),
                ),
              ),
            )
          : null,
        weeklyQuests.length
          ? h(
              'div',
              { style: styles.card },
              h('div', { style: styles.row }, h('span', { style: { fontWeight: 600 } }, '每周委托'), h('span', { style: styles.meta }, '周一重置')),
              weeklyQuests.map((quest) =>
                h(
                  'div',
                  { key: quest.id, style: { ...styles.row, padding: '6px 0', borderBottom: `1px solid ${DFY_BORDER}` } },
                  h(
                    'div',
                    { style: { flex: 1 } },
                    h('div', null, quest.title),
                    h('div', { style: styles.meta }, `进度 ${quest.progress}/${quest.target} · 奖励 ${quest.reward.coins ? `${quest.reward.coins} 鱼饼` : ''}${quest.reward.xp ? `${quest.reward.coins ? ' + ' : ''}${quest.reward.xp} 经验` : ''}`),
                  ),
                  quest.claimed
                    ? h('span', { style: styles.meta }, '已领取')
                    : quest.claimable
                      ? h('button', { style: styles.btnGhost, onClick: () => claimWeeklyQuest(quest.id), disabled: busy === `week-${quest.id}` }, '领取')
                      : h('span', { style: styles.meta }, '未完成'),
                ),
              ),
            )
          : null,
        achievements.length
          ? h(
              'div',
              { style: styles.card },
              h(
                'div',
                { style: styles.row },
                h('span', { style: { fontWeight: 600 } }, '成就'),
                h('span', { style: styles.meta }, `${achievements.filter((entry) => entry.unlocked).length}/${achievements.length}`),
              ),
              h(
                'div',
                { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8, marginTop: 8 } },
                achievements.map((entry) =>
                  h(
                    'div',
                    {
                      key: entry.id,
                      style: {
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: `1px solid ${entry.unlocked ? COLORS.ok : DFY_BORDER}`,
                        opacity: entry.unlocked ? 1 : 0.55,
                      },
                    },
                    h('div', { style: { fontWeight: 600 } }, `${entry.unlocked ? '🏅' : '🔒'} ${entry.title}`),
                    h('div', { style: styles.meta }, entry.desc),
                    entry.unlocked
                      ? h(
                          'div',
                          { style: { ...styles.row, marginTop: 4 } },
                          h('span', { style: styles.meta }, '已解锁'),
                          h('button', { style: styles.link, onClick: () => setPetTitle(me?.title === entry.title ? null : entry.id), disabled: busy === `title-${entry.id}` }, me?.title === entry.title ? '取消称号' : '设为称号'),
                          h('button', { style: styles.link, onClick: () => shareAchievement(entry.id), disabled: busy === `share-${entry.id}` }, '分享'),
                        )
                      : h('div', { style: styles.meta }, `奖励 ${entry.reward} 鱼饼`),
                  ),
                ),
              ),
            )
          : null,
        me?.dfyId
          ? h(
              'div',
              { style: styles.card },
              h('div', { style: styles.row }, h('span', { style: { fontWeight: 600 } }, '账号'), h('span', { style: styles.meta }, me.dfyId, h('button', { style: styles.link, onClick: () => copyText(me.dfyId, '大肥鱼ID') }, '复制'))),
              h(
                'div',
                { style: { ...styles.row, marginTop: 8 } },
                h('button', { style: styles.btnGhost, onClick: generateRecovery, disabled: busy === 'recovery' }, '生成恢复码'),
                h('span', { style: styles.meta }, '换电脑时用「大肥鱼ID + 恢复码」恢复'),
              ),
              recoveryCode
                ? h(
                    'div',
                    { style: { ...styles.row, marginTop: 6 } },
                    h('span', { style: styles.hint }, `恢复码：${recoveryCode}（只显示这一次，请立刻保存）`),
                    h('button', { style: styles.link, onClick: () => copyText(recoveryCode, '恢复码') }, '复制'),
                  )
                : h('div', { style: styles.hint }, '恢复码只显示一次；生成新的会让旧码立即失效。'),
              h(
                'div',
                { style: { ...styles.row, marginTop: 8 } },
                h('span', { style: { fontWeight: 600 } }, '世界页互动'),
                h(
                  'button',
                  { style: styles.btnGhost, onClick: togglePublicInteract, disabled: busy === 'settings' },
                  me?.settings?.publicInteract === false ? '已关闭' : '已开启',
                ),
              ),
              h(
                'div',
                { style: styles.hint },
                me?.settings?.publicInteract === false
                  ? '陌生人不能在世界页让你的宠物说话或派活。'
                  : '允许世界页的陌生人打招呼、派 30 秒活。',
              ),
              h(
                'div',
                { style: { ...styles.row, marginTop: 12 } },
                h(
                  'input',
                  {
                    style: { ...styles.select, flex: 1, minWidth: 120 },
                    placeholder: '给鱼改个名字（2–12 字）',
                    maxLength: 12,
                    value: renameName,
                    onChange: (event) => setRenameName(event.target.value),
                    onKeyDown: (event) => {
                      if (event.key === 'Enter') void renamePet()
                    },
                  },
                ),
                h('button', { style: styles.btnGhost, onClick: renamePet, disabled: busy === 'rename' }, '改名'),
              ),
              h(
                'div',
                { style: styles.hint },
                me?.rename?.nextAt
                  ? `改名冷却：${remainText(me.rename.nextAt, tick)}（30 天一次）`
                  : '名字 2–12 个字，不能和其他大肥鱼重名；每 30 天可改一次。',
              ),
              h(
                'div',
                { style: { ...styles.row, marginTop: 12 } },
                h(
                  'input',
                  {
                    style: { ...styles.select, flex: 1, minWidth: 120 },
                    placeholder: '一句话签名（30 字以内）',
                    maxLength: 30,
                    value: bioEditing ? bioInput : me?.bio ?? '',
                    onChange: (event) => {
                      setBioEditing(true)
                      setBioInput(event.target.value)
                    },
                    onKeyDown: (event) => {
                      if (event.key === 'Enter') void saveBio()
                    },
                  },
                ),
                h('button', { style: styles.btnGhost, onClick: saveBio, disabled: busy === 'bio' }, '保存签名'),
              ),
              h(
                'div',
                { style: { ...styles.row, marginTop: 12 } },
                h('button', { style: styles.btnGhost, onClick: exportData, disabled: busy === 'export' }, '导出我的数据'),
              ),
              h(
                'div',
                { style: { ...styles.row, marginTop: 12 } },
                h('button', { style: styles.btnGhost, onClick: logout, disabled: busy === 'reset' }, confirmLogout ? '确认退出（需重新登录）' : '退出登录'),
              ),
              h(
                'div',
                { style: styles.hint },
                '退出登录会清除本机 token，需要重新加入；退出前请先生成并保存「恢复码」，否则可能找不回账号。只想离开面板请点底部「暂离」，不会掉登录。',
              ),
              h(
                'div',
                { style: { ...styles.row, marginTop: 12 } },
                h(
                  'button',
                  { style: { ...styles.btnGhost, color: COLORS.err }, onClick: deleteAccount, disabled: busy === 'delete' },
                  confirmDelete ? '确认删除（不可恢复）' : '删除账号',
                ),
              ),
              h(
                'div',
                { style: styles.hint },
                confirmDelete ? '⚠️ 再点一次会立即删除账号、宠物、进度和好友关系。' : '删除账号会清空全部游戏数据，无法恢复。',
              ),
            )
          : null,
      )

      const groups = new Map()
      for (const pet of pets) {
        const key = pet.region ? String(pet.region).split(' · ')[0] : '未定地区'
        if (!groups.has(key)) groups.set(key, [])
        groups.get(key).push(pet)
      }
      const typeButtons = [
        ['wealth', '财富·当前'],
        ['wealth_total', '财富·累计'],
        ['level', '等级'],
        ['gear', '装备'],
        ['gift', '收礼'],
        ['likes', '人气'],
        ['cultivation', '修仙'],
      ]
      const scopeButtons = [
        ['global', '全服'],
        ['city', '本市'],
        ['district', '本区'],
        ['friends', '好友'],
      ]
      // 兼容 React（children 在 props.children）与离屏渲染台的迷你 React（children 在 .children）。
      const meChildren = Array.isArray(meTab.children)
        ? meTab.children
        : Array.isArray(meTab.props?.children)
          ? meTab.props.children
          : [meTab.props?.children]

      const regionProvinces = regionOptions?.provinces ?? []
      const regionNextAt = me?.regionChange?.nextAt ?? 0
      const regionWait = regionNextAt - Date.now()
      const regionNameOf = (item) => (lang === 'en' ? item?.nameEn ?? item?.name : item?.name)
      const currentRegion = lang === 'en' ? me?.region?.displayEn ?? me?.region?.display : me?.region?.display
      const regionCard = h(
        'div',
        { style: styles.card },
        h('div', { style: styles.row }, h('span', { style: { fontWeight: 600 } }, lang === 'en' ? '📍 Region' : '📍 地区'), h('span', { style: styles.meta }, currentRegion ?? '—')),
        regionWait > 0
          ? h('div', { style: styles.hint }, `切换地区冷却中：${remainText(regionNextAt, tick)} 后可切换。`)
          : h(
              'div',
              { style: { marginTop: 8 } },
              h(
                'div',
                { style: { ...styles.row, flexWrap: 'wrap' } },
                h(
                  'select',
                  {
                    style: styles.select,
                    value: regionSel.country,
                    onChange: (event) => void loadRegionOptions(event.target.value),
                  },
                  regionCountries.map((country) => h('option', { key: country.code, value: country.code }, regionNameOf(country))),
                ),
                h(
                  'select',
                  {
                    style: styles.select,
                    value: regionSel.province,
                    onChange: (event) => setRegionSel({ ...regionSel, province: event.target.value }),
                  },
                  h('option', { value: '' }, lang === 'en' ? 'Province / State' : '省份 / 州'),
                  regionProvinces.map((province) => h('option', { key: province.code, value: province.code }, regionNameOf(province))),
                ),
                h('button', { style: styles.btnGhost, onClick: changeRegion, disabled: busy === 'region' || !regionSel.province }, lang === 'en' ? 'Change Region' : '切换地区'),
              ),
              h('div', { style: styles.hint }, `${lang === 'en' ? 'Current' : '当前选择'}：${regionNameOf(regionOptions?.country) ?? '—'} / ${regionNameOf(regionProvinces.find((province) => province.code === regionSel.province)) ?? (lang === 'en' ? 'not selected' : '未选择')}${(regionProvinces.find((province) => province.code === regionSel.province)?.element) ? ` · ${lang === 'en' ? 'Element' : '五行'} ${regionProvinces.find((province) => province.code === regionSel.province).element}` : ''}`),
            ),
        h('div', { style: styles.hint }, lang === 'en'
          ? 'Choose a country first, then a province/state. China includes Hong Kong, Macau and Taiwan and keeps its traditional province elements; overseas first-level regions use latitude climate bands (Fire/Wood/Earth/Metal/Water). You can change region once every 24 hours; element and luck are recalculated.'
          : '先选国家，再选省份/州；中国包含香港、澳门、台湾，并沿用省级传统五行分组；海外一级行政区按纬度气候带分五行（火/木/土/金/水）。每 24 小时可切换一次，切换后五行与幸运关系会重算。'),
      )

      const overviewTab = h('div', null, meChildren[2], meChildren[3], meChildren[4])
      const adventureTab = h('div', null, meChildren[0], ...meChildren.slice(5, 10))
      const questsTab = h('div', null, meChildren[1], ...meChildren.slice(10, 13))
      const settingsTab = h('div', null, regionCard, ...meChildren.slice(13, 14))
      const aboutTab = h(AboutCard, {
        version: status?.version ?? null,
        styles,
        autoUpdate,
        setAutoUpdate,
      })

      const friendCard = h(
        'div',
        { style: styles.card },
        h('div', { style: styles.row }, h('span', { style: { fontWeight: 600 } }, '好友'), h('span', { style: styles.meta }, `${friends.length} 位 · 今日已送 ${me?.gift?.sentToday ?? 0}/${me?.gift?.dailyCap ?? 100} · 串门 ${me?.visits?.usedToday ?? 0}/${me?.visits?.dailyLimit ?? 5}`)),
        h(
          'div',
          { style: { ...styles.row, marginTop: 8 } },
          h(
            'input',
            {
              style: { ...styles.select, flex: 1, minWidth: 160 },
              placeholder: '对方的大肥鱼ID（DFY-XXXX-XXXX）',
              maxLength: 32,
              value: friendDfy,
              onChange: (event) => setFriendDfy(event.target.value.toUpperCase()),
              onKeyDown: (event) => {
                if (event.key === 'Enter') void addFriend()
              },
            },
          ),
          h('button', { style: styles.btn, onClick: addFriend, disabled: busy === 'friend-add' }, '添加'),
        ),
        incoming.length > 0
          ? h(
              'div',
              { style: { marginTop: 10 } },
              incoming.map((request) =>
                h(
                  'div',
                  { key: request.accountId, style: { ...styles.row, padding: '6px 0', borderBottom: `1px solid ${DFY_BORDER}` } },
                  h('span', null, `${request.name}（${request.level} 级）想加你`),
                  h('button', { style: styles.btnGhost, onClick: () => acceptFriend(request.dfyId), disabled: busy === `friend-accept-${request.dfyId}` }, '接受'),
                ),
              ),
            )
          : null,
        friends.length === 0
          ? h('div', { style: styles.hint }, '还没有好友。把对方的大肥鱼ID贴进来就行。')
          : friends.map((friend) =>
              h(
                'div',
                { key: friend.accountId, style: { ...styles.row, padding: '6px 0', borderBottom: `1px solid ${DFY_BORDER}` } },
                h(
                  'div',
                  null,
                  h('div', null, h('span', { style: styles.dot(friend.online) }), friend.name),
                  h('div', { style: styles.meta }, `Lv.${friend.level}`, renderLevelIcons(friend.levelIcons), ` · ${friend.region ?? '未定地区'} · ❤️ 亲密度 ${friend.bond ?? 0}`),
                ),
                h(
                  'div',
                  { style: { display: 'flex', gap: 8, alignItems: 'center' } },
                  h(
                    'button',
                    { style: styles.btnGhost, onClick: () => visitFriend(friend.dfyId), disabled: busy === `visit-${friend.dfyId}` },
                    '串门',
                  ),
                  h(
                    'button',
                    { style: styles.btnGhost, onClick: () => giftFriend(friend.dfyId), disabled: busy === `gift-${friend.dfyId}` },
                    '送 10 鱼饼',
                  ),
                  h('button', { style: styles.link, onClick: () => openFriendDetail(friend.petId) }, '资料'),
                  h('button', { style: styles.link, onClick: () => openThread(friend.dfyId) }, '私聊'),
                  h('button', { style: styles.link, onClick: () => removeFriend(friend.dfyId) }, '删除'),
                ),
              ),
            ),
        friendDetail
          ? h(
              'div',
              { style: { marginTop: 10, paddingTop: 10, borderTop: `1px solid ${DFY_BORDER}` } },
              h(
                'div',
                { style: styles.row },
                h('span', { style: { fontWeight: 600 } }, `${friendDetail.pet.name} 的资料`),
                h('button', { style: styles.link, onClick: () => setFriendDetail(null) }, '收起'),
              ),
              h(
                'div',
                { style: styles.meta },
                `Lv.${friendDetail.pet.level} · ${friendDetail.pet.element ?? '—'} · 幸运 ${friendDetail.pet.luck} · 称号 ${friendDetail.pet.title ?? '无'} · 人气 ${friendDetail.pet.likes}`,
              ),
              h('div', null, renderLevelIcons(friendDetail.pet.levelIcons)),
              h('div', { style: styles.meta }, friendDetail.pet.bio ? `「${friendDetail.pet.bio}」` : '没有签名'),
              h('div', { style: styles.meta }, `装备：${friendDetail.equipped?.map((item) => item.name).join('、') || '无'}`),
              h('div', { style: styles.meta }, `成就：${friendDetail.achievements?.map((item) => item.title).join('、') || '无'}`),
            )
          : null,
      )

      const rankTabs = [
        ['countries', '国家榜'],
        ['provinces', '省份榜'],
        ['myProvince', '本省 Top50'],
        ['globalPersonal', '全球 Top1000'],
      ]
      const rankEntries = rankings?.entries ?? []
      const rankCountryLabel = (entry) => (lang === 'en' ? entry.countryEn ?? entry.country : entry.country)
      const boardCard = h(
        'div',
        { style: styles.card },
        h('div', { style: styles.row }, h('span', { style: { fontWeight: 600 } }, '排行榜'), h('span', { style: styles.meta }, '综合影响力 = 累计鱼饼 + 等级×100 + 经验')),
        h(
          'div',
          { style: { ...styles.row, flexWrap: 'wrap' } },
          rankTabs.map(([value, label]) =>
            h('button', { key: value, style: styles.tab(rankScope === value), onClick: () => setRankScope(value) }, label),
          ),
        ),
        rankScope === 'provinces'
          ? h(
              'div',
              { style: { ...styles.row, marginTop: 6 } },
              h('span', { style: styles.meta }, '国家'),
              h(
                'select',
                {
                  style: { ...styles.select, flex: 1, minWidth: 140 },
                  value: rankCountry || rankings?.country || '',
                  onChange: (event) => setRankCountry(event.target.value),
                },
                (rankings?.countries ?? []).map((country) =>
                  h('option', { key: country.name, value: country.name }, `${country.name}${country.nameEn && country.nameEn !== country.name ? ` · ${country.nameEn}` : ''}`),
                ),
              ),
            )
          : null,
        rankEntries.length
          ? h(
              'div',
              { style: { marginTop: 8, maxHeight: rankScope === 'globalPersonal' ? 420 : 300, overflowY: 'auto' } },
              rankEntries.map((entry) =>
                h(
                  'div',
                  { key: `${entry.rank}-${entry.petId ?? entry.country ?? entry.province}`, style: { ...styles.row, padding: '5px 0', borderBottom: `1px solid ${DFY_BORDER}` } },
                  h('span', { style: styles.meta }, `#${entry.rank}`),
                  h(
                    'span',
                    { style: { flex: 1, marginLeft: 8 } },
                    entry.petId
                      ? h('span', null, entry.name, renderLevelIcons(entry.levelIcons), entry.mine ? h('span', { style: styles.badge }, '我') : null)
                      : h('span', { style: { fontWeight: 600 } }, entry.province ? `${rankCountryLabel(entry)} · ${entry.province}` : rankCountryLabel(entry)),
                  ),
                  h(
                    'span',
                    { style: styles.meta },
                    entry.petId
                      ? `${rankCountryLabel(entry)}${entry.province ? ` · ${entry.province}` : ''} · ${Number(entry.score).toLocaleString('zh-CN')} 分`
                      : `${entry.count ?? 0} 条 · ${entry.online ?? 0} 在线 · ${Number(entry.score).toLocaleString('zh-CN')} 分`,
                  ),
                ),
              ),
            )
          : h('div', { style: styles.hint }, '这个榜还没有数据。'),
        rankScope === 'provinces' && rankings?.country
          ? h('div', { style: styles.hint }, `当前国家：${rankings.country} · 共 ${rankings.total} 个地区`)
          : null,
        rankScope === 'myProvince' && rankings?.province
          ? h('div', { style: styles.hint }, `我的省份：${rankings.country} · ${rankings.province}，共 ${rankings.total} 条大肥鱼`)
          : null,
        (rankScope === 'myProvince' || rankScope === 'globalPersonal') && rankings?.myRank
          ? h('div', { style: styles.hint }, `我的排名：第 ${rankings.myRank} 名`)
          : null,
      )

      const eventsCard = h(
        'div',
        { style: styles.card },
        h('div', { style: styles.row }, h('span', { style: { fontWeight: 600 } }, '世界动态'), h('span', { style: styles.meta }, `${events.length} 条 · 最多保留 1000 条`)),
        events.length === 0
          ? h('div', { style: styles.hint }, '暂时没有特殊动态：鱼潮、史诗/传说装备、大吉运势会出现在这里。')
          : h(
              'div',
              { style: { marginTop: 8, maxHeight: 340, overflowY: 'auto', paddingRight: 4 } },
              events.map((event) =>
                h(
                  'div',
                  { key: event.id, style: { ...styles.row, padding: '4px 0', borderBottom: `1px solid ${DFY_BORDER}` } },
                  h('span', { style: styles.meta }, new Date(event.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })),
                  h('span', { style: { flex: 1, marginLeft: 8 } }, event.text),
                ),
              ),
            ),
        events.length > 0 ? h('div', { style: styles.hint }, '只记录鱼潮、史诗/传说装备获取、大吉运势和运营公告。') : null,
      )

      const chatCard = h(
        'div',
        { style: styles.card },
        h('div', { style: styles.row }, h('span', { style: { fontWeight: 600 } }, '世界频道'), h('span', { style: styles.meta }, '60 秒冷却 · 最多 60 字')),
        h(
          'div',
          { style: { ...styles.row, marginTop: 8 } },
          h(
            'input',
            {
              style: { ...styles.select, flex: 1, minWidth: 140 },
              placeholder: '喊一句…',
              maxLength: 60,
              value: chatText,
              maxLength: 60,
              onChange: (event) => setChatText(event.target.value),
              onKeyDown: (event) => {
                if (event.key === 'Enter') void sendChat()
              },
            },
          ),
          h('button', { style: styles.btn, onClick: sendChat, disabled: busy === 'chat' }, '发送'),
        ),
        chatMessages.length === 0
          ? h('div', { style: styles.hint }, '还没人说话，来第一句吧。')
          : chatMessages.slice(0, 8).map((message) =>
              h(
                'div',
                { key: message.id, style: { ...styles.row, padding: '4px 0', borderBottom: `1px solid ${DFY_BORDER}` } },
                h('span', { style: styles.meta }, new Date(message.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })),
                h('span', { style: { color: COLORS.ok, marginLeft: 6 } }, message.name),
                h('span', { style: { flex: 1, marginLeft: 6 } }, message.text),
                message.pet_id === myId
                  ? h('button', { style: styles.link, onClick: () => deleteChatMessage(message.id), disabled: busy === `chat-del-${message.id}` }, '撤回')
                  : null,
              ),
            ),
      )

      const conversations = []
      const conversationIndex = new Map()
      const allMessages = [...olderMessages, ...messages].sort((a, b) => Number(b.id) - Number(a.id))
      for (const message of allMessages) {
        if (!message.from?.dfyId) continue
        const existing = conversationIndex.get(message.from.dfyId)
        if (existing) {
          if (!message.read) existing.unread += 1
          continue
        }
        const entry = {
          dfyId: message.from.dfyId,
          name: message.from.name,
          text: message.text,
          kind: message.kind,
          unread: message.read ? 0 : 1,
          at: message.createdAt,
        }
        conversationIndex.set(message.from.dfyId, entry)
        conversations.push(entry)
      }

      const threadCard = h(
        'div',
        { style: styles.card },
        h(
          'div',
          { style: { ...styles.row, alignItems: 'flex-start', flexWrap: 'wrap' } },
          h(
            'div',
            { style: { flex: 1, minWidth: 180 } },
            h(
              'div',
              { style: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
              h('span', { style: { fontWeight: 600 } }, threadPeer?.name ?? ''),
              h('span', { style: styles.badge }, threadPeer?.friend ? '好友' : '陌生人'),
              threadPeer ? h('span', { style: styles.dot(threadPeer.online) }) : null,
              threadPeer?.level ? h('span', { style: styles.meta }, `Lv.${threadPeer.level}`) : null,
            ),
            h('div', { style: styles.meta }, `大肥鱼ID：${threadPeer?.dfyId ?? '—'}`),
            threadPeer?.region || threadPeer?.element
              ? h('div', { style: styles.meta }, `${threadPeer?.region ?? '未定地区'}${threadPeer?.element ? ` · ${threadPeer.element}` : ''}${threadPeer?.zodiac ? ` · ${threadPeer.zodiac}` : ''}`)
              : null,
          ),
          h(
            'div',
            { style: { display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' } },
            !threadPeer?.friend
              ? h('button', {
                  style: styles.btn,
                  disabled: busy === 'friend-add' || threadFriendRequested,
                  onClick: async () => {
                    if (!threadPeer?.dfyId) return
                    if (await requestFriend(threadPeer.dfyId)) setThreadFriendRequested(true)
                  },
                }, threadFriendRequested ? '好友申请已发送' : '加好友')
              : null,
            h('button', { style: styles.link, onClick: () => { setThreadPeer(null); setThreadMessages([]); setThreadInput('') } }, '返回列表'),
            h('button', { style: styles.link, onClick: refreshThread }, '刷新'),
            h('button', { style: styles.link, onClick: () => clearMessages('thread'), disabled: busy === 'messages-clear-thread' }, '清除会话'),
          ),
        ),
        threadFriendRequested
          ? h('div', { style: styles.hint }, '已发送好友申请，对方接受后即可直接私聊。')
          : null,
        h(
          'div',
          { ref: threadScrollRef, style: { maxHeight: 280, overflowY: 'auto', marginTop: 8 } },
          threadMessages.length === 0
            ? h('div', { style: styles.hint }, '还没有对话，说第一句吧。')
            : threadMessages.map((message) =>
                h(
                  'div',
                  { key: message.id, style: { display: 'flex', justifyContent: message.mine ? 'flex-end' : 'flex-start', margin: '4px 0' } },
                  h(
                    'div',
                    {
                      style: {
                        maxWidth: '78%',
                        padding: '6px 10px',
                        borderRadius: 10,
                        background: message.mine ? `color-mix(in srgb, ${COLORS.brandSolid} 20%, ${DFY_CARD_BG})` : DFY_CARD_BG,
                        border: `1px solid ${DFY_BORDER_SOFT}`,
                      },
                    },
                    h('div', null, message.text),
                    h(
                      'div',
                      { style: { ...styles.meta, fontSize: 10, marginTop: 2, textAlign: message.mine ? 'right' : 'left' } },
                      `${message.mine ? '我' : message.from?.name ?? '对方'} · ${new Date(message.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`,
                    ),
                  ),
                ),
              ),
        ),
        h(
          'div',
          { style: { ...styles.row, marginTop: 8 } },
          h('input', {
            style: { ...styles.select, flex: 1, minWidth: 140 },
            placeholder: '说点什么（120 字内）',
            maxLength: 120,
            value: threadInput,
            onChange: (event) => setThreadInput(event.target.value),
            onKeyDown: (event) => {
              if (event.key === 'Enter') void sendThreadMessage()
            },
          }),
          h('button', { style: styles.btn, onClick: sendThreadMessage, disabled: busy === 'dm' }, '发送'),
        ),
      )

      const inboxCard = h(
        'div',
        { style: styles.card },
        h(
          'div',
          { style: styles.row },
          h('span', { style: { fontWeight: 600 } }, '消息'),
          h('span', { style: styles.meta }, unreadMessages > 0 ? `${unreadMessages} 条未读` : '没有未读'),
          h('button', { style: styles.link, onClick: markMessagesRead, disabled: busy === 'messages-read' }, '全部已读'),
          h('button', { style: styles.link, onClick: () => clearMessages('all'), disabled: busy === 'messages-clear' }, '清除全部'),
        ),
        conversations.length === 0
          ? h('div', { style: styles.hint }, '还没有消息。陌生人打招呼、好友私聊会出现在这里。')
          : conversations.map((conversation) =>
              h(
                'div',
                {
                  key: conversation.dfyId,
                  style: { ...styles.row, padding: '7px 0', borderBottom: `1px solid ${DFY_BORDER}`, cursor: 'pointer' },
                  onClick: () => void openThread(conversation.dfyId),
                },
                h('span', { style: styles.badge }, conversation.kind === 'greet' ? '打招呼' : '私聊'),
                h('span', { style: { marginLeft: 6, color: COLORS.ok, fontWeight: 600 } }, conversation.name),
                h('span', { style: { flex: 1, marginLeft: 6 } }, conversation.text),
                conversation.unread > 0 ? h('span', { style: styles.badge }, `${conversation.unread}`) : null,
                h('span', { style: styles.meta }, new Date(conversation.at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })),
              ),
            ),
        messagesHasMore
          ? h(
              'div',
              { style: { ...styles.row, marginTop: 8 } },
              h('button', { style: styles.link, onClick: loadOlderMessages, disabled: busy === 'messages-older' }, busy === 'messages-older' ? '加载中…' : '加载更早'),
            )
          : null,
      )

      const offline = me?.offline
      const offlineReward = Boolean(offline && (offline.coins > 0 || offline.xp > 0))
      const offlineCard = h(
        'div',
        { style: styles.card },
        h(
          'div',
          { style: styles.row },
          h('span', { style: { fontWeight: 600 } }, '💤 离线奖励'),
          h('span', { style: styles.meta }, offlineReward ? `离线 ${offline.hours} 小时` : '暂无可领取'),
        ),
        offlineReward
          ? h(
              'div',
              { style: { ...styles.row, marginTop: 8 } },
              h('span', { style: styles.meta }, `+${offline.coins} 鱼饼 · +${offline.xp} 经验`),
              h('button', { style: styles.btn, onClick: claimOffline, disabled: busy === 'offline' }, '领取离线奖励'),
            )
          : h('div', { style: styles.hint }, '离线每小时 3 鱼饼 / 2 经验，单日上限 8 小时，最多累计 7 天。'),
      )

      const messagesTab = h('div', null, offlineCard, threadPeer ? threadCard : inboxCard)
      const friendsTab = h('div', null, friendCard)

      const globeCard = h(
        'div',
        { style: styles.card },
        h(
          'div',
          { style: styles.row },
          h('span', { style: { fontWeight: 600 } }, '🌍 3D 地球 · 全球大肥鱼'),
          h('span', { style: styles.meta }, globe ? `${globe.total ?? 0} 条 · 在线 ${globe.online ?? 0}` : '加载中…'),
        ),
        globe
          ? h(
              'div',
              { style: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start', marginTop: 8 } },
              h(
                'div',
                {
                  id: 'dfy-globe-panel',
                  style: { position: 'relative', flex: '1 1 340px', height: 360, minWidth: 260, overflow: 'hidden', borderRadius: 12, background: '#071521', border: `1px solid ${DFY_BORDER_SOFT}` },
                },
              ),
              h(
                'div',
                { style: { flex: 1, minWidth: 150, lineHeight: 1.9 } },
                (globe.countries ?? []).slice(0, 10).map((country) =>
                  h('div', { key: country.name, style: styles.meta }, `${country.name} · ${country.count} 条${country.online ? `（在线 ${country.online}）` : ''}`),
                ),
                (globe.countries ?? []).length === 0 ? h('div', { style: styles.meta }, '还没有地区数据') : null,
              ),
            )
          : h('div', { style: styles.hint }, '加载全球分布…'),
        h('div', { style: styles.hint }, '拖动旋转、滚轮缩放、点击地球放大/收起、点击玩家点查看；每个点代表玩家手动选择的游戏地区，不读取定位。'),
      )

      const worldTab = h(
        'div',
        null,
        globeCard,
        boardCard,
        chatCard,
        eventsCard,
        pets.length === 0
          ? h('div', { style: styles.empty }, '还没有大肥鱼上线。')
          : [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([region, list]) =>
              h(
                'div',
                { key: region, style: { marginBottom: 16 } },
                h(
                  'div',
                  { style: { ...styles.row, marginBottom: 8 } },
                  h('span', { style: { fontWeight: 600 } }, `📍 ${region}`),
                  h('span', { style: styles.meta }, `${list.filter((pet) => pet.online).length} 在线 / ${list.length}`),
                ),
                h(
                  'div',
                  { style: styles.grid },
                  list
                    .slice()
                    .sort((a, b) => Number(b.online) - Number(a.online))
                    .map((pet) =>
                      h(
                        'div',
                        { key: pet.id, style: { ...styles.pet, ...(pet.id === myId ? styles.petMine : {}) } },
                        h(
                          'div',
                          { style: { fontWeight: 600, display: 'flex', alignItems: 'center' } },
                          h('span', { style: styles.dot(pet.online) }),
                          pet.name,
                          pet.id === myId ? h('span', { style: styles.badge }, '我') : null,
                        ),
                        h('div', { style: styles.meta }, `Lv.${pet.level ?? 1}`, renderLevelIcons(pet.levelIcons), pet.element ? ` · ${pet.element}` : '', pet.region ? ` · ${pet.region}` : ''),
                        h('div', { style: styles.meta }, pet.workStatus?.task ? `${STATE_LABEL[pet.workStatus.state] ?? '摸鱼中'}：${pet.workStatus.task}` : STATE_LABEL[pet.workStatus?.state] ?? '发呆中'),
                        pet.online
                          ? h('div', { style: { marginTop: 8 } }, h('button', { style: styles.btnGhost, onClick: () => say(pet.id), disabled: busy === 'say' }, '打招呼'))
                          : null,
                      ),
                    ),
                ),
              ),
            ),
      )

      const SLOT_DEFS = [
        ['hat', '帽子'],
        ['scarf', '围巾'],
        ['charm', '挂件'],
        ['background', '背景'],
      ]
      const equippedOf = (slotId) => inventory.find((item) => item.equipped && item.slot === slotId)
      const bagTab = h(
        'div',
        null,
        h(
          'div',
          { style: styles.card },
          h(
            'div',
            { style: styles.row },
            h('span', { style: { fontWeight: 600 } }, `幸运 ${Math.round(me?.luck ?? 0)}`),
            h('span', { style: styles.meta }, `鱼饼 ${me?.coins ?? 0} · 来自五行与装备`),
          ),
          h(
            'div',
            { style: { ...styles.row, marginTop: 8 } },
            h('span', { style: { fontWeight: 600 } }, '挂件跟随（实验）'),
            h(
              'button',
              {
                style: styles.btnGhost,
                onClick: () => {
                  const next = !accessory
                  setAccessory(next)
                  try {
                    localStorage.setItem('dfy.accessory', next ? '1' : '0')
                  } catch {
                    /* 忽略 */
                  }
                },
              },
              accessory ? '已开启' : '开启',
            ),
          ),
          h('div', { style: styles.hint }, '把已装备的挂件画在宠物旁边；拖动/缩放可能漂移，取不到坐标就自动隐藏。'),
          h(
            'div',
            { style: styles.hint },
            setBonus > 0
              ? `套装效果：四件套已激活，额外 +${setBonus} 幸运。`
              : '套装：集齐四个部位额外 +2 幸运；四件都稀有及以上再 +3。',
          ),
        ),
        h(
          'div',
          { style: { ...styles.grid, marginBottom: 12 } },
          SLOT_DEFS.map(([slotId, slotName]) => {
            const item = equippedOf(slotId)
            return h(
              'div',
              { key: slotId, style: styles.slot },
              h('div', null, slotName),
              h('div', { style: { marginTop: 6 } }, item ? `${item.icon} ${item.name} +${item.luck}` : '未装备'),
            )
          }),
        ),
        h(
          'div',
          { style: styles.card },
          h('div', { style: { fontWeight: 600, marginBottom: 6 } }, `背包（${inventory.length}）`),
          inventory.length === 0
            ? h('div', { style: styles.hint }, '还没有装备。Lv.5 后去修仙，每次秘境通关必得 1 件。')
            : inventory.map((item) =>
                h(
                  'div',
                  { key: item.id, style: { borderBottom: `1px solid ${DFY_BORDER}`, padding: '6px 0' } },
                  h(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 } },
                    h(
                      'div',
                      null,
                      h('div', null, `${item.icon} ${item.name}`, h('span', { style: styles.badge }, `${item.rarityName}`)),
                      h('div', { style: styles.meta }, `+${item.luck} 幸运 · 攻 +${item.combat?.attack ?? 0} 防 +${item.combat?.defense ?? 0} 血 +${item.combat?.hp ?? 0} 速 +${item.combat?.speed ?? 0}${item.enhance ? ` · 强化 +${item.enhance}` : ''}${item.equipped ? ' · 已装备' : ''}`),
                    ),
                    h(
                      'div',
                      { style: { display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' } },
                      item.equipped
                        ? null
                        : h('button', { style: styles.btnGhost, onClick: () => equipItem(item.id), disabled: busy === `equip-${item.id}` }, '穿上'),
                      item.upgradeCost
                        ? h('button', { style: styles.btnGhost, onClick: () => upgradeItem(item.id), disabled: busy === `upgrade-${item.id}` }, `强化 ${item.upgradeCost}`)
                        : null,
                      item.dismantleValue !== null && item.dismantleValue !== undefined
                        ? h('button', { style: styles.link, onClick: () => dismantleItem(item.id), disabled: busy === `dismantle-${item.id}` }, `分解 +${item.dismantleValue}`)
                        : null,
                      item.equipped
                        ? null
                        : h('button', { style: styles.link, onClick: () => setGiftingId(giftingId === item.id ? 0 : item.id) }, '送好友'),
                    ),
                  ),
                  giftingId === item.id
                    ? h(
                        'div',
                        { style: { ...styles.row, flexWrap: 'wrap', gap: 8, marginTop: 6 } },
                        friends.length
                          ? friends.map((friend) =>
                              h('button', { key: friend.dfyId, style: styles.link, onClick: () => giftItem(item.id, friend.dfyId), disabled: busy === `gift-${item.id}` }, `送给 ${friend.name}`),
                            )
                          : h('span', { style: styles.meta }, '还没有好友，加好友后才能赠送'),
                      )
                    : null,
                ),
              ),
        ),
        codex.length
          ? h(
              'div',
              { style: styles.card },
              h(
                'div',
                { style: styles.row },
                h('span', { style: { fontWeight: 600 } }, '装备图鉴'),
                h('span', { style: styles.meta }, `${collectedCount}/${totalItems}`),
              ),
              h(
                'div',
                { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 8, marginTop: 8 } },
                codex.map((item) =>
                  h(
                    'div',
                    {
                      key: item.code,
                      style: {
                        padding: '6px',
                        borderRadius: 8,
                        border: `1px solid ${item.collected ? COLORS.ok : DFY_BORDER}`,
                        opacity: item.collected ? 1 : 0.5,
                        textAlign: 'center',
                      },
                    },
                    h('div', { style: { fontSize: 22 } }, item.icon),
                    h('div', { style: styles.meta }, item.name),
                    h('div', { style: styles.meta }, item.collected ? `×${item.count}` : '未收集'),
                  ),
                ),
              ),
            )
          : null,
        h(
          'div',
          { style: styles.card },
          h('div', { style: styles.row }, h('span', { style: { fontWeight: 600 } }, '商店'), h('span', { style: styles.meta }, `鱼饼 ${shopCoins}`)),
          shop.length
            ? shop.map((item) =>
                h(
                  'div',
                  {
                    key: item.code,
                    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '6px 0', borderBottom: `1px solid ${DFY_BORDER}` },
                  },
                  h('div', null, `${item.icon} ${item.name}`, h('span', { style: styles.badge }, item.rarityName), h('div', { style: styles.meta }, `${item.slotName} · 幸运 +${item.luck} · 攻 +${item.combat?.attack ?? 0} 防 +${item.combat?.defense ?? 0} 血 +${item.combat?.hp ?? 0} 速 +${item.combat?.speed ?? 0}`)),
                  h('button', { style: styles.btnGhost, onClick: () => buyItem(item.code), disabled: busy === `buy-${item.code}` }, `${item.price} 鱼饼`),
                ),
              )
            : h('div', { style: styles.hint }, '商店加载中…'),
        ),
      )

      const body = !paired && !pending
        ? h(
            'div',
            null,
            h('p', { style: { margin: '0 0 6px' } }, '加入大肥鱼世界：'),
            h('p', { style: styles.meta }, '协议、城市、生日都在网页完成；不获取定位。'),
            h('button', { style: styles.btn, onClick: startPair, disabled: busy === 'pair' }, busy === 'pair' ? '生成中…' : '生成配对码'),
            h('button', { style: styles.btnGhost, onClick: startRecover, disabled: busy === 'recover' }, '换电脑了？恢复账号'),
          )
        : !paired && pending
          ? h(
              'div',
              null,
              h('p', { style: { margin: '0 0 8px' } }, '打开网页完成加入（协议 + 城市 + 生日）：'),
              h('div', { style: styles.code }, pending.code),
              h(
                'p',
                { style: styles.hint },
                h('button', { style: styles.link, onClick: () => window.open(pending.verifyUrl, '_blank', 'noopener') }, pending.verifyUrl),
              ),
              h('p', { style: styles.hint }, '网页确认后这里会自动上线。'),
              h(
                'div',
                { style: { ...styles.row, marginTop: 10 } },
                h('button', { style: styles.btnGhost, onClick: startPair, disabled: busy === 'pair' }, busy === 'pair' ? '生成中…' : '重新生成配对码'),
                h('button', { style: styles.link, onClick: unpair, disabled: busy === 'reset' }, '取消加入'),
              ),
              h('p', { style: styles.hint }, '如果网页提示「配对码已经用过了 / 已过期」，点「重新生成配对码」再打开新链接。'),
            )
          : tab === 'me'
            ? overviewTab
            : tab === 'adventure'
              ? adventureTab
              : tab === 'quests'
                ? questsTab
                : tab === 'settings'
                  ? settingsTab
                  : tab === 'about'
                    ? aboutTab
                    : tab === 'world'
                    ? worldTab
                    : tab === 'friends'
                      ? friendsTab
                      : tab === 'messages'
                        ? messagesTab
                        : bagTab

      const equippedAccessory = inventory.filter((item) => item.equipped)
      const accessoryLayer =
        accessory && petPos && equippedAccessory.length
          ? h(
              'div',
              { style: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2147483001 } },
              equippedAccessory.map((item, index) =>
                h(
                  'div',
                  {
                    key: item.id,
                    style: {
                      position: 'fixed',
                      left: `calc(${petPos.x * 100}% + ${(index - 1) * 18}px)`,
                      top: `calc(${petPos.y * 100}% - ${64 + Math.abs(index - 1) * 8}px)`,
                      fontSize: 26,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.55))',
                    },
                  },
                  item.icon,
                ),
              ),
            )
          : null

      const root = h(
        React.Fragment,
        null,
        accessoryLayer,
        cultivationOpen ? cultivationModal : null,
        h(
        'div',
        { style: styles.backdrop, onMouseDown: (event) => { if (event.target === event.currentTarget) setOpen(false) } },
        h(
          'div',
          { style: styles.panel, role: 'dialog', 'aria-label': '大肥鱼世界' },
          h(
            'div',
            { style: styles.header },
            h(
              'div',
              null,
              h('h2', { style: styles.title }, '大肥鱼世界'),
              h('div', { style: styles.sub }, status?.platformUrl ?? '连接器连接中…', ' · ', paired ? (status?.online ? '已上线' : '网关连接中…') : '未加入'),
            ),
            h(
              'div',
              { style: { display: 'flex', gap: 6 } },
              h('button', { style: styles.btnGhost, onClick: toggleLang, title: lang === 'en' ? '切换到中文' : 'Switch to English' }, lang === 'en' ? 'ZH' : 'EN'),
              h('button', { style: styles.btnGhost, onClick: () => setOpen(false) }, '关闭'),
            ),
          ),
          paired || pending
            ? h(
                'div',
                { style: styles.tabs },
                ['me', 'adventure', 'quests', 'world', 'friends', 'messages', 'bag', 'settings', 'about'].map((key, index) =>
                  h(
                    'button',
                    { key, style: styles.tab(tab === key), onClick: () => openTab(key) },
                    h('span', null, ['我的鱼', '冒险', '任务', '世界', '好友', '消息', '背包', '设置', '关于'][index]),
                    key === 'messages' && unreadMessages > 0
                      ? h(
                          'span',
                          {
                            style: {
                              position: 'absolute',
                              top: -5,
                              right: -5,
                              minWidth: 16,
                              height: 16,
                              padding: '0 4px',
                              borderRadius: 9,
                              background: COLORS.err,
                              color: '#fff',
                              fontSize: 10,
                              lineHeight: '16px',
                              textAlign: 'center',
                              fontWeight: 600,
                            },
                          },
                          unreadMessages > 99 ? '99+' : String(unreadMessages),
                        )
                      : null,
                  ),
                ),
              )
            : null,
          platformDown ? h('div', { style: { ...styles.error, padding: '6px 16px 0' } }, '⚠️ 平台连接中断，正在自动重试…') : null,
          h('div', { style: styles.body, ref: bodyRef }, body),
          notice ? h('div', { style: { ...styles.error, color: COLORS.ok, padding: '0 16px 10px' } }, notice) : null,
          error ? h('div', { style: { ...styles.error, padding: '0 16px 10px' } }, error) : null,
          h(
            'div',
            { style: styles.footer },
            h('span', null, `v${status?.version ?? '0.86.0'} · ${paired ? '右键宠物 →「打开大肥鱼世界」随时回来 · 暂离保留登录' : '加入后：右键宠物 →「打开大肥鱼世界」'}`),
            paired ? h('button', { style: styles.link, onClick: () => setOpen(false) }, '暂离') : null,
          ),
        ),
      )
      )
      return root
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('shell.overlay', () =>
          ctx.slots.register({ name: 'shell.overlay', id: 'pet-world', order: 900, label: '大肥鱼世界' }, Plaza),
        )
      },
    }
  },
})












































































