import React, { useState } from 'react';
import { bidLabel, strain } from './auction.js';
import { Bid, Modal, Meaning, callName } from './ui.jsx';

export function Library({ system, lang, t }) {
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
    {selected && <Modal title={callName(selected.rule.call,t)} t={t} onClose={()=>setSelected(null)}>
      {!!selected.seq.length && <p className="context-line">{t.context} <span>{selected.seq.map(call=>callName(call,t)).join(' → ')}</span></p>}
      <Meaning call={selected.rule.call} rules={[selected.rule]} lang={lang} t={t}/>
    </Modal>}
  </>;
}

