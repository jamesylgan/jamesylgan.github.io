
// Auto-generate conjugation tables for regular Spanish verbs
// Covers: present, preterite, imperfect, future, conditional, subjunctive present
// + gerund, past participle, imperative
var autoConjugate = function(infinitive) {
  if (!infinitive || infinitive.length < 3) return null;
  var stem, type;
  if (infinitive.endsWith('ar')) { stem = infinitive.slice(0,-2); type = 'ar'; }
  else if (infinitive.endsWith('er')) { stem = infinitive.slice(0,-2); type = 'er'; }
  else if (infinitive.endsWith('ir')) { stem = infinitive.slice(0,-2); type = 'ir'; }
  else return null;

  var tenses = {};

  // Present indicative
  if (type === 'ar') {
    tenses['Present'] = { yo: stem+'o', tú: stem+'as', 'él/ella': stem+'a', nosotros: stem+'amos', vosotros: stem+'áis', 'ellos/ellas': stem+'an' };
  } else if (type === 'er') {
    tenses['Present'] = { yo: stem+'o', tú: stem+'es', 'él/ella': stem+'e', nosotros: stem+'emos', vosotros: stem+'éis', 'ellos/ellas': stem+'en' };
  } else {
    tenses['Present'] = { yo: stem+'o', tú: stem+'es', 'él/ella': stem+'e', nosotros: stem+'imos', vosotros: stem+'ís', 'ellos/ellas': stem+'en' };
  }

  // Preterite
  if (type === 'ar') {
    tenses['Preterite'] = { yo: stem+'é', tú: stem+'aste', 'él/ella': stem+'ó', nosotros: stem+'amos', vosotros: stem+'asteis', 'ellos/ellas': stem+'aron' };
  } else {
    tenses['Preterite'] = { yo: stem+'í', tú: stem+'iste', 'él/ella': stem+'ió', nosotros: stem+'imos', vosotros: stem+'isteis', 'ellos/ellas': stem+'ieron' };
  }

  // Imperfect
  if (type === 'ar') {
    tenses['Imperfect'] = { yo: stem+'aba', tú: stem+'abas', 'él/ella': stem+'aba', nosotros: stem+'ábamos', vosotros: stem+'abais', 'ellos/ellas': stem+'aban' };
  } else {
    tenses['Imperfect'] = { yo: stem+(type==='er'?'ía':'ía'), tú: stem+'ías', 'él/ella': stem+'ía', nosotros: stem+'íamos', vosotros: stem+'íais', 'ellos/ellas': stem+'ían' };
  }

  // Future (attach to full infinitive)
  tenses['Future'] = { yo: infinitive+'é', tú: infinitive+'ás', 'él/ella': infinitive+'á', nosotros: infinitive+'emos', vosotros: infinitive+'éis', 'ellos/ellas': infinitive+'án' };

  // Conditional
  tenses['Conditional'] = { yo: infinitive+'ía', tú: infinitive+'ías', 'él/ella': infinitive+'ía', nosotros: infinitive+'íamos', vosotros: infinitive+'íais', 'ellos/ellas': infinitive+'ían' };

  // Subjunctive present
  if (type === 'ar') {
    tenses['Subjunctive'] = { yo: stem+'e', tú: stem+'es', 'él/ella': stem+'e', nosotros: stem+'emos', vosotros: stem+'éis', 'ellos/ellas': stem+'en' };
  } else {
    tenses['Subjunctive'] = { yo: stem+'a', tú: stem+'as', 'él/ella': stem+'a', nosotros: stem+'amos', vosotros: stem+'áis', 'ellos/ellas': stem+'an' };
  }

  // Non-finite forms
  tenses['Other'] = {
    gerund: type === 'ar' ? stem+'ando' : stem+'iendo',
    'past participle': type === 'ar' ? stem+'ado' : stem+'ido',
    'imperative (tú)': type === 'ar' ? stem+'a' : stem+'e',
    'imperative (vosotros)': type === 'ar' ? stem+'ad' : type === 'er' ? stem+'ed' : stem+'id'
  };

  return tenses;
};

// Irregular verbs: return null to signal "don't auto-conjugate"
var irregularVerbs = new Set([
  'ser','estar','haber','tener','ir','hacer','decir','poder','saber','querer',
  'venir','ver','dar','poner','salir','conocer','traer','caer','oír','huir',
  'conducir','producir','traducir','reducir','introducir',
  'dormir','morir','pedir','servir','seguir','conseguir','repetir','vestir',
  'sentir','mentir','preferir','sugerir','divertir','convertir',
  'volver','resolver','devolver','envolver','mover','llover',
  'contar','encontrar','mostrar','recordar','soñar','jugar','almorzar',
  'empezar','comenzar','pensar','cerrar','despertar','negar','regar','sentar',
  'entender','perder','querer','encender','defender',
  'incluir','destruir','construir','contribuir','distribuir','sustituir',
  'caber','valer','satisfacer','componer','suponer','disponer','proponer',
  'obtener','mantener','contener','detener','sostener','entretener',
  'atraer','distraer','contraer','abstraer','extraer',
  'bendecir','maldecir','predecir','contradecir',
  'andar','caber','haber'
]);

var isIrregularVerb = function(infinitive) {
  return irregularVerbs.has(infinitive);
};
