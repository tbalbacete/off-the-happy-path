import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import {
  otherTheme,
  parseStoredTheme,
  readStoredTheme,
  resolveTheme,
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
  themeHeadScript,
  writeStoredTheme,
  type ThemeStorage,
} from '../src/lib/theme';

const junk = [null, undefined, '', 'Dark', 'DARK', ' dark', 'system', 'auto', '1', 1, true, {}];

function memoryStorage(initial: Record<string, string> = {}): ThemeStorage & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
  };
}

const blocked = (): ThemeStorage => {
  throw new DOMException('The operation is insecure.', 'SecurityError');
};
const throwingMethods: ThemeStorage = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
};

describe('parseStoredTheme', () => {
  it('accepts light and dark', () => {
    expect(parseStoredTheme('light')).toBe('light');
    expect(parseStoredTheme('dark')).toBe('dark');
  });
  for (const value of junk) {
    it(`treats ${JSON.stringify(value)} as no choice`, () => {
      expect(parseStoredTheme(value)).toBeNull();
    });
  }
});

describe('resolveTheme', () => {
  it('follows the system with no stored choice', () => {
    expect(resolveTheme(null, false)).toBe('light');
    expect(resolveTheme(null, true)).toBe('dark');
  });
  it('prefers the stored choice either way', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('light', false)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('dark', true)).toBe('dark');
  });
});

describe('otherTheme', () => {
  it('flips', () => {
    expect(otherTheme('light')).toBe('dark');
    expect(otherTheme('dark')).toBe('light');
  });
});

describe('readStoredTheme and writeStoredTheme', () => {
  it('round-trips a choice under the one key', () => {
    const s = memoryStorage();
    expect(readStoredTheme(() => s)).toBeNull();
    expect(writeStoredTheme(() => s, 'dark')).toBe(true);
    expect(s.data).toEqual({ [THEME_STORAGE_KEY]: 'dark' });
    expect(readStoredTheme(() => s)).toBe('dark');
  });
  it('ignores a junk stored value', () => {
    expect(readStoredTheme(() => memoryStorage({ [THEME_STORAGE_KEY]: 'sepia' }))).toBeNull();
  });
  it('survives blocked storage', () => {
    expect(readStoredTheme(blocked)).toBeNull();
    expect(writeStoredTheme(blocked, 'dark')).toBe(false);
    expect(readStoredTheme(() => throwingMethods)).toBeNull();
    expect(writeStoredTheme(() => throwingMethods, 'light')).toBe(false);
  });
});

/** Run the head script with a stub `localStorage` and `document`. */
function runHeadScript(localStorage: ThemeStorage | 'blocked'): Record<string, string> {
  const attrs: Record<string, string> = {};
  const context: Record<string, unknown> = {
    document: { documentElement: { setAttribute: (k: string, v: string) => (attrs[k] = v) } },
  };
  if (localStorage === 'blocked') {
    Object.defineProperty(context, 'localStorage', {
      get() {
        throw new Error('SecurityError');
      },
    });
  } else {
    context.localStorage = localStorage;
  }
  runInNewContext(themeHeadScript, context);
  return attrs;
}

describe('themeHeadScript', () => {
  it('sets the attribute for a stored choice', () => {
    expect(runHeadScript(memoryStorage({ [THEME_STORAGE_KEY]: 'dark' }))).toEqual({ [THEME_ATTRIBUTE]: 'dark' });
    expect(runHeadScript(memoryStorage({ [THEME_STORAGE_KEY]: 'light' }))).toEqual({ [THEME_ATTRIBUTE]: 'light' });
  });
  it('does what readStoredTheme does for every value', () => {
    for (const value of ['light', 'dark', ...junk]) {
      const s = memoryStorage(typeof value === 'string' ? { [THEME_STORAGE_KEY]: value } : {});
      const expected = readStoredTheme(() => s);
      expect(runHeadScript(s)).toEqual(expected ? { [THEME_ATTRIBUTE]: expected } : {});
    }
  });
  it('does nothing and throws nothing when storage is blocked', () => {
    expect(runHeadScript('blocked')).toEqual({});
    expect(runHeadScript(throwingMethods)).toEqual({});
  });
  it('is small', () => {
    expect(themeHeadScript.length).toBeLessThan(300);
  });
});
