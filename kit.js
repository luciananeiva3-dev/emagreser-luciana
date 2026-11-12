/* ============================================================
   KIT EMAGRESER, COMPORTAMENTO COMPARTILHADO
   Este arquivo é usado por TODAS as ferramentas e pelo índice:
   salvar no navegador e no servidor, baixar e abrir a ficha, marcos,
   imprimir, menu, botões Anterior e Próxima e o envio para a Luciana.
   Os valores do servidor ficam em config.js, não aqui.
   Mexer aqui muda todas as ferramentas ao mesmo tempo. Para mudar
   um texto de ferramenta, abra o arquivo da própria ferramenta.
   ============================================================ */

/* ============================================================
   MODO ALTERNATIVO DE ENVIO (desligado)
   Hoje o botao "Enviar para a Luciana" manda a ficha para o Netlify Forms,
   e ela chega no painel e no e-mail da Luciana. Deixe esta linha VAZIA.
   Se um dia a Luciana preferir receber numa planilha, cole aqui a URL de
   um Apps Script publicado como aplicativo da web, por exemplo:
     var ENDPOINT_ALTERNATIVO = 'https://script.google.com/macros/s/XXXX/exec';
   Com a URL preenchida, o envio vai para la, e NAO mais para o Netlify.
   O corpo e um texto JSON com os campos: subject, nome, data, resumo, conteudo
   (a ficha completa em JSON, em texto), consentimento e bot-field (vazio).
   O script da planilha le esse JSON em e.postData.contents.
   O Apps Script ainda nao foi construido: testar antes de usar.
   ============================================================ */
var ENDPOINT_ALTERNATIVO = '';
(function(){
'use strict';
var KEY_BASE='emagreser-kit-v3',KEY=KEY_BASE;
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

/* ---------- onde estamos ---------- */
var RAIZ=document.body.getAttribute('data-raiz')||'';           /* '' no índice, '../' nas ferramentas */
var EMBED=/[?&]embed=1(&|$)/.test(location.search);              /* página lida às escondidas, só para montar o envio */

/* ---------- servidor: link pessoal da cliente ----------
   O link da cliente é index.html?c=CODIGO. O código viaja para todas as ferramentas pela navegação.
   Só salva no servidor se o config.js estiver preenchido e ligado E o link tiver código.
   ver=1 abre a ficha só para leitura (o link da Luciana): nada é salvo. */
var CFG=window.KIT_CONFIG||{};
var CFG_ON=CFG.ligado===true&&!!String(CFG.enderecoDoProjeto||'').trim()&&!!String(CFG.chavePublica||'').trim();
function qp(n){var m=new RegExp('[?&]'+n+'=([^&#]*)').exec(location.search);if(!m)return '';try{return decodeURIComponent(m[1])}catch(e){return ''}}
var CODIGO=CFG_ON&&!EMBED&&/^[A-Za-z0-9_-]{20,64}$/.test(qp('c'))?qp('c'):'';
var NUVEM=!!CODIGO;                                              /* salvando no servidor nesta página */
var LEITURA=NUVEM&&qp('ver')==='1';                              /* só leitura: não grava em lugar nenhum */
if(NUVEM)KEY=KEY_BASE+'-'+CODIGO;                                /* cada link tem a sua cópia neste navegador */
function sufixo(){return NUVEM?'?c='+CODIGO+(LEITURA?'&ver=1':''):''}

/* ---------- dados do kit (vêm de lista.js) ---------- */
var LISTA=window.KIT_LISTA;
var FASES=LISTA.fases;
var TODAS=LISTA.ferramentas.map(function(a){return {num:a[0],nome:a[1],fase:a[2],obj:a[3],id:a[4],arq:a[5]}});
var ATIVAS=TODAS;
function T(id){return ATIVAS.filter(function(t){return t.id===id})[0]}
function pad(n){return (n<10?'0':'')+n}
function hrefT(t){return (RAIZ?'':'ferramentas/')+t.arq+sufixo()}
function hrefIndice(){return RAIZ+'index.html'+sufixo()}

/* ---------- estado e armazenamento ---------- */
function blank(){return {v:3,f:{},ph:{},words:{sel:[],custom:[],log:[]},term:{log:[]},meta:{}}}
function str(v,max){return typeof v==='string'?v.slice(0,max||20000):''}
function norm(o){
  var b=blank(); if(!o||typeof o!=='object')return b;
  if(o.f&&typeof o.f==='object')Object.keys(o.f).forEach(function(k){if(typeof o.f[k]==='string')b.f[k]=o.f[k].slice(0,20000)});
  /* ficha da versão 1: o rastreador tinha 4 hábitos com nome sugerido (o nome só era gravado se a cliente o editasse).
     Se havia marcações em um hábito sem nome gravado, grava o nome que a versão 1 mostrava, para não perder nada. */
  if((o.v|0)<2&&o.f&&typeof o.f==='object'){var V1N=['Água','Mais vegetal','Mais fruta','Mais proteína'];
    for(var hh=1;hh<=4;hh++){if(typeof b.f['rt.h'+hh]==='string'&&b.f['rt.h'+hh].trim())continue;
      var tem=Object.keys(b.f).some(function(k){return k.indexOf('rt.'+hh+'.')===0&&(b.f[k]==='1'||b.f[k]==='0')});
      if(tem)b.f['rt.h'+hh]=V1N[hh-1]}}
  if(o.ph&&typeof o.ph==='object')Object.keys(o.ph).forEach(function(k){var v=o.ph[k];if(typeof v==='string'&&/^data:image\/(jpeg|png|webp);base64,/.test(v))b.ph[k]=v});
  if(o.words){
    if(Array.isArray(o.words.sel))b.words.sel=o.words.sel.map(function(x){return str(x,60)}).filter(Boolean);
    if(Array.isArray(o.words.custom))b.words.custom=o.words.custom.map(function(x){return str(x,60)}).filter(Boolean);
    if(Array.isArray(o.words.log))b.words.log=o.words.log.map(function(e){e=e||{};return {id:str(e.id,40),d:str(e.d,12),h:str(e.h,8),w:(Array.isArray(e.w)?e.w:[]).map(function(x){return str(x,60)}).filter(Boolean),t:str(e.t,3000)}});
  }
  if(o.term&&Array.isArray(o.term.log))b.term.log=o.term.log.map(function(e){e=e||{};return {id:str(e.id,40),d:str(e.d,12),h:str(e.h,8),ref:str(e.ref,40),a:str(e.a,3),du:str(e.du,3),p:str(e.p,3),tipo:str(e.tipo,12),obs:str(e.obs,3000),parei:str(e.parei,8)}});
  if(o.meta&&typeof o.meta==='object'){b.meta.lastExport=str(o.meta.lastExport,40);b.meta.dia=str(o.meta.dia,6);b.meta.lastSend=str(o.meta.lastSend,40);
    if(o.meta.marcos&&typeof o.meta.marcos==='object'){b.meta.marcos={};Object.keys(o.meta.marcos).forEach(function(k){var d=o.meta.marcos[k];if(typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&k.length<=40)b.meta.marcos[k]=d})}}
  return b;
}
var canStore=true;
try{localStorage.setItem(KEY+'-t','1');localStorage.removeItem(KEY+'-t')}catch(e){canStore=false}
function readStore(){if(LEITURA)return null;try{var r=localStorage.getItem(KEY);return r?JSON.parse(r):null}catch(e){return null}}
/* S é um único objeto que nunca troca de lugar: ao abrir uma ficha, o conteúdo é substituído por dentro. */
var S=norm(readStore());
function trocaS(novo){Object.keys(S).forEach(function(k){delete S[k]});Object.keys(novo).forEach(function(k){S[k]=novo[k]})}
var timer=null,toastT=null;
function toast(msg,err){var t=$('#toast');t.textContent=msg;t.classList.toggle('err',!!err);t.classList.add('show');clearTimeout(toastT);if(!err)toastT=setTimeout(function(){t.classList.remove('show')},1800)}
function aviso(msg,key,semBotao){var a=$('#aviso');a.hidden=false;a.setAttribute('data-key',key||'');a.innerHTML='<span></span>'+(semBotao?'':' <button type="button" class="btn sm" data-act="export">Baixar minha ficha agora</button>');a.firstChild.textContent=msg}
function semAviso(key){var a=$('#aviso');if(!a.hidden&&a.getAttribute('data-key')===key)a.hidden=true}
function saveNow(silent){
  clearTimeout(timer);timer=null;
  if(EMBED||LEITURA)return true;
  var json;
  try{json=JSON.stringify(S);localStorage.setItem(KEY,json)}
  catch(e){aviso('Não consegui guardar neste aparelho: o espaço acabou ou o navegador bloqueia o armazenamento. Baixe a sua ficha agora para não perder o que escreveu.','store');toast('Não foi possível salvar',true);return false}
  semAviso('store');
  if(json.length>3600000)aviso('Sua ficha está quase cheia. Baixe a sua ficha e evite novas fotos grandes.','cheia');else semAviso('cheia');
  if(!silent&&!NUVEM){var d=new Date();toast('Salvo às '+pad(d.getHours())+':'+pad(d.getMinutes()))}
  if(NUVEM)nuvemMudou();
  return true;
}
function touch(){if(EMBED||LEITURA)return;clearTimeout(timer);timer=setTimeout(saveNow,500);marcos()}
window.addEventListener('pagehide',function(){if(timer)saveNow(true);if(NUVEM&&!LEITURA)nuvemSaida()});
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden'){if(timer)saveNow(true);if(NUVEM&&!LEITURA)nuvemSaida()}});
if(!canStore&&!EMBED)setTimeout(function(){aviso('Este navegador não está guardando o que você escreve (talvez a navegação privada esteja ligada). Continue, mas baixe a sua ficha antes de sair.','store')},300);

/* ---------- camada de dados: servidor (Supabase) ----------
   O servidor guarda a ficha da cliente em uma tabela que ninguém lê direto.
   Só duas funções falam com ela (ler_ficha e gravar_ficha), e as duas exigem o código do link.
   As FOTOS nunca vão para o servidor: ficam só no aparelho.
   Regra de conflito: o que a cliente escreveu neste aparelho e ainda não chegou ao servidor
   (por falta de internet) vale mais do que o servidor. Fora isso, o servidor vale. */
var nuvem={busy:false,sincronizado:false,ultimo:null,t:null,retry:null,falhas:0,invalido:false,pushRev:0,rev:0};
function conteudoServidor(){var d=JSON.parse(JSON.stringify(S));d.ph={};return d}
function eSujo(){try{return localStorage.getItem(KEY+'-sujo')==='1'}catch(e){return nuvem.sujoMem===true}}
function marcaSujo(v){nuvem.sujoMem=!!v;try{if(v)localStorage.setItem(KEY+'-sujo','1');else localStorage.removeItem(KEY+'-sujo')}catch(e){}}
function rpc(nome,corpo,keepalive){
  var base=String(CFG.enderecoDoProjeto).trim().replace(/\/+$/,''),chave=String(CFG.chavePublica).trim();
  var h={'Content-Type':'application/json','apikey':chave};
  if(/^eyJ/.test(chave))h['Authorization']='Bearer '+chave;
  var ctl=('AbortController' in window)?new AbortController():null,to=setTimeout(function(){if(ctl)ctl.abort()},25000);
  var body=JSON.stringify(corpo),o={method:'POST',headers:h,body:body,signal:ctl?ctl.signal:undefined};
  if(keepalive&&body.length<60000)o.keepalive=true;
  return fetch(base+'/rest/v1/rpc/'+nome,o).then(function(r){
    clearTimeout(to);
    if(!r.ok){var e=new Error('http '+r.status);e.status=r.status;throw e}
    return r.json();
  },function(e){clearTimeout(to);throw e});
}
function nuvemFalhou(e){
  nuvem.falhas++;
  var rede=!e||!e.status||e.status>=500||e.status===408||e.status===429;
  aviso(rede?'Sem conexão com o servidor agora. Pode continuar escrevendo: o que você escreve está guardado neste aparelho e será salvo no servidor quando a conexão voltar.'
    :'Não consegui salvar no servidor agora. Pode continuar escrevendo: o que você escreve está guardado neste aparelho. Avise a Luciana se o aviso não sumir.','rede');
  clearTimeout(nuvem.retry);
  nuvem.retry=setTimeout(function(){if(nuvem.sincronizado)empurra();else puxa()},Math.min(60000,5000*Math.pow(2,Math.min(nuvem.falhas-1,4))));
}
function nuvemVoltou(){nuvem.falhas=0;clearTimeout(nuvem.retry);semAviso('rede')}
function nuvemMudou(){
  if(nuvem.invalido)return;
  var c=JSON.stringify(conteudoServidor());
  if(c===nuvem.ultimo&&!eSujo())return;
  if(c!==nuvem.ultimo){nuvem.rev++;marcaSujo(true)}
  clearTimeout(nuvem.t);nuvem.t=setTimeout(empurra,800);
}
function empurra(keepalive){
  if(nuvem.invalido||!NUVEM||LEITURA)return;
  if(!nuvem.sincronizado){if(!nuvem.puxando)puxa();return}
  if(nuvem.busy){nuvem.pushRev=-1;return}
  var snap=conteudoServidor(),str=JSON.stringify(snap),rev=nuvem.rev;
  nuvem.busy=true;
  rpc('gravar_ficha',{p_codigo:CODIGO,p_conteudo:snap},keepalive===true).then(function(r){
    nuvem.busy=false;
    if(r===null||r===false){nuvem.invalido=true;aviso('Este link não foi reconhecido pelo servidor. Pode continuar: o que você escreve fica só neste aparelho. Confira o link com a Luciana.','codigo');return}
    var voltou=nuvem.falhas>0;nuvem.ultimo=str;nuvemVoltou();
    if(rev!==nuvem.rev||nuvem.pushRev===-1){nuvem.pushRev=0;empurra();return}
    marcaSujo(false);
    var d=new Date();toast(voltou?'Conexão de volta. Tudo salvo às '+pad(d.getHours())+':'+pad(d.getMinutes()):'Salvo às '+pad(d.getHours())+':'+pad(d.getMinutes()));
  }).catch(function(e){nuvem.busy=false;nuvemFalhou(e)});
}
function nuvemSaida(){if(nuvem.sincronizado&&eSujo()&&!nuvem.busy&&!nuvem.invalido){clearTimeout(nuvem.t);empurra(true)}}
function servidorVazio(c){return !c||typeof c!=='object'||!Object.keys(c).some(function(k){var v=c[k];return v&&typeof v==='object'?Object.keys(v).some(function(x){var y=v[x];return Array.isArray(y)?y.length:(y&&typeof y==='object'?Object.keys(y).length:!!y)}):false})}
function reaplica(){applyFields();renderPhotos();if(TOOL&&TOOL.aoAbrirFicha)TOOL.aoAbrirFicha();marcos()}
function puxa(){
  if(nuvem.puxando)return;nuvem.puxando=true;
  rpc('ler_ficha',{p_codigo:CODIGO}).then(function(r){
    nuvem.puxando=false;nuvem.sincronizado=true;nuvemVoltou();
    if(!r){nuvem.invalido=true;aviso(LEITURA?'Este código não existe no servidor. Confira o link.':'Este link não foi reconhecido pelo servidor. Pode continuar: o que você escreve fica só neste aparelho. Confira o link com a Luciana.','codigo',LEITURA);return}
    var srv=norm(r.conteudo),srvStr=JSON.stringify((function(){var d=JSON.parse(JSON.stringify(srv));d.ph={};return d})());
    if(LEITURA){trocaS(srv);reaplica();return}
    var temSrv=!servidorVazio(r.conteudo);
    if(eSujo()||timer||(!temSrv&&temConteudo())){
      /* o que está neste aparelho vale mais: segue para o servidor */
      nuvem.ultimo=temSrv?srvStr:'';marcaSujo(true);nuvem.rev++;
      if(timer){saveNow(true)}
      empurra();return;
    }
    if(temSrv){var ph=S.ph;trocaS(srv);S.ph=ph;reaplica();nuvem.ultimo=JSON.stringify(conteudoServidor());try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
    else nuvem.ultimo=JSON.stringify(conteudoServidor());
  }).catch(function(e){nuvem.puxando=false;nuvemFalhou(e)});
}
window.addEventListener('online',function(){if(NUVEM&&!LEITURA&&nuvem.falhas){if(nuvem.sincronizado)empurra();else puxa()}});

function val(k){return (S.f[k]||'').trim()}
function today(){var d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function nowHM(){var d=new Date();return pad(d.getHours())+':'+pad(d.getMinutes())}
function fmt(iso){var m=/^(\d{4})-(\d{2})-(\d{2})/.exec(iso||'');return m?m[3]+'/'+m[2]+'/'+m[1]:(iso||'')}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}

/* ---------- construtores de campo ---------- */
function fid(k){return 'f_'+k.replace(/[^\w]/g,'_')}
function F(k,label,o){
  o=o||{};var id=fid(k),t=o.t||'text',ctl,hint=o.hint?'<p class="hint" id="'+id+'_h">'+o.hint+'</p>':'';
  var dsc=o.hint?' aria-describedby="'+id+'_h"':'';
  if(t==='area')ctl='<textarea id="'+id+'" data-k="'+k+'" rows="'+(o.rows||4)+'"'+(o.ph?' placeholder="'+esc(o.ph)+'"':'')+dsc+'></textarea>';
  else if(t==='line')ctl='<textarea class="ln" id="'+id+'" data-k="'+k+'" rows="1"'+dsc+'></textarea>';
  else if(t==='select')ctl='<select id="'+id+'" data-k="'+k+'"'+dsc+'>'+o.opts.map(function(x){return '<option value="'+esc(x[0])+'">'+esc(x[1])+'</option>'}).join('')+'</select>';
  else ctl='<input id="'+id+'" data-k="'+k+'" type="'+t+'"'+(o.im?' inputmode="'+o.im+'"':'')+' autocomplete="off"'+(o.ph?' placeholder="'+esc(o.ph)+'"':'')+dsc+'>';
  if(o.unit)ctl='<div class="inwrap">'+ctl+'<span class="unit" aria-hidden="true">'+o.unit+'</span></div>';
  return '<div class="fld">'+'<label for="'+id+'">'+label+'</label>'+hint+ctl+'</div>';
}
function PICK(k,label,hint){
  var id=fid(k),r='';
  for(var i=0;i<=10;i++)r+='<input type="radio" class="sr" id="'+id+'_'+i+'" name="'+id+'" data-k="'+k+'" value="'+i+'"><label for="'+id+'_'+i+'">'+i+'</label>';
  return '<fieldset class="fld"><legend>'+label+'</legend>'+(hint?'<p class="hint">'+hint+'</p>':'')+'<div class="pick-row">'+r+'</div></fieldset>';
}
function RADIOS(k,label,opts,hint){
  var id=fid(k);
  return '<fieldset class="fld"><legend>'+label+'</legend>'+(hint?'<p class="hint">'+hint+'</p>':'')+'<div class="radios">'+opts.map(function(o,i){return '<input type="radio" class="sr" id="'+id+'_'+i+'" name="'+id+'" data-k="'+k+'" value="'+esc(o[0])+'"><label for="'+id+'_'+i+'">'+o[1]+'</label>'}).join('')+'</div></fieldset>';
}
function PH(k,label){
  var id='ph_'+k.replace(/[^\w]/g,'_');
  return '<div class="photo" data-ph="'+k+'"><div class="lab" id="'+id+'_l">'+label+'</div><div class="pbox" role="img" aria-labelledby="'+id+'_l"><span class="pe">Sem foto ainda</span></div>'+
  '<input type="file" class="sr" id="'+id+'" accept="image/*" data-phin="'+k+'" aria-label="Escolher foto: '+esc(label)+'">'+
  '<label class="btn sm" for="'+id+'" data-phlab>Adicionar foto</label>'+
  '<button type="button" class="btn quiet" data-act="ph-rm" data-ph="'+k+'" hidden>Remover</button></div>';
}
var CK='<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10.5l4 4 8-9"/></svg>';
var XK='<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M5.5 5.5l9 9M14.5 5.5l-9 9"/></svg>';
function CB(k,label){var id=fid(k);return '<div class="cbw"><input type="checkbox" class="sr" id="'+id+'" data-k="'+k+'"><label class="cbl" for="'+id+'"><span>'+label+'</span></label></div>'}
function CBS(k,al){var id=fid(k);return '<span class="cbs"><input type="checkbox" class="sr" id="'+id+'" data-k="'+k+'"><label class="cbl" for="'+id+'"><span class="sr">'+al+'</span></label></span>'}
function INP(k,al,ph,im){return '<input type="text" id="'+fid(k)+'" data-k="'+k+'" autocomplete="off" aria-label="'+esc(al)+'"'+(ph?' placeholder="'+esc(ph)+'"':'')+(im?' inputmode="'+im+'"':'')+'>'}
function num(s){var n=parseFloat(String(s==null?'':s).replace(',','.'));return isNaN(n)?null:n}
function fnum(n){return String(Math.round(n*10)/10).replace('.',',')}
function sgn(n){return (n>0?'+':n<0?'−':'')+fnum(Math.abs(n))}
function mcOn(id){return val('mc.'+id)==='1'}
function cnt(prefix){var n=0;Object.keys(S.f).forEach(function(k){if(k.indexOf(prefix)===0&&S.f[k].trim())n++});return n}

/* ---------- leitura de dados que mais de uma ferramenta usa ----------
   O Rastreador de Hábitos grava, e a Revisão dos 30 Dias lê. A regra de contagem
   fica aqui para as duas contarem do mesmo jeito. */
/* A linha 1 já vem com Água. A linha 2 vem com a sugestão Dia sem doce e fritura (visto = passou o dia sem), editável e apagável. As linhas 3 e 4 ficam em branco: os próximos hábitos são combinados com cada cliente, no encontro. */
function rtRaw(h){var v=S.f['rt.h'+h];if(v===undefined)return h===1?'Água':(h===2?'Dia sem doce e fritura':'');return String(v).trim()}
function rtOn(h){return !!rtRaw(h)}
function rtName(h){return rtRaw(h)||('Hábito '+h)}
function rtCalc(h){
  var ok=0,ret=0,pend=false,retd=[],warn=[],run=0,pd=-9,pv='',last=0,d,v;
  if(!rtOn(h))return {ok:0,ret:0,retd:[],warn:[],open:0};
  for(d=1;d<=31;d++){
    v=S.f['rt.'+h+'.'+d];if(v!=='1'&&v!=='0')continue;
    if(v==='1'){ok++;if(pend){ret++;retd.push(d);pend=false}run=0}
    else{if(pd===d-1&&pv==='0')run++;else run=1;if(run>=2){warn.push(d-1,d)}pend=true}
    pd=d;pv=v;last=d;
  }
  return {ok:ok,ret:ret,retd:retd,warn:warn,open:run>=2?last:0};
}

/* ---------- marcos: quando uma ferramenta conta como conquistada ----------
   As seis primeiras ferramentas têm a regra aqui. As demais usam o botão
   Marcar como conquistado, e a regra de cada uma fica no arquivo dela. */
var BASE={
  formulario:function(){return !!val('q5')},
  mural:function(){return !!val('mural.mantra')},
  /* as fotos ficam só no aparelho: com o servidor ligado, um marco já registrado vale em qualquer aparelho */
  linha:function(){return ['peso','cintura','quadril','peito','braco','coxa','roupa','disp','sono'].every(function(k){return val('lp.'+k)})&&(['frente','lado','costas'].every(function(p){return S.ph['lp.'+p]})||(NUVEM&&!!(S.meta.marcos&&S.meta.marcos.linha)))},
  diario:function(){return !!val('dfim.gatilho')},
  palavras:function(){return S.words.sel.length>0||S.words.log.length>0},
  termometro:function(){return S.term.log.some(function(e){return e.parei==='sim'})}
};
function feitos(){
  var r={};
  ATIVAS.forEach(function(t){r[t.id]=BASE[t.id]?!!BASE[t.id]():mcOn(t.id)});
  return r;
}

/* ---------- a ferramenta desta página ---------- */
var TOOL=null;
function CKS(){return '<svg class="ck" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Marco conquistado"><circle cx="10" cy="10" r="9" stroke-width="1.6"/><path d="M5.5 10.5l3 3 6-7"/></svg>'}
/* partes que o kit coloca em volta de cada ferramenta: cabeçalho de impressão, voltar, anterior e próxima, envio e rodapé.
   Número, nome e fase vêm de lista.js. O miolo da ferramenta é HTML escrito no arquivo dela. */
function partes(id){
  var t=T(id),i=ATIVAS.indexOf(t),ant=ATIVAS[i-1],prox=ATIVAS[i+1];
  var pn='<nav class="pnav noprint" aria-label="Navegação entre as ferramentas">'+
    (ant?'<a class="btn sm" href="'+hrefT(ant)+'" rel="prev">Anterior: '+pad(ant.num)+' '+ant.nome+'</a>':'<span></span>')+
    (prox?'<a class="btn sm" href="'+hrefT(prox)+'" rel="next">Próxima: '+pad(prox.num)+' '+prox.nome+'</a>':'<span></span>')+'</nav>';
  return {
    topo:'<div class="printhead"><span class="brand">Emagre<span>SER</span></span><span data-print-nome></span><span>Impresso em <span data-print-date></span></span></div>'+
      '<a class="back" href="'+hrefIndice()+'"><i aria-hidden="true"></i>Voltar para o índice</a>'+pn,
    rodape:SENDBOX()+'<div class="foot noprint">'+(ant?'<a class="btn" href="'+hrefT(ant)+'">Anterior: '+ant.nome+'</a>':'')+'<a class="btn" href="'+hrefIndice()+'">Voltar para o índice</a>'+(prox?'<a class="btn pri" href="'+hrefT(prox)+'">Próxima ferramenta: '+prox.nome+'</a>':'')+'</div>'
  };
}
function decora(sh){var p=partes(TOOL.id);sh.insertAdjacentHTML('afterbegin',p.topo);sh.insertAdjacentHTML('beforeend',p.rodape)}
/* textos e linhas-modelo que moram no HTML da ferramenta, em <template> */
function preenche(txt,v,cru){return txt.replace(/\{(!?)(\w+)\}/g,function(_,r,k){var x=v&&v[k]!=null?String(v[k]):'';return (r||cru)?x:esc(x)})}
function msg(nome,v){var t=$('template[data-msg="'+nome+'"]');return t?preenche(t.content.textContent.trim(),v,true):''}
function row(nome,v){var t=$('template[data-row="'+nome+'"]');return t?preenche(t.innerHTML.trim(),v,false):''}

/* ---------- casca da página: menu, avisos, envio ---------- */
function casca(){
  var h='<a class="skip" href="#conteudo">Pular para o conteúdo</a>'+
  '<header class="topbar noprint"><a class="brand" href="'+hrefIndice()+'" aria-label="EmagreSER, índice das ferramentas">Emagre<span>SER</span></a><button type="button" class="btn sm" id="menuBtn" aria-expanded="false" aria-controls="side">Ferramentas</button></header>'+
  '<div id="aviso" class="aviso noprint" role="alert" hidden></div>'+
  '<div class="app"><aside class="side noprint" id="side" aria-label="Menu das ferramentas"><div class="brandblock"><a class="brand" href="'+hrefIndice()+'">Emagre<span>SER</span></a><div class="brandsub">Kit de ferramentas</div></div><nav id="nav" aria-label="Ferramentas"></nav>'+
  '<div class="actions"><button type="button" class="btn pri" data-act="export">Baixar minha ficha</button><button type="button" class="btn" data-act="import">Abrir ficha</button><p class="sidenote">'+(NUVEM?'Tudo o que você escreve fica guardado com o seu link e volta em qualquer aparelho. Baixe sua ficha de vez em quando, por segurança.':'Tudo o que você escreve fica guardado neste aparelho. Baixe sua ficha de vez em quando para não perder nada.')+'</p></div></aside>'+
  '<main class="main" id="conteudo" tabindex="-1"><div class="mainin" id="sheets"></div></main></div>'+
  '<div id="toast" class="toast noprint" role="status" aria-live="polite"></div>'+
  '<input type="file" id="fileImport" accept=".json,application/json" hidden>'+
  '<div class="env-ov noprint" id="envOv" hidden><div class="env-box" id="envBox" role="dialog" aria-modal="true" aria-labelledby="envT" tabindex="-1"><div id="envMain"><h2 id="envT">Enviar para a Luciana</h2><p class="hint">Confira antes de enviar. A Luciana recebe o que você escreveu até agora.</p>'+
  '<div class="fld" style="margin-top:12px"><label for="envNome">Seu nome</label><input type="text" id="envNome" autocomplete="name" maxlength="80"></div>'+
  '<div class="stats" aria-live="polite"><div class="stat"><b id="envTools">0</b><span>ferramentas com conteúdo</span></div><div class="stat"><b id="envMarcos">0</b><span>marcos conquistados</span></div></div>'+
  '<div class="env-foto" id="envFoto"></div>'+
  '<div class="env-ok"><div class="cbw"><input type="checkbox" class="sr" id="envOk"><label class="cbl" for="envOk"><span>Autorizo a Luciana a receber e guardar estas respostas para o meu acompanhamento.</span></label></div></div>'+
  '<p class="msg" id="envMsg" role="alert"></p>'+
  '<div class="env-fail" id="envFail" role="alert" hidden><p id="envFailTxt"></p><button type="button" class="btn pri" data-act="export">Baixar minha ficha</button></div>'+
  '<div class="env-act"><button type="button" class="btn pri" id="envGo">Enviar agora</button><button type="button" class="btn" id="envCancel">Cancelar</button></div></div>'+
  '<div id="envDone" hidden><h2 id="envDoneT" tabindex="-1">Enviado</h2><p class="lead" style="font-size:18px">A Luciana vai receber as suas respostas.</p><p class="hint" data-lastsend style="margin-top:10px"></p><p class="hint">Você pode enviar de novo quando quiser. Cada envio mostra como a sua ficha está naquele momento.</p><div class="env-act"><button type="button" class="btn pri" id="envClose">Fechar</button></div></div></div></div>';
  document.body.insertAdjacentHTML('afterbegin',h);
}
function buildNav(){
  var atual=TOOL?TOOL.id:'inicio';
  var home='<div class="navg"><a class="navi" href="'+hrefIndice()+'" data-r="inicio"><span class="home" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg></span><span class="t">Índice das ferramentas</span></a></div>';
  [0,1,2,3,4,5,6,7].forEach(function(f){home+='<div class="navg" role="group" aria-labelledby="nh'+f+'"><div class="navh" id="nh'+f+'">'+FASES[f]+'</div>'+ATIVAS.filter(function(t){return t.fase===f}).map(function(t){return '<a class="navi" href="'+hrefT(t)+'" data-r="'+t.id+'"><span class="n">'+t.num+'</span><span class="t">'+t.nome+'</span>'+CKS()+'</a>'}).join('')+'</div>'});
  $('#nav').innerHTML=home;
  var a=$('.navi[data-r='+atual+']');if(a)a.setAttribute('aria-current','page');
}
/* links "#ferramenta" escritos dentro do texto viram o endereço do arquivo da ferramenta */
function ligar(root){
  $$('a[href^="#"]',root).forEach(function(a){var id=a.getAttribute('href').slice(1),t=T(id);if(t)a.setAttribute('href',hrefT(t))});
}

/* ---------- vínculo dos campos ---------- */
function grow(t){if(t.tagName!=='TEXTAREA'||t.offsetParent===null)return;t.style.height='auto';t.style.height=(t.scrollHeight+3)+'px'}
function growAll(root){$$('textarea',root||document).forEach(grow)}
function applyFields(){
  $$('[data-k]').forEach(function(el){
    var k=el.getAttribute('data-k'),v=S.f[k]||'';
    if(k==='rt.h1'&&S.f[k]===undefined)v='Água';
    if(k==='rt.h2'&&S.f[k]===undefined)v='Dia sem doce e fritura';
    if(el.type==='checkbox')el.checked=(v==='1');else if(el.type==='radio')el.checked=(v===el.value);else el.value=v;
  });
  growAll();
}
function onField(e){
  var t=e.target,k=t.getAttribute&&t.getAttribute('data-k');
  if(k){
    if(t.type==='checkbox'){if(t.checked)S.f[k]='1';else delete S.f[k]}
    else if(t.type==='radio'){if(!t.checked)return;S.f[k]=t.value}
    else S.f[k]=t.value;
    if(t.tagName==='TEXTAREA')grow(t);
    touch();return;
  }
  if(TOOL&&TOOL.aoMudar&&TOOL.aoMudar(e))return;
  if(t.getAttribute&&t.getAttribute('data-phin')){var f=t.files&&t.files[0];if(f)addPhoto(t.getAttribute('data-phin'),f);t.value=''}
}
document.addEventListener('input',onField);
document.addEventListener('change',onField);

/* ---------- fotos ---------- */
function resize(file,side,q){
  return new Promise(function(res,rej){
    var u=URL.createObjectURL(file),im=new Image();
    im.onload=function(){URL.revokeObjectURL(u);var w=im.naturalWidth,h=im.naturalHeight,sc=Math.min(1,side/Math.max(w,h));w=Math.max(1,Math.round(w*sc));h=Math.max(1,Math.round(h*sc));
      var c=document.createElement('canvas');c.width=w;c.height=h;var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(im,0,0,w,h);res(c.toDataURL('image/jpeg',q))};
    im.onerror=function(){URL.revokeObjectURL(u);rej(new Error('img'))};
    im.src=u;
  });
}
function addPhoto(key,file){
  if(!/^image\//.test(file.type||'')){toast('Escolha um arquivo de imagem',true);setTimeout(function(){$('#toast').classList.remove('show','err')},2500);return}
  var prev=S.ph[key],tries=[[1000,.78],[800,.65],[640,.55]],i=0;
  function next(){
    if(i>=tries.length){
      if(prev)S.ph[key]=prev;else delete S.ph[key];
      renderPhotos();saveNow(true);
      aviso('Esta foto não coube no espaço guardado neste aparelho. Baixe a sua ficha, remova alguma foto antiga e tente de novo.','foto');
      setTimeout(function(){semAviso('foto')},9000);
      $('#toast').classList.remove('show','err');return;
    }
    var t=tries[i++];
    resize(file,t[0],t[1]).then(function(url){
      S.ph[key]=url;
      if(saveNow()){renderPhotos();marcos();return}
      if(!canStore){renderPhotos();marcos();return}
      next();
    }).catch(function(){aviso('Não consegui ler esta imagem. Tente outra foto.','foto');setTimeout(function(){semAviso('foto')},6000)});
  }
  next();
}
function renderPhotos(){
  $$('.photo').forEach(function(p){
    var k=p.getAttribute('data-ph'),box=$('.pbox',p),url=S.ph[k],lab=$('[data-phlab]',p),rm=$('[data-act=ph-rm]',p);
    box.classList.toggle('has',!!url);
    if(url){box.innerHTML='<img alt="" src="'+url+'">';lab.textContent='Trocar foto';rm.hidden=false}
    else{box.innerHTML='<span class="pe">Sem foto ainda</span>';lab.textContent='Adicionar foto';rm.hidden=true}
  });
}

/* ---------- marcos ---------- */
function marcosDaFerramenta(f){
  var id=TOOL.id,m=$('[data-marco='+id+']');if(!m)return;
  var d=!!f[id];
  m.classList.toggle('done',d);
  var ms0=$('[data-ms]',m),fd=function(){return typeof TOOL.msDone==='function'?TOOL.msDone():(TOOL.msDone||ms0.getAttribute('data-done'))};
  if(!TOOL.falta){ms0.textContent=d?fd():(TOOL.msTodo||ms0.getAttribute('data-todo'));return}
  var fl=TOOL.falta(),b=$('[data-mcb]',m),s=$('[data-ms]',m);
  s.textContent=d?fd():('Ainda a conquistar. '+(fl.length?'Falta: '+fl.join('; ')+'.':'Está tudo registrado. Toque em Marcar como conquistado.'));
  b.disabled=!d&&fl.length>0;
  b.textContent=d?'Desfazer a marcação':'Marcar como conquistado';
  b.classList.toggle('pri',!d&&!b.disabled);
}
function marcos(){
  var f=feitos(),mch=false,n=0;
  S.meta.marcos=S.meta.marcos||{};
  ATIVAS.forEach(function(t){if(f[t.id]){if(!S.meta.marcos[t.id]){S.meta.marcos[t.id]=today();mch=true}}else if(S.meta.marcos[t.id]){delete S.meta.marcos[t.id];mch=true}});
  if(mch&&!timer&&!EMBED)timer=setTimeout(saveNow,500);
  ATIVAS.forEach(function(t){
    var d=f[t.id];if(d)n++;
    var nv=$('.navi[data-r='+t.id+']');if(nv)nv.classList.toggle('done',d);
    var c=$('.tcard[data-tool='+t.id+']');if(c)c.classList.toggle('done',d);
    var q=$('.qitem[data-tool='+t.id+']');if(q)q.classList.toggle('done',d);
  });
  if(TOOL){marcosDaFerramenta(f);if(TOOL.dyn)TOOL.dyn()}
  var pg=$('#progresso');if(pg){
    $('[data-pg-n]',pg).textContent=n;$('[data-pg-t]',pg).textContent=ATIVAS.length;
    var bar=$('.pbar',pg);bar.setAttribute('aria-valuenow',n);bar.setAttribute('aria-valuemax',ATIVAS.length);$('span',bar).style.width=Math.round(n*100/ATIVAS.length)+'%';
    $('[data-pg-txt]',pg).textContent=n===1?'1 marco conquistado de '+ATIVAS.length+'.':n+' marcos conquistados de '+ATIVAS.length+'.';
  }
  renderEnvio();
  var le=$('#lastExp');if(le)le.textContent=S.meta.lastExport?'Última ficha baixada em '+fmt(S.meta.lastExport)+'.':'Você ainda não baixou a sua ficha.';
}

/* ---------- ficha: baixar e abrir ---------- */
function slug(s){return (s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40)}
function exportar(){
  S.meta.lastExport=today();saveNow(true);
  var nome=val('perfil.nome'),data={app:'emagreser-kit',versao:3,exportadoEm:new Date().toISOString(),nome:nome,dados:S};
  var blob=new Blob([JSON.stringify(data)],{type:'application/json'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download='ficha-emagreser'+(slug(nome)?'-'+slug(nome):'')+'-'+today()+'.json';
  document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},1500);
  marcos();toast('Ficha baixada');setTimeout(function(){$('#toast').classList.remove('show')},2200);
}
function temConteudo(){return Object.keys(S.f).some(function(k){return S.f[k].trim()})||Object.keys(S.ph).length||S.words.log.length||S.term.log.length||S.words.sel.length}
function importar(file){
  var r=new FileReader();
  r.onload=function(){
    var o;try{o=JSON.parse(r.result)}catch(e){o=null}
    if(!o||o.app!=='emagreser-kit'||!o.dados){alert('Este arquivo não parece ser uma ficha do kit EmagreSER. Escolha o arquivo que você baixou com o botão Baixar minha ficha.');return}
    if(temConteudo()&&!confirm('Abrir esta ficha vai substituir o que está guardado agora neste aparelho. Se quiser guardar o que está aqui, baixe a sua ficha antes. Continuar?'))return;
    trocaS(norm(o.dados));
    var ok=saveNow(true);
    applyFields();renderPhotos();if(TOOL&&TOOL.aoAbrirFicha)TOOL.aoAbrirFicha();marcos();
    if(ok){toast('Ficha aberta');setTimeout(function(){$('#toast').classList.remove('show')},2200)}
  };
  r.readAsText(file);
}

/* ---------- envio para a Luciana ---------- */
var FORM_NOME='ficha-emagreser';
var CONSENT='Autorizo a Luciana a receber e guardar estas respostas para o meu acompanhamento.';
var envOpener=null,envBusy=false,envCache=null;
function SENDBOX(home){
  if(NUVEM)return '';
  var btn='<button type="button" class="btn pri" data-act="env-open">Enviar para a Luciana</button>',last='<p class="hint" data-lastsend></p>';
  if(home)return '<div class="sendbox home noprint"><div class="sbtxt"><h2>Enviar para a Luciana</h2><p class="hint">Quando quiser que a Luciana veja o que você escreveu, toque no botão. Não precisa de cadastro. As suas fotos ficam só neste aparelho e não vão no envio. Você pode enviar de novo quando quiser: cada envio mostra como a sua ficha está naquele momento.</p>'+last+'</div>'+btn+'</div>';
  return '<div class="sendbox noprint"><div class="sbtxt"><p>Quer que a Luciana veja o que você escreveu?</p>'+last+'</div>'+btn+'</div>';
}
function dtBR(d){return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear()+' às '+pad(d.getHours())+':'+pad(d.getMinutes())}
function lastSendTxt(){
  var s=S.meta.lastSend;if(!s)return 'Você ainda não enviou a sua ficha para a Luciana.';
  var d=new Date(s);return isNaN(d.getTime())?'':'Último envio em '+dtBR(d)+'.';
}
function renderEnvio(){var t=lastSendTxt();$$('[data-lastsend]').forEach(function(e){e.textContent=t})}
function limpa(t){return String(t==null?'':t).replace(/\s+/g,' ').trim()}
function txtSem(el){var c=el.cloneNode(true);$$('[aria-hidden="true"]',c).forEach(function(n){n.parentNode.removeChild(n)});return limpa(c.textContent)}
function rotuloDe(el){
  if(el.type==='radio'){var fs=el.closest('fieldset'),lg=fs&&fs.querySelector('legend');if(lg)return txtSem(lg)}
  if(el.id){var l=document.querySelector('label[for="'+el.id+'"]');if(l){var t=txtSem(l);if(t)return t}}
  var al=el.getAttribute('aria-label');if(al)return limpa(al);
  return el.getAttribute('data-k');
}
function cadeia(el,sheet){
  var a=[],n=el.parentElement;
  while(n&&n!==sheet){
    var h=n.querySelector(':scope > h2,:scope > h3,:scope > h4,:scope > .mh > h4,:scope > .mph');
    if(h){var t=txtSem(h);if(t&&a[0]!==t)a.unshift(t)}
    n=n.parentElement;
  }
  return a;
}
function dataHora(d){return fmt(d.d)+(d.h?' '+d.h:'')}
/* lê a ferramenta desta página e devolve as linhas de texto da ficha (sem fotos) */
function coleta(){
  var sh=$('#s-'+TOOL.id),out=[],prev=[],tem=false;
  function add(l){out.push(l);tem=true}
  $$('[data-k]',sh).forEach(function(el){
    var k=el.getAttribute('data-k'),v=S.f[k],vv;
    if(typeof v!=='string'||!v.trim())return;
    if(el.type==='radio'&&v!==el.value)return;
    if(el.type==='checkbox'){if(v!=='1')return;vv='Sim'}
    else if(el.type==='radio'){var lr=document.querySelector('label[for="'+el.id+'"]');vv=lr?txtSem(lr):v}
    else if(el.tagName==='SELECT'){var op=Array.prototype.filter.call(el.options,function(o){return o.value===v})[0];vv=op?limpa(op.text):v}
    else if(el.type==='date')vv=fmt(v);
    else vv=v.trim();
    var ch=cadeia(el,sh);
    if(ch.join('|')!==prev.join('|')){out.push('');out.push('['+(ch.length?ch.join(' · '):'Campos gerais')+']');prev=ch}
    var lab=rotuloDe(el);
    var lp=/[?.:!…]$/.test(lab)?lab:lab+':';
    if(vv.indexOf('\n')>-1||lab.length+vv.length>90)out.push(lp+'\n'+vv+'\n');else out.push(lp+' '+vv);
    tem=true;
  });
  if(TOOL.coletaExtra)TOOL.coletaExtra(out,add,dataHora);
  var fotos=$$('.photo[data-ph]',sh).filter(function(p){return S.ph[p.getAttribute('data-ph')]}).length;
  return {linhas:out,tem:tem,fotos:fotos};
}
/* chamado pela página principal, dentro de uma página aberta às escondidas (?embed=1) */
function coletaEmbed(dados){
  trocaS(norm(dados));applyFields();if(TOOL.aoAbrirFicha)TOOL.aoAbrirFicha();
  return coleta();
}
/* abre a ferramenta às escondidas e lê o que ela mostraria; devolve null se o navegador não deixar ler */
function lerFerramenta(t){
  return new Promise(function(res){
    var f=document.createElement('iframe'),feito=false,to;
    function fim(v){if(feito)return;feito=true;clearTimeout(to);try{f.parentNode.removeChild(f)}catch(e){}res(v)}
    f.setAttribute('aria-hidden','true');f.tabIndex=-1;f.title='';
    f.style.cssText='position:absolute;left:-9999px;top:0;width:1000px;height:800px;border:0;visibility:hidden';
    to=setTimeout(function(){fim(null)},20000);
    f.onload=function(){try{var r=f.contentWindow.Kit.coletaEmbed(JSON.parse(JSON.stringify(S)));r.t=t;fim(r)}catch(e){fim(null)}};
    f.src=hrefT(t)+'?embed=1';
    document.body.appendChild(f);
  });
}
/* lê todas as ferramentas: a da página direto, as outras às escondidas */
function coletaTodas(){
  return Promise.all(ATIVAS.map(function(t){
    if(TOOL&&TOOL.id===t.id){var r=coleta();r.t=t;return Promise.resolve(r)}
    return lerFerramenta(t);
  }));
}
function montarEnvio(cs){
  marcos();
  var agora=new Date(),iso=agora.toISOString(),nome=val('perfil.nome'),f=feitos(),M=S.meta.marcos||{};
  var lidas=cs.filter(function(c){return c}),naoLidas=ATIVAS.length-lidas.length;
  var com=lidas.filter(function(c){return c.tem}),nFotos=Object.keys(S.ph).length;
  var marcosOk=ATIVAS.filter(function(t){return f[t.id]});
  var nm=function(t){return 'Ferramenta '+pad(t.num)+', '+t.nome};
  var r=['FICHA EMAGRESER','Cliente: '+nome,'Enviada em: '+dtBR(agora).replace(' às ',' '),
    'Ferramentas com conteúdo: '+com.length+' de '+ATIVAS.length,'Marcos conquistados: '+marcosOk.length+' de '+ATIVAS.length,
    'Fotos: '+nFotos+(nFotos===1?' foto guardada':' fotos guardadas')+' só no aparelho da cliente, não enviadas.','','MARCOS CONQUISTADOS'];
  if(marcosOk.length)marcosOk.forEach(function(t){r.push('- '+nm(t)+(M[t.id]?': '+fmt(M[t.id]):''))});else r.push('Nenhum ainda.');
  r.push('','FERRAMENTAS COM CONTEÚDO');
  if(com.length)com.forEach(function(c){r.push('- '+nm(c.t))});else r.push('Nenhuma.');
  r.push('','RESPOSTAS POR FERRAMENTA');
  com.forEach(function(c){r.push('','==============================','FERRAMENTA '+pad(c.t.num)+' · '+c.t.nome.toUpperCase(),'==============================');Array.prototype.push.apply(r,c.linhas)});
  if(naoLidas)r.push('','Aviso: '+naoLidas+' ferramenta'+(naoLidas===1?'':'s')+' não pôde'+(naoLidas===1?'':'ram')+' ser lida'+(naoLidas===1?'':'s')+' para este resumo. As respostas completas estão na ficha em JSON, no campo conteúdo.');
  var dados=JSON.parse(JSON.stringify(S));dados.ph={};dados.meta.lastSend=iso;
  var ficha={app:'emagreser-kit',versao:1,exportadoEm:iso,nome:nome,dados:dados,enviadoEm:iso,semFotos:true,fotosNoAparelho:nFotos};
  return {iso:iso,nome:nome,data:dtBR(agora).replace(' às ',' '),resumo:r.join('\n').replace(/\n{3,}/g,'\n\n'),conteudo:JSON.stringify(ficha),tools:com.length,marcos:marcosOk.length,fotos:nFotos,naoLidas:naoLidas,todasNaoLidas:naoLidas===ATIVAS.length};
}
function postar(p){
  var ctl=('AbortController' in window)?new AbortController():null,to=setTimeout(function(){if(ctl)ctl.abort()},45000),req;
  if(ENDPOINT_ALTERNATIVO){
    req=fetch(ENDPOINT_ALTERNATIVO,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(p),signal:ctl?ctl.signal:undefined});
  }else{
    var u=new URLSearchParams();u.append('form-name',FORM_NOME);
    Object.keys(p).forEach(function(k){u.append(k,p[k])});
    var body=u.toString();
    if(body.length>7500000){clearTimeout(to);return Promise.reject(new Error('grande'))}
    req=fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body,signal:ctl?ctl.signal:undefined});
  }
  return req.then(function(r){clearTimeout(to);if(!r.ok)throw new Error('http '+r.status);return r},function(e){clearTimeout(to);throw e});
}
function envFocaveis(){return $$('#envBox button,#envBox input,#envBox a[href]').filter(function(e){return !e.disabled&&e.offsetParent!==null&&!e.closest('[hidden]')})}
function abrirEnvio(b){
  envOpener=b||document.activeElement;
  saveNow(true);envCache=null;
  $('#envNome').value=val('perfil.nome');
  $('#envTools').textContent='...';
  $('#envMarcos').textContent='...';
  $('#envFoto').innerHTML='';
  $('#envOk').checked=false;$('#envMsg').textContent='';$('#envFail').hidden=true;
  $('#envMain').hidden=false;$('#envDone').hidden=true;
  var go=$('#envGo');go.disabled=true;go.textContent='Conferindo a ficha...';envBusy=false;
  $('#envOv').hidden=false;document.body.classList.add('env-open');
  $('#envBox').scrollTop=0;
  setTimeout(function(){$('#envBox').focus()},0);
  coletaTodas().then(function(cs){
    if($('#envOv').hidden)return;
    envCache=cs;
    var E=montarEnvio(cs);
    $('#envTools').textContent=E.todasNaoLidas?'?':E.tools+' de '+ATIVAS.length;
    $('#envMarcos').textContent=E.marcos+' de '+ATIVAS.length;
    $('#envFoto').innerHTML='<p>'+(E.fotos?(E.fotos===1?'A sua 1 foto fica':'As suas '+E.fotos+' fotos ficam'):'As fotos que você colocar ficam')+' só neste aparelho e não vão no envio.</p><p>O peso e as medidas que você anotou vão junto.</p>';
    go.disabled=false;go.textContent='Enviar agora';
  });
}
function fecharEnvio(){
  if($('#envOv').hidden)return;
  $('#envOv').hidden=true;document.body.classList.remove('env-open');
  if(envOpener&&envOpener.focus)try{envOpener.focus()}catch(e){}
  envOpener=null;envCache=null;
}
function enviar(){
  if(envBusy||!envCache)return;
  var msg=$('#envMsg'),nomeIn=$('#envNome'),nome=limpa(nomeIn.value);
  $('#envFail').hidden=true;
  if(nome&&nome!==val('perfil.nome')){S.f['perfil.nome']=nome;var pn=$('#f_perfil_nome');if(pn)pn.value=nome;touch()}
  if(!nome){msg.textContent='Escreva o seu nome para a Luciana saber de quem é a ficha.';nomeIn.focus();return}
  if(!$('#envOk').checked){msg.textContent='Marque a autorização para poder enviar.';$('#envOk').focus();return}
  var E=montarEnvio(envCache);
  if(!E.tools&&!E.todasNaoLidas){msg.textContent='Você ainda não preencheu nenhuma ferramenta. Escreva alguma coisa e volte para enviar.';return}
  if(E.todasNaoLidas&&!temConteudo()){msg.textContent='Você ainda não preencheu nenhuma ferramenta. Escreva alguma coisa e volte para enviar.';return}
  msg.textContent='';
  envBusy=true;var go=$('#envGo');go.disabled=true;go.textContent='Enviando...';
  /* os nomes dos campos precisam ser iguais aos do formulario oculto ficha-emagreser */
  var payload={subject:'Ficha EmagreSER de '+E.nome+', '+E.data.slice(0,10),nome:E.nome,data:E.data,resumo:E.resumo,conteudo:E.conteudo,consentimento:CONSENT+' (aceito em '+E.data+')','bot-field':''};
  postar(payload).then(function(){
    envBusy=false;
    S.meta.lastSend=E.iso;saveNow(true);renderEnvio();
    if(!$('#envOv').hidden){$('#envMain').hidden=true;$('#envDone').hidden=false;setTimeout(function(){$('#envDoneT').focus()},0)}
    toast('Enviado para a Luciana');
  }).catch(function(e){
    envBusy=false;go.disabled=false;go.textContent='Tentar enviar de novo';
    $('#envFailTxt').textContent=(e&&e.message==='grande')
      ?'A sua ficha ficou grande demais para o envio. Baixe a sua ficha e mande para a Luciana pelo WhatsApp.'
      :'Não consegui enviar agora, por falta de internet ou porque este arquivo está aberto direto no aparelho. Baixe a sua ficha e mande para a Luciana pelo WhatsApp.';
    $('#envFail').hidden=false;
    var fb=$('#envFail .btn');if(fb){fb.focus();fb.scrollIntoView({block:'nearest'})}
  });
}

/* ---------- impressao ---------- */
function prepPrint(){
  document.body.classList.add('printing');
  var d=new Date(),ds=pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear();
  $$('[data-print-date]').forEach(function(e){e.textContent=ds});
  $$('[data-print-nome]').forEach(function(e){e.textContent=val('perfil.nome')?'Ficha de '+val('perfil.nome'):''});
  growAll($('.sheet.on'));
}
function endPrint(){document.body.classList.remove('printing');growAll($('.sheet.on'))}
window.addEventListener('beforeprint',prepPrint);window.addEventListener('afterprint',endPrint);

/* ---------- menu e cliques ---------- */
function closeMenu(){document.body.classList.remove('menu-open');var b=$('#menuBtn');if(b)b.setAttribute('aria-expanded','false')}
function ligaCasca(){
  $('#envGo').addEventListener('click',enviar);
  $('#envCancel').addEventListener('click',fecharEnvio);
  $('#envClose').addEventListener('click',fecharEnvio);
  $('#menuBtn').addEventListener('click',function(){var o=!document.body.classList.contains('menu-open');document.body.classList.toggle('menu-open',o);this.setAttribute('aria-expanded',o)});
  $('#fileImport').addEventListener('change',function(){if(this.files[0])importar(this.files[0]);this.value=''});
}
document.addEventListener('keydown',function(e){
  if(e.key==='Escape')closeMenu();
  var ov=$('#envOv');
  if(!ov||ov.hidden)return;
  if(e.key==='Escape'){fecharEnvio();return}
  if(e.key==='Tab'){
    var fs=envFocaveis();if(!fs.length)return;
    var first=fs[0],last=fs[fs.length-1],a=document.activeElement;
    if(e.shiftKey&&(a===first||a===$('#envBox'))){last.focus();e.preventDefault()}
    else if(!e.shiftKey&&a===last){first.focus();e.preventDefault()}
  }
});
window.addEventListener('resize',function(){growAll($('.sheet.on'))});
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-act]');if(!b)return;
  var act=b.getAttribute('data-act');
  if(act==='print'){prepPrint();window.print();setTimeout(endPrint,800)}
  else if(act==='export')exportar();
  else if(act==='env-open')abrirEnvio(b);
  else if(act==='import')$('#fileImport').click();
  else if(act==='ph-rm'){var k=b.getAttribute('data-ph');delete S.ph[k];renderPhotos();saveNow();marcos()}
  else if(act==='x-mc'){var id=b.getAttribute('data-id');if(mcOn(id))delete S.f['mc.'+id];else if(TOOL&&TOOL.falta&&!TOOL.falta().length)S.f['mc.'+id]='1';else return;touch()}
  else if(TOOL&&TOOL.acao)TOOL.acao(act,b);
});

/* ---------- índice: lista por fase e lista rápida ---------- */
function montaIndice(){
  var h='',f=-1;
  TODAS.forEach(function(t){
    if(t.fase!==f){if(f>=0)h+='</div>';f=t.fase;var n=TODAS.filter(function(x){return x.fase===f}).length;h+='<div class="fasehead"><h2>'+FASES[f]+'</h2><span>'+n+(n>1?' ferramentas':' ferramenta')+'</span></div><div class="cards">'}
    var lab='Abrir ferramenta: '+pad(t.num)+' '+t.nome;
    h+='<article class="tcard" data-tool="'+t.id+'"><div class="top"><span class="num">Ferramenta '+pad(t.num)+'</span><span class="badge st">Disponível</span><span class="badge ok">Marco conquistado</span></div><h3>'+t.nome+'</h3><p>'+t.obj+'</p>'+
     '<a class="btn pri" href="'+hrefT(t)+'" aria-label="'+esc(lab)+'">Abrir ferramenta</a></article>';
  });
  h+='</div>';
  $('#lista-fases').innerHTML=h;
  var ord=TODAS.slice().sort(function(a,b){return a.num-b.num});
  $('#lista-rapida').innerHTML=ord.map(function(t){return '<li><a class="qitem" data-tool="'+t.id+'" href="'+hrefT(t)+'"><span class="qn">'+pad(t.num)+'</span><span class="qt">'+t.nome+'</span>'+CKS()+'</a></li>'}).join('');
  $('#progresso').innerHTML='<div class="progt"><b data-pg-n>0</b> de <span data-pg-t>22</span> marcos conquistados</div><div class="pbar" role="progressbar" aria-label="Marcos conquistados" aria-valuemin="0" aria-valuemax="22" aria-valuenow="0"><span></span></div><p class="hint" data-pg-txt role="status"></p>';
  $('#envio-home').innerHTML=SENDBOX(true);
}

/* ---------- início de página ---------- */
function iniciar(){
  casca();
  if(EMBED)document.documentElement.classList.add('embed');
  if(TOOL){var est=$('#s-'+TOOL.id);$('#sheets').appendChild(est);decora(est)}
  else{var s=$('#s-inicio');$('#sheets').appendChild(s);montaIndice()}
  $$('.sheet').forEach(function(s){s.classList.add('on')});
  ligar($('#sheets'));
  buildNav();ligaCasca();
  modoTextos();
  applyFields();renderPhotos();
  if(TOOL&&TOOL.iniciar)TOOL.iniciar();
  marcos();
  var t=TOOL?T(TOOL.id):null;document.title=(t?t.nome+' · ':'')+'Kit de Ferramentas EmagreSER';
  growAll($('.sheet.on'));
  if(NUVEM)iniciaNuvem();else semLink();
  if(location.hash&&location.hash.length>1){var al=document.getElementById(location.hash.slice(1));if(al)al.scrollIntoView()}
}
/* textos que mudam quando o salvamento é no servidor: ficam no próprio HTML, em data-nuvem */
function modoTextos(){
  document.body.classList.toggle('leitura',LEITURA);
  if(!NUVEM)return;
  $$('[data-nuvem]').forEach(function(e){e.textContent=e.getAttribute('data-nuvem')});
}
function iniciaNuvem(){
  if(LEITURA){
    aviso('Você está vendo a ficha de uma cliente, só para leitura. Nada do que você mexer aqui é salvo. Para ler, use o menu e os botões Anterior e Próxima.','leitura',true);
    $$('.sheet > *').forEach(function(el){if(!/(^|\s)(pnav|printhead|back|foot|shead)(\s|$)/.test(el.className))el.inert=true});
  }
  puxa();
}
/* configurado para o servidor, mas o link não tem código: funciona só neste aparelho e avisa */
function semLink(){
  if(!CFG_ON||EMBED)return;
  var m='Este endereço não tem o seu link pessoal: o que você preenche fica guardado só neste aparelho.';
  var le=$('#lastExp');if(le)le.insertAdjacentHTML('afterend','<p class="hint" style="margin:0 0 10px">'+m+'</p>');
  var sn=$('.sidenote');if(sn)sn.textContent=m+' Baixe sua ficha de vez em quando para não perder nada.';
  try{if(!sessionStorage.getItem('emagreser-sem-link')){sessionStorage.setItem('emagreser-sem-link','1');toast(m);setTimeout(function(){$('#toast').classList.remove('show')},6000)}}catch(e){}
}
function ferramenta(id,fn){
  TOOL=fn(K)||{};TOOL.id=id;
  iniciar();
}
function indice(){TOOL=null;iniciar()}

var K={$:$,$$:$$,esc:esc,pad:pad,fid:fid,F:F,PICK:PICK,RADIOS:RADIOS,PH:PH,CB:CB,CBS:CBS,INP:INP,CK:CK,XK:XK,num:num,fnum:fnum,sgn:sgn,
  S:S,val:val,touch:touch,today:today,nowHM:nowHM,fmt:fmt,uid:uid,cnt:cnt,mcOn:mcOn,applyFields:applyFields,growAll:growAll,msg:msg,row:row,
  rtRaw:rtRaw,rtOn:rtOn,rtName:rtName,rtCalc:rtCalc,
  ferramenta:ferramenta,indice:indice,coletaEmbed:coletaEmbed};
window.Kit=K;
})();
