const scenarios = ['Conservativo','Media','Ottimistico'];
const val = id => parseFloat(document.getElementById(id).value) || 0;
const bench = (cls, i) => parseFloat(document.querySelectorAll('.'+cls)[i].value) || 0;
const eur = n => '€' + Math.round(n).toLocaleString('it-IT');

function compute(){
  const employees=val('employees'), hires=val('hires'), exits=val('exits'),
        itCost=val('itCost'), empCost=val('empCost'), saasSpend=val('saasSpend'),
        onboardHrs=val('onboardHrs'), offboardHrs=val('offboardHrs'),
        tickets=val('tickets'), ticketMin=val('ticketMin'),
        pricePerEmp=val('pricePerEmp'), implCost=val('implCost'),
        fineProb=val('fineProb')/100, fineEst=val('fineEst');
  const nis2On = document.getElementById('nis2Switch').value==='yes';
  const cyberOn = document.getElementById('cyberSwitch').value==='yes';

  const annualSub = employees*pricePerEmp*12;
  const cost1 = annualSub+implCost;
  const cost3 = annualSub*3+implCost;

  const results = scenarios.map((name,i)=>{
    const saasWaste=bench('b-saasWaste',i)/100, itHrsWeek=bench('b-itHrsWeek',i),
          auditHrs=bench('b-auditHrs',i), aiRes=bench('b-aiRes',i)/100,
          consolidation=bench('b-consolidation',i), attritionHrs=bench('b-attritionHrs',i),
          cyberProb=bench('b-cyberProb',i)/100, cyberImpact=bench('b-cyberImpact',i);

    const itTime=(hires*onboardHrs+exits*offboardHrs)*itCost + (itHrsWeek*52)*itCost;
    const saas=saasSpend*saasWaste;
    const productivity=employees*attritionHrs*empCost;
    const ticketCostYr=tickets*12*(ticketMin/60)*itCost;
    const ticketsDeflected=ticketCostYr*aiRes;
    const audit=auditHrs*itCost;
    let total=itTime+saas+productivity+ticketsDeflected+consolidation+audit;

    const cyberAvoided=cyberProb*cyberImpact;
    const nis2Avoided=fineProb*fineEst;
    if(cyberOn) total+=cyberAvoided;
    if(nis2On) total+=nis2Avoided;

    const net1=total-cost1, roi1=net1/cost1*100, payback=cost1/(total/12), bc=total/cost1;
    const total3=total*3, net3=total3-cost3, roi3=net3/cost3*100;
    return {name,itTime,saas,productivity,ticketsDeflected,consolidation,audit,cyberAvoided,nis2Avoided,total,net1,roi1,payback,bc,total3,net3,roi3};
  });

  return {results, annualSub, cost1, cost3, nis2On, cyberOn};
}

function render(){
  const {results, cost1} = compute();
  const media = results[1];
  document.getElementById('headlineRoi').textContent = Math.round(media.roi1)+'%';
  document.getElementById('headlineSide').innerHTML =
    `<b>${eur(media.net1)}</b> beneficio netto Anno 1 · <b>${media.payback.toFixed(1)} mesi</b> di payback · <b>${eur(media.net3)}</b> netti in 3 anni`;

  const rows = [
    ['Risparmio annuo totale (€)', r=>eur(r.total), true],
    ['&nbsp;&nbsp;di cui tempo IT risparmiato (€)', r=>eur(r.itTime)],
    ['&nbsp;&nbsp;di cui ottimizzazione SaaS (€)', r=>eur(r.saas)],
    ['&nbsp;&nbsp;di cui produttività utente (€)', r=>eur(r.productivity)],
    ['&nbsp;&nbsp;di cui ticket deviati – AI (€)', r=>eur(r.ticketsDeflected)],
    ['&nbsp;&nbsp;di cui consolidamento strumenti (€)', r=>eur(r.consolidation)],
    ['&nbsp;&nbsp;di cui audit e compliance (€)', r=>eur(r.audit)],
    ['(–) Costo totale Anno 1 (€)', ()=>eur(cost1)],
    ['(=) Beneficio netto Anno 1 (€)', r=>eur(r.net1), true],
    ['ROI Anno 1 (%)', r=>r.roi1.toFixed(1)+'%', true],
    ['Periodo di payback (mesi)', r=>r.payback.toFixed(1)],
    ['Rapporto beneficio-costo', r=>r.bc.toFixed(1)+'x'],
    ['Beneficio netto a 3 anni (€)', r=>eur(r.net3), true],
    ['ROI a 3 anni (%)', r=>r.roi3.toFixed(1)+'%'],
  ];
  document.getElementById('resultsBody').innerHTML = rows.map(([label,fn,hi])=>
    `<tr><td class="lab">${label}</td>${results.map(r=>`<td class="${hi?'hi':''}">${fn(r)}</td>`).join('')}</tr>`
  ).join('');
}

document.querySelectorAll('input,select').forEach(el=>el.addEventListener('input',render));
render();

document.getElementById('confirmBtn').addEventListener('click',()=>{
  document.getElementById('exportBtn').classList.remove('hidden');
});

document.getElementById('exportBtn').addEventListener('click',()=>{
  const {results} = compute();
  const m = results[1];
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="900" height="500" font-family="DM Sans, sans-serif">
    <rect width="900" height="500" rx="24" fill="#ffffff"/>
    <rect width="900" height="140" rx="24" fill="url(#g)"/>
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#d9f7ed"/><stop offset="55%" stop-color="#ffffff"/><stop offset="100%" stop-color="#bdefdd"/>
    </linearGradient></defs>
    <text x="48" y="55" font-size="12" font-weight="700" letter-spacing="2" fill="#2e9b75">FACTORIAL IT · ROI ANNO 1</text>
    <text x="48" y="95" font-size="30" font-weight="700" fill="#1e1e31">Business Case — scenario Media</text>
    <text x="48" y="122" font-size="14" fill="#4c4c5e">100 dipendenti · modello live · EUR</text>
    <rect x="48" y="170" width="380" height="110" rx="16" fill="#d9f7ed" stroke="#42b891" stroke-width="1.5"/>
    <text x="70" y="225" font-size="40" font-weight="700" fill="#2e9b75">${Math.round(m.roi1)}%</text>
    <text x="70" y="250" font-size="13" fill="#4c4c5e">ROI ANNO 1</text>
    <rect x="460" y="170" width="392" height="110" rx="16" fill="#f4faf8" stroke="#e4ece9"/>
    <text x="482" y="225" font-size="30" font-weight="700" fill="#2e9b75">${eur(m.net3)}</text>
    <text x="482" y="250" font-size="13" fill="#4c4c5e">BENEFICIO NETTO A 3 ANNI</text>
    <text x="48" y="330" font-size="13" fill="#4c4c5e">Payback: ${m.payback.toFixed(1)} mesi   ·   Beneficio netto Anno 1: ${eur(m.net1)}   ·   Rapporto beneficio-costo: ${m.bc.toFixed(1)}x</text>
    <text x="48" y="470" font-size="10.5" fill="#86868f">Factorial IT · Business Case generato live · dati indicativi, da confermare con preventivo</text>
  </svg>`;
  const blob = new Blob([svg], {type:'image/svg+xml'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'factorial-it-roi-summary.svg';
  a.click();
});
