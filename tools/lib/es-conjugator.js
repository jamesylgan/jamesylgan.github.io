// Auto-generate conjugation tables for regular Spanish verbs
// Covers all standard tenses including compound tenses with haber

var autoConjugate = function(infinitive) {
  if (!infinitive || infinitive.length < 3) return null;
  var stem, type;
  if (infinitive.endsWith('ar')) { stem = infinitive.slice(0,-2); type = 'ar'; }
  else if (infinitive.endsWith('er')) { stem = infinitive.slice(0,-2); type = 'er'; }
  else if (infinitive.endsWith('ir')) { stem = infinitive.slice(0,-2); type = 'ir'; }
  else return null;

  var pr = ['yo','tú','él/ella','nosotros','vosotros','ellos/ellas'];
  var t = {};

  // ── Simple tenses ──

  // Present
  if (type === 'ar') t['Present'] = dict(pr, [stem+'o',stem+'as',stem+'a',stem+'amos',stem+'áis',stem+'an']);
  else if (type === 'er') t['Present'] = dict(pr, [stem+'o',stem+'es',stem+'e',stem+'emos',stem+'éis',stem+'en']);
  else t['Present'] = dict(pr, [stem+'o',stem+'es',stem+'e',stem+'imos',stem+'ís',stem+'en']);

  // Preterite
  if (type === 'ar') t['Preterite'] = dict(pr, [stem+'é',stem+'aste',stem+'ó',stem+'amos',stem+'asteis',stem+'aron']);
  else t['Preterite'] = dict(pr, [stem+'í',stem+'iste',stem+'ió',stem+'imos',stem+'isteis',stem+'ieron']);

  // Imperfect
  if (type === 'ar') t['Imperfect'] = dict(pr, [stem+'aba',stem+'abas',stem+'aba',stem+'ábamos',stem+'abais',stem+'aban']);
  else t['Imperfect'] = dict(pr, [stem+'ía',stem+'ías',stem+'ía',stem+'íamos',stem+'íais',stem+'ían']);

  // Future
  t['Future'] = dict(pr, [infinitive+'é',infinitive+'ás',infinitive+'á',infinitive+'emos',infinitive+'éis',infinitive+'án']);

  // Conditional
  t['Conditional'] = dict(pr, [infinitive+'ía',infinitive+'ías',infinitive+'ía',infinitive+'íamos',infinitive+'íais',infinitive+'ían']);

  // Subjunctive (present)
  if (type === 'ar') t['Subjunctive'] = dict(pr, [stem+'e',stem+'es',stem+'e',stem+'emos',stem+'éis',stem+'en']);
  else t['Subjunctive'] = dict(pr, [stem+'a',stem+'as',stem+'a',stem+'amos',stem+'áis',stem+'an']);

  // Subjunctive (imperfect) — -ra form
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
  var impUd = type === 'ar' ? stem+'e' : stem+'a';
  var impNos = type === 'ar' ? stem+'emos' : stem+'amos';
  var impVos = type === 'ar' ? stem+'ad' : type === 'er' ? stem+'ed' : stem+'id';
  var impUds = type === 'ar' ? stem+'en' : stem+'an';
  t['Imperative (Affirmative)'] = {'tú': impTu, 'usted': impUd, 'nosotros': impNos, 'vosotros': impVos, 'ustedes': impUds};
  t['Imperative (Negative)'] = {'tú': 'no '+impUd+'s', 'usted': 'no '+impUd, 'nosotros': 'no '+impNos, 'vosotros': 'no '+(type==='ar'?stem+'éis':stem+'áis'), 'ustedes': 'no '+impUds};

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
// Includes: stem-changing, spelling-changing, and fully irregular verbs
// Sources: RAE, common Spanish grammar references
var irregularVerbs = new Set([
  // Fully irregular (unique conjugation patterns)
  'ser','estar','haber','ir','dar','ver','saber','caber',

  // Irregular with unique stems in preterite/future/conditional
  'tener','venir','poner','salir','valer','hacer','decir','poder',
  'querer','andar','traer','caer','oír',

  // -ducir verbs (preterite: -duje)
  'conducir','producir','traducir','reducir','introducir','deducir',
  'reproducir','seducir','aducir','inducir',

  // -uir verbs (y-insertion: huyo, huyes)
  'huir','incluir','destruir','construir','contribuir','distribuir',
  'sustituir','constituir','influir','concluir','excluir','instruir',
  'disminuir','atribuir','instituir','prostituir','restituir','diluir',
  'fluir','obstruir','recluir','intuir',

  // Stem-changing e→ie
  'pensar','cerrar','despertar','empezar','comenzar','negar','regar',
  'sentar','acertar','apretar','atravesar','calentar','confesar',
  'encerrar','enterrar','gobernar','helar','manifestar','merendar',
  'nevar','recomendar','sembrar','temblar','tropezar',
  'entender','perder','encender','defender','ascender','descender',
  'tender','atender','extender',
  'sentir','mentir','preferir','sugerir','divertir','convertir',
  'advertir','consentir','hervir','invertir','referir','requerir',

  // Stem-changing o→ue
  'volver','resolver','devolver','envolver','mover','llover','doler',
  'moler','morder','torcer','cocer','soler','absolver','disolver',
  'promover','remover','conmover',
  'dormir','morir',
  'contar','encontrar','mostrar','recordar','soñar','almorzar',
  'aprobar','colgar','consolar','costar','demostrar','forzar',
  'probar','renovar','rogar','soltar','sonar','volar','volcar',
  'jugar', // u→ue

  // Stem-changing e→i (only -ir)
  'pedir','servir','seguir','conseguir','perseguir','repetir','vestir',
  'medir','competir','corregir','derretir','despedir','elegir',
  'freír','gemir','impedir','reír','rendir','sonreír','teñir',

  // Spelling changes (c→zc in yo present)
  'conocer','parecer','ofrecer','crecer','aparecer','pertenecer',
  'agradecer','establecer','favorecer','merecer','obedecer',
  'permanecer','reconocer','desaparecer','enriquecer','fortalecer',
  'oscurecer','palidecer','prevalecer','amanecer','atardecer',
  'complacer','empobrecer','enloquecer','enorgullecer','entristecer',
  'estremecer','humedecer','nacer','padecer','rejuvenecer',
  'resplandecer','satisfacer',

  // Spelling changes (g→j, gu→g, c→qu, z→c, etc.)
  'elegir','corregir','dirigir','exigir','fingir','rugir','surgir',
  'proteger','recoger','coger','escoger','encoger',
  'seguir','conseguir','perseguir','distinguir','extinguir',
  'delinquir',
  'convencer','vencer','ejercer','esparcir','zurcir',
  'tocar','buscar','sacar','explicar','practicar','dedicar','indicar',
  'aplicar','comunicar','fabricar','clasificar','verificar',
  'alcanzar','avanzar','lanzar','organizar','utilizar','realizar',
  'analizar','autorizar','garantizar','memorizar','simbolizar',

  // Compounds of irregular bases
  'componer','suponer','disponer','proponer','imponer','exponer',
  'oponer','reponer','deponer','descomponer','indisponer',
  'obtener','mantener','contener','detener','sostener','entretener',
  'retener','abstener','prevenir','intervenir','convenir','provenir',
  'sobrevenir','devenir',
  'atraer','distraer','contraer','abstraer','extraer','sustraer',
  'bendecir','maldecir','predecir','contradecir','desdecir',
  'deshacer','rehacer','satisfacer',
  'prever','entrever',
  'convaler','equivaler','prevaler',
  'sobresalir',
  'anteponer','contraponer','posponer','sobreponer','transponer',
]);

var isIrregularVerb = function(infinitive) {
  if (irregularVerbs.has(infinitive)) return true;
  // Also check for common irregular patterns by ending
  // -ducir, -traer, -poner, -tener, -venir are always irregular
  if (/(?:ducir|traer|poner|tener|venir|hacer|decir|valer|salir)$/.test(infinitive)) return true;
  return false;
};
