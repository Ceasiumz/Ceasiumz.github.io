import { auctionState, seats } from './auction.js';

export const storageKeys = {
  consent: 'alpha-bridge.consent.v1',
  data: 'alpha-bridge.data.v1',
  legacy: 'alpha-bridge.preferences.v1',
};
export const vulnerabilities = ['none', 'ns', 'ew', 'both'];
export const tableDefaults = { dealer: 'S', player: 'S', vulnerability: 'none' };

function readPreferences(value, defaults, systemIds) {
  return {
    lang: value?.lang === 'en' ? 'en' : defaults.lang,
    system: systemIds.includes(value?.system) ? value.system : defaults.system,
    skipRecall: value?.skipRecall === true,
    skipSpecial: value?.skipSpecial === true,
  };
}

function readGame(value, systemIds) {
  if (typeof value?.id !== 'string' || !value.id || !systemIds.includes(value.system) ||
      !seats.includes(value.dealer) || !seats.includes(value.player) ||
      !vulnerabilities.includes(value.vulnerability) || !Array.isArray(value.calls) ||
      !Number.isFinite(value.updatedAt) || !Number.isFinite(new Date(value.updatedAt).getTime())) return null;
  const calls = [];
  for (const call of value.calls) {
    if (!auctionState(value.dealer, calls).legal.includes(call)) break;
    calls.push(call);
  }
  if (!calls.length) return null;
  return {
    id: value.id, system: value.system, dealer: value.dealer, player: value.player,
    vulnerability: value.vulnerability, updatedAt: value.updatedAt, calls,
  };
}

export function loadCache(storage, defaults, systemIds) {
  const initial = { consent: null, data: { settings: defaults, games: [], activeId: null } };
  try {
    const choice = storage().getItem(storageKeys.consent);
    if (choice === 'denied') return { ...initial, consent: choice };
    if (choice !== 'allowed') return initial;
    try {
      const saved = JSON.parse(storage().getItem(storageKeys.data));
      const games = Array.isArray(saved?.games) ? saved.games.map(game=>readGame(game, systemIds)).filter(Boolean) : [];
      const unique = [...new Map(games.map(game=>[game.id, game])).values()];
      const activeId = unique.some(game=>game.id===saved?.activeId) ? saved.activeId : null;
      return { consent: choice, data: { settings: readPreferences(saved?.settings, defaults, systemIds), games: unique, activeId } };
    } catch { return { ...initial, consent: choice }; }
  } catch { return initial; }
}

export function saveCache(storage, consent, data) {
  if (!consent) return;
  const browserStorage = storage();
  if (consent === 'allowed') {
    const games = data.games.filter(game=>game.calls.length);
    browserStorage.setItem(storageKeys.data, JSON.stringify({ ...data, games }));
  }
  else browserStorage.removeItem(storageKeys.data);
  browserStorage.removeItem(storageKeys.legacy);
  if (browserStorage.getItem(storageKeys.consent)!==consent) browserStorage.setItem(storageKeys.consent, consent);
}

export function readLegacyPreferences(storage, defaults, systemIds) {
  try { return readPreferences(JSON.parse(storage().getItem(storageKeys.legacy)), defaults, systemIds); }
  catch { return defaults; }
}

export function saveGame(data, game) {
  const otherGames = data.games.filter(item=>item.id!==game.id && item.calls.length);
  return { ...data, activeId: game.id, games: [game, ...otherGames] };
}
