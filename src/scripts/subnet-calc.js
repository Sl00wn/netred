// ============================================================================
// CYBERNET CIDR & SUBNET CALCULATOR ENGINE
// ============================================================================

export class SubnetCalculator {
  static parseIPv4(ipStr) {
    const parts = ipStr.trim().split('.');
    if (parts.length !== 4) return null;
    const octets = [];
    for (let part of parts) {
      if (!/^\d+$/.test(part)) return null;
      const num = parseInt(part, 10);
      if (num < 0 || num > 255) return null;
      octets.push(num);
    }
    return (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
  }

  static intToIPv4(intVal) {
    return [
      (intVal >>> 24) & 255,
      (intVal >>> 16) & 255,
      (intVal >>> 8) & 255,
      intVal & 255
    ].join('.');
  }

  static intToBinary(intVal) {
    const binary = (intVal >>> 0).toString(2).padStart(32, '0');
    return [
      binary.slice(0, 8),
      binary.slice(8, 16),
      binary.slice(16, 24),
      binary.slice(24, 32)
    ].join('.');
  }

  static intToHex(intVal) {
    return '0x' + (intVal >>> 0).toString(16).toUpperCase().padStart(8, '0');
  }

  static getMaskFromCIDR(cidr) {
    if (cidr === 0) return 0;
    return ((0xFFFFFFFF << (32 - cidr)) & 0xFFFFFFFF) >>> 0;
  }

  static getScope(ipInt) {
    const b1 = (ipInt >>> 24) & 255;
    const b2 = (ipInt >>> 16) & 255;

    // Loopback 127.0.0.0/8
    if (b1 === 127) return { type: "Петлевой интерфейс (Loopback)", color: "#f59e0b" };
    // Private RFC 1918
    if (b1 === 10) return { type: "Частный / локальный (RFC 1918 Класс A)", color: "#10b981" };
    if (b1 === 172 && (b2 >= 16 && b2 <= 31)) return { type: "Частный / локальный (RFC 1918 Класс B)", color: "#10b981" };
    if (b1 === 192 && b2 === 168) return { type: "Частный / локальный (RFC 1918 Класс C)", color: "#10b981" };
    // CGNAT RFC 6598: 100.64.0.0/10
    if (b1 === 100 && (b2 >= 64 && b2 <= 127)) return { type: "Провайдерский NAT / CGNAT (RFC 6598)", color: "#a855f7" };
    // Link-Local APIPA 169.254.0.0/16
    if (b1 === 169 && b2 === 254) return { type: "Локальный адрес линка (Link-Local / APIPA)", color: "#ef4444" };
    // Multicast 224.0.0.0/4
    if (b1 >= 224 && b1 <= 239) return { type: "Групповой / Multicast (Класс D)", color: "#ec4899" };
    // Experimental 240.0.0.0/4
    if (b1 >= 240) return { type: "Зарезервированный / Экспериментальный", color: "#64748b" };

    return { type: "Публичный интернет-адрес (Public IP)", color: "#0ea5e9" };
  }

  static calculate(inputStr, prefix = 24) {
    let cleanIp = inputStr.trim();
    let cidr = parseInt(prefix, 10);

    // If string contains CIDR notation (e.g. 192.168.1.1/28)
    if (cleanIp.includes('/')) {
      const slashParts = cleanIp.split('/');
      cleanIp = slashParts[0].trim();
      const parsedCidr = parseInt(slashParts[1].trim(), 10);
      if (!isNaN(parsedCidr) && parsedCidr >= 0 && parsedCidr <= 32) {
        cidr = parsedCidr;
      }
    }

    const ipInt = this.parseIPv4(cleanIp);
    if (ipInt === null) {
      return { error: "Некорректный IPv4-адрес. Введите адрес в формате X.X.X.X (0-255)." };
    }

    if (isNaN(cidr) || cidr < 0 || cidr > 32) {
      return { error: "Некорректная маска. CIDR должен быть в диапазоне от /0 до /32." };
    }

    const maskInt = this.getMaskFromCIDR(cidr);
    const wildcardInt = (~maskInt) >>> 0;
    const networkInt = (ipInt & maskInt) >>> 0;
    const broadcastInt = (networkInt | wildcardInt) >>> 0;

    let totalHosts = Math.pow(2, 32 - cidr);
    let usableHosts = 0;
    let firstUsableInt = 0;
    let lastUsableInt = 0;

    if (cidr === 32) {
      usableHosts = 1;
      firstUsableInt = ipInt;
      lastUsableInt = ipInt;
    } else if (cidr === 31) {
      // RFC 3021 Point-to-Point links
      usableHosts = 2;
      firstUsableInt = networkInt;
      lastUsableInt = broadcastInt;
    } else {
      usableHosts = Math.max(0, totalHosts - 2);
      firstUsableInt = networkInt + 1;
      lastUsableInt = broadcastInt - 1;
    }

    const scope = this.getScope(ipInt);

    // Subnet division (/cidr + 1)
    const subnets = [];
    if (cidr < 31) {
      const nextCidr = cidr + 1;
      const sub1Net = networkInt;
      const sub2Net = (networkInt + (totalHosts / 2)) >>> 0;
      subnets.push(
        `${this.intToIPv4(sub1Net)}/${nextCidr}`,
        `${this.intToIPv4(sub2Net)}/${nextCidr}`
      );
    }

    return {
      ip: this.intToIPv4(ipInt),
      cidr,
      netmask: this.intToIPv4(maskInt),
      wildcard: this.intToIPv4(wildcardInt),
      network: this.intToIPv4(networkInt),
      broadcast: cidr >= 31 ? "Не применимо (RFC 3021)" : this.intToIPv4(broadcastInt),
      firstUsable: this.intToIPv4(firstUsableInt),
      lastUsable: this.intToIPv4(lastUsableInt),
      usableRange: `${this.intToIPv4(firstUsableInt)} — ${this.intToIPv4(lastUsableInt)}`,
      totalHosts: totalHosts.toLocaleString(),
      usableHosts: usableHosts.toLocaleString(),
      scope: scope.type,
      scopeColor: scope.color,
      binaryIp: this.intToBinary(ipInt),
      binaryMask: this.intToBinary(maskInt),
      hexIp: this.intToHex(ipInt),
      subnets
    };
  }
}
