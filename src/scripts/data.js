// ============================================================================
// CYBERNET LEXICON // NETWORK ENGINEER ENCYCLOPEDIA DATABASE
// ============================================================================

export const OSI_LAYERS = [
  {
    layer: 7,
    name: "Application",
    nameRu: "Прикладной уровень",
    pdu: "Данные (Data)",
    devices: "Хосты, L7 Прокси, WAF, API Gateway",
    color: "#ec4899",
    description: "Взаимодействие приложений с сетью. Протоколы верхнего уровня, форматирование запросов пользователя к сервисам.",
    protocols: ["HTTP/3", "HTTPS", "DNS", "BGP*", "SSH", "SNMP", "NTP", "DHCP", "gRPC", "TLS"]
  },
  {
    layer: 6,
    name: "Presentation",
    nameRu: "Уровень представления",
    pdu: "Данные (Data)",
    devices: "Хосты, Шлюзы шифрования",
    color: "#a855f7",
    description: "Кодирование, сериализация данных (JSON, Protobuf, ASN.1), сжатие и криптографическое шифрование (TLS/SSL).",
    protocols: ["TLS 1.3", "SSL", "ASN.1", "JSON", "Protobuf", "ASCII", "JPEG"]
  },
  {
    layer: 5,
    name: "Session",
    nameRu: "Сеансовый уровень",
    pdu: "Данные (Data)",
    devices: "Хосты, Балансировщики сессий",
    color: "#6366f1",
    description: "Управление сессиями, синхронизация диалога между приложениями, восстановление разорванных сеансов.",
    protocols: ["RPC", "NetBIOS", "PPTP", "SOCKS5", "SIP"]
  },
  {
    layer: 4,
    name: "Transport",
    nameRu: "Транспортный уровень",
    pdu: "Сегмент / Датаграмма (Segment / Datagram)",
    devices: "L4 Балансировщики (HAProxy, IPVS), Stateful Firewall",
    color: "#00f3ff",
    description: "Сквозная доставка данных между процессами (End-to-End). Контроль целостности, упорядоченности, мультиплексирование через порты.",
    protocols: ["TCP", "UDP", "QUIC", "SCTP", "DCCP"]
  },
  {
    layer: 3,
    name: "Network",
    nameRu: "Сетевой уровень",
    pdu: "Пакет (Packet)",
    devices: "Маршрутизаторы (Routers), L3-коммутаторы (Multilayer Switch)",
    color: "#10b981",
    description: "Логическая адресация (IP) и маршрутизация пакетов между независимыми сетями. Определение оптимального пути.",
    protocols: ["IPv4", "IPv6", "BGP", "OSPF", "IS-IS", "ICMP", "IPsec", "MPLS", "GRE"]
  },
  {
    layer: 2,
    name: "Data Link",
    nameRu: "Канальный уровень",
    pdu: "Кадр / Фрейм (Frame)",
    devices: "Коммутаторы (Switches L2), Мосты (Bridges), Сетевые карты (NIC)",
    color: "#f59e0b",
    description: "Физическая адресация (MAC), обнаружение коллизий, контроль доступа к среде (CSMA/CD), тегирование виртуальных сетей (VLAN).",
    protocols: ["Ethernet (802.3)", "VLAN (802.1Q)", "VXLAN", "STP / RSTP", "ARP", "LACP", "LLDP", "PPP"]
  },
  {
    layer: 1,
    name: "Physical",
    nameRu: "Физический уровень",
    pdu: "Биты / сигналы (Bits)",
    devices: "Кабели (Витая пара, Оптика), Трансиверы (SFP/QSFP), Патч-панели, DWDM",
    color: "#ef4444",
    description: "Передача неструктурированного потока битов через физическую среду в виде электрических, оптических или радиосигналов.",
    protocols: ["1000BASE-T", "10GBASE-LR", "100G-SR4", "DWDM", "RS-232", "RJ-45", "LC/SC Fiber"]
  }
];

export const GLOSSARY_TERMS = [
  // L2 / SWITCHING
  {
    id: "vlan",
    term: "VLAN",
    fullName: "Virtual Local Area Network",
    fullNameRu: "Виртуальная локальная компьютерная сеть",
    category: "Switching",
    layer: 2,
    badge: "L2 Core",
    summary: "Логическое разделение одного физического коммутатора на несколько изолированных широковещательных доменов на основе стандарта IEEE 802.1Q.",
    details: `
      VLAN позволяет группировать порты или хосты в логические сегменты независимо от их физического расположения. 
      Кадр Ethernet дополняется 4-байтовым заголовком 802.1Q, содержащим:
      - **TPID (0x8100)**: идентификатор протокола тегирования (2 байта).
      - **PCP (Priority Code Point)**: 3 бита для QoS (802.1p).
      - **DEI (Drop Eligible Indicator)**: 1 бит допустимости сброса.
      - **VLAN ID (VID)**: 12 бит (диапазон от 1 до 4094).
      
      Режимы портов:
      - **Access (Untagged)**: подключение конечных устройств (ПК, серверы). Трафик передаётся без тега.
      - **Trunk (Tagged)**: межузловая связь (Switch-to-Switch, Switch-to-Router), пропускающая несколько VLAN с сохранением тегов.
      - **Native VLAN**: трафик без тега, проходящий через транковый порт (по умолчанию VLAN 1).
    `,
    commands: [
      {
        os: "Cisco IOS",
        cmd: "vlan 10\n name SERVERS\nexit\ninterface Gi0/1\n switchport mode access\n switchport access vlan 10\ninterface Gi0/24\n switchport mode trunk\n switchport trunk allowed vlan 10,20,30"
      },
      {
        os: "Linux (iproute2)",
        cmd: "# Создание vlan 10 на интерфейсе eth0\nip link add link eth0 name eth0.10 type vlan id 10\nip addr add 192.168.10.1/24 dev eth0.10\nip link set dev eth0.10 up"
      },
      {
        os: "Juniper JunOS",
        cmd: "set vlans SERVERS vlan-id 10\nset interfaces ge-0/0/0 unit 0 family ethernet-switching interface-mode access vlan members SERVERS\nset interfaces ge-0/0/23 unit 0 family ethernet-switching interface-mode trunk vlan members [ SERVERS USERS ]"
      }
    ],
    troubleshooting: "Проверяйте соответствие Native VLAN с обеих сторон транка (Native VLAN Mismatch вызывает утечки трафика и петли CDP/STP). Убедитесь, что нужный VLAN разрешён в списке 'allowed vlan'.",
    rfc: "IEEE 802.1Q"
  },
  {
    id: "vxlan",
    term: "VXLAN",
    fullName: "Virtual Extensible LAN",
    fullNameRu: "Виртуальная расширяемая локальная сеть",
    category: "Switching / Datacenter",
    layer: 2,
    badge: "DC Overlay",
    summary: "Технология инкапсуляции кадров Layer 2 в UDP-пакеты Layer 3 (порт 4789), расширяющая лимит с 4096 до 16 миллионов виртуальных сегментов.",
    details: `
      VXLAN решает проблему масштабирования облачных дата-центров и устраняет зависимость от STP на фабриках Spine-Leaf.
      - **VNI (VXLAN Network Identifier)**: 24-битный идентификатор, поддерживающий до 16 777 216 сегментов.
      - **VTEP (VXLAN Tunnel End Point)**: устройство (коммутатор Leaf или гипервизор), выполняющее инкапсуляцию/декапсуляцию.
      - Накладные расходы заголовка: 50 байт (Ethernet 14B + IP 20B + UDP 8B + VXLAN 8B). Требует MTU >= 1550 байт (рекомендуется Jumbo Frames 9000).
      - Плоскость управления (Control Plane): чаще всего используется **BGP EVPN** (RFC 7432) для распространения MAC/IP-маршрутов без широковещательного флуда (Flood & Learn).
    `,
    commands: [
      {
        os: "Linux (iproute2)",
        cmd: "# Создание VTEP с VNI 100\nip link add vxlan100 type vxlan id 100 dev eth0 dstport 4789 local 10.0.0.1 remote 10.0.0.2\nip link set vxlan100 up\nip link add br-vxlan type bridge\nip link set vxlan100 master br-vxlan"
      },
      {
        os: "Cisco NX-OS",
        cmd: "feature vn-segment-vlan-based\nfeature nv overlay\nvlan 100\n vn-segment 10100\ninterface nve1\n no shutdown\n source-interface loopback0\n member vni 10100 ingress-replication"
      }
    ],
    troubleshooting: "Обязательно включите Jumbo Frames (MTU 9000 или минимум 1600) на всех промежуточных L3-линках подложки (Underlay), иначе пакеты будут фрагментироваться или молча отбрасываться при установленном флаге DF.",
    rfc: "RFC 7348"
  },
  {
    id: "stp",
    term: "STP / RSTP / MSTP",
    fullName: "Spanning Tree Protocol (802.1D / 802.1w / 802.1s)",
    fullNameRu: "Протокол остового / связующего дерева",
    category: "Switching",
    layer: 2,
    badge: "Loop Prevention",
    summary: "Сетевой протокол канального уровня, предотвращающий петли коммутации (Broadcast Storms) в топологиях с избыточными связями путём блокировки дублирующих портов.",
    details: `
      При возникновении физической петли в L2-сети широковещательные кадры (ARP, DHCP) циркулируют бесконечно (так как в Ethernet-заголовке нет поля TTL), вызывая отказ коммутаторов за секунды.
      
      Ключевые понятия:
      - **BPDU (Bridge Protocol Data Unit)**: служебные пакеты, которыми обмениваются коммутаторы каждые 2 секунды.
      - **Root Bridge (Корневой мост)**: коммутатор с наименьшим Bridge ID (Bridge Priority + MAC-адрес).
      - Роли портов в RSTP: Root Port (RP), Designated Port (DP), Alternate Port (AP), Backup Port.
      - Состояния портов в RSTP: Discarding -> Learning -> Forwarding (сходимость за сотни миллисекунд вместо 30-50 секунд в 802.1D).
      - **BPDU Guard**: отключает порт (err-disable), если на клиентский Edge/PortFast-порт пришёл BPDU.
    `,
    commands: [
      {
        os: "Cisco IOS",
        cmd: "spanning-tree mode rapid-pvst\nspanning-tree vlan 10 priority 4096\ninterface Gi0/1\n spanning-tree portfast\n spanning-tree bpduguard enable"
      },
      {
        os: "Juniper JunOS",
        cmd: "set protocols rstp interface ge-0/0/0 edge\nset protocols rstp bridge-priority 4k\nset protocols rstp bpdu-block-on-edge"
      }
    ],
    troubleshooting: "Используйте 'show spanning-tree detail' для поиска источника TCN (Topology Change Notifications). Если счетчик изменений топологии непрерывно растет — в сети флапает порт без настроенного PortFast/Edge.",
    rfc: "IEEE 802.1w / 802.1s"
  },
  {
    id: "lacp",
    term: "LACP (802.3ad)",
    fullName: "Link Aggregation Control Protocol",
    fullNameRu: "Протокол управления агрегацией каналов (EtherChannel / Bonding)",
    category: "Switching",
    layer: 2,
    badge: "Redundancy",
    summary: "Протокол объединения нескольких физических сетевых интерфейсов в один логический высокоскоростной транк с балансировкой нагрузки и отказоустойчивостью.",
    details: `
      LACP динамически согласует объединение линков между коммутаторами или сервером и свитчем.
      - Режимы: **Active** (инициирует переговоры LACPDU) и **Passive** (только отвечает).
      - Балансировка трафика: осуществляется не побайтно (что привело бы к out-of-order пакетам), а через вычисление хэша (Src/Dst MAC, Src/Dst IP, L4 порты).
      - При падении одного из физических кабелей агрегированная группа продолжает работать без просадки сессий на пониженной скорости.
    `,
    commands: [
      {
        os: "Cisco IOS",
        cmd: "interface range Gi0/1 - 2\n channel-group 1 mode active\ninterface Port-channel1\n switchport mode trunk"
      },
      {
        os: "Linux (bonding/team)",
        cmd: "# Включение bond с режимом 802.3ad (mode 4)\nip link add bond0 type bond mode 802.3ad lacp_rate fast\nip link set eth1 master bond0\nip link set eth2 master bond0\nip link set bond0 up"
      }
    ],
    troubleshooting: "Убедитесь, что параметры портов (скорость, дуплекс, MTU, режим trunk/access) абсолютно идентичны на всех физических интерфейсах группы, иначе LACP переведет порт в состояние suspended.",
    rfc: "IEEE 802.1AX"
  },
  {
    id: "arp",
    term: "ARP & Proxy ARP",
    fullName: "Address Resolution Protocol",
    fullNameRu: "Протокол разрешения адресов",
    category: "Switching / Fundamentals",
    layer: 2,
    badge: "L2/L3 Bridge",
    summary: "Протокол сопоставления логического IP-адреса с физическим аппаратным MAC-адресом устройства в пределах одного широковещательного домена.",
    details: `
      Работа протокола:
      1. Хост А отправляет широковещательный запрос **ARP Request** (Broadcast: FF:FF:FF:FF:FF:FF) с вопросом: 'У кого IP 192.168.1.5? Ответьте на мой MAC'.
      2. Хост Б с этим IP отвечает адресным пакетом **ARP Reply** (Unicast) со своим аппаратным MAC.
      3. Данные сохраняются в кэше ARP хоста (ARP Cache / Table) с тайм-аутом устаревания.
      
      Разновидности:
      - **Gratuitous ARP (GARP)**: отправка анонса своего IP/MAC без запроса для проверки дублирования IP (DAD) и быстрого обновления CAM-таблиц коммутаторов при смене мастера (VRRP/HSRP).
      - **Proxy ARP**: маршрутизатор отвечает своим MAC-адресом на ARP-запросы к хостам в другой подсети.
      - **ARP Spoofing / Poisoning**: атака перехвата трафика подделкой ARP-ответов. Защита — **DAI (Dynamic ARP Inspection)**.
    `,
    commands: [
      {
        os: "Linux",
        cmd: "ip neigh show # просмотр таблицы соседей ARP\nip neigh flush all # очистка кэша ARP\narping -I eth0 192.168.1.1 # отправка прямого ARP-пинга"
      },
      {
        os: "Cisco IOS",
        cmd: "show ip arp\nclear ip arp-cache\nip arp inspection vlan 10,20 # включение DAI\ninterface Gi0/24\n ip arp inspection trust"
      }
    ],
    troubleshooting: "При статусе 'incomplete' в ARP-таблице хост назначения либо выключен, либо его межсетевой экран блокирует ARP/трафик, либо неверно настроена маска подсети/VLAN.",
    rfc: "RFC 826"
  },
  {
    id: "mtu-jumbo",
    term: "MTU & Jumbo Frames",
    fullName: "Maximum Transmission Unit",
    fullNameRu: "Максимальный размер полезного блока передачи",
    category: "Switching / Performance",
    layer: 2,
    badge: "Performance",
    summary: "Предельный размер полезных данных сетевого пакета (без L2-заголовков), который может быть передан без фрагментации.",
    details: `
      Стандартный Ethernet MTU составляет **1500 байт**.
      - **Jumbo Frames**: кадры размером до 9000-9216 байт. Используются в СХД (iSCSI, NFS) и дата-центрах для уменьшения загрузки процессора за счет сокращения количества прерываний и накладных расходов заголовков.
      - **MSS (Maximum Segment Size)**: полезная нагрузка TCP: MSS = MTU - 20 (IP заголовок) - 20 (TCP заголовок) = 1460 байт.
      - **PMTUD (Path MTU Discovery)**: механизм определения минимального MTU на всем маршруте с помощью пакетов ICMP Type 3 Code 4 (Fragmentation Needed). Если ICMP заблокирован файрволом, возникает 'Black Hole MTU'.
    `,
    commands: [
      {
        os: "Linux",
        cmd: "# Пинг с запретом фрагментации (DF-бит) для проверки MTU 1500\nping -M do -s 1472 8.8.8.8 # 1472 + 28 байт ICMP/IP = 1500\n# Установка MTU 9000\nip link set dev eth0 mtu 9000"
      },
      {
        os: "Cisco IOS",
        cmd: "system mtu jumbo 9000\ninterface Gi0/1\n mtu 9000\n ip mtu 1500 # раздельная настройка L2/L3 MTU"
      }
    ],
    troubleshooting: "Симптом 'сайты не открываются, но пинг проходит' практически всегда указывает на проблему MTU/MSS (Black Hole MTU) из-за блокировки ICMP 'Fragmentation Needed'. Решение: 'ip tcp adjust-mss 1400' на роутере.",
    rfc: "RFC 1191"
  },

  // L3 / ROUTING
  {
    id: "bgp",
    term: "BGP (BGP-4)",
    fullName: "Border Gateway Protocol",
    fullNameRu: "Протокол граничного шлюза (Протокол интернета)",
    category: "Routing",
    layer: 3,
    badge: "L3 Exterior",
    summary: "Основной протокол маршрутизации глобального интернета (Path Vector Protocol), связывающий между собой десятки тысяч Автономных Систем (AS).",
    details: `
      BGP работает поверх надежного TCP соединения (порт 179).
      - **eBGP**: обмен маршрутами между разными Автономными Системами (TTL по умолчанию = 1).
      - **iBGP**: обмен маршрутами внутри одной AS (требует Full Mesh или Route Reflector / BGP Confederation).
      
      Атрибуты выбора пути (BGP Path Selection):
      1. **Weight** (проприетарный Cisco, локально для роутера, больше = лучше).
      2. **Local Preference** (внутри AS, больше = лучше, дефолт 100).
      3. Locally originated (сеть порождена текущим роутером).
      4. **AS-Path** (длина пути по числу AS, короче = лучше).
      5. Origin Type (IGP < EGP < Incomplete).
      6. **MED (Multi-Exit Discriminator)** (сообщает соседней AS приоритет входа, меньше = лучше).
      7. eBGP предпочтительнее iBGP.
      8. Меньший IGP cost к Next-Hop.
      9. Router ID соседа (наименьший).
    `,
    commands: [
      {
        os: "Cisco IOS",
        cmd: "router bgp 65001\n neighbor 192.0.2.1 remote-as 65002\n neighbor 192.0.2.1 description UPLINK-PROVIDER\n address-family ipv4 unicast\n  network 203.0.113.0 mask 255.255.255.0\n  neighbor 192.0.2.1 activate\n  neighbor 192.0.2.1 send-community"
      },
      {
        os: "FRRouting / Quagga",
        cmd: "router bgp 65001\n bgp router-id 1.1.1.1\n neighbor 10.0.0.2 remote-as 65002\n neighbor 10.0.0.2 soft-reconfiguration inbound"
      },
      {
        os: "Juniper JunOS",
        cmd: "set protocols bgp group EXTERNAL type external\nset protocols bgp group EXTERNAL peer-as 65002\nset protocols bgp group EXTERNAL neighbor 192.0.2.1 export EXPORT-PREFIXES"
      }
    ],
    troubleshooting: "Если сессия зависает в 'Active' или 'Connect' — нет TCP связности на порт 179 (файрвол, неверный IP пира, отсутствует маршрут к loopback, либо TTL=1 в eBGP multihop).",
    rfc: "RFC 4271"
  },
  {
    id: "ospf",
    term: "OSPF (OSPFv2 / OSPFv3)",
    fullName: "Open Shortest Path First",
    fullNameRu: "Маршрутизация по алгоритму поиска кратчайшего пути",
    category: "Routing",
    layer: 3,
    badge: "L3 Interior",
    summary: "Протокол динамической внутренней маршрутизации (IGP) с отслеживанием состояния каналов (Link-State), использующий алгоритм Дейкстры (SPF).",
    details: `
      OSPF работает напрямую поверх IP (номер протокола 89, без TCP/UDP).
      - Мультикаст адреса: **224.0.0.5** (AllSPFRouters) и **224.0.0.6** (AllDRouters).
      - Иерархия областей: **Area 0 (Backbone)** обязательна; все остальные зоны (Standard, Stub, Totally Stub, NSSA) должны подключаться к Area 0 через ABR (Area Border Router).
      - Роли в широковещательных сегментах: **DR (Designated Router)** и **BDR (Backup DR)** для снижения объема LSA-флуда.
      
      Типы LSA:
      - Type 1 (Router LSA): роутер описывает свои линки внутри зоны.
      - Type 2 (Network LSA): генерирует DR для сети с множественным доступом.
      - Type 3 (Summary LSA): межзональные маршруты от ABR.
      - Type 4 (ASBR Summary): сообщает путь к ASBR.
      - Type 5 (AS External): внешние перераспределенные маршруты от ASBR.
    `,
    commands: [
      {
        os: "Cisco IOS",
        cmd: "router ospf 1\n router-id 10.255.255.1\n auto-cost reference-bandwidth 100000 # для 100G сетей\n network 10.0.10.0 0.0.0.255 area 0\ninterface Gi0/1\n ip ospf hello-interval 1\n ip ospf dead-interval 4"
      },
      {
        os: "MikroTik RouterOS v7",
        cmd: "/routing ospf instance add name=default-v2 version=2 router-id=10.255.255.1\n/routing ospf area add instance=default-v2 name=backbone area-id=0.0.0.0\n/routing ospf interface-template add area=backbone networks=10.0.10.0/24 type=ptp"
      }
    ],
    troubleshooting: "Для перехода соседей в состояние 'FULL' должны совпадать: Hello/Dead интервалы, Area ID, маска подсети интерфейса, тип зоны (stub flags) и MTU (иначе зависание в 'EXSTART/EXCHANGE').",
    rfc: "RFC 2328"
  },
  {
    id: "mpls",
    term: "MPLS",
    fullName: "Multiprotocol Label Switching",
    fullNameRu: "Многопротокольная коммутация по меткам",
    category: "Routing / Service Provider",
    layer: 3,
    badge: "Core Transport",
    summary: "Технология высокопроизводительной маршрутизации, пересылающая трафик на основе коротких 20-битных меток вместо глубокого анализа IP-таблицы.",
    details: `
      MPLS заголовок ('Shim Header', 32 бита) вставляется между L2 и L3 заголовками (Layer 2.5):
      - **Label Value**: 20 бит (до 1 048 576 значений).
      - **Traffic Class (EXP)**: 3 бита для классификации QoS.
      - **Bottom of Stack (S)**: 1 бит, указывающий, является ли метка последней в стеке.
      - **TTL**: 8 бит (копируется из IP TTL для защиты от петель).
      
      Архитектура узлов:
      - **LER / PE (Provider Edge)**: входной/выходной маршрутизатор, выполняет операцию **Push** (навешивание метки) или **Pop** (снятие метки).
      - **LSR / P (Provider Core)**: промежуточный узел, выполняет молниеносный **Swap** (замену метки по таблице LFIB).
      - **PHP (Penultimate Hop Popping)**: предпоследний роутер снимает транспортную метку, избавляя egress PE от двойного поиска.
    `,
    commands: [
      {
        os: "Cisco IOS",
        cmd: "ip cef\nmpls ip\nmpls ldp router-id Loopback0 force\ninterface Gi0/0\n mpls ip\nshow mpls forwarding-table\nshow mpls ldp neighbor"
      },
      {
        os: "Juniper JunOS",
        cmd: "set protocols mpls interface ge-0/0/0.0\nset protocols ldp interface ge-0/0/0.0\nset interfaces ge-0/0/0.0 family mpls"
      }
    ],
    troubleshooting: "LDP сессия требует открытого TCP/UDP порта 646 между адресами Loopback маршрутизаторов. Обязательно проверьте наличие связности по IGP (OSPF/IS-IS) до адресов LDP Router-ID.",
    rfc: "RFC 3031"
  },
  {
    id: "vrf",
    term: "VRF & VRF-Lite",
    fullName: "Virtual Routing and Forwarding",
    fullNameRu: "Виртуальная маршрутизация и пересылка",
    category: "Routing",
    layer: 3,
    badge: "Segmentation",
    summary: "Технология создания нескольких изолированных независимых таблиц маршрутизации (Routing Tables) внутри одного физического сетевого устройства.",
    details: `
      VRF — это аналог VLAN, но на сетевом уровне (Layer 3).
      - Внутри каждого VRF могут существовать абсолютно одинаковые перекрывающиеся диапазоны IP-адресов (например, сеть 10.0.0.0/24 у Клиента А и Клиента Б) без конфликтов.
      - **VRF-Lite**: локальное разделение таблиц без использования MPLS.
      - **MPLS L3VPN (RFC 4364)**: объединение клиентских VRF через операторскую сеть с помощью BGP EVPN/MP-BGP, параметров **RD (Route Distinguisher)** для уникализации префиксов и **RT (Route Target)** для контроля импорта/экспорта.
    `,
    commands: [
      {
        os: "Cisco IOS-XE",
        cmd: "vrf definition CUSTOMER_A\n rd 65000:100\n address-family ipv4\n  route-target export 65000:100\n  route-target import 65000:100\ninterface Gi0/2\n vrf forwarding CUSTOMER_A\n ip address 10.10.10.1 255.255.255.0"
      },
      {
        os: "Linux (iproute2)",
        cmd: "# Создание VRF на Linux\nip link add red type vrf table 100\nip link set dev eth1 master red\nip link set red up\nip route add 192.168.1.0/24 dev eth1 table 100\nip route show vrf red"
      }
    ],
    troubleshooting: "При привязке интерфейса к VRF ('vrf forwarding') в Cisco IOS с него удаляется ранее настроенный IP-адрес! Адрес необходимо вводить повторно после назначения VRF.",
    rfc: "RFC 4364"
  },
  {
    id: "ipv6",
    term: "IPv6 & NDP",
    fullName: "Internet Protocol Version 6",
    fullNameRu: "Межсетевой протокол шестой версии",
    category: "Routing / Addressing",
    layer: 3,
    badge: "Next-Gen IP",
    summary: "Современный протокол сетевого уровня со 128-битным адресным пространством (3.4×10^38 адресов), встроенным IPSec и протоколом NDP вместо ARP.",
    details: `
      Ключевые отличия от IPv4:
      - Размер адреса: 128 бит (8 групп по 4 шестнадцатеричные цифры, разделённые двоеточиями).
      - Нет широковещания (Broadcast) — заменено на эффективный Multicast.
      - Нет фрагментации на промежуточных роутерах (только Source Fragmentation).
      - **NDP (Neighbor Discovery Protocol)** поверх ICMPv6 заменяет ARP:
        - NS (Neighbor Solicitation) / NA (Neighbor Advertisement)
        - RS (Router Solicitation) / RA (Router Advertisement) для **SLAAC** (автоконфигурации без DHCP).
      - Типы адресов:
        - \`fe80::/10\` — Link-Local (действителен только в пределах L2 сегмента).
        - \`2000::/3\` — Global Unicast (маршрутизируемый в интернете).
        - \`ff00::/8\` — Multicast адреса.
        - \`::1/128\` — Loopback.
    `,
    commands: [
      {
        os: "Linux",
        cmd: "ip -6 addr add 2001:db8::1/64 dev eth0\nip -6 route add default via 2001:db8::fe dev eth0\nip -6 neigh show # аналог ARP таблицы"
      },
      {
        os: "Cisco IOS",
        cmd: "ipv6 unicast-routing\ninterface Gi0/0\n ipv6 address 2001:db8:acad:1::1/64\n ipv6 address fe80::1 link-local\n ipv6 nd prefix 2001:db8:acad:1::/64"
      }
    ],
    troubleshooting: "Никогда не блокируйте ICMPv6 на межсетевых экранах! Фильтрация ICMPv6 ломает NDP (определение MAC-адресов) и SLAAC, а также Path MTU Discovery (Packet Too Big).",
    rfc: "RFC 8200"
  },
  {
    id: "nat-cgnat",
    term: "NAT & CGNAT",
    fullName: "Network Address Translation (RFC 1918 / RFC 6598)",
    fullNameRu: "Трансляция сетевых адресов / Операторский NAT",
    category: "Routing / Security",
    layer: 3,
    badge: "Address Reuse",
    summary: "Механизм преобразования IP-адресов транзитных пакетов, позволяющий тысячам хостов из приватных сетей выходить в интернет через один публичный IP.",
    details: `
      Основные виды:
      - **SNAT (Source NAT / Masquerade)**: замена адреса источника на выходе во внешнюю сеть.
      - **DNAT (Destination NAT / Port Forwarding)**: проброс входящих портов к внутреннему серверу.
      - **NAPT / PAT (Port Address Translation)**: мультиплексирование тысяч соединений через уникальные L4-порты (от 1024 до 65535).
      - **CGNAT (Carrier-Grade NAT, Large Scale NAT)**: двухуровневый NAT у интернет-провайдеров. Выделенный диапазон по RFC 6598: **100.64.0.0/10** (от 100.64.0.0 до 100.127.255.255).
    `,
    commands: [
      {
        os: "Linux (iptables / nftables)",
        cmd: "# iptables SNAT (Masquerade)\niptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE\n# nftables NAT\nnft add rule nat postrouting oifname 'eth0' masquerade"
      },
      {
        os: "Cisco IOS",
        cmd: "ip nat inside source list 1 interface Gi0/0 overload\ninterface Gi0/1\n ip nat inside\ninterface Gi0/0\n ip nat outside\naccess-list 1 permit 192.168.0.0 0.0.255.255"
      }
    ],
    troubleshooting: "Исчерпание портов (Port Exhaustion) на CGNAT-шлюзе приводит к невозможности открытия новых соединений хостами. Проверяйте размер пула портов и тайм-ауты TCP TIME_WAIT.",
    rfc: "RFC 3022 / RFC 6598"
  },
  {
    id: "icmp",
    term: "ICMP",
    fullName: "Internet Control Message Protocol",
    fullNameRu: "Протокол межсетевых управляющих сообщений",
    category: "Routing / Diagnostics",
    layer: 3,
    badge: "Diagnostics",
    summary: "Вспомогательный протокол стека TCP/IP для передачи сообщений об ошибках, невозможности доставки пакетов и оперативной диагностики сети.",
    details: `
      Ключевые типы и коды ICMP:
      - **Type 8, Code 0**: Echo Request (запрос эхо-пинга).
      - **Type 0, Code 0**: Echo Reply (ответ на эхо-пинг).
      - **Type 3**: Destination Unreachable (Узел недостижим):
        - Code 0: Сеть недостижима.
        - Code 1: Хост недостижим.
        - Code 3: Порт недостижим (отправляется при UDP запросе на закрытый порт).
        - Code 4: Требуется фрагментация, но установлен DF-бит (критично для PMTUD!).
      - **Type 11**: Time Exceeded (Превышен лимит времени жизни TTL = 0, основа работы traceroute).
    `,
    commands: [
      {
        os: "Диагностика",
        cmd: "ping -c 4 1.1.1.1 # проверка доступности\ntraceroute -n -I 1.1.1.1 # трассировка через ICMP Echo\nnping --icmp -c 5 1.1.1.1 # расширенная генерация пакетов"
      }
    ],
    troubleshooting: "Полная блокировка ICMP на брандмауэрах — грубая ошибка сетевой безопасности, ломающая согласование MTU и определение недоступности шлюзов.",
    rfc: "RFC 792"
  },

  // L4 / TRANSPORT
  {
    id: "tcp",
    term: "TCP",
    fullName: "Transmission Control Protocol",
    fullNameRu: "Протокол управления передачей",
    category: "Transport",
    layer: 4,
    badge: "Reliable Stream",
    summary: "Транспортный протокол с установлением соединения, гарантирующий надежную, упорядоченную доставку потока байтов и контроль перегрузки канала.",
    details: `
      **3-Way Handshake (Тройное рукопожатие)**:
      1. Клиент -> Сервер: **SYN** (Seq = X).
      2. Сервер -> Клиент: **SYN-ACK** (Seq = Y, Ack = X + 1).
      3. Клиент -> Сервер: **ACK** (Seq = X + 1, Ack = Y + 1) — соединение установлено (ESTABLISHED).
      
      Завершение сессии (4-Way Teardown):
      - Отправка флагов FIN -> ACK -> FIN -> ACK. После этого инициатор переходит в состояние TIME_WAIT (2*MSL) для гарантии приема задержавшихся пакетов.
      
      Механизмы надежности:
      - Sliding Window (Скользящее окно): динамический контроль потока (Flow Control).
      - Алгоритмы Congestion Control: Reno, CUBIC, Google BBR (основан на пропускной способности канала и RTT).
    `,
    commands: [
      {
        os: "Linux",
        cmd: "ss -tina '( dport = :443 or sport = :443 )' # просмотр параметров TCP сокетов (RTT, cwnd, MSS)\nsysctl net.ipv4.tcp_congestion_control # текущий алгоритм (bbr/cubic)"
      }
    ],
    troubleshooting: "Состояние SYN_RECV в большом объеме говорит об атаке SYN Flood. Для противодействия включите параметр ядра: net.ipv4.tcp_syncookies = 1.",
    rfc: "RFC 9293"
  },
  {
    id: "udp",
    term: "UDP",
    fullName: "User Datagram Protocol",
    fullNameRu: "Протокол пользовательских датаграмм",
    category: "Transport",
    layer: 4,
    badge: "Low Latency",
    summary: "Легковесный транспортный протокол без установления соединения, минимизирующий задержки за счет отсутствия повторной отправки и контроля доставки.",
    details: `
      Заголовок UDP предельно компактен — всего **8 байт** (Source Port 2B, Dest Port 2B, Length 2B, Checksum 2B).
      - Отсутствуют фазы соединения (Handshake) и закрытия сессии.
      - Нет подтверждения доставки (ACK) и контроля порядка пакетов.
      - Идеален для задач реального времени, где задержка критичнее потери кадров: DNS, VoIP (RTP), видеостриминг, сетевые игры, протоколы туннелирования (WireGuard, VXLAN, Geneve).
      - Является базой для новейшего транспортного протокола QUIC (HTTP/3).
    `,
    commands: [
      {
        os: "Linux",
        cmd: "ss -u -a -n -p # мониторинг открытых UDP сокетов\nnc -u -v 192.168.1.1 53 # тестирование UDP порта DNS\niperf3 -c 10.0.0.2 -u -b 1G # тестирование пропускной способности UDP 1 Gbps"
      }
    ],
    troubleshooting: "Если UDP трафик теряется при высокой нагрузке, проверьте счетчик ошибок UDP Receive Buffer Errors через 'netstat -s -u' и увеличьте буфер сокетов ядра (rmem_max).",
    rfc: "RFC 768"
  },
  {
    id: "quic",
    term: "QUIC (HTTP/3)",
    fullName: "Quick UDP Internet Connections",
    fullNameRu: "Быстрые UDP интернет-соединения",
    category: "Transport / Modern",
    layer: 4,
    badge: "Next-Gen L4",
    summary: "Транспортный протокол нового поколения от IETF, работающий поверх UDP со встроенным шифрованием TLS 1.3 и независимыми потоками без блокировки начала очереди.",
    details: `
      QUIC устраняет фундаментальные ограничения связки TCP + TLS:
      - **Устранение Head-of-Line Blocking**: при потере пакета в одном потоке данных остальные потоки продолжают обрабатываться без ожидания.
      - **0-RTT Connection Establishment**: при повторном подключении данные приложения передаются в самом первом запросе.
      - **Connection Migration**: идентификация сессии по Connection ID (CID), а не по IP/порту. Соединение не рвется при переключении телефона с Wi-Fi на LTE!
      - Обязательное шифрование: не только полезная нагрузка, но и метаданные транспортного заголовка шифруются, предотвращая подделку и DPI операторов.
    `,
    commands: [
      {
        os: "Тестирование",
        cmd: "curl --http3 -IL https://cloudflare.com # запрос по HTTP/3\nwireshark: udp.port == 443 # фильтр захвата трафика QUIC"
      }
    ],
    troubleshooting: "Если у клиентов не работает HTTP/3, убедитесь, что на пограничных файрволах разрешен исходящий трафик по протоколу UDP на порт 443.",
    rfc: "RFC 9000"
  },

  // SECURITY & VPN
  {
    id: "ipsec",
    term: "IPsec",
    fullName: "Internet Protocol Security",
    fullNameRu: "Набор протоколов для защиты сетевого трафика на уровне IP",
    category: "Security & VPN",
    layer: 3,
    badge: "Crypto VPN",
    summary: "Комплекс открытых стандартов для обеспечения аутентификации, целостности и конфиденциальности передаваемых по IP-сетям данных.",
    details: `
      Протоколы шифрования и аутентификации:
      - **ESP (Encapsulating Security Payload, IP proto 50)**: обеспечивает шифрование, проверку подлинности и защиту от повторов.
      - **AH (Authentication Header, IP proto 51)**: только аутентификация и проверка целостности заголовков (не работает через NAT!).
      
      Протокол согласования ключей **IKEv1 / IKEv2** (UDP 500 / 4500 NAT-T):
      - **Phase 1 (ISAKMP SA)**: аутентификация узлов (PSK или RSA сертификаты) и создание защищенного канала управления.
      - **Phase 2 (IPsec SA)**: согласование криптографических параметров для шифрования реального трафика.
      - Режимы работы: **Tunnel Mode** (исходный IP-пакет полностью инкапсулируется в новый IP-заголовок, стандарт для Site-to-Site) и **Transport Mode** (шифруется только L4 payload).
    `,
    commands: [
      {
        os: "Cisco IOS",
        cmd: "crypto ikev2 proposal PROP_1\n encryption aes-gcm-256\n group 19 20\ncrypto ikev2 policy POL_1\n proposal PROP_1\ncrypto ikev2 profile PROF_1\n match identity remote any\n authentication remote pre-share\n authentication local pre-share"
      },
      {
        os: "Linux (StrongSwan)",
        cmd: "swanctl --list-sas # статус активных IPsec SA\nswanctl --initiate --child net-to-net # запуск туннеля"
      }
    ],
    troubleshooting: "Если туннель проходит через NAT, обязательно откройте UDP порт 4500 (NAT-Traversal). Если фаза 1 успешна, но фаза 2 падает — проверьте совпадение Traffic Selectors (шифруемых подсетей) с обеих сторон.",
    rfc: "RFC 4301 / RFC 7296"
  },
  {
    id: "wireguard",
    term: "WireGuard",
    fullName: "WireGuard VPN",
    fullNameRu: "Современный криптографический VPN протокол",
    category: "Security & VPN",
    layer: 3,
    badge: "Modern VPN",
    summary: "Чрезвычайно быстрый, простой и безопасный VPN протокол, работающий в ядре операционной системы с использованием современной криптографии.",
    details: `
      Преимущества перед IPsec и OpenVPN:
      - Всего ~4000 строк кода ядра Linux (легко аудировать на уязвимости).
      - Фиксированный стек новейшей криптографии (No Crypto Agility):
        - ChaCha20 для симметричного шифрования с аутентификацией Poly1305.
        - Curve25519 для обмена ключами ECDH.
        - BLAKE2s для хэширования.
        - Noise Protocol Framework.
      - **Cryptokey Routing**: привязка открытого публичного ключа пира к разрешенным IP-адресам (AllowedIPs).
      - Режим тишины (Stealth): не отвечает на запросы неавторизованных IP, защищая сервер от сканирования портов.
    `,
    commands: [
      {
        os: "Linux",
        cmd: "# Генерация ключей\nwg genkey | tee privatekey | wg pubkey > publickey\n# Просмотр статуса соединений\nwg show\n# Поднятие интерфейса\nwg-quick up wg0"
      }
    ],
    troubleshooting: "Параметр 'AllowedIPs' на клиенте работает как маршрутизация: если указать '0.0.0.0/0', то весь интернет-трафик пойдет через туннель. Не забудьте настроить 'PersistentKeepalive = 25' для клиентов за NAT.",
    rfc: "RFC 8559"
  },
  {
    id: "firewall-conntrack",
    term: "Stateful Firewall & Conntrack",
    fullName: "Stateful Packet Inspection & Connection Tracking",
    fullNameRu: "Межсетевой экран с контролем состояния сессий",
    category: "Security & VPN",
    layer: 4,
    badge: "Security Core",
    summary: "Технология фильтрации сетевого трафика, отслеживающая контекст и жизненный цикл каждого соединения в специальной таблице состояний.",
    details: `
      В отличие от простых Stateless ACL (проверяющих каждый пакет изолированно), Stateful Firewall помнит состояние сессий:
      - **NEW**: пакет инициирует новое допустимое соединение (например, TCP SYN).
      - **ESTABLISHED**: пакет принадлежит уже открытому и подтвержденному двустороннему соединению.
      - **RELATED**: пакет открывает вспомогательный поток (например, ICMP ошибки или FTP-data).
      - **INVALID**: поврежденный пакет или нарушение порядка флагов TCP (сбрасывается немедленно).
      
      Таблица Conntrack в Linux:
      Хранит информацию о кортеже (Tuple): IP источника/назначения, порты и протокол. Превышение лимита \`nf_conntrack_max\` приводит к отбрасыванию новых соединений!
    `,
    commands: [
      {
        os: "Linux",
        cmd: "conntrack -L # вывод всех активных отслеживаемых сессий\nconntrack -C # текущее количество записей в таблице\nsysctl net.netfilter.nf_conntrack_count\nsysctl net.netfilter.nf_conntrack_max"
      },
      {
        os: "iptables",
        cmd: "iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT\niptables -A INPUT -m conntrack --ctstate INVALID -j DROP"
      }
    ],
    troubleshooting: "Сообщение в dmesg: 'nf_conntrack: table full, dropping packet' означает исчерпание лимита сессий (DDoS или утечка соединений). Увеличьте \`sysctl net.netfilter.nf_conntrack_max\`.",
    rfc: "RFC 2979"
  },

  // SDN, TELEMETRY & AUTOMATION
  {
    id: "netflow-ipfix",
    term: "NetFlow & IPFIX",
    fullName: "Network Flow Monitoring / IP Flow Information Export",
    fullNameRu: "Протоколы сетевой телеметрии и мониторинга потоков данных",
    category: "SDN & Telemetry",
    layer: 4,
    badge: "Telemetry",
    summary: "Стандарты сбора и экспорта статистической информации о потоках сетевого трафика, проходящего через маршрутизаторы и коммутаторы.",
    details: `
      Поток (Flow) определяется 7 ключевыми параметрами:
      1. Source IP
      2. Destination IP
      3. Source Port
      4. Destination Port
      5. Layer 3 Protocol Type
      6. Ingress Interface
      7. IP Type of Service (ToS / DSCP)
      
      При закрытии сессии или срабатывании тайм-аута (Active/Inactive Timeout) устройство формирует UDP-пакет со статистикой (число байт, пакетов, метки времени) и отправляет его на Flow-коллектор (ELK, ClickHouse, FastNetMon).
      - **IPFIX (RFC 7011)** — стандартизированный IETF вариант NetFlow v9 с поддержкой произвольных шаблонов (Variable-Length fields).
    `,
    commands: [
      {
        os: "Cisco IOS-XE (Flexible NetFlow)",
        cmd: "flow record REC_1\n match ipv4 source address\n match ipv4 destination address\n collect counter bytes long\n collect counter packets long\nflow exporter EXP_1\n destination 192.168.100.5\n transport udp 2055\nflow monitor MON_1\n record REC_1\n exporter EXP_1"
      }
    ],
    troubleshooting: "На высоконагруженных каналах 10G/100G обязательно настраивайте семплирование (Sampled NetFlow 1:1000), иначе генерация статистики по каждому пакету перегрузит CPU сетевого процессора.",
    rfc: "RFC 7011"
  },
  {
    id: "bfd",
    term: "BFD",
    fullName: "Bidirectional Forwarding Detection",
    fullNameRu: "Двунаправленное обнаружение пересылки данных",
    category: "Routing / Resilience",
    layer: 3,
    badge: "Sub-Second HA",
    summary: "Сверхлегковесный протокол для обнаружения сбоев каналов связи между двумя маршрутизаторами за доли секунды (миллисекунды).",
    details: `
      Проблема:
      Стандартные Hello-интервалы протоколов OSPF (10-40 сек) или BGP (60-180 сек) реагируют на обрыв линка слишком медленно, что недопустимо в операторских сетях.
      
      Решение BFD:
      - Работает по UDP (порты 3784 / 3785).
      - Генерирует микро-пакеты с интервалами 50-300 мс на аппаратном уровне (ASIC/NPU).
      - При потере 3 пакетов подряд (150 мс) BFD немедленно уведомляет OSPF, BGP или статические маршруты, вызывая мгновенный переход на резервный путь (Fast Reroute / FRR).
    `,
    commands: [
      {
        os: "Cisco IOS",
        cmd: "interface Gi0/0\n bfd interval 50 min_rx 50 multiplier 3\nrouter bgp 65001\n neighbor 10.0.0.2 fall-over bfd\nrouter ospf 1\n bfd all-interfaces"
      },
      {
        os: "Juniper JunOS",
        cmd: "set protocols bgp group PEERS neighbor 10.0.0.2 bfd-liveness-detection minimum-interval 100\nset protocols bgp group PEERS neighbor 10.0.0.2 bfd-liveness-detection multiplier 3"
      }
    ],
    troubleshooting: "Если таймеры BFD настроены слишком агрессивно (например, 10 мс) на маршрутизаторах без аппаратного оффлоада BFD в ASIC, кратковременный скачок загрузки CPU приведет к ложному падению всех сессий BGP.",
    rfc: "RFC 5880"
  },
  {
    id: "segment-routing",
    term: "Segment Routing (SRv6 / SR-MPLS)",
    fullName: "Segment Routing Architecture",
    fullNameRu: "Сегментная маршрутизация от источника",
    category: "SDN & Telemetry",
    layer: 3,
    badge: "Next-Gen SDN",
    summary: "Современная парадигма маршрутизации от источника (Source Routing), кодирующая весь путь следования пакета в виде упорядоченного списка сегментов (SID).",
    details: `
      Революция в транзитных сетях:
      - Ликвидирует необходимость в протоколах LDP и RSVP-TE в ядре оператора.
      - Промежуточным P-маршрутизаторам больше не нужно хранить состояние для каждого туннеля (Stateless Core).
      - **SR-MPLS**: идентификаторы сегментов (SID) упаковываются в стандартный стек меток MPLS.
      - **SRv6**: идентификаторы сегментов передаются в специальном заголовке расширения IPv6 (Routing Extension Header / SRH), что позволяет программировать путь пакета прямо через адреса IPv6.
      - Обеспечивает мгновенный TI-LFA (Topology Independent Loop-Free Alternate) с гарантией восстановления трафика менее чем за 50 мс.
    `,
    commands: [
      {
        os: "Концепция Cisco / Arista",
        cmd: "segment-routing mpls\n connected-prefix-sid-map\n  address-family ipv4\n   10.255.255.1/32 index 101"
      }
    ],
    troubleshooting: "В сетях SRv6 заголовок SRH увеличивает размер пакета на 16 байт для каждого транзитного сегмента. Следите за Path MTU на сетевых интерфейсах подложки.",
    rfc: "RFC 8402"
  },

  // APPLICATION & SERVICES
  {
    id: "dns",
    term: "DNS (DoH / DoT / DNSSEC)",
    fullName: "Domain Name System",
    fullNameRu: "Система доменных имен",
    category: "Application & L7",
    layer: 7,
    badge: "Core Service",
    summary: "Распределенная база данных для преобразования понятных человеку доменных имен хостов в числовые сетевые IP-адреса.",
    details: `
      Иерархическая структура:
      1. Root Domains (\`.\`) — 13 корневых серверов (кластеризованных через BGP Anycast по сотням дата-центров мира).
      2. TLD (Top-Level Domain) — \`.ru\`, \`.com\`, \`.org\`.
      3. Authoritative DNS — серверы владельца зоны.
      
      Типы DNS-записей:
      - **A**: IPv4 адрес.
      - **AAAA**: IPv6 адрес.
      - **CNAME**: Канонический алиас на другое имя.
      - **MX**: Почтовый сервер домена.
      - **TXT**: Текстовые данные (SPF, DKIM, DMARC валидация).
      - **PTR**: Обратный поиск IP -> Домен (Reverse DNS в зоне in-addr.arpa).
      
      Безопасность DNS:
      - **DoH (DNS over HTTPS, RFC 8484)**: порт 443 TCP, шифрует запросы, защищая от перехвата провайдером.
      - **DoT (DNS over TLS, RFC 7858)**: порт 853 TCP.
      - **DNSSEC**: криптографическая подпись ответов (RRSIG, DNSKEY) для исключения подделки кэша (DNS Cache Poisoning).
    `,
    commands: [
      {
        os: "Диагностика",
        cmd: "dig @1.1.1.1 example.com +dnssec # запрос с проверкой DNSSEC\ndig -x 8.8.8.8 +short # обратный запрос PTR\ndig @1.1.1.1 example.com ANY +trace # пошаговая трассировка от корня"
      }
    ],
    troubleshooting: "При замене IP-адреса сервиса всегда заранее снижайте значение TTL (Time-to-Live) в зоне до 60-300 секунд за 24 часа до миграции, чтобы клиенты быстрее сбросили устаревший кэш.",
    rfc: "RFC 1035"
  },
  {
    id: "dhcp",
    term: "DHCP & DHCP Relay (Option 82)",
    fullName: "Dynamic Host Configuration Protocol",
    fullNameRu: "Протокол динамической конфигурации узла",
    category: "Application & L7",
    layer: 7,
    badge: "Auto Config",
    summary: "Сетевой протокол для автоматического назначения клиентам IP-адресов, масок подсетей, адресов шлюзов и серверов DNS.",
    details: `
      Процесс получения адреса (**DORA**):
      1. **Discover**: клиент рассылает широковещательный запрос (Broadcast 255.255.255.255, UDP порт 67).
      2. **Offer**: DHCP-сервер предлагает доступный IP-адрес.
      3. **Request**: клиент запрашивает предложенный адрес.
      4. **Acknowledge (ACK)**: сервер фиксирует аренду (Lease Time) и отправляет подтверждение с сетевыми настройками.
      
      **DHCP Relay**: так как Broadcast не проходит через маршрутизаторы, роутер на интерфейсе перехватывает broadcast-запрос и пересылает его Unicast-пакетом на централизованный DHCP-сервер.
      - **Option 82**: релей вставляет идентификатор порта коммутатора и VLAN (Circuit ID / Remote ID) для точной привязки IP к порту.
    `,
    commands: [
      {
        os: "Cisco IOS",
        cmd: "interface Gi0/1\n ip helper-address 10.100.1.50 # настройка DHCP Relay\n ip dhcp relay information option # вставка Option 82"
      },
      {
        os: "Linux (dhclient)",
        cmd: "dhclient -r eth0 # освободить аренду (Release)\ndhclient -v eth0 # запросить новый IP с подробным выводом"
      }
    ],
    troubleshooting: "Появление в сети чужого домашнего роутера вызывает появление 'Rogue DHCP' (раздача ложных шлюзов и DNS). Защита: включение функции **DHCP Snooping** на L2 коммутаторах с пометкой аплинка как 'trusted'.",
    rfc: "RFC 2131"
  },
  {
    id: "ntp-ptp",
    term: "NTP & PTP (IEEE 1588)",
    fullName: "Network Time Protocol & Precision Time Protocol",
    fullNameRu: "Сетевой протокол времени и протокол точной синхронизации времени",
    category: "Application & L7",
    layer: 7,
    badge: "Time Sync",
    summary: "Протоколы синхронизации системных часов сетевого оборудования и серверов для корреляционного анализа логов и транзакций.",
    details: `
      **NTP (порт 123 UDP)**:
      - Архитектура Stratum:
        - Stratum 0: первичные квантовые эталоны и GPS/ГЛОНАСС спутниковые часы.
        - Stratum 1: серверы, подключенные напрямую к Stratum 0.
        - Stratum 2: серверы и роутеры, синхронизирующиеся со Stratum 1.
      - Точность NTP: от 1 до 10 миллисекунд в глобальных сетях.
      
      **PTP (Precision Time Protocol, IEEE 1588v2)**:
      - Разработан для телекома (5G базовые станции), финансовых бирж и энергетики.
      - Обеспечивает субмикросекундную и наносекундную точность за счет аппаратных меток времени на физическом уровне (PHY/MAC).
    `,
    commands: [
      {
        os: "Linux (chrony)",
        cmd: "chronyc sources -v # проверка источников точного времени\nchronyc tracking # статус синхронизации и текущий оффсет"
      },
      {
        os: "Cisco IOS",
        cmd: "ntp server 192.168.1.1 prefer\nntp source Loopback0\nshow ntp status\nshow ntp associations"
      }
    ],
    troubleshooting: "Рассинхронизация часов даже на пару минут приводит к немедленному отказу проверки TLS сертификатов, разрыву Kerberos-аутентификации и невозможности расследования инцидентов безопасности по SIEM/syslog.",
    rfc: "RFC 5905"
  },
  {
    id: "snmp",
    term: "SNMP (v2c / v3)",
    fullName: "Simple Network Management Protocol",
    fullNameRu: "Простой протокол управления сетью",
    category: "Application & L7",
    layer: 7,
    badge: "Monitoring",
    summary: "Стандартный протокол для мониторинга работоспособности, утилизации портов, сбора счетчиков и инвентаризации сетевых устройств.",
    details: `
      Компоненты SNMP:
      - **OID (Object Identifier)**: числовой иерархический идентификатор параметра (например, \`1.3.6.1.2.1.2.2.1.10\` — входящие октеты интерфейса).
      - **MIB (Management Information Base)**: текстовый словарь-база, транслирующий OID в человекочитаемые имена (IF-MIB, CISCO-BGP-MIB).
      - Типы операций:
        - **GetRequest / GetNext / GetBulk**: опрос агента менеджером (порт 161 UDP).
        - **Trap / Inform**: асинхронное оповещение от роутера на мониторинг о падении порта или сбое питания (порт 162 UDP).
      
      Версии:
      - **v2c**: передает пароль (Community String) в открытом незашифрованном виде.
      - **v3 (authPriv)**: полноценное шифрование (AES) и аутентификация пользователей (SHA-256).
    `,
    commands: [
      {
        os: "Linux (snmpwalk)",
        cmd: "# Опрос устройства по SNMP v3 с аутентификацией и шифрованием\nsnmpwalk -v3 -l authPriv -u mon_user -a SHA -A 'AuthPass123' -x AES -X 'PrivPass123' 10.0.0.1 1.3.6.1.2.1.1.1.0"
      },
      {
        os: "Cisco IOS",
        cmd: "snmp-server group MON_GRP v3 priv\nsnmp-server user mon_user MON_GRP v3 auth sha StrongAuthPass priv aes 128 StrongPrivPass"
      }
    ],
    troubleshooting: "Никогда не используйте дефолтные строки 'public' или 'private' в SNMP v2c. Ограничивайте доступ к портам 161/162 жестким ACL с адресов системы мониторинга (Zabbix, Prometheus snmp_exporter).",
    rfc: "RFC 3411"
  },

  // DIAGNOSTICS & METRICS
  {
    id: "jitter-latency",
    term: "Latency & Jitter",
    fullName: "Network Latency and Packet Delay Variation",
    fullNameRu: "Задержка распространения и джиттер сети",
    category: "Diagnostics",
    layer: 3,
    badge: "QoS Metric",
    summary: "Фундаментальные параметры качества сетевого соединения: общее время передачи пакета (RTT) и вариация колебания этой задержки во времени.",
    details: `
      - **Latency (Задержка)**: время, необходимое пакету для прохождения от отправителя к получателю (RTT — Round Trip Time, туда и обратно).
        Слагаемые задержки: Propagation Delay (скорость света в оптике ~200 км/мс), Serialization Delay (время выталкивания битов в порт), Queuing Delay (ожидание в очередях буфера).
      - **Jitter (Джиттер)**: математическая дисперсия времени задержки между последовательными пакетами.
        Критичен для голосового трафика (VoIP) и видеоконференций: при джиттере > 30 мс появляются заикания и выпадение звука. Для сглаживания применяется Jitter Buffer.
    `,
    commands: [
      {
        os: "Диагностика",
        cmd: "ping -c 100 -i 0.2 1.1.1.1 | tail -n 2 # подсчет min/avg/max/mdev (mdev = джиттер)\niperf3 -c 10.0.0.2 -u -b 10M # точное измерение джиттера по UDP"
      }
    ],
    troubleshooting: "Резкие всплески джиттера при нормальном среднем пинге чаще всего свидетельствуют о переполнении очередей коммутатора (Bufferbloat) или периодической перегрузке CPU сетевого маршрутизатора.",
    rfc: "RFC 3393"
  },
  {
    id: "packet-loss-bufferbloat",
    term: "Packet Loss & Bufferbloat",
    fullName: "Packet Loss & Excessive In-Network Buffering",
    fullNameRu: "Потеря пакетов и раздувание буферов оборудования",
    category: "Diagnostics",
    layer: 3,
    badge: "Queuing",
    summary: "Падение пропускной способности из-за потери кадров при перегрузке или из-за чрезмерно больших буферов, создающих огромную задержку пакетов.",
    details: `
      - **Packet Loss (Потеря пакетов)**: отбрасывание трафика сетевым оборудованием при переполнении входных/выходных буферов (Tail Drop), ошибках физического уровня (CRC/FCS errors) или сбоях полисинга (Policer/Shaper). В TCP потеря даже 2% пакетов может обрушить скорость передачи на 70% из-за срабатывания алгоритмов сжатия окна.
      - **Bufferbloat (Раздувание буферов)**: проблема, когда маршрутизатор задерживает пакеты в гигантском FIFO-буфере вместо своевременного информирования TCP о перегрузке. Задержка пинга в нагрузке взлетает с 10 мс до 1500 мс!
      - Решения: интеллектуальные алгоритмы управления очередями **AQM (Active Queue Management)**: CoDel, FQ-CoDel, CAKE, WRED.
    `,
    commands: [
      {
        os: "Linux",
        cmd: "# Включение современного планировщика FQ-CoDel / CAKE\ntc qdisc add dev eth0 root fq_codel\n# Мониторинг отброшенных пакетов\nip -s link show dev eth0"
      }
    ],
    troubleshooting: "Если на интерфейсе растут счетчики 'drops' или 'overruns' — коммутатор не справляется со всплесками трафика (Microbursts). Рассмотрите тюнинг QoS, настройку WRED или переход на свитчи с глубоким буфером (Deep Buffer).",
    rfc: "RFC 8290"
  },
  {
    id: "traceroute-mtr",
    term: "Traceroute & MTR",
    fullName: "Trace Route & Matt's Traceroute",
    fullNameRu: "Утилиты пошаговой трассировки сетевого маршрута",
    category: "Diagnostics",
    layer: 3,
    badge: "Diagnostics",
    summary: "Инструменты выявления топологии маршрута и локализации точек задержек и потерь пакетов на основе управления полем TTL (Time-to-Live).",
    details: `
      Принцип работы:
      1. Отправляется серия пакетов с **TTL = 1**. Первый маршрутизатор уменьшает TTL до 0, отбрасывает пакет и возвращает \`ICMP Time Exceeded (Type 11)\`. Так мы узнаем IP первого хопа.
      2. Отправляется серия с **TTL = 2**, затем TTL = 3 и так далее, пока пакет не дойдет до целевого сервера.
      
      Нюансы для сетевого инженера:
      - Traceroute в Linux по умолчанию шлет UDP-пакеты на высокие порты; Windows \`tracert\` шлет ICMP Echo; в Linux можно задать флаг \`-T\` для TCP SYN (порт 80/443), чтобы обойти файрволы.
      - Потери на промежуточном хопе в выводе MTR, если они не продолжаются на всех последующих хопах, являются фиктивными (Control Plane Rate-Limiting ICMP на процессоре данного транзитного роутера).
    `,
    commands: [
      {
        os: "Диагностика",
        cmd: "mtr -rw -c 100 8.8.8.8 # детализированный отчет за 100 циклов\ntraceroute -T -p 443 google.com # трассировка по TCP SYN на порт 443"
      }
    ],
    troubleshooting: "Звездочки ('* * *') в выводе означают, что данный роутер либо блокирует генерацию ICMP Time Exceeded, либо входящий трафик запрещен файрволом, либо присутствует асимметричный обратный маршрут.",
    rfc: "RFC 1393"
  },
  {
    id: "wireshark-pcap",
    term: "Wireshark, TCPdump & PCAP",
    fullName: "Packet Capture & Protocol Deep Analysis",
    fullNameRu: "Захват и глубокий анализ пакетов трафика",
    category: "Diagnostics",
    layer: 2,
    badge: "Deep Inspection",
    summary: "Программные инструменты для перехвата, детального декодирования структуры протоколов всех 7 уровней OSI и анализа сетевых аномалий.",
    details: `
      Главные фильтры Wireshark для расследования инцидентов:
      - \`tcp.analysis.retransmission\` — повторные отправки (потери в сети).
      - \`tcp.analysis.zero_window\` — приемный буфер сервера забит, сервер не успевает читать сокет.
      - \`tcp.flags.reset == 1\` — разрывы соединений RST-пакетами.
      - \`icmp.type == 3 and icmp.code == 4\` — пакеты PMTUD 'Fragmentation Needed'.
      - \`dns.time > 0.1\` — медленные DNS-ответы (>100мс).
      
      Зеркалирование трафика на оборудовании:
      - **SPAN (Port Mirroring)**: локальное копирование с одного порта на другой.
      - **RSPAN (Remote SPAN)**: зеркалирование через специальный VLAN.
      - **ERSPAN (Encapsulated Remote SPAN)**: инкапсуляция зеркалируемого трафика в GRE-туннель для передачи анализатору через L3-сеть.
    `,
    commands: [
      {
        os: "Linux (tcpdump)",
        cmd: "# Захват трафика с записью в файл PCAP\ntcpdump -i eth0 -nn -s 0 -w capture.pcap 'tcp port 443 and not host 192.168.1.5'\n# Быстрый просмотр SYN пакетов\ntcpdump -i eth0 'tcp[tcpflags] & tcp-syn != 0'"
      }
    ],
    troubleshooting: "Не открывайте огромные дампы (> 1 ГБ) целиком в графическом Wireshark, это вызовет исчерпание RAM. Используйте консольные утилиты 'tshark' или 'editcap -c 100000' для нарезки дампа на мелкие части.",
    rfc: "Wireshark Foundation"
  },
  {
    id: "vrrp-hsrp",
    term: "VRRP & HSRP",
    fullName: "Virtual Router Redundancy Protocol / Hot Standby Router Protocol",
    fullNameRu: "Протоколы резервирования первого хопа (FHRP)",
    category: "Routing / Resilience",
    layer: 3,
    badge: "Gateway Redundancy",
    summary: "Протоколы обеспечения отказоустойчивости шлюза по умолчанию путем объединения группы физических маршрутизаторов в один виртуальный IP/MAC шлюз.",
    details: `
      FHRP протоколы избавляют клиентов от необходимости ручной смены шлюза при падении основного роутера:
      - **VRRP (RFC 5798, открытый стандарт)**:
        - Роли: Master и Backup.
        - Мультикаст адрес: 224.0.0.18 (IP протокол 112).
        - Виртуальный MAC: \`00:00:5E:00:01:XX\` (где XX — VRID номер группы).
        - Таймеры: Hello 1 сек, Dead ~3.6 сек.
      - **HSRP (Cisco Proprietary)**:
        - Роли: Active и Standby.
        - Виртуальный MAC (v1): \`00:00:0C:07:AC:XX\`.
      - **Preempt**: функция, позволяющая восстановленному роутеру с более высоким приоритетом вернуть себе статус Master.
    `,
    commands: [
      {
        os: "Cisco IOS (HSRP / VRRP)",
        cmd: "interface Gi0/1\n vrrp 10 ip 192.168.1.1\n vrrp 10 priority 110\n vrrp 10 preempt\n vrrp 10 timers advertise 1"
      },
      {
        os: "Linux (Keepalived)",
        cmd: "vrrp_instance VI_1 {\n  state MASTER\n  interface eth0\n  virtual_router_id 10\n  priority 110\n  advert_int 1\n  virtual_ipaddress {\n    192.168.1.1/24\n  }\n}"
      }
    ],
    troubleshooting: "Если оба роутера перешли в состояние Master ('Split-Brain') — между ними нарушена связность (VLAN mismatch, фильтрация мультикаста 224.0.0.18 файрволом или несоответствие паролей аутентификации).",
    rfc: "RFC 5798"
  },
  {
    id: "bgp-evpn",
    term: "BGP EVPN",
    fullName: "BGP MPLS-Based Ethernet VPN",
    fullNameRu: "Универсальная плоскость управления оверлейными сетями",
    category: "Switching / Datacenter",
    layer: 2,
    badge: "Modern DC",
    summary: "Современный стандарт распределения L2 и L3 маршрутов в Spine-Leaf дата-центрах и кампусных сетях с использованием MP-BGP поверх VXLAN подложки.",
    details: `
      BGP EVPN заменяет неэффективное обучение адресов флудом (Data Plane Flood-and-Learn) на предиктивное распространение информации через протокол BGP:
      - Типы маршрутов (Route Types):
        - **Type 1 (Ethernet Auto-Discovery)**: обнаружение устройств и мультикаст балансировка (ESI).
        - **Type 2 (MAC/IP Advertisement)**: передача MAC-адреса хоста и связанного с ним IP (позволяет свитчам мгновенно отвечать на ARP без бродкаста!).
        - **Type 3 (Inclusive Multicast Ethernet Tag)**: автоматическое построение мультикаст-деревьев для репликации BUM трафика.
        - **Type 4 (Ethernet Segment Route)**: защита от петель и выбор Designated Forwarder при multi-homing.
        - **Type 5 (IP Prefix Route)**: чистая L3 маршрутизация между подсетями и VRF.
    `,
    commands: [
      {
        os: "Cisco NX-OS",
        cmd: "router bgp 65001\n address-family l2vpn evpn\n  retain route-target all\nvlan 100\n vn-segment 10100\nevpn\n vni 10100 l2\n  rd auto\n  route-target both auto"
      }
    ],
    troubleshooting: "Убедитесь, что MTU на фабрике Underlay увеличено до 9000-9216 байт, а Loopback-адреса VTEP анонсируются в подложку через IGP (OSPF/IS-IS/eBGP).",
    rfc: "RFC 7432"
  },
  {
    id: "qos-dscp",
    term: "QoS (DiffServ, DSCP & CoS)",
    fullName: "Quality of Service & Differentiated Services",
    fullNameRu: "Качество обслуживания и дифференциация трафика",
    category: "Diagnostics / QoS",
    layer: 3,
    badge: "Traffic Control",
    summary: "Комплекс сетевых механизмов гарантирования пропускной способности, приоритета очередей и ограничения задержек для критичного трафика.",
    details: `
      Маркировка трафика:
      - **CoS (Class of Service)**: 3 бита в заголовке VLAN 802.1Q (значения 0-7, Layer 2).
      - **DSCP (Differentiated Services Code Point)**: 6 бит поля ToS в заголовке IPv4 / Traffic Class в IPv6 (Layer 3, значения 0-63).
      - Ключевые классы DSCP:
        - **EF (Expedited Forwarding, 46)**: наивысший приоритет, строгая очередь с низкими задержками (PQ) для голоса VoIP (RTP).
        - **AF (Assured Forwarding, AF41, AF31, AF21, AF11)**: гарантированная полоса для видео и критичных баз данных.
        - **CS (Class Selector, CS3, CS6, CS7)**: служебный трафик управления сетью (BGP, OSPF, SSH).
        - **BE (Best Effort, 0)**: дефолтный интернет-трафик.
      
      Механизмы:
      - **Policing (Полисинг)**: жесткое отбрасывание пакетов выше лимита (Drop), деформирует TCP окно.
      - **Shaping (Шейпинг)**: буферизация всплесков для сглаживания графика передачи без потерь.
    `,
    commands: [
      {
        os: "Cisco IOS (MQC QoS)",
        cmd: "class-map match-any VOICE_CLASS\n match dscp ef\npolicy-map WAN_EDGE\n class VOICE_CLASS\n  priority percent 30\n class class-default\n  bandwidth percent 70\ninterface Gi0/0\n service-policy output WAN_EDGE"
      }
    ],
    troubleshooting: "Следите за дропами в очередях 'show policy-map interface'. Если трафик голоса дропается в Priority Queue — лимит полосы для PQ занижен относительно фактического битрейта кодеков (G.711 / Opus).",
    rfc: "RFC 2474 / RFC 4594"
  },
  {
    id: "dhcp-snooping-dai",
    term: "DHCP Snooping & DAI",
    fullName: "DHCP Snooping & Dynamic ARP Inspection",
    fullNameRu: "Защита от поддельных DHCP-серверов и атак ARP-спуфинга",
    category: "Security & VPN",
    layer: 2,
    badge: "L2 Security",
    summary: "Аппаратные механизмы безопасности коммутаторов L2, фильтрующие нелегитимные DHCP-ответы и защищающие таблицу ARP от спуфинга.",
    details: `
      Угрозы:
      1. **Rogue DHCP Server**: злоумышленник ставит поддельный DHCP-роутер и раздает клиентам свой IP в качестве шлюза (Man-in-the-Middle).
      2. **ARP Spoofing / Poisoning**: рассылка ложных ARP-ответов с чужим IP и своим MAC для перехвата трафика.
      
      Защита:
      - **DHCP Snooping**: делит порты на Trusted (подключены к легитимному DHCP/роутеру) и Untrusted (клиенты). На Untrusted портах блокируются пакеты DHCP Offer/ACK. Коммутатор формирует таблицу **DHCP Snooping Binding Database** (MAC + IP + VLAN + Port + Lease).
      - **DAI (Dynamic ARP Inspection)**: инспектирует каждый проходящий ARP-пакет и сравнивает связку IP/MAC с таблицей DHCP Snooping Binding. Несоответствующие пакеты немедленно сбрасываются.
    `,
    commands: [
      {
        os: "Cisco IOS",
        cmd: "ip dhcp snooping\nip dhcp snooping vlan 10,20\nip arp inspection vlan 10,20\ninterface Gi0/24 # аплинк к роутеру\n ip dhcp snooping trust\n ip arp inspection trust"
      }
    ],
    troubleshooting: "Хосты со статическими IP-адресами (не получающие IP по DHCP) будут заблокированы DAI! Для них необходимо создавать статические списки доступа 'ip arp inspection filter' с сопоставлением MAC/IP.",
    rfc: "Cisco Security Guide"
  },
  {
    id: "lldp-cdp",
    term: "LLDP & CDP",
    fullName: "Link Layer Discovery Protocol (802.1AB) & Cisco Discovery Protocol",
    fullNameRu: "Протоколы обнаружения соседних сетевых устройств на канальном уровне",
    category: "Switching / Diagnostics",
    layer: 2,
    badge: "Discovery",
    summary: "Протоколы L2 для автоматического обнаружения напрямую подключенных соседних маршрутизаторов, коммутаторов, серверов и IP-телефонов.",
    details: `
      Принцип работы:
      Устройства периодически (каждые 30-60 секунд) отправляют немаршрутизируемые кадры канального уровня, содержащие структуру TLV (Type-Length-Value):
      - Имя хоста (Chassis ID / System Name).
      - Имя локального порта подключения (Port ID, e.g. GigabitEthernet0/1).
      - Возможности устройства (Router, Bridge, WLAN AP, Phone).
      - IP-адрес управления (Management Address).
      - Параметры Power over Ethernet (PoE) и голосовой VLAN (Voice VLAN).
      
      Различия:
      - **CDP**: проприетарный протокол Cisco Systems (мультикаст \`01:00:0c:cc:cc:cc\`).
      - **LLDP**: открытый международный стандарт IEEE 802.1AB (мультикаст \`01:80:c2:00:00:0e\`).
      - **LLDP-MED**: расширение для оконечных устройств (IP-телефоны, Wi-Fi точки).
    `,
    commands: [
      {
        os: "Cisco IOS",
        cmd: "lldp run # глобальное включение LLDP\nshow lldp neighbors detail\nshow cdp neighbors"
      },
      {
        os: "Linux (lldpd)",
        cmd: "lldpctl # просмотр соединенных соседей коммутатора\nsystemctl enable --now lldpd"
      }
    ],
    troubleshooting: "На внешних периметровых портах, смотрящих в сторону публичных провайдеров или недоверенных пользователей, LLDP и CDP рекомендуется отключать ('no cdp enable', 'no lldp transmit') для предотвращения утечки информации о топологии.",
    rfc: "IEEE 802.1AB"
  }
];

export const COMMON_PORTS = [
  { port: 20, proto: "TCP", service: "FTP Data", description: "Передача данных по протоколу FTP" },
  { port: 21, proto: "TCP", service: "FTP Control", description: "Управление сессией протокола FTP" },
  { port: 22, proto: "TCP", service: "SSH / SFTP", description: "Защищенный терминальный доступ и передача файлов" },
  { port: 23, proto: "TCP", service: "Telnet", description: "Незащищенный текстовый терминальный доступ (L7)" },
  { port: 25, proto: "TCP", service: "SMTP", description: "Простая передача электронной почты" },
  { port: 53, proto: "UDP/TCP", service: "DNS", description: "Служба доменных имен (TCP для зон трансфера и пакетов > 512Б)" },
  { port: 67, proto: "UDP", service: "DHCP Server", description: "Серверный порт для сообщений DHCP Discover/Request" },
  { port: 68, proto: "UDP", service: "DHCP Client", description: "Клиентский порт для сообщений DHCP Offer/ACK" },
  { port: 69, proto: "UDP", service: "TFTP", description: "Тривиальный FTP для заливки прошивок и бэкапов конфигураций" },
  { port: 80, proto: "TCP", service: "HTTP", description: "Нешифрованный веб-трафик Hypertext Transfer Protocol" },
  { port: 123, proto: "UDP", service: "NTP", description: "Сетевой протокол синхронизации системного времени" },
  { port: 161, proto: "UDP", service: "SNMP Request", description: "Опрос счетчиков агента сетевого мониторинга" },
  { port: 162, proto: "UDP", service: "SNMP Trap", description: "Асинхронные аварийные оповещения от сетевых устройств" },
  { port: 179, proto: "TCP", service: "BGP-4", description: "Маршрутизация Border Gateway Protocol (пиринг)" },
  { port: 443, proto: "TCP/UDP", service: "HTTPS / QUIC", description: "Защищенный веб-трафик TLS (TCP) и HTTP/3 (UDP QUIC)" },
  { port: 500, proto: "UDP", service: "IKE (IPsec)", description: "Обмен ключами Internet Key Exchange Phase 1" },
  { port: 646, proto: "TCP/UDP", service: "LDP (MPLS)", description: "Label Distribution Protocol для распределения меток MPLS" },
  { port: 1812, proto: "UDP", service: "RADIUS Auth", description: "Сетевая аутентификация и авторизация (802.1X, Wi-Fi Enterprise)" },
  { port: 3784, proto: "UDP", service: "BFD", description: "Bidirectional Forwarding Detection (однохоповый мониторинг линка)" },
  { port: 4500, proto: "UDP", service: "IPsec NAT-T", description: "Трансляция инкапсулированного ESP трафика через NAT шлюзы" },
  { port: 4789, proto: "UDP", service: "VXLAN", description: "Туннелирование виртуальных сегментов L2 поверх L3 сетей" },
  { port: 51820, proto: "UDP", service: "WireGuard", description: "Стандартный порт криптографического VPN туннеля WireGuard" }
];

export const PROTOCOL_SIMULATIONS = {
  tcp: {
    title: "TCP 3-Way Handshake (Установление TCP-соединения)",
    description: "Наглядная пошаговая визуализация тройного рукопожатия между клиентским приложением и сервером.",
    steps: [
      {
        step: 1,
        sender: "Клиент (192.168.1.10:49210)",
        receiver: "Сервер (198.51.100.1:443)",
        packet: "SYN (Синхронизация)",
        seq: "Seq = 1000",
        ack: "Ack = 0",
        flags: "SYN",
        detail: "Клиент отправляет флаг SYN для синхронизации порядковых номеров и выделения ресурсов под сессию.",
        stateClient: "SYN-SENT (Запрос отправлен)",
        stateServer: "LISTEN (Ожидание)"
      },
      {
        step: 2,
        sender: "Сервер (198.51.100.1:443)",
        receiver: "Клиент (192.168.1.10:49210)",
        packet: "SYN-ACK (Ответ)",
        seq: "Seq = 5000",
        ack: "Ack = 1001",
        flags: "SYN, ACK",
        detail: "Сервер подтверждает получение SYN клиента (Ack = 1000 + 1) и отправляет собственный начальный номер Seq = 5000.",
        stateClient: "SYN-SENT (Запрос отправлен)",
        stateServer: "SYN-RECEIVED (Ответ отправлен)"
      },
      {
        step: 3,
        sender: "Клиент (192.168.1.10:49210)",
        receiver: "Сервер (198.51.100.1:443)",
        packet: "ACK (Подтверждение)",
        seq: "Seq = 1001",
        ack: "Ack = 5001",
        flags: "ACK",
        detail: "Клиент подтверждает получение SYN сервера (Ack = 5000 + 1). Полнодуплексный сеанс связи открыт!",
        stateClient: "ESTABLISHED (Установлено)",
        stateServer: "ESTABLISHED (Установлено)"
      }
    ]
  },
  arp: {
    title: "Разрешение ARP (Определение MAC по IP)",
    description: "Процесс сопоставления IP-адреса шлюза с его физическим MAC-адресом в локальном L2 сегменте.",
    steps: [
      {
        step: 1,
        sender: "Хост А (00:1A:2B:3C:4D:5E)",
        receiver: "Широковещательный (FF:FF:FF:FF:FF:FF)",
        packet: "ARP-запрос (Request)",
        seq: "У кого IP 192.168.1.1?",
        ack: "Сообщите 192.168.1.50",
        flags: "Broadcast (Широковещательный)",
        detail: "Хост А хочет отправить пакет на шлюз 192.168.1.1, но не знает его MAC-адрес. Он шлёт широковещательный кадр всем узлам в VLAN.",
        stateClient: "ARP-кэш: Не разрешён",
        stateServer: "Ожидание кадра"
      },
      {
        step: 2,
        sender: "Основной шлюз (AA:BB:CC:DD:EE:01)",
        receiver: "Хост А (00:1A:2B:3C:4D:5E)",
        packet: "ARP-ответ (Reply)",
        seq: "192.168.1.1 находится на",
        ack: "AA:BB:CC:DD:EE:01",
        flags: "Unicast (Адресный)",
        detail: "Шлюз распознаёт свой IP-адрес в запросе и отправляет адресный (Unicast) ответ со своим MAC-адресом хосту А.",
        stateClient: "ARP-кэш: Разрешён!",
        stateServer: "Запись добавлена"
      }
    ]
  },
  dns: {
    title: "Рекурсивный DNS-запрос (Поиск example.com)",
    description: "Пошаговый поиск IP-адреса домена через иерархию DNS-серверов интернета.",
    steps: [
      {
        step: 1,
        sender: "Клиентский резолвер",
        receiver: "Рекурсивный DNS (8.8.8.8)",
        packet: "DNS-запрос (A example.com)",
        seq: "ID: 0x4B2A",
        ack: "Флаги: RD (Требуется рекурсия)",
        flags: "UDP 53",
        detail: "Браузер обращается к локальному резолверу провайдера с просьбой найти IP-адрес для домена example.com.",
        stateClient: "Отправка запроса...",
        stateServer: "Проверка кэша"
      },
      {
        step: 2,
        sender: "Рекурсивный DNS (8.8.8.8)",
        receiver: "Корневой сервер (.)",
        packet: "Перенаправление на TLD (.com)",
        seq: "ID: 0x91F0",
        ack: "NS: a.gtld-servers.net",
        flags: "Итеративный запрос",
        detail: "Кэш пуст. Резолвер опрашивает корневой DNS-сервер интернета и получает ссылку на серверы зоны .com.",
        stateClient: "Ожидание ответа...",
        stateServer: "Запрос к TLD"
      },
      {
        step: 3,
        sender: "Рекурсивный DNS (8.8.8.8)",
        receiver: "Авторитативный DNS (ns1.example.com)",
        packet: "Ответ с A-записью",
        seq: "ID: 0x7E12",
        ack: "example.com -> 93.184.216.34",
        flags: "TTL 300 с",
        detail: "Авторитативный сервер домена отдаёт финальный IP-адрес с указанием времени кэширования (TTL).",
        stateClient: "IP-адрес получен!",
        stateServer: "Сохранено в кэше"
      }
    ]
  }
};
