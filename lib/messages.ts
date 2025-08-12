export type AnyDict = Record<string, any>;

export async function loadNamespace(locale: string, namespace: string): Promise<AnyDict> {
  const l = (locale || 'zh').toLowerCase();
  try {
    switch (l) {
      case 'en':
        return (await import(`@/messages/en/${namespace}.json`)).default as AnyDict;
      case 'zh':
      default:
        return (await import(`@/messages/zh/${namespace}.json`)).default as AnyDict;
    }
  } catch {
    return {} as AnyDict;
  }
}

export async function loadBase(locale: string): Promise<AnyDict> {
  const l = (locale || 'zh').toLowerCase();
  try {
    switch (l) {
      case 'en':
        return (await import('@/messages/en.json')).default as AnyDict;
      case 'zh':
      default:
        return (await import('@/messages/zh.json')).default as AnyDict;
    }
  } catch {
    return {} as AnyDict;
  }
}
