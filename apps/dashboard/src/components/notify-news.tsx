import TextFlipNews from "./text-flip-news";

export default function NotifyNews() {
	return (
		<TextFlipNews
			newsItems={[
				{ id: 1, text: "Breaking: New AI breakthrough in natural language processing" },
				{ id: 2, text: "Tech stocks surge as market rebounds" },
				{ id: 3, text: "Climate summit concludes with ambitious goals" },
				{ id: 4, text: "SpaceX successfully launches satellite constellation" },
			]}
		/>
	);
}
