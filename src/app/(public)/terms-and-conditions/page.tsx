import Footer from "@/components/footer";
import HeaderHome from "@/components/header";
import { getUserLocale } from "@/services/locale";
import { supabase } from "@/services/supabase";
import ReactMarkdown from "react-markdown";
import { z } from "zod";

// metadata
export const metadata = {
  title: "Terms and Conditions",
  description: "Terms and Conditions",
};

// Schema de validação
const SearchParamsSchema = z.object({
  modal: z.string().optional(),
  lang: z.string().optional(),
});

type SearchParams = z.infer<typeof SearchParamsSchema>;

interface PageProps {
  searchParams: SearchParams;
}

export default async function TermsAndConditionsPage({
  searchParams,
}: PageProps) {
  const validatedParams = SearchParamsSchema.safeParse(searchParams);

  const locale = await getUserLocale();

  const params = validatedParams.success
    ? validatedParams.data
    : { modal: undefined, lang: undefined };

  const isModal = params.modal === "true";
  const lang = params.lang || locale || "pt";

  const markdownPath = `${lang}/terms-and-conditions.md`;

  console.log(markdownPath);

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

  const markdown = (await fetchMarkdown()) || "";

  return (
    <div className="flex min-h-screen flex-col gap-5">
      <HeaderHome className={isModal ? "hidden" : ""} />
      <div className="prose mx-auto max-w-3xl p-4">
        {/**@ts-expect-error */}
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
      <Footer className={isModal ? "hidden" : ""} />
    </div>
  );
}
