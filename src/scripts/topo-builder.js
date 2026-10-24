// ============================================================================
// NETRED // INTERACTIVE NETWORK TOPOLOGY BUILDER & SIMULATOR
// Построение, визуализация и симуляция сети (включая AI-генератор по описанию)
// ============================================================================

export class NetworkTopologySimulator {
  constructor(containerId, svgId, nodesLayerId, appInstance) {
    this.container = document.getElementById(containerId);
    this.svg = document.getElementById(svgId);
    this.nodesLayer = document.getElementById(nodesLayerId);
    this.app = appInstance;

    this.nodes = [];
    this.links = [];
    this.selectedNodeId = null;
    this.connectSourceId = null;
    this.currentMode = 'select'; // 'select', 'connect', 'ping', 'delete'
    this.pingSourceId = null;
    this.isDragging = false;
    this.draggedNode = null;
    this.dragOffset = { x: 0, y: 0 };
    this.isSimulating = false;

    this.nodeTypeIcons = {
      router: `<svg class="device-node-svg" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="11" width="20" height="8" rx="2"></rect><circle cx="6" cy="15" r="1" fill="currentColor"></circle><circle cx="10" cy="15" r="1" fill="currentColor"></circle><path d="M14 15h4"></path><path d="M8 7l4-4 4 4"></path><path d="M12 3v8"></path></svg>`,
      switch: `<svg class="device-node-svg" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="10" rx="2"></rect><path d="M6 12h4m-2-2 2 2-2 2"></path><path d="M18 12h-4m2-2-2 2 2 2"></path></svg>`,
      firewall: `<svg class="device-node-svg" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
      server: `<svg class="device-node-svg" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"></rect><rect x="2" y="14" width="20" height="8" rx="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>`,
      pc: `<svg class="device-node-svg" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
      cloud: `<svg class="device-node-svg" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`
    };

    this.nodeTypeNames = {
      router: 'Маршрутизатор',
      switch: 'Коммутатор',
      firewall: 'Межсетевой экран',
      server: 'Сервер',
      pc: 'Рабочая станция',
      cloud: 'Интернет / WAN'
    };

    this.init();
  }

  init() {
    if (!this.container || !this.svg || !this.nodesLayer) return;

    this.setupEventListeners();
    this.setupToolbar();
    this.setupAiModal();
    this.loadDefaultTopology();
    this.render();
  }

  setupEventListeners() {
    // Ресайз окна — перерисовка связей
    window.addEventListener('resize', () => this.updateLinks());

    // Перетаскивание узлов по холсту (мышь + сенсорный ввод)
    this.container.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    window.addEventListener('mouseup', () => this.handleMouseUp());

    this.container.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches && e.touches[0]) {
        e.preventDefault();
        this.handleMouseMove(e.touches[0]);
      }
    }, { passive: false });
    window.addEventListener('touchend', () => this.handleMouseUp());

    // Клик по холсту (сброс выделения или завершение соединений)
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container || e.target === this.svg) {
        if (this.currentMode === 'connect') {
          this.connectSourceId = null;
          this.setModeIndicator('Выберите первый узел для соединения');
        } else if (this.currentMode === 'ping') {
          this.pingSourceId = null;
          this.setModeIndicator('Выберите исходный узел для отправки пакета');
        } else {
          this.selectedNodeId = null;
          this.renderInspector();
          this.renderNodesSelection();
        }
      }
    });

    // Очистка лога
    const clearLogBtn = document.getElementById('topo-clear-log-btn');
    if (clearLogBtn) {
      clearLogBtn.addEventListener('click', () => {
        const logBox = document.getElementById('topo-log-container');
        if (logBox) logBox.innerHTML = '<div class="topo-log-empty">Лог очищен. Ожидание событий...</div>';
      });
    }

    // Очистка всей топологии
    const clearTopoBtn = document.getElementById('topo-clear-btn');
    if (clearTopoBtn) {
      clearTopoBtn.addEventListener('click', () => {
        if (confirm('Вы уверены, что хотите очистить всю схему сети?')) {
          this.nodes = [];
          this.links = [];
          this.selectedNodeId = null;
          this.connectSourceId = null;
          this.pingSourceId = null;
          this.render();
          this.logEvent('info', 'Топология полностью очищена пользователем.');
          this.showToast('Рабочая область очищена');
        }
      });
    }
  }

  setupToolbar() {
    // Кнопки добавления устройств
    document.querySelectorAll('.topo-device-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = e.currentTarget.getAttribute('data-device-type');
        this.addDeviceAtCenter(type);
      });
    });

    // Кнопки режимов
    document.querySelectorAll('.topo-mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.currentTarget.getAttribute('data-mode');
        this.setMode(mode);
      });
    });
  }

  setMode(mode) {
    this.currentMode = mode;
    this.connectSourceId = null;
    this.pingSourceId = null;

    document.querySelectorAll('.topo-mode-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-mode') === mode);
    });

    const texts = {
      select: 'Режим: Выбор и перемещение узлов',
      connect: 'Режим: Соединение кабелем (кликните узел А, затем узел Б)',
      ping: 'Режим: Тест связности (кликните источник Ping, затем получатель)',
      delete: 'Режим: Удаление (кликните по узлу или связи для удаления)'
    };

    this.setModeIndicator(texts[mode] || mode);
    this.renderNodesSelection();
  }

  setModeIndicator(text) {
    const textEl = document.getElementById('topo-mode-text');
    if (textEl) textEl.textContent = text;
  }

  addDeviceAtCenter(type) {
    const rect = this.container.getBoundingClientRect();
    const count = this.nodes.filter(n => n.type === type).length + 1;
    
    // Смещение для новых устройств, чтобы не накладывались
    const offsetX = (count % 4) * 40;
    const offsetY = Math.floor(count / 4) * 40;
    const x = Math.max(40, rect.width / 2 - 80 + offsetX);
    const y = Math.max(40, rect.height / 2 - 50 + offsetY);

    const prefixMap = {
      router: 'R',
      switch: 'SW',
      firewall: 'FW',
      server: 'SRV',
      pc: 'PC',
      cloud: 'Internet'
    };

    const prefix = prefixMap[type] || 'Node';
    const name = type === 'cloud' ? 'Интернет (WAN)' : `${prefix}-${count}`;

    // Базовый IP по типу
    let ip = `192.168.1.${10 + count}`;
    let cidr = 24;
    let gateway = '192.168.1.1';

    if (type === 'router') {
      ip = `192.168.${count}.1`;
      gateway = '';
    } else if (type === 'firewall') {
      ip = '10.0.0.1';
      gateway = '';
    } else if (type === 'server') {
      ip = `192.168.1.${100 + count}`;
    } else if (type === 'cloud') {
      ip = '203.0.113.1';
      cidr = 30;
      gateway = '';
    }

    const newNode = {
      id: 'node_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      type,
      name,
      x,
      y,
      ip,
      cidr,
      gateway,
      vlan: type === 'pc' || type === 'server' ? '10' : '',
      status: 'online'
    };

    this.nodes.push(newNode);
    this.selectedNodeId = newNode.id;
    this.render();
    this.logEvent('success', `Добавлен узел: ${newNode.name} (${this.nodeTypeNames[type] || type}, IP: ${newNode.ip})`);
    this.showToast(`Добавлен: ${newNode.name}`);
  }

  handleMouseDown(e, node) {
    if (this.currentMode === 'delete') {
      this.deleteNode(node.id);
      return;
    }

    if (this.currentMode === 'connect') {
      this.handleConnectClick(node.id);
      return;
    }

    if (this.currentMode === 'ping') {
      this.handlePingClick(node.id);
      return;
    }

    // Режим выбора / перемещения
    this.selectedNodeId = node.id;
    this.isDragging = true;
    this.draggedNode = node;
    const rect = this.container.getBoundingClientRect();
    this.dragOffset.x = (e.clientX - rect.left) - node.x;
    this.dragOffset.y = (e.clientY - rect.top) - node.y;

    this.renderInspector();
    this.renderNodesSelection();
  }

  handleMouseMove(e) {
    if (!this.isDragging || !this.draggedNode) return;

    const rect = this.container.getBoundingClientRect();
    let newX = (e.clientX - rect.left) - this.dragOffset.x;
    let newY = (e.clientY - rect.top) - this.dragOffset.y;

    // Ограничение границами холста
    newX = Math.max(10, Math.min(rect.width - 150, newX));
    newY = Math.max(10, Math.min(rect.height - 90, newY));

    this.draggedNode.x = newX;
    this.draggedNode.y = newY;

    // Быстрое перемещение DOM-элемента узла
    const el = document.getElementById(this.draggedNode.id);
    if (el) {
      el.style.left = `${newX}px`;
      el.style.top = `${newY}px`;
    }

    this.updateLinks();
  }

  handleMouseUp() {
    this.isDragging = false;
    this.draggedNode = null;
  }

  handleConnectClick(nodeId) {
    if (!this.connectSourceId) {
      this.connectSourceId = nodeId;
      const srcNode = this.nodes.find(n => n.id === nodeId);
      this.setModeIndicator(`Соединение: выбран ${srcNode ? srcNode.name : 'узел'}. Кликните целевой узел.`);
      this.renderNodesSelection();
      this.logEvent('info', `Выбран узел-источник [${srcNode.name}]. Выберите узел назначения.`);
    } else {
      if (this.connectSourceId === nodeId) {
        this.showToast('Нельзя соединить узел с самим собой');
        return;
      }

      this.createLink(this.connectSourceId, nodeId);
      this.connectSourceId = null;
      this.setModeIndicator('Связь создана. Выберите следующий узел или смените режим.');
      this.renderNodesSelection();
    }
  }

  createLink(sourceId, targetId) {
    // Проверка на существующий линк
    const exists = this.links.some(l => 
      (l.sourceId === sourceId && l.targetId === targetId) ||
      (l.sourceId === targetId && l.targetId === sourceId)
    );

    if (exists) {
      this.showToast('Связь между этими узлами уже существует');
      return;
    }

    const n1 = this.nodes.find(n => n.id === sourceId);
    const n2 = this.nodes.find(n => n.id === targetId);
    if (!n1 || !n2) return;

    // Вычисление интерфейсов
    const n1LinksCount = this.links.filter(l => l.sourceId === sourceId || l.targetId === sourceId).length;
    const n2LinksCount = this.links.filter(l => l.sourceId === targetId || l.targetId === targetId).length;

    const if1 = n1.type === 'switch' ? `Fa0/${n1LinksCount + 1}` : `eth${n1LinksCount}`;
    const if2 = n2.type === 'switch' ? `Fa0/${n2LinksCount + 1}` : `eth${n2LinksCount}`;

    const newLink = {
      id: 'link_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      sourceId,
      targetId,
      sourceIf: if1,
      targetIf: if2,
      status: 'up',
      latency: (Math.random() * 1.5 + 0.5).toFixed(1)
    };

    this.links.push(newLink);
    this.render();
    this.logEvent('success', `Установлен линк: [${n1.name}:${if1}] ⟷ [${n2.name}:${if2}] (Статус: UP, ${newLink.latency} мс)`);
    this.showToast(`Соединено: ${n1.name} ⟷ ${n2.name}`);
  }

  deleteNode(nodeId) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Удалить связанные линки
    this.links = this.links.filter(l => l.sourceId !== nodeId && l.targetId !== nodeId);
    // Удалить узел
    this.nodes = this.nodes.filter(n => n.id !== nodeId);

    if (this.selectedNodeId === nodeId) {
      this.selectedNodeId = null;
    }

    this.render();
    this.logEvent('warn', `Удален узел [${node.name}] и все его подключения.`);
    this.showToast(`Удален узел: ${node.name}`);
  }

  deleteLink(linkId) {
    const link = this.links.find(l => l.id === linkId);
    if (!link) return;

    const n1 = this.nodes.find(n => n.id === link.sourceId);
    const n2 = this.nodes.find(n => n.id === link.targetId);

    this.links = this.links.filter(l => l.id !== linkId);
    this.render();
    this.logEvent('warn', `Разорван линк между [${n1 ? n1.name : '?'}] и [${n2 ? n2.name : '?'}]`);
    this.showToast('Связь удалена');
  }

  handlePingClick(nodeId) {
    if (!this.pingSourceId) {
      this.pingSourceId = nodeId;
      const srcNode = this.nodes.find(n => n.id === nodeId);
      this.setModeIndicator(`Ping: Источник [${srcNode ? srcNode.name : ''}]. Кликните узел назначения.`);
      this.renderNodesSelection();
      this.logEvent('info', `Пинг: Выбран источник [${srcNode ? srcNode.name : ''}] (${srcNode ? srcNode.ip : ''}). Укажите целевой узел.`);
    } else {
      if (this.pingSourceId === nodeId) {
        this.showToast('Источник и получатель совпадают');
        return;
      }

      this.executePingSimulation(this.pingSourceId, nodeId);
      this.pingSourceId = null;
      this.setModeIndicator('Пакет отправлен. Выберите новый источник или смените режим.');
      this.renderNodesSelection();
    }
  }

  // Алгоритм поиска пути (BFS) по физическим линкам
  findRoute(sourceId, targetId) {
    const queue = [[sourceId]];
    const visited = new Set([sourceId]);

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];

      if (current === targetId) {
        return path;
      }

      // Найти всех соседей по активным линкам
      const neighborLinks = this.links.filter(l => 
        l.status === 'up' && (l.sourceId === current || l.targetId === current)
      );

      for (const link of neighborLinks) {
        const neighborId = link.sourceId === current ? link.targetId : link.sourceId;
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push([...path, neighborId]);
        }
      }
    }

    return null;
  }

  executePingSimulation(sourceId, targetId) {
    if (this.isSimulating) {
      this.showToast('Симуляция уже выполняется...');
      return;
    }

    const srcNode = this.nodes.find(n => n.id === sourceId);
    const dstNode = this.nodes.find(n => n.id === targetId);
    if (!srcNode || !dstNode) return;

    this.isSimulating = true;
    this.logEvent('info', `[PING START] Отправка 64 байт с ${srcNode.name} (${srcNode.ip}) на ${dstNode.name} (${dstNode.ip})...`);

    const path = this.findRoute(sourceId, targetId);

    if (path && path.length > 1) {
      // Маршрут найден — анимируем прохождение пакета по узлам
      const pathNodes = path.map(id => this.nodes.find(n => n.id === id));
      const hopNames = pathNodes.map(n => n.name).join(' ➔ ');
      
      this.logEvent('info', `[МАРШРУТИЗАЦИЯ] Обнаружен маршрут (${path.length - 1} хоп): ${hopNames}`);
      this.animatePacketPath(pathNodes, true, () => {
        const rtt = ((path.length - 1) * 1.8 + Math.random() * 0.9).toFixed(1);
        this.logEvent('success', `[ICMP REPLY] Ответ от ${dstNode.ip}: байт=64 время=${rtt}мс TTL=64 (Успех: 0% потерь)`);
        this.showToast(`Ping успешен: ${srcNode.name} ➔ ${dstNode.name} (${rtt} мс)`);
        this.isSimulating = false;
      });
    } else {
      // Маршрут разорван или не существует
      this.logEvent('error', `[ICMP DROP] Ошибка: Маршрут до ${dstNode.name} (${dstNode.ip}) недоступен. Destination Host Unreachable.`);
      this.animateFailedPing(srcNode, () => {
        this.showToast(`Ошибка: Узел ${dstNode.name} недостижим`, true);
        this.isSimulating = false;
      });
    }
  }

  animatePacketPath(nodesList, isSuccess, onComplete) {
    let currentHop = 0;
    const packetEl = document.createElement('div');
    packetEl.className = 'topo-packet-dot';
    this.container.appendChild(packetEl);

    const stepDuration = 550; // мс на один хоп

    const moveToHop = (idx) => {
      if (idx >= nodesList.length - 1) {
        // Достигли финальной цели
        const finalNode = nodesList[nodesList.length - 1];
        const finalDom = document.getElementById(finalNode.id);
        if (finalDom) {
          finalDom.classList.add('ping-target-hit');
          setTimeout(() => finalDom.classList.remove('ping-target-hit'), 800);
        }

        setTimeout(() => {
          if (packetEl.parentNode) packetEl.parentNode.removeChild(packetEl);
          if (onComplete) onComplete();
        }, 300);
        return;
      }

      const fromNode = nodesList[idx];
      const toNode = nodesList[idx + 1];

      const startX = fromNode.x + 70;
      const startY = fromNode.y + 35;
      const endX = toNode.x + 70;
      const endY = toNode.y + 35;

      packetEl.style.left = `${startX}px`;
      packetEl.style.top = `${startY}px`;

      // Анимация перемещения
      requestAnimationFrame(() => {
        packetEl.style.transition = `all ${stepDuration}ms cubic-bezier(0.2, 0.8, 0.4, 1)`;
        packetEl.style.left = `${endX}px`;
        packetEl.style.top = `${endY}px`;
      });

      setTimeout(() => {
        currentHop++;
        moveToHop(currentHop);
      }, stepDuration);
    };

    moveToHop(0);
  }

  animateFailedPing(srcNode, onComplete) {
    const srcDom = document.getElementById(srcNode.id);
    if (srcDom) {
      srcDom.classList.add('ping-failed-shake');
      setTimeout(() => {
        srcDom.classList.remove('ping-failed-shake');
        if (onComplete) onComplete();
      }, 700);
    } else {
      if (onComplete) onComplete();
    }
  }

  render() {
    this.renderNodes();
    this.updateLinks();
    this.renderInspector();
    this.updateStats();
  }

  renderNodes() {
    this.nodesLayer.innerHTML = '';

    this.nodes.forEach(node => {
      const el = document.createElement('div');
      el.id = node.id;
      el.className = 'topo-node-box';
      el.style.left = `${node.x}px`;
      el.style.top = `${node.y}px`;

      if (this.selectedNodeId === node.id) el.classList.add('selected');
      if (this.connectSourceId === node.id) el.classList.add('connect-source');
      if (this.pingSourceId === node.id) el.classList.add('ping-source');

      const icon = this.nodeTypeIcons[node.type] || this.nodeTypeIcons.pc;

      el.innerHTML = `
        <div class="node-main-row">
          <span class="node-icon">${icon}</span>
          <div class="node-meta">
            <div class="node-name" title="${node.name}">${node.name}</div>
            <div class="node-ip">${node.ip}${node.cidr ? '/' + node.cidr : ''}</div>
          </div>
          <span class="node-status-dot ${node.status}"></span>
        </div>
        ${node.vlan ? `<div class="node-vlan-tag">VLAN ${node.vlan}</div>` : ''}
      `;

      el.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        this.handleMouseDown(e, node);
      });

      el.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        if (e.touches && e.touches[0]) {
          this.handleMouseDown(e.touches[0], node);
        }
      }, { passive: false });

      this.nodesLayer.appendChild(el);
    });
  }

  renderNodesSelection() {
    this.nodes.forEach(node => {
      const el = document.getElementById(node.id);
      if (!el) return;

      el.classList.toggle('selected', this.selectedNodeId === node.id);
      el.classList.toggle('connect-source', this.connectSourceId === node.id);
      el.classList.toggle('ping-source', this.pingSourceId === node.id);
    });
  }

  updateLinks() {
    this.svg.innerHTML = '';

    this.links.forEach(link => {
      const n1 = this.nodes.find(n => n.id === link.sourceId);
      const n2 = this.nodes.find(n => n.id === link.targetId);
      if (!n1 || !n2) return;

      // Центр узлов
      const x1 = n1.x + 70;
      const y1 = n1.y + 35;
      const x2 = n2.x + 70;
      const y2 = n2.y + 35;

      // SVG Линия кабеля
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('class', `topo-svg-link ${link.status === 'down' ? 'down' : ''}`);
      line.setAttribute('data-link-id', link.id);

      // Клик по линку (для удаления в режиме delete)
      line.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.currentMode === 'delete') {
          this.deleteLink(link.id);
        } else {
          this.logEvent('info', `Линк: [${n1.name}:${link.sourceIf}] ⟷ [${n2.name}:${link.targetIf}] (${link.latency} мс, ${link.status.toUpperCase()})`);
          this.showToast(`Линк: ${link.sourceIf} ⟷ ${link.targetIf} (${link.latency} мс)`);
        }
      });

      this.svg.appendChild(line);

      // Метки интерфейсов около концов кабеля
      const ifText1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      const ifText2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');

      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.hypot(dx, dy) || 1;
      const ux = dx / dist;
      const uy = dy / dist;

      ifText1.setAttribute('x', x1 + ux * 45);
      ifText1.setAttribute('y', y1 + uy * 45);
      ifText1.setAttribute('class', 'topo-if-label');
      ifText1.textContent = link.sourceIf;

      ifText2.setAttribute('x', x2 - ux * 45);
      ifText2.setAttribute('y', y2 - uy * 45);
      ifText2.setAttribute('class', 'topo-if-label');
      ifText2.textContent = link.targetIf;

      this.svg.appendChild(ifText1);
      this.svg.appendChild(ifText2);
    });
  }

  renderInspector() {
    const body = document.getElementById('topo-inspector-body');
    const badge = document.getElementById('insp-type-badge');
    if (!body) return;

    if (!this.selectedNodeId) {
      if (badge) badge.textContent = '—';
      body.innerHTML = '<p class="topo-empty-hint">Выберите узел на схеме для настройки IP-адресации, маски и шлюза.</p>';
      return;
    }

    const node = this.nodes.find(n => n.id === this.selectedNodeId);
    if (!node) return;

    if (badge) badge.textContent = this.nodeTypeNames[node.type] || node.type;

    const connectedLinks = this.links.filter(l => l.sourceId === node.id || l.targetId === node.id);

    body.innerHTML = `
      <div class="topo-form-stack">
        <div class="form-field">
          <label class="form-label">Имя устройства:</label>
          <input type="text" id="node-prop-name" class="form-input" value="${this.escapeHtml(node.name)}">
        </div>

        <div class="form-row" style="gap: 8px;">
          <div class="form-field" style="flex: 2;">
            <label class="form-label">IPv4 адрес:</label>
            <input type="text" id="node-prop-ip" class="form-input" value="${this.escapeHtml(node.ip)}">
          </div>
          <div class="form-field" style="flex: 1;">
            <label class="form-label">CIDR:</label>
            <input type="number" id="node-prop-cidr" class="form-input" value="${node.cidr || 24}" min="0" max="32">
          </div>
        </div>

        <div class="form-field">
          <label class="form-label">Шлюз по умолчанию (Gateway):</label>
          <input type="text" id="node-prop-gw" class="form-input" value="${this.escapeHtml(node.gateway || '')}" placeholder="например, 192.168.1.1">
        </div>

        ${node.type === 'pc' || node.type === 'server' ? `
          <div class="form-field">
            <label class="form-label">VLAN ID:</label>
            <input type="text" id="node-prop-vlan" class="form-input" value="${this.escapeHtml(node.vlan || '')}" placeholder="10">
          </div>
        ` : ''}

        <div class="topo-conn-summary">
          <span class="form-label">Подключения (${connectedLinks.length}):</span>
          <div class="topo-conn-list">
            ${connectedLinks.length > 0 ? connectedLinks.map(l => {
              const otherId = l.sourceId === node.id ? l.targetId : l.sourceId;
              const other = this.nodes.find(n => n.id === otherId);
              const myIf = l.sourceId === node.id ? l.sourceIf : l.targetIf;
              const otherIf = l.sourceId === node.id ? l.targetIf : l.sourceIf;
              return `<div class="topo-conn-item"><span>${myIf}</span> ➔ <strong>${other ? other.name : 'Unknown'}</strong> (${otherIf})</div>`;
            }).join('') : '<span style="color: var(--text-muted); font-size: 12px;">Нет активных подключений</span>'}
          </div>
        </div>

        <div class="topo-inspector-actions">
          <button class="accent-btn" id="save-node-props-btn" style="width: 100%;">
            <span>Сохранить изменения</span>
          </button>
          <div style="display: flex; gap: 8px;">
            <button class="minimal-btn" id="ping-from-node-btn" style="flex: 1;">
              <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none" style="display:inline-block; vertical-align:middle; margin-right:4px;">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span>Ping отсюда</span>
            </button>
            <button class="minimal-btn" id="delete-curr-node-btn" style="color: var(--accent-rose);">Удалить узел</button>
          </div>
        </div>
      </div>
    `;

    // Слушатель сохранения свойств
    const saveBtn = document.getElementById('save-node-props-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const nameInput = document.getElementById('node-prop-name');
        const ipInput = document.getElementById('node-prop-ip');
        const cidrInput = document.getElementById('node-prop-cidr');
        const gwInput = document.getElementById('node-prop-gw');
        const vlanInput = document.getElementById('node-prop-vlan');

        if (nameInput) node.name = nameInput.value.trim() || node.name;
        if (ipInput) node.ip = ipInput.value.trim() || node.ip;
        if (cidrInput) node.cidr = parseInt(cidrInput.value, 10) || 24;
        if (gwInput) node.gateway = gwInput.value.trim();
        if (vlanInput) node.vlan = vlanInput.value.trim();

        this.render();
        this.logEvent('info', `Обновлены параметры узла [${node.name}]: IP ${node.ip}/${node.cidr}`);
        this.showToast('Параметры сохранены');
      });
    }

    const pingFromBtn = document.getElementById('ping-from-node-btn');
    if (pingFromBtn) {
      pingFromBtn.addEventListener('click', () => {
        this.setMode('ping');
        this.handlePingClick(node.id);
      });
    }

    const delBtn = document.getElementById('delete-curr-node-btn');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        this.deleteNode(node.id);
      });
    }
  }

  updateStats() {
    const statsEl = document.getElementById('topo-canvas-stats');
    if (statsEl) {
      statsEl.textContent = `Узлов: ${this.nodes.length} | Линков: ${this.links.length}`;
    }
  }

  logEvent(type, message) {
    const logBox = document.getElementById('topo-log-container');
    if (!logBox) return;

    // Очистить плейсхолдер
    const empty = logBox.querySelector('.topo-log-empty');
    if (empty) logBox.innerHTML = '';

    const time = new Date().toTimeString().split(' ')[0];
    const item = document.createElement('div');
    item.className = `topo-log-entry ${type}`;
    item.innerHTML = `
      <span class="log-time">[${time}]</span>
      <span class="log-msg">${this.escapeHtml(message)}</span>
    `;

    logBox.prepend(item);
  }

  showToast(msg, isError = false) {
    if (this.app && typeof this.app.showToast === 'function') {
      this.app.showToast(msg);
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ==========================================================================
  // ГЕНЕРАТОР ТОПОЛОГИИ ПО ТЕКСТОВОМУ ОПИСАНИЮ / ШАБЛОНАМ
  // ==========================================================================
  setupAiModal() {
    const modal = document.getElementById('topo-ai-modal');
    const openBtn = document.getElementById('topo-ai-btn');
    const closeBtn = document.getElementById('topo-ai-close-btn');
    const cancelBtn = document.getElementById('topo-ai-cancel-btn');
    const generateBtn = document.getElementById('topo-ai-generate-btn');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => {
        modal.classList.add('open');
        const input = document.getElementById('topo-ai-input');
        if (input) input.focus();
      });
    }

    const closeModal = () => {
      if (modal) modal.classList.remove('open');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Кнопки пресетов внутри модального окна
    document.querySelectorAll('.topo-preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const presetKey = e.currentTarget.getAttribute('data-preset');
        this.loadPreset(presetKey);
        closeModal();
      });
    });

    // Обработка текстового ввода пользователя
    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        const input = document.getElementById('topo-ai-input');
        const text = input ? input.value.trim() : '';
        if (!text) {
          this.showToast('Введите описание сети или выберите шаблон');
          return;
        }

        this.generateTopologyFromPrompt(text);
        closeModal();
      });
    }
  }

  generateTopologyFromPrompt(prompt) {
    this.logEvent('info', `[AI-ГЕНЕРАТОР] Анализ описания: "${prompt}"...`);

    const lower = prompt.toLowerCase();

    // 1. Проверка на совпадение с ключевыми сценариями
    if (lower.includes('dmz') || (lower.includes('межсетев') && lower.includes('сервер')) || lower.includes('фаервол')) {
      this.loadPreset('enterprise_dmz');
      this.logEvent('success', 'Сгенерирована корпоративная архитектура с DMZ, фаерволом и сегментированными серверами.');
      return;
    }

    if (lower.includes('vlan') || lower.includes('отдел') || lower.includes('бухгалтер') || lower.includes('it')) {
      this.loadPreset('office_vlans');
      this.logEvent('success', 'Сгенерирована офисная сеть с двумя VLAN (Бухгалтерия и IT), L2-коммутатором и шлюзом.');
      return;
    }

    if (lower.includes('spine') || lower.includes('leaf') || lower.includes('цод') || lower.includes('дата-центр')) {
      this.loadPreset('spine_leaf');
      this.logEvent('success', 'Сгенерирована отказоустойчивая фабрика ЦОД Spine-Leaf.');
      return;
    }

    if (lower.includes('филиал') || lower.includes('wan') || lower.includes('офис и 2') || lower.includes('удален')) {
      this.loadPreset('branch_wan');
      this.logEvent('success', 'Сгенерирована распределенная сеть WAN: Главный офис + 2 филиала.');
      return;
    }

    if (lower.includes('звезд') || lower.includes('star')) {
      this.loadPreset('star_simple');
      this.logEvent('success', 'Сгенерирована классическая топология «Звезда» вокруг центрального шлюза.');
      return;
    }

    // 2. Универсальный синтаксический разбор свободного текста
    this.parseFreeformNetwork(lower, prompt);
  }

  parseFreeformNetwork(lower, originalPrompt) {
    // Извлекаем сущности из текста
    const wantInternet = lower.includes('интернет') || lower.includes('облако') || lower.includes('wan') || lower.includes('провайдер');
    const wantFirewall = lower.includes('фаервол') || lower.includes('файрвол') || lower.includes('firewall') || lower.includes('межсетевой');
    
    // Подсчет компьютеров
    let pcCount = 2;
    const pcMatch = lower.match(/(\d+)\s*(?:пк|компьют|хост|клиент|воркстейш)/);
    if (pcMatch) pcCount = Math.min(6, Math.max(1, parseInt(pcMatch[1], 10)));
    else if (lower.includes('компьютер') || lower.includes('пк')) pcCount = 3;

    // Подсчет серверов
    let srvCount = 0;
    const srvMatch = lower.match(/(\d+)\s*(?:сервер|бд|хранилищ)/);
    if (srvMatch) srvCount = Math.min(4, Math.max(1, parseInt(srvMatch[1], 10)));
    else if (lower.includes('сервер') || lower.includes('бд') || lower.includes('баз данных')) srvCount = 1;

    // Подсчет маршрутизаторов
    let routerCount = 1;
    const routerMatch = lower.match(/(\d+)\s*(?:маршрутизатор|роутер)/);
    if (routerMatch) routerCount = Math.min(3, Math.max(1, parseInt(routerMatch[1], 10)));

    // Подсчет коммутаторов
    let switchCount = 1;
    const swMatch = lower.match(/(\d+)\s*(?:коммутатор|свитч)/);
    if (swMatch) switchCount = Math.min(3, Math.max(1, parseInt(swMatch[1], 10)));

    // Очищаем текущее поле
    this.nodes = [];
    this.links = [];

    const rect = this.container.getBoundingClientRect();
    const w = rect.width > 200 ? rect.width : 900;
    const h = rect.height > 200 ? rect.height : 550;
    const centerX = w / 2 - 70;

    let currentY = 40;

    // Уровень 1: Интернет / WAN (если требуется)
    let cloudNode = null;
    if (wantInternet) {
      cloudNode = {
        id: 'node_cloud_1',
        type: 'cloud',
        name: 'Интернет (ISP WAN)',
        x: centerX,
        y: currentY,
        ip: '203.0.113.1',
        cidr: 30,
        gateway: '',
        status: 'online'
      };
      this.nodes.push(cloudNode);
      currentY += 100;
    }

    // Уровень 2: Фаервол / Межсетевой экран
    let fwNode = null;
    if (wantFirewall) {
      fwNode = {
        id: 'node_fw_1',
        type: 'firewall',
        name: 'Шлюз безопасности (FW)',
        x: centerX,
        y: currentY,
        ip: '10.0.0.1',
        cidr: 24,
        gateway: cloudNode ? cloudNode.ip : '',
        status: 'online'
      };
      this.nodes.push(fwNode);
      if (cloudNode) {
        this.links.push({
          id: 'link_c_fw',
          sourceId: cloudNode.id,
          targetId: fwNode.id,
          sourceIf: 'wan0',
          targetIf: 'eth0',
          status: 'up',
          latency: '2.5'
        });
      }
      currentY += 100;
    }

    // Уровень 3: Маршрутизатор
    let rNode = null;
    if (routerCount > 0) {
      rNode = {
        id: 'node_r_1',
        type: 'router',
        name: 'Главный маршрутизатор (R1)',
        x: centerX,
        y: currentY,
        ip: '192.168.1.1',
        cidr: 24,
        gateway: fwNode ? fwNode.ip : (cloudNode ? cloudNode.ip : ''),
        status: 'online'
      };
      this.nodes.push(rNode);

      const uplinkNode = fwNode || cloudNode;
      if (uplinkNode) {
        this.links.push({
          id: 'link_up_r',
          sourceId: uplinkNode.id,
          targetId: rNode.id,
          sourceIf: 'lan0',
          targetIf: 'gig0/0',
          status: 'up',
          latency: '1.1'
        });
      }
      currentY += 100;
    }

    // Уровень 4: Коммутаторы
    const switchNodes = [];
    const swSpacing = w / (switchCount + 1);
    for (let i = 0; i < switchCount; i++) {
      const sw = {
        id: `node_sw_${i + 1}`,
        type: 'switch',
        name: switchCount > 1 ? `Коммутатор SW-${i + 1}` : 'Коммутатор L2 (Core)',
        x: swSpacing * (i + 1) - 70,
        y: currentY,
        ip: `192.168.1.${2 + i}`,
        cidr: 24,
        gateway: rNode ? rNode.ip : '',
        status: 'online'
      };
      this.nodes.push(sw);
      switchNodes.push(sw);

      if (rNode) {
        this.links.push({
          id: `link_r_sw_${i}`,
          sourceId: rNode.id,
          targetId: sw.id,
          sourceIf: `gig0/${i + 1}`,
          targetIf: 'uplink',
          status: 'up',
          latency: '0.8'
        });
      }
    }
    currentY += 110;

    // Уровень 5: Серверы и ПК
    const endpoints = [];
    for (let s = 0; s < srvCount; s++) {
      endpoints.push({
        type: 'server',
        name: srvCount > 1 ? `Сервер SRV-${s + 1}` : 'Сервер данных (SRV)',
        ip: `192.168.1.${100 + s}`,
        cidr: 24,
        vlan: '10'
      });
    }
    for (let p = 0; p < pcCount; p++) {
      endpoints.push({
        type: 'pc',
        name: `Рабочая станция PC-${p + 1}`,
        ip: `192.168.1.${10 + p}`,
        cidr: 24,
        vlan: '20'
      });
    }

    const endSpacing = w / (endpoints.length + 1);
    endpoints.forEach((ep, idx) => {
      const epNode = {
        id: `node_ep_${idx + 1}`,
        type: ep.type,
        name: ep.name,
        x: endSpacing * (idx + 1) - 70,
        y: currentY,
        ip: ep.ip,
        cidr: ep.cidr,
        gateway: rNode ? rNode.ip : (fwNode ? fwNode.ip : '192.168.1.1'),
        vlan: ep.vlan,
        status: 'online'
      };
      this.nodes.push(epNode);

      // Подключаем к ближайшему коммутатору
      const parentSw = switchNodes[idx % switchNodes.length] || rNode;
      if (parentSw) {
        this.links.push({
          id: `link_ep_${idx}`,
          sourceId: parentSw.id,
          targetId: epNode.id,
          sourceIf: `Fa0/${idx + 1}`,
          targetIf: 'eth0',
          status: 'up',
          latency: '0.4'
        });
      }
    });

    this.selectedNodeId = this.nodes[0] ? this.nodes[0].id : null;
    this.render();
    this.logEvent('success', `[AI-ГЕНЕРАТОР] Построена топология из ${this.nodes.length} узлов и ${this.links.length} связей на основе вашего описания.`);
    this.showToast('Топология успешно построена по описанию!');
  }

  // ==========================================================================
  // ГОТОВЫЕ АРХИТЕКТУРНЫЕ ПРЕСЕТЫ
  // ==========================================================================
  loadDefaultTopology() {
    this.loadPreset('office_vlans');
  }

  loadPreset(presetKey) {
    this.nodes = [];
    this.links = [];

    const rect = this.container.getBoundingClientRect();
    const w = rect.width > 200 ? rect.width : 900;
    const h = rect.height > 200 ? rect.height : 550;
    const cx = w / 2 - 70;

    switch (presetKey) {
      case 'office_vlans': {
        // Офис с маршрутизатором, коммутатором и 2 VLAN
        this.nodes = [
          { id: 'n_inet', type: 'cloud', name: 'Интернет (WAN)', x: cx, y: 30, ip: '203.0.113.1', cidr: 30, gateway: '', status: 'online' },
          { id: 'n_r1', type: 'router', name: 'Шлюз (R1-Edge)', x: cx, y: 120, ip: '192.168.1.1', cidr: 24, gateway: '203.0.113.1', status: 'online' },
          { id: 'n_sw1', type: 'switch', name: 'Коммутатор L2 (Core-SW)', x: cx, y: 220, ip: '192.168.1.2', cidr: 24, gateway: '192.168.1.1', status: 'online' },
          { id: 'n_pc1', type: 'pc', name: 'Бухгалтерия ПК-1', x: cx - 260, y: 340, ip: '192.168.10.10', cidr: 24, gateway: '192.168.10.1', vlan: '10', status: 'online' },
          { id: 'n_pc2', type: 'pc', name: 'Бухгалтерия ПК-2', x: cx - 90, y: 340, ip: '192.168.10.11', cidr: 24, gateway: '192.168.10.1', vlan: '10', status: 'online' },
          { id: 'n_pc3', type: 'pc', name: 'IT-Отдел ПК-1', x: cx + 90, y: 340, ip: '192.168.20.10', cidr: 24, gateway: '192.168.20.1', vlan: '20', status: 'online' },
          { id: 'n_srv1', type: 'server', name: 'Сервер 1С / База данных', x: cx + 260, y: 340, ip: '192.168.1.100', cidr: 24, gateway: '192.168.1.1', vlan: '1', status: 'online' }
        ];

        this.links = [
          { id: 'l1', sourceId: 'n_inet', targetId: 'n_r1', sourceIf: 'isp0', targetIf: 'gig0/0', status: 'up', latency: '4.2' },
          { id: 'l2', sourceId: 'n_r1', targetId: 'n_sw1', sourceIf: 'gig0/1', targetIf: 'trunk1', status: 'up', latency: '0.6' },
          { id: 'l3', sourceId: 'n_sw1', targetId: 'n_pc1', sourceIf: 'Fa0/1', targetIf: 'eth0', status: 'up', latency: '0.4' },
          { id: 'l4', sourceId: 'n_sw1', targetId: 'n_pc2', sourceIf: 'Fa0/2', targetIf: 'eth0', status: 'up', latency: '0.4' },
          { id: 'l5', sourceId: 'n_sw1', targetId: 'n_pc3', sourceIf: 'Fa0/10', targetIf: 'eth0', status: 'up', latency: '0.5' },
          { id: 'l6', sourceId: 'n_sw1', targetId: 'n_srv1', sourceIf: 'Fa0/24', targetIf: 'eth0', status: 'up', latency: '0.3' }
        ];
        break;
      }

      case 'enterprise_dmz': {
        // Корпоративная сеть с демилитаризованной зоной (DMZ) и файрволом
        this.nodes = [
          { id: 'n_inet', type: 'cloud', name: 'Интернет', x: cx, y: 30, ip: '198.51.100.1', cidr: 28, gateway: '', status: 'online' },
          { id: 'n_fw', type: 'firewall', name: 'Межсетевой экран ASA', x: cx, y: 130, ip: '10.0.0.1', cidr: 24, gateway: '198.51.100.1', status: 'online' },
          // DMZ зона
          { id: 'n_dmz_sw', type: 'switch', name: 'DMZ Коммутатор', x: cx - 200, y: 230, ip: '172.16.1.1', cidr: 24, gateway: '10.0.0.1', status: 'online' },
          { id: 'n_web', type: 'server', name: 'Web-Сервер (Nginx)', x: cx - 290, y: 340, ip: '172.16.1.10', cidr: 24, gateway: '172.16.1.1', status: 'online' },
          { id: 'n_mail', type: 'server', name: 'Почтовый шлюз (Mail)', x: cx - 120, y: 340, ip: '172.16.1.20', cidr: 24, gateway: '172.16.1.1', status: 'online' },
          // Внутренний LAN
          { id: 'n_lan_sw', type: 'switch', name: 'LAN Коммутатор', x: cx + 200, y: 230, ip: '10.10.1.1', cidr: 24, gateway: '10.0.0.1', status: 'online' },
          { id: 'n_db', type: 'server', name: 'Сервер БД (PostgreSQL)', x: cx + 120, y: 340, ip: '10.10.1.5', cidr: 24, gateway: '10.10.1.1', status: 'online' },
          { id: 'n_lan_pc', type: 'pc', name: 'Рабочая станция инженера', x: cx + 290, y: 340, ip: '10.10.1.50', cidr: 24, gateway: '10.10.1.1', status: 'online' }
        ];

        this.links = [
          { id: 'l1', sourceId: 'n_inet', targetId: 'n_fw', sourceIf: 'outside', targetIf: 'eth0', status: 'up', latency: '3.5' },
          { id: 'l2', sourceId: 'n_fw', targetId: 'n_dmz_sw', sourceIf: 'dmz_if', targetIf: 'uplink', status: 'up', latency: '0.8' },
          { id: 'l3', sourceId: 'n_fw', targetId: 'n_lan_sw', sourceIf: 'inside_if', targetIf: 'uplink', status: 'up', latency: '0.6' },
          { id: 'l4', sourceId: 'n_dmz_sw', targetId: 'n_web', sourceIf: 'Fa0/1', targetIf: 'eth0', status: 'up', latency: '0.4' },
          { id: 'l5', sourceId: 'n_dmz_sw', targetId: 'n_mail', sourceIf: 'Fa0/2', targetIf: 'eth0', status: 'up', latency: '0.4' },
          { id: 'l6', sourceId: 'n_lan_sw', targetId: 'n_db', sourceIf: 'Fa0/10', targetIf: 'eth0', status: 'up', latency: '0.3' },
          { id: 'l7', sourceId: 'n_lan_sw', targetId: 'n_lan_pc', sourceIf: 'Fa0/20', targetIf: 'eth0', status: 'up', latency: '0.5' }
        ];
        break;
      }

      case 'spine_leaf': {
        // Дата-центр Spine-Leaf
        this.nodes = [
          { id: 'n_sp1', type: 'switch', name: 'Spine-1 (Core L3)', x: cx - 140, y: 40, ip: '10.255.0.1', cidr: 32, gateway: '', status: 'online' },
          { id: 'n_sp2', type: 'switch', name: 'Spine-2 (Core L3)', x: cx + 140, y: 40, ip: '10.255.0.2', cidr: 32, gateway: '', status: 'online' },
          { id: 'n_lf1', type: 'switch', name: 'Leaf-1 (ToR)', x: cx - 220, y: 170, ip: '10.255.1.1', cidr: 24, gateway: '', status: 'online' },
          { id: 'n_lf2', type: 'switch', name: 'Leaf-2 (ToR)', x: cx, y: 170, ip: '10.255.1.2', cidr: 24, gateway: '', status: 'online' },
          { id: 'n_lf3', type: 'switch', name: 'Leaf-3 (ToR)', x: cx + 220, y: 170, ip: '10.255.1.3', cidr: 24, gateway: '', status: 'online' },
          { id: 'n_srv1', type: 'server', name: 'Сервер Compute-1', x: cx - 220, y: 310, ip: '10.1.1.10', cidr: 24, gateway: '10.1.1.1', status: 'online' },
          { id: 'n_srv2', type: 'server', name: 'Сервер Compute-2', x: cx, y: 310, ip: '10.1.2.10', cidr: 24, gateway: '10.1.2.1', status: 'online' },
          { id: 'n_srv3', type: 'server', name: 'СХД SAN Storage', x: cx + 220, y: 310, ip: '10.1.3.10', cidr: 24, gateway: '10.1.3.1', status: 'online' }
        ];

        this.links = [
          // Full Mesh Spine <-> Leaf
          { id: 'l1', sourceId: 'n_sp1', targetId: 'n_lf1', sourceIf: 'QSFP1', targetIf: 'QSFP1', status: 'up', latency: '0.2' },
          { id: 'l2', sourceId: 'n_sp1', targetId: 'n_lf2', sourceIf: 'QSFP2', targetIf: 'QSFP1', status: 'up', latency: '0.2' },
          { id: 'l3', sourceId: 'n_sp1', targetId: 'n_lf3', sourceIf: 'QSFP3', targetIf: 'QSFP1', status: 'up', latency: '0.2' },
          { id: 'l4', sourceId: 'n_sp2', targetId: 'n_lf1', sourceIf: 'QSFP1', targetIf: 'QSFP2', status: 'up', latency: '0.2' },
          { id: 'l5', sourceId: 'n_sp2', targetId: 'n_lf2', sourceIf: 'QSFP2', targetIf: 'QSFP2', status: 'up', latency: '0.2' },
          { id: 'l6', sourceId: 'n_sp2', targetId: 'n_lf3', sourceIf: 'QSFP3', targetIf: 'QSFP2', status: 'up', latency: '0.2' },
          // Leaves to Servers
          { id: 'l7', sourceId: 'n_lf1', targetId: 'n_srv1', sourceIf: '10G_1', targetIf: 'eth0', status: 'up', latency: '0.1' },
          { id: 'l8', sourceId: 'n_lf2', targetId: 'n_srv2', sourceIf: '10G_1', targetIf: 'eth0', status: 'up', latency: '0.1' },
          { id: 'l9', sourceId: 'n_lf3', targetId: 'n_srv3', sourceIf: '10G_1', targetIf: 'eth0', status: 'up', latency: '0.1' }
        ];
        break;
      }

      case 'branch_wan': {
        // Главный офис и филиалы
        this.nodes = [
          { id: 'n_cloud', type: 'cloud', name: 'MPLS WAN / VPN Провайдер', x: cx, y: 150, ip: '10.254.0.1', cidr: 24, gateway: '', status: 'online' },
          { id: 'n_hq_r', type: 'router', name: 'Маршрутизатор HQ (Главный)', x: cx, y: 30, ip: '10.0.0.1', cidr: 24, gateway: '10.254.0.1', status: 'online' },
          { id: 'n_hq_pc', type: 'pc', name: 'HQ Рабочая станция', x: cx + 180, y: 30, ip: '10.0.0.10', cidr: 24, gateway: '10.0.0.1', status: 'online' },
          { id: 'n_b1_r', type: 'router', name: 'Филиал 1 (Router)', x: cx - 220, y: 280, ip: '10.1.0.1', cidr: 24, gateway: '10.254.0.1', status: 'online' },
          { id: 'n_b1_pc', type: 'pc', name: 'ПК Филиала 1', x: cx - 220, y: 390, ip: '10.1.0.10', cidr: 24, gateway: '10.1.0.1', status: 'online' },
          { id: 'n_b2_r', type: 'router', name: 'Филиал 2 (Router)', x: cx + 220, y: 280, ip: '10.2.0.1', cidr: 24, gateway: '10.254.0.1', status: 'online' },
          { id: 'n_b2_pc', type: 'pc', name: 'ПК Филиала 2', x: cx + 220, y: 390, ip: '10.2.0.10', cidr: 24, gateway: '10.2.0.1', status: 'online' }
        ];

        this.links = [
          { id: 'l1', sourceId: 'n_cloud', targetId: 'n_hq_r', sourceIf: 'port_hq', targetIf: 'wan0', status: 'up', latency: '4.8' },
          { id: 'l2', sourceId: 'n_hq_r', targetId: 'n_hq_pc', sourceIf: 'gig0/1', targetIf: 'eth0', status: 'up', latency: '0.4' },
          { id: 'l3', sourceId: 'n_cloud', targetId: 'n_b1_r', sourceIf: 'port_b1', targetIf: 'wan0', status: 'up', latency: '12.4' },
          { id: 'l4', sourceId: 'n_b1_r', targetId: 'n_b1_pc', sourceIf: 'gig0/1', targetIf: 'eth0', status: 'up', latency: '0.5' },
          { id: 'l5', sourceId: 'n_cloud', targetId: 'n_b2_r', sourceIf: 'port_b2', targetIf: 'wan0', status: 'up', latency: '15.2' },
          { id: 'l6', sourceId: 'n_b2_r', targetId: 'n_b2_pc', sourceIf: 'gig0/1', targetIf: 'eth0', status: 'up', latency: '0.5' }
        ];
        break;
      }

      case 'star_simple':
      default: {
        // Звезда: Центральный коммутатор/маршрутизатор и 4 ПК
        this.nodes = [
          { id: 'n_core', type: 'router', name: 'Шлюз сети (Star-Core)', x: cx, y: 150, ip: '192.168.1.1', cidr: 24, gateway: '', status: 'online' },
          { id: 'n_pc1', type: 'pc', name: 'Рабочая станция 1', x: cx - 220, y: 50, ip: '192.168.1.10', cidr: 24, gateway: '192.168.1.1', status: 'online' },
          { id: 'n_pc2', type: 'pc', name: 'Рабочая станция 2', x: cx + 220, y: 50, ip: '192.168.1.11', cidr: 24, gateway: '192.168.1.1', status: 'online' },
          { id: 'n_pc3', type: 'pc', name: 'Рабочая станция 3', x: cx - 220, y: 260, ip: '192.168.1.12', cidr: 24, gateway: '192.168.1.1', status: 'online' },
          { id: 'n_pc4', type: 'server', name: 'Файловый сервер', x: cx + 220, y: 260, ip: '192.168.1.100', cidr: 24, gateway: '192.168.1.1', status: 'online' }
        ];

        this.links = [
          { id: 'l1', sourceId: 'n_core', targetId: 'n_pc1', sourceIf: 'eth1', targetIf: 'eth0', status: 'up', latency: '0.4' },
          { id: 'l2', sourceId: 'n_core', targetId: 'n_pc2', sourceIf: 'eth2', targetIf: 'eth0', status: 'up', latency: '0.4' },
          { id: 'l3', sourceId: 'n_core', targetId: 'n_pc3', sourceIf: 'eth3', targetIf: 'eth0', status: 'up', latency: '0.5' },
          { id: 'l4', sourceId: 'n_core', targetId: 'n_pc4', sourceIf: 'eth4', targetIf: 'eth0', status: 'up', latency: '0.2' }
        ];
        break;
      }
    }

    this.selectedNodeId = this.nodes[0] ? this.nodes[0].id : null;
    this.render();
    this.logEvent('info', `Загружен шаблон: [${presetKey}] (${this.nodes.length} узлов, ${this.links.length} линков).`);
    this.showToast('Архитектурный шаблон загружен');
  }
}
