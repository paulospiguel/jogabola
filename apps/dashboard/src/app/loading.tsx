export default function LoadingPage() {
	return (
		<div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-[#00a650] to-[#00c851]">
			<div className="flex items-center space-x-4">
				<div className="animate-spin">
					<ClubIcon className="w-12 h-12 fill-white" />
				</div>
				{/* <div className="animate-bounce">
					<ClubIcon className="w-8 h-8 fill-white" />
				</div>
				<div className="animate-pulse">
					<ClubIcon className="w-10 h-10 fill-white" />
				</div> */}
				<p className="text-2xl font-medium text-white">Loading...</p>
			</div>
		</div>
	);
}

function ClubIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			xmlSpace="preserve"
			// style={{
			// 	enableBackground: "new 0 0 122.88 122.88",
			// }}
			viewBox="0 0 122.88 122.88"
			{...props}
		>
			<title>club</title>
			<path
				d="M61.44 0c16.97 0 32.33 6.88 43.44 18 11.12 11.12 18 26.48 18 43.44 0 16.97-6.88 32.33-18 43.44-11.12 11.12-26.48 18-43.44 18S29.11 116 18 104.88C6.88 93.77 0 78.41 0 61.44S6.88 29.11 18 18C29.11 6.88 44.47 0 61.44 0zm15.41 117.08-.12-.08 6.89-23.09-14.21-15.76L52.66 78 39.38 94.62l6.66 22.32-.15.1a57.8 57.8 0 0 0 15.55 2.12c5.34 0 10.51-.72 15.41-2.08zM12.22 91.61l24.34.12L49.28 75.8l-5.26-16.12-21.42-9.3-18.82 13.7a57.398 57.398 0 0 0 8.44 27.53zm4.55-66.73 7.4 22.14 19.98 8.68 15.44-11.97V20.94L40.51 7.63a57.85 57.85 0 0 0-19.89 13 57.416 57.416 0 0 0-3.85 4.25zM81.7 7.37l-18.4 13.4V43.7l14.5 11.21 20.81-8.92 7.18-21.49A57.757 57.757 0 0 0 81.7 7.37zm37.39 56.99-.02.01-19.98-14.55-19.81 8.49-6.08 18.03 13.73 15.23c.06.06.09.13.11.21l23.6-.11a57.62 57.62 0 0 0 8.45-27.31z"
				style={{
					fillRule: "evenodd",
					clipRule: "evenodd",
				}}
			/>
		</svg>
	);
}
