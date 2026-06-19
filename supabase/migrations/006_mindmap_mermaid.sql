-- Schématisation Mermaid pédagogique

ALTER TABLE adaptations ADD COLUMN IF NOT EXISTS mindmap_mermaid TEXT;

COMMENT ON COLUMN adaptations.mindmap_mermaid IS 'Code Mermaid généré (mindmap, timeline ou graph TD)';
