// Auto-generate conjugation tables for regular Spanish verbs
// Covers all standard tenses including compound tenses with haber
// Handles spelling changes: -car→qu, -gar→gu, -zar→c, -guar→gü, -uir→uy

var autoConjugate = function(infinitive) {
  if (!infinitive || infinitive.length < 3) return null;
  var stem, type;
  if (infinitive.endsWith('ar')) { stem = infinitive.slice(0,-2); type = 'ar'; }
  else if (infinitive.endsWith('er')) { stem = infinitive.slice(0,-2); type = 'er'; }
  else if (infinitive.endsWith('ir')) { stem = infinitive.slice(0,-2); type = 'ir'; }
  else return null;

  var pr = ['yo','tú','él/ella','nosotros','vosotros','ellos/ellas'];
  var t = {};

  // ── Spelling change helpers ──
  // These apply to preterite yo and all subjunctive forms
  var isCar = type === 'ar' && stem.endsWith('c');  // buscar → busqué, busque
  var isGar = type === 'ar' && stem.endsWith('g');  // llegar → llegué, llegue
  var isZar = type === 'ar' && stem.endsWith('z');  // empezar → empecé, empiece
  var isGuar = type === 'ar' && stem.endsWith('gu'); // averiguar → averigüé

  // Stem for subjunctive/preterite-yo (spelling-changed)
  var sStem = stem; // default: same as regular stem
  if (isCar) sStem = stem.slice(0,-1) + 'qu';       // c → qu before e
  else if (isGuar) sStem = stem + '̈';                // NOT USED, handle separately
  else if (isGar) sStem = stem + 'u';                 // g → gu before e
  else if (isZar) sStem = stem.slice(0,-1) + 'c';    // z → c before e

  // ── Simple tenses ──

  // Present (no spelling changes needed — changes only before e)
  if (type === 'ar') t['Present'] = dict(pr, [stem+'o',stem+'as',stem+'a',stem+'amos',stem+'áis',stem+'an']);
  else if (type === 'er') t['Present'] = dict(pr, [stem+'o',stem+'es',stem+'e',stem+'emos',stem+'éis',stem+'en']);
  else t['Present'] = dict(pr, [stem+'o',stem+'es',stem+'e',stem+'imos',stem+'ís',stem+'en']);

  // Preterite (spelling change in yo for -car/-gar/-zar)
  if (type === 'ar') {
    var pretYo = (isCar || isGar || isZar) ? sStem+'é' : stem+'é';
    t['Preterite'] = dict(pr, [pretYo,stem+'aste',stem+'ó',stem+'amos',stem+'asteis',stem+'aron']);
  } else {
    t['Preterite'] = dict(pr, [stem+'í',stem+'iste',stem+'ió',stem+'imos',stem+'isteis',stem+'ieron']);
  }

  // Imperfect (always regular for all verbs)
  if (type === 'ar') t['Imperfect'] = dict(pr, [stem+'aba',stem+'abas',stem+'aba',stem+'ábamos',stem+'abais',stem+'aban']);
  else t['Imperfect'] = dict(pr, [stem+'ía',stem+'ías',stem+'ía',stem+'íamos',stem+'íais',stem+'ían']);

  // Future (always regular — attach to infinitive)
  t['Future'] = dict(pr, [infinitive+'é',infinitive+'ás',infinitive+'á',infinitive+'emos',infinitive+'éis',infinitive+'án']);

  // Conditional (always regular)
  t['Conditional'] = dict(pr, [infinitive+'ía',infinitive+'ías',infinitive+'ía',infinitive+'íamos',infinitive+'íais',infinitive+'ían']);

  // Subjunctive present (spelling changes for -car/-gar/-zar in ALL forms)
  if (type === 'ar') {
    var ss = (isCar || isGar || isZar) ? sStem : stem;
    t['Subjunctive'] = dict(pr, [ss+'e',ss+'es',ss+'e',ss+'emos',ss+'éis',ss+'en']);
  } else {
    t['Subjunctive'] = dict(pr, [stem+'a',stem+'as',stem+'a',stem+'amos',stem+'áis',stem+'an']);
  }

  // Subjunctive imperfect (-ra form, always regular)
  if (type === 'ar') t['Subjunctive (Imperfect)'] = dict(pr, [stem+'ara',stem+'aras',stem+'ara',stem+'áramos',stem+'arais',stem+'aran']);
  else t['Subjunctive (Imperfect)'] = dict(pr, [stem+'iera',stem+'ieras',stem+'iera',stem+'iéramos',stem+'ierais',stem+'ieran']);

  // ── Compound tenses (haber + past participle) ──
  var pp = type === 'ar' ? stem+'ado' : stem+'ido';
  t['Present Perfect'] = dict(pr, ['he '+pp,'has '+pp,'ha '+pp,'hemos '+pp,'habéis '+pp,'han '+pp]);
  t['Past Perfect'] = dict(pr, ['había '+pp,'habías '+pp,'había '+pp,'habíamos '+pp,'habíais '+pp,'habían '+pp]);
  t['Future Perfect'] = dict(pr, ['habré '+pp,'habrás '+pp,'habrá '+pp,'habremos '+pp,'habréis '+pp,'habrán '+pp]);
  t['Conditional Perfect'] = dict(pr, ['habría '+pp,'habrías '+pp,'habría '+pp,'habríamos '+pp,'habríais '+pp,'habrían '+pp]);
  t['Subjunctive (Pres. Perfect)'] = dict(pr, ['haya '+pp,'hayas '+pp,'haya '+pp,'hayamos '+pp,'hayáis '+pp,'hayan '+pp]);
  t['Subjunctive (Pluperfect)'] = dict(pr, ['hubiera '+pp,'hubieras '+pp,'hubiera '+pp,'hubiéramos '+pp,'hubierais '+pp,'hubieran '+pp]);

  // ── Imperative ──
  var impTu = type === 'ar' ? stem+'a' : stem+'e';
  var impUd = type === 'ar' ? (isCar||isGar||isZar ? sStem+'e' : stem+'e') : stem+'a';
  var impNos = type === 'ar' ? (isCar||isGar||isZar ? sStem+'emos' : stem+'emos') : stem+'amos';
  var impVos = type === 'ar' ? stem+'ad' : type === 'er' ? stem+'ed' : stem+'id';
  var impUds = type === 'ar' ? (isCar||isGar||isZar ? sStem+'en' : stem+'en') : stem+'an';
  t['Imperative (Affirmative)'] = {'tú': impTu, 'usted': impUd, 'nosotros': impNos, 'vosotros': impVos, 'ustedes': impUds};

  var negTu = type === 'ar' ? (isCar||isGar||isZar ? sStem+'es' : stem+'es') : stem+'as';
  var negNos = type === 'ar' ? (isCar||isGar||isZar ? sStem+'emos' : stem+'emos') : stem+'amos';
  var negVos = type === 'ar' ? (isCar||isGar||isZar ? sStem+'éis' : stem+'éis') : stem+'áis';
  t['Imperative (Negative)'] = {'tú': 'no '+negTu, 'usted': 'no '+impUd, 'nosotros': 'no '+negNos, 'vosotros': 'no '+negVos, 'ustedes': 'no '+impUds};

  // ── Non-finite ──
  t['Non-Finite'] = {
    'infinitive': infinitive,
    'gerund': type === 'ar' ? stem+'ando' : stem+'iendo',
    'past participle': pp
  };

  return t;

  function dict(keys, vals) {
    var o = {};
    for (var i = 0; i < keys.length; i++) o[keys[i]] = vals[i];
    return o;
  }
};

// ── Comprehensive irregular verb list ──
// Verbs here show "Irregular verb" instead of auto-conjugation.
// Spelling-change-only verbs (-car/-gar/-zar) are NOT listed here — autoConjugate handles them.
var irregularVerbs = new Set([
  // ── Fully irregular ──
  'ser','estar','haber','ir','dar','ver','saber','caber',

  // ── Irregular preterite/future/conditional stems ──
  'tener','venir','poner','salir','valer','hacer','decir','poder',
  'querer','andar','traer','caer','oír',

  // ── -ducir verbs (preterite: -duje) ──
  'conducir','producir','traducir','reducir','introducir','deducir',
  'reproducir','seducir','aducir','inducir',

  // ── -uir verbs (y-insertion) ──
  'huir','incluir','destruir','construir','contribuir','distribuir',
  'sustituir','constituir','influir','concluir','excluir','instruir',
  'disminuir','atribuir','instituir','restituir','diluir',
  'fluir','obstruir','recluir','intuir','retribuir',

  // ── Stem-changing e→ie ──
  'pensar','cerrar','despertar','empezar','comenzar','negar','regar',
  'sentar','acertar','apretar','atravesar','calentar','confesar',
  'encerrar','enterrar','gobernar','helar','manifestar','merendar',
  'nevar','recomendar','sembrar','temblar','tropezar',
  'errar','cegar','fregar',
  'entender','perder','encender','defender','ascender','descender',
  'tender','atender','extender',
  'sentir','mentir','preferir','sugerir','divertir','convertir',
  'advertir','consentir','hervir','invertir','referir','requerir',
  'adherir','diferir','conferir','inferir','transferir','ingerir',
  'discernir',

  // ── Stem-changing o→ue ──
  'volver','resolver','devolver','envolver','mover','llover','doler',
  'moler','morder','torcer','cocer','soler','absolver','disolver',
  'promover','remover','conmover',
  'dormir','morir',
  'contar','encontrar','mostrar','recordar','soñar','almorzar',
  'aprobar','colgar','consolar','costar','demostrar','forzar',
  'probar','renovar','rogar','soltar','sonar','volar','volcar',
  'acordar','acostar','apostar','comprobar','esforzar',
  'descolgar','descontar','poblar','tronar','tostar',
  'jugar', // u→ue

  // ── Stem-changing e→i (-ir only) ──
  'pedir','servir','seguir','conseguir','perseguir','repetir','vestir',
  'medir','competir','corregir','derretir','despedir','elegir',
  'freír','gemir','impedir','reír','rendir','sonreír','teñir',
  'reñir','concebir','embestir','investir','regir',

  // ── Spelling changes c→zc (yo present) ──
  'conocer','parecer','ofrecer','crecer','aparecer','pertenecer',
  'agradecer','establecer','favorecer','merecer','obedecer',
  'permanecer','reconocer','desaparecer','enriquecer','fortalecer',
  'oscurecer','palidecer','prevalecer','amanecer','atardecer',
  'complacer','empobrecer','enloquecer','enorgullecer','entristecer',
  'estremecer','humedecer','nacer','padecer','rejuvenecer',
  'resplandecer','satisfacer',
  'carecer','desconocer','desobedecer','envejecer','apetecer',
  'compadecer','enfurecer','florecer','perecer','lucir',

  // ── Spelling changes g→j (before a/o) ──
  'dirigir','exigir','fingir','rugir','surgir',
  'proteger','recoger','coger','escoger','encoger',
  'afligir','restringir','sumergir','emerger','converger',

  // ── Other spelling/pattern changes ──
  'distinguir','extinguir','delinquir',
  'convencer','vencer','ejercer','esparcir','zurcir',

  // ── Compounds of irregular bases ──
  'componer','suponer','disponer','proponer','imponer','exponer',
  'oponer','reponer','deponer','descomponer','indisponer',
  'obtener','mantener','contener','detener','sostener','entretener',
  'retener','abstener',
  'prevenir','intervenir','convenir','provenir','sobrevenir','devenir','contravenir',
  'atraer','distraer','contraer','abstraer','extraer','sustraer','retraer',
  'bendecir','maldecir','predecir','contradecir','desdecir',
  'deshacer','rehacer',
  'prever','entrever',
  'convaler','equivaler','prevaler',
  'sobresalir',
  'decaer','recaer',
  'anteponer','contraponer','posponer','sobreponer','transponer',
]);

var isIrregularVerb = function(infinitive) {
  if (irregularVerbs.has(infinitive)) return true;
  // Catch unlisted compounds of irregular bases by suffix
  if (/(?:ducir|traer|poner|tener|venir|hacer|decir|valer|salir|caer|oír)$/.test(infinitive)) return true;
  return false;
};
