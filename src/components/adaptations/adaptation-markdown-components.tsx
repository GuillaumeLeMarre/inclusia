"use client";

import type { Components } from "react-markdown";
import {
  InlineSchemaEmbed,
  InlineSchemaLoading,
} from "@/components/adaptations/inline-schema-embed";
import { SchemaImageCard } from "@/components/adaptations/schema-image-card";
import {
  isImageOnlyParagraph,
  markdownNodeHasBlockChild,
} from "@/lib/adaptations/markdown-html-utils";
import {
  getHeadingClasses,
  getParagraphClasses,
  getStrongClasses,
} from "@/lib/adaptations/reading-mode-styles";
import type { ReadingMode } from "@/types/reading-mode";
import type { MermaidGenerationResult } from "@/types/mindmap";
import { cn } from "@/lib/utils";

interface MarkdownComponentsOptions {
  mode: ReadingMode;
  onOpenSchema?: () => void;
  embeddedSchema?: MermaidGenerationResult | null;
  schemaLoading?: boolean;
  schemaEnabled?: boolean;
}

export function createAdaptationMarkdownComponents({
  mode,
  onOpenSchema,
  embeddedSchema,
  schemaLoading = false,
  schemaEnabled = true,
}: MarkdownComponentsOptions): Components {
  const falcMode = mode === "falc";

  const renderSchemaImage = (alt?: string) => {
    if (embeddedSchema?.mermaidCode) {
      return (
        <InlineSchemaEmbed
          schema={embeddedSchema}
          caption={alt}
          enabled={schemaEnabled}
          falcMode={falcMode}
        />
      );
    }
    if (schemaLoading) {
      return <InlineSchemaLoading falcMode={falcMode} />;
    }
    return <SchemaImageCard alt={alt} onOpenSchema={onOpenSchema} />;
  };

  return {
    h1: ({ children }) => (
      <h2 className={getHeadingClasses(mode, 1)}>{children}</h2>
    ),
    h2: ({ children }) => (
      <h3 className={getHeadingClasses(mode, 2)}>{children}</h3>
    ),
    h3: ({ children }) => (
      <h4 className={getHeadingClasses(mode, 3)}>{children}</h4>
    ),
    p: ({ children, node }) => {
      const blockContent = markdownNodeHasBlockChild(node);
      const className = getParagraphClasses(mode);

      if (blockContent) {
        if (isImageOnlyParagraph(node)) {
          return <div className={cn(className, "mb-0")}>{children}</div>;
        }
        return <div className={className}>{children}</div>;
      }

      return <p className={className}>{children}</p>;
    },
    strong: ({ children }) => (
      <strong className={getStrongClasses(mode)}>{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-slate-800 dark:text-slate-200">{children}</em>
    ),
    ul: ({ children }) => (
      <ul
        className={cn(
          "my-4 list-disc space-y-2 pl-6",
          mode === "dyslexia" && "space-y-3 text-lg leading-8",
        )}
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        className={cn(
          "my-4 list-decimal space-y-2 pl-6",
          mode === "dyslexia" && "space-y-3 text-lg leading-8",
        )}
      >
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className={cn("pl-1", getParagraphClasses(mode), "mb-0")}>{children}</li>
    ),
    blockquote: ({ children }) => (
      <blockquote
        className={cn(
          "my-4 border-l-4 border-primary pl-4 italic",
          getParagraphClasses(mode),
        )}
      >
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-8 border-slate-200 dark:border-slate-700" aria-hidden />,
    table: ({ children }) => (
      <div className="my-4 overflow-x-auto">
        <table className="w-full min-w-[280px] border-collapse text-left text-base">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="border-b-2 border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
        {children}
      </thead>
    ),
    th: ({ children }) => (
      <th className="px-3 py-2 font-semibold text-slate-900 dark:text-slate-50">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border-t border-slate-200 px-3 py-2 text-slate-700 dark:border-slate-700 dark:text-slate-300">
        {children}
      </td>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="font-medium text-primary underline underline-offset-2"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    img: ({ alt }) => renderSchemaImage(alt),
    code: ({ children }) => (
      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm dark:bg-slate-800">
        {children}
      </code>
    ),
  };
}
