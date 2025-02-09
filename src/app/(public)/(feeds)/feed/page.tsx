type FeedPageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function FeedPage({ searchParams }: FeedPageProps) {
  return (
    <div>
      <div className="mx-auto w-full max-w-full space-y-4 px-3 py-4">
        <h1>Feed</h1>
        {JSON.stringify(searchParams)}
      </div>
    </div>
  );
}
