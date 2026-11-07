import { statfs } from 'node:fs/promises'
import os from 'node:os'

const categories = ['os', 'cpu', 'memory', 'disk', 'network'] as const

export type SystemInfoCategory = typeof categories[number]

export function isSystemInfoCategory(value: string): value is SystemInfoCategory | 'all' {
  return value === 'all' || categories.includes(value as SystemInfoCategory)
}

function toGiB(bytes: number) {
  return Math.round((bytes / 1024 ** 3) * 100) / 100
}

function getOsInfo() {
  return {
    hostname: os.hostname(),
    type: os.type(),
    platform: os.platform(),
    release: os.release(),
    version: os.version(),
    architecture: os.arch(),
    uptimeSeconds: Math.floor(os.uptime()),
  }
}

function getCpuInfo() {
  const cpus = os.cpus()
  return {
    model: cpus[0]?.model ?? null,
    logicalCores: cpus.length,
    loadAverage: os.platform() === 'win32' ? null : os.loadavg(),
  }
}

function getMemoryInfo() {
  const totalBytes = os.totalmem()
  const availableBytes = os.freemem()
  const usedBytes = totalBytes - availableBytes
  return {
    totalBytes,
    availableBytes,
    usedBytes,
    usedPercent: totalBytes ? Math.round((usedBytes / totalBytes) * 1000) / 10 : 0,
    totalGiB: toGiB(totalBytes),
    availableGiB: toGiB(availableBytes),
  }
}

async function getDiskInfo() {
  const path = process.cwd()
  try {
    const filesystem = await statfs(path)
    const totalBytes = filesystem.blocks * filesystem.bsize
    const availableBytes = filesystem.bavail * filesystem.bsize
    const usedBytes = totalBytes - availableBytes
    return {
      path,
      totalBytes,
      availableBytes,
      usedBytes,
      usedPercent: totalBytes ? Math.round((usedBytes / totalBytes) * 1000) / 10 : 0,
      totalGiB: toGiB(totalBytes),
      availableGiB: toGiB(availableBytes),
    }
  }
  catch {
    return { path, available: false }
  }
}

function getNetworkInfo() {
  return {
    interfaces: Object.entries(os.networkInterfaces()).flatMap(([name, addresses]) =>
      (addresses ?? []).map(({ address, netmask, family, cidr, internal }) => ({
        name,
        address,
        netmask,
        family,
        cidr,
        internal,
      })),
    ),
    internetConnectivityTested: false,
  }
}

export async function getSystemInfo(category: SystemInfoCategory | 'all') {
  if (category === 'all') {
    return {
      os: getOsInfo(),
      cpu: getCpuInfo(),
      memory: getMemoryInfo(),
      disk: await getDiskInfo(),
      network: getNetworkInfo(),
    }
  }

  switch (category) {
    case 'os': return getOsInfo()
    case 'cpu': return getCpuInfo()
    case 'memory': return getMemoryInfo()
    case 'disk': return getDiskInfo()
    case 'network': return getNetworkInfo()
  }
}
