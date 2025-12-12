"use client";
import React from "react";
import sanitizeHtml from "sanitize-html";

export type NewsItem = {
  id: string;
  title: string;
  link: string;
  published: string; // ISO
  summary?: string;
  source?: string;
};

export default function NewsList({ items }: { items: NewsItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((n) => (
        <article key={n.id} className="border rounded p-3">
          <div className="text-sm text-gray-500">
            {n.source} · {new Date(n.published).toLocaleString()}
          </div>
          <a
            href={n.link}
            target="_blank"
            rel="noreferrer"
            className="font-medium hover:underline"
          >
            {n.title}
          </a>
          {n.summary && (
            <div
              className="prose prose-sm mt-2"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(n.summary, {
                  allowedTags: [
                    "b",
                    "i",
                    "em",
                    "strong",
                    "p",
                    "br",
                    "ul",
                    "li",
                    "a",
                  ],
                }),
              }}
            />
          )}
        </article>
      ))}
    </div>
  );
}
