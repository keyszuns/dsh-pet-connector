/* 大肥鱼世界 3D 地球：WebGL 球体 + 国家边界纹理 + 玩家标记（零依赖）。 */
;(function () {
  'use strict'

  function decodeTopology(topology) {
    var transform = topology.transform || { scale: [1, 1], translate: [0, 0] }
    var arcs = topology.arcs.map(function (arc) {
      var x = 0
      var y = 0
      return arc.map(function (point) {
        x += point[0]
        y += point[1]
        return [x * transform.scale[0] + transform.translate[0], y * transform.scale[1] + transform.translate[1]]
      })
    })
    function ring(indices) {
      var points = []
      indices.forEach(function (index) {
        var arc = index >= 0 ? arcs[index] : arcs[-index - 1].slice().reverse()
        arc.forEach(function (point, i) {
          if (points.length && i === 0) return
          points.push(point)
        })
      })
      return points
    }
    var countries = []
    ;((topology.objects && topology.objects.countries && topology.objects.countries.geometries) || []).forEach(function (geometry) {
      var polygons = []
      if (geometry.type === 'Polygon') polygons = [geometry.arcs.map(ring)]
      else if (geometry.type === 'MultiPolygon') polygons = geometry.arcs.map(function (polygon) { return polygon.map(ring) })
      if (polygons.length) {
        countries.push({
          name: (geometry.properties && geometry.properties.name) || '',
          id: geometry.id || geometry.properties?.name || '',
          polygons: polygons,
        })
      }
    })
    return countries
  }

  function buildTexture(countries, width, height) {
    var canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    var ctx = canvas.getContext('2d')
    var ocean = ctx.createLinearGradient(0, 0, 0, height)
    ocean.addColorStop(0, '#0c2f4a')
    ocean.addColorStop(0.5, '#0a263c')
    ocean.addColorStop(1, '#071a2b')
    ctx.fillStyle = ocean
    ctx.fillRect(0, 0, width, height)
    // 经纬网
    ctx.strokeStyle = 'rgba(140,200,240,0.10)'
    ctx.lineWidth = 1
    for (var lon = -180; lon <= 180; lon += 15) {
      var x = ((lon + 180) / 360) * width
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (var lat = -75; lat <= 75; lat += 15) {
      var y = ((90 - lat) / 180) * height
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    function pathOf(polygon) {
      ctx.beginPath()
      polygon.forEach(function (ring) {
        ring.forEach(function (point, index) {
          var px = ((point[0] + 180) / 360) * width
          var py = ((90 - point[1]) / 180) * height
          if (index === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        })
        ctx.closePath()
      })
    }
    countries.forEach(function (country, index) {
      var hue = (index * 47) % 360
      country.polygons.forEach(function (polygon) {
        pathOf(polygon)
        ctx.fillStyle = 'hsla(' + hue + ', 32%, 42%, 0.92)'
        ctx.fill('evenodd')
        ctx.strokeStyle = 'rgba(180,230,255,0.55)'
        ctx.lineWidth = 1.1
        ctx.stroke()
      })
    })
    // 高光/经向明暗，让球体有立体感
    var light = ctx.createRadialGradient(width * 0.32, height * 0.28, 10, width * 0.5, height * 0.5, width * 0.7)
    light.addColorStop(0, 'rgba(255,255,255,0.18)')
    light.addColorStop(0.55, 'rgba(255,255,255,0)')
    light.addColorStop(1, 'rgba(0,0,0,0.45)')
    ctx.fillStyle = light
    ctx.fillRect(0, 0, width, height)
    return canvas
  }

  function create(container, options) {
    options = options || {}
    var points = Array.isArray(options.points)
      ? options.points.filter(function (point) { return typeof point.lat === 'number' && typeof point.lon === 'number' })
      : []
    var userInteracted = false
    var centered = points.length > 0
    var yaw = options.yaw ?? -1.1
    var pitch = options.pitch ?? 0.18
    if (points.length && options.yaw === undefined) {
      yaw = (-points.reduce(function (sum, point) { return sum + point.lon }, 0) / points.length * Math.PI) / 180
    }
    var zoom = 1
    var autoRotate = true
    var lastInteraction = 0
    var dragging = false
    var dragMoved = 0
    var lastX = 0
    var lastY = 0
    var raf = 0
    var destroyed = false
    var selected = null

    container.innerHTML = ''
    container.style.position = container.style.position || 'relative'
    var glCanvas = document.createElement('canvas')
    glCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;cursor:grab;touch-action:none'
    var overlay = document.createElement('canvas')
    overlay.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none'
    var tooltip = document.createElement('div')
    tooltip.style.cssText = 'position:absolute;display:none;padding:6px 9px;border-radius:8px;background:rgba(8,18,30,0.92);border:1px solid rgba(120,190,240,0.5);color:#e8f2ff;font:12px/1.5 "Segoe UI",sans-serif;pointer-events:none;white-space:nowrap;z-index:3'
    var controls = document.createElement('div')
    controls.style.cssText = 'position:absolute;right:8px;bottom:8px;display:flex;gap:5px;z-index:2'
    ;[['＋', 1.25], ['－', 0.8], ['⛶', 0], ['⟲', 1]].forEach(function (item) {
      var button = document.createElement('button')
      button.textContent = item[0]
      button.title = item[0] === '⛶' ? '全屏查看' : item[0] === '⟲' ? '重置视角' : '缩放'
      button.style.cssText = 'width:28px;height:28px;border-radius:8px;border:1px solid rgba(120,190,240,0.45);background:rgba(10,24,38,0.8);color:#cfe8ff;cursor:pointer;font-size:14px'
      button.onclick = function (event) {
        event.stopPropagation()
        if (item[0] === '⟲') {
          yaw = -1.1
          pitch = 0.18
          zoom = 1
        } else if (item[0] === '⛶') {
          expand()
        } else {
          zoom = Math.max(0.65, Math.min(2.8, zoom * item[1]))
        }
        lastInteraction = Date.now()
        userInteracted = true
      }
      controls.appendChild(button)
    })
    var hint = document.createElement('div')
    hint.style.cssText = 'position:absolute;left:8px;bottom:8px;z-index:2;color:rgba(190,220,245,0.7);font:11px/1.4 "Segoe UI",sans-serif;pointer-events:none'
    hint.textContent = options.expandMode === 'inline' ? '拖动旋转 · 滚轮缩放 · 点击地球放大' : '拖动旋转 · 滚轮缩放 · 点击地球全屏'
    container.appendChild(glCanvas)
    container.appendChild(overlay)
    container.appendChild(tooltip)
    container.appendChild(controls)
    container.appendChild(hint)

    var gl = glCanvas.getContext('webgl', { antialias: true, alpha: true })
    if (!gl) {
      glCanvas.style.display = 'none'
      tooltip.style.display = 'block'
      tooltip.style.position = 'static'
      tooltip.textContent = '当前环境不支持 WebGL，无法显示 3D 地球。'
      return { setPoints: function () {}, destroy: function () {} }
    }
    var vertexSource = [
      'attribute vec3 aPosition;',
      'attribute vec2 aUv;',
      'uniform float uYaw;',
      'uniform float uPitch;',
      'uniform vec2 uScale;',
      'varying vec2 vUv;',
      'varying vec3 vNormal;',
      'void main() {',
      '  float cy = cos(uYaw); float sy = sin(uYaw);',
      '  float cp = cos(uPitch); float sp = sin(uPitch);',
      '  vec3 p = vec3(aPosition.x * cy + aPosition.z * sy, aPosition.y, -aPosition.x * sy + aPosition.z * cy);',
      '  p = vec3(p.x, p.y * cp - p.z * sp, p.y * sp + p.z * cp);',
      '  vUv = aUv;',
      '  vNormal = normalize(p);',
      '  gl_Position = vec4(p.x * uScale.x, p.y * uScale.y, 0.5 - p.z * 0.5, 1.0);',
      '}',
    ].join('\n')
    var fragmentSource = [
      'precision mediump float;',
      'uniform sampler2D uTexture;',
      'varying vec2 vUv;',
      'varying vec3 vNormal;',
      'void main() {',
      '  vec3 color = texture2D(uTexture, vUv).rgb;',
      '  vec3 lightDir = normalize(vec3(-0.45, 0.55, 1.0));',
      '  float shade = 0.52 + 0.48 * max(dot(vNormal, lightDir), 0.0);',
      '  float rim = smoothstep(0.0, 0.45, 1.0 - abs(vNormal.z));',
      '  color = color * shade + vec3(0.05, 0.12, 0.18) * rim;',
      '  gl_FragColor = vec4(color, 1.0);',
      '}',
    ].join('\n')
    function compile(type, source) {
      var shader = gl.createShader(type)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }
    var program = gl.createProgram()
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource))
    gl.linkProgram(program)
    gl.useProgram(program)
    var segments = 64
    var rings = 32
    var positions = []
    var uvs = []
    var indices = []
    for (var i = 0; i <= rings; i += 1) {
      var v = i / rings
      var phi = v * Math.PI
      for (var j = 0; j <= segments; j += 1) {
        var u = j / segments
        var theta = u * Math.PI * 2
        var x = -Math.sin(phi) * Math.sin(theta)
        var y = Math.cos(phi)
        var z = -Math.sin(phi) * Math.cos(theta)
        positions.push(x, y, z)
        uvs.push(u, 1 - v)
      }
    }
    for (var r = 0; r < rings; r += 1) {
      for (var s = 0; s < segments; s += 1) {
        var a = r * (segments + 1) + s
        var b = a + segments + 1
        indices.push(a, b, a + 1, b, b + 1, a + 1)
      }
    }
    function buffer(data, type) {
      var item = gl.createBuffer()
      gl.bindBuffer(type, item)
      gl.bufferData(type, new Float32Array(data), gl.STATIC_DRAW)
      return item
    }
    var positionBuffer = buffer(positions, gl.ARRAY_BUFFER)
    var uvBuffer = buffer(uvs, gl.ARRAY_BUFFER)
    var indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
    var aPosition = gl.getAttribLocation(program, 'aPosition')
    var aUv = gl.getAttribLocation(program, 'aUv')
    gl.enableVertexAttribArray(aPosition)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(aUv)
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer)
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0)
    var uYaw = gl.getUniformLocation(program, 'uYaw')
    var uPitch = gl.getUniformLocation(program, 'uPitch')
    var uScale = gl.getUniformLocation(program, 'uScale')
    var texture = gl.createTexture()
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LESS)
    gl.clearDepth(1.0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    var textureReady = false
    var baseSize = 1

    function resize() {
      var rect = container.getBoundingClientRect()
      var dpr = Math.min(2, window.devicePixelRatio || 1)
      var width = Math.max(220, Math.floor(rect.width || 300))
      var height = Math.max(220, Math.floor(rect.height || 320))
      glCanvas.width = Math.floor(width * dpr)
      glCanvas.height = Math.floor(height * dpr)
      overlay.width = glCanvas.width
      overlay.height = glCanvas.height
      gl.viewport(0, 0, glCanvas.width, glCanvas.height)
      baseSize = Math.min(width, height) * 0.44
      draw()
    }
    var resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(function () { resize() }) : null
    if (resizeObserver) resizeObserver.observe(container)

    function rot(lat, lon) {
      var rad = Math.PI / 180
      var la = lat * rad
      var lo = lon * rad
      var x = Math.cos(la) * Math.sin(lo)
      var y = Math.sin(la)
      var z = Math.cos(la) * Math.cos(lo)
      var cy = Math.cos(yaw)
      var sy = Math.sin(yaw)
      var px = x * cy + z * sy
      var pz = -x * sy + z * cy
      var cp = Math.cos(pitch)
      var sp = Math.sin(pitch)
      return { x: px, y: y * cp - pz * sp, z: y * sp + pz * cp }
    }

    function draw() {
      if (destroyed) return
      var width = glCanvas.width
      var height = glCanvas.height
      var dpr = Math.min(2, window.devicePixelRatio || 1)
      var S = baseSize * zoom * dpr
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.useProgram(program)
      gl.uniform1f(uYaw, yaw)
      gl.uniform1f(uPitch, pitch)
      gl.uniform2f(uScale, (2 * S) / width, (2 * S) / height)
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
      // 标记层
      var ctx = overlay.getContext('2d')
      ctx.clearRect(0, 0, overlay.width, overlay.height)
      var cx = width / 2
      var cy = height / 2
      var visible = []
      points.forEach(function (point) {
        var position = rot(point.lat, point.lon)
        if (position.z <= 0.02) return
        visible.push({ point: point, x: cx + position.x * S, y: cy - position.y * S, z: position.z })
      })
      visible.sort(function (a, b) { return a.z - b.z })
      visible.forEach(function (item) {
        var radius = (1.6 + 2.4 * item.z) * dpr
        var alpha = 0.45 + 0.55 * item.z
        ctx.beginPath()
        ctx.arc(item.x, item.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = item.point.online ? 'rgba(46,230,166,' + alpha + ')' : 'rgba(127,180,255,' + alpha + ')'
        ctx.fill()
        ctx.strokeStyle = 'rgba(5,20,35,0.8)'
        ctx.lineWidth = dpr
        ctx.stroke()
        if (item.point === selected) {
          ctx.beginPath()
          ctx.arc(item.x, item.y, radius * 3, 0, Math.PI * 2)
          ctx.strokeStyle = 'rgba(255,255,255,0.8)'
          ctx.lineWidth = dpr
          ctx.stroke()
        }
      })
      if (selected) {
        var current = visible.find(function (item) { return item.point === selected })
        if (!current) selected = null
      }
      if (selected && tooltip.style.display !== 'none') {
        // tooltip 跟随上次位置，不额外移动
      }
      overlay._visible = visible
    }

    function tick() {
      if (destroyed) return
      if (autoRotate && !dragging && Date.now() - lastInteraction > 2200) {
        yaw += 0.0016
      }
      draw()
      raf = requestAnimationFrame(tick)
    }

    var expanded = null
    var inlineExpanded = false
    var inlineStyle = null
    if (options.expandMode === 'inline' && !document.getElementById('dfy-globe-inline-style')) {
      inlineStyle = document.createElement('style')
      inlineStyle.id = 'dfy-globe-inline-style'
      inlineStyle.textContent = '.dfy-globe-inline-expanded{height:520px !important;flex:1 1 100% !important;max-width:none !important;}'
      document.head.appendChild(inlineStyle)
    }
    function toggleInline() {
      inlineExpanded = !inlineExpanded
      container.classList.toggle('dfy-globe-inline-expanded', inlineExpanded)
      hint.textContent = inlineExpanded ? '点击地球收起 · 拖动旋转 · 滚轮缩放' : '拖动旋转 · 滚轮缩放 · 点击地球放大'
      requestAnimationFrame(resize)
      lastInteraction = Date.now()
        userInteracted = true
    }
    function closeExpanded() {
      if (!expanded) return
      try { expanded.instance.destroy() } catch {}
      try { expanded.overlay.remove() } catch {}
      document.removeEventListener('keydown', expanded.onKey)
      expanded = null
    }

    function expand() {
      if (options.expandMode === 'inline') {
        toggleInline()
        return
      }
      if (expanded || options.allowExpand === false) return
      var overlay = document.createElement('div')
      overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#040a12;display:flex;flex-direction:column;font:14px/1.5 "Segoe UI","PingFang SC",sans-serif'
      var bar = document.createElement('div')
      bar.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px;color:#e8f2ff;border-bottom:1px solid rgba(120,190,240,0.2)'
      var title = document.createElement('div')
      title.textContent = '🌍 全球大肥鱼 · 3D 地球'
      title.style.fontWeight = '600'
      var detail = document.createElement('div')
      detail.textContent = points.length + ' 条大肥鱼 · 拖动旋转 / 滚轮缩放'
      detail.style.cssText = 'flex:1;color:rgba(170,205,235,0.8);font-size:12px'
      var close = document.createElement('button')
      close.textContent = '关闭'
      close.style.cssText = 'border:1px solid rgba(120,190,240,0.45);border-radius:8px;padding:6px 14px;background:rgba(10,24,38,0.8);color:#cfe8ff;cursor:pointer'
      close.onclick = closeExpanded
      bar.appendChild(title)
      bar.appendChild(detail)
      bar.appendChild(close)
      var stage = document.createElement('div')
      stage.style.cssText = 'position:relative;flex:1;min-height:0'
      overlay.appendChild(bar)
      overlay.appendChild(stage)
      overlay.addEventListener('pointerdown', function (event) {
        if (event.target === overlay) closeExpanded()
      })
      document.body.appendChild(overlay)
      var instance = create(stage, {
        geoUrl: options.geoUrl,
        points: points,
        yaw: yaw,
        pitch: pitch,
        zoom: 1,
        allowExpand: false,
      })
      var onKey = function (event) {
        if (event.key === 'Escape') closeExpanded()
      }
      document.addEventListener('keydown', onKey)
      expanded = { overlay: overlay, instance: instance, onKey: onKey }
      overlay.addEventListener('click', function (event) {
        if (event.target === overlay) closeExpanded()
      })
    }

    function showTooltip(item) {
      selected = item.point
      tooltip.style.display = 'block'
      tooltip.innerHTML = ''
      var name = document.createElement('div')
      name.textContent = item.point.name
      name.style.fontWeight = '600'
      var region = document.createElement('div')
      region.textContent = (item.point.region || '') + (item.point.online ? ' · 在线' : ' · 离线')
      region.style.color = 'rgba(160,205,240,0.9)'
      tooltip.appendChild(name)
      tooltip.appendChild(region)
      var rect = container.getBoundingClientRect()
      var scaleX = rect.width / overlay.width
      var scaleY = rect.height / overlay.height
      tooltip.style.left = Math.max(6, Math.min(rect.width - 150, item.x * scaleX - 40)) + 'px'
      tooltip.style.top = Math.max(6, item.y * scaleY - 48) + 'px'
      lastInteraction = Date.now()
        userInteracted = true
    }

    glCanvas.addEventListener('pointerdown', function (event) {
      dragging = true
      dragMoved = 0
      lastX = event.clientX
      lastY = event.clientY
      glCanvas.setPointerCapture(event.pointerId)
      glCanvas.style.cursor = 'grabbing'
    })
    glCanvas.addEventListener('pointermove', function (event) {
      if (!dragging) return
      var dx = event.clientX - lastX
      var dy = event.clientY - lastY
      lastX = event.clientX
      lastY = event.clientY
      dragMoved += Math.abs(dx) + Math.abs(dy)
      yaw += dx * 0.006
      pitch = Math.max(-1.2, Math.min(1.2, pitch + dy * 0.005))
      lastInteraction = Date.now()
        userInteracted = true
    })
    function finishPointer(event) {
      if (!dragging) return
      dragging = false
      glCanvas.style.cursor = 'grab'
      if (dragMoved < 5) {
        var rect = glCanvas.getBoundingClientRect()
        var px = (event.clientX - rect.left) * (overlay.width / rect.width)
        var py = (event.clientY - rect.top) * (overlay.height / rect.height)
        var hit = (overlay._visible || []).find(function (item) {
          return Math.hypot(item.x - px, item.y - py) < 16 * Math.min(2, window.devicePixelRatio || 1)
        })
        if (hit) showTooltip(hit)
        else if (options.allowExpand !== false) expand()
      }
    }
    glCanvas.addEventListener('pointerup', finishPointer)
    glCanvas.addEventListener('pointercancel', finishPointer)
    glCanvas.addEventListener('wheel', function (event) {
      event.preventDefault()
      zoom = Math.max(0.65, Math.min(2.8, zoom * (event.deltaY > 0 ? 0.9 : 1.1)))
      lastInteraction = Date.now()
        userInteracted = true
    }, { passive: false })
    glCanvas.addEventListener('dblclick', function () {
      zoom = 1
      yaw = -1.1
      pitch = 0.18
    })

    var geoUrl = options.geoUrl
    if (geoUrl) {
      fetch(geoUrl)
        .then(function (response) { return response.json() })
        .then(function (topology) {
          var countries = decodeTopology(topology)
          var textureCanvas = buildTexture(countries, 2048, 1024)
          gl.bindTexture(gl.TEXTURE_2D, texture)
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureCanvas)
          textureReady = true
          draw()
        })
        .catch(function () { /* 地图加载失败时保留纯色球体 */ })
    }
    resize()
    tick()
    return {
      setPoints: function (next) {
        points = Array.isArray(next) ? next.filter(function (point) { return typeof point.lat === 'number' && typeof point.lon === 'number' }) : []
        // 第一次拿到玩家点时必须把地球转到玩家所在经度。
        // 不能只在 textureReady=false 时转：地图缓存/加载很快时旧逻辑会保留
        // 默认的 -1.1 rad（大西洋方向），点和地图就会看起来对不上。
        if (points.length && !userInteracted && !centered) {
          var avg = points.reduce(function (sum, point) { return sum + point.lon }, 0) / points.length
          yaw = (-avg * Math.PI) / 180
          centered = true
        }
        selected = null
        tooltip.style.display = 'none'
        draw()
      },
      getState: function () {
        return { yaw: yaw, pitch: pitch, zoom: zoom, points: points.length, selected: selected ? selected.name : null, expanded: Boolean(expanded || inlineExpanded) }
      },
      expand: expand,
      destroy: function () {
        destroyed = true
        closeExpanded()
        container.classList.remove('dfy-globe-inline-expanded')
        if (inlineStyle) inlineStyle.remove()
        cancelAnimationFrame(raf)
        if (resizeObserver) resizeObserver.disconnect()
        try { gl.getExtension('WEBGL_lose_context')?.loseContext() } catch {}
        container.innerHTML = ''
      },
    }
  }

  window.DFYGlobe = { create: create }
})()
