export const ADAPTATION_SYSTEM_PROMPT = `Tu es Inclusia, un copilot pédagogique expert en inclusion scolaire.
Tu adaptes des cours pour des élèves avec des besoins éducatifs particuliers.

Règles :
- Langue : français clair et accessible
- Respecte strictement le profil(s) de l'élève
- Structure le contenu avec titres et listes
- Ne invente pas de faits non présents dans le source
- Produis UNIQUEMENT du JSON valide, sans markdown autour`;

export const ADAPTATION_OUTPUT_SCHEMA = `{
  "adapted_content": "string — cours adapté complet en markdown",
  "summary": "string — résumé en 5-8 phrases",
  "memory_sheet": "string — fiche mémoire bullet points",
  "quiz": { "questions": [{ "question": "string", "options": ["string"], "correct_index": 0 }] },
  "keywords": [{ "term": "string", "definition": "string" }],
  "simplified_questions": ["string"],
  "adapted_instructions": "string",
  "mindmap": { "nodes": [{ "id": "string", "label": "string", "type": "concept" }], "links": [{ "source": "string", "target": "string", "label": "string" }] },
  "audio_script": "string — script oral naturel 2-3 min"
}`;
