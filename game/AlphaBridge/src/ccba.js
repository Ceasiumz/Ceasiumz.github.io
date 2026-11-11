import { bids, seatAt, side, strain, bidLabel } from './auction.js';

const both = (zh, en) => ({ zh, en });
const opening = (call, zh, en, detailZh, detailEn, page, range, shape, special = false) =>
  ({ call, name: both(zh, en), text: both(detailZh, detailEn), page, range, shape, special });
const minors = ['C', 'D'];
const majors = ['H', 'S'];
const colors = [...minors, ...majors];
const span = (min, max = 37) => [min, max];
const openingRules = [
  ...minors.map(s => opening('1' + s, '自然低花', 'Natural minor',
    s === 'C' ? '12–21 大牌点，至少 3 张梅花。两门低花各 3 张时通常开 1♣。' : '12–21 大牌点，至少 3 张方片。两门低花各 4 张时通常开 1♦。',
    s === 'C' ? '12–21 HCP, 3+ clubs. Usually open 1♣ with 3–3 minors.' : '12–21 HCP, 3+ diamonds. Usually open 1♦ with 4–4 minors.',
    1, span(12, 21), 'minor')),
  ...majors.map(s => opening('1' + s, '自然高花', 'Natural major',
    '11–21 大牌点，所叫花色至少 5 张。第三家允许轻开叫。',
    '11–21 HCP, 5+ cards in the suit. Light openings are allowed in third seat.', 10, span(11, 21), 'major')),
  opening('1NT', '均型无将', 'Balanced notrump',
    '15–17 大牌点。允许五张高花、六张低花，或五张低花的 5–4–2–2。',
    '15–17 HCP. May include a five-card major, six-card minor, or a 5–4–2–2 with a five-card minor.', 18, span(15, 17), 'balanced'),
  opening('2C', '强牌开叫', 'Strong artificial opening',
    '均型 22+ 点。非均型至少 3 个防守速胜墩：高花单套 9+ 赢墩，低花单套 10+ 赢墩，均需 18+ 大牌点；5–5 以上双套需 20+ 大牌点。',
    '22+ HCP balanced. For unbalanced hands, 3+ quick defensive tricks. With 18+ HCP, 9+ playing tricks in a major or 10+ in a minor. With 5–5 or longer suits, 20+ HCP.',
    24, span(18), 'strong'),
  ...['D','H','S'].map(s => opening('2' + s, '弱二阻击', 'Weak two',
    '第一至第三家 6–10 点、6 张以上套，套越长可酌情降点。第四家 9–12 点，6 张以上好套。',
    '6–10 HCP and a 6+ card suit in seats 1–3. Extra length can justify fewer points. Fourth seat shows 9–12 HCP and a good 6+ card suit.',
    25, span(6, 12), s === 'D' ? 'minor' : 'major')),
  opening('2NT', '强均型无将', 'Strong balanced notrump',
    '20–21 点，有五张套时可低至 19 点。允许五张高花、六张低花和 5–4–2–2。',
    '20–21 HCP, or 19 with a five-card suit. Allows five-card majors, six-card minors and 5–4–2–2 shapes.',
    25, span(19, 21), 'balanced'),
  ...[3,4].flatMap(n => colors.map(s => opening(n + s, '高阶阻击', 'Preempt',
    '5–10 点，' + (n === 3 ? '通常七张套' : '至少七张套') + '，满足二三法则。',
    '5–10 HCP, ' + (n === 3 ? 'usually seven cards' : 'at least seven cards') + ' in the suit, following the rule of two and three.',
    27, span(5, 10), majors.includes(s) ? 'major' : 'minor'))),
  opening('3NT', '赌博性无将', 'Gambling notrump',
    'AKQ 领头的 7–8 张坚固低花套。边花无 A 或 K，至多一个 Q。',
    'A solid seven- or eight-card minor headed by AKQ. No side ace or king and at most one outside queen.',
    27, null, 'minor', true),
];

const situations = [];
// A sequence is relative to its first non-pass call. Quiet auctions insert a pass between every bid.
function add(path, page, rows, { competitive = false, when, group = 'responses' } = {}) {
  const seq = competitive ? path.split(' ') : path.split(' ').flatMap(call => [call, 'P']);
  const rules = rows.flatMap(([calls, zh, en, detailZh, detailEn, range, shape, special]) =>
    calls.split('/').map(call => ({
      call, name: both(zh, en), text: both(detailZh, detailEn), page, range, shape, special,
    })));
  situations.push({ seq, page, rules, when, group });
}
const transfer = (call, target, level, texas = false) => [
  call, texas ? '德克萨斯转移' : '转移叫', texas ? 'Texas transfer' : 'Transfer',
  '表示 ' + (texas ? '6+' : '5+') + ' 张' + { D:'方片', H:'红心', S:'黑桃' }[target] + '，要求转移至 ' + bidLabel(level + target) + '。',
  'Shows ' + (texas ? '6+' : '5+') + ' ' + { D:'diamonds', H:'hearts', S:'spades' }[target] + ' and asks opener to bid ' + bidLabel(level + target) + '.',
  null, target==='D'?'minor':'major',
];
const signoff = (calls, zh = '自然进局止叫。', en = 'Natural game sign-off.') =>
  [calls, '进局止叫', 'Game sign-off', zh, en];
const relay = (calls, target, zh = '接力应答', en = 'Forced relay') =>
  [calls, zh, en, '按约定叫至 ' + bidLabel(target) + '。', 'Bid ' + bidLabel(target) + ' as requested.'];
const natural = (calls, zh, en, range, shape) => [calls, '自然叫', 'Natural', zh, en, range, shape];

for (const s of minors) {
  add('1' + s, 1, [
    ...(s === 'C' ? [['1D','Walsh 应叫','Walsh response','5+ 点、4+ 张方片。非逼局实力时优先叫四张高花。','5+ HCP and 4+ diamonds. With less than game-forcing strength, show a four-card major first.',span(5),'minor']] : [
      ['2C','二盖一逼局','Two-over-one game force','自然梅花套，逼叫到局。','Natural club suit, game-forcing.',null,'minor'],
      ['3C','邀请','Invitational','9–11 点，6+ 张好梅花套。','9–11 HCP and a good 6+ card club suit.',span(9,11),'minor']]),
    natural('1H/1S','5+ 点、4+ 张高花。双高 4–4 先叫 1♥，5–5 先叫 1♠。','5+ HCP and 4+ cards in the major. With both majors, bid hearts with 4–4 and spades with 5–5.',span(5),'major'),
    natural('1NT','6–10 点，无四张高花。','6–10 HCP, no four-card major.',span(6,10),'balanced'),
    ['2'+s,'低花反加叫','Inverted minor raise','10+ 点，通常 5+ 支持，逼叫至三阶原低花。非逼局牌优先应叫四张高花；逼局牌可仅 4 张支持。','10+ HCP, usually 5+ support, forcing to three of the minor. Show a four-card major first with non-GF hands. GF hands may have only four-card support.',span(10),'fit'],
    ...(s === 'C' ? [['2D/2H/2S','弱跳新花','Weak jump shift','4–6 点，6+ 张所叫套。','4–6 HCP, 6+ cards in the suit.',span(4,6)]] : []),
    ['2NT','均型邀请','Balanced invitation','好 11 至差 13 点，均型，无四张高花。','Good 11 to poor 13 HCP, balanced, no four-card major.',span(11,13),'balanced'],
    ['3'+s,'阻击性加叫','Preemptive raise','8 点以下或 8 点，5+ 张支持。','Up to 8 HCP with 5+ support.',span(0,8),'fit'],
    ['3H/3S'+(s==='C'?'/3D':''),'爆裂叫','Splinter','12+ 点，5+ 张低花支持，所叫单缺，无四张高花。','12+ HCP, 5+ minor support, shortage in the bid suit, no four-card major.',span(12),'fit',true],
    signoff('3NT','13–15 点均型，无四张高花，无弱双张。','13–15 HCP balanced, no four-card major or weak doubleton.'),
  ]);
  for (const m of majors) {
    add('1'+s+' 1'+m, 2, [
      ...(m==='H' ? [natural('1S','四张黑桃。','Four spades.',null,'major')] : []),
      natural('1NT', '均型；1♥ 应叫后否认四张黑桃。也可为 3–1–4–5。', 'Balanced; denies four spades after a 1♥ response. May also be 3–1–4–5.',span(12,14),'balanced'),
      natural('2'+s,'12–15 点，重叫六张套。','12–15 HCP, rebidding a six-card suit.',span(12,15),'minor'),
      natural('3'+s,'15–17 点，6+ 张好套。','15–17 HCP, a good 6+ card suit.',span(15,17),'minor'),
      natural('2NT','18–19 点，相对均型。','18–19 HCP, relatively balanced.',span(18,19),'balanced'),
      ['2'+m,'简单加叫','Single raise','12–14 点，通常 4 张支持，低限 5–4–3–1 可三张加叫。','12–14 HCP, usually four-card support. A minimum 5–4–3–1 may raise with three.',span(12,14),'fit'],
      ['3'+m,'邀请加叫','Invitational raise','好 15 至差 17 点，4 张支持。','Good 15 to poor 17 HCP, four-card support.',span(15,17),'fit'],
      signoff('4'+m,'18–19 点，均型，四张支持。','18–19 HCP, balanced, four-card support.'),
      ...(s==='D' ? [natural('2C','12–17 点，第二套。','12–17 HCP, second suit.',span(12,17),'two'), natural('3C','18+ 点，第二套，逼局。','18+ HCP, second suit, game-forcing.',span(18),'two')] : []),
    ]);
    add('1'+s+' 1'+m+' 1NT', 3, [
      ['2C','双路重询 · 迫转','Two-way checkback · relay','要求无条件转移至 2♦，表示方片弱止叫或任意邀请牌。','Forces 2♦, showing either a weak diamond sign-off or any invitation.'],
      ['2D','双路重询 · 逼局','Two-way checkback · game force','人工逼局，不符合其他逼局叫品。','Artificial game force for hands without a more descriptive game-forcing call.'],
    ]);
    add('1'+s+' 1'+m+' 1NT 2C', 3, [relay('2D','2D')]);
  }
  add('1'+s+' 2'+s, 7, [
    natural('2NT','12–14 或 18–19 点均型，逼叫。','12–14 or 18–19 HCP balanced, forcing.',null,'balanced'),
  ]);
}
add('1C 1D', 1, [
  natural('1H/1S','12–17 点，四张所叫高花，非均型。','12–17 HCP, four cards in the bid major, unbalanced.',span(12,17),'major'),
  natural('1NT','12–14 点均型，可有四张高花。','12–14 HCP balanced, may have a four-card major.',span(12,14),'balanced'),
  natural('2C','12–15 点，六张梅花。','12–15 HCP, six clubs.',span(12,15),'minor'),
  natural('2D','12–15 点，四张方片支持。','12–15 HCP, four-card diamond support.',span(12,15),'fit'),
  natural('2H/2S','18+ 点，跳新花逼局，通常四张。','18+ HCP, game-forcing jump shift, usually four cards.',span(18),'major'),
  natural('2NT','18–19 点均型。','18–19 HCP balanced.',span(18,19),'balanced'),
  natural('3C','15–17 点，6+ 张好套。','15–17 HCP, good 6+ clubs.',span(15,17),'minor'),
  natural('3D','16–17 点，四张方片支持。','16–17 HCP, four-card diamond support.',span(16,17),'fit'),
  ['3H/3S','爆裂叫','Splinter','18+ 点、支持方片，所叫单缺。','18+ HCP, diamond support and shortage in the bid suit.',span(18),'fit',true],
  signoff('3NT','6–7 张坚固梅花套，7.5–9 赢墩，未叫花色有止。','Solid 6–7 clubs, 7.5–9 playing tricks and stoppers in the unbid suits.'),
]);
add('1C 1D 1NT', 2, [
  ['2C','双路重询 · 迫转','Two-way checkback · relay','要求叫 2♦，方片弱止叫或任意邀请牌。','Forces 2♦, either a weak diamond sign-off or any invitation.'],
  ['2D','双路重询 · 逼局','Two-way checkback · game force','人工逼局。','Artificial game force.'],
  natural('2H/2S','5♦ + 4 张所叫高花，逼局。','Five diamonds and four in the bid major, game-forcing.',null,'two'),
  natural('2NT','5♦ + 4♣，邀请，可修正为三阶低花。','Five diamonds and four clubs, invitational. Opener may correct to three of a minor.',null,'two'),
  natural('3C','5–5 双低花，逼局。','5–5 minors, game-forcing.',null,'two'),
  natural('3D','6+ 方片，自然逼局。','6+ diamonds, game-forcing.',null,'minor'),
  signoff('3NT'),
]);
add('1C 1D 1NT 2C', 2, [relay('2D','2D')]);
add('1D 2C',7,[
  natural('2D','五张以上方片。','Five or more diamonds.',null,'minor'),
  natural('2H/2S','五张方片及四张所叫高花。','Five diamonds and four in the bid major.',null,'two'),
  natural('2NT','12–14 或 18–19 点均型。','12–14 or 18–19 HCP balanced.',null,'balanced'),
  natural('3C','四张支持且低限或无单缺，或 14+ 点、三张带大牌。','Four-card support with a minimum or no shortage, or 14+ HCP and three with an honor.',null,'fit'),
  natural('3D','15+ 点，6+ 张好方片。','15+ HCP, good 6+ diamonds.',span(15),'minor'),
  ['3H/3S','爆裂叫','Splinter','14+ 点，非均型四张以上梅花支持，所叫单缺。','14+ HCP, unbalanced with 4+ club support and shortage in the bid suit.',span(14),'fit',true],
]);
add('1H 1S',11,[
  natural('1NT','均型或半均型。','Balanced or semibalanced.',null,'balanced'),
  natural('2C/2D','11–17 点，第二套。','11–17 HCP, second suit.',span(11,17),'two'),
  natural('2H','11–15 点，六张红心。','11–15 HCP, six hearts.',span(11,15),'major'),
  natural('2S','11–13 点，四张黑桃支持。5–4–3–1 可三张带大加叫。','11–13 HCP, four spades. With 5–4–3–1, may raise with three including an honor.',span(11,13),'fit'),
  natural('2NT','18–19 点均型。','18–19 HCP balanced.',span(18,19),'balanced'),
  natural('3C/3D','18+ 点，第二套，逼局。','18+ HCP, second suit, game-forcing.',span(18),'two'),
  natural('3H','15–17 点，六张红心。','15–17 HCP, six hearts.',span(15,17),'major'),
  natural('3S','14–16 点，四张黑桃支持。','14–16 HCP, four spades.',span(14,16),'fit'),
  natural('3NT','6+ 张半坚固红心套及四张小黑桃。','6+ semisolid hearts and four small spades.'),
  ['4C/4D','爆裂叫','Splinter','黑桃配合，所叫低花单缺。','Spade fit and shortage in the bid minor.',null,'fit',true],
  signoff('4H','单套想打，通常 15–17 点及七张以上红心。','To play, usually 15–17 HCP and seven or more hearts.'),
]);
add('1H 1S 1NT',11,[
  ['2C','双路重询 · 迫转','Two-way checkback · relay','要求 2♦，方片弱止叫或邀请牌。','Forces 2♦, either a weak diamond sign-off or invitational values.'],
  ['2D','双路重询 · 逼局','Two-way checkback · game force','人工逼局，与方片无关。','Artificial game force, says nothing about diamonds.'],
  natural('2H','三张红心支持，弱牌。','Weak hand with three-card heart support.',null,'fit'),
  natural('2S','9 点以下，6+ 张黑桃。','Below 9 HCP and 6+ spades.',span(0,8),'major'),
  natural('3C/3D','黑桃与所叫低花 5–5 以上，逼局。','5–5 or longer in spades and the bid minor, game-forcing.',null,'two'),
  signoff('3NT'),
]);
add('1H 1S 1NT 2C',11,[relay('2D','2D')]);

for (const m of majors) {
  const om = m === 'H' ? 'S' : 'H';
  const hasPassed = ({ first }) => first >= 2;
  const gameRaise = ['4'+m,'封局加叫','Game raise','通常 5+ 张支持。无局约 6 点以下，有局 5–8 点。','Usually 5+ support. About 6 HCP or less nonvulnerable, 5–8 vulnerable.',span(0,8),'fit'];
  add('1'+m, 15, [
    ...(m==='H' ? [natural('1S','6–11 点，4+ 张黑桃，无三张红心，不逼叫。','6–11 HCP, 4+ spades, fewer than three hearts, nonforcing.',span(6,11),'major')] : []),
    natural('1NT','6–11 点，不逼叫。','6–11 HCP, nonforcing.',span(6,11)),
    ['2C','逆朱瑞','Reverse Drury','已不叫过，三张支持至少好 9 点，或四张以上支持、好 8+ 点和 2+ 控制。','By a passed hand: three-card support with a good 9+ HCP, or 4+ support with a good 8+ and two controls.',span(8),'fit',true],
    natural('2D','9–11 点，6+ 方片。','9–11 HCP, 6+ diamonds.',span(9,11),'minor'),
    ['2'+m,'简单加叫','Single raise','5 至差 9 点，3–4 张支持。','5 to a poor 9 HCP with 3–4 support.',span(5,9),'fit'],
    ['2NT','配合邀请','Fit invitation','4+ 张将牌、2+ 控制，通常有单缺或额外牌型。','4+ trumps and two or more controls, typically shortness or extra shape.',null,'fit'],
    ['3'+m,'阻击性加叫','Preemptive raise','4+ 张支持，阻击性。','4+ support, preemptive.',null,'fit'],
    gameRaise,
  ], { when: hasPassed });
  add('1'+m, m==='H'?10:11, [
    ...(m==='H' ? [natural('1S','6+ 点，4+ 张黑桃，逼叫。','6+ HCP, 4+ spades, forcing.',span(6),'major'), ['2S','弱跳新花','Weak jump shift','4–6 点，6+ 黑桃。','4–6 HCP, 6+ spades.',span(4,6),'major']] : [
      ['2H','二盖一逼局','Two-over-one game force','13+ 点，5+ 红心，不强调套质量。','13+ HCP, 5+ hearts, no special suit quality required.',span(13),'major'],
      signoff('4H','自然红心实套进局。','Natural heart game.')]),
    ['1NT','半逼叫无将','Semi-forcing notrump','6 至差 12 点。开叫人低限 5–3–3–2 可以不叫。','6 to a poor 12 HCP. Opener may pass with a minimum 5–3–3–2.',span(6,12)],
    ['2C/2D','二盖一逼局','Two-over-one game force','13+ 点。梅花 3+ 张，方片 4+ 张。','13+ HCP. 3+ clubs or 4+ diamonds.',span(13),'minor'],
    ['2'+m,'简单加叫','Single raise',m==='H'?'6–10 点、三张支持，或 5–9 点均型四张支持。':'7–10 点、三张支持，或 6–9 点均型四张支持。',m==='H'?'6–10 HCP with three-card support, or 5–9 balanced with four.':'7–10 HCP with three-card support, or 6–9 balanced with four.',span(m==='H'?5:6,10),'fit'],
    ['2NT','杰可贝 2NT','Jacoby 2NT','13+ 点，4+ 张将牌支持，逼局，要求同伴描述牌型。','13+ HCP, 4+ trump support, game-forcing. Asks opener to describe shape.',span(13),'fit'],
    ['3C','伯根加叫 · 低限','Bergen raise · lower range','7–9 点，4+ 张将牌支持。','7–9 HCP, 4+ trump support.',span(7,9),'fit'],
    ['3D','伯根加叫 · 高限','Bergen raise · upper range','10–12 点，4+ 张将牌支持。','10–12 HCP, 4+ trump support.',span(10,12),'fit'],
    ['3'+m,'阻击性加叫','Preemptive raise','弱牌阻击性加叫，有局偏主打型。','Preemptive raise. Vulnerable hands are primarily offensive.',null,'fit'],
    ['3'+om,'小爆裂叫','Mini-splinter','10–12 点，4+ 张将牌支持。','10–12 HCP, 4+ trump support and an unspecified shortage.',span(10,12),'fit',true],
    ['3NT/4C/4D','爆裂叫','Splinter','13–15 点，4+ 将牌支持。3NT 表示另一高花短；4♣/4♦ 表示所叫低花短。','13–15 HCP, 4+ support. 3NT shows shortage in the other major; 4♣/4♦ show shortage in the suit bid.',span(13,15),'fit',true],
    gameRaise,
  ], { when: ctx => !hasPassed(ctx) });
  add('1'+m+' 2NT',14,[
    [colors.filter(s=>s!==m).map(s=>'3'+s).join('/'),'单缺显示','Shortness','牌力不限，所叫花色单缺。','Any strength, singleton or void in the bid suit.',null,'fit'],
    natural('3'+m,'16+ 点，无单缺。','16+ HCP, no shortage.',span(16),'fit'),
    natural('3NT','14–15 点或 4+ 控制，无单缺。','14–15 HCP or 4+ controls, no shortage.',null,'fit'),
    natural(colors.filter(s=>s!==m).map(s=>'4'+s).join('/'),'所叫花色 5+ 张，至少 KQ 领头。','5+ cards in the bid suit, headed by at least KQ.',null,'two'),
    signoff('4'+m,'低限，无单缺，至多三个控制。','Minimum, no shortage, at most three controls.'),
  ], { when: ctx => !hasPassed(ctx) });
  add('1'+m+' 1NT',12,[
    natural('2C/2D'+(m==='S'?'/2H':''),'12–17 点，第二套。高花 4+；低花通常 3+，1♥–1NT–2♣ 可仅两张。','12–17 HCP, second suit. 4+ in a major, typically 3+ in a minor. 1♥–1NT–2♣ can be two.',span(12,17),'two'),
    natural('2'+m,'12–15 点，通常六张以上原高花。','12–15 HCP, usually 6+ in the original major.',span(12,15),'major'),
    natural('2NT','18–19 点，均型。','18–19 HCP, balanced.',span(18,19),'balanced'),
    natural('3'+m,'15–17 点，6+ 张原高花。','15–17 HCP, 6+ in the original major.',span(15,17),'major'),
    natural('3C/3D','18+ 点，逼局，通常四张以上第二套。','18+ HCP, game-forcing, usually 4+ in a second suit.',span(18),'two'),
    signoff('3NT','6+ 张坚固套，边花无单缺。','6+ solid suit, no outside shortage.'),
    ...(m==='H' ? [natural('2S','16+ 点，逆叫，逼叫一轮。','16+ HCP, reverse, forcing one round.',span(16),'two')] : []),
  ]);
  add('1'+m+' 2C',15,[
    ['2D','逆朱瑞答叫','Reverse Drury reply','正常开叫实力，不足以进局。','Full opening values, insufficient for game.'],
    natural('2'+m,'轻开叫或低限，进局无望。','Light or minimum opening, no game prospects.'),
  ], { when: hasPassed });
  for (const s of ['C','D',...(m==='S'?['H']:[])]) {
    add('1'+m+' 2'+s,14,[
      natural('2'+m,'重叫原高花。通常六张，也可能是缺少其他描述的低限牌。','Rebid the major, normally six cards, or a minimum with no descriptive alternative.',null,'major'),
      natural('2NT','通常均型，14+ 点。','Usually balanced, 14+ HCP.',span(14),'balanced'),
      natural('3'+m,'14+ 点，至少 6 张半坚固套。','14+ HCP, at least a six-card semisolid suit.',span(14),'major'),
      natural('3'+s,'4+ 张支持，或有额外实力且三张带大牌。','4+ support, or three with honors and extra strength.',null,'fit'),
      natural(colors.filter(t=>t!==s&&t!==m).map(t=>'3'+t).join('/'),'第二套，额外实力或长度。','Second suit, extra strength or length.',null,'two'),
    ], {when:ctx=>!hasPassed(ctx)});
  }
}

const quantitative = ['4NT','示量邀叫','Quantitative invitation','邀请无将满贯，同伴按高低限决定。','Invites a notrump slam. Opener evaluates whether to accept.'];
const gerber = ['4C','戈伯问 A','Gerber','问 A 的个数。4♦/4♥/4♠/4NT = 0 或 4 / 1 / 2 / 3 个 A。','Asks for aces. 4♦/4♥/4♠/4NT show 0 or 4 / 1 / 2 / 3 aces.',null,null,true];
add('1NT',19,[
  ['2C','斯台曼','Stayman','询问四张高花。逼局牌使用时不承诺自己有四张高花。','Asks about four-card majors. A game-forcing responder need not have a four-card major.',null,'major'],
  transfer('2D','H',2), transfer('2H','S',2),
  ['2S','低花迫转','Minor-suit relay','要求 3♣。可为单低花弱牌、5–5 以上双低逼局，或 5–4 双低邀满贯。','Forces 3♣. A weak single-suited minor, GF 5–5 or longer minors, or slam invitation with 5–4 minors.',null,'minor'],
  ['2NT','自然邀请','Natural invitation','自然邀局。','Natural invitation to game.',null,'balanced'],
  ['3C/3D','低花长套邀请','Long-minor invitation','单低花长套，邀请 3NT。','Single-suited minor, invitational to 3NT.',null,'minor'],
  ['3H/3S','单缺显示','Shortness','5–4–3–1，所叫单张，两低花 5–4，10+ 点，逼局。','5–4–3–1 with a singleton in the bid major, 5–4 minors, 10+ HCP, game-forcing.',span(10),'two',true],
  signoff('3NT'), gerber, transfer('4D','H',4,true), transfer('4H','S',4,true),
  natural('4S','10–14 调整点，6–5 以上双低花。','10–14 adjusted points, 6–5 or longer minors.',null,'two'), quantitative,
]);
add('1NT 2C',19,[
  ['2D','斯台曼答叫','Stayman reply','无四张高花。','No four-card major.',null,'balanced'],
  ['2H/2S','斯台曼答叫','Stayman reply','所叫高花四至五张。','Four or five cards in the bid major.',null,'major'],
]);
for (const answer of ['D',...majors]) {
  add('1NT 2C 2'+answer,19,[
    ['P','弱牌止叫','Weak sign-off','7 点以下弱三套，梅花短。','Weak three-suiter, below 7 HCP and short clubs.',span(0,6)],
    ['2NT','自然邀请','Natural invitation','邀请，通常有四张高花。','Invitational, typically with a four-card major.',null,'major'],
    natural('3C/3D','5+ 张所叫低花，逼局，可有四张高花。','5+ in the minor, game-forcing, may also have a four-card major.',null,'minor'),
    answer==='D' ? signoff('3NT') : signoff('3NT','开叫人所示高花不配合，有另一门四张高花。','No fit in opener’s major, four cards in the other major.'),
    ...(answer==='D' ? [
      natural('2H/2S','5–4 双高，所叫五张，邀请。','5–4 majors, five in the bid suit, invitational.',null,'two'),
      ['3H/3S','斯莫伦','Smolen','5–4 双高，所叫四张，逼局。','5–4 majors, four in the bid suit, game-forcing.',null,'two',true],
      transfer('4D','H',4,true), transfer('4H','S',4,true), quantitative,
    ] : [
      signoff('4'+answer), ['4C/4D'+(answer==='S'?'/4H':''),'爆裂叫','Splinter','高花配合，所叫单缺，有满贯兴趣。','Major-suit fit, shortage in the bid suit, slam interest.',null,'fit',true],
      ['3'+(answer==='H'?'S':'H'),'配合试探','Fit and slam interest','支持同伴所示高花，有满贯兴趣。','Supports opener’s major with slam interest.',null,'fit'],
      ...(answer==='H' ? [natural('2S','邀局，四张黑桃，通常有单缺。','Invitational, four spades, typically with shortage.',null,'major')] : []),
    ]),
  ]);
}
add('1NT 2S',20,[relay('3C','3C')]);
add('1NT 2S 3C',20,[
  ['P/3D','低花止叫','Minor-suit sign-off','6+ 张单低花弱牌，选梅花或方片。','Weak hand with 6+ cards in clubs (Pass) or diamonds (3♦).',null,'minor'],
  ['3H/3S','双低花逼局','Game-forcing minors','5–5 以上双低，所叫单缺，逼局。','5–5 or longer minors, shortage in the bid major, game-forcing.',null,'two',true],
  natural('3NT','14–15 点，5–4 双低，无单缺，温和满贯兴趣。','14–15 HCP, 5–4 minors without shortage, mild slam interest.',span(14,15),'two'),
  natural('4NT','16–17 点，5–4 双低，无单缺，示量邀叫。','16–17 HCP, 5–4 minors without shortage, quantitative invitation.',span(16,17),'two'),
]);
add('2NT',25,[
  ['3C','傀儡斯台曼','Puppet Stayman','查询开叫人四张或五张高花，应叫方不保证四张高花。','Asks about opener’s four- or five-card majors. Responder need not hold a four-card major.',null,'major'],
  transfer('3D','H',3), transfer('3H','S',3),
  ['3S','低花斯台曼','Minor-suit Stayman','6+ 调整点，至少 5–4 双低花。','6+ adjusted points and at least 5–4 minors.',null,'two'],
  signoff('3NT','5–10 点，进局止叫。','5–10 HCP, game sign-off.'),
  gerber, transfer('4D','H',4,true), transfer('4H','S',4,true),
  ['4S','双低花选局','Choose a minor-suit game','低于 10 调整点，6–5 双低花。','Under 10 adjusted points, 6–5 minors.'],
  ['4NT','示量邀叫','Quantitative invitation','11–12 点，无四张高花。','11–12 HCP without a four-card major.',span(11,12),'balanced'],
  ['5NT','低花选满贯','Choose a minor-suit slam','13–14 点，无四张高花，请从最低的四张低花叫起。','13–14 HCP without a four-card major. Start with the cheapest four-card minor.',span(13,14),'balanced',true],
]);
add('2NT 3C',26,[
  ['3D','傀儡斯台曼答叫','Puppet Stayman reply','至少一门四张高花。','At least one four-card major.'],
  ['3H/3S','傀儡斯台曼答叫','Puppet Stayman reply','所叫高花五张。','Five cards in the bid major.'],
  ['3NT','傀儡斯台曼答叫','Puppet Stayman reply','无四张高花。','No four-card major.'],
]);
add('2NT 3C 3D',26,[
  ['3H','显示四张黑桃','Shows four spades','请开叫方有四张黑桃时叫 3♠。','Opener bids 3♠ with four spades.'],
  ['3S','显示四张红心','Shows four hearts','有四张红心；开叫方无配合叫 3NT。','Shows four hearts. Opener bids 3NT without a fit.'],
  signoff('3NT','无四张高花，止叫。','No four-card major, sign-off.'),
  ['4C','问低花','Asks for minors','至少 4–4 双低，不寻求高花配合。','At least 4–4 minors, not looking for a major fit.'],
  ['4D','双高选局','Choose a major game','至少 4–4 双高。','At least 4–4 in the majors.'], quantitative,
]);
add('2NT 3S',27,[
  natural('3NT','通常无四张低花。两门高花均两止时可以有四张低花。','Usually denies a four-card minor. A four-card minor is possible with two stoppers in each major.'),
  natural('4C/4D','所叫低花四张以上。','Four or more cards in the bid minor.'),
]);
for (const nt of ['1NT','2NT']) {
  const n = nt === '1NT' ? 2 : 3;
  for (const [from,m] of [['D','H'],['H','S']]) {
    add(nt+' '+n+from,n===2?20:27,[
      relay(n+m,n+m,'接受转移','Accept transfer'),
      [''+(n+1)+m,'超转移','Super-accept',n===2?'四张以上支持，高限。':'四张以上支持，一般实力。',n===2?'4+ support and a maximum.':'4+ support with ordinary strength.',null,'fit'],
    ]);
    add(nt+' '+n+from+' '+n+m,n===2?20:27,[
      ...(n===2 ? [['2NT','邀请','Invitation','邀局，不保证均型。','Game invitation, not necessarily balanced.'],natural('3'+m,'六张以上，或不宜打无将的五张套，邀局。','Six or more cards, or five unsuitable for notrump, invitational.',null,'major')] : []),
      signoff('3NT','建议打 3NT。开叫方通常有三张支持时改叫 4 阶高花。','Suggests 3NT. Opener usually corrects to four of the major with three-card support.'),
      natural('4'+m,'6+ 张高花，有温和满贯兴趣。','6+ cards in the major, mild slam interest.',null,'major'),
      ...[...minors, ...majors.filter(s=>s!==m)].filter(s=>bids.indexOf('3'+s)>bids.indexOf(n+m)).map(s=>
        natural('3'+s,'显示第二套，逼局。','Shows a second suit, game-forcing.',null,'two')),
      quantitative,
    ]);
    add(nt+' 4'+from,n===2?19:25,[relay('4'+m,'4'+m,'接受德克萨斯转移','Accept Texas transfer')]);
  }
  add(nt+' 4C',n===2?19:25,[
    ...['4D','4H','4S','4NT'].map((call,i)=>[call,'戈伯答叫','Gerber reply', (i||'0 或 4')+' 个 A。',(i||'0 or 4')+' aces.']),
  ]);
}
add('2C',24,[
  ['2D','示弱或等待','Weak or waiting','通常 7 点以下，也可为不适合其他示强应叫的 8+ 点牌。','Usually under 8 HCP, or 8+ without a suitable positive response.'],
  ['2NT','积极均型','Positive balanced','8+ 点，均型或半均型，可有五张低花。','8+ HCP, balanced or semibalanced, may have a five-card minor.',span(8),'balanced'],
  natural('2H/2S/3C/3D','积极实套。8–9 点时要求五张带两大或六张以上；10+ 点不作该质量要求。','Positive natural suit. With 8–9 HCP, five with two top honors or six or more cards; 10+ HCP relaxes the quality requirement.',span(8)),
]);
add('2C 2D',24,[
  natural('2H/2S/3C/3D','自然实套，逼叫一轮。','Natural suit, forcing one round.'),
  ...['2NT','3NT','4NT'].map((call,i)=>natural(call,`${22+i*3}–${24+i*3} 点均型，可能五张高花或六张低花。`,`${22+i*3}–${24+i*3} HCP balanced, may have a five-card major or a six-card minor.`,span(22+i*3,24+i*3),'balanced')),
  natural('3H/3S','22+ 点，所叫四张高花及 5+ 方片，逼局。','22+ HCP, four cards in the bid major and 5+ diamonds, game-forcing.',span(22),'two'),
]);
add('2C 2NT',24,[
  ['3C','问牌型','Shape inquiry','问牌型或准备显示梅花，逼局。','Asks about shape or prepares to show clubs, game-forcing.'],
  natural('3D/3H/3S','自然出套，逼局。','Natural suit, game-forcing.'),
  natural('3NT','22–23 点均型，无四张高花。','22–23 HCP balanced, no four-card major.',span(22,23),'balanced'),
  natural('4C','6+ 张好梅花，确定将牌。','Good 6+ clubs, sets trumps.',null,'minor'),
]);
for (const s of ['D',...majors]) {
  add('2'+s,25,[
    ['2NT','奥古斯特问叫','Ogust inquiry','询问开叫人的高低限与套的质量。我方有局问单缺。','Asks about strength and suit quality. When our side is vulnerable, asks for shortness instead.',null,null,true],
    ['3'+s,'加深阻击','Raise the preempt','提高阻击阶数。','Extends the preempt.',null,'fit'],
    signoff('3NT/4H/4S'),
    ...colors.filter(t=>t!==s).map(t=>natural((colors.indexOf(t)>colors.indexOf(s)?'2':'3')+t,'平叫新花，逼叫一轮，通常无良好开叫花色支持。','Cheapest new suit, forcing one round, usually without good support.')),
  ]);
  add('2'+s+' 2NT',25,[
    ...['3C','3D','3H','3S','3NT'].map((call,i)=>[call,'奥古斯特答叫','Ogust reply',
      ['低限弱套。','低限好套。','高限弱套。','高限好套。','坚固套。'][i],
      ['Minimum, weak suit.','Minimum, good suit.','Maximum, weak suit.','Maximum, good suit.','Solid suit.'][i]]),
  ],{when:({vulnerable})=>!vulnerable});
  add('2'+s+' 2NT',25,[
    ...colors.map(t=>['3'+t,'单缺答叫','Shortness reply',t===s?'无单缺。':'所叫花色单缺。',t===s?'No shortage.':'Shortage in the bid suit.']),
  ],{when:({vulnerable})=>vulnerable && majors.includes(s)});
}
add('3NT',27,[
  ['4C/5C/6C','低花示选','Pass or correct','请开叫人梅花时不叫，方片时改叫同阶方片。','Opener passes with clubs or corrects to diamonds at the same level.'],
  ['4D','问单缺','Shortness inquiry','已知开叫人的低花，有满贯兴趣，询问单缺。','Knows opener’s minor and asks for shortage with slam interest.',null,'fit',true],
  signoff('4H/4S'), ['4NT','邀满贯','Slam invitation','开叫人的低花对同伴单缺且不失一墩时可去满贯。','Invites slam if opener’s minor can run opposite responder’s shortage.'],
]);
add('3NT 4D',27,[
  ['4H/4S','显示单张','Shows a singleton','所叫高花单张。','Singleton in the bid major.'],
  natural('4NT','7–2–2–2，无单缺。','7–2–2–2, no shortage.'),
  natural('5C/5D','所叫低花为长套，另一低花单缺。','Bid minor is the long suit, shortage in the other minor.'),
]);
const comp = {competitive:true,group:'competition'};
add('1NT X',22,[
  ['P','惩罚加倍后不叫','Pass after penalty double','4 点以下均型无五张套，或 5+ 点相对均型。','Below 5 HCP balanced with no five-card suit, or a relatively balanced 5+ HCP.'],
  ['XX','逃叫再加倍','Escape redouble','要求叫 2♣。可为 0–4 点、五张以上梅花或 4♣ 加另一四张套；六张以上梅花牌力不限。','Forces 2♣. May be 0–4 HCP with 5+ clubs or four clubs and another four-card suit. With 6+ clubs, any strength.'],
  transfer('2C','D',2), transfer('2D','H',2), transfer('2H','S',2),
  ['2NT','双套逼局','Game-forcing two-suiter','7+ 点，任意 5–5 以上双套，逼局。','7+ HCP, any 5–5 or longer two-suiter, game-forcing.',span(7),'two'],
  transfer('4D','H',4,true), transfer('4H','S',4,true),
],comp);
for (const s of colors) {
  const leb = ['2NT','莱本索尔','Lebensohl','要求同伴转移至 3♣，再按敌方花色和止张继续。','Relays to 3♣, then responder clarifies suit, strength and stoppers.',null,null,true];
  const rows = s==='C' ? [
    ['X','实力加倍','Values double','至少邀请，能惩罚一门高花，或准备出套逼局。','At least invitational, can penalize a major or has a GF suit.'],
    natural('2D','5+ 方片，不逼叫。','5+ diamonds, nonforcing.'),
    natural('2H','5–5 以上双低，竞争实力。','5–5 or longer minors, competitive.'),
    natural('2S','5–5 以上双低，逼局。','5–5 or longer minors, game-forcing.'),
    natural('3C/3D','自然出套，逼局。','Natural suit, game-forcing.'),
    natural('3H/3S','所叫单缺，通常 5–4 双低，逼局。','Shortness in the bid major, typically 5–4 minors, game-forcing.'),
  ] : [
    ['X','技术性加倍','Takeout double','可竞争或逼局；逼局牌通常为均型。','Competitive or game-forcing. GF hands are usually balanced.'],
    ...colors.filter(t=>colors.indexOf(t)>colors.indexOf(s)).map(t=>natural('2'+t,'自然实套，不逼叫，至多邀局。','Natural suit, nonforcing, at most invitational.')),
    ...colors.filter(t=>t!==s).map(t=>natural('3'+t,'9+ 点，5+ 张实套，逼叫。','9+ HCP, 5+ cards in the suit, forcing.',span(9))),
    ['3'+s,'直接扣叫','Direct cue bid','敌花无止，有至少一门四张高花，逼局。','No stopper in opponent’s suit, at least one four-card major, game-forcing.'],
    signoff('3NT','进局实力，敌方花色无止张。','Game values, without a stopper in the opponent’s suit.'),
  ];
  add('1NT 2'+s,22,[...rows,leb,transfer('4D','H',4,true),transfer('4H','S',4,true)],comp);
  add('1NT 2'+s+' 2NT P',22,[relay('3C','3C')],comp);
}
add('1NT',23,[
  ['X','惩罚加倍','Penalty double','15+ 点有适于惩罚的单套，或任意 18+ 点。','15+ HCP with a suitable long suit, or any 18+ HCP.',span(15)],
  ['2C','双高花争叫','Both majors','通常有开叫实力，至少 5–4 双高；按局况和长度调整。','Typically opening values with at least 5–4 in the majors. Adjust for vulnerability and length.',null,'two'],
  natural('2D/2H/2S','9–16 点，6+ 张所叫套。','9–16 HCP, 6+ cards in the suit.',span(9,16)),
  ['2NT','双低花争叫','Both minors','双低花 5–5 以上。无局 12+、有局 14+，两套均可叫。','5–5 or longer minors, 12+ nonvulnerable or 14+ vulnerable, both suits biddable.',span(12),'two'],
  ...colors.map(s=>['3'+s,'跳争叫','Jump overcall','无局六张以上阻击，有局七张以上建设性。','Nonvulnerable 6+ card preempt. Vulnerable, constructive with 7+.']),
],comp);
add('1NT 2C P',23,[
  ['2D','双高花问叫','Major-suit inquiry','高花等长，请同伴选较长或较强的高花；也可准备再叫。','Equal length in the majors, asks partner to choose the longer or stronger major. May also prepare a rebid.'],
  ['2H/2S','示选高花','Major preference','示选所叫高花，通常两门高花不等长。','Prefers the bid major, usually with unequal major lengths.'],
  ['2NT','长短问叫','Asks relative length','3♣=红心较长，3♦=黑桃较长，3♥/3♠=等长低限/高限。','3♣ = longer hearts, 3♦ = longer spades, 3♥/3♠ = equal length with minimum/maximum.'],
],comp);
add('2C X',24,[
  ['P','弱牌不叫','Weak pass','弱牌，或不适合其他叫品。','Weak hand or no suitable alternative.'],
  ['XX','示强再加倍','Positive redouble','7+ 点，不保证均型。','7+ HCP, not necessarily balanced.',span(7)],
  natural('2H/2S/3C/3D','6+ 点，两张大牌的实套。三阶出套需六张以上。','6+ HCP and a natural suit with two honors. At the three level, 6+ cards.',span(6)),
],comp);
for (const s of colors) {
  add('1'+s+' X',30,[
    ['XX','示强再加倍','Strength redouble','11+ 大牌点，不保证同伴花色配合。','11+ HCP, does not promise support.',span(11)],
    majors.includes(s)
      ? ['1NT','好加叫','Constructive raise','三张支持 9 至差 11 点，或四张支持 7 至差 10 点。','Three-card support with 9 to a poor 11 HCP or four-card support with 7 to a poor 10.',span(7,11),'fit']
      : natural('1NT','8–11 点均型，无五张以上支持。','8–11 HCP balanced, without 5+ support.',span(8,11),'balanced'),
    ['2NT','限制性加叫','Limit raise','至少 11 调整点，高花至少四张支持，低花至少五张。','At least 11 adjusted points, with 4+ support for a major or 5+ for a minor.',null,'fit'],
    ...colors.slice(colors.indexOf(s)+1).map(t=>natural('1'+t,'一阶新花，逼叫一轮。','One-level new suit, forcing one round.')),
  ],comp);
  add('1'+s,31,[
    ['X','技术性加倍','Takeout double','对未叫花色均有支持，或 16+ 点强牌。','Support for all unbid suits, or a strong hand with 16+ HCP.'],
    natural('1NT','直接位置 15–18 点，后续按 1NT 开叫。','Direct seat: 15–18 HCP, with 1NT opening continuations.',span(15,18),'balanced'),
    ['2'+s,'迈克尔扣叫','Michaels cue bid',majors.includes(s)?'另一高花加一门低花。':'双高花。',majors.includes(s)?'Other major and an unspecified minor.':'Both majors.',null,'two',true],
    ['2NT','不寻常无将','Unusual notrump','最低的两门未叫花色，通常 5–5 以上。','The two lowest unbid suits, usually 5–5 or longer.',null,'two',true],
    ...colors.filter(t=>t!==s).map(t=>{
      const low=colors.indexOf(t)>colors.indexOf(s);
      return natural((low?'1':'2')+t, low?'8–16 点，通常至少五张。':'11–16 点，通常至少五张。',low?'8–16 HCP, usually 5+ cards.':'11–16 HCP, usually 5+ cards.',span(low?8:11,16),majors.includes(t)?'major':'minor');
    }),
  ],comp);
  add('1'+s+' P P',31,[
    natural('1NT','平衡位置 12–15 点，后续按 1NT 开叫。','Balancing seat: 12–15 HCP, with 1NT opening continuations.',span(12,15),'balanced'),
    natural('2NT','平衡位置 19–20 点，3♣ 斯台曼。','Balancing seat: 19–20 HCP, with 3♣ Stayman.',span(19,20),'balanced'),
  ],comp);
}
const keycards = ['5C','5D','5H','5S'].map((call,i)=>opening(call,'罗马关键张答叫','RKCB reply',
  ['1 或 4 个关键张。','0 或 3 个关键张。','2 或 5 个关键张，无将牌 Q。','2 或 5 个关键张，有将牌 Q。'][i],
  ['1 or 4 key cards.','0 or 3 key cards.','2 or 5 key cards, without the trump queen.','2 or 5 key cards, with the trump queen.'][i],28,null,null));
const keycardAsk = opening('4NT','罗马关键张问叫','Roman Key Card Blackwood','已建立将牌配合时问关键张。四个 A 与将牌 K 为五个关键张，使用 1430 答叫。','With trumps agreed, asks for key cards (four aces and the trump king), using 1430 responses.',28,null,null,true);
const slam = {seq:['4NT','P'],page:28,group:'slam',rules:keycards};
const slamAsk = {seq:[],page:28,group:'slam',rules:[keycardAsk]};
const openings = {seq:[],page:1,group:'opening',rules:openingRules};

function rulesFor({dealer,calls,vulnerability='none'}) {
  const first = calls.findIndex(call=>call!=='P');
  const seat = seatAt(dealer,calls.length);
  const vulnerable = vulnerability==='both' || (vulnerability==='ns' && side(seat)===0) || (vulnerability==='ew' && side(seat)===1);
  if (first === -1) return openingRules.map(rule=>{
    if (calls.length===3 && ['2D','2H','2S'].includes(rule.call)) return {...rule,range:[9,12]};
    if (calls.length===2 && ['1H','1S'].includes(rule.call)) return {...rule,range:null};
    return rule;
  });
  const seq = calls.slice(first);
  const effectiveSeq = seq.slice(0,6).join(' ')==='2C P 2D P 2NT P' ? seq.slice(4) : seq;
  const matches = situations.filter(entry=>entry.seq.length===effectiveSeq.length &&
    entry.seq.every((call,i)=>call===effectiveSeq[i]) && (!entry.when || entry.when({first,dealer,vulnerable})));
  const rules = matches.flatMap(entry=>entry.rules);
  const sameSide = calls.flatMap((call,i)=>{
    const bidder=seatAt(dealer,i);
    return bids.includes(call) && side(bidder)===side(seat) ? [{call,bidder}] : [];
  });
  const firstSuit = sameSide[0]?.call;
  const denomination = strain(firstSuit);
  const agreed = colors.includes(denomination) && sameSide.some(({call,bidder})=>
    bidder!==sameSide[0].bidder && strain(call)===denomination) ||
    (['1H','1S'].includes(firstSuit) && ['3C','3D','2NT'].includes(sameSide[1]?.call) && seq[1]==='P' && first<2);
  const asks = seq.at(-2)==='4NT' && seq.at(-1)==='P';
  if (agreed && asks && !rules.length) return keycards;
  if (agreed && !asks && !rules.some(rule=>rule.call==='4NT')) rules.push(keycardAsk);
  return rules;
}

function referencePage(calls) {
  const seq = calls.slice(calls.findIndex(call=>call!=='P'));
  const fit = situations.filter(entry=>entry.seq.every((call,i)=>call===seq[i])).sort((a,b)=>b.seq.length-a.seq.length)[0];
  return fit?.page ?? openingRules.find(rule=>rule.call===seq[0])?.page ?? 1;
}

export const ccba = {
  id:'ccba-2.2',
  name:both('新睿 CCBA 自然体系','Xinrui CCBA Natural'),
  version:'2.2',
  source:both('新睿 CCBA 体系说明 v2.2','Xinrui CCBA System Notes v2.2'),
  pageOffset:3,
  library:[openings, ...situations, slamAsk, slam],
  rulesFor,
  referencePage,
};
