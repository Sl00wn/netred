// ============================================================================
// NETRED APP // MAIN CONTROLLER
// Справочник сетевого инженера
// ============================================================================

import { OSI_LAYERS, GLOSSARY_TERMS, COMMON_PORTS, PROTOCOL_SIMULATIONS } from './data.js';
import { CyberCanvas } from './cyber-canvas.js';
import { cyberAudio } from './audio.js';
import { SubnetCalculator } from './subnet-calc.js';
import { NetworkTopologySimulator } from './topo-builder.js';

export class CyberNetApp {
  constructor() {
    this.canvas = null;
    this.currentTab = 'lexicon';
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.selectedLayer = 'all';
    this.onlyFavorites = false;
    this.favorites = this.loadFavorites();
    this.currentSimulation = 'tcp';
    this.simStep = 0;
    this.topoSimulator = null;

    this.init();
  }

  getCategoryRu(category) {
    const map = {
      "Switching": "Коммутация (L2)",
      "Switching / Datacenter": "Коммутация (ЦОД)",
      "Switching / Fundamentals": "Базовая коммутация",
      "Switching / Performance": "Производительность L2",
      "Switching / Diagnostics": "Диагностика L2",
      "Routing": "Маршрутизация (L3)",
      "Routing / Service Provider": "Маршрутизация (Провайдеры)",
      "Routing / Addressing": "Адресация и подсети",
      "Routing / Security": "Безопасность маршрутизации",
      "Routing / Diagnostics": "Диагностика L3",
      "Routing / Resilience": "Отказоустойчивость L3",
      "Transport": "Транспортный уровень (L4)",
      "Transport / Modern": "Современный транспорт",
      "Security & VPN": "Безопасность и VPN",
      "SDN & Telemetry": "SDN и телеметрия",
      "Application & L7": "Прикладной уровень (L7)",
      "Diagnostics": "Диагностика",
      "Diagnostics / QoS": "Диагностика и QoS"
    };
    return map[category] || category;
  }

  loadFavorites() {
    try {
      const stored = localStorage.getItem('netred_favorites') || localStorage.getItem('netpulse_favorites') || localStorage.getItem('cybernet_favorites');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  saveFavorites() {
    try {
      localStorage.setItem('netred_favorites', JSON.stringify(this.favorites));
    } catch (e) {}
  }

  isFavorite(id) {
    return this.favorites.includes(id);
  }

  toggleFavorite(id) {
    if (this.isFavorite(id)) {
      this.favorites = this.favorites.filter(item => item !== id);
    } else {
      this.favorites.push(id);
      cyberAudio.playSuccess();
    }
    this.saveFavorites();
    this.renderGlossary();
    this.updateFavoritesCount();
  }

  init() {
    // Фоновый холст топологии (Data Strings Engine)
    const canvasEl = document.getElementById('bg-canvas');
    if (canvasEl) {
      this.canvas = new CyberCanvas(canvasEl);
    }

    // Переключатель звука с минималистичной векторной SVG-иконкой
    const audioBtn = document.getElementById('audio-toggle-btn');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const isMuted = cyberAudio.toggleMute();
        audioBtn.classList.toggle('active', !isMuted);
        const iconWrap = audioBtn.querySelector('#audio-icon-container') || audioBtn;
        if (isMuted) {
          iconWrap.innerHTML = `
            <svg class="btn-icon-svg" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          `;
        } else {
          iconWrap.innerHTML = `
            <svg class="btn-icon-svg" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          `;
        }
        this.showToast(!isMuted ? "Звуковые эффекты включены" : "Звуковые эффекты отключены");
      });
    }

    // Кнопка импульса сети
    const pingBtn = document.getElementById('canvas-ping-btn');
    if (pingBtn) {
      pingBtn.addEventListener('click', () => {
        cyberAudio.playPing();
        if (this.canvas) {
          this.canvas.createPingRipple(window.innerWidth / 2, window.innerHeight / 2);
          this.canvas.burstPacketsAt(window.innerWidth / 2, window.innerHeight / 2);
        }
        this.showToast("Резонансный импульс отправлен по струнам сети");
      });
    }

    // Переключатель скорости анимации фоновых струн
    const speedBtn = document.getElementById('canvas-speed-btn');
    const speedLabel = document.getElementById('speed-indicator-label');
    const speeds = [1.0, 1.8, 0.4];
    const speedNames = ['1x', '2x', '0.5x'];
    let speedIdx = 0;
    if (speedBtn) {
      speedBtn.addEventListener('click', () => {
        speedIdx = (speedIdx + 1) % speeds.length;
        if (this.canvas) {
          this.canvas.setSpeed(speeds[speedIdx]);
        }
        if (speedLabel) speedLabel.textContent = speedNames[speedIdx];
        this.showToast(`Скорость фоновых струн: ${speedNames[speedIdx]}`);
        cyberAudio.playClick();
      });
    }

    // Модальное окно горячих клавиш
    const hotkeysBtn = document.getElementById('hotkeys-btn');
    const hotkeysModal = document.getElementById('hotkeys-modal');
    const hotkeysCloseBtn = document.getElementById('hotkeys-close-btn');
    if (hotkeysBtn && hotkeysModal) {
      hotkeysBtn.addEventListener('click', () => {
        hotkeysModal.classList.add('open');
        cyberAudio.playClick();
      });
    }
    if (hotkeysCloseBtn && hotkeysModal) {
      hotkeysCloseBtn.addEventListener('click', () => {
        hotkeysModal.classList.remove('open');
      });
    }
    if (hotkeysModal) {
      hotkeysModal.addEventListener('click', (e) => {
        if (e.target === hotkeysModal) hotkeysModal.classList.remove('open');
      });
    }

    // Управление боковой панелью (сворачивание на десктопе и переключение на мобильных)
    const sidebar = document.getElementById('app-sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle-btn');
    const sidebarCollapse = document.getElementById('sidebar-collapse-btn');
    const backdrop = document.getElementById('sidebar-backdrop');

    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        if (backdrop) backdrop.classList.toggle('active', sidebar.classList.contains('open'));
        cyberAudio.playClick();
      });
    }

    if (backdrop && sidebar) {
      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('active');
        cyberAudio.playClick();
      });
    }

    if (sidebarCollapse && sidebar) {
      sidebarCollapse.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        const isCol = sidebar.classList.contains('collapsed');
        const icon = sidebarCollapse.querySelector('.collapse-icon-svg');
        const text = sidebarCollapse.querySelector('.collapse-text');
        if (icon) icon.style.transform = isCol ? 'rotate(180deg)' : 'rotate(0deg)';
        if (text) text.textContent = isCol ? '' : 'Свернуть';
        cyberAudio.playClick();
      });
    }

    // Быстрые карточки боковой панели
    const qPing = document.getElementById('quick-ping-card');
    if (qPing) {
      qPing.addEventListener('click', () => {
        if (pingBtn) pingBtn.click();
      });
    }

    const qFav = document.getElementById('quick-fav-card');
    if (qFav) {
      qFav.addEventListener('click', () => {
        if (this.currentTab !== 'lexicon') this.switchTab('lexicon');
        const favBtn = document.getElementById('favorites-filter-btn');
        if (favBtn) favBtn.click();
      });
    }

    const qAi = document.getElementById('quick-ai-card');
    if (qAi) {
      qAi.addEventListener('click', () => {
        if (this.currentTab !== 'topo') this.switchTab('topo');
        const aiModal = document.getElementById('topo-ai-modal');
        if (aiModal) aiModal.classList.add('open');
        cyberAudio.playClick();
      });
    }

    const qHk = document.getElementById('quick-hotkeys-card');
    if (qHk) {
      qHk.addEventListener('click', () => {
        if (hotkeysBtn) hotkeysBtn.click();
      });
    }

    // Глобальный быстрый поиск в шапке (работает из любой вкладки)
    const globalSearch = document.getElementById('global-header-search');
    const glossarySearch = document.getElementById('glossary-search');
    if (globalSearch) {
      globalSearch.addEventListener('input', (e) => {
        const val = e.target.value;
        this.searchQuery = val.toLowerCase();
        if (glossarySearch && glossarySearch.value !== val) {
          glossarySearch.value = val;
        }
        if (this.currentTab !== 'lexicon') {
          this.switchTab('lexicon');
        }
        this.renderGlossary();
      });
    }

    // Навигация по вкладкам (десктопная боковая панель)
    document.querySelectorAll('.nav-item, .cyber-nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetTab = e.currentTarget.getAttribute('data-tab');
        this.switchTab(targetTab);
        cyberAudio.playClick();
      });
    });

    // Навигация по вкладкам (мобильная нижняя панель)
    document.querySelectorAll('.mob-nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetTab = e.currentTarget.getAttribute('data-tab');
        this.switchTab(targetTab);
        cyberAudio.playClick();
      });
    });

    // Настройка поиска и фильтров
    this.setupFilters();

    // Настройка калькулятора подсетей
    this.setupSubnetCalc();

    // Настройка стека OSI
    this.renderOSIStack();

    // Настройка справочника портов
    this.renderPorts();

    // Настройка симулятора протоколов
    this.setupSimulator();

    // Настройка конструктора и симулятора топологии сети
    this.topoSimulator = new NetworkTopologySimulator(
      'topo-canvas-container',
      'topo-svg-links',
      'topo-nodes-layer',
      this
    );

    // Начальная отрисовка словаря
    this.renderGlossary();
    this.updateFavoritesCount();

    // Глобальные горячие клавиши (1-6 вкладки, Space импульс, ⌘K поиск, M звук, ? справка)
    window.addEventListener('keydown', (e) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);

      if ((e.key === '/' || (e.ctrlKey && e.key === 'k') || (e.metaKey && e.key === 'k')) && !isInput) {
        e.preventDefault();
        const targetInput = globalSearch || glossarySearch;
        if (targetInput) {
          targetInput.focus();
          targetInput.select();
        }
      } else if (e.key === 'Escape') {
        this.closeModal();
        const aiModal = document.getElementById('topo-ai-modal');
        if (aiModal) aiModal.classList.remove('open');
        if (hotkeysModal) hotkeysModal.classList.remove('open');
      } else if (!isInput) {
        // Переключение вкладок цифрами 1-6
        const tabKeys = { '1': 'lexicon', '2': 'osi', '3': 'calc', '4': 'sim', '5': 'ports', '6': 'topo' };
        if (tabKeys[e.key]) {
          this.switchTab(tabKeys[e.key]);
          cyberAudio.playClick();
        } else if (e.key === ' ') {
          e.preventDefault();
          cyberAudio.playPing();
          if (this.canvas) {
            this.canvas.createPingRipple(window.innerWidth / 2, window.innerHeight / 2);
            this.canvas.burstPacketsAt(window.innerWidth / 2, window.innerHeight / 2);
          }
          this.showToast("Импульс отправлен по струнам сети");
        } else if (e.key === 'm' || e.key === 'M' || e.key === 'ь' || e.key === 'Ь') {
          if (audioBtn) {
            audioBtn.click();
          }
        } else if (e.key === '?' || (e.shiftKey && e.key === '?')) {
          if (hotkeysModal) hotkeysModal.classList.toggle('open');
        }
      }
    });

    // Запуск фоновой симуляции телеметрии и sparkline-волны
    this.startTelemetry();
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    // Закрытие мобильного меню при выборе вкладки
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('active');
    }

    // Синхронизация десктопного меню
    document.querySelectorAll('.nav-item, .cyber-nav-tab').forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-tab') === tabId);
    });

    // Синхронизация мобильного нижнего меню
    document.querySelectorAll('.mob-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    document.querySelectorAll('.tab-view').forEach(view => {
      view.classList.toggle('active', view.id === `view-${tabId}`);
    });

    // Обновление хлебных крошек в шапке
    const tabBreadcrumbs = {
      lexicon: 'Словарь понятий & RFC',
      osi: '7-уровневый стек OSI',
      calc: 'Калькулятор подсетей IPv4 / IPv6',
      sim: 'Симулятор пакетов и протоколов',
      ports: 'Справочник сетевых портов TCP/UDP',
      topo: 'Интерактивный конструктор сети'
    };
    const bc = document.getElementById('header-breadcrumb');
    if (bc && tabBreadcrumbs[tabId]) {
      bc.innerHTML = `Сетевой хаб // <span class="crumb-active">${tabBreadcrumbs[tabId]}</span>`;
    }

    if (tabId === 'topo' && this.topoSimulator) {
      setTimeout(() => this.topoSimulator.updateLinks(), 60);
    }
  }

  setupFilters() {
    const searchInput = document.getElementById('glossary-search');
    const globalSearch = document.getElementById('global-header-search');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        if (globalSearch && globalSearch.value !== e.target.value) {
          globalSearch.value = e.target.value;
        }
        this.renderGlossary();
      });
    }

    const clearSearch = document.getElementById('clear-search-btn');
    if (clearSearch) {
      clearSearch.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          this.searchQuery = '';
          if (globalSearch) globalSearch.value = '';
          this.renderGlossary();
          searchInput.focus();
        }
      });
    }

    // Фильтры по категориям
    document.querySelectorAll('.filter-pill, .category-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-pill, .category-pill').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.selectedCategory = e.currentTarget.getAttribute('data-category');
        cyberAudio.playClick();
        this.renderGlossary();
      });
    });

    // Фильтры по уровням OSI
    document.querySelectorAll('.layer-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        document.querySelectorAll('.layer-pill').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.selectedLayer = e.currentTarget.getAttribute('data-layer');
        cyberAudio.playClick();
        this.renderGlossary();
      });
    });

    // Переключатель избранного
    const favToggle = document.getElementById('favorites-filter-btn');
    if (favToggle) {
      favToggle.addEventListener('click', () => {
        this.onlyFavorites = !this.onlyFavorites;
        favToggle.classList.toggle('active', this.onlyFavorites);
        cyberAudio.playClick();
        this.renderGlossary();
      });
    }
  }

  renderGlossary() {
    const container = document.getElementById('glossary-grid');
    const countEl = document.getElementById('glossary-results-count');
    if (!container) return;

    const filtered = GLOSSARY_TERMS.filter(term => {
      // Поиск по термину, русскому и английскому названиям, описанию, категории и RFC
      const matchesSearch = !this.searchQuery || 
        term.term.toLowerCase().includes(this.searchQuery) ||
        term.fullName.toLowerCase().includes(this.searchQuery) ||
        term.fullNameRu.toLowerCase().includes(this.searchQuery) ||
        term.summary.toLowerCase().includes(this.searchQuery) ||
        term.category.toLowerCase().includes(this.searchQuery) ||
        this.getCategoryRu(term.category).toLowerCase().includes(this.searchQuery) ||
        (term.rfc && term.rfc.toLowerCase().includes(this.searchQuery));

      // Фильтр по категории
      const matchesCategory = this.selectedCategory === 'all' || 
        term.category.toLowerCase().includes(this.selectedCategory.toLowerCase());

      // Фильтр по уровню OSI
      const matchesLayer = this.selectedLayer === 'all' || 
        term.layer.toString() === this.selectedLayer;

      // Фильтр по избранному
      const matchesFav = !this.onlyFavorites || this.isFavorite(term.id);

      return matchesSearch && matchesCategory && matchesLayer && matchesFav;
    });

    if (countEl) {
      countEl.textContent = `Найдено понятий: ${filtered.length} из ${GLOSSARY_TERMS.length}`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <div class="empty-title">Ничего не найдено</div>
          <div class="empty-desc">Попробуйте изменить поисковый запрос или сбросить активные фильтры.</div>
          <button class="accent-btn" id="reset-filters-btn">Сбросить все фильтры</button>
        </div>
      `;
      const resetBtn = document.getElementById('reset-filters-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.searchQuery = '';
          this.selectedCategory = 'all';
          this.selectedLayer = 'all';
          this.onlyFavorites = false;
          const searchInput = document.getElementById('glossary-search');
          if (searchInput) searchInput.value = '';
          document.querySelectorAll('.filter-pill, .category-pill').forEach(p => p.classList.toggle('active', p.getAttribute('data-category') === 'all'));
          document.querySelectorAll('.layer-pill').forEach(p => p.classList.toggle('active', p.getAttribute('data-layer') === 'all'));
          const favToggle = document.getElementById('favorites-filter-btn');
          if (favToggle) favToggle.classList.remove('active');
          this.renderGlossary();
        });
      }
      return;
    }

    container.innerHTML = filtered.map(term => {
      const isFav = this.isFavorite(term.id);
      const layerObj = OSI_LAYERS.find(l => l.layer === term.layer);
      const layerColor = layerObj ? layerObj.color : '#6366f1';

      return `
        <div class="modern-card term-card" data-id="${term.id}">
          <div class="card-header">
            <div class="card-badges">
              <span class="badge layer-badge" style="border-color: ${layerColor}33; color: ${layerColor}; background: ${layerColor}14;">
                L${term.layer} · ${layerObj ? layerObj.nameRu : ''}
              </span>
              <span class="badge category-badge">${this.getCategoryRu(term.category)}</span>
            </div>
            <div class="card-actions-group">
              <span class="card-tech-id">ID: 0x${term.id.slice(0, 3).toUpperCase()}</span>
              <button class="favorite-btn ${isFav ? 'is-fav' : ''}" data-id="${term.id}" title="${isFav ? 'Удалить из избранного' : 'Добавить в избранное'}">
                <svg class="fav-star-svg" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="${isFav ? 'currentColor' : 'none'}" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="card-title-group">
            <h3 class="term-title">${term.term}</h3>
            <div class="term-fullname">${term.fullNameRu}</div>
            <div class="term-fullname-ru">${term.fullName}</div>
          </div>

          <p class="term-summary">${term.summary}</p>

          <div class="card-footer">
            <span class="rfc-tag">${term.rfc || 'Стандарт'}</span>
            <button class="minimal-btn open-detail-btn" data-id="${term.id}">
              <span>CLI и подробнее</span>
              <span class="btn-arrow">→</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Слушатели событий клика на карточку
    container.querySelectorAll('.open-detail-btn, .term-title').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = e.currentTarget.closest('.term-card').getAttribute('data-id');
        this.openDetailModal(id);
      });
    });

    container.querySelectorAll('.favorite-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute('data-id');
        this.toggleFavorite(id);
      });
    });
  }

  updateFavoritesCount() {
    const badge = document.getElementById('favorites-count-badge');
    if (badge) {
      badge.textContent = this.favorites.length;
    }
  }

  openDetailModal(termId) {
    const term = GLOSSARY_TERMS.find(t => t.id === termId);
    if (!term) return;

    cyberAudio.playModalOpen();

    const modal = document.getElementById('detail-modal');
    const content = document.getElementById('modal-body');
    const layerObj = OSI_LAYERS.find(l => l.layer === term.layer);
    const layerColor = layerObj ? layerObj.color : '#6366f1';
    const isFav = this.isFavorite(term.id);

    content.innerHTML = `
      <div class="modal-header-section">
        <div class="modal-tags">
          <span class="badge" style="border-color: ${layerColor}40; color: ${layerColor}; background: ${layerColor}14;">
            Уровень OSI: L${term.layer} (${layerObj ? layerObj.nameRu : ''})
          </span>
          <span class="badge category-badge">${this.getCategoryRu(term.category)}</span>
          <span class="badge rfc-badge">${term.rfc || 'Стандарт IEEE / IETF'}</span>
        </div>

        <div class="modal-title-row">
          <div>
            <h1 class="modal-main-title">${term.term}</h1>
            <div class="modal-subtitle">${term.fullNameRu} — <span class="dim-text">${term.fullName}</span></div>
          </div>
          <button class="minimal-btn modal-fav-btn ${isFav ? 'is-fav' : ''}" data-id="${term.id}">
            <svg class="star-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="${isFav ? 'currentColor' : 'none'}" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:4px;">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span>${isFav ? 'В избранном' : 'В избранное'}</span>
          </button>
        </div>
      </div>

      <div class="modal-body-grid">
        <div class="detail-block">
          <div class="block-title">
            <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>Архитектура и принцип работы</span>
          </div>
          <div class="block-content rich-text">
            ${this.formatMarkdown(term.details)}
          </div>
        </div>

        <div class="detail-block">
          <div class="block-title">
            <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="4 17 10 11 4 5"></polyline>
              <line x1="12" y1="19" x2="20" y2="19"></line>
            </svg>
            <span>Конфигурация и шаблоны команд</span>
          </div>
          <div class="cli-container">
            ${term.commands && term.commands.length > 0 ? term.commands.map((cmd) => `
              <div class="cli-box">
                <div class="cli-box-header">
                  <span class="cli-os-tag">${cmd.os}</span>
                  <button class="copy-cli-btn" data-cli="${encodeURIComponent(cmd.cmd)}">
                    <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>Скопировать</span>
                  </button>
                </div>
                <pre class="cli-code"><code>${this.escapeHtml(cmd.cmd)}</code></pre>
              </div>
            `).join('') : '<div class="no-data">CLI-команды для данного понятия не требуются.</div>'}
          </div>
        </div>

        <div class="detail-block alert-block">
          <div class="block-title alert-title">
            <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>Диагностика и устранение неисправностей (Troubleshooting)</span>
          </div>
          <div class="block-content troubleshooting-content">
            ${term.troubleshooting}
          </div>
        </div>
      </div>
    `;

    // Слушатели копирования в буфер
    content.querySelectorAll('.copy-cli-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const text = decodeURIComponent(e.currentTarget.getAttribute('data-cli'));
        navigator.clipboard.writeText(text).then(() => {
          cyberAudio.playSuccess();
          this.showToast("Команда скопирована в буфер обмена");
          const span = e.currentTarget.querySelector('span');
          if (span) span.textContent = "Скопировано";
          setTimeout(() => {
            if (span) span.textContent = "Скопировать";
          }, 2000);
        });
      });
    });

    // Слушатель избранного в модальном окне
    const modalFavBtn = content.querySelector('.modal-fav-btn');
    if (modalFavBtn) {
      modalFavBtn.addEventListener('click', () => {
        this.toggleFavorite(term.id);
        const nowFav = this.isFavorite(term.id);
        modalFavBtn.classList.toggle('is-fav', nowFav);
        modalFavBtn.innerHTML = `
          <svg class="star-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="${nowFav ? 'currentColor' : 'none'}" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:4px;">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <span>${nowFav ? 'В избранном' : 'В избранное'}</span>
        `;
      });
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Кнопка закрытия
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => this.closeModal();
    }
  }

  closeModal() {
    const modal = document.getElementById('detail-modal');
    if (modal && modal.classList.contains('open')) {
      cyberAudio.playClick();
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  setupSubnetCalc() {
    const ipInput = document.getElementById('calc-ip');
    const maskSelect = document.getElementById('calc-mask');
    const calcBtn = document.getElementById('run-calc-btn');

    // Заполнение выпадающего списка масок от /0 до /32
    if (maskSelect) {
      maskSelect.innerHTML = '';
      for (let i = 32; i >= 0; i--) {
        const maskInt = SubnetCalculator.getMaskFromCIDR(i);
        const maskIp = SubnetCalculator.intToIPv4(maskInt);
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `/${i} — ${maskIp}`;
        if (i === 24) opt.selected = true;
        maskSelect.appendChild(opt);
      }
    }

    const doCalculate = () => {
      const ip = ipInput ? ipInput.value : '192.168.1.100';
      const mask = maskSelect ? maskSelect.value : 24;
      const res = SubnetCalculator.calculate(ip, mask);

      const resBox = document.getElementById('calc-results');
      if (!resBox) return;

      if (res.error) {
        resBox.innerHTML = `
          <div class="calc-error">
            <span class="err-icon">⚠️</span>
            <span>${res.error}</span>
          </div>
        `;
        return;
      }

      cyberAudio.playSelect();

      resBox.innerHTML = `
        <div class="calc-grid">
          <div class="calc-metric-card highlight">
            <div class="m-label">Адрес сети (Network ID)</div>
            <div class="m-value accent-cyan">${res.network}/${res.cidr}</div>
          </div>
          <div class="calc-metric-card">
            <div class="m-label">Широковещательный (Broadcast)</div>
            <div class="m-value accent-amber">${res.broadcast}</div>
          </div>
          <div class="calc-metric-card highlight">
            <div class="m-label">Диапазон рабочих хостов</div>
            <div class="m-value">${res.usableRange}</div>
          </div>
          <div class="calc-metric-card">
            <div class="m-label">Доступно хостов</div>
            <div class="m-value accent-emerald">${res.usableHosts} <span class="m-sub">из ${res.totalHosts}</span></div>
          </div>
          <div class="calc-metric-card">
            <div class="m-label">Маска подсети (Netmask)</div>
            <div class="m-value">${res.netmask}</div>
          </div>
          <div class="calc-metric-card">
            <div class="m-label">Инверсная маска (Wildcard)</div>
            <div class="m-value">${res.wildcard}</div>
          </div>
          <div class="calc-metric-card">
            <div class="m-label">Категория адреса (Scope)</div>
            <div class="m-value" style="color: ${res.scopeColor}">${res.scope}</div>
          </div>
          <div class="calc-metric-card">
            <div class="m-label">HEX-представление</div>
            <div class="m-value font-mono">${res.hexIp}</div>
          </div>
        </div>

        <div class="binary-breakdown">
          <div class="section-mini-title">Побитовая структура (IP и маска)</div>
          <div class="bit-row">
            <span class="bit-tag">Биты IP:</span>
            <code class="bit-code">${this.renderColoredBits(res.binaryIp, res.cidr)}</code>
          </div>
          <div class="bit-row">
            <span class="bit-tag">Биты маски:</span>
            <code class="bit-code">${this.renderColoredBits(res.binaryMask, res.cidr)}</code>
          </div>
          <div class="bit-legend">
            <span class="legend-item"><span class="dot net-dot"></span> Биты сети (${res.cidr})</span>
            <span class="legend-item"><span class="dot host-dot"></span> Биты узлов (${32 - res.cidr})</span>
          </div>
        </div>

        ${res.subnets.length > 0 ? `
          <div class="subdivision-box">
            <div class="section-mini-title">Разбиение на следующие подсети (/+1)</div>
            <div class="subnets-list">
              ${res.subnets.map(s => `<span class="subnet-tag">${s}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      `;
    };

    if (calcBtn) {
      calcBtn.addEventListener('click', doCalculate);
    }

    if (ipInput) {
      ipInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doCalculate();
      });
    }

    if (maskSelect) {
      maskSelect.addEventListener('change', doCalculate);
    }

    // Быстрые пресеты
    document.querySelectorAll('.preset-chip, .preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cidr = e.currentTarget.getAttribute('data-cidr');
        if (maskSelect) {
          maskSelect.value = cidr;
          doCalculate();
        }
      });
    });

    // Первый расчет при загрузке
    doCalculate();
  }

  renderColoredBits(binaryString, cidr) {
    let cleanBits = binaryString.replace(/\./g, '');

    let formatted = '';
    for (let i = 0; i < 32; i++) {
      if (i > 0 && i % 8 === 0) formatted += '<span class="bit-sep">.</span>';
      if (i < cidr) {
        formatted += `<span class="bit-net">${cleanBits[i]}</span>`;
      } else {
        formatted += `<span class="bit-host">${cleanBits[i]}</span>`;
      }
    }
    return formatted;
  }

  renderOSIStack() {
    const container = document.getElementById('osi-stack-container');
    if (!container) return;

    container.innerHTML = OSI_LAYERS.map(layer => {
      return `
        <div class="osi-layer-card" style="--layer-color: ${layer.color}" data-layer="${layer.layer}">
          <div class="osi-left">
            <div class="osi-num">L${layer.layer}</div>
            <div class="osi-names">
              <div class="osi-title">${layer.nameRu} <span class="osi-ru">(${layer.name})</span></div>
              <div class="osi-pdu">PDU: <strong>${layer.pdu}</strong> · Оборудование: ${layer.devices}</div>
            </div>
          </div>
          <div class="osi-protocols">
            ${layer.protocols.map(proto => `<span class="proto-badge">${proto}</span>`).join('')}
          </div>
          <div class="osi-action">
            <button class="minimal-btn filter-by-layer-btn" data-layer="${layer.layer}">
              <span>Показать в словаре</span>
              <span class="btn-arrow">→</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.filter-by-layer-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const layer = e.currentTarget.getAttribute('data-layer');
        this.selectedLayer = layer;
        this.switchTab('lexicon');
        // Обновить активный фильтр уровней
        document.querySelectorAll('.layer-pill').forEach(p => {
          p.classList.toggle('active', p.getAttribute('data-layer') === layer);
        });
        this.renderGlossary();
        cyberAudio.playSelect();
      });
    });
  }

  renderPorts() {
    const tableBody = document.getElementById('ports-table-body');
    const portSearch = document.getElementById('port-search-input');
    if (!tableBody) return;

    const render = (query = '') => {
      const q = query.toLowerCase();
      const filtered = COMMON_PORTS.filter(p => 
        p.port.toString().includes(q) ||
        p.service.toLowerCase().includes(q) ||
        p.proto.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );

      tableBody.innerHTML = filtered.map(p => `
        <tr class="port-row">
          <td class="port-cell-num"><span class="port-badge">${p.port}</span></td>
          <td class="port-cell-proto"><span class="proto-tag">${p.proto}</span></td>
          <td class="port-cell-service"><strong>${p.service}</strong></td>
          <td class="port-cell-desc">${p.description}</td>
        </tr>
      `).join('');
    };

    if (portSearch) {
      portSearch.addEventListener('input', (e) => {
        render(e.target.value);
      });
    }

    render();
  }

  setupSimulator() {
    const simSelector = document.getElementById('sim-select');
    const stepBtn = document.getElementById('sim-step-btn');
    const resetBtn = document.getElementById('sim-reset-btn');

    const updateSimUI = () => {
      const sim = PROTOCOL_SIMULATIONS[this.currentSimulation];
      if (!sim) return;

      const titleEl = document.getElementById('sim-title');
      const descEl = document.getElementById('sim-desc');
      const displayEl = document.getElementById('sim-visual-display');
      const logEl = document.getElementById('sim-log-list');

      if (titleEl) titleEl.textContent = sim.title;
      if (descEl) descEl.textContent = sim.description;

      const currentStep = sim.steps[this.simStep] || sim.steps[sim.steps.length - 1];
      const isFinished = this.simStep >= sim.steps.length - 1;

      if (displayEl) {
        displayEl.innerHTML = `
          <div class="sim-node client-node">
            <div class="sim-node-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <div class="sim-node-name">${currentStep.sender.split(' ')[0]}</div>
            <div class="sim-node-state">${currentStep.stateClient}</div>
          </div>

          <div class="sim-flight-channel">
            <div class="packet-arrow ${this.simStep % 2 === 0 ? 'to-right' : 'to-left'}">
              <div class="sim-packet-pill">
                <span class="sim-flag">${currentStep.packet}</span>
                <span class="sim-seq">${currentStep.seq}</span>
              </div>
            </div>
          </div>

          <div class="sim-node server-node">
            <div class="sim-node-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="8" rx="2"></rect>
                <rect x="2" y="14" width="20" height="8" rx="2"></rect>
                <line x1="6" y1="6" x2="6.01" y2="6"></line>
                <line x1="6" y1="18" x2="6.01" y2="18"></line>
              </svg>
            </div>
            <div class="sim-node-name">${currentStep.receiver.split(' ')[0]}</div>
            <div class="sim-node-state">${currentStep.stateServer}</div>
          </div>
        `;
      }

      if (logEl) {
        logEl.innerHTML = sim.steps.slice(0, this.simStep + 1).map((s, idx) => `
          <div class="sim-log-item ${idx === this.simStep ? 'current' : ''}">
            <div class="log-step-tag">Шаг ${s.step}</div>
            <div class="log-header">
              <span class="log-packet">${s.packet}</span>
              <span class="log-flow">${s.sender} → ${s.receiver}</span>
            </div>
            <div class="log-detail">${s.detail}</div>
            <div class="log-meta">SEQ: ${s.seq} · ACK: ${s.ack} · Флаги: [${s.flags}]</div>
          </div>
        `).join('');
      }

      if (stepBtn) {
        stepBtn.textContent = isFinished ? "Симуляция завершена (сброс)" : `Следующий шаг (${this.simStep + 1}/${sim.steps.length})`;
        stepBtn.disabled = isFinished;
      }
    };

    if (simSelector) {
      simSelector.addEventListener('change', (e) => {
        this.currentSimulation = e.target.value;
        this.simStep = 0;
        updateSimUI();
        cyberAudio.playSelect();
      });
    }

    if (stepBtn) {
      stepBtn.addEventListener('click', () => {
        const sim = PROTOCOL_SIMULATIONS[this.currentSimulation];
        if (this.simStep < sim.steps.length - 1) {
          this.simStep++;
          cyberAudio.playPing();
          updateSimUI();
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.simStep = 0;
        cyberAudio.playClick();
        updateSimUI();
      });
    }

    updateSimUI();
  }

  startTelemetry() {
    const latencyEl = document.getElementById('stat-latency');
    const ppsEl = document.getElementById('stat-pps');
    const sparkGlow = document.querySelector('#stat-sparkline .sparkline-path-glow');
    const sparkCore = document.querySelector('#stat-sparkline .sparkline-path-core');

    let sparkPhase = 0;
    // Анимация мини-волны Data Strings в шапке (каждые 80мс)
    setInterval(() => {
      sparkPhase += 0.35;
      const y1 = (10 + Math.sin(sparkPhase) * 6.5).toFixed(1);
      const y2 = (10 - Math.cos(sparkPhase * 1.25) * 5.8).toFixed(1);
      const d = `M0 10 Q16 ${y1}, 32 10 T64 ${y2}`;
      if (sparkGlow) sparkGlow.setAttribute('d', d);
      if (sparkCore) sparkCore.setAttribute('d', d);
    }, 80);

    // Обновление численной телеметрии (каждые 2.6с)
    setInterval(() => {
      if (latencyEl) {
        const lat = (Math.random() * 2.6 + 7.1).toFixed(1);
        latencyEl.textContent = `${lat} ms`;
      }
      if (ppsEl) {
        const pps = (Math.random() * 0.9 + 13.5).toFixed(1);
        ppsEl.textContent = `${pps}k пак/с`;
      }
    }, 2600);
  }

  showToast(message) {
    let toast = document.getElementById('cyber-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cyber-toast';
      toast.className = 'minimal-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span class="toast-dot"></span><span>${message}</span>`;
    toast.classList.add('show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  formatMarkdown(text) {
    if (!text) return '';
    return text
      .trim()
      .replace(/\n\s*-\s+(.*)/g, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      .replace(/\n\n/g, '<br><br>');
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
