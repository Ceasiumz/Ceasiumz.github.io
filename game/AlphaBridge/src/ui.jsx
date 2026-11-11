import React, { useEffect, useRef } from 'react';
import { bidLabel, strain, suits } from './auction.js';

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
  return <dialog ref={ref} className="modal" onCancel={e=>{e.preventDefault();onClose();}}
    onClick={e=>{if(e.target===e.currentTarget)onClose();}} aria-label={title}>
    <div className="modal-body">
      <div className="modal-title"><h2>{title}</h2><button className="icon-button" type="button" onClick={onClose} aria-label={t.close}>×</button></div>
      {children}
    </div>
  </dialog>;
}
export function Meaning({ call, rules, t, lang }) {
  const matches = rules.filter(rule=>rule.call===call);
  return <div className="meaning">
    {matches.length ? matches.map((rule,i)=><div key={i} className="meaning-rule">
      <h3>{rule.name[lang]}</h3><p>{rule.text[lang]}</p>
    </div>) : <p>{call==='P'?t.noPassRule:t.noRule}</p>}
  </div>;
}

export const callName = (call, t) => ({ P:t.pass, X:t.double, XX:t.redouble }[call] ?? bidLabel(call));
export const fill = (text, values) => text.replace(/\{(\w+)\}/g, (_, key) => values[key]);
