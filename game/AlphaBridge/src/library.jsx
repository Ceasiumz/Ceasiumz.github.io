import React, { useId, useState } from 'react';
import { bidLabel, strain } from './auction.js';
import { glossary } from './glossary.js';
import { Bid, Modal, RelatedTerms, TermDialog, callName, fill } from './ui.jsx';

const groups = ['opening','responses','competition','slam','glossary'];
const filters = ['all','minor','major','balanced','preempt'];

function matchesBid({rule,seq}, group, filter, search) {
  const opening = group==='opening' ? rule.call : seq.find(call=>call!=='P');
  const denomination = strain(opening);
  const isPreempt = opening && denomination!=='NT' &&
    (Number(opening[0])>=3 || ['2D','2H','2S'].includes(opening));
  const category = {
    all:true, preempt:isPreempt, balanced:['1NT','2NT'].includes(opening),
    major:['H','S'].includes(denomination), minor:['C','D'].includes(denomination),
  };
  const path = [...seq,rule.call];
  return category[filter] && (!search || [
    ...Object.values(rule.name), ...Object.values(rule.text), path.map(bidLabel).join(' '), path.join(' '),
    bidLabel(rule.call),
  ].some(value=>value.toLowerCase().includes(search)));
}

function groupedBids(library, group) {
  const calls = new Map();
  for (const {seq,rules,condition} of library.filter(entry=>entry.group===group)) {
    for (const rule of rules) {
      if (!calls.has(rule.call)) calls.set(rule.call, []);
      calls.get(rule.call).push({rule,seq,condition});
    }
  }
  return [...calls].map(([call,entries])=>({call,entries}));
}

function BidDetails({ item, lang, t, onClose }) {
  const [activeIndex,setActiveIndex] = useState(null);
  const caseId = useId();
  const multiple = item.entries.length > 1;

  return <Modal title={callName(item.call,t)} t={t} onClose={onClose}>
    {!multiple && <RelatedTerms rules={[item.entries[0].rule]} lang={lang} t={t}/>}
    <ul className="bid-cases">
      {item.entries.map(({rule,seq,condition},index)=>{
        const active = activeIndex===index;
        const titleId = caseId+'-'+index;
        const content = <>
          <strong id={titleId}>{rule.name[lang]}</strong>
          {!!seq.length && <span className="case-sequence">
            <span>{t.exampleSequence}</span> {[...seq,rule.call].map(call=>callName(call,t)).join(' → ')}
          </span>}
          {condition && <span className="case-condition">{t[condition]}</span>}
          <span>{rule.text[lang]}</span>
        </>;

        return <li key={index} className={active?'active-case':undefined}>
          {multiple
            ? <button className="case-content case-select" type="button" aria-labelledby={titleId}
                aria-pressed={active} onClick={()=>setActiveIndex(index)}>
                {content}
                <span className="case-indicator" aria-hidden="true">{active?'✓':'›'}</span>
              </button>
            : <div className="case-content">{content}</div>}
          {active && <RelatedTerms rules={[rule]} lang={lang} t={t}/>}
        </li>;
      })}
    </ul>
  </Modal>;
}

function GlossaryList({ search, lang, t }) {
  const [selected,setSelected] = useState(null);
  const terms = glossary.filter(entry=>[
    ...Object.values(entry.name), ...Object.values(entry.definition), ...entry.aliases,
  ].some(value=>value.toLowerCase().includes(search)))
    .sort((a,b)=>a.name[lang].localeCompare(b.name[lang],lang));
  if (!terms.length) return <p className="empty">{t.emptyGlossary}</p>;
  return <>
    <div className="library-grid">
      {terms.map(entry=><button className="library-card glossary-card" key={entry.name.en} onClick={()=>setSelected(entry)} aria-haspopup="dialog">
        <span className="card-copy"><strong>{entry.name[lang]}</strong><span>{entry.definition[lang]}</span></span>
        <span className="card-arrow" aria-hidden="true">↗</span>
      </button>)}
    </div>
    {selected && <TermDialog entry={selected} lang={lang} t={t} onClose={()=>setSelected(null)}/>}
  </>;
}

export function Library({ system, lang, t }) {
  const [group,setGroup] = useState('opening');
  const [filter,setFilter] = useState('all');
  const [query,setQuery] = useState('');
  const [selected,setSelected] = useState(null);
  const search = query.toLowerCase().trim();
  const inGlossary = group==='glossary';
  const placeholder = inGlossary?t.searchGlossary:t.search;
  const visible = groupedBids(system.library,group).filter(item=>
    item.entries.some(entry=>matchesBid(entry,group,filter,search)));

  return <>
    <section className="library" aria-label={t.atlas}>
      <div className="section-header">
        <h2>{group==='opening'?t.browse:t[group]}</h2>
        <label className="search"><span aria-hidden="true">⌕</span><input type="search" aria-label={placeholder} placeholder={placeholder} value={query} onChange={e=>setQuery(e.target.value)}/></label>
      </div>
      <div className="category-bar">
        <div className="segmented" aria-label={t.context}>
          {groups.map(id=><button key={id} aria-pressed={group===id} onClick={()=>{setGroup(id);setFilter('all');}}>{t[id]}</button>)}
        </div>
        {!inGlossary && group!=='slam' && <div className="filters">
          {filters.map(id=><button key={id} aria-pressed={filter===id} onClick={()=>setFilter(id)}>{t[id]}</button>)}
        </div>}
      </div>
      {inGlossary ? <GlossaryList search={search} lang={lang} t={t}/> : <>
        <div className="library-grid">
          {visible.map(item=>{
            const {call,entries}=item;
            const names = [...new Set(entries.map(({rule})=>rule.name[lang]))];
            return <button className="library-card" key={call} onClick={()=>setSelected(item)} aria-haspopup="dialog">
              <span className="bid-tile"><Bid call={call} t={t}/></span>
              <span className="card-copy">
                <strong>{entries.length===1?names[0]:fill(t.ruleCount,{n:entries.length})}</strong>
                <span>{entries.length===1?entries[0].rule.text[lang]:names.join(lang==='zh'?'、':', ')}</span>
              </span>
              <span className="card-arrow" aria-hidden="true">↗</span>
            </button>;
          })}
        </div>
        {!visible.length && <p className="empty">{t.empty}</p>}
      </>}
    </section>
    {selected && <BidDetails key={selected.call} item={selected} lang={lang} t={t} onClose={()=>setSelected(null)}/>}
  </>;
}
