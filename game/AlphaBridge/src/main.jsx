import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { auctionState, bidLabel, replaceCall, seatAt, seats, side, strain, strains, suits } from './auction.js';
import { systems } from './systems.js';
import { copy } from './copy.js';
import './style.css';

const preferencesKey = 'alpha-bridge.preferences.v1';
const defaults = { lang:'zh', system:systems[0].id, skipRecall:false, skipSpecial:false };
const fill = (text, values) => text.replace(/\{(\w+)\}/g, (_, key) => values[key]);
function readPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(preferencesKey));
    return {
      ...defaults,
      system: systems.find(system=>system.id===saved?.system)?.id ?? defaults.system,
      lang: saved?.lang==='en' ? 'en' : 'zh',
      skipRecall: saved?.skipRecall===true,
      skipSpecial: saved?.skipSpecial===true,
    };
  } catch { return defaults; }
}

function Bid({ call, t }) {
  const s = strain(call);
  if (call === 'P') return <span className="special-bid">{t.pass}</span>;
  if (call === 'X' || call === 'XX') return <span aria-label={call==='X'?t.double:t.redouble}>{bidLabel(call)}</span>;
  return <span className={'bid '+(['D','H'].includes(s)?'red':'')}><span>{call[0]}</span><span>{suits[s]}</span></span>;
}
function Source({ system, t, page, children }) {
  return <a className="source-link" href={system.sourceUrl+(page ? '#page='+(page+system.pageOffset) : '')} target="_blank" rel="noreferrer">
    {children ?? (page ? fill(t.reference,{page}) : t.source)} <span aria-hidden="true">↗</span>
  </a>;
}
function Modal({ title, t, onClose, children }) {
  const ref = useRef(null);
  useEffect(()=>{
    const dialog = ref.current;
    dialog.showModal();
    return ()=>dialog.close();
  },[]);
  return <dialog ref={ref} className="modal" onCancel={e=>{e.preventDefault();onClose();}}
    onClick={e=>{if(e.target===e.currentTarget)onClose();}} aria-label={title}>
    <div className="modal-body">
      <div className="modal-title"><h2>{title}</h2><button className="icon-button" type="button" onClick={onClose} aria-label={t.close}>×</button></div>
      {children}
    </div>
  </dialog>;
}
function Meaning({ call, rules, t, lang, system, page }) {
  const matches = rules.filter(rule=>rule.call===call);
  return <div className="meaning">
    {matches.length ? matches.map((rule,i)=><div key={i} className="meaning-rule">
      <h3>{rule.name[lang]}</h3><p>{rule.text[lang]}</p><Source system={system} t={t} page={rule.page}/>
    </div>) : <>
      <p>{call==='P'?t.noPassRule:t.noRule}</p>
      <Source system={system} t={t} page={page}/>
    </>}
  </div>;
}
function CardArt() {
  return <div className="card-art" aria-hidden="true">
    <div className="orbit orbit-a"/><div className="orbit orbit-b"/>
    <div className="playing-card back-card"><span>A<br/>♥</span><b>♥</b><span>A<br/>♥</span></div>
    <div className="playing-card front-card"><span>A<br/>♠</span><b>♠</b><span>A<br/>♠</span></div>
  </div>;
}
function Library({ system, lang, t, onStart }) {
  const [group,setGroup] = useState('opening');
  const [filter,setFilter] = useState('all');
  const [query,setQuery] = useState('');
  const [selected,setSelected] = useState(null);
  const search = query.toLowerCase().trim();
  const rows = system.library.filter(entry=>entry.group===group).flatMap((entry,i)=>entry.rules.map(rule=>({rule,seq:entry.seq,key:i+'-'+rule.call})));
  const filtered = rows.filter(({rule,seq})=>{
    const opening = group==='opening' ? rule.call : seq.find(call=>call!=='P');
    const denomination = strain(opening);
    const isPreempt = opening && denomination!=='NT' && (Number(opening[0])>=3 || ['2D','2H','2S'].includes(opening));
    const category = filter==='all' || (filter==='preempt' ? isPreempt : filter==='balanced' ? ['1NT','2NT'].includes(opening) : filter==='major' ? ['H','S'].includes(denomination) : ['C','D'].includes(denomination));
    const path = [...seq,rule.call];
    return category && (!search || [rule.name[lang],rule.text[lang],path.map(bidLabel).join(' '),path.join(' ')].some(value=>value.toLowerCase().includes(search)));
  });
  return <>
    <section className="hero">
      <CardArt/>
      <div className="hero-copy">
        <div className="system-caption"><span className="status-dot"/>{system.name[lang]} <span className="caption-version">V{system.version}</span></div>
        <h1>{t.hero}</h1><p>{t.intro}</p>
        <div className="hero-actions"><button className="button gold" onClick={onStart}>{t.simulation} <span aria-hidden="true">→</span></button>
          <Source system={system} t={t}/></div>
      </div>
    </section>
    <section className="library" aria-label={t.atlas}>
      <div className="section-header">
        <h2>{group==='opening'?t.browse:t[group]}</h2>
        <label className="search"><span aria-hidden="true">⌕</span><input type="search" aria-label={t.search} placeholder={t.search} value={query} onChange={e=>setQuery(e.target.value)}/></label>
      </div>
      <div className="category-bar">
        <div className="segmented" aria-label={t.context}>
          {['opening','responses','competition','slam'].map(id=><button key={id} aria-pressed={group===id} onClick={()=>{setGroup(id);setFilter('all');}}>{t[id]}</button>)}
        </div>
        {group!=='slam' && <div className="filters">
          {['all','minor','major','balanced','preempt'].map(id=><button key={id} aria-pressed={filter===id} onClick={()=>setFilter(id)}>{t[id]}</button>)}
        </div>}
      </div>
      <div className="library-grid">
        {filtered.map(item=>{
          const {rule,seq,key}=item;
          return <button className="library-card" key={key} onClick={()=>setSelected(item)}>
            <span className="bid-tile"><Bid call={rule.call} t={t}/></span>
            <span className="card-copy"><strong>{rule.name[lang]}</strong>
              <span>{group==='opening' ? rule.text[lang] : seq.filter(call=>call!=='P').map(bidLabel).join(' → ') || t.slam}</span>
            </span>
            <span className="card-arrow" aria-hidden="true">↗</span>
          </button>;
        })}
      </div>
      {!filtered.length && <p className="empty">{t.empty}</p>}
    </section>
    {selected && <Modal title={bidLabel(selected.rule.call)+' · '+selected.rule.name[lang]} t={t} onClose={()=>setSelected(null)}>
      {!!selected.seq.length && <p className="context-line">{t.context} <span>{selected.seq.map(call=>call==='P'?t.pass:bidLabel(call)).join(' → ')}</span></p>}
      <Meaning call={selected.rule.call} rules={[selected.rule]} system={system} lang={lang} t={t}/>
    </Modal>}
  </>;
}

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

function Timeline({ calls, dealer, done, t, onInspect, onEdit, active }) {
  const scroll = useRef(null);
  useEffect(()=>{
    const area=scroll.current;
    if (area && !done) area.scrollLeft=area.scrollWidth;
  },[calls.length,done]);
  return <section className={'timeline panel '+(done?'expanded':'')}>
    <div className="timeline-head"><h2><span aria-hidden="true">◷</span> {done?t.review:t.timeline}</h2><p>{t.timelineTip}</p></div>
    <div className="timeline-scroll" ref={scroll}>
      {calls.length ? <ol className="timeline-list">
        {calls.map((call,i)=><li key={i}>
          <span className="timeline-seat">{t[seatAt(dealer,i)]}</span>
          <button className="timeline-chip" aria-pressed={active===i} aria-label={t[seatAt(dealer,i)]+' '+(call==='P'?t.pass:bidLabel(call))} onClick={()=>onInspect(i)} onDoubleClick={()=>onEdit(i)} onKeyDown={e=>{if(e.key==='F2'){e.preventDefault();onEdit(i);}}}>
            <Bid call={call} t={t}/>
          </button>
        </li>)}
      </ol> : <p className="timeline-empty"><span/> {t.timelineEmpty}</p>}
    </div>
  </section>;
}
function Table({ game, setGame, t, settings, system, lang }) {
  const { calls, dealer, player, vulnerability } = game;
  const state=auctionState(dealer,calls);
  const [mode,setMode]=useState('guided');
  const [selection,setSelection]=useState(null);
  const [revealed,setRevealed]=useState(false);
  const [view,setView]=useState(null);
  const [replacement,setReplacement]=useState(null);
  const own=side(state.seat)===side(player);
  const guided=mode==='guided' && own;
  const rules=system.rulesFor(game);
  const editGame=view ? {...game,calls:calls.slice(0,view.index)} : null;
  const editState=editGame ? auctionState(dealer,editGame.calls) : null;
  function select(call) { setSelection(call); setRevealed(false); }
  function update(next) { setGame(next); select(null); setView(null); }
  function open(index, edit=false) { setView({index,edit}); setReplacement(null); }
  function commit() {
    if (state.legal.includes(selection)) update({...game,calls:[...calls,selection]});
  }
  function edit() {
    if (!editState.legal.includes(replacement)) return;
    update({...game,calls:replaceCall(dealer,calls,view.index,replacement)});
    setView(null);
  }
  const controls = [
    ['dealer',seats],['player',seats],['vulnerability',['none','ns','ew','both']],
  ];
  const resolved = state.done && state.contract;
  return <div className="table-page">
    <div className="page-header">
      <div><div className="overline">{system.name[lang]} · V{system.version}</div><h1>{t.table}</h1><p>{t.tableIntro}</p></div>
      <button className="button outline" onClick={()=>{if(!calls.length||state.done||window.confirm(t.restart)) update({...game,calls:[]});}}>{t.newAuction} <span aria-hidden="true">↺</span></button>
    </div>
    <div className="table-controls">
      {controls.map(([id,items])=><label key={id}>{t[id==='vulnerability'?'vul':id]}<select value={game[id]} disabled={id==='dealer'&&!!calls.length} onChange={e=>update({...game,[id]:e.target.value})}>
        {items.map(item=><option key={item} value={item}>{t[item]}</option>)}
      </select></label>)}
      {!!calls.length && <button className="text-button undo" onClick={()=>update({...game,calls:calls.slice(0,-1)})}>{t.undo}</button>}
    </div>
    {state.done && <section className="result panel" aria-live="polite">
      <div><div className="overline">{t.finished}</div><h2>{resolved?t.contract:t.passedOut}</h2>
        <p>{resolved?t.declarer+' · '+t[state.declarer]:t.passedDetail}</p></div>
      {resolved && <div className="result-bid"><Bid call={state.contract.call} t={t}/>{state.multiplier>1&&<span>{state.multiplier===2?'×':'××'}</span>}</div>}
    </section>}
    <Timeline calls={calls} dealer={dealer} done={state.done} t={t} onInspect={open} onEdit={i=>open(i,true)} active={view?.index}/>
    {view && !view.edit && <section className="panel timeline-meaning" aria-live="polite">
      <div className="timeline-head">
        <h2>{t[seatAt(dealer,view.index)]} · <Bid call={calls[view.index]} t={t}/></h2>
        <div className="inspect-actions">
          <button className="button outline" onClick={()=>open(view.index,true)}>{t.edit}</button>
          <button className="icon-button" onClick={()=>setView(null)} aria-label={t.close}>×</button>
        </div>
      </div>
      <Meaning call={calls[view.index]} rules={system.rulesFor(editGame)} system={system} lang={lang} t={t} page={system.referencePage(editGame.calls)}/>
    </section>}
    {!state.done && <div className="workspace-grid">
      <section className="panel work-panel">
        <div className="work-head">
          <div><div className="overline">{state.seat===player?t.mine:own?t.partner:t.opponent}</div><h2>{fill(t.turn,{seat:t[state.seat]})}</h2></div>
          {own && <div className="segmented">
            <button aria-pressed={mode==='guided'} onClick={()=>{setMode('guided');select(null);}}>{t.guided}</button>
            <button aria-pressed={mode==='grid'} onClick={()=>{setMode('grid');select(null);}}>{t.grid}</button>
          </div>}
        </div>
        {guided ? <Guided key={calls.join(',')+'-'+dealer+'-'+vulnerability} rules={rules} legal={state.legal} selected={selection} onSelect={select} settings={settings} t={t} lang={lang}/>
          : <><p className="hint">{t.directIntro}</p><Grid legal={state.legal} call={selection} onSelect={select} t={t}/></>}
      </section>
      <aside className="panel work-panel detail-panel">
        <h2>{t.selected}</h2>
        {selection ? <>
          <div className="bid-tile detail-bid"><Bid call={selection} t={t}/></div>
          {guided && !settings.skipRecall && !revealed ? <div className="meaning">
            <p>{t.beforeReveal}</p><button className="button outline" onClick={()=>setRevealed(true)}>{t.reveal}</button>
          </div> : <>
            <Meaning call={selection} rules={rules} t={t} lang={lang} system={system} page={system.referencePage(calls)}/>
            <button className="button primary" onClick={commit}>{t.commit} <span aria-hidden="true">→</span></button>
          </>}
        </> : <p className="hint">{t.pick}</p>}
      </aside>
    </div>}
    {view?.edit && <Modal title={fill(t.editing,{n:view.index+1})} t={t} onClose={()=>setView(null)}>
        <p className="hint">{t.editHint}</p>
        <Grid legal={editState.legal} call={replacement} onSelect={setReplacement} t={t}/>
        {replacement && <Meaning call={replacement} rules={system.rulesFor(editGame)} system={system} lang={lang} t={t} page={system.referencePage(editGame.calls)}/>}
        <div className="modal-actions"><button className="button outline" onClick={()=>setView(null)}>{t.cancel}</button><button className="button primary" disabled={!replacement} onClick={edit}>{t.editAction}</button></div>
    </Modal>}
  </div>;
}
function Settings({ settings, setSettings, t, lang, install, onInstall }) {
  const change=(key,value)=>setSettings(current=>({...current,[key]:value}));
  return <>
    <div className="page-header"><div><h1>{t.settings}</h1><p>{t.local}</p></div></div>
    <section className="panel settings-panel">
      <label className="setting"><span><strong>{t.language}</strong></span><select value={settings.lang} onChange={e=>change('lang',e.target.value)}>
        <option value="zh">简体中文 (zh-CN)</option><option value="en">English (en)</option>
      </select></label>
      <label className="setting"><span><strong>{t.system}</strong><small>{t.systemHint}</small></span>
        <select value={settings.system} onChange={e=>change('system',e.target.value)}>{systems.map(system=><option value={system.id} key={system.id}>{system.name[lang]} v{system.version}</option>)}</select>
      </label>
      {['skipRecall','skipSpecial'].map(id=><label className="setting" key={id}>
        <span><strong>{t[id]}</strong><small>{t[id+'Help']}</small></span><input type="checkbox" role="switch" checked={settings[id]} onChange={e=>change(id,e.target.checked)}/>
      </label>)}
      <div className="setting"><span><strong>{t.install}</strong><small>{window.matchMedia('(display-mode: standalone)').matches?t.installed:t.installHint}</small></span>
        {install && <button className="button primary" onClick={onInstall}>{t.install}</button>}
      </div>
    </section>
  </>;
}

function App() {
  const [tab,setTab] = useState('atlas');
  const [about,setAbout] = useState(false);
  const [settings,setSettings] = useState(readPreferences);
  const [game,setGame] = useState({dealer:'S',player:'S',vulnerability:'none',calls:[]});
  const [install,setInstall] = useState(null);
  const lang = settings.lang;
  const t = copy[lang];
  const system = systems.find(item=>item.id===settings.system) ?? systems[0];
  useEffect(()=>{
    document.documentElement.lang=lang==='en'?'en':'zh-CN';
    document.title='AlphaBridge · '+t.assistant;
    try { localStorage.setItem(preferencesKey,JSON.stringify(settings)); } catch { /* storage unavailable */ }
  },[settings,t,lang]);
  useEffect(()=>{
    function capture(event) { event.preventDefault(); setInstall(event); }
    const clear=()=>setInstall(null);
    window.addEventListener('beforeinstallprompt',capture);
    window.addEventListener('appinstalled',clear);
    return ()=>{
      window.removeEventListener('beforeinstallprompt',capture);
      window.removeEventListener('appinstalled',clear);
    };
  },[]);
  return <>
    <header className="topbar"><div className="top-inner">
      <button className="brand" onClick={()=>setTab('atlas')} aria-label="AlphaBridge">
        <span className="brand-icon" aria-hidden="true">♠</span><span>Alpha<span className="brand-bridge">Bridge</span><small>{t.assistant}</small></span>
      </button>
      <nav className="nav">
        {['atlas','simulation','settings','about'].map(id=><button key={id} aria-current={tab===id?'page':undefined}
          onClick={()=>id==='about'?setAbout(true):setTab(id)}><span aria-hidden="true">{{atlas:'▤',simulation:'◇',settings:'⚙',about:'ⓘ'}[id]}</span>{t[id]}</button>)}
      </nav>
    </div></header>
    <main className="container">
      {tab==='atlas' && <Library system={system} lang={lang} t={t} onStart={()=>setTab('simulation')}/>}
      {tab==='simulation' && <Table game={game} setGame={setGame} t={t} settings={settings} system={system} lang={lang}/>}
      {tab==='settings' && <Settings settings={settings} setSettings={setSettings} t={t} lang={lang} install={install}
        onInstall={async()=>{try{await install.prompt();}finally{setInstall(null);}}}/>}
    </main>
    <footer className="footer"><span>AlphaBridge</span><Source system={system} t={t}>{t.fullSource}</Source></footer>
    {about && <Modal title={t.about} t={t} onClose={()=>setAbout(false)}>
      <p className="about-brand">AlphaBridge</p>
      <dl className="credits">
        <div><dt>Development</dt><dd>香港中文大学深圳桥牌社</dd></div>
        <div><dt>Programming</dt><dd><a href="https://ceasium.github.io/" target="_blank" rel="noreferrer">Ceasium ↗</a></dd></div>
      </dl>
      <Source system={system} t={t}>{system.source[lang]}</Source>
    </Modal>}
  </>;
}

createRoot(document.getElementById('root')).render(<App/>);
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load',()=>navigator.serviceWorker.register(new URL('./sw.js',document.baseURI)).catch(console.error));
}
