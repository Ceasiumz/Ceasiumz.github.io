export const strains = ['C', 'D', 'H', 'S', 'NT'];
export const suits = { C: '♣', D: '♦', H: '♥', S: '♠', NT: 'NT' };
export const seats = ['N', 'E', 'S', 'W'];
export const bids = Array.from({ length: 7 }, (_, i) => strains.map(s => (i + 1) + s)).flat();
export const strain = call => call?.slice(1);
export const bidLabel = call => bids.includes(call) ? call[0] + suits[strain(call)] : { P: 'Pass', X: '×', XX: '××' }[call];
export const side = seat => seats.indexOf(seat) % 2;
export const seatAt = (dealer, turn) => seats[(seats.indexOf(dealer) + turn) % 4];

export function auctionState(dealer, calls) {
  let contract;
  let multiplier = 1;
  let passes = 0;
  for (const [index, call] of calls.entries()) {
    if (call === 'P') {
      passes++;
      continue;
    }
    passes = 0;
    if (call === 'X') multiplier = 2;
    else if (call === 'XX') multiplier = 4;
    else {
      contract = { call, index, seat: seatAt(dealer, index) };
      multiplier = 1;
    }
  }
  const seat = seatAt(dealer, calls.length);
  const done = passes >= (contract ? 3 : 4);
  const legal = done ? [] : ['P', ...bids.slice(contract ? bids.indexOf(contract.call) + 1 : 0)];
  if (!done && contract) {
    const sameSide = side(seat) === side(contract.seat);
    if (multiplier === 1 && !sameSide) legal.push('X');
    if (multiplier === 2 && sameSide) legal.push('XX');
  }
  const declarer = contract && seatAt(dealer, calls.findIndex((call, i) =>
    bids.includes(call) && strain(call) === strain(contract.call) && side(seatAt(dealer, i)) === side(contract.seat)));
  return { seat, done, legal, contract, declarer, multiplier };
}

export function replaceCall(dealer, calls, index, replacement) {
  const prefix = calls.slice(0, index);
  if (!auctionState(dealer, prefix).legal.includes(replacement)) return calls;
  const updated = [...prefix, replacement];
  for (const call of calls.slice(index + 1)) {
    if (!auctionState(dealer, updated).legal.includes(call)) break;
    updated.push(call);
  }
  return updated;
}
