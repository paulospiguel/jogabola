"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function TermsAndConditionsPage() {
  const markdownPath = "pt/terms_and_conditions.md"; // ajuste conforme necessário

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    const fetchMarkdown = async () => {
      const { data, error } = await supabase.storage
        .from("legal") // substitua pelo nome do seu bucket
        .download(markdownPath);

      if (error) {
        console.error("Erro ao baixar o arquivo Markdown:", error.message);
        return;
      }

      const text = await data.text();
      setMarkdown(text);
    };

    fetchMarkdown();
  }, []);

  return (
    <div className="prose mx-auto p-4">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}
