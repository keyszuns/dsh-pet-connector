/**
 * dsh-pet 平台连接器（host 半侧）。
 *
 * 它只做四件事，且绝不碰 dsh-pet 的源码：
 * 1. 配对：向平台申请设备码，用户网页确认后把 token 存到 ~/.dsh/dsh-pet-connector。
 * 2. 网关：outbound SSE 长连接到平台，收下发指令。
 * 3. 驱动：用 dsh-pet 自己的本地 HTTP 扩展面（/dsh-pet-7340/*）让宠物摸鱼、说话。
 * 4. 暴露：给浏览器半侧一组同源 HTTP 接口（/dsh-pet-connector/*），避免 CORS 与 token 外泄。
 *
 * 扩展面依据：src/host/routes/{state,menu,interaction}.ts —— /state 轮询、
 * /work-status 写入、/menu/item 第三方菜单、/broadcast 直接说话。
 *
 * @module dsh-pet-connector
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { homedir } from 'node:os'
import { join } from 'node:path'

const PACKAGE_VERSION = (() => {
  try {
    return JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version ?? null
  } catch {
    return null
  }
})()

const ROUTE_PREFIX = '/dsh-pet-connector'
const DEFAULT_PET_ROUTE = '/dsh-pet-7340'
const MENU_OWNER = 'dsh-pet-connector'
const MENU_LABELS = ['打开大肥鱼世界', '摸鱼 30 秒']
const HEARTBEAT_MS = 15000

/** 插件行 id；必须与 package.json 的 name 一致。 */
export const name = 'dsh-pet-connector'

/** 只依赖浏览器 HTTP 通道；没有它连路由都挂不上。 */
export const inject = ['webServer']

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function stateDir() {
  return join(process.env.DSH_HOME ?? join(homedir(), '.dsh'), 'dsh-pet-connector')
}

class Connector {
  constructor(ctx, config) {
    this.ctx = ctx
    this.config = config ?? {}
    this.platformUrl = String(this.config.platformUrl ?? 'http://127.0.0.1:8787').replace(/\/+$/, '')
    this.petRoute = String(this.config.petRoute ?? DEFAULT_PET_ROUTE)
    this.petId = String(this.config.petId ?? 'main')
    this.petName = String(this.config.petName ?? '我的宠物')

    this.token = null
    this.platformPetId = null
    this.pending = null
    this.deviceId = null
    this.pendingPoll = null
    this.pendingBusy = false
    this.shift = null
    this.shiftTimer = null
    this.openSeq = 0
    this.connected = false
    this.lastError = null
    this.disposed = false
    /** 平台资料缓存（等级/鱼饼/五行/幸运），只读展示。 */
    this.profile = null
    this.profileAt = 0
    this.profileBusy = false

    this.gatewayAbort = null
    this.gatewayTask = null
    this.menuTask = null
    this.heartbeatTimer = null
    this.routeDisposer = null
    this.stateFile = join(stateDir(), 'state.json')
  }

  get petBase() {
    return this.ctx.webServer.getOrigin() + this.petRoute
  }

  // ---------------------------------------------------------------- 生命周期

  start() {
    this.routeDisposer = this.ctx.webServer.register({
      kind: 'prefix',
      path: ROUTE_PREFIX,
      handler: (req, res) => {
        void this.handle(req, res)
      },
    })

    this.gatewayTask = this.loadState().then(async () => {
      if (!this.deviceId) {
        this.deviceId = randomUUID()
        await this.saveState()
      }
      if (this.token) this.connectGateway()
      this.menuTask = this.runMenuLoop()
      this.startHeartbeat()
      void this.report()
    })
  }

  dispose() {
    this.disposed = true
    this.gatewayAbort?.abort()
    this.clearPendingPoll()
    clearInterval(this.heartbeatTimer)
    clearTimeout(this.shiftTimer)
    this.routeDisposer?.()
    void this.petRequest('/menu/item?owner=' + encodeURIComponent(MENU_OWNER), { method: 'DELETE' }).catch(() => {})
  }

  // ---------------------------------------------------------------- 本地状态

  async loadState() {
    try {
      const raw = await readFile(this.stateFile, 'utf8')
      const saved = JSON.parse(raw)
      if (saved && typeof saved === 'object') {
        this.token = typeof saved.token === 'string' ? saved.token : null
        // 注意：this.petId 是「本机 dsh-pet 实例 id」，platformPetId 才是平台分配的身份。
        // 两者绝不能混用——混用会让 /broadcast?pet= 收到 pet_xxx 而报 unknown-pet。
        if (typeof saved.platformPetId === 'string' && saved.platformPetId) this.platformPetId = saved.platformPetId
        else if (typeof saved.petId === 'string' && saved.petId.startsWith('pet_')) this.platformPetId = saved.petId
        if (typeof saved.petName === 'string' && saved.petName) this.petName = saved.petName
        if (typeof saved.platformUrl === 'string' && saved.platformUrl) this.platformUrl = saved.platformUrl.replace(/\/+$/, '')
        if (typeof saved.deviceId === 'string' && saved.deviceId) this.deviceId = saved.deviceId
      }
    } catch (error) {
      if (error.code !== 'ENOENT') this.lastError = `读取本地状态失败：${error.message}`
    }
  }

  async saveState() {
    try {
      await mkdir(stateDir(), { recursive: true })
      const body = JSON.stringify(
        {
          token: this.token,
          petId: this.petId,
          platformPetId: this.platformPetId,
          petName: this.petName,
          platformUrl: this.platformUrl,
          deviceId: this.deviceId,
          savedAt: Date.now(),
        },
        null,
        2,
      )
      await writeFile(this.stateFile, body, { encoding: 'utf8', mode: 0o600 })
    } catch (error) {
      this.lastError = `保存本地状态失败：${error.message}`
    }
  }

  // ---------------------------------------------------------------- 平台调用

  async platformJson(path, { method = 'GET', body, timeout = 8000, headers = {} } = {}) {
    const merged = { ...headers }
    if (body !== undefined) merged['content-type'] = 'application/json'
    const response = await fetch(this.platformUrl + path, {
      method,
      headers: merged,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeout),
    })
    const text = await response.text()
    let parsed
    try {
      parsed = text ? JSON.parse(text) : {}
    } catch {
      parsed = { raw: text }
    }
    return { status: response.status, body: parsed }
  }

  /** 拉取平台资料（等级/鱼饼/五行/幸运）；失败保留旧缓存。 */
  async refreshProfile() {
    if (!this.token || this.profileBusy || this.disposed) return
    this.profileBusy = true
    try {
      const result = await this.platformJson('/v1/world/me', {
        headers: { authorization: `Bearer ${this.token}` },
        timeout: 6000,
      })
      if (result.status === 200 && result.body?.ok) {
        this.profile = result.body
        this.profileAt = Date.now()
        if (typeof result.body.name === 'string' && result.body.name) this.petName = result.body.name
      } else if (result.status === 401) {
        this.token = null
        this.profile = null
        await this.saveState()
      }
    } catch (error) {
      this.lastError = `资料同步失败：${error.message}`
    } finally {
      this.profileBusy = false
    }
  }

  /** 上报心跳与工作状态；失败只记录不抛。 */
  async report() {
    if (!this.token) return
    try {
      await this.platformJson('/v1/pet/events', {
        method: 'POST',
        body: {
          name: this.petName,
          workStatus: this.shift
            ? { state: 'working', task: this.shift.task }
            : { state: 'idle', task: null },
        },
        timeout: 6000,
      })
    } catch (error) {
      this.lastError = `上报失败：${error.message}`
    }
  }

  // ---------------------------------------------------------------- 网关

  async connectGateway() {
    if (this.disposed) return
    this.gatewayAbort?.abort()
    const abort = new AbortController()
    this.gatewayAbort = abort
    try {
      const response = await fetch(`${this.platformUrl}/v1/gateway?token=${encodeURIComponent(this.token)}`, {
        signal: abort.signal,
        headers: { accept: 'text/event-stream' },
      })
      if (response.status === 401) {
        this.token = null
        await this.saveState()
        this.lastError = 'token 已失效，请重新配对'
        return
      }
      if (!response.ok || !response.body) throw new Error(`网关返回 ${response.status}`)
      this.connected = true
      this.lastError = null
      void this.refreshProfile()
      await this.pumpSse(response)
    } catch (error) {
      if (!abort.signal.aborted) this.lastError = `网关断开：${error.message}`
    } finally {
      this.connected = false
      if (!this.disposed && !abort.signal.aborted && this.token) {
        setTimeout(() => void this.connectGateway(), 3000)
      }
    }
  }

  /** 读 SSE 帧；只关心 `command` 事件。 */
  async pumpSse(response) {
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let index = buffer.indexOf('\n\n')
      while (index >= 0) {
        const frame = buffer.slice(0, index)
        buffer = buffer.slice(index + 2)
        const event = frame
          .split('\n')
          .find((line) => line.startsWith('event:'))
          ?.slice(6)
          .trim()
        const data = frame
          .split('\n')
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trim())
          .join('\n')
        if (event === 'command' && data) {
          try {
            void this.handleCommand(JSON.parse(data))
          } catch {
            /* 单条指令坏掉不影响连接 */
          }
        }
        index = buffer.indexOf('\n\n')
      }
    }
  }

  async handleCommand(command) {
    const kind = command?.kind
    const payload = command?.payload ?? {}
    if (kind === 'say') {
      await this.petBroadcast(String(payload.text ?? '').slice(0, 200))
      return
    }
    if (kind === 'work') {
      await this.startShift(Number(payload.seconds ?? 30), String(payload.task ?? '给世界摸鱼').slice(0, 40))
      return
    }
    if (kind === 'shift.cancel') {
      await this.cancelShift()
      return
    }
    if (kind === 'celebrate') {
      await this.petAnim(String(payload.name ?? '放烟花'))
      await this.petBroadcast(String(payload.text ?? '我升级啦！'))
      return
    }
    if (kind === 'drop') {
      await this.petBroadcastImage(String(payload.text ?? '捡到装备'), String(payload.url ?? ''))
      return
    }
    if (kind === 'open') {
      this.openSeq += 1
    }
  }

  // ---------------------------------------------------------------- 驱动宠物

  async petRequest(path, { method = 'GET', body, timeout = 6000 } = {}) {
    const response = await fetch(this.petBase + path, {
      method,
      headers: body === undefined ? {} : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeout),
    })
    const text = await response.text()
    let parsed
    try {
      parsed = text ? JSON.parse(text) : {}
    } catch {
      parsed = { raw: text }
    }
    return { status: response.status, body: parsed }
  }

  async petAnim(name) {
    if (!name) return
    try {
      const result = await this.petRequest(`/anim?pet=${encodeURIComponent(this.petId)}`, {
        method: 'POST',
        body: { name },
      })
      if (result.body?.ok === false) {
        // 动画池没有这个动作时不报错，后面还有气泡兜底
        this.lastError = `动画被拒：${result.body.reason ?? 'unknown'}`
      }
    } catch (error) {
      this.lastError = `播放动画失败：${error.message}`
    }
  }

  async petBroadcastImage(text, url) {
    try {
      const body = { text, duration: 12000 }
      if (/^https?:\/\//i.test(url)) body.url = url
      const result = await this.petRequest(`/broadcast?pet=${encodeURIComponent(this.petId)}&surface=web`, {
        method: 'POST',
        body,
      })
      if (result.body?.ok === false) this.lastError = `装备卡被拒：${result.body.reason ?? 'unknown'}`
    } catch (error) {
      this.lastError = `装备卡失败：${error.message}`
    }
  }

  async petBroadcast(text) {
    if (!text) return
    try {
      // dsh-pet 的 /broadcast 必须带 surface（web / desktop / both / any），缺了会回 200 + ok:false。
      const result = await this.petRequest(`/broadcast?pet=${encodeURIComponent(this.petId)}&surface=web`, {
        method: 'POST',
        body: { text, duration: 6000 },
      })
      if (result.body?.ok === false) this.lastError = `宠物说话被拒：${result.body.reason ?? 'unknown'}`
    } catch (error) {
      this.lastError = `宠物说话失败：${error.message}`
    }
  }

  /** 摸鱼：当前班次只允许一个；结束自动收尾并播报。 */
  async startShift(seconds, task) {
    const total = Math.min(3600, Math.max(5, Number(seconds) || 30))
    if (this.shift) return
    this.shift = { task, endsAt: Date.now() + total * 1000 }
    clearTimeout(this.shiftTimer)
    try {
      await this.petRequest(`/work-status?pet=${encodeURIComponent(this.petId)}`, {
        method: 'POST',
        body: { state: 'working', task },
      })
    } catch (error) {
      this.lastError = `写入工作状态失败：${error.message}`
    }
    // 真实会话在忙时，dsh-pet 会优先展示会话自己的工作状态，外部写入看不见；
    // 所以再冒个泡，保证玩家一定有反馈。
    await this.petBroadcast(`我去平台摸鱼啦：${task}`)
    await this.report()
    this.shiftTimer = setTimeout(() => void this.finishShift(), total * 1000)
  }

  async finishShift() {
    const task = this.shift?.task
    this.shift = null
    try {
      await this.petRequest(`/work-status?pet=${encodeURIComponent(this.petId)}`, {
        method: 'POST',
        body: { state: 'success', task: null },
      })
    } catch {
      /* 宠物可能已经不在 */
    }
    await this.petBroadcast(task ? `${task}，干完啦～` : '干完啦～')
    await this.report()
    // success 状态留 6 秒再清空，玩家能看到"完成"这一下
    setTimeout(() => {
      void this.petRequest(`/work-status?pet=${encodeURIComponent(this.petId)}`, { method: 'DELETE' }).catch(() => {})
    }, 6000)
  }

  async cancelShift() {
    clearTimeout(this.shiftTimer)
    this.shift = null
    try {
      await this.petRequest(`/work-status?pet=${encodeURIComponent(this.petId)}`, { method: 'DELETE' })
    } catch {
      /* 宠物可能不在 */
    }
    await this.report()
  }

  // ---------------------------------------------------------------- 菜单

  async runMenuLoop() {
    await this.registerMenu()
    while (!this.disposed) {
      try {
        const result = await this.petRequest(
          `/menu/events?owner=${encodeURIComponent(MENU_OWNER)}&wait=25000`,
          { timeout: 35000 },
        )
        if (result.body?.ok === false && String(result.body?.reason ?? '').includes('unknown-owner')) {
          await this.registerMenu()
          continue
        }
        const events = result.body?.events
        if (events && typeof events === 'object') {
          for (const [label, petId] of Object.entries(events)) {
            if (!petId) continue
            if (label === '打开大肥鱼世界') this.openSeq += 1
            if (label === '摸鱼 30 秒') void this.startShift(30, '给世界摸鱼')
          }
        }
      } catch (error) {
        if (this.disposed) return
        this.lastError = `菜单长轮询失败：${error.message}`
        await sleep(2000)
        await this.registerMenu()
      }
    }
  }

  async registerMenu() {
    try {
      await this.petRequest('/menu/item', {
        method: 'POST',
        body: { owner: MENU_OWNER, labels: MENU_LABELS, target: 'web' },
      })
    } catch (error) {
      this.lastError = `注册菜单失败：${error.message}`
      await sleep(2000)
    }
  }

  // ---------------------------------------------------------------- 心跳

  startHeartbeat() {
    clearInterval(this.heartbeatTimer)
    let tick = 0
    this.heartbeatTimer = setInterval(() => {
      void this.report()
      tick += 1
      // 每 60 秒拉一次资料（等级/鱼饼/五行），本地只读展示
      if (tick % 4 === 0) void this.refreshProfile()
    }, HEARTBEAT_MS)
    this.heartbeatTimer.unref?.()
  }

  // ---------------------------------------------------------------- 浏览器接口

  status() {
    return {
      ok: true,
      version: PACKAGE_VERSION,
      platformUrl: this.platformUrl,
      paired: Boolean(this.token),
      petId: this.platformPetId,
      localPetId: this.petId,
      petName: this.petName,
      online: this.connected,
      pending: this.pending
        ? { code: this.pending.code, verifyUrl: this.pending.verifyUrl, expiresAt: this.pending.expiresAt }
        : null,
      openSeq: this.openSeq,
      shift: this.shift ? { task: this.shift.task, endsAt: this.shift.endsAt } : null,
      profile: this.profile,
      lastError: this.lastError,
    }
  }

  startPendingPoll() {
    this.clearPendingPoll()
    this.pendingPoll = setInterval(() => void this.pollPending(), 3000)
    this.pendingPoll.unref?.()
  }

  clearPendingPoll() {
    if (this.pendingPoll) {
      clearInterval(this.pendingPoll)
      this.pendingPoll = null
    }
  }

  /** 轮询配对结果：网页确认后自动登录，避免用户再回 DSH 操作。 */
  async pollPending() {
    if (!this.pending || this.pendingBusy || this.token) return
    if (Date.now() > this.pending.expiresAt) {
      this.pending = null
      this.clearPendingPoll()
      return
    }
    this.pendingBusy = true
    try {
      const result = await this.platformJson(
        `/v1/pair/status?code=${encodeURIComponent(this.pending.code)}&secret=${encodeURIComponent(this.pending.secret)}`,
      )
      if (result.status === 200 && result.body?.status === 'ready') {
        this.token = result.body.token
        this.platformPetId = result.body.pet?.id ?? this.platformPetId
        this.petName = result.body.pet?.name ?? this.petName
        this.pending = null
        this.clearPendingPoll()
        await this.saveState()
        void this.connectGateway()
        void this.report()
        void this.refreshProfile()
      } else if (result.status === 404) {
        this.pending = null
        this.clearPendingPoll()
      }
    } catch {
      /* 平台暂时不可达，下个周期再试 */
    } finally {
      this.pendingBusy = false
    }
  }

  sendJson(res, status, body) {
    const data = JSON.stringify(body)
    res.writeHead(status, {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'content-length': Buffer.byteLength(data),
    })
    res.end(data)
  }

  async handle(req, res) {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1')
    const path = url.pathname.slice(ROUTE_PREFIX.length) || '/'
    const method = req.method ?? 'GET'
    try {
      if (method === 'GET' && (path === '/' || path === '/status')) {
        if (this.pending) await this.pollPending()
        return this.sendJson(res, 200, this.status())
      }

      if (method === 'POST' && path === '/pair/start') {
        const request = await this.platformJson('/v1/pair/start', {
          method: 'POST',
          body: { petName: this.petName, deviceId: this.deviceId },
        })
        if (request.status !== 200 || request.body?.ok !== true) {
          return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable', message: '平台不可达，先启动平台服务' })
        }
        this.pending = {
          code: request.body.code,
          secret: request.body.secret,
          verifyUrl: request.body.verifyUrl,
          consentVersion: request.body.consentVersion,
          expiresAt: Date.now() + Number(request.body.expiresIn ?? 600) * 1000,
        }
        this.startPendingPoll()
        return this.sendJson(res, 200, { ok: true, ...this.pending })
      }

      if (method === 'GET' && path === '/pair/status') {
        await this.pollPending()
        return this.sendJson(res, 200, this.status())
      }

      if (method === 'POST' && path === '/pair/reset') {
        this.token = null
        this.pending = null
        this.platformPetId = null
        this.profile = null
        this.clearPendingPoll()
        this.gatewayAbort?.abort()
        await this.saveState()
        return this.sendJson(res, 200, this.status())
      }

      if (method === 'GET' && (path === '/me' || path === '/profile')) {
        await this.refreshProfile()
        return this.sendJson(res, 200, this.profile ?? { ok: false, reason: 'not-paired', message: '还没有加入大肥鱼世界' })
      }

      if (method === 'GET' && path === '/jobs') {
        const result = await this.platformJson('/v1/world/jobs', {
          headers: { authorization: `Bearer ${this.token}` },
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable', message: '平台不可达' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && path === '/shift/start') {
        const body = await this.readJson(req)
        const result = await this.platformJson('/v1/world/shifts', {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body: { jobId: String(body.jobId ?? 'convenience'), minutes: Number(body.minutes ?? 30) },
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable', message: '平台不可达' })
        if (result.body?.ok) await this.refreshProfile()
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && path === '/shift/cancel') {
        const body = await this.readJson(req)
        const result = await this.platformJson('/v1/world/shifts/cancel', {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body: { confirm: body?.confirm === true },
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable', message: '平台不可达' })
        if (result.body?.ok) await this.refreshProfile()
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'GET' && path === '/cultivation/status') {
        const result = await this.platformJson('/v1/world/cultivation/status', {
          headers: { authorization: `Bearer ${this.token}` },
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && path === '/cultivation/start') {
        const body = await this.readJson(req)
        const result = await this.platformJson('/v1/world/cultivation/start', {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body: { areaId: body?.areaId == null ? undefined : String(body.areaId) },
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        if (result.body?.ok) await this.refreshProfile()
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && (path === '/cultivation/breakthrough' || path === '/cultivation/skill' || path === '/cultivation/alchemy' || path === '/cultivation/achievements/claim')) {
        const body = await this.readJson(req)
        const result = await this.platformJson(`/v1/world${path}`, {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body: body ?? {},
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        if (result.body?.ok) await this.refreshProfile()
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'GET' && path === '/coop/status') {
        const result = await this.platformJson('/v1/world/coop/status', {
          headers: { authorization: `Bearer ${this.token}` },
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'GET' && path === '/coop/friends') {
        const result = await this.platformJson('/v1/world/coop/friends', {
          headers: { authorization: `Bearer ${this.token}` },
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      const coopAction = path === '/coop/create' || path === '/coop/join' || path === '/coop/join-friend'
        || path === '/coop/ready' || path === '/coop/start' || path === '/coop/kick'
        || path === '/coop/leave' || path === '/coop/cancel'
      if (method === 'POST' && coopAction) {
        const body = await this.readJson(req)
        const result = await this.platformJson(`/v1/world${path}`, {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body: body ?? {},
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        if (result.body?.ok) await this.refreshProfile()
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && path === '/achievements/share') {
        const body = await this.readJson(req)
        const result = await this.platformJson('/v1/world/achievements/share', {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body,
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'GET' && path === '/achievements') {
        const result = await this.platformJson('/v1/world/achievements', {
          headers: { authorization: `Bearer ${this.token}` },
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'GET' && path === '/events') {
        const result = await this.platformJson(`/v1/world/events${url.search || '?limit=20'}`).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'GET' && path === '/weekly-quests') {
        const result = await this.platformJson('/v1/world/weekly-quests', {
          headers: { authorization: `Bearer ${this.token}` },
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && path === '/weekly-quests/claim') {
        const body = await this.readJson(req)
        const result = await this.platformJson('/v1/world/weekly-quests/claim', {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body,
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        if (result.body?.ok) await this.refreshProfile()
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && path === '/checkin/makeup') {
        const result = await this.platformJson('/v1/world/checkin/makeup', {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body: {},
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        if (result.body?.ok) await this.refreshProfile()
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && path === '/checkin/monthly') {
        const result = await this.platformJson('/v1/world/checkin/monthly', {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body: {},
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        if (result.body?.ok) await this.refreshProfile()
        return this.sendJson(res, result.status, result.body)
      }

      if (path === '/fortune' && (method === 'GET' || method === 'POST')) {
        const result = await this.platformJson('/v1/world/fortune', {
          method,
          headers: { authorization: `Bearer ${this.token}` },
          body: method === 'POST' ? {} : undefined,
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        if (result.body?.ok) await this.refreshProfile()
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'GET' && path === '/checkin') {
        const result = await this.platformJson('/v1/world/checkin', {
          headers: { authorization: `Bearer ${this.token}` },
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && path === '/checkin') {
        const result = await this.platformJson('/v1/world/checkin', {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body: {},
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        if (result.body?.ok) await this.refreshProfile()
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'GET' && path === '/quests') {
        const result = await this.platformJson('/v1/world/quests', {
          headers: { authorization: `Bearer ${this.token}` },
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'GET' && path === '/chat') {
        const result = await this.platformJson('/v1/world/chat?limit=50').catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && path === '/chat') {
        const body = await this.readJson(req)
        const result = await this.platformJson('/v1/world/chat', {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body,
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      const chatDeleteMatch = /^\/chat\/(\d+)$/.exec(path)
      if (method === 'DELETE' && chatDeleteMatch) {
        const result = await this.platformJson(`/v1/world/chat/${chatDeleteMatch[1]}`, {
          method: 'DELETE',
          headers: { authorization: `Bearer ${this.token}` },
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && path === '/account/delete') {
        const body = await this.readJson(req)
        const result = await this.platformJson('/v1/world/account/delete', {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body,
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        if (result.body?.ok) this.token = null
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'GET' && path === '/leaderboards') {
        const headers = this.token ? { authorization: `Bearer ${this.token}` } : {}
        const result = await this.platformJson(`/v1/world/leaderboards${url.search}`, { headers }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'GET' && path === '/rankings') {
        const headers = this.token ? { authorization: `Bearer ${this.token}` } : {}
        const result = await this.platformJson(`/v1/world/rankings${url.search}`, { headers }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'GET' && path === '/globe3d.js') {
        try {
          const body = await readFile(new URL('./assets/globe3d.js', import.meta.url), 'utf8')
          res.writeHead(200, {
            'content-type': 'application/javascript; charset=utf-8',
            'cache-control': 'no-cache, must-revalidate',
          })
          return res.end(body)
        } catch {
          return this.sendJson(res, 500, { ok: false, reason: 'globe-asset-missing' })
        }
      }

      if (method === 'GET' && path === '/geo') {
        try {
          const response = await fetch(this.platformUrl + '/assets/countries.topo.json')
          const buffer = Buffer.from(await response.arrayBuffer())
          res.writeHead(response.status, {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'public, max-age=86400',
          })
          return res.end(buffer)
        } catch {
          return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        }
      }

      if (method === 'GET' && path === '/globe') {
        const result = await this.platformJson('/v1/world/globe').catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'GET' && path === '/region-options') {
        const headers = this.token ? { authorization: `Bearer ${this.token}` } : {}
        const result = await this.platformJson(`/v1/region-options${url.search}`, { headers }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'GET' && path === '/regions') {
        const result = await this.platformJson('/v1/regions').catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && path === '/pet/region') {
        const body = await this.readJson(req)
        const result = await this.platformJson('/v1/world/pet/region', {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body,
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        if (result.body?.ok) await this.refreshProfile()
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && path === '/pet/bio') {
        const body = await this.readJson(req)
        const result = await this.platformJson('/v1/world/pet/bio', {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body,
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        if (result.body?.ok) await this.refreshProfile()
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && path === '/pet/title') {
        const body = await this.readJson(req)
        const result = await this.platformJson('/v1/world/pet/title', {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body,
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        if (result.body?.ok) await this.refreshProfile()
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && path === '/pet/rename') {
        const body = await this.readJson(req)
        const result = await this.platformJson('/v1/world/pet/rename', {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body,
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        if (result.body?.ok) await this.refreshProfile()
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && path === '/settings') {
        const body = await this.readJson(req)
        const result = await this.platformJson('/v1/world/settings', {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body,
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        if (result.body?.ok) await this.refreshProfile()
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'GET' && path === '/gifts') {
        const result = await this.platformJson('/v1/world/gifts', {
          headers: { authorization: `Bearer ${this.token}` },
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && path === '/gifts') {
        const body = await this.readJson(req)
        const result = await this.platformJson('/v1/world/gifts', {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body,
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        if (result.body?.ok) await this.refreshProfile()
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && path === '/quests/claim') {
        const body = await this.readJson(req)
        const result = await this.platformJson('/v1/world/quests/claim', {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body,
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        if (result.body?.ok) await this.refreshProfile()
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'GET' && path === '/explore') {
        const result = await this.platformJson('/v1/world/explore', {
          headers: { authorization: `Bearer ${this.token}` },
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && path === '/explore/start') {
        const body = await this.readJson(req)
        const result = await this.platformJson('/v1/world/explore/start', {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body,
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        if (result.body?.ok) await this.refreshProfile()
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && (path === '/dungeon/coop/create' || path === '/dungeon/coop/join')) {
        const body = await this.readJson(req)
        const result = await this.platformJson(`/v1/world${path}`, {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body,
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        if (result.body?.ok) await this.refreshProfile()
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'GET' && path === '/dungeon') {
        const result = await this.platformJson('/v1/world/dungeon', {
          headers: { authorization: `Bearer ${this.token}` },
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable', message: '平台不可达' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && path === '/dungeon/start') {
        const body = await this.readJson(req)
        const result = await this.platformJson('/v1/world/dungeon/start', {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body,
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable', message: '平台不可达' })
        if (result.body?.ok) await this.refreshProfile()
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'GET' && path === '/export') {
        const result = await this.platformJson('/v1/world/export', {
          headers: { authorization: `Bearer ${this.token}` },
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'GET' && path === '/inventory') {
        const result = await this.platformJson('/v1/world/inventory', {
          headers: { authorization: `Bearer ${this.token}` },
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && (path === '/inventory/equip' || path === '/inventory/upgrade' || path === '/inventory/dismantle' || path === '/inventory/gift')) {
        const body = await this.readJson(req)
        const result = await this.platformJson(`/v1/world${path}`, {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body,
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        if (result.body?.ok) await this.refreshProfile()
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'GET' && path === '/shop') {
        const result = await this.platformJson('/v1/world/shop', {
          headers: { authorization: `Bearer ${this.token}` },
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && path === '/shop/buy') {
        const body = await this.readJson(req)
        const result = await this.platformJson('/v1/world/shop/buy', {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body,
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        if (result.body?.ok) await this.refreshProfile()
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && path === '/recovery') {
        const result = await this.platformJson('/v1/world/recovery', {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body: {},
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && path === '/offline/claim') {
        const result = await this.platformJson('/v1/world/offline/claim', {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body: {},
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        if (result.body?.ok) await this.refreshProfile()
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'GET' && path === '/messages/thread') {
        const dfyId = url.searchParams.get('dfyId') ?? ''
        const result = await this.platformJson(`/v1/world/messages/thread?dfyId=${encodeURIComponent(dfyId)}`, {
          headers: { authorization: `Bearer ${this.token}` },
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'DELETE' && path === '/messages/thread') {
        const dfyId = url.searchParams.get('dfyId') ?? ''
        const result = await this.platformJson(`/v1/world/messages/thread?dfyId=${encodeURIComponent(dfyId)}`, {
          method: 'DELETE',
          headers: { authorization: `Bearer ${this.token}` },
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'DELETE' && path === '/messages') {
        const result = await this.platformJson('/v1/world/messages', {
          method: 'DELETE',
          headers: { authorization: `Bearer ${this.token}` },
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'GET' && path === '/messages') {
        const result = await this.platformJson('/v1/world/messages', {
          headers: { authorization: `Bearer ${this.token}` },
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && (path === '/messages/send' || path === '/messages/read')) {
        const body = await this.readJson(req)
        const result = await this.platformJson(`/v1/world${path}`, {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body: body ?? {},
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      const petDetailMatch = /^\/pets\/([^/]+)\/detail$/.exec(path)
      if (method === 'GET' && petDetailMatch) {
        const result = await this.platformJson(`/v1/world/pets/${encodeURIComponent(petDetailMatch[1])}/detail`, {
          headers: { authorization: `Bearer ${this.token}` },
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'GET' && path === '/friends') {
        const result = await this.platformJson('/v1/world/friends', {
          headers: { authorization: `Bearer ${this.token}` },
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && path.startsWith('/friends/')) {
        const body = await this.readJson(req)
        const action = path.slice('/friends/'.length)
        if (!['request', 'accept', 'remove', 'visit'].includes(action)) return this.sendJson(res, 404, { ok: false, reason: 'not-found' })
        const result = await this.platformJson(`/v1/world/friends/${action}`, {
          method: 'POST',
          headers: { authorization: `Bearer ${this.token}` },
          body,
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'GET' && path === '/leaderboard') {
        const type = url.searchParams.get('type') ?? 'wealth'
        const scope = url.searchParams.get('scope') ?? 'global'
        const result = await this.platformJson(
          `/v1/world/leaderboards?type=${encodeURIComponent(type)}&scope=${encodeURIComponent(scope)}`,
          { headers: { authorization: `Bearer ${this.token}` } },
        ).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'GET' && (path === '/world' || path === '/plaza')) {
        const result = await this.platformJson('/v1/world/presence').catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable', message: '平台不可达' })
        return this.sendJson(res, result.status, result.body)
      }

      const sayMatch = /^\/(?:world|plaza)\/([^/]+)\/say$/.exec(path)
      if (method === 'POST' && sayMatch) {
        const body = await this.readJson(req)
        const result = await this.platformJson(`/v1/world/${encodeURIComponent(sayMatch[1])}/say`, {
          method: 'POST',
          body: {
            text: String(body.text ?? '').slice(0, 200),
            fromDfyId: body.fromDfyId == null ? undefined : String(body.fromDfyId).slice(0, 64),
          },
        }).catch(() => null)
        if (!result) return this.sendJson(res, 502, { ok: false, reason: 'platform-unreachable' })
        return this.sendJson(res, result.status, result.body)
      }

      if (method === 'POST' && path === '/pet/say') {
        const body = await this.readJson(req)
        await this.petBroadcast(String(body.text ?? '').slice(0, 200))
        return this.sendJson(res, 200, { ok: true })
      }

      if (method === 'POST' && path === '/pet/work') {
        const body = await this.readJson(req)
        await this.startShift(Number(body.seconds ?? 30), String(body.task ?? '给世界摸鱼').slice(0, 40))
        return this.sendJson(res, 200, { ok: true, ...this.status() })
      }

      return this.sendJson(res, 404, { ok: false, reason: 'not-found' })
    } catch (error) {
      return this.sendJson(res, 500, { ok: false, reason: 'internal-error', message: error.message })
    }
  }

  async readJson(req) {
    const chunks = []
    let size = 0
    for await (const chunk of req) {
      size += chunk.length
      if (size > 64 * 1024) throw new Error('body too large')
      chunks.push(chunk)
    }
    if (size === 0) return {}
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  }
}

/** Cordis 插件入口。 */
export function apply(ctx, config = {}) {
  const connector = new Connector(ctx, config)
  ctx.effect(() => {
    connector.start()
    return () => connector.dispose()
  }, 'dsh-pet-connector')
}
