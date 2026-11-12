import assert from 'node:assert/strict';
import test from 'node:test';
import { auctionContext, auctionState, replaceCall, seats, side, strain } from '../src/auction.js';
import { ccba } from '../src/ccba.js';

const game = (path, options = {}) => ({dealer:'N',calls:path.split(' ').filter(Boolean),...options});
const meanings = (path, call, options) => ccba.rulesFor(game(path,options)).filter(rule=>rule.call===call);

test('minor opening, major raise and inquiry work from each dealer and in review', ()=>{
  const prefix = '1C P 1H P 2H P';
  for (const dealer of seats) {
    const current = meanings(prefix,'3H',{dealer});
    assert.equal(current[0].text.zh,'五张红心、邀请进局。');
    const completed = game(prefix+' 3H P P P',{dealer});
    const index = completed.calls.indexOf('3H');
    assert.deepEqual(ccba.rulesFor({...completed,calls:completed.calls.slice(0,index)}).filter(rule=>rule.call==='3H'),current);
    assert.ok(ccba.analyze(game(prefix+' 2NT P',{dealer})).forcing);
    assert.ok(auctionState(dealer,game(prefix+' 2NT P').calls).legal.includes('P'));
  }
});

test('interference changes meanings and does not revive an earlier branch', ()=>{
  const {dealer,calls} = game('1H P P 1S');
  const context = auctionContext(dealer,calls);
  assert.equal(context.role,'opener');
  assert.equal(context.opposition.at(-1).call,'1S');
  assert.ok(auctionState(dealer,calls).legal.includes('2H'));
  assert.deepEqual(ccba.rulesFor({dealer,calls}),[]);
  assert.equal(meanings('1C P 1H 1S','X')[0].name.en,'Support double');
  assert.equal(meanings('1C P 1H X','XX')[0].name.en,'Support redouble');
  assert.equal(meanings('1H P 2H 3S','X')[0].name.en,'Invitational double');
  assert.equal(meanings('1H P 2C 2S','P')[0].name.en,'Forcing pass');
  assert.equal(meanings('1C P 1H P 2H X','3H').length,0);
  assert.equal(meanings('1C P 1H P 1S P 2D P 2H P','3H').length,0);
  assert.equal(meanings('1H P 2H P','3C').length,2);
  assert.deepEqual(replaceCall('N',game('1C P 1H P 2H P 3H').calls,5,'3S'),game('1C P 1H P 2H 3S').calls);
});

test('passed-hand, balancing and established convention conditions stay distinct', ()=>{
  assert.equal(meanings('P P 1H P','2C')[0].name.en,'Reverse Drury');
  assert.equal(meanings('P P P 1S P','2C')[0].name.en,'Reverse Drury');
  assert.equal(meanings('1H P','2C')[0].name.en,'Two-over-one game force');
  assert.match(meanings('P 1H','1NT')[0].text.en,/Direct seat/);
  assert.match(meanings('P 1H P P','1NT')[0].text.en,/Balancing seat/);
  assert.equal(meanings('P 1H P P 1NT P','2C')[0].name.en,'Stayman');
  assert.equal(meanings('1H P P 2NT P','3C')[0].name.en,'Stayman');
  assert.equal(meanings('2NT P','3C')[0].name.en,'Puppet Stayman');
  assert.equal(meanings('P P 2C P 2D P 2NT P','3C')[0].name.en,'Puppet Stayman');
  assert.equal(meanings('2H P','2NT')[0].name.en,'Ogust inquiry');
  assert.equal(meanings('2H P 2NT P','3C')[0].name.en,'Ogust reply');
  assert.equal(meanings('2H P 2NT P','3C',{vulnerability:'ns'})[0].name.en,'Shortness reply');
  assert.equal(meanings('3NT P 4D P','4H')[0].name.en,'Shows a singleton');
  assert.equal(meanings('1C P 1H P 2H P 4NT P','5C')[0].name.en,'RKCB reply');
  assert.equal(meanings('1NT P 4NT P','5C').length,0);
});

test('a three-level preempt keeps the entire legal grid available until the auction ends', ()=>{
  const {dealer,calls} = game('3D P');
  assert.deepEqual(ccba.rulesFor({dealer,calls}),[]);
  assert.equal(auctionContext(dealer,calls).role,'responder');
  for (const call of ['P','3H','3S','3NT','4D']) assert.ok(auctionState(dealer,calls).legal.includes(call));
  const ended = auctionState(dealer,[...calls,'P','P']);
  assert.equal(ended.done,true);
  assert.deepEqual(ended.legal,[]);
});

test('the legal library examples resolve at every compass rotation', ()=>{
  for (const entry of ccba.library.filter(entry=>entry.group!=='slam')) {
    const calls = entry.condition==='passedResponder' ? ['P','P',...entry.seq] : entry.seq;
    const vulnerability = entry.condition==='sideVulnerable' ? 'both' : 'none';
    for (const dealer of seats) {
      const rules = ccba.rulesFor({dealer,calls,vulnerability});
      for (const rule of entry.rules) {
        assert.ok(rules.some(match=>match.call===rule.call && match.name.en===rule.name.en && match.text.en===rule.text.en),
          [dealer,calls.join(' '),rule.call,rule.name.en].join(' / '));
      }
    }
  }
});

const practiceAuctions = [
  '1C P 1H P 2H P 3H P P P', '1D P 1S P 2S P 2NT P 3C P 4S P P P',
  '1H P P 1S 2H P P P', '1H P 1S X XX P 2S P P P', '1S P 2S P 3C P 4S P P P',
  'P P 1H P 2C P 2D P 2H P P P', '1D P 2C 2H X P P P',
  '1NT P 2D P 2H P 4H P P P', '1NT 2D 2NT P 3C P P P', '1S P P 1NT P 2C P 2D P 3NT P P P',
  '2D P 2NT P 3C P 3D P P P', '2C P 2D P 2NT P 3C P 3D P 3NT P P P', '2NT P 3D P 3H P 3NT P P P',
  '3D P P P', '3D P 3H P 4D P P P', '4H P P X P P P', '3NT P 4D P 4H P 5C P P P',
];

function openingCategory(opening) {
  if (!opening) return 'before opening';
  const call = opening.call;
  if (call==='2C') return 'strong 2C';
  if (call==='3NT') return 'gambling 3NT';
  if (strain(call)==='NT') return 'natural NT';
  if (call[0]==='2') return 'weak two';
  if (Number(call[0])>=3) return 'high preempt';
  return ['H','S'].includes(strain(call)) ? 'one major' : 'one minor';
}

test('practice auctions report coverage and every unfinished turn has legal calls', ()=>{
  const coverage = new Map();
  for (const path of practiceAuctions) {
    const {dealer,calls} = game(path);
    for (const [index,call] of calls.entries()) {
      const prefix = calls.slice(0,index);
      const {done,legal} = auctionState(dealer,prefix);
      assert.ok(!done && legal.includes(call), path+' / call '+(index+1));
      const {opening,actions} = auctionContext(dealer,prefix);
      const competition = opening && actions.some(action=>side(action.seat)!==side(opening.seat));
      const round = opening ? 1+Math.floor((index-opening.index)/4) : 1;
      const label = [openingCategory(opening), round, competition ? 'competitive' : 'quiet'].join(' / ');
      const rules = new Set(ccba.rulesFor({dealer,calls:prefix}).map(rule=>rule.call));
      const row = coverage.get(label) ?? {turns:0,explained:0,legalUnrecorded:0};
      row.turns++;
      if (rules.size) row.explained++;
      row.legalUnrecorded += legal.filter(legalCall=>!rules.has(legalCall)).length;
      coverage.set(label,row);
    }
    assert.equal(auctionState(dealer,calls).done,true,path);
  }
  const total = {turns:0,explained:0,legalUnrecorded:0};
  for (const row of coverage.values()) {
    total.turns += row.turns;
    total.explained += row.explained;
    total.legalUnrecorded += row.legalUnrecorded;
  }
  console.table({...Object.fromEntries(coverage),total});
});
