
import { supabase } from "@/services/supabase";
import ReactMarkdown from "react-markdown";

// metadata
export const metadata = {
  title: "Terms and Conditions",
  description: "Terms and Conditions",
};

export default async function TermsAndConditionsPage() {
  const markdownPath = "pt/terms_and_conditions.md";

  const fetchMarkdown = async () => {
    const { data, error } = await supabase.storage
      .from("legal")
      .download(markdownPath);

    if (error) {
      console.error("Erro ao baixar o arquivo Markdown:", error.message);
      return;
    }

    const text = await data.text();

    return text;
  };

  const markdown = await fetchMarkdown() || "";

  return (
    <div className="prose mx-auto p-4">
      {/**@ts-ignore */}
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}
