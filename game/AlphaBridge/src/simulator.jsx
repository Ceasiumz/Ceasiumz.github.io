import React, { useEffect, useRef, useState } from 'react';
import { auctionState, replaceCall, seatAt, seats, side, strain, strains } from './auction.js';
import { tableDefaults, vulnerabilities } from './cache.js';
import { Bid, Modal, Meaning, callName, fill } from './ui.jsx';

function Grid({ legal, call, onSelect, t }) {
  const special = legal.filter(item=>['P','X','XX'].includes(item));
  const contracts = legal.filter(item=>!special.includes(item));
  const firstLevel = Number(contracts[0]?.[0]);
  return <div className="bid-grid">
    {!!special.length && <div className="call-specials">{special.map(item=><button key={item} aria-pressed={item===call} onClick={()=>onSelect(item)}>{t[{P:'pass',X:'double',XX:'redouble'}[item]]}</button>)}</div>}
    {!!contracts.length && <div className="call-grid">{contracts.map(item=><button key={item}
      style={{gridColumn:strains.indexOf(strain(item))+1,gridRow:Number(item[0])-firstLevel+1}}
      aria-pressed={item===call} onClick={()=>onSelect(item)}><Bid call={item} t={t}/></button>)}</div>}
  </div>;
}
const ranges = [[0,5],[6,10],[11,14],[15,17],[18,21],[22,37]];
const rangeName = ([min,max]) => max===37 ? min+'+' : min+'–'+max;
function Guided({ rules, legal, selected, onSelect, settings, t, lang }) {
  const [points,setPoints] = useState(-1);
  const [shape,setShape] = useState('unconstrained');
  const [special,setSpecial] = useState(false);
  const shapes = ['balanced','major','minor','strong','two','fit'].filter(id=>rules.some(rule=>rule.shape===id));
  const applicable = rules.filter(rule=>{
    const range=ranges[points];
    return legal.includes(rule.call) && (!range || !rule.range || rule.range[0]<=range[1] && rule.range[1]>=range[0])
      && (shape==='unconstrained' || !rule.shape || rule.shape===shape);
  });
  const matching=applicable.filter(rule=>!rule.special || !settings.skipSpecial && special);
  const available = [...new Set([...matching.map(rule=>rule.call), ...(legal.includes('P')?['P']:[])])];
  function choose(set,value) { set(value); onSelect(null); }
  return <>
    {rules.some(rule=>rule.range) && <fieldset className="branches"><legend>{t.strength}</legend>
      <div className="filters">
        <button aria-pressed={points===-1} onClick={()=>choose(setPoints,-1)}>{t.unconstrained}</button>
        {ranges.map((range,i)=><button key={i} aria-pressed={points===i} onClick={()=>choose(setPoints,i)}>{rangeName(range)}</button>)}
      </div>
    </fieldset>}
    {!!shapes.length && <fieldset className="branches"><legend>{t.shape}</legend><div className="filters">
      {['unconstrained',...shapes].map(id=><button key={id} aria-pressed={shape===id} onClick={()=>choose(setShape,id)}>{t[id]}</button>)}
    </div></fieldset>}
    {!settings.skipSpecial && applicable.some(rule=>rule.special) && <fieldset className="branches"><legend>{t.specialPrompt}</legend><div className="filters">
      <button aria-pressed={!special} onClick={()=>choose(setSpecial,false)}>{t.standardOnly}</button>
      <button aria-pressed={special} onClick={()=>choose(setSpecial,true)}>{t.includeSpecial}</button>
    </div></fieldset>}
    <fieldset className="branches"><legend>{settings.skipRecall?t.stepChoice:t.recall}</legend>
      {!settings.skipRecall && <p className="hint">{t.recallHint}</p>}
      {!matching.length && <p className="hint">{t.noMatches}</p>}
      <div className="guided-calls">
        {available.map(call=><button key={call} aria-pressed={selected===call} onClick={()=>onSelect(call)}>
          <Bid call={call} t={t}/>{settings.skipRecall && matching.find(rule=>rule.call===call)?.name[lang] && <small>{matching.find(rule=>rule.call===call).name[lang]}</small>}
        </button>)}
      </div>
    </fieldset>
  </>;
}

const fields = [['dealer',seats],['player',seats],['vulnerability',vulnerabilities]];
const fieldLabel = (key,t) => t[key==='vulnerability'?'vul':key];

export function Setup({ active, onStart, onResume, onHistory, t }) {
  const [draft,setDraft] = useState(()=>({
    ...tableDefaults,
    ...(active && Object.fromEntries(fields.map(([key])=>[key,active[key]]))),
  }));
  return <>
    <h1 className="scene-title">{t.simulation}</h1>
    <form className="panel setup" onSubmit={event=>{event.preventDefault();onStart(draft);}}>
      <h2>{t.newAuction}</h2>
      {fields.map(([key,options])=><fieldset className="setup-field" key={key}>
        <legend>{fieldLabel(key,t)}</legend>
        <div className="setup-options">
          {options.map(option=><label key={option}>
            <input type="radio" name={key} value={option} checked={draft[key]===option}
              onChange={()=>setDraft(current=>({...current,[key]:option}))}/>
            <span>{t[option]}</span>
          </label>)}
        </div>
      </fieldset>)}
      <button type="submit" className="button primary start-button">{t.startTable} <span aria-hidden="true">→</span></button>
    </form>
    <div className="lobby-actions">
      {active?.calls.length>0 && <button className="button outline" onClick={onResume}>
        {auctionState(active.dealer,active.calls).done?t.reviewLast:t.resume}
      </button>}
      <button className="button outline" onClick={onHistory}>{t.history}</button>
    </div>
  </>;
}

function Contract({ state, t }) {
  return state.contract && <span className="contract-display">
    <Bid call={state.contract.call} t={t}/>{state.multiplier>1 && <span aria-label={state.multiplier===2?t.double:t.redouble}>{state.multiplier===2?'×':'××'}</span>}
  </span>;
}

export function History({ games, onOpen, t, lang }) {
  const date = new Intl.DateTimeFormat(lang==='zh'?'zh-CN':'en',{dateStyle:'medium',timeStyle:'short'});
  const visibleGames = games.filter(game=>game.calls.length);
  return <>
    <h1 className="scene-title">{t.history}</h1>
    {visibleGames.length ? <ul className="history-list">
      {visibleGames.map(game=>{
        const state = auctionState(game.dealer,game.calls);
        return <li key={game.id}><button className="history-card panel" onClick={()=>onOpen(game.id)}>
          <span className="bid-tile history-bid">{state.contract ? <Contract state={state} t={t}/> : 'P'}</span>
          <span className="history-copy">
            <strong>{state.done ? (state.contract?t.finished:t.passedOut) : t.inProgress}</strong>
            <span>{date.format(game.updatedAt)} · {fill(t.callCount,{n:game.calls.length})}</span>
          </span>
          <span aria-hidden="true">›</span>
        </button></li>;
      })}
    </ul> : <p className="empty">{t.emptyHistory}</p>}
  </>;
}

const marks = { P:'P', X:'X', XX:'XX' };
function Timeline({ calls, dealer, player, done, showSeats, t, onInspect, onEdit, active }) {
  const scroll = useRef(null);
  useEffect(()=>{
    const area=scroll.current;
    if (area && !done) area.scrollLeft=area.scrollWidth;
  },[calls.length,done]);
  return <section className={'timeline panel '+(done?'expanded':'')}>
    <div className="timeline-head"><h2>{done?t.review:t.timeline}</h2>{!!calls.length && <p>{t.timelineTip}</p>}</div>
    <div className="timeline-scroll" ref={scroll}>
      {calls.length ? <ol className="timeline-list">
        {calls.map((call,i)=>{
          const seat = seatAt(dealer,i);
          const role = seat===player ? 'mine' : side(seat)===side(player) ? 'partner' : 'opponent';
          return <li key={i}>
            {showSeats && <span className="timeline-seat" aria-hidden="true">{t[seat]}</span>}
            <button className={marks[call]?'timeline-mark mark-'+call:'timeline-chip'} data-role={role}
              aria-pressed={active===i} aria-label={t[seat]+' · '+callName(call,t)}
              onClick={()=>onInspect(i)} onDoubleClick={()=>onEdit(i)} onKeyDown={e=>{if(e.key==='F2'){e.preventDefault();onEdit(i);}}}>
              {marks[call] ? <span aria-hidden="true">{marks[call]}</span> : <Bid call={call} t={t}/>}
            </button>
          </li>;
        })}
      </ol> : <p className="timeline-empty">{t.timelineEmpty}</p>}
    </div>
  </section>;
}

export function Table({ game, onUpdate, onNew, t, settings, system, lang }) {
  const { calls, dealer, player, vulnerability } = game;
  const state = auctionState(dealer,calls);
  const [mode,setMode] = useState('guided');
  const [selection,setSelection] = useState(null);
  const [revealed,setRevealed] = useState(false);
  const [inspected,setInspected] = useState(null);
  const [editIndex,setEditIndex] = useState(null);
  const [replacement,setReplacement] = useState(null);
  const [showConfig,setShowConfig] = useState(false);
  const mine = state.seat===player;
  const teammate = side(state.seat)===side(player);
  const guided = mine && mode==='guided';
  const rules = state.done ? [] : system.rulesFor(game);
  const editGame = editIndex===null ? null : {...game,calls:calls.slice(0,editIndex)};
  const editState = editGame ? auctionState(dealer,editGame.calls) : null;
  function select(call) { setSelection(call); setRevealed(false); }
  function update(nextCalls) {
    onUpdate(nextCalls);
    select(null);
    setInspected(null);
    window.scrollTo(0,0);
  }
  function openEdit(index) { setEditIndex(index); setReplacement(null); }
  function commit() {
    if (state.legal.includes(selection)) update([...calls,selection]);
  }
  function edit() {
    if (!editState.legal.includes(replacement)) return;
    update(replaceCall(dealer,calls,editIndex,replacement));
    setEditIndex(null);
  }
  return <div className="table-page">
    <h1 className="visually-hidden">{t.table}</h1>
    {state.done && <section className="result panel" aria-live="polite">
      <div><div className="overline">{t.finished}</div><h2>{state.contract?t.contract:t.passedOut}</h2>
        {state.contract && <p>{t.declarer+' · '+t[state.declarer]}</p>}</div>
      <Contract state={state} t={t}/>
    </section>}
    <Timeline calls={calls} dealer={dealer} player={player} done={state.done} showSeats={settings.showTimelineSeats}
      t={t} onInspect={setInspected} onEdit={openEdit} active={inspected}/>
    {inspected!==null && <section className="panel timeline-meaning" aria-live="polite">
      <div className="timeline-head">
        <h2>{callName(calls[inspected],t)}</h2>
        <div className="inspect-actions">
          <button className="button outline" onClick={()=>openEdit(inspected)}>{t.edit}</button>
          <button className="icon-button" onClick={()=>setInspected(null)} aria-label={t.close}>×</button>
        </div>
      </div>
      <Meaning call={calls[inspected]} rules={system.rulesFor({...game,calls:calls.slice(0,inspected)})} lang={lang} t={t}/>
    </section>}
    {!state.done && <section className="panel work-panel">
      <div className="work-head">
        <div><div className="overline">{mine?t.mine:teammate?t.partner:t.opponent}</div><h2>{fill(t.turn,{seat:t[state.seat]})}</h2></div>
        {mine && <div className="segmented mode-switch">
          <button aria-pressed={guided} onClick={()=>setMode('guided')}>{t.guided}</button>
          <button aria-pressed={!guided} onClick={()=>setMode('grid')}>{t.grid}</button>
        </div>}
      </div>
      {guided ? <Guided key={calls.join(',')} rules={rules} legal={state.legal} selected={selection} onSelect={select} settings={settings} t={t} lang={lang}/>
        : <Grid legal={state.legal} call={selection} onSelect={select} t={t}/>}
    </section>}
    <div className="table-dock">
      <button className="icon-button config-button" onClick={()=>setShowConfig(true)} aria-label={t.tableConfig}>⚙</button>
      <button className="button outline" disabled={!calls.length} onClick={()=>update(calls.slice(0,-1))}>{t.undo}</button>
      <button className={state.done?'button primary':'button outline'} onClick={onNew}>{t.newAuction}</button>
    </div>
    {showConfig && <Modal title={t.tableConfig} t={t} onClose={()=>setShowConfig(false)}>
      <dl className="config-details">
        {fields.map(([key])=><div key={key}><dt>{fieldLabel(key,t)}</dt><dd>{t[game[key]]}</dd></div>)}
        <div><dt>{t.system}</dt><dd>{system.name[lang]} v{system.version}</dd></div>
      </dl>
    </Modal>}
    {selection && <Modal title={callName(selection,t)} t={t} onClose={()=>select(null)}>
      {guided && !settings.skipRecall && !revealed ? <>
        <p className="hint">{t.beforeReveal}</p>
        <div className="modal-actions"><button className="button primary" onClick={()=>setRevealed(true)}>{t.reveal}</button></div>
      </> : <>
        <Meaning call={selection} rules={rules} t={t} lang={lang}/>
        <div className="modal-actions"><button className="button primary" onClick={commit}>{t.commit} <span aria-hidden="true">→</span></button></div>
      </>}
    </Modal>}
    {editGame && <Modal title={fill(t.editing,{n:editIndex+1})} t={t} onClose={()=>setEditIndex(null)}>
      <p className="hint">{t.editHint}</p>
      <Grid legal={editState.legal} call={replacement} onSelect={setReplacement} t={t}/>
      {replacement && <Meaning call={replacement} rules={system.rulesFor(editGame)} lang={lang} t={t}/>}
      <div className="modal-actions"><button className="button outline" onClick={()=>setEditIndex(null)}>{t.cancel}</button><button className="button primary" disabled={!replacement} onClick={edit}>{t.editAction}</button></div>
    </Modal>}
  </div>;
}
