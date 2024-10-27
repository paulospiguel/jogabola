type FeedPageProps = {
	searchParams: { [key: string]: string | string[] | undefined };
};

export default function FeedPage({ searchParams }: FeedPageProps) {
	return (
		<div>
			<div className="w-full max-w-full px-3 py-4 space-y-4 mx-auto">
				<h1>Feed</h1>
				{JSON.stringify(searchParams)}
			</div>
		</div>
	);
}
