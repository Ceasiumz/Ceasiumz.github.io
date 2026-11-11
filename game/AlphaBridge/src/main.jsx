import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { systems } from './systems.js';
import { copy } from './copy.js';
import { loadCache, readLegacyPreferences, saveCache, saveGame } from './cache.js';
import { Library } from './library.jsx';
import { History, Setup, Table } from './simulator.jsx';
import './style.css';

const defaults = { lang:'zh', system:systems[0].id, skipRecall:false, skipSpecial:false, showTimelineSeats:false };
const systemIds = systems.map(system=>system.id);
const browserStorage = () => window.localStorage;
const feedbackEndpoint = import.meta.env.VITE_FEEDBACK_URL?.trim();
const menu = [['atlas','▤'],['simulation','♠'],['settings','⚙'],['about','ⓘ']];
const scenes = new Set(['menu', ...menu.map(([id])=>id), 'table', 'history']);
function readScene() {
  const hash = window.location.hash.slice(1);
  return scenes.has(hash) ? hash : 'menu';
}
const go = scene => { window.location.hash = scene; };

function MainScene({ t }) {
  return <>
    <div className="menu-hero">
      <div className="menu-cards" aria-hidden="true"><span>♥</span><span>♠</span></div>
      <h1>AlphaBridge</h1>
      <p>{t.assistant}</p>
    </div>
    <nav className="menu-grid" aria-label={t.menu}>
      {menu.map(([id,icon])=><a key={id} href={'#'+id} className="scene-entry">
        <span className="entry-icon" aria-hidden="true">{icon}</span><strong>{t[id]}</strong>
      </a>)}
    </nav>
  </>;
}

function StorageChoice({ t, consent, onChoice, failed }) {
  return <section className="panel consent-panel" aria-labelledby="storage-title">
    <h2 id="storage-title">{t.storage}</h2>
    <p>{consent==='allowed'?t.storageOn:consent==='denied'?t.storageOff:t.storagePrompt}</p>
    {failed && <p className="storage-error" role="status">{t.storageError}</p>}
    <div className="consent-actions">
      {consent!=='denied' && <button className="button outline" onClick={()=>onChoice('denied')}>{consent==='allowed'?t.revokeStorage:t.denyStorage}</button>}
      {consent!=='allowed' && <button className="button primary" onClick={()=>onChoice('allowed')}>{t.allowStorage}</button>}
    </div>
  </section>;
}

function Settings({ settings, onSetting, t, lang, install, onInstall }) {
  return <>
    <h1 className="scene-title">{t.settings}</h1>
    <section className="panel settings-panel">
      <label className="setting"><strong>{t.system}</strong>
        <select value={settings.system} onChange={e=>onSetting('system',e.target.value)}>{systems.map(system=><option value={system.id} key={system.id}>{system.name[lang]} v{system.version}</option>)}</select>
      </label>
      {['skipRecall','skipSpecial','showTimelineSeats'].map(id=><label className="setting" key={id}>
        <span><strong>{t[id]}</strong><small>{t[id+'Help']}</small></span><input type="checkbox" role="switch" checked={settings[id]} onChange={e=>onSetting(id,e.target.checked)}/>
      </label>)}
      <div className="setting"><span><strong>{t.install}</strong><small>{window.matchMedia('(display-mode: standalone)').matches?t.installed:t.installHint}</small></span>
        {install && <button className="button primary" onClick={onInstall}>{t.install}</button>}
      </div>
    </section>
  </>;
}

function About({ system, t, lang }) {
  const [report,setReport] = useState('');
  const [feedback,setFeedback] = useState(null);
  const sending = feedback?.status==='sending';
  const summary = report.trim().split('\n',1)[0].trim().slice(0,72);
  async function submitFeedback(event) {
    if (!feedbackEndpoint) return;
    event.preventDefault();
    if (!summary || sending) return;
    setFeedback({status:'sending'});
    try {
      const response = await fetch(feedbackEndpoint,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({body:report.trim()}),
      });
      if (response.status===429) {
        setFeedback({status:'rateLimited'});
        return;
      }
      if (response.status!==201) throw new Error('Issue creation failed');
      const {url} = await response.json();
      if (typeof url!=='string' || !/^https:\/\/github\.com\/Ceasiumz\/Ceasiumz\.github\.io\/issues\/[1-9]\d*$/.test(url)) {
        throw new Error('Invalid issue URL');
      }
      setFeedback({status:'submitted',url});
      setReport('');
    } catch {
      setFeedback({status:'submitError'});
    }
  }
  return <>
    <h1 className="scene-title">{t.about}</h1>
    <section className="panel about-panel">
      <p className="about-brand">AlphaBridge</p>
      <dl className="credits">
        <div><dt>Development</dt><dd>香港中文大学深圳桥牌社</dd></div>
        <div><dt>Programming</dt><dd><a href="https://ceasiumz.github.io/" target="_blank" rel="noreferrer">Ceasium ↗</a></dd></div>
      </dl>
      <a className="source-link" href={system.sourceUrl} target="_blank" rel="noreferrer">{system.source[lang]} ↗</a>
    </section>
    <form className="panel feedback-form" action={feedbackEndpoint ? undefined : 'https://github.com/Ceasiumz/Ceasiumz.github.io/issues/new'}
      onSubmit={submitFeedback}
      method={feedbackEndpoint?'post':'get'} target={feedbackEndpoint?undefined:'_blank'}
      rel="noopener noreferrer" aria-labelledby="feedback-title">
      <h2 id="feedback-title">{t.feedback}</h2>
      <label htmlFor="feedback-body">{t.feedbackDescription}</label>
      <textarea id="feedback-body" name="body" rows={4} maxLength={600} required disabled={sending}
        value={report} onChange={event=>{setReport(event.target.value);setFeedback(null);}} aria-describedby="feedback-help"/>
      {!feedbackEndpoint && <input type="hidden" name="title" value={'[AlphaBridge] '+summary}/>}
      <p className="hint" id="feedback-help">{feedbackEndpoint?t.anonymousFeedbackHelp:t.feedbackHelp}</p>
      <button className="button primary" type="submit" disabled={!summary || sending}>
        {feedbackEndpoint ? (sending?t.sendingFeedback:t.sendFeedback) : t.openIssue}
        {!feedbackEndpoint && <span aria-hidden="true">↗</span>}
      </button>
      {feedback && !sending && <p className="hint" role="status">
        {t[feedback.status]} {feedback.url && <a className="source-link" href={feedback.url} target="_blank" rel="noreferrer">{t.viewIssue} ↗</a>}
      </p>}
    </form>
  </>;
}

function App() {
  const [cache,setCache] = useState(()=>loadCache(browserStorage,defaults,systemIds));
  const [route,setRoute] = useState(readScene);
  const [storageFailed,setStorageFailed] = useState(false);
  const [install,setInstall] = useState(null);
  const main = useRef(null);
  const modified = useRef(new Set());
  const { consent, data } = cache;
  const { settings, games, activeId } = data;
  const active = games.find(game=>game.id===activeId);
  const scene = route==='table' && !active ? 'simulation' : route;
  const lang = settings.lang;
  const t = copy[lang];
  const system = systems.find(item=>item.id===settings.system);
  const tableSystem = active && systems.find(item=>item.id===active.system);

  useEffect(()=>{
    const change = ()=>{
      setRoute(readScene());
      window.scrollTo(0,0);
    };
    window.addEventListener('hashchange',change);
    return ()=>window.removeEventListener('hashchange',change);
  },[]);
  useEffect(()=>{
    document.documentElement.lang=lang==='en'?'en':'zh-CN';
    document.title='AlphaBridge · '+t.assistant;
  },[lang,t]);
  useEffect(()=>{
    if (scene!=='menu') main.current?.focus({preventScroll:true});
  },[scene]);
  useEffect(()=>{
    try { saveCache(browserStorage,consent,data); setStorageFailed(false); }
    catch { setStorageFailed(true); }
  },[consent,data]);
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

  function onSetting(key,value) {
    modified.current.add(key);
    setCache(current=>({...current,data:{...current.data,settings:{...current.data.settings,[key]:value}}}));
  }
  function onChoice(choice) {
    const legacy = choice==='allowed' && consent===null ? readLegacyPreferences(browserStorage,defaults,systemIds) : null;
    const overrides = legacy ? Object.fromEntries(Object.entries(legacy).filter(([key])=>!modified.current.has(key))) : {};
    setCache(current=>({...current,consent:choice,data:{...current.data,settings:{...current.data.settings,...overrides}}}));
  }
  function start(config) {
    const id = Array.from(crypto.getRandomValues(new Uint32Array(4)), word=>word.toString(16).padStart(8,'0')).join('');
    const game = {...config,id,system:settings.system,updatedAt:Date.now(),calls:[]};
    setCache(current=>({...current,data:saveGame(current.data,game)}));
    go('table');
  }
  function updateCalls(calls) {
    const game = {...active,calls,updatedAt:Date.now()};
    setCache(current=>({...current,data:saveGame(current.data,game)}));
  }
  function openGame(id) {
    setCache(current=>({...current,data:{...current.data,activeId:id}}));
    go('table');
  }
  const back = scene==='table'||scene==='history'?'simulation':'menu';
  const storagePanel = <StorageChoice t={t} consent={consent} failed={storageFailed} onChoice={onChoice}/>;

  return <>
    <header className="topbar"><div className="top-inner">
      <div className="top-left">
        {scene!=='menu' && <a className="icon-button back-button" href={'#'+back} aria-label={t.back}>‹</a>}
        <a className="brand" href="#menu" aria-label={t.menu}><span className="brand-icon" aria-hidden="true">♠</span><span>AlphaBridge</span></a>
      </div>
      <div className="language-switch" role="group" aria-label={t.language}>
        <button type="button" lang="zh-CN" aria-pressed={lang==='zh'} onClick={()=>onSetting('lang','zh')}><span>中文</span></button>
        <span className="language-divider" aria-hidden="true">/</span>
        <button type="button" lang="en" aria-pressed={lang==='en'} onClick={()=>onSetting('lang','en')}><span>EN</span></button>
      </div>
    </div></header>
    <main className={'container scene-'+scene} tabIndex={-1} ref={main}>
      {scene==='menu' && <><MainScene t={t}/>{(!consent || storageFailed) && storagePanel}</>}
      {scene==='atlas' && <><h1 className="scene-title">{t.atlas}</h1><Library system={system} lang={lang} t={t}/></>}
      {scene==='simulation' && <>
        <Setup active={active} onStart={start} onResume={()=>go('table')} onHistory={()=>go('history')} t={t}/>
        {(!consent || storageFailed) && storagePanel}
      </>}
      {scene==='table' && <Table key={active.id} game={active} onUpdate={updateCalls} onNew={()=>go('simulation')} t={t} settings={settings} system={tableSystem} lang={lang}/>}
      {scene==='history' && <History games={games} onOpen={openGame} t={t} lang={lang}/>}
      {scene==='settings' && <>
        <Settings settings={settings} onSetting={onSetting} t={t} lang={lang} install={install}
          onInstall={async()=>{try{await install.prompt();}finally{setInstall(null);}}}/>
        {storagePanel}
      </>}
      {scene==='about' && <About system={system} t={t} lang={lang}/>}
    </main>
  </>;
}

createRoot(document.getElementById('root')).render(<App/>);
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  const register = () => navigator.serviceWorker.register(new URL('./sw.js',document.baseURI)).catch(console.error);
  if (document.readyState==='complete') register();
  else window.addEventListener('load',register,{once:true});
}
