import React, { useEffect, useRef, useState } from 'react';
import { bidLabel, strain, suits } from './auction.js';
import { contextualTerms } from './glossary.js';

export function Bid({ call, t }) {
  const s = strain(call);
  if (call === 'P') return <span className="special-bid">{t.pass}</span>;
  if (call === 'X' || call === 'XX') return <span aria-label={call==='X'?t.double:t.redouble}>{bidLabel(call)}</span>;
  return <span className={'bid '+(['D','H'].includes(s)?'red':'')}><span>{call[0]}</span><span>{suits[s]}</span></span>;
}
export function Modal({ title, t, onClose, children }) {
  const ref = useRef(null);
  useEffect(()=>{
    const dialog = ref.current;
    const trigger = document.activeElement;
    dialog.showModal();
    return ()=>{
      dialog.close();
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus({preventScroll:true});
    };
  },[]);
  return <dialog ref={ref} className="modal" onCancel={e=>{e.preventDefault();e.stopPropagation();onClose();}}
    onClick={e=>{if(e.target===e.currentTarget)onClose();}} aria-label={title}>
    <div className="modal-body">
      <div className="modal-title"><h2>{title}</h2><button className="icon-button" type="button" onClick={onClose} aria-label={t.close}>×</button></div>
      {children}
    </div>
  </dialog>;
}
export function TermDialog({ entry, lang, t, onClose }) {
  return <Modal title={entry.name[lang]} t={t} onClose={onClose}>
    <p className="term-translation" lang={lang==='zh'?'en':'zh-CN'}>{entry.name[lang==='zh'?'en':'zh']}</p>
    <p>{entry.definition[lang]}</p>
  </Modal>;
}

export function RelatedTerms({ rules, lang, t }) {
  const [selected,setSelected] = useState(null);
  const terms = contextualTerms(rules).sort((a,b)=>a.name[lang].localeCompare(b.name[lang],lang));
  if (!terms.length) return null;
  return <section className="related-terms" aria-label={t.relatedTerms}>
    <h3>{t.relatedTerms}</h3>
    <div className="term-links">
      {terms.map(entry=><button type="button" key={entry.name.en} onClick={()=>setSelected(entry)} aria-haspopup="dialog">
        {entry.name[lang]}
      </button>)}
    </div>
    {selected && <TermDialog entry={selected} lang={lang} t={t} onClose={()=>setSelected(null)}/>}
  </section>;
}

export function Meaning({ call, rules, t, lang }) {
  const matches = rules.filter(rule=>rule.call===call);
  return <div className="meaning">
    <RelatedTerms rules={matches} lang={lang} t={t}/>
    {matches.length ? matches.map((rule,i)=><div key={i} className="meaning-rule">
      <h3>{rule.name[lang]}</h3><p>{rule.text[lang]}</p>
    </div>) : <p>{call==='P'?t.noPassRule:t.noRule}</p>}
  </div>;
}

export const callName = (call, t) => ({ P:t.pass, X:t.double, XX:t.redouble }[call] ?? bidLabel(call));
export const fill = (text, values) => text.replace(/\{(\w+)\}/g, (_, key) => values[key]);
